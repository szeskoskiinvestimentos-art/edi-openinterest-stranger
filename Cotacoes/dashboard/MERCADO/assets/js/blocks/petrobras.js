(function () {
    const w = typeof window !== 'undefined' ? window : null;
    if (!w) return;
    const root = (w.MercadoBlocks && typeof w.MercadoBlocks === 'object') ? w.MercadoBlocks : {};

    function render({ data, deps } = {}) {
        const payload = w.PETROBRAS_MODULE_DATA;
        const gaugeEl = document.getElementById('petrobrasGauge');
        const tableEl = document.getElementById('petrobrasTable');
        const newsEl = document.getElementById('petrobrasNews');
        const missingEl = document.getElementById('petrobrasMissing');
        if (!gaugeEl || !tableEl || !newsEl || !missingEl) return;

        if (!payload || payload.ok !== true) {
            gaugeEl.innerHTML = '<div style="opacity:.85;">Sem dados do módulo Petrobras.</div>';
            tableEl.innerHTML = '';
            newsEl.innerHTML = '';
            missingEl.innerHTML = '';
            return;
        }

        const dc = w.DecisionCore ? w.DecisionCore : null;
        const dcDeps = { findAliasSymbolBest: deps.findAliasSymbolBest, findAliasSymbol: deps.findAliasSymbol, findAssetSymbol: deps.findAssetSymbol, getLastPoint: deps.getLastPoint };
        const assets = data && Array.isArray(data.assets) ? data.assets : [];
        const mostRecentMs = (symbol) => {
            if (!symbol) return -Infinity;
            const last = (typeof deps.getMostRecentPointWithPrice === 'function' ? deps.getMostRecentPointWithPrice(data, symbol) : null) || deps.getLastPoint(data, symbol);
            const t = last && last.t ? Date.parse(String(last.t)) : NaN;
            return Number.isFinite(t) ? t : -Infinity;
        };
        const pickBestByMatchers = (matchers, { limit = 14 } = {}) => {
            const out = [];
            const seen = new Set();
            for (const re of (matchers || [])) {
                if (!(re instanceof RegExp)) continue;
                for (const a of assets) {
                    const sym = a && a.symbol ? String(a.symbol) : '';
                    const name = a && a.name ? String(a.name) : '';
                    if (!sym || seen.has(sym)) continue;
                    if (re.test(sym) || re.test(name)) {
                        out.push(sym);
                        seen.add(sym);
                        if (out.length >= limit) break;
                    }
                }
            }
            out.sort((a, b) => mostRecentMs(b) - mostRecentMs(a));
            return out.length ? out[0] : null;
        };
        const aliasSym = (k) => deps.findAliasSymbolBest(data, k) || deps.findAliasSymbol(data, k);

        const score = payload.score && typeof payload.score.value === 'number' ? payload.score.value : 0;
        const bias = payload.score && payload.score.bias ? String(payload.score.bias) : 'NEUTRO';
        const confidence = payload.score && typeof payload.score.confidence === 'number' ? payload.score.confidence : 0;
        const phaseLabel = payload.phase && payload.phase.nowLabel ? String(payload.phase.nowLabel) : '';
        const metrics = payload.metrics && typeof payload.metrics === 'object' ? payload.metrics : null;
        const pctPos = Math.max(0, Math.min(1, (score + 10) / 20));
        const neutralCutAbs = 1.6;
        const leftPct = `${String(pctPos * 100)}%`;
        const cutNegPct = `${String(Math.max(0, Math.min(1, (-neutralCutAbs + 10) / 20)) * 100)}%`;
        const cutPosPct = `${String(Math.max(0, Math.min(1, (neutralCutAbs + 10) / 20)) * 100)}%`;
        const biasTone = bias === 'COMPRA' ? 'positive' : bias === 'VENDA' ? 'negative' : 'neutral';
        const biasBadge = deps.toneBadgeHtmlFromTone(biasTone, Math.abs(score), `${bias} • ${deps.formatNumber(score, 2)}`, { maxAbs: 10 });
        const confBadge = deps.toneBadgeHtmlFromTone(confidence >= 0.75 ? 'positive' : confidence >= 0.45 ? 'neutral' : 'negative', Math.abs(confidence * 10), `Confiança ${deps.formatNumber(confidence * 100, 0)}%`, { maxAbs: 10 });
        const fmt2 = v => (typeof v === 'number' && Number.isFinite(v) ? deps.formatNumber(v, 2) : '—');
        const fmt1 = v => (typeof v === 'number' && Number.isFinite(v) ? deps.formatNumber(v, 1) : '—');
        const breadthLine = metrics && metrics.breadth
            ? `Largura: ${String(metrics.breadth.pos || 0)}↑ • ${String(metrics.breadth.neg || 0)}↓ • ${String(metrics.breadth.zero || 0)}≈`
            : '';
        const contribLine = metrics && metrics.contribution
            ? `Contrib: +${fmt2(metrics.contribution.posSum)} / ${fmt2(metrics.contribution.negSum)} • net ${fmt2(metrics.contribution.net)}`
            : '';
        const pnlLine = metrics && metrics.pnlLike
            ? `PnL (sintético): +${fmt1(metrics.pnlLike.posSum)} / ${fmt1(metrics.pnlLike.negSum)} • net ${fmt1(metrics.pnlLike.net)}`
            : '';
        const corrLine = (() => {
            const fc = metrics && metrics.flowCorr ? metrics.flowCorr : null;
            const items = fc && Array.isArray(fc.items) ? fc.items : [];
            const parts = items
                .filter(x => x && typeof x.corr === 'number' && Number.isFinite(x.corr) && typeof x.n === 'number' && Number.isFinite(x.n) && x.n >= 20)
                .slice(0, 4)
                .map(x => `${String(x.label || 'Corr')} ${fmt2(x.corr)} (n=${String(Math.floor(x.n))})`);
            return parts.length ? `Corr (fluxo): ${parts.join(' • ')}` : '';
        })();

        const stalenessLine = (() => {
            if (!dc || typeof dc.symbolAgeMs !== 'function') return '';
            const used = Array.isArray(payload.rows) ? payload.rows : [];
            const seen = new Set();
            const symbols = used
                .map(r => (r && r.symbol ? String(r.symbol) : ''))
                .filter(Boolean)
                .filter(s => {
                    const k = deps.symbolKey(s) || s;
                    if (seen.has(k)) return false;
                    seen.add(k);
                    return true;
                })
                .slice(0, 18);
            if (!symbols.length) return '';
            const staleMs = 4 * 60 * 60 * 1000;
            const ages = symbols.map(sym => dc.symbolAgeMs(dcDeps, data, sym)).filter(v => typeof v === 'number' && Number.isFinite(v));
            if (!ages.length) return '';
            const staleCount = ages.filter(ms => ms > staleMs).length;
            if (!staleCount) return '';
            return `Freshness: ${String(symbols.length - staleCount)}/${String(symbols.length)} (stale>${String(Math.round(staleMs / 3600000))}h)`;
        })();

        gaugeEl.innerHTML = `
        <div style="border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:12px;background:rgba(0,0,0,.18);">
            <div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap;">
                <div style="font-weight:900;letter-spacing:1px;opacity:.95;">Velocímetro Petrobras</div>
                <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
                    ${biasBadge}
                    ${confBadge}
                </div>
            </div>
            <div style="margin-top:8px;opacity:.85;">${deps.escapeHtml(phaseLabel)}</div>
            ${(breadthLine || contribLine || pnlLine || corrLine || stalenessLine) ? `<div style="margin-top:8px;opacity:.86;font-size:12px;line-height:1.35;">
                ${deps.escapeHtml([breadthLine, contribLine, pnlLine, corrLine, stalenessLine].filter(Boolean).join(' • '))}
            </div>` : ''}
            <div style="margin-top:8px;opacity:.82;font-size:12px;line-height:1.35;">
                ${deps.escapeHtml(`Escala: -10 a +10 • Zona neutra: -${deps.formatNumber(neutralCutAbs, 1)} a +${deps.formatNumber(neutralCutAbs, 1)} • Posição: ${deps.formatNumber(pctPos * 100, 0)}%`)}
            </div>
            <div style="margin-top:14px;position:relative;padding:18px 4px 8px 4px;">
                <div style="height:14px;border-radius:999px;background:linear-gradient(90deg, rgba(255,60,80,.85), rgba(255,255,255,.18) 50%, rgba(0,255,160,.85));border:1px solid rgba(255,255,255,.10);position:relative;">
                    <div style="position:absolute;left:${deps.escapeHtml(cutNegPct)};top:-1px;transform:translateX(-50%);width:2px;height:16px;background:rgba(255,255,255,.45);"></div>
                    <div style="position:absolute;left:${deps.escapeHtml(cutPosPct)};top:-1px;transform:translateX(-50%);width:2px;height:16px;background:rgba(255,255,255,.45);"></div>
                    <div style="position:absolute;left:${deps.escapeHtml(leftPct)};top:-2px;transform:translateX(-50%);width:2px;height:18px;background:rgba(0,243,255,.90);box-shadow:0 0 10px rgba(0,243,255,.20);border-radius:2px;"></div>
                </div>
                <div style="position:absolute;left:${deps.escapeHtml(leftPct)};top:30px;transform:translateX(-50%);width:0;height:0;border-left:8px solid transparent;border-right:8px solid transparent;border-top:10px solid rgba(0,243,255,.95);filter:drop-shadow(0 0 6px rgba(0,243,255,.25));"></div>
                <div style="display:flex;justify-content:space-between;margin-top:10px;font-family:'Share Tech Mono',monospace;letter-spacing:1px;opacity:.85;">
                    <span>-10 (VENDA)</span><span>0 (NEUTRO)</span><span>+10 (COMPRA)</span>
                </div>
            </div>
        </div>
    `;

        const missing = Array.isArray(payload.missingCorrelated) ? payload.missingCorrelated : [];
        if (!missing.length) {
            missingEl.innerHTML = '';
        } else {
            const items = missing
                .slice(0, 16)
                .map(x => {
                    const label = x && x.label ? String(x.label) : 'Ativo';
                    const patterns = x && Array.isArray(x.patterns) ? x.patterns.map(p => String(p)).filter(Boolean).slice(0, 8) : [];
                    return `<div style="padding:10px 12px;border:1px solid rgba(255,255,255,.10);border-radius:12px;background:rgba(0,0,0,.14);">
                    <div style="font-weight:900;letter-spacing:.8px;opacity:.92;">${deps.escapeHtml(label)}</div>
                    <div style="margin-top:6px;opacity:.85;font-family:'Share Tech Mono',monospace;word-break:break-word;">${deps.escapeHtml(patterns.join(', '))}</div>
                </div>`;
                })
                .join('');
            missingEl.innerHTML = `
            <div style="border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:12px;background:rgba(0,0,0,.18);">
                <div style="font-weight:900;letter-spacing:1px;opacity:.95;margin-bottom:10px;">Ativos correlacionados faltando (para adicionar no Investing)</div>
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;">${items}</div>
            </div>
        `;
        }

        const topNews = payload.news && Array.isArray(payload.news.top) ? payload.news.top : [];
        if (!topNews.length) {
            newsEl.innerHTML = '<div style="opacity:.85;">Sem destaques de notícias para Petrobras agora.</div>';
        } else {
            const li = topNews
                .map(n => {
                    const title = n && n.title ? String(n.title) : '';
                    const url = n && n.url ? String(n.url) : '';
                    const safeUrl = url && /^https?:\/\//i.test(url) ? url : '';
                    const a = safeUrl ? `<a href="${deps.escapeHtml(safeUrl)}" target="_blank" rel="noreferrer" style="color:rgba(0,243,255,.92);text-decoration:none;">${deps.escapeHtml(title || safeUrl)}</a>` : deps.escapeHtml(title || '—');
                    return `<li style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,.06);">${a}</li>`;
                })
                .join('');
            newsEl.innerHTML = `
            <div style="border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:12px;background:rgba(0,0,0,.18);">
                <div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap;">
                    <div style="font-weight:900;letter-spacing:1px;opacity:.95;">Notícias (pré-mercado / drivers)</div>
                    <div style="opacity:.85;font-family:'Share Tech Mono',monospace;">match: ${deps.escapeHtml(String(payload.news.matched || 0))}</div>
                </div>
                <ul style="margin:10px 0 0 0;padding:0 0 0 18px;">${li}</ul>
            </div>
        `;
        }

        const rows = Array.isArray(payload.rows) ? payload.rows : [];
        const phaseKey = payload.phase && String(payload.phase.nowLabel || '').toLowerCase().includes('pré') ? 'pre' : 'regular';
        const used = rows.filter(r => r && (r.phase === 'any' || r.phase === phaseKey));
        const operableKeySet = { petr4: true, petr3: true };
        const operables = used.filter(r => r && operableKeySet[String(r.key || '')]);
        const drivers = used.filter(r => r && !operableKeySet[String(r.key || '')]);

        const scalperHtml = (() => {
            const fmtP = (v) => (typeof v === 'number' && Number.isFinite(v) ? deps.formatPercent(v, 2) : '—');
            const badge = (tone, text) => deps.toneBadgeHtmlFromTone(tone, 0.5, text, { maxAbs: 1 });

            const pickSym = k => {
                const row = used.find(x => x && String(x.key || '') === k);
                return row && row.symbol ? String(row.symbol) : '';
            };
            const symPetr = (() => {
                const cands = [pickSym('petr4'), pickSym('petr3')].filter(Boolean);
                if (!cands.length) return '';
                const sorted = cands.slice().sort((a, b) => mostRecentMs(b) - mostRecentMs(a));
                return sorted[0] || '';
            })();
            const symBrent = (drivers.find(x => x && String(x.key || '') === 'brent') || {}).symbol || '';
            const symUsdBrl = aliasSym('USD_BRL') || pickBestByMatchers([/^USD\/BRL\b/i]) || deps.findAssetSymbol(data, /^USD\/BRL\b/i) || '';
            const symIbov = aliasSym('IBOV') || pickBestByMatchers([/^\.BVSP$/i, /\bIbovespa\b/i, /^BOVA11\.SA$/i, /^EWZ$/i]) || deps.findAssetSymbol(data, /^\.BVSP$/i) || '';
            const symVxbr = pickBestByMatchers([/^VXBR$/i, /\bVol\b.*\bBrasil\b/i]) || '';
            const symVix = deps.findAliasSymbolBest(data, 'VIX') || deps.findAliasSymbolBest(data, 'VIX9D') || deps.findAliasSymbolBest(data, 'VIX30') || pickBestByMatchers([/^\.?VIX(9D)?$/i, /^VIX$/i]) || '';
            const symVale = pickBestByMatchers([/^VALE3\.SA$/i, /^VALE\.K$/i, /^VALE$/i]) || deps.findAssetSymbol(data, /^VALE3\.SA$/i) || '';
            const symBanks = pickBestByMatchers([/^ITUB4\.SA$/i, /^BBDC4\.SA$/i, /^ITUB\.K$/i, /^BBD\b/i]) || deps.findAssetSymbol(data, /^ITUB4\.SA$/i) || '';

            const micro = (() => {
                const s = String(symPetr || '');
                if (!s) return null;
                const series = data && data.series && Array.isArray(data.series[s]) ? data.series[s] : [];
                if (!series.length) return null;
                const last = series[series.length - 1];
                const lastPrice = last && typeof last.price === 'number' && Number.isFinite(last.price) ? last.price : null;
                const lastMs = last && last.t ? Date.parse(last.t) : NaN;
                if (lastPrice === null || !Number.isFinite(lastMs)) return null;
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
                const th5 = 0.10;
                const th15 = 0.18;
                const s5 = typeof r5 === 'number' && Number.isFinite(r5) ? r5 : null;
                const s15 = typeof r15 === 'number' && Number.isFinite(r15) ? r15 : null;
                const bias = (s5 !== null && s15 !== null && s5 >= th5 && s15 >= th15) ? 'buy' : (s5 !== null && s15 !== null && s5 <= -th5 && s15 <= -th15) ? 'sell' : 'neutral';
                return { r5, r15, range30, bias };
            })();
            if (!micro) return '';

            const sign = (v, th = 0.10) => (typeof v === 'number' && Number.isFinite(v) ? (v > th ? +1 : v < -th ? -1 : 0) : 0);
            const ok = (a, b, inverse = false) => {
                const sa = sign(a);
                const sb = sign(b);
                if (!sa || !sb) return null;
                return inverse ? (sa === -sb) : (sa === sb);
            };
            const pPetr = symPetr ? deps.getChangePct(data, symPetr) : null;
            const pBrent = symBrent ? deps.getChangePct(data, symBrent) : null;
            const pUsd = symUsdBrl ? deps.getChangePct(data, symUsdBrl) : null;
            const pIbov = symIbov ? deps.getChangePct(data, symIbov) : null;
            const pVix = symVix ? deps.getChangePct(data, symVix) : null;
            const pVxbr = symVxbr ? deps.getChangePct(data, symVxbr) : null;
            const pVale = symVale ? deps.getChangePct(data, symVale) : null;
            const pBanks = symBanks ? deps.getChangePct(data, symBanks) : null;

            const parOil = ok(pPetr, pBrent, false);
            const parIbov = ok(pPetr, pIbov, false);

            const foreignFlowLocal = w.FOREIGN_FLOW_DATA || null;
            const flowScore = foreignFlowLocal && foreignFlowLocal.signal && typeof foreignFlowLocal.signal.score === 'number' && Number.isFinite(foreignFlowLocal.signal.score) ? foreignFlowLocal.signal.score : null;
            const flowTone = typeof flowScore === 'number' ? (flowScore > 0.25 ? 'positive' : flowScore < -0.25 ? 'negative' : 'neutral') : 'neutral';
            const flowTxt = typeof flowScore === 'number' ? `Fluxo ${deps.formatNumber(flowScore, 2)}` : 'Fluxo —';

            const parityBadge = (name, v) => badge(v === true ? 'positive' : v === false ? 'negative' : 'neutral', `${name}: ${v === true ? 'OK' : v === false ? 'DIVERGE' : '—'}`);
            const tone = micro.bias === 'buy' ? 'positive' : micro.bias === 'sell' ? 'negative' : 'neutral';
            const action = micro.bias === 'buy' ? 'COMPRA' : micro.bias === 'sell' ? 'VENDA' : 'NEUTRO';
            const stop = micro.range30 && typeof micro.range30.pct === 'number' ? Math.max(0.25, micro.range30.pct * 0.25) : null;
            const alvo = micro.range30 && typeof micro.range30.pct === 'number' ? Math.max(0.40, micro.range30.pct * 0.5) : null;
            const plan = micro.bias === 'buy'
                ? `Comprar (scalp) • Stop ~${stop !== null ? deps.formatPercent(stop, 2) : '—'} • Alvo ~${alvo !== null ? deps.formatPercent(alvo, 2) : '—'}`
                : micro.bias === 'sell'
                    ? `Vender (scalp) • Stop ~${stop !== null ? deps.formatPercent(stop, 2) : '—'} • Alvo ~${alvo !== null ? deps.formatPercent(alvo, 2) : '—'}`
                    : 'Neutro (scalp) • aguarde alinhamento 5m×15m e paridades.';

            return `
            <div style="margin-top:12px;border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:12px;background:rgba(0,0,0,.18);">
                <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
                    <div style="font-weight:900;letter-spacing:.8px;opacity:.95;">⚡ Scalper — Petrobras</div>
                    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
                        ${badge(tone, `Scalp: ${action}`)}
                        ${badge(flowTone, flowTxt)}
                        ${parityBadge('PETR×Brent', parOil)}
                        ${parityBadge('PETR×IBOV', parIbov)}
                    </div>
                </div>
                <div style="margin-top:8px;opacity:.86;font-size:12px;line-height:1.35;">
                    Micro: 5m ${deps.escapeHtml(typeof micro.r5 === 'number' ? deps.formatPercent(micro.r5, 2) : '—')} • 15m ${deps.escapeHtml(typeof micro.r15 === 'number' ? deps.formatPercent(micro.r15, 2) : '—')} • Range30 ${deps.escapeHtml(micro.range30 ? deps.formatPercent(micro.range30.pct, 2) : '—')}
                </div>
                <div style="margin-top:8px;opacity:.84;font-size:12px;line-height:1.35;">
                    Paridades/risco: Brent ${deps.escapeHtml(fmtP(pBrent))} • USD/BRL ${deps.escapeHtml(fmtP(pUsd))} • VIX ${deps.escapeHtml(fmtP(pVix))}${(typeof pVxbr === 'number' ? ` • VXBR ${deps.escapeHtml(fmtP(pVxbr))}` : '')}
                </div>
                <div style="margin-top:8px;opacity:.84;font-size:12px;line-height:1.35;">
                    Empresas/setores: VALE ${deps.escapeHtml(fmtP(pVale))} • Bancos ${deps.escapeHtml(fmtP(pBanks))}
                </div>
                <div style="margin-top:10px;opacity:.86;font-size:12px;line-height:1.35;">${deps.escapeHtml(plan)}</div>
            </div>
        `;
        })();
        if (scalperHtml) gaugeEl.innerHTML += scalperHtml;

        const header = `
        <tr>
            <th style="text-align:left;padding:10px;border-bottom:1px solid rgba(255,255,255,.15);">Fator</th>
            <th style="text-align:left;padding:10px;border-bottom:1px solid rgba(255,255,255,.15);min-width:120px;">Símbolo</th>
            <th style="text-align:right;padding:10px;border-bottom:1px solid rgba(255,255,255,.15);min-width:120px;">Valor</th>
            <th style="text-align:right;padding:10px;border-bottom:1px solid rgba(255,255,255,.15);min-width:90px;">Peso</th>
            <th style="text-align:right;padding:10px;border-bottom:1px solid rgba(255,255,255,.15);min-width:90px;">Cap</th>
            <th style="text-align:right;padding:10px;border-bottom:1px solid rgba(255,255,255,.15);min-width:120px;">Contrib</th>
            <th style="text-align:right;padding:10px;border-bottom:1px solid rgba(255,255,255,.15);min-width:160px;">Atualização</th>
            <th style="text-align:left;padding:10px;border-bottom:1px solid rgba(255,255,255,.15);">Nota</th>
        </tr>
    `;

        const body = drivers
            .map(r => {
                const sym = r && r.symbol ? String(r.symbol) : '';
                const clickable = sym && data && data.series && Array.isArray(data.series[sym]) && data.series[sym].length;
                const v =
                    r && r.unit === '%'
                        ? deps.formatPercent(typeof r.value === 'number' ? r.value : null, 2)
                        : deps.formatNumber(typeof r.value === 'number' ? r.value : null, 2);
                const contrib = deps.formatNumber(typeof r.contribution === 'number' ? r.contribution : null, 3);
                const weight = deps.formatNumber(typeof r.weight === 'number' ? r.weight : null, 2);
                const cap = deps.formatNumber(typeof r.capAbs === 'number' ? r.capAbs : null, 2);
                const asOf = r && r.asOf ? deps.formatDateTime(r.asOf) : '';
                const tone = typeof r.contribution === 'number' ? deps.toneFromValue(r.contribution, { maxAbs: Math.max(0.01, Math.abs(r.weight || 1)) }) : { tone: 'tone--neu', a: 0.2 };
                const rowStyle = clickable ? 'cursor:pointer;' : '';
                return `
                <tr data-petro-row="1" data-symbol="${deps.escapeHtml(sym)}" style="${rowStyle}">
                    <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.06);font-weight:900;letter-spacing:.4px;">${deps.escapeHtml(String(r.label || ''))}</td>
                    <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.06);font-family:'Share Tech Mono',monospace;opacity:.9;">${deps.escapeHtml(sym || '—')}</td>
                    <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.06);text-align:right;font-family:'Share Tech Mono',monospace;font-weight:900;">${deps.escapeHtml(v)}</td>
                    <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.06);text-align:right;font-family:'Share Tech Mono',monospace;opacity:.9;">${deps.escapeHtml(weight)}</td>
                    <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.06);text-align:right;font-family:'Share Tech Mono',monospace;opacity:.9;">${deps.escapeHtml(cap)}</td>
                    <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.06);text-align:right;font-family:'Share Tech Mono',monospace;font-weight:900;">
                        <span class="tone ${deps.escapeHtml(tone.tone)}" style="--tone-a:${String(tone.a)};">${deps.escapeHtml(contrib)}</span>
                    </td>
                    <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.06);text-align:right;font-family:'Share Tech Mono',monospace;opacity:.85;">${deps.escapeHtml(asOf || '')}</td>
                    <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.06);opacity:.85;">${deps.escapeHtml(String(r.note || ''))}</td>
                </tr>
            `;
            })
            .join('');

        const operablesHtml = operables.length
            ? (() => {
                const opHeader = `
                <tr>
                    <th style="text-align:left;padding:10px;border-bottom:1px solid rgba(255,255,255,.15);">Ativo</th>
                    <th style="text-align:left;padding:10px;border-bottom:1px solid rgba(255,255,255,.15);min-width:120px;">Símbolo</th>
                    <th style="text-align:right;padding:10px;border-bottom:1px solid rgba(255,255,255,.15);min-width:120px;">Variação</th>
                    <th style="text-align:right;padding:10px;border-bottom:1px solid rgba(255,255,255,.15);min-width:160px;">Atualização</th>
                    <th style="text-align:left;padding:10px;border-bottom:1px solid rgba(255,255,255,.15);">Nota</th>
                </tr>
            `;
                const opBody = operables
                    .map(r => {
                        const sym = r && r.symbol ? String(r.symbol) : '';
                        const clickable = sym && data && data.series && Array.isArray(data.series[sym]) && data.series[sym].length;
                        const v = deps.formatPercent(typeof r.value === 'number' ? r.value : null, 2);
                        const asOf = r && r.asOf ? deps.formatDateTime(r.asOf) : '';
                        const rowStyle = clickable ? 'cursor:pointer;' : '';
                        return `
                        <tr data-petro-row="1" data-symbol="${deps.escapeHtml(sym)}" style="${rowStyle}">
                            <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.06);font-weight:900;letter-spacing:.4px;">${deps.escapeHtml(String(r.label || ''))}</td>
                            <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.06);font-family:'Share Tech Mono',monospace;opacity:.9;">${deps.escapeHtml(sym || '—')}</td>
                            <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.06);text-align:right;font-family:'Share Tech Mono',monospace;font-weight:900;">${deps.escapeHtml(v)}</td>
                            <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.06);text-align:right;font-family:'Share Tech Mono',monospace;opacity:.85;">${deps.escapeHtml(asOf || '')}</td>
                            <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.06);opacity:.85;">${deps.escapeHtml(String(r.note || ''))}</td>
                        </tr>
                    `;
                    })
                    .join('');
                return `
                <div style="border:1px solid rgba(255,255,255,.12);border-radius:14px;background:rgba(0,0,0,.18);overflow:hidden;margin-bottom:12px;">
                    <div style="padding:12px;display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap;">
                        <div style="font-weight:900;letter-spacing:1px;opacity:.95;">Ativos operáveis (não entram no score)</div>
                        <div style="opacity:.8;">Clique para abrir o gráfico</div>
                    </div>
                    <div style="overflow:auto;">
                        <table style="width:100%;border-collapse:collapse;min-width:860px;">
                            <thead>${opHeader}</thead>
                            <tbody>${opBody}</tbody>
                        </table>
                    </div>
                </div>
            `;
            })()
            : '';

        tableEl.innerHTML = `
        ${operablesHtml}
        <div style="border:1px solid rgba(255,255,255,.12);border-radius:14px;background:rgba(0,0,0,.18);overflow:hidden;">
            <div style="padding:12px 12px 0 12px;display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap;">
                <div style="font-weight:900;letter-spacing:1px;opacity:.95;">Tabela (drivers usados no score)</div>
                <div style="opacity:.85;font-family:'Share Tech Mono',monospace;">gerado: ${deps.escapeHtml(deps.formatDateTime(payload.generatedAt || ''))}</div>
            </div>
            <div style="overflow:auto;">
                <table style="width:100%;border-collapse:collapse;min-width:1100px;">
                    <thead>${header}</thead>
                    <tbody>${body || '<tr><td colspan="8" style="padding:12px;opacity:.85;">Sem linhas para esta fase.</td></tr>'}</tbody>
                </table>
            </div>
        </div>
    `;

        tableEl.querySelectorAll('tr[data-petro-row="1"]').forEach(tr => {
            tr.addEventListener('click', () => {
                const symbol = tr.getAttribute('data-symbol') || '';
                if (!symbol) return;
                const symKey = deps.symbolKey(symbol);
                const points = data && data.series && Array.isArray(data.series[symbol]) ? data.series[symbol] : [];
                if (deps.renderLineChart && points.length) {
                    deps.renderLineChart('brazilChart', points, symbol);
                }
                try {
                    localStorage.setItem('mercado_table_q:br', symKey || symbol);
                    localStorage.setItem('mercado_table_mode:br', 'all');
                } catch {
                }
                if (typeof deps.renderBrazilMarket === 'function') deps.renderBrazilMarket(data);
                else if (typeof w.renderBrazilMarket === 'function') w.renderBrazilMarket(data);
                location.hash = '#brazil-market';
                const sec = document.getElementById('brazil-market');
                if (sec && sec.scrollIntoView) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });
    }

    root.petrobras = { render };
    w.MercadoBlocks = root;
})();

