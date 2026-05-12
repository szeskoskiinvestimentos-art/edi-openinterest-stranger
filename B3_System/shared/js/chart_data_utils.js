 (function (global) {
     const ChartDataUtils = global.ChartDataUtils || (global.ChartDataUtils = {});
 
     ChartDataUtils.getGammaFlipConePayload = function getGammaFlipConePayload(data) {
         return {
             coneAll: data?.v3_data?.gamma_flip_cone ?? data?.gamma_flip_cone,
             coneNearest: data?.v3_data?.gamma_flip_cone_nearest ?? data?.gamma_flip_cone_nearest,
             nearestExpiry: data?.v3_data?.gamma_flip_cone_nearest_expiry ?? data?.gamma_flip_cone_nearest_expiry
         };
     };
 
     ChartDataUtils.normalizeGammaFlipCone = function normalizeGammaFlipCone(cone) {
         const alphasIn = Array.isArray(cone?.alphas) ? cone.alphas : [];
         const flipsIn = Array.isArray(cone?.flips) ? cone.flips : [];
         const baseLen = Math.min(alphasIn.length, flipsIn.length);
         if (baseLen === 0) return null;
 
         const byAlpha = new Map();
         for (let i = 0; i < baseLen; i++) {
             const alpha = Number(alphasIn[i]);
             if (!Number.isFinite(alpha)) continue;
             const rawFlip = flipsIn[i];
             const flip = rawFlip === null || rawFlip === undefined ? null : Number(rawFlip);
             byAlpha.set(alpha, Number.isFinite(flip) ? flip : null);
         }
         if (byAlpha.size === 0) return null;
 
         const alphas = Array.from(byAlpha.keys()).sort((a, b) => a - b);
         const points = alphas.map((a) => ({ x: a, y: byAlpha.get(a) }));
         return { alphas, points };
     };

    ChartDataUtils.getSpot = function getSpot(data) {
        const spot = Number(
            data?.overview?.spot_price
            ?? data?.overview?.spot
            ?? data?.spot_price
            ?? data?.spot
        );
        return Number.isFinite(spot) ? spot : null;
    };

    ChartDataUtils.getVolatilityData = function getVolatilityData(data) {
        return data?.v3_data?.volatility_data ?? data?.volatility_data;
    };

    ChartDataUtils.registerSpotLinePlugin = function registerSpotLinePlugin() {
        const Chart = global?.Chart;
        if (!Chart || typeof Chart.register !== 'function') return;
        if (ChartDataUtils._spotLinePluginRegistered) return;

        const plugin = {
            id: 'spotLine',
            afterDatasetsDraw(chart, _args, pluginOptions) {
                const value = Number(pluginOptions?.value);
                if (!Number.isFinite(value)) return;

                const xScale = chart?.scales?.x ?? Object.values(chart?.scales ?? {}).find((s) => s?.axis === 'x');
                if (!xScale || typeof xScale.getPixelForValue !== 'function') return;

                let xPixel = null;
                if (xScale.type === 'category') {
                    const labelsIn = chart?.data?.labels;
                    const labels = Array.isArray(labelsIn) ? labelsIn : [];
                    const numericLabels = labels
                        .map((l) => {
                            if (typeof l === 'number') return l;
                            if (typeof l !== 'string') return Number(l);
                            const s = l.trim();
                            const looksLikePtBr = /^\d{1,3}(\.\d{3})+(,\d+)?$/.test(s);
                            if (!looksLikePtBr) return Number(s);
                            const normalized = s.replace(/\./g, '').replace(',', '.');
                            return Number(normalized);
                        })
                        .map((n, i) => ({ n, i }))
                        .filter((p) => Number.isFinite(p.n));
                    if (numericLabels.length === 0) return;
                    const min = Math.min(...numericLabels.map((p) => p.n));
                    const max = Math.max(...numericLabels.map((p) => p.n));
                    if (value < min || value > max) return;
                    let lo = null;
                    let hi = null;
                    for (let i = 0; i < numericLabels.length; i++) {
                        const p = numericLabels[i];
                        if (p.n <= value) lo = p;
                        if (p.n >= value) {
                            hi = p;
                            break;
                        }
                    }
                    if (!lo && hi) lo = hi;
                    if (!hi && lo) hi = lo;
                    if (!lo || !hi) return;
                    if (lo.i === hi.i || lo.n === hi.n) {
                        xPixel = xScale.getPixelForValue(lo.i);
                    } else {
                        const x0 = xScale.getPixelForValue(lo.i);
                        const x1 = xScale.getPixelForValue(hi.i);
                        const t = (value - lo.n) / (hi.n - lo.n);
                        xPixel = x0 + (x1 - x0) * t;
                    }
                } else {
                    const min = Number(xScale.min);
                    const max = Number(xScale.max);
                    if (Number.isFinite(min) && Number.isFinite(max) && (value < min || value > max)) return;
                    xPixel = xScale.getPixelForValue(value);
                }

                if (!Number.isFinite(xPixel)) return;

                const chartArea = chart.chartArea;
                if (!chartArea) return;

                const ctx = chart.ctx;
                const color = pluginOptions?.color ?? 'lime';
                const width = Number(pluginOptions?.width ?? 2);
                const dash = Array.isArray(pluginOptions?.dash) ? pluginOptions.dash : [4, 4];

                ctx.save();
                ctx.lineWidth = Number.isFinite(width) ? width : 2;
                ctx.strokeStyle = color;
                if (typeof ctx.setLineDash === 'function') ctx.setLineDash(dash);
                ctx.beginPath();
                ctx.moveTo(xPixel, chartArea.top);
                ctx.lineTo(xPixel, chartArea.bottom);
                ctx.stroke();
                if (typeof ctx.setLineDash === 'function') ctx.setLineDash([]);

                const showLabel = pluginOptions?.label !== false;
                if (showLabel) {
                    const labelText = typeof pluginOptions?.labelText === 'string'
                        ? pluginOptions.labelText
                        : `SPOT ${Number.isFinite(value) ? value.toFixed(2) : value}`;
                    ctx.fillStyle = color;
                    ctx.font = pluginOptions?.font ?? '12px Orbitron';
                    ctx.textBaseline = 'top';
                    const offsetX = Number(pluginOptions?.labelOffsetX ?? 0);
                    const offsetY = Number(pluginOptions?.labelOffsetY ?? 0);
                    const x = xPixel + 6 + (Number.isFinite(offsetX) ? offsetX : 0);
                    const y = chartArea.top + 6 + (Number.isFinite(offsetY) ? offsetY : 0);
                    ctx.fillText(labelText, x, y);
                }

                ctx.restore();
            }
        };

        Chart.register(plugin);
        ChartDataUtils._spotLinePluginRegistered = true;
    };

    ChartDataUtils.getExpectedMoves = function getExpectedMoves(data) {
        return data?.key_levels?.expected_moves
            ?? data?.v3_data?.expected_moves
            ?? data?.expected_moves;
    };

    ChartDataUtils.getDeltaFlipProfile = function getDeltaFlipProfile(data) {
        return data?.v3_data?.delta_flip_profile ?? data?.delta_flip_profile;
    };

    ChartDataUtils.getMaxPainProfile = function getMaxPainProfile(data) {
        return data?.v3_data?.max_pain_profile ?? data?.max_pain_profile;
    };

    ChartDataUtils.getDeltaData = function getDeltaData(data) {
        return data?.delta_data ?? data?.v3_data?.delta_data;
    };

    ChartDataUtils.getStrikes = function getStrikes(data) {
        const deltaData = ChartDataUtils.getDeltaData(data);
        const strikes = deltaData?.strikes;
        return Array.isArray(strikes) ? strikes : null;
    };

    ChartDataUtils.getFlowSentiment = function getFlowSentiment(data) {
        return data?.v3_data?.flow_sentiment ?? data?.flow_sentiment;
    };

    ChartDataUtils.getDealerPressureProfile = function getDealerPressureProfile(data) {
        return data?.v3_data?.dealer_pressure_profile ?? data?.dealer_pressure_profile;
    };

    ChartDataUtils.getMMPnl = function getMMPnl(data) {
        return data?.v3_data?.mm_pnl ?? data?.mm_pnl;
    };
 })(window);
