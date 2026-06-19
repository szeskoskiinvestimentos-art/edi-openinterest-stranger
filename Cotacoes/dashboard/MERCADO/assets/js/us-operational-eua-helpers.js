(function () {
    const w = typeof window !== 'undefined' ? window : null;
    if (!w) return;

    const usModeKey = 'us_operational_mode';

    const readMode = () => {
        try {
            const v = String(localStorage.getItem(usModeKey) || '').toLowerCase();
            if (v === 'conservador' || v === 'conservative') return 'conservative';
            return 'normal';
        } catch {
            return 'normal';
        }
    };

    const writeMode = (mode) => {
        try { localStorage.setItem(usModeKey, String(mode)); } catch { }
    };

    const isNum = v => typeof v === 'number' && Number.isFinite(v);
    const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

    const parseMs = (s) => {
        const t = Date.parse(String(s || ''));
        return Number.isFinite(t) ? t : null;
    };

    const fmtAge = (msAge) => {
        if (!isNum(msAge) || msAge < 0) return '—';
        const m = Math.floor(msAge / 60000);
        const h = Math.floor(m / 60);
        const mm = m - h * 60;
        if (h <= 0) return `${String(m)}m`;
        return `${String(h)}h ${String(mm)}m`;
    };

    const getNyClock = () => {
        try {
            const parts = new Intl.DateTimeFormat('en-US', {
                timeZone: 'America/New_York',
                hour: '2-digit',
                minute: '2-digit',
                weekday: 'short',
                hour12: false,
            }).formatToParts(new Date());
            const byType = {};
            for (const p of parts) byType[p.type] = p.value;
            const hour = Number(byType.hour);
            const minute = Number(byType.minute);
            const weekday = String(byType.weekday || '');
            return { hour: Number.isFinite(hour) ? hour : null, minute: Number.isFinite(minute) ? minute : null, weekday };
        } catch {
            return { hour: null, minute: null, weekday: '' };
        }
    };

    const sessionOfNy = () => {
        const { hour, minute, weekday } = getNyClock();
        if (!Number.isFinite(hour) || !Number.isFinite(minute)) return { key: 'n/d', label: 'N/D', openEarly: false, isWeekend: false };
        const isWeekend = /Sat|Sun/i.test(weekday);
        const t = hour * 60 + minute;
        const openEarly = t >= (9 * 60 + 30) && t < (9 * 60 + 40);
        if (t >= 4 * 60 && t < (9 * 60 + 30)) return { key: 'pre', label: 'Pré', openEarly, isWeekend };
        if (t >= (9 * 60 + 30) && t < (10 * 60 + 30)) return { key: 'open', label: 'Abertura', openEarly, isWeekend };
        if (t >= (10 * 60 + 30) && t < (15 * 60)) return { key: 'mid', label: 'Meio do dia', openEarly, isWeekend };
        if (t >= (15 * 60) && t < (16 * 60)) return { key: 'power', label: 'Power hour', openEarly, isWeekend };
        return { key: 'after', label: 'Fora da sessão', openEarly, isWeekend };
    };

    const classifyRegime = (zq, tsy) => {
        const zqRisk = zq && zq.riskMode ? String(zq.riskMode) : null;
        const tsyRisk = tsy && tsy.riskMode ? String(tsy.riskMode) : null;
        const agree = zqRisk && tsyRisk && zqRisk === tsyRisk;
        const final = agree ? zqRisk : (zqRisk || tsyRisk || 'N/D');
        const extra = !agree && zqRisk && tsyRisk ? 'Regime indefinido' : (final === 'N/D' ? 'Regime indefinido' : final);
        return { zqRisk, tsyRisk, agree, final, extra };
    };

    const assetProfiles = {
        spx: { label: 'S&P 500', microStrengthMin: 0.45, signTh: 0.06, edgeAdj: 0 },
        ndx: { label: 'Nasdaq', microStrengthMin: 0.55, signTh: 0.08, edgeAdj: 4 },
        dow: { label: 'US30', microStrengthMin: 0.50, signTh: 0.07, edgeAdj: 2 },
    };

    const voteLabel = (b) => (b === 'buy' ? 'buy' : b === 'sell' ? 'sell' : 'neutral');

    const microVoteOf = (usNow, key) => {
        const micro = usNow && usNow.micro ? usNow.micro[key] : null;
        const pulse = usNow && usNow.pulse ? usNow.pulse[key] : null;
        const scalp = micro && micro.scalp ? micro.scalp : null;
        const scalpSigRaw = scalp && scalp.signal ? String(scalp.signal) : 'neutral';
        const scalpStrength = scalp && isNum(scalp.strength) ? scalp.strength : 0;
        const pulseStrength = pulse && isNum(pulse.net) ? clamp(Math.abs(pulse.net) / 1.2, 0, 1) : 0;
        const scalpStrong = (scalpSigRaw === 'buy' || scalpSigRaw === 'sell') && scalpStrength >= 0.62;
        const scalpSig = scalpStrong ? scalpSigRaw : 'neutral';

        const tapePct = (() => {
            const m = usNow && usNow.market ? usNow.market : null;
            if (!m) return null;
            if (key === 'spx') return isNum(m.spxPct) ? m.spxPct : null;
            if (key === 'ndx') return isNum(m.ndxPct) ? m.ndxPct : null;
            if (key === 'dow') return isNum(m.dowPct) ? m.dowPct : null;
            return null;
        })();
        const tapeTh = key === 'ndx' ? 0.22 : 0.18;
        const tapeSig = isNum(tapePct) ? (tapePct > tapeTh ? 'buy' : tapePct < -tapeTh ? 'sell' : 'neutral') : 'neutral';
        const tapeStrength = isNum(tapePct) ? clamp(Math.abs(tapePct) / 0.45, 0, 1) : 0;

        const sig = (scalpSig === 'buy' || scalpSig === 'sell')
            ? scalpSig
            : (pulse && (pulse.bias === 'buy' || pulse.bias === 'sell') ? pulse.bias : (tapeSig === 'buy' || tapeSig === 'sell' ? tapeSig : 'neutral'));
        const strength = Math.max(scalpStrength, pulseStrength, tapeStrength);
        const src = (scalpSig === 'buy' || scalpSig === 'sell') ? 'micro' : ((pulse && (pulse.bias === 'buy' || pulse.bias === 'sell')) ? 'macro' : (tapeSig !== 'neutral' ? 'tape' : 'n/d'));
        const min = assetProfiles[key] ? assetProfiles[key].microStrengthMin : 0.5;
        const minUsed = src === 'macro' ? Math.min(min, 0.30) : (src === 'tape' ? Math.min(min, 0.22) : min);
        const ok = sig !== 'neutral' && strength >= minUsed;
        return { key, sig, strength, min: minUsed, ok, src };
    };

    const majorityBiasOf = (usNow) => {
        const votes = ['spx', 'ndx', 'dow'].map(k => microVoteOf(usNow, k));
        const active = votes.filter(v => v.ok).map(v => v.sig);
        const buys = active.filter(x => x === 'buy').length;
        const sells = active.filter(x => x === 'sell').length;
        const bias = (() => {
            if (buys >= 2) return 'buy';
            if (sells >= 2) return 'sell';
            const strong = votes.filter(v => v.ok).slice().sort((a, b) => (b.strength || 0) - (a.strength || 0))[0] || null;
            if (buys === 1 && sells === 0 && strong && strong.sig === 'buy' && strong.strength >= 0.78) return 'buy';
            if (sells === 1 && buys === 0 && strong && strong.sig === 'sell' && strong.strength >= 0.78) return 'sell';
            return 'neutral';
        })();
        return { bias, votes };
    };

    const sign = (v, th = 0.08) => (isNum(v) ? (v > th ? +1 : v < -th ? -1 : 0) : 0);

    const computeDivergent = (deps, data, usNow, regime) => {
        const spx = usNow.market ? usNow.market.spxPct : null;
        const ndx = usNow.market ? usNow.market.ndxPct : null;
        const dow = usNow.market ? usNow.market.dowPct : null;
        const xlf = usNow.sym && usNow.sym.xlf ? deps.getChangePct(data, usNow.sym.xlf) : null;

        const p1 = (() => {
            const a = sign(spx, assetProfiles.spx.signTh);
            const b = sign(ndx, assetProfiles.ndx.signTh);
            if (!a || !b) return null;
            return a === b;
        })();
        const p2 = (() => {
            const a = sign(dow, assetProfiles.dow.signTh);
            const b = sign(xlf, 0.06);
            if (!a || !b) return null;
            return a === b;
        })();
        const bad = [p1, p2].some(v => v === false);
        const mixedRegime = regime.zqRisk && regime.tsyRisk && regime.zqRisk !== regime.tsyRisk;
        return { active: bad || mixedRegime, parity: { spxNdx: p1, dowXlf: p2 }, mixedRegime };
    };

    const volLevelOf = (vixPx, vxnPx) => {
        const vix = isNum(vixPx) ? vixPx : null;
        const vxn = isNum(vxnPx) ? vxnPx : null;
        const vixLevel = vix === null ? null : (vix >= 28 ? 'stress' : vix >= 20 ? 'high' : vix <= 14 ? 'low' : 'normal');
        const vxnLevel = vxn === null ? null : (vxn >= 35 ? 'stress' : vxn >= 25 ? 'high' : vxn <= 18 ? 'low' : 'normal');
        const worst = (a, b) => {
            const rank = x => x === 'stress' ? 3 : x === 'high' ? 2 : x === 'normal' ? 1 : x === 'low' ? 0 : -1;
            const ra = rank(a);
            const rb = rank(b);
            return ra >= rb ? a : b;
        };
        const level = worst(vixLevel, vxnLevel) || vixLevel || vxnLevel || 'n/d';
        const label = level === 'stress' ? 'STRESS' : level === 'high' ? 'ALTA' : level === 'low' ? 'BAIXA' : level === 'normal' ? 'NORMAL' : 'N/D';
        return { level, label, vix, vxn };
    };

    const sessionAdjOf = (sessionKey, mode, openEarly, isWeekend) => {
        if (isWeekend) return -0.10;
        const m = mode === 'conservative' ? 1 : 0;
        if (sessionKey === 'pre') return -0.06 - m * 0.02;
        if (sessionKey === 'open') {
            const base = 0.02 - m * 0.02;
            const earlyPenalty = openEarly ? (-0.02 - m * 0.02) : 0;
            return base + earlyPenalty;
        }
        if (sessionKey === 'mid') return 0;
        if (sessionKey === 'power') return 0.01 - m * 0.005;
        if (sessionKey === 'after') return -0.08;
        return 0;
    };

    const volAdjOf = (volLevel, mode) => {
        const m = mode === 'conservative' ? 1 : 0;
        if (volLevel === 'stress') return -0.20 - m * 0.04;
        if (volLevel === 'high') return -0.12 - m * 0.03;
        if (volLevel === 'low') return -0.04 - m * 0.01;
        if (volLevel === 'normal') return 0;
        return 0;
    };

    w.usOperationalEuaHelpers = {
        readMode,
        writeMode,
        isNum,
        clamp,
        parseMs,
        fmtAge,
        sessionOfNy,
        classifyRegime,
        assetProfiles,
        voteLabel,
        microVoteOf,
        majorityBiasOf,
        sign,
        computeDivergent,
        volLevelOf,
        sessionAdjOf,
        volAdjOf,
    };
})();
