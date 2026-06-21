/**
 * daytrade-tools.js - E80: Day-Trade Features (P&L Ticker + Alerts)
 *
 * Modulo compartilhado entre dashboards WDO/WIN/HUB que adiciona:
 *   1. P&L Ticker: widget fixo com posicoes do usuario, computa P&L
 *      em tempo real baseado no spot de window.marketData.
 *   2. Alerts Panel: monitor de thresholds (spot, regime) com
 *      configuracao via localStorage.
 *
 * Dependencias:
 *   - window.marketData (fornecido por cada dashboard via market_data.js)
 *   - localStorage (config de posicoes e thresholds)
 *
 * API publica:
 *   - EDI.daytrade = { ticker, alerts, openTicker, openAlerts }
 *
 * Auto-init quando DOM esta pronto. Erros sao silenciados (modulo
 * e utilitario, nao pode quebrar o dashboard).
 */
(function () {
    'use strict';

    // Guard: se nao ha marketData, nao inicializa (dashboard sem dados)
    if (typeof window === 'undefined') return;

    const STORAGE_POSITIONS = 'edi_daytrade_positions_v1';
    const STORAGE_ALERTS = 'edi_daytrade_alerts_v1';

    // Defaults
    const DEFAULT_ALERTS = {
        spot_above: null,   // ex: 5200 (alertar se spot > 5200)
        spot_below: null,   // ex: 5100 (alertar se spot < 5100)
        enabled: false,
    };

    // ----- Storage helpers -----
    function _loadPositions() {
        try {
            const raw = localStorage.getItem(STORAGE_POSITIONS);
            if (!raw) return [];
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            return [];
        }
    }
    function _savePositions(positions) {
        try {
            localStorage.setItem(STORAGE_POSITIONS, JSON.stringify(positions));
        } catch (e) { /* storage disabled */ }
    }
    function _loadAlerts() {
        try {
            const raw = localStorage.getItem(STORAGE_ALERTS);
            if (!raw) return Object.assign({}, DEFAULT_ALERTS);
            const parsed = JSON.parse(raw);
            return Object.assign({}, DEFAULT_ALERTS, parsed);
        } catch (e) {
            return Object.assign({}, DEFAULT_ALERTS);
        }
    }
    function _saveAlerts(cfg) {
        try {
            localStorage.setItem(STORAGE_ALERTS, JSON.stringify(cfg));
        } catch (e) { /* storage disabled */ }
    }

    // ----- Format helpers -----
    function _fmtBRL(v) {
        if (v == null || isNaN(v)) return 'R$ 0,00';
        const sign = v < 0 ? '-' : '';
        const abs = Math.abs(v);
        return sign + 'R$ ' + abs.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    function _fmtPct(v) {
        if (v == null || isNaN(v)) return '0,00%';
        return v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%';
    }

    // ----- Spot helper (tolerante a varios formatos) -----
    function _getSpot() {
        const m = window.marketData;
        if (!m) return null;
        const candidates = [
            m.spot_price,
            m.overview && m.overview.spot_price,
            m.overview_baseline && m.overview_baseline.spot_price,
        ];
        for (const c of candidates) {
            const n = Number(c);
            if (Number.isFinite(n) && n > 0) return n;
        }
        return null;
    }

    // ----- Ticker widget -----
    function _computePnL(positions, spot) {
        let total = 0;
        for (const pos of positions) {
            const qty = Number(pos.qty) || 0;
            const entry = Number(pos.entry) || 0;
            const dir = pos.side === 'short' ? -1 : 1;
            if (spot > 0 && entry > 0) {
                total += dir * qty * (spot - entry);
            }
        }
        return total;
    }

    function _renderTicker(container, positions, spot) {
        const pnl = _computePnL(positions, spot);
        const cls = pnl > 0 ? 'pnl-pos' : (pnl < 0 ? 'pnl-neg' : 'pnl-zero');
        const positionsList = positions.map((p, i) => {
            const dir = p.side === 'short' ? 'S' : 'C';
            const qty = Number(p.qty) || 0;
            const entry = Number(p.entry) || 0;
            const pnlPos = (p.side === 'short' ? -1 : 1) * qty * (spot - entry);
            return '<div class="dt-row" data-idx="' + i + '">' +
                '<span class="dt-side dt-side-' + dir.toLowerCase() + '">' + dir + '</span>' +
                '<span class="dt-qty">' + qty + '</span>' +
                '<span class="dt-entry">@' + entry + '</span>' +
                '<span class="dt-pnl ' + (pnlPos >= 0 ? 'pnl-pos' : 'pnl-neg') + '">' + _fmtBRL(pnlPos) + '</span>' +
                '<button class="dt-rm" data-rm="' + i + '" title="Remover">x</button>' +
                '</div>';
        }).join('');

        container.innerHTML =
            '<div class="dt-ticker-header">' +
            '<span class="dt-title">P&amp;L Day-Trade</span>' +
            '<span class="dt-spot">spot: ' + (spot != null ? spot.toFixed(2) : 'n/d') + '</span>' +
            '<button class="dt-toggle" data-toggle-ticker title="Minimizar">_</button>' +
            '</div>' +
            '<div class="dt-ticker-body">' +
            '<div class="dt-positions">' + (positionsList || '<div class="dt-empty">sem posicoes</div>') + '</div>' +
            '<div class="dt-total ' + cls + '">' + _fmtBRL(pnl) + '</div>' +
            '<div class="dt-add-form">' +
            '<select class="dt-side-sel"><option value="long">C</option><option value="short">S</option></select>' +
            '<input class="dt-qty-in" type="number" step="1" placeholder="qty" />' +
            '<input class="dt-entry-in" type="number" step="0.5" placeholder="entry" />' +
            '<button class="dt-add-btn">+ Add</button>' +
            '</div>' +
            '</div>';
    }

    // ----- Alerts widget -----
    function _checkAlerts(cfg, spot) {
        const triggered = [];
        if (!cfg.enabled || spot == null) return triggered;
        if (cfg.spot_above != null && spot > cfg.spot_above) {
            triggered.push({ kind: 'spot_above', value: cfg.spot_above, spot: spot });
        }
        if (cfg.spot_below != null && spot < cfg.spot_below) {
            triggered.push({ kind: 'spot_below', value: cfg.spot_below, spot: spot });
        }
        return triggered;
    }

    function _renderAlerts(container, cfg, triggered) {
        const triggeredHtml = triggered.map(t => {
            const arrow = t.kind === 'spot_above' ? '>' : '<';
            return '<div class="dt-alert-active">spot ' + arrow + ' ' + t.value + ' (atual: ' + t.spot.toFixed(2) + ')</div>';
        }).join('') || '<div class="dt-alert-empty">sem alertas ativos</div>';

        container.innerHTML =
            '<div class="dt-alerts-header">' +
            '<span class="dt-title">Alertas</span>' +
            '<label class="dt-enabled"><input type="checkbox" class="dt-cfg-enabled" ' + (cfg.enabled ? 'checked' : '') + ' /> ativo</label>' +
            '<button class="dt-toggle" data-toggle-alerts title="Minimizar">_</button>' +
            '</div>' +
            '<div class="dt-alerts-body">' +
            '<div class="dt-alerts-active">' + triggeredHtml + '</div>' +
            '<div class="dt-alerts-form">' +
            '<label>spot &gt; <input type="number" step="0.5" class="dt-cfg-above" value="' + (cfg.spot_above || '') + '" /></label>' +
            '<label>spot &lt; <input type="number" step="0.5" class="dt-cfg-below" value="' + (cfg.spot_below || '') + '" /></label>' +
            '<button class="dt-cfg-save">Salvar</button>' +
            '</div>' +
            '</div>';
    }

    // ----- Mount -----
    function _mount() {
        // Container fixo (canto inferior direito)
        let root = document.getElementById('edi-daytrade-root');
        if (!root) {
            root = document.createElement('div');
            root.id = 'edi-daytrade-root';
            root.className = 'edi-daytrade-root';
            document.body.appendChild(root);
        }
        root.innerHTML =
            '<div id="edi-dt-ticker" class="edi-dt-panel edi-dt-ticker"></div>' +
            '<div id="edi-dt-alerts" class="edi-dt-panel edi-dt-alerts"></div>';

        // Carregar config
        let positions = _loadPositions();
        let alertsCfg = _loadAlerts();

        // Render inicial
        const tickerEl = document.getElementById('edi-dt-ticker');
        const alertsEl = document.getElementById('edi-dt-alerts');
        const spot = _getSpot();
        const triggered = _checkAlerts(alertsCfg, spot);
        _renderTicker(tickerEl, positions, spot);
        _renderAlerts(alertsEl, alertsCfg, triggered);

        // Event delegation: ticker
        tickerEl.addEventListener('click', function (e) {
            const t = e.target;
            if (t.matches('[data-toggle-ticker]')) {
                tickerEl.classList.toggle('minimized');
                return;
            }
            if (t.matches('[data-rm]')) {
                const idx = Number(t.getAttribute('data-rm'));
                positions.splice(idx, 1);
                _savePositions(positions);
                _renderTicker(tickerEl, positions, _getSpot());
                return;
            }
            if (t.matches('.dt-add-btn')) {
                const side = tickerEl.querySelector('.dt-side-sel').value;
                const qty = Number(tickerEl.querySelector('.dt-qty-in').value);
                const entry = Number(tickerEl.querySelector('.dt-entry-in').value);
                if (!Number.isFinite(qty) || qty <= 0 || !Number.isFinite(entry) || entry <= 0) return;
                positions.push({ side: side, qty: qty, entry: entry });
                _savePositions(positions);
                _renderTicker(tickerEl, positions, _getSpot());
                return;
            }
        });

        // Event delegation: alerts
        alertsEl.addEventListener('click', function (e) {
            const t = e.target;
            if (t.matches('[data-toggle-alerts]')) {
                alertsEl.classList.toggle('minimized');
                return;
            }
            if (t.matches('.dt-cfg-save')) {
                const above = tickerEl.ownerDocument.querySelector('.dt-cfg-above');
                const below = tickerEl.ownerDocument.querySelector('.dt-cfg-below');
                const enabled = tickerEl.ownerDocument.querySelector('.dt-cfg-enabled');
                alertsCfg.spot_above = above.value ? Number(above.value) : null;
                alertsCfg.spot_below = below.value ? Number(below.value) : null;
                alertsCfg.enabled = !!enabled.checked;
                _saveAlerts(alertsCfg);
                _renderAlerts(alertsEl, alertsCfg, _checkAlerts(alertsCfg, _getSpot()));
                return;
            }
        });
    }

    // ----- CSS auto-inject (self-contained) -----
    function _injectCSS() {
        if (document.getElementById('edi-daytrade-css')) return;
        const link = document.createElement('link');
        link.id = 'edi-daytrade-css';
        link.rel = 'stylesheet';
        link.href = '../shared/css/daytrade-tools.css';
        // Fallback: se ../shared/ nao resolver (alguns dashboards), tenta caminho relativo
        document.head.appendChild(link);
    }

    // ----- Auto-init -----
    function _init() {
        try {
            _injectCSS();
            _mount();
        } catch (err) {
            // Silencioso: modulo utilitario nao pode quebrar dashboard
            if (window.console && console.warn) console.warn('[EDI daytrade] init failed:', err);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', _init);
    } else {
        _init();
    }

    // API publica
    window.EDI = window.EDI || {};
    window.EDI.daytrade = {
        reload: _init,
        getSpot: _getSpot,
        loadPositions: _loadPositions,
        loadAlerts: _loadAlerts,
    };
})();
