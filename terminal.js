(function () {
  'use strict';

  // ===== Module-scoped state =====
  const TIMERS = new Set();
  let CURRENT_OPTS = null;
  let ROOT = null;
  let LOG_EL = null;
  let INPUT_EL = null;

  const setT = (fn, ms) => {
    const id = setTimeout(() => {
      TIMERS.delete(id);
      fn();
    }, ms);
    TIMERS.add(id);
    return id;
  };
  const clearAllTimers = () => {
    for (const id of TIMERS) clearTimeout(id);
    TIMERS.clear();
  };

  // ===== Styles =====
  const STYLE_ID = 'taxbot-terminal-style';
  const CSS = `
.taxbot-terminal-root {
  display: flex; flex-direction: column;
  height: 100%; min-height: 600px;
  background: var(--bg-card, #0B1612);
  border: 1px solid var(--border, #1F2A26);
  border-radius: 14px;
  overflow: hidden;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  color: var(--text, #E8F1ED);
}
.taxbot-terminal-topbar {
  display: flex; align-items: flex-start; justify-content: space-between;
  padding: 16px 20px 14px;
  border-bottom: 1px solid var(--border, #1F2A26);
  background: var(--bg-elev, #0E1A16);
}
.taxbot-terminal-topbar h2 {
  font-size: 15px; font-weight: 700; margin: 0;
  display: flex; align-items: center; gap: 8px;
}
.taxbot-terminal-topbar h2::before {
  content: ''; width: 8px; height: 8px; border-radius: 50%;
  background: var(--accent, #00D09C);
  box-shadow: 0 0 8px var(--accent, #00D09C);
}
.taxbot-terminal-topbar .sub {
  color: var(--text-dim, #9FB3AB);
  font-size: 12px; margin-top: 6px; max-width: 580px; line-height: 1.5;
}
.taxbot-terminal-clear {
  background: transparent;
  border: 1px solid var(--border-bright, #2A3A35);
  color: var(--text-dim, #9FB3AB);
  font-size: 11px; padding: 6px 12px; border-radius: 6px;
  cursor: pointer; text-transform: uppercase; letter-spacing: 0.5px;
  font-family: inherit;
  transition: all 0.15s ease;
}
.taxbot-terminal-clear:hover {
  border-color: var(--accent, #00D09C);
  color: var(--accent, #00D09C);
}
.taxbot-terminal-chips {
  display: flex; flex-wrap: wrap; gap: 8px;
  padding: 14px 20px;
  border-bottom: 1px solid var(--border, #1F2A26);
  background: var(--bg-elev, #0E1A16);
}
.taxbot-terminal-chip-label {
  font-size: 10px; text-transform: uppercase; letter-spacing: 1px;
  color: var(--text-muted, #6C8079); margin-right: 6px;
  align-self: center; font-weight: 600;
}
.taxbot-terminal-chip {
  background: var(--bg-card, #0B1612);
  border: 1px solid var(--border-bright, #2A3A35);
  color: var(--text, #E8F1ED);
  padding: 7px 12px; border-radius: 999px;
  font-size: 12px; cursor: pointer;
  font-family: inherit;
  transition: all 0.15s ease;
}
.taxbot-terminal-chip:hover {
  border-color: var(--accent, #00D09C);
  color: var(--accent, #00D09C);
  transform: translateY(-1px);
}
.taxbot-terminal-log {
  flex: 1; overflow-y: auto; padding: 22px 20px;
  display: flex; flex-direction: column; gap: 16px;
  scroll-behavior: smooth;
  background: #08110D;
}
.taxbot-terminal-log::-webkit-scrollbar { width: 8px; }
.taxbot-terminal-log::-webkit-scrollbar-thumb { background: #1F2A26; border-radius: 4px; }
.taxbot-terminal-empty {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  flex: 1; gap: 14px; color: var(--text-muted, #6C8079);
  padding: 40px 20px; text-align: center;
}
.taxbot-terminal-empty svg { opacity: 0.4; }
.taxbot-terminal-empty p { font-size: 13px; margin: 0; }
.taxbot-terminal-user {
  align-self: flex-end; max-width: 78%;
  background: rgba(0, 208, 156, 0.08);
  border: 1px solid rgba(0, 208, 156, 0.4);
  border-radius: 12px 12px 4px 12px;
  padding: 12px 16px;
  font-size: 14px; line-height: 1.5;
  animation: taxbot-fade-up 0.3s ease;
}
.taxbot-terminal-user .label {
  font-size: 10px; text-transform: uppercase; letter-spacing: 1px;
  color: var(--accent, #00D09C); font-weight: 700; margin-bottom: 4px;
}
.taxbot-terminal-orch {
  background: var(--bg-card, #0B1612);
  border: 1px solid var(--border, #1F2A26);
  border-left: 3px solid var(--accent, #00D09C);
  border-radius: 8px; padding: 14px 16px;
  font-size: 13px; line-height: 1.55;
  animation: taxbot-fade-up 0.3s ease;
}
.taxbot-terminal-orch .head {
  font-size: 11px; text-transform: uppercase; letter-spacing: 1px;
  color: var(--accent, #00D09C); font-weight: 700; margin-bottom: 6px;
  display: flex; align-items: center; gap: 8px;
}
.taxbot-terminal-orch .head .spinner {
  width: 10px; height: 10px; border: 2px solid rgba(0, 208, 156, 0.3);
  border-top-color: var(--accent, #00D09C);
  border-radius: 50%; animation: taxbot-spin 0.8s linear infinite;
}
.taxbot-terminal-orch.done .spinner { display: none; }
.taxbot-terminal-orch .plan {
  color: var(--text, #E8F1ED);
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 12px;
}
.taxbot-terminal-orch .cursor {
  display: inline-block; width: 7px; height: 13px; background: var(--accent, #00D09C);
  margin-left: 2px; vertical-align: text-bottom;
  animation: taxbot-blink 0.7s steps(2) infinite;
}
.taxbot-terminal-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 12px;
  animation: taxbot-fade-up 0.3s ease;
}
.taxbot-agent-card {
  background: var(--bg-card, #0B1612);
  border: 1px solid var(--border, #1F2A26);
  border-left: 3px solid var(--accent, #00D09C);
  border-radius: 8px; padding: 12px 14px;
  display: flex; flex-direction: column; gap: 10px;
  min-height: 200px;
}
.taxbot-agent-card .head {
  display: flex; align-items: center; gap: 10px;
}
.taxbot-agent-card .icon {
  width: 28px; height: 28px; border-radius: 6px;
  background: rgba(255,255,255,0.04);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.taxbot-agent-card .icon svg { width: 16px; height: 16px; }
.taxbot-agent-card .name {
  font-size: 13px; font-weight: 700; line-height: 1.2;
}
.taxbot-agent-card .role {
  font-size: 10px; color: var(--text-muted, #6C8079);
  text-transform: uppercase; letter-spacing: 0.5px;
  margin-top: 2px;
}
.taxbot-agent-card .status {
  margin-left: auto; flex-shrink: 0;
  display: flex; align-items: center; gap: 4px;
  font-family: 'JetBrains Mono', monospace; font-size: 10px;
  color: var(--text-muted, #6C8079);
}
.taxbot-agent-card .pulse {
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--accent, #00D09C);
  animation: taxbot-pulse 1.1s ease-in-out infinite;
}
.taxbot-agent-card .check {
  color: var(--accent, #00D09C); font-weight: 700;
}
.taxbot-agent-card .log {
  background: #08110D;
  border: 1px solid rgba(255,255,255,0.04);
  border-radius: 6px; padding: 8px 10px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11.5px; line-height: 1.55;
  color: var(--text-dim, #9FB3AB);
  flex: 1; min-height: 80px;
  white-space: pre-wrap; word-break: break-word;
  overflow: hidden;
}
.taxbot-agent-card .log-line { display: block; }
.taxbot-agent-card .finding {
  font-size: 13px; line-height: 1.5; font-weight: 600;
  color: var(--text, #E8F1ED);
  padding: 8px 10px;
  background: rgba(0,208,156,0.06);
  border-radius: 6px;
  opacity: 0; transform: translateY(6px);
  transition: opacity 0.35s ease, transform 0.35s ease;
}
.taxbot-agent-card .finding.show { opacity: 1; transform: translateY(0); }
.taxbot-synthesis {
  background: linear-gradient(180deg, rgba(0,208,156,0.10), rgba(0,208,156,0.02));
  border: 1px solid rgba(0,208,156,0.55);
  border-radius: 12px;
  padding: 18px 20px;
  box-shadow: 0 0 0 1px rgba(0,208,156,0.08), 0 8px 32px rgba(0,208,156,0.10);
  animation: taxbot-synth-in 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.taxbot-synthesis .label-row {
  display: flex; align-items: center; gap: 8px;
  font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px;
  color: var(--accent, #00D09C); font-weight: 700; margin-bottom: 10px;
}
.taxbot-synthesis .headline {
  font-size: 20px; font-weight: 800; line-height: 1.25;
  color: var(--text, #E8F1ED); margin-bottom: 10px;
}
.taxbot-synthesis .summary {
  font-size: 13.5px; line-height: 1.6;
  color: var(--text-dim, #C8DCD3); margin-bottom: 14px;
}
.taxbot-synthesis .impact {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 14px; border-radius: 8px;
  background: rgba(0,208,156,0.10);
  border: 1px solid rgba(0,208,156,0.25);
  margin-bottom: 14px;
}
.taxbot-synthesis .impact .h {
  font-size: 13px; font-weight: 700; color: var(--accent, #00D09C);
}
.taxbot-synthesis .impact .d {
  font-size: 12px; color: var(--text-dim, #9FB3AB);
}
.taxbot-synthesis .impact .sep {
  width: 1px; height: 16px; background: rgba(0,208,156,0.3);
}
.taxbot-synthesis .actions {
  display: flex; gap: 8px; flex-wrap: wrap;
}
.taxbot-btn {
  border: 1px solid var(--border-bright, #2A3A35);
  background: transparent;
  color: var(--text, #E8F1ED);
  font-size: 12px; font-weight: 600;
  padding: 8px 14px; border-radius: 6px;
  cursor: pointer; font-family: inherit;
  transition: all 0.15s ease;
}
.taxbot-btn:hover {
  border-color: var(--accent, #00D09C);
  color: var(--accent, #00D09C);
}
.taxbot-btn-primary {
  background: var(--accent, #00D09C);
  border-color: var(--accent, #00D09C);
  color: #08110D;
}
.taxbot-btn-primary:hover {
  background: #00B988; border-color: #00B988; color: #08110D;
}
.taxbot-terminal-input {
  display: flex; gap: 8px; padding: 14px 20px;
  border-top: 1px solid var(--border, #1F2A26);
  background: var(--bg-elev, #0E1A16);
}
.taxbot-terminal-input input {
  flex: 1; background: var(--bg-card, #0B1612);
  border: 1px solid var(--border-bright, #2A3A35);
  color: var(--text, #E8F1ED);
  padding: 10px 14px; border-radius: 8px;
  font-size: 13px; font-family: inherit;
  outline: none;
  transition: border 0.15s ease;
}
.taxbot-terminal-input input:focus { border-color: var(--accent, #00D09C); }
.taxbot-terminal-input input::placeholder { color: var(--text-muted, #6C8079); }
.taxbot-terminal-input button {
  background: var(--accent, #00D09C);
  border: none; color: #08110D;
  padding: 10px 18px; border-radius: 8px;
  font-size: 13px; font-weight: 700;
  cursor: pointer; font-family: inherit;
  transition: background 0.15s ease;
}
.taxbot-terminal-input button:hover { background: #00B988; }
.taxbot-assistant-bubble {
  align-self: flex-start; max-width: 80%;
  background: var(--bg-card, #0B1612);
  border: 1px solid var(--border, #1F2A26);
  border-left: 3px solid var(--text-muted, #6C8079);
  border-radius: 4px 12px 12px 12px;
  padding: 12px 16px;
  font-size: 13px; line-height: 1.55;
  color: var(--text-dim, #C8DCD3);
  animation: taxbot-fade-up 0.3s ease;
}
.taxbot-assistant-bubble .label {
  font-size: 10px; text-transform: uppercase; letter-spacing: 1px;
  color: var(--text-muted, #6C8079); font-weight: 700; margin-bottom: 4px;
}
@keyframes taxbot-fade-up {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes taxbot-synth-in {
  from { opacity: 0; transform: translateY(14px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes taxbot-spin { to { transform: rotate(360deg); } }
@keyframes taxbot-blink { 50% { opacity: 0; } }
@keyframes taxbot-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.7); }
}
`;

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  // ===== Helpers =====
  const el = (tag, attrs = {}, children = []) => {
    const e = document.createElement(tag);
    for (const k in attrs) {
      if (k === 'class') e.className = attrs[k];
      else if (k === 'style') e.setAttribute('style', attrs[k]);
      else if (k.startsWith('on') && typeof attrs[k] === 'function') {
        e.addEventListener(k.slice(2).toLowerCase(), attrs[k]);
      } else e.setAttribute(k, attrs[k]);
    }
    for (const c of [].concat(children)) {
      if (c == null) continue;
      e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    }
    return e;
  };

  const scrollDown = () => {
    if (!LOG_EL) return;
    requestAnimationFrame(() => { LOG_EL.scrollTop = LOG_EL.scrollHeight; });
  };

  const truncate = (s, n) => s.length > n ? s.slice(0, n - 1) + '…' : s;

  const TAXONBOT_MARK = `<svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2L4 7v10l8 5 8-5V7z"/><path d="M12 22V12"/><path d="M4 7l8 5 8-5"/></svg>`;
  const SPARK_ICON = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4z"/></svg>`;

  // ===== Query matching =====
  function matchQuery(text, queries) {
    const t = text.toLowerCase().trim();
    if (!t) return null;
    for (const q of queries) {
      if (q.id && t === q.id.toLowerCase()) return q;
    }
    // keyword routing
    const has = (...kws) => kws.some(k => t.includes(k));
    const findById = (frag) => queries.find(q => q.id && q.id.toLowerCase().includes(frag));
    if (has('reliance', 'cdsl', 'code 5', 'reason code')) {
      return findById('cdsl') || queries[0];
    }
    if (has('aapl', 'apple', 'tax-lot', 'tax lot', 'stcg', 'ltcg')) {
      return findById('aapl') || queries[1] || queries[0];
    }
    if (has('rsu', 'morgan', 'stockplan', 'dtc', 'vested')) {
      return findById('rsu') || queries[2] || queries[0];
    }
    return null;
  }

  // ===== Rendering =====
  function renderEmpty() {
    return el('div', { class: 'taxbot-terminal-empty' }, [
      (() => { const w = el('div'); w.innerHTML = TAXONBOT_MARK; return w.firstChild; })(),
      el('p', {}, ['Type a goal or click a suggestion to start.']),
      el('p', { style: 'font-size: 11px; opacity: 0.7;' }, [
        'TaxonBot fans out specialist agents in parallel and synthesizes one answer.'
      ])
    ]);
  }

  function ensureLogEmptyStateCleared() {
    const empty = LOG_EL.querySelector('.taxbot-terminal-empty');
    if (empty) empty.remove();
  }

  function appendUserBubble(text) {
    ensureLogEmptyStateCleared();
    const node = el('div', { class: 'taxbot-terminal-user' }, [
      el('div', { class: 'label' }, ['You']),
      el('div', {}, [text])
    ]);
    LOG_EL.appendChild(node);
    scrollDown();
    return node;
  }

  function appendAssistantBubble(text) {
    ensureLogEmptyStateCleared();
    const node = el('div', { class: 'taxbot-assistant-bubble' }, [
      el('div', { class: 'label' }, ['TaxonBot']),
      el('div', {}, [text])
    ]);
    LOG_EL.appendChild(node);
    scrollDown();
    return node;
  }

  function appendOrchestrator(planText) {
    const planEl = el('span', { class: 'plan' });
    const cursor = el('span', { class: 'cursor' });
    const card = el('div', { class: 'taxbot-terminal-orch' }, [
      el('div', { class: 'head' }, [
        el('span', { class: 'spinner' }),
        'Orchestrator · planning'
      ]),
      el('div', {}, [planEl, cursor])
    ]);
    LOG_EL.appendChild(card);
    scrollDown();

    // Typewriter ~350ms total target, but scale by length up to ~25ms/char min
    const total = Math.max(350, Math.min(900, planText.length * 12));
    const stepDelay = Math.max(8, total / planText.length);
    let i = 0;
    const tick = () => {
      if (i >= planText.length) {
        cursor.remove();
        card.classList.add('done');
        return;
      }
      planEl.textContent += planText[i++];
      setT(tick, stepDelay);
    };
    setT(tick, stepDelay);
    return card;
  }

  function agentIconWrap(agentMeta) {
    const w = el('div', { class: 'icon', style: `color: ${agentMeta.color}` });
    if (agentMeta.iconSvg) w.innerHTML = agentMeta.iconSvg;
    else w.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="8"/></svg>`;
    return w;
  }

  function buildAgentCard(agentMeta) {
    const logBox = el('div', { class: 'log' });
    const pulse = el('span', { class: 'pulse' });
    const statusTxt = el('span', { class: 'status-txt' }, ['working']);
    const status = el('div', { class: 'status' }, [pulse, statusTxt]);
    const finding = el('div', { class: 'finding' });
    const card = el('div', {
      class: 'taxbot-agent-card',
      style: `border-left-color: ${agentMeta.color}`
    }, [
      el('div', { class: 'head' }, [
        agentIconWrap(agentMeta),
        el('div', {}, [
          el('div', { class: 'name' }, [agentMeta.name]),
          el('div', { class: 'role' }, [agentMeta.role || ''])
        ]),
        status
      ]),
      logBox,
      finding
    ]);
    return { card, logBox, status, pulse, statusTxt, finding };
  }

  function animateAgent({ logBox, status, pulse, statusTxt, finding }, agentRun) {
    return new Promise(resolve => {
      const lines = agentRun.log || [];
      const lineCount = Math.max(1, lines.length);
      const perLine = Math.max(180, Math.min(900, agentRun.durationMs / lineCount));

      let lineIdx = 0;
      const startLine = () => {
        if (lineIdx >= lines.length) {
          // done
          pulse.remove();
          statusTxt.textContent = '';
          const check = el('span', { class: 'check' }, ['✓ done']);
          status.appendChild(check);
          finding.textContent = agentRun.finding || '';
          requestAnimationFrame(() => finding.classList.add('show'));
          scrollDown();
          return resolve();
        }
        const line = lines[lineIdx++];
        const lineSpan = el('span', { class: 'log-line' });
        logBox.appendChild(lineSpan);

        const charDelay = Math.max(8, Math.min(90, perLine / Math.max(1, line.length)));
        const cap = Math.min(perLine, 600);
        const finalCharDelay = Math.min(charDelay, cap / Math.max(1, line.length));
        let ci = 0;
        const typeChar = () => {
          if (ci >= line.length) {
            lineSpan.textContent += '\n';
            scrollDown();
            const gap = Math.max(20, perLine - line.length * finalCharDelay);
            setT(startLine, Math.min(gap, 250));
            return;
          }
          lineSpan.textContent += line[ci++];
          setT(typeChar, finalCharDelay);
        };
        typeChar();
      };
      startLine();
    });
  }

  function appendSynthesis(synthesis) {
    const card = el('div', { class: 'taxbot-synthesis' });
    const labelRow = el('div', { class: 'label-row' });
    const sparkWrap = el('span', { style: 'display: inline-flex; align-items: center;' });
    sparkWrap.innerHTML = SPARK_ICON;
    labelRow.appendChild(sparkWrap);
    labelRow.appendChild(document.createTextNode('Synthesis'));
    card.appendChild(labelRow);

    card.appendChild(el('div', { class: 'headline' }, [synthesis.headline || '']));
    card.appendChild(el('div', { class: 'summary' }, [synthesis.summary || '']));

    if (synthesis.impact) {
      card.appendChild(el('div', { class: 'impact' }, [
        el('div', { class: 'h' }, [synthesis.impact.headline || '']),
        el('div', { class: 'sep' }),
        el('div', { class: 'd' }, [synthesis.impact.detail || ''])
      ]));
    }

    const actionsWrap = el('div', { class: 'actions' });
    for (const action of (synthesis.actions || [])) {
      const cls = action.kind === 'primary'
        ? 'taxbot-btn taxbot-btn-primary'
        : 'taxbot-btn';
      const btn = el('button', {
        class: cls,
        onclick: () => {
          if (CURRENT_OPTS && typeof CURRENT_OPTS.onAction === 'function') {
            CURRENT_OPTS.onAction({
              kind: action.kind,
              label: action.label,
              payload: action.payload
            });
          }
        }
      }, [action.label]);
      actionsWrap.appendChild(btn);
    }
    card.appendChild(actionsWrap);

    LOG_EL.appendChild(card);
    scrollDown();
    return card;
  }

  // ===== Run a query =====
  async function runQuery(query) {
    if (!query) return;
    const opts = CURRENT_OPTS;
    appendUserBubble(query.prompt);

    setT(() => appendOrchestrator(query.orchestratorPlan || 'Routing to specialist agents…'), 200);

    // Build agent registry lookup
    const agentMetaById = {};
    for (const a of (opts.agents || [])) agentMetaById[a.id] = a;

    // Grid
    const grid = el('div', { class: 'taxbot-grid taxbot-terminal-grid' });
    setT(() => { LOG_EL.appendChild(grid); scrollDown(); }, 700);

    // Build and start each card in parallel
    setT(async () => {
      const promises = [];
      for (const agentRun of (query.agents || [])) {
        const meta = agentMetaById[agentRun.id] || {
          id: agentRun.id, name: agentRun.id, role: '', color: 'var(--accent, #00D09C)'
        };
        const built = buildAgentCard(meta);
        grid.appendChild(built.card);
        promises.push(animateAgent(built, agentRun));
      }
      scrollDown();
      try {
        await Promise.all(promises);
      } catch (e) { /* swallow on reset */ }
      // After all agents finish, synthesis
      setT(() => appendSynthesis(query.synthesis || {}), 220);
    }, 800);
  }

  // ===== Submit handler =====
  function handleSubmit() {
    if (!INPUT_EL) return;
    const text = INPUT_EL.value.trim();
    if (!text) return;
    INPUT_EL.value = '';
    const queries = (CURRENT_OPTS && CURRENT_OPTS.queries) || [];
    const match = matchQuery(text, queries);
    if (match) {
      runQuery(match);
    } else {
      appendUserBubble(text);
      setT(() => {
        appendAssistantBubble(
          "I've got 3 baked playbooks for this POC — try one of the suggested goals above. In production I'd route this to live agents."
        );
      }, 260);
    }
  }

  // ===== Build full UI =====
  function buildUI(rootEl, opts) {
    const queries = opts.queries || [];

    const topbar = el('div', { class: 'taxbot-terminal-topbar' }, [
      el('div', {}, [
        el('h2', {}, ['Ask TaxonBot']),
        el('div', { class: 'sub' }, [
          'Type a goal in plain English. TaxonBot will fan out specialist agents to work in parallel and return one consolidated answer.'
        ])
      ]),
      el('button', {
        class: 'taxbot-terminal-clear',
        onclick: () => api.reset()
      }, ['Clear conversation'])
    ]);

    const chipsRow = el('div', { class: 'taxbot-terminal-chips' });
    chipsRow.appendChild(el('span', { class: 'taxbot-terminal-chip-label' }, ['Suggested goals']));
    for (const q of queries) {
      const label = truncate(q.prompt || q.id || 'Query', 60);
      chipsRow.appendChild(el('button', {
        class: 'taxbot-terminal-chip',
        onclick: () => runQuery(q),
        title: q.prompt || ''
      }, [label]));
    }

    LOG_EL = el('div', { class: 'taxbot-terminal-log' });
    LOG_EL.appendChild(renderEmpty());

    INPUT_EL = el('input', {
      type: 'text',
      placeholder: 'Ask anything about a stock transfer…',
      autocomplete: 'off'
    });
    INPUT_EL.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      }
    });

    const submitBtn = el('button', { onclick: handleSubmit }, ['Submit']);
    const inputBar = el('div', { class: 'taxbot-terminal-input' }, [INPUT_EL, submitBtn]);

    const frame = el('div', { class: 'taxbot-terminal-root' }, [
      topbar, chipsRow, LOG_EL, inputBar
    ]);

    rootEl.replaceChildren(frame);
    requestAnimationFrame(() => { /* settle layout */ });
  }

  // ===== Public API =====
  const api = {
    mount(rootEl, opts) {
      clearAllTimers();
      injectStyle();
      ROOT = rootEl;
      CURRENT_OPTS = opts || {};
      if (!CURRENT_OPTS.agents && window.INDTAXONBOT_AGENTS) {
        CURRENT_OPTS.agents = window.INDTAXONBOT_AGENTS.agents || [];
        CURRENT_OPTS.queries = CURRENT_OPTS.queries || window.INDTAXONBOT_AGENTS.queries || [];
      }
      buildUI(rootEl, CURRENT_OPTS);
    },
    reset() {
      clearAllTimers();
      if (!LOG_EL) return;
      LOG_EL.replaceChildren(renderEmpty());
      if (INPUT_EL) INPUT_EL.value = '';
    }
  };

  window.INDTAXONBOT_TERMINAL = api;
})();
