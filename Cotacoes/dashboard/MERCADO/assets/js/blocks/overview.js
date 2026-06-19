(function () {
    const w = typeof window !== 'undefined' ? window : null;
    if (!w) return;
    const root = (w.MercadoBlocks && typeof w.MercadoBlocks === 'object') ? w.MercadoBlocks : {};

    function render({ data, deps } = {}) {
        const d = deps || {};

        const setMetric = d.setMetric;
        const setMetricMultiline = d.setMetricMultiline;
        const setHtml = d.setHtml;
        const getLastPoint = d.getLastPoint;
        const pointPct = d.pointPct;
        const formatPercent = d.formatPercent;
        const formatNumber = d.formatNumber;
        const toneBadgeHtml = d.toneBadgeHtml;
        const toneBadgeHtmlFromTone = d.toneBadgeHtmlFromTone;
        const computeFlowScore = d.computeFlowScore;
        const computeCategoryAverages = d.computeCategoryAverages;
        const renderGlobalTicker = d.renderGlobalTicker;
        const renderTopMovers = d.renderTopMovers;
        const safeRender = d.safeRender || (w.MercadoUtils && typeof w.MercadoUtils.safeRender === 'function' ? w.MercadoUtils.safeRender : null);
        const renderBarChart = d.renderBarChart || ((id, labels, values, title) => {
            if (w.MercadoCharts && typeof w.MercadoCharts.renderBarChart === 'function') {
                w.MercadoCharts.renderBarChart(id, labels, values, title);
            }
        });

        if (typeof setMetric !== 'function'
            || typeof setMetricMultiline !== 'function'
            || typeof setHtml !== 'function'
            || typeof getLastPoint !== 'function'
            || typeof pointPct !== 'function'
            || typeof formatPercent !== 'function'
            || typeof formatNumber !== 'function'
            || typeof toneBadgeHtml !== 'function'
            || typeof toneBadgeHtmlFromTone !== 'function'
            || typeof computeFlowScore !== 'function'
            || typeof computeCategoryAverages !== 'function'
            || typeof renderGlobalTicker !== 'function'
            || typeof renderTopMovers !== 'function'
            || typeof renderBarChart !== 'function'
        ) {
            throw new Error('deps_missing');
        }

        const retentionDays = (data && data.meta && data.meta.retentionDays) ? data.meta.retentionDays : 10;
        setMetric('metric-assets', String((data && data.assets ? data.assets : []).length));
        setMetric('metric-retention', `${retentionDays} dias`);

        const nowMs = Date.now();
        const isNum = v => (typeof v === 'number' && Number.isFinite(v));
        const hardMaxAbs = 80;
        const staleMs = 4 * 60 * 60 * 1000;
        const ageMs = (pt) => {
            const t = pt && pt.t ? Date.parse(String(pt.t)) : NaN;
            if (!Number.isFinite(t)) return null;
            return nowMs - t;
        };
        const rowsAll = (data && data.assets ? data.assets : [])
            .map(a => ({ a, last: getLastPoint(data, a.symbol) }))
            .filter(x => {
                const pct = pointPct(x.last);
                const price = x && x.last && typeof x.last.price === 'number' ? x.last.price : null;
                const age = ageMs(x.last);
                if (!isNum(pct) || !isNum(price) || !(price > 0)) return false;
                if (Math.abs(pct) > hardMaxAbs) return false;
                if (typeof age === 'number' && Number.isFinite(age) && age > staleMs) return false;
                return true;
            });

        const sorted = rowsAll.slice().sort((x, y) => (pointPct(y.last) ?? 0) - (pointPct(x.last) ?? 0));
        const topUp = sorted.length ? sorted[0] : null;
        const topDown = sorted.length ? sorted[sorted.length - 1] : null;

        if (topUp) {
            setMetricMultiline('metric-top-up', topUp.a.name || topUp.a.symbol);
            const pct = pointPct(topUp.last);
            setHtml('metric-top-up-pct', toneBadgeHtml(pct, formatPercent(pct), { maxAbs: 5 }));
        }
        if (topDown) {
            setMetricMultiline('metric-top-down', topDown.a.name || topDown.a.symbol);
            const pct = pointPct(topDown.last);
            setHtml('metric-top-down-pct', toneBadgeHtml(pct, formatPercent(pct), { maxAbs: 5 }));
        }

        const flow = computeFlowScore(data);
        setMetric('metric-flow', flow.label);
        setHtml(
            'metric-flow-score',
            toneBadgeHtmlFromTone(
                flow.score > 0.35 ? 'positive' : flow.score < -0.35 ? 'negative' : 'neutral',
                flow.score,
                formatNumber(flow.score, 2),
                { maxAbs: 1 },
            ),
        );

        if (safeRender) safeRender({ id: 'globalTicker', label: 'Ticker Global', fn: () => renderGlobalTicker(data) });
        else renderGlobalTicker(data);
        if (safeRender) safeRender({ id: 'topMovers', label: 'Top Movers por Grupo', fn: () => renderTopMovers(data) });
        else renderTopMovers(data);

        const groups = [
            { key: 'commodities', label: 'Commodities', categories: ['commodities', 'energy', 'agriculture'] },
            { key: 'metals', label: 'Metais', categories: ['metals'] },
            { key: 'fx', label: 'FX', categories: ['fx_g10', 'fx_emerging'] },
            { key: 'emerging', label: 'Emergentes', categories: ['emerging'] },
        ];
        const avgs = computeCategoryAverages(data, groups);
        const labels = avgs.map(a => `${a.label} (${a.count})`);
        const values = avgs.map(a => Number.isFinite(a.avg) ? Number(a.avg.toFixed(3)) : 0);
        renderBarChart('overviewChart', labels, values, 'Média de Chg% (agora)');
    }

    root.overview = { render };
    w.MercadoBlocks = root;
})();
