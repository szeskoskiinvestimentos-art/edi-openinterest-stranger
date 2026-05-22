(function () {
    const w = typeof window !== 'undefined' ? window : null;
    if (!w) return;
    const root = (w.MercadoBlocks && typeof w.MercadoBlocks === 'object') ? w.MercadoBlocks : {};

    function render({ el, deps } = {}) {
        if (!el) return;
        const d = deps || {};
        const getData = d.getData;
        const operationalInputs = d.operationalInputs;
        const computeBtcPulseNow = d.computeBtcPulseNow;
        const pillHtml = d.pillHtml;
        const formatPercent = d.formatPercent;
        const formatNumber = d.formatNumber;
        const escapeHtml = d.escapeHtml;
        const toneBadgeHtmlFromTone = d.toneBadgeHtmlFromTone;
        const getMostRecentPointWithPrice = d.getMostRecentPointWithPrice;
        const getLastPoint = d.getLastPoint;
        const getChangePct = d.getChangePct;
        const formatDateTime = d.formatDateTime;

        const data = getData();
        const rawWeb = operationalInputs.webNews || null;
        const web = rawWeb && rawWeb.ok === true ? rawWeb : null;
        const btcNow = data ? computeBtcPulseNow(data, web) : null;

        const badge = (tone, text, strength) => pillHtml('signal', tone, text, strength);
        const statusBadge = (tone, text, strength) => pillHtml('status', tone, text, strength);

        if (!data || !btcNow) {
            el.innerHTML = `
            <div style="padding:12px;border:1px solid rgba(255,255,255,.12);border-radius:14px;background:rgba(0,0,0,.18);opacity:.88;">
                Sem dados suficientes para montar o BTC agora.
            </div>
        `;
            return;
        }

        const fmtP = v => (typeof v === 'number' && Number.isFinite(v) ? formatPercent(v, 2) : '—');
        const fmt0 = v => (typeof v === 'number' && Number.isFinite(v) ? formatNumber(v, 0) : '—');
        const fmt2 = v => (typeof v === 'number' && Number.isFinite(v) ? formatNumber(v, 2) : '—');

        const p = btcNow.pulse || { bias: 'neutral', net: 0, groups: {}, rows: [] };
        const tone = p.net > 0.25 ? 'positive' : p.net < -0.25 ? 'negative' : 'neutral';
        const netBadge = toneBadgeHtmlFromTone(tone, Math.abs(p.net), `${formatNumber(p.net, 2)}`, { maxAbs: 3 });
        const biasLabel = b => (b === 'buy' ? 'COMPRA' : b === 'sell' ? 'VENDA' : 'NEUTRO');
        const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

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
                <svg viewBox="0 0 100 60" width="92" height="54" aria-label="Velocímetro BTC">
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
        const btcSpot = spotOf(btcNow.sym.btc);
        const btcLine = `${btcNow.sym.btc ? btcNow.sym.btc : '—'} • ${btcSpot.spot !== null ? `$${fmt0(btcSpot.spot)}` : '—'} • ${fmtP(btcNow.market.btcPct)}`;
        const asOf = btcSpot.t ? formatDateTime(btcSpot.t) : '—';

        const scalperPanel = (() => {
            const symbol = btcNow.sym && btcNow.sym.btc ? String(btcNow.sym.btc) : '';
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

            const vixNow = btcNow.sym && btcNow.sym.vix ? getChangePct(data, btcNow.sym.vix) : null;
            const vvixNow = btcNow.sym && btcNow.sym.vvix ? getChangePct(data, btcNow.sym.vvix) : null;
            const vxnNow = btcNow.sym && btcNow.sym.vxn ? getChangePct(data, btcNow.sym.vxn) : null;
            const volStress = (typeof vixNow === 'number' && vixNow >= 1.0) || (typeof vvixNow === 'number' && vvixNow >= 1.0) || (typeof vxnNow === 'number' && vxnNow >= 1.0);
            const th5 = volStress ? 0.16 : 0.12;
            const th15 = volStress ? 0.28 : 0.22;
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

            const sign = (v, th = 0.10) => (typeof v === 'number' && Number.isFinite(v) ? (v > th ? +1 : v < -th ? -1 : 0) : 0);
            const ok = (a, b, inverse = false) => {
                const sa = sign(a);
                const sb = sign(b);
                if (!sa || !sb) return null;
                return inverse ? (sa === -sb) : (sa === sb);
            };
            const ndx = btcNow.sym && btcNow.sym.ndx ? getChangePct(data, btcNow.sym.ndx) : null;
            const dxy = btcNow.sym && btcNow.sym.dxy ? getChangePct(data, btcNow.sym.dxy) : null;
            const eth = btcNow.sym && btcNow.sym.eth ? getChangePct(data, btcNow.sym.eth) : null;
            const sol = btcNow.sym && btcNow.sym.sol ? getChangePct(data, btcNow.sym.sol) : null;
            const hyg = btcNow.sym && btcNow.sym.hyg ? getChangePct(data, btcNow.sym.hyg) : null;
            const tlt = btcNow.sym && btcNow.sym.tlt ? getChangePct(data, btcNow.sym.tlt) : null;
            const lqd = btcNow.sym && btcNow.sym.lqd ? getChangePct(data, btcNow.sym.lqd) : null;
            const tip = btcNow.sym && btcNow.sym.tip ? getChangePct(data, btcNow.sym.tip) : null;
            const mstr = btcNow.sym && btcNow.sym.mstr ? getChangePct(data, btcNow.sym.mstr) : null;
            const coin = btcNow.sym && btcNow.sym.coin ? getChangePct(data, btcNow.sym.coin) : null;

            const pBtcNdx = ok(btcNow.market ? btcNow.market.btcPct : null, ndx, true) === null ? ok(btcNow.market ? btcNow.market.btcPct : null, ndx, false) : ok(btcNow.market ? btcNow.market.btcPct : null, ndx, false);
            const pBtcDxy = ok(btcNow.market ? btcNow.market.btcPct : null, dxy, true);
            const pEthBtc = ok(eth, btcNow.market ? btcNow.market.btcPct : null, false);

            const parityBadge = (name, v) => badge(v === true ? 'positive' : v === false ? 'negative' : 'neutral', `${name}: ${v === true ? 'OK' : v === false ? 'DIVERGE' : '—'}`);
            const fmtMicro = (label, v) => `${label} ${typeof v === 'number' && Number.isFinite(v) ? formatPercent(v, 2) : '—'}`;
            const stop = range30 && typeof range30.pct === 'number' ? Math.max(0.25, range30.pct * 0.25) : null;
            const alvo = range30 && typeof range30.pct === 'number' ? Math.max(0.45, range30.pct * 0.5) : null;
            const plan = finalBias === 'buy'
                ? `Comprar (scalp) • Stop ~${stop !== null ? formatPercent(stop, 2) : '—'} • Alvo ~${alvo !== null ? formatPercent(alvo, 2) : '—'}`
                : finalBias === 'sell'
                    ? `Vender (scalp) • Stop ~${stop !== null ? formatPercent(stop, 2) : '—'} • Alvo ~${alvo !== null ? formatPercent(alvo, 2) : '—'}`
                    : 'Neutro (scalp) • espere alinhamento 5m×15m e paridades.';

            const tone = finalBias === 'buy' ? 'positive' : finalBias === 'sell' ? 'negative' : 'neutral';
            const action = finalBias === 'buy' ? 'COMPRA' : finalBias === 'sell' ? 'VENDA' : 'NEUTRO';

            return `
            <div style="margin-top:12px;border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:12px;background:rgba(0,0,0,.18);">
                <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
                    <div style="font-weight:900;letter-spacing:.8px;opacity:.95;">⚡ Scalper — BTC</div>
                    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
                        ${badge(tone, `Scalp: ${action}`)}
                        ${badge('neutral', `Macro: ${biasLabel(ctxBias)} (${formatNumber(p.net, 2)})`)}
                        ${parityBadge('BTC×NDX', pBtcNdx)}
                        ${parityBadge('BTC×DXY (inv)', pBtcDxy)}
                        ${parityBadge('ETH×BTC', pEthBtc)}
                    </div>
                </div>
                <div style="margin-top:8px;opacity:.86;font-size:12px;line-height:1.35;">
                    Micro: ${escapeHtml(fmtMicro('5m', r5))} • ${escapeHtml(fmtMicro('15m', r15))} • ${escapeHtml(fmtMicro('60m', r60))} • Range30 ${escapeHtml(range30 ? formatPercent(range30.pct, 2) : '—')}
                </div>
                <div style="margin-top:8px;opacity:.84;font-size:12px;line-height:1.35;">
                    Fluxo/risco: HYG ${escapeHtml(fmtP(hyg))} • LQD ${escapeHtml(fmtP(lqd))} • TLT ${escapeHtml(fmtP(tlt))} • TIP ${escapeHtml(fmtP(tip))} • ETH ${escapeHtml(fmtP(eth))} • SOL ${escapeHtml(fmtP(sol))}
                </div>
                <div style="margin-top:8px;opacity:.84;font-size:12px;line-height:1.35;">
                    Empresas/setor: MSTR ${escapeHtml(fmtP(mstr))} • COIN ${escapeHtml(fmtP(coin))}
                </div>
                <div style="margin-top:10px;opacity:.86;font-size:12px;line-height:1.35;">${escapeHtml(plan)}</div>
            </div>
        `;
        })();

        const groupTop = (groupKey, max = 7) => {
            const xs = (p.rows || []).filter(r => r && r.group === groupKey);
            xs.sort((a, b) => Math.abs(b.contrib || 0) - Math.abs(a.contrib || 0));
            return xs.slice(0, max);
        };

        const lineItem = r => {
            const v = typeof r.pct === 'number' && Number.isFinite(r.pct) ? r.pct : null;
            const contrib = typeof r.contrib === 'number' && Number.isFinite(r.contrib) ? r.contrib : 0;
            const t = contrib > 0.02 ? 'positive' : contrib < -0.02 ? 'negative' : 'neutral';
            const cBadge = toneBadgeHtmlFromTone(t, Math.abs(contrib), fmt2(contrib), { maxAbs: 1 });
            const sym = r.symbol ? String(r.symbol) : '';
            const head = sym ? `${r.label} (${sym})` : String(r.label || '');
            const vTxt = r.unit === 'score' ? fmt2(v) : fmtP(v);
            return `<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;padding:6px 8px;border:1px solid rgba(255,255,255,.10);border-radius:10px;background:rgba(0,0,0,.16);">
            <div style="opacity:.92;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:72%;">${escapeHtml(head)}</div>
            <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;justify-content:flex-end;">
                <span style="font-family:'Share Tech Mono',monospace;font-weight:900;opacity:.88;">${escapeHtml(vTxt)}</span>
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

        const missing = btcNow.coverage && Array.isArray(btcNow.coverage.missing) ? btcNow.coverage.missing : [];
        const missingPretty = (() => {
            const keyLabels = btcNow.coverage && btcNow.coverage.keyLabels && typeof btcNow.coverage.keyLabels === 'object' ? btcNow.coverage.keyLabels : {};
            const details = btcNow.coverage && btcNow.coverage.missingDetails && typeof btcNow.coverage.missingDetails === 'object' ? btcNow.coverage.missingDetails : {};
            return missing.map(k => {
                const label = keyLabels && keyLabels[k] ? String(keyLabels[k]) : String(k);
                const det = details && details[k] ? String(details[k]) : '';
                return det ? `${label} (${det})` : label;
            });
        })();
        const missingLabel = missingPretty.length ? `Faltando (dados): ${missingPretty.slice(0, 10).join(', ')}${missingPretty.length > 10 ? `… +${missingPretty.length - 10}` : ''}` : 'Drivers: completos';
        const missingBadge = missing.length ? statusBadge('warn', missingLabel, 0.85) : statusBadge('ok', missingLabel, 0.75);
        const staleBadge = (btcNow.coverage && btcNow.coverage.staleCore) ? statusBadge('warn', 'Dados: STALE (>4h)', 0.95) : '';

        const sugg = btcNow.missingAssetsSuggestion || [];
        const suggestLine = sugg.length ? `Sugestões p/ carteira (Investing): ${sugg.join(' • ')}` : '';

        const news = Array.isArray(btcNow.news) ? btcNow.news : [];
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

        el.innerHTML = `
        <div style="padding:12px;border:1px solid rgba(255,255,255,.12);border-radius:14px;background:rgba(0,0,0,.18);">
            <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
                <div style="font-weight:900;letter-spacing:1px;">BTC — Resumo Operacional</div>
                <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
                    ${badge(p.bias === 'buy' ? 'positive' : p.bias === 'sell' ? 'negative' : 'neutral', `Viés: ${biasLabel(p.bias)}`)}
                    ${badge('neutral', `Drivers net (${escapeHtml(btcNow.phase.nowLabel || 'AGORA')})`)} ${netBadge}
                    ${gaugeHtml}
                </div>
            </div>
            <div style="margin-top:8px;opacity:.86;font-size:12px;line-height:1.35;">
                ${escapeHtml(btcLine)} • asOf ${escapeHtml(asOf)} • ${escapeHtml(layersLine)}
            </div>
            <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
                ${missingBadge}
                ${staleBadge}
            </div>
            ${suggestLine ? `<div style="margin-top:8px;opacity:.82;font-size:12px;line-height:1.35;">${escapeHtml(suggestLine)}</div>` : ''}
        </div>
        ${scalperPanel}

        <div style="margin-top:12px;display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:12px;">
            <div style="border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:12px;background:rgba(0,0,0,.18);">
                <div style="font-weight:900;letter-spacing:.6px;opacity:.92;margin-bottom:8px;">Drivers (macro/liquidez)</div>
                ${(groupTop('driver') || []).map(lineItem).join('') || `<div style="opacity:.80;">—</div>`}
            </div>
            <div style="border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:12px;background:rgba(0,0,0,.18);">
                <div style="font-weight:900;letter-spacing:.6px;opacity:.92;margin-bottom:8px;">Confirmação (cripto)</div>
                ${(groupTop('confirm') || []).map(lineItem).join('') || `<div style="opacity:.80;">—</div>`}
            </div>
            <div style="border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:12px;background:rgba(0,0,0,.18);">
                <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:8px;">
                    <div style="font-weight:900;letter-spacing:.6px;opacity:.92;">Contexto (commodities/geo/news)</div>
                    <div style="opacity:.72;font-size:12px;">news score ${escapeHtml(fmt2(btcNow.newsMeta && typeof btcNow.newsMeta.score === 'number' ? btcNow.newsMeta.score : 0))}</div>
                </div>
                ${(groupTop('context') || []).map(lineItem).join('') || `<div style="opacity:.80;">—</div>`}
                <div style="margin-top:10px;border-top:1px solid rgba(255,255,255,.10);padding-top:10px;">
                    <div style="opacity:.86;font-size:12px;font-weight:900;letter-spacing:.6px;margin-bottom:6px;">Notícias (recorte)</div>
                    <div style="opacity:.84;font-size:12px;line-height:1.35;">${newsHtml}</div>
                </div>
            </div>
        </div>
    `;
    }

    root.btcBriefing = { render };
    w.MercadoBlocks = root;
})();
