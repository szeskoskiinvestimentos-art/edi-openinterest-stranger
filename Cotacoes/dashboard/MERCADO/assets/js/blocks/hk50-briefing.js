(function () {
    const w = typeof window !== 'undefined' ? window : null;
    if (!w) return;
    const root = (w.MercadoBlocks && typeof w.MercadoBlocks === 'object') ? w.MercadoBlocks : {};

    function render({ el, deps } = {}) {
        if (!el) return;
        const d = deps || {};
        const getData = d.getData;
        const operationalInputs = d.operationalInputs;
        const computeHk50PulseNow = d.computeHk50PulseNow;
        const pillHtml = d.pillHtml;
        const formatPercent = d.formatPercent;
        const formatNumber = d.formatNumber;
        const escapeHtml = d.escapeHtml;
        const toneBadgeHtmlFromTone = d.toneBadgeHtmlFromTone;
        const toneBadgeHtml = d.toneBadgeHtml;
        const getMostRecentPointWithPrice = d.getMostRecentPointWithPrice;
        const getLastPoint = d.getLastPoint;
        const getChangePct = d.getChangePct;
        const formatDateTime = d.formatDateTime;
        const pointPct = d.pointPct;

        const data = getData();
        const rawWeb = operationalInputs.webNews || null;
        const web = rawWeb && rawWeb.ok === true ? rawWeb : null;
        let hkNow = null;
        try {
            hkNow = data ? computeHk50PulseNow(data, web) : null;
        } catch {
            el.innerHTML = `
            <div style="padding:12px;border:1px solid rgba(255,255,255,.12);border-radius:14px;background:rgba(0,0,0,.18);opacity:.88;">
                HK50: erro ao montar o bloco (verifique se os aliases HK50/HSI e drivers estão na carteira).
            </div>
        `;
            return;
        }

        const badge = (tone, text, strength) => pillHtml('signal', tone, text, strength);

        if (!data || !hkNow) {
            el.innerHTML = `
            <div style="padding:12px;border:1px solid rgba(255,255,255,.12);border-radius:14px;background:rgba(0,0,0,.18);opacity:.88;">
                Sem dados suficientes para montar o HK50 agora.
            </div>
        `;
            return;
        }

        const fmtP = v => (typeof v === 'number' && Number.isFinite(v) ? formatPercent(v, 2) : '—');
        const fmt0 = v => (typeof v === 'number' && Number.isFinite(v) ? formatNumber(v, 0) : '—');
        const fmt2 = v => (typeof v === 'number' && Number.isFinite(v) ? formatNumber(v, 2) : '—');

        const p = hkNow.pulse || { bias: 'neutral', net: 0, groups: {}, rows: [] };
        const tone = p.net > 0.25 ? 'positive' : p.net < -0.25 ? 'negative' : 'neutral';
        const netBadge = toneBadgeHtmlFromTone(tone, Math.abs(p.net), `${formatNumber(p.net, 2)}`, { maxAbs: 3 });
        const biasLabel = b => (b === 'buy' ? 'COMPRA' : b === 'sell' ? 'VENDA' : 'NEUTRO');
        const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
        const conv = hkNow.conviction || null;
        const convBadge = conv && conv.label
            ? badge(conv.tone || 'neutral', `Conv: ${String(conv.label)}`)
            : badge('neutral', 'Conv: —');

        const gaugeHtml = (() => {
            const maxAbs = 3;
            const v = typeof p.net === 'number' && Number.isFinite(p.net) ? clamp(p.net, -maxAbs, maxAbs) : 0;
            const cx = 50;
            const cy = 50;
            const r = 40;
            const n3 = n => {
                const x = typeof n === 'number' && Number.isFinite(n) ? n : 0;
                return String(Math.round(x * 1000) / 1000);
            };
            const rp = deg => {
                const rad = (deg * Math.PI) / 180;
                return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) };
            };
            const arc = (a0, a1, stroke) => {
                const p0 = rp(a0);
                const p1 = rp(a1);
                return `<path d="M ${n3(p0.x)} ${n3(p0.y)} A ${String(r)} ${String(r)} 0 0 0 ${n3(p1.x)} ${n3(p1.y)}" stroke="${stroke}" stroke-width="6" fill="none" stroke-linecap="round" opacity=".9"></path>`;
            };
            const ang = 90 - (v / maxAbs) * 90;
            const nRad = (ang * Math.PI) / 180;
            const nx = cx + (r - 10) * Math.cos(nRad);
            const ny = cy - (r - 10) * Math.sin(nRad);
            const needle = `<line x1="${String(cx)}" y1="${String(cy)}" x2="${n3(nx)}" y2="${n3(ny)}" stroke="rgba(255,255,255,.92)" stroke-width="2.3" stroke-linecap="round"></line>
            <circle cx="${String(cx)}" cy="${String(cy)}" r="3.2" fill="rgba(255,255,255,.92)"></circle>`;
            return `<div style="display:flex;align-items:center;gap:10px;">
            <div style="width:92px;height:54px;display:flex;align-items:center;justify-content:center;">
                <svg viewBox="0 0 100 60" width="92" height="54" aria-label="Velocímetro HK">
                    ${arc(180, 120, 'rgba(255,80,80,.92)')}
                    ${arc(120, 60, 'rgba(255,210,80,.92)')}
                    ${arc(60, 0, 'rgba(80,255,170,.92)')}
                    ${needle}
                </svg>
            </div>
            <div style="display:flex;flex-direction:column;gap:4px;line-height:1.05;">
                <div style="font-weight:900;letter-spacing:.6px;opacity:.9;">Velocímetro</div>
                <div style="font-family:'Share Tech Mono',monospace;font-weight:900;opacity:.9;">Net ${escapeHtml(formatNumber(p.net, 2))}</div>
            </div>
        </div>`;
        })();

        const spotOf = s => {
            const pt = s ? (getMostRecentPointWithPrice(data, s) || getLastPoint(data, s)) : null;
            const spot = pt && typeof pt.price === 'number' && Number.isFinite(pt.price) ? pt.price : null;
            const t = pt && pt.t ? String(pt.t) : null;
            return { spot, t };
        };
        const hkSpot = spotOf(hkNow.sym.hk50);
        const hkLine = `${hkNow.sym.hk50 ? hkNow.sym.hk50 : '—'} • ${hkSpot.spot !== null ? fmt0(hkSpot.spot) : '—'} • ${fmtP(hkNow.market.hk50Pct)}`;
        const asOf = hkSpot.t ? formatDateTime(hkSpot.t) : '—';

        const scalperPanel = (() => {
            const symbol = hkNow && hkNow.sym && hkNow.sym.hk50 ? String(hkNow.sym.hk50) : '';
            if (!symbol) return '';
            const series = data && data.series && Array.isArray(data.series[symbol]) ? data.series[symbol] : [];
            if (!series.length) return '';
            const last = series[series.length - 1];
            const lastPrice = last && typeof last.price === 'number' && Number.isFinite(last.price) ? last.price : null;
            const lastMs = last && last.t ? Date.parse(last.t) : NaN;
            if (lastPrice === null || !Number.isFinite(lastMs)) return '';

            const findAt = (lookbackMs) => {
                const target = lastMs - lookbackMs;
                for (let i = series.length - 1; i >= 0; i -= 1) {
                    const p = series[i];
                    const ms = p && p.t ? Date.parse(p.t) : NaN;
                    const price = p && typeof p.price === 'number' && Number.isFinite(p.price) ? p.price : null;
                    if (!Number.isFinite(ms) || price === null) continue;
                    if (ms <= target) return price;
                }
                return null;
            };
            const pctFrom = (priceThen) => (typeof priceThen === 'number' && Number.isFinite(priceThen) && priceThen > 0 ? ((lastPrice / priceThen) - 1) * 100 : null);
            const r5 = pctFrom(findAt(5 * 60 * 1000));
            const r15 = pctFrom(findAt(15 * 60 * 1000));
            const r60 = pctFrom(findAt(60 * 60 * 1000));
            const range30 = (() => {
                const cut = lastMs - 30 * 60 * 1000;
                let hi = -Infinity;
                let lo = +Infinity;
                let n = 0;
                for (let i = series.length - 1; i >= 0; i -= 1) {
                    const p = series[i];
                    const ms = p && p.t ? Date.parse(p.t) : NaN;
                    const price = p && typeof p.price === 'number' && Number.isFinite(p.price) ? p.price : null;
                    if (!Number.isFinite(ms) || price === null) continue;
                    if (ms < cut) break;
                    n += 1;
                    if (price > hi) hi = price;
                    if (price < lo) lo = price;
                }
                if (n < 4 || !Number.isFinite(hi) || !Number.isFinite(lo) || lo <= 0) return null;
                return { pct: ((hi / lo) - 1) * 100 };
            })();

            const amp = hkNow && hkNow.volAmp && typeof hkNow.volAmp.amp === 'number' && Number.isFinite(hkNow.volAmp.amp) ? hkNow.volAmp.amp : 1;
            const th5 = 0.10 * amp;
            const th15 = 0.18 * amp;
            const s5 = typeof r5 === 'number' && Number.isFinite(r5) ? r5 : null;
            const s15 = typeof r15 === 'number' && Number.isFinite(r15) ? r15 : null;
            const microBias = (s5 !== null && s15 !== null && s5 >= th5 && s15 >= th15)
                ? 'buy'
                : (s5 !== null && s15 !== null && s5 <= -th5 && s15 <= -th15)
                    ? 'sell'
                    : 'neutral';

            const ctxBias = p && p.bias ? String(p.bias) : 'neutral';
            const ctxStrong = typeof p.net === 'number' && Number.isFinite(p.net) ? Math.abs(p.net) >= 0.35 : false;
            const finalBias = (microBias !== 'neutral' && ctxStrong && ctxBias !== 'neutral' && microBias !== ctxBias) ? 'neutral' : microBias;
            const tone = finalBias === 'buy' ? 'positive' : finalBias === 'sell' ? 'negative' : 'neutral';
            const action = finalBias === 'buy' ? 'COMPRA' : finalBias === 'sell' ? 'VENDA' : 'NEUTRO';

            const sign = (v, th = 0.10) => (typeof v === 'number' && Number.isFinite(v) ? (v > th ? +1 : v < -th ? -1 : 0) : 0);
            const ok = (a, b, inverse = false) => {
                const sa = sign(a);
                const sb = sign(b);
                if (!sa || !sb) return null;
                return inverse ? (sa === -sb) : (sa === sb);
            };
            const usdCnh = hkNow.sym && (hkNow.sym.usdCnh || hkNow.sym.usdCny) ? getChangePct(data, hkNow.sym.usdCnh || hkNow.sym.usdCny) : null;
            const spx = hkNow.sym && hkNow.sym.spx ? getChangePct(data, hkNow.sym.spx) : null;
            const dxy = hkNow.sym && hkNow.sym.dxy ? getChangePct(data, hkNow.sym.dxy) : null;
            const vix = hkNow.sym && hkNow.sym.vix ? getChangePct(data, hkNow.sym.vix) : null;
            const fxi = hkNow.sym && hkNow.sym.fxi ? getChangePct(data, hkNow.sym.fxi) : (hkNow.sym && hkNow.sym.fxChina ? getChangePct(data, hkNow.sym.fxChina) : null);
            const hstech = hkNow.sym && hkNow.sym.hstech ? getChangePct(data, hkNow.sym.hstech) : null;
            const iron = hkNow.sym && hkNow.sym.iron ? getChangePct(data, hkNow.sym.iron) : null;
            const copper = hkNow.sym && hkNow.sym.copper ? getChangePct(data, hkNow.sym.copper) : null;

            const pCnh = ok(hkNow.market.hk50Pct, usdCnh, true);
            const pSpx = ok(hkNow.market.hk50Pct, spx, false);
            const pChina = ok(hkNow.market.hk50Pct, fxi, false);

            const parityBadge = (name, v) => badge(v === true ? 'positive' : v === false ? 'negative' : 'neutral', `${name}: ${v === true ? 'OK' : v === false ? 'DIVERGE' : '—'}`);
            const ampAdj = clamp(0.6 + 0.4 * amp, 0.85, 1.35);
            const stopBase = range30 && typeof range30.pct === 'number' ? Math.max(0.20, range30.pct * 0.25) : null;
            const alvoBase = range30 && typeof range30.pct === 'number' ? Math.max(0.35, range30.pct * 0.5) : null;
            const stop = stopBase !== null ? clamp(stopBase * ampAdj, 0.18, 2.50) : null;
            const alvo = alvoBase !== null ? clamp(alvoBase * ampAdj, 0.30, 4.00) : null;
            const r = (stop !== null && alvo !== null && stop > 1e-9) ? (alvo / stop) : null;
            const plan = finalBias === 'buy'
                ? `Comprar (scalp) • Stop ~${stop !== null ? formatPercent(stop, 2) : '—'} • Alvo ~${alvo !== null ? formatPercent(alvo, 2) : '—'}${r !== null ? ` • R~${formatNumber(r, 1)}` : ''} • volAmp ${formatNumber(amp, 2)}`
                : finalBias === 'sell'
                    ? `Vender (scalp) • Stop ~${stop !== null ? formatPercent(stop, 2) : '—'} • Alvo ~${alvo !== null ? formatPercent(alvo, 2) : '—'}${r !== null ? ` • R~${formatNumber(r, 1)}` : ''} • volAmp ${formatNumber(amp, 2)}`
                    : 'Neutro (scalp) • aguarde alinhamento 5m×15m e paridades.';
            const convWarn = (conv && Array.isArray(conv.divergences) && conv.divergences.length)
                ? ` • ${conv.divergences[0]}`
                : '';

            return `
            <div style="margin-top:12px;border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:12px;background:rgba(0,0,0,.18);">
                <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
                    <div style="font-weight:900;letter-spacing:.8px;opacity:.95;">⚡ Scalper — HK50</div>
                    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
                        ${badge(tone, `Scalp: ${action}`)}
                        ${badge('neutral', `Macro: ${biasLabel(ctxBias)} (${formatNumber(p.net, 2)})`)}
                        ${parityBadge('HK50×USD/CNH (inv)', pCnh)}
                        ${parityBadge('HK50×SPX', pSpx)}
                        ${parityBadge('HK50×China', pChina)}
                    </div>
                </div>
                <div style="margin-top:8px;opacity:.86;font-size:12px;line-height:1.35;">
                    Micro: 5m ${escapeHtml(typeof r5 === 'number' ? formatPercent(r5, 2) : '—')} • 15m ${escapeHtml(typeof r15 === 'number' ? formatPercent(r15, 2) : '—')} • 60m ${escapeHtml(typeof r60 === 'number' ? formatPercent(r60, 2) : '—')} • Range30 ${escapeHtml(range30 ? formatPercent(range30.pct, 2) : '—')}
                </div>
                <div style="margin-top:8px;opacity:.84;font-size:12px;line-height:1.35;">
                    Fluxo/risco: DXY ${escapeHtml(fmtP(dxy))} • VIX ${escapeHtml(fmtP(vix))} • USD/CNH ${escapeHtml(fmtP(usdCnh))}
                </div>
                <div style="margin-top:8px;opacity:.84;font-size:12px;line-height:1.35;">
                    Setores/proxies: HSTECH ${escapeHtml(fmtP(hstech))} • FXI/MCHI ${escapeHtml(fmtP(fxi))} • Minério ${escapeHtml(fmtP(iron))} • Cobre ${escapeHtml(fmtP(copper))}
                </div>
                <div style="margin-top:10px;opacity:.86;font-size:12px;line-height:1.35;">${escapeHtml(plan)}${escapeHtml(convWarn)}</div>
            </div>
        `;
        })();

        const groupTop = (groupKey, max = 7) => {
            const xs = (p.rows || []).filter(r => r && r.group === groupKey);
            xs.sort((a, b) => Math.abs(b.contrib || 0) - Math.abs(a.contrib || 0));
            return xs.slice(0, max);
        };

        const lineItem = r => {
            const pct = typeof r.pct === 'number' && Number.isFinite(r.pct) ? r.pct : null;
            const contrib = typeof r.contrib === 'number' && Number.isFinite(r.contrib) ? r.contrib : 0;
            const t = contrib > 0.02 ? 'positive' : contrib < -0.02 ? 'negative' : 'neutral';
            const cBadge = toneBadgeHtmlFromTone(t, Math.abs(contrib), fmt2(contrib), { maxAbs: 1 });
            const sym = r.symbol ? String(r.symbol) : '';
            const head = sym ? `${r.label} (${sym})` : String(r.label || '');
            return `<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;padding:6px 8px;border:1px solid rgba(255,255,255,.10);border-radius:10px;background:rgba(0,0,0,.16);">
            <div style="opacity:.92;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:72%;">${escapeHtml(head)}</div>
            <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;justify-content:flex-end;">
                <span style="font-family:'Share Tech Mono',monospace;font-weight:900;opacity:.88;">${escapeHtml(fmtP(pct))}</span>
                ${cBadge}
            </div>
        </div>`;
        };

        const g = p.groups || {};
        const layersLine = (() => {
            const d = g.driver || { net: 0, count: 0 };
            const c = g.confirm || { net: 0, count: 0 };
            const x = g.context || { net: 0, count: 0 };
            return `Camadas: Driver ${fmt2(d.net)} (${String(d.count)}) • Conf ${fmt2(c.net)} (${String(c.count)}) • Contexto ${fmt2(x.net)} (${String(x.count)})`;
        })();
        const corrLine = (() => {
            const fc = hkNow.flowCorr || null;
            const items = fc && Array.isArray(fc.items) ? fc.items : [];
            const parts = items
                .filter(x => x && typeof x.corr === 'number' && Number.isFinite(x.corr) && typeof x.n === 'number' && Number.isFinite(x.n) && x.n >= 20)
                .slice(0, 5)
                .map(x => `${String(x.label || 'Corr')} ${fmt2(x.corr)} (n=${String(Math.floor(x.n))})`);
            return parts.length ? `Corr (fluxo): ${parts.join(' • ')}` : '';
        })();

        const missing = hkNow.coverage && Array.isArray(hkNow.coverage.missing) ? hkNow.coverage.missing : [];
        const missingPretty = (() => {
            const keyLabels = hkNow.coverage && hkNow.coverage.keyLabels && typeof hkNow.coverage.keyLabels === 'object' ? hkNow.coverage.keyLabels : {};
            const details = hkNow.coverage && hkNow.coverage.missingDetails && typeof hkNow.coverage.missingDetails === 'object' ? hkNow.coverage.missingDetails : {};
            return missing.map(k => {
                const label = keyLabels && keyLabels[k] ? String(keyLabels[k]) : String(k);
                const det = details && details[k] ? String(details[k]) : '';
                return det ? `${label} (${det})` : label;
            });
        })();
        const missingLabel = missingPretty.length ? `Faltando (dados): ${missingPretty.slice(0, 10).join(', ')}${missingPretty.length > 10 ? `… +${missingPretty.length - 10}` : ''}` : 'Drivers: completos';
        const missingBadge = badge(missing.length ? 'neutral' : 'positive', missingLabel);

        const sugg = hkNow.missingAssetsSuggestion || [];
        const suggestLine = sugg.length ? `Sugestões p/ carteira (Investing): ${sugg.join(' • ')}` : '';

        const news = Array.isArray(hkNow.news) ? hkNow.news : [];
        const newsHtml = (() => {
            if (!news.length) return `<div style="opacity:.78;font-size:12px;">• —</div>`;
            return news
                .map(it => {
                    const title = it && it.title ? String(it.title) : '';
                    const url = it && it.url ? String(it.url) : '';
                    const safeUrl = url && /^https?:\/\//i.test(url) ? url : '';
                    const a = safeUrl
                        ? `<a href="${escapeHtml(safeUrl)}" target="_blank" rel="noreferrer" style="color:rgba(0,243,255,.92);text-decoration:none;">${escapeHtml(title)}</a>`
                        : escapeHtml(title);
                    return `• ${a}`;
                })
                .join('<br>');
        })();

        const ratesAndCreditHtml = (() => {
            const ratesMoveProxy = s => {
                const sym = s ? String(s) : '';
                if (!sym) return null;
                const series = data && data.series && Array.isArray(data.series[sym]) ? data.series[sym] : [];
                if (!series.length) return null;
                const last = series[series.length - 1];
                const lastPrice = last && typeof last.price === 'number' && Number.isFinite(last.price) ? last.price : null;
                const lastPct = pointPct(last);
                if (typeof lastPct === 'number' && Number.isFinite(lastPct)) return lastPct;
                const prev = series.length > 1 ? series[series.length - 2] : null;
                const prevPrice = prev && typeof prev.price === 'number' && Number.isFinite(prev.price) ? prev.price : null;
                const deltaRaw = last && typeof last.change === 'number' && Number.isFinite(last.change)
                    ? last.change
                    : (lastPrice !== null && prevPrice !== null ? (lastPrice - prevPrice) : null);
                if (deltaRaw === null || !Number.isFinite(deltaRaw)) return null;
                const absPrice = lastPrice !== null ? Math.abs(lastPrice) : 0;
                const deltaBp = absPrice > 20 ? deltaRaw : (deltaRaw * 100);
                return deltaBp * 0.1;
            };
            const mk = (label, s, { fmtSpot, maxAbs } = {}) => {
                const sym = s ? String(s) : '';
                const spot = spotOf(sym).spot;
                const chg = sym ? ratesMoveProxy(sym) : null;
                const spotTxt = typeof fmtSpot === 'function' ? fmtSpot(spot) : (spot !== null ? fmt2(spot) : '—');
                const chgTxt = typeof chg === 'number' && Number.isFinite(chg) ? toneBadgeHtml(chg, formatNumber(chg, 2), { maxAbs: typeof maxAbs === 'number' ? maxAbs : 1 }) : '—';
                return `<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;padding:6px 8px;border:1px solid rgba(255,255,255,.10);border-radius:10px;background:rgba(0,0,0,.16);">
                <div style="opacity:.92;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:60%;">${escapeHtml(label)}${sym ? ` <span style="opacity:.72;">(${escapeHtml(sym)})</span>` : ''}</div>
                <div style="display:flex;gap:8px;align-items:center;justify-content:flex-end;flex-wrap:wrap;">
                    <span style="font-family:'Share Tech Mono',monospace;font-weight:900;opacity:.88;">${escapeHtml(spotTxt)}</span>
                    ${chgTxt}
                </div>
            </div>`;
            };
            const mkComputed = (label, spot, chg, hintSym) => {
                const spotTxt = spot !== null && typeof spot === 'number' && Number.isFinite(spot) ? `${formatNumber(spot, 2)}%` : '—';
                const chgTxt = typeof chg === 'number' && Number.isFinite(chg) ? toneBadgeHtml(chg, formatNumber(chg, 2), { maxAbs: 0.6 }) : '—';
                return `<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;padding:6px 8px;border:1px solid rgba(255,255,255,.10);border-radius:10px;background:rgba(0,0,0,.16);">
                <div style="opacity:.92;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:60%;">${escapeHtml(label)}${hintSym ? ` <span style="opacity:.72;">(${escapeHtml(hintSym)})</span>` : ''}</div>
                <div style="display:flex;gap:8px;align-items:center;justify-content:flex-end;flex-wrap:wrap;">
                    <span style="font-family:'Share Tech Mono',monospace;font-weight:900;opacity:.88;">${escapeHtml(spotTxt)}</span>
                    ${chgTxt}
                </div>
            </div>`;
            };
            const fmtRate = v => (typeof v === 'number' && Number.isFinite(v) ? `${formatNumber(v, 2)}%` : '—');
            const s = hkNow && hkNow.sym ? hkNow.sym : {};
            const hk10ySpot = s.hk10y ? spotOf(s.hk10y).spot : null;
            const cn10ySpot = s.cn10y ? spotOf(s.cn10y).spot : null;
            const us10ySpot = s.us10y ? spotOf(s.us10y).spot : null;
            const spreadSpot = (hk10ySpot !== null && us10ySpot !== null) ? (hk10ySpot - us10ySpot) : (cn10ySpot !== null && us10ySpot !== null) ? (cn10ySpot - us10ySpot) : null;
            const hk10yChg = s.hk10y ? ratesMoveProxy(s.hk10y) : null;
            const cn10yChg = s.cn10y ? ratesMoveProxy(s.cn10y) : null;
            const us10yChg = s.us10y ? ratesMoveProxy(s.us10y) : null;
            const spreadChg = (hk10yChg !== null && us10yChg !== null) ? (hk10yChg - us10yChg) : (cn10yChg !== null && us10yChg !== null) ? (cn10yChg - us10yChg) : null;
            const spreadHint = (hk10ySpot !== null && us10ySpot !== null) ? 'HK10Y−US10Y' : (cn10ySpot !== null && us10ySpot !== null) ? 'CN10Y−US10Y' : '';
            const items = [
                mk('HK10Y', s.hk10y, { fmtSpot: fmtRate, maxAbs: 0.6 }),
                mk('HK 1M', s.hk1m, { fmtSpot: fmtRate, maxAbs: 0.6 }),
                mk('HK 3M', s.hk3m, { fmtSpot: fmtRate, maxAbs: 0.6 }),
                mk('CN10Y', s.cn10y, { fmtSpot: fmtRate, maxAbs: 0.6 }),
                mk('US10Y', s.us10y, { fmtSpot: fmtRate, maxAbs: 0.6 }),
                mkComputed('Spread 10Y (HK/China vs US)', spreadSpot, spreadChg, spreadHint),
                mk('China CDS 5Y (USD)', s.cdsCn5y, { maxAbs: 2.0 }),
            ];
            return `<div style="margin-top:12px;border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:12px;background:rgba(0,0,0,.18);">
            <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
                <div style="font-weight:900;letter-spacing:.6px;opacity:.92;">Taxas & Crédito (HK/China)</div>
                <div style="opacity:.72;font-size:12px;">spot + Δ (proxy)</div>
            </div>
            <div style="margin-top:10px;display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:10px;">
                ${items.join('')}
            </div>
        </div>`;
        })();

        el.innerHTML = `
        <div style="padding:12px;border:1px solid rgba(255,255,255,.12);border-radius:14px;background:rgba(0,0,0,.18);">
            <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
                <div style="font-weight:900;letter-spacing:1px;">HK50 — Resumo Operacional</div>
                <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
                    ${badge(p.bias === 'buy' ? 'positive' : p.bias === 'sell' ? 'negative' : 'neutral', `Viés: ${biasLabel(p.bias)}`)}
                    ${badge('neutral', 'Drivers net')} ${netBadge}
                    ${convBadge}
                    ${gaugeHtml}
                </div>
            </div>
            <div style="margin-top:8px;opacity:.86;font-size:12px;line-height:1.35;">
                ${escapeHtml(hkLine)} • asOf ${escapeHtml(asOf)} • ${escapeHtml(layersLine)}
            </div>
            ${corrLine ? `<div style="margin-top:6px;opacity:.82;font-size:12px;line-height:1.35;">${escapeHtml(corrLine)}</div>` : ''}
            <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
                ${missingBadge}
            </div>
            ${suggestLine ? `<div style="margin-top:8px;opacity:.82;font-size:12px;line-height:1.35;">${escapeHtml(suggestLine)}</div>` : ''}
        </div>
        ${scalperPanel}
        ${ratesAndCreditHtml}

        <div style="margin-top:12px;display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:12px;">
            <div style="border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:12px;background:rgba(0,0,0,.18);">
                <div style="font-weight:900;letter-spacing:.6px;opacity:.92;margin-bottom:8px;">Drivers (direto / China-HK)</div>
                ${(groupTop('driver') || []).map(lineItem).join('') || `<div style="opacity:.80;">—</div>`}
            </div>
            <div style="border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:12px;background:rgba(0,0,0,.18);">
                <div style="font-weight:900;letter-spacing:.6px;opacity:.92;margin-bottom:8px;">Confirmação (global risk)</div>
                ${(groupTop('confirm') || []).map(lineItem).join('') || `<div style="opacity:.80;">—</div>`}
            </div>
            <div style="border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:12px;background:rgba(0,0,0,.18);">
                <div style="font-weight:900;letter-spacing:.6px;opacity:.92;margin-bottom:8px;">Contexto (commodities / EM)</div>
                ${(groupTop('context') || []).map(lineItem).join('') || `<div style="opacity:.80;">—</div>`}
            </div>
        </div>

        <div style="margin-top:12px;border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:12px;background:rgba(0,0,0,.18);">
            <div style="font-weight:900;letter-spacing:.6px;opacity:.92;margin-bottom:8px;">Notícias (geo / China-HK)</div>
            <div style="opacity:.92;line-height:1.35;">${newsHtml}</div>
        </div>
    `;
    }

    root.hk50Briefing = { render };
    w.MercadoBlocks = root;
})();
