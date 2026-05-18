// IND-TaxonBot — Pre-baked demo scenarios
// Three diagnoses: broken US stock-plan transfer, CDSL own-account misclass,
// and a US tax-lot trap that would crystallize STCG instead of LTCG.

(function () {
  // ---------------------------------------------------------------------------
  // Shared SVG helpers — these build small reusable chunks so each screenshot
  // reads like a real broker form without bloating the file.
  // ---------------------------------------------------------------------------

  function header(brand, subtitle) {
    return (
      '<rect x="0" y="0" width="800" height="64" fill="#1C2B26"/>' +
      '<circle cx="32" cy="32" r="14" fill="#2E5C4D"/>' +
      '<text x="56" y="30" fill="#FFFFFF" font-family="Inter, Arial, sans-serif" font-size="15" font-weight="700">' +
      brand +
      '</text>' +
      '<text x="56" y="48" fill="#9CB6AB" font-family="Inter, Arial, sans-serif" font-size="11">' +
      subtitle +
      '</text>' +
      '<rect x="700" y="22" width="76" height="22" rx="11" fill="#2E5C4D"/>' +
      '<text x="738" y="37" fill="#CDE4DA" font-family="Inter, Arial, sans-serif" font-size="10" text-anchor="middle">Secure session</text>'
    );
  }

  function label(x, y, text) {
    return (
      '<text x="' + x + '" y="' + y + '" fill="#0F1B16" ' +
      'font-family="Inter, Arial, sans-serif" font-size="11" font-weight="600">' +
      text + '</text>'
    );
  }

  function input(x, y, w, value, opts) {
    opts = opts || {};
    var h = 34;
    var stroke = opts.stroke || '#C9D2CC';
    var fill = opts.fill || '#FFFFFF';
    var rect =
      '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h +
      '" rx="4" fill="' + fill + '" stroke="' + stroke + '"/>';
    var textNode = '';
    if (value && value.length) {
      textNode =
        '<text x="' + (x + 12) + '" y="' + (y + 22) + '" fill="#1C2B26" ' +
        'font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="12">' +
        value + '</text>';
    }
    return rect + textNode;
  }

  function button(x, y, w, text, color) {
    return (
      '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="40" rx="6" fill="' + color + '"/>' +
      '<text x="' + (x + w / 2) + '" y="' + (y + 25) + '" fill="#FFFFFF" ' +
      'font-family="Inter, Arial, sans-serif" font-size="13" font-weight="700" text-anchor="middle">' +
      text + '</text>'
    );
  }

  function divider(x, y, w) {
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="1" fill="#E2E8E4"/>';
  }

  function pageFrame() {
    return '<rect x="0" y="0" width="800" height="600" fill="#F4F6F5"/>';
  }

  function tag(x, y, text, fill, color) {
    var w = Math.max(60, text.length * 6 + 16);
    return (
      '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="20" rx="10" fill="' + fill + '"/>' +
      '<text x="' + (x + w / 2) + '" y="' + (y + 14) + '" fill="' + color +
      '" font-family="Inter, Arial, sans-serif" font-size="10" font-weight="600" text-anchor="middle">' +
      text + '</text>'
    );
  }

  // ---------------------------------------------------------------------------
  // Scenario 1: Morgan Stanley StockPlan Connect — wrong DTC, missing broker
  // ---------------------------------------------------------------------------

  var msSvg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">' +
    pageFrame() +
    header('Morgan Stanley StockPlan Connect', 'Outbound Securities Transfer  ·  Step 3 of 4') +
    // Breadcrumb / step
    '<rect x="24" y="80" width="752" height="36" rx="4" fill="#FFFFFF" stroke="#E2E8E4"/>' +
    '<text x="40" y="103" fill="#0F1B16" font-family="Inter, Arial, sans-serif" font-size="12" font-weight="600">Transfer Details</text>' +
    '<text x="170" y="103" fill="#6B7A73" font-family="Inter, Arial, sans-serif" font-size="11">Provide the receiving broker information below.</text>' +
    // Section title
    '<text x="24" y="142" fill="#0F1B16" font-family="Inter, Arial, sans-serif" font-size="13" font-weight="700">Receiving Account</text>' +
    divider(24, 150, 752) +
    // Row 1
    label(24, 172, 'Account Holder Name') +
    input(24, 180, 360, 'Shriti S. Chandra') +
    label(416, 172, 'Receiving DTC Number') +
    input(416, 180, 360, '0234') +
    // Row 2
    label(24, 240, 'Receiving Broker / Firm Name') +
    input(24, 248, 360, '') +
    label(416, 240, 'Receiving Account Number') +
    input(416, 248, 360, '9XX-XXX-4421') +
    // Section 2
    '<text x="24" y="312" fill="#0F1B16" font-family="Inter, Arial, sans-serif" font-size="13" font-weight="700">Transfer Instructions</text>' +
    divider(24, 320, 752) +
    label(24, 342, 'Transfer Option') +
    input(24, 350, 360, 'Cash out proceeds') +
    label(416, 342, 'Quantity to Transfer') +
    input(416, 350, 360, '120 shares') +
    // Disclosure block
    '<rect x="24" y="412" width="752" height="56" rx="4" fill="#FFF8E6" stroke="#E6D9A8"/>' +
    '<text x="40" y="432" fill="#5A4B12" font-family="Inter, Arial, sans-serif" font-size="11" font-weight="700">Compliance notice</text>' +
    '<text x="40" y="450" fill="#5A4B12" font-family="Inter, Arial, sans-serif" font-size="11">Transfers cannot be reversed once submitted. Please verify the DTC number with your receiving broker.</text>' +
    '<text x="40" y="462" fill="#5A4B12" font-family="Inter, Arial, sans-serif" font-size="11">Allow 2-5 business days for the position to appear in the receiving account.</text>' +
    // Footer buttons
    '<rect x="24" y="500" width="120" height="40" rx="6" fill="#FFFFFF" stroke="#C9D2CC"/>' +
    '<text x="84" y="525" fill="#1C2B26" font-family="Inter, Arial, sans-serif" font-size="13" font-weight="600" text-anchor="middle">Back</text>' +
    button(606, 500, 170, 'Submit Transfer', '#0066CC') +
    '<text x="24" y="572" fill="#6B7A73" font-family="Inter, Arial, sans-serif" font-size="10">Morgan Stanley Smith Barney LLC. Member SIPC. Session ID 7f3a-2210-bd</text>' +
    '</svg>';

  // ---------------------------------------------------------------------------
  // Scenario 2: CDSL Easiest — Off-Market setup with wrong reason code
  // ---------------------------------------------------------------------------

  var cdslSvg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">' +
    pageFrame() +
    header('CDSL Easiest — Off-Market Setup', 'Off-Market Transaction  ·  Beneficiary Setup') +
    // Sub-nav
    '<rect x="0" y="64" width="800" height="32" fill="#243F36"/>' +
    '<text x="24" y="85" fill="#CDE4DA" font-family="Inter, Arial, sans-serif" font-size="11">Home  /  Setup  /  Off-Market Transaction  /  <tspan fill="#FFFFFF" font-weight="700">New Instruction</tspan></text>' +
    // Title
    '<text x="24" y="124" fill="#0F1B16" font-family="Inter, Arial, sans-serif" font-size="14" font-weight="700">Off-Market Transfer Instruction</text>' +
    '<text x="24" y="142" fill="#6B7A73" font-family="Inter, Arial, sans-serif" font-size="11">Move securities between two demat accounts without going through an exchange.</text>' +
    // Identity card
    '<rect x="24" y="156" width="752" height="48" rx="4" fill="#EAF2EE" stroke="#C9D2CC"/>' +
    '<text x="40" y="178" fill="#0F1B16" font-family="Inter, Arial, sans-serif" font-size="12" font-weight="700">Initiating BO: Shriti Chandra</text>' +
    '<text x="40" y="194" fill="#1C2B26" font-family="ui-monospace, Menlo, monospace" font-size="11">PAN ABCPC1234K  ·  DP IN303028  ·  Client ID 12345678</text>' +
    tag(640, 170, 'KYC Verified', '#D6EBDC', '#1C5A38') +
    // Form
    label(24, 232, 'Beneficiary Owner (BO) ID') +
    input(24, 240, 360, '1208160000123456') +
    label(416, 232, 'Receiving DP ID') +
    input(416, 240, 360, '12081600') +
    label(24, 300, 'Reason Code') +
    input(24, 308, 360, 'Code 2 — Off-Market Sale') +
    label(416, 300, 'ISIN') +
    input(416, 308, 360, 'INE002A01018') +
    label(24, 368, 'Quantity') +
    input(24, 376, 360, '150') +
    label(416, 368, 'Execution Date') +
    input(416, 376, 360, '19-May-2026') +
    // Security name strip (helps it read like a real CDSL screen)
    '<rect x="24" y="430" width="752" height="40" rx="4" fill="#FFFFFF" stroke="#E2E8E4"/>' +
    '<text x="40" y="446" fill="#6B7A73" font-family="Inter, Arial, sans-serif" font-size="10">Resolved security</text>' +
    '<text x="40" y="462" fill="#0F1B16" font-family="Inter, Arial, sans-serif" font-size="12" font-weight="600">RELIANCE INDUSTRIES LTD — EQ</text>' +
    '<text x="640" y="455" fill="#1C2B26" font-family="ui-monospace, Menlo, monospace" font-size="11" text-anchor="end">NSE: RELIANCE</text>' +
    // OTP / auth bar
    '<rect x="24" y="486" width="752" height="32" rx="4" fill="#F0F4F1" stroke="#E2E8E4"/>' +
    '<text x="40" y="506" fill="#6B7A73" font-family="Inter, Arial, sans-serif" font-size="11">TPIN authentication will be requested after submit. Charges apply per ISIN.</text>' +
    // Buttons
    '<rect x="24" y="534" width="120" height="40" rx="6" fill="#FFFFFF" stroke="#C9D2CC"/>' +
    '<text x="84" y="559" fill="#1C2B26" font-family="Inter, Arial, sans-serif" font-size="13" font-weight="600" text-anchor="middle">Save Draft</text>' +
    button(620, 534, 156, 'Submit Instruction', '#1C2B26') +
    '</svg>';

  // ---------------------------------------------------------------------------
  // Scenario 3: INDmoney US Stocks — Sell order tax-lot review
  // ---------------------------------------------------------------------------

  var stcgSvg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">' +
    pageFrame() +
    header('INDmoney US Stocks — Sell Order Review', 'Order Preview  ·  Confirm tax lot before execution') +
    // Top order card
    '<rect x="24" y="84" width="752" height="76" rx="6" fill="#FFFFFF" stroke="#E2E8E4"/>' +
    '<text x="40" y="108" fill="#6B7A73" font-family="Inter, Arial, sans-serif" font-size="11">Order</text>' +
    '<text x="40" y="132" fill="#0F1B16" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="700">SELL  AAPL  ·  25 shares</text>' +
    '<text x="40" y="150" fill="#6B7A73" font-family="Inter, Arial, sans-serif" font-size="11">Apple Inc.  ·  NASDAQ  ·  Market Order  ·  Day</text>' +
    tag(660, 100, 'Live Market', '#D6EBDC', '#1C5A38') +
    '<text x="760" y="138" fill="#0F1B16" font-family="ui-monospace, Menlo, monospace" font-size="16" font-weight="700" text-anchor="end">$214.62</text>' +
    '<text x="760" y="152" fill="#1C5A38" font-family="Inter, Arial, sans-serif" font-size="10" text-anchor="end">+1.4% today</text>' +
    // Form section
    '<text x="24" y="190" fill="#0F1B16" font-family="Inter, Arial, sans-serif" font-size="13" font-weight="700">Order Details</text>' +
    divider(24, 198, 752) +
    label(24, 220, 'Symbol') +
    input(24, 228, 360, 'AAPL') +
    label(416, 220, 'Quantity to Sell') +
    input(416, 228, 360, '25') +
    label(24, 288, 'Tax Lot Method') +
    input(24, 296, 360, 'Highest Cost First') +
    label(416, 288, 'Settlement') +
    input(416, 296, 360, 'T+2') +
    // Lot detail card
    '<text x="24" y="356" fill="#0F1B16" font-family="Inter, Arial, sans-serif" font-size="13" font-weight="700">Selected Lot</text>' +
    divider(24, 364, 752) +
    label(24, 386, 'Estimated Holding Period of Selected Lot') +
    input(24, 394, 360, '11 months 26 days') +
    label(416, 386, 'Estimated Realized Gain') +
    input(416, 394, 360, '$1,840 — taxed as STCG (~30%)') +
    // Lot breakdown rows (subtle)
    '<rect x="24" y="450" width="752" height="68" rx="4" fill="#FFFFFF" stroke="#E2E8E4"/>' +
    '<text x="40" y="470" fill="#6B7A73" font-family="Inter, Arial, sans-serif" font-size="10">Lot ledger (oldest first)</text>' +
    '<text x="40" y="488" fill="#0F1B16" font-family="ui-monospace, Menlo, monospace" font-size="11">2025-05-22   25 sh   @ $140.10   ·   holding 11m 26d</text>' +
    '<text x="40" y="504" fill="#0F1B16" font-family="ui-monospace, Menlo, monospace" font-size="11">2025-08-14   40 sh   @ $182.40   ·   holding  9m 04d</text>' +
    // Buttons
    '<rect x="24" y="534" width="120" height="40" rx="6" fill="#FFFFFF" stroke="#C9D2CC"/>' +
    '<text x="84" y="559" fill="#1C2B26" font-family="Inter, Arial, sans-serif" font-size="13" font-weight="600" text-anchor="middle">Cancel</text>' +
    button(606, 534, 170, 'Place Sell Order', '#0066CC') +
    '</svg>';

  // ---------------------------------------------------------------------------
  // Scenario payloads
  // ---------------------------------------------------------------------------

  var ms_dtc = {
    id: 'ms_dtc',
    label: 'Morgan Stanley · Wrong DTC',
    subtitle: 'User stuck on US stock-plan transfer — wrong DTC, broker blank, name mismatch',
    portalBrand: 'Morgan Stanley StockPlan Connect',
    screenshotSvg: msSvg,
    userProfile: {
      fullName: 'Shriti Chandra',
      panMasked: 'ABCPC1234K'
    },
    parsedNameOnForm: 'Shriti S. Chandra',
    geminiResponse: {
      title: 'Transfer blocked: DTC + broker mismatch',
      description:
        'The receiving broker block on this StockPlan Connect outbound form will reject submission. ' +
        'The DTC number does not match INDmoney\'s US clearing partner, the broker name field is empty, ' +
        'and the transfer option will liquidate the position instead of moving it in kind.',
      portalType: 'US_BROKERAGE',
      fields: [
        {
          name: 'Account Holder Name',
          status: 'Valid',
          current: 'Shriti S. Chandra',
          correct: 'Shriti S. Chandra',
          why: 'Levenshtein match >90% against your INDmoney KYC name "Shriti Chandra". Middle initials are accepted on US transfer forms.'
        },
        {
          name: 'Receiving DTC Number',
          status: 'Error',
          current: '0234',
          correct: '3021',
          why: 'DTC 0234 routes to a legacy custodian no longer used by INDmoney. The correct DTC for our US clearing partner (Alpaca Securities LLC) is 3021.'
        },
        {
          name: 'Receiving Broker / Firm Name',
          status: 'Missing',
          current: '(blank)',
          correct: 'Alpaca Securities LLC',
          why: 'Morgan Stanley requires the receiving broker firm name even when DTC is provided. Leaving it blank causes the submit button to soft-fail with no error toast.'
        },
        {
          name: 'Receiving Account Number',
          status: 'Valid',
          current: '9XX-XXX-4421',
          correct: '9XX-XXX-4421',
          why: 'Matches the Alpaca sub-account linked to your INDmoney US Stocks profile.'
        },
        {
          name: 'Transfer Option',
          status: 'Config Conflict',
          current: 'Cash out proceeds',
          correct: 'Retain funds in stock plan account',
          why: 'Cash-out forces a sale at market and remits USD — that is a taxable event in the US and creates a 30% withholding on gains. You want an in-kind transfer of the 120 shares to your INDmoney US account.'
        },
        {
          name: 'Quantity to Transfer',
          status: 'Valid',
          current: '120 shares',
          correct: '120 shares',
          why: 'Matches the vested balance on your stock plan account.'
        }
      ],
      resolution:
        'Good news: the issue here is configuration, not your account. Switch the DTC number to 3021, ' +
        'type "Alpaca Securities LLC" into the broker firm field, and change the transfer option from cash-out ' +
        'to "Retain funds in stock plan account" so the shares move in kind instead of being sold. ' +
        'Once you switch this and submit, the position routes through to INDmoney within 2 business days with no taxable event.',
      actions: [
        { label: 'Copy DTC 3021', action: 'copy:3021' },
        { label: 'Copy broker name', action: 'copy:Alpaca Securities LLC' },
        { label: 'Autofill all corrections', action: 'autofill:ms_dtc' }
      ]
    },
    autofillTargets: [
      { fieldLabel: 'Receiving DTC Number', svgX: 416, svgY: 180, svgW: 360, svgH: 34, correctValue: '3021' },
      { fieldLabel: 'Receiving Broker / Firm Name', svgX: 24, svgY: 248, svgW: 360, svgH: 34, correctValue: 'Alpaca Securities LLC' },
      { fieldLabel: 'Transfer Option', svgX: 24, svgY: 350, svgW: 360, svgH: 34, correctValue: 'Retain funds in stock plan account' }
    ],
    growthImpact: {
      issueRate: '31% of US transfers fail at this screen',
      avgResolution: '4.2 days via support email',
      withTaxonBot: '<60 seconds, zero ticket'
    }
  };

  var cdsl_code2 = {
    id: 'cdsl_code2',
    label: 'CDSL Easiest · Wrong Reason Code',
    subtitle: 'Own-account transfer marked as Off-Market Sale — would trigger STCG',
    portalBrand: 'CDSL Easiest',
    screenshotSvg: cdslSvg,
    userProfile: {
      fullName: 'Shriti Chandra',
      panMasked: 'ABCPC1234K'
    },
    parsedNameOnForm: 'Shriti Chandra',
    geminiResponse: {
      title: 'Wrong reason code would trigger STCG',
      description:
        'This is an own-account transfer — same PAN on both legs — but it is currently flagged as ' +
        'Code 2 (Off-Market Sale). CDSL treats Code 2 as a notional sale at market price, which means ' +
        'the income-tax department will see a full taxable event on 150 shares of Reliance even though ' +
        'no money is actually changing hands.',
      portalType: 'INDIA_DEPOSITORY',
      fields: [
        {
          name: 'Beneficiary Owner (BO) ID',
          status: 'Valid',
          current: '1208160000123456',
          correct: '1208160000123456',
          why: 'BO ID checksum is valid and matches your linked INDmoney demat account.'
        },
        {
          name: 'Receiving DP ID',
          status: 'Valid',
          current: '12081600',
          correct: '12081600',
          why: 'DP IN12081600 is INDmoney\'s CDSL participant ID — correct receiving DP.'
        },
        {
          name: 'Reason Code',
          status: 'Config Conflict',
          current: 'Code 2 — Off-Market Sale',
          correct: 'Code 5 — Own-Account Transfer',
          why: 'Code 2 creates a notional sale at market price and books STCG/LTCG on the entire 150-share position, even though no third party is buying. Code 5 is the correct code when sender and receiver share the same PAN — it is a zero-tax movement of your own securities.'
        },
        {
          name: 'ISIN',
          status: 'Valid',
          current: 'INE002A01018',
          correct: 'INE002A01018',
          why: 'Resolves to Reliance Industries Ltd (EQ). Matches the security in your source demat.'
        },
        {
          name: 'Quantity',
          status: 'Valid',
          current: '150',
          correct: '150',
          why: 'Within the free balance available for transfer.'
        },
        {
          name: 'Execution Date',
          status: 'Valid',
          current: '19-May-2026',
          correct: '19-May-2026',
          why: 'T+1 from today, which CDSL accepts for off-market instructions submitted before 4 PM IST.'
        }
      ],
      resolution:
        'Good news: the issue here is configuration, not your account. Change the Reason Code from ' +
        '"Code 2 — Off-Market Sale" to "Code 5 — Own-Account Transfer". Because both the sending and ' +
        'receiving demat accounts are under the same PAN, Code 5 is recognised by the tax department as ' +
        'a movement of your own securities, not a sale. Once you switch this and re-submit with your TPIN, ' +
        'the 150 shares will settle into your INDmoney demat by end of next working day with zero tax impact.',
      actions: [
        { label: 'Copy reason code', action: 'copy:Code 5 — Own-Account Transfer' },
        { label: 'Explain Code 5', action: 'explain:cdsl_code5' },
        { label: 'Autofill correction', action: 'autofill:cdsl_code2' }
      ]
    },
    autofillTargets: [
      { fieldLabel: 'Reason Code', svgX: 24, svgY: 308, svgW: 360, svgH: 34, correctValue: 'Code 5 — Own-Account Transfer' }
    ],
    growthImpact: {
      issueRate: '~12% of CDSL transfers misuse Code 2',
      avgResolution: 'Discovered at ITR filing — months later',
      withTaxonBot: 'Caught pre-submit',
      annualSavings: 'Avg INR 18,000 in avoidable STCG per affected user'
    }
  };

  var stcg_trap = {
    id: 'stcg_trap',
    label: 'INDmoney US · Tax-Lot Trap',
    subtitle: 'Sell order would crystallize STCG instead of LTCG — 4 days short of long-term',
    portalBrand: 'INDmoney US Stocks',
    screenshotSvg: stcgSvg,
    userProfile: {
      fullName: 'Shriti Chandra',
      panMasked: 'ABCPC1234K'
    },
    parsedNameOnForm: 'Shriti Chandra',
    geminiResponse: {
      title: 'Sell would crystallize STCG — 4 days too early',
      description:
        'The order is technically valid but the selected tax lot has been held for 11 months and 26 days. ' +
        'Selling now triggers short-term capital gains tax at the user\'s ordinary income rate (~30%). ' +
        'Holding for 4 more days flips the same lot into long-term territory, where the federal rate drops to ~15%.',
      portalType: 'TAX_LOT_REVIEW',
      fields: [
        {
          name: 'Symbol',
          status: 'Valid',
          current: 'AAPL',
          correct: 'AAPL',
          why: 'Apple Inc. — matches a position in your INDmoney US account.'
        },
        {
          name: 'Quantity to Sell',
          status: 'Valid',
          current: '25',
          correct: '25',
          why: 'Within free quantity. No pending orders against this lot.'
        },
        {
          name: 'Tax Lot Method',
          status: 'Config Conflict',
          current: 'Highest Cost First',
          correct: 'Lowest Cost — Long-Term First',
          why: '"Highest Cost First" picked the May 2025 lot, which is 4 days short of long-term. "Long-Term First" defers to lots already past 12 months, or warns you to wait. Either choice avoids the STCG trap.'
        },
        {
          name: 'Estimated Holding Period of Selected Lot',
          status: 'Error',
          current: '11 months 26 days',
          correct: '12 months + (defer to 22-May)',
          why: 'Anything under 12 months is taxed as short-term capital gains. The selected lot is 4 days short. Waiting until 22-May-2026 (or later) makes the entire $1,840 gain long-term.'
        },
        {
          name: 'Estimated Realized Gain',
          status: 'Error',
          current: '$1,840 — taxed as STCG (~30%)',
          correct: '$1,840 — taxed as LTCG (~15%)',
          why: 'Same gain, different bucket. STCG at ~30% costs roughly $552 in tax. LTCG at ~15% costs roughly $276. Difference: $276 saved on this one trade.'
        },
        {
          name: 'Settlement',
          status: 'Valid',
          current: 'T+2',
          correct: 'T+2',
          why: 'Standard US equities settlement. No issue here.'
        }
      ],
      resolution:
        'Good news: this is a timing fix, not a broken order. The lot the system picked is just 4 days short ' +
        'of being long-term, which is the difference between roughly 30% and 15% tax on your $1,840 gain. ' +
        'You have two clean options: change the Tax Lot Method to "Lowest Cost — Long-Term First", or simply ' +
        'place the same sell order on or after 22-May-2026. Either way, you keep about $276 you would have lost to STCG.',
      actions: [
        { label: 'Reschedule sell for 22-May', action: 'schedule:2026-05-22' },
        { label: 'Switch to Long-Term First', action: 'copy:Lowest Cost — Long-Term First' },
        { label: 'Autofill correction', action: 'autofill:stcg_trap' }
      ]
    },
    autofillTargets: [
      { fieldLabel: 'Tax Lot Method', svgX: 24, svgY: 296, svgW: 360, svgH: 34, correctValue: 'Lowest Cost — Long-Term First' }
    ],
    growthImpact: {
      issueRate: 'Tax-lot method invisible to 80% of users',
      avgResolution: 'Never — surfaces only at year-end 1099',
      withTaxonBot: 'Caught at sell',
      annualSavings: '$276 saved on this one trade alone'
    }
  };

  // ---------------------------------------------------------------------------
  // Expose
  // ---------------------------------------------------------------------------

  window.INDTAXONBOT_SCENARIOS = {
    ms_dtc: ms_dtc,
    cdsl_code2: cdsl_code2,
    stcg_trap: stcg_trap
  };
})();
