function opBriefing_computeWinProjectionModuleHtml({
    pulseNow,
    data,
    options,
    findAliasSymbolBest,
    findAssetSymbol,
    getChangePct,
    formatNumber,
    formatPercent,
    formatDateTime,
    escapeHtml,
    badge,
    pillHtml,
}) {
    if (!data) return '';

    const symWin = pulseNow && pulseNow.sym && pulseNow.sym.win ? String(pulseNow.sym.win) : '';
    const symIron = pulseNow && pulseNow.sym && pulseNow.sym.iron ? String(pulseNow.sym.iron) : (findAliasSymbolBest(data, 'IRON') || findAssetSymbol(data, /^DCE_I0$/i) || '');
    const symCopper = pulseNow && pulseNow.sym && pulseNow.sym.copper ? String(pulseNow.sym.copper) : (findAliasSymbolBest(data, 'COPPER') || '');
    const symOil = pulseNow && pulseNow.sym && pulseNow.sym.brent ? String(pulseNow.sym.brent) : (findAliasSymbolBest(data, 'BRENT') || '');

    const msOf = (iso) => {
        const t = iso ? Date.parse(String(iso)) : NaN;
        return Number.isFinite(t) ? t : null;
    };
    const bestPoint = (symbol) => {
        const s = String(symbol || '');
        if (!s) return null;
        const pts = data && data.series && Array.isArray(data.series[s]) ? data.series[s] : [];
        if (!pts.length) return null;
        let best = null;
        let bestAsOf = -Infinity;
        let bestT = -Infinity;
        for (let i = 0; i < pts.length; i += 1) {
            const p = pts[i];
            const price = p && typeof p.price === 'number' && Number.isFinite(p.price) ? p.price : null;
            if (!(typeof price === 'number' && Number.isFinite(price) && price > 0)) continue;
            const asOfMs = msOf(p.asOf);
            const tMs = msOf(p.t);
            const a = asOfMs !== null ? asOfMs : -Infinity;
            const t = tMs !== null ? tMs : -Infinity;
            if (a > bestAsOf || (a === bestAsOf && t > bestT)) {
                best = p;
                bestAsOf = a;
                bestT = t;
            }
        }
        if (!best) return null;
        return { price: best.price, t: best.t ? String(best.t) : null, asOf: best.asOf ? String(best.asOf) : null };
    };
    const lastPrice = s => {
        const p = bestPoint(s);
        return p && typeof p.price === 'number' ? p.price : null;
    };
    const lastTime = s => {
        const p = bestPoint(s);
        return p && p.t ? p.t : null;
    };

    const brtYmdOfMs = (ms) => {
        if (!(typeof ms === 'number' && Number.isFinite(ms))) return '';
        const brtMs = ms - (3 * 60 * 60 * 1000);
        return new Date(brtMs).toISOString().slice(0, 10);
    };
    const prevCloseBrt = (symbol) => {
        const s = String(symbol || '');
        if (!s) return null;
        const pts = data && data.series && Array.isArray(data.series[s]) ? data.series[s] : [];
        if (!pts.length) return null;
        const last = bestPoint(s);
        if (!last || !last.t || !(typeof last.price === 'number' && Number.isFinite(last.price))) return null;
        const lastMs = msOf(last.t);
        if (lastMs === null) return null;
        const lastYmd = brtYmdOfMs(lastMs);
        if (!lastYmd) return null;
        for (let i = pts.length - 1; i >= 0; i -= 1) {
            const p = pts[i];
            const tMs = p && p.t ? msOf(p.t) : null;
            const price = p && typeof p.price === 'number' && Number.isFinite(p.price) ? p.price : null;
            if (tMs === null || !(typeof price === 'number' && Number.isFinite(price) && price > 0)) continue;
            const ymd = brtYmdOfMs(tMs);
            if (ymd && ymd !== lastYmd) return price;
        }
        return null;
    };
    const pct = (symbol) => {
        const s = String(symbol || '');
        if (!s) return null;
        const last = bestPoint(s);
        const prev = prevCloseBrt(s);
        if (last && typeof last.price === 'number' && Number.isFinite(last.price) && typeof prev === 'number' && Number.isFinite(prev) && prev > 0) {
            return ((last.price / prev) - 1) * 100;
        }
        const v = getChangePct(data, s);
        return typeof v === 'number' && Number.isFinite(v) ? v : null;
    };
    const fmtP = v => (typeof v === 'number' && Number.isFinite(v) ? formatPercent(v, 2) : '—');
    const fmt0 = v => (typeof v === 'number' && Number.isFinite(v) ? formatNumber(v, 0) : '—');

    const readState = () => {
        try {
            const raw = localStorage.getItem('mercado_win_proj_v1');
            const obj = raw ? JSON.parse(raw) : null;
            return obj && typeof obj === 'object' ? obj : {};
        } catch {
            return {};
        }
    };
    const st = (() => {
        const cur = readState();
        const today = (() => {
            const d = new Date();
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            return `${y}-${m}-${dd}`;
        })();
        const day = typeof cur.day === 'string' ? String(cur.day) : '';
        if (day !== today) {
            const next = { ...cur, day: today, overrides: {} };
            delete next.refClose;
            delete next.refAdjust;
            try { localStorage.setItem('mercado_win_proj_v1', JSON.stringify(next)); } catch { }
            return next;
        }
        return cur;
    })();

    const prevClose = (() => {
        const s = String(symWin || '');
        if (!s) return null;
        return prevCloseBrt(s);
    })();

    const defaultClose = (() => {
        if (typeof prevClose === 'number' && Number.isFinite(prevClose)) return prevClose;
        const p = lastPrice(symWin);
        return typeof p === 'number' && Number.isFinite(p) ? p : (options && options.items && options.items.WIN && typeof options.items.WIN.spot === 'number' ? options.items.WIN.spot : null);
    })();
    const defaultAdjust = (options && options.items && options.items.WIN && typeof options.items.WIN.spot === 'number' && Number.isFinite(options.items.WIN.spot)) ? options.items.WIN.spot : lastPrice(symWin);
    const refClose = typeof st.refClose === 'number' && Number.isFinite(st.refClose) ? st.refClose : defaultClose;
    const refAdjust = typeof st.refAdjust === 'number' && Number.isFinite(st.refAdjust) ? st.refAdjust : defaultAdjust;

    const betaIron = typeof st.betaIron === 'number' && Number.isFinite(st.betaIron) ? st.betaIron : 1.0;
    const betaCopper = typeof st.betaCopper === 'number' && Number.isFinite(st.betaCopper) ? st.betaCopper : 1.0;
    const betaOil = typeof st.betaOil === 'number' && Number.isFinite(st.betaOil) ? st.betaOil : 1.0;

    const ovr = st.overrides && typeof st.overrides === 'object' ? st.overrides : {};
    const ironManual = (typeof ovr.ironPct === 'number' && Number.isFinite(ovr.ironPct));
    const copperManual = (typeof ovr.copperPct === 'number' && Number.isFinite(ovr.copperPct));
    const oilManual = (typeof ovr.oilPct === 'number' && Number.isFinite(ovr.oilPct));
    const ironPct = ironManual ? ovr.ironPct : pct(symIron);
    const copperPct = copperManual ? ovr.copperPct : pct(symCopper);
    const oilPct = oilManual ? ovr.oilPct : pct(symOil);

    const proj = (base, driverPct, beta) => {
        if (!(typeof base === 'number' && Number.isFinite(base))) return { lvl: null, dPts: null };
        if (!(typeof driverPct === 'number' && Number.isFinite(driverPct))) return { lvl: null, dPts: null };
        const movePct = (driverPct * beta) / 100;
        const lvl = base * (1 + movePct);
        const dPts = lvl - base;
        return { lvl, dPts };
    };

    const row = (label, driverSym, driverPct, beta, k, isManual) => {
        const t = lastTime(driverSym);
        const fromClose = proj(refClose, driverPct, beta);
        const fromAdj = proj(refAdjust, driverPct, beta);
        const betaTxt = (typeof beta === 'number' && Number.isFinite(beta)) ? formatNumber(beta, 2) : '—';
        const dpTxt = `${fmtP(driverPct)}${isManual ? ' (manual)' : ''}`;
        return `
                <tr>
                    <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);font-weight:900;opacity:.92;">${escapeHtml(label)}</td>
                    <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);font-family:'Share Tech Mono',monospace;font-weight:900;opacity:.9;">${escapeHtml(driverSym || '—')}</td>
                    <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);text-align:right;font-family:'Share Tech Mono',monospace;font-weight:900;">${escapeHtml(dpTxt)}</td>
                    <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);text-align:right;font-family:'Share Tech Mono',monospace;font-weight:900;">${escapeHtml(betaTxt)}</td>
                    <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);text-align:right;font-family:'Share Tech Mono',monospace;font-weight:900;">${escapeHtml(fmt0(fromClose.lvl))} <span style="opacity:.7;">(${escapeHtml(fmt0(fromClose.dPts))})</span></td>
                    <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);text-align:right;font-family:'Share Tech Mono',monospace;font-weight:900;">${escapeHtml(fmt0(fromAdj.lvl))} <span style="opacity:.7;">(${escapeHtml(fmt0(fromAdj.dPts))})</span></td>
                    <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);text-align:right;opacity:.78;white-space:nowrap;">${t ? escapeHtml(formatDateTime(t)) : '—'}</td>
                    <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);text-align:right;">
                        <button type="button" data-winproj-copy="${escapeHtml(k)}" style="border:1px solid rgba(255,255,255,.18);border-radius:10px;padding:6px 8px;background:#151515;color:#e0e0e0;font-weight:900;letter-spacing:.4px;cursor:pointer;">Copiar</button>
                    </td>
                </tr>
            `;
    };

    const header = (() => {
        const tWin = lastTime(symWin);
        const winLast = lastPrice(symWin);
        const winBadge = (typeof winLast === 'number' && Number.isFinite(winLast)) ? `${fmt0(winLast)} • ${tWin ? formatDateTime(tWin) : '—'}` : '—';
        return winBadge;
    })();

    return `
            <div style="margin-top:12px;border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:12px;background:rgba(0,0,0,.18);">
                <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
                    <div style="font-weight:900;letter-spacing:1px;opacity:.95;">📐 Projeções WIN (pré) — Ferro • Cobre • Petróleo</div>
                    <div style="opacity:.78;font-size:12px;">Projeção: <span style="font-family:'Share Tech Mono',monospace;font-weight:900;">WIN_ref × (1 + β × Δ%_driver)</span> • Base por Fechamento e por Ajuste.</div>
                </div>
                <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
                    ${badge('neutral', `WIN agora: ${header}`)}
                    ${badge('neutral', `Ref Fechamento: ${fmt0(refClose)}`)}
                    ${badge('neutral', `Ref Ajuste: ${fmt0(refAdjust)}`)}
                    ${pillHtml('status', typeof prevClose === 'number' ? 'info' : 'warn', `Fech (ontem): ${fmt0(prevClose)}`, typeof prevClose === 'number' ? 0.55 : 0.85)}
                </div>
                <div style="margin-top:10px;display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:10px;">
                    <div>
                        <div style="opacity:.85;font-size:12px;margin-bottom:4px;">Ref Fechamento (WIN)</div>
                        <div style="display:flex;gap:8px;align-items:center;">
                            <input id="winproj-ref-close" type="number" step="1" value="${typeof refClose === 'number' && Number.isFinite(refClose) ? String(Math.round(refClose)) : ''}" style="flex:1;background:#101010;color:#e0e0e0;border:1px solid rgba(255,255,255,.14);padding:8px 10px;border-radius:10px;font-weight:900;" />
                            <button type="button" id="winproj-use-prevclose" data-value="${typeof prevClose === 'number' && Number.isFinite(prevClose) ? String(prevClose) : ''}" style="border:1px solid rgba(255,255,255,.18);border-radius:10px;padding:8px 10px;background:#151515;color:#e0e0e0;font-weight:900;letter-spacing:.4px;cursor:pointer;white-space:nowrap;">Usar</button>
                        </div>
                    </div>
                    <div>
                        <div style="opacity:.85;font-size:12px;margin-bottom:4px;">Ref Ajuste (WIN)</div>
                        <div style="display:flex;gap:8px;align-items:center;">
                            <input id="winproj-ref-adjust" type="number" step="1" value="${typeof refAdjust === 'number' && Number.isFinite(refAdjust) ? String(Math.round(refAdjust)) : ''}" style="flex:1;background:#101010;color:#e0e0e0;border:1px solid rgba(255,255,255,.14);padding:8px 10px;border-radius:10px;font-weight:900;" />
                            <button type="button" id="winproj-use-now" data-value="${typeof defaultAdjust === 'number' && Number.isFinite(defaultAdjust) ? String(defaultAdjust) : ''}" style="border:1px solid rgba(255,255,255,.18);border-radius:10px;padding:8px 10px;background:#151515;color:#e0e0e0;font-weight:900;letter-spacing:.4px;cursor:pointer;white-space:nowrap;">Agora</button>
                        </div>
                    </div>
                    <div>
                        <div style="opacity:.85;font-size:12px;margin-bottom:4px;">β Ferro→WIN</div>
                        <input id="winproj-beta-iron" type="number" step="0.05" value="${escapeHtml(String(betaIron))}" style="width:100%;background:#101010;color:#e0e0e0;border:1px solid rgba(255,255,255,.14);padding:8px 10px;border-radius:10px;font-weight:900;" />
                    </div>
                    <div>
                        <div style="opacity:.85;font-size:12px;margin-bottom:4px;">β Cobre→WIN</div>
                        <input id="winproj-beta-copper" type="number" step="0.05" value="${escapeHtml(String(betaCopper))}" style="width:100%;background:#101010;color:#e0e0e0;border:1px solid rgba(255,255,255,.14);padding:8px 10px;border-radius:10px;font-weight:900;" />
                    </div>
                    <div>
                        <div style="opacity:.85;font-size:12px;margin-bottom:4px;">β Petróleo→WIN</div>
                        <input id="winproj-beta-oil" type="number" step="0.05" value="${escapeHtml(String(betaOil))}" style="width:100%;background:#101010;color:#e0e0e0;border:1px solid rgba(255,255,255,.14);padding:8px 10px;border-radius:10px;font-weight:900;" />
                    </div>
                    <div>
                        <div style="opacity:.85;font-size:12px;margin-bottom:4px;">Δ% Ferro override (manual)</div>
                        <input id="winproj-ovr-iron" type="number" step="0.01" value="${ironManual ? escapeHtml(String(ovr.ironPct)) : ''}" placeholder="ex.: 1.00" style="width:100%;background:#101010;color:#e0e0e0;border:1px solid rgba(255,255,255,.14);padding:8px 10px;border-radius:10px;font-weight:900;" />
                    </div>
                    <div>
                        <div style="opacity:.85;font-size:12px;margin-bottom:4px;">Δ% Cobre override (manual)</div>
                        <input id="winproj-ovr-copper" type="number" step="0.01" value="${copperManual ? escapeHtml(String(ovr.copperPct)) : ''}" placeholder="ex.: -0.40" style="width:100%;background:#101010;color:#e0e0e0;border:1px solid rgba(255,255,255,.14);padding:8px 10px;border-radius:10px;font-weight:900;" />
                    </div>
                    <div>
                        <div style="opacity:.85;font-size:12px;margin-bottom:4px;">Δ% Petróleo override (manual)</div>
                        <div style="display:flex;gap:8px;align-items:center;">
                            <input id="winproj-ovr-oil" type="number" step="0.01" value="${oilManual ? escapeHtml(String(ovr.oilPct)) : ''}" placeholder="ex.: 0.70" style="flex:1;background:#101010;color:#e0e0e0;border:1px solid rgba(255,255,255,.14);padding:8px 10px;border-radius:10px;font-weight:900;" />
                            <button type="button" id="winproj-clear-overrides" style="border:1px solid rgba(255,255,255,.18);border-radius:10px;padding:8px 10px;background:#151515;color:#e0e0e0;font-weight:900;letter-spacing:.4px;cursor:pointer;white-space:nowrap;">Limpar</button>
                        </div>
                    </div>
                </div>
                <div style="margin-top:12px;border:1px solid rgba(255,255,255,.10);border-radius:12px;overflow:hidden;">
                    <div style="overflow:auto;">
                        <table style="width:100%;border-collapse:collapse;">
                            <thead>
                                <tr>
                                    <th style="text-align:left;padding:8px;border-bottom:1px solid rgba(255,255,255,.12);opacity:.85;">Driver</th>
                                    <th style="text-align:left;padding:8px;border-bottom:1px solid rgba(255,255,255,.12);opacity:.85;">Símbolo</th>
                                    <th style="text-align:right;padding:8px;border-bottom:1px solid rgba(255,255,255,.12);opacity:.85;">Δ% driver</th>
                                    <th style="text-align:right;padding:8px;border-bottom:1px solid rgba(255,255,255,.12);opacity:.85;">β</th>
                                    <th style="text-align:right;padding:8px;border-bottom:1px solid rgba(255,255,255,.12);opacity:.85;">Proj (Fech.)</th>
                                    <th style="text-align:right;padding:8px;border-bottom:1px solid rgba(255,255,255,.12);opacity:.85;">Proj (Ajuste)</th>
                                    <th style="text-align:right;padding:8px;border-bottom:1px solid rgba(255,255,255,.12);opacity:.85;">Carimbo</th>
                                    <th style="text-align:right;padding:8px;border-bottom:1px solid rgba(255,255,255,.12);opacity:.85;">Ação</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${row('Ferro (Sina/Dalian)', symIron, ironPct, betaIron, 'iron', ironManual)}
                                ${row('Cobre', symCopper, copperPct, betaCopper, 'copper', copperManual)}
                                ${row('Petróleo', symOil, oilPct, betaOil, 'oil', oilManual)}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div style="margin-top:10px;opacity:.78;font-size:12px;line-height:1.35;">
                    Automático quando os drivers estiverem atualizando no <span style="font-family:'Share Tech Mono',monospace;">market_quotes.json</span>. Quando Sina/driver falhar ou você quiser fixar o valor das 08:55, use o override manual (salva localmente por dia).
                </div>
            </div>
        `;
}
