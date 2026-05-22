(function () {
    const w = typeof window !== 'undefined' ? window : null;
    if (!w) return;
    const root = (w.MercadoBlocks && typeof w.MercadoBlocks === 'object') ? w.MercadoBlocks : {};

    function render({ el, deps } = {}) {
        if (!el) return;
        const d = deps || {};
        const getData = d.getData;
        const operationalInputs = d.operationalInputs;
        const computeCommoditiesPulseNow = d.computeCommoditiesPulseNow;
        const pillHtml = d.pillHtml;
        const formatPercent = d.formatPercent;
        const formatNumber = d.formatNumber;
        const escapeHtml = d.escapeHtml;
        const formatDateTime = d.formatDateTime;
        const getMostRecentPointWithPrice = d.getMostRecentPointWithPrice;
        const getLastPoint = d.getLastPoint;
        const getChangePct = d.getChangePct;
        const toneBadgeHtmlFromTone = d.toneBadgeHtmlFromTone;
        const pointPct = d.pointPct;

        const data = getData();
        const rawWeb = operationalInputs.webNews || null;
        const web = rawWeb && rawWeb.ok === true ? rawWeb : null;
        const cm = data ? computeCommoditiesPulseNow(data, web) : null;

        const badge = (tone, text, strength) => pillHtml('signal', tone, text, strength);
        const statusBadge = (tone, text, strength) => pillHtml('status', tone, text, strength);

        if (!data || !cm) {
            el.innerHTML = `<div style="padding:12px;border:1px solid rgba(255,255,255,.12);border-radius:14px;background:rgba(0,0,0,.18);opacity:.88;">Sem dados suficientes para montar o bloco Ouro/Petróleo agora.</div>`;
            return;
        }

        const fmtP = v => (typeof v === 'number' && Number.isFinite(v) ? formatPercent(v, 2) : '—');
        const fmt0 = v => (typeof v === 'number' && Number.isFinite(v) ? formatNumber(v, 0) : '—');
        const fmt2 = v => (typeof v === 'number' && Number.isFinite(v) ? formatNumber(v, 2) : '—');
        const srcLabel = s => (s === 'future' ? 'FUTURO' : s === 'proxy' ? 'PROXY' : 'N/D');
        const biasLabel = b => (b === 'buy' ? 'COMPRA' : b === 'sell' ? 'VENDA' : 'NEUTRO');

        const spotOf = s => {
            const pt = s ? (getMostRecentPointWithPrice(data, s) || getLastPoint(data, s)) : null;
            const spot = pt && typeof pt.price === 'number' && Number.isFinite(pt.price) ? pt.price : null;
            const t = pt && pt.t ? String(pt.t) : null;
            return { spot, t };
        };

        const corrLine = (items) => {
            const xs = Array.isArray(items) ? items.slice(0, 5) : [];
            if (!xs.length) return 'Correlações: —';
            return `Correlações: ${xs.map(it => `${it.label} ${formatNumber(it.corr, 2)}${it.n ? ` (n=${String(it.n)})` : ''}`).join(' • ')}`;
        };

        const planFor = (title, p, extras, note, execSym, src, micro) => {
            const scalp = micro && micro.scalp ? micro.scalp : { signal: 'neutral', strength: 0, label: 'n/d' };
            const scalpBias = scalp && scalp.signal ? String(scalp.signal) : 'neutral';
            const primaryBias = scalpBias !== 'neutral' ? scalpBias : (p && p.bias ? p.bias : 'neutral');
            const tone = primaryBias === 'buy' ? 'positive' : primaryBias === 'sell' ? 'negative' : 'neutral';
            const action = biasLabel(primaryBias);
            const macroTxt = p && p.bias ? biasLabel(p.bias) : '—';
            const w = p.groups ? p.groups.driver || { net: 0, count: 0 } : { net: 0, count: 0 };
            const c = p.groups ? p.groups.confirm || { net: 0, count: 0 } : { net: 0, count: 0 };
            const x = p.groups ? p.groups.context || { net: 0, count: 0 } : { net: 0, count: 0 };
            const microLine = (() => {
                if (!micro) return null;
                const r5 = typeof micro.ret5 === 'number' && Number.isFinite(micro.ret5) ? micro.ret5 : null;
                const r15 = typeof micro.ret15 === 'number' && Number.isFinite(micro.ret15) ? micro.ret15 : null;
                const r60 = typeof micro.ret60 === 'number' && Number.isFinite(micro.ret60) ? micro.ret60 : null;
                const range30 = micro.range30 && typeof micro.range30.pct === 'number' && Number.isFinite(micro.range30.pct) ? micro.range30.pct : null;
                const vol30 = micro.vol30 && typeof micro.vol30.sumAbsPct === 'number' && Number.isFinite(micro.vol30.sumAbsPct) ? micro.vol30.sumAbsPct : null;
                const bits = [
                    r5 !== null ? `5m ${formatPercent(r5, 2)}` : null,
                    r15 !== null ? `15m ${formatPercent(r15, 2)}` : null,
                    r60 !== null ? `60m ${formatPercent(r60, 2)}` : null,
                    range30 !== null ? `Range30 ${formatPercent(range30, 2)}` : null,
                    vol30 !== null ? `Vol30 ${formatPercent(vol30, 2)}` : null,
                ].filter(Boolean);
                if (!bits.length) return null;
                return `Micro: ${bits.join(' • ')}`;
            })();

            const scalpPlan = (() => {
                const rangePct = micro && micro.range30 && typeof micro.range30.pct === 'number' && Number.isFinite(micro.range30.pct) ? micro.range30.pct : null;
                const stopPct = rangePct !== null ? Math.max(0.10, rangePct * 0.25) : null;
                const alvoPct = rangePct !== null ? Math.max(0.15, rangePct * 0.5) : null;
                const risk = stopPct !== null ? `Stop ~${formatPercent(stopPct, 2)}` : 'Stop: curto';
                const reward = alvoPct !== null ? `Alvo ~${formatPercent(alvoPct, 2)}` : 'Alvo: curto';
                if (primaryBias === 'buy') return `Scalp: comprar com confirmação de dólar/juros (pullback leve ou rompimento) • ${risk} • ${reward}`;
                if (primaryBias === 'sell') return `Scalp: vender com confirmação de dólar/juros (repique ou rompimento) • ${risk} • ${reward}`;
                return 'Scalp: sem edge (5m×15m não alinhado) • espere alinhamento ou opere micro-range.';
            })();

            return `<div style="border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:12px;background:rgba(0,0,0,.18);">
            <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
                <div style="font-weight:900;letter-spacing:1px;">${escapeHtml(title)}</div>
                <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
                    ${badge(tone, `Scalp: ${action}`)}
                    ${badge('neutral', `Macro: ${macroTxt}`)}
                    ${badge('neutral', `Drivers net ${escapeHtml(fmt2(p.net))}`)}
                    ${statusBadge(src === 'future' ? 'ok' : src === 'proxy' ? 'info' : 'warn', `Execução: ${escapeHtml(execSym || '—')} (${srcLabel(src)})`, src === 'future' ? 0.70 : src === 'proxy' ? 0.75 : 0.85)}
                </div>
            </div>
            <div style="margin-top:8px;opacity:.86;font-size:12px;line-height:1.35;">${escapeHtml(extras)}</div>
            ${microLine ? `<div style="margin-top:6px;opacity:.84;font-size:12px;line-height:1.35;">${escapeHtml(microLine)}</div>` : ''}
            <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
                ${badge('neutral', `Camadas: Driver ${escapeHtml(fmt2(w.net))} (${String(w.count)}) • Conf ${escapeHtml(fmt2(c.net))} (${String(c.count)}) • Contexto ${escapeHtml(fmt2(x.net))} (${String(x.count)})`)}
            </div>
            <div style="margin-top:10px;opacity:.90;line-height:1.45;">
                <div style="font-weight:900;letter-spacing:.6px;opacity:.92;margin-bottom:6px;">Plano</div>
                <div style="opacity:.86;font-size:12px;">${escapeHtml(scalpPlan)}</div>
                ${note ? `<div style="margin-top:6px;opacity:.78;font-size:12px;">${escapeHtml(note)}</div>` : ''}
            </div>
        </div>`;
        };

        const mkMissing = (() => {
            const miss = cm.coverage && Array.isArray(cm.coverage.missing) ? cm.coverage.missing : [];
            const labels = cm.coverage && cm.coverage.keyLabels ? cm.coverage.keyLabels : {};
            const src = cm.source || {};
            const futMissing = ['gold', 'oil'].filter(k => src[k] !== 'future');
            if (!miss.length && !futMissing.length) return badge('positive', 'Drivers: completos');
            const txt = miss.slice(0, 6).map(k => labels[k] || k).join(' • ');
            const futTxt = futMissing.length ? `Sem futuro em: ${futMissing.map(k => (k === 'gold' ? 'Ouro' : 'Petróleo')).join(' • ')}` : '';
            const msg = [txt ? `Faltando (dados): ${txt}${miss.length > 6 ? `… +${miss.length - 6}` : ''}` : '', futTxt].filter(Boolean).join(' | ');
            return badge('neutral', msg || 'Cobertura parcial');
        })();
        const sugg = Array.isArray(cm.missingAssetsSuggestion) ? cm.missingAssetsSuggestion : [];
        const suggestLine = sugg.length ? `Sugestões p/ carteira (Investing): ${sugg.slice(0, 10).join(' • ')}${sugg.length > 10 ? `… +${sugg.length - 10}` : ''}` : '';

        const goldSpot = spotOf(cm.sym.gold);
        const brentSpot = spotOf(cm.sym.brent);
        const wtiSpot = spotOf(cm.sym.wti);
        const asOf = (goldSpot.t || brentSpot.t || wtiSpot.t) ? formatDateTime(String(goldSpot.t || brentSpot.t || wtiSpot.t)) : '—';

        const goldExtras = `${cm.sym.gold || '—'} • ${goldSpot.spot !== null ? fmt0(goldSpot.spot) : '—'} • ${fmtP(cm.market.goldPct)} • ${corrLine(cm.corr && cm.corr.gold ? cm.corr.gold.items : [])}`;
        const oilBench = (() => {
            const a = cm.sym.brent ? `Brent ${fmtP(cm.market.brentPct)}` : null;
            const b = cm.sym.wti ? `WTI ${fmtP(cm.market.wtiPct)}` : null;
            const parts = [a, b].filter(Boolean);
            return parts.length ? parts.join(' • ') : '—';
        })();
        const oilSpotTxt = (() => {
            const parts = [];
            if (cm.sym.brent) parts.push(`${cm.sym.brent} ${brentSpot.spot !== null ? fmt0(brentSpot.spot) : '—'}`);
            if (cm.sym.wti) parts.push(`${cm.sym.wti} ${wtiSpot.spot !== null ? fmt0(wtiSpot.spot) : '—'}`);
            return parts.length ? parts.join(' • ') : '—';
        })();
        const oilExtras = `${oilSpotTxt} • ${oilBench} • ${corrLine(cm.corr && cm.corr.oil ? cm.corr.oil.items : [])}`;

        const extraCardsHtml = (() => {
            const cards = [];
            const mkCard = (title, key, note) => {
                const p = cm.pulse && cm.pulse[key] ? cm.pulse[key] : null;
                const execSym = cm.execution ? cm.execution[key] : null;
                const src = cm.source ? cm.source[key] : null;
                const micro = cm.micro ? cm.micro[key] : null;
                const sym = cm.sym ? cm.sym[key] : null;
                if (!p || !execSym || !sym) return '';
                const hasRows = p && Array.isArray(p.rows) ? p.rows.length >= 3 : false;
                if (!hasRows) return '';
                const spot = spotOf(sym);
                const pct = getChangePct(data, sym);
                const extras = `${sym} • ${spot.spot !== null ? fmt0(spot.spot) : '—'} • ${fmtP(pct)} • ${corrLine(cm.corr && cm.corr[key] ? cm.corr[key].items : [])}`;
                return planFor(title, p, extras, note, execSym, src, micro);
            };
            const gas = mkCard('Gás Natural', 'gas', 'Leitura típica: gás responde a clima/estoques/LNG e pode amplificar movimentos de energia.');
            if (gas) cards.push(gas);
            const ttf = mkCard('Gás TTF (Europa)', 'ttfGas', 'Leitura típica: TTF reage a clima/armazenagem/LNG e pode divergir do Henry Hub.');
            if (ttf) cards.push(ttf);
            const silver = mkCard('Prata', 'silver', 'Leitura típica: prata mistura metal monetário (ouro) e ciclo (industrial).');
            if (silver) cards.push(silver);
            const copper = mkCard('Cobre', 'copper', 'Leitura típica: cobre tende a reagir a ciclo/China e dólar, com correlação com risco em certos regimes.');
            if (copper) cards.push(copper);
            const nickel = mkCard('Níquel', 'nickel', 'Leitura típica: níquel tende a responder a ciclo industrial e cadeias (energia/baterias).');
            if (nickel) cards.push(nickel);
            const zinc = mkCard('Zinco', 'zinc', 'Leitura típica: zinco é metal industrial e costuma acompanhar ciclo/atividade.');
            if (zinc) cards.push(zinc);
            if (!cards.length) return '';
            return `<div style="margin-top:12px;display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:12px;">
            ${cards.join('')}
        </div>`;
        })();

        const news = Array.isArray(cm.news) ? cm.news : [];
        const newsHtml = (() => {
            if (!news.length) return `<div style="opacity:.78;font-size:12px;">• —</div>`;
            return news
                .slice(0, 6)
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

        const nScore = cm.newsMeta && typeof cm.newsMeta.score === 'number' && Number.isFinite(cm.newsMeta.score) ? cm.newsMeta.score : 0;
        const nTone = nScore > 0.15 ? 'positive' : nScore < -0.15 ? 'negative' : 'neutral';

        const scalperPanel = (() => {
            const sign = (v, th = 0.10) => (typeof v === 'number' && Number.isFinite(v) ? (v > th ? +1 : v < -th ? -1 : 0) : 0);
            const signBp10 = (v, th = 0.35) => (typeof v === 'number' && Number.isFinite(v) ? (v > th ? +1 : v < -th ? -1 : 0) : 0);
            const ok = (a, b, inverse = false) => {
                const sa = sign(a);
                const sb = sign(b);
                if (!sa || !sb) return null;
                return inverse ? (sa === -sb) : (sa === sb);
            };
            const okBp10 = (aPct, bBp10, inverse = false) => {
                const sa = sign(aPct);
                const sb = signBp10(bBp10);
                if (!sa || !sb) return null;
                return inverse ? (sa === -sb) : (sa === sb);
            };
            const gold = cm.market ? cm.market.goldPct : null;
            const oil = (typeof cm.market?.brentPct === 'number' ? cm.market.brentPct : cm.market?.wtiPct) ?? null;
            const dxy = cm.sym && cm.sym.dxy ? getChangePct(data, cm.sym.dxy) : null;
            const us10yBp10 = (() => {
                const s = cm.sym && cm.sym.us10y ? cm.sym.us10y : null;
                if (!s) return null;
                const pt = getMostRecentPointWithPrice(data, s) || getLastPoint(data, s);
                const chg = pt && typeof pt.change === 'number' && Number.isFinite(pt.change) ? pt.change : null;
                if (!(typeof chg === 'number' && Number.isFinite(chg))) return null;
                return (chg * 100) / 10;
            })();
            const xle = cm.sym && cm.sym.xle ? getChangePct(data, cm.sym.xle) : null;
            const usdcad = cm.sym && cm.sym.usdcad ? getChangePct(data, cm.sym.usdcad) : null;
            const audusd = cm.sym && cm.sym.audusd ? getChangePct(data, cm.sym.audusd) : null;
            const usdzar = cm.sym && cm.sym.usdzar ? getChangePct(data, cm.sym.usdzar) : null;
            const usdcnh = cm.sym && cm.sym.usdcnh ? getChangePct(data, cm.sym.usdcnh) : null;
            const nem = cm.sym && cm.sym.minerNem ? getChangePct(data, cm.sym.minerNem) : null;
            const au = cm.sym && cm.sym.minerAu ? getChangePct(data, cm.sym.minerAu) : null;
            const fnv = cm.sym && cm.sym.minerFnv ? getChangePct(data, cm.sym.minerFnv) : null;
            const gdx = cm.sym && cm.sym.gdx ? getChangePct(data, cm.sym.gdx) : null;
            const miners = (() => {
                const xs = [gdx, nem, au, fnv].filter(v => typeof v === 'number' && Number.isFinite(v));
                if (!xs.length) return null;
                return xs.reduce((a, b) => a + b, 0) / xs.length;
            })();
            const copper = cm.sym && cm.sym.copper ? getChangePct(data, cm.sym.copper) : null;
            const spx = cm.sym && cm.sym.spx ? getChangePct(data, cm.sym.spx) : null;
            const hyg = cm.sym && cm.sym.hyg ? getChangePct(data, cm.sym.hyg) : null;
            const vix = cm.sym && cm.sym.vix ? getChangePct(data, cm.sym.vix) : null;

            const pGoldDxy = ok(gold, dxy, true);
            const pGoldY = okBp10(gold, us10yBp10, true);
            const pGoldAud = ok(gold, audusd, false);
            const pGoldZar = ok(gold, usdzar, true);
            const pGoldMiners = ok(gold, miners, false);
            const pOilXle = ok(oil, xle, false);
            const pOilCad = ok(oil, usdcad, true);

            const mk = (label, v) => `<span style="font-family:'Share Tech Mono',monospace;font-weight:900;">${escapeHtml(label)} ${escapeHtml(typeof v === 'number' && Number.isFinite(v) ? formatPercent(v, 2) : '—')}</span>`;
            const mkBp = (label, v) => {
                const txt = typeof v === 'number' && Number.isFinite(v) ? `${(v * 10) > 0 ? '+' : ''}${formatNumber(v * 10, 1)}bp` : '—';
                return `<span style="font-family:'Share Tech Mono',monospace;font-weight:900;">${escapeHtml(label)} ${escapeHtml(txt)}</span>`;
            };
            const parityBadge = (name, v) => badge(v === true ? 'positive' : v === false ? 'negative' : 'neutral', `${name}: ${v === true ? 'OK' : v === false ? 'DIVERGE' : '—'}`);
            const risk = (() => {
                const sHyg = sign(hyg, 0.06);
                const sVix = sign(vix, 0.20);
                const sSpx = sign(spx, 0.08);
                const score = (sSpx > 0 ? 1 : sSpx < 0 ? -1 : 0) + (sHyg > 0 ? 1 : sHyg < 0 ? -1 : 0) + (sVix < 0 ? 1 : sVix > 0 ? -1 : 0);
                if (score >= 2) return { label: 'RISK ON', tone: 'positive' };
                if (score <= -2) return { label: 'RISK OFF', tone: 'negative' };
                return { label: 'MISTO', tone: 'neutral' };
            })();

            return `
            <div style="margin-top:12px;border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:12px;background:rgba(0,0,0,.18);">
                <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
                    <div style="font-weight:900;letter-spacing:.8px;opacity:.95;">⚡ Scalper — Paridades & Fluxo (Ouro/Petróleo)</div>
                    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
                        ${badge(risk.tone, risk.label)}
                        ${parityBadge('Ouro×DXY (inv)', pGoldDxy)}
                        ${parityBadge('Ouro×US10Y (inv)', pGoldY)}
                        ${parityBadge('Ouro×AUD/USD', pGoldAud)}
                        ${parityBadge('Ouro×USD/ZAR (inv)', pGoldZar)}
                        ${parityBadge('Ouro×Miners', pGoldMiners)}
                        ${parityBadge('Petróleo×XLE', pOilXle)}
                        ${parityBadge('Petróleo×USD/CAD (inv)', pOilCad)}
                    </div>
                </div>
                <div style="margin-top:8px;opacity:.86;font-size:12px;line-height:1.35;">
                    ${mk('DXY', dxy)} • ${mkBp('US10Y Δ', us10yBp10)} • ${mk('AUD/USD', audusd)} • ${mk('USD/ZAR', usdzar)} • ${mk('USD/CNH', usdcnh)} • ${mk('Miners', miners)} • ${mk('HYG', hyg)} • ${mk('VIX', vix)} • ${mk('Cobre', copper)}
                </div>
                <div style="margin-top:8px;opacity:.78;font-size:12px;line-height:1.35;">
                    Regra de scalp: se paridade-chave divergir, reduzir agressividade e operar apenas com confirmação (rompimento + pullback curto).
                </div>
            </div>
        `;
        })();

        el.innerHTML = `
        <div style="padding:12px;border:1px solid rgba(255,255,255,.12);border-radius:14px;background:rgba(0,0,0,.18);">
            <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
                <div style="font-weight:900;letter-spacing:1px;">Commodities — Roteiro Operacional</div>
                <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
                    ${mkMissing}
                    ${badge(nTone, `News/Geo score ${escapeHtml(fmt2(nScore))}`)}
                    ${badge('neutral', `asOf ${escapeHtml(asOf)}`)}
                </div>
            </div>
            <div style="margin-top:10px;display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:12px;">
                ${planFor('Ouro', cm.pulse.gold, goldExtras, 'Leitura típica: ouro responde a dólar/juros reais e busca por proteção.', cm.execution ? cm.execution.gold : null, cm.source ? cm.source.gold : null, cm.micro ? cm.micro.gold : null)}
                ${planFor('Petróleo', cm.pulse.oil, oilExtras, 'Leitura típica: petróleo responde a risco global, dólar e choque de oferta (geo/OPEC).', cm.execution ? cm.execution.oil : null, cm.source ? cm.source.oil : null, cm.micro ? cm.micro.oil : null)}
            </div>
            ${extraCardsHtml}
        </div>
        ${scalperPanel}
        <div style="margin-top:12px;display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:12px;">
            <div style="border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:12px;background:rgba(0,0,0,.18);">
                <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:8px;">
                    <div style="font-weight:900;letter-spacing:.6px;opacity:.92;">Notícias (macro/geopolítica)</div>
                    <div style="opacity:.72;font-size:12px;">matched ${escapeHtml(String(cm.newsMeta && typeof cm.newsMeta.matched === 'number' ? cm.newsMeta.matched : 0))}</div>
                </div>
                <div style="opacity:.84;font-size:12px;line-height:1.35;">${newsHtml}</div>
            </div>
        </div>
        ${suggestLine ? `<div style="margin-top:10px;opacity:.82;font-size:12px;line-height:1.35;">${escapeHtml(suggestLine)}</div>` : ''}
    `;
    }

    root.commoditiesBriefing = { render };
    w.MercadoBlocks = root;
})();
