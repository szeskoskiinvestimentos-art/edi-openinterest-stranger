/**
 * WDO Charts Module — Extends BaseCharts with WDO-specific methods
 * 
 * Métodos específicos do WDO:
 * - createFedWatchTable()
 * - createYahooUupOiChart()
 * - createYahooUsduOiChart()
 * - createYahooUsdbrlBetaMappingBlock()
 */

class StrangerThingsCharts extends BaseCharts {
    constructor() {
        super();
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
            this.createThetaCumChart(data);
            this.createRGammaChart(data);
            this.createRGammaCumChart(data);

            // V3 Charts
            this.createMaxPainChart(data);
            this.createExpectedMoveChart(data);
            this.createGammaFlipConeChart(data);
            this.createDeltaFlipProfileChart(data);
            this.createFlowSentimentChart(data);
            this.createMMPnLChart(data);
            this.createDealerPressureChart(data);
            this.createDeltaAgregadoChart(data);

            this.updateMetrics(data);
            this.updateKeyLevels(data);
            this.updateNtslCode(data);
            this.populateTable(data);
            this.createFairValueTable(data);
            this.updateLastUpdate(data);
            this.createFedWatchTable();
            this.createYahooUupOiChart();
            this.createYahooUsduOiChart();
            this.createYahooUsdbrlBetaMappingBlock();
        } catch (error) {
            console.error('Error initializing charts:', error);
        }
    }

    async loadMarketData() {
        try {
            if (window.marketData) {
                console.log('Carregando dados da variável global (marketData)...');
                return window.marketData;
            }

            console.log('Variável global não encontrada, tentando fetch...');
            const response = await fetch('assets/data/market_data.json');
            if (!response.ok) {
                throw new Error('Failed to load market data');
            }
            return await response.json();
        } catch (error) {
            console.error('Error loading market data:', error);
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

    getSpotFromMarketData(data) {
        if (!data) return null;
        const s = Number(data.spot_price);
        if (Number.isFinite(s) && s > 0) return s;
        const ov = data.overview;
        if (ov) {
            const os = Number(ov.spot_price);
            if (Number.isFinite(os) && os > 0) return os;
        }
        return null;
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
}

// Initialize charts when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.strangerThingsCharts = new StrangerThingsCharts();
});
