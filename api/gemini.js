// Vercel serverless proxy from the IND-TaxonBot browser client to Gemini 2.5 Flash, with mock/timeout/malformed fallbacks so the deployed demo never breaks.

const SYSTEM_PROMPT = `You are a Senior Wealth-Tech Operations Specialist at INDmoney. Analyze the uploaded screenshot of a stock-transfer or sell-order screen. It will be one of:
  • A US brokerage stock-plan transfer (Morgan Stanley StockPlan Connect, E*Trade, Charles Schwab) — look for DTC numbers, receiving broker, SWIFT, "retain in stock plan" vs "cash out" options.
  • An Indian demat transfer (CDSL Easiest, NSDL SPEED-e) — look for BO ID, DP ID, ISIN, Reason Codes (Code 2 = Off-Market Sale = TAXABLE; Code 5 = Own-Account Transfer = non-taxable), name match.
  • A sell-order / tax-lot selection screen — look for lot selection method (FIFO / LIFO / Highest Cost / Lowest Cost), holding period, realized gain/loss preview.

For each input field on the screen, mark its status as:
  • "Valid" — correct value
  • "Error" — syntactically wrong
  • "Missing" — blank but mandatory
  • "Config Conflict" — value is structurally valid but would cause a failed transfer or an unintended tax liability

Domain rules to enforce:
  • Morgan Stanley → INDmoney transfers: DTC must be "3021", Receiving Broker must be "Alpaca Securities LLC", Transfer Option must be "Retain funds in stock plan account" (NOT "Cash out"). Mismatches are Config Conflicts that block the transfer or create tax friction.
  • CDSL Easiest own-account transfers (moving shares between two demat accounts owned by the same PAN): must use Reason Code 5 — Off-Market Sale (Code 2) crystallizes a notional sale and triggers STCG/LTCG.
  • Tax-lot selection on US stocks: "Highest Cost First" minimizes gain magnitude but may force STCG treatment if newer lots are picked. Always cross-check against holding period — if the holding period is within a few weeks of the 12-month LTCG boundary, suggest deferring.

The "resolution" field must be a calm, non-technical 3-4 sentence paragraph in the tone of a senior INDmoney helpdesk operator. No jargon. Reassure, then prescribe.`;

const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    title: { type: "STRING" },
    description: { type: "STRING" },
    portalType: { type: "STRING" },
    fields: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          name: { type: "STRING" },
          status: { type: "STRING" },
          current: { type: "STRING" },
          correct: { type: "STRING" },
          why: { type: "STRING" }
        },
        required: ["name", "status"]
      }
    },
    resolution: { type: "STRING" },
    actions: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          label: { type: "STRING" },
          action: { type: "STRING" }
        }
      }
    }
  },
  required: ["title", "fields", "resolution"]
};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    const { imageBase64, mimeType } = body;

    if (typeof imageBase64 !== "string" || typeof mimeType !== "string") {
      return res.status(400).json({ error: "imageBase64 and mimeType required" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(200).json({
        __mock: true,
        message: "Live Gemini disabled — set GEMINI_API_KEY in Vercel project settings (Environment Variables) to enable real AI analysis. The 3 preset scenario buttons drive the full demo offline."
      });
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);

    let upstream;
    try {
      upstream = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [{
              role: "user",
              parts: [
                { text: SYSTEM_PROMPT },
                { inline_data: { mime_type: mimeType, data: imageBase64 } }
              ]
            }],
            generationConfig: {
              responseMimeType: "application/json",
              responseSchema: RESPONSE_SCHEMA,
              temperature: 0.2
            }
          })
        }
      );
    } catch (err) {
      if (err.name === "AbortError") {
        return res.status(200).json({
          __timeout: true,
          message: "Gemini took longer than 8s — falling back to demo mode"
        });
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }

    if (!upstream.ok) {
      const text = await upstream.text().catch(() => "");
      return res.status(502).json({
        error: "Upstream Gemini error",
        status: upstream.status,
        detail: text.slice(0, 500)
      });
    }

    const data = await upstream.json();
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    try {
      const parsed = JSON.parse(raw);
      return res.status(200).json(parsed);
    } catch {
      return res.status(200).json({
        __malformed: true,
        raw: String(raw).slice(0, 500),
        message: "Gemini returned non-JSON — falling back to demo mode"
      });
    }
  } catch (err) {
    return res.status(500).json({ error: "Internal error", detail: err.message });
  }
}
