/**
 * Stranger Things Charts Module
 * Creates interactive charts with neon styling
 */

class StrangerThingsCharts {
    constructor() {
        this.charts = {};
        this.chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#ffffff',
                        font: {
                            family: 'Share Tech Mono',
                            size: 12
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(26, 26, 26, 0.9)',
                    titleColor: '#00f3ff',
                    bodyColor: '#ffffff',
                    borderColor: '#ff073a',
                    borderWidth: 1,
                    titleFont: {
                        family: 'Orbitron',
                        size: 14
                    },
                    bodyFont: {
                        family: 'Share Tech Mono',
                        size: 12
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#b3b3b3',
                        font: {
                            family: 'Share Tech Mono',
                            size: 11
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                        borderColor: 'rgba(255, 255, 255, 0.2)'
                    }
                },
                y: {
                    ticks: {
                        color: '#b3b3b3',
                        font: {
                            family: 'Share Tech Mono',
                            size: 11
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                        borderColor: 'rgba(255, 255, 255, 0.2)'
                    }
                }
            },
        };

        this.chartOptions.plugins.tooltip.callbacks = {
            label: (context) => {
                const dataset = context.dataset || {};
                const label = dataset.label ? dataset.label : '';
                const raw = context.raw;
                const isNumber = typeof raw === 'number' && !isNaN(raw);
                const value = isNumber ? this.formatNumberBr(raw, 2) : raw;
                return label ? label + ': ' + value : value;
            }
        };

        this.chartOptions.scales.y.ticks.callback = (value) => this.formatNumberBr(value, 2);
        
        this.init();
    }

    async init() {
        try {
            const data = await this.loadMarketData();
            const ensureSpotLinePlugin = () => {
                const Chart = window?.Chart;
                if (!Chart || typeof Chart.register !== 'function') return;
                if (window.__ediSpotLinePluginRegistered) return;

                Chart.register({
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
                });

                window.__ediSpotLinePluginRegistered = true;
            };

            const getSpotFallback = (d) => {
                const spot = Number(d?.overview?.spot_price ?? d?.overview?.spot ?? d?.spot_price ?? d?.spot);
                return Number.isFinite(spot) ? spot : null;
            };

            const utils = window.ChartDataUtils;
            const spot = utils?.getSpot ? utils.getSpot(data) : getSpotFallback(data);
            if (spot !== null) {
                this.chartOptions.plugins.spotLine = {
                    value: spot,
                    color: 'lime',
                    dash: [4, 4],
                    width: 2,
                    labelText: `SPOT ${spot.toFixed(2)}`
                };
            }
            const safe = (label, fn) => {
                try {
                    fn();
                } catch (err) {
                    console.error(`Erro em ${label}:`, err);
                }
            };
            safe('updateMetrics', () => this.updateMetrics(data));
            safe('updateKeyLevels', () => this.updateKeyLevels(data));
            safe('updateNtslCode', () => this.updateNtslCode(data));
            safe('populateTable', () => this.populateTable(data));
            safe('createFairValueTable', () => this.createFairValueTable(data));
            safe('updateLastUpdate', () => this.updateLastUpdate(data));
            const hasChart = await this.waitForChartJs(2500);
            if (!hasChart) {
                this.showChartLibraryWarning();
                return;
            }
            safe('registerSpotLinePlugin', () => {
                if (utils?.registerSpotLinePlugin) {
                    utils.registerSpotLinePlugin();
                } else {
                    ensureSpotLinePlugin();
                }
            });
            safe('createDeltaChart', () => this.createDeltaChart(data));
            safe('createGammaChart', () => this.createGammaChart(data));
            safe('createVolatilityChart', () => this.createVolatilityChart(data));
            safe('createFedWatchTable', () => this.createFedWatchTable(data));
            safe('createMostActivesTable', () => this.createMostActivesTable(data));
            safe('createOIByExpiryChart', () => this.createOIByExpiryChart(data));
            safe('createVolumeVolatilityChart', () => this.createVolumeVolatilityChart(data));
            safe('createOIStrikeChart', () => this.createOIStrikeChart(data));
            safe('createGexSplitChart', () => this.createGexSplitChart(data));
            safe('createVannaChart', () => this.createVannaChart(data));
            safe('createCharmChart', () => this.createCharmChart(data));
            safe('createThetaChart', () => this.createThetaChart(data));
            safe('createVegaChart', () => this.createVegaChart(data));
            safe('createPinRiskChart', () => this.createPinRiskChart(data));
            safe('createCharmCumChart', () => this.createCharmCumChart(data));
            safe('createVannaCumChart', () => this.createVannaCumChart(data));
            safe('createThetaCumChart', () => this.createThetaCumChart(data));
            safe('createRGammaChart', () => this.createRGammaChart(data));
            safe('createRGammaCumChart', () => this.createRGammaCumChart(data));
            safe('createMaxPainChart', () => this.createMaxPainChart(data));
            safe('createExpectedMoveChart', () => this.createExpectedMoveChart(data));
            safe('createGammaFlipConeChart', () => this.createGammaFlipConeChart(data));
            safe('createDeltaFlipProfileChart', () => this.createDeltaFlipProfileChart(data));
            safe('createFlowSentimentChart', () => this.createFlowSentimentChart(data));
            safe('createMMPnLChart', () => this.createMMPnLChart(data));
            safe('createDealerPressureChart', () => this.createDealerPressureChart(data));
            safe('createDeltaAgregadoChart', () => this.createDeltaAgregadoChart(data));
        } catch (error) {
            console.error('Error initializing charts:', error);
        }
    }

    waitForChartJs(timeoutMs = 2500) {
        const start = Date.now();
        return new Promise((resolve) => {
            const tick = () => {
                if (window.Chart) return resolve(true);
                if (Date.now() - start >= timeoutMs) return resolve(false);
                setTimeout(tick, 50);
            };
            tick();
        });
    }

    async loadMarketData() {
        try {
            // Tenta usar variável global primeiro (funciona sem servidor/CORS)
            if (window.marketData) {
                console.log('Carregando dados da variável global (marketData)...');
                return window.marketData;
            }

            // Fallback para fetch (caso o arquivo JS falhe ou não exista)
            console.log('Variável global não encontrada, tentando fetch...');
            const response = await fetch('assets/data/market_data.json');
            if (!response.ok) {
                throw new Error('Failed to load market data');
            }
            return await response.json();
        } catch (error) {
            console.error('Error loading market data:', error);
            // Fallback data
            this.showFallbackWarning();
            return this.getFallbackData();
        }
    }

    showChartLibraryWarning() {
        if (document.getElementById('edi-chart-lib-warning')) return;
        const warning = document.createElement('div');
        warning.id = 'edi-chart-lib-warning';
        warning.style.position = 'fixed';
        warning.style.top = '0';
        warning.style.left = '0';
        warning.style.width = '100%';
        warning.style.backgroundColor = '#0b5cff';
        warning.style.color = '#ffffff';
        warning.style.textAlign = 'center';
        warning.style.padding = '10px';
        warning.style.zIndex = '9999';
        warning.style.fontWeight = 'bold';
        warning.style.fontFamily = 'Orbitron';
        warning.innerText = '⚠️ Chart.js não carregou (rede/CDN bloqueado). Valores e níveis foram carregados, mas os gráficos foram desabilitados.';
        document.body.prepend(warning);
    }

    showFallbackWarning() {
        const warning = document.createElement('div');
        warning.style.position = 'fixed';
        warning.style.top = '0';
        warning.style.left = '0';
        warning.style.width = '100%';
        warning.style.backgroundColor = '#ff0000';
        warning.style.color = '#ffffff';
        warning.style.textAlign = 'center';
        warning.style.padding = '10px';
        warning.style.zIndex = '9999';
        warning.style.fontWeight = 'bold';
        warning.style.fontFamily = 'Orbitron';
        warning.innerText = '⚠️ MODO DEMONSTRAÇÃO: Dados reais não encontrados. Verifique se export_v1_data.py foi executado.';
        document.body.prepend(warning);
    }

    getFallbackData() {
        return {
            delta_data: {
                strikes: [5.6, 5.7, 5.8, 5.9, 6.0, 6.1, 6.2, 6.3, 6.4, 6.5],
                delta_cumulative: [-1200, -2000, -2400, -2500, -2300, -1800, -1000, 100, 1500, 3100]
            },
            gamma_data: {
                strikes: [5.6, 5.7, 5.8, 5.9, 6.0, 6.1, 6.2, 6.3, 6.4, 6.5],
                gamma_exposure: [5400, 8160, 10680, 14400, 17400, 15840, 12960, 10200, 7440, 4560],
                gamma_call: [3000, 4000, 5000, 7000, 9000, 8000, 6000, 5000, 4000, 2000],
                gamma_put: [-2400, -4160, -5680, -7400, -8400, -7840, -6960, -5200, -3440, -2560]
            },
            volume_data: {
                strikes: [5.6, 5.7, 5.8, 5.9, 6.0, 6.1, 6.2, 6.3, 6.4, 6.5],
                call_volume: [1200, 1800, 2400, 2100, 3200, 2800, 3600, 4200, 3800, 2400],
                put_volume: [800, 1200, 1600, 1400, 2100, 1900, 2400, 2800, 2600, 1600]
            },
            volatility_data: {
                strikes: [5.6, 5.7, 5.8, 5.9, 6.0, 6.1, 6.2, 6.3, 6.4, 6.5],
                iv_values: [18.5, 17.8, 17.2, 16.8, 16.5, 16.3, 16.4, 16.7, 17.1, 17.6]
            },
            greeks_2nd_order: {
                strikes: [5.6, 5.7, 5.8, 5.9, 6.0, 6.1, 6.2, 6.3, 6.4, 6.5],
                charm: [10, 20, 30, 40, 50, 40, 30, 20, 10, 5],
                vanna: [5, 10, 15, 20, 25, 20, 15, 10, 5, 2],
                theta: [-100, -200, -300, -400, -500, -400, -300, -200, -100, -50]
            },
            overview: {
                total_trades: 15420,
                total_volume: 1258400,
                gamma_exposure: -45000,
                delta_position: 23000
            },
            detailed_data: [
                { strike: 5.6, delta: -0.85, gamma: 0.045, volume: 1200, oi: 8500, iv: 18.5 }
            ]
        };
    }

