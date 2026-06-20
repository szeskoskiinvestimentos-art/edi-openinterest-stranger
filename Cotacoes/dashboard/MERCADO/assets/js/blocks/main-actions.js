(function () {
    const w = typeof window !== 'undefined' ? window : null;
    if (!w) return;
    const root = (w.MercadoBlocks && typeof w.MercadoBlocks === 'object') ? w.MercadoBlocks : {};

    const create = (ctx) => {
        const c = ctx && typeof ctx === 'object' ? ctx : {};
        const h = w.MainActionsHelpers || {};
        const tryRender = typeof h.tryRender === 'function' ? h.tryRender : ({ fn } = {}) => { try { if (typeof fn === 'function') fn(); } catch { } return false; };
        const isBrazilAdr = typeof h.isBrazilAdr === 'function' ? h.isBrazilAdr : (symbol => /(PBR|VALE|ABEV|ITUB|BBD|BSBR|NU|STNE)\b/.test(String(symbol || '').toUpperCase()));
        const buildDeps = typeof c.buildDeps === 'function' ? c.buildDeps : () => ({});
        const getData = typeof c.getData === 'function' ? c.getData : () => null;
        const fallbackCard = typeof c.fallbackCard === 'function' ? c.fallbackCard : () => '';
        const getMarketServiceBaseUrl = typeof c.getMarketServiceBaseUrl === 'function' ? c.getMarketServiceBaseUrl : () => 'http://127.0.0.1:3433';
        const loadScriptFresh = typeof c.loadScriptFresh === 'function' ? c.loadScriptFresh : () => Promise.reject(new Error('script_loader_unavailable'));
        const operationalInputs = c.operationalInputs && typeof c.operationalInputs === 'object' ? c.operationalInputs : {};
        const requestAutoRefreshPage = typeof c.requestAutoRefreshPage === 'function' ? c.requestAutoRefreshPage : () => { try { window.location.reload(); } catch { } };

        const renderGlobalTicker = (data) => {
            const mod = w.MercadoBlocks && w.MercadoBlocks.globalTicker ? w.MercadoBlocks.globalTicker : null;
            if (mod && typeof mod.render === 'function') mod.render({ data, el: document.getElementById('globalTicker'), deps: buildDeps() });
        };

        const renderTopMovers = (data) => {
            const mod = w.MercadoBlocks && w.MercadoBlocks.topMovers ? w.MercadoBlocks.topMovers : null;
            if (mod && typeof mod.render === 'function') mod.render({ data, el: document.getElementById('topMovers'), deps: buildDeps() });
        };

        const renderAllAssetsTable = (data) => {
            const mod = w.MercadoBlocks && w.MercadoBlocks.allAssetsTable ? w.MercadoBlocks.allAssetsTable : null;
            if (mod && typeof mod.render === 'function') mod.render({ data, deps: buildDeps() });
        };

        const renderZqCurveBriefing = () => {
            const mod = w.MercadoBlocks && w.MercadoBlocks.zqCurve ? w.MercadoBlocks.zqCurve : null;
            if (mod && typeof mod.render === 'function') mod.render({ el: document.getElementById('zqCurveBriefing'), deps: buildDeps() });
        };

        const renderUsTreasuryFuturesBriefing = () => {
            const mod = w.MercadoBlocks && w.MercadoBlocks.usTreasuryFutures ? w.MercadoBlocks.usTreasuryFutures : null;
            if (mod && typeof mod.render === 'function') mod.render({ el: document.getElementById('usTreasuryFuturesBriefing'), deps: buildDeps() });
        };

        const renderGlobalCoverageAudit = (data) => {
            const mod = w.MercadoBlocks && w.MercadoBlocks.globalCoverageAudit ? w.MercadoBlocks.globalCoverageAudit : null;
            if (mod && typeof mod.render === 'function') mod.render({ data, el: document.getElementById('globalCoverageAudit'), deps: buildDeps() });
        };

        const buildWebNewsDeps = () => {
            const d = buildDeps();
            return {
                escapeHtml: d.escapeHtml,
                formatDateTime: d.formatDateTime,
                formatDateTimeLoose: d.formatDateTimeLoose,
                pillHtml: d.pillHtml,
                fallbackCard: d.fallbackCard,
            };
        };

        const renderWebNewsModule = (payload) => {
            const mod = w.MercadoBlocks && w.MercadoBlocks.webNewsModule ? w.MercadoBlocks.webNewsModule : null;
            if (mod && typeof mod.render === 'function') {
                const el = document.getElementById('newsWebModule');
                tryRender({
                    el,
                    title: 'Web News Module',
                    fallbackCard,
                    logTag: 'webNewsModule',
                    fn: () => mod.render({ data: payload, el, deps: buildWebNewsDeps() }),
                });
            }
        };

        const buildFinancialJuiceDeps = () => {
            const d = buildDeps();
            return { escapeHtml: d.escapeHtml, formatDateTime: d.formatDateTime, fallbackCard: d.fallbackCard };
        };

        const renderFinancialJuice = (payload) => {
            const mod = w.MercadoBlocks && w.MercadoBlocks.financialJuice ? w.MercadoBlocks.financialJuice : null;
            if (mod && typeof mod.render === 'function') {
                const el = document.getElementById('newsFinancialJuice');
                tryRender({
                    el,
                    title: 'FinancialJuice',
                    fallbackCard,
                    logTag: 'financialJuice',
                    fn: () => mod.render({ data: payload, el, deps: buildFinancialJuiceDeps() }),
                });
            }
        };

        const renderOperationalBriefing = () => {
            const el = document.getElementById('operationalBriefing');
            if (!el) return;
            const mod = w.MercadoBlocks && w.MercadoBlocks.operationalBriefing ? w.MercadoBlocks.operationalBriefing : null;
            const data = getData();
            if (mod && typeof mod.render === 'function') {
                tryRender({
                    el,
                    title: 'Roteiro do momento',
                    fallbackCard,
                    logTag: 'operationalBriefing',
                    fn: () => {
                        const deps = buildDeps();
                        deps.isBrazilAdr = isBrazilAdr;
                        deps.renderZqCurveBriefing = renderZqCurveBriefing;
                        deps.renderUsTreasuryFuturesBriefing = renderUsTreasuryFuturesBriefing;
                        deps.renderWebNewsModule = renderWebNewsModule;
                        deps.renderAllAssetsTable = renderAllAssetsTable;
                        deps.renderGlobalTicker = renderGlobalTicker;
                        deps.renderTopMovers = renderTopMovers;
                        deps.renderOperationalCompass = (model) => {
                            try {
                                const oc = w.OperationalCompass || null;
                                if (oc && typeof oc.render === 'function') oc.render(model, document.getElementById('operationalCompass'));
                            } catch {
                            }
                        };
                        deps.buildOperationalCompassModel = (input) => {
                            try {
                                const oc = w.OperationalCompass || null;
                                if (oc && typeof oc.buildModel === 'function') return oc.buildModel(input);
                            } catch {
                            }
                            return null;
                        };
                        mod.render({ data, el, deps });
                    },
                });
                return;
            }
            el.innerHTML = fallbackCard('Roteiro do momento', 'Módulo indisponível (não carregado).');
        };

        const renderBtcOperationalBriefing = () => {
            const el = document.getElementById('btcOperationalBriefing');
            if (!el) return;
            const mod = w.MercadoBlocks && w.MercadoBlocks.btcBriefing ? w.MercadoBlocks.btcBriefing : null;
            if (mod && typeof mod.render === 'function') {
                tryRender({
                    el,
                    title: 'BTC (Criptos)',
                    fallbackCard,
                    logTag: 'btcOperationalBriefing',
                    fn: () => {
                        const deps = buildDeps();
                        deps.getData = getData;
                        mod.render({ el, deps });
                    },
                });
                return;
            }
            el.innerHTML = fallbackCard('BTC (Criptos)', 'Módulo indisponível (não carregado).');
        };

        const renderCommoditiesOperationalBriefing = () => {
            const el = document.getElementById('commoditiesOperationalBriefing');
            if (!el) return;
            const mod = w.MercadoBlocks && w.MercadoBlocks.commoditiesBriefing ? w.MercadoBlocks.commoditiesBriefing : null;
            if (mod && typeof mod.render === 'function') {
                tryRender({
                    el,
                    title: 'Operacional Commodities',
                    fallbackCard,
                    logTag: 'commoditiesOperationalBriefing',
                    fn: () => {
                        const deps = buildDeps();
                        deps.getData = getData;
                        mod.render({ el, deps });
                    },
                });
                return;
            }
            el.innerHTML = fallbackCard('Operacional Commodities', 'Módulo indisponível (não carregado).');
        };

        const renderHk50OperationalBriefing = () => {
            const el = document.getElementById('hk50OperationalBriefing');
            if (!el) return;
            const mod = w.MercadoBlocks && w.MercadoBlocks.hk50Briefing ? w.MercadoBlocks.hk50Briefing : null;
            if (mod && typeof mod.render === 'function') {
                tryRender({
                    el,
                    title: 'HK50',
                    fallbackCard,
                    logTag: 'hk50OperationalBriefing',
                    fn: () => {
                        const deps = buildDeps();
                        deps.getData = getData;
                        mod.render({ el, deps });
                    },
                });
                return;
            }
            el.innerHTML = fallbackCard('HK50', 'Módulo indisponível (não carregado).');
        };

        const renderUsEquitiesOperationalBriefing = () => {
            const el = document.getElementById('usEquitiesOperationalBriefing');
            if (!el) return;
            const mod = w.MercadoBlocks && w.MercadoBlocks.usOperationalEua ? w.MercadoBlocks.usOperationalEua : (w.USOperationalEua || null);
            if (mod && typeof mod.render === 'function') {
                tryRender({
                    el,
                    title: 'Operacional EUA',
                    fallbackCard,
                    logTag: 'usEquitiesOperationalBriefing',
                    fn: () => {
                        const deps = buildDeps();
                        deps.el = el;
                        deps.data = getData();
                        deps.renderWebNewsModule = renderWebNewsModule;
                        deps.renderZqCurveBriefing = renderZqCurveBriefing;
                        deps.renderUsTreasuryFuturesBriefing = renderUsTreasuryFuturesBriefing;
                        mod.render(deps);
                    },
                });
                return;
            }
            el.innerHTML = fallbackCard('Operacional EUA', 'Módulo indisponível (não carregado).');
        };

        const loadOptionsGammaSummary = async () => {
            try { operationalInputs.optionsGamma = w.OPTIONS_GAMMA_SUMMARY_DATA || operationalInputs.optionsGamma || null; } catch { }
            const data = operationalInputs.optionsGamma;
            const el = document.getElementById('optionsGammaSummary');
            const mod = w.MercadoBlocks && w.MercadoBlocks.optionsGammaSummary ? w.MercadoBlocks.optionsGammaSummary : null;
            if (el && mod && typeof mod.render === 'function') {
                try { mod.render({ data, el, deps: buildDeps() }); } catch { el.innerHTML = fallbackCard('Opções & Gamma', 'Falha ao renderizar o módulo.'); }
            }
        };

        const loadWebNewsModule = async () => {
            try { operationalInputs.webNews = w.WEB_NEWS_MODULE_DATA || operationalInputs.webNews || null; } catch { }
            renderWebNewsModule(operationalInputs.webNews);
        };

        const loadForeignFlow = async () => {
            try { operationalInputs.foreignFlow = w.FOREIGN_FLOW_DATA || operationalInputs.foreignFlow || null; } catch { }
        };

        const loadFocusSummary = async () => {
            try {
                await loadScriptFresh('assets/data/focus_summary.js');
                operationalInputs.focusSummary = w.FOCUS_SUMMARY_DATA || operationalInputs.focusSummary || null;
            } catch {
            }
        };

        const loadFinancialJuice = async () => {
            const baseUrl = getMarketServiceBaseUrl();
            try {
                const controller = new AbortController();
                const t = setTimeout(() => controller.abort(), 3500);
                const res = await fetch(`${baseUrl}/api/news/financialjuice`, { method: 'GET', signal: controller.signal });
                clearTimeout(t);
                if (!res.ok) throw new Error('fj_fetch_failed');
                const payload = await res.json();
                operationalInputs.financialJuice = payload;
                try { renderFinancialJuice(payload); } catch { }
                return;
            } catch {
            }
            operationalInputs.financialJuice = null;
            try { renderFinancialJuice(null); } catch { }
        };

        const renderFavorites = (data) => {
            const mod = w.MercadoBlocks && w.MercadoBlocks.favorites ? w.MercadoBlocks.favorites : null;
            if (mod && typeof mod.render === 'function') {
                mod.render({
                    data,
                    deps: {
                        ...buildDeps(),
                        renderLineChart: (id, points, symbol) => (w.MercadoCharts && typeof w.MercadoCharts.renderLineChart === 'function') ? w.MercadoCharts.renderLineChart(id, points, symbol) : null,
                    },
                });
            }
        };

        function renderAll(data) {
            const deps = buildDeps();
            deps.renderLineChart = (id, points, symbol) => (w.MercadoCharts && typeof w.MercadoCharts.renderLineChart === 'function') ? w.MercadoCharts.renderLineChart(id, points, symbol) : null;
            deps.renderBarChart = (id, labels, values, title) => (w.MercadoCharts && typeof w.MercadoCharts.renderBarChart === 'function') ? w.MercadoCharts.renderBarChart(id, labels, values, title) : null;
            deps.isBrazilAdr = isBrazilAdr;
            deps.renderGlobalTicker = renderGlobalTicker;
            deps.renderTopMovers = renderTopMovers;
            deps.renderAllAssetsTable = renderAllAssetsTable;

            const blocks = w.MercadoBlocks || {};

            try {
                const el = document.getElementById('last-update-label');
                if (el) {
                    const raw = data && data.meta && data.meta.generatedAt ? String(data.meta.generatedAt) : '';
                    const ms = raw ? Date.parse(raw) : NaN;
                    const dt = Number.isFinite(ms) ? new Date(ms) : null;
                    const txt = dt && typeof deps.formatDateTimeLoose === 'function'
                        ? deps.formatDateTimeLoose(dt)
                        : (raw ? raw : '');
                    el.textContent = txt ? ` • Atualizado: ${txt}` : '';
                }
            } catch {
            }

            try { renderGlobalCoverageAudit(data); } catch { }
            try { if (blocks.overview && typeof blocks.overview.render === 'function') blocks.overview.render({ data, deps }); } catch { }
            try { if (blocks.flowSentinel && typeof blocks.flowSentinel.render === 'function') blocks.flowSentinel.render({ data, deps }); } catch { }
            try { if (blocks.regimeConviction && typeof blocks.regimeConviction.render === 'function') blocks.regimeConviction.render({ data, el: document.getElementById('regimeConviction'), deps }); } catch { }
            try { if (blocks.optionsGammaSummary && typeof blocks.optionsGammaSummary.render === 'function') blocks.optionsGammaSummary.render({ data: operationalInputs.optionsGamma, el: document.getElementById('optionsGammaSummary'), deps }); } catch { }
            try {
                const el = document.getElementById('agendaMatrix');
                if (blocks.agendaMatrix && typeof blocks.agendaMatrix.render === 'function') {
                    if (typeof deps.safeRender === 'function') {
                        deps.safeRender({
                            id: 'agendaMatrix',
                            label: 'Agenda & Matriz (SE–ENTÃO)',
                            fn: () => blocks.agendaMatrix.render({ data: w.ECONOMIC_CALENDAR_DATA || null, el, deps }),
                        });
                    } else {
                        blocks.agendaMatrix.render({ data: w.ECONOMIC_CALENDAR_DATA || null, el, deps });
                    }
                }
            } catch { }
            try { if (blocks.sectorHeatmap && typeof blocks.sectorHeatmap.render === 'function') blocks.sectorHeatmap.render({ data, el: document.getElementById('sectorHeatmap'), deps }); } catch { }
            try { if (blocks.alerts && typeof blocks.alerts.render === 'function') blocks.alerts.render({ data, deps }); } catch { }
            try { if (blocks.marketPanorama && typeof blocks.marketPanorama.render === 'function') blocks.marketPanorama.render({ data, el: document.getElementById('marketPanorama'), deps }); } catch { }
            try { if (blocks.dataAudit && typeof blocks.dataAudit.render === 'function') blocks.dataAudit.render({ data, el: document.getElementById('dataAudit'), deps }); } catch { }
            try { if (blocks.assetsCatalog && typeof blocks.assetsCatalog.render === 'function') blocks.assetsCatalog.render({ data, el: document.getElementById('assetsCatalog'), deps }); } catch { }
            try { if (blocks.petrobras && typeof blocks.petrobras.render === 'function') blocks.petrobras.render({ data: w.PETROBRAS_MODULE_DATA || null, deps }); } catch { }
            try { if (blocks.carryIntel && typeof blocks.carryIntel.render === 'function') blocks.carryIntel.render({ data, el: document.getElementById('carryIntel'), deps }); } catch { }
            try { if (blocks.chinaBrazil && typeof blocks.chinaBrazil.render === 'function') blocks.chinaBrazil.render({ data, el: document.getElementById('chinaBrazil'), deps }); } catch { }
            try {
                const el = document.getElementById('metalsZone');
                if (blocks.metalsZone && typeof blocks.metalsZone.render === 'function') {
                    if (typeof deps.safeRender === 'function') deps.safeRender({ id: 'metalsZone', label: 'Zona de Metais', fn: () => blocks.metalsZone.render({ data, el, deps }) });
                    else blocks.metalsZone.render({ data, el, deps });
                }
            } catch { }
            try { if (blocks.mercosul && typeof blocks.mercosul.render === 'function') blocks.mercosul.render({ data, deps }); } catch { }
            try { if (blocks.brazilExportBasket && typeof blocks.brazilExportBasket.render === 'function') blocks.brazilExportBasket.render({ data, el: document.getElementById('exportBasket'), deps }); } catch { }
            try {
                if (blocks.brazilMarket && typeof blocks.brazilMarket.render === 'function') {
                    blocks.brazilMarket.render({
                        data,
                        deps: {
                            ...deps,
                            isBrazilRelated: (a) => !!a,
                            brazilGroup: () => '—',
                            renderBrazilExportBasket: (d0) => { try { if (blocks.brazilExportBasket && typeof blocks.brazilExportBasket.render === 'function') blocks.brazilExportBasket.render({ data: d0, el: document.getElementById('exportBasket'), deps }); } catch { } },
                        },
                    });
                }
            } catch { }
            try {
                const el = document.getElementById('brazilFixedIncomeFlow');
                if (blocks.brazilFixedIncomeFlow && typeof blocks.brazilFixedIncomeFlow.render === 'function') {
                    if (typeof deps.safeRender === 'function') deps.safeRender({ id: 'brazilFixedIncomeFlow', label: 'Renda Fixa Brasil & Fluxo', fn: () => blocks.brazilFixedIncomeFlow.render({ data, el, deps }) });
                    else blocks.brazilFixedIncomeFlow.render({ data, el, deps });
                }
            } catch { }
            try {
                const el = document.getElementById('ratesBuckets');
                if (blocks.ratesBuckets && typeof blocks.ratesBuckets.render === 'function') {
                    if (typeof deps.safeRender === 'function') deps.safeRender({ id: 'ratesBuckets', label: 'Curva (Proxy) por Buckets', fn: () => blocks.ratesBuckets.render({ data, el, deps }) });
                    else blocks.ratesBuckets.render({ data, el, deps });
                }
            } catch { }
            try { if (blocks.categoryTable && typeof blocks.categoryTable.render === 'function') blocks.categoryTable.render({ data, containerId: 'commoditiesTable', chartId: 'commoditiesChart', categories: ['commodities', 'energy', 'agriculture'], deps }); } catch { }
            try { if (blocks.categoryTable && typeof blocks.categoryTable.render === 'function') blocks.categoryTable.render({ data, containerId: 'metalsTable', chartId: 'metalsChart', categories: ['metals'], deps }); } catch { }
            try { if (blocks.categoryTable && typeof blocks.categoryTable.render === 'function') blocks.categoryTable.render({ data, containerId: 'fxTable', chartId: 'fxChart', categories: ['fx_g10', 'fx_emerging'], deps }); } catch { }
            try { if (blocks.categoryTable && typeof blocks.categoryTable.render === 'function') blocks.categoryTable.render({ data, containerId: 'emergingTable', chartId: 'emergingChart', categories: ['emerging'], deps }); } catch { }
            try { if (blocks.favorites && typeof blocks.favorites.render === 'function') blocks.favorites.render({ data, deps }); } catch { }
            try { if (blocks.allAssetsTable && typeof blocks.allAssetsTable.render === 'function') blocks.allAssetsTable.render({ data, deps }); } catch { }
            try { if (blocks.zqCurve && typeof blocks.zqCurve.render === 'function') blocks.zqCurve.render({ el: document.getElementById('zqCurveBriefing'), deps }); } catch { }
            try { if (blocks.usTreasuryFutures && typeof blocks.usTreasuryFutures.render === 'function') blocks.usTreasuryFutures.render({ el: document.getElementById('usTreasuryFuturesBriefing'), deps }); } catch { }
        }

        const formatUpdaterSummary = (payload) => {
            const mod = w.MercadoBlocks && w.MercadoBlocks.updaterSummary ? w.MercadoBlocks.updaterSummary : null;
            if (mod && typeof mod.formatUpdaterSummary === 'function') return mod.formatUpdaterSummary(payload);
            return null;
        };

        const triggerUpdaterAndReload = async () => {
            const mod = w.MercadoBlocks && w.MercadoBlocks.updater ? w.MercadoBlocks.updater : null;
            if (!mod || typeof mod.trigger !== 'function') return false;
            try {
                const deps = buildDeps();
                deps.formatUpdaterSummary = formatUpdaterSummary;
                deps.renderAll = renderAll;
                deps.getData = getData;
                deps.loadOptionsGammaSummary = loadOptionsGammaSummary;
                deps.loadFinancialJuice = loadFinancialJuice;
                deps.loadWebNewsModule = loadWebNewsModule;
                deps.loadFocusSummary = loadFocusSummary;
                deps.loadForeignFlow = loadForeignFlow;
                deps.requestAutoRefreshPage = requestAutoRefreshPage;
                const ok = await mod.trigger({ deps });
                return ok === true;
            } catch {
                return false;
            }
        };

        return {
            renderGlobalTicker,
            renderTopMovers,
            renderAllAssetsTable,
            renderZqCurveBriefing,
            renderUsTreasuryFuturesBriefing,
            renderWebNewsModule,
            renderFinancialJuice,
            renderOperationalBriefing,
            renderBtcOperationalBriefing,
            renderCommoditiesOperationalBriefing,
            renderHk50OperationalBriefing,
            renderUsEquitiesOperationalBriefing,
            loadOptionsGammaSummary,
            loadWebNewsModule,
            loadForeignFlow,
            loadFocusSummary,
            loadFinancialJuice,
            renderFavorites,
            renderAll,
            triggerUpdaterAndReload,
        };
    };

    root.mainActions = { create };
    w.MercadoBlocks = root;
})();
