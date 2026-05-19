# IND-TaxonBot

A wealth-tech ops copilot built as a POC.

TaxonBot solves one specific problem: INDmoney's US-stock-transfer flow faces user dropoffs because of the UX not being fully automated, results in long-winding customer support threads, and manual, complex steps to be done by the user at the receiving-broker step (wrong DTC numbers, misclassified CDSL reason codes, accidental short-term tax events). Today these failures get resolved in 4+ days through support tickets. This POC compresses that into under 60 seconds, via two product surfaces:

1. **Diagnose a screen.** The user uploads a screenshot of their stuck broker portal. A multimodal LLM reads it, audits each field, and ships a one-tap correction with an auto-fill animation.

2. **Ask TaxonBot.** The user types a goal in plain English ("Move 150 shares of Reliance to my INDmoney demat without paying tax"). An orchestrator fans out specialist sub-agents in parallel — PortalScout, TaxLogic, BalanceCheck, RouteOptimizer, FormBuilder, RegRiskWatch — and returns a single consolidated answer with copyable values.

Both modes share a growth thesis: every diagnosed failure is a support ticket that doesn't fire, a transfer that doesn't churn, and a tax event that doesn't happen.

---

## Quick start

You need a modern browser and any static file server. The fastest path is:

```bash
python3 -m http.server 8765
```

Then open **http://localhost:8765** in your browser.

> A static server is required — `file://` won't work because the page loads sibling JS files. `npx serve` or any equivalent works just as well.

### Try this flow first

1. Click any of the three preset cards on the left (US DTC / CDSL / Tax-Lot)
2. Watch the streaming "AI is analyzing" steps fire on the left
3. Diagnosis cards drop in with the Levenshtein name-match bar
4. Click **"Autofill all corrections"** in the actions row — a fake cursor flies to each broken input and drops the correct value in
5. Switch to the **Ask TaxonBot** tab
6. Click any suggested query — watch the orchestrator fan out 4–6 agents in parallel, then converge on a synthesis card

The two preset modes are fully client-side and need no API key.

---

## Deploying to Vercel

The serverless function in `api/gemini.js` only activates the live AI for the "Upload a screen" path. The two baked modes work entirely client-side, so the demo lands cleanly even without an API key.

If you want the live upload path:

1. Get a free Gemini API key at https://aistudio.google.com/apikey (no billing setup required)
2. Deploy:

   ```bash
   npm install -g vercel
   vercel login
   vercel                                        # first deploy, accept defaults
   vercel env add GEMINI_API_KEY production      # paste your AIza... key when prompted
   vercel --prod                                 # ship to the production URL
   ```

Without the API key, the upload path shows a friendly fallback toast and nudges the user toward the preset scenarios. Nothing breaks.

---

## What's in this repo

| File | Role |
|---|---|
| `index.html` | Single-page app shell — INDmoney-themed dark UI, tab nav, both modes |
| `scenarios.js` | Three baked diagnostic scenarios with inline SVG mock broker screens |
| `agents.js` | Agent roster (6 specialists) + three baked terminal queries |
| `terminal.js` | Self-contained terminal UI — chat input, parallel agent cards, synthesis |
| `api/gemini.js` | Vercel serverless proxy to Gemini 2.5 Flash with graceful fallbacks |
| `.gitignore` | Excludes `.claude/`, `.vercel/`, `.env`, `.DS_Store` |

No build step, no dependencies to install. Tailwind and Plus Jakarta Sans load from CDNs.

---

## The three diagnostic scenarios

| Preset | Portal | What's broken | What it teaches |
|---|---|---|---|
| `ms_dtc` | Morgan Stanley StockPlan Connect | Wrong DTC, broker firm blank, cash-out option selected | The #1 US transfer failure — a "Submit Transfer" button that soft-fails silently |
| `cdsl_code2` | CDSL Easiest | Reason Code 2 instead of Code 5 on an own-account transfer | Crystallizes ~₹65,700 in STCG that nobody asked for |
| `stcg_trap` | INDmoney US Stocks sell-order review | Tax-lot method picked a lot 4 days short of LTCG | A ~$276 tax penalty hiding in default settings |

## The three terminal queries

| Query | Agents that fire | Punchline |
|---|---|---|
| Move Reliance ICICI → INDmoney | All 6 | ₹65,700 in avoidable STCG, Reason Code 5 |
| Sell 25 AAPL, minimize US tax | 4 | $276 saved by waiting 4 days |
| Morgan Stanley RSU transfer | 5 | In-kind DTC 3021 transfer, 0 tax, 3-5 days |

---

## Architectural choices

- **Single-page HTML** instead of React + Node + DB — zero compile, opens anywhere, demos on the fly.
- **Multimodal Gemini** instead of client-side OCR — Tesseract can't tell which value belongs in which input box; Gemini reads layout *and* text together.
- **Levenshtein similarity** instead of exact-match on names — "Shriti S. Chandra" vs "Shriti Chandra" shouldn't block a transfer.
- **Mock-first, AI-second** — preset scenarios and agent queries are pre-baked, so the demo never depends on a flaky API call. Live AI is an upgrade, not a requirement.

---

## Notes for the reviewer

This is an unaffiliated proof-of-concept. The metrics in the hero and impact panels (drop-off rates, projected ticket deflection, NPS lift) are illustrative estimates based on reasonable cohort modeling, not audited internal numbers. The user profile, ISINs, DP IDs, and account numbers in the scenarios are realistic but synthetic.

**Built in a 2-hour window.**

---

**Shriti Chandra** · May 2026 · ind-taxonbot-poc
