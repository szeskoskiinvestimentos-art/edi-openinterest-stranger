/**
 * split-view.js - E26: Split-view side-by-side WDO/WIN com diff visual.
 *
 * Compara dois ativos (WDO vs WIN) em tempo real com:
 * - Layout side-by-side 50/50 (responsivo)
 * - Métricas sincronizadas: spot, IV, gamma, delta, charm
 * - 3 modos de visualizacao:
 *   - parallel: ambos mostrados independentemente
 *   - diff: destaca divergencias (WDO - WIN) com cores
 *   - overlay: superpõe os dois com opacidade
 *
 * Auto-inject CSS, failsafe, API publica em window.EDI.splitView.
 *
 * Uso:
 *   window.EDI.splitView.init({
 *       leftData: window.marketData,    // WDO
 *       rightData: window.marketDataWIN // WIN
 *   });
 *   window.EDI.splitView.setMode('diff');
 */
(function () {
    'use strict';

    if (typeof window === 'undefined') return;
    if (window.EDI && window.EDI.splitView) return;

    // ============================================================
    // CSS (auto-injetado)
    // ============================================================

    const CSS_ID = 'edi-split-view-styles';
    const CSS_CONTENT = `
        .edi-split-view-container {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
            padding: 1rem;
            background: rgba(10, 10, 20, 0.6);
            border: 1px solid #00ff88;
            border-radius: 8px;
            margin: 1rem 0;
        }
        .edi-split-view-container.edi-mode-diff {
            background: rgba(20, 0, 30, 0.6);
            border-color: #ff66cc;
        }
        .edi-split-view-container.edi-mode-overlay {
            grid-template-columns: 1fr;
        }
        .edi-split-pane {
            background: rgba(0, 20, 10, 0.4);
            border: 1px solid rgba(0, 255, 136, 0.3);
            border-radius: 6px;
            padding: 1rem;
        }
        .edi-split-pane.edi-diff-positive {
            border-color: #00ff88;
            box-shadow: 0 0 8px rgba(0, 255, 136, 0.3);
        }
        .edi-split-pane.edi-diff-negative {
            border-color: #ff4444;
            box-shadow: 0 0 8px rgba(255, 68, 68, 0.3);
        }
        .edi-split-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.75rem;
            font-family: 'Orbitron', sans-serif;
        }
        .edi-split-title {
            font-size: 1.1rem;
            font-weight: 700;
            color: #00ff88;
        }
        .edi-split-mode-overlay .edi-split-title.edi-pane-left {
            color: rgba(0, 255, 136, 0.5);
        }
        .edi-split-mode-overlay .edi-split-title.edi-pane-right {
            color: rgba(255, 102, 204, 0.5);
        }
        .edi-split-spot {
            font-size: 1.5rem;
            font-weight: 900;
            color: #fff;
            font-family: 'Share Tech Mono', monospace;
        }
        .edi-split-metrics {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.5rem;
        }
        .edi-split-metric {
            background: rgba(0, 0, 0, 0.3);
            border-left: 3px solid #00ff88;
            padding: 0.5rem 0.75rem;
            border-radius: 4px;
        }
        .edi-split-metric-label {
            font-size: 0.7rem;
            color: #888;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        .edi-split-metric-value {
            font-size: 1rem;
            color: #00ff88;
            font-family: 'Share Tech Mono', monospace;
            font-weight: 700;
        }
        .edi-split-metric-diff {
            color: #ff66cc;
            font-size: 0.85rem;
            margin-left: 0.5rem;
        }
        .edi-split-metric-diff.edi-pos {
            color: #00ff88;
        }
        .edi-split-metric-diff.edi-neg {
            color: #ff4444;
        }
        .edi-split-toolbar {
            display: flex;
            gap: 0.5rem;
            margin-bottom: 1rem;
            padding: 0.5rem;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 4px;
        }
        .edi-split-btn {
            background: rgba(0, 255, 136, 0.1);
            border: 1px solid #00ff88;
            color: #00ff88;
            padding: 0.4rem 0.8rem;
            border-radius: 4px;
            font-family: 'Share Tech Mono', monospace;
            font-size: 0.85rem;
            cursor: pointer;
            transition: all 0.2s;
        }
        .edi-split-btn:hover {
            background: rgba(0, 255, 136, 0.3);
        }
        .edi-split-btn.edi-active {
            background: #00ff88;
            color: #000;
        }
        .edi-split-summary {
            margin-top: 1rem;
            padding: 0.75rem;
            background: rgba(0, 255, 136, 0.05);
            border-left: 4px solid #00ff88;
            border-radius: 4px;
            font-size: 0.85rem;
            color: #ccc;
        }
        .edi-split-summary.edi-pos {
            border-left-color: #00ff88;
        }
        .edi-split-summary.edi-neg {
            border-left-color: #ff4444;
        }
        @media (max-width: 768px) {
            .edi-split-view-container {
                grid-template-columns: 1fr;
            }
        }
    `;

    function injectCSS() {
        if (document.getElementById(CSS_ID)) return;
        const style = document.createElement('style');
        style.id = CSS_ID;
        style.textContent = CSS_CONTENT;
        document.head.appendChild(style);
    }

    // ============================================================
    // Data extraction
    // ============================================================

    function getSpot(data) {
        return data && data.spot_price ? data.spot_price :
               data && data.underlying_price ? data.underlying_price : null;
    }

    function getIV(data) {
        if (!data) return null;
        if (data.iv_atm) return data.iv_atm;
        if (data.iv && data.iv.atm_iv) return data.iv.atm_iv;
        if (data.implied_volatility) return data.implied_volatility;
        return null;
    }

    function getGamma(data) {
        if (!data || !data.gamma_data) return null;
        const g = data.gamma_data;
        if (g.total_gamma !== undefined) return g.total_gamma;
        if (g.gamma_exposure && g.gamma_exposure.length) {
            return g.gamma_exposure.reduce((a, b) => a + b, 0);
        }
        return null;
    }

    function getDelta(data) {
        if (!data || !data.delta_data) return null;
        const d = data.delta_data;
        if (d.total_delta !== undefined) return d.total_delta;
        if (d.delta_values && d.delta_values.length) {
            return d.delta_values.reduce((a, b) => a + b, 0);
        }
        return null;
    }

    function getCharm(data) {
        if (!data || !data.greeks_2nd_order) return null;
        const c = data.greeks_2nd_order.charm;
        if (c && c.length) return c.reduce((a, b) => a + b, 0);
        return null;
    }

    function getVanna(data) {
        if (!data || !data.greeks_2nd_order) return null;
        const v = data.greeks_2nd_order.vanna;
        if (v && v.length) return v.reduce((a, b) => a + b, 0);
        return null;
    }

    function getStrikes(data) {
        if (!data) return [];
        if (data.strikes && data.strikes.length) return data.strikes;
        if (data.gamma_data && data.gamma_data.strikes) return data.gamma_data.strikes;
        return [];
    }

    // ============================================================
    // Formatting
    // ============================================================

    function fmt(value, decimals = 2) {
        if (value === null || value === undefined) return '—';
        if (typeof value === 'number') {
            const abs = Math.abs(value);
            if (abs >= 1e9) return (value / 1e9).toFixed(decimals) + 'B';
            if (abs >= 1e6) return (value / 1e6).toFixed(decimals) + 'M';
            // Spot price: mostrar 0-2 casas decimais sem sufixo K
            // para preservar precisao (WDO = 5171.5 nao "5K")
            if (abs >= 1e3 && abs < 1e4) {
                return value.toFixed(decimals);
            }
            if (abs >= 1e4) return (value / 1e3).toFixed(decimals) + 'K';
            return value.toFixed(decimals);
        }
        return String(value);
    }

    function fmtDiff(left, right, decimals = 2) {
        if (left === null || right === null) return '—';
        const diff = left - right;
        if (Math.abs(diff) < 1e-6) return '±0';
        const sign = diff > 0 ? '+' : '';
        const cls = diff > 0 ? 'edi-pos' : 'edi-neg';
        return `<span class="edi-split-metric-diff ${cls}">${sign}${fmt(diff, decimals)}</span>`;
    }

    // ============================================================
    // Render
    // ============================================================

    function buildPane(side, label, data, mode) {
        const spot = getSpot(data);
        const iv = getIV(data);
        const gamma = getGamma(data);
        const delta = getDelta(data);
        const charm = getCharm(data);
        const vanna = getVanna(data);
        const nStrikes = getStrikes(data).length;

        let diffClass = '';
        if (mode === 'diff' && window._edi_split_state) {
            const other = side === 'left' ?
                window._edi_split_state.rightData : window._edi_split_state.leftData;
            const otherSpot = getSpot(other);
            if (spot !== null && otherSpot !== null) {
                if (spot > otherSpot) diffClass = 'edi-diff-positive';
                else if (spot < otherSpot) diffClass = 'edi-diff-negative';
            }
        }

        return `
            <div class="edi-split-pane edi-pane-${side} ${diffClass}">
                <div class="edi-split-header">
                    <span class="edi-split-title edi-pane-${side}">${label}</span>
                    <span class="edi-split-spot">${fmt(spot, 0)}</span>
                </div>
                <div class="edi-split-metrics">
                    <div class="edi-split-metric">
                        <div class="edi-split-metric-label">IV ATM (%)</div>
                        <div class="edi-split-metric-value">${fmt(iv !== null ? iv * 100 : null, 2)}%</div>
                    </div>
                    <div class="edi-split-metric">
                        <div class="edi-split-metric-label">Gamma Exp</div>
                        <div class="edi-split-metric-value">${fmt(gamma)}</div>
                    </div>
                    <div class="edi-split-metric">
                        <div class="edi-split-metric-label">Delta Exp</div>
                        <div class="edi-split-metric-value">${fmt(delta)}</div>
                    </div>
                    <div class="edi-split-metric">
                        <div class="edi-split-metric-label">Vanna</div>
                        <div class="edi-split-metric-value">${fmt(vanna)}</div>
                    </div>
                    <div class="edi-split-metric">
                        <div class="edi-split-metric-label">Charm</div>
                        <div class="edi-split-metric-value">${fmt(charm)}</div>
                    </div>
                    <div class="edi-split-metric">
                        <div class="edi-split-metric-label">Strikes</div>
                        <div class="edi-split-metric-value">${nStrikes}</div>
                    </div>
                </div>
            </div>
        `;
    }

    function buildSummary(leftData, rightData) {
        const lSpot = getSpot(leftData);
        const rSpot = getSpot(rightData);
        const lIV = getIV(leftData);
        const rIV = getIV(rightData);
        const lGamma = getGamma(leftData);
        const rGamma = getGamma(rightData);

        if (lSpot === null || rSpot === null) return '';

        const spotDiff = lSpot - rSpot;
        const ivDiff = lIV !== null && rIV !== null ? (lIV - rIV) * 100 : null;
        const gammaDiff = lGamma !== null && rGamma !== null ? lGamma - rGamma : null;

        const ratio = (lSpot / rSpot * 100).toFixed(1);
        const cls = spotDiff > 0 ? 'edi-pos' : 'edi-neg';

        return `
            <div class="edi-split-summary ${cls}">
                <strong>WDO/WIN Ratio:</strong> ${ratio}%
                | Spot Δ: ${spotDiff > 0 ? '+' : ''}${fmt(spotDiff, 0)}
                ${ivDiff !== null ? `| IV Δ: ${ivDiff > 0 ? '+' : ''}${ivDiff.toFixed(2)}%` : ''}
                ${gammaDiff !== null ? `| Γ Δ: ${gammaDiff > 0 ? '+' : ''}${fmt(gammaDiff)}` : ''}
            </div>
        `;
    }

    function render(container, leftData, rightData, leftLabel, rightLabel, mode) {
        const leftPane = buildPane('left', leftLabel, leftData, mode);
        const rightPane = buildPane('right', rightLabel, rightData, mode);
        const summary = (mode === 'diff') ? buildSummary(leftData, rightData) : '';

        container.className = `edi-split-view-container edi-mode-${mode}`;
        container.innerHTML = leftPane + rightPane + summary;
    }

    // ============================================================
    // State & API
    // ============================================================

    const state = {
        container: null,
        leftData: null,
        rightData: null,
        leftLabel: 'WDO',
        rightLabel: 'WIN',
        mode: 'parallel'  // 'parallel' | 'diff' | 'overlay'
    };

    window._edi_split_state = state;  // para acesso entre funcoes

    function update() {
        if (!state.container) return;
        render(
            state.container,
            state.leftData,
            state.rightData,
            state.leftLabel,
            state.rightLabel,
            state.mode
        );
    }

    const api = {
        init(opts) {
            injectCSS();
            if (opts.containerId) {
                state.container = document.getElementById(opts.containerId);
            } else if (opts.container) {
                state.container = opts.container;
            } else {
                // Cria container default
                const div = document.createElement('div');
                div.id = 'edi-split-view-auto';
                state.container = div;
                document.body.appendChild(div);
            }

            state.leftData = opts.leftData || window.marketData || null;
            state.rightData = opts.rightData || window.marketDataWIN || window.marketData || null;
            state.leftLabel = opts.leftLabel || 'WDO';
            state.rightLabel = opts.rightLabel || 'WIN';

            // Toolbar de modos
            const toolbar = document.createElement('div');
            toolbar.className = 'edi-split-toolbar';
            toolbar.innerHTML = `
                <button class="edi-split-btn edi-active" data-mode="parallel">PARALLEL</button>
                <button class="edi-split-btn" data-mode="diff">DIFF</button>
                <button class="edi-split-btn" data-mode="overlay">OVERLAY</button>
            `;
            state.container.parentNode.insertBefore(toolbar, state.container);

            toolbar.addEventListener('click', (e) => {
                if (e.target.classList.contains('edi-split-btn')) {
                    toolbar.querySelectorAll('.edi-split-btn').forEach(b =>
                        b.classList.remove('edi-active'));
                    e.target.classList.add('edi-active');
                    state.mode = e.target.dataset.mode;
                    update();
                }
            });

            update();
            console.log('[EDI] Split-view inicializado:', {
                mode: state.mode,
                left: state.leftLabel,
                right: state.rightLabel
            });
        },

        setMode(mode) {
            if (['parallel', 'diff', 'overlay'].indexOf(mode) === -1) {
                console.warn('[EDI] splitView.setMode: modo invalido', mode);
                return;
            }
            state.mode = mode;
            const toolbar = document.querySelector('.edi-split-toolbar');
            if (toolbar) {
                toolbar.querySelectorAll('.edi-split-btn').forEach(b => {
                    b.classList.toggle('edi-active', b.dataset.mode === mode);
                });
            }
            update();
        },

        getMode() { return state.mode; },

        setData(leftData, rightData) {
            state.leftData = leftData;
            state.rightData = rightData;
            update();
        },

        refresh() { update(); }
    };

    window.EDI = window.EDI || {};
    window.EDI.splitView = api;
})();