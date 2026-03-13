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
            }
        };
        
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
            if (utils?.registerSpotLinePlugin) {
                utils.registerSpotLinePlugin();
            } else {
                ensureSpotLinePlugin();
            }
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
            this.createDeltaChart(data);
            this.createGammaChart(data);
            // this.createVolumeChart(data); // Removido por redundância (Volume Chart era na verdade OI)
            this.createVolatilityChart(data);
            
            // Novos Gráficos
            this.createOIStrikeChart(data);
            this.createGexSplitChart(data);
            this.createVannaChart(data);
            this.createCharmChart(data);
            this.createThetaChart(data);
            this.createVegaChart(data);
            this.createPinRiskChart(data);
            
            // Gregas Acumuladas & R-Gamma
            this.createCharmCumChart(data);
            this.createVannaCumChart(data);
            this.createThetaCumChart(data); // Added
            this.createRGammaChart(data);
            this.createRGammaCumChart(data);

            // V3 Charts
            this.createMaxPainChart(data);
            this.createExpectedMoveChart(data);
            this.createGammaFlipConeChart(data);
            this.createDeltaFlipProfileChart(data);
            this.createFlowSentimentChart(data);
            this.createMMPnLChart(data);
            this.createDealerPressureChart(data); // Added
            this.createDeltaAgregadoChart(data); // Added

            // Ferramentas de Mercado
            this.createFedWatchTable(data);
            this.createMostActivesTable(data);
            this.createOIByExpiryChart(data);
            this.createVolumeVolatilityChart(data);

            this.updateMetrics(data);
            this.updateKeyLevels(data);
            this.updateNtslCode(data);
            this.populateTable(data);
            this.createFairValueTable(data); // Added
            this.updateLastUpdate(data);
        } catch (error) {
            console.error('Error initializing charts:', error);
        }
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

    createVolumeVolatilityChart(data) {
        const ctx = document.getElementById('volumeVolatilityChart');
        if (!ctx) return;

        // Combine call and put volume for this chart
        const strikes = data.volume_data.strikes;
        const totalVol = data.volume_data.call_volume.map((v, i) => v + data.volume_data.put_volume[i]);
        const ivs = data.volatility_data.iv_values;

        this.charts.volVol = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: strikes,
                datasets: [
                    {
                        label: 'Volume Total',
                        data: totalVol,
                        backgroundColor: 'rgba(0, 243, 255, 0.3)',
                        borderColor: '#00f3ff',
                        borderWidth: 1,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Volatilidade (IV)',
                        data: ivs,
                        type: 'line',
                        borderColor: '#ff00ff',
                        borderWidth: 2,
                        pointRadius: 0,
                        tension: 0.4,
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
                        font: { family: 'Orbitron', size: 16 }
                    }
                },
                scales: {
                    ...this.chartOptions.scales,
                    y: {
                        ...this.chartOptions.scales.y,
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: { display: true, text: 'Volume', color: '#00f3ff' }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        grid: { drawOnChartArea: false },
                        ticks: { color: '#ff00ff' },
                        title: { display: true, text: 'IV %', color: '#ff00ff' }
                    }
                }
            }
        });
    }

    createFedWatchTable(data) {
        const container = document.getElementById('fedwatch-container');
        if (!container) return;
        const insightEl = document.getElementById('fedwatch-insight');

        const rates = data && data.fed_watch_rates;
        if (rates) {
            if (!Array.isArray(rates.meetings) || rates.meetings.length === 0) {
                container.innerHTML = '<div class="loading-text">Dados indisponíveis</div>';
                if (insightEl) insightEl.textContent = '';
                return;
            }
            let html = '<div class="table-wrapper"><table class="neon-table"><thead><tr><th>Reunião</th><th>Dias</th><th>Faixa Atual</th><th style="text-align:left">Probabilidades</th></tr></thead><tbody>';

            rates.meetings.forEach((m) => {
                const probs = (m && m.probs) ? m.probs : {};
                const toNum = (v) => {
                    if (typeof v === 'number') return v;
                    const n = parseFloat(String(v).replace(',', '.'));
                    return Number.isFinite(n) ? n : 0;
                };
                const probsText = Object.keys(probs).length > 0
                    ? Object.entries(probs)
                        .sort((a, b) => toNum(b[1]) - toNum(a[1]))
                        .map(([k, v]) => `${k}: ${this.formatNumberBr(toNum(v), 1)}%`)
                        .join(' | ')
                    : '-';

                html += `
                    <tr>
                        <td class="font-bold">${m.date || '-'}</td>
                        <td>${m.days_remaining ?? '-'}</td>
                        <td style="color: var(--secondary-neon);">${m.current_rate || '-'}</td>
                        <td style="text-align: left;">${probsText}</td>
                    </tr>
                `;
            });

            html += '</tbody></table></div>';
            html += '<div style="height: 260px; margin-top: 12px;"><canvas id="fedwatchProbChart"></canvas></div>';
            container.innerHTML = html;

            if (insightEl) {
                const first = rates.meetings[0];
                const probs = (first && first.probs) ? first.probs : {};
                const entries = Object.entries(probs)
                    .map(([k, v]) => [k, (typeof v === 'number' ? v : parseFloat(String(v).replace(',', '.')))])
                    .filter(([, v]) => Number.isFinite(v))
                    .sort((a, b) => b[1] - a[1]);
                if (entries.length > 0) {
                    const [topRange, topProb] = entries[0];
                    const days = first.days_remaining ?? '-';
                    const date = first.date || '-';
                    const parseRange = (s) => {
                        if (!s) return null;
                        const m = String(s).trim().match(/^(\d+(?:[.,]\d+)?)\s*-\s*(\d+(?:[.,]\d+)?)$/);
                        if (!m) return null;
                        const low = parseFloat(m[1].replace(',', '.'));
                        const high = parseFloat(m[2].replace(',', '.'));
                        if (!Number.isFinite(low) || !Number.isFinite(high)) return null;
                        return { low, high, mid: (low + high) / 2 };
                    };

                    const currentRange = parseRange(first.current_rate);
                    const topParsed = parseRange(topRange);
                    const topText = `Leitura atual: para a reunião de ${date} (em ${days} dias), a faixa mais provável é ${topRange} (${this.formatNumberBr(topProb, 1)}%).`;
                    const isConcentrated = topProb >= 60;

                    let directionText = '';
                    if (currentRange && topParsed) {
                        const eps = 1e-9;
                        if (topParsed.mid < currentRange.mid - eps) {
                            directionText = ` Isso sugere corte vs a faixa atual (${first.current_rate}).`;
                        } else if (topParsed.mid > currentRange.mid + eps) {
                            directionText = ` Isso sugere alta vs a faixa atual (${first.current_rate}).`;
                        } else {
                            directionText = ` Isso sugere manutenção da faixa atual (${first.current_rate}).`;
                        }
                    }

                    const confidenceText = isConcentrated ? '' : ' Cenário ainda dividido; acompanhe as próximas leituras.';
                    insightEl.textContent = `${topText}${directionText}${confidenceText}`;
                } else {
                    insightEl.textContent = '';
                }
            }

            const first = rates.meetings[0];
            const probs = (first && first.probs) ? first.probs : {};
            const labels = Object.entries(probs)
                .map(([k, v]) => [k, (typeof v === 'number' ? v : parseFloat(String(v).replace(',', '.')))])
                .filter(([, v]) => Number.isFinite(v))
                .sort((a, b) => b[1] - a[1])
                .slice(0, 8);

            const canvas = document.getElementById('fedwatchProbChart');
            if (canvas && labels.length > 0 && typeof Chart !== 'undefined') {
                if (this.charts.fedwatchProb) this.charts.fedwatchProb.destroy();
                this.charts.fedwatchProb = new Chart(canvas, {
                    type: 'bar',
                    data: {
                        labels: labels.map(([k]) => k),
                        datasets: [{
                            label: 'Probabilidade (%)',
                            data: labels.map(([, v]) => v),
                            backgroundColor: 'rgba(0, 243, 255, 0.25)',
                            borderColor: '#00f3ff',
                            borderWidth: 1
                        }]
                    },
                    options: {
                        ...this.chartOptions,
                        indexAxis: 'y',
                        plugins: {
                            ...this.chartOptions.plugins,
                            title: {
                                display: true,
                                text: 'Distribuição de Probabilidades (Próxima Reunião)',
                                color: '#ff00ff',
                                font: { family: 'Orbitron', size: 14, weight: 'bold' }
                            }
                        },
                        scales: {
                            x: {
                                ...this.chartOptions.scales.x,
                                title: { display: true, text: 'Probabilidade (%)', color: '#00f3ff' }
                            },
                            y: {
                                ...this.chartOptions.scales.y,
                                title: { display: true, text: 'Faixa-alvo', color: '#00f3ff' }
                            }
                        }
                    }
                });
            }
            return;
        }

        const legacy = data && data.fed_watch;
        if (!Array.isArray(legacy) || legacy.length === 0) {
            container.innerHTML = '<div class="loading-text">Dados indisponíveis</div>';
            if (insightEl) insightEl.textContent = '';
            return;
        }

        let html = '<table class="data-table"><thead><tr><th>Vencimento</th><th>Dias</th><th>Prob. Alta</th><th>Prob. Baixa</th><th>Neutro</th></tr></thead><tbody>';

        legacy.forEach((item) => {
            const days = item.days_to_exp ?? item.days_to_expiry ?? item.days_remaining ?? '-';
            const hike = item.prob_hike ?? '-';
            const cut = item.prob_cut ?? '-';
            const neutral = item.prob_neutral ?? '-';

            html += `<tr>
                <td>${item.expiry || item.date || '-'}</td>
                <td>${days}</td>
                <td class="positive">${hike}${typeof hike === 'number' ? '%' : ''}</td>
                <td class="negative">${cut}${typeof cut === 'number' ? '%' : ''}</td>
                <td class="neutral">${neutral}${typeof neutral === 'number' ? '%' : ''}</td>
            </tr>`;
        });

        html += '</tbody></table>';
        container.innerHTML = html;
    }

    createMostActivesTable(data) {
        const container = document.getElementById('most-actives-container');
        if (!container) return;
        if (!data || !data.most_actives) {
            container.innerHTML = '<div class="loading-text">Dados indisponíveis</div>';
            return;
        }

        const most = data.most_actives;
        const topOi = most && Array.isArray(most.top_oi) ? most.top_oi : null;
        const topVol = most && Array.isArray(most.top_vol) ? most.top_vol : null;

        if ((topOi && topOi.length > 0) || (topVol && topVol.length > 0)) {
            const createSubTable = (title, items, valueKey, valueLabel) => {
                if (!items || items.length === 0) return '';

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

                items.slice(0, 10).forEach((item) => {
                    const typeClass = item.type === 'CALL' ? 'positive-val' : 'negative-val';
                    const typeLabel = item.type === 'CALL' ? 'C' : 'P';
                    const strike = item.strike ?? item.Strike;
                    const value = item[valueKey];
                    const iv = item.iv ?? item.IV;

                    subHtml += `
                        <tr>
                            <td class="font-bold">${this.formatNumberBr(strike, 2)}</td>
                            <td class="${typeClass}">${typeLabel}</td>
                            <td>${this.formatNumberBr(value, 0)}</td>
                            <td>${this.formatNumberBr(iv, 1)}%</td>
                        </tr>
                    `;
                });

                subHtml += '</tbody></table></div>';
                return subHtml;
            };

            let html = '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">';
            html += createSubTable('🔥 Top Open Interest', topOi, 'oi', 'Open Int');
            html += createSubTable('🌊 Top Volume', topVol, 'volume', 'Volume');
            html += '</div>';
            container.innerHTML = html;
            return;
        }

        if (Array.isArray(most) && most.length > 0) {
            let html = '<table class="data-table"><thead><tr><th>Strike</th><th>Tipo</th><th>OI</th><th>Volume</th><th>IV%</th></tr></thead><tbody>';

            most.forEach((item) => {
                const typeClass = item.type === 'CALL' ? 'positive' : 'negative';
                const iv = typeof item.iv === 'number' ? item.iv.toFixed(1) : '-';
                html += `<tr>
                    <td>${item.strike}</td>
                    <td class="${typeClass}">${item.type}</td>
                    <td>${this.formatCompactBr(item.oi)}</td>
                    <td>${this.formatCompactBr(item.volume)}</td>
                    <td>${iv}${iv !== '-' ? '%' : ''}</td>
                </tr>`;
            });

            html += '</tbody></table>';
            container.innerHTML = html;
            return;
        }

        container.innerHTML = '<div class="loading-text">Dados indisponíveis</div>';
    }

    createOIByExpiryChart(data) {
        const canvas = document.getElementById('oiByExpiryChart');
        if (!canvas) return;

        const rowsRaw = data?.oi_by_expiry ?? data?.v3_data?.oi_by_expiry;
        const rowsInput = Array.isArray(rowsRaw) ? rowsRaw : [];
        const formatExpiryLabel = (v) => {
            const s = String(v ?? '').trim();
            return s.length >= 10 ? s.slice(0, 10) : s;
        };
        const withDays = rowsInput.map((r) => ({
            ...r,
            expiry: formatExpiryLabel(r?.expiry),
            days_to_exp: Number.isFinite(Number(r?.days_to_exp)) ? Number(r.days_to_exp) : null
        }));
        const rows = withDays.slice().sort((a, b) => {
            if (a.days_to_exp != null && b.days_to_exp != null) return a.days_to_exp - b.days_to_exp;
            if (a.days_to_exp != null) return -1;
            if (b.days_to_exp != null) return 1;
            return String(a.expiry).localeCompare(String(b.expiry));
        });
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
                labels: strikes,
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
                labels: data.gamma_data.strikes,
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

    createOIStrikeChart(data) {
        const ctx = document.getElementById('oiStrikeChart');
        if (!ctx) return;

        const storageKey = `oiStrikeScope:${location.pathname}`;
        const oiAll = data?.oi_data;
        const oiNearest = data?.oi_data_nearest;
        const rowsByExpiry = data && Array.isArray(data.oi_by_expiry) ? data.oi_by_expiry : [];

        const hasOiShape = (obj) =>
            obj &&
            Array.isArray(obj.strikes) &&
            Array.isArray(obj.call_oi) &&
            Array.isArray(obj.put_oi) &&
            obj.strikes.length > 0 &&
            obj.call_oi.length === obj.strikes.length &&
            obj.put_oi.length === obj.strikes.length;
        
        const baseAll = hasOiShape(oiAll) ? oiAll : null;
        const baseNearest = hasOiShape(oiNearest) ? oiNearest : null;
        const canToggle = Boolean(baseAll && baseNearest);

        const findNearestExpiryRow = () => {
            const withDays = rowsByExpiry
                .filter((r) => Number.isFinite(Number(r.days_to_exp)))
                .map((r) => ({ ...r, days_to_exp: Number(r.days_to_exp) }));
            const nonNeg = withDays.filter((r) => r.days_to_exp >= 0);
            if (nonNeg.length > 0) return nonNeg.reduce((a, b) => (b.days_to_exp < a.days_to_exp ? b : a));
            if (withDays.length > 0) return withDays.reduce((a, b) => (b.days_to_exp < a.days_to_exp ? b : a));
            return rowsByExpiry[0] || null;
        };

        const nearestExpiryRow = findNearestExpiryRow();

        const getSelectedScope = () => {
            const saved = (localStorage.getItem(storageKey) || '').toLowerCase();
            if (saved === 'nearest' && canToggle) return 'nearest';
            return 'all';
        };
        const setSelectedScope = (scope) => localStorage.setItem(storageKey, scope);

        const resolveOi = (scope) => {
            if (scope === 'nearest' && canToggle) return baseNearest;
            return baseAll ?? baseNearest;
        };

        const scope = getSelectedScope();
        const selected = resolveOi(scope);
        if (!hasOiShape(selected)) return;

        if (canToggle) {
            const host = ctx.parentElement;
            if (host) {
                const existing = host.querySelector('#oiStrikeScopeToggle');
                const toggle = existing || document.createElement('div');
                toggle.id = 'oiStrikeScopeToggle';
                toggle.style.display = 'flex';
                toggle.style.gap = '8px';
                toggle.style.margin = '0 0 10px 0';
                toggle.style.flexWrap = 'wrap';

                const labelNearest = nearestExpiryRow?.expiry ? `Venc. mais próximo (${nearestExpiryRow.expiry})` : 'Venc. mais próximo';

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
                        const next = resolveOi(nextScope);
                        const chart = this.charts.oiStrike;
                        if (chart && hasOiShape(next)) {
                            chart.data.labels = next.strikes;
                            chart.data.datasets[0].data = next.call_oi;
                            chart.data.datasets[1].data = next.put_oi;
                            chart.update();
                        }
                    };
                });
            }
        }

        // Gráfico de Barras Empilhadas (Call vs Put) para Total OI
        this.charts.oiStrike = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: selected.strikes,
                datasets: [
                    {
                        label: 'Call OI',
                        data: selected.call_oi,
                        backgroundColor: 'rgba(0, 255, 0, 0.6)', // Verde Neon
                        borderColor: '#00ff00',
                        borderWidth: 1
                    },
                    {
                        label: 'Put OI',
                        data: selected.put_oi,
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
                                return 'Total: ' + total;
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
                        stacked: true
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
                labels: data.gamma_data.strikes,
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
                labels: data.greeks_2nd_order.strikes,
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
                labels: data.greeks_2nd_order.strikes,
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
                labels: data.greeks_2nd_order.strikes,
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
                labels: data.greeks_2nd_order.strikes,
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
                labels: oiSrc.strikes,
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
                labels: data.greeks_2nd_order.strikes,
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
                labels: data.greeks_2nd_order.strikes,
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
                labels: data.greeks_2nd_order.strikes,
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
                labels: data.greeks_2nd_order.strikes,
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
                labels: data.greeks_2nd_order.strikes,
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
                            callback: (value) => '$' + this.formatNumberBr(Number(value) / 1000000, 1) + 'M'
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
                labels: spots.map(s => s.toFixed(2)),
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
                labels: labels,
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
        const movesIn = utils?.getExpectedMoves ? utils.getExpectedMoves(data) : (data?.key_levels?.expected_moves ?? data?.v3_data?.expected_moves);
        if (!Array.isArray(movesIn) || movesIn.length === 0) {
            if (ctx.parentElement) ctx.parentElement.innerHTML = '<div class="loading-text">Dados indisponíveis</div>';
            return;
        }

        const spot = utils?.getSpot ? utils.getSpot(data) : (data?.overview?.spot_price ?? data?.overview?.spot);
        if (!Number.isFinite(spot)) {
            if (ctx.parentElement) ctx.parentElement.innerHTML = '<div class="loading-text">Dados indisponíveis</div>';
            return;
        }

        const toFiniteNumber = (v) => {
            const x = Number(v);
            return Number.isFinite(x) ? x : null;
        };

        const normalized = movesIn.map(m => {
            const days = toFiniteNumber(m.days);
            const upper1 = toFiniteNumber(m.sigma_1_up ?? m.upper);
            const lower1 = toFiniteNumber(m.sigma_1_down ?? m.lower);
            const move1 = toFiniteNumber(m.move ?? (upper1 != null ? (upper1 - spot) : null));
            const upper2 = toFiniteNumber(m.sigma_2_up ?? (move1 != null ? (spot + 2 * move1) : null));
            const lower2 = toFiniteNumber(m.sigma_2_down ?? (move1 != null ? (spot - 2 * move1) : null));
            return { days, label: String(m.label ?? ''), upper1, lower1, upper2, lower2 };
        }).filter(m => m.days != null && m.upper1 != null && m.lower1 != null && m.upper2 != null && m.lower2 != null);

        if (normalized.length === 0) {
            if (ctx.parentElement) ctx.parentElement.innerHTML = '<div class="loading-text">Dados indisponíveis</div>';
            return;
        }

        const byDay = new Map();
        for (const m of normalized) byDay.set(m.days, m);
        const daysSorted = Array.from(byDay.keys()).sort((a, b) => a - b);
        const horizons = [0, ...daysSorted];
        const expiryDays = Math.max(...horizons);

        const upper2Points = horizons.map(d => ({ x: d, y: d === 0 ? spot : byDay.get(d).upper2 }));
        const upper1Points = horizons.map(d => ({ x: d, y: d === 0 ? spot : byDay.get(d).upper1 }));
        const spotPoints = horizons.map(d => ({ x: d, y: spot }));
        const lower1Points = horizons.map(d => ({ x: d, y: d === 0 ? spot : byDay.get(d).lower1 }));
        const lower2Points = horizons.map(d => ({ x: d, y: d === 0 ? spot : byDay.get(d).lower2 }));

        if (this.charts.expectedMove) this.charts.expectedMove.destroy();

        this.charts.expectedMove = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [
                    {
                        label: '+2σ',
                        data: upper2Points,
                        borderColor: 'rgba(255, 0, 0, 0.5)',
                        borderDash: [5, 5],
                        fill: false,
                        pointRadius: 0
                    },
                    {
                        label: '+1σ',
                        data: upper1Points,
                        borderColor: '#00ff00',
                        backgroundColor: 'rgba(0, 255, 0, 0.1)',
                        fill: 3, // Fill to dataset index 3 (-1σ)
                        pointRadius: 3
                    },
                    {
                        label: 'Spot',
                        data: spotPoints,
                        borderColor: '#ffffff',
                        borderDash: [2, 2],
                        pointRadius: 0,
                        fill: false
                    },
                    {
                        label: '-1σ',
                        data: lower1Points,
                        borderColor: '#00ff00',
                        backgroundColor: 'rgba(0, 255, 0, 0.1)',
                        fill: false, // Already filled from +1σ
                        pointRadius: 3
                    },
                    {
                        label: '-2σ',
                        data: lower2Points,
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
                    },
                    tooltip: {
                        ...this.chartOptions.plugins.tooltip,
                        callbacks: {
                            title: (items) => {
                                const d = Number(items?.[0]?.parsed?.x);
                                if (!Number.isFinite(d)) return '';
                                if (d === 0) return 'Hoje';
                                if (d === expiryDays) return `Expiração (${d}d)`;
                                if (d === 1) return '1 Dia';
                                if (d === 5) return '1 Semana';
                                return `${d} dias`;
                            }
                        }
                    }
                },
                scales: {
                    ...this.chartOptions.scales,
                    x: {
                        ...this.chartOptions.scales.x,
                        type: 'linear',
                        title: { display: true, text: 'Horizonte (dias úteis)' },
                        ticks: {
                            autoSkip: false,
                            callback: (value) => {
                                const v = Number(value);
                                if (!Number.isFinite(v)) return value;
                                if (v === 0) return 'Hoje';
                                if (v === expiryDays) return 'Exp';
                                if (v === 1) return '1D';
                                if (v === 5) return '1S';
                                return `${v}d`;
                            }
                        },
                        afterBuildTicks: (axis) => {
                            axis.ticks = axis.ticks.filter(t => horizons.includes(Number(t.value)));
                        }
                    },
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
                labels: spots.map(s => s.toFixed(2)),
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
                labels: strikes,
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
                labels: strikes,
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
        const keyLevels = data?.key_levels ?? data?.v3_data?.key_levels;
        if (!keyLevels) return;
        
        const setText = (id, value) => {
            const el = document.getElementById(id);
            if (el) el.innerText = value !== null ? this.formatNumberBr(value, 2) : 'N/A';
        };

        setText('gamma-flip', keyLevels.gamma_flip);
        setText('call-wall', keyLevels.call_wall);
        setText('put-wall', keyLevels.put_wall);
        setText('edi-effective-call', keyLevels.effective_call_wall);
        setText('edi-effective-put', keyLevels.effective_put_wall);
        setText('max-pain', keyLevels.max_pain);
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

        const sims = data && data.v3_data && Array.isArray(data.v3_data.fair_value_sims)
            ? data.v3_data.fair_value_sims
            : null;

        if (!sims) {
            containers.forEach((c) => { c.innerHTML = '<p>Dados indisponíveis.</p>'; });
            return;
        }
        if (sims.length === 0) {
            containers.forEach((c) => { c.innerHTML = '<p>Nenhuma simulação disponível.</p>'; });
            return;
        }

        const fmt = (v, decimals = 2) => {
            if (typeof v !== 'number' || !isFinite(v)) return '-';
            return v.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
        };

        let html = '<table class="neon-table"><thead><tr><th>Cenário</th><th>Alvo (Spot)</th><th>Strike</th><th>Call (Hoje)</th><th>Call (Sim)</th><th>Var %</th><th>Put (Hoje)</th><th>Put (Sim)</th><th>Var %</th></tr></thead><tbody>';

        sims.forEach((sim) => {
            const opts = sim && Array.isArray(sim.options) ? sim.options : [];
            opts.forEach((opt) => {
                const callChg = typeof opt.Call_Chg === 'number' ? opt.Call_Chg : 0;
                const putChg = typeof opt.Put_Chg === 'number' ? opt.Put_Chg : 0;
                const callClass = callChg >= 0 ? 'positive-val' : 'negative-val';
                const putClass = putChg >= 0 ? 'positive-val' : 'negative-val';

                html += `
                    <tr>
                        <td class="font-bold">${sim.scenario ?? '-'}</td>
                        <td>${fmt(sim.target_spot, 2)}</td>
                        <td class="font-bold text-center" style="color: var(--secondary-neon);">${fmt(opt.Strike, 2)}</td>
                        <td>${fmt(opt.Call_Now, 2)}</td>
                        <td>${fmt(opt.Call_Sim, 2)}</td>
                        <td class="${callClass}">${fmt(callChg, 1)}%</td>
                        <td>${fmt(opt.Put_Now, 2)}</td>
                        <td>${fmt(opt.Put_Sim, 2)}</td>
                        <td class="${putClass}">${fmt(putChg, 1)}%</td>
                    </tr>
                `;
            });
        });

        html += '</tbody></table>';
        containers.forEach((c) => { c.innerHTML = html; });
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

// Initialize charts when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.strangerThingsCharts = new StrangerThingsCharts();
});
