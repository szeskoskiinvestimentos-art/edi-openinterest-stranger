(() => {
    const w = typeof window !== 'undefined' ? window : null;
    if (!w) return;

    const mb = (w.MercadoBlocks && typeof w.MercadoBlocks === 'object') ? w.MercadoBlocks : {};
    w.MercadoBlocks = mb;

    const coreKit = () => (w.MercadoBlocks && w.MercadoBlocks.coreKit) ? w.MercadoBlocks.coreKit : null;
    const tableKit = () => (w.MercadoBlocks && w.MercadoBlocks.tableKit) ? w.MercadoBlocks.tableKit : null;
    const mainActionsMod = () => (w.MercadoBlocks && w.MercadoBlocks.mainActions) ? w.MercadoBlocks.mainActions : null;
    const statusUi = () => (w.MercadoBlocks && w.MercadoBlocks.statusUi) ? w.MercadoBlocks.statusUi : null;

    const escapeHtml = (value) => {
        const core = coreKit();
        if (core && typeof core.escapeHtml === 'function') return core.escapeHtml(value);
        return String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    };

    const fallbackCard = (title, message) => {
        const core = coreKit();
        if (core && typeof core.fallbackCard === 'function') return core.fallbackCard(title, message);
        const t = escapeHtml(title || 'Indisponível');
        const m = escapeHtml(message || 'Falha ao renderizar.');
        return `<div style="padding:12px;border:1px solid rgba(255,255,255,.12);border-radius:14px;background:rgba(0,0,0,.18);">
            <div style="font-weight:900;letter-spacing:1px;opacity:.95;">${t}</div>
            <div style="margin-top:8px;opacity:.88;line-height:1.35;">${m}</div>
        </div>`;
    };

    const operationalInputs = {
        optionsGamma: (() => { try { return w.OPTIONS_GAMMA_SUMMARY_DATA || null; } catch { return null; } })(),
        webNews: (() => { try { return w.WEB_NEWS_MODULE_DATA || null; } catch { return null; } })(),
        foreignFlow: (() => { try { return w.FOREIGN_FLOW_DATA || null; } catch { return null; } })(),
        focusSummary: null,
        zqCurve: (() => { try { return w.ZQ_CURVE_DATA || null; } catch { return null; } })(),
        macro: null,
    };

    const operationalTuning = (() => {
        try {
            const raw = localStorage.getItem('mercado_operational_tuning_v1');
            const obj = raw ? JSON.parse(raw) : null;
            if (obj && typeof obj === 'object') return obj;
        } catch {
        }
        return { thresholds: { wdoWin: 0.25, neutral: 0.10 } };
    })();

    let agendaAutoCache = null;
    const resetAgendaAutoCache = () => { agendaAutoCache = null; };
    const fetchAgendaAuto = () => {
        try {
            const items = w.ECONOMIC_CALENDAR_DATA && Array.isArray(w.ECONOMIC_CALENDAR_DATA.items) ? w.ECONOMIC_CALENDAR_DATA.items : [];
            agendaAutoCache = items.slice(0, 240);
        } catch {
            agendaAutoCache = [];
        }
    };
    const getAgendaAutoCache = () => agendaAutoCache;
    const isAgendaAutoLoading = () => agendaAutoCache === null;

    const agendaLoadPrefs = () => {
        try {
            const raw = localStorage.getItem('mercado_agenda_matrix_prefs_v1');
            const obj = raw ? JSON.parse(raw) : null;
            if (obj && typeof obj === 'object') return obj;
        } catch {
        }
        return { view: 'agenda', filter: 'TODOS', impact: 'ALTO+MÉDIO' };
    };
    const agendaSavePrefs = (patch) => {
        const prev = agendaLoadPrefs();
        const next = { ...(prev && typeof prev === 'object' ? prev : {}), ...(patch && typeof patch === 'object' ? patch : {}) };
        try { localStorage.setItem('mercado_agenda_matrix_prefs_v1', JSON.stringify(next)); } catch { }
        return next;
    };

    const agendaCountryFromCurrency = (currency) => {
        const cur = String(currency || '').trim().toUpperCase();
        if (cur === 'BRL') return 'BR';
        if (cur === 'USD') return 'EUA';
        if (cur === 'CNY' || cur === 'CNH' || cur === 'HKD') return 'CHINA/HK';
        return 'OUTRO';
    };
    const agendaCountryLabel = (country) => {
        const c = String(country || '').trim().toUpperCase();
        if (c === 'BR' || c === 'BRASIL') return 'BR';
        if (c === 'EUA' || c === 'US' || c === 'USA' || c === 'UNITED STATES') return 'EUA';
        if (c === 'CHINA' || c === 'CN' || c === 'HK' || c === 'HONG KONG' || c === 'CHINA/HK') return 'CHINA/HK';
        return 'OUTRO';
    };

    const agendaTabsHtml = (view) => {
        const v = String(view || 'agenda').toLowerCase();
        const tabs = [
            { key: 'agenda', label: 'Agenda' },
            { key: 'br', label: 'BR' },
            { key: 'us', label: 'EUA' },
            { key: 'cn', label: 'CHINA/HK' },
        ];
        const btn = (t) => {
            const active = v === t.key;
            return `<button type="button" data-agenda-view="${escapeHtml(t.key)}" style="border:1px solid ${active ? 'rgba(0,243,255,.45)' : 'rgba(255,255,255,.18)'};border-radius:999px;padding:6px 10px;background:${active ? 'rgba(0,243,255,.10)' : '#151515'};color:#e0e0e0;font-weight:900;letter-spacing:.6px;cursor:pointer;">${escapeHtml(t.label)}</button>`;
        };
        return `<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:0 0 10px;">${tabs.map(btn).join('')}</div>`;
    };

    const getData = () => {
        try {
            return w.MARKET_QUOTES_DATA || null;
        } catch {
            return null;
        }
    };

    const refreshDerivedOperationalInputs = (data) => {
        const core = coreKit();
        if (!core || typeof core.computeOperationalMacro !== 'function') return;
        try {
            operationalInputs.macro = core.computeOperationalMacro(data || getData());
        } catch {
        }
    };

    const getMarketServiceBaseUrl = () => {
        const ms = (w.MercadoBlocks && w.MercadoBlocks.marketService) ? w.MercadoBlocks.marketService : null;
        if (ms && typeof ms.getMarketServiceBaseUrl === 'function') return ms.getMarketServiceBaseUrl();
        return 'http://127.0.0.1:3033';
    };

    const loadScriptFresh = (src) => {
        const sl = (w.MercadoBlocks && w.MercadoBlocks.scriptLoader) ? w.MercadoBlocks.scriptLoader : null;
        if (sl && typeof sl.loadScriptFresh === 'function') return sl.loadScriptFresh(src);
        return Promise.reject(new Error('script_loader_unavailable'));
    };

    const requestAutoRefreshPage = (reason) => {
        const sl = (w.MercadoBlocks && w.MercadoBlocks.scriptLoader) ? w.MercadoBlocks.scriptLoader : null;
        if (sl && typeof sl.requestAutoRefreshPage === 'function') return sl.requestAutoRefreshPage(reason);
        try { window.location.reload(); } catch { }
    };

    const setMetric = (id, text) => {
        const ui = statusUi();
        if (ui && typeof ui.setMetric === 'function') return ui.setMetric(id, text);
    };
    const setMetricMultiline = (id, text) => {
        const ui = statusUi();
        if (ui && typeof ui.setMetricMultiline === 'function') return ui.setMetricMultiline(id, text);
    };
    const setHtml = (id, html) => {
        const ui = statusUi();
        if (ui && typeof ui.setHtml === 'function') return ui.setHtml(id, html);
    };
    const setDataStatus = (text, tone) => {
        const ui = statusUi();
        if (ui && typeof ui.setDataStatus === 'function') return ui.setDataStatus(text, tone);
    };

    const NAVIGATION_DEFINITION = {
        top: [
            { label: 'Visão Geral', href: '#overview' },
            { label: 'Intel', href: '#intel' },
            { label: 'Carteira', href: '#my-assets' },
            { label: 'Flow', href: '#flow-sentinel' },
        ],
        groups: [
            {
                title: 'Tabelas',
                items: [
                    { label: 'Commodities', href: '#commodities' },
                    { label: 'Metais', href: '#metals' },
                    { label: 'FX / Carry', href: '#fx-carry' },
                    { label: 'Emergentes', href: '#emerging' },
                    { label: 'Mercosul', href: '#mercosul' },
                    { label: 'Brasil', href: '#brazil-market' },
                    { label: 'Alertas', href: '#alerts' },
                    { label: 'Todos', href: '#all-assets' },
                    { label: 'Panorama', href: '#panorama' },
                ],
            },
        ],
    };

    const getNavigationItemsFlat = () => {
        const top = NAVIGATION_DEFINITION.top || [];
        const groups = NAVIGATION_DEFINITION.groups || [];
        const out = [];
        for (const x of top) out.push(x);
        for (const g of groups) for (const x of (g.items || [])) out.push(x);
        return out;
    };

    const filterNavigationItemsByExistingTargets = (items) => {
        const list = Array.isArray(items) ? items : [];
        const out = [];
        for (const it of list) {
            if (!it || !it.href) continue;
            const href = String(it.href);
            if (href.startsWith('#')) {
                const id = href.slice(1);
                if (!id || !document.getElementById(id)) continue;
            }
            out.push(it);
        }
        return out;
    };

    const renderNavigationFromDefinition = () => {
        const mod = w.MercadoBlocks && w.MercadoBlocks.navigationDefinition ? w.MercadoBlocks.navigationDefinition : null;
        if (mod && typeof mod.render === 'function') {
            try {
                mod.render({ deps: { NAVIGATION_DEFINITION, filterNavigationItemsByExistingTargets, escapeHtml } });
                return;
            } catch {
            }
        }
        const primary = document.getElementById('navPrimaryLinks');
        if (primary) {
            primary.innerHTML = filterNavigationItemsByExistingTargets(NAVIGATION_DEFINITION.top)
                .map((x, i) => `<a href="${escapeHtml(x.href)}" class="nav-link nav-chip${i === 0 ? ' active' : ''}" data-nav="1" data-nav-top="1">${escapeHtml(x.label)}</a>`)
                .join('');
        }
        const grid = document.getElementById('navMoreGrid');
        if (grid) {
            grid.innerHTML = (NAVIGATION_DEFINITION.groups || [])
                .map(g => {
                    const items = filterNavigationItemsByExistingTargets(g.items);
                    if (!items.length) return '';
                    const itemsHtml = items.map(x => `<a href="${escapeHtml(x.href)}" class="nav-link nav-chip" data-nav="1">${escapeHtml(x.label)}</a>`).join('');
                    return `<div class="nav-more__group"><div class="nav-more__title">${escapeHtml(g.title)}</div>${itemsHtml}</div>`;
                })
                .join('');
        }
    };

    const setupNav = () => {
        const mod = w.MercadoBlocks && w.MercadoBlocks.smoothScrollNav ? w.MercadoBlocks.smoothScrollNav : null;
        if (mod && typeof mod.setup === 'function') mod.setup();
    };
    const setupAssetSwitchNav = () => {
        const mod = w.MercadoBlocks && w.MercadoBlocks.assetSwitchNav ? w.MercadoBlocks.assetSwitchNav : null;
        if (mod && typeof mod.setup === 'function') mod.setup();
    };
    const setupQuickNavDrawer = () => {
        const mod = w.MercadoBlocks && w.MercadoBlocks.quickNavDrawer ? w.MercadoBlocks.quickNavDrawer : null;
        if (mod && typeof mod.setup === 'function') {
            mod.setup({ deps: { filterNavigationItemsByExistingTargets, getNavigationItemsFlat } });
        }
    };
    const setupNavMorePanel = () => {
        const mod = w.MercadoBlocks && w.MercadoBlocks.navMorePanel ? w.MercadoBlocks.navMorePanel : null;
        if (mod && typeof mod.setup === 'function') mod.setup();
    };
    const setupInvestingCalendarWidgetLazyLoad = () => {
        const mod = w.MercadoBlocks && w.MercadoBlocks.investingCalendarWidget ? w.MercadoBlocks.investingCalendarWidget : null;
        if (mod && typeof mod.setup === 'function') mod.setup();
    };

    const buildDeps = () => {
        const core = coreKit();
        const tbl = tableKit();

        const base = (core && typeof core.buildDeps === 'function')
            ? core.buildDeps({ operationalInputs, operationalTuning })
            : { operationalInputs, operationalTuning };

        return {
            ...base,

            setMetric,
            setMetricMultiline,
            setHtml,
            setDataStatus,

            loadFavorites: (tbl && typeof tbl.loadFavorites === 'function') ? tbl.loadFavorites : () => new Set(),
            toggleFavorite: (tbl && typeof tbl.toggleFavorite === 'function') ? tbl.toggleFavorite : () => { },
            buildRows: (tbl && typeof tbl.buildRows === 'function') ? tbl.buildRows : () => [],
            createTable: (tbl && typeof tbl.createTable === 'function') ? tbl.createTable : () => { },

            getMarketServiceBaseUrl,
            loadScriptFresh,
            requestAutoRefreshPage,
            resetAgendaAutoCache,
            fetchAgendaAuto,
            getAgendaAutoCache,
            isAgendaAutoLoading,
            agendaLoadPrefs,
            agendaSavePrefs,
            agendaTabsHtml,
            agendaCountryFromCurrency,
            agendaCountryLabel,
        };
    };

    const actions = (() => {
        const mod = mainActionsMod();
        if (!mod || typeof mod.create !== 'function') return null;
        return mod.create({ buildDeps, getData, fallbackCard, getMarketServiceBaseUrl, loadScriptFresh, operationalInputs, requestAutoRefreshPage });
    })();

    const adaptSplitLayouts = () => {
        const mod = w.MercadoBlocks && w.MercadoBlocks.splitLayoutAdapter ? w.MercadoBlocks.splitLayoutAdapter : null;
        if (mod && typeof mod.adapt === 'function') mod.adapt();
    };

    const start = async () => {
        try {
            const mod = w.MercadoBlocks && w.MercadoBlocks.splitLayoutAdapter ? w.MercadoBlocks.splitLayoutAdapter : null;
            if (mod && typeof mod.setup === 'function') mod.setup();
        } catch {
        }

        try {
            const boot = w.MercadoBlocks && w.MercadoBlocks.boot ? w.MercadoBlocks.boot : null;
            if (!boot || typeof boot.run !== 'function') return;
            await boot.run({
                deps: {
                    renderNavigationFromDefinition,
                    setupNav,
                    setupAssetSwitchNav,
                    setupQuickNavDrawer,
                    setupNavMorePanel,
                    setupInvestingCalendarWidgetLazyLoad,

                    renderOperationalBriefing: actions && actions.renderOperationalBriefing ? actions.renderOperationalBriefing : () => { },
                    renderBtcOperationalBriefing: actions && actions.renderBtcOperationalBriefing ? actions.renderBtcOperationalBriefing : () => { },
                    renderHk50OperationalBriefing: actions && actions.renderHk50OperationalBriefing ? actions.renderHk50OperationalBriefing : () => { },
                    renderUsEquitiesOperationalBriefing: actions && actions.renderUsEquitiesOperationalBriefing ? actions.renderUsEquitiesOperationalBriefing : () => { },
                    renderCommoditiesOperationalBriefing: actions && actions.renderCommoditiesOperationalBriefing ? actions.renderCommoditiesOperationalBriefing : () => { },

                    getData,
                    loadScriptFresh,
                    refreshDerivedOperationalInputs,
                    resetAgendaAutoCache,
                    renderAll: actions && actions.renderAll ? actions.renderAll : () => { },
                    setDataStatus,
                    adaptSplitLayouts,

                    loadOptionsGammaSummary: actions && actions.loadOptionsGammaSummary ? actions.loadOptionsGammaSummary : async () => { },
                    loadFinancialJuice: actions && actions.loadFinancialJuice ? actions.loadFinancialJuice : async () => { },
                    renderFinancialJuice: actions && actions.renderFinancialJuice ? actions.renderFinancialJuice : () => { },
                    loadWebNewsModule: actions && actions.loadWebNewsModule ? actions.loadWebNewsModule : async () => { },
                    loadFocusSummary: actions && actions.loadFocusSummary ? actions.loadFocusSummary : async () => { },
                    loadForeignFlow: actions && actions.loadForeignFlow ? actions.loadForeignFlow : async () => { },

                    triggerUpdaterAndReload: actions && actions.triggerUpdaterAndReload ? actions.triggerUpdaterAndReload : async () => false,
                    renderFavorites: actions && actions.renderFavorites ? actions.renderFavorites : () => { },
                    requestAutoRefreshPage,
                },
            });
        } catch {
            setDataStatus('Falha ao iniciar o MERCADO (boot).', 'negative');
        }
    };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
    else void start();
})();