    updateLastUpdate(data) {
        const label = document.getElementById('last-update-label');
        if (!label) return;

        let raw = data.last_updated;
        if (!raw && data.overview && data.overview.last_update) {
            raw = data.overview.last_update;
        }
        if (!raw) return;

        try {
            const date = new Date(raw);
            if (!isNaN(date.getTime())) {
                const formatted = date.toLocaleString('pt-BR');
                label.textContent = `• Último update: ${formatted}`;
            } else {
                label.textContent = `• Último update: ${raw}`;
            }
        } catch {
            label.textContent = `• Último update: ${raw}`;
        }
    }

    createDeltaChart(data) {
        const ctx = document.getElementById('deltaChart');
        if (!ctx) return;

        const deltaData = data?.delta_data ?? data?.v3_data?.delta_data;
        if (!deltaData || !Array.isArray(deltaData.strikes) || !Array.isArray(deltaData.delta_cumulative) || deltaData.strikes.length === 0) return;

        const length = Math.min(deltaData.strikes.length, deltaData.delta_cumulative.length);
        if (length === 0) return;
        const strikes = deltaData.strikes.slice(0, length);
        const deltaCum = deltaData.delta_cumulative.slice(0, length);

        this.charts.delta = new Chart(ctx, {
            type: 'line',
            data: {
                labels: strikes.map(s => this.formatNumberBr(s, 0)),
                datasets: [{
                    label: 'Delta Acumulado',
                    data: deltaCum,
                    borderColor: '#ff073a',
                    backgroundColor: 'rgba(255, 7, 58, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#ff073a',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                ...this.chartOptions,
                plugins: {
                    ...this.chartOptions.plugins,
                    title: {
                        display: true,
                        text: 'Delta Acumulado por Strike',
                        color: '#ff00ff',
                        font: {
                            family: 'Orbitron',
                            size: 16,
                            weight: 'bold'
                        }
                    }
                }
            }
        });
    }

    createGammaChart(data) {
        const ctx = document.getElementById('gammaChart');
        if (!ctx) return;

        this.charts.gamma = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.gamma_data.strikes.map(s => this.formatNumberBr(s, 0)),
                datasets: [{
                    label: 'Gamma Exposure',
                    data: data.gamma_data.gamma_exposure,
                    backgroundColor: 'rgba(0, 243, 255, 0.7)',
                    borderColor: '#00f3ff',
                    borderWidth: 2,
                    borderRadius: 5
                }]
            },
            options: {
                ...this.chartOptions,
                plugins: {
                    ...this.chartOptions.plugins,
                    title: {
                        display: true,
                        text: 'Gamma Exposure (Net)',
                        color: '#ff00ff',
                        font: {
                            family: 'Orbitron',
                            size: 16,
                            weight: 'bold'
                        }
                    }
                }
            }
        });
    }


    createVolatilityChart(data) {
        const ctx = document.getElementById('volatilityChart');
        if (!ctx) return;

        const utils = window.ChartDataUtils;
        const volData = utils?.getVolatilityData ? utils.getVolatilityData(data) : (data?.v3_data?.volatility_data ?? data?.volatility_data);
        const strikesIn = Array.isArray(volData?.strikes) ? volData.strikes : [];
        const ivIn = Array.isArray(volData?.iv_values) ? volData.iv_values : [];
        const skewIn = Array.isArray(volData?.skew) ? volData.skew : [];

        const baseLen = Math.min(strikesIn.length, ivIn.length);
        if (baseLen === 0) {
            if (ctx.parentElement) ctx.parentElement.innerHTML = '<div class="loading-text">Dados indisponíveis</div>';
            return;
        }

        const hasSkewRaw = skewIn.length === strikesIn.length && skewIn.length === ivIn.length && skewIn.length > 0;
        const points = [];
        for (let i = 0; i < baseLen; i++) {
            const strike = Number(strikesIn[i]);
            const iv = Number(ivIn[i]);
            if (!Number.isFinite(strike) || !Number.isFinite(iv)) continue;
            const skew = hasSkewRaw ? Number(skewIn[i]) : null;
            points.push({ strike, iv, skew: Number.isFinite(skew) ? skew : null });
        }
        if (points.length === 0) {
            if (ctx.parentElement) ctx.parentElement.innerHTML = '<div class="loading-text">Dados indisponíveis</div>';
            return;
        }
        points.sort((a, b) => a.strike - b.strike);

        const labels = points.map((p) => this.formatNumberBr(p.strike, 0));
        const ivValues = points.map((p) => p.iv);
        const hasSkew = points.some((p) => p.skew !== null);
        const skewValues = hasSkew
            ? points.map((p) => {
                  const v = p.skew ?? 0;
                  return Math.abs(v) < 1e-10 ? 0 : v;
              })
            : [];

        const datasets = [{
            label: 'Volatilidade Implícita (%)',
            data: ivValues,
            borderColor: '#ffff00',
            backgroundColor: 'rgba(255, 255, 0, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#ffff00',
            pointBorderColor: '#000000',
            pointBorderWidth: 2,
            pointRadius: 6,
            yAxisID: 'y'
        }];

        if (hasSkew) {
            datasets.push({
                label: 'IV Skew (Derivada)',
                data: skewValues,
                borderColor: '#ff00ff',
                backgroundColor: 'rgba(255, 0, 255, 0.1)',
                borderWidth: 2,
                borderDash: [5, 5],
                fill: false,
                tension: 0.4,
                pointRadius: 3,
                yAxisID: 'y1'
            });
        }

        this.charts.volatility = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: datasets
            },
            options: {
                ...this.chartOptions,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    ...this.chartOptions.plugins,
                    title: {
                        display: true,
                        text: 'Volatilidade Implícita & Skew',
                        color: '#ff00ff',
                        font: {
                            family: 'Orbitron',
                            size: 16,
                            weight: 'bold'
                        }
                    }
                },
                scales: {
                    ...this.chartOptions.scales,
                    y: {
                        ...this.chartOptions.scales.y,
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Volatilidade (%)',
                            color: '#ffff00'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: hasSkew,
                        position: 'right',
                        grid: {
                            drawOnChartArea: false, // only want the grid lines for one axis to show up
                            color: 'rgba(255, 0, 255, 0.2)'
                        },
                        ticks: {
                            color: '#ff00ff',
                            font: { family: 'Share Tech Mono' },
                            callback: (v) => {
                                const n = Number(v);
                                if (!Number.isFinite(n)) return '';
                                if (Math.abs(n) < 1e-10) return '0';
                                return this.formatNumberBr(n, 4);
                            }
                        },
                        title: {
                            display: true,
                            text: 'Skew Slope',
                            color: '#ff00ff'
                        }
                    }
                }
            }
        });
    }

    // NOVOS GRÁFICOS
    
    formatNumberBr(value, decimals = 2) {
        if (value === null || value === undefined || isNaN(value)) return '-';
        const factor = Math.pow(10, decimals);
        const rounded = Math.round(value * factor) / factor;
        return rounded.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    }

    formatCompactBr(value) {
        if (value === null || value === undefined || isNaN(value)) return '-';
        const abs = Math.abs(value);
        let divisor = 1;
        let suffix = '';
        if (abs >= 1e12) {
            divisor = 1e12;
            suffix = 'T';
        } else if (abs >= 1e9) {
            divisor = 1e9;
            suffix = 'B';
        } else if (abs >= 1e6) {
            divisor = 1e6;
            suffix = 'M';
        } else if (abs >= 1e3) {
            divisor = 1e3;
            suffix = 'K';
        } else {
            return this.formatNumberBr(value, 0);
        }
        const scaled = value / divisor;
        const formatted = scaled.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
        return `${formatted}${suffix}`;
    }

    estimateMostActivesScaleFactor(data) {
        const scaledStrikesRaw = data?.gamma_data?.strikes || data?.volume_data?.strikes || [];
        const most = data?.most_actives;
        const rawStrikes = [
            ...(most?.top_oi || []).map(x => x?.strike),
            ...(most?.top_vol || []).map(x => x?.strike)
        ].filter(x => Number.isFinite(x) && x > 0);

        if (rawStrikes.some(x => x > 1000)) return 1;
        const spot = data?.overview?.spot_price;
        if (!Number.isFinite(spot) || spot <= 5000) return 1;

        const scaledStrikes = (Array.isArray(scaledStrikesRaw) ? scaledStrikesRaw : [])
            .filter(x => Number.isFinite(x))
            .slice()
            .sort((a, b) => a - b);

        if (scaledStrikes.length < 2) return 1;
        if (rawStrikes.length === 0) return 1;

        const diffs = [];
        const diffCount = Math.min(200, scaledStrikes.length - 1);
        for (let i = 1; i <= diffCount; i++) {
            const d = scaledStrikes[i] - scaledStrikes[i - 1];
            if (Number.isFinite(d) && d > 0) diffs.push(d);
        }

        if (diffs.length === 0) return 1;
        diffs.sort((a, b) => a - b);
        const diffMedian = diffs[Math.floor(diffs.length / 2)];
        if (!Number.isFinite(diffMedian) || diffMedian <= 0) return 1;

        const tol = diffMedian * 0.25;
        const hasNear = (value) => {
            let lo = 0;
            let hi = scaledStrikes.length - 1;
            while (lo <= hi) {
                const mid = (lo + hi) >> 1;
                const v = scaledStrikes[mid];
                if (Math.abs(v - value) <= tol) return true;
                if (v < value) lo = mid + 1;
                else hi = mid - 1;
            }
            const v1 = scaledStrikes[Math.max(0, Math.min(scaledStrikes.length - 1, lo))];
            const v2 = scaledStrikes[Math.max(0, Math.min(scaledStrikes.length - 1, lo - 1))];
            return Math.abs(v1 - value) <= tol || Math.abs(v2 - value) <= tol;
        };

        const sample = rawStrikes.slice(0, 12);
        const scoreFor = (sf) => {
            if (!Number.isFinite(sf) || sf <= 0) return -1;
            let score = 0;
            for (const raw of sample) {
                const target = raw * sf;
                if (hasNear(target)) score += 1;
            }
            const spotRaw = spot / sf;
            const minRaw = Math.min(...rawStrikes);
            const maxRaw = Math.max(...rawStrikes);
            if (Number.isFinite(spotRaw) && spotRaw >= (minRaw - 2) && spotRaw <= (maxRaw + 2)) score += 2;
            return score;
        };

        const candidate1 = diffMedian;
        const candidate2 = diffMedian * 2;
        const score1 = scoreFor(candidate1);
        const score2 = scoreFor(candidate2);
        const best = score2 > score1 ? candidate2 : candidate1;

        if (!Number.isFinite(best) || best < 100 || best > 100000) return 1;
        return best;
    }

    normalizeMostActiveStrike(strike, data, scaleFactor) {
        if (!Number.isFinite(strike) || strike <= 0) return 0;
        const spot = data?.overview?.spot_price;
        if (Number.isFinite(spot) && spot > 5000 && strike < 1000 && Number.isFinite(scaleFactor) && scaleFactor > 1.2) {
            return strike * scaleFactor;
        }
        return strike;
    }

    createOIStrikeChart(data) {
        const ctx = document.getElementById('oiStrikeChart');
        if (!ctx) return;

        const hasOiShape = (obj) =>
            obj &&
            Array.isArray(obj.strikes) &&
            Array.isArray(obj.call_oi) &&
            Array.isArray(obj.put_oi) &&
            obj.strikes.length > 0 &&
            obj.call_oi.length === obj.strikes.length &&
            obj.put_oi.length === obj.strikes.length;

        const oiAll = hasOiShape(data?.oi_data) ? data.oi_data : null;
        const oiNearest = hasOiShape(data?.oi_data_nearest) ? data.oi_data_nearest : null;
        const oiSrc = oiAll ?? oiNearest;
        if (!oiSrc) return;

        // Gráfico de Barras Empilhadas (Call vs Put) para Total OI
        this.charts.oiStrike = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: oiSrc.strikes.map(s => this.formatNumberBr(s, 0)),
                datasets: [
                    {
                        label: 'Call OI',
                        data: oiSrc.call_oi,
                        backgroundColor: 'rgba(0, 255, 0, 0.6)', // Verde Neon
                        borderColor: '#00ff00',
                        borderWidth: 1
                    },
                    {
                        label: 'Put OI',
                        data: oiSrc.put_oi,
                        backgroundColor: 'rgba(255, 7, 58, 0.6)', // Vermelho Neon
                        borderColor: '#ff073a',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                ...this.chartOptions,
                plugins: {
                    ...this.chartOptions.plugins,
                    title: {
                        display: true,
                        text: 'Total Open Interest (Call vs Put)',
                        color: '#ff00ff',
                        font: {
                            family: 'Orbitron',
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    tooltip: {
                        ...this.chartOptions.plugins.tooltip,
                        callbacks: {
                            footer: (tooltipItems) => {
                                let total = 0;
                                tooltipItems.forEach((item) => {
                                    total += item.raw;
                                });
                                return 'Total: ' + this.formatNumberBr(total, 0);
                            },
                            label: (context) => {
                                const label = context.dataset.label || '';
                                const value = this.formatNumberBr(context.raw, 0);
                                return `${label}: ${value}`;
                            }
                        }
                    }
                },
                scales: {
                    ...this.chartOptions.scales,
                    x: {
                        ...this.chartOptions.scales.x,
                        stacked: true
                    },
                    y: {
                        ...this.chartOptions.scales.y,
                        stacked: true,
                        ticks: {
                            ...this.chartOptions.scales.y.ticks,
                            callback: (value) => this.formatNumberBr(value, 0)
                        }
                    }
                }
            }
        });
    }

    createGexSplitChart(data) {
        const ctx = document.getElementById('gexSplitChart');
        if (!ctx) return;

        this.charts.gexSplit = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.gamma_data.strikes.map(s => this.formatNumberBr(s, 0)),
                datasets: [
                    {
                        label: 'Gamma Call',
                        data: data.gamma_data.gamma_call,
                        backgroundColor: 'rgba(0, 255, 0, 0.6)',
                        borderColor: '#00ff00',
                        borderWidth: 1
                    },
                    {
                        label: 'Gamma Put',
                        data: data.gamma_data.gamma_put,
                        backgroundColor: 'rgba(255, 0, 0, 0.6)',
                        borderColor: '#ff0000',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                ...this.chartOptions,
                plugins: {
                    ...this.chartOptions.plugins,
                    title: {
                        display: true,
                        text: 'Gamma Exposure (Call vs Put)',
                        color: '#ff00ff',
                        font: {
                            family: 'Orbitron',
                            size: 16,
                            weight: 'bold'
                        }
                    }
                },
                scales: {
                    ...this.chartOptions.scales,
                    x: {
                        ...this.chartOptions.scales.x,
                        stacked: false // Lado a lado para melhor comparação
                    },
                    y: {
                        ...this.chartOptions.scales.y,
                        stacked: false
                    }
                }
            }
        });
    }

    createVannaChart(data) {
        const ctx = document.getElementById('vannaChart');
        if (!ctx) return;

        this.charts.vanna = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.greeks_2nd_order.strikes.map(s => this.formatNumberBr(s, 0)),
                datasets: [{
                    label: 'Vanna',
                    data: data.greeks_2nd_order.vanna,
                    borderColor: '#00ffff',
                    backgroundColor: 'rgba(0, 255, 255, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                ...this.chartOptions,
                plugins: {
                    ...this.chartOptions.plugins,
                    title: {
                        display: true,
                        text: 'Vanna Exposure por Strike',
                        color: '#ff00ff',
                        font: {
                            family: 'Orbitron',
                            size: 16,
                            weight: 'bold'
                        }
                    }
                }
            }
        });
    }

    createCharmChart(data) {
        const ctx = document.getElementById('charmChart');
        if (!ctx) return;

        this.charts.charm = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.greeks_2nd_order.strikes.map(s => this.formatNumberBr(s, 0)),
                datasets: [{
                    label: 'Charm',
                    data: data.greeks_2nd_order.charm,
                    borderColor: '#ff00ff',
                    backgroundColor: 'rgba(255, 0, 255, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                ...this.chartOptions,
                plugins: {
                    ...this.chartOptions.plugins,
                    title: {
                        display: true,
                        text: 'Charm Exposure por Strike',
                        color: '#ff00ff',
                        font: {
                            family: 'Orbitron',
                            size: 16,
                            weight: 'bold'
                        }
                    }
                }
            }
        });
    }

    createThetaChart(data) {
        const ctx = document.getElementById('thetaChart');
        if (!ctx) return;

        this.charts.theta = new Chart(ctx, {
            type: 'bar', // Theta geralmente é melhor visualizado como barra negativa
            data: {
                labels: data.greeks_2nd_order.strikes.map(s => this.formatNumberBr(s, 0)),
                datasets: [{
                    label: 'Theta',
                    data: data.greeks_2nd_order.theta,
                    borderColor: '#ffa500',
                    backgroundColor: 'rgba(255, 165, 0, 0.6)',
                    borderWidth: 1
                }]
            },
            options: {
                ...this.chartOptions,
                plugins: {
                    ...this.chartOptions.plugins,
                    title: {
                        display: true,
                        text: 'Theta Exposure por Strike',
                        color: '#ff00ff',
                        font: {
                            family: 'Orbitron',
                            size: 16,
                            weight: 'bold'
                        }
                    }
                }
            }
        });
    }



    updateMetrics(data) {
        const volumeTotal = data?.overview?.volume_total ?? data?.overview?.total_volume ?? 0;
        const sumTotalOi = (oi) => {
            if (!oi || !Array.isArray(oi.strikes) || oi.strikes.length === 0) return null;
            const length = oi.strikes.length;
            const total = Array.isArray(oi.total_oi) && oi.total_oi.length === length
                ? oi.total_oi
                : (Array.isArray(oi.call_oi) && Array.isArray(oi.put_oi) && oi.call_oi.length === length && oi.put_oi.length === length)
                    ? oi.call_oi.map((v, i) => (Number(v) || 0) + (Number(oi.put_oi[i]) || 0))
                    : null;
            if (!total) return null;
            return total.reduce((acc, v) => acc + (Number(v) || 0), 0);
        };
        const openInterestTotal = data?.overview?.open_interest_total
            ?? sumTotalOi(data?.oi_data)
            ?? sumTotalOi(data?.oi_data_nearest)
            ?? sumTotalOi(data?.v3_data?.oi_data)
            ?? sumTotalOi(data?.v3_data?.oi_data_nearest)
            ?? 0;
        const gammaExposure = data?.overview?.gamma_exposure ?? 0;
        const deltaPosition = data?.overview?.delta_position ?? 0;

        this.animateValue('total-trades', 0, volumeTotal, 2000);
        this.animateValue('volume-total', 0, openInterestTotal, 2000);
        this.animateValue('gamma-exposure', 0, gammaExposure, 2000);
        this.animateValue('delta-position', 0, deltaPosition, 2000);
    }

    animateValue(elementId, start, end, duration) {
        const element = document.getElementById(elementId);
        if (!element) return;

        const startTime = performance.now();
        const isNegative = end < 0;
        const absEnd = Math.abs(end);

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const current = Math.floor(start + (absEnd - start) * this.easeOutQuart(progress));
            const signed = isNegative ? -current : current;
            element.textContent = this.formatCompactBr(signed);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    easeOutQuart(t) {
        return 1 - Math.pow(1 - t, 4);
    }

    createVegaChart(data) {
        const ctx = document.getElementById('vegaChart');
        if (!ctx) return;

        this.charts.vega = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.greeks_2nd_order.strikes.map(s => this.formatNumberBr(s, 0)),
                datasets: [{
                    label: 'Vega Exposure',
                    data: data.greeks_2nd_order.vex,
                    backgroundColor: 'rgba(255, 165, 0, 0.6)',
                    borderColor: '#ffa500',
                    borderWidth: 1
                }]
            },
            options: {
                ...this.chartOptions,
                plugins: {
                    ...this.chartOptions.plugins,
                    title: {
                        display: true,
                        text: 'Vega Exposure por Strike',
                        color: '#ff00ff',
                        font: { family: 'Orbitron', size: 16, weight: 'bold' }
                    }
                }
            }
        });
    }

    createPinRiskChart(data) {
        const ctx = document.getElementById('pinRiskChart');
        if (!ctx) return;

        const hasOiShape = (obj) =>
            obj &&
            Array.isArray(obj.strikes) &&
            Array.isArray(obj.call_oi) &&
            Array.isArray(obj.put_oi) &&
            obj.strikes.length > 0 &&
            obj.call_oi.length === obj.strikes.length &&
            obj.put_oi.length === obj.strikes.length;

        const oiSrc = hasOiShape(data?.oi_data_nearest) ? data.oi_data_nearest : (hasOiShape(data?.oi_data) ? data.oi_data : null);
        if (!oiSrc) return;

        const totalOI = Array.isArray(oiSrc.total_oi) && oiSrc.total_oi.length === oiSrc.strikes.length
            ? oiSrc.total_oi
            : oiSrc.call_oi.map((v, i) => (Number(v) || 0) + (Number(oiSrc.put_oi[i]) || 0));

        this.charts.pinRisk = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: oiSrc.strikes.map(s => this.formatNumberBr(s, 0)),
                datasets: [{
                    label: 'Pin Risk Potential (Total OI)',
                    data: totalOI,
                    backgroundColor: 'rgba(255, 0, 255, 0.5)',
                    borderColor: '#ff00ff',
                    borderWidth: 1,
                    borderRadius: 5
                }]
            },
            options: {
                ...this.chartOptions,
                plugins: {
                    ...this.chartOptions.plugins,
                    title: {
                        display: true,
                        text: 'Pin Risk Potential',
                        color: '#ff00ff',
                        font: { family: 'Orbitron', size: 16, weight: 'bold' }
                    }
                }
            }
        });
    }

    createCharmCumChart(data) {
        const ctx = document.getElementById('charmCumChart');
        if (!ctx || !data.greeks_2nd_order.charm_cum) return;

        this.charts.charmCum = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.greeks_2nd_order.strikes.map(s => this.formatNumberBr(s, 0)),
                datasets: [{
                    label: 'Charm Acumulado',
                    data: data.greeks_2nd_order.charm_cum,
                    borderColor: '#ff00ff',
                    backgroundColor: 'rgba(255, 0, 255, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0
                }]
            },
            options: {
                ...this.chartOptions,
                plugins: {
                    ...this.chartOptions.plugins,
                    title: {
                        display: true,
                        text: 'Charm Acumulado',
                        color: '#ff00ff',
                        font: { family: 'Orbitron', size: 16, weight: 'bold' }
                    }
                }
            }
        });
    }

    createVannaCumChart(data) {
        const ctx = document.getElementById('vannaCumChart');
        if (!ctx || !data.greeks_2nd_order.vanna_cum) return;

        this.charts.vannaCum = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.greeks_2nd_order.strikes.map(s => this.formatNumberBr(s, 0)),
                datasets: [{
                    label: 'Vanna Acumulado',
                    data: data.greeks_2nd_order.vanna_cum,
                    borderColor: '#00ffff',
                    backgroundColor: 'rgba(0, 255, 255, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0
                }]
            },
            options: {
                ...this.chartOptions,
                plugins: {
                    ...this.chartOptions.plugins,
                    title: {
                        display: true,
                        text: 'Vanna Acumulado',
                        color: '#ff00ff',
                        font: { family: 'Orbitron', size: 16, weight: 'bold' }
                    }
                }
            }
        });
    }

    createRGammaChart(data) {
        const ctx = document.getElementById('rGammaChart');
        if (!ctx || !data.greeks_2nd_order.r_gamma) return;

        this.charts.rGamma = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.greeks_2nd_order.strikes.map(s => this.formatNumberBr(s, 0)),
                datasets: [{
                    label: 'R-Gamma (PVOP)',
                    data: data.greeks_2nd_order.r_gamma,
                    backgroundColor: (ctx) => {
                        const val = ctx.raw;
                        return val >= 0 ? 'rgba(0, 255, 0, 0.6)' : 'rgba(255, 0, 0, 0.6)';
                    },
                    borderColor: (ctx) => {
                        const val = ctx.raw;
                        return val >= 0 ? '#00ff00' : '#ff0000';
                    },
                    borderWidth: 1
                }]
            },
            options: {
                ...this.chartOptions,
                plugins: {
                    ...this.chartOptions.plugins,
                    title: {
                        display: true,
                        text: 'R-Gamma (PVOP) Exposure',
                        color: '#ff00ff',
                        font: { family: 'Orbitron', size: 16, weight: 'bold' }
                    }
                }
            }
        });
    }

    createRGammaCumChart(data) {
        const ctx = document.getElementById('rGammaCumChart');
        if (!ctx || !data.greeks_2nd_order.r_gamma_cum) return;

        this.charts.rGammaCum = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.greeks_2nd_order.strikes.map(s => this.formatNumberBr(s, 0)),
                datasets: [{
                    label: 'R-Gamma Acumulado',
                    data: data.greeks_2nd_order.r_gamma_cum,
                    borderColor: '#ffff00',
                    backgroundColor: 'rgba(255, 255, 0, 0.1)',
                    borderWidth: 3,
                    fill: {
                        target: 'origin',
                        above: 'rgba(0, 255, 0, 0.1)',
                        below: 'rgba(255, 0, 0, 0.1)'
                    },
                    tension: 0.4,
                    pointRadius: 0
                }]
            },
            options: {
                ...this.chartOptions,
                plugins: {
                    ...this.chartOptions.plugins,
                    title: {
                        display: true,
                        text: 'R-Gamma (PVOP) Acumulado',
                        color: '#ff00ff',
                        font: { family: 'Orbitron', size: 16, weight: 'bold' }
                    }
                }
            }
        });
    }

    createThetaCumChart(data) {
        const ctx = document.getElementById('thetaCumChart');
        if (!ctx || !data.greeks_2nd_order.theta_cum) return;

        this.charts.thetaCum = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.greeks_2nd_order.strikes.map(s => this.formatNumberBr(s, 0)),
                datasets: [{
                    label: 'Theta Acumulado',
                    data: data.greeks_2nd_order.theta_cum,
                    borderColor: '#ffa500',
                    backgroundColor: 'rgba(255, 165, 0, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0
                }]
            },
            options: {
                ...this.chartOptions,
                plugins: {
                    ...this.chartOptions.plugins,
                    title: {
                        display: true,
                        text: 'Theta Acumulado',
                        color: '#ff00ff',
                        font: { family: 'Orbitron', size: 16, weight: 'bold' }
                    }
                }
            }
        });
    }

    createMaxPainChart(data) {
        const ctx = document.getElementById('maxPainChart');
        if (!ctx) return;

        const utils = window.ChartDataUtils;
        const profile = utils?.getMaxPainProfile ? utils.getMaxPainProfile(data) : (data?.v3_data?.max_pain_profile ?? data?.max_pain_profile);
        const strikesIn = Array.isArray(profile?.strikes) ? profile.strikes : [];
        const lossIn = Array.isArray(profile?.loss) ? profile.loss : [];
        const baseLen = Math.min(strikesIn.length, lossIn.length);
        if (baseLen === 0) {
            if (ctx.parentElement) ctx.parentElement.innerHTML = '<div class="loading-text">Dados indisponíveis</div>';
            return;
        }

        const points = [];
        for (let i = 0; i < baseLen; i++) {
            const strike = Number(strikesIn[i]);
            const loss = Number(lossIn[i]);
            if (!Number.isFinite(strike) || !Number.isFinite(loss)) continue;
            points.push({ strike, loss });
        }
        if (points.length === 0) {
            if (ctx.parentElement) ctx.parentElement.innerHTML = '<div class="loading-text">Dados indisponíveis</div>';
            return;
        }
        points.sort((a, b) => a.strike - b.strike);
        const labels = points.map((p) => this.formatNumberBr(p.strike, 0));
        const loss = points.map((p) => p.loss);

        this.charts.maxPain = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Perda dos Compradores (Valor Intrínseco)',
                    data: loss,
                    borderColor: '#ff0000',
                    backgroundColor: 'rgba(255, 0, 0, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0
                }]
            },
            options: {
                ...this.chartOptions,
                plugins: {
                    ...this.chartOptions.plugins,
                    title: {
                        display: true,
                        text: 'Max Pain Curve',
                        color: '#ff00ff',
                        font: { family: 'Orbitron', size: 16, weight: 'bold' }
                    }
                },
                scales: {
                    ...this.chartOptions.scales,
                    y: {
                        ...this.chartOptions.scales.y,
                        ticks: {
                            ...this.chartOptions.scales.y.ticks,
                            callback: (value) => 'R$ ' + this.formatNumberBr(value / 1000000, 1) + 'M'
                        }
                    }
                }
            }
        });
    }

    createGammaFlipConeChart(data) {
        const ctx = document.getElementById('gammaFlipConeChart');
        if (!ctx) return;

        const storageKey = `gammaFlipConeScope:${location.pathname}`;
        const utils = window.ChartDataUtils;
        const payload = utils?.getGammaFlipConePayload
            ? utils.getGammaFlipConePayload(data)
            : {
                coneAll: data?.v3_data?.gamma_flip_cone ?? data?.gamma_flip_cone,
                coneNearest: data?.v3_data?.gamma_flip_cone_nearest ?? data?.gamma_flip_cone_nearest,
                nearestExpiry: data?.v3_data?.gamma_flip_cone_nearest_expiry ?? data?.gamma_flip_cone_nearest_expiry
            };

        const normalizeCone = utils?.normalizeGammaFlipCone || ((cone) => {
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
        });

        const nearestExpiry = payload.nearestExpiry;
        const coneAll = normalizeCone(payload.coneAll);
        const coneNearest = normalizeCone(payload.coneNearest);
        if (!coneAll) {
            if (ctx.parentElement) ctx.parentElement.innerHTML = '<div class="loading-text">Dados indisponíveis</div>';
            return;
        }

        const getSelectedScope = () => {
            const saved = (localStorage.getItem(storageKey) || '').toLowerCase();
            if (saved === 'nearest' && coneNearest) return 'nearest';
            return 'all';
        };
        const setSelectedScope = (scope) => localStorage.setItem(storageKey, scope);

        const resolveConeData = (scope) => (scope === 'nearest' && coneNearest ? coneNearest : coneAll);

        const scope = getSelectedScope();
        const coneData = resolveConeData(scope);

        if (coneNearest) {
            const host = ctx.parentElement;
            if (host) {
                const existing = host.querySelector('#gammaFlipConeScopeToggle');
                const toggle = existing || document.createElement('div');
                toggle.id = 'gammaFlipConeScopeToggle';
                toggle.style.display = 'flex';
                toggle.style.gap = '8px';
                toggle.style.margin = '0 0 10px 0';
                toggle.style.flexWrap = 'wrap';

                const labelNearest = nearestExpiry ? `Venc. mais próximo (${nearestExpiry})` : 'Venc. mais próximo';

                toggle.innerHTML = `
                    <button type="button" data-scope="all" style="padding:6px 10px;border:1px solid #00f3ff;background:transparent;color:#e0e0e0;border-radius:6px;cursor:pointer;font-family:Orbitron;">Todos vencimentos</button>
                    <button type="button" data-scope="nearest" style="padding:6px 10px;border:1px solid #00f3ff;background:transparent;color:#e0e0e0;border-radius:6px;cursor:pointer;font-family:Orbitron;">${labelNearest}</button>
                `;

                const applyActive = (activeScope) => {
                    toggle.querySelectorAll('button[data-scope]').forEach((btn) => {
                        const isActive = btn.getAttribute('data-scope') === activeScope;
                        btn.style.background = isActive ? 'rgba(0, 243, 255, 0.12)' : 'transparent';
                        btn.style.borderColor = isActive ? '#ff00ff' : '#00f3ff';
                        btn.style.color = isActive ? '#ffffff' : '#e0e0e0';
                    });
                };

                if (!existing) host.insertBefore(toggle, ctx);
                applyActive(scope);

                toggle.querySelectorAll('button[data-scope]').forEach((btn) => {
                    btn.onclick = () => {
                        const nextScope = btn.getAttribute('data-scope') || 'all';
                        setSelectedScope(nextScope);
                        applyActive(nextScope);
                        const nextCone = resolveConeData(nextScope);
                        const chart = this.charts.gammaFlipCone;
                        if (chart) {
                            chart.data.datasets[0].data = nextCone.points;
                            chart.update();
                        }
                    };
                });
            }
        }
        
        if (this.charts.gammaFlipCone) this.charts.gammaFlipCone.destroy();

        this.charts.gammaFlipCone = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [{
                    label: 'Gamma Flip Level',
                    data: coneData.points,
                    borderColor: '#00ff00',
                    backgroundColor: 'rgba(0, 255, 0, 0.1)',
                    borderWidth: 3,
                    fill: false,
                    tension: 0.4,
                    pointBackgroundColor: '#00ff00',
                    pointRadius: 4
                }]
            },
            options: {
                ...this.chartOptions,
                plugins: {
                    ...this.chartOptions.plugins,
                    title: {
                        display: true,
                        text: 'Gamma Flip Cone (Sensibilidade)',
                        color: '#ff00ff',
                        font: { family: 'Orbitron', size: 16, weight: 'bold' }
                    },
                    tooltip: {
                        ...this.chartOptions.plugins.tooltip,
                        callbacks: {
                            title: (items) => {
                                const x = Number(items?.[0]?.parsed?.x);
                                if (!Number.isFinite(x)) return '';
                                return `${x.toFixed(2)}σ`;
                            },
                            label: (item) => {
                                const y = Number(item?.parsed?.y);
                                if (!Number.isFinite(y)) return 'Gamma Flip: -';
                                return `Gamma Flip: ${this.formatNumberBr(y, 0)}`;
                            }
                        }
                    }
                },
                scales: {
                    ...this.chartOptions.scales,
                    x: {
                        ...this.chartOptions.scales.x,
                        type: 'linear',
                        title: { display: true, text: 'Fator σ (SIGMA_FACTOR)' },
                        ticks: {
                            ...this.chartOptions.scales.x.ticks,
                            callback: (value) => {
                                const v = Number(value);
                                if (!Number.isFinite(v)) return value;
                                return `${v.toFixed(2)}σ`;
                            }
                        }
                    },
                    y: {
                        ...this.chartOptions.scales.y,
                        title: { display: true, text: 'Gamma Flip (Strike)' },
                        ticks: {
                            ...this.chartOptions.scales.y.ticks,
                            callback: (value) => this.formatNumberBr(Number(value), 0)
                        }
                    }
                }
            }
        });
    }

    createDeltaFlipProfileChart(data) {
        const ctx = document.getElementById('deltaFlipProfileChart');
        if (!ctx) return;

        const utils = window.ChartDataUtils;
        const profileData = utils?.getDeltaFlipProfile ? utils.getDeltaFlipProfile(data) : (data?.v3_data?.delta_flip_profile ?? data?.delta_flip_profile);
        const spotsIn = Array.isArray(profileData?.spots) ? profileData.spots : [];
        const deltasIn = Array.isArray(profileData?.deltas) ? profileData.deltas : [];
        const baseLen = Math.min(spotsIn.length, deltasIn.length);
        if (baseLen === 0) {
            if (ctx.parentElement) ctx.parentElement.innerHTML = '<div class="loading-text">Dados indisponíveis</div>';
            return;
        }

        const spots = [];
        const deltas = [];
        for (let i = 0; i < baseLen; i++) {
            const s = Number(spotsIn[i]);
            const d = Number(deltasIn[i]);
            if (!Number.isFinite(s) || !Number.isFinite(d)) continue;
            spots.push(s);
            deltas.push(d);
        }
        if (spots.length === 0) {
            if (ctx.parentElement) ctx.parentElement.innerHTML = '<div class="loading-text">Dados indisponíveis</div>';
            return;
        }
        
        this.charts.deltaFlipProfile = new Chart(ctx, {
            type: 'line',
            data: {
                labels: spots.map(s => this.formatNumberBr(s, 2)),
                datasets: [{
                    label: 'Net Delta',
                    data: deltas,
                    borderColor: '#00f3ff',
                    backgroundColor: 'rgba(0, 243, 255, 0.1)',
                    borderWidth: 2,
                    fill: {
                        target: 'origin',
                        above: 'rgba(0, 243, 255, 0.1)',   // Area above origin
                        below: 'rgba(255, 7, 58, 0.1)'    // Area below origin
                    },
                    tension: 0.4,
                    pointRadius: 0
                }]
            },
            options: {
                ...this.chartOptions,
                plugins: {
                    ...this.chartOptions.plugins,
                    title: {
                        display: true,
                        text: 'Delta Flip Profile',
                        color: '#ff00ff',
                        font: { family: 'Orbitron', size: 16, weight: 'bold' }
                    }
                }
            }
        });
    }

    createFlowSentimentChart(data) {
        const ctx = document.getElementById('flowSentimentChart');
        if (!ctx) return;

        const utils = window.ChartDataUtils;
        const flowData = utils?.getFlowSentiment ? utils.getFlowSentiment(data) : data?.v3_data?.flow_sentiment;
        if (!flowData) return;

        const strikes = utils?.getStrikes ? utils.getStrikes(data) : (data?.delta_data?.strikes ?? data?.v3_data?.delta_data?.strikes);
        if (!Array.isArray(strikes) || strikes.length === 0) return;
        const bull = Array.isArray(flowData?.bull) ? flowData.bull : [];
        const bear = Array.isArray(flowData?.bear) ? flowData.bear : [];
        const baseLen = Math.min(strikes.length, bull.length, bear.length);
        if (baseLen === 0) return;
        const labels = strikes.slice(0, baseLen);

        this.charts.flowSentiment = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels.map(s => this.formatNumberBr(s, 0)),
                datasets: [
                    {
                        label: 'Bullish Flow',
                        data: bull.slice(0, baseLen),
                        backgroundColor: 'rgba(0, 255, 0, 0.6)',
                        borderColor: '#00ff00',
                        borderWidth: 1
                    },
                    {
                        label: 'Bearish Flow',
                        data: bear.slice(0, baseLen),
                        backgroundColor: 'rgba(255, 0, 0, 0.6)',
                        borderColor: '#ff0000',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                ...this.chartOptions,
                plugins: {
                    ...this.chartOptions.plugins,
                    title: {
                        display: true,
                        text: 'Flow Sentiment (Agressão)',
                        color: '#ff00ff',
                        font: { family: 'Orbitron', size: 16, weight: 'bold' }
                    }
                },
                scales: {
                    ...this.chartOptions.scales,
                    x: { ...this.chartOptions.scales.x, stacked: true },
                    y: { ...this.chartOptions.scales.y, stacked: true }
                }
            }
        });
    }







    createExpectedMoveChart(data) {
        const ctx = document.getElementById('expectedMoveChart');
        if (!ctx) return;

        const utils = window.ChartDataUtils;
        const moves = utils?.getExpectedMoves ? utils.getExpectedMoves(data) : data?.key_levels?.expected_moves;
        if (!Array.isArray(moves) || moves.length === 0) {
            if (ctx.parentElement) ctx.parentElement.innerHTML = '<div class="loading-text">Dados indisponíveis</div>';
            return;
        }

        const spot = utils?.getSpot ? utils.getSpot(data) : data?.overview?.spot_price;
        if (!Number.isFinite(spot)) {
            if (ctx.parentElement) ctx.parentElement.innerHTML = '<div class="loading-text">Dados indisponíveis</div>';
            return;
        }

        const normalized = moves.map((m) => {
            const label = m?.label ?? '-';
            const days = Number(m?.days);

            const sigma1Up = Number(m?.sigma_1_up);
            const sigma1Down = Number(m?.sigma_1_down);
            const sigma2Up = Number(m?.sigma_2_up);
            const sigma2Down = Number(m?.sigma_2_down);

            if ([sigma1Up, sigma1Down, sigma2Up, sigma2Down].every(Number.isFinite)) {
                return { label, days, sigma1Up, sigma1Down, sigma2Up, sigma2Down };
            }

            const upper = Number(m?.upper);
            const lower = Number(m?.lower);
            if (Number.isFinite(upper) && Number.isFinite(lower)) {
                const distUp = upper - spot;
                const distDown = spot - lower;
                if (Number.isFinite(distUp) && Number.isFinite(distDown)) {
                    return {
                        label,
                        days,
                        sigma1Up: upper,
                        sigma1Down: lower,
                        sigma2Up: spot + distUp * 2,
                        sigma2Down: spot - distDown * 2
                    };
                }
            }

            const movePct = Number(m?.move);
            if (Number.isFinite(movePct) && movePct > 0) {
                const dist = spot * (movePct / 100);
                if (Number.isFinite(dist)) {
                    return {
                        label,
                        days,
                        sigma1Up: spot + dist,
                        sigma1Down: spot - dist,
                        sigma2Up: spot + dist * 2,
                        sigma2Down: spot - dist * 2
                    };
                }
            }

            return null;
        }).filter(Boolean);

        if (normalized.length === 0) return;

        const labels = normalized.map(m => m.label);
        const upper1 = normalized.map(m => m.sigma1Up);
        const lower1 = normalized.map(m => m.sigma1Down);
        const upper2 = normalized.map(m => m.sigma2Up);
        const lower2 = normalized.map(m => m.sigma2Down);

        const allUpper1 = [spot, ...upper1];
        const allLower1 = [spot, ...lower1];
        const allUpper2 = [spot, ...upper2];
        const allLower2 = [spot, ...lower2];
        const allLabels = ['Hoje', ...labels];

        if (this.charts.expectedMove) this.charts.expectedMove.destroy();

        this.charts.expectedMove = new Chart(ctx, {
            type: 'line',
            data: {
                labels: allLabels,
                datasets: [
                    {
                        label: '+2σ',
                        data: allUpper2,
                        borderColor: 'rgba(255, 0, 0, 0.5)',
                        borderDash: [5, 5],
                        fill: false,
                        pointRadius: 0
                    },
                    {
                        label: '+1σ',
                        data: allUpper1,
                        borderColor: '#00ff00',
                        backgroundColor: 'rgba(0, 255, 0, 0.1)',
                        fill: 3, // Fill to dataset index 3 (-1σ)
                        pointRadius: 3
                    },
                    {
                        label: 'Spot',
                        data: Array(allLabels.length).fill(spot),
                        borderColor: '#ffffff',
                        borderDash: [2, 2],
                        pointRadius: 0,
                        fill: false
                    },
                    {
                        label: '-1σ',
                        data: allLower1,
                        borderColor: '#00ff00',
                        backgroundColor: 'rgba(0, 255, 0, 0.1)',
                        fill: false, // Already filled from +1σ
                        pointRadius: 3
                    },
                    {
                        label: '-2σ',
                        data: allLower2,
                        borderColor: 'rgba(255, 0, 0, 0.5)',
                        borderDash: [5, 5],
                        fill: false,
                        pointRadius: 0
                    }
                ]
            },
            options: {
                ...this.chartOptions,
                plugins: {
                    ...this.chartOptions.plugins,
                    title: {
                        display: true,
                        text: 'Expected Move Cone (Volatilidade Implícita)',
                        color: '#ff00ff',
                        font: { family: 'Orbitron', size: 16, weight: 'bold' }
                    }
                },
                scales: {
                    ...this.chartOptions.scales,
                    y: {
                        ...this.chartOptions.scales.y,
                        title: { display: true, text: 'Preço' }
                    }
                }
            }
        });
    }

    createMMPnLChart(data) {
        const ctx = document.getElementById('mmPnlChart');
        if (!ctx) return;

        const utils = window.ChartDataUtils;
        const pnlData = utils?.getMMPnl ? utils.getMMPnl(data) : data?.v3_data?.mm_pnl;
        const spotsIn = Array.isArray(pnlData?.spots) ? pnlData.spots : [];
        const pnlIn = Array.isArray(pnlData?.pnl) ? pnlData.pnl : [];
        const baseLen = Math.min(spotsIn.length, pnlIn.length);
        if (baseLen === 0) return;
        const spots = [];
        const pnl = [];
        for (let i = 0; i < baseLen; i++) {
            const s = Number(spotsIn[i]);
            const p = Number(pnlIn[i]);
            if (!Number.isFinite(s) || !Number.isFinite(p)) continue;
            spots.push(s);
            pnl.push(p);
        }
        if (spots.length === 0) return;
        
        this.charts.mmPnl = new Chart(ctx, {
            type: 'line',
            data: {
                labels: spots.map(s => this.formatNumberBr(s, 2)),
                datasets: [{
                    label: 'MM PnL Simulation',
                    data: pnl,
                    borderColor: '#ffff00',
                    backgroundColor: 'rgba(255, 255, 0, 0.1)',
                    borderWidth: 2,
                    fill: {
                        target: 'origin',
                        above: 'rgba(0, 255, 0, 0.1)',
                        below: 'rgba(255, 0, 0, 0.1)'
                    },
                    tension: 0.4,
                    pointRadius: 0
                }]
            },
            options: {
                ...this.chartOptions,
                plugins: {
                    ...this.chartOptions.plugins,
                    title: {
                        display: true,
                        text: 'Simulação PnL do Market Maker',
                        color: '#ff00ff',
                        font: { family: 'Orbitron', size: 16, weight: 'bold' }
                    }
                }
            }
        });
    }

    createDealerPressureChart(data) {
        const ctx = document.getElementById('dealerPressureChart');
        if (!ctx) return;

        const utils = window.ChartDataUtils;
        const profileIn = utils?.getDealerPressureProfile ? utils.getDealerPressureProfile(data) : data?.v3_data?.dealer_pressure_profile;
        const strikesIn = utils?.getStrikes ? utils.getStrikes(data) : (data?.delta_data?.strikes ?? data?.v3_data?.delta_data?.strikes);
        if (!Array.isArray(profileIn) || !Array.isArray(strikesIn) || profileIn.length === 0 || strikesIn.length === 0) return;
        const baseLen = Math.min(profileIn.length, strikesIn.length);
        const profile = profileIn.slice(0, baseLen);
        const strikes = strikesIn.slice(0, baseLen);

        this.charts.dealerPressure = new Chart(ctx, {
            type: 'line',
            data: {
                labels: strikes.map(s => this.formatNumberBr(s, 0)),
                datasets: [{
                    label: 'Dealer Pressure Index (DPI)',
                    data: profile,
                    borderColor: '#ff9900', // Laranja Neon
                    backgroundColor: 'rgba(255, 153, 0, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 2
                }]
            },
            options: {
                ...this.chartOptions,
                plugins: {
                    ...this.chartOptions.plugins,
                    title: {
                        display: true,
                        text: 'Dealer Pressure Index',
                        color: '#ff00ff',
                        font: { family: 'Orbitron', size: 16, weight: 'bold' }
                    }
                },
                scales: {
                    ...this.chartOptions.scales,
                    y: {
                        ...this.chartOptions.scales.y,
                        grid: {
                            color: (context) => context.tick.value === 0 ? '#ffffff' : 'rgba(255, 255, 255, 0.1)',
                            lineWidth: (context) => context.tick.value === 0 ? 2 : 1
                        }
                    }
                }
            }
        });
    }

    createDeltaAgregadoChart(data) {
        const ctx = document.getElementById('deltaAgregadoChart');
        if (!ctx) return;

        const deltaData = data?.delta_data ?? data?.v3_data?.delta_data;
        if (!deltaData || !Array.isArray(deltaData.strikes) || !Array.isArray(deltaData.delta_values) || deltaData.strikes.length === 0) return;

        const length = Math.min(deltaData.strikes.length, deltaData.delta_values.length);
        if (length === 0) return;
        const strikes = deltaData.strikes.slice(0, length);
        const deltaValues = deltaData.delta_values.slice(0, length);

        // Delta Exposure por Strike (Net)
        // Diferente do Delta Acumulado (Cumulative)
        this.charts.deltaAgregado = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: strikes.map(s => this.formatNumberBr(s, 0)),
                datasets: [{
                    label: 'Delta Exposure Net',
                    data: deltaValues,
                    backgroundColor: (context) => {
                        const val = context.raw;
                        return val >= 0 ? 'rgba(0, 255, 0, 0.6)' : 'rgba(255, 0, 0, 0.6)';
                    },
                    borderColor: (context) => {
                        const val = context.raw;
                        return val >= 0 ? '#00ff00' : '#ff0000';
                    },
                    borderWidth: 1,
                    borderRadius: 2
                }]
            },
            options: {
                ...this.chartOptions,
                plugins: {
                    ...this.chartOptions.plugins,
                    title: {
                        display: true,
                        text: 'Delta Exposure por Strike (Net)',
                        color: '#ff00ff',
                        font: { family: 'Orbitron', size: 16, weight: 'bold' }
                    }
                }
            }
        });
    }

    updateKeyLevels(data) {
        const keyLevels = data?.key_levels ?? data?.v3_data?.key_levels ?? null;

        const setText = (id, value) => {
            const el = document.getElementById(id);
            if (!el) return;
            if (value === null || value === undefined) {
                el.innerText = 'N/A';
                return;
            }
            const n = Number(value);
            el.innerText = Number.isFinite(n) ? this.formatNumberBr(n, 2) : 'N/A';
        };

        const get = (key) => {
            if (!keyLevels || typeof keyLevels !== 'object') return null;
            return Object.prototype.hasOwnProperty.call(keyLevels, key) ? keyLevels[key] : null;
        };

        setText('gamma-flip', get('gamma_flip_selected') ?? get('gamma_flip'));
        setText('call-wall', get('call_wall'));
        setText('put-wall', get('put_wall'));
        setText('edi-effective-call', get('effective_call_wall'));
        setText('edi-effective-put', get('effective_put_wall'));
        setText('max-pain', get('max_pain'));
    }

    createFedWatchTable(data) {
        const container = document.getElementById('fedwatch-container');
        if (!container) return;

        const rates = data && data.fed_watch_rates;
        if (rates && Array.isArray(rates.meetings) && rates.meetings.length > 0) {
            let html = '<div class="table-responsive"><table class="neon-table"><thead><tr><th>Reunião</th><th>Dias</th><th>Faixa Atual</th><th>Probabilidades</th></tr></thead><tbody>';

            rates.meetings.forEach((m) => {
                const probs = (m && m.probs) ? m.probs : {};
                const probsText = Object.keys(probs).length > 0
                    ? Object.entries(probs).map(([k, v]) => `${k}: ${this.formatNumberBr(v, 1)}%`).join(' | ')
                    : '-';

                html += `
                    <tr>
                        <td class="font-bold">${m.date || '-'}</td>
                        <td>${m.days_remaining ?? '-'}</td>
                        <td style="color: var(--secondary-neon);">${m.current_rate || '-'}</td>
                        <td>${probsText}</td>
                    </tr>
                `;
            });

            html += '</tbody></table></div>';
            container.innerHTML = html;
            return;
        }

        const legacy = data && data.fed_watch;
        if (!Array.isArray(legacy) || legacy.length === 0) {
            container.innerHTML = '<div class="loading-text">Dados indisponíveis</div>';
            return;
        }

        let html = '<div class="table-responsive"><table class="neon-table"><thead><tr><th>Vencimento</th><th>Dias Úteis</th><th>IV ATM</th><th>1 SD (68%)</th><th>2 SD (95%)</th><th>3 SD (99%)</th></tr></thead><tbody>';

        legacy.forEach((fw) => {
            const range1 = fw.ranges.find(r => r.sd === 1);
            const range2 = fw.ranges.find(r => r.sd === 2);
            const range3 = fw.ranges.find(r => r.sd === 3);

            const fmtRange = (r) => r ? `${this.formatNumberBr(r.lower, 2)} - ${this.formatNumberBr(r.upper, 2)}` : '-';

            html += `
                <tr>
                    <td class="font-bold">${fw.expiry}</td>
                    <td>${fw.days_to_exp}</td>
                    <td style="color: var(--secondary-neon);">${this.formatNumberBr(fw.iv_atm * 100, 2)}%</td>
                    <td>${fmtRange(range1)}</td>
                    <td>${fmtRange(range2)}</td>
                    <td>${fmtRange(range3)}</td>
                </tr>
            `;
        });

        html += '</tbody></table></div>';
        container.innerHTML = html;
    }

    createMostActivesTable(data) {
        const containers = document.querySelectorAll('#most-actives-container, #most-actives-container-tools');
        if (!containers || containers.length === 0) return;
        if (!data || !data.most_actives) {
            containers.forEach((c) => {
                c.innerHTML = '<div class="loading-text">Dados indisponíveis</div>';
            });
            return;
        }

        const { top_oi, top_vol } = data.most_actives;
        const scaleFactor = this.estimateMostActivesScaleFactor(data);

        if ((!top_oi || top_oi.length === 0) && (!top_vol || top_vol.length === 0)) {
            containers.forEach((c) => {
                c.innerHTML = '<p>Nenhum dado de contratos ativos disponível.</p>';
            });
            return;
        }

        // Helper to create sub-table
        const createSubTable = (title, items, valueKey, valueLabel) => {
            let subHtml = `
                <div class="actives-panel" style="margin-bottom: 20px;">
                    <h4 style="color: var(--primary-neon); border-bottom: 1px solid var(--primary-neon); padding-bottom: 5px; margin-bottom: 10px;">${title}</h4>
                    <table class="neon-table small-table">
                        <thead>
                            <tr>
                                <th>Strike</th>
                                <th>Tipo</th>
                                <th>${valueLabel}</th>
                                <th>IV</th>
                            </tr>
                        </thead>
                        <tbody>
            `;
            
            items.slice(0, 10).forEach(item => { // Top 10
                const typeClass = item.type === 'CALL' ? 'positive-val' : 'negative-val';
                const typeLabel = item.type === 'CALL' ? 'C' : 'P';
                const strikeDisplay = this.normalizeMostActiveStrike(item.strike, data, scaleFactor);
                subHtml += `
                    <tr>
                        <td class="font-bold">${this.formatNumberBr(strikeDisplay, 0)}</td>
                        <td class="${typeClass}">${typeLabel}</td>
                        <td>${this.formatNumberBr(item[valueKey], 0)}</td>
                        <td>${this.formatNumberBr(item.iv, 1)}%</td>
                    </tr>
                `;
            });
            
            subHtml += '</tbody></table></div>';
            return subHtml;
        };

        let html = '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">';
        html += createSubTable('🔥 Top Open Interest', top_oi, 'oi', 'Open Int');
        html += createSubTable('🌊 Top Volume', top_vol, 'volume', 'Volume');
        html += '</div>';

        containers.forEach((c) => {
            c.innerHTML = html;
        });
    }

    createOIByExpiryChart(data) {
        const canvas = document.getElementById('oiByExpiryChart');
        if (!canvas) return;

        const rows = data && Array.isArray(data.oi_by_expiry) ? data.oi_by_expiry : [];
        if (rows.length === 0) {
            if (canvas.parentElement) canvas.parentElement.innerHTML = '<div class="loading-text">Dados indisponíveis</div>';
            return;
        }

        const labels = rows.map((r) => r.expiry);
        const callOI = rows.map((r) => Number(r.call_oi) || 0);
        const putOI = rows.map((r) => Number(r.put_oi) || 0);

        const config = {
            type: 'bar',
            data: {
                labels,
                datasets: [
                    {
                        label: 'OI Call',
                        data: callOI,
                        backgroundColor: 'rgba(0, 255, 0, 0.25)',
                        borderColor: '#00ff00',
                        borderWidth: 1
                    },
                    {
                        label: 'OI Put',
                        data: putOI,
                        backgroundColor: 'rgba(255, 0, 0, 0.25)',
                        borderColor: '#ff0000',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                ...this.chartOptions,
                plugins: {
                    ...this.chartOptions.plugins,
                    title: {
                        display: true,
                        text: 'Open Interest por Vencimento (Call vs Put)',
                        color: '#ff00ff',
                        font: { family: 'Orbitron', size: 16, weight: 'bold' }
                    }
                },
                scales: {
                    ...this.chartOptions.scales,
                    x: { ...this.chartOptions.scales.x, stacked: true },
                    y: {
                        ...this.chartOptions.scales.y,
                        stacked: true,
                        ticks: { ...this.chartOptions.scales.y.ticks, callback: (v) => this.formatCompactBr(v) }
                    }
                }
            }
        };

        if (this.charts.oiByExpiry) this.charts.oiByExpiry.destroy();
        this.charts.oiByExpiry = new Chart(canvas, config);
    }

    createVolumeVolatilityChart(data) {
        const canvases = document.querySelectorAll('#volumeVolatilityChart, #volumeVolatilityChartTools');
        if (!canvases || canvases.length === 0) return;

        const buildConfig = () => {
            const ts = data && data.term_structure;
            const expiries = ts && Array.isArray(ts.expiries) ? ts.expiries : [];
            const ivRaw = ts && (Array.isArray(ts.iv_atm_pct) ? ts.iv_atm_pct : (Array.isArray(ts.iv_atm) ? ts.iv_atm : []));
            const hasTerm = expiries.length > 0 && Array.isArray(ivRaw) && ivRaw.length === expiries.length;

            if (hasTerm) {
                const iv = ivRaw.map((v) => (Number.isFinite(v) && v <= 2 ? v * 100 : v));
                return {
                    type: 'line',
                    data: {
                        labels: expiries,
                        datasets: [{
                            label: 'Term Structure (IV x Vencimento)',
                            data: iv,
                            borderColor: '#ffff00',
                            backgroundColor: 'rgba(255, 255, 0, 0.1)',
                            borderWidth: 2,
                            tension: 0.4,
                            pointBackgroundColor: '#ffff00',
                            pointRadius: 5
                        }]
                    },
                    options: {
                        ...this.chartOptions,
                        plugins: {
                            ...this.chartOptions.plugins,
                            title: {
                                display: true,
                                text: 'Estrutura a Termo da Volatilidade (Term Structure)',
                                color: '#ff00ff',
                                font: { family: 'Orbitron', size: 16, weight: 'bold' }
                            }
                        },
                        scales: {
                            ...this.chartOptions.scales,
                            y: {
                                ...this.chartOptions.scales.y,
                                ticks: { ...this.chartOptions.scales.y.ticks, callback: (v) => this.formatNumberBr(v, 2) + '%' }
                            }
                        }
                    }
                };
            }

            const strikes = data && data.volume_data && Array.isArray(data.volume_data.strikes) ? data.volume_data.strikes : [];
            const totalVolume = data && data.volume_data && Array.isArray(data.volume_data.total_volume) ? data.volume_data.total_volume : [];
            const ivValues = data && data.volatility_data && Array.isArray(data.volatility_data.iv_values) ? data.volatility_data.iv_values : [];

            if (strikes.length === 0 || totalVolume.length !== strikes.length || ivValues.length !== strikes.length) return null;

            return {
                type: 'bar',
                data: {
                    labels: strikes.map(s => this.formatNumberBr(s, 0)),
                    datasets: [
                        {
                            label: 'Total Volume',
                            data: totalVolume,
                            backgroundColor: 'rgba(0, 243, 255, 0.3)',
                            borderColor: '#00f3ff',
                            borderWidth: 1,
                            yAxisID: 'y'
                        },
                        {
                            type: 'line',
                            label: 'IV (%)',
                            data: ivValues,
                            borderColor: '#ffff00',
                            borderWidth: 2,
                            tension: 0.4,
                            pointRadius: 0,
                            yAxisID: 'y1'
                        }
                    ]
                },
                options: {
                    ...this.chartOptions,
                    plugins: {
                        ...this.chartOptions.plugins,
                        title: {
                            display: true,
                            text: 'Volume vs Volatilidade',
                            color: '#ff00ff',
                            font: { family: 'Orbitron', size: 16, weight: 'bold' }
                        }
                    },
                    scales: {
                        ...this.chartOptions.scales,
                        y: {
                            ...this.chartOptions.scales.y,
                            position: 'left',
                            title: { display: true, text: 'Volume', color: '#00f3ff' }
                        },
                        y1: {
                            type: 'linear',
                            display: true,
                            position: 'right',
                            grid: { drawOnChartArea: false },
                            ticks: { color: '#ffff00', font: { family: 'Share Tech Mono' } },
                            title: { display: true, text: 'IV (%)', color: '#ffff00' }
                        }
                    }
                }
            };
        };

        const keys = ['volumeVolatility', 'volumeVolatilityTools'];
        canvases.forEach((canvas, index) => {
            const key = keys[index] || `volumeVolatility_${index}`;
            const config = buildConfig();
            if (!config) {
                if (canvas.parentElement) canvas.parentElement.innerHTML = '<div class="loading-text">Dados indisponíveis</div>';
                return;
            }
            if (this.charts[key]) this.charts[key].destroy();
            this.charts[key] = new Chart(canvas, config);
        });
    }

    updateNtslCode(data) {
        const ntslArea = document.getElementById('ntsl-code-block');
        const copyBtn = document.getElementById('copy-ntsl');
        // const feedback = document.getElementById('copyFeedback'); // Removed in new HTML

        if (ntslArea) {
            ntslArea.innerText = data.ntsl_script || '// Código não disponível. Verifique exportação.';
        }

        if (copyBtn && ntslArea) {
            // Remove previous listeners to avoid duplicates if re-init
            const newBtn = copyBtn.cloneNode(true);
            copyBtn.parentNode.replaceChild(newBtn, copyBtn);
            
            newBtn.addEventListener('click', () => {
                const textToCopy = ntslArea.innerText.replace(/\n/g, '\r\n');
                
                navigator.clipboard.writeText(textToCopy).then(() => {
                    newBtn.innerText = 'CÓDIGO COPIADO!';
                    newBtn.style.backgroundColor = '#00ff00';
                    newBtn.style.color = '#000000';
                    setTimeout(() => { 
                        newBtn.innerText = 'COPIAR CÓDIGO'; 
                        newBtn.style.backgroundColor = '';
                        newBtn.style.color = '';
                    }, 2000);
                }).catch(err => {
                    console.error('Failed to copy: ', err);
                });
            });
        }
    }

    createFairValueTable(data) {
        const containers = document.querySelectorAll('#fair-value-container-overview, #fair-value-container-v3, #fair-value-container');
        if (!containers || containers.length === 0) return;

        const sims = data?.v3_data?.fair_value_sims;
        if (!Array.isArray(sims)) {
            containers.forEach((c) => {
                c.innerHTML = '<p>Dados indisponíveis.</p>';
            });
            return;
        }

        if (sims.length === 0) {
            containers.forEach((c) => {
                c.innerHTML = '<p>Nenhuma simulação disponível.</p>';
            });
            return;
        }

        let html = '<table class="neon-table"><thead><tr><th>Cenário</th><th>Alvo (Spot)</th><th>Strike</th><th>Call (Hoje)</th><th>Call (Sim)</th><th>Var %</th><th>Put (Hoje)</th><th>Put (Sim)</th><th>Var %</th></tr></thead><tbody>';

        sims.forEach(sim => {
            sim.options.forEach(opt => {
                const callClass = opt.Call_Chg >= 0 ? 'positive-val' : 'negative-val';
                const putClass = opt.Put_Chg >= 0 ? 'positive-val' : 'negative-val';
                
                html += `
                    <tr>
                        <td class="font-bold">${sim.scenario}</td>
                        <td>${this.formatNumberBr(sim.target_spot, 2)}</td>
                        <td class="font-bold text-center" style="color: var(--secondary-neon);">${this.formatNumberBr(opt.Strike, 2)}</td>
                        <td>${this.formatNumberBr(opt.Call_Now, 2)}</td>
                        <td>${this.formatNumberBr(opt.Call_Sim, 2)}</td>
                        <td class="${callClass}">${this.formatNumberBr(opt.Call_Chg, 1)}%</td>
                        <td>${this.formatNumberBr(opt.Put_Now, 2)}</td>
                        <td>${this.formatNumberBr(opt.Put_Sim, 2)}</td>
                        <td class="${putClass}">${this.formatNumberBr(opt.Put_Chg, 1)}%</td>
                    </tr>
                `;
            });
        });

        html += '</tbody></table>';
        containers.forEach((c) => {
            c.innerHTML = html;
        });
    }

    populateTable(data) {
        const tableBody = document.querySelector('#data-table tbody');
        if (!tableBody) return;

        tableBody.innerHTML = '';
        
        // Helper to format numbers cleanly
        const fmt = (val, decimals = 0) => {
            if (val === null || val === undefined) return '-';
            return val.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
        };
        
        data.detailed_data.forEach((row, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="text-center font-bold" style="color: var(--secondary-neon);">${fmt(row.strike, 2)}</td>
                <td class="text-right">${fmt(row.delta, 0)}</td>
                <td class="text-right">${fmt(row.gamma, 0)}</td>
                <td class="text-right">${fmt(row.volume, 0)}</td>
                <td class="text-right">${fmt(row.oi, 0)}</td>
                <td class="text-center">${fmt(row.iv, 1)}%</td>
            `;
            
            // Add fade-in animation
            tr.style.opacity = '0';
            tr.style.transform = 'translateY(20px)';
            tableBody.appendChild(tr);
            
            setTimeout(() => {
                tr.style.transition = 'all 0.5s ease';
                tr.style.opacity = '1';
                tr.style.transform = 'translateY(0)';
            }, index * 50); // Faster animation
        });
    }

    // Method to update charts with new data
    updateCharts(newData) {
        Object.keys(this.charts).forEach(chartKey => {
            if (this.charts[chartKey] && newData[chartKey]) {
                this.charts[chartKey].data = newData[chartKey];
                this.charts[chartKey].update('active');
            }
        });
    }

    // Method to destroy all charts (cleanup)
    destroy() {
        Object.keys(this.charts).forEach(chartKey => {
            if (this.charts[chartKey]) {
                this.charts[chartKey].destroy();
            }
        });
        this.charts = {};
    }
}

const __ediBootCharts = () => {
    window.strangerThingsCharts = new StrangerThingsCharts();
};
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', __ediBootCharts);
} else {
    __ediBootCharts();
}
