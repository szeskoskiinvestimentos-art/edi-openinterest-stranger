function opBriefing_scalpComputeSetups({
    data,
    symbol,
    microGate,
    priceNow,
    range30Pts,
    range30Pct,
    s15,
    s30,
    parityOk,
    formatNumber,
    formatPercent,
}) {
    const fmtLvl = v => (typeof v === 'number' && Number.isFinite(v) ? formatNumber(v, 0) : '—');
    const fmtP = v => (typeof v === 'number' && Number.isFinite(v) ? formatPercent(v, 2) : '—');
    const status = (mode, note = '') => ({ mode, note });

    const cur = typeof priceNow === 'number' && Number.isFinite(priceNow) ? priceNow : null;
    const rPts = typeof range30Pts === 'number' && Number.isFinite(range30Pts) ? range30Pts : null;
    const w10 = typeof opBriefing_scalpWindowStats === 'function' ? opBriefing_scalpWindowStats(data, symbol, 10 * 60 * 1000) : null;
    const w5 = typeof opBriefing_scalpWindowStats === 'function' ? opBriefing_scalpWindowStats(data, symbol, 5 * 60 * 1000) : null;
    const h15 = s15 && typeof s15.hiPrev === 'number' && Number.isFinite(s15.hiPrev) ? s15.hiPrev : null;
    const l15 = s15 && typeof s15.loPrev === 'number' && Number.isFinite(s15.loPrev) ? s15.loPrev : null;

    const distPB = (rPts !== null && rPts > 0) ? rPts * 0.25 : (cur ? cur * 0.0018 : null);
    const distResume = (rPts !== null && rPts > 0) ? rPts * 0.10 : (cur ? cur * 0.0008 : null);

    const pullback = (() => {
        if (!w10 || !distPB || !distResume || cur === null) return status('N/D');
        if (microGate !== 'buy' && microGate !== 'sell') return status('N/D');
        const anchor = microGate === 'buy' ? h15 : l15;
        if (typeof anchor !== 'number' || !Number.isFinite(anchor)) return status('N/D');
        const levelPB = microGate === 'buy' ? (anchor - distPB) : (anchor + distPB);
        const levelResume = microGate === 'buy' ? (anchor - distResume) : (anchor + distResume);
        const touched = microGate === 'buy' ? (w10.lo <= levelPB) : (w10.hi >= levelPB);
        const confirm = microGate === 'buy' ? (cur >= levelResume) : (cur <= levelResume);
        if (touched && confirm) return status('ACIONADO', `Retomada confirmada acima/abaixo de ${fmtLvl(levelResume)}`);
        if (touched) return status('ARMADO', `Aguardando retomada em ${fmtLvl(levelResume)}`);
        const near = microGate === 'buy' ? (cur <= levelResume && cur >= levelPB) : (cur >= levelResume && cur <= levelPB);
        if (near) return status('ARMADO', `Na zona (PB ${fmtLvl(levelPB)} → retomar ${fmtLvl(levelResume)})`);
        return status('ESPERE', `PB ${fmtLvl(levelPB)} → retomar ${fmtLvl(levelResume)}`);
    })();

    const breakout = (() => {
        if (!w5 || cur === null) return status('N/D');
        if (microGate === 'buy' && typeof h15 === 'number' && Number.isFinite(h15)) {
            const pad = (rPts !== null && rPts > 0) ? rPts * 0.05 : cur * 0.0006;
            const armed = cur >= (h15 - pad) && cur <= (h15 + pad);
            const fired = cur > (h15 + pad) && typeof w5.prevPrice === 'number' && w5.prevPrice <= (h15 + pad);
            if (fired) return status('ACIONADO', `Rompimento confirmado > ${fmtLvl(h15)}`);
            if (armed) return status('ARMADO', `Próximo do H15 ${fmtLvl(h15)}`);
            return status('ESPERE', `H15 ${fmtLvl(h15)}`);
        }
        if (microGate === 'sell' && typeof l15 === 'number' && Number.isFinite(l15)) {
            const pad = (rPts !== null && rPts > 0) ? rPts * 0.05 : cur * 0.0006;
            const armed = cur <= (l15 + pad) && cur >= (l15 - pad);
            const fired = cur < (l15 - pad) && typeof w5.prevPrice === 'number' && w5.prevPrice >= (l15 - pad);
            if (fired) return status('ACIONADO', `Rompimento confirmado < ${fmtLvl(l15)}`);
            if (armed) return status('ARMADO', `Próximo do L15 ${fmtLvl(l15)}`);
            return status('ESPERE', `L15 ${fmtLvl(l15)}`);
        }
        return status('N/D');
    })();

    const failure = (() => {
        if (!w10 || cur === null) return status('N/D');
        if (typeof h15 === 'number' && Number.isFinite(h15)) {
            const pad = (rPts !== null && rPts > 0) ? rPts * 0.05 : cur * 0.0006;
            const triedUp = w10.hi >= (h15 + pad);
            const failed = triedUp && cur < h15 && typeof w10.prevPrice === 'number' && w10.prevPrice > h15;
            if (failed) return status('ACIONADO', `Falha no topo (volta abaixo de H15 ${fmtLvl(h15)})`);
            if (triedUp) return status('ARMADO', `Tentou romper H15 ${fmtLvl(h15)} (vigiar falha)`);
        }
        if (typeof l15 === 'number' && Number.isFinite(l15)) {
            const pad = (rPts !== null && rPts > 0) ? rPts * 0.05 : cur * 0.0006;
            const triedDn = w10.lo <= (l15 - pad);
            const failed = triedDn && cur > l15 && typeof w10.prevPrice === 'number' && w10.prevPrice < l15;
            if (failed) return status('ACIONADO', `Falha no fundo (volta acima de L15 ${fmtLvl(l15)})`);
            if (triedDn) return status('ARMADO', `Tentou romper L15 ${fmtLvl(l15)} (vigiar falha)`);
        }
        return status('ESPERE');
    })();

    const notes = [pullback.note, breakout.note, failure.note].filter(Boolean);

    const lines = (() => {
        const out = [];
        const pbFrac = 0.25;
        const pbLevel = (() => {
            if (cur === null || rPts === null) return null;
            const d = rPts * pbFrac;
            if (microGate === 'buy') return cur - d;
            if (microGate === 'sell') return cur + d;
            return null;
        })();
        const reArm = (() => {
            if (cur === null || rPts === null) return null;
            const b = rPts * 0.10;
            if (microGate === 'buy') return cur + b;
            if (microGate === 'sell') return cur - b;
            return null;
        })();

        if (microGate === 'buy') {
            if (pbLevel !== null && cur !== null) {
                const txt = cur > pbLevel
                    ? `Setup (preferido): pullback até ≤ ${fmtLvl(pbLevel)} e retomada (5m volta ↑) • stop curto`
                    : `Setup (preferido): já no pullback • entrar na retomada acima de ${fmtLvl(reArm)} (ou candle 5m virar)`;
                out.push(txt);
            }
            if (h15 !== null) out.push(`Alternativo: rompimento com confirmação acima de ${fmtLvl(h15)} (H15)`);
            if (h15 !== null) out.push(`Reversão: falha no topo • vender se perder ${fmtLvl(h15)} após tentativa`);
        } else if (microGate === 'sell') {
            if (pbLevel !== null && cur !== null) {
                const txt = cur < pbLevel
                    ? `Setup (preferido): repique até ≥ ${fmtLvl(pbLevel)} e rejeição (5m volta ↓) • stop curto`
                    : `Setup (preferido): já no repique • entrar na rejeição abaixo de ${fmtLvl(reArm)} (ou candle 5m virar)`;
                out.push(txt);
            }
            if (l15 !== null) out.push(`Alternativo: rompimento com confirmação abaixo de ${fmtLvl(l15)} (L15)`);
            if (l15 !== null) out.push(`Reversão: falha no fundo • comprar se recuperar ${fmtLvl(l15)} após tentativa`);
        } else {
            if (h15 !== null && l15 !== null) out.push(`Range: trabalhar ${fmtLvl(l15)}–${fmtLvl(h15)} com stops curtos`);
            if (parityOk === false) out.push('Evitar scalp direcional: paridade divergente');
        }

        const meta = [
            s15 ? `H15 ${fmtLvl(s15.hi)} • L15 ${fmtLvl(s15.lo)}` : null,
            s30 ? `Range30 ${fmtP(range30Pct)} (${fmtLvl(range30Pts)} pts)` : null,
        ].filter(Boolean);
        if (meta.length) out.push(`Níveis: ${meta.join(' • ')}`);
        return out;
    })();

    return { pullback, breakout, failure, notes, lines };
}
