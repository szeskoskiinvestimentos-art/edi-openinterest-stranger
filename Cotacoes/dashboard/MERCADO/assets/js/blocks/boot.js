(function () {
    const w = typeof window !== 'undefined' ? window : null;
    if (!w) return;
    const root = (w.MercadoBlocks && typeof w.MercadoBlocks === 'object') ? w.MercadoBlocks : {};

    async function run({ deps } = {}) {
        const d = deps || {};

        const renderNavigationFromDefinition = d.renderNavigationFromDefinition;
        const setupNav = d.setupNav;
        const setupAssetSwitchNav = d.setupAssetSwitchNav;
        const setupQuickNavDrawer = d.setupQuickNavDrawer;
        const setupNavMorePanel = d.setupNavMorePanel;
        const setupInvestingCalendarWidgetLazyLoad = d.setupInvestingCalendarWidgetLazyLoad;

        const renderOperationalBriefing = d.renderOperationalBriefing;
        const renderBtcOperationalBriefing = d.renderBtcOperationalBriefing;
        const renderHk50OperationalBriefing = d.renderHk50OperationalBriefing;
        const renderUsEquitiesOperationalBriefing = d.renderUsEquitiesOperationalBriefing;
        const renderCommoditiesOperationalBriefing = d.renderCommoditiesOperationalBriefing;

        const getData = d.getData;
        const loadScriptFresh = d.loadScriptFresh;
        const resetAgendaAutoCache = d.resetAgendaAutoCache;
        const renderAll = d.renderAll;
        const setDataStatus = d.setDataStatus;
        const adaptSplitLayouts = d.adaptSplitLayouts;

        const loadOptionsGammaSummary = d.loadOptionsGammaSummary;
        const loadFinancialJuice = d.loadFinancialJuice;
        const renderFinancialJuice = d.renderFinancialJuice;
        const loadWebNewsModule = d.loadWebNewsModule;
        const loadFocusSummary = d.loadFocusSummary;
        const loadForeignFlow = d.loadForeignFlow;

        const triggerUpdaterAndReload = d.triggerUpdaterAndReload;
        const renderFavorites = d.renderFavorites;
        const requestAutoRefreshPage = d.requestAutoRefreshPage;

        if (typeof renderNavigationFromDefinition !== 'function'
            || typeof setupNav !== 'function'
            || typeof setupAssetSwitchNav !== 'function'
            || typeof setupQuickNavDrawer !== 'function'
            || typeof setupNavMorePanel !== 'function'
            || typeof setupInvestingCalendarWidgetLazyLoad !== 'function'
            || typeof getData !== 'function'
            || typeof loadScriptFresh !== 'function'
            || typeof resetAgendaAutoCache !== 'function'
            || typeof renderAll !== 'function'
            || typeof setDataStatus !== 'function'
            || typeof adaptSplitLayouts !== 'function'
            || typeof loadOptionsGammaSummary !== 'function'
            || typeof loadFinancialJuice !== 'function'
            || typeof renderFinancialJuice !== 'function'
            || typeof loadWebNewsModule !== 'function'
            || typeof loadFocusSummary !== 'function'
            || typeof loadForeignFlow !== 'function'
            || typeof triggerUpdaterAndReload !== 'function'
            || typeof renderFavorites !== 'function'
            || typeof requestAutoRefreshPage !== 'function'
        ) {
            throw new Error('deps_missing');
        }

        renderNavigationFromDefinition();
        setupNav();
        setupAssetSwitchNav();
        setupQuickNavDrawer();
        setupNavMorePanel();
        setupInvestingCalendarWidgetLazyLoad();
        try { renderOperationalBriefing(); } catch { }
        try { renderBtcOperationalBriefing(); } catch { }
        try { renderHk50OperationalBriefing(); } catch { }
        try { renderUsEquitiesOperationalBriefing(); } catch { }
        try { renderCommoditiesOperationalBriefing(); } catch { }

        let data = getData();
        if (!data) {
            try {
                await loadScriptFresh('assets/data/market_quotes.js');
                await loadScriptFresh('assets/data/zq_curve.js');
                await loadScriptFresh('assets/data/economic_calendar.js');
                await loadScriptFresh('assets/data/foreign_flow.js');
                resetAgendaAutoCache();
                data = getData();
            } catch {
            }
        }
        if (data) renderAll(data);
        else setDataStatus('DADOS NÃO CARREGADOS • Verifique assets/data/market_quotes.js', 'negative');
        adaptSplitLayouts();
        void loadOptionsGammaSummary();
        if (localStorage.getItem('mercado_market_service_autoload') === '1') void loadFinancialJuice();
        else renderFinancialJuice(null);
        void loadWebNewsModule();
        void loadFocusSummary();
        void loadForeignFlow();

        const reloadBtn = document.getElementById('reloadDataBtn');
        if (reloadBtn) {
            reloadBtn.onclick = async () => {
                try {
                    const ok = await triggerUpdaterAndReload();
                    if (!ok) {
                        await loadScriptFresh('assets/data/market_quotes.js');
                        await loadScriptFresh('assets/data/zq_curve.js');
                        await loadScriptFresh('assets/data/economic_calendar.js');
                        resetAgendaAutoCache();
                        const updated = getData();
                        if (updated) renderAll(updated);
                    }
                    void loadOptionsGammaSummary();
                    void loadFinancialJuice();
                    void loadWebNewsModule();
                    void loadFocusSummary();
                    void loadForeignFlow();
                } catch {
                }
            };
        }

        document.addEventListener('mercado:favoritesChanged', () => {
            try {
                const updated = getData();
                if (updated) renderFavorites(updated);
            } catch {
            }
        });

        const interval = 15;
        const pollMs = interval * 60 * 1000;
        let nextAt = Date.now() + pollMs;

        const refreshQuotes = async source => {
            try {
                await loadScriptFresh('assets/data/market_quotes.js');
                await loadScriptFresh('assets/data/zq_curve.js');
                await loadScriptFresh('assets/data/economic_calendar.js');
                resetAgendaAutoCache();
                const updated = getData();
                if (updated) renderAll(updated);
                void loadOptionsGammaSummary();
                void loadFinancialJuice();
                void loadWebNewsModule();
                void loadFocusSummary();
                void loadForeignFlow();
                if (source) {
                    setDataStatus('AUTO • Dados atualizados', 'positive');
                    setTimeout(() => setDataStatus('', 'neutral'), 1500);
                }
                if (source) setTimeout(() => requestAutoRefreshPage('auto_update_done'), 650);
                return true;
            } catch {
                if (location.protocol === 'file:') {
                    window.location.reload();
                }
                return false;
            }
        };

        try {
            const force = sessionStorage.getItem('mercado_force_refresh_once') === '1';
            if (force) {
                sessionStorage.removeItem('mercado_force_refresh_once');
                void refreshQuotes('');
            }
        } catch {
        }

        const scheduleNext = () => {
            const delay = Math.max(0, nextAt - Date.now());
            setTimeout(async () => {
                while (nextAt <= Date.now()) nextAt += pollMs;
                await refreshQuotes('');
                scheduleNext();
            }, delay);
        };

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) return;
            if (Date.now() >= nextAt) {
                nextAt = Date.now() + pollMs;
                void refreshQuotes('visible');
            }
        });

        scheduleNext();
    }

    root.boot = { run };
    w.MercadoBlocks = root;
})();
