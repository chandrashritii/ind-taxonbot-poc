// IND-TaxonBot — Agent Terminal mode data layer
// Defines the roster of specialist sub-agents and the baked demo queries
// consumed by the orchestrator UI. No module exports — sets one global.

window.INDTAXONBOT_AGENTS = {
  roster: [
    {
      id: 'portal_scout',
      name: 'PortalScout',
      role: 'Identifies the target portal and its conventions',
      color: '#7DD3FC',
      iconSvg: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="7" cy="7" r="4.5"/><line x1="10.5" y1="10.5" x2="14" y2="14"/></svg>',
      systemHint: "I know how every Indian and US broker numbers their fields. CDSL Easiest, NSDL SPEED-e, Morgan Stanley, Schwab, Alpaca, E*Trade — I've memorized their quirks. I figure out which interface the user is dealing with and pull the right ruleset."
    },
    {
      id: 'tax_logic',
      name: 'TaxLogic',
      role: 'Calculates tax implications and routing',
      color: '#FBBF24',
      iconSvg: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 3h7"/><path d="M4 6h7"/><path d="M5 6c3 0 3 4 0 4H4l5 3"/></svg>',
      systemHint: 'I run the numbers. STCG vs LTCG holding-period math, Code 2 vs Code 5 implications, FIFO/LIFO tax-lot consequences, FEMA limits, dividend withholding. If money is moving, I tell you what it costs.'
    },
    {
      id: 'balance_check',
      name: 'BalanceCheck',
      role: 'Verifies holdings and free quantity',
      color: '#A78BFA',
      iconSvg: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="6"/><path d="M5 8.2l2.2 2.2L11 6.6"/></svg>',
      systemHint: 'I confirm the user actually owns what they want to move. Free balance, locked-in vested portions, pending orders, T-day settlement holds — I make sure there are no surprises at submit time.'
    },
    {
      id: 'route_optimizer',
      name: 'RouteOptimizer',
      role: 'Picks the cheapest, lowest-tax route',
      color: '#34D399',
      iconSvg: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="4" cy="3.5" r="1.5"/><circle cx="12" cy="12.5" r="1.5"/><path d="M4 5v3a3 3 0 0 0 3 3h2a3 3 0 0 1 3 3"/></svg>',
      systemHint: 'Given the destination, I pick the rails. CDSL vs NSDL, off-market vs market, DTC direct vs ACAT, in-kind vs cash-out. I minimize cost, tax, and settlement time.'
    },
    {
      id: 'form_builder',
      name: 'FormBuilder',
      role: 'Generates pre-filled instructions',
      color: '#F472B6',
      iconSvg: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2h7l3 3v9H3z"/><path d="M5.5 7.5h5"/><path d="M5.5 10h5"/><path d="M5.5 12.5h3"/></svg>',
      systemHint: 'I produce the exact values the user has to type or click. Reason codes, DTC numbers, broker names, TPIN-ready instruction drafts — copy-pasteable, in the format the destination portal expects.'
    },
    {
      id: 'reg_risk_watch',
      name: 'RegRiskWatch',
      role: 'Flags regulatory and compliance risks',
      color: '#FB7185',
      iconSvg: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 1.5l5.5 2v4.2c0 3.2-2.3 5.7-5.5 6.8-3.2-1.1-5.5-3.6-5.5-6.8V3.5z"/><line x1="8" y1="5.5" x2="8" y2="8.5"/><circle cx="8" cy="10.8" r="0.4" fill="currentColor"/></svg>',
      systemHint: "I'm the paranoid one. Insider trading windows, FEMA 250k limits, PAN-Aadhaar linking gates, anti-money-laundering thresholds, T+1 settlement edge cases. I raise hands so we don't get a notice later."
    }
  ],

  queries: [
    {
      id: 'cdsl_move_reliance',
      prompt: 'Move 150 shares of Reliance from my ICICI demat to my INDmoney demat without paying tax',
      context: 'Common own-account transfer pain — users default to Code 2 and trigger STCG',
      orchestratorPlan: 'Both DPs are CDSL and the user owns the shares outright, so this is an own-account transfer. Firing all six agents to confirm the right reason code, validate balance, draft the instruction, and clear compliance before submit.',
      agents: [
        {
          id: 'portal_scout',
          durationMs: 1400,
          log: [
            'Parsing intent: cross-DP transfer, source=ICICI, destination=INDmoney',
            'Source DP IN303028 -> ICICI Securities (CDSL participant)',
            'Destination DP IN12081600 -> INDmoney Securities (CDSL participant)',
            'Both legs on CDSL -> off-market instruction is the right rail',
            'Source portal resolved: CDSL Easiest (web.cdslindia.com/myeasi)',
            'Ruleset loaded: CDSL off-market reason-code matrix v3.2'
          ],
          finding: 'Both demats sit on CDSL, so this is a single-depository off-market transfer through CDSL Easiest — no NSDL inter-depository fees apply.'
        },
        {
          id: 'balance_check',
          durationMs: 1700,
          log: [
            'ISIN lookup: Reliance Industries -> INE002A01018',
            'Querying source demat IN303028 for free quantity',
            'Free quantity: 245 shares (no lock-in, no pledge)',
            'Pending sell orders against RELIANCE: 0',
            'T-day settlement holds: 0',
            'Requested 150 -> leaves 95 in source after transfer'
          ],
          finding: 'User holds 245 free Reliance shares in the ICICI demat with zero pending sells or holds — the 150-share transfer is fully covered.'
        },
        {
          id: 'tax_logic',
          durationMs: 2200,
          log: [
            'PAN ABCPC1234K matches on both source and destination demats',
            'Same-PAN transfer qualifies for CDSL Reason Code 5 (Own-Account)',
            'Code 5 = own-account transfer = non-taxable event',
            'Code 2 = off-market sale = STCG event (default many users pick wrongly)',
            'LTP RELIANCE @ ₹2,920 x 150 shares = ₹4,38,000 notional',
            'STCG @ 15% on the implied gain if Code 2 fires = ₹65,700 leaked',
            'Conclusion: Code 5 keeps the entire position out of the tax net'
          ],
          finding: 'Same PAN on both demats means Reason Code 5 applies — a non-taxable own-account transfer. Picking Code 2 by mistake would have crystallised roughly ₹65,700 in STCG.'
        },
        {
          id: 'route_optimizer',
          durationMs: 1900,
          log: [
            'Candidate rails: (1) CDSL off-market Code 5, (2) inter-DP via NSDL bridge, (3) sell + rebuy',
            'Rail 2 ruled out: both ends on CDSL, no NSDL hop needed',
            'Rail 3 ruled out: re-purchase resets cost basis and triggers STT twice',
            'Selecting rail 1: CDSL off-market, same-DP CMR-route',
            'Cost: ₹15.93 flat per ISIN (CDSL Easiest schedule)',
            'ETA: T+1, settles end of next business day'
          ],
          finding: 'Cheapest and fastest rail is a CDSL Easiest off-market instruction at the flat ₹15.93 per-ISIN fee, settling T+1.'
        },
        {
          id: 'form_builder',
          durationMs: 2400,
          log: [
            'Drafting CDSL Easiest off-market instruction',
            'Source BO ID: 1203320000891204',
            'Destination BO ID: 1208160000123456',
            'ISIN: INE002A01018 (Reliance Industries Ltd)',
            'Quantity: 150',
            'Reason Code: 5 — Own-Account Transfer',
            'Execution date: 19-May-2026',
            'TPIN authentication required at submit step'
          ],
          finding: 'Pre-filled CDSL Easiest instruction is ready — user just needs to log in, paste the values, and authorise with their TPIN.'
        },
        {
          id: 'reg_risk_watch',
          durationMs: 1500,
          log: [
            'PAN-Aadhaar link status: linked (verified 2025-08-12)',
            'Insider trading window for RELIANCE: no active flag for this PAN',
            'TDS applicability on own-account transfer: not applicable',
            'FEMA: domestic-to-domestic, no cross-border implication',
            'AML threshold: notional under ₹10L reporting trigger',
            'No outstanding regulatory holds on either demat'
          ],
          finding: 'Compliance is clean — PAN-Aadhaar linked, no insider window, no FEMA or AML flags for a domestic own-account move.'
        }
      ],
      synthesis: {
        headline: 'Use Reason Code 5 — saves ₹65,700 in STCG',
        summary: "Both your demats sit on CDSL and share the same PAN, which means this is an own-account transfer, not a sale. Submit it through CDSL Easiest with Reason Code 5 — it costs ₹15.93 and triggers zero tax. We've drafted the instruction with the exact ISIN, BO IDs, and quantity below; you just need to paste, authorise with your TPIN, and the shares will land in your INDmoney demat by end of the next business day.",
        actions: [
          { label: 'Open pre-filled instruction', kind: 'primary', payload: 'cdsl_easiest_off_market_code5' },
          { label: 'Copy Reason Code 5 — Own-Account Transfer', kind: 'copy', payload: 'Reason Code 5 — Own-Account Transfer' },
          { label: 'Copy ISIN INE002A01018', kind: 'copy', payload: 'INE002A01018' },
          { label: 'Open CDSL Easiest', kind: 'open', payload: 'https://web.cdslindia.com/myeasi/' }
        ],
        impact: {
          headline: '₹65,700 in avoidable STCG · 0 tax event',
          detail: 'Switching Code 2 -> Code 5 keeps the entire 150-share Reliance position out of the tax net and clears in a single CDSL Easiest submission.'
        }
      }
    },

    {
      id: 'sell_aapl_minimize_tax',
      prompt: 'I want to sell 25 AAPL but minimize my US tax bill',
      context: 'User about to crystallize STCG without realizing — happens because of default lot selection',
      orchestratorPlan: 'This is a tax-lot timing problem, not a routing problem. Skipping PortalScout and RegRiskWatch — firing BalanceCheck, TaxLogic, RouteOptimizer, and FormBuilder to find the cheapest exit window.',
      agents: [
        {
          id: 'balance_check',
          durationMs: 1300,
          log: [
            'Pulling AAPL position from INDmoney US (Alpaca-cleared)',
            'Total AAPL position: 65 shares across 2 tax lots',
            'Lot A: 25 sh @ $140.10 acquired 2025-05-22',
            'Lot B: 40 sh @ $182.40 acquired 2025-08-14',
            'Lot A holding period today: 11 months 26 days',
            'Lot B holding period today: 9 months 04 days',
            'No pending sells, no open options against AAPL'
          ],
          finding: 'User holds 65 AAPL across two lots — Lot A (25 sh) is 4 days short of LTCG; Lot B (40 sh) has 3 months to go.'
        },
        {
          id: 'tax_logic',
          durationMs: 2800,
          log: [
            'Current AAPL price: $214.62',
            'Lot A gain if sold today: ($214.62 - $140.10) x 25 = $1,863 (rounded $1,840 after wash check)',
            'Holding 11m 26d -> still short-term -> ~30% federal STCG bracket',
            'STCG tax now: ~$552',
            'Wait 4 days -> Lot A crosses 12 months -> LTCG @ ~15%',
            'LTCG tax after 22-May: ~$276',
            'Delta saved: $276 per 25-share trade',
            'Lot B: not LTCG-eligible until 2026-08-14 — cannot help'
          ],
          finding: 'Selling Lot A today taxes the $1,840 gain at ~30% (~$552). Waiting 4 days drops it to ~15% (~$276) — a clean $276 saving with zero other change.'
        },
        {
          id: 'route_optimizer',
          durationMs: 1800,
          log: [
            'Path 1: Reschedule sell to 2026-05-22 — Lot A becomes LTCG-eligible',
            'Path 2: Change Tax Lot Method to "Lowest Cost — Long-Term First"',
            'Path 2 evaluation: no AAPL lot is currently long-term -> method matches 0 lots -> order blocks',
            'Path 2 only helps after 22-May anyway; redundant with Path 1',
            'Recommendation: Path 1 — schedule limit order for 2026-05-22'
          ],
          finding: 'The only viable optimisation is a 4-day delay; switching tax-lot method does nothing today because no AAPL lot has crossed 12 months yet.'
        },
        {
          id: 'form_builder',
          durationMs: 2100,
          log: [
            'Drafting scheduled sell order on Alpaca rails',
            'Symbol: AAPL',
            'Quantity: 25',
            'Order type: Limit @ $214.62',
            'Execution date: 2026-05-22 (Lot A 12-month mark)',
            'Tax Lot Method: FIFO -> selects Lot A automatically',
            'Time in force: Day',
            'Confirmation preview prepared'
          ],
          finding: 'Order is drafted as a 25-share AAPL limit at $214.62 scheduled for 22-May-2026 with FIFO lot selection — that targets Lot A exactly when it qualifies for LTCG.'
        }
      ],
      synthesis: {
        headline: 'Wait 4 days — $276 saved on this trade alone',
        summary: "Your 25-share AAPL lot is literally four days short of long-term capital gains treatment. Selling on 22-May-2026 drops the tax on this trade from roughly $552 to $276 — same shares, same price, half the tax. We've scheduled a limit order at $214.62 for that morning with FIFO lot selection so the right lot gets sold; you can cancel or adjust it any time before execution.",
        actions: [
          { label: 'Reschedule for 22-May-2026', kind: 'primary', payload: 'schedule_sell_2026_05_22_aapl_25' },
          { label: 'Copy Tax Lot Method: FIFO (Lot A)', kind: 'copy', payload: 'Tax Lot Method: FIFO (Lot A — 2025-05-22)' },
          { label: 'View tax-lot ledger', kind: 'open', payload: 'https://app.indmoney.com/us/portfolio/tax-lots' }
        ],
        impact: {
          headline: '$276 saved on this trade · ~$1,104 across this quarter',
          detail: 'Four-day delay flips Lot A from STCG to LTCG; the same playbook applies to the 4 sells you have queued before September, scaling to roughly $1,104 in retained gains.'
        }
      }
    },

    {
      id: 'morgan_stanley_rsu_transfer',
      prompt: 'Help me transfer my Morgan Stanley vested RSUs to INDmoney',
      context: 'US stock plan transfer is the #1 broken flow — DTC mismatch, missing broker, cash-out trap',
      orchestratorPlan: 'StockPlan Connect defaults users to cash-out, which crystallises STCG. Firing PortalScout, TaxLogic, RouteOptimizer, FormBuilder, and RegRiskWatch to lock in an in-kind ACATS path with the right DTC and broker name.',
      agents: [
        {
          id: 'portal_scout',
          durationMs: 1600,
          log: [
            'Detected source: Morgan Stanley StockPlan Connect',
            'Flow: Outbound Transfer Request, Step 3 of 4',
            "Destination broker required: INDmoney's US clearing partner",
            'INDmoney US clears through Alpaca Securities LLC',
            'Required transfer type: DTC ACATS, in-kind (NOT cash-out)',
            'DTC participant number for Alpaca: 3021',
            'Ruleset loaded: MS StockPlan outbound v2024.11'
          ],
          finding: 'Source is Morgan Stanley StockPlan Connect; destination Alpaca Securities (DTC 3021) is the broker name users must paste — it is never auto-filled.'
        },
        {
          id: 'tax_logic',
          durationMs: 2300,
          log: [
            'RSU lot: 120 shares, vested 14 months ago (2025-03-15)',
            'Cost basis per share: $189.40 (vest-date FMV)',
            'Current price: $232.10',
            'Holding period already > 12 months -> long-term',
            'In-kind ACATS preserves basis AND holding period -> NO taxable event on transfer',
            'Cash-out path would force liquidation: gain = ($232.10 - $189.40) x 120 = $5,124',
            'Cash-out tax (24% federal STCG + state) ~= $1,640',
            'Wait — re-check holding window: > 12m, so cash-out would be LTCG @ 15% ~= $769',
            'Either way, in-kind = $0 tax today; cash-out leaks $769 minimum'
          ],
          finding: 'An in-kind ACATS transfer preserves your cost basis and holding period for zero tax today; the cash-out option would unnecessarily realise around $5,200 in gains.'
        },
        {
          id: 'route_optimizer',
          durationMs: 2000,
          log: [
            'Path A: DTC ACATS in-kind to Alpaca (DTC 3021)',
            'Path B: Cash-out at MS, wire USD, rebuy in INDmoney US',
            'Path B costs: forced sale + spread + wire fee + re-entry slippage',
            'Path A settlement: 3-5 business days end-to-end',
            'Path A fees: $0 on MS outbound, $0 on Alpaca inbound for ACATS',
            'Locking in Path A — explicitly avoid the "Sell and remit USD" radio button on Step 3'
          ],
          finding: 'In-kind ACATS to Alpaca DTC 3021 is the only sensible rail — it is free, settles in 3-5 business days, and dodges the cash-out tax trap entirely.'
        },
        {
          id: 'form_builder',
          durationMs: 2700,
          log: [
            'Drafting StockPlan Connect outbound form values',
            'DTC Number: 3021',
            'Receiving Broker Name: Alpaca Securities LLC',
            'Receiving Account Number: 9XX-XXX-4421 (linked INDmoney US account)',
            'Transfer Type: Full in-kind (DTC ACATS)',
            'Cash Election: Retain funds in stock plan account',
            'Quantity: 120 shares',
            'Authorisation: Account holder e-signature required at Step 4'
          ],
          finding: "Form is pre-filled: DTC 3021, broker 'Alpaca Securities LLC', account 9XX-XXX-4421, 120 shares in-kind — copy these straight into Step 3."
        },
        {
          id: 'reg_risk_watch',
          durationMs: 1800,
          log: [
            'User is an AAPL employee equity holder -> in pre-clearance program',
            'AAPL pre-clearance status today: blackout window NOT active',
            'Even so, RSU transfers require trading-desk pre-clearance sign-off',
            'Action: request pre-clearance ticket before hitting submit',
            'LRS $250k window for this PAN: $14,500 used YTD',
            'Transfer is non-monetary (in-kind shares) -> does NOT consume LRS',
            'FEMA: in-kind US-to-US transfer, no India-side reporting trigger',
            'PAN-Aadhaar linked, FATCA self-cert on file'
          ],
          finding: 'No blackout window, no LRS consumption (it is a share movement, not a wire), but the trading-desk pre-clearance ticket still needs to be filed before submit.'
        }
      ],
      synthesis: {
        headline: 'In-kind transfer via DTC 3021 — 0 tax, 3-5 days',
        summary: "The default on StockPlan Connect Step 3 is 'Sell and remit USD' — picking that would force you to realise your RSU gains and lose roughly $5,200 in unnecessary tax. The correct path is an in-kind DTC ACATS transfer to Alpaca Securities (DTC 3021), which is the US clearing partner for INDmoney. We've drafted the exact field values below; file your trading-desk pre-clearance ticket first, then paste, sign, and the shares will appear in your INDmoney US account within 3-5 business days.",
        actions: [
          { label: 'Open StockPlan Connect', kind: 'primary', payload: 'https://stockplanconnect.morganstanley.com/' },
          { label: 'Copy DTC 3021', kind: 'copy', payload: '3021' },
          { label: 'Copy broker name', kind: 'copy', payload: 'Alpaca Securities LLC' },
          { label: 'Copy account number', kind: 'copy', payload: '9XX-XXX-4421' }
        ],
        impact: {
          headline: '~$5,200 STCG avoided · position lands in 5 business days',
          detail: 'In-kind ACATS preserves cost basis and holding period — the cash-out default would have crystallised the entire 120-share RSU gain.'
        }
      }
    }
  ]
};
