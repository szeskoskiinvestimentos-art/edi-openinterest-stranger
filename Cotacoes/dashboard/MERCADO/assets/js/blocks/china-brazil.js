(function () {
    const w = typeof window !== 'undefined' ? window : null;
    if (!w) return;
    const root = (w.MercadoBlocks && typeof w.MercadoBlocks === 'object') ? w.MercadoBlocks : {};

    function render({ data, el, deps } = {}) {
        if (!el) return;
        const d = deps || {};

        const escapeHtml = d.escapeHtml;
        const formatPercent = d.formatPercent;
        const toneBadgeHtmlFromTone = d.toneBadgeHtmlFromTone;

        const buildDcDeps = d.buildDcDeps;
        const dc = d.DecisionCore || (w.DecisionCore || null);

        const findAliasSymbol = d.findAliasSymbol;
        const findAliasSymbolBest = d.findAliasSymbolBest;
        const findAssetSymbol = d.findAssetSymbol;
        const getChangePct = d.getChangePct;

        if (typeof escapeHtml !== 'function'
            || typeof formatPercent !== 'function'
            || typeof toneBadgeHtmlFromTone !== 'function'
            || typeof buildDcDeps !== 'function'
            || typeof findAliasSymbol !== 'function'
            || typeof findAliasSymbolBest !== 'function'
            || typeof findAssetSymbol !== 'function'
            || typeof getChangePct !== 'function'
        ) {
            throw new Error('deps_missing');
        }

        const dcDeps = buildDcDeps();

        const nowMs = Date.now();
        const staleMs = 6 * 60 * 60 * 1000;
        const isFreshSymbol = (symbol) => {
            if (!symbol) return false;
            const age = dc ? dc.symbolAgeMs(dcDeps, data, symbol, nowMs) : null;
            if (typeof age !== 'number' || !Number.isFinite(age)) return false;
            return age <= staleMs;
        };

        const sym = {
            fxi: findAliasSymbol(data, 'FXI'),
            csi: findAliasSymbol(data, 'CSI300'),
            hsi: findAssetSymbol(data, /\bHSI\b|Hang Seng|^\.HSI/i),
            china50: findAliasSymbolBest(data, 'CHINA') || findAliasSymbol(data, 'CHINA') || findAssetSymbol(data, /^CHINA50$/i),
            ewh: findAssetSymbol(data, /^EWH$/i),
            mchi: findAssetSymbol(data, /^MCHI$/i),
            ashr: findAssetSymbol(data, /^ASHR$/i),
            kweb: findAssetSymbol(data, /^KWEB$/i),
            usdcnh: findAssetSymbol(data, /^USD\/CNH\b/i),
            usdcny: findAssetSymbol(data, /^USD\/CNY\b/i),
            iron: findAliasSymbol(data, 'IRON'),
            ironDalian: findAssetSymbol(data, /^DCE_I0$/i),
            soy: findAliasSymbol(data, 'SOY'),
            corn: findAssetSymbol(data, /^ZC$/i),
            wheat: findAssetSymbol(data, /^ZW$/i),
            soyMeal: findAssetSymbol(data, /^ZM$/i),
            soyOil: findAssetSymbol(data, /^ZL$/i),
            coffee: findAssetSymbol(data, /^KC$/i),
            sugar: findAssetSymbol(data, /^SB$/i),
            cattle: findAssetSymbol(data, /^LE$/i),
            hogs: findAssetSymbol(data, /^HE$/i),
            copper: findAliasSymbol(data, 'COPPER'),
            bci: findAliasSymbol(data, 'BCI'),
            brent: findAliasSymbol(data, 'BRENT'),
            wti: findAliasSymbol(data, 'WTI'),
            ewz: findAssetSymbol(data, /^EWZ$/i),
            bova11: findAssetSymbol(data, /^BOVA11\.SA$/i),
            ibov: findAssetSymbol(data, /(^\.BVSP$|\bIbovespa\b)/i),
            usdbbrl: findAliasSymbol(data, 'USD_BRL'),
            vale: findAssetSymbol(data, /^VALE\.K$/i),
            pbr: findAssetSymbol(data, /^PBRa?$/i),
            petr4: findAssetSymbol(data, /^PETR4\.SA$/i) || findAssetSymbol(data, /^PETR4$/i),
            suz: findAssetSymbol(data, /^SUZ$/i) || findAssetSymbol(data, /^SUZB3\.SA$/i),
            ggb: findAssetSymbol(data, /^GGB$/i),
        };

        const pick = (label, symbol) => {
            const pct = getChangePct(data, symbol);
            const cls = pct === null ? 'neutral' : pct > 0 ? 'positive' : pct < 0 ? 'negative' : 'neutral';
            const name = symbol ? (data.assets || []).find(a => String(a.symbol) === String(symbol))?.name : '';
            return { label, symbol, pct, cls, name: name || '' };
        };

        const chinaCore = [
            pick('FXI', sym.fxi),
            pick('CSI300', sym.csi),
            pick('HSI', sym.hsi),
            pick('China50', sym.china50),
            pick('EWH (HK)', sym.ewh),
            pick('USD/CNH', sym.usdcnh),
            pick('USD/CNY', sym.usdcny),
        ].filter(x => x.symbol);
        const chinaExtra = [pick('MCHI', sym.mchi), pick('ASHR', sym.ashr), pick('KWEB', sym.kweb)].filter(x => x.symbol);
        const china = chinaExtra.length ? [...chinaCore, ...chinaExtra] : chinaCore;
        const comm = [
            pick('Minério (TIO/SM58F)', sym.iron),
            pick('Minério Dalian (Sina)', sym.ironDalian),
            pick('Soja (ZS)', sym.soy),
            pick('Farelo de Soja (ZM)', sym.soyMeal),
            pick('Óleo de Soja (ZL)', sym.soyOil),
            pick('Milho (ZC)', sym.corn),
            pick('Trigo (ZW)', sym.wheat),
            pick('Café (KC)', sym.coffee),
            pick('Açúcar (SB)', sym.sugar),
            pick('Boi (LE)', sym.cattle),
            pick('Porco (HE)', sym.hogs),
            pick('Cobre (HG)', sym.copper),
            pick('BCI (ETF commodities)', sym.bci),
            pick('Brent', sym.brent),
            pick('WTI', sym.wti),
        ].filter(x => x.symbol);
        const br = [
            pick('USD/BRL', sym.usdbbrl),
            pick('EWZ', sym.ewz),
            pick('BOVA11', sym.bova11),
            pick('IBOV', sym.ibov),
            pick('VALE (ADR)', sym.vale),
            pick('Petrobras (ADR)', sym.pbr),
            pick('PETR4', sym.petr4),
            pick('Suzano', sym.suz),
            pick('Gerdau', sym.ggb),
        ].filter(x => x.symbol);

        const avg = xs => {
            const list = (xs || []).filter(v => typeof v === 'number' && Number.isFinite(v));
            if (!list.length) return null;
            return list.reduce((a, b) => a + b, 0) / list.length;
        };

        const wAvg = (items) => {
            const parts = (items || [])
                .map(x => ({ ...x, pct: getChangePct(data, x.symbol) }))
                .filter(x => typeof x.pct === 'number' && Number.isFinite(x.pct));
            const wSum = parts.reduce((a, b) => a + b.w, 0);
            return wSum ? parts.reduce((a, b) => a + b.w * b.pct, 0) / wSum : null;
        };

        const oilPct = getChangePct(data, sym.brent) ?? getChangePct(data, sym.wti);
        const chinaProxyPcts = [
            getChangePct(data, sym.fxi),
            getChangePct(data, sym.csi),
            getChangePct(data, sym.hsi),
            getChangePct(data, sym.china50),
            getChangePct(data, sym.ewh),
            getChangePct(data, sym.mchi),
            getChangePct(data, sym.ashr),
            getChangePct(data, sym.kweb),
        ].filter(v => typeof v === 'number' && Number.isFinite(v));
        const chinaAvg = avg(chinaProxyPcts);
        const usdbbrl = getChangePct(data, sym.usdbbrl);

        const ironProxy = sym.iron || sym.ironDalian;
        const soyProxy = sym.soy || sym.soyMeal || sym.soyOil;
        const brlImpulse = wAvg([
            { symbol: ironProxy, w: 0.27 },
            { symbol: soyProxy, w: 0.20 },
            { symbol: sym.corn, w: 0.08 },
            { symbol: sym.coffee, w: 0.05 },
            { symbol: sym.sugar, w: 0.04 },
            { symbol: sym.copper, w: 0.06 },
            { symbol: sym.brent || sym.wti, w: 0.30 },
        ]);

        const ibovImpulse = wAvg([
            { symbol: ironProxy, w: 0.45 },
            { symbol: sym.brent || sym.wti, w: 0.55 },
        ]);

        const brlPressure = (typeof oilPct === 'number' && oilPct > 0 ? 0.20 * oilPct : 0)
            + (typeof chinaAvg === 'number' && chinaAvg < 0 ? 0.60 * (-chinaAvg) : 0)
            + (typeof usdbbrl === 'number' && usdbbrl > 0 ? 0.45 * usdbbrl : 0);

        const ibovPressure = (typeof oilPct === 'number' && oilPct > 0 ? 0.25 * oilPct : 0)
            + (typeof chinaAvg === 'number' && chinaAvg < 0 ? 0.65 * (-chinaAvg) : 0);

        const netBrl = (typeof brlImpulse === 'number' ? brlImpulse : 0) - brlPressure;
        const netIbov = (typeof ibovImpulse === 'number' ? ibovImpulse : 0) - ibovPressure;

        const classifyNet = (v) => {
            if (typeof v !== 'number' || !Number.isFinite(v)) return { tone: 'neutral', txt: 'Inconclusivo' };
            if (v >= 0.35) return { tone: 'positive', txt: 'Impulso > Pressão' };
            if (v <= -0.35) return { tone: 'negative', txt: 'Pressão > Impulso' };
            return { tone: 'neutral', txt: 'Misto / Neutro' };
        };

        const classifyImpulse = (v) => {
            if (typeof v !== 'number' || !Number.isFinite(v)) return { tone: 'neutral', txt: 'Inconclusivo' };
            if (v >= 0.6) return { tone: 'positive', txt: 'Impulso forte' };
            if (v >= 0.25) return { tone: 'positive', txt: 'Impulso' };
            if (v <= -0.6) return { tone: 'negative', txt: 'Pressão forte' };
            if (v <= -0.25) return { tone: 'negative', txt: 'Pressão' };
            return { tone: 'neutral', txt: 'Neutro' };
        };

        const classifyPressure = (v) => {
            if (typeof v !== 'number' || !Number.isFinite(v)) return { tone: 'neutral', txt: 'Inconclusivo' };
            if (v >= 0.8) return { tone: 'negative', txt: 'Pressão forte' };
            if (v >= 0.35) return { tone: 'negative', txt: 'Pressão' };
            return { tone: 'neutral', txt: 'Baixa' };
        };

        const mk = (tone, txt) => toneBadgeHtmlFromTone(tone, 0, txt, { maxAbs: 1 });

        const classifyChinaScenario = ({ avgPct, pos, neg, cov }) => {
            if (cov < 2 || typeof avgPct !== 'number' || !Number.isFinite(avgPct)) {
                return { tone: 'neutral', label: 'Inconclusivo', hint: 'Poucos proxies com variação disponível.' };
            }
            if (avgPct >= 0.35 && pos >= 2 && neg <= 1) {
                return { tone: 'positive', label: 'China Forte', hint: 'Equities/proxies em alta de forma consistente.' };
            }
            if (avgPct <= -0.35 && neg >= 2 && pos <= 1) {
                return { tone: 'negative', label: 'China Fraca', hint: 'Equities/proxies em queda de forma consistente.' };
            }
            return { tone: 'neutral', label: 'China Mista', hint: 'Sinais divergentes entre proxies.' };
        };

        const chinaPos = chinaProxyPcts.filter(v => v > 0.15).length;
        const chinaNeg = chinaProxyPcts.filter(v => v < -0.15).length;
        const chinaCov = chinaProxyPcts.length;
        const chinaScenario = classifyChinaScenario({ avgPct: chinaAvg, pos: chinaPos, neg: chinaNeg, cov: chinaCov });

        const coverageChecks = (() => {
            const hasPct = s => {
                if (!s) return false;
                if (dc) return dc.symbolHasChangePct(dcDeps, data, s);
                const v = getChangePct(data, s);
                return typeof v === 'number' && Number.isFinite(v);
            };

            const hasFxi = hasPct(sym.fxi);
            const hasCsi = hasPct(sym.csi);
            const hasHsi = hasPct(sym.hsi);
            const hasChinaCore = hasFxi || hasCsi;
            const hasUsdCnh = hasPct(sym.usdcnh) || hasPct(sym.usdcny);
            const hasIron = hasPct(sym.iron) || hasPct(sym.ironDalian);
            const hasSoy = hasPct(sym.soy) || hasPct(sym.soyMeal) || hasPct(sym.soyOil);
            const hasOil = hasPct(sym.brent) || hasPct(sym.wti);
            const hasCopper = hasPct(sym.copper);
            const hasBci = hasPct(sym.bci);

            const freshCritical = [
                (sym.fxi || sym.csi),
                sym.iron,
                sym.soy,
                (sym.brent || sym.wti),
            ].filter(Boolean).filter(s => isFreshSymbol(s)).length;

            const missingCritical = [];
            const missingOptional = [];
            if (!hasChinaCore) missingCritical.push('FXI/CSI300');
            if (!hasIron) missingCritical.push('Minério');
            if (!hasSoy) missingCritical.push('Soja');
            if (!hasOil) missingCritical.push('Petróleo (Brent/WTI)');
            if (!hasCopper) missingOptional.push('Cobre (HG)');
            if (!hasBci) missingOptional.push('BCI (ETF commodities)');
            if (!hasUsdCnh) missingOptional.push('USD/CNH');

            const status = missingCritical.length === 0 ? { tone: 'positive', label: 'OK' } : missingCritical.length === 1 ? { tone: 'neutral', label: 'Parcial' } : { tone: 'negative', label: 'Crítico' };
            const conviction = missingCritical.length === 0 && freshCritical >= 3 ? { tone: 'positive', label: 'Sem redução' } : { tone: 'negative', label: 'Convicção reduzida' };
            const missingTxt = [...missingCritical, ...missingOptional].filter(Boolean).join(', ');
            const why = missingTxt
                ? `Faltando: ${missingTxt}`
                : freshCritical >= 3
                    ? 'Cobertura adequada para o módulo China↔Brasil.'
                    : 'Dados presentes, mas atualização antiga em itens críticos;';

            return {
                status,
                conviction,
                why,
                lines: [
                    { label: 'FXI ou CSI300 (≥1)', ok: hasChinaCore },
                    { label: 'HSI (fallback)', ok: hasHsi },
                    { label: 'USD/CNH (stress)', ok: hasUsdCnh },
                    { label: 'Minério (TIO/SM58F ou DCE_I0)', ok: hasIron },
                    { label: 'Soja (ZS ou ZM/ZL)', ok: hasSoy },
                    { label: 'Cobre (HG)', ok: hasCopper },
                    { label: 'BCI (ETF commodities)', ok: hasBci },
                    { label: 'Petróleo (Brent/WTI)', ok: hasOil },
                ],
            };
        })();

        const chinaImpact = (() => {
            if (chinaScenario.label === 'China Forte') {
                return {
                    brl: { tone: 'positive', txt: 'Tende a favorecer BRL' },
                    ibov: { tone: 'positive', txt: 'Tende a favorecer IBOV (cíclicos)' },
                    com: { tone: 'positive', txt: 'Apoio a minério/soja' },
                };
            }
            if (chinaScenario.label === 'China Fraca') {
                return {
                    brl: { tone: 'negative', txt: 'Tende a pressionar BRL' },
                    ibov: { tone: 'negative', txt: 'Tende a pressionar IBOV (Vale)' },
                    com: { tone: 'negative', txt: 'Pressão em minério/soja' },
                };
            }
            if (chinaScenario.label === 'China Mista') {
                return {
                    brl: { tone: 'neutral', txt: 'BRL depende mais do risco local' },
                    ibov: { tone: 'neutral', txt: 'Setorial/seleção' },
                    com: { tone: 'neutral', txt: 'Commodities podem divergir' },
                };
            }
            return {
                brl: { tone: 'neutral', txt: 'Inconclusivo' },
                ibov: { tone: 'neutral', txt: 'Inconclusivo' },
                com: { tone: 'neutral', txt: 'Inconclusivo' },
            };
        })();

        const brlNet = classifyNet(netBrl);
        const ibovNet = classifyNet(netIbov);
        const brlImp = classifyImpulse(brlImpulse);
        const ibovImp = classifyImpulse(ibovImpulse);
        const brlPres = classifyPressure(brlPressure);
        const ibovPres = classifyPressure(ibovPressure);

        const oilExport = classifyImpulse(oilPct);
        const oilInfl = typeof oilPct === 'number' && Number.isFinite(oilPct)
            ? (oilPct >= 0.6 ? { tone: 'negative', txt: 'Pressão forte' } : oilPct >= 0.25 ? { tone: 'negative', txt: 'Pressão' } : oilPct <= -0.6 ? { tone: 'positive', txt: 'Alívio forte' } : oilPct <= -0.25 ? { tone: 'positive', txt: 'Alívio' } : { tone: 'neutral', txt: 'Neutro' })
            : { tone: 'neutral', txt: 'Inconclusivo' };

        const divergences = [];
        const fxi = getChangePct(data, sym.fxi);
        const csi = getChangePct(data, sym.csi);
        const iron = getChangePct(data, ironProxy);
        const ironDalian = getChangePct(data, sym.ironDalian);
        const soy = getChangePct(data, soyProxy);
        const oil = oilPct;
        const copper = getChangePct(data, sym.copper);
        const usdcnh = getChangePct(data, sym.usdcnh) ?? getChangePct(data, sym.usdcny);

        if (typeof fxi === 'number' && typeof iron === 'number' && fxi > 0.4 && iron < -0.4) divergences.push('China forte sem confirmação em Minério');
        if (typeof csi === 'number' && typeof soy === 'number' && csi < -0.4 && soy > 0.4) divergences.push('Soja forte com China fraca (ver oferta/clima)');
        if (typeof fxi === 'number' && typeof copper === 'number' && fxi > 0.4 && copper < -0.4) divergences.push('China forte sem confirmação em Cobre');
        if (chinaScenario.label === 'China Forte' && typeof usdcnh === 'number' && Number.isFinite(usdcnh) && usdcnh > 0.12) divergences.push('China forte, mas USD/CNH ↑ (stress) → reduzir convicção');
        if (chinaScenario.label === 'China Fraca' && typeof usdcnh === 'number' && Number.isFinite(usdcnh) && usdcnh < -0.12) divergences.push('China fraca, mas USD/CNH ↓ (alívio) → conflito de sinal');
        if (typeof oil === 'number' && typeof usdbbrl === 'number' && oil > 0.7 && usdbbrl > 0.2) divergences.push('Petróleo ajuda, mas USD/BRL não confirma (stress local)');
        if (chinaScenario.label === 'China Forte' && typeof netIbov === 'number' && netIbov < -0.25) divergences.push('China forte, mas proxies do IBOV não confirmam (pressão local)');
        if (chinaScenario.label === 'China Fraca' && typeof netIbov === 'number' && netIbov > 0.25) divergences.push('China fraca, mas proxies do IBOV resilientes (ver juros/Petro)');
        if (coverageChecks.status.label !== 'OK') divergences.push('Cobertura do módulo incompleta (ver auditoria)');

        const ironConfirm = (() => {
            if (typeof iron !== 'number' || !Number.isFinite(iron)) return null;
            if (typeof ironDalian !== 'number' || !Number.isFinite(ironDalian)) return null;
            const strong = v => Math.abs(v) >= 0.25;
            if (!strong(iron) && !strong(ironDalian)) return { tone: 'neutral', txt: 'Confirmação Minério: neutro (baixa variação)' };
            if (iron * ironDalian > 0) return { tone: 'positive', txt: 'Confirmação Minério: Dalian (Sina) confirma TIO/SM58F (Investing)' };
            if (strong(iron) && strong(ironDalian) && iron * ironDalian < 0) return { tone: 'negative', txt: 'Confirmação Minério: Dalian (Sina) diverge do TIO/SM58F (Investing)' };
            return { tone: 'neutral', txt: 'Confirmação Minério: mista' };
        })();
        if (ironConfirm && ironConfirm.tone === 'negative') divergences.push(ironConfirm.txt);

        const renderList = (title, items) => `
        <div style="border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:12px;background:rgba(0,0,0,.18);">
            <div style="font-weight:900;letter-spacing:1px;opacity:.95;margin-bottom:8px;">${escapeHtml(title)}</div>
            ${items
                .map(x => {
                    const pctTxt = x.pct === null ? '—' : formatPercent(x.pct, 2);
                    const pctHtml = x.pct === null ? escapeHtml(pctTxt) : toneBadgeHtmlFromTone(x.cls, x.pct, pctTxt, { maxAbs: 5 });
                    return `<div style="display:flex;justify-content:space-between;gap:10px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06);">
                        <div style="min-width:0;">
                            <div style="font-weight:900;letter-spacing:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(x.label)}</div>
                            <div style="opacity:.8;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(x.symbol || 'N/A')}</div>
                        </div>
                        <div style="font-family:'Share Tech Mono',monospace;font-weight:900;min-width:90px;text-align:right;">${pctHtml}</div>
                    </div>`;
                })
                .join('')}
        </div>
    `;

        const html = `
        <div style="margin-bottom:14px;border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:12px;background:rgba(0,0,0,.18);">
            <div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap;">
                <div style="font-weight:900;letter-spacing:1px;opacity:.95;">Cenário China (Proxy)</div>
                <div style="font-family:'Share Tech Mono',monospace;font-weight:900;">${mk(chinaScenario.tone, chinaScenario.label)}</div>
            </div>
            <div style="margin-top:10px;display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:10px;">
                <div style="border:1px solid rgba(255,255,255,.10);border-radius:12px;padding:10px;background:rgba(0,0,0,.12);display:flex;justify-content:space-between;gap:10px;align-items:center;">
                    <div style="opacity:.9;font-weight:900;">Impacto esperado (BRL)</div>
                    <div style="font-family:'Share Tech Mono',monospace;font-weight:900;">${mk(chinaImpact.brl.tone, chinaImpact.brl.txt)}</div>
                </div>
                <div style="border:1px solid rgba(255,255,255,.10);border-radius:12px;padding:10px;background:rgba(0,0,0,.12);display:flex;justify-content:space-between;gap:10px;align-items:center;">
                    <div style="opacity:.9;font-weight:900;">Impacto esperado (IBOV)</div>
                    <div style="font-family:'Share Tech Mono',monospace;font-weight:900;">${mk(chinaImpact.ibov.tone, chinaImpact.ibov.txt)}</div>
                </div>
                <div style="border:1px solid rgba(255,255,255,.10);border-radius:12px;padding:10px;background:rgba(0,0,0,.12);display:flex;justify-content:space-between;gap:10px;align-items:center;">
                    <div style="opacity:.9;font-weight:900;">Impacto esperado (Commodities)</div>
                    <div style="font-family:'Share Tech Mono',monospace;font-weight:900;">${mk(chinaImpact.com.tone, chinaImpact.com.txt)}</div>
                </div>
            </div>
            <div style="margin-top:10px;opacity:.82;font-size:12px;">${escapeHtml(chinaScenario.hint)}</div>
            ${ironConfirm
                ? `<div style="margin-top:10px;border-top:1px solid rgba(255,255,255,.08);padding-top:10px;display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap;">
                    <div style="font-weight:900;letter-spacing:1px;opacity:.92;">Confirmação Minério</div>
                    <div style="font-family:'Share Tech Mono',monospace;font-weight:900;">${mk(ironConfirm.tone, ironConfirm.txt)}</div>
                </div>`
                : ''}
            <div style="margin-top:12px;border-top:1px solid rgba(255,255,255,.08);padding-top:10px;">
                <div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap;">
                    <div style="font-weight:900;letter-spacing:1px;opacity:.92;">Auditoria de cobertura</div>
                    <div style="display:flex;gap:8px;align-items:center;font-family:'Share Tech Mono',monospace;font-weight:900;">
                        <span>${mk(coverageChecks.status.tone, coverageChecks.status.label)}</span>
                        <span>${mk(coverageChecks.conviction.tone, coverageChecks.conviction.label)}</span>
                    </div>
                </div>
                <div style="margin-top:10px;display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:8px;">
                    ${coverageChecks.lines
                        .map(x => `
                            <div style="border:1px solid rgba(255,255,255,.10);border-radius:12px;padding:10px;background:rgba(0,0,0,.12);display:flex;justify-content:space-between;gap:10px;align-items:center;">
                                <div style="opacity:.9;font-weight:900;">${escapeHtml(x.label)}</div>
                                <div style="font-family:'Share Tech Mono',monospace;font-weight:900;">${mk(x.ok ? 'positive' : 'negative', x.ok ? '✅' : '❌')}</div>
                            </div>
                        `)
                        .join('')}
                </div>
                <div style="margin-top:10px;opacity:.82;font-size:12px;">${escapeHtml(coverageChecks.why)}</div>
            </div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px;">
            ${renderList('China (Proxies)', china)}
            ${renderList('Commodities BR (críticas + cobre)', comm)}
            ${renderList('Brasil (Proxies)', br)}
        </div>
        <div style="margin-top:14px;border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:12px;background:rgba(0,0,0,.18);">
            <div style="font-weight:900;letter-spacing:1px;opacity:.95;margin-bottom:10px;">Impulso vs Pressão (Brasil Produtor)</div>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px;">
                <div style="border:1px solid rgba(255,255,255,.10);border-radius:12px;padding:12px;background:rgba(0,0,0,.12);">
                    <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;">
                        <div style="font-weight:900;letter-spacing:.8px;opacity:.92;">BRL (USD/BRL)</div>
                        <div style="font-family:'Share Tech Mono',monospace;font-weight:900;">${mk(brlNet.tone, brlNet.txt)}</div>
                    </div>
                    <div style="margin-top:10px;display:grid;grid-template-columns:1fr;gap:8px;">
                        <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;">
                            <div style="opacity:.9;font-weight:800;">Impulso (balança)</div>
                            <div style="font-family:'Share Tech Mono',monospace;font-weight:900;">${mk(brlImp.tone, brlImp.txt)}</div>
                        </div>
                        <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;">
                            <div style="opacity:.9;font-weight:800;">Pressão (óleo/China/stress)</div>
                            <div style="font-family:'Share Tech Mono',monospace;font-weight:900;">${mk(brlPres.tone, brlPres.txt)}</div>
                        </div>
                    </div>
                </div>
                <div style="border:1px solid rgba(255,255,255,.10);border-radius:12px;padding:12px;background:rgba(0,0,0,.12);">
                    <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;">
                        <div style="font-weight:900;letter-spacing:.8px;opacity:.92;">Índice (IBOV)</div>
                        <div style="font-family:'Share Tech Mono',monospace;font-weight:900;">${mk(ibovNet.tone, ibovNet.txt)}</div>
                    </div>
                    <div style="margin-top:10px;display:grid;grid-template-columns:1fr;gap:8px;">
                        <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;">
                            <div style="opacity:.9;font-weight:800;">Impulso (Vale/Petro)</div>
                            <div style="font-family:'Share Tech Mono',monospace;font-weight:900;">${mk(ibovImp.tone, ibovImp.txt)}</div>
                        </div>
                        <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;">
                            <div style="opacity:.9;font-weight:800;">Pressão (óleo infla/China)</div>
                            <div style="font-family:'Share Tech Mono',monospace;font-weight:900;">${mk(ibovPres.tone, ibovPres.txt)}</div>
                        </div>
                    </div>
                </div>
                <div style="border:1px solid rgba(255,255,255,.10);border-radius:12px;padding:12px;background:rgba(0,0,0,.12);">
                    <div style="font-weight:900;letter-spacing:.8px;opacity:.92;">Petróleo (duplo efeito)</div>
                    <div style="margin-top:10px;display:grid;grid-template-columns:1fr;gap:8px;">
                        <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;">
                            <div style="opacity:.9;font-weight:800;">Export (impulso)</div>
                            <div style="font-family:'Share Tech Mono',monospace;font-weight:900;">${mk(oilExport.tone, oilExport.txt)}</div>
                        </div>
                        <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;">
                            <div style="opacity:.9;font-weight:800;">Inflação doméstica (pressão)</div>
                            <div style="font-family:'Share Tech Mono',monospace;font-weight:900;">${mk(oilInfl.tone, oilInfl.txt)}</div>
                        </div>
                    </div>
                    <div style="margin-top:10px;opacity:.80;font-size:12px;">Leitura: petróleo pode dar suporte via balança/Petrobras e, ao mesmo tempo, pressionar via inflação/juros.</div>
                </div>
            </div>
            ${divergences.length
                ? `<div style="margin-top:12px;opacity:.92;border-top:1px solid rgba(255,255,255,.08);padding-top:10px;">
                    <div style="font-weight:900;letter-spacing:1px;margin-bottom:6px;">Divergências</div>
                    ${divergences.map(t => `<div style="opacity:.9;line-height:1.35;">• ${escapeHtml(t)}</div>`).join('')}
                </div>`
                : `<div style="margin-top:12px;opacity:.85;">Sem divergências relevantes detectadas.</div>`}
        </div>
    `;

        el.innerHTML = html;
    }

    root.chinaBrazil = { render };
    w.MercadoBlocks = root;
})();
