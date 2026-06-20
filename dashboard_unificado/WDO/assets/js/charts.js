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
            this.data = data;

            if (window.ChartDataUtils) {
                window.ChartDataUtils.registerSpotLinePlugin?.();
                window.ChartDataUtils.registerVLinesPlugin?.();
            }
            this.createDeltaChart(data);
            this.createGammaChart(data);
            // this.createVolumeChart(data); // Removido por redundância (Volume Chart era na verdade OI)
            this.createVolatilityChart(data);
            
            // Novos Gráficos
            this.createOIStrikeChart(data);
            this.createOIExpiryChart(data);
            this.createMostActivesTables(data);
            this.createVolumeVolatilityChart(data);
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

            this.updateMetrics(data);
            this.updateKeyLevels(data);
            this.updateNtslCode(data);
            this.populateTable(data);
            this.createFairValueTable(data); // Added
            this.updateLastUpdate(data);
            this.createFedWatchTable();
            this.createYahooUupOiChart();
            this.createYahooUsduOiChart();
            this.createYahooUsdbrlBetaMappingBlock();
            this.updateYahooOptionsPanel(); // Added: painel consolidado de opcoes Yahoo (USDU/UUP/EWZ)
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

    updateYahooOptionsPanel() {
        const container = document.getElementById('yahoo-options-container');
        if (!container) return;

        const rows = [
            { ticker: 'USDU', data: window.yahooUsduOptionsData },
            { ticker: 'UUP', data: window.yahooUupOptionsData },
            { ticker: 'EWZ', data: window.yahooEwzOptionsData },
        ];

        const nowMs = Date.now();
        const staleDays = 7;
        const msPerDay = 24 * 60 * 60 * 1000;

        function parseCapturedAtUtc(obj) {
            const raw =
                obj &&
                (obj.captured_at_utc ||
                    obj.capturedAtUtc ||
                    obj.capturedAt ||
                    (obj.meta && obj.meta.capturedAtUtc));
            if (!raw) return null;
            const dt = new Date(raw);
            return isNaN(dt.getTime()) ? null : dt;
        }

        const norm = rows.map((r) => {
            const obj = r.data;
            if (!obj || typeof obj !== 'object') {
                return {
                    ticker: r.ticker,
                    ok: false,
                    status: 'MISSING',
                    spot: null,
                    capturedAt: null,
                    ageDays: null,
                    warnings: [],
                };
            }
            const capturedAt = parseCapturedAtUtc(obj);
            const ageDays = capturedAt ? (nowMs - capturedAt.getTime()) / msPerDay : null;
            const warnings = Array.isArray(obj.warnings) ? obj.warnings : [];
            const spot = typeof obj.spot === 'number' ? obj.spot : null;
            const isStale = ageDays != null && ageDays > staleDays;
            const status = isStale ? 'STALE' : 'OK';
            return { ticker: r.ticker, ok: true, status, spot, capturedAt, ageDays, warnings };
        });

        const statusColor = (s) => {
            if (s === 'OK') return '#00f3ff';
            if (s === 'STALE') return '#ffb000';
            return '#ff073a';
        };

        const td = (v) =>
            `<td style="padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.08);">${v}</td>`;
        const th = (v) =>
            `<th style="text-align:left;padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.14);color:#b3b3b3;font-family:'Share Tech Mono',monospace;font-size:12px;">${v}</th>`;

        const body = norm
            .map((r) => {
                const spot = r.spot == null ? '—' : this.formatNumberBr(r.spot, 2);
                const captured = r.capturedAt ? r.capturedAt.toLocaleString('pt-BR') : '—';
                const age = r.ageDays == null ? '—' : `${this.formatNumberBr(r.ageDays, 1)}d`;
                const status = `<span style="font-weight:900;color:${statusColor(
                    r.ok ? r.status : 'MISSING'
                )};">${r.ok ? r.status : 'MISSING'}</span>`;
                const warnings =
                    r.warnings && r.warnings.length ? this.escapeHtml(String(r.warnings[0])) : '—';
                return `<tr>${td(r.ticker)}${td(spot)}${td(captured)}${td(age)}${td(status)}${td(
                    warnings
                )}</tr>`;
            })
            .join('');

        container.innerHTML =
            `<div style="overflow:auto;">` +
            `<table style="width:100%;border-collapse:collapse;font-family:'Share Tech Mono',monospace;">` +
            `<thead><tr>${th('Ticker')}${th('Spot')}${th('Captura')}${th('Idade')}${th(
                'Status'
            )}${th('Aviso')}</tr></thead>` +
            `<tbody>${body}</tbody>` +
            `</table>` +
            `</div>`;
    }

    getWdoSpot() {
        const d = this.data || null;
        const s =
            (d && (Number(d.spot_price) || (d.overview && Number(d.overview.spot_price)))) ||
            (d && Number(d.spot)) ||
            null;
        return Number.isFinite(s) ? s : null;
    }

    createFedWatchTable() {
        const container = document.getElementById('fedwatch-container');
        if (!container) return;

        const insightEl = document.getElementById('fedwatch-insight');
        const payload = window.FED_WATCH_RATES_DATA;
        const meetings = payload && Array.isArray(payload.meetings) ? payload.meetings : [];
        if (!meetings.length) {
            container.innerHTML = '<div class="loading-text">FedWatch indisponível.</div>';
            if (insightEl) insightEl.textContent = '';
            return;
        }

        const topMeeting = meetings[0];
        const probs = topMeeting && topMeeting.probs ? topMeeting.probs : {};
        const entries = Object.entries(probs).filter(([, p]) => typeof p === 'number' && isFinite(p));
        entries.sort((a, b) => b[1] - a[1]);
        const topRange = entries.length ? entries[0][0] : null;
        const topProb = entries.length ? entries[0][1] : null;
        const meetingDate = topMeeting && topMeeting.date ? String(topMeeting.date) : '—';
        const days = topMeeting && typeof topMeeting.days_remaining === 'number' ? topMeeting.days_remaining : null;
        const currentRate = topMeeting && topMeeting.current_rate ? String(topMeeting.current_rate) : null;

        if (insightEl && topRange && topProb != null) {
            const probTxt = this.formatNumberBr(topProb, 1) + '%';
            const daysTxt = days != null ? ` (em ${days} dias)` : '';
            const suggests =
                currentRate && String(currentRate).trim() === String(topRange).trim()
                    ? `Isso sugere manutenção da faixa atual (${topRange}).`
                    : `Isso sugere que a faixa mais provável é ${topRange}.`;
            insightEl.textContent = `Leitura atual: para a reunião de ${meetingDate}${daysTxt}, a faixa mais provável é ${topRange} (${probTxt}). ${suggests}`;
        }

        const th = (v) =>
            `<th style="text-align:left;padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.14);color:#b3b3b3;font-family:'Share Tech Mono',monospace;font-size:12px;">${v}</th>`;
        const td = (v) =>
            `<td style="padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.08);font-family:'Share Tech Mono',monospace;font-size:12px;">${v}</td>`;

        const rows = meetings.slice(0, 8).map((m) => {
            const probsM = (m && m.probs) || {};
            const ent = Object.entries(probsM).filter(([, p]) => typeof p === 'number' && isFinite(p));
            ent.sort((a, b) => b[1] - a[1]);
            const r = ent.length ? ent[0][0] : '—';
            const p = ent.length ? this.formatNumberBr(ent[0][1], 1) + '%' : '—';
            const cd = m && m.current_rate ? String(m.current_rate) : '—';
            const d = m && typeof m.days_remaining === 'number' ? String(m.days_remaining) : '—';
            return `<tr>${td(String(m.date || '—'))}${td(d)}${td(cd)}${td(r)}${td(p)}</tr>`;
        });

        container.innerHTML =
            `<div style="overflow:auto;">` +
            `<table style="width:100%;border-collapse:collapse;">` +
            `<thead><tr>${th('Reunião')}${th('Dias')}${th('Atual')}${th('Faixa + provável')}${th('Prob')}</tr></thead>` +
            `<tbody>${rows.join('')}</tbody>` +
            `</table>` +
            `</div>`;
    }

    createYahooUupOiChart() {
        if (!window.ChartDataUtils || !window.ChartDataUtils.renderProxyOptionsOiChart) return;
        const payload = window.yahooUupOptionsData;
        if (!payload) return;
        window.ChartDataUtils.renderProxyOptionsOiChart({
            payload,
            marketData: this.data,
            canvasId: 'uupOiChart',
            selectId: 'uupExpirySelect',
            minOiId: 'uupMinOiInput',
            metaId: 'uupOiMeta',
            meansAllId: 'uupOiMeansAll',
            chartKey: 'UUP',
            chartOptions: {
                ...this.chartOptions,
                plugins: {
                    ...this.chartOptions.plugins,
                    title: {
                        display: true,
                        text: 'Open Interest por Strike (UUP - Yahoo, escala WDO)',
                        color: '#ff00ff',
                        font: { family: 'Orbitron', size: 14, weight: 'bold' },
                    },
                },
            },
        });
    }

    createYahooUsduOiChart() {
        if (!window.ChartDataUtils || !window.ChartDataUtils.renderProxyOptionsOiChart) return;
        const payload = window.yahooUsduOptionsData;
        if (!payload) return;
        window.ChartDataUtils.renderProxyOptionsOiChart({
            payload,
            marketData: this.data,
            canvasId: 'usduOiChart',
            selectId: 'usduExpirySelect',
            minOiId: 'usduMinOiInput',
            metaId: 'usduOiMeta',
            meansAllId: 'usduOiMeansAll',
            chartKey: 'USDU',
            chartOptions: {
                ...this.chartOptions,
                plugins: {
                    ...this.chartOptions.plugins,
                    title: {
                        display: true,
                        text: 'Open Interest por Strike (USDU - Yahoo, escala WDO)',
                        color: '#ff00ff',
                        font: { family: 'Orbitron', size: 14, weight: 'bold' },
                    },
                },
            },
        });
    }

    createYahooUsdbrlBetaMappingBlock() {
        const proxySelect = document.getElementById('usdBetaProxySelect');
        const expirySelect = document.getElementById('usdBetaExpirySelect');
        const windowSelect = document.getElementById('usdBetaWindowSelect');
        const minOiInput = document.getElementById('usdBetaMinOiInput');
        const statsEl = document.getElementById('usdBetaStats');
        const tableContainer = document.getElementById('usdBetaTableContainer');
        const chartCanvas = document.getElementById('usdBetaChart');
        const downloadBtn = document.getElementById('usdBetaDownloadBtn');

        if (!proxySelect || !expirySelect || !windowSelect || !statsEl || !tableContainer || !chartCanvas) return;

        const proxyDataByKey = (k) => {
            if (k === 'USDU') return window.yahooUsduOptionsData;
            return window.yahooUupOptionsData;
        };

        const getFxPointsBaseline = (beta) => {
            const fxRaw = Number(beta && beta.latest && beta.latest.fx_points);
            if (Number.isFinite(fxRaw) && fxRaw > 0) return fxRaw;
            const s = this.getSpotFromMarketData(this.data);
            if (s != null && Number.isFinite(Number(s)) && Number(s) > 0) return Number(s);
            return null;
        };

        const mapProxyStrikeToWdoPoints = (wdoSpotPoints, proxyStrike) => {
            const s = Number(wdoSpotPoints);
            const k = Number(proxyStrike);
            if (!Number.isFinite(s) || !Number.isFinite(k)) return null;
            const base = Math.floor(s / 100) * 100;
            return base + k;
        };

        const ensureExpiryOptions = (payload) => {
            const expiries = payload && Array.isArray(payload.expiries) ? payload.expiries.map((e) => String(e)) : [];
            const wanted = ['__ALL__', ...expiries];
            const current = Array.from(expirySelect.options || []).map((o) => String(o.value || ''));
            const same = current.length === wanted.length && current.every((v, i) => v === wanted[i]);
            if (same) return;
            expirySelect.innerHTML = '';
            const oAll = document.createElement('option');
            oAll.value = '__ALL__';
            oAll.textContent = 'Todos vencimentos';
            expirySelect.appendChild(oAll);
            expiries.forEach((e) => {
                const o = document.createElement('option');
                o.value = e;
                o.textContent = e;
                expirySelect.appendChild(o);
            });
            expirySelect.value = '__ALL__';
        };

        const computeScenario = (betaWindow, fxPoints) => {
            const alpha = Number(betaWindow && betaWindow.alpha);
            const beta = Number(betaWindow && betaWindow.beta);
            const rows = [-2, -1, -0.5, 0, 0.5, 1, 2].map((p) => {
                const varProxy = p / 100.0;
                const proj = fxPoints * (1 + alpha + beta * varProxy);
                return { varProxyPct: p, projPoints: proj };
            });
            return rows;
        };

        const getMinOi = () => {
            const raw = minOiInput ? Number(minOiInput.value) : 0;
            if (!Number.isFinite(raw) || raw < 0) return 0;
            return Math.floor(raw);
        };

        const applyMinOiFilter = (rows, minOi) => {
            if (!minOi || minOi <= 0) return rows;
            return rows.filter((r) => {
                const call = Number(r && r.callOi);
                const put = Number(r && r.putOi);
                const total = (Number.isFinite(call) ? call : 0) + (Number.isFinite(put) ? put : 0);
                return total >= minOi;
            });
        };

        const buildStrikeMappingRows = ({ proxyKey, payload, betaWindow, fxPoints, expiryValue }) => {
            const byExpiry = payload && payload.by_expiry && typeof payload.by_expiry === 'object' ? payload.by_expiry : null;
            const proxySpot = Number(payload && payload.spot);
            if (!byExpiry || !Number.isFinite(proxySpot) || proxySpot <= 0) return [];

            const expiries = payload && Array.isArray(payload.expiries) ? payload.expiries.map((e) => String(e)) : [];
            const selectedExpiries = expiryValue === '__ALL__' ? expiries : [String(expiryValue || '')].filter(Boolean);

            const alpha = Number(betaWindow && betaWindow.alpha);
            const beta = Number(betaWindow && betaWindow.beta);
            if (!Number.isFinite(alpha) || !Number.isFinite(beta) || !Number.isFinite(fxPoints) || fxPoints <= 0) return [];

            const out = [];
            selectedExpiries.forEach((exp) => {
                const node = byExpiry[exp];
                if (!node || typeof node !== 'object') return;
                const strikes = Array.isArray(node.strikes) ? node.strikes : [];
                const callOi = Array.isArray(node.call_oi) ? node.call_oi : [];
                const putOi = Array.isArray(node.put_oi) ? node.put_oi : [];
                strikes.forEach((k, idx) => {
                    const strike = Number(k);
                    if (!Number.isFinite(strike)) return;
                    const call = Number(callOi[idx] || 0);
                    const put = Number(putOi[idx] || 0);
                    const varProxy = (strike / proxySpot) - 1;
                    const varFx = alpha + beta * varProxy;
                    const proj = fxPoints * (1 + varFx);
                    const wdoStrike = mapProxyStrikeToWdoPoints(fxPoints, strike);
                    out.push({
                        proxy: proxyKey,
                        expiry: exp,
                        windowDays: Number(betaWindow && betaWindow.n) || null,
                        alpha,
                        beta,
                        strikeProxy: strike,
                        strikeWdo: wdoStrike,
                        varProxyPct: varProxy * 100,
                        varFxPct: varFx * 100,
                        projPoints: proj,
                        callOi: Number.isFinite(call) ? call : 0,
                        putOi: Number.isFinite(put) ? put : 0,
                    });
                });
            });

            out.sort((a, b) => (a.expiry || '').localeCompare(b.expiry || '') || (a.strikeProxy - b.strikeProxy));
            return out;
        };

        const renderTable = ({ rows, title }) => {
            const th = (v) =>
                `<th style="text-align:left;padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.14);color:#b3b3b3;font-family:'Share Tech Mono',monospace;font-size:12px;white-space:nowrap;">${v}</th>`;
            const td = (v) =>
                `<td style="padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.08);font-family:'Share Tech Mono',monospace;font-size:12px;white-space:nowrap;">${v}</td>`;

            const header =
                `<div style="margin:10px 0 6px;color:var(--secondary-neon);font-weight:800;font-size:12px;">${this.escapeHtml(title)}</div>`;

            if (!rows.length) {
                return header + `<div class="loading-text">Sem dados.</div>`;
            }

            const body = rows
                .map((r) => {
                    const w = r.windowDays != null ? String(r.windowDays) : '—';
                    const strikeWdo = r.strikeWdo != null ? this.formatNumberBr(r.strikeWdo, 2) : '—';
                    return (
                        `<tr>` +
                        td(this.escapeHtml(String(r.proxy || '—'))) +
                        td(this.escapeHtml(String(r.expiry || '—'))) +
                        td(this.escapeHtml(w + 'd')) +
                        td(this.formatNumberBr(r.strikeProxy, 2)) +
                        td(strikeWdo) +
                        td(this.formatNumberBr(r.varProxyPct, 2) + '%') +
                        td(this.formatNumberBr(r.varFxPct, 2) + '%') +
                        td(this.formatNumberBr(r.projPoints, 2)) +
                        td(this.formatNumberBr(r.callOi, 0)) +
                        td(this.formatNumberBr(r.putOi, 0)) +
                        `</tr>`
                    );
                })
                .join('');

            return (
                header +
                `<div style="overflow:auto;max-height:520px;">` +
                `<table style="width:100%;border-collapse:collapse;">` +
                `<thead><tr>` +
                th('Ativo') +
                th('Venc') +
                th('Janela') +
                th('Strike Proxy') +
                th('Strike WDO') +
                th('Var% Proxy') +
                th('Var% USD/BRL (est.)') +
                th('USD/BRL proj (pts)') +
                th('Call OI') +
                th('Put OI') +
                `</tr></thead>` +
                `<tbody>${body}</tbody>` +
                `</table>` +
                `</div>`
            );
        };

        const render = () => {
            const proxyKey = String(proxySelect.value || 'UUP');
            const payload = proxyDataByKey(proxyKey);
            const beta = payload && payload.usdbrl_beta ? payload.usdbrl_beta : null;
            if (!payload || !beta || !beta.latest || !beta.windows) {
                tableContainer.innerHTML = '<div class="loading-text">Beta indisponível.</div>';
                statsEl.textContent = '';
                return;
            }

            ensureExpiryOptions(payload);

            const w = String(windowSelect.value || '90');
            const win = beta.windows[w] || null;
            const fxPoints = getFxPointsBaseline(beta);

            if (!win || !Number.isFinite(Number(fxPoints))) {
                tableContainer.innerHTML = '<div class="loading-text">Beta indisponível para a janela selecionada.</div>';
                statsEl.textContent = '';
                return;
            }

            const minOi = getMinOi();
            const alpha = Number(win.alpha);
            const b = Number(win.beta);
            const corr = Number(win.corr);
            const r2 = Number(win.r2);

            statsEl.textContent =
                `Base(WDO pts): ${this.formatNumberBr(fxPoints, 2)} | α=${this.formatNumberBr(alpha, 6)} | β=${this.formatNumberBr(b, 3)} | corr=${this.formatNumberBr(corr, 3)} | R²=${this.formatNumberBr(r2, 3)} | OI mín(tabela): ${this.formatNumberBr(minOi, 0)}`;

            const rows = computeScenario(win, fxPoints);

            const expiryValue = String(expirySelect.value || '__ALL__');
            const selectedStrikeRowsAll = buildStrikeMappingRows({
                proxyKey,
                payload,
                betaWindow: win,
                fxPoints,
                expiryValue,
            });
            const selectedStrikeRowsView = applyMinOiFilter(selectedStrikeRowsAll, minOi);

            const allRowsAll = ['UUP', 'USDU'].flatMap((k) => {
                const p = proxyDataByKey(k);
                const bAll = p && p.usdbrl_beta ? p.usdbrl_beta : null;
                if (!p || !bAll || !bAll.windows) return [];
                const fxAll = getFxPointsBaseline(bAll);
                if (!Number.isFinite(Number(fxAll))) return [];
                return ['30', '60', '90', '252'].flatMap((wd) => {
                    const wnode = bAll.windows[wd] || null;
                    if (!wnode) return [];
                    return buildStrikeMappingRows({
                        proxyKey: k,
                        payload: p,
                        betaWindow: wnode,
                        fxPoints: fxAll,
                        expiryValue: '__ALL__',
                    });
                });
            });
            const allRowsView = applyMinOiFilter(allRowsAll, minOi);

            const scenarioTh = (v) =>
                `<th style="text-align:left;padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.14);color:#b3b3b3;font-family:'Share Tech Mono',monospace;font-size:12px;white-space:nowrap;">${v}</th>`;
            const scenarioTd = (v) =>
                `<td style="padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.08);font-family:'Share Tech Mono',monospace;font-size:12px;white-space:nowrap;">${v}</td>`;

            const scenarioTable =
                `<div style="margin:6px 0 6px;color:var(--secondary-neon);font-weight:800;font-size:12px;">Cenários (±2% proxy)</div>` +
                `<div style="overflow:auto;">` +
                `<table style="width:100%;border-collapse:collapse;">` +
                `<thead><tr>${scenarioTh('Var% Proxy')}${scenarioTh('USDBRL projetado (pts)')}</tr></thead>` +
                `<tbody>` +
                rows
                    .map((r) => `<tr>${scenarioTd(this.formatNumberBr(r.varProxyPct, 1) + '%')}${scenarioTd(this.formatNumberBr(r.projPoints, 2))}</tr>`)
                    .join('') +
                `</tbody>` +
                `</table>` +
                `</div>`;

            tableContainer.innerHTML =
                scenarioTable +
                renderTable({
                    rows: selectedStrikeRowsView,
                    title: `Tabela (seleção): ${proxyKey} | ${expiryValue === '__ALL__' ? 'Todos venc.' : expiryValue} | ${w}d`,
                }) +
                renderTable({
                    rows: allRowsView,
                    title: 'Tabela Completa: Ativo × Vencimento × Janela',
                });

            if (this.charts.usdBeta) this.charts.usdBeta.destroy();
            this.charts.usdBeta = new Chart(chartCanvas, {
                type: 'line',
                data: {
                    labels: rows.map((r) => this.formatNumberBr(r.varProxyPct, 1) + '%'),
                    datasets: [
                        {
                            label: 'USDBRL projetado (pts)',
                            data: rows.map((r) => r.projPoints),
                            borderColor: '#00f3ff',
                            backgroundColor: 'rgba(0, 243, 255, 0.12)',
                            borderWidth: 2,
                            fill: true,
                            tension: 0.25,
                        },
                    ],
                },
                options: {
                    ...this.chartOptions,
                    plugins: {
                        ...this.chartOptions.plugins,
                        title: {
                            display: true,
                            text: `Proxy → USD/BRL (Beta ${w}d | ${proxyKey})`,
                            color: '#ff00ff',
                            font: { family: 'Orbitron', size: 14, weight: 'bold' },
                        },
                    },
                    scales: {
                        ...this.chartOptions.scales,
                        y: {
                            ...this.chartOptions.scales.y,
                            ticks: {
                                ...this.chartOptions.scales.y.ticks,
                                callback: (v) => this.formatNumberBr(v, 2),
                            },
                        },
                    },
                },
            });

            if (downloadBtn && !this._usdBetaDownloadBound) {
                this._usdBetaDownloadBound = true;
                downloadBtn.addEventListener('click', () => {
                    const blob = new Blob(
                        [
                            JSON.stringify(
                                {
                                    proxy: proxyKey,
                                    windowDays: Number(w),
                                    expiry: String(expirySelect.value || '__ALL__'),
                                    computedAtUtc: beta.computed_at_utc || null,
                                    latest: beta.latest || null,
                                    window: win,
                                    scenario: rows,
                                    minOiUsedForView: minOi,
                                    strikeTableSelected: selectedStrikeRowsAll,
                                    strikeTableAll: allRowsAll,
                                    strikeTableSelectedView: selectedStrikeRowsView,
                                    strikeTableAllView: allRowsView,
                                },
                                null,
                                2
                            ),
                        ],
                        { type: 'application/json' }
                    );
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `usdbrl_beta_${proxyKey}_${w}d.json`;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    URL.revokeObjectURL(url);
                });
            }
        };

        if (!this._usdBetaChangeBound) {
            this._usdBetaChangeBound = true;
            proxySelect.addEventListener('change', render);
            windowSelect.addEventListener('change', render);
            expirySelect.addEventListener('change', render);
            if (minOiInput) minOiInput.addEventListener('input', render);
        }

        render();
    }

    escapeHtml(text) {
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

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

        // Check if skew data exists
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
                            drawOnChartArea: false, // only want the grid lines for one axis to show up
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
        this.animateValue('total-trades', 0, data.overview.total_trades, 2000);
        this.animateValue('volume-total', 0, data.overview.total_volume, 2000);
        this.animateValue('gamma-exposure', 0, data.overview.gamma_exposure, 2000);
        this.animateValue('delta-position', 0, data.overview.delta_position, 2000);
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

        // Simplificado: OI Call + OI Put próximo ao vencimento
        // Aqui usamos Total OI como proxy
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
        if (!ctx || !data.v3_data || !data.v3_data.flow_sentiment) return;

        const flowData = data.v3_data.flow_sentiment;
        const labels = data.delta_data.strikes; // Assuming alignment

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
        
        // Add current spot as point 0
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
                        fill: 3, // Fill to dataset index 3 (-1σ)
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

    createDealerPressureChart(data) {
        const ctx = document.getElementById('dealerPressureChart');
        if (!ctx || !data.v3_data || !data.v3_data.dealer_pressure_profile) return;

        const profile = data.v3_data.dealer_pressure_profile;
        const strikes = data.delta_data.strikes; // Assumindo alinhamento com strikes

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

        // Delta Exposure por Strike (Net)
        // Diferente do Delta Acumulado (Cumulative)
        this.charts.deltaAgregado = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.delta_data.strikes,
                datasets: [{
                    label: 'Delta Exposure Net',
                    data: data.delta_data.delta_values,
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
        if (!data.key_levels) return;
        
        const setText = (id, value) => {
            const el = document.getElementById(id);
            if (el) el.innerText = value !== null ? value.toLocaleString() : 'N/A';
        };

        setText('gamma-flip', data.key_levels.gamma_flip);
        setText('call-wall', data.key_levels.call_wall);
        setText('put-wall', data.key_levels.put_wall);
        setText('edi-effective-call', data.key_levels.effective_call_wall);
        setText('edi-effective-put', data.key_levels.effective_put_wall);
        setText('max-pain', data.key_levels.max_pain);
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
        const containers = [document.getElementById('fair-value-container'), document.getElementById('fair-value-container-overview')].filter(Boolean);
        if (!containers.length) return;

        const sims = data && data.v3_data && Array.isArray(data.v3_data.fair_value_sims) ? data.v3_data.fair_value_sims : [];
        if (!sims.length) {
            containers.forEach((c) => (c.innerHTML = '<p>Nenhuma simulação disponível.</p>'));
            return;
        }

        const fmt2 = (v) => this.formatNumberBr(Number(v), 2);
        const fmtPct = (v) => (Number.isFinite(Number(v)) ? this.formatNumberBr(Number(v), 1) + '%' : '—');

        let html =
            '<table class="neon-table"><thead><tr><th>Cenário</th><th>Alvo (Spot)</th><th>Strike</th><th>Call (Hoje)</th><th>Call (Sim)</th><th>Var %</th><th>Put (Hoje)</th><th>Put (Sim)</th><th>Var %</th></tr></thead><tbody>';

        sims.forEach((sim) => {
            const scenario = sim && sim.scenario ? String(sim.scenario) : '—';
            const target = fmt2(sim && sim.target_spot);
            const opts = sim && Array.isArray(sim.options) ? sim.options : [];
            opts.forEach((opt) => {
                const callChg = Number(opt && opt.Call_Chg);
                const putChg = Number(opt && opt.Put_Chg);
                const callClass = Number.isFinite(callChg) && callChg >= 0 ? 'positive-val' : 'negative-val';
                const putClass = Number.isFinite(putChg) && putChg >= 0 ? 'positive-val' : 'negative-val';
                html +=
                    `<tr>` +
                    `<td class="font-bold">${this.escapeHtml(scenario)}</td>` +
                    `<td>${target}</td>` +
                    `<td class="font-bold text-center" style="color: var(--secondary-neon);">${fmt2(opt && opt.Strike)}</td>` +
                    `<td>${fmt2(opt && opt.Call_Now)}</td>` +
                    `<td>${fmt2(opt && opt.Call_Sim)}</td>` +
                    `<td class="${callClass}">${fmtPct(opt && opt.Call_Chg)}</td>` +
                    `<td>${fmt2(opt && opt.Put_Now)}</td>` +
                    `<td>${fmt2(opt && opt.Put_Sim)}</td>` +
                    `<td class="${putClass}">${fmtPct(opt && opt.Put_Chg)}</td>` +
                    `</tr>`;
            });
        });

        html += '</tbody></table>';
        containers.forEach((c) => (c.innerHTML = html));
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
