(() => {
    const h = (() => {
        try { return window.usOperationalEuaHelpers || {}; } catch { return {}; }
    })();

    const readMode = typeof h.readMode === 'function' ? h.readMode : (() => 'normal');
    const writeMode = typeof h.writeMode === 'function' ? h.writeMode : (() => { });
    const isNum = typeof h.isNum === 'function' ? h.isNum : (v => typeof v === 'number' && Number.isFinite(v));
    const clamp = typeof h.clamp === 'function' ? h.clamp : ((n, a, b) => Math.max(a, Math.min(b, n)));
    const parseMs = typeof h.parseMs === 'function' ? h.parseMs : ((s) => {
        const t = Date.parse(String(s || ''));
        return Number.isFinite(t) ? t : null;
    });
    const fmtAge = typeof h.fmtAge === 'function' ? h.fmtAge : (() => '—');
    const sessionOfNy = typeof h.sessionOfNy === 'function' ? h.sessionOfNy : (() => ({ key: 'n/d', label: 'N/D', openEarly: false, isWeekend: false }));
    const classifyRegime = typeof h.classifyRegime === 'function' ? h.classifyRegime : (() => ({ zqRisk: null, tsyRisk: null, agree: false, final: 'N/D', extra: 'Regime indefinido' }));
    const assetProfiles = h.assetProfiles && typeof h.assetProfiles === 'object'
        ? h.assetProfiles
        : {
            spx: { label: 'S&P 500', microStrengthMin: 0.45, signTh: 0.06, edgeAdj: 0 },
            ndx: { label: 'Nasdaq', microStrengthMin: 0.55, signTh: 0.08, edgeAdj: 4 },
            dow: { label: 'US30', microStrengthMin: 0.50, signTh: 0.07, edgeAdj: 2 },
        };
    const voteLabel = typeof h.voteLabel === 'function' ? h.voteLabel : (b => (b === 'buy' ? 'buy' : b === 'sell' ? 'sell' : 'neutral'));
    const microVoteOf = typeof h.microVoteOf === 'function' ? h.microVoteOf : (() => ({ key: '', sig: 'neutral', strength: 0, min: 0, ok: false, src: 'n/d' }));
    const majorityBiasOf = typeof h.majorityBiasOf === 'function' ? h.majorityBiasOf : (() => ({ bias: 'neutral', votes: [] }));
    const sign = typeof h.sign === 'function' ? h.sign : ((v, th = 0.08) => (isNum(v) ? (v > th ? +1 : v < -th ? -1 : 0) : 0));
    const computeDivergent = typeof h.computeDivergent === 'function' ? h.computeDivergent : (() => ({ active: false, parity: { spxNdx: null, dowXlf: null }, mixedRegime: false }));
    const volLevelOf = typeof h.volLevelOf === 'function' ? h.volLevelOf : (() => ({ level: 'n/d', label: 'N/D', vix: null, vxn: null }));
    const sessionAdjOf = typeof h.sessionAdjOf === 'function' ? h.sessionAdjOf : (() => 0);
    const volAdjOf = typeof h.volAdjOf === 'function' ? h.volAdjOf : (() => 0);

    const buildCardModel = (deps, data, web, usNow) => {
        const mode = readMode();
        const nowMs = Date.now();

        const zq = (() => {
            try { return window.ZQ_CURVE_DATA || deps.operationalInputs.zqCurve || null; } catch { return deps.operationalInputs.zqCurve || null; }
        })();
        const tsy = (() => {
            try { return window.US_TSY_FUTURES_DATA || null; } catch { return null; }
        })();

        const quotesAt = parseMs(data && data.generatedAt ? data.generatedAt : null);
        const zqAt = parseMs(zq && zq.generatedAt ? zq.generatedAt : null);
        const tsyAt = parseMs(tsy && tsy.generatedAt ? tsy.generatedAt : null);
        const webAt = parseMs(web && web.generatedAt ? web.generatedAt : null);

        const ageQuotes = quotesAt !== null ? nowMs - quotesAt : null;
        const ageZq = zqAt !== null ? nowMs - zqAt : null;
        const ageTsy = tsyAt !== null ? nowMs - tsyAt : null;
        const ageWeb = webAt !== null ? nowMs - webAt : null;
        const maxAge = [ageQuotes, ageZq, ageTsy, ageWeb].filter(x => isNum(x)).reduce((a, b) => Math.max(a, b), 0);

        const staleQuotes = isNum(ageQuotes) && ageQuotes > 22 * 60 * 1000;
        const staleRegime = isNum(ageZq) && ageZq > 3 * 60 * 60 * 1000;
        const regime = classifyRegime(zq, tsy);
        const majority = majorityBiasOf(usNow);
        const majorityBias = majority.bias;
        const divergeInfo = computeDivergent(deps, data, usNow, regime);
        const divergent = !!(divergeInfo && divergeInfo.active);

        const session = sessionOfNy();

        const spotOf = (symbol) => {
            const pt = symbol ? (deps.getMostRecentPointWithPrice(data, symbol) || deps.getLastPoint(data, symbol)) : null;
            const spot = pt && isNum(pt.price) ? pt.price : null;
            const t = pt && pt.t ? String(pt.t) : null;
            return { spot, t };
        };

        const vixPx = spotOf(usNow.sym && usNow.sym.vix ? usNow.sym.vix : null).spot;
        const vxnPx = spotOf(usNow.sym && usNow.sym.vxn ? usNow.sym.vxn : null).spot;
        const volLevel = volLevelOf(vixPx, vxnPx);
        const volTrend = (() => {
            const vixChg = usNow.sym && usNow.sym.vix ? deps.getChangePct(data, usNow.sym.vix) : null;
            if (!isNum(vixChg)) return 0;
            if (vixChg > 2.0) return -0.08;
            if (vixChg < -2.0) return +0.04;
            return 0;
        })();

        const lead = (() => {
            const scoreOf = (k) => {
                const pulse = usNow.pulse && usNow.pulse[k] ? usNow.pulse[k] : null;
                const net = pulse && isNum(pulse.net) ? Math.abs(pulse.net) : 0;
                const mv = majority.votes.find(x => x.key === k) || null;
                const s = mv && isNum(mv.strength) ? mv.strength : 0;
                return net + 0.60 * s;
            };
            const keys = ['spx', 'ndx', 'dow'];
            const best = keys.reduce((acc, k) => (acc === null || scoreOf(k) > scoreOf(acc) ? k : acc), null);
            const k = best || 'spx';
            const prof = assetProfiles[k] || assetProfiles.spx;
            const mv = majority.votes.find(x => x.key === k) || { sig: 'neutral', strength: 0, min: 0.5, ok: false };
            return { key: k, label: prof.label, sig: mv.sig, strength: mv.strength, min: mv.min, src: mv.src || 'n/d' };
        })();

        const edge = (() => {
            const microBias = (m) => {
                const s = m && m.scalp && m.scalp.signal ? String(m.scalp.signal) : 'neutral';
                return s === 'buy' || s === 'sell' ? s : 'neutral';
            };
            const aligned = majority.votes.filter(v => v.ok).map(v => v.sig).filter(x => x !== 'neutral');
            const microAlign = aligned.length >= 2 ? 1 : aligned.length === 1 ? 0.5 : 0;

            const netAvg = (() => {
                const xs = ['spx', 'ndx', 'dow']
                    .map(k => usNow.pulse && usNow.pulse[k] ? usNow.pulse[k].net : null)
                    .filter(v => isNum(v));
                if (!xs.length) return 0;
                const avg = xs.reduce((a, b) => a + Math.abs(b), 0) / xs.length;
                return clamp(avg / 1.6, 0, 1);
            })();

            const regimeScore = regime.final === 'RISK_ON' ? 1 : regime.final === 'RISK_OFF' ? 0 : 0.5;
            const sessionAdj = sessionAdjOf(session.key, mode, session.openEarly, session.isWeekend);
            const volAdj = volAdjOf(volLevel.level, mode);
            const staleAdj = staleQuotes ? -0.14 : 0;
            const divAdj = divergent ? -0.18 : 0;
            const modeAdj = mode === 'conservative' ? -0.06 : 0;

            const base = 0.26;
            const score = base + 0.28 * microAlign + 0.30 * netAvg + 0.20 * (regimeScore - 0.5) + sessionAdj + volAdj + volTrend + staleAdj + divAdj + modeAdj;
            return clamp(score, 0, 1);
        })();

        const edgePct = Math.round(edge * 100);

        const threshold = (() => {
            const base = mode === 'conservative' ? 74 : 62;
            const adj = assetProfiles[lead.key] ? assetProfiles[lead.key].edgeAdj : 0;
            return base + adj;
        })();

        const conflicts = (() => {
            const out = [];
            if (staleQuotes) out.push('Quotes com atraso');
            if (volLevel.level === 'stress') out.push('Volatilidade em STRESS (VIX/VXN)');
            if (!regime.agree && regime.zqRisk && regime.tsyRisk) out.push(`Regime divergente: ZQ=${String(regime.zqRisk)} vs Treasuries=${String(regime.tsyRisk)}`);
            if (divergeInfo && divergeInfo.parity && divergeInfo.parity.spxNdx === false) out.push('Paridade divergente: SPX×NDX');
            if (divergeInfo && divergeInfo.parity && divergeInfo.parity.dowXlf === false) out.push('Paridade divergente: DOW×XLF');
            if (regime.final === 'RISK_OFF' && majorityBias === 'buy') out.push(`ZQ/Tsy RISK_OFF vs ${lead.label} micro=${voteLabel(lead.sig)}`);
            if (regime.final === 'RISK_ON' && majorityBias === 'sell') out.push(`ZQ/Tsy RISK_ON vs ${lead.label} micro=${voteLabel(lead.sig)}`);
            if (majorityBias === 'neutral') out.push('Equities sem consenso (micro)');
            return out.slice(0, 3);
        })();

        const structuralNoTrade = (() => {
            if (staleQuotes) return { active: true, reason: 'Dados com atraso' };
            if (!regime.agree && regime.zqRisk && regime.tsyRisk) return { active: true, reason: 'Divergência estrutural (regime)' };
            if (regime.final === 'RISK_OFF' && majorityBias === 'buy' && edgePct < 80) return { active: true, reason: 'Regime RISK_OFF contra compra' };
            if (regime.final === 'RISK_ON' && majorityBias === 'sell' && edgePct < 80) return { active: true, reason: 'Regime RISK_ON contra venda' };
            if (volLevel.level === 'stress') return { active: true, reason: 'Volatilidade em STRESS' };
            return { active: false, reason: '' };
        })();

        const conviction = (() => {
            const base = edgePct >= 70 ? 'ALTA' : edgePct >= 54 ? 'MÉDIA' : 'BAIXA';
            if (structuralNoTrade.active) return { label: 'BAIXA', extra: structuralNoTrade.reason };
            if (divergent) return { label: base === 'ALTA' ? 'MÉDIA' : 'BAIXA', extra: 'Sinais divergentes' };
            if (regime.extra === 'Regime indefinido') return { label: base === 'ALTA' ? 'MÉDIA' : base, extra: 'Regime indefinido' };
            if (volLevel.level === 'high') return { label: base === 'ALTA' ? 'MÉDIA' : base, extra: 'Volatilidade alta' };
            return { label: base, extra: null };
        })();

        const today = (() => {
            const label = majorityBias === 'buy' ? 'COMPRA' : majorityBias === 'sell' ? 'VENDA' : 'NEUTRO';
            if (structuralNoTrade.active) return { label, verb: 'NÃO OPERAR', tone: 'neutral' };
            const verb = edgePct >= threshold && !divergent && majorityBias !== 'neutral' ? 'OPERAR' : 'ESPERAR';
            const tone = label === 'COMPRA' ? 'positive' : label === 'VENDA' ? 'negative' : 'neutral';
            return { label, verb, tone };
        })();

        const vixLabel = volLevel.vix !== null ? `VIX ${deps.formatNumber(volLevel.vix, 1)}` : 'VIX —';
        const vxnLabel = volLevel.vxn !== null ? `VXN ${deps.formatNumber(volLevel.vxn, 1)}` : 'VXN —';

        const whyTop = (() => {
            const arrowFromLevel = (lvl) => (lvl === 'stress' || lvl === 'high' ? '↑' : lvl === 'low' ? '↓' : '≈');
            const arrowFromPct = (v, th) => (isNum(v) ? (v > th ? '↑' : v < -th ? '↓' : '≈') : '—');
            const candidates = [];

            const dxy = usNow.sym && usNow.sym.dxy ? deps.getChangePct(data, usNow.sym.dxy) : null;
            if (isNum(dxy)) candidates.push({ k: `DXY ${deps.formatPercent(dxy, 2)}`, w: 0.95, abs: Math.abs(dxy), a: arrowFromPct(dxy, 0.08) });

            const us10y = usNow.sym && usNow.sym.us10y ? deps.getChangePct(data, usNow.sym.us10y) : null;
            if (isNum(us10y)) candidates.push({ k: `US10Y ${deps.formatPercent(us10y, 2)}`, w: 0.85, abs: Math.abs(us10y), a: arrowFromPct(us10y, 0.10) });

            const vixChg = usNow.sym && usNow.sym.vix ? deps.getChangePct(data, usNow.sym.vix) : null;
            const vixCore = `${vixLabel}${isNum(vixChg) ? ` (${deps.formatPercent(vixChg, 2)})` : ''}`;
            candidates.push({ k: vixCore, w: 0.90, abs: isNum(vixChg) ? Math.abs(vixChg) : 0.6, a: arrowFromLevel(volLevel.level) });

            const zqSlope = zq && isNum(zq.slopePct) ? zq.slopePct : null;
            if (isNum(zqSlope)) candidates.push({ k: `Curva Fed ${regime.final === 'RISK_ON' || regime.final === 'RISK_OFF' ? regime.final : 'N/D'}`, w: 0.75, abs: Math.abs(zqSlope), a: arrowFromPct(zqSlope, 0.08) });

            const tsyAvg = tsy && isNum(tsy.avgChangePct) ? tsy.avgChangePct : null;
            if (isNum(tsyAvg)) candidates.push({ k: `Treasuries ${deps.formatPercent(tsyAvg, 2)}`, w: 0.65, abs: Math.abs(tsyAvg), a: arrowFromPct(tsyAvg, 0.10) });

            const eem = usNow.sym && usNow.sym.eem ? deps.getChangePct(data, usNow.sym.eem) : null;
            if (isNum(eem)) candidates.push({ k: `Emergentes (EM) ${deps.formatPercent(eem, 2)}`, w: 0.55, abs: Math.abs(eem), a: arrowFromPct(eem, 0.10) });

            candidates.sort((a, b) => (b.w * b.abs) - (a.w * a.abs));
            const top = candidates.slice(0, 3).map(c => `${c.a} ${c.k}`);
            return top.length ? top : ['—'];
        })();

        const hint = (() => {
            if (structuralNoTrade.active) return `Filtro: não operar (${structuralNoTrade.reason}).`;
            if (today.label === 'NEUTRO') return 'Se estiver confuso, trate como neutro e reduza o risco.';
            if (mode === 'conservative') return 'Modo conservador: exija confirmação (rompimento + pullback) e reduza mão em divergência.';
            if (volLevel.level === 'high') return 'Volatilidade alta: reduzir mão e operar só com confirmação + gestão rápida.';
            if (session.key === 'pre') return 'Pré-mercado: spreads e gaps podem distorcer; reduzir risco e exigir confirmação.';
            return 'Se houver divergência entre índices/juros/dólar, reduzir mão e esperar confirmação.';
        })();

        return {
            mode,
            session,
            volLevel,
            vixLabel,
            vxnLabel,
            ages: { quotes: ageQuotes, zq: ageZq, tsy: ageTsy, web: ageWeb, max: maxAge },
            stale: { quotes: staleQuotes, regime: staleRegime },
            regime,
            majorityBias,
            majorityDetail: majority,
            lead,
            divergent,
            edgePct,
            threshold,
            conviction,
            today,
            whyTop,
            conflicts,
            hint,
            blocked: structuralNoTrade.active,
        };
    };

    const render = (deps) => {
        const el = deps && deps.el ? deps.el : null;
        if (!el) return;

        const data = deps.data;
        const rawWeb = deps.operationalInputs && deps.operationalInputs.webNews ? deps.operationalInputs.webNews : null;
        const web = rawWeb && rawWeb.ok === true ? rawWeb : null;
        const usNow = data ? deps.computeUsEquitiesPulseNow(data, web) : null;

        const badge = (tone, text) => {
            const cls = tone === 'positive' ? 'positive' : tone === 'negative' ? 'negative' : 'neutral';
            return `<span class="${cls}" style="display:inline-flex;align-items:center;gap:8px;border:1px solid rgba(255,255,255,.14);border-radius:999px;padding:4px 10px;background:rgba(0,0,0,.18);font-family:'Share Tech Mono',monospace;font-weight:900;">${deps.escapeHtml(text)}</span>`;
        };

        if (!data || !usNow) {
            el.innerHTML = `<div style="padding:12px;border:1px solid rgba(255,255,255,.12);border-radius:14px;background:rgba(0,0,0,.18);opacity:.88;">Sem dados suficientes para montar o bloco EUA agora.</div>`;
            return;
        }

        const fmtP = v => (isNum(v) ? deps.formatPercent(v, 2) : '—');
        const fmt0 = v => (isNum(v) ? deps.formatNumber(v, 0) : '—');
        const fmt2 = v => (isNum(v) ? deps.formatNumber(v, 2) : '—');
        const srcLabel = s => (s === 'future' ? 'FUTURO' : s === 'proxy' ? 'PROXY' : 'N/D');

        const spotOf = s => {
            const pt = s ? (deps.getMostRecentPointWithPrice(data, s) || deps.getLastPoint(data, s)) : null;
            const spot = pt && isNum(pt.price) ? pt.price : null;
            const t = pt && pt.t ? String(pt.t) : null;
            return { spot, t };
        };

        const planFor = (name, p, extras, execSym, src, micro) => {
            const plan = (p && typeof p === 'object') ? p : { net: 0, bias: 'neutral', groups: { driver: { net: 0, count: 0 }, confirm: { net: 0, count: 0 }, context: { net: 0, count: 0 } } };
            const scalp = micro && micro.scalp ? micro.scalp : { signal: 'neutral', strength: 0, label: 'n/d' };
            const scalpStrength = scalp && isNum(scalp.strength) ? scalp.strength : 0;
            const scalpStrong = (scalp && (scalp.signal === 'buy' || scalp.signal === 'sell')) ? (scalpStrength >= 0.62) : false;
            const scalpBias = scalpStrong ? String(scalp.signal) : 'neutral';
            const primaryBias = scalpBias !== 'neutral' ? scalpBias : (plan && plan.bias ? plan.bias : 'neutral');
            const tone = primaryBias === 'buy' ? 'positive' : primaryBias === 'sell' ? 'negative' : 'neutral';
            const action = primaryBias === 'buy' ? 'Compra' : primaryBias === 'sell' ? 'Venda' : 'Neutro';
            const macroTxt = plan && plan.bias ? (plan.bias === 'buy' ? 'Compra' : plan.bias === 'sell' ? 'Venda' : 'Neutro') : '—';

            const microLine = (() => {
                if (!micro) return null;
                const r5 = isNum(micro.ret5) ? micro.ret5 : null;
                const r15 = isNum(micro.ret15) ? micro.ret15 : null;
                const r60 = isNum(micro.ret60) ? micro.ret60 : null;
                const range30 = micro.range30 && isNum(micro.range30.pct) ? micro.range30.pct : null;
                const vol30 = micro.vol30 && isNum(micro.vol30.sumAbsPct) ? micro.vol30.sumAbsPct : null;
                const bits = [
                    r5 !== null ? `5m ${deps.formatPercent(r5, 2)}` : null,
                    r15 !== null ? `15m ${deps.formatPercent(r15, 2)}` : null,
                    r60 !== null ? `60m ${deps.formatPercent(r60, 2)}` : null,
                    range30 !== null ? `Range30 ${deps.formatPercent(range30, 2)}` : null,
                    vol30 !== null ? `Vol30 ${deps.formatPercent(vol30, 2)}` : null,
                ].filter(Boolean);
                if (!bits.length) return null;
                return `Micro: ${bits.join(' • ')}`;
            })();

            const scalpPlan = (() => {
                const rangePct = micro && micro.range30 && isNum(micro.range30.pct) ? micro.range30.pct : null;
                const stopPct = rangePct !== null ? Math.max(0.08, rangePct * 0.25) : null;
                const alvoPct = rangePct !== null ? Math.max(0.12, rangePct * 0.5) : null;
                const risk = stopPct !== null ? `Stop ~${deps.formatPercent(stopPct, 2)}` : 'Stop: curto';
                const reward = alvoPct !== null ? `Alvo ~${deps.formatPercent(alvoPct, 2)}` : 'Alvo: curto';
                if (primaryBias === 'buy') return `Scalp: comprar a favor do fluxo curto (pullback leve ou rompimento) • ${risk} • ${reward}`;
                if (primaryBias === 'sell') return `Scalp: vender a favor do fluxo curto (repique ou rompimento) • ${risk} • ${reward}`;
                return 'Scalp: sem edge (5m×15m não alinhado) • prefira esperar gatilho e operar range.';
            })();

            const planNet = plan && isNum(plan.net) ? plan.net : 0;
            const w = plan && plan.groups && plan.groups.driver ? plan.groups.driver : { net: 0, count: 0 };
            const c = plan && plan.groups && plan.groups.confirm ? plan.groups.confirm : { net: 0, count: 0 };
            const x = plan && plan.groups && plan.groups.context ? plan.groups.context : { net: 0, count: 0 };
            return `<div style="border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:12px;background:rgba(0,0,0,.18);">
                <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
                    <div style="font-weight:900;letter-spacing:1px;">${deps.escapeHtml(name)}</div>
                    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
                        ${badge(tone, `Scalp: ${action}`)}
                        ${badge('neutral', `Macro: ${macroTxt}`)}
                        ${badge('neutral', `Drivers net ${deps.escapeHtml(fmt2(planNet))}`)}
                        ${badge(src === 'future' ? 'positive' : src === 'proxy' ? 'warn' : 'neutral', `Execução: ${deps.escapeHtml(execSym || '—')} (${srcLabel(src)})`)}
                    </div>
                </div>
                <div style="margin-top:8px;opacity:.86;font-size:12px;line-height:1.35;">${deps.escapeHtml(extras)}</div>
                ${microLine ? `<div style="margin-top:6px;opacity:.84;font-size:12px;line-height:1.35;">${deps.escapeHtml(microLine)}</div>` : ''}
                <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
                    ${badge('neutral', `Camadas: Driver ${deps.escapeHtml(fmt2(w.net))} (${String(w.count)}) • Conf ${deps.escapeHtml(fmt2(c.net))} (${String(c.count)}) • Contexto ${deps.escapeHtml(fmt2(x.net))} (${String(x.count)})`)}
                </div>
                <div style="margin-top:10px;opacity:.90;line-height:1.45;">
                    <div style="font-weight:900;letter-spacing:.6px;opacity:.92;margin-bottom:6px;">Plano</div>
                    <div style="opacity:.86;font-size:12px;">${deps.escapeHtml(scalpPlan)}</div>
                </div>
            </div>`;
        };

        const corrLine = (items) => {
            const xs = Array.isArray(items) ? items.slice(0, 5) : [];
            if (!xs.length) return 'Correlações: —';
            return `Correlações: ${xs.map(it => `${it.label} ${deps.formatNumber(it.corr, 2)}${it.n ? ` (n=${String(it.n)})` : ''}`).join(' • ')}`;
        };

        const news = Array.isArray(usNow.news) ? usNow.news : [];
        const newsHtml = (() => {
            if (!news.length) return `<div style="opacity:.78;font-size:12px;">• —</div>`;
            return news
                .slice(0, 6)
                .map(it => {
                    const title = it && it.title ? String(it.title) : '';
                    const url = it && it.url ? String(it.url) : '';
                    const safeUrl = url && /^https?:\/\//i.test(url) ? url : '';
                    const a = safeUrl
                        ? `<a href="${deps.escapeHtml(safeUrl)}" target="_blank" rel="noreferrer" style="color:rgba(0,243,255,.92);text-decoration:none;">${deps.escapeHtml(title)}</a>`
                        : deps.escapeHtml(title);
                    return `• ${a}`;
                })
                .join('<br>');
        })();

        const mkMissing = (() => {
            const miss = usNow.coverage && Array.isArray(usNow.coverage.missing) ? usNow.coverage.missing : [];
            const labels = usNow.coverage && usNow.coverage.keyLabels ? usNow.coverage.keyLabels : {};
            const src = usNow.source || {};
            const futMissing = ['spx', 'ndx', 'dow'].filter(k => src[k] !== 'future');
            if (!miss.length && !futMissing.length) return badge('positive', 'Drivers: completos');
            const txt = miss.slice(0, 6).map(k => labels[k] || k).join(' • ');
            const futTxt = futMissing.length ? `Sem futuro em: ${futMissing.map(k => (labels[k] || k)).join(' • ')}` : '';
            const msg = [txt ? `Faltando (dados): ${txt}${miss.length > 6 ? `… +${miss.length - 6}` : ''}` : '', futTxt].filter(Boolean).join(' | ');
            return badge('neutral', msg || 'Cobertura parcial');
        })();

        const spxSpot = spotOf(usNow.sym.spx);
        const ndxSpot = spotOf(usNow.sym.ndx);
        const dowSpot = spotOf(usNow.sym.dow);
        const asOf = (spxSpot.t || ndxSpot.t || dowSpot.t) ? deps.formatDateTime(String(spxSpot.t || ndxSpot.t || dowSpot.t)) : '—';

        const spxExtras = `${usNow.sym.spx || '—'} • ${spxSpot.spot !== null ? fmt0(spxSpot.spot) : '—'} • ${fmtP(usNow.market.spxPct)} • ${corrLine(usNow.corr && usNow.corr.spx ? usNow.corr.spx.items : [])}`;
        const ndxExtras = `${usNow.sym.ndx || '—'} • ${ndxSpot.spot !== null ? fmt0(ndxSpot.spot) : '—'} • ${fmtP(usNow.market.ndxPct)} • ${corrLine(usNow.corr && usNow.corr.ndx ? usNow.corr.ndx.items : [])}`;
        const dowExtras = `${usNow.sym.dow || '—'} • ${dowSpot.spot !== null ? fmt0(dowSpot.spot) : '—'} • ${fmtP(usNow.market.dowPct)} • ${corrLine(usNow.corr && usNow.corr.dow ? usNow.corr.dow.items : [])}`;

        const nScore = usNow.newsMeta && isNum(usNow.newsMeta.score) ? usNow.newsMeta.score : 0;
        const nTone = nScore > 0.15 ? 'positive' : nScore < -0.15 ? 'negative' : 'neutral';

        const scalperPanel = (() => {
            const ok = (a, b) => {
                const sa = sign(a);
                const sb = sign(b);
                if (!sa || !sb) return null;
                return sa === sb;
            };
            const spx = usNow.market ? usNow.market.spxPct : null;
            const ndx = usNow.market ? usNow.market.ndxPct : null;
            const dow = usNow.market ? usNow.market.dowPct : null;
            const xlf = usNow.sym && usNow.sym.xlf ? deps.getChangePct(data, usNow.sym.xlf) : null;
            const xlk = usNow.sym && usNow.sym.xlk ? deps.getChangePct(data, usNow.sym.xlk) : null;
            const iwm = usNow.sym && usNow.sym.iwm ? deps.getChangePct(data, usNow.sym.iwm) : null;
            const hyg = usNow.sym && usNow.sym.hyg ? deps.getChangePct(data, usNow.sym.hyg) : null;
            const tlt = usNow.sym && usNow.sym.tlt ? deps.getChangePct(data, usNow.sym.tlt) : null;
            const eem = usNow.sym && usNow.sym.eem ? deps.getChangePct(data, usNow.sym.eem) : null;
            const dxy = usNow.sym && usNow.sym.dxy ? deps.getChangePct(data, usNow.sym.dxy) : null;
            const vix = usNow.sym && usNow.sym.vix ? deps.getChangePct(data, usNow.sym.vix) : null;
            const us10y = usNow.sym && usNow.sym.us10y ? deps.getChangePct(data, usNow.sym.us10y) : null;

            const p1 = ok(spx, ndx);
            const p2 = ok(dow, xlf);
            const riskOn = (() => {
                const s1 = sign(hyg, 0.06);
                const s2 = sign(tlt, 0.06);
                const s3 = sign(dxy, 0.06);
                const s4 = sign(vix, 0.20);
                const score = (s1 > 0 ? 1 : s1 < 0 ? -1 : 0) + (s2 > 0 ? 0.5 : s2 < 0 ? -0.5 : 0) + (s3 < 0 ? 0.5 : s3 > 0 ? -0.5 : 0) + (s4 < 0 ? 1 : s4 > 0 ? -1 : 0);
                if (score >= 1.5) return { label: 'RISK ON', tone: 'positive' };
                if (score <= -1.5) return { label: 'RISK OFF', tone: 'negative' };
                return { label: 'MISTO', tone: 'neutral' };
            })();

            const mk = (label, v) => `<span style="font-family:'Share Tech Mono',monospace;font-weight:900;">${deps.escapeHtml(label)} ${deps.escapeHtml(isNum(v) ? deps.formatPercent(v, 2) : '—')}</span>`;
            const parityBadge = (name, v) => badge(v === true ? 'positive' : v === false ? 'negative' : 'neutral', `${name}: ${v === true ? 'OK' : v === false ? 'DIVERGE' : '—'}`);

            return `
                <div style="margin-top:12px;border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:12px;background:rgba(0,0,0,.18);">
                    <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
                        <div style="font-weight:900;letter-spacing:.8px;opacity:.95;">⚡ Scalper — Contexto, Paridades, Setores</div>
                        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
                            ${badge(riskOn.tone, riskOn.label)}
                            ${parityBadge('SPX×NDX', p1)}
                            ${parityBadge('DOW×XLF', p2)}
                        </div>
                    </div>
                    <div style="margin-top:8px;opacity:.86;font-size:12px;line-height:1.35;">
                        ${mk('HYG', hyg)} • ${mk('TLT', tlt)} • ${mk('EEM', eem)} • ${mk('DXY', dxy)} • ${mk('VIX', vix)} • ${mk('US10Y', us10y)}
                    </div>
                    <div style="margin-top:8px;opacity:.84;font-size:12px;line-height:1.35;">
                        Setores: ${mk('XLK', xlk)} • ${mk('XLF', xlf)} • ${mk('IWM', iwm)}
                    </div>
                    <div style="margin-top:8px;opacity:.78;font-size:12px;line-height:1.35;">
                        Regra de scalp: se paridades divergirem ou RISK OFF forte, reduzir mão e exigir confirmação (rompimento + pullback curto).
                    </div>
                </div>
            `;
        })();

        const model = buildCardModel(deps, data, web, usNow);

        const convLine = `Convicção do setup: ${model.conviction.label}${model.conviction.extra ? ` - ${model.conviction.extra}` : model.regime.extra === 'Regime indefinido' ? ' - Regime indefinido' : ''}`;
        const edgeTitle = `EDGE ${String(model.edgePct)}%`;

        const whyHtml = (model.whyTop || []).map(x => `<span class="usop-pill usop-pill--why">${deps.escapeHtml(x)}</span>`).join('');
        const leadSrc = model.lead && model.lead.src ? String(model.lead.src) : 'n/d';
        const leadSrcLabel = leadSrc === 'micro' ? 'micro' : leadSrc === 'macro' ? 'macro' : 'n/d';
        const leadHtml = model.lead && model.lead.label ? `<span class="usop-pill">Lead ${deps.escapeHtml(String(model.lead.label))} (${deps.escapeHtml(leadSrcLabel)}) • thr ${deps.escapeHtml(String(model.threshold || '—'))}%</span>` : '';
        const conflictHtml = model.blocked && (model.conflicts || []).length
            ? `
                <div class="usop-why">
                    <span class="usop-why-label">Top conflito:</span>
                    ${(model.conflicts || []).slice(0, 2).map(x => `<span class="usop-pill usop-pill--why">⚠ ${deps.escapeHtml(String(x))}</span>`).join('')}
                </div>
            `
            : '';

        el.innerHTML = `
            <div class="usop-card">
                <div class="usop-top">
                    <div class="usop-status">
                        <div class="usop-status-title">
                            <span class="usop-dot usop-dot--${model.today.tone}"></span>
                            <span class="usop-status-text">HOJE: ${deps.escapeHtml(model.today.label)} / ${deps.escapeHtml(model.today.verb)}</span>
                            ${model.divergent ? `<span class="usop-chip">Divergente</span>` : ''}
                        </div>
                        <div class="usop-sub">${deps.escapeHtml(model.hint)}</div>
                    </div>

                    <div class="usop-edge">
                        <div class="usop-edge-title">${deps.escapeHtml(edgeTitle)}</div>
                        <div class="usop-edge-bar" role="img" aria-label="${deps.escapeHtml(edgeTitle)}">
                            <div class="usop-edge-fill" style="width:${String(model.edgePct)}%"></div>
                            <div class="usop-edge-dot" style="left:${String(model.edgePct)}%"></div>
                        </div>
                    </div>

                    <div class="usop-meta">
                        <div class="usop-meta-line">${deps.escapeHtml(convLine)}</div>
                        <div class="usop-mode">
                            <span class="usop-mode-label">Modo:</span>
                            <button type="button" class="usop-mode-btn ${model.mode === 'normal' ? 'is-active' : ''}" data-usop-mode="normal">Normal</button>
                            <button type="button" class="usop-mode-btn ${model.mode === 'conservative' ? 'is-active' : ''}" data-usop-mode="conservative">Conservador</button>
                        </div>
                    </div>
                </div>

                <div class="usop-updated">✨ Atualizado há ${deps.escapeHtml(fmtAge(model.ages.quotes || 0))} • mais antigo (Regime) há ${deps.escapeHtml(fmtAge(model.ages.max || 0))}</div>

                <div class="usop-badges">
                    ${model.stale.quotes ? `<span class="usop-pill">Dados com atraso</span>` : ''}
                    <span class="usop-pill">Sessão ${deps.escapeHtml(model.session.label)}</span>
                    ${leadHtml}
                    <span class="usop-pill">${deps.escapeHtml(model.vixLabel)} • ${deps.escapeHtml(model.vxnLabel)} (${deps.escapeHtml(model.volLevel.label)})</span>
                    <span class="usop-pill">Quotes ${deps.escapeHtml(model.ages.quotes !== null ? `há ${fmtAge(model.ages.quotes)}` : '—')}</span>
                    <span class="usop-pill">Curva Fed ${deps.escapeHtml(model.ages.zq !== null ? `há ${fmtAge(model.ages.zq)}` : '—')}</span>
                    <span class="usop-pill">Treasuries ${deps.escapeHtml(model.ages.tsy !== null ? `há ${fmtAge(model.ages.tsy)}` : '—')}</span>
                    <span class="usop-pill">News ${deps.escapeHtml(model.ages.web !== null ? `há ${fmtAge(model.ages.web)}` : '—')}</span>
                    <button type="button" class="usop-action" data-usop-action="refresh">${deps.escapeHtml(model.stale.regime ? 'Ação: atualizar Regime' : 'Ação: atualizar dados')}</button>
                </div>

                <div class="usop-why">
                    <span class="usop-why-label">Por quê (top 3):</span>
                    ${whyHtml}
                </div>
                ${conflictHtml}

                <div class="usop-foot">Primeiro bloco do dia: transforma os sinais do painel em um roteiro curto (o que priorizar, quais níveis olhar e qual lado tende a ter melhor assimetria em US30, Nasdaq e S&amp;P 500).</div>
            </div>

            <details class="usop-details">
                <summary>Detalhes do bloco EUA</summary>
                <div style="margin-top:12px;padding:12px;border:1px solid rgba(255,255,255,.12);border-radius:14px;background:rgba(0,0,0,.18);">
                    <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
                        <div style="font-weight:900;letter-spacing:1px;">EUA — Roteiro Operacional</div>
                        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
                            ${mkMissing}
                            ${badge(nTone, `News/Geo score ${deps.escapeHtml(fmt2(nScore))}`)}
                            ${badge('neutral', `asOf ${deps.escapeHtml(asOf)}`)}
                        </div>
                    </div>
                    <div style="margin-top:10px;display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:12px;">
                        ${planFor('S&P 500', usNow.pulse.spx, spxExtras, usNow.execution ? usNow.execution.spx : null, usNow.source ? usNow.source.spx : null, usNow.micro ? usNow.micro.spx : null)}
                        ${planFor('Nasdaq', usNow.pulse.ndx, ndxExtras, usNow.execution ? usNow.execution.ndx : null, usNow.source ? usNow.source.ndx : null, usNow.micro ? usNow.micro.ndx : null)}
                        ${planFor('US30 (Dow)', usNow.pulse.dow, dowExtras, usNow.execution ? usNow.execution.dow : null, usNow.source ? usNow.source.dow : null, usNow.micro ? usNow.micro.dow : null)}
                    </div>
                </div>
                ${scalperPanel}
                <div style="margin-top:12px;display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:12px;">
                    <div style="border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:12px;background:rgba(0,0,0,.18);">
                        <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:8px;">
                            <div style="font-weight:900;letter-spacing:.6px;opacity:.92;">Notícias (macro/geopolítica)</div>
                            <div style="opacity:.72;font-size:12px;">matched ${deps.escapeHtml(String(usNow.newsMeta && isNum(usNow.newsMeta.matched) ? usNow.newsMeta.matched : 0))}</div>
                        </div>
                        <div style="opacity:.84;font-size:12px;line-height:1.35;">${newsHtml}</div>
                    </div>
                </div>
            </details>
        `;

        try {
            const btns = el.querySelectorAll('button[data-usop-mode]');
            btns.forEach(b => {
                b.addEventListener('click', () => {
                    const m = b.getAttribute('data-usop-mode');
                    if (!m) return;
                    writeMode(m);
                    try { render(deps); } catch { }
                }, { passive: true });
            });
        } catch { }

        try {
            const act = el.querySelector('button[data-usop-action="refresh"]');
            if (act) {
                act.addEventListener('click', async () => {
                    try { act.disabled = true; act.textContent = 'Atualizando…'; } catch { }
                    try {
                        const res = await Promise.allSettled([
                            deps.loadScriptFresh('assets/data/zq_curve.js'),
                            deps.loadScriptFresh('assets/data/us_tsy_futures.js'),
                            deps.loadScriptFresh('assets/data/web_news_module.js'),
                        ]);
                        const ok = res.some(r => r && r.status === 'fulfilled');
                        if (ok) {
                            try { if (window.ZQ_CURVE_DATA) deps.operationalInputs.zqCurve = window.ZQ_CURVE_DATA; } catch { }
                            try { if (window.WEB_NEWS_MODULE_DATA && typeof deps.renderWebNewsModule === 'function') deps.renderWebNewsModule(window.WEB_NEWS_MODULE_DATA); } catch { }
                            try { if (typeof deps.renderZqCurveBriefing === 'function') deps.renderZqCurveBriefing(); } catch { }
                            try { if (typeof deps.renderUsTreasuryFuturesBriefing === 'function') deps.renderUsTreasuryFuturesBriefing(); } catch { }
                        }
                    } catch {
                    } finally {
                        try { render(deps); } catch { }
                    }
                });
            }
        } catch { }
    };

    try {
        window.USOperationalEua = { render };
    } catch {
    }
    try {
        const w = window;
        const root = (w.MercadoBlocks && typeof w.MercadoBlocks === 'object') ? w.MercadoBlocks : {};
        root.usOperationalEua = { render };
        w.MercadoBlocks = root;
    } catch {
    }
})();
