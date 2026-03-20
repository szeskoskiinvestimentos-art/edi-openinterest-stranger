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
                     ctx.fillText(labelText, xPixel + 6, chartArea.top + 6);
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

    ChartDataUtils.registerVLinesPlugin = function registerVLinesPlugin() {
        const Chart = global?.Chart;
        if (!Chart || typeof Chart.register !== 'function') return;
        if (ChartDataUtils._vLinesPluginRegistered) return;

        const parseMaybePtBrNumber = (val) => {
            if (typeof val === 'number') return val;
            if (typeof val !== 'string') return Number(val);
            const s = val.trim();
            const looksLikePtBr = /^\d{1,3}(\.\d{3})+(,\d+)?$/.test(s);
            if (!looksLikePtBr) return Number(s);
            const normalized = s.replace(/\./g, '').replace(',', '.');
            return Number(normalized);
        };

        const plugin = {
            id: 'vLines',
            afterDatasetsDraw(chart) {
                const lines = chart?.options?.plugins?.vLines?.lines;
                if (!Array.isArray(lines) || lines.length === 0) return;

                const xScale = chart?.scales?.x ?? Object.values(chart?.scales ?? {}).find((s) => s?.axis === 'x');
                if (!xScale || typeof xScale.getPixelForValue !== 'function') return;
                const chartArea = chart?.chartArea;
                if (!chartArea) return;

                const ctx = chart.ctx;
                ctx.save();

                let labelRow = 0;
                for (const l of lines) {
                    const value = Number(l?.value);
                    if (!Number.isFinite(value)) continue;

                    let xPixel = null;
                    if (xScale.type === 'category') {
                        const labelsIn = chart?.data?.labels;
                        const labels = Array.isArray(labelsIn) ? labelsIn : [];
                        const numericLabels = labels
                            .map((lab) => parseMaybePtBrNumber(lab))
                            .map((n, i) => ({ n, i }))
                            .filter((p) => Number.isFinite(p.n));
                        if (numericLabels.length === 0) continue;

                        const min = Math.min(...numericLabels.map((p) => p.n));
                        const max = Math.max(...numericLabels.map((p) => p.n));
                        if (value < min || value > max) continue;

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
                        if (!lo || !hi) continue;

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
                        if (Number.isFinite(min) && Number.isFinite(max) && (value < min || value > max)) continue;
                        xPixel = xScale.getPixelForValue(value);
                    }

                    if (!Number.isFinite(xPixel)) continue;

                    const color = l?.color ?? '#ff00ff';
                    const width = Number(l?.width ?? 2);
                    const dash = Array.isArray(l?.dash) ? l.dash : [6, 4];

                    ctx.lineWidth = Number.isFinite(width) ? width : 2;
                    ctx.strokeStyle = color;
                    if (typeof ctx.setLineDash === 'function') ctx.setLineDash(dash);
                    ctx.beginPath();
                    ctx.moveTo(xPixel, chartArea.top);
                    ctx.lineTo(xPixel, chartArea.bottom);
                    ctx.stroke();
                    if (typeof ctx.setLineDash === 'function') ctx.setLineDash([]);

                    const labelText = typeof l?.labelText === 'string' ? l.labelText : '';
                    if (labelText) {
                        ctx.fillStyle = color;
                        ctx.font = l?.font ?? '12px Orbitron';
                        ctx.textBaseline = 'top';
                        const offsetX = Number(l?.labelOffsetX ?? 0);
                        const offsetY = Number(l?.labelOffsetY ?? 0);
                        const labelPadding = 6;
                        const lineHeight = Number(l?.labelLineHeight ?? 16);
                        const pos = String(l?.labelPosition ?? 'top').toLowerCase();

                        const yBase = pos === 'bottom'
                            ? (chartArea.bottom - labelPadding - lineHeight * (labelRow + 1))
                            : (chartArea.top + labelPadding + lineHeight * labelRow);
                        const y = yBase + (Number.isFinite(offsetY) ? offsetY : 0);

                        const textWidth = ctx.measureText(labelText).width || 0;
                        const xBase = xPixel + labelPadding;
                        const xClamped = Math.max(
                            chartArea.left + labelPadding,
                            Math.min(xBase, chartArea.right - labelPadding - textWidth)
                        );
                        const x = xClamped + (Number.isFinite(offsetX) ? offsetX : 0);

                        ctx.fillText(labelText, x, y);
                        labelRow += 1;
                    }
                }

                ctx.restore();
            }
        };

        Chart.register(plugin);
        ChartDataUtils._vLinesPluginRegistered = true;
    };

    ChartDataUtils.getDisplayScaleFactor = function getDisplayScaleFactor(marketData) {
        const scale = Number(marketData?.scale_diagnostics?.display_scale_factor);
        if (Number.isFinite(scale) && scale > 0) return scale;

        const ewzSpot = Number(marketData?.scale_diagnostics?.ewz_spot ?? marketData?.spot_price ?? marketData?.spot);
        const idxSpot = Number(marketData?.scale_diagnostics?.index_spot ?? marketData?.overview?.spot_price ?? marketData?.overview?.spot);
        if (Number.isFinite(ewzSpot) && ewzSpot > 0 && Number.isFinite(idxSpot) && idxSpot > 0) return idxSpot / ewzSpot;

        return 1;
    };

    ChartDataUtils.renderEwzOptionsOiChart = function renderEwzOptionsOiChart(opts) {
        const payload = opts?.payload ?? global.yahooEwzOptionsData;
        if (!payload || typeof payload !== 'object') return;

        const canvas = opts?.canvas ?? global.document?.getElementById?.(opts?.canvasId ?? 'ewzOptionsOiChart');
        const select = opts?.select ?? global.document?.getElementById?.(opts?.selectId ?? 'ewzOptionsExpirySelect');
        const minOiEl = opts?.minOiEl ?? global.document?.getElementById?.(opts?.minOiId ?? 'ewzOptionsMinOi');
        const meansAllEl = opts?.meansAllEl ?? global.document?.getElementById?.(opts?.meansAllId ?? 'ewzOptionsMeansAll');
        if (!canvas || !select || !minOiEl) return;

        const Chart = opts?.Chart ?? global.Chart;
        if (!Chart) return;

        const expiries = Array.isArray(payload.expiries) ? payload.expiries.map((e) => String(e)) : [];
        const byExpiry = payload.by_expiry && typeof payload.by_expiry === 'object' ? payload.by_expiry : {};
        if (expiries.length === 0) return;

        const marketData = opts?.marketData;
        const scaleFactor = ChartDataUtils.getDisplayScaleFactor(marketData);
        const toIndexScale = (strike) => {
            const s = Number(strike);
            if (!Number.isFinite(s)) return null;
            if (!Number.isFinite(scaleFactor) || scaleFactor <= 0 || scaleFactor === 1) return s;
            if (s < 0 || s > 1000) return s;
            return s * scaleFactor;
        };

        const buildPoints = (expiry, minOi) => {
            const row = byExpiry?.[expiry];
            const strikesIn = row?.strikes;
            const callOiIn = row?.call_oi;
            const putOiIn = row?.put_oi;
            if (!Array.isArray(strikesIn) || !Array.isArray(callOiIn) || !Array.isArray(putOiIn)) return [];
            const n = Math.min(strikesIn.length, callOiIn.length, putOiIn.length);
            const points = [];
            for (let i = 0; i < n; i++) {
                const s0 = toIndexScale(strikesIn[i]);
                if (s0 === null) continue;
                const c = Number(callOiIn[i]);
                const p = Number(putOiIn[i]);
                const cOk = Number.isFinite(c) ? Math.max(0, c) : 0;
                const pOk = Number.isFinite(p) ? Math.max(0, p) : 0;
                if (cOk < minOi && pOk < minOi) continue;
                points.push({ strike: s0, call: cOk, put: pOk, total: cOk + pOk });
            }
            points.sort((a, b) => a.strike - b.strike);
            return points;
        };

        const calcMeans = (points) => {
            if (!Array.isArray(points) || points.length === 0) return null;
            const strikes = points.map((p) => Number(p.strike)).filter((n) => Number.isFinite(n));
            if (strikes.length === 0) return null;
            const min = Math.min(...strikes);
            const max = Math.max(...strikes);
            const midRange = (min + max) / 2;

            let wSum = 0;
            let vSum = 0;
            for (const p of points) {
                const s = Number(p.strike);
                const w = Number(p.total);
                if (!Number.isFinite(s) || !Number.isFinite(w) || w < 0) continue;
                wSum += s * w;
                vSum += w;
            }
            const meanByOi = vSum > 0 ? (wSum / vSum) : (strikes.reduce((a, b) => a + b, 0) / strikes.length);
            return { midRange, meanByOi };
        };

        const charts = opts?.charts && typeof opts.charts === 'object' ? opts.charts : (global.__ewzOptionsChartsHost ?? (global.__ewzOptionsChartsHost = {}));
        const chartKey = typeof opts?.chartKey === 'string' && opts.chartKey ? opts.chartKey : 'ewzOptionsOi';
        const chartOptions = opts?.chartOptions && typeof opts.chartOptions === 'object' ? opts.chartOptions : {};
        const formatStrikeLabel = typeof opts?.formatStrikeLabel === 'function' ? opts.formatStrikeLabel : (n) => String(n);
        const formatMeanValue = typeof opts?.formatMeanValue === 'function' ? opts.formatMeanValue : formatStrikeLabel;
        const formatYTick = typeof opts?.formatYTick === 'function' ? opts.formatYTick : (n) => String(n);

        const storageKey = typeof opts?.storageKey === 'string' && opts.storageKey ? opts.storageKey : 'ewz_options_expiry';
        const expiriesKey = expiries.join('|');

        if (select.__ewzOptionsExpiriesKey !== expiriesKey) {
            select.innerHTML = '';
            for (const e of expiries) {
                const opt = global.document.createElement('option');
                opt.value = e;
                opt.textContent = e;
                select.appendChild(opt);
            }
            select.__ewzOptionsExpiriesKey = expiriesKey;
        }

        const current = String(select.value || global.localStorage?.getItem?.(storageKey) || '');
        const wanted = expiries.includes(current) ? current : expiries[0];
        select.value = wanted;
        global.localStorage?.setItem?.(storageKey, wanted);

        const updateMeansAll = () => {
            if (!meansAllEl) return;
            const minOi = Math.max(0, Number(minOiEl.value || 0));
            const perExp = expiries
                .map((e) => ({ e, points: buildPoints(e, minOi) }))
                .map((x) => ({ e: x.e, means: calcMeans(x.points) }))
                .filter((x) => x.means && Number.isFinite(x.means.midRange) && Number.isFinite(x.means.meanByOi));
            if (perExp.length === 0) {
                meansAllEl.innerText = '';
                return;
            }
            const avgMidRange = perExp.reduce((acc, x) => acc + x.means.midRange, 0) / perExp.length;
            const avgMeanByOi = perExp.reduce((acc, x) => acc + x.means.meanByOi, 0) / perExp.length;
            meansAllEl.innerText = `Médias (todos vencimentos): Intervalo ${formatMeanValue(avgMidRange)} | Por OI ${formatMeanValue(avgMeanByOi)}`;
        };

        const render = () => {
            const expiry = String(select.value || expiries[0] || '');
            global.localStorage?.setItem?.(storageKey, expiry);
            const minOi = Math.max(0, Number(minOiEl.value || 0));
            updateMeansAll();

            const points = buildPoints(expiry, minOi);
            if (!points || points.length === 0) {
                if (meansAllEl) meansAllEl.innerText = 'Sem dados para o filtro atual.';
                return;
            }
            const means = calcMeans(points);
            if (!means) return;

            if (charts[chartKey]) charts[chartKey].destroy();

            const labels = points.map((p) => formatStrikeLabel(p.strike));
            const call = points.map((p) => p.call);
            const put = points.map((p) => p.put);

            const options = {
                ...chartOptions,
                plugins: {
                    ...(chartOptions.plugins ?? {}),
                    spotLine: false,
                    vLines: {
                        lines: [
                            {
                                value: means.midRange,
                                color: '#00f3ff',
                                dash: [6, 4],
                                width: 2,
                                labelText: `Média (intervalo): ${formatMeanValue(means.midRange)}`,
                                labelOffsetY: 0
                            },
                            {
                                value: means.meanByOi,
                                color: '#ff00ff',
                                dash: [2, 6],
                                width: 2,
                                labelText: `Média (por OI): ${formatMeanValue(means.meanByOi)}`,
                                labelOffsetY: 18
                            }
                        ]
                    }
                },
                scales: {
                    ...(chartOptions.scales ?? {}),
                    x: {
                        ...((chartOptions.scales ?? {}).x ?? {}),
                        stacked: true,
                        ticks: {
                            ...(((chartOptions.scales ?? {}).x ?? {}).ticks ?? {}),
                            callback: (value) => value
                        }
                    },
                    y: {
                        ...((chartOptions.scales ?? {}).y ?? {}),
                        stacked: true,
                        ticks: {
                            ...(((chartOptions.scales ?? {}).y ?? {}).ticks ?? {}),
                            callback: (value) => formatYTick(value)
                        }
                    }
                }
            };

            charts[chartKey] = new Chart(canvas, {
                type: 'bar',
                data: {
                    labels,
                    datasets: [
                        {
                            label: 'Call OI',
                            data: call,
                            backgroundColor: 'rgba(0, 255, 0, 0.7)',
                            borderColor: 'rgba(0, 255, 0, 1)',
                            borderWidth: 1
                        },
                        {
                            label: 'Put OI',
                            data: put,
                            backgroundColor: 'rgba(255, 7, 58, 0.7)',
                            borderColor: 'rgba(255, 7, 58, 1)',
                            borderWidth: 1
                        }
                    ]
                },
                options
            });
        };

        select.__ewzOptionsRender = render;
        if (!select.__ewzOptionsListenersAttached) {
            select.addEventListener('change', () => {
                if (typeof select.__ewzOptionsRender === 'function') select.__ewzOptionsRender();
            });
            select.__ewzOptionsListenersAttached = true;
        }

        if (!minOiEl.__ewzOptionsListenersAttached) {
            minOiEl.addEventListener('change', () => {
                if (typeof select.__ewzOptionsRender === 'function') select.__ewzOptionsRender();
            });
            minOiEl.addEventListener('keyup', (e) => {
                if (e && e.key === 'Enter' && typeof select.__ewzOptionsRender === 'function') select.__ewzOptionsRender();
            });
            minOiEl.__ewzOptionsListenersAttached = true;
        }

        ChartDataUtils.registerVLinesPlugin();
        updateMeansAll();
        render();
    };
 })(window);
