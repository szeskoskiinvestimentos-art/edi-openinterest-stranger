(() => {
    const isNum = v => typeof v === 'number' && Number.isFinite(v);

    const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

    const parseTimeMs = t => {
        const ms = t ? Date.parse(String(t)) : NaN;
        return Number.isFinite(ms) ? ms : null;
    };

    const pickSymbol = (deps, data, candidates) => {
        const list = Array.isArray(candidates) ? candidates : [];
        for (const c of list) {
            if (!c) continue;
            if (c.aliasKey && deps.findAliasSymbolBest) {
                const sym = deps.findAliasSymbolBest(data, c.aliasKey) || (deps.findAliasSymbol ? deps.findAliasSymbol(data, c.aliasKey) : null);
                if (sym) return sym;
            }
            if (c.matcher && deps.findAssetSymbol) {
                const sym = deps.findAssetSymbol(data, c.matcher);
                if (sym) return sym;
            }
            if (c.symbol) return String(c.symbol);
        }
        return null;
    };

    const symbolLast = (deps, data, symbol) => {
        if (!symbol) return null;
        return deps.getLastPoint ? deps.getLastPoint(data, symbol) : null;
    };

    const symbolChangePct = (deps, data, symbol) => {
        const last = symbolLast(deps, data, symbol);
        const v = last && isNum(last.changePct) ? last.changePct : null;
        return v;
    };

    const symbolHasChangePct = (deps, data, symbol) => isNum(symbolChangePct(deps, data, symbol));

    const symbolHasPrice = (deps, data, symbol) => {
        const last = symbolLast(deps, data, symbol);
        return !!(last && isNum(last.price));
    };

    const symbolAgeMs = (deps, data, symbol, nowMs) => {
        const last = symbolLast(deps, data, symbol);
        const tMs = last && last.t ? parseTimeMs(last.t) : null;
        if (!isNum(nowMs) || tMs === null) return null;
        const age = nowMs - tMs;
        return isNum(age) ? age : null;
    };

    const computeCoverage = (deps, data, symbols, { nowMs = Date.now(), staleMs = 6 * 60 * 60 * 1000 } = {}) => {
        const list = Array.isArray(symbols) ? symbols.filter(Boolean).map(String) : [];
        const uniq = Array.from(new Set(list));
        let present = 0;
        let withPrice = 0;
        let withChange = 0;
        let withTime = 0;
        let fresh = 0;
        const missing = [];
        const stale = [];
        for (const sym of uniq) {
            const last = symbolLast(deps, data, sym);
            if (!last) {
                missing.push(sym);
                continue;
            }
            present += 1;
            if (isNum(last.price)) withPrice += 1;
            if (isNum(last.changePct)) withChange += 1;
            const tMs = last && last.t ? parseTimeMs(last.t) : null;
            if (tMs !== null) {
                withTime += 1;
                const age = nowMs - tMs;
                if (age <= staleMs) fresh += 1;
                else stale.push({ symbol: sym, ageMs: age });
            }
        }
        const denom = uniq.length || 1;
        const coverageRatio = withPrice / denom;
        const changeRatio = withChange / denom;
        const freshnessRatio = withTime ? fresh / withTime : 0;
        return {
            symbols: uniq,
            counts: { expected: uniq.length, present, withPrice, withChange, withTime, fresh },
            ratios: {
                coverage: clamp(coverageRatio, 0, 1),
                change: clamp(changeRatio, 0, 1),
                freshness: clamp(freshnessRatio, 0, 1),
            },
            missing,
            stale: stale.sort((a, b) => b.ageMs - a.ageMs),
        };
    };

    const computeCandidatesCoverage = (deps, data, candidates, opts) => {
        const list = Array.isArray(candidates) ? candidates : [];
        const symbols = list.map(c => pickSymbol(deps, data, [c])).filter(Boolean);
        return computeCoverage(deps, data, symbols, opts);
    };

    const normalizeText = s => {
        let out = String(s || '');
        try {
            out = out.normalize('NFD');
        } catch {
        }
        return out
            .toLowerCase()
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\uFFFD/g, 'o');
    };

    const extractSection = (text, startHeading, stopTokens) => {
        const raw = String(text || '');
        const start = raw.indexOf(String(startHeading || ''));
        if (start < 0) return '';
        const tail = raw.slice(start);
        const stops = Array.isArray(stopTokens) ? stopTokens : [];
        let cutAt = tail.length;
        for (const tok of stops) {
            if (!tok) continue;
            const idx = tail.indexOf(String(tok));
            if (idx > 0 && idx < cutAt) cutAt = idx;
        }
        return tail.slice(0, cutAt).trim();
    };

    const parseWdoWinTable = (sectionText) => {
        const raw = String(sectionText || '');
        if (!raw) return [];
        const lines = raw.split('\n');
        const isRow = l => /^\s*\|/.test(String(l || ''));
        const splitRow = l => String(l || '')
            .trim()
            .replace(/^\|/, '')
            .replace(/\|$/, '')
            .split('|')
            .map(x => String(x || '').trim());

        const headerIdx = lines.findIndex(l => isRow(l) && /\bWDO\b/i.test(l) && /\bWIN\b/i.test(l));
        if (headerIdx < 0) return [];
        const header = splitRow(lines[headerIdx]);
        const idxWdo = header.findIndex(c => /\bWDO\b/i.test(c));
        const idxWin = header.findIndex(c => /\bWIN\b/i.test(c));
        if (idxWdo < 0 || idxWin < 0) return [];

        const out = [];
        for (let i = headerIdx + 1; i < lines.length; i++) {
            const l = String(lines[i] || '');
            if (!isRow(l)) continue;
            if (/\|\s*-{2,}\s*\|/.test(l)) continue;
            const cols = splitRow(l);
            if (!cols.length) continue;
            const key = String(cols[0] || '').replace(/\s+/g, ' ').trim();
            const wdo = String(cols[idxWdo] || '').replace(/\s+/g, ' ').trim();
            const win = String(cols[idxWin] || '').replace(/\s+/g, ' ').trim();
            if (!key) continue;
            if (!wdo && !win) continue;
            out.push(`${key}: WDO ${wdo || '—'} / WIN ${win || '—'}`);
        }
        return out.slice(0, 6);
    };

    const getReportsSnippets = () => {
        try {
            const g = window.AGENDA_REPORTS_SNIPPETS;
            return (g && typeof g === 'object') ? g : null;
        } catch {
            return null;
        }
    };

    const getMatrixIfThen = ({ currency, matrixKey, eventText } = {}) => {
        const cur = String(currency || '').toUpperCase();
        const key = String(matrixKey || '').trim();
        const ev = String(eventText || '');
        const nEv = normalizeText(ev);
        const snippets = getReportsSnippets();

        const validatorsFor = (k0, cur0) => {
            const k = String(k0 || '');
            const c = String(cur0 || '').toUpperCase();
            if (c === 'USD') {
                if (k === 'US_CPI' || k === 'US_PCE') return ['DXY', 'US10Y', 'VIX', 'SPX'];
                if (k === 'US_NFP') return ['DXY', 'US10Y', 'VIX', 'SPX'];
                if (k === 'US_FOMC') return ['DXY', 'US10Y', 'VIX', 'SPX'];
                if (k === 'US_ISM') return ['US10Y', 'SPX', 'HYG', 'DXY'];
                if (k === 'US_RETAIL') return ['US10Y', 'SPX', 'DXY', 'VIX'];
                return ['DXY', 'US10Y', 'VIX', 'SPX'];
            }
            if (c === 'BRL') {
                if (k === 'BR_IPCA' || k === 'BR_IPCA15' || k === 'BR_COPOM') return ['USD_BRL', 'BR10Y', 'IBOV', 'EWZ'];
                return ['USD_BRL', 'BR10Y', 'IBOV'];
            }
            if (c === 'CNY' || c === 'CNH' || c === 'HKD') {
                if (k === 'CN_PMI' || k === 'CN_TRADE' || k === 'CN_LIQ') return ['USD_CNH', 'IRON', 'COPPER', 'BRENT', 'FXI'];
                return ['USD_CNH', 'IRON', 'COPPER', 'BRENT'];
            }
            return [];
        };

        const mk = () => {
            if (key) return key;
            if (cur === 'BRL') {
                if (/\bipca-?15\b/.test(nEv)) return 'BR_IPCA15';
                if (/\bipca\b/.test(nEv)) return 'BR_IPCA';
                if (/\bcopom\b/.test(nEv) || /\bselic\b/.test(nEv)) return 'BR_COPOM';
            }
            if (cur === 'USD') {
                if (/\bnfp\b/.test(nEv) || /\bpayroll\b/.test(nEv)) return 'US_NFP';
                if (/\bcpi\b/.test(nEv)) return 'US_CPI';
                if (/\bpce\b/.test(nEv)) return 'US_PCE';
                if (/\bism\b/.test(nEv)) return 'US_ISM';
                if (/\bretail\s+sales\b/.test(nEv) || /\bvendas\s+no\s+varejo\b/.test(nEv)) return 'US_RETAIL';
                if (/\bfomc\b/.test(nEv) || /\bfed\b/.test(nEv)) return 'US_FOMC';
            }
            if (cur === 'CNY' || cur === 'CNH' || cur === 'HKD') {
                if (/\bpmi\b/.test(nEv)) return 'CN_PMI';
                if (/\bexports?\b/.test(nEv) || /\bimports?\b/.test(nEv) || /\btrade\b/.test(nEv)) return 'CN_TRADE';
                if (/\btsf\b/.test(nEv) || /\bm2\b/.test(nEv) || /\bloans?\b/.test(nEv)) return 'CN_LIQ';
            }
            return '';
        };

        const k = mk();
        const out = { key: k, source: '', lines: [], validators: validatorsFor(k, cur) };

        const fromBr = () => {
            if (!snippets || !snippets.br) return null;
            const txt = String(snippets.br || '');
            if (k === 'BR_IPCA') {
                const sec = extractSection(txt, '### IPCA (IBGE) — Inflação Oficial', ['### ', '## ']);
                if (!sec) return null;
                out.source = 'Matriz BR (IPCA)';
                out.lines = parseWdoWinTable(sec);
                return out;
            }
            if (k === 'BR_IPCA15') {
                const sec = extractSection(txt, '### IPCA-15 (IBGE) — Prévia do IPCA', ['### ', '## ']);
                if (!sec) return null;
                out.source = 'Matriz BR (IPCA-15)';
                out.lines = parseWdoWinTable(sec);
                return out;
            }
            return null;
        };

        const fromUs = () => {
            if (!snippets || !snippets.us) return null;
            const txt = String(snippets.us || '');
            if (k === 'US_CPI') {
                const sec = extractSection(txt, '### CPI (BLS) — Inflação (Headline/Core)', ['### ', '## ']);
                if (!sec) return null;
                out.source = 'Matriz EUA (CPI)';
                out.lines = parseWdoWinTable(sec);
                return out;
            }
            if (k === 'US_NFP') {
                const sec = extractSection(txt, '### Payrolls (BLS) — NFP & Wages', ['### ', '## ']);
                if (!sec) return null;
                out.source = 'Matriz EUA (Payrolls)';
                out.lines = parseWdoWinTable(sec);
                return out;
            }
            if (k === 'US_FOMC') {
                const sec = extractSection(txt, '### FOMC (Fed) — Decisão + Coletiva + Dot Plot', ['### ', '## ']);
                if (!sec) return null;
                out.source = 'Matriz EUA (FOMC)';
                out.lines = parseWdoWinTable(sec);
                return out;
            }
            if (k === 'US_PCE') {
                const sec = extractSection(txt, '### PCE (BEA) — Inflação preferida do Fed', ['### ', '## ']);
                if (!sec) return null;
                out.source = 'Matriz EUA (PCE)';
                out.lines = parseWdoWinTable(sec);
                return out;
            }
            if (k === 'US_ISM') {
                const sec = extractSection(txt, '### ISM — Atividade (Manufatura/Serviços)', ['### ', '## ']);
                if (!sec) return null;
                out.source = 'Matriz EUA (ISM)';
                out.lines = parseWdoWinTable(sec);
                return out;
            }
            if (k === 'US_RETAIL') {
                const sec = extractSection(txt, '### Retail Sales (Census) — Consumo', ['### ', '## ']);
                if (!sec) return null;
                out.source = 'Matriz EUA (Retail Sales)';
                out.lines = parseWdoWinTable(sec);
                return out;
            }
            return null;
        };

        const fromCn = () => {
            if (!snippets || !snippets.cn) return null;
            const txt = String(snippets.cn || '');
            const sec = extractSection(txt, '## GATILHOS-CHAVE (TOP)', ['## MATRIZ', '## ']);
            if (!sec) return null;
            out.source = 'Matriz China/HK (gatilhos)';
            if (k === 'CN_PMI' || k === 'CN_TRADE' || k === 'CN_LIQ') {
                out.lines = [
                    'Se China forte: tende a commodities/EM↑ → WDO VENDA / WIN COMPRA',
                    'Se China fraca: tende a commodities/EM↓ → WDO COMPRA / WIN VENDA',
                ];
                return out;
            }
            return null;
        };

        return fromBr() || fromUs() || fromCn() || { key: k, source: '', lines: [], validators: validatorsFor(k, cur) };
    };

    window.DecisionCore = {
        pickSymbol,
        symbolHasChangePct,
        symbolHasPrice,
        symbolChangePct,
        symbolAgeMs,
        computeCoverage,
        computeCandidatesCoverage,
        normalizeText,
        getMatrixIfThen,
        analyzeAgenda: (items, { now = new Date(), lookaheadMinutes = 240 } = {}) => {
            const list = Array.isArray(items) ? items : [];
            const nowLocal = now instanceof Date ? now : new Date();
            const nowMin = nowLocal.getHours() * 60 + nowLocal.getMinutes();

            const parseHM = s => {
                const m = String(s || '').match(/(\d{1,2}):(\d{2})/);
                if (!m) return null;
                const hh = Number(m[1]);
                const mm = Number(m[2]);
                if (!Number.isFinite(hh) || !Number.isFinite(mm)) return null;
                if (hh < 0 || hh > 23 || mm < 0 || mm > 59) return null;
                return hh * 60 + mm;
            };

            const impactRank = imp => {
                const v = String(imp || '').toUpperCase();
                if (v === 'ALTO') return 3;
                if (v === 'MÉDIO' || v === 'MEDIO') return 2;
                if (v === 'BAIXO') return 1;
                return 0;
            };

            const norm = (x) => ({
                id: x && x.id ? String(x.id) : '',
                time: x && x.time ? String(x.time) : '',
                timeMin: parseHM(x && x.time ? x.time : ''),
                currency: x && x.currency ? String(x.currency).toUpperCase() : '',
                impact: x && x.impact ? String(x.impact).toUpperCase() : '',
                event: x && x.event ? String(x.event) : '',
                wdo: x && x.wdo ? String(x.wdo) : '',
                win: x && x.win ? String(x.win) : '',
                matrixKey: x && (x.matrixKey || x.canonicalKey) ? String(x.matrixKey || x.canonicalKey) : '',
            });

            const upcoming = list
                .map(norm)
                .filter(x => x.event || x.time)
                .filter(x => x.timeMin !== null)
                .map(x => ({ ...x, minutesTo: x.timeMin - nowMin }))
                .filter(x => x.minutesTo >= -20)
                .filter(x => x.minutesTo <= Math.max(0, Number(lookaheadMinutes) || 240))
                .sort((a, b) => (a.minutesTo - b.minutesTo) || (impactRank(b.impact) - impactRank(a.impact)));

            const nextHigh = upcoming.find(x => impactRank(x.impact) >= 3) || null;
            const nextMed = upcoming.find(x => impactRank(x.impact) === 2) || null;
            const nextAny = upcoming[0] || null;

            const isWindow = (x) => {
                if (!x) return false;
                const r = impactRank(x.impact);
                const w = r >= 3 ? 18 : r === 2 ? 12 : 8;
                return Math.abs(x.minutesTo) <= w;
            };

            const inWindow = upcoming.filter(isWindow);

            const soonHighCount = upcoming.filter(x => impactRank(x.impact) >= 3 && x.minutesTo >= 0 && x.minutesTo <= 75).length;
            const risk = soonHighCount >= 2 ? 'alto' : (nextHigh && nextHigh.minutesTo <= 75 ? 'médio' : 'baixo');

            return {
                nowMin,
                upcoming,
                next: { any: nextAny, high: nextHigh, medium: nextMed },
                inWindow,
                risk,
            };
        },
    };
})();
