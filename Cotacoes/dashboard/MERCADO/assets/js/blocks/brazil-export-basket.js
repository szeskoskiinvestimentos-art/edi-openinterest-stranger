(function () {
    const w = typeof window !== 'undefined' ? window : null;
    if (!w) return;
    const root = (w.MercadoBlocks && typeof w.MercadoBlocks === 'object') ? w.MercadoBlocks : {};

    function render({ data, el, deps } = {}) {
        if (!el) return;
        const d = deps || {};
        const pointPct = d.pointPct;
        const toneBadgeHtmlFromTone = d.toneBadgeHtmlFromTone;
        const getMostRecentPointWithPrice = d.getMostRecentPointWithPrice;
        const getLastPoint = d.getLastPoint;
        const findAliasSymbolBest = d.findAliasSymbolBest;
        const findAliasSymbol = d.findAliasSymbol;
        const findAssetSymbol = d.findAssetSymbol;
        const escapeHtml = d.escapeHtml;
        const DecisionCore = d.DecisionCore || (typeof window !== 'undefined' && window.DecisionCore ? window.DecisionCore : null);

        const mk = (tone, txt) => toneBadgeHtmlFromTone(tone, 0, txt, { maxAbs: 1 });
        const pctOf = x => pointPct(x);
        const dc = DecisionCore;
        const dcDeps = { findAliasSymbolBest, findAliasSymbol, findAssetSymbol, getLastPoint };
        const assets = data && Array.isArray(data.assets) ? data.assets : [];
        const mostRecentMs = (symbol) => {
            if (!symbol) return -Infinity;
            const last = (typeof getMostRecentPointWithPrice === 'function' ? getMostRecentPointWithPrice(data, symbol) : null) || getLastPoint(data, symbol);
            const t = last && last.t ? Date.parse(String(last.t)) : NaN;
            return Number.isFinite(t) ? t : -Infinity;
        };
        const pickBestByMatchers = (matchers, { limit = 18 } = {}) => {
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
        const staleMs = 6 * 60 * 60 * 1000;
        const ageMsOf = (symbol) => {
            if (!symbol) return null;
            if (dc && typeof dc.symbolAgeMs === 'function') {
                const age = dc.symbolAgeMs(dcDeps, data, symbol);
                return typeof age === 'number' && Number.isFinite(age) ? age : null;
            }
            const ms = mostRecentMs(symbol);
            if (!Number.isFinite(ms) || ms <= 0) return null;
            const age = Date.now() - ms;
            return Number.isFinite(age) ? age : null;
        };

        const dirFromPct = pct => {
            if (pct === null) return { txt: 'Sem dado', tone: 'neutral' };
            if (pct >= 0.35) return { txt: 'Alta', tone: 'positive' };
            if (pct <= -0.35) return { txt: 'Queda', tone: 'negative' };
            return { txt: 'Estável', tone: 'neutral' };
        };

        const getItem = ({ key, label, matchers, weight }) => {
            const symbol = pickBestByMatchers(matchers) || null;
            const last = symbol ? ((typeof getMostRecentPointWithPrice === 'function' ? getMostRecentPointWithPrice(data, symbol) : null) || getLastPoint(data, symbol)) : null;
            const pct = pctOf(last);
            const present = !!(symbol && last && typeof last.price === 'number');
            const ageMs = ageMsOf(symbol);
            const stale = typeof ageMs === 'number' && Number.isFinite(ageMs) ? ageMs > staleMs : false;
            return { key, label, symbol, last, pct, present, stale, weight: Number(weight) || 0 };
        };

        const items = [
            getItem({ key: 'iron', label: 'Minério', matchers: [/^DCE_I0$/i, /^TIOc1$/i, /^TIOc\d+$/i, /^SM58Fc1$/i, /^SM58Fc\d+$/i, /^9047$/i, /^3047$/i, /\bIron\s*Ore\b/i, /\bMinério\b/i], weight: 0.28 }),
            getItem({ key: 'soy', label: 'Soja', matchers: [/^ZS=F$/i, /^ZS$/i, /^ZSc\d+$/i, /\bSoybean(s)?\b/i, /\bSoja\b/i], weight: 0.18 }),
            getItem({ key: 'soymeal', label: 'Farelo de soja', matchers: [/^ZM=F$/i, /^ZM$/i, /^ZMc\d+$/i, /\bSoybean\s*Meal\b/i, /\bFarelo\b.*\bSoja\b/i], weight: 0.04 }),
            getItem({ key: 'soyoil', label: 'Óleo de soja', matchers: [/^ZL=F$/i, /^ZL$/i, /^ZLc\d+$/i, /\bSoybean\s*Oil\b/i, /\bÓleo\b.*\bSoja\b/i, /\bOleo\b.*\bSoja\b/i], weight: 0.03 }),
            getItem({ key: 'oil', label: 'Petróleo', matchers: [/^BZ=F$/i, /^LCOc\d+$/i, /^BRNc\d+$/i, /\bBrent\b/i, /^CL=F$/i, /^CL$/i, /^CLc\d+$/i, /\bWTI\b/i, /\bCrude\b/i, /\bPetróleo\b/i, /\bPetroleo\b/i], weight: 0.18 }),
            getItem({ key: 'lumber', label: 'Madeira serrada', matchers: [/^LBc1$/i, /^LBc\d+$/i, /^LXRc1$/i, /^LXRc\d+$/i, /\bMadeira Serrada\b/i, /\bLumber\b/i], weight: 0.02 }),
            getItem({ key: 'cattle', label: 'Boi', matchers: [/^BGIc1$/i, /^BGIc\d+$/i, /^LC=F$/i, /^LCc\d+$/i, /^LC$/i, /^BBOI11\.SA$/i, /\bBoi Gordo\b/i, /\bLive Cattle\b/i, /^LE=F$/i, /^LE$/i, /^LEc\d+$/i], weight: 0.10 }),
            getItem({ key: 'chicken', label: 'Frango', matchers: [/\bChicken\b/i, /\bFrango\b/i], weight: 0.02 }),
            getItem({ key: 'hogs', label: 'Porco Magro', matchers: [/^LH=F$/i, /^LH$/i, /^LHc\d+$/i, /\bPorco Magro\b/i, /\bLean Hogs\b/i], weight: 0.03 }),
            getItem({ key: 'coffee', label: 'Café', matchers: [/^KC=F$/i, /^KC$/i, /^KCc\d+$/i, /\bCoffee\b/i, /\bCafé\b/i, /\bCafe\b/i], weight: 0.07 }),
            getItem({ key: 'sugar', label: 'Açúcar', matchers: [/^SB=F$/i, /^SB$/i, /^SBc\d+$/i, /\bSugar\b/i, /\bAçúcar\b/i, /\bAcucar\b/i], weight: 0.05 }),
            getItem({ key: 'corn', label: 'Milho', matchers: [/^ZC=F$/i, /^ZC$/i, /^ZCc\d+$/i, /\bCorn\b/i, /\bMilho\b/i], weight: 0.05 }),
            getItem({ key: 'wheat', label: 'Trigo', matchers: [/^ZW=F$/i, /^ZW$/i, /^ZWc\d+$/i, /\bWheat\b/i, /\bTrigo\b/i], weight: 0.03 }),
            getItem({ key: 'cotton', label: 'Algodão', matchers: [/^CT=F$/i, /^CT$/i, /^CTc\d+$/i, /\bCotton\b/i, /\bAlgod[aã]o\b/i], weight: 0.02 }),
        ];

        const score = (() => {
            let wSum = 0;
            let sum = 0;
            for (const it of items) {
                if (typeof it.pct !== 'number') continue;
                const w0 = Number(it.weight) || 0;
                if (!Number.isFinite(w0) || w0 <= 0) continue;
                const adj = it.stale ? 0.5 : 1;
                const ww = w0 * adj;
                wSum += ww;
                sum += ww * it.pct;
            }
            if (!wSum) return null;
            return sum / wSum;
        })();

        const basket = (() => {
            if (score === null) return { label: 'Inconclusivo', tone: 'neutral' };
            if (score >= 0.25) return { label: 'Favorável', tone: 'positive' };
            if (score <= -0.25) return { label: 'Desfavorável', tone: 'negative' };
            return { label: 'Neutro', tone: 'neutral' };
        })();

        const essentials = ['iron', 'soy', 'oil', 'corn', 'coffee', 'sugar'];
        const presentEssentials = essentials.filter(k => items.find(x => x.key === k && x.present)).length;
        const freshEssentials = essentials.filter(k => items.find(x => x.key === k && x.present && !x.stale)).length;
        const coverage = freshEssentials >= essentials.length
            ? { label: 'Completo', tone: 'positive' }
            : presentEssentials >= 4
                ? { label: 'Parcial', tone: 'neutral' }
                : { label: 'Insuficiente', tone: 'negative' };
        const covNote = freshEssentials < presentEssentials ? `(${freshEssentials}/${presentEssentials} fresh)` : '';

        const rowHtml = items
            .map(it => {
                const status = it.present ? (it.stale ? { label: 'STALE', tone: 'neutral' } : { label: 'OK', tone: 'positive' }) : { label: 'AUSENTE', tone: 'negative' };
                const dir = dirFromPct(it.pct);
                const sym = it.symbol ? `<span style="opacity:.7;margin-left:8px;font-size:12px;">${escapeHtml(it.symbol)}</span>` : '';
                return `
                <div style="display:flex;justify-content:space-between;gap:10px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06);align-items:center;">
                    <div style="min-width:0;">
                        <div style="font-weight:900;letter-spacing:.6px;opacity:.92;">${it.present ? '✅' : '❌'} ${escapeHtml(it.label)}${sym}</div>
                        <div style="opacity:.75;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(it.present ? (it.stale ? 'Presente, mas desatualizado' : 'Presente no feed') : 'Não encontrado no feed')}</div>
                    </div>
                    <div style="text-align:right;min-width:150px;display:flex;gap:8px;justify-content:flex-end;align-items:center;font-family:'Share Tech Mono',monospace;font-weight:900;">
                        <span>${mk(status.tone, status.label)}</span>
                        <span>${mk(dir.tone, dir.txt)}</span>
                    </div>
                </div>
            `;
            })
            .join('');

        const missing = essentials.filter(k => !items.find(x => x.key === k && x.present)).map(k => {
            const it = items.find(x => x.key === k);
            return it ? it.label : k;
        });

        el.innerHTML = `
        <div style="border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:12px;background:rgba(0,0,0,.18);">
            <div style="display:grid;grid-template-columns:1fr;gap:10px;">
                <div style="display:flex;justify-content:space-between;gap:12px;align-items:center;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06);">
                    <div style="font-weight:900;letter-spacing:.6px;opacity:.92;">Export Basket</div>
                    <div style="font-family:'Share Tech Mono',monospace;font-weight:900;">${mk(basket.tone, basket.label)}</div>
                </div>
                <div style="display:flex;justify-content:space-between;gap:12px;align-items:center;padding:6px 0;">
                    <div style="font-weight:900;letter-spacing:.6px;opacity:.92;">Cobertura (essenciais)</div>
                    <div style="font-family:'Share Tech Mono',monospace;font-weight:900;display:flex;gap:10px;align-items:center;">
                        ${mk(coverage.tone, coverage.label)}
                        <span style="opacity:.7;font-size:12px;">${escapeHtml(covNote)}</span>
                    </div>
                </div>
                ${missing.length ? `<div style="opacity:.75;font-size:12px;line-height:1.35;">Faltando: <b>${escapeHtml(missing.join(', '))}</b></div>` : ''}
            </div>
        </div>
        <div style="margin-top:12px;border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:12px;background:rgba(0,0,0,.18);">
            <div style="font-weight:900;letter-spacing:1px;opacity:.95;margin-bottom:8px;">Checklist de commodities-chave</div>
            ${rowHtml}
        </div>
    `;
    }

    root.brazilExportBasket = { render };
    w.MercadoBlocks = root;
})();
