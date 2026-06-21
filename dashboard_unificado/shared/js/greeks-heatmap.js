/**
 * greeks-heatmap.js - Heatmap de Greeks Exposure (D: heatmap coringa)
 *
 * Visualizacao CSS-based (sem dependencias extra) de uma matriz
 *   rows = tipos de greeks (Gamma, Delta, Vanna, Charm, Vex)
 *   cols = strikes
 *   cell color = magnitude do valor normalizado
 *
 * Suporta 3 vistas:
 *   - exposure: valores brutos (cada greek isolado)
 *   - cumulative: soma cumulativa ate cada strike
 *   - sign: binario + (verde) / - (vermelho) / 0 (cinza)
 *
 * Auto-inject CSS, failsafe, API publica em window.EDI.greeksHeatmap.
 */
(function () {
    'use strict';

    if (typeof window === 'undefined') return;

    // CSS auto-inject
    function _injectCSS() {
        if (document.getElementById('edi-greeks-heatmap-css')) return;
        const link = document.createElement('link');
        link.id = 'edi-greeks-heatmap-css';
        link.rel = 'stylesheet';
        link.href = '../shared/css/greeks-heatmap.css';
        document.head.appendChild(link);
    }

    // Config: greek key, label, accessor, signed (true=diverging, false=sequential)
    const GREEKS = [
        { key: 'gamma_exposure', label: 'Γ Exp',   source: 'gamma_data',  field: 'gamma_exposure', signed: true  },
        { key: 'delta',          label: 'Δ',       source: 'delta_data',  field: 'delta_values',   signed: true  },
        { key: 'vanna',          label: 'Vanna',   source: 'greeks_2nd_order', field: 'vanna',     signed: true  },
        { key: 'charm',          label: 'Charm',   source: 'greeks_2nd_order', field: 'charm',     signed: true  },
        { key: 'vex',            label: 'Vex',     source: 'greeks_2nd_order', field: 'vex',       signed: true  },
    ];

    // ----- Data -----
    function _getData() {
        const m = window.marketData;
        if (!m) return null;

        // Strikes vem de qualquer um dos data sources
        const strikes = (m.gamma_data && m.gamma_data.strikes) ||
                        (m.delta_data && m.delta_data.strikes) ||
                        (m.oi_data && m.oi_data.strikes) ||
                        null;
        if (!strikes || !strikes.length) return null;

        // Para cada greek, extrair valores
        const rows = GREEKS.map(g => {
            const src = m[g.source];
            if (!src || !src[g.field]) return null;
            return {
                key: g.key,
                label: g.label,
                signed: g.signed,
                values: src[g.field].slice(),
            };
        }).filter(Boolean);

        if (!rows.length) return null;

        return { strikes, rows, spot: m.spot_price || null };
    }

    function _cumulative(arr) {
        const out = new Array(arr.length);
        let sum = 0;
        for (let i = 0; i < arr.length; i++) {
            sum += Number(arr[i]) || 0;
            out[i] = sum;
        }
        return out;
    }

    // ----- Color mapping -----
    // Diverging: azul (negativo) -> branco (0) -> vermelho (positivo)
    // Normaliza por |max| para simetria em torno de 0
    function _colorDiverging(v, maxAbs) {
        if (!isFinite(v) || v === 0) return 'hsl(0, 0%, 22%)';
        if (maxAbs <= 0) return 'hsl(0, 0%, 22%)';
        const t = Math.max(-1, Math.min(1, v / maxAbs));  // [-1, 1]
        // Mapear para hue: negativo = azul (210), positivo = vermelho (0)
        // t=0 -> cinza, t=±1 -> saturado
        const intensity = Math.abs(t);
        if (t < 0) {
            // Azul: hue 210, sat 70%
            const light = 50 - 35 * intensity;  // 50% (fraco) -> 15% (forte)
            return `hsl(210, 70%, ${light}%)`;
        } else {
            // Vermelho: hue 0, sat 70%
            const light = 50 - 35 * intensity;
            return `hsl(0, 70%, ${light}%)`;
        }
    }

    function _colorSign(v) {
        if (v > 0) return 'hsl(140, 60%, 35%)';   // verde
        if (v < 0) return 'hsl(0, 70%, 40%)';     // vermelho
        return 'hsl(0, 0%, 22%)';                // cinza
    }

    function _colorFor(v, mode, maxAbs) {
        if (mode === 'sign') return _colorSign(v);
        return _colorDiverging(v, maxAbs);
    }

    // ----- Format -----
    function _fmt(v) {
        if (v == null || !isFinite(v)) return '';
        const abs = Math.abs(v);
        if (abs >= 1e6) return (v / 1e6).toFixed(2) + 'M';
        if (abs >= 1e3) return (v / 1e3).toFixed(1) + 'k';
        if (abs >= 100) return v.toFixed(0);
        if (abs >= 1) return v.toFixed(1);
        return v.toFixed(2);
    }

    function _isSpotCol(strike, spot) {
        if (!spot) return false;
        // Considerar spot "nesta coluna" se for o strike mais proximo
        return Math.abs(strike - spot) < 25;  // tolerancia 25 pontos
    }

    // ----- Render -----
    function _render(container, data, mode) {
        if (!data) {
            container.innerHTML = '<div class="gh-empty">Sem dados de greeks (marketData indisponivel)</div>';
            return;
        }
        const { strikes, rows, spot } = data;

        // Computar maxAbs por linha (para normalizacao por linha)
        const rowMax = rows.map(r => {
            const arr = mode === 'cumulative' ? _cumulative(r.values) : r.values;
            let m = 0;
            for (const v of arr) {
                if (isFinite(v) && Math.abs(v) > m) m = Math.abs(v);
            }
            return m;
        });

        // Header row (strikes)
        let html = '<table class="gh-table"><thead><tr>';
        html += '<th class="gh-corner">Greek ↓ / Strike →</th>';
        for (const s of strikes) {
            const cls = _isSpotCol(s, spot) ? 'gh-strike-col gh-spot-col' : 'gh-strike-col';
            html += `<th class="${cls}" title="strike ${s}">${s}</th>`;
        }
        html += '</tr></thead><tbody>';

        // Body rows
        for (let i = 0; i < rows.length; i++) {
            const r = rows[i];
            const arr = mode === 'cumulative' ? _cumulative(r.values) : r.values;
            html += `<tr><th class="gh-row-label" title="${r.key}">${r.label}</th>`;
            for (let j = 0; j < strikes.length; j++) {
                const v = arr[j];
                const color = _colorFor(v, mode, rowMax[i]);
                const text = mode === 'sign' ? (v > 0 ? '+' : v < 0 ? '−' : '') : _fmt(v);
                const cls = _isSpotCol(strikes[j], spot) ? 'gh-cell gh-spot-col' : 'gh-cell';
                html += `<td class="${cls}" style="background:${color}" title="${r.label} @ ${strikes[j]}: ${isFinite(v) ? v.toFixed(4) : 'n/d'}">${text}</td>`;
            }
            html += '</tr>';
        }
        html += '</tbody></table>';

        // Toolbar (mode toggle + meta)
        const meta = `Strikes: ${strikes.length} | Spot: ${spot ? spot.toFixed(2) : 'n/d'} | Modo: ${mode}`;
        html = `<div class="gh-toolbar"><div class="gh-modes">` +
            ['exposure', 'cumulative', 'sign'].map(m =>
                `<button class="gh-mode-btn ${m === mode ? 'active' : ''}" data-gh-mode="${m}">${m}</button>`
            ).join('') +
            `</div><div class="gh-meta">${meta}</div></div>` + html;

        container.innerHTML = html;
    }

    // ----- Mount -----
    function _mount() {
        // Container: ou #greeks-heatmap-container (no dashboard) ou fallback para body
        let root = document.getElementById('greeks-heatmap-container');
        if (!root) {
            // Auto-create: append ao final do main se nao houver container dedicado
            root = document.createElement('div');
            root.id = 'greeks-heatmap-container';
            root.className = 'gh-wrapper';
            const main = document.querySelector('main.main .container') || document.body;
            main.appendChild(root);
        }

        const data = _getData();
        let mode = 'exposure';
        _render(root, data, mode);

        // Event delegation: mode toggle
        root.addEventListener('click', function (e) {
            const t = e.target;
            if (t.matches('[data-gh-mode]')) {
                const newMode = t.getAttribute('data-gh-mode');
                if (newMode === mode) return;
                mode = newMode;
                _render(root, _getData(), mode);
            }
        });
    }

    function _init() {
        try {
            _injectCSS();
            // marketData pode nao estar disponivel ainda (data scripts carregam depois)
            // Tenta imediato + retry em 200ms
            if (window.marketData) {
                _mount();
            } else {
                setTimeout(_init, 200);
            }
        } catch (err) {
            if (window.console && console.warn) console.warn('[EDI greeks-heatmap] init failed:', err);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', _init);
    } else {
        _init();
    }

    // API publica
    window.EDI = window.EDI || {};
    window.EDI.greeksHeatmap = {
        reload: _mount,
        setMode: function (mode) {
            const root = document.getElementById('greeks-heatmap-container');
            if (root) _render(root, _getData(), mode);
        },
    };
})();
