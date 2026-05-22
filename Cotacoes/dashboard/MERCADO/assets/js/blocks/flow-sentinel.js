(function () {
    const w = typeof window !== 'undefined' ? window : null;
    if (!w) return;
    const root = (w.MercadoBlocks && typeof w.MercadoBlocks === 'object') ? w.MercadoBlocks : {};

    function render({ data, deps } = {}) {
        const d = deps || {};
        const escapeHtml = d.escapeHtml;
        const formatNumber = d.formatNumber;
        const formatPercent = d.formatPercent;
        const toneBadgeHtml = d.toneBadgeHtml;
        const setMetric = d.setMetric;
        const setHtml = d.setHtml;
        const findAssetSymbol = d.findAssetSymbol;
        const findAliasSymbolBest = d.findAliasSymbolBest;
        const findAliasSymbol = d.findAliasSymbol;
        const getChangePct = d.getChangePct;
        const avg = d.avg;

        const symbols = {
            audusd: findAssetSymbol(data, /^AUD\/USD\b/i),
            nzdusd: findAssetSymbol(data, /^NZD\/USD\b/i),
            usdcad: findAssetSymbol(data, /^USD\/CAD\b/i),
            usdrub: findAssetSymbol(data, /^USD\/RUB\b/i),
            usdjpy: findAssetSymbol(data, /^USD\/JPY\b/i),
            usdchf: findAssetSymbol(data, /^USD\/CHF\b/i),
            usdsek: findAssetSymbol(data, /^USD\/SEK\b/i),
            dxy: findAliasSymbolBest(data, 'DXY') || findAliasSymbol(data, 'DXY'),
            vix: findAliasSymbolBest(data, 'VIX9D') || findAliasSymbolBest(data, 'VIX30') || findAliasSymbolBest(data, 'VIX') || findAliasSymbol(data, 'VIX') || findAssetSymbol(data, /^\.?VIX(9D)?$/i),
            vhsi: findAliasSymbol(data, 'VHSI') || findAssetSymbol(data, /^VHSI(c\d+)?$/i),
            jp1y: findAliasSymbol(data, 'JP1Y') || findAssetSymbol(data, /^JP1YT=(RR|XX)$/i),
            jp10y: findAliasSymbol(data, 'JP10Y') || findAssetSymbol(data, /^JP10YT=RR$/i),
            brent: findAliasSymbolBest(data, 'BRENT') || findAliasSymbol(data, 'BRENT'),
            wti: findAliasSymbolBest(data, 'WTI') || findAliasSymbol(data, 'WTI'),
        };

        const neutralThreshold = 0.12;

        const sessionNow = () => {
            const h = new Date().getUTCHours();
            if (h >= 14 && h < 21) return 'us';
            if (h >= 7 && h < 14) return 'eu';
            return 'asia';
        };
        const sess = sessionNow();
        const vhsiWeight = sess === 'asia' ? 1.0 : 0.8;

        const setDot = (id, state, blink) => {
            const el = document.getElementById(id);
            if (!el) return;
            el.classList.remove('fs-dot--sell-usd', 'fs-dot--buy-usd', 'fs-dot--neutral', 'fs-dot--blink');
            if (state === 'sell-usd') el.classList.add('fs-dot--sell-usd');
            else if (state === 'buy-usd') el.classList.add('fs-dot--buy-usd');
            else el.classList.add('fs-dot--neutral');
            if (blink) el.classList.add('fs-dot--blink');
        };

        const classifyRiskBlockAction = score => {
            if (typeof score !== 'number' || !Number.isFinite(score)) return { state: 'neutral', label: 'Neutro' };
            if (Math.abs(score) < neutralThreshold) return { state: 'neutral', label: 'Neutro' };
            if (score > 0) return { state: 'sell-usd', label: 'Vender USD' };
            return { state: 'buy-usd', label: 'Comprar USD' };
        };

        const classifyProtectionBlockAction = score => {
            if (typeof score !== 'number' || !Number.isFinite(score)) return { state: 'neutral', label: 'Neutro' };
            if (Math.abs(score) < neutralThreshold) return { state: 'neutral', label: 'Neutro' };
            if (score > 0) return { state: 'buy-usd', label: 'Comprar USD' };
            return { state: 'sell-usd', label: 'Vender USD' };
        };

        const pre = data && data.meta && data.meta.flowSentinel ? data.meta.flowSentinel : null;
        if (pre && pre.riskBlock && pre.protectionBlock && pre.oil && pre.regime && pre.thermo) {
            const betaPosScore = typeof pre.riskBlock.score === 'number' && Number.isFinite(pre.riskBlock.score) ? pre.riskBlock.score : null;
            const betaNegScore = typeof pre.protectionBlock.score === 'number' && Number.isFinite(pre.protectionBlock.score) ? pre.protectionBlock.score : null;
            const delta = typeof pre.delta === 'number' && Number.isFinite(pre.delta) ? pre.delta : null;
            const composite = typeof pre.composite === 'number' && Number.isFinite(pre.composite) ? pre.composite : null;
            const oilScore = typeof pre.oil.score === 'number' && Number.isFinite(pre.oil.score) ? pre.oil.score : null;
            const oilAdj = typeof pre.oil.adj === 'number' && Number.isFinite(pre.oil.adj) ? pre.oil.adj : 0;

            const betaPosAction = pre.riskBlock.action && pre.riskBlock.action.state ? pre.riskBlock.action : classifyRiskBlockAction(betaPosScore);
            const betaNegAction = pre.protectionBlock.action && pre.protectionBlock.action.state ? pre.protectionBlock.action : classifyProtectionBlockAction(betaNegScore);

            const betaPosCount = typeof pre.riskBlock.observed === 'number' ? pre.riskBlock.observed : 0;
            const betaNegCount = typeof pre.protectionBlock.observed === 'number' ? pre.protectionBlock.observed : 0;

            setDot('fs-beta-pos-dot', betaPosAction.state, betaPosAction.state === 'buy-usd');
            setDot('fs-beta-neg-dot', betaNegAction.state, betaNegAction.state === 'sell-usd');

            setMetric('fs-beta-pos-score', betaPosScore === null ? '—' : formatNumber(betaPosScore, 3));
            const betaPosDen = pre && pre.riskBlock && Array.isArray(pre.riskBlock.items) ? pre.riskBlock.items.length : 4;
            setMetric('fs-beta-pos-detail', betaPosCount ? `${betaPosCount}/${betaPosDen} • ${betaPosAction.label}` : '—');
            setMetric('fs-beta-neg-score', betaNegScore === null ? '—' : formatNumber(betaNegScore, 3));
            const betaNegDen = pre && pre.protectionBlock && Array.isArray(pre.protectionBlock.items) ? pre.protectionBlock.items.length : 4;
            setMetric('fs-beta-neg-detail', betaNegCount ? `${betaNegCount}/${betaNegDen} • ${betaNegAction.label}` : '—');
            setMetric('fs-oil-score', oilScore === null ? '—' : formatPercent(oilScore, 2));
            setMetric('fs-oil-detail', pre.oil && typeof pre.oil.intel === 'string' ? pre.oil.intel : '—');
            setMetric('fs-signal', pre.regime && typeof pre.regime.label === 'string' ? pre.regime.label : '—');
            setMetric('fs-signal-score', composite === null ? '—' : `${formatNumber(composite, 3)} • ${pre.regime && typeof pre.regime.action === 'string' ? pre.regime.action : '—'}`);

            const observedCount = betaPosCount + betaNegCount;
            if (observedCount < 3 || !(pre.thermo && typeof pre.thermo.score10 === 'number' && typeof pre.thermo.pct === 'number')) {
                setMetric('fs-thermo-score', '—');
                setMetric('fs-thermo-detail', '—');
                setHtml('fs-history', '');
                setHtml('fs-alerts', '');
            } else {
                const score10 = Math.max(0, Math.min(10, Math.round(pre.thermo.score10)));
                const pct = Math.max(0, Math.min(100, Math.round(pre.thermo.pct)));
                const thermoLabel = typeof pre.thermo.label === 'string' && pre.thermo.label ? pre.thermo.label : (score10 >= 7 ? 'Risk-On' : score10 <= 3 ? 'Risk-Off' : 'Neutro');

                setMetric('fs-thermo-score', `${score10}/10`);
                setHtml('fs-thermo-detail', `
            <div style="display:flex;flex-direction:column;gap:6px;">
                <div style="opacity:.90;">${escapeHtml(thermoLabel)}${oilAdj !== 0 ? ` • Ajuste petróleo ${oilAdj > 0 ? '+' : ''}${formatNumber(oilAdj, 2)}` : ''}</div>
                <div class="fs-thermo" aria-label="Termômetro de pré-mercado">
                    <div class="fs-thermo__fill" style="width:${pct}%;"></div>
                    <div class="fs-thermo__pin" style="left:${pct}%;"></div>
                </div>
            </div>
        `);

                const historyKey = 'mercado_fs_history_v1';
                const maxHistory = 24;
                const nowMs = Date.now();

                const readHistory = () => {
                    try {
                        const raw = localStorage.getItem(historyKey);
                        const parsed = raw ? JSON.parse(raw) : null;
                        if (!Array.isArray(parsed)) return [];
                        return parsed
                            .filter(x => x && typeof x === 'object')
                            .map(x => {
                                const o = x;
                                const tMs = typeof o.tMs === 'number' && Number.isFinite(o.tMs) ? o.tMs : null;
                                const s10 = typeof o.s10 === 'number' && Number.isFinite(o.s10) ? o.s10 : null;
                                const p = typeof o.pct === 'number' && Number.isFinite(o.pct) ? o.pct : null;
                                const dd = typeof o.delta === 'number' && Number.isFinite(o.delta) ? o.delta : null;
                                const oa = typeof o.oilAdj === 'number' && Number.isFinite(o.oilAdj) ? o.oilAdj : 0;
                                const lab = typeof o.label === 'string' ? o.label : '';
                                if (tMs === null || s10 === null || p === null || dd === null) return null;
                                return { tMs, s10, pct: p, delta: dd, oilAdj: oa, label: lab };
                            })
                            .filter(Boolean);
                    } catch {
                        return [];
                    }
                };

                const writeHistory = items => {
                    try {
                        localStorage.setItem(historyKey, JSON.stringify(items));
                    } catch {
                    }
                };

                const toTime = tMs => {
                    try {
                        return new Date(tMs).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                    } catch {
                        return '';
                    }
                };

                const clamp10 = v => Math.max(0, Math.min(10, Math.round(v)));
                const toneColor = s10 => {
                    const x = clamp10(s10);
                    if (x <= 3) return 'rgba(255,60,80,.95)';
                    if (x >= 7) return 'rgba(0,255,160,.95)';
                    return 'rgba(255,210,74,.95)';
                };

                const history = readHistory();
                const nextItem = { tMs: nowMs, s10: score10, pct: pct, delta: delta === null ? 0 : delta, oilAdj: oilAdj, label: thermoLabel };
                const last = history.length ? history[history.length - 1] : null;
                if (last && nowMs - last.tMs < 20000) {
                    history[history.length - 1] = nextItem;
                } else {
                    history.push(nextItem);
                }
                const trimmed = history.slice(-maxHistory);
                writeHistory(trimmed);

                const bars = trimmed
                    .slice(-12)
                    .map(h => {
                        const height = 8 + clamp10(h.s10) * 2.3;
                        const title = `${toTime(h.tMs)} • ${clamp10(h.s10)}/10 • Δ ${formatNumber(h.delta, 3)}${h.oilAdj ? ` • oil ${h.oilAdj > 0 ? '+' : ''}${formatNumber(h.oilAdj, 2)}` : ''}`;
                        return `<div title="${escapeHtml(title)}" style="width:10px;height:${height}px;background:${toneColor(h.s10)};border-radius:4px;opacity:.92;"></div>`;
                    })
                    .join('');

                setHtml('fs-history', `
            <div style="border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:12px;background:rgba(0,0,0,.18);">
                <div style="display:flex;align-items:baseline;justify-content:space-between;gap:10px;flex-wrap:wrap;">
                    <div style="font-weight:900;letter-spacing:1px;opacity:.95;">Histórico (últimas janelas)</div>
                    <div style="opacity:.80;font-size:12px;">${escapeHtml(trimmed.length ? `${toTime(trimmed[trimmed.length - 1].tMs)}` : '')}</div>
                </div>
                <div style="display:flex;align-items:flex-end;gap:6px;margin-top:10px;min-height:38px;">
                    ${bars || '<div style="opacity:.85;">—</div>'}
                </div>
            </div>
        `);

                const merged = Array.from(new Set((Array.isArray(pre.alerts) ? pre.alerts : []).map(x => String(x || '').trim()).filter(Boolean)));
                setHtml('fs-alerts', merged.length
                    ? `
                <div style="border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:12px;background:rgba(0,0,0,.18);">
                    <div style="font-weight:900;letter-spacing:1px;opacity:.95;margin-bottom:8px;">Alertas (divergência)</div>
                    ${merged.map(t => `<div style="padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06);opacity:.92;line-height:1.35;">${escapeHtml(t)}</div>`).join('')}
                </div>
              `
                    : '');
            }

            const rows = []
                .concat([{ title: 'Bloco Risco (FX)' }])
                .concat((pre.riskBlock.items || []).map(x => ({ label: x.label, val: x.val })))
                .concat([{ title: 'Bloco Proteção (FX)' }])
                .concat((pre.protectionBlock.items || []).map(x => ({ label: x.label, val: x.val })));

            const html = `
        <div style="border:1px solid rgba(255,255,255,.12);border-radius:10px;padding:12px 12px;background:rgba(0,0,0,.25);">
            ${rows
                    .map(r => {
                        if (r.title) {
                            return `<div style="font-weight:900;letter-spacing:1px;opacity:.9;margin-top:10px;">${escapeHtml(r.title)}</div>`;
                        }
                        const val = typeof r.val === 'number' ? r.val : null;
                        const txt = val === null ? '—' : formatPercent(val, 2);
                        const badge = val === null ? '—' : toneBadgeHtml(val, txt, { maxAbs: 5 });
                        return `
                        <div style="display:flex;justify-content:space-between;gap:10px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06);">
                            <div style="opacity:.9;font-weight:700;">${escapeHtml(r.label)}</div>
                            <div style="font-family:'Share Tech Mono',monospace;">${badge}</div>
                        </div>
                    `;
                    })
                    .join('')}
        </div>
    `;
            setHtml('fs-components', html);
            return;
        }

        const betaPosItems = [
            { label: 'AUD/USD', symbol: symbols.audusd, sign: +1 },
            { label: 'NZD/USD', symbol: symbols.nzdusd, sign: +1 },
            { label: 'USD/CAD', symbol: symbols.usdcad, sign: -1 },
            { label: 'USD/RUB', symbol: symbols.usdrub, sign: -1 },
        ].map(x => ({ ...x, raw: getChangePct(data, x.symbol) }))
            .map(x => ({ ...x, val: x.raw === null ? null : x.sign * x.raw }));

        const betaNegItemsRaw = [
            { label: 'USD/JPY', symbol: symbols.usdjpy, sign: -1, weight: 1.0 },
            { label: 'USD/CHF', symbol: symbols.usdchf, sign: -1, weight: 1.0 },
            { label: 'USD/SEK', symbol: symbols.usdsek, sign: -1, weight: 1.0 },
            { label: 'DXY', symbol: symbols.dxy, sign: +1, weight: 1.0 },
            { label: 'VIX', symbol: symbols.vix, sign: +1, weight: 1.0 },
            { label: 'VHSI', symbol: symbols.vhsi, sign: +1, weight: vhsiWeight },
        ];
        const betaNegItems = betaNegItemsRaw
            .map(x => ({ ...x, raw: getChangePct(data, x.symbol) }))
            .map(x => ({ ...x, val: x.raw === null ? null : x.sign * x.raw }));

        const betaPosScore = avg(betaPosItems.map(x => x.val));
        const betaNegScore = avg(betaNegItems.map(x => x.val));

        const wti = getChangePct(data, symbols.wti);
        const brent = getChangePct(data, symbols.brent);
        const oilScore = [wti, brent].filter(v => typeof v === 'number' && Number.isFinite(v)).length ? Math.max(wti || -Infinity, brent || -Infinity) : null;

        const delta = (typeof betaPosScore === 'number' ? betaPosScore : 0) - (typeof betaNegScore === 'number' ? betaNegScore : 0);
        let signal = 'Neutro';
        if (delta > 0.25) signal = 'Apetite ao Risco';
        if (delta < -0.25) signal = 'Proteção';

        const cadStrength = betaPosItems.find(x => x.label === 'USD/CAD');
        const rubStrength = betaPosItems.find(x => x.label === 'USD/RUB');
        const cadRubConfirm =
            cadStrength &&
            rubStrength &&
            typeof cadStrength.raw === 'number' &&
            typeof rubStrength.raw === 'number' &&
            cadStrength.raw <= -0.15 &&
            rubStrength.raw <= -0.15;
        const oilUpStrong = typeof oilScore === 'number' && Number.isFinite(oilScore) && oilScore >= 0.7;
        const oilBias = oilUpStrong && cadRubConfirm ? 'Reforça Bloco Risco' : 'Neutro';

        const betaPosCount = betaPosItems.filter(x => x.val !== null).length;
        const betaNegCount = betaNegItems.filter(x => x.val !== null).length;
        const betaPosAction = classifyRiskBlockAction(betaPosScore);
        const betaNegAction = classifyProtectionBlockAction(betaNegScore);

        setDot('fs-beta-pos-dot', betaPosAction.state, betaPosAction.state === 'buy-usd');
        setDot('fs-beta-neg-dot', betaNegAction.state, betaNegAction.state === 'sell-usd');

        setMetric('fs-beta-pos-score', betaPosScore === null ? '—' : formatNumber(betaPosScore, 3));
        setMetric('fs-beta-pos-detail', betaPosCount ? `${betaPosCount}/${betaPosItems.length} • ${betaPosAction.label}` : '—');
        setMetric('fs-beta-neg-score', betaNegScore === null ? '—' : formatNumber(betaNegScore, 3));
        setMetric('fs-beta-neg-detail', betaNegCount ? `${betaNegCount}/${betaNegItems.length} • ${betaNegAction.label}` : '—');
        setMetric('fs-oil-score', oilScore === null ? '—' : formatPercent(oilScore, 2));
        setMetric('fs-oil-detail', oilBias);
        setMetric('fs-signal', signal);
        setMetric('fs-signal-score', `${formatNumber(delta, 3)} • ${delta > 0.25 ? 'Vender USD' : delta < -0.25 ? 'Comprar USD' : 'Neutro'}`);

        const observedCount = betaPosCount + betaNegCount;
        if (observedCount < 3) {
            setMetric('fs-thermo-score', '—');
            setMetric('fs-thermo-detail', '—');
            setHtml('fs-history', '');
            setHtml('fs-alerts', '');
        } else {
            const oilAdj = oilBias === 'Reforça Bloco Risco' ? +0.15 : 0;

            const composite = delta + oilAdj;
            const score01 = Math.max(0, Math.min(1, (composite + 0.8) / 1.6));
            const score10 = Math.round(score01 * 10);
            const pct = Math.round(score01 * 100);
            const thermoLabel = score10 >= 7 ? 'Risk-On' : score10 <= 3 ? 'Risk-Off' : 'Neutro';

            setMetric('fs-thermo-score', `${score10}/10`);
            setHtml('fs-thermo-detail', `
            <div style="display:flex;flex-direction:column;gap:6px;">
                <div style="opacity:.90;">${escapeHtml(thermoLabel)}${oilAdj !== 0 ? ` • Ajuste petróleo ${oilAdj > 0 ? '+' : ''}${formatNumber(oilAdj, 2)}` : ''}</div>
                <div class="fs-thermo" aria-label="Termômetro de pré-mercado">
                    <div class="fs-thermo__fill" style="width:${pct}%;"></div>
                    <div class="fs-thermo__pin" style="left:${pct}%;"></div>
                </div>
            </div>
        `);

            const historyKey = 'mercado_fs_history_v1';
            const maxHistory = 24;
            const nowMs = Date.now();

            const readHistory = () => {
                try {
                    const raw = localStorage.getItem(historyKey);
                    const parsed = raw ? JSON.parse(raw) : null;
                    if (!Array.isArray(parsed)) return [];
                    return parsed
                        .filter(x => x && typeof x === 'object')
                        .map(x => {
                            const o = x;
                            const tMs = typeof o.tMs === 'number' && Number.isFinite(o.tMs) ? o.tMs : null;
                            const s10 = typeof o.s10 === 'number' && Number.isFinite(o.s10) ? o.s10 : null;
                            const p = typeof o.pct === 'number' && Number.isFinite(o.pct) ? o.pct : null;
                            const dd = typeof o.delta === 'number' && Number.isFinite(o.delta) ? o.delta : null;
                            const oa = typeof o.oilAdj === 'number' && Number.isFinite(o.oilAdj) ? o.oilAdj : 0;
                            const lab = typeof o.label === 'string' ? o.label : '';
                            if (tMs === null || s10 === null || p === null || dd === null) return null;
                            return { tMs, s10, pct: p, delta: dd, oilAdj: oa, label: lab };
                        })
                        .filter(Boolean);
                } catch {
                    return [];
                }
            };

            const writeHistory = items => {
                try {
                    localStorage.setItem(historyKey, JSON.stringify(items));
                } catch {
                }
            };

            const toTime = tMs => {
                try {
                    return new Date(tMs).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                } catch {
                    return '';
                }
            };

            const clamp10 = v => Math.max(0, Math.min(10, Math.round(v)));
            const toneColor = s10 => {
                const x = clamp10(s10);
                if (x <= 3) return 'rgba(255,60,80,.95)';
                if (x >= 7) return 'rgba(0,255,160,.95)';
                return 'rgba(255,210,74,.95)';
            };

            const history = readHistory();
            const nextItem = { tMs: nowMs, s10: score10, pct: pct, delta: delta, oilAdj: oilAdj, label: thermoLabel };
            const last = history.length ? history[history.length - 1] : null;
            if (last && nowMs - last.tMs < 20000) {
                history[history.length - 1] = nextItem;
            } else {
                history.push(nextItem);
            }
            const trimmed = history.slice(-maxHistory);
            writeHistory(trimmed);

            const bars = trimmed
                .slice(-12)
                .map(h => {
                    const height = 8 + clamp10(h.s10) * 2.3;
                    const title = `${toTime(h.tMs)} • ${clamp10(h.s10)}/10 • Δ ${formatNumber(h.delta, 3)}${h.oilAdj ? ` • oil ${h.oilAdj > 0 ? '+' : ''}${formatNumber(h.oilAdj, 2)}` : ''}`;
                    return `<div title="${escapeHtml(title)}" style="width:10px;height:${height}px;background:${toneColor(h.s10)};border-radius:4px;opacity:.92;"></div>`;
                })
                .join('');

            setHtml('fs-history', `
            <div style="border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:12px;background:rgba(0,0,0,.18);">
                <div style="display:flex;align-items:baseline;justify-content:space-between;gap:10px;flex-wrap:wrap;">
                    <div style="font-weight:900;letter-spacing:1px;opacity:.95;">Histórico (últimas janelas)</div>
                    <div style="opacity:.80;font-size:12px;">${escapeHtml(trimmed.length ? `${toTime(trimmed[trimmed.length - 1].tMs)}` : '')}</div>
                </div>
                <div style="display:flex;align-items:flex-end;gap:6px;margin-top:10px;min-height:38px;">
                    ${bars || '<div style="opacity:.85;">—</div>'}
                </div>
            </div>
        `);

            const alerts = [];
            const betaPosAbs = typeof betaPosScore === 'number' ? Math.abs(betaPosScore) : 0;
            const betaNegAbs = typeof betaNegScore === 'number' ? Math.abs(betaNegScore) : 0;
            if (betaPosCount >= 2 && betaNegCount >= 2 && betaPosAction.state !== betaNegAction.state && betaPosAbs >= 0.18 && betaNegAbs >= 0.18) {
                alerts.push('Divergência: blocos Risco e Proteção estão puxando para lados opostos.');
            }
            if (Math.abs(delta) < 0.12 && betaPosAbs >= 0.18 && betaNegAbs >= 0.18) {
                alerts.push('Sem consenso: delta neutro com blocos “fortes” (ruído/abertura).');
            }
            setHtml('fs-alerts', alerts.length
                ? `
                <div style="border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:12px;background:rgba(0,0,0,.18);">
                    <div style="font-weight:900;letter-spacing:1px;opacity:.95;margin-bottom:8px;">Alertas (divergência)</div>
                    ${alerts.map(t => `<div style="padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06);opacity:.92;line-height:1.35;">${escapeHtml(t)}</div>`).join('')}
                </div>
              `
                : '');
        }

        const rows = []
            .concat([{ title: 'Bloco Risco (FX)' }])
            .concat(betaPosItems.map(x => ({ label: x.label, val: x.val })))
            .concat([{ title: 'Bloco Proteção (FX)' }])
            .concat(betaNegItems.map(x => ({ label: x.label, val: x.val })));

        const html = `
        <div style="border:1px solid rgba(255,255,255,.12);border-radius:10px;padding:12px 12px;background:rgba(0,0,0,.25);">
            ${rows
                .map(r => {
                    if (r.title) {
                        return `<div style="font-weight:900;letter-spacing:1px;opacity:.9;margin-top:10px;">${escapeHtml(r.title)}</div>`;
                    }
                    const val = typeof r.val === 'number' ? r.val : null;
                    const txt = val === null ? '—' : formatPercent(val, 2);
                    const badge = val === null ? '—' : toneBadgeHtml(val, txt, { maxAbs: 5 });
                    return `
                        <div style="display:flex;justify-content:space-between;gap:10px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06);">
                            <div style="opacity:.9;font-weight:700;">${escapeHtml(r.label)}</div>
                            <div style="font-family:'Share Tech Mono',monospace;">${badge}</div>
                        </div>
                    `;
                })
                .join('')}
        </div>
    `;
        setHtml('fs-components', html);
    }

    root.flowSentinel = { render };
    w.MercadoBlocks = root;
})();
