/**
 * Base Charts Module — Métodos compartilhados entre WDO e WIN
 * 
 * Classe base com todos os métodos de criação de gráficos.
 * WDO e WIN extendem esta classe e adicionam métodos específicos.
 */
class BaseCharts {
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
    }

    /**
     * Formata valor numérico para formato brasileiro
     * @param {number} value - Valor a formatar
     * @param {number} decimals - Casas decimais
     * @returns {string} Valor formatado
     */
    formatNumberBr(value, decimals = 2) {
        if (value === null || value === undefined || isNaN(value)) return '-';
        const factor = Math.pow(10, decimals);
        const rounded = Math.round(value * factor) / factor;
        return rounded.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    }

    /**
     * Formata valor numérico de forma compacta (K, M, B, T)
     * @param {number} value - Valor a formatar
     * @returns {string} Valor formatado compactamente
     */
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

    /**
     * Anima valor de um elemento
     */
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

    /**
     * Cria gráfico de Delta Acumulado
     */
    createDeltaChart(data) {
        const ctx = document.getElementById('deltaChart');
        if (!ctx) return;

        this.charts.delta = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.delta_data.strikes,
                datasets: [{
                    label: 'Delta Acumulado',
                    data: data.delta_data.delta_cumulative,
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

    /**
     * Cria gráfico de Gamma Exposure
     */
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

    /**
     * Cria gráfico de Volatilidade Implícita
     */
    createVolatilityChart(data) {
        const ctx = document.getElementById('volatilityChart');
        if (!ctx) return;

        const hasSkew = data.volatility_data.skew && data.volatility_data.skew.length > 0;

        const datasets = [{
            label: 'Volatilidade Implícita (%)',
            data: data.volatility_data.iv_values,
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
                data: data.volatility_data.skew,
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
                labels: data.volatility_data.strikes,
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
                            drawOnChartArea: false,
                            color: 'rgba(255, 0, 255, 0.2)'
                        },
                        ticks: {
                            color: '#ff00ff',
                            font: { family: 'Share Tech Mono' }
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

    /**
     * Cria gráfico de OI por Vencimento
     */
    createOIExpiryChart(data) {
        const ctx = document.getElementById('oiExpiryChart');
        if (!ctx) return;
        const items = data && Array.isArray(data.oi_by_expiry) ? data.oi_by_expiry : [];
        if (!items.length) return;

        const labels = items.map((r) => String((r && r.expiry) || '—'));
        const call = items.map((r) => Number((r && r.call_oi) || 0));
        const put = items.map((r) => Number((r && r.put_oi) || 0));

        if (this.charts.oiExpiry) this.charts.oiExpiry.destroy();
        this.charts.oiExpiry = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [
                    {
                        label: 'OI Call',
                        data: call,
                        backgroundColor: 'rgba(0, 255, 0, 0.6)',
                        borderColor: '#00ff00',
                        borderWidth: 1,
                    },
                    {
                        label: 'OI Put',
                        data: put,
                        backgroundColor: 'rgba(255, 7, 58, 0.6)',
                        borderColor: '#ff073a',
                        borderWidth: 1,
                    },
                ],
            },
            options: {
                ...this.chartOptions,
                plugins: {
                    ...this.chartOptions.plugins,
                    title: {
                        display: true,
                        text: 'Open Interest por Vencimento (Call vs Put)',
                        color: '#ff00ff',
                        font: { family: 'Orbitron', size: 16, weight: 'bold' },
                    },
                },
                scales: {
                    ...this.chartOptions.scales,
                    x: {
                        ...this.chartOptions.scales.x,
                        ticks: {
                            ...this.chartOptions.scales.x.ticks,
                            maxRotation: 45,
                            minRotation: 45,
                        },
                    },
                    y: {
                        ...this.chartOptions.scales.y,
                        ticks: {
                            ...this.chartOptions.scales.y.ticks,
                            callback: (v) => this.formatCompactBr(Number(v)),
                        },
                    },
                },
            },
        });
    }

    /**
     * Cria tabelas de Most Actives
     */
    createMostActivesTables(data) {
        const container = document.getElementById('most-actives-container');
        if (!container) return;
        const oi = data && data.oi_data ? data.oi_data : null;
        const vol = data && data.volume_data ? data.volume_data : null;
        if (!oi && !vol) return;

        const ivMap = new Map();
        const detailed = data && Array.isArray(data.detailed_data) ? data.detailed_data : [];
        detailed.forEach((r) => {
            const k = Number(r && r.strike);
            const iv = Number(r && r.iv);
            if (Number.isFinite(k) && Number.isFinite(iv)) ivMap.set(String(k), iv);
        });

        const buildTop = (strikes, callArr, putArr, limit = 10) => {
            const rows = [];
            const n = Math.min(strikes.length, callArr.length, putArr.length);
            for (let i = 0; i < n; i++) {
                const k = Number(strikes[i]);
                const c = Number(callArr[i] || 0);
                const p = Number(putArr[i] || 0);
                const iv = ivMap.get(String(k));
                if (Number.isFinite(k) && Number.isFinite(c) && c > 0) rows.push({ strike: k, tipo: 'C', val: c, iv });
                if (Number.isFinite(k) && Number.isFinite(p) && p > 0) rows.push({ strike: k, tipo: 'P', val: p, iv });
            }
            rows.sort((a, b) => Number(b.val) - Number(a.val));
            return rows.slice(0, limit);
        };

        const topOi =
            oi && Array.isArray(oi.strikes) && Array.isArray(oi.call_oi) && Array.isArray(oi.put_oi)
                ? buildTop(oi.strikes, oi.call_oi, oi.put_oi)
                : [];
        const topVol =
            vol && Array.isArray(vol.strikes) && Array.isArray(vol.call_volume) && Array.isArray(vol.put_volume)
                ? buildTop(vol.strikes, vol.call_volume, vol.put_volume)
                : [];

        const th = (v) =>
            `<th style="text-align:left;padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.14);color:#b3b3b3;font-family:'Share Tech Mono',monospace;font-size:12px;">${v}</th>`;
        const td = (v) =>
            `<td style="padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.08);font-family:'Share Tech Mono',monospace;font-size:12px;">${v}</td>`;
        const fmtStrike = (v) => this.formatNumberBr(Number(v), 0);
        const fmtVal = (v) => this.formatNumberBr(Number(v), 0);
        const fmtIv = (v) => (Number.isFinite(Number(v)) ? this.formatNumberBr(Number(v), 1) + '%' : '—');
        const tipoColor = (t) => (t === 'C' ? 'style="color:#00ff00;font-weight:700;"' : 'style="color:#ff073a;font-weight:700;"');

        const renderTable = (title, rows, valueLabel) => {
            const body =
                rows && rows.length
                    ? rows
                          .map((r) => {
                              return (
                                  `<tr>` +
                                  td(fmtStrike(r.strike)) +
                                  `<td ${tipoColor(r.tipo)} style="padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.08);font-family:'Share Tech Mono',monospace;font-size:12px;">${r.tipo}</td>` +
                                  td(fmtVal(r.val)) +
                                  td(fmtIv(r.iv)) +
                                  `</tr>`
                              );
                          })
                          .join('')
                    : `<tr>${td('—')}${td('—')}${td('—')}${td('—')}</tr>`;
            return (
                `<div style="flex:1;min-width:320px;">` +
                `<div style="font-family:'Orbitron',sans-serif;color:#ff073a;font-weight:700;margin:4px 0 10px 0;">${title}</div>` +
                `<table style="width:100%;border-collapse:collapse;">` +
                `<thead><tr>${th('STRIKE')}${th('TIPO')}${th(valueLabel)}${th('IV')}</tr></thead>` +
                `<tbody>${body}</tbody>` +
                `</table>` +
                `</div>`
            );
        };

        container.innerHTML =
            `<div style="display:flex;gap:16px;flex-wrap:wrap;">` +
            renderTable('🔥 Top Open Interest', topOi, 'OPEN INT') +
            renderTable('🌊 Top Volume', topVol, 'VOLUME') +
            `</div>`;
    }

    /**
     * Cria gráfico de Volume vs Volatilidade
     */
    createVolumeVolatilityChart(data) {
        const ctx = document.getElementById('volumeVolatilityChart');
        if (!ctx) return;

        const vol = data && data.volume_data ? data.volume_data : null;
        if (!vol || !Array.isArray(vol.strikes) || !Array.isArray(vol.call_volume) || !Array.isArray(vol.put_volume)) return;

        const strikes = vol.strikes.map((k) => Number(k)).filter((k) => Number.isFinite(k));
        const totalVol = strikes.map((_, i) => Number(vol.call_volume[i] || 0) + Number(vol.put_volume[i] || 0));

        const ivMap = new Map();
        const detailed = data && Array.isArray(data.detailed_data) ? data.detailed_data : [];
        detailed.forEach((r) => {
            const k = Number(r && r.strike);
            const iv = Number(r && r.iv);
            if (Number.isFinite(k) && Number.isFinite(iv)) ivMap.set(String(k), iv);
        });
        const ivSeries = strikes.map((k) => {
            const iv = ivMap.get(String(k));
            return Number.isFinite(Number(iv)) ? Number(iv) : null;
        });

        const volumePoints = strikes.map((k, i) => ({ x: k, y: totalVol[i] }));
        const ivPoints = strikes.map((k, i) => ({ x: k, y: ivSeries[i] }));

        const spot = (data && (Number(data.spot_price) || (data.overview && Number(data.overview.spot_price)))) || null;
        if (this.charts.volumeVolatility) this.charts.volumeVolatility.destroy();
        this.charts.volumeVolatility = new Chart(ctx, {
            type: 'bar',
            data: {
                datasets: [
                    {
                        type: 'bar',
                        label: 'Volume Total',
                        data: volumePoints,
                        backgroundColor: 'rgba(0, 243, 255, 0.35)',
                        borderColor: '#00f3ff',
                        borderWidth: 1,
                        yAxisID: 'y',
                    },
                    {
                        type: 'line',
                        label: 'Volatilidade (IV)',
                        data: ivPoints,
                        borderColor: '#ff00ff',
                        backgroundColor: 'rgba(255, 0, 255, 0.12)',
                        borderWidth: 2,
                        pointRadius: 2,
                        tension: 0.2,
                        yAxisID: 'y1',
                    },
                ],
            },
            options: {
                ...this.chartOptions,
                plugins: {
                    ...this.chartOptions.plugins,
                    title: {
                        display: true,
                        text: 'Volume vs Volatilidade',
                        color: '#ff00ff',
                        font: { family: 'Orbitron', size: 16, weight: 'bold' },
                    },
                    spotLine: Number.isFinite(spot) ? { value: spot, color: 'lime', labelText: `SPOT ${this.formatNumberBr(spot, 2)}` } : false,
                },
                scales: {
                    ...this.chartOptions.scales,
                    x: {
                        ...this.chartOptions.scales.x,
                        type: 'linear',
                        ticks: {
                            ...this.chartOptions.scales.x.ticks,
                            callback: (v) => this.formatNumberBr(Number(v), 0),
                        },
                    },
                    y: {
                        ...this.chartOptions.scales.y,
                        position: 'left',
                        title: { display: true, text: 'Volume', color: '#00f3ff' },
                        ticks: {
                            ...this.chartOptions.scales.y.ticks,
                            callback: (v) => this.formatCompactBr(Number(v)),
                        },
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        grid: { drawOnChartArea: false, color: 'rgba(255, 0, 255, 0.2)' },
                        title: { display: true, text: 'IV %', color: '#ff00ff' },
                        ticks: {
                            color: '#ff00ff',
                            font: { family: 'Share Tech Mono' },
                            callback: (v) => this.formatNumberBr(Number(v), 1),
                        },
                    },
                },
            },
        });
    }

    /**
     * Cria gráfico de OI por Strike
     */
    createOIStrikeChart(data) {
        const ctx = document.getElementById('oiStrikeChart');
        if (!ctx) return;

        const modeEl = document.getElementById('oiExpiryMode');
        const infoEl = document.getElementById('oiExpiryInfo');

        const pickOiData = () => {
            const mode = modeEl ? String(modeEl.value || 'all') : 'all';
            const preferNearest = mode === 'nearest';
            const nearest = data && data.oi_data_nearest;
            const all = data && data.oi_data;
            if (preferNearest && nearest && Array.isArray(nearest.strikes) && nearest.strikes.length) return nearest;
            if (all && Array.isArray(all.strikes) && all.strikes.length) return all;
            if (nearest && Array.isArray(nearest.strikes) && nearest.strikes.length) return nearest;
            return null;
        };

        const spot =
            (data && (Number(data.spot_price) || (data.overview && Number(data.overview.spot_price)))) || null;

        const render = () => {
            const oi = pickOiData();
            const strikes = (oi && oi.strikes) || (data.volume_data && data.volume_data.strikes) || [];
            const callOi = (oi && oi.call_oi) || (data.volume_data && data.volume_data.call_volume) || [];
            const putOi = (oi && oi.put_oi) || (data.volume_data && data.volume_data.put_volume) || [];
            const expiry = oi && oi.expiry ? String(oi.expiry) : null;

            if (infoEl) {
                const mode = modeEl ? String(modeEl.value || 'all') : 'all';
                infoEl.textContent = mode === 'nearest' && expiry ? `Venc: ${expiry}` : '';
            }

            const labels = strikes.slice();
            const dsCall = labels.map((_, i) => Number(callOi[i] || 0));
            const dsPut = labels.map((_, i) => -Math.abs(Number(putOi[i] || 0)));

            if (this.charts.oiStrike) {
                this.charts.oiStrike.data.labels = labels;
                this.charts.oiStrike.data.datasets[0].data = dsCall;
                this.charts.oiStrike.data.datasets[1].data = dsPut;
                this.charts.oiStrike.options.plugins.spotLine = Number.isFinite(spot)
                    ? { value: spot, color: 'lime', labelText: `SPOT ${this.formatNumberBr(spot, 2)}` }
                    : undefined;
                this.charts.oiStrike.update();
                return;
            }

            this.charts.oiStrike = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels,
                    datasets: [
                        {
                            label: 'Call OI',
                            data: dsCall,
                            backgroundColor: 'rgba(0, 255, 0, 0.6)',
                            borderColor: '#00ff00',
                            borderWidth: 1,
                        },
                        {
                            label: 'Put OI',
                            data: dsPut,
                            backgroundColor: 'rgba(255, 7, 58, 0.6)',
                            borderColor: '#ff073a',
                            borderWidth: 1,
                        },
                    ],
                },
                options: {
                    ...this.chartOptions,
                    plugins: {
                        ...this.chartOptions.plugins,
                        title: {
                            display: true,
                            text: 'Open Interest por Strike (Call vs Put)',
                            color: '#ff00ff',
                            font: {
                                family: 'Orbitron',
                                size: 16,
                                weight: 'bold',
                            },
                        },
                        tooltip: {
                            ...this.chartOptions.plugins.tooltip,
                            callbacks: {
                                label: (context) => {
                                    const label = context.dataset && context.dataset.label ? context.dataset.label : '';
                                    const v = Number(context.raw);
                                    const abs = Math.abs(v);
                                    const formatted = this.formatNumberBr(abs, 0);
                                    return label ? `${label}: ${formatted}` : formatted;
                                },
                                footer: (tooltipItems) => {
                                    let total = 0;
                                    tooltipItems.forEach((item) => {
                                        total += Math.abs(Number(item.raw || 0));
                                    });
                                    return 'Total: ' + this.formatNumberBr(total, 0);
                                },
                            },
                        },
                        spotLine: Number.isFinite(spot)
                            ? { value: spot, color: 'lime', labelText: `SPOT ${this.formatNumberBr(spot, 2)}` }
                            : undefined,
                    },
                    scales: {
                        ...this.chartOptions.scales,
                        x: { ...this.chartOptions.scales.x, stacked: true },
                        y: {
                            ...this.chartOptions.scales.y,
                            stacked: true,
                            ticks: {
                                ...this.chartOptions.scales.y.ticks,
                                callback: (value) => this.formatCompactBr(Math.abs(Number(value))),
                            },
                        },
                    },
                },
            });
        };

        if (!this._oiStrikeModeBound && modeEl) {
            this._oiStrikeModeBound = true;
            modeEl.addEventListener('change', render);
        }

        render();
    }

    /**
     * Cria gráfico de GEX Split (Call vs Put)
     */
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
                        stacked: false
                    },
                    y: {
                        ...this.chartOptions.scales.y,
                        stacked: false
                    }
                }
            }
        });
    }

    /**
     * Cria gráfico de Vanna Exposure
     */
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

    /**
     * Cria gráfico de Charm Exposure
     */
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

    /**
     * Cria gráfico de Theta Exposure
     */
    createThetaChart(data) {
        const ctx = document.getElementById('thetaChart');
        if (!ctx) return;

        this.charts.theta = new Chart(ctx, {
            type: 'bar',
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

    /**
     * Cria gráfico de Vega Exposure
     */
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

    /**
     * Cria gráfico de Pin Risk
     */
    createPinRiskChart(data) {
        const ctx = document.getElementById('pinRiskChart');
        if (!ctx) return;

        const totalOI = data.volume_data.call_volume.map((v, i) => v + data.volume_data.put_volume[i]);

        this.charts.pinRisk = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.volume_data.strikes,
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

    /**
     * Cria gráfico de Charm Acumulado
     */
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

    /**
     * Cria gráfico de Vanna Acumulado
     */
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

    /**
     * Cria gráfico de R-Gamma (PVOP)
     */
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

    /**
     * Cria gráfico de R-Gamma Acumulado
     */
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

    /**
     * Cria gráfico de Theta Acumulado
     */
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

    /**
     * Cria gráfico de Max Pain
     */
    createMaxPainChart(data) {
        const ctx = document.getElementById('maxPainChart');
        if (!ctx || !data.v3_data || !data.v3_data.max_pain_profile) return;

        const profile = data.v3_data.max_pain_profile;

        this.charts.maxPain = new Chart(ctx, {
            type: 'line',
            data: {
                labels: profile.strikes,
                datasets: [{
                    label: 'Perda dos Compradores (Valor Intrínseco)',
                    data: profile.loss,
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
                            callback: function(value) {
                                return '$' + (value / 1000000).toFixed(1) + 'M';
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Cria gráfico de Gamma Flip Cone
     */
    createGammaFlipConeChart(data) {
        const ctx = document.getElementById('gammaFlipConeChart');
        if (!ctx || !data.v3_data || !data.v3_data.gamma_flip_cone) return;

        const coneData = data.v3_data.gamma_flip_cone;
        
        this.charts.gammaFlipCone = new Chart(ctx, {
            type: 'line',
            data: {
                labels: coneData.alphas.map(a => (a * 100).toFixed(0) + '% Vol'),
                datasets: [{
                    label: 'Gamma Flip Level',
                    data: coneData.flips,
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
                    }
                }
            }
        });
    }

    /**
     * Cria gráfico de Delta Flip Profile
     */
    createDeltaFlipProfileChart(data) {
        const ctx = document.getElementById('deltaFlipProfileChart');
        if (!ctx || !data.v3_data || !data.v3_data.delta_flip_profile) return;

        const profileData = data.v3_data.delta_flip_profile;
        
        this.charts.deltaFlipProfile = new Chart(ctx, {
            type: 'line',
            data: {
                labels: profileData.spots.map(s => s.toFixed(2)),
                datasets: [{
                    label: 'Net Delta',
                    data: profileData.deltas,
                    borderColor: '#00f3ff',
                    backgroundColor: 'rgba(0, 243, 255, 0.1)',
                    borderWidth: 2,
                    fill: {
                        target: 'origin',
                        above: 'rgba(0, 243, 255, 0.1)',
                        below: 'rgba(255, 7, 58, 0.1)'
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

    /**
     * Cria gráfico de Flow Sentiment
     */
    createFlowSentimentChart(data) {
        const ctx = document.getElementById('flowSentimentChart');
        if (!ctx || !data.v3_data || !data.v3_data.flow_sentiment) return;

        const flowData = data.v3_data.flow_sentiment;
        const labels = data.delta_data.strikes;

        this.charts.flowSentiment = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Bullish Flow',
                        data: flowData.bull,
                        backgroundColor: 'rgba(0, 255, 0, 0.6)',
                        borderColor: '#00ff00',
                        borderWidth: 1
                    },
                    {
                        label: 'Bearish Flow',
                        data: flowData.bear,
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

    /**
     * Cria gráfico de Expected Move
     */
    createExpectedMoveChart(data) {
        const ctx = document.getElementById('expectedMoveChart');
        if (!ctx || !data.key_levels || !data.key_levels.expected_moves) return;

        const moves = data.key_levels.expected_moves;
        
        const labels = moves.map(m => m.label);
        
        const days = moves.map(m => m.days);
        const upper1 = moves.map(m => m.sigma_1_up);
        const lower1 = moves.map(m => m.sigma_1_down);
        const upper2 = moves.map(m => m.sigma_2_up);
        const lower2 = moves.map(m => m.sigma_2_down);
        
        const spot = data.overview.spot_price;
        const allDays = [0, ...days];
        const allUpper1 = [spot, ...upper1];
        const allLower1 = [spot, ...lower1];
        const allUpper2 = [spot, ...upper2];
        const allLower2 = [spot, ...lower2];
        const allLabels = ['Hoje', ...labels];

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
                        fill: 3,
                        pointRadius: 3
                    },
                    {
                        label: 'Spot',
                        data: Array(allDays.length).fill(spot),
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
                        fill: false,
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

    /**
     * Cria gráfico de MM PnL Simulation
     */
    createMMPnLChart(data) {
        const ctx = document.getElementById('mmPnlChart');
        if (!ctx || !data.v3_data || !data.v3_data.mm_pnl) return;

        const pnlData = data.v3_data.mm_pnl;
        
        this.charts.mmPnl = new Chart(ctx, {
            type: 'line',
            data: {
                labels: pnlData.spots.map(s => s.toFixed(2)),
                datasets: [{
                    label: 'MM PnL Simulation',
                    data: pnlData.pnl,
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

    /**
     * Cria gráfico de Dealer Pressure
     */
    createDealerPressureChart(data) {
        const ctx = document.getElementById('dealerPressureChart');
        if (!ctx || !data.v3_data || !data.v3_data.dealer_pressure_profile) return;

        const profile = data.v3_data.dealer_pressure_profile;
        const strikes = data.delta_data.strikes;

        this.charts.dealerPressure = new Chart(ctx, {
            type: 'line',
            data: {
                labels: strikes,
                datasets: [{
                    label: 'Dealer Pressure',
                    data: profile,
                    borderColor: '#9ca3af',
                    backgroundColor: 'rgba(156, 163, 175, 0.1)',
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
                        text: 'Dealer Pressure Index',
                        color: '#ff00ff',
                        font: { family: 'Orbitron', size: 16, weight: 'bold' }
                    }
                }
            }
        });
    }

    /**
     * Cria gráfico de Delta Agregado
     */
    createDeltaAgregadoChart(data) {
        const ctx = document.getElementById('deltaAgregadoChart');
        if (!ctx) return;

        const strikes = data.delta_data.strikes;
        const deltaValues = data.delta_data.delta_values;

        this.charts.deltaAgregado = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: strikes,
                datasets: [{
                    label: 'Delta Agregado',
                    data: deltaValues,
                    backgroundColor: deltaValues.map(v => v >= 0 ? 'rgba(0, 255, 0, 0.6)' : 'rgba(255, 0, 0, 0.6)'),
                    borderColor: deltaValues.map(v => v >= 0 ? '#00ff00' : '#ff0000'),
                    borderWidth: 1
                }]
            },
            options: {
                ...this.chartOptions,
                plugins: {
                    ...this.chartOptions.plugins,
                    title: {
                        display: true,
                        text: 'Delta Agregado por Strike',
                        color: '#ff00ff',
                        font: { family: 'Orbitron', size: 16, weight: 'bold' }
                    }
                }
            }
        });
    }

    /**
     * Atualiza métricas do overview
     */
    updateMetrics(data) {
        this.animateValue('total-trades', 0, data.overview.total_trades, 2000);
        this.animateValue('volume-total', 0, data.overview.total_volume, 2000);
        this.animateValue('gamma-exposure', 0, data.overview.gamma_exposure, 2000);
        this.animateValue('delta-position', 0, data.overview.delta_position, 2000);
    }

    /**
     * Atualiza níveis-chave
     */
    updateKeyLevels(data) {
        const levels = data.key_levels || {};
        const setEl = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.textContent = val;
        };
        setEl('gamma-flip', levels.gamma_flip != null ? this.formatNumberBr(levels.gamma_flip, 2) : 'N/A');
        setEl('call-wall', levels.call_wall != null ? this.formatNumberBr(levels.call_wall, 2) : 'N/A');
        setEl('put-wall', levels.put_wall != null ? this.formatNumberBr(levels.put_wall, 2) : 'N/A');
        setEl('edi-effective-call', levels.effective_call_wall != null ? this.formatNumberBr(levels.effective_call_wall, 2) : 'N/A');
        setEl('edi-effective-put', levels.effective_put_wall != null ? this.formatNumberBr(levels.effective_put_wall, 2) : 'N/A');
        setEl('max-pain', levels.max_pain != null ? this.formatNumberBr(levels.max_pain, 2) : 'N/A');
    }

    /**
     * Atualiza código NTSL
     */
    updateNtslCode(data) {
        const el = document.getElementById('ntsl-code');
        if (el && data.ntsl_script) {
            el.textContent = data.ntsl_script;
        }
    }

    /**
     * Preenche tabela detalhada
     */
    populateTable(data) {
        const tbody = document.querySelector('#data-table tbody');
        if (!tbody || !data.detailed_data) return;
        tbody.innerHTML = data.detailed_data.map(row => `
            <tr>
                <td>${this.formatNumberBr(row.strike, 0)}</td>
                <td>${row.iv != null ? this.formatNumberBr(row.iv, 2) + '%' : '—'}</td>
                <td>${this.formatNumberBr(row.delta, 4)}</td>
                <td>${this.formatNumberBr(row.gamma, 6)}</td>
                <td>${this.formatNumberBr(row.volume, 0)}</td>
                <td>${this.formatNumberBr(row.oi, 0)}</td>
            </tr>
        `).join('');
    }

    /**
     * Cria tabela de Fair Value
     */
    createFairValueTable(data) {
        const container = document.getElementById('fair-value-container');
        if (!container || !data.fair_value) return;

        const scenarios = data.fair_value;
        let html = '<table style="width:100%;border-collapse:collapse;">';
        html += '<thead><tr>';
        html += '<th style="text-align:left;padding:8px;border-bottom:1px solid rgba(255,255,255,.14);color:#b3b3b3;">Cenário</th>';
        html += '<th style="text-align:right;padding:8px;border-bottom:1px solid rgba(255,255,255,.14);color:#b3b3b3;">Call Now</th>';
        html += '<th style="text-align:right;padding:8px;border-bottom:1px solid rgba(255,255,255,.14);color:#b3b3b3;">Call Sim</th>';
        html += '<th style="text-align:right;padding:8px;border-bottom:1px solid rgba(255,255,255,.14);color:#b3b3b3;">Put Now</th>';
        html += '<th style="text-align:right;padding:8px;border-bottom:1px solid rgba(255,255,255,.14);color:#b3b3b3;">Put Sim</th>';
        html += '</tr></thead><tbody>';

        scenarios.forEach(scenario => {
            html += `<tr>
                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.08);color:#00f3ff;">${scenario.label}</td>
                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.08);text-align:right;">${this.formatNumberBr(scenario.call_now, 2)}</td>
                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.08);text-align:right;color:${scenario.call_change >= 0 ? '#00ff00' : '#ff0000'};">${this.formatNumberBr(scenario.call_sim, 2)}</td>
                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.08);text-align:right;">${this.formatNumberBr(scenario.put_now, 2)}</td>
                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.08);text-align:right;color:${scenario.put_change >= 0 ? '#00ff00' : '#ff0000'};">${this.formatNumberBr(scenario.put_sim, 2)}</td>
            </tr>`;
        });

        html += '</tbody></table>';
        container.innerHTML = html;
    }

    /**
     * Atualiza timestamp da última atualização
     */
    updateLastUpdate(data) {
        const el = document.getElementById('last-update-label');
        if (el && data.last_updated) {
            el.textContent = `Atualizado: ${data.last_updated}`;
        }
    }

    /**
     * Destrói todos os gráficos (cleanup)
     */
    destroy() {
        Object.keys(this.charts).forEach(chartKey => {
            if (this.charts[chartKey]) {
                this.charts[chartKey].destroy();
            }
        });
        this.charts = {};
    }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.BaseCharts = BaseCharts;
}
