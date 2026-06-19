function opBriefing_focusComputeInsights({
    raw,
    yearKeys,
    data,
    diSignal,
    findAliasSymbolBest,
    findAliasSymbol,
    findAssetSymbol,
    getMostRecentPointWithPrice,
    getLastPoint,
    formatNumber,
}) {
    const getPack = y => (raw && raw.years && y && raw.years[y] ? raw.years[y] : null);
    const series = (yearKeys || []).map(y => ({ y, pack: getPack(y) })).filter(x => !!x.pack);
    if (!series.length) return { macroText: '', carryText: '', curveText: '' };
    const getNum = x => (typeof x === 'number' && Number.isFinite(x) ? x : null);
    const points = series.map(({ y, pack }) => ({
        y,
        ipcaMed: getNum(pack.ipca && pack.ipca.mediana),
        selicMed: getNum(pack.selic && pack.selic.mediana),
        fxMed: getNum(pack.cambio && pack.cambio.mediana),
        pibMed: getNum(pack.pib && pack.pib.mediana),
        ipcaD: getNum(pack.ipca && pack.ipca.deltaMediana),
        selicD: getNum(pack.selic && pack.selic.deltaMediana),
        fxD: getNum(pack.cambio && pack.cambio.deltaMediana),
        pibD: getNum(pack.pib && pack.pib.deltaMediana),
    }));
    const head = points[0];
    const tail = points[points.length - 1];
    const ipcaMed = head ? head.ipcaMed : null;
    const selicMed = head ? head.selicMed : null;
    const fxMed = head ? head.fxMed : null;
    const s = v => (typeof v === 'number' && Number.isFinite(v) ? (v > 0 ? '+' : '') + formatNumber(v, 2) : '—');
    const sFx = v => (typeof v === 'number' && Number.isFinite(v) ? (v > 0 ? '+' : '') + formatNumber(v, 4) : '—');
    const avg = arr => {
        const xs = (arr || []).filter(v => typeof v === 'number' && Number.isFinite(v));
        if (!xs.length) return null;
        return xs.reduce((a, b) => a + b, 0) / xs.length;
    };
    const listDelta = (key, fmt) => {
        const parts = points
            .map(p => (typeof p[key] === 'number' ? `${p.y} ${fmt(p[key])}` : ''))
            .filter(Boolean);
        return parts.join(' • ');
    };
    const listLevel = (key, fmt) => {
        const parts = points
            .map(p => (typeof p[key] === 'number' ? `${p.y} ${fmt(p[key])}` : ''))
            .filter(Boolean);
        return parts.join(' • ');
    };
    const ipcaAvgD = avg(points.map(p => p.ipcaD));
    const selicAvgD = avg(points.map(p => p.selicD));
    const fxAvgD = avg(points.map(p => p.fxD));
    const pibAvgD = avg(points.map(p => p.pibD));
    const ipcaShortD = head ? head.ipcaD : null;
    const ipcaLongD = tail ? tail.ipcaD : null;
    const selicShortD = head ? head.selicD : null;
    const selicLongD = tail ? tail.selicD : null;
    const ipcaConcentration = (() => {
        if (typeof ipcaShortD !== 'number' || typeof ipcaLongD !== 'number') return '';
        const aS = Math.abs(ipcaShortD);
        const aL = Math.abs(ipcaLongD);
        if (aS < 0.01 && aL < 0.01) return 'Revisões pequenas ao longo do horizonte.';
        if (aL > aS * 1.4) return 'Revisão mais forte no longo (sinal de desancoragem).';
        if (aS > aL * 1.4) return 'Revisão concentrada no curto (choque mais imediato).';
        return 'Revisão relativamente espalhada no horizonte (curto e longo).';
    })();

    const macroRegime = (() => {
        const infUp = typeof ipcaAvgD === 'number' && ipcaAvgD > 0.03;
        const infDown = typeof ipcaAvgD === 'number' && ipcaAvgD < -0.03;
        const actUp = typeof pibAvgD === 'number' && pibAvgD > 0.03;
        const actDown = typeof pibAvgD === 'number' && pibAvgD < -0.03;
        if (infUp && actDown) return 'Macro: risco de estagflação (inflação ↑ e atividade ↓).';
        if (infUp && actUp) return 'Macro: pressão de demanda (inflação ↑ com atividade ↑).';
        if (infDown && actDown) return 'Macro: desinflação com desaceleração (crescimento sob pressão).';
        if (infDown && actUp) return 'Macro: cenário benigno (inflação ↓ com atividade ↑).';
        return 'Macro: quadro misto (sem diagnóstico único).';
    })();
    const macroParts = [];
    const ipcaDeltaList = listDelta('ipcaD', v => `${s(v)} p.p.`);
    const selicDeltaList = listDelta('selicD', v => `${s(v)} p.p.`);
    const fxDeltaList = listDelta('fxD', v => `${sFx(v)}`);
    const pibDeltaList = listDelta('pibD', v => `${s(v)} p.p.`);
    if (ipcaDeltaList) macroParts.push(`IPCA Δ: ${ipcaDeltaList}`);
    if (selicDeltaList) macroParts.push(`Selic Δ: ${selicDeltaList}`);
    if (fxDeltaList) macroParts.push(`Câmbio Δ: ${fxDeltaList}`);
    if (pibDeltaList) macroParts.push(`PIB Δ: ${pibDeltaList}`);
    const macroText = `${macroRegime} ${ipcaConcentration}${macroParts.length ? ` ${macroParts.join(' • ')}` : ''}`;

    const usdSpot = (() => {
        if (!data) return null;
        const sym = findAliasSymbolBest(data, 'USD_BRL') || findAliasSymbol(data, 'USD_BRL') || findAssetSymbol(data, /^USD\/BRL\b/i);
        if (!sym) return null;
        const p = getMostRecentPointWithPrice(data, sym) || getLastPoint(data, sym);
        const px = p && typeof p.price === 'number' && Number.isFinite(p.price) ? p.price : null;
        return px;
    })();
    const usShort = (() => {
        try {
            const zq = window.ZQ_CURVE_DATA || null;
            const it = zq && Array.isArray(zq.items) ? zq.items[0] : null;
            const r = it && typeof it.impliedRatePct === 'number' && Number.isFinite(it.impliedRatePct) ? it.impliedRatePct : null;
            if (typeof r === 'number') return r;
        } catch {
        }
        if (!data) return null;
        const sym = findAliasSymbolBest(data, 'US10Y') || findAliasSymbol(data, 'US10Y');
        if (!sym) return null;
        const p = getMostRecentPointWithPrice(data, sym) || getLastPoint(data, sym);
        const px = p && typeof p.price === 'number' && Number.isFinite(p.price) ? p.price : null;
        return px;
    })();
    const carryDiff = typeof selicMed === 'number' && typeof usShort === 'number' ? (selicMed - usShort) : null;
    const fxDepPct = typeof fxMed === 'number' && typeof usdSpot === 'number' && usdSpot > 0 ? ((fxMed / usdSpot) - 1) * 100 : null;
    const carryNet = typeof carryDiff === 'number' && typeof fxDepPct === 'number' ? (carryDiff - fxDepPct) : null;
    const realBr = typeof selicMed === 'number' && typeof ipcaMed === 'number' ? (selicMed - ipcaMed) : null;
    const selicLevelList = listLevel('selicMed', v => `${formatNumber(v, 2)}%`);
    const ipcaLevelList = listLevel('ipcaMed', v => `${formatNumber(v, 2)}%`);
    const termLabel = (first, last, unit) => {
        if (typeof first !== 'number' || typeof last !== 'number') return '';
        const d = last - first;
        const arrow = d > 0.02 ? '↑' : d < -0.02 ? '↓' : '≈';
        return `${arrow} ${formatNumber(d, 2)}${unit}`;
    };
    const selicTerm = termLabel(head ? head.selicMed : null, tail ? tail.selicMed : null, ' p.p.');
    const ipcaTerm = termLabel(head ? head.ipcaMed : null, tail ? tail.ipcaMed : null, ' p.p.');
    const carryConclusion = typeof carryNet === 'number'
        ? (carryNet >= 3 ? 'Carry: atrativo (se risco permitir).' : carryNet <= 0.5 ? 'Carry: fraco/assimétrico (risco FX domina).' : 'Carry: moderado (sensível ao risco/FX).')
        : 'Carry: dados insuficientes para estimar diferencial/FX.';
    const carryParts = [];
    if (typeof selicMed === 'number') carryParts.push(`Selic ${formatNumber(selicMed, 2)}%`);
    if (typeof usShort === 'number') carryParts.push(`US ${formatNumber(usShort, 2)}%`);
    if (typeof carryDiff === 'number') carryParts.push(`Dif ${formatNumber(carryDiff, 2)} p.p.`);
    if (typeof usdSpot === 'number' && typeof fxMed === 'number') {
        const fxImp = typeof fxDepPct === 'number' ? `${formatNumber(fxDepPct, 2)}%` : '—';
        carryParts.push(`USD/BRL ${formatNumber(usdSpot, 4)} → ${formatNumber(fxMed, 4)} (FX implícito ${fxImp})`);
    }
    if (typeof carryNet === 'number') carryParts.push(`Carry líquido ~ ${formatNumber(carryNet, 2)} p.p.`);
    if (typeof realBr === 'number') carryParts.push(`Juro real BR ~ ${formatNumber(realBr, 2)} p.p.`);
    if (selicLevelList) carryParts.push(`Termo Selic: ${selicLevelList}${selicTerm ? ` (${selicTerm})` : ''}`);
    if (ipcaLevelList) carryParts.push(`Termo IPCA: ${ipcaLevelList}${ipcaTerm ? ` (${ipcaTerm})` : ''}`);
    const carryText = `${carryConclusion}${carryParts.length ? ` ${carryParts.join(' • ')}` : ''}`;

    const curveText = (() => {
        if (!diSignal || !diSignal.ok) return 'Curva: sem leitura DI (B3) no histórico.';
        const sh = diSignal.shape ? String(diSignal.shape) : '≈';
        const slope = typeof diSignal.slope === 'number' && Number.isFinite(diSignal.slope) ? `${formatNumber(diSignal.slope, 2)} p.p.` : '—';
        const shapeLab = sh === 'STEEPEN' ? 'inclinando' : sh === 'FLATTEN' ? 'achatando' : 'estável';
        const aS = diSignal.anchors && diSignal.anchors.short ? diSignal.anchors.short : null;
        const aL = diSignal.anchors && diSignal.anchors.long ? diSignal.anchors.long : null;
        const shortLab = aS && aS.symbol ? String(aS.symbol) : '';
        const longLab = aL && aL.symbol ? String(aL.symbol) : '';
        const shortChg = aS && typeof aS.chgPct === 'number' && Number.isFinite(aS.chgPct) ? `${(aS.chgPct * 10) > 0 ? '+' : ''}${formatNumber(aS.chgPct * 10, 1)}bp` : '—';
        const longChg = aL && typeof aL.chgPct === 'number' && Number.isFinite(aL.chgPct) ? `${(aL.chgPct * 10) > 0 ? '+' : ''}${formatNumber(aL.chgPct * 10, 1)}bp` : '—';
        const focusJuros = (() => {
            const shortUp = typeof selicShortD === 'number' && selicShortD > 0.03;
            const shortDown = typeof selicShortD === 'number' && selicShortD < -0.03;
            const longUp = typeof selicLongD === 'number' && selicLongD > 0.03;
            const longDown = typeof selicLongD === 'number' && selicLongD < -0.03;
            if (shortUp && longUp) return 'Focus mais duro → pressão generalizada (curto e longo).';
            if (shortDown && longDown) return 'Focus mais leve → alívio generalizado (curto e longo).';
            if (shortUp && !longUp) return 'Focus mais duro → pressão no curto (longo menos afetado).';
            if (shortDown && !longDown) return 'Focus mais leve → alívio no curto (longo menos afetado).';
            if (!shortUp && longUp) return 'Focus mais duro no longo → prêmio/ancoragem em foco.';
            if (!shortDown && longDown) return 'Focus mais leve no longo → alívio de prêmio/ancoragem.';
            if (typeof selicAvgD === 'number' && selicAvgD > 0.03) return 'Selic média revisada para cima no horizonte.';
            if (typeof selicAvgD === 'number' && selicAvgD < -0.03) return 'Selic média revisada para baixo no horizonte.';
            return 'Focus sem choque claro de Selic no horizonte.';
        })();
        const parts = [];
        if (shortLab) parts.push(`${shortLab} Δ ${shortChg}`);
        if (longLab) parts.push(`${longLab} Δ ${longChg}`);
        return `Curva: DI (B3) ${shapeLab} • slope ${slope}. ${focusJuros}${parts.length ? ` ${parts.join(' • ')}` : ''}`;
    })();

    return { macroText, carryText, curveText };
}
