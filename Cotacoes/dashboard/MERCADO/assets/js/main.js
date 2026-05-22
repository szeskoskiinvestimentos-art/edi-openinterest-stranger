function fixLegacyText(val) {
    const s = val === null || val === undefined ? '' : String(val);
    if (!s) return s;
    if (!/[Ãâð]/.test(s)) return s;
    try {
        const bytes = new Uint8Array(s.length);
        for (let i = 0; i < s.length; i++) bytes[i] = s.charCodeAt(i) & 0xff;
        if (typeof TextDecoder !== 'undefined') return new TextDecoder('utf-8').decode(bytes);
    } catch {
    }
    try {
        return decodeURIComponent(escape(s));
    } catch {
        return s;
    }
}

function formatNumber(val, digits = 4) {
    if (val === null || val === undefined || Number.isNaN(val)) return '\u2014';
    return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: digits }).format(val);
}

function formatPercent(val, digits = 2) {
    if (val === null || val === undefined || Number.isNaN(val)) return '\u2014';
    const sign = val > 0 ? '+' : '';
    return `${sign}${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: digits }).format(val)}%`;
}

function formatBrlCompact(val, digits = 2) {
    if (val === null || val === undefined || !Number.isFinite(val)) return '\u2014';
    const abs = Math.abs(val);
    const sign = val > 0 ? '+' : val < 0 ? '\u2212' : '';
    const fmt = (n, d) => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: d }).format(n);
    if (abs >= 1e9) return `${sign}${fmt(abs / 1e9, digits)} bi`;
    if (abs >= 1e6) return `${sign}${fmt(abs / 1e6, digits)} mi`;
    if (abs >= 1e3) return `${sign}${fmt(abs / 1e3, digits)} mil`;
    return `${sign}${fmt(abs, 0)}`;
}

function toneIntensity(valAbs, maxAbs = 5) {
    const abs = typeof valAbs === 'number' && Number.isFinite(valAbs) ? Math.abs(valAbs) : 0;
    const denom = typeof maxAbs === 'number' && Number.isFinite(maxAbs) && maxAbs > 0 ? maxAbs : 5;
    const raw = abs / denom;
    return Math.max(0.18, Math.min(0.85, raw));
}

function toneFromValue(val, { inverse = false, maxAbs = 5 } = {}) {
    if (val === null || val === undefined || !Number.isFinite(val)) return { textTone: 'neutral', tone: 'tone--neu', a: 0.2 };
    const v = inverse ? -val : val;
    if (v > 0) return { textTone: 'positive', tone: 'tone--pos', a: toneIntensity(v, maxAbs) };
    if (v < 0) return { textTone: 'negative', tone: 'tone--neg', a: toneIntensity(v, maxAbs) };
    return { textTone: 'neutral', tone: 'tone--neu', a: 0.2 };
}

function toneBadgeHtml(val, text, opts) {
    const t = toneFromValue(val, opts);
    return `<span class="tone ${t.tone} ${t.textTone}" style="--tone-a:${String(t.a)};">${escapeHtml(text)}</span>`;
}

function toneBadgeHtmlFromTone(tone, valAbs, text, { maxAbs = 5 } = {}) {
    const raw = String(tone || 'neutral');
    const textTone = raw === 'positive' ? 'positive' : raw === 'negative' ? 'negative' : 'neutral';
    const toneCls = raw === 'positive' ? 'tone--pos' : raw === 'negative' ? 'tone--neg' : 'tone--neu';
    const a = textTone === 'neutral' ? 0.2 : toneIntensity(valAbs, maxAbs);
    return `<span class="tone ${toneCls} ${textTone}" style="--tone-a:${String(a)};">${escapeHtml(text)}</span>`;
}

function clamp01(n) {
    const x = typeof n === 'number' && Number.isFinite(n) ? n : 0;
    return Math.max(0, Math.min(1, x));
}

function pillHtml(role, tone, text, strength = 0.75) {
    const r = String(role || 'signal').toLowerCase() === 'status' ? 'status' : 'signal';
    const raw = String(tone || 'neutral').toLowerCase().trim();
    const k = Math.max(0.35, Math.min(1, clamp01(strength)));

    const norm = (() => {
        if (r === 'status') {
            if (raw === 'ok' || raw === 'positive' || raw === 'success') return 'ok';
            if (raw === 'warn' || raw === 'warning') return 'warn';
            if (raw === 'bad' || raw === 'negative' || raw === 'error' || raw === 'fail') return 'bad';
            return raw === 'info' ? 'info' : 'info';
        }
        if (raw === 'risk_on' || raw === 'risk-on') return 'risk_on';
        if (raw === 'risk_off' || raw === 'risk-off') return 'risk_off';
        if (raw === 'buy' || raw === 'positive' || raw === 'pos') return 'pos';
        if (raw === 'sell' || raw === 'negative' || raw === 'neg') return 'neg';
        return 'neutral';
    })();

    return `<span class="edi-pill edi-pill--${r}-${norm}" style="--pill-k:${String(k)};"><span class="edi-pill__dot"></span><span>${escapeHtml(text)}</span></span>`;
}

function parseISODate(val) {
    const d = new Date(val);
    return Number.isNaN(d.getTime()) ? null : d;
}

function formatDateTime(val) {
    const d = parseISODate(val);
    if (!d) return '';
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');
    return `${dd}/${mm} ${hh}:${mi}`;
}

function getData() {
    const data = window.MARKET_QUOTES_DATA;
    if (!data || !data.assets || !data.series) return null;
    return data;
}

function getLastPoint(data, symbol) {
    const series = data.series[symbol] || [];
    return series.length ? series[series.length - 1] : null;
}

function pointPct(point) {
    const fn = (typeof window !== 'undefined' && window.MercadoUtils && typeof window.MercadoUtils.pointPct === 'function')
        ? window.MercadoUtils.pointPct
        : null;
    if (fn) return fn(point);
    if (!point) return null;
    const ext = point && typeof point.extendedChangePct === 'number' && Number.isFinite(point.extendedChangePct) ? point.extendedChangePct : null;
    if (ext !== null) return ext;
    const reg = point && typeof point.changePct === 'number' && Number.isFinite(point.changePct) ? point.changePct : null;
    return reg;
}

function getMostRecentPointWithPrice(data, symbol) {
    if (!data || !data.series || !symbol) return null;
    const series = data.series[symbol] || [];
    if (!series.length) return null;
    let best = null;
    let bestMs = -Infinity;
    for (const p of series) {
        const price = p && typeof p.price === 'number' ? p.price : null;
        if (price === null || !Number.isFinite(price)) continue;
        const tMs = p && p.t ? Date.parse(p.t) : NaN;
        const ms = Number.isFinite(tMs) ? tMs : 0;
        if (ms >= bestMs) {
            bestMs = ms;
            best = p;
        }
    }
    return best;
}

function buildRows(data, categories, includeMissing = false) {
    const assets = (data.assets || []).filter(a => categories.includes(a.category));
    return assets
        .map(a => {
            const last = getLastPoint(data, a.symbol);
            return {
                symbol: a.symbol,
                name: a.name,
                exchange: a.exchange || '',
                category: a.category,
                tags: a.tags || [],
                last,
            };
        })
        .filter(r => includeMissing || (r.last && typeof r.last.price === 'number'))
        .sort((a, b) => {
            const ap = pointPct(a.last);
            const bp = pointPct(b.last);
            const av = ap === null ? -Infinity : ap;
            const bv = bp === null ? -Infinity : bp;
            return bv - av;
        });
}

function assetIcon(row) {
    const cat = String(row && row.category ? row.category : '').toLowerCase();
    const name = fixLegacyText(String(row && row.name ? row.name : '')).toLowerCase();
    const sym = fixLegacyText(String(row && row.symbol ? row.symbol : '')).toLowerCase();
    const tags = Array.isArray(row && row.tags) ? row.tags.map(t => String(t).toLowerCase()) : [];

    const has = (...needles) => needles.some(n => {
        if (!n) return false;
        const needle = fixLegacyText(String(n)).toLowerCase();
        return needle && (name.includes(needle) || sym.includes(needle));
    });

    const flagFromCurrency = ccy => {
        const c = String(ccy || '').toUpperCase().trim();
        if (!c) return '';
        if (c === 'USD') return 'ðŸ‡ºðŸ‡¸';
        if (c === 'BRL') return 'ðŸ‡§ðŸ‡·';
        if (c === 'EUR') return 'ðŸ‡ªðŸ‡º';
        if (c === 'GBP') return 'ðŸ‡¬ðŸ‡§';
        if (c === 'JPY') return 'ðŸ‡¯ðŸ‡µ';
        if (c === 'CHF') return 'ðŸ‡¨ðŸ‡­';
        if (c === 'AUD') return 'ðŸ‡¦ðŸ‡º';
        if (c === 'NZD') return 'ðŸ‡³ðŸ‡¿';
        if (c === 'CAD') return 'ðŸ‡¨ðŸ‡¦';
        if (c === 'CNY' || c === 'CNH') return 'ðŸ‡¨ðŸ‡³';
        if (c === 'MXN') return 'ðŸ‡²ðŸ‡½';
        if (c === 'ZAR') return 'ðŸ‡¿ðŸ‡¦';
        if (c === 'TRY') return 'ðŸ‡¹ðŸ‡·';
        if (c === 'KRW') return 'ðŸ‡°ðŸ‡·';
        if (c === 'INR') return 'ðŸ‡®ðŸ‡³';
        if (c === 'NOK') return 'ðŸ‡³ðŸ‡´';
        if (c === 'SEK') return 'ðŸ‡¸ðŸ‡ª';
        if (c === 'DKK') return 'ðŸ‡©ðŸ‡°';
        return '';
    };

    const flagFromIso2 = iso2 => {
        const c = String(iso2 || '').toUpperCase().trim();
        if (!c) return '';
        if (c === 'US') return 'ðŸ‡ºðŸ‡¸';
        if (c === 'BR') return 'ðŸ‡§ðŸ‡·';
        if (c === 'CN') return 'ðŸ‡¨ðŸ‡³';
        if (c === 'JP') return 'ðŸ‡¯ðŸ‡µ';
        if (c === 'MX') return 'ðŸ‡²ðŸ‡½';
        if (c === 'GB') return 'ðŸ‡¬ðŸ‡§';
        if (c === 'DE') return 'ðŸ‡©ðŸ‡ª';
        if (c === 'FR') return 'ðŸ‡«ðŸ‡·';
        if (c === 'IT') return 'ðŸ‡®ðŸ‡¹';
        if (c === 'ES') return 'ðŸ‡ªðŸ‡¸';
        if (c === 'CA') return 'ðŸ‡¨ðŸ‡¦';
        if (c === 'AU') return 'ðŸ‡¦ðŸ‡º';
        if (c === 'NZ') return 'ðŸ‡³ðŸ‡¿';
        if (c === 'CH') return 'ðŸ‡¨ðŸ‡­';
        if (c === 'SE') return 'ðŸ‡¸ðŸ‡ª';
        if (c === 'NO') return 'ðŸ‡³ðŸ‡´';
        if (c === 'DK') return 'ðŸ‡©ðŸ‡°';
        if (c === 'TR') return 'ðŸ‡¹ðŸ‡·';
        if (c === 'AR') return 'ðŸ‡¦ðŸ‡·';
        if (c === 'CL') return 'ðŸ‡¨ðŸ‡±';
        if (c === 'CO') return 'ðŸ‡¨ðŸ‡´';
        if (c === 'PE') return 'ðŸ‡µðŸ‡ª';
        if (c === 'ZA') return 'ðŸ‡¿ðŸ‡¦';
        if (c === 'RU') return 'ðŸ‡·ðŸ‡º';
        if (c === 'IN') return 'ðŸ‡®ðŸ‡³';
        if (c === 'KR') return 'ðŸ‡°ðŸ‡·';
        if (c === 'ID') return 'ðŸ‡®ðŸ‡©';
        return '';
    };

    const fxPairFlags = raw => {
        const s = String(raw || '').toUpperCase().trim();
        const m = s.match(/^([A-Z]{3})\/([A-Z]{3})\b/);
        if (!m) return '';
        const a = flagFromCurrency(m[1]);
        const b = flagFromCurrency(m[2]);
        return a || b ? `${a}${b}` : '';
    };

    const countryHint = () => {
        const s = String(row && row.symbol ? row.symbol : '');
        const n = fixLegacyText(String(row && row.name ? row.name : ''));
        const ex = fixLegacyText(String(row && row.exchange ? row.exchange : ''));

        const cdsIso2 = s.match(/^([A-Z]{2})GV/i);
        if (cdsIso2) {
            const f = flagFromIso2(cdsIso2[1]);
            if (f) return f;
        }

        if (s.endsWith('.SA') || /\bbrasil\b|\bbrazil\b/i.test(n) || /\bB3\b/i.test(ex)) return 'ðŸ‡§ðŸ‡·';
        if (/^US\d+(YT|MT)=RR$/i.test(s) || /\bUnited States\b|\bEUA\b/i.test(n)) return 'ðŸ‡ºðŸ‡¸';
        if (/^BR\d+(YT|MT)=RR$/i.test(s) || /\bBrazil\b|\bBrasil\b/i.test(n)) return 'ðŸ‡§ðŸ‡·';
        if (/\bChina\b|\bCNY\b|\bCNH\b/i.test(n) || /\bCSI 300\b/i.test(n)) return 'ðŸ‡¨ðŸ‡³';
        if (/\bJapan\b|\bJPY\b/i.test(n)) return 'ðŸ‡¯ðŸ‡µ';
        if (/\bMexico\b|\bM[eé]xico\b|\bMXN\b/i.test(n)) return 'ðŸ‡²ðŸ‡½';
        if (/\bTurkey\b|\bTurquia\b|\bTRY\b/i.test(n)) return 'ðŸ‡¹ðŸ‡·';
        if (/\bRussia\b|\bR[uú]ssia\b|\bRUB\b/i.test(n)) return 'ðŸ‡·ðŸ‡º';
        if (/\bEurope\b|\bEuro\b/i.test(n)) return 'ðŸ‡ªðŸ‡º';
        if (/\bUK\b|\bBritain\b|\bGBP\b/i.test(n)) return 'ðŸ‡¬ðŸ‡§';
        return '';
    };

    const risk = tags.includes('risk_on') ? 'ðŸŸ¢' : tags.includes('risk_off') ? 'ðŸ”´' : '';

    if (sym === '.dxy' || has('índice do dólar', 'indice do dolar', 'dxy')) return `ðŸ’µ${risk ? ` ${risk}` : ''}`;
    if (sym.startsWith('xau') || has('xau/usd', 'ouro', 'gold')) return `ðŸ¥‡${risk ? ` ${risk}` : ''}`;
    if (sym.startsWith('xag') || has('prata', 'silver')) return `ðŸ¥ˆ${risk ? ` ${risk}` : ''}`;
    if (has('cobre', 'copper', 'hg')) return `ðŸ§²${risk ? ` ${risk}` : ''}`;
    if (has('cafÃ©', 'coffee')) return `â˜•${risk ? ` ${risk}` : ''}`;
    if (has('farelo de soja', 'soymeal')) return `ðŸ«˜${risk ? ` ${risk}` : ''}`;
    if (has('soja', 'soybean', 'soy')) return `ðŸŒ±${risk ? ` ${risk}` : ''}`;
    if (has('milho', 'corn')) return `ðŸŒ½${risk ? ` ${risk}` : ''}`;
    if (has('trigo', 'wheat')) return `ðŸŒ¾${risk ? ` ${risk}` : ''}`;
    if (has('gasóleo', 'gasoil', 'diesel')) return `â›½${risk ? ` ${risk}` : ''}`;
    if (has('fed fund', 'fed funds')) return `ðŸ¦${risk ? ` ${risk}` : ''}`;

    if (name.includes('brent') || name.includes('wti') || name.includes('crude') || sym.includes('wti') || sym.includes('brent')) return `ðŸ›¢ï¸${risk ? ` ${risk}` : ''}`;
    if (name.includes('gold') || name.includes('silver') || name.includes('copper') || cat.includes('metals')) return `ðŸª™${risk ? ` ${risk}` : ''}`;
    if (cat.includes('crypto') || name.includes('bitcoin') || name.includes('ethereum') || sym.includes('btc') || sym.includes('eth')) return `â‚¿${risk ? ` ${risk}` : ''}`;
    if (cat.includes('volatility') || name.includes('vix') || name.includes('volatility')) return `ðŸŒ¡ï¸${risk ? ` ${risk}` : ''}`;
    if (cat.includes('energy') || cat.includes('agriculture') || cat.includes('commodities')) return `ðŸŒ¾${risk ? ` ${risk}` : ''}`;
    if (cat.includes('rates') || name.includes('yield') || name.includes('bond') || sym.includes('=rr')) {
        const f = countryHint();
        return `${f || 'ðŸ“ˆ'}${risk ? ` ${risk}` : ''}`;
    }
    if (cat.includes('credit') || name.includes('cds') || tags.includes('credit')) {
        const f = countryHint();
        return `${f || 'ðŸ§¾'}${risk ? ` ${risk}` : ''}`;
    }
    if (cat.includes('fx') || name.includes('usd/') || name.includes('/usd') || name.includes('dollar') || name.includes('eur/') || name.includes('/eur')) {
        const flags = fxPairFlags(row && row.symbol ? row.symbol : row && row.name ? row.name : '');
        return `${flags || 'ðŸ’±'}${risk ? ` ${risk}` : ''}`;
    }
    if (cat.includes('emerging')) return `ðŸŒ${risk ? ` ${risk}` : ''}`;

    const f = countryHint();
    return `${f || 'ðŸ”¹'}${risk ? ` ${risk}` : ''}`;
}

function symbolKey(symbol) {
    const raw = String(symbol || '').trim();
    if (!raw) return '';
    return raw.split(/\s+/)[0].toUpperCase();
}

function loadFavorites() {
    try {
        const raw = localStorage.getItem('mercado_favorites');
        const arr = raw ? JSON.parse(raw) : [];
        return new Set(Array.isArray(arr) ? arr.map(s => String(s)) : []);
    } catch {
        return new Set();
    }
}

function saveFavorites(set) {
    try {
        const arr = Array.from(set);
        localStorage.setItem('mercado_favorites', JSON.stringify(arr));
    } catch {
    }
}

function toggleFavorite(symbol) {
    const fav = loadFavorites();
    if (fav.has(symbol)) fav.delete(symbol);
    else fav.add(symbol);
    saveFavorites(fav);
}

const BRAZIL_ADR_SYMBOLS = new Set([
    'ABEV.K',
    'BBD',
    'BBDO.K',
    'BOLSY.PK',
    'BSBR.K',
    'EMBJ.K',
    'EGIEY.PK',
    'GGB',
    'LND',
    'NU',
    'PAGS.K',
    'PBR',
    'PBRA',
    'SID',
    'STNE.O',
    'SUZ',
    'UGP',
    'VALE.K',
    'WEGZY.PK',
    'BDORY.PK',
    'ITUB.K',
    'XP.O',
]);

function isBrazilAdr(row) {
    const name = String(row && row.name ? row.name : '');
    const sym = symbolKey(row && row.symbol ? row.symbol : '');
    if (BRAZIL_ADR_SYMBOLS.has(sym)) return true;
    if (/\bADR\b/i.test(name) && /\bbrasil\b|\bbrazil\b/i.test(name)) return true;
    if (/\bADR\b/i.test(name) && /\bpetrobras\b|\bvale\b|\bbradesco\b|\bembraer\b|\bgerdau\b|\bsantander brasil\b|\bsuzano\b|\bultrapar\b|\bweg\b|\bbrasilagro\b|\bb3\s+sa\b/i.test(name)) return true;
    return false;
}

function isBrazilRelated(row) {
    const name = String(row && row.name ? row.name : '');
    const sym = symbolKey(row && row.symbol ? row.symbol : '');
    if (!sym && !name) return false;
    if (isBrazilAdr(row)) return true;
    if (/\bbrazil\b|\bbrasil\b|\bibovespa\b|\bbovespa\b|\bb3\b/i.test(name)) return true;
    if (sym.endsWith('.SA')) return true;
    if (/\bUSD\/BRL\b|\bEUR\/BRL\b/i.test(sym) || /\/BRL\b/i.test(sym)) return true;
    if (/^BR\d+(YT|MT)=RR$/i.test(sym) || /^BRGV/i.test(sym) || /BR10YT=RR|BR5YT=RR|BR2YT=RR|BR1YT=RR/i.test(sym)) return true;
    if (/^US10BR10=RR$/i.test(sym)) return true;
    if (sym === '.BVSP' || sym === '.IBRX' || sym === '.IBRA' || sym === '.IBX50') return true;
    if (/^BRc1$/i.test(sym) || /^WDO/i.test(sym) || /^WIN/i.test(sym)) return true;
    if (/^EWZ$/i.test(sym) || /^EWZS\.O$/i.test(sym) || /^BOVA11\.SA$/i.test(sym)) return true;
    if (/\bBrazil\b/i.test(name) && (String(row && row.category ? row.category : '') === 'rates' || String(row && row.category ? row.category : '') === 'emerging')) return true;
    return false;
}

function brazilGroup(row) {
    const name = String(row && row.name ? row.name : '');
    const sym = symbolKey(row && row.symbol ? row.symbol : '');
    if (isBrazilAdr(row)) return 'Empresas BR (ADR)';
    if (sym.endsWith('.SA')) return 'B3 (Ações/ETFs)';
    if (/\bUSD\/BRL\b|\bEUR\/BRL\b/i.test(sym) || /\/BRL\b/i.test(sym) || /^BRc1$/i.test(sym) || /^WDO/i.test(sym)) return 'Câmbio BRL';
    if (/^BR\d+(YT|MT)=RR$/i.test(sym) || (String(row && row.category ? row.category : '') === 'rates' && /\bBrazil\b/i.test(name))) return 'Juros Brasil';
    if (/^BRGV/i.test(sym) || /\bCDS\b/i.test(name)) return 'Risco País (CDS)';
    if (sym === '.BVSP' || /bovespa|ibovespa/i.test(name) || /^IBRA$/i.test(sym) || /^IBRX$/i.test(sym) || /^IBX50$/i.test(sym) || /^VXBR$/i.test(sym)) return 'Índices & Volatilidade';
    if (/^EWZ$/i.test(sym) || /^EWZS\.O$/i.test(sym) || /ETF/i.test(name)) return 'ETFs Brasil';
    if (/^WIN/i.test(sym)) return 'Índice (Futuros)';
    return 'Brasil (Outros)';
}

function brazilBadgeHtml(row) {
    if (!isBrazilAdr(row)) return '';
    return `<span style="margin-left:10px;font-size:11px;padding:2px 7px;border-radius:999px;border:1px solid rgba(0,243,255,.35);color:rgba(0,243,255,.95);font-weight:900;letter-spacing:1px;">ADR BR</span>`;
}

function sparklineSvg(points) {
    const pts = Array.isArray(points) ? points.filter(p => p && typeof p.price === 'number') : [];
    if (pts.length < 2) {
        return `<svg viewBox="0 0 90 26" width="90" height="26" style="display:block;opacity:.55"><path d="M2 13 L88 13" stroke="rgba(255,255,255,.25)" stroke-width="2" fill="none"/></svg>`;
    }

    const slice = pts.slice(Math.max(0, pts.length - 24));
    const values = slice.map(p => p.price);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = Math.max(1e-9, max - min);

    const w = 90;
    const h = 26;
    const padX = 2;
    const padY = 3;
    const innerW = w - padX * 2;
    const innerH = h - padY * 2;

    const coords = slice
        .map((p, i) => {
            const x = padX + (innerW * i) / Math.max(1, slice.length - 1);
            const y = padY + innerH - ((p.price - min) / range) * innerH;
            return `${x.toFixed(2)},${y.toFixed(2)}`;
        })
        .join(' ');

    const first = slice[0].price;
    const last = slice[slice.length - 1].price;
    const tone = last > first ? 'rgba(0,255,160,.95)' : last < first ? 'rgba(255,60,80,.95)' : 'rgba(255,255,255,.55)';
    const fill = 'rgba(0,0,0,0)';

    return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" style="display:block">
        <polyline points="${coords}" fill="${fill}" stroke="${tone}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></polyline>
    </svg>`;
}

function createTable(containerId, rows, data, onSelect, opts = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!rows.length) {
        container.innerHTML = '<p style="opacity:.8">Sem dados para esta categoria.</p>';
        return;
    }

    const limit = typeof opts.limit === 'number' ? opts.limit : opts.limit === null ? null : 60;
    const sortable = opts.sortable !== false;
    const grouped = !!opts.grouped;
    let sortKey = opts.sortKey || null;
    let sortDir = opts.sortDir || null;
    const tableKey = String(opts.tableKey || containerId);
    const showToolbar = opts.toolbar !== false;
    const enableFavorites = opts.favorites !== false;
    const allowExport = opts.export !== false;
    const modes = Array.isArray(opts.modes)
        ? opts.modes
        : [
              { k: 'all', label: 'Tudo' },
              { k: 'br', label: 'Brasil' },
              { k: 'adr', label: 'ADR BR' },
              { k: 'risk_on', label: 'Risk-On' },
              { k: 'risk_off', label: 'Risk-Off' },
          ];

    const storedQueryKey = `mercado_table_q:${tableKey}`;
    const storedModeKey = `mercado_table_mode:${tableKey}`;
    let filterQuery = '';
    let filterMode = 'all';
    try {
        filterQuery = String(localStorage.getItem(storedQueryKey) || '');
        filterMode = String(localStorage.getItem(storedModeKey) || 'all');
    } catch {
    }

    const keyMeta = {
        name: { label: 'Ativo', align: 'left', minWidth: null, numeric: false },
        pct: { label: 'VariaÃ§Ã£o', align: 'right', minWidth: 110, numeric: true },
        trend: { label: 'TendÃªncia', align: 'right', minWidth: 110, numeric: true },
        symbol: { label: 'SÃ­mbolo', align: 'left', minWidth: 140, numeric: false },
        time: { label: 'AtualizaÃ§Ã£o', align: 'right', minWidth: 170, numeric: true },
    };

    const defaultDirForKey = key => (keyMeta[key] && keyMeta[key].numeric ? 'desc' : 'asc');

    const getTrendPct = symbol => {
        const pts = (data && data.series && data.series[symbol]) ? data.series[symbol] : [];
        const prices = Array.isArray(pts) ? pts.filter(p => p && typeof p.price === 'number') : [];
        if (prices.length < 2) return 0;
        const slice = prices.slice(Math.max(0, prices.length - 24));
        const first = slice[0].price;
        const last = slice[slice.length - 1].price;
        if (!first || !Number.isFinite(first) || !Number.isFinite(last)) return 0;
        return ((last - first) / first) * 100;
    };

    const getRowVal = (r, key) => {
        if (!r || r.separator) return null;
        if (key === 'name') return String(r.name || '');
        if (key === 'symbol') return String(r.symbol || '');
        if (key === 'pct') return pointPct(r.last) ?? -Infinity;
        if (key === 'trend') return getTrendPct(r.symbol);
        if (key === 'time') {
            const t = r.last && r.last.t ? Date.parse(r.last.t) : NaN;
            return Number.isFinite(t) ? t : -Infinity;
        }
        return null;
    };

    const compareRows = (a, b, key, dir) => {
        const meta = keyMeta[key];
        const av = getRowVal(a, key);
        const bv = getRowVal(b, key);
        const direction = dir === 'asc' ? 1 : -1;
        if (!meta || !meta.numeric) {
            const as = String(av || '');
            const bs = String(bv || '');
            return direction * as.localeCompare(bs);
        }
        const an = typeof av === 'number' ? av : -Infinity;
        const bn = typeof bv === 'number' ? bv : -Infinity;
        if (an === bn) return 0;
        return direction * (an - bn);
    };

    const sortPlain = (list, key, dir) => list.slice().sort((a, b) => compareRows(a, b, key, dir));

    const sortGrouped = (list, key, dir) => {
        const out = [];
        let currentSep = null;
        let block = [];
        const flush = () => {
            if (currentSep) out.push(currentSep);
            if (block.length) out.push(...sortPlain(block, key, dir));
            currentSep = null;
            block = [];
        };
        for (const r of list) {
            if (r && r.separator) {
                flush();
                currentSep = r;
                continue;
            }
            block.push(r);
        }
        flush();
        return out;
    };

    const applySort = list => {
        if (!sortable || !sortKey) return list;
        if (grouped) return sortGrouped(list, sortKey, sortDir || defaultDirForKey(sortKey));
        return sortPlain(list, sortKey, sortDir || defaultDirForKey(sortKey));
    };

    const matchesQuery = (r, q) => {
        const qq = String(q || '').trim().toLowerCase();
        if (!qq) return true;
        const hay = `${r.name || ''} ${r.symbol || ''} ${r.category || ''} ${(r.exchange || '')}`.toLowerCase();
        return hay.includes(qq);
    };

    const modePredicate = (r, mode) => {
        const m = String(mode || 'all');
        if (m === 'all') return true;
        if (m === 'br') return isBrazilRelated(r);
        if (m === 'adr') return isBrazilAdr(r);
        if (m === 'risk_on') return Array.isArray(r.tags) && r.tags.includes('risk_on');
        if (m === 'risk_off') return Array.isArray(r.tags) && r.tags.includes('risk_off');
        return true;
    };

    const filterGrouped = (list, pred) => {
        const out = [];
        let sep = null;
        let block = [];
        const flush = () => {
            const kept = block.filter(pred);
            if (sep && kept.length) out.push(sep, ...kept);
            sep = null;
            block = [];
        };
        for (const r of list) {
            if (r && r.separator) {
                flush();
                sep = r;
            } else {
                block.push(r);
            }
        }
        flush();
        return out;
    };

    const applyFilter = list => {
        const pred = r => matchesQuery(r, filterQuery) && modePredicate(r, filterMode);
        if (!showToolbar) return list;
        if (grouped) return filterGrouped(list, pred);
        return list.filter(r => r && !r.separator).filter(pred);
    };

    const headerCell = (key, meta) => {
        const arrow = sortKey === key ? (sortDir === 'asc' ? ' â–²' : ' â–¼') : '';
        const width = meta.minWidth ? `min-width:${meta.minWidth}px;width:1%;` : '';
        const clickable = sortable ? 'cursor:pointer;user-select:none;' : '';
        return `<th data-sort="${escapeHtml(key)}" style="text-align:${meta.align};padding:10px;border-bottom:1px solid rgba(255,255,255,.15);${width}${clickable}">${escapeHtml(meta.label)}${arrow}</th>`;
    };

    const render = () => {
        const filtered = applyFilter(rows);
        const ordered = applySort(filtered);
        const shown = limit === null ? ordered : ordered.slice(0, Math.max(0, limit));
        const fav = enableFavorites ? loadFavorites() : new Set();

        const buildCsv = list => {
            const csvEscape = v => {
                const s = v === null || v === undefined ? '' : String(v);
                if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
                return s;
            };

            const out = [];
            out.push(['Ativo', 'Simbolo', 'VariacaoPct', 'TendenciaPct', 'Atualizacao', 'Categoria', 'Exchange'].map(csvEscape).join(','));
            for (const r of list) {
                if (!r || r.separator) continue;
                const change = pointPct(r.last);
                const trend = getTrendPct(r.symbol);
                const updatedAt = r.last && r.last.t ? r.last.t : '';
                out.push(
                    [
                        r.name || '',
                        r.symbol || '',
                        change === null ? '' : Number(change.toFixed(4)),
                        Number(trend.toFixed(4)),
                        updatedAt,
                        r.category || '',
                        r.exchange || '',
                    ]
                        .map(csvEscape)
                        .join(',')
                );
            }
            return out.join('\n');
        };

        const toolbar = showToolbar
            ? `
            <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:10px;">
                <input data-table-search="1" type="text" value="${escapeHtml(filterQuery)}" placeholder="Buscar (nome, símbolo, categoria...)"
                    style="flex:1;min-width:220px;background:#141414;color:#e0e0e0;border:1px solid #333;padding:8px 10px;border-radius:4px;font-weight:700;" />
                <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
                    ${modes.length
                        ? modes
                              .map(b => {
                                  const active = filterMode === b.k;
                                  return `<button type="button" data-table-mode="${escapeHtml(b.k)}" style="background:${active ? 'rgba(0,243,255,.12)' : '#141414'};color:${active ? 'rgba(0,243,255,.95)' : '#e0e0e0'};border:1px solid ${active ? 'rgba(0,243,255,.35)' : '#333'};padding:7px 10px;border-radius:999px;font-weight:900;letter-spacing:1px;cursor:pointer;">
                                        ${escapeHtml(b.label)}
                                    </button>`;
                              })
                              .join('')
                        : ''}
                    ${allowExport
                        ? `<button type="button" data-table-export="1" style="background:#141414;color:#e0e0e0;border:1px solid #333;padding:7px 10px;border-radius:999px;font-weight:900;letter-spacing:1px;cursor:pointer;">
                            Exportar CSV
                        </button>`
                        : ''}
                </div>
            </div>
            `
            : '';

        const html = `
            ${toolbar}
            <table class="data-table" style="width:100%;border-collapse:collapse;table-layout:auto;">
                <thead>
                    <tr>
                        ${['name', 'pct', 'trend', 'symbol', 'time'].map(k => headerCell(k, keyMeta[k])).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${shown
                        .map(r => {
                            if (r && r.separator) {
                                return `
                            <tr>
                                <td colspan="5" style="padding:10px 10px;border-bottom:1px solid rgba(255,255,255,.10);background:rgba(0,0,0,.25);font-weight:900;letter-spacing:1px;opacity:.9;">
                                    ${escapeHtml(r.label || '')}
                                </td>
                            </tr>`;
                            }

                            const pct = pointPct(r.last);
                            const points = (data && data.series && data.series[r.symbol]) ? data.series[r.symbol] : [];
                            const clickable = typeof onSelect === 'function';
                            const updateTxt = r.last && r.last.t ? formatDateTime(r.last.t) : '—';
                            const pctHtml = pct === null ? '—' : toneBadgeHtml(pct, formatPercent(pct), { maxAbs: 5 });
                            const isFav = enableFavorites && fav.has(r.symbol);
                            const star = enableFavorites
                                ? `<button type="button" data-fav="${escapeHtml(r.symbol)}" title="Favoritar" style="background:transparent;border:0;padding:0;margin:0;cursor:pointer;font-size:16px;line-height:1;color:${isFav ? 'rgba(255,220,0,.95)' : 'rgba(255,255,255,.35)'};text-shadow:${isFav ? '0 0 10px rgba(255,220,0,.35)' : 'none'};">${isFav ? '★' : '☆'}</button>`
                                : '';

                            return `
                            <tr data-symbol="${escapeHtml(r.symbol)}" style="${clickable ? 'cursor:pointer;' : ''}">
                                <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.06);overflow:hidden;">
                                    <span style="display:inline-flex;align-items:center;gap:10px;min-width:0;max-width:100%;">
                                        ${star}
                                        <span style="font-size:18px;line-height:1;flex:0 0 auto;">${escapeHtml(assetIcon(r))}</span>
                                        <span style="min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:inline-block;">${escapeHtml(r.name)}${brazilBadgeHtml(r)}</span>
                                    </span>
                                </td>
                                <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.06);text-align:right;">${pctHtml}</td>
                                <td style="padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.06);text-align:right;">${sparklineSvg(points)}</td>
                                <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.06);opacity:.9">${escapeHtml(r.symbol)}</td>
                                <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.06);text-align:right;opacity:.9">${escapeHtml(updateTxt)}</td>
                            </tr>`;
                        })
                        .join('')}
                </tbody>
            </table>
        `;

        container.innerHTML = html;

        if (showToolbar) {
            const search = container.querySelector('input[data-table-search="1"]');
            if (search) {
                search.addEventListener('input', () => {
                    filterQuery = String(search.value || '');
                    try {
                        localStorage.setItem(storedQueryKey, filterQuery);
                    } catch {
                    }
                    render();
                });
            }
            container.querySelectorAll('button[data-table-mode]').forEach(btn => {
                btn.addEventListener('click', () => {
                    const mode = btn.getAttribute('data-table-mode') || 'all';
                    filterMode = mode;
                    try {
                        localStorage.setItem(storedModeKey, filterMode);
                    } catch {
                    }
                    render();
                });
            });

            const exportBtn = container.querySelector('button[data-table-export="1"]');
            if (exportBtn) {
                exportBtn.addEventListener('click', () => {
                    const list = applySort(applyFilter(rows));
                    const csv = buildCsv(list);
                    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    const ts = new Date().toISOString().replace(/[:.]/g, '-');
                    a.href = url;
                    a.download = `mercado_${tableKey}_${ts}.csv`;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    setTimeout(() => URL.revokeObjectURL(url), 250);
                });
            }
        }

        if (sortable) {
            container.querySelectorAll('th[data-sort]').forEach(th => {
                th.addEventListener('click', () => {
                    const key = th.getAttribute('data-sort');
                    if (!key) return;
                    if (sortKey === key) {
                        sortDir = sortDir === 'asc' ? 'desc' : 'asc';
                    } else {
                        sortKey = key;
                        sortDir = defaultDirForKey(key);
                    }
                    render();
                });
            });
        }

        if (enableFavorites) {
            container.querySelectorAll('button[data-fav]').forEach(btn => {
                btn.addEventListener('click', e => {
                    e.preventDefault();
                    e.stopPropagation();
                    const symbol = btn.getAttribute('data-fav');
                    if (!symbol) return;
                    toggleFavorite(symbol);
                    render();
                    document.dispatchEvent(new CustomEvent('mercado:favoritesChanged', { detail: { symbol } }));
                });
            });
        }

        container.querySelectorAll('tr[data-symbol]').forEach(tr => {
            tr.addEventListener('click', () => {
                const symbol = tr.getAttribute('data-symbol');
                if (symbol && typeof onSelect === 'function') onSelect(symbol);
            });
        });
    };

    render();
}

function computeCategoryAverages(data, categoryGroups) {
    return categoryGroups.map(g => {
        const rows = buildRows(data, g.categories);
        const changes = rows.map(r => pointPct(r.last)).filter(v => typeof v === 'number');
        const avg = changes.length ? changes.reduce((a, b) => a + b, 0) / changes.length : 0;
        return { key: g.key, label: g.label, avg, count: rows.length };
    });
}

function computeFlowScore(data) {
    const catalog = (typeof window !== 'undefined' && window.InstrumentsCatalog) ? window.InstrumentsCatalog : null;
    const dcDeps = buildDcDeps();
    const catDeps = buildCatDeps(dcDeps);
    const rcKey = (key, fallbackMatcher) => {
        const sym = catalog && typeof catalog.resolveRatesCreditByKey === 'function'
            ? catalog.resolveRatesCreditByKey(catDeps, data, key)
            : null;
        if (sym) return sym;
        if (fallbackMatcher instanceof RegExp) return findAssetSymbol(data, fallbackMatcher);
        return null;
    };

    const assets = data && Array.isArray(data.assets) ? data.assets : [];
    const mostRecentMs = (symbol) => {
        if (!symbol) return -Infinity;
        const last = (typeof getMostRecentPointWithPrice === 'function' ? getMostRecentPointWithPrice(data, symbol) : null) || getLastPoint(data, symbol);
        const t = last && last.t ? Date.parse(String(last.t)) : NaN;
        return Number.isFinite(t) ? t : -Infinity;
    };
    const pickBestByMatchers = (matchers, { limit = 12 } = {}) => {
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

    const pctOf = (matcherOrAlias, { invert = false } = {}) => {
        const sym = (() => {
            if (typeof matcherOrAlias === 'string') {
                if (matcherOrAlias === 'US10Y') return rcKey('US_10Y', /(^US10YT=RR$|^US10YT=X$|^\.TNX$|\^TNX)/i) || (findAliasSymbolBest(data, matcherOrAlias) || findAliasSymbol(data, matcherOrAlias));
                if (matcherOrAlias === 'VIX') return (findAliasSymbolBest(data, 'VIX9D') || findAliasSymbolBest(data, 'VIX') || findAliasSymbol(data, 'VIX') || pickBestByMatchers([/^\.?VIX(9D)?$/i, /^VIX$/i]));
                if (matcherOrAlias === 'DXY') return (findAliasSymbolBest(data, 'DXY') || findAliasSymbol(data, 'DXY') || pickBestByMatchers([/(^\.DXY$|\bDXY\b|US Dollar Index|\bUSDX\b|Dollar Index)/i]));
                return (findAliasSymbolBest(data, matcherOrAlias) || findAliasSymbol(data, matcherOrAlias));
            }
            if (matcherOrAlias instanceof RegExp) return pickBestByMatchers([matcherOrAlias], { limit: 8 }) || findAssetSymbol(data, matcherOrAlias);
            return null;
        })();
        if (!sym) return null;
        const last = (typeof getMostRecentPointWithPrice === 'function' ? getMostRecentPointWithPrice(data, sym) : null) || getLastPoint(data, sym);
        const v = pointPct(last);
        if (v === null || v === undefined || !Number.isFinite(v)) return null;
        return invert ? -v : v;
    };

    const cap = (v, maxAbs) => {
        const x = typeof v === 'number' && Number.isFinite(v) ? v : 0;
        const m = typeof maxAbs === 'number' && Number.isFinite(maxAbs) && maxAbs > 0 ? maxAbs : 2;
        return Math.max(-m, Math.min(m, x));
    };

    const ibovPct = pctOf('IBOV');
    const ibrxPct = pctOf('IBRX');
    const br20Pct = pctOf('BR20');
    const ifncPct = pctOf('IFNC') ?? pctOf(/^XLF$/i);
    const imatPct = pctOf('IMAT') ?? pctOf(/^XLB$/i);
    const usdbRLInv = pctOf(/^USD\/BRL\b/i, { invert: true });

    const parts = [
        { k: 'SPX', w: 0.18, v: pctOf('SPX') ?? pctOf(/(^\.SPX$|^\^GSPC$|^SPX$|^SPY(\b|$)|^IVV(\b|$)|^VOO(\b|$)|^ES[HMUZ]\d{1,2}(\b|=\$)?|S&P\s*500)/i) },
        { k: 'NQ', w: 0.12, v: pctOf('NDX') ?? pctOf(/(^\.NDX$|^NDX$|^QQQ(\b|$)|^NQ[HMUZ]\d{1,2}(\b|=\$)?|Nasdaq\s*100)/i) },
        { k: 'EEM', w: 0.10, v: pctOf(/^EEM$/i) },
        { k: 'EWZ', w: 0.08, v: pctOf('EWZ') },
        { k: 'IBOV', w: 0.08, v: ibovPct ?? null },
        { k: 'IBRX', w: 0.06, v: ibrxPct ?? null },
        { k: 'BR20', w: 0.05, v: br20Pct ?? null },
        { k: 'IFNC', w: 0.05, v: ifncPct ?? null },
        { k: 'IMAT', w: 0.05, v: imatPct ?? null },
        { k: 'CHINA', w: 0.06, v: pctOf('CHINA') },
        { k: 'VIX', w: 0.09, v: pctOf('VIX', { invert: true }) },
        { k: 'DXY', w: 0.08, v: pctOf('DXY', { invert: true }) },
        { k: 'USD/BRL', w: 0.07, v: usdbRLInv ?? null },
        { k: 'US10Y', w: 0.06, v: pctOf('US10Y', { invert: true }) },
        { k: 'CDS BR', w: 0.05, v: pctOf(/(^BRGV5YUSAC=R$|\bCDS\b.*\bBrasil\b|\bBrasil\b.*\bCDS\b)/i, { invert: true }) },
        { k: 'Brent/WTI', w: 0.08, v: pctOf('OIL') },
        { k: 'MinÃ©rio', w: 0.07, v: pctOf('IRON') },
        { k: 'Soja', w: 0.05, v: pctOf('SOY') },
        { k: 'Cobre', w: 0.04, v: pctOf('COPPER') },
        { k: 'BCI', w: 0.03, v: pctOf('BCI') },
        { k: 'AUD/USD', w: 0.05, v: pctOf(/^AUD\/USD\b/i) },
        { k: 'NZD/USD', w: 0.03, v: pctOf(/^NZD\/USD\b/i) },
        { k: 'USD/CAD', w: 0.03, v: pctOf(/^USD\/CAD\b/i, { invert: true }) },
        { k: 'USD/RUB', w: 0.03, v: pctOf(/^USD\/RUB\b/i, { invert: true }) },
        { k: 'USD/JPY', w: 0.03, v: pctOf(/^USD\/JPY\b/i) },
    ];

    const usable = parts.filter(x => typeof x.v === 'number' && Number.isFinite(x.v) && typeof x.w === 'number' && x.w > 0);
    const wSum = usable.reduce((s, x) => s + x.w, 0);
    const score = wSum > 0
        ? usable.reduce((s, x) => s + ((cap(x.v, 2) / 2) * x.w), 0) / wSum
        : 0;

    let label = 'Neutro';
    if (score > 0.08) label = 'Risk-On';
    if (score < -0.08) label = 'Risk-Off';
    return { score, label };
}

function renderTopMovers(data) {
    const el = document.getElementById('topMovers');
    if (!el) return;

    const nowMs = Date.now();
    const assets = Array.isArray(data && data.assets ? data.assets : []) ? data.assets : [];
    const lastOf = (symbol) => (typeof getMostRecentPointWithPrice === 'function' ? getMostRecentPointWithPrice(data, symbol) : null) || getLastPoint(data, symbol);
    const parseTms = (p) => {
        const t = p && p.t ? Date.parse(String(p.t)) : NaN;
        return Number.isFinite(t) ? t : null;
    };
    const isNum = (v) => typeof v === 'number' && Number.isFinite(v);

    const hardMaxAbs = 80;
    const rowsAll = (() => {
        const out = [];
        const seen = new Set();
        for (const a of assets) {
            if (!a || typeof a !== 'object') continue;
            const sym = a.symbol ? String(a.symbol) : '';
            if (!sym) continue;
            const key = symbolKey(sym) || sym;
            if (seen.has(key)) continue;
            const last = lastOf(sym);
            if (!last) continue;
            const pct = pointPct(last);
            const price = last && typeof last.price === 'number' ? last.price : null;
            if (!isNum(pct) || !isNum(price) || !(price > 0)) continue;
            if (Math.abs(pct) > hardMaxAbs) continue;
            const tMs = parseTms(last);
            out.push({ a, last, pct, tMs, key });
            seen.add(key);
        }
        return out;
    })();

    const staleMs = 4 * 60 * 60 * 1000;
    const rowsFresh = rowsAll.filter(x => typeof x.tMs === 'number' && (nowMs - x.tMs) <= staleMs);

    const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
    const pickTopN = (list, dir, n) => {
        const arr = Array.isArray(list) ? list.slice() : [];
        arr.sort((a, b) => (dir === 'up' ? (b.pct - a.pct) : (a.pct - b.pct)));

        const preferred = dir === 'up'
            ? arr.filter(x => x.pct > 0)
            : arr.filter(x => x.pct < 0);
        const fallback = dir === 'up'
            ? arr.filter(x => x.pct <= 0)
            : arr.filter(x => x.pct >= 0);

        const out = [];
        const seen = new Set();
        const takeFrom = (xs) => {
            for (const x of xs) {
                if (!x || !x.key || seen.has(x.key)) continue;
                out.push(x);
                seen.add(x.key);
                if (out.length >= n) break;
            }
        };
        takeFrom(preferred);
        if (out.length < n) takeFrom(fallback);
        return out;
    };

    const groupDefs = [
        { key: 'equities', label: 'Ações / Índices', categories: ['equities'], target: 'all-assets', tableKey: 'all', n: 3 },
        { key: 'fx', label: 'FX', categories: ['fx_g10', 'fx_emerging', 'fx'], target: 'all-assets', tableKey: 'all', n: 3 },
        { key: 'commodities', label: 'Commodities', categories: ['commodities', 'energy', 'agriculture'], target: 'all-assets', tableKey: 'all', n: 3 },
        { key: 'metals', label: 'Metais', categories: ['metals'], target: 'all-assets', tableKey: 'all', n: 3 },
        { key: 'crypto', label: 'Cripto', categories: ['crypto'], target: 'all-assets', tableKey: 'all', n: 3 },
        { key: 'credit', label: 'Crédito', categories: ['credit'], target: 'all-assets', tableKey: 'all', n: 3 },
        { key: 'rates', label: 'Juros', categories: ['rates'], target: 'all-assets', tableKey: 'all', n: 3 },
        { key: 'vol', label: 'Volatilidade', categories: ['volatility'], target: 'all-assets', tableKey: 'all', n: 3 },
        { key: 'emerging', label: 'Emergentes', categories: ['emerging'], target: 'all-assets', tableKey: 'all', n: 3 },
        { key: 'other', label: 'Outros', categories: ['other'], target: 'all-assets', tableKey: 'all', n: 2 },
        { key: 'br', label: 'Brasil', predicate: isBrazilRelated, target: 'brazil-market', tableKey: 'br', n: 3 },
    ];

    const groupHasAny = (g) => {
        const base = (g.predicate ? rowsAll.filter(x => g.predicate({ ...x.a, last: x.last })) : rowsAll.filter(x => g.categories.includes(String(x.a && x.a.category ? x.a.category : '').toLowerCase())));
        return base.length > 0;
    };
    const groups = groupDefs.filter(groupHasAny);

    const cards = groups.map(g => {
        const listAll = g.predicate
            ? rowsAll.filter(x => g.predicate({ ...x.a, last: x.last }))
            : rowsAll.filter(x => g.categories.includes(String(x.a && x.a.category ? x.a.category : '').toLowerCase()));
        const listFresh = g.predicate
            ? rowsFresh.filter(x => g.predicate({ ...x.a, last: x.last }))
            : rowsFresh.filter(x => g.categories.includes(String(x.a && x.a.category ? x.a.category : '').toLowerCase()));

        const n = Math.max(1, Math.floor(Number(g.n) || 2));
        const baseList = listFresh.length >= Math.min(2, n) ? listFresh : listAll;

        if (!baseList.length) return '';

        const ups = pickTopN(baseList, 'up', n);
        const downs = pickTopN(baseList, 'down', n);
        const used = [...ups, ...downs].filter(Boolean);
        const absSorted = used.map(x => Math.abs(x.pct)).filter(isNum).sort((a, b) => a - b);
        const p90 = absSorted.length ? absSorted[Math.max(0, Math.floor(absSorted.length * 0.9) - 1)] : 5;
        const scaleAbs = clamp(isNum(p90) ? p90 : 5, 1.5, 12);

        const ageLabel = (x) => {
            if (!x || typeof x.tMs !== 'number') return '';
            const age = nowMs - x.tMs;
            if (!Number.isFinite(age) || age < 0) return '';
            if (age <= staleMs) return '';
            const mins = Math.round(age / 60000);
            if (!(mins > 0)) return '';
            return `<span style="opacity:.62;font-size:11px;margin-left:8px;">(${escapeHtml(`${mins}m`)})</span>`;
        };

        const line = (x, dir) => {
            if (!x) return '';
            const pct = x.pct;
            const arrow = dir === 'up' ? '▲' : '▼';
            const abs = Math.abs(pct);
            const a = clamp(abs / scaleAbs, 0.18, 0.85);
            const tone = pct > 0 ? 'tm-item--pos' : pct < 0 ? 'tm-item--neg' : 'tm-item--neu';
            const badge = toneBadgeHtml(pct, formatPercent(pct), { maxAbs: scaleAbs });
            return `
                <div class="tm-item ${tone}" data-tm="${escapeHtml(g.tableKey)}" data-target="${escapeHtml(g.target)}" data-symbol="${escapeHtml(x.a.symbol)}" style="--tm-a:${String(a)};">
                    <div style="min-width:0;">
                        <div style="font-weight:900;letter-spacing:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${arrow} ${escapeHtml(symbolKey(x.a.symbol) || x.a.symbol)}</div>
                        <div style="opacity:.82;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(x.a.name || '')}${ageLabel(x)}</div>
                    </div>
                    <div style="text-align:right;min-width:90px;font-weight:900;align-self:center;">${badge}</div>
                </div>
            `;
        };

        const titleMeta = `<span style="opacity:.72;font-size:11px;margin-left:8px;">${escapeHtml(`${ups.length}↑/${downs.length}↓`)}</span>`;

        return `
            <div class="tm-card">
                <div class="tm-card__title">${escapeHtml(g.label)}${titleMeta}</div>
                <div class="tm-card__list">
                    ${ups.map(x => line(x, 'up')).join('')}
                    ${downs.map(x => line(x, 'down')).join('')}
                </div>
            </div>
        `;
    }).filter(Boolean).join('');

    el.innerHTML = `<div class="tm-grid">${cards}</div>`;

    el.querySelectorAll('[data-symbol][data-target][data-tm]').forEach(node => {
        node.addEventListener('click', () => {
            const symbol = node.getAttribute('data-symbol') || '';
            const target = node.getAttribute('data-target') || '';
            const tableKey = node.getAttribute('data-tm') || '';
            if (!symbol || !tableKey) return;
            try {
                localStorage.setItem(`mercado_table_q:${tableKey}`, symbolKey(symbol));
                localStorage.setItem(`mercado_table_mode:${tableKey}`, 'all');
            } catch {
            }

            if (tableKey === 'br') renderBrazilMarket(data);
            if (tableKey === 'all') renderAllAssetsTable(data);
            location.hash = `#${target}`;
        });
    });
}

function renderRegimeConviction(data) {
    const el = document.getElementById('regimeConviction');
    if (!el) return;

    const dc = (typeof window !== 'undefined' && window.DecisionCore) ? window.DecisionCore : null;
    const dcDeps = { findAliasSymbolBest, findAliasSymbol, findAssetSymbol, getLastPoint };
    const catalog = (typeof window !== 'undefined' && window.InstrumentsCatalog) ? window.InstrumentsCatalog : null;
    const catDeps = { findAliasSymbolBest, findAliasSymbol, findAssetSymbol, dcDeps };
    const rcKey = (key, fallbackMatcher) => {
        const sym = catalog && typeof catalog.resolveRatesCreditByKey === 'function'
            ? catalog.resolveRatesCreditByKey(catDeps, data, key)
            : null;
        if (sym) return sym;
        if (fallbackMatcher instanceof RegExp) return findAssetSymbol(data, fallbackMatcher);
        return null;
    };

    const aliasSym = k => findAliasSymbolBest(data, k) || findAliasSymbol(data, k);
    const symOf = (aliasKey, matcher) => aliasSym(aliasKey) || (matcher ? findAssetSymbol(data, matcher) : null);

    const assets = data && Array.isArray(data.assets) ? data.assets : [];
    const mostRecentMs = (symbol) => {
        if (!symbol) return -Infinity;
        const last = (typeof getMostRecentPointWithPrice === 'function' ? getMostRecentPointWithPrice(data, symbol) : null) || getLastPoint(data, symbol);
        const t = last && last.t ? Date.parse(String(last.t)) : NaN;
        return Number.isFinite(t) ? t : -Infinity;
    };
    const pickBestByMatchers = (matchers, { limit = 12 } = {}) => {
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
    const symBest = (aliasKey, matchers) => aliasSym(aliasKey) || pickBestByMatchers(matchers);

    const downgradeConvictionLabel = (label, steps) => {
        const s = Math.max(0, Math.floor(Number(steps) || 0));
        let out = String(label || '');
        for (let i = 0; i < s; i++) {
            if (out === 'ALTA') out = 'MÉDIA';
            else if (out === 'MÉDIA') out = 'BAIXA';
            else out = 'BAIXA';
        }
        return out;
    };

    const buildReturnSeries = (symbol, maxPoints) => {
        if (!symbol) return [];
        const pts = (data && data.series && data.series[symbol]) ? data.series[symbol] : [];
        const priced = Array.isArray(pts)
            ? pts
                .map(p => {
                    const tMs = p && p.t ? Date.parse(p.t) : NaN;
                    const price = p && typeof p.price === 'number' && Number.isFinite(p.price) ? p.price : null;
                    return Number.isFinite(tMs) && typeof price === 'number' ? { tMs, price } : null;
                })
                .filter(Boolean)
            : [];
        if (priced.length < 3) return [];
        const n = Math.max(6, Math.floor(Number(maxPoints) || 72));
        const slice = priced.slice(Math.max(0, priced.length - n));
        const out = [];
        for (let i = 1; i < slice.length; i++) {
            const prev = slice[i - 1];
            const cur = slice[i];
            if (!prev || !cur) continue;
            if (!(prev.price > 0) || !(cur.price > 0)) continue;
            const r = Math.log(cur.price / prev.price);
            if (!Number.isFinite(r)) continue;
            out.push({ tMs: cur.tMs, r });
        }
        return out;
    };

    const correlationAligned = (a, b) => {
        const mapB = new Map(b.map(x => [x.tMs, x.r]));
        const xs = [];
        const ys = [];
        for (const x of a) {
            if (!x || !Number.isFinite(x.tMs) || !Number.isFinite(x.r)) continue;
            const y = mapB.get(x.tMs);
            if (typeof y !== 'number' || !Number.isFinite(y)) continue;
            xs.push(x.r);
            ys.push(y);
        }
        const n = xs.length;
        if (n < 12) return { corr: null, n };
        const mx = xs.reduce((s, v) => s + v, 0) / n;
        const my = ys.reduce((s, v) => s + v, 0) / n;
        let cov = 0;
        let vx = 0;
        let vy = 0;
        for (let i = 0; i < n; i++) {
            const dx = xs[i] - mx;
            const dy = ys[i] - my;
            cov += dx * dy;
            vx += dx * dx;
            vy += dy * dy;
        }
        const denom = Math.sqrt(vx * vy);
        if (!(denom > 0) || !Number.isFinite(denom)) return { corr: null, n };
        const c = cov / denom;
        return { corr: Number.isFinite(c) ? Math.max(-1, Math.min(1, c)) : null, n };
    };

    const sentinelSymbols = {
        audusd: pickBestByMatchers([/^AUD\/USD\b/i]) || findAssetSymbol(data, /^AUD\/USD\b/i),
        nzdusd: pickBestByMatchers([/^NZD\/USD\b/i]) || findAssetSymbol(data, /^NZD\/USD\b/i),
        usdcad: pickBestByMatchers([/^USD\/CAD\b/i]) || findAssetSymbol(data, /^USD\/CAD\b/i),
        usdrub: pickBestByMatchers([/^USD\/RUB\b/i]) || findAssetSymbol(data, /^USD\/RUB\b/i),
        usdjpy: pickBestByMatchers([/^USD\/JPY\b/i]) || findAssetSymbol(data, /^USD\/JPY\b/i),
        usdchf: pickBestByMatchers([/^USD\/CHF\b/i]) || findAssetSymbol(data, /^USD\/CHF\b/i),
        usdsek: pickBestByMatchers([/^USD\/SEK\b/i]) || findAssetSymbol(data, /^USD\/SEK\b/i),
        dxy: aliasSym('DXY') || pickBestByMatchers([/(^\.DXY$|\bDXY\b|US Dollar Index|\bUSDX\b|Dollar Index)/i]) || findAssetSymbol(data, /(^\.DXY$|\bDXY\b|US Dollar Index|\bUSDX\b|Dollar Index)/i),
        vix: findAliasSymbolBest(data, 'VIX9D') || findAliasSymbolBest(data, 'VIX30') || aliasSym('VIX') || pickBestByMatchers([/^\.?VIX(9D)?$/i, /^VIX$/i]) || findAssetSymbol(data, /^\.?VIX(9D)?$/i),
        vhsi: aliasSym('VHSI') || pickBestByMatchers([/^\.?VHSI/i, /\bHang\s*Seng\b.*Vol/i]) || findAssetSymbol(data, /^\.?VHSI/i),
        brent: aliasSym('BRENT') || pickBestByMatchers([/\bBrent\b/i, /^(LCO|BRN)c\d/i, /^BZ=F$/i]) || findAssetSymbol(data, /\bBrent\b/i),
        wti: aliasSym('WTI') || pickBestByMatchers([/\bWTI\b/i, /^CL=F$/i, /^CLc\d/i]) || findAssetSymbol(data, /\bWTI\b/i),
        usdbbrl: symOf('USD_BRL', /^USD\/BRL\b/i),
        usdcnh: pickBestByMatchers([/^USD\/CNH\b/i, /^USD\/CNY\b/i]) || findAssetSymbol(data, /^USD\/CNH\b/i) || findAssetSymbol(data, /^USD\/CNY\b/i),
        usdmxn: pickBestByMatchers([/^USD\/MXN\b/i]) || findAssetSymbol(data, /^USD\/MXN\b/i),
        usdzar: pickBestByMatchers([/^USD\/ZAR\b/i]) || findAssetSymbol(data, /^USD\/ZAR\b/i),
        usdclp: pickBestByMatchers([/^USD\/CLP\b/i]) || findAssetSymbol(data, /^USD\/CLP\b/i),
        usdtry: pickBestByMatchers([/^USD\/TRY\b/i]) || findAssetSymbol(data, /^USD\/TRY\b/i),
        spx: symBest('SPX', [/(^\.SPX$|^\^GSPC$|^SPX$|^SPY(\b|$)|^IVV(\b|$)|^VOO(\b|$)|^ES[HMUZ]\d{1,2}(\b|=\$)?|S&P\s*500)/i]),
        ndx: symBest('NDX', [/(^\.NDX$|^NDX$|^QQQ(\b|$)|^NQ[HMUZ]\d{1,2}(\b|=\$)?|Nasdaq\s*100)/i]),
        hyg: rcKey('ETF_HYG', /^HYG(\.\w+)?$/i) || symBest('HYG', [/^HYG(\.\w+)?$/i]),
        eem: symBest('EEM', [/^EEM(\.\w+)?$/i]) || symBest('VWO', [/^VWO(\.\w+)?$/i]),
        btc: symBest('BTC', [/^BTC\/USD$/i, /\bbitcoin\b/i]),
    };

    const weightedAvg = (items) => {
        const pairs = (items || [])
            .map(x => ({ v: x && typeof x.val === 'number' && Number.isFinite(x.val) ? x.val : null, w: x && typeof x.weight === 'number' && Number.isFinite(x.weight) ? x.weight : 1 }))
            .filter(x => typeof x.v === 'number' && Number.isFinite(x.v) && typeof x.w === 'number' && Number.isFinite(x.w) && x.w > 0);
        const wsum = pairs.reduce((a, b) => a + b.w, 0);
        if (!(wsum > 0)) return null;
        const s = pairs.reduce((a, b) => a + b.v * b.w, 0);
        const score = s / wsum;
        return Number.isFinite(score) ? score : null;
    };

    const betaPosItems = [
        { label: 'AUD/USD', symbol: sentinelSymbols.audusd, sign: +1, weight: 1.0 },
        { label: 'NZD/USD', symbol: sentinelSymbols.nzdusd, sign: +1, weight: 1.0 },
        { label: 'USD/CAD', symbol: sentinelSymbols.usdcad, sign: -1, weight: 1.0 },
        { label: 'USD/RUB', symbol: sentinelSymbols.usdrub, sign: -1, weight: 1.0 },
        { label: 'SPX', symbol: sentinelSymbols.spx, sign: +1, weight: 0.55 },
        { label: 'NDX', symbol: sentinelSymbols.ndx, sign: +1, weight: 0.55 },
        { label: 'HYG', symbol: sentinelSymbols.hyg, sign: +1, weight: 0.45 },
        { label: 'EEM/VWO', symbol: sentinelSymbols.eem, sign: +1, weight: 0.35 },
        { label: 'Cobre', symbol: symOf('COPPER', /(^HG=F$|^HGc\d(=\$)?$|^HG$|Copper|\bCobre\b|^CPER(\b|$))/i), sign: +1, weight: 0.25 },
        { label: 'BTC', symbol: sentinelSymbols.btc, sign: +1, weight: 0.20 },
    ].map(x => ({ ...x, raw: getChangePct(data, x.symbol) }))
        .map(x => ({ ...x, val: x.raw === null ? null : x.sign * x.raw }));

    const betaNegItems = [
        { label: 'USD/JPY', symbol: sentinelSymbols.usdjpy, sign: -1, weight: 0.90 },
        { label: 'USD/CHF', symbol: sentinelSymbols.usdchf, sign: -1, weight: 0.90 },
        { label: 'USD/SEK', symbol: sentinelSymbols.usdsek, sign: -1, weight: 0.90 },
        { label: 'USD/CNH', symbol: sentinelSymbols.usdcnh, sign: +1, weight: 0.50 },
        { label: 'USD/MXN', symbol: sentinelSymbols.usdmxn, sign: +1, weight: 0.35 },
        { label: 'USD/ZAR', symbol: sentinelSymbols.usdzar, sign: +1, weight: 0.35 },
        { label: 'USD/CLP', symbol: sentinelSymbols.usdclp, sign: +1, weight: 0.25 },
        { label: 'USD/TRY', symbol: sentinelSymbols.usdtry, sign: +1, weight: 0.25 },
        { label: 'DXY', symbol: sentinelSymbols.dxy, sign: +1, weight: 1.0 },
        { label: 'VIX', symbol: sentinelSymbols.vix, sign: +1, weight: 1.0 },
        { label: 'VHSI', symbol: sentinelSymbols.vhsi, sign: +1, weight: 0.80 },
    ].map(x => ({ ...x, raw: getChangePct(data, x.symbol) }))
        .map(x => ({ ...x, val: x.raw === null ? null : x.sign * x.raw }));

    const betaPosScore = weightedAvg(betaPosItems);
    const betaNegScore = (() => {
        const scoreBase = weightedAvg(betaNegItems);
        if (!(typeof scoreBase === 'number' && Number.isFinite(scoreBase))) return null;
        let score = scoreBase;
        const vixItem = betaNegItems.find(x => x.label === 'VIX');
        const vhsiItem = betaNegItems.find(x => x.label === 'VHSI');
        const vixUp = vixItem && typeof vixItem.raw === 'number' && vixItem.raw >= 1.5;
        const vhsiUp = vhsiItem && typeof vhsiItem.raw === 'number' && vhsiItem.raw >= 1.5;
        if (vixUp && vhsiUp) score += 0.2;
        return score;
    })();
    const betaDelta = (typeof betaPosScore === 'number' ? betaPosScore : 0) - (typeof betaNegScore === 'number' ? betaNegScore : 0);

    const wti = getChangePct(data, sentinelSymbols.wti);
    const brent = getChangePct(data, sentinelSymbols.brent);
    const oilVals = [wti, brent].filter(v => typeof v === 'number' && Number.isFinite(v));
    const oilScore = oilVals.length ? Math.max(...oilVals) : null;

    const neutralThreshold = 0.12;
    const usdmxnPct = getChangePct(data, sentinelSymbols.usdmxn);
    const usdzarPct = getChangePct(data, sentinelSymbols.usdzar);
    const emCoreState =
        typeof usdmxnPct === 'number' && typeof usdzarPct === 'number'
            ? usdmxnPct > neutralThreshold && usdzarPct > neutralThreshold
                ? 'Stress EM (USD/EM ↑)'
                : usdmxnPct < -neutralThreshold && usdzarPct < -neutralThreshold
                    ? 'Bid EM (USD/EM ↓)'
                    : 'EM misto'
            : 'EM N/A';

    const usdclpPct = getChangePct(data, sentinelSymbols.usdclp);
    const usdtryPct = getChangePct(data, sentinelSymbols.usdtry);

    const emBasketComponents = [
        { label: 'USD/MXN', v: usdmxnPct, w: 0.35 },
        { label: 'USD/ZAR', v: usdzarPct, w: 0.35 },
        { label: 'USD/CLP', v: usdclpPct, w: 0.15 },
        { label: 'USD/TRY', v: usdtryPct, w: 0.15 },
    ].filter(x => typeof x.v === 'number' && Number.isFinite(x.v) && typeof x.w === 'number' && x.w > 0);

    const emBasketPct = emBasketComponents.length >= 2
        ? (() => {
            const wSum = emBasketComponents.reduce((s, x) => s + x.w, 0);
            if (!(wSum > 0)) return null;
            const v = emBasketComponents.reduce((s, x) => s + (x.v * x.w), 0) / wSum;
            return Number.isFinite(v) ? v : null;
        })()
        : null;

    const emBasketState =
        typeof emBasketPct === 'number'
            ? emBasketPct > neutralThreshold
                ? 'Stress EM (Basket USD/EM ↑)'
                : emBasketPct < -neutralThreshold
                    ? 'Bid EM (Basket USD/EM ↓)'
                    : 'EM misto'
            : 'EM N/A';

    const emGateState = emBasketState !== 'EM N/A' ? emBasketState : emCoreState;
    const emGateLabel = emBasketState !== 'EM N/A' ? 'Basket' : 'MXN+ZAR';

    const flow = computeFlowScore(data);
    const regimeScore = Number(flow.score.toFixed(3));
    const regimeLabel = flow.label;
    const regimeOperational =
        regimeLabel === 'Risk-On'
            ? { wdo: 'VENDA', win: 'COMPRA', hint: 'Risk-on tende a WDO↓ / WIN↑ (filtro, não gatilho).' }
            : regimeLabel === 'Risk-Off'
                ? { wdo: 'COMPRA', win: 'VENDA', hint: 'Risk-off tende a WDO↑ / WIN↓ (filtro, não gatilho).' }
                : { wdo: '—', win: '—', hint: 'Regime indefinido (filtro, não gatilho).' };

    const nowMs = Date.now();
    const rows = assets.map(a => ({ a, last: getLastPoint(data, a.symbol) }));
    const withPrice = rows.filter(x => x.last && typeof x.last.price === 'number');
    const withTime = withPrice
        .map(x => {
            const t = x.last && x.last.t ? Date.parse(x.last.t) : NaN;
            return { ...x, tMs: Number.isFinite(t) ? t : null };
        })
        .filter(x => x.tMs !== null);

    const staleMs = 6 * 60 * 60 * 1000;
    const fresh = withTime.filter(x => nowMs - x.tMs <= staleMs);
    const coverageRatio = assets.length ? withPrice.length / assets.length : 0;
    const freshnessRatio = withTime.length ? fresh.length / withTime.length : 0;

    const criticalMatchers = [
        { k: 'USD/BRL', a: 'USD_BRL' },
        { k: 'WDO', r: /^WDO/i },
        { k: 'WIN', r: /^WIN/i },
        { k: 'IBOV', r: /(^\.BVSP$|\bIbovespa\b)/i },
        { k: 'EWZ', r: /^EWZ$/i },
        { k: 'BOVA11', r: /^BOVA11\.SA$/i },
        { k: 'DXY', a: 'DXY' },
        { k: 'VIX', a: 'VIX', r: /(^\.(VIX|VIX9D)$|\bVIX\b|CBOE Volatility Index)/i },
        { k: 'Brent/WTI', a: 'OIL' },
        { k: 'FXI', a: 'FXI' },
        { k: 'CSI300', a: 'CSI300' },
        { k: 'Minério', a: 'IRON' },
        { k: 'Soja', a: 'SOY' },
        { k: 'Cobre', a: 'COPPER' },
        { k: 'BR10Y', rc: 'BR_10Y', r: /^BR10YT=RR$/i },
    ];
    const suggestionMatchers = [
        { k: 'SPX', a: 'SPX', r: /(^\.SPX$|^\^GSPC$|^SPX$|^SPY(\b|$)|^IVV(\b|$)|^VOO(\b|$)|^ES[HMUZ]\d{1,2}(\b|=\$)?|S&P\s*500)/i },
        { k: 'NDX', a: 'NDX', r: /(^\.NDX$|^NDX$|^QQQ(\b|$)|^NQ[HMUZ]\d{1,2}(\b|=\$)?|Nasdaq\s*100)/i },
        { k: 'HYG', rc: 'ETF_HYG', r: /^HYG(\.\w+)?$/i },
        { k: 'TLT', rc: 'ETF_TLT', r: /^TLT(\.\w+)?$/i },
        { k: 'EEM/VWO', a: 'EEM', r: /^EEM(\.\w+)?$/i },
        { k: 'BTC', a: 'BTC', r: /^BTC\/USD$/i },
        { k: 'US2Y', rc: 'US_2Y', r: /^US2YT=RR$/i },
        { k: 'US10Y', rc: 'US_10Y', r: /^US10YT=RR$/i },
    ];

    const criticalHits = criticalMatchers.map(m => {
        const sym = m.rc
            ? rcKey(m.rc, m.r)
            : m.a
                ? (findAliasSymbolBest(data, m.a) || findAliasSymbol(data, m.a) || (m.r ? findAssetSymbol(data, m.r) : null))
                : findAssetSymbol(data, m.r);
        if (!sym) return { ok: false, hasChg: false };
        const hasChg = dc ? dc.symbolHasChangePct(dcDeps, data, sym) : (getChangePct(data, sym) !== null);
        return { ok: true, hasChg };
    });
    const suggestionHits = suggestionMatchers.map(m => {
        const sym = m.rc
            ? rcKey(m.rc, m.r)
            : m.a
                ? (findAliasSymbolBest(data, m.a) || findAliasSymbol(data, m.a) || (m.r ? findAssetSymbol(data, m.r) : null))
                : findAssetSymbol(data, m.r);
        if (!sym) return { ok: false, hasChg: false };
        const hasChg = dc ? dc.symbolHasChangePct(dcDeps, data, sym) : (getChangePct(data, sym) !== null);
        return { ok: true, hasChg };
    });
    const criticalUsable = criticalHits.filter(x => x.ok && x.hasChg).length;
    const criticalRatio = criticalMatchers.length ? criticalUsable / criticalMatchers.length : 0;
    const criticalMissing = criticalMatchers
        .map((m, i) => ({ k: m.k, ok: !!(criticalHits[i] && criticalHits[i].ok && criticalHits[i].hasChg) }))
        .filter(x => !x.ok)
        .map(x => x.k);
    const suggestionMissing = suggestionMatchers
        .map((m, i) => ({ k: m.k, ok: !!(suggestionHits[i] && suggestionHits[i].ok && suggestionHits[i].hasChg) }))
        .filter(x => !x.ok)
        .map(x => x.k);

    let convictionScore = 0.5 * coverageRatio + 0.3 * freshnessRatio + 0.2 * criticalRatio;
    const divergences = [];
    if (withTime.length >= 10 && freshnessRatio < 0.65) {
        convictionScore *= 0.9;
        divergences.push('Muitos ativos com atualização antiga (>6h) → convicção reduzida');
    }
    if (regimeLabel === 'Risk-On' && betaDelta < -0.15) divergences.push('Fluxo (risk-on) diverge do bloco de proteção (beta)');
    if (regimeLabel === 'Risk-Off' && betaDelta > 0.15) divergences.push('Fluxo (risk-off) diverge do bloco de apetite (beta)');
    if (typeof oilScore === 'number' && oilScore > 1.2) {
        const rub = betaPosItems.find(x => x.label === 'USD/RUB');
        if (rub && typeof rub.val === 'number' && rub.val < 0) divergences.push('Petróleo forte sem confirmação em RUB');
    }
    if (divergences.length) convictionScore *= 0.92;

    if ((emGateState === 'Stress EM (Basket USD/EM ↑)' || emGateState === 'Stress EM (USD/EM ↑)') && regimeLabel === 'Risk-On') {
        convictionScore *= 0.94;
        divergences.push(`Emergentes (${emGateLabel}) sugerem stress enquanto o regime aponta risk-on`);
    }
    if ((emGateState === 'Bid EM (Basket USD/EM ↓)' || emGateState === 'Bid EM (USD/EM ↓)') && regimeLabel === 'Risk-Off') {
        convictionScore *= 0.94;
        divergences.push(`Emergentes (${emGateLabel}) sugerem bid enquanto o regime aponta risk-off`);
    }

    const usdcnhPct = getChangePct(data, sentinelSymbols.usdcnh);
    if (typeof usdcnhPct === 'number' && Number.isFinite(usdcnhPct) && usdcnhPct > 0.12 && regimeLabel === 'Risk-On') {
        convictionScore *= 0.94;
        divergences.push('USD/CNH sugere stress de China/EM enquanto o regime aponta risk-on');
    }

    const fxiSym = symOf('FXI', /^FXI$/i);
    const csiSym = symOf('CSI300', /^CSI300$/i);
    const ironSym = symOf('IRON', /^DCE_I0$/i);
    const soySym = symOf('SOY', /^ZS$/i);
    const copperSym = symOf('COPPER', /^HG$/i);

    const hasFxi = !!(fxiSym && (dc ? dc.symbolHasChangePct(dcDeps, data, fxiSym) : (getChangePct(data, fxiSym) !== null)));
    const hasCsi = !!(csiSym && (dc ? dc.symbolHasChangePct(dcDeps, data, csiSym) : (getChangePct(data, csiSym) !== null)));
    const hasChinaCore = hasFxi || hasCsi;
    const hasIron = !!(ironSym && (dc ? dc.symbolHasChangePct(dcDeps, data, ironSym) : (getChangePct(data, ironSym) !== null)));
    const hasSoy = !!(soySym && (dc ? dc.symbolHasChangePct(dcDeps, data, soySym) : (getChangePct(data, soySym) !== null)));
    const hasCopper = !!(copperSym && (dc ? dc.symbolHasChangePct(dcDeps, data, copperSym) : (getChangePct(data, copperSym) !== null)));

    let downgrade = 0;
    if (!hasChinaCore) {
        convictionScore *= 0.85;
        downgrade += 1;
        divergences.push('China proxies críticos ausentes (FXI/CSI300) → convicção reduzida');
    } else if (!(hasFxi && hasCsi)) {
        convictionScore *= 0.94;
        divergences.push('China proxies parciais (FXI/CSI300) → leitura menos confiável');
    }
    if (!hasIron) {
        convictionScore *= 0.92;
        divergences.push('Commodities BR incompletas: Minério ausente → convicção reduzida');
        downgrade += 1;
    } else if (!hasSoy) {
        convictionScore *= 0.96;
        divergences.push('Commodities BR parciais: Soja ausente');
    }
    if (!hasCopper) {
        convictionScore *= 0.985;
        divergences.push('Commodities BR parciais: Cobre ausente');
    }

    convictionScore = Math.max(0, Math.min(1, convictionScore));
    const baseLabel = convictionScore >= 0.75 ? 'ALTA' : convictionScore >= 0.55 ? 'MÉDIA' : 'BAIXA';
    const convictionLabel = downgrade ? downgradeConvictionLabel(baseLabel, downgrade) : baseLabel;
    const convictionTone = convictionLabel === 'ALTA' ? 'positive' : convictionLabel === 'MÉDIA' ? 'neutral' : 'negative';

    const convictionAssets = {
        wdo: findAssetSymbol(data, /^WDO/i),
        win: findAssetSymbol(data, /^WIN/i),
        usdbrl: findAliasSymbol(data, 'USD_BRL') || findAssetSymbol(data, /^USD\/BRL\b/i),
        dxy: findAliasSymbolBest(data, 'DXY') || findAliasSymbol(data, 'DXY') || findAssetSymbol(data, /(^USDX$|^\.DXY$|\bDXY\b|US Dollar Index|Dollar Index|Índice\s*Dólar|Indice\s*Dolar)/i),
        vix: sentinelSymbols.vix,
        oil: findAliasSymbolBest(data, 'OIL') || findAliasSymbol(data, 'OIL') || findAliasSymbolBest(data, 'BRENT') || findAliasSymbolBest(data, 'WTI') || findAssetSymbol(data, /\bBrent\b|\bWTI\b/i),
        us10y: rcKey('US_10Y', /(^US10YT=RR$|^US10YT=X$|^\.TNX$|\^TNX)/i),
        spx: sentinelSymbols.spx,
        ndx: sentinelSymbols.ndx,
        hyg: sentinelSymbols.hyg,
        gold: findAliasSymbolBest(data, 'GOLD') || findAliasSymbol(data, 'GOLD') || findAssetSymbol(data, /(^XAU\/USD\b|GC=F|\bouro\b)/i),
        usdcnh: sentinelSymbols.usdcnh,
        eem: sentinelSymbols.eem,
        btc: sentinelSymbols.btc,
        iron: ironSym || findAliasSymbol(data, 'IRON'),
        copper: copperSym || findAliasSymbol(data, 'COPPER'),
    };

    const drivers = [];
    drivers.push({ k: 'Risco (tags)', v: regimeScore, fmt: x => formatNumber(x, 2), tone: regimeScore > 0.35 ? 'positive' : regimeScore < -0.35 ? 'negative' : 'neutral' });
    drivers.push({ k: 'Beta Δ', v: betaDelta, fmt: x => formatNumber(x, 3), tone: betaDelta > 0.25 ? 'positive' : betaDelta < -0.25 ? 'negative' : 'neutral' });
    drivers.push({ k: 'Apetite (beta)', v: betaPosScore, fmt: x => formatNumber(x, 3), tone: betaPosScore === null ? 'neutral' : betaPosScore > 0.15 ? 'positive' : betaPosScore < -0.15 ? 'negative' : 'neutral' });
    drivers.push({ k: 'Proteção (beta)', v: betaNegScore, fmt: x => formatNumber(x, 3), tone: betaNegScore === null ? 'neutral' : betaNegScore > 0.15 ? 'negative' : betaNegScore < -0.15 ? 'positive' : 'neutral' });
    if (sentinelSymbols.dxy) {
        const dxy = getChangePct(data, sentinelSymbols.dxy);
        drivers.push({ k: 'DXY', v: dxy, fmt: x => formatPercent(x, 2), tone: dxy === null ? 'neutral' : dxy > 0 ? 'positive' : dxy < 0 ? 'negative' : 'neutral' });
    }
    if (sentinelSymbols.vix) {
        const vix = getChangePct(data, sentinelSymbols.vix);
        drivers.push({ k: 'VIX', v: vix, fmt: x => formatPercent(x, 2), tone: vix === null ? 'neutral' : vix > 0 ? 'negative' : vix < 0 ? 'positive' : 'neutral' });
    }
    if (typeof oilScore === 'number') drivers.push({ k: 'Petróleo', v: oilScore, fmt: x => formatPercent(x, 2), tone: oilScore > 0 ? 'positive' : oilScore < 0 ? 'negative' : 'neutral' });
    if (sentinelSymbols.usdbbrl) {
        const brl = getChangePct(data, sentinelSymbols.usdbbrl);
        drivers.push({ k: 'USD/BRL', v: brl, fmt: x => formatPercent(x, 2), tone: brl === null ? 'neutral' : brl > 0 ? 'positive' : brl < 0 ? 'negative' : 'neutral' });
    }
    if (sentinelSymbols.usdcnh) {
        const cnh = getChangePct(data, sentinelSymbols.usdcnh);
        drivers.push({ k: 'USD/CNH', v: cnh, fmt: x => formatPercent(x, 2), tone: cnh === null ? 'neutral' : cnh > 0 ? 'positive' : cnh < 0 ? 'negative' : 'neutral' });
    }
    if (typeof emBasketPct === 'number') {
        drivers.push({ k: 'EM Basket (USD/EM)', v: emBasketPct, fmt: x => formatPercent(x, 2), tone: emBasketPct > 0 ? 'positive' : emBasketPct < 0 ? 'negative' : 'neutral' });
    }
    if (sentinelSymbols.usdmxn) {
        drivers.push({ k: 'USD/MXN', v: usdmxnPct, fmt: x => formatPercent(x, 2), tone: usdmxnPct === null ? 'neutral' : usdmxnPct > 0 ? 'positive' : usdmxnPct < 0 ? 'negative' : 'neutral' });
    }
    if (sentinelSymbols.usdzar) {
        drivers.push({ k: 'USD/ZAR', v: usdzarPct, fmt: x => formatPercent(x, 2), tone: usdzarPct === null ? 'neutral' : usdzarPct > 0 ? 'positive' : usdzarPct < 0 ? 'negative' : 'neutral' });
    }
    if (sentinelSymbols.usdclp) {
        drivers.push({ k: 'USD/CLP', v: usdclpPct, fmt: x => formatPercent(x, 2), tone: usdclpPct === null ? 'neutral' : usdclpPct > 0 ? 'positive' : usdclpPct < 0 ? 'negative' : 'neutral' });
    }
    if (sentinelSymbols.usdtry) {
        drivers.push({ k: 'USD/TRY', v: usdtryPct, fmt: x => formatPercent(x, 2), tone: usdtryPct === null ? 'neutral' : usdtryPct > 0 ? 'positive' : usdtryPct < 0 ? 'negative' : 'neutral' });
    }

    const corrBrlMxn = sentinelSymbols.usdbbrl && sentinelSymbols.usdmxn
        ? correlationAligned(buildReturnSeries(sentinelSymbols.usdbbrl, 96), buildReturnSeries(sentinelSymbols.usdmxn, 96))
        : { corr: null, n: 0 };
    const corrBrlZar = sentinelSymbols.usdbbrl && sentinelSymbols.usdzar
        ? correlationAligned(buildReturnSeries(sentinelSymbols.usdbbrl, 96), buildReturnSeries(sentinelSymbols.usdzar, 96))
        : { corr: null, n: 0 };
    const corrBrlEmBasket = (() => {
        if (!sentinelSymbols.usdbbrl) return { corr: null, n: 0 };
        const basketSymbols = [
            { symbol: sentinelSymbols.usdmxn, w: 0.35 },
            { symbol: sentinelSymbols.usdzar, w: 0.35 },
            { symbol: sentinelSymbols.usdclp, w: 0.15 },
            { symbol: sentinelSymbols.usdtry, w: 0.15 },
        ].filter(x => !!x.symbol && typeof x.w === 'number' && x.w > 0);
        if (basketSymbols.length < 2) return { corr: null, n: 0 };

        const seriesByT = basketSymbols.map(x => ({
            w: x.w,
            map: new Map(buildReturnSeries(x.symbol, 96).map(p => [p.tMs, p.r])),
        }));
        const wSum = seriesByT.reduce((s, x) => s + x.w, 0);
        if (!(wSum > 0)) return { corr: null, n: 0 };

        const ref = buildReturnSeries(sentinelSymbols.usdbbrl, 96);
        const basket = [];
        for (const p of ref) {
            if (!p || !Number.isFinite(p.tMs)) continue;
            let sum = 0;
            let w = 0;
            let n = 0;
            for (const s of seriesByT) {
                const r = s.map.get(p.tMs);
                if (typeof r !== 'number' || !Number.isFinite(r)) continue;
                sum += r * s.w;
                w += s.w;
                n += 1;
            }
            if (n < 2 || !(w > 0)) continue;
            const v = sum / w;
            if (!Number.isFinite(v)) continue;
            basket.push({ tMs: p.tMs, r: v });
        }
        return correlationAligned(ref, basket);
    })();
    const corrTone = c => (typeof c === 'number' && Number.isFinite(c) ? (c > 0.4 ? 'positive' : c < -0.4 ? 'negative' : 'neutral') : 'neutral');
    const corrBadge = (c, n) => (typeof c === 'number' && Number.isFinite(c))
        ? toneBadgeHtmlFromTone(corrTone(c), c, `${formatNumber(c, 2)} (n=${n})`, { maxAbs: 1 })
        : toneBadgeHtmlFromTone('neutral', 0, '—', { maxAbs: 1 });

    const listHtml = `
        <div style="margin-top:14px;border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:12px;background:rgba(0,0,0,.18);">
            <div style="font-weight:900;letter-spacing:1px;opacity:.95;margin-bottom:8px;">Por quê</div>
            ${drivers
                .filter(d => d.v !== null && d.v !== undefined)
                .map(d => {
                    const txt = d.v === null ? '—' : d.fmt(d.v);
                    const maxAbs = String(txt).includes('%') ? 5 : 1;
                    const badge = toneBadgeHtmlFromTone(d.tone, d.v, txt, { maxAbs });
                    return `<div style="display:flex;justify-content:space-between;gap:10px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06);">
                        <div style="opacity:.9;font-weight:800;">${escapeHtml(d.k)}</div>
                        <div style="font-family:'Share Tech Mono',monospace;">${badge}</div>
                    </div>`;
                })
                .join('')}
            ${divergences.length
                ? `<div style="margin-top:10px;opacity:.92;border-top:1px solid rgba(255,255,255,.08);padding-top:10px;">
                    <div style="font-weight:900;letter-spacing:1px;margin-bottom:6px;">Divergências</div>
                    ${divergences.map(t => `<div style="opacity:.9;line-height:1.35;">• ${escapeHtml(t)}</div>`).join('')}
                </div>`
                : ''}
        </div>
        <div style="margin-top:14px;border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:12px;background:rgba(0,0,0,.18);">
            <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap;">
                <div style="font-weight:900;letter-spacing:1px;opacity:.95;">Emergentes (Fluxo)</div>
                <div style="font-family:'Share Tech Mono',monospace;font-weight:900;">${escapeHtml(emGateState)}</div>
            </div>
            <div style="margin-top:6px;opacity:.80;font-size:12px;line-height:1.35;">Core: ${escapeHtml(emCoreState)} • Basket: ${escapeHtml(emBasketState)}${typeof emBasketPct === 'number' ? ` (${escapeHtml(formatPercent(emBasketPct, 2))})` : ''}</div>
            <div style="margin-top:10px;display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:10px;">
                <div style="display:flex;justify-content:space-between;gap:10px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06);">
                    <div style="opacity:.9;font-weight:800;">Corr USD/BRL × EM Basket</div>
                    <div style="font-family:'Share Tech Mono',monospace;">${corrBadge(corrBrlEmBasket.corr, corrBrlEmBasket.n)}</div>
                </div>
                <div style="display:flex;justify-content:space-between;gap:10px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06);">
                    <div style="opacity:.9;font-weight:800;">Corr USD/BRL × USD/MXN</div>
                    <div style="font-family:'Share Tech Mono',monospace;">${corrBadge(corrBrlMxn.corr, corrBrlMxn.n)}</div>
                </div>
                <div style="display:flex;justify-content:space-between;gap:10px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06);">
                    <div style="opacity:.9;font-weight:800;">Corr USD/BRL × USD/ZAR</div>
                    <div style="font-family:'Share Tech Mono',monospace;">${corrBadge(corrBrlZar.corr, corrBrlZar.n)}</div>
                </div>
            </div>
            <div style="margin-top:10px;opacity:.82;font-size:12px;">Correlação calculada em retornos log (últimos pontos com timestamp coincidente). Basket pondera MXN/ZAR (núcleo) + CLP/TRY (redução de ruído).</div>
        </div>
    `;

    const html = `
        <div class="metrics-grid" style="margin:0;">
            <div class="metric-card">
                <div class="metric-icon">🧭</div>
                <div class="metric-value">${escapeHtml(regimeLabel)}</div>
                <div class="metric-label">Regime</div>
                <div class="metric-change">${toneBadgeHtmlFromTone(regimeScore > 0.35 ? 'positive' : regimeScore < -0.35 ? 'negative' : 'neutral', regimeScore, formatNumber(regimeScore, 2), { maxAbs: 1 })}</div>
                <div style="margin-top:8px;opacity:.88;font-size:12px;line-height:1.25;">
                    <span style="font-weight:900;letter-spacing:.8px;">WDO ${escapeHtml(regimeOperational.wdo)}</span>
                    <span style="opacity:.75;"> • </span>
                    <span style="font-weight:900;letter-spacing:.8px;">WIN ${escapeHtml(regimeOperational.win)}</span>
                    <div style="margin-top:6px;opacity:.8;">${escapeHtml(regimeOperational.hint)}</div>
                </div>
            </div>
            <div class="metric-card">
                <div class="metric-icon">🧱</div>
                <div class="metric-value">${escapeHtml(convictionLabel)}</div>
                <div class="metric-label">Convicção</div>
                <div class="metric-change">${toneBadgeHtmlFromTone(convictionTone, convictionScore * 100, `${formatNumber(convictionScore * 100, 0)}%`, { maxAbs: 100 })}</div>
                <div style="margin-top:8px;opacity:.88;font-size:12px;line-height:1.25;">
                    <div style="opacity:.85;">Base: ${escapeHtml(convictionAssets.wdo || 'WDO N/A')} • ${escapeHtml(convictionAssets.win || 'WIN N/A')}</div>
                    <div style="opacity:.80;">Chaves: ${escapeHtml([convictionAssets.usdbrl, convictionAssets.dxy, convictionAssets.vix, convictionAssets.us10y, convictionAssets.spx, convictionAssets.ndx, convictionAssets.hyg, convictionAssets.eem, convictionAssets.usdcnh, convictionAssets.btc, convictionAssets.gold, convictionAssets.iron, convictionAssets.copper, convictionAssets.oil].filter(Boolean).join(' • ') || '—')}</div>
                    ${criticalMissing.length ? `<div style="margin-top:6px;opacity:.78;">Faltando (core): ${escapeHtml(criticalMissing.slice(0, 10).join(' • '))}${criticalMissing.length > 10 ? `… +${escapeHtml(String(criticalMissing.length - 10))}` : ''}</div>` : ''}
                    ${suggestionMissing.length ? `<div style="margin-top:4px;opacity:.72;">Sugestões p/ carteira: ${escapeHtml(suggestionMissing.slice(0, 10).join(' • '))}${suggestionMissing.length > 10 ? `… +${escapeHtml(String(suggestionMissing.length - 10))}` : ''}</div>` : ''}
                </div>
            </div>
            <div class="metric-card">
                <div class="metric-icon">🧾</div>
                <div class="metric-value">${escapeHtml(formatNumber(coverageRatio * 100, 0))}%</div>
                <div class="metric-label">Cobertura (preço)</div>
                <div class="metric-change neutral">${escapeHtml(`${withPrice.length}/${assets.length}`)}</div>
            </div>
            <div class="metric-card">
                <div class="metric-icon">⏱️</div>
                <div class="metric-value">${escapeHtml(formatNumber(freshnessRatio * 100, 0))}%</div>
                <div class="metric-label">Atualização (&lt;6h)</div>
                <div class="metric-change neutral">${escapeHtml(`${fresh.length}/${withTime.length || 0}`)}</div>
            </div>
        </div>
        ${listHtml}
    `;

    operationalInputs.regime = {
        label: regimeLabel,
        score: regimeScore,
        convictionLabel,
        convictionScore,
        operational: regimeOperational,
        divergences,
        updatedAt: (data && data.meta && data.meta.generatedAt) ? String(data.meta.generatedAt) : null,
    };
    try {
        const aliasSym = k => findAliasSymbolBest(data, k) || findAliasSymbol(data, k);
        const pctOfAlias = k => {
            const s = aliasSym(k);
            return s ? getChangePct(data, s) : null;
        };
        const pctOfSym = s => (s ? getChangePct(data, s) : null);
        const dxyPct = pctOfAlias('DXY');
        const oilPct = pctOfAlias('OIL');
        const ironPct = pctOfAlias('IRON');
        const soyPct = pctOfAlias('SOY');
        const copperPct = pctOfAlias('COPPER');
        const us10yPct = pctOfSym(rcKey('US_10Y', /(^US10YT=RR$|^US10YT=X$|^\.TNX$|\^TNX)/i));
        const br10yPct = pctOfSym(rcKey('BR_10Y', /^BR10YT=RR$/i));
        const weights = { iron: 0.28, soy: 0.20, oil: 0.18, copper: 0.12 };
        const basketParts = [
            { v: ironPct, w: weights.iron },
            { v: soyPct, w: weights.soy },
            { v: oilPct, w: weights.oil },
            { v: copperPct, w: weights.copper },
        ].filter(x => typeof x.v === 'number' && Number.isFinite(x.v) && typeof x.w === 'number' && x.w > 0);
        const wSum = basketParts.reduce((s, x) => s + x.w, 0);
        const exportScore = wSum > 0 ? basketParts.reduce((s, x) => s + (x.v * x.w), 0) / wSum : null;
        const tipsEtfPct = pctOfSym(rcKey('ETF_TIP', /^TIP$/i));
        const zqCurve = (() => {
            try {
                return window.ZQ_CURVE_DATA || null;
            } catch {
                return null;
            }
        })();
        const zqSlope = zqCurve && typeof zqCurve.slopePct === 'number' && Number.isFinite(zqCurve.slopePct) ? zqCurve.slopePct : null;
        const zqRisk = zqCurve && zqCurve.riskMode ? String(zqCurve.riskMode) : null;
        const zqCount = zqCurve && typeof zqCurve.contractCount === 'number' && Number.isFinite(zqCurve.contractCount) ? zqCurve.contractCount : null;
        const flowSentinel = data && data.meta && data.meta.flowSentinel ? data.meta.flowSentinel : null;
        const fsComposite = flowSentinel && typeof flowSentinel.composite === 'number' && Number.isFinite(flowSentinel.composite) ? flowSentinel.composite : null;
        const fsDelta = flowSentinel && typeof flowSentinel.delta === 'number' && Number.isFinite(flowSentinel.delta) ? flowSentinel.delta : null;
        const fsMode = flowSentinel && typeof flowSentinel.regime === 'object' && flowSentinel.regime && typeof flowSentinel.regime.mode === 'string'
            ? String(flowSentinel.regime.mode)
            : null;
        const fsLabel = flowSentinel && typeof flowSentinel.regime === 'object' && flowSentinel.regime && typeof flowSentinel.regime.label === 'string'
            ? String(flowSentinel.regime.label)
            : null;
        const fsNeutralThreshold = flowSentinel && typeof flowSentinel.neutralThreshold === 'number' && Number.isFinite(flowSentinel.neutralThreshold)
            ? flowSentinel.neutralThreshold
            : 0.12;
        const fsRiskScore = flowSentinel && flowSentinel.riskBlock && typeof flowSentinel.riskBlock.score === 'number' && Number.isFinite(flowSentinel.riskBlock.score)
            ? flowSentinel.riskBlock.score
            : null;
        const fsProtectionScore = flowSentinel && flowSentinel.protectionBlock && typeof flowSentinel.protectionBlock.score === 'number' && Number.isFinite(flowSentinel.protectionBlock.score)
            ? flowSentinel.protectionBlock.score
            : null;
        const fsRiskObserved = flowSentinel && flowSentinel.riskBlock && typeof flowSentinel.riskBlock.observed === 'number' && Number.isFinite(flowSentinel.riskBlock.observed)
            ? flowSentinel.riskBlock.observed
            : null;
        const fsProtectionObserved = flowSentinel && flowSentinel.protectionBlock && typeof flowSentinel.protectionBlock.observed === 'number' && Number.isFinite(flowSentinel.protectionBlock.observed)
            ? flowSentinel.protectionBlock.observed
            : null;
        const fsRiskState = flowSentinel && flowSentinel.riskBlock && flowSentinel.riskBlock.action && typeof flowSentinel.riskBlock.action.state === 'string'
            ? String(flowSentinel.riskBlock.action.state)
            : null;
        const fsProtectionState = flowSentinel && flowSentinel.protectionBlock && flowSentinel.protectionBlock.action && typeof flowSentinel.protectionBlock.action.state === 'string'
            ? String(flowSentinel.protectionBlock.action.state)
            : null;
        const fsDivergence = flowSentinel && flowSentinel.divergence && typeof flowSentinel.divergence.active === 'boolean'
            ? flowSentinel.divergence.active
            : false;
        operationalInputs.macro = {
            flow: { label: regimeLabel, score: regimeScore },
            betaDelta,
            dxyPct,
            oilPct: typeof oilScore === 'number' ? oilScore : null,
            em: {
                state: emGateState,
                pct: typeof emBasketPct === 'number' ? emBasketPct : null,
                corrUsdBrlEmBasket: { corr: corrBrlEmBasket.corr, n: corrBrlEmBasket.n },
            },
            exportScore,
            yields: { us10yPct, br10yPct, tipsEtfPct },
            zq: zqCurve ? { riskMode: zqRisk, slopePct: zqSlope, contractCount: zqCount, generatedAt: zqCurve.generatedAt || null } : null,
            flowSentinel: flowSentinel
                ? {
                    mode: fsMode,
                    label: fsLabel,
                    composite: fsComposite,
                    delta: fsDelta,
                    neutralThreshold: fsNeutralThreshold,
                    risk: { score: fsRiskScore, observed: fsRiskObserved, state: fsRiskState },
                    protection: { score: fsProtectionScore, observed: fsProtectionObserved, state: fsProtectionState },
                    divergence: fsDivergence,
                    generatedAt: flowSentinel.generatedAt || null,
                }
                : null,
        };
        operationalInputs.zqCurve = zqCurve;
    } catch {
    }
    try { renderOperationalBriefing(); } catch { }
    try { renderBtcOperationalBriefing(); } catch { }
    try { renderHk50OperationalBriefing(); } catch { }
    try { renderUsEquitiesOperationalBriefing(); } catch { }
    try { renderCommoditiesOperationalBriefing(); } catch { }

    el.innerHTML = html;
}

function renderChinaBrazil(data) {
    const el = document.getElementById('chinaBrazil');
    if (!el) return;

    const dc = (typeof window !== 'undefined' && window.DecisionCore) ? window.DecisionCore : null;
    const dcDeps = { findAliasSymbolBest, findAliasSymbol, findAssetSymbol, getLastPoint };

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

    const brlImpulse = wAvg([
        { symbol: sym.iron, w: 0.27 },
        { symbol: sym.soy, w: 0.20 },
        { symbol: sym.corn, w: 0.08 },
        { symbol: sym.coffee, w: 0.05 },
        { symbol: sym.sugar, w: 0.04 },
        { symbol: sym.copper, w: 0.06 },
        { symbol: sym.brent || sym.wti, w: 0.30 },
    ]);

    const ibovImpulse = wAvg([
        { symbol: sym.iron, w: 0.45 },
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
        const hasIron = hasPct(sym.iron);
        const hasSoy = hasPct(sym.soy);
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
                : 'Dados presentes, mas atualização antiga em itens críticos.';

        return {
            status,
            conviction,
            why,
            lines: [
                { label: 'FXI ou CSI300 (≥1)', ok: hasChinaCore },
                { label: 'HSI (fallback)', ok: hasHsi },
                { label: 'USD/CNH (stress)', ok: hasUsdCnh },
                { label: 'Minério (TIO/SM58F)', ok: hasIron },
                { label: 'Soja (ZS)', ok: hasSoy },
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
    const iron = getChangePct(data, sym.iron);
    const ironDalian = getChangePct(data, sym.ironDalian);
    const soy = getChangePct(data, sym.soy);
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

function renderMetalsZone(data) {
    const el = document.getElementById('metalsZone');
    if (!el) return;

    const pad2 = n => String(n).padStart(2, '0');
    const toBrtDateKey = ms => {
        const shifted = ms - 180 * 60 * 1000;
        const d = new Date(shifted);
        return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
    };
    const pointMs = p => {
        const t = p && p.t ? Date.parse(p.t) : NaN;
        return Number.isFinite(t) ? t : 0;
    };

    const sym = {
        idx: findAssetSymbol(data, /^WINc1$/i) || findAssetSymbol(data, /^WIN\b/i) || findAssetSymbol(data, /^\.BVSP$/i),
        iron: findAssetSymbol(data, /^DCE_I0$/i),
        copper: findAliasSymbol(data, 'COPPER'),
    };

    const calcSessionPct = symbol => {
        if (!symbol) return null;
        const series = (data && data.series && data.series[symbol]) ? data.series[symbol] : [];
        if (!Array.isArray(series) || !series.length) return null;
        const last = getMostRecentPointWithPrice(data, symbol) || getLastPoint(data, symbol);
        if (!last || typeof last.price !== 'number' || !Number.isFinite(last.price)) return null;
        const lastMs = pointMs(last);
        const dayKey = toBrtDateKey(lastMs);

        let base = null;
        let baseMs = Infinity;
        for (const p of series) {
            if (!p || typeof p.price !== 'number' || !Number.isFinite(p.price)) continue;
            const ms = pointMs(p);
            if (!ms) continue;
            if (toBrtDateKey(ms) !== dayKey) continue;
            if (ms < baseMs) {
                baseMs = ms;
                base = p;
            }
        }

        const basePrice = base && typeof base.price === 'number' && Number.isFinite(base.price) ? base.price : null;
        const computed = basePrice && basePrice !== 0 ? ((last.price - basePrice) / basePrice) * 100 : null;
        const fallback = pointPct(last);
        const pct = typeof computed === 'number' && Number.isFinite(computed) && (basePrice === null || basePrice !== last.price) ? computed : fallback ?? computed;

        return {
            pct: typeof pct === 'number' && Number.isFinite(pct) ? pct : null,
            last,
            base,
            basePrice,
        };
    };

    const calcPrevClose = symbol => {
        if (!symbol) return null;
        const series = (data && data.series && data.series[symbol]) ? data.series[symbol] : [];
        const last = getMostRecentPointWithPrice(data, symbol) || getLastPoint(data, symbol);
        if (!last || typeof last.price !== 'number' || !Number.isFinite(last.price)) return null;
        const lastMs = pointMs(last);
        const lastKey = toBrtDateKey(lastMs);

        let prev = null;
        let prevMs = -Infinity;
        for (const p of series) {
            if (!p || typeof p.price !== 'number' || !Number.isFinite(p.price)) continue;
            const ms = pointMs(p);
            if (!ms) continue;
            const key = toBrtDateKey(ms);
            if (key >= lastKey) continue;
            if (ms > prevMs) {
                prevMs = ms;
                prev = p;
            }
        }

        if (prev && typeof prev.price === 'number' && Number.isFinite(prev.price)) {
            return { price: prev.price, t: prev.t || null, source: 'série' };
        }

        const lastPct = pointPct(last);
        if (typeof lastPct === 'number' && Number.isFinite(lastPct) && lastPct !== -100) {
            const denom = 1 + (lastPct / 100);
            if (denom !== 0) {
                const implied = last.price / denom;
                if (Number.isFinite(implied) && implied > 0) return { price: implied, t: null, source: 'implícito' };
            }
        }

        if (typeof last.change === 'number' && Number.isFinite(last.change)) {
            const implied = last.price - last.change;
            if (Number.isFinite(implied) && implied > 0) return { price: implied, t: null, source: 'implícito' };
        }

        return { price: last.price, t: last.t || null, source: 'último' };
    };

    const iron = calcSessionPct(sym.iron);
    const copper = calcSessionPct(sym.copper);
    const idxLast = sym.idx ? (getMostRecentPointWithPrice(data, sym.idx) || getLastPoint(data, sym.idx)) : null;
    const prevClose = calcPrevClose(sym.idx);

    const ironPct = iron ? iron.pct : null;
    const copperPct = copper ? copper.pct : null;
    const zonePct = (typeof ironPct === 'number' && typeof copperPct === 'number')
        ? (ironPct - copperPct) / 2
        : null;
    const absZone = typeof zonePct === 'number' && Number.isFinite(zonePct) ? Math.abs(zonePct) : null;
    const prev = prevClose && typeof prevClose.price === 'number' && Number.isFinite(prevClose.price) ? prevClose.price : null;

    const pts = (typeof prev === 'number' && typeof absZone === 'number') ? (prev * absZone / 100) : null;
    const low = (typeof prev === 'number' && typeof absZone === 'number') ? (prev * (1 - absZone / 100)) : null;
    const high = (typeof prev === 'number' && typeof absZone === 'number') ? (prev * (1 + absZone / 100)) : null;

    const zoneTone = (() => {
        if (typeof absZone !== 'number' || !Number.isFinite(absZone)) return 'neutral';
        if (absZone >= 0.7) return 'negative';
        if (absZone >= 0.35) return 'neutral';
        return 'positive';
    })();

    const badge = (tone, valAbs, txt, maxAbs = 2) => toneBadgeHtmlFromTone(tone, typeof valAbs === 'number' ? Math.abs(valAbs) : 0, txt, { maxAbs });
    const pctBadge = v => (typeof v === 'number' && Number.isFinite(v))
        ? toneBadgeHtml(v, formatPercent(v, 2), { maxAbs: 3 })
        : escapeHtml('—');

    const idxName = sym.idx ? ((data.assets || []).find(a => String(a.symbol) === String(sym.idx))?.name || sym.idx) : '—';
    const idxSpot = idxLast && typeof idxLast.price === 'number' ? idxLast.price : null;
    const idxSpotTxt = typeof idxSpot === 'number' ? formatNumber(idxSpot, 0) : '—';

    const ironLabel = sym.iron ? ((data.assets || []).find(a => String(a.symbol) === String(sym.iron))?.name || 'Minério (Dalian)') : 'Minério (Dalian)';
    const copperLabel = sym.copper ? ((data.assets || []).find(a => String(a.symbol) === String(sym.copper))?.name || 'Cobre') : 'Cobre';

    const html = `
        <div style="border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:12px;background:rgba(0,0,0,.18);">
            <div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap;">
                <div style="font-weight:900;letter-spacing:1px;opacity:.95;">Zona de Metais • ${escapeHtml(String(idxName))}</div>
                <div style="display:flex;gap:10px;align-items:center;font-family:'Share Tech Mono',monospace;font-weight:900;">
                    <span>${badge(zoneTone, absZone, absZone === null ? '—' : `±${formatNumber(absZone, 2)}%`, 1)}</span>
                    <span style="opacity:.85;">Spot ${escapeHtml(idxSpotTxt)}</span>
                </div>
            </div>
            <div style="margin-top:12px;display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px;">
                <div style="border:1px solid rgba(255,255,255,.10);border-radius:12px;padding:12px;background:rgba(0,0,0,.12);">
                    <div style="font-weight:900;letter-spacing:.8px;opacity:.92;margin-bottom:8px;">Inputs (Metais)</div>
                    <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06);">
                        <div style="min-width:0;">
                            <div style="font-weight:900;letter-spacing:.6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(ironLabel)}</div>
                            <div style="opacity:.75;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(sym.iron || 'N/A')}</div>
                        </div>
                        <div style="font-family:'Share Tech Mono',monospace;font-weight:900;min-width:90px;text-align:right;">${pctBadge(ironPct)}</div>
                    </div>
                    <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;padding:6px 0;">
                        <div style="min-width:0;">
                            <div style="font-weight:900;letter-spacing:.6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(copperLabel)}</div>
                            <div style="opacity:.75;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(sym.copper || 'N/A')}</div>
                        </div>
                        <div style="font-family:'Share Tech Mono',monospace;font-weight:900;min-width:90px;text-align:right;">${pctBadge(copperPct)}</div>
                    </div>
                    <div style="margin-top:10px;opacity:.82;font-size:12px;line-height:1.35;">
                        Regra: (Minério − Cobre) ÷ 2 = % da zona.
                    </div>
                </div>

                <div style="border:1px solid rgba(255,255,255,.10);border-radius:12px;padding:12px;background:rgba(0,0,0,.12);">
                    <div style="font-weight:900;letter-spacing:.8px;opacity:.92;margin-bottom:8px;">Cálculo</div>
                    <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06);">
                        <div style="opacity:.9;font-weight:900;">% Zona</div>
                        <div style="font-family:'Share Tech Mono',monospace;font-weight:900;">${absZone === null ? '—' : `±${formatNumber(absZone, 2)}%`}</div>
                    </div>
                    <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06);">
                        <div style="opacity:.9;font-weight:900;">Amplitude (pts)</div>
                        <div style="font-family:'Share Tech Mono',monospace;font-weight:900;">${typeof pts === 'number' ? formatNumber(pts, 0) : '—'}</div>
                    </div>
                    <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;padding:6px 0;">
                        <div style="opacity:.9;font-weight:900;">Base (fechamento ant.)</div>
                        <div style="font-family:'Share Tech Mono',monospace;font-weight:900;">${prevClose && typeof prevClose.price === 'number' ? `${formatNumber(prevClose.price, 0)} (${escapeHtml(prevClose.source)})` : '—'}</div>
                    </div>
                    <div style="margin-top:10px;opacity:.82;font-size:12px;line-height:1.35;">
                        Uso típico: com metais divergindo, o índice tende a respeitar as pontas do range mais vezes do que “esticar” tendência.
                    </div>
                </div>

                <div style="border:1px solid rgba(255,255,255,.10);border-radius:12px;padding:12px;background:rgba(0,0,0,.12);">
                    <div style="font-weight:900;letter-spacing:.8px;opacity:.92;margin-bottom:8px;">Níveis Projetados</div>
                    <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06);">
                        <div style="opacity:.9;font-weight:900;">LOW</div>
                        <div style="font-family:'Share Tech Mono',monospace;font-weight:900;">${typeof low === 'number' ? formatNumber(low, 0) : '—'}</div>
                    </div>
                    <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;padding:6px 0;">
                        <div style="opacity:.9;font-weight:900;">HIGH</div>
                        <div style="font-family:'Share Tech Mono',monospace;font-weight:900;">${typeof high === 'number' ? formatNumber(high, 0) : '—'}</div>
                    </div>
                    <div style="margin-top:10px;opacity:.82;font-size:12px;line-height:1.45;">
                        Operacional: se abrir no meio do range, tende a ser “vucu vucu”; priorize buscar as pontas e reduzir no primeiro alvo.
                    </div>
                </div>
            </div>
        </div>
    `;

    el.innerHTML = html;
}

function renderRatesBuckets(data) {
    const el = document.getElementById('ratesBuckets');
    if (!el) return;
    const mod = (typeof window !== 'undefined' && window.RatesBucketsModule) ? window.RatesBucketsModule : null;
    if (mod && typeof mod.render === 'function') {
        try {
            mod.render({
                data,
                el,
                deps: {
                    ...buildCommonBlockDeps(),
                    isBrazilRelated,
                    renderBrazilMarket,
                },
            });
            return;
        } catch {
            el.innerHTML = fallbackCard('Top movers', 'Falha ao renderizar o mÃ³dulo.');
            return;
        }
    }
    el.innerHTML = fallbackCard('Top movers', 'MÃ³dulo indisponÃ­vel (nÃ£o carregado).');
}

function renderRegimeConviction(data) {
    const el = document.getElementById('regimeConviction');
    if (!el) return;

    const mod = (typeof window !== 'undefined' && window.MercadoBlocks && window.MercadoBlocks.regimeConviction)
        ? window.MercadoBlocks.regimeConviction
        : null;
    if (mod && typeof mod.render === 'function') {
        try {
            mod.render({
                data,
                el,
                deps: {
                    ...buildCommonBlockDeps(),
                    computeFlowScore,
                    operationalInputs,
                    renderOperationalBriefing,
                    renderBtcOperationalBriefing,
                    renderHk50OperationalBriefing,
                    renderUsEquitiesOperationalBriefing,
                    renderCommoditiesOperationalBriefing,
                },
            });
            return;
        } catch {
            el.innerHTML = fallbackCard('Regime & ConvicÃ§Ã£o', 'Falha ao renderizar o mÃ³dulo.');
            return;
        }
    }

    el.innerHTML = fallbackCard('Regime & ConvicÃ§Ã£o', 'MÃ³dulo indisponÃ­vel (nÃ£o carregado).');
}

function renderChinaBrazil(data) {
    const el = document.getElementById('chinaBrazil');
    if (!el) return;

    const mod = (typeof window !== 'undefined' && window.MercadoBlocks && window.MercadoBlocks.chinaBrazil)
        ? window.MercadoBlocks.chinaBrazil
        : null;
    if (mod && typeof mod.render === 'function') {
        try {
            mod.render({
                data,
                el,
                deps: {
                    ...buildCommonBlockDeps(),
                },
            });
            return;
        } catch {
            el.innerHTML = fallbackCard('China â†” Brasil', 'Falha ao renderizar o mÃ³dulo.');
            return;
        }
    }

    el.innerHTML = fallbackCard('China â†” Brasil', 'MÃ³dulo indisponÃ­vel (nÃ£o carregado).');
}

function renderMetalsZone(data) {
    const el = document.getElementById('metalsZone');
    if (!el) return;

    const mod = (typeof window !== 'undefined' && window.MercadoBlocks && window.MercadoBlocks.metalsZone)
        ? window.MercadoBlocks.metalsZone
        : null;
    if (mod && typeof mod.render === 'function') {
        try {
            mod.render({
                data,
                el,
                deps: {
                    ...buildCommonBlockDeps(),
                },
            });
            return;
        } catch {
            el.innerHTML = fallbackCard('Zona de Metais', 'Falha ao renderizar o mÃ³dulo.');
            return;
        }
    }

    el.innerHTML = fallbackCard('Zona de Metais', 'MÃ³dulo indisponÃ­vel (nÃ£o carregado).');
}

function renderRatesBuckets(data) {
    const el = document.getElementById('ratesBuckets');
    if (!el) return;
    const mod = (typeof window !== 'undefined' && window.MercadoBlocks && window.MercadoBlocks.ratesBuckets)
        ? window.MercadoBlocks.ratesBuckets
        : ((typeof window !== 'undefined' && window.RatesBucketsModule) ? window.RatesBucketsModule : null);
    if (mod && typeof mod.render === 'function') {
        try {
            mod.render({
                data,
                el,
                deps: {
                    ...buildCommonBlockDeps(),
                    dcDeps: buildDcDeps(),
                },
            });
            return;
        } catch {
            el.innerHTML = fallbackCard('Rates Buckets', 'Falha ao renderizar o mÃ³dulo.');
            return;
        }
    }
    el.innerHTML = fallbackCard('Rates Buckets', 'MÃ³dulo indisponÃ­vel (nÃ£o carregado).');
}

function computeBrazilCdsHedgeSignal(data) {
    const catalog = (typeof window !== 'undefined' && window.InstrumentsCatalog) ? window.InstrumentsCatalog : null;
    const dcDeps = buildDcDeps();
    const catDeps = buildCatDeps(dcDeps);
    const rcKey = (key, fallbackMatcher) => {
        const sym = catalog && typeof catalog.resolveRatesCreditByKey === 'function'
            ? catalog.resolveRatesCreditByKey(catDeps, data, key)
            : null;
        if (sym) return sym;
        if (fallbackMatcher instanceof RegExp) return findAssetSymbol(data, fallbackMatcher);
        return null;
    };

    const symCds =
        rcKey('CDS_BR_5Y', /^BRGV5YUSAC=R$/i)
        || findAliasSymbolBest(data, 'CDS_BR5Y')
        || findAssetSymbol(data, /^BRGV/i)
        || findAssetSymbol(data, /\bBrazil\b.*\bCDS\b|\bCDS\b.*\bBrazil\b/i);
    const symFx = findAliasSymbolBest(data, 'USD_BRL') || findAliasSymbol(data, 'USD_BRL') || findAssetSymbol(data, /^USD\/BRL\b/i);
    const symEq =
        findAliasSymbolBest(data, 'EWZ')
        || findAssetSymbol(data, /^EWZ$/i)
        || findAliasSymbolBest(data, 'IBOV')
        || findAssetSymbol(data, /(^\.BVSP$|\bIbovespa\b)/i)
        || findAssetSymbol(data, /\bBOVA11(?:\.SA)?\b/i);

    const cds = getChangePct(data, symCds);
    const fx = getChangePct(data, symFx);
    const eq = getChangePct(data, symEq);

    const hasAny = [cds, fx, eq].some(v => typeof v === 'number' && Number.isFinite(v));
    if (!hasAny) return null;

    const th = { cds: 0.20, fx: 0.12, eq: 0.25 };
    const dir = (v, t) => (typeof v === 'number' && Number.isFinite(v) ? (v > t ? 1 : v < -t ? -1 : 0) : null);

    const cdsDir = dir(cds, th.cds);
    const fxDir = dir(fx, th.fx);
    const eqDir = dir(eq, th.eq);

    const fmt = v => (typeof v === 'number' && Number.isFinite(v) ? formatPercent(v, 2) : 'â€”');

    const toneFor = mode => {
        if (mode === 'risk_off_classic') return 'negative';
        if (mode === 'relief_risk_on') return 'positive';
        if (mode === 'hedge_on_risk_on') return 'neutral';
        if (mode === 'protection_isolated') return 'neutral';
        return 'neutral';
    };

    const mkMode = () => {
        if (cdsDir === 1 && fxDir === 1 && eqDir === -1) return 'risk_off_classic';
        if (cdsDir === 1 && fxDir === -1 && eqDir === 1) return 'hedge_on_risk_on';
        if (cdsDir === -1 && fxDir === -1 && eqDir === 1) return 'relief_risk_on';
        if (cdsDir === 1) return 'protection_isolated';
        if (cdsDir === -1) return 'relief_isolated';
        return 'neutral';
    };

    const mode = mkMode();

    const expected = (() => {
        if (mode === 'risk_off_classic') return { cds: 1, fx: 1, eq: -1 };
        if (mode === 'hedge_on_risk_on') return { cds: 1, fx: -1, eq: 1 };
        if (mode === 'relief_risk_on') return { cds: -1, fx: -1, eq: 1 };
        if (mode === 'protection_isolated') return { cds: 1, fx: null, eq: null };
        if (mode === 'relief_isolated') return { cds: -1, fx: null, eq: null };
        return { cds: null, fx: null, eq: null };
    })();

    const matchCount = (() => {
        const pairs = [
            { got: cdsDir, exp: expected.cds },
            { got: fxDir, exp: expected.fx },
            { got: eqDir, exp: expected.eq },
        ];
        const eligible = pairs.filter(p => typeof p.exp === 'number' && typeof p.got === 'number');
        if (!eligible.length) return { match: 0, total: 0 };
        const match = eligible.filter(p => p.got === p.exp).length;
        return { match, total: eligible.length };
    })();

    const magnitudeScore = (() => {
        const parts = [
            typeof cds === 'number' ? Math.min(1, Math.abs(cds) / 0.6) : null,
            typeof fx === 'number' ? Math.min(1, Math.abs(fx) / 0.35) : null,
            typeof eq === 'number' ? Math.min(1, Math.abs(eq) / 1.2) : null,
        ].filter(x => typeof x === 'number' && Number.isFinite(x));
        return parts.length ? parts.reduce((a, b) => a + b, 0) / parts.length : 0.0;
    })();

    const confidence = (() => {
        if (!matchCount.total) return Math.max(0.2, Math.min(0.65, magnitudeScore));
        const alignment = matchCount.match / matchCount.total;
        return Math.max(0, Math.min(1, (0.62 * alignment) + (0.38 * magnitudeScore)));
    })();

    const label = (() => {
        if (mode === 'hedge_on_risk_on') return 'Hedge-on (CDSâ†‘ com Brasil comprado)';
        if (mode === 'risk_off_classic') return 'Risk-off clÃ¡ssico (CDSâ†‘ + BRLâ†“ + bolsaâ†“)';
        if (mode === 'relief_risk_on') return 'AlÃ­vio (CDSâ†“ + BRLâ†‘ + bolsaâ†‘)';
        if (mode === 'protection_isolated') return 'ProteÃ§Ã£o (CDSâ†‘ sem confirmaÃ§Ã£o)';
        if (mode === 'relief_isolated') return 'AlÃ­vio (CDSâ†“ sem confirmaÃ§Ã£o)';
        return 'Neutro/ruÃ­do';
    })();

    const detail = `CDS ${fmt(cds)} â€¢ USD/BRL ${fmt(fx)} â€¢ BR (EWZ/IBOV) ${fmt(eq)}`;

    return {
        mode,
        tone: toneFor(mode),
        label,
        detail,
        confidence,
        drivers: { cds, fx, eq, sym: { cds: symCds, fx: symFx, eq: symEq } },
    };
}

function computeOperationalPulseNow(data) {
    const isNum = v => typeof v === 'number' && Number.isFinite(v);
    const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
    const signDir = (v, th) => (isNum(v) ? (v > th ? 1 : v < -th ? -1 : 0) : 0);

    const catalog = (typeof window !== 'undefined' && window.InstrumentsCatalog) ? window.InstrumentsCatalog : null;
    const dcDeps = buildDcDeps();
    const catDeps = buildCatDeps(dcDeps);
    const rcKey = (key, fallbackMatcher) => {
        const sym = catalog && typeof catalog.resolveRatesCreditByKey === 'function'
            ? catalog.resolveRatesCreditByKey(catDeps, data, key)
            : null;
        if (sym) return sym;
        if (fallbackMatcher instanceof RegExp) return findAssetSymbol(data, fallbackMatcher);
        return null;
    };

    const pick = patterns => patterns.map(re => findAssetSymbol(data, re)).find(Boolean) || null;
    const vix9d = pick([/^\.VIX9D$/i, /\bVIX9D\b/i, /\b9-Day Volatility\b/i]);
    const vix30 = pick([/^VIX$/i, /^\.VIX$/i, /\bS&P\s*500\s*VIX\b/i]);
    const vvix = pick([/^\.VVIX$/i, /\bVix Volatility\b/i, /\bVVIX\b/i]);
    const vxn = pick([/^\.VXN$/i, /\bNASDAQ\s*100 Volatility\b/i]);
    const vxeem = pick([/^\.VXEEM$/i, /\bEmerging Markets\b.*\bVol/i, /\bEEM\b.*\bVol/i]);
    const vxewz = pick([/^\.VXEWZ$/i, /\bBrazil\b.*\bVol/i, /\bEWZ\b.*\bVol/i]);
    const vxbr = pick([/(^\.VXBR$|\bVXBR\b)/i]);
    const vixChosen = vix9d || vix30 || null;
    const vixLabel = vixChosen ? (vixChosen === vix9d ? 'VIX9D' : 'VIX') : 'VIX';
    const sym = {
        wdo: findAliasSymbolBest(data, 'WDO') || pick([/(^WDO\b|WDOc\d\b|\bmini\s*d[oó]lar\b)/i]),
        win: findAliasSymbolBest(data, 'WIN') || pick([/(^WIN\b|WINc\d\b|\bmini\s*(índice|indice)\b|\bmini\s*ibovespa\b)/i]),
        usdbrl: findAliasSymbolBest(data, 'USD_BRL') || findAliasSymbol(data, 'USD_BRL') || pick([/^USD\/BRL\b/i]),
        ibov: findAliasSymbolBest(data, 'IBOV') || pick([/(^\.BVSP$|\bIBOV\b|\bIbovespa\b)/i]),
        ewz: findAliasSymbolBest(data, 'EWZ') || pick([/^EWZ$/i]),
        dxy: findAliasSymbolBest(data, 'DXY') || findAliasSymbol(data, 'DXY') || pick([/(^\.DXY$|\bDXY\b)/i]),
        vix: vixChosen,
        vix9d,
        vix30,
        vvix,
        vxn,
        vxeem,
        vxewz,
        vxbr,
        br10y: rcKey('BR_10Y', /^BR10YT=RR$/i) || findAliasSymbolBest(data, 'BR10Y') || pick([/^BR10YT=RR$/i]),
        cds: rcKey('CDS_BR_5Y', /^BRGV5YUSAC=R$/i) || findAliasSymbolBest(data, 'CDS_BR5Y') || pick([/^BRGV5YUSAC=R$/i, /^BRGV/i]),
        spx: findAliasSymbolBest(data, 'SPX') || findAliasSymbol(data, 'SPX') || pick([/(^SPX$|^\.SPX$|^\^GSPC$|\bS&P\s*500\b)/i]),
        us10y: rcKey('US_10Y', /^US10YT=RR$/i) || findAliasSymbolBest(data, 'US10Y') || findAliasSymbol(data, 'US10Y') || pick([/^US10YT=RR$/i, /(^\^TNX$|\bUS\s*10Y\b|\bUST\s*10Y\b)/i]),
        us2y: rcKey('US_2Y', /^US2YT=RR$/i) || findAliasSymbolBest(data, 'US2Y') || findAliasSymbol(data, 'US2Y') || pick([/^US2YT=RR$/i, /(^\^IRX$|\bUS\s*2Y\b|\bUST\s*2Y\b)/i]),
        hyg: rcKey('ETF_HYG', /^HYG(\.\w+)?$/i) || findAliasSymbolBest(data, 'HYG') || pick([/^HYG(\.\w+)?$/i, /\bhigh\s*yield\b/i, /\biboxx\b/i, /\balto\s*rendimento\b/i]),
        tlt: rcKey('ETF_TLT', /^TLT(\.\w+)?$/i) || findAliasSymbolBest(data, 'TLT') || pick([/^TLT(\.\w+)?$/i, /\bTLT\b/i, /\b20\+\s*Year\b.*\bTreasury\b/i, /\bTreasury\b.*\bBond\b/i, /\btreasuries\b/i]),
        eem: findAliasSymbolBest(data, 'EEM') || findAliasSymbolBest(data, 'VWO') || pick([/^EEM$/i, /^VWO$/i, /\bMSCI\b.*\bEmerging\b.*\bMarkets\b/i, /\bmercados\s*emergentes\b/i]),
        brent: findAliasSymbolBest(data, 'BRENT') || pick([/^BNO$/i, /^LCO\b/i, /^LRBc1-LCOc1$/i, /\bBrent\b/i, /\bcrude\b.*\bbrent\b/i, /BRENT/i]),
        copper: findAliasSymbolBest(data, 'COPPER') || pick([/(^HG$|HG=F|COPPER|\bcobre\b)/i]),
        gold: findAliasSymbolBest(data, 'GOLD') || pick([/(^GC$|GC=F|GOLD|\bouro\b)/i]),
        iron: findAliasSymbolBest(data, 'IRON') || pick([/(^DCE_I0$|\bmin[eé]rio\s*de\s*ferro\b|iron\s*ore)/i]),
        btc: findAliasSymbolBest(data, 'BTC') || pick([/(^BTC\/USD$|^BTCUSD$|BTC\/USD|XBT|bitcoin)/i]),
    };

    const get = s => (s ? getChangePct(data, s) : null);

    const drv = {
        usdbrl: { label: 'USD/BRL', pct: get(sym.usdbrl) },
        dxy: { label: 'DXY', pct: get(sym.dxy) },
        vix: { label: vixLabel, pct: get(sym.vix) },
        vix9d: { label: 'VIX9D', pct: get(sym.vix9d) },
        vix30: { label: 'VIX (clássico)', pct: get(sym.vix30) },
        vvix: { label: 'VVIX', pct: get(sym.vvix) },
        vxn: { label: 'VXN', pct: get(sym.vxn) },
        vxeem: { label: 'VXEEM', pct: get(sym.vxeem) },
        vxewz: { label: 'VXEWZ', pct: get(sym.vxewz) },
        vxbr: { label: 'VXBR', pct: get(sym.vxbr) },
        br10y: { label: 'BR10Y', pct: get(sym.br10y) },
        cds: { label: 'CDS BR 5Y', pct: get(sym.cds) },
        ewz: { label: 'EWZ', pct: get(sym.ewz) },
        spx: { label: 'SPX', pct: get(sym.spx) },
        us10y: { label: 'US10Y', pct: get(sym.us10y) },
        us2y: { label: 'US2Y', pct: get(sym.us2y) },
        hyg: { label: 'HYG (crÃ©dito)', pct: get(sym.hyg) },
        tlt: { label: 'TLT (duration)', pct: get(sym.tlt) },
        eem: { label: 'EEM/VWO (EM)', pct: get(sym.eem) },
        brent: { label: 'Brent', pct: get(sym.brent) },
        copper: { label: 'Cobre', pct: get(sym.copper) },
        gold: { label: 'Ouro', pct: get(sym.gold) },
        iron: { label: 'MinÃ©rio', pct: get(sym.iron) },
        btc: { label: 'BTC', pct: get(sym.btc) },
        ibov: { label: 'IBOV', pct: get(sym.ibov) },
        wdo: { label: 'WDO', pct: get(sym.wdo) },
        win: { label: 'WIN', pct: get(sym.win) },
    };

    const driversCfg = [
        { key: 'usdbrl', group: 'driver', weight: 1.0, capAbs: 0.6, wdoSign: +1, winSign: -1 },
        { key: 'dxy', group: 'driver', weight: 0.7, capAbs: 0.6, wdoSign: +1, winSign: -1 },
        { key: 'vix9d', group: 'driver', weight: 0.45, capAbs: 4.0, wdoSign: +1, winSign: -1 },
        { key: 'vxbr', group: 'driver', weight: 0.45, capAbs: 6.0, wdoSign: +1, winSign: -1 },
        { key: 'vxewz', group: 'driver', weight: 0.25, capAbs: 6.0, wdoSign: +1, winSign: -1 },

        { key: 'vix30', group: 'confirm', weight: 0.25, capAbs: 3.5, wdoSign: +1, winSign: -1 },
        { key: 'vvix', group: 'confirm', weight: 0.15, capAbs: 5.0, wdoSign: +1, winSign: -1 },
        { key: 'vxn', group: 'confirm', weight: 0.15, capAbs: 5.0, wdoSign: +1, winSign: -1 },
        { key: 'vxeem', group: 'confirm', weight: 0.15, capAbs: 5.5, wdoSign: +1, winSign: -1 },
        { key: 'cds', group: 'confirm', weight: 0.35, capAbs: 0.6, wdoSign: +1, winSign: -1 },
        { key: 'br10y', group: 'confirm', weight: 0.3, capAbs: 0.45, wdoSign: +1, winSign: -1 },
        { key: 'us10y', group: 'confirm', weight: 0.25, capAbs: 0.6, wdoSign: +1, winSign: -1 },
        { key: 'spx', group: 'confirm', weight: 0.35, capAbs: 1.1, wdoSign: -1, winSign: +1 },
        { key: 'ewz', group: 'confirm', weight: 0.4, capAbs: 1.2, wdoSign: -1, winSign: +1 },
        { key: 'win', group: 'confirm', weight: 0.32, capAbs: 1.2, wdoSign: -1, winSign: +1 },
        { key: 'wdo', group: 'confirm', weight: 0.32, capAbs: 1.2, wdoSign: +1, winSign: -1 },
        { key: 'hyg', group: 'confirm', weight: 0.2, capAbs: 1.2, wdoSign: -1, winSign: +1 },

        { key: 'us2y', group: 'context', weight: 0.15, capAbs: 0.6, wdoSign: +1, winSign: -1 },
        { key: 'eem', group: 'context', weight: 0.15, capAbs: 1.2, wdoSign: -1, winSign: +1 },
        { key: 'copper', group: 'context', weight: 0.15, capAbs: 1.8, wdoSign: -1, winSign: +1 },
        { key: 'iron', group: 'context', weight: 0.12, capAbs: 2.2, wdoSign: -1, winSign: +1 },
        { key: 'brent', group: 'context', weight: 0.12, capAbs: 2.2, wdoSign: -1, winSign: +1 },
        { key: 'gold', group: 'context', weight: 0.1, capAbs: 1.6, wdoSign: +1, winSign: -1 },
        { key: 'btc', group: 'context', weight: 0.05, capAbs: 4.0, wdoSign: -1, winSign: +1 },
    ];

    const buildSide = side => {
        const rows = [];
        const breadth = { pos: 0, neg: 0, zero: 0 };
        const contribution = { posSum: 0, negSum: 0, net: 0 };
        const pnlLike = { posSum: 0, negSum: 0, net: 0 };
        const groups = {
            driver: { net: 0, pnl: 0, count: 0 },
            confirm: { net: 0, pnl: 0, count: 0 },
            context: { net: 0, pnl: 0, count: 0 },
        };

        for (const cfg of driversCfg) {
            const d = drv[cfg.key];
            const pct = d ? d.pct : null;
            if (!isNum(pct)) continue;
            const sgn = side === 'wdo' ? cfg.wdoSign : cfg.winSign;
            const signed = sgn * pct;
            const capped = clamp(signed, -cfg.capAbs, cfg.capAbs);
            const contrib = cfg.weight * (cfg.capAbs > 0 ? capped / cfg.capAbs : 0);
            const pnl = cfg.weight * capped;
            const g = cfg.group === 'driver' || cfg.group === 'confirm' || cfg.group === 'context' ? cfg.group : 'context';
            contribution.net += contrib;
            pnlLike.net += pnl;
            groups[g].net += contrib;
            groups[g].pnl += pnl;
            groups[g].count += 1;
            if (contrib > 0) {
                breadth.pos += 1;
                contribution.posSum += contrib;
                pnlLike.posSum += pnl;
            } else if (contrib < 0) {
                breadth.neg += 1;
                contribution.negSum += contrib;
                pnlLike.negSum += pnl;
            } else {
                breadth.zero += 1;
            }
            rows.push({
                key: cfg.key,
                group: g,
                label: d.label,
                symbol: sym[cfg.key] || null,
                pct,
                signed,
                weight: cfg.weight,
                capAbs: cfg.capAbs,
                contrib,
                pnl,
            });
        }

        const net = clamp(contribution.net, -3, 3);
        const bias = net > 0.25 ? 'buy' : net < -0.25 ? 'sell' : 'neutral';
        return { bias, net, breadth, contribution, pnlLike, groups, rows };
    };

    const wdo = buildSide('wdo');
    const win = buildSide('win');

    const pair = (() => {
        const winPct = drv.win.pct;
        const wdoPct = drv.wdo.pct;
        if (!isNum(winPct) || !isNum(wdoPct)) return null;
        const th = 0.25;
        if (!(winPct >= th && wdoPct <= -th)) return null;
        const raw = (winPct - wdoPct) / 2;
        const score = clamp(raw, -1.5, 1.5);
        const capAbs = 1.5;
        const weight = 0.85;
        return { winPct, wdoPct, score, capAbs, weight };
    })();

    const applyPair = (sideObj, side) => {
        if (!pair) return;
        const signed = side === 'wdo' ? -pair.score : +pair.score;
        const capped = clamp(signed, -pair.capAbs, pair.capAbs);
        const contrib = pair.weight * (pair.capAbs > 0 ? capped / pair.capAbs : 0);
        const pnl = pair.weight * capped;
        sideObj.contribution.net += contrib;
        sideObj.pnlLike.net += pnl;
        sideObj.groups.driver.net += contrib;
        sideObj.groups.driver.pnl += pnl;
        sideObj.groups.driver.count += 1;
        if (contrib > 0) {
            sideObj.breadth.pos += 1;
            sideObj.contribution.posSum += contrib;
            sideObj.pnlLike.posSum += pnl;
        } else if (contrib < 0) {
            sideObj.breadth.neg += 1;
            sideObj.contribution.negSum += contrib;
            sideObj.pnlLike.negSum += pnl;
        } else {
            sideObj.breadth.zero += 1;
        }
        sideObj.rows.push({
            key: 'pair',
            group: 'driver',
            label: 'WINâ†‘ + WDOâ†“ (confirmaÃ§Ã£o)',
            symbol: null,
            pct: side === 'wdo' ? pair.wdoPct : pair.winPct,
            signed,
            weight: pair.weight,
            capAbs: pair.capAbs,
            contrib,
            pnl,
        });
        sideObj.net = clamp(sideObj.contribution.net, -3, 3);
        sideObj.bias = sideObj.net > 0.25 ? 'buy' : sideObj.net < -0.25 ? 'sell' : 'neutral';
    };

    applyPair(wdo, 'wdo');
    applyPair(win, 'win');

    const align = (aSym, bSym, th = 0.06) => {
        const a = get(aSym);
        const b = get(bSym);
        if (!isNum(a) || !isNum(b)) return { ok: null, a, b, ad: 0, bd: 0, th, reason: 'missing' };
        const ad = signDir(a, th);
        const bd = signDir(b, th);
        if (ad === 0 || bd === 0) return { ok: null, a, b, ad, bd, th, reason: 'weak' };
        return { ok: ad === bd, a, b, ad, bd, th, reason: 'dir' };
    };

    const expectedKeys = driversCfg.map(x => x.key);
    const missFor = side => {
        const p = side === 'wdo' ? wdo : win;
        const got = new Set((p.rows || []).map(r => String(r && r.key ? r.key : '')));
        return expectedKeys.filter(k => !got.has(k));
    };

    return {
        sym,
        market: { wdoPct: drv.wdo.pct, winPct: drv.win.pct },
        pulse: { wdo, win },
        align: {
            wdo_usdbrl: align(sym.wdo, sym.usdbrl),
            wdo_dxy: align(sym.wdo, sym.dxy),
            win_ibov: align(sym.win, sym.ibov),
            win_ewz: align(sym.win, sym.ewz),
        },
        coverage: {
            expected: expectedKeys.length,
            wdo: { observed: wdo.rows.length, missing: missFor('wdo') },
            win: { observed: win.rows.length, missing: missFor('win') },
        },
    };
}

function computeHk50PulseNow(data, web) {
    const isNum = v => typeof v === 'number' && Number.isFinite(v);
    const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

    const get = s => (s ? getChangePct(data, s) : null);

    const catalog = (typeof window !== 'undefined' && window.InstrumentsCatalog) ? window.InstrumentsCatalog : null;
    const dcDeps = buildDcDeps();
    const catDeps = buildCatDeps(dcDeps);
    const rcKey = (key, fallbackMatcher) => {
        const sym = catalog && typeof catalog.resolveRatesCreditByKey === 'function'
            ? catalog.resolveRatesCreditByKey(catDeps, data, key)
            : null;
        if (sym) return sym;
        if (fallbackMatcher instanceof RegExp) return findAssetSymbol(data, fallbackMatcher);
        return null;
    };

    const assets = data && Array.isArray(data.assets) ? data.assets : [];
    const mostRecentMs = (symbol) => {
        if (!symbol) return -Infinity;
        const last = (typeof getMostRecentPointWithPrice === 'function' ? getMostRecentPointWithPrice(data, symbol) : null) || getLastPoint(data, symbol);
        const t = last && last.t ? Date.parse(String(last.t)) : NaN;
        return Number.isFinite(t) ? t : -Infinity;
    };
    const byMatchers = (matchers, { limit = 10 } = {}) => {
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
        return out;
    };
    const pickBest = (cands) => (Array.isArray(cands) && cands.length ? cands[0] : null);
    const aliasSym = k => findAliasSymbolBest(data, k) || findAliasSymbol(data, k);
    const symBest = (aliasKey, matchers) => aliasSym(aliasKey) || pickBest(byMatchers(matchers, { limit: 12 }));
    const pickFreshest = (symbols) => {
        const list = (symbols || []).filter(Boolean).map(s => String(s)).filter(Boolean);
        if (!list.length) return null;
        list.sort((a, b) => mostRecentMs(b) - mostRecentMs(a));
        return list[0] || null;
    };
    const buildReturnSeries = (symbol, maxPoints) => {
        if (!symbol) return [];
        const pts = (data && data.series && data.series[symbol]) ? data.series[symbol] : [];
        const priced = Array.isArray(pts)
            ? pts
                .map(p => {
                    const tMs = p && p.t ? Date.parse(p.t) : NaN;
                    const price = p && typeof p.price === 'number' && Number.isFinite(p.price) ? p.price : null;
                    return Number.isFinite(tMs) && typeof price === 'number' ? { tMs, price } : null;
                })
                .filter(Boolean)
            : [];
        if (priced.length < 3) return [];
        const n = Math.max(24, Math.floor(Number(maxPoints) || 120));
        const slice = priced.slice(Math.max(0, priced.length - n));
        const out = [];
        for (let i = 1; i < slice.length; i++) {
            const prev = slice[i - 1];
            const cur = slice[i];
            if (!prev || !cur) continue;
            if (!(prev.price > 0) || !(cur.price > 0)) continue;
            const r = Math.log(cur.price / prev.price);
            if (!Number.isFinite(r)) continue;
            out.push({ tMs: cur.tMs, r });
        }
        return out;
    };
    const correlationAligned = (a, b) => {
        const mapB = new Map(b.map(x => [x.tMs, x.r]));
        const xs = [];
        const ys = [];
        for (const x of a) {
            if (!x || !Number.isFinite(x.tMs) || !Number.isFinite(x.r)) continue;
            const y = mapB.get(x.tMs);
            if (typeof y !== 'number' || !Number.isFinite(y)) continue;
            xs.push(x.r);
            ys.push(y);
        }
        const n = xs.length;
        if (n < 20) return { corr: null, n };
        const mx = xs.reduce((s, v) => s + v, 0) / n;
        const my = ys.reduce((s, v) => s + v, 0) / n;
        let cov = 0;
        let vx = 0;
        let vy = 0;
        for (let i = 0; i < n; i++) {
            const dx = xs[i] - mx;
            const dy = ys[i] - my;
            cov += dx * dy;
            vx += dx * dx;
            vy += dy * dy;
        }
        const denom = Math.sqrt(vx * vy);
        if (!(denom > 0) || !Number.isFinite(denom)) return { corr: null, n };
        const c = cov / denom;
        return { corr: Number.isFinite(c) ? Math.max(-1, Math.min(1, c)) : null, n };
    };
    const getRatesMoveProxy = s => {
        if (!s) return null;
        const series = data && data.series && Array.isArray(data.series[s]) ? data.series[s] : [];
        if (!series.length) return null;
        const last = series[series.length - 1];
        const lastPrice = last && typeof last.price === 'number' && Number.isFinite(last.price) ? last.price : null;
        const lastPct = pointPct(last);
        if (typeof lastPct === 'number' && Number.isFinite(lastPct)) return lastPct;
        const prev = series.length > 1 ? series[series.length - 2] : null;
        const prevPrice = prev && typeof prev.price === 'number' && Number.isFinite(prev.price) ? prev.price : null;
        const deltaRaw = last && typeof last.change === 'number' && Number.isFinite(last.change)
            ? last.change
            : (lastPrice !== null && prevPrice !== null ? (lastPrice - prevPrice) : null);
        if (deltaRaw === null || !Number.isFinite(deltaRaw)) return null;
        const absPrice = lastPrice !== null ? Math.abs(lastPrice) : 0;
        const deltaBp = absPrice > 20 ? deltaRaw : (deltaRaw * 100);
        return deltaBp * 0.1;
    };

    const sym = (() => {
        const hk50 = symBest('HK50', [/^HSIQ/i, /^HK50$/i, /^\.HSI$/i, /^HSI$/i, /\bHang\s*Seng\b/i, /\bHK\s*50\b/i]);
        const hstech = symBest('HSTECH', [/^HSTECH$/i, /^\.HSTECH$/i, /\bHang\s*Seng\s*TECH\b/i, /\bHang\s*Seng\b.*\bTECH\b/i]);
        const hsfin = symBest('HSI_FIN', [/^\.(HSNF|HSHFI)\b/i, /\bHSI-?Finance\b/i, /\bHang\s*Seng\b.*\bFinance\b/i, /\bHang\s*Seng\b.*\bHFI\b/i]);
        const hshares = symBest('HSHARES', [/^HCEI/i, /\bH-?Shares\b/i, /\bChina\b.*\bH-?Shares\b/i, /\bHCEI\b/i]);
        const ewh = symBest('EWH', [/^EWH$/i, /\biShares\b.*\bHong\s*Kong\b/i]);

        const fxi = symBest('FXI', [/^FXI(\.\w+)?$/i, /\bChina\b.*\bLarge\b.*\bCap\b/i]);
        const mchi = symBest('MCHI', [/^MCHI(\.\w+)?$/i, /\bMSCI\b.*\bChina\b/i]);
        const ashr = symBest('ASHR', [/^ASHR(\.\w+)?$/i, /\bChina\b.*\bA-?Shares\b/i]);
        const kweb = symBest('KWEB', [/^KWEB(\.\w+)?$/i, /\bChina\b.*\bInternet\b/i]);
        const csi300 = symBest('CSI300', [/^CSI300$/i, /\bCSI\s*300\b/i]);
        const cn50 = symBest('CN50', [/^CHINA50$/i, /^CN50$/i, /\bChina\s*A50\b/i, /\bFTSE\b.*\bChina\b.*\bA50\b/i]);
        const fxChina = pickFreshest([fxi, mchi, ashr, kweb, csi300, cn50, symBest('CHINA', [/^CHINA50$/i, /\bHang\s*Seng\b.*\bChina\b.*\b50\b/i, /\bChina\b.*\bETF\b/i])]);

        const usdCnh = symBest('USD_CNH', [/^USD\/CNH\b/i]);
        const usdCny = symBest('USD_CNY', [/^USD\/CNY\b/i]);
        const usdHkd = symBest('USD_HKD', [/^USD\/HKD\b/i]);
        const audusd = pickBest(byMatchers([/^AUD\/USD\b/i], { limit: 6 }));

        const dxy = symBest('DXY', [/(^\.DXY$|\bDXY\b|US Dollar Index|\bUSDX\b|Dollar Index)/i]);
        const spx = symBest('SPX', [/(^\.SPX$|^\^GSPC$|^SPX$|^SPY(\b|$)|^IVV(\b|$)|^VOO(\b|$)|^ES[HMUZ]\d{1,2}(\b|=\$)?|S&P\s*500)/i]);
        const ndx = symBest('NDX', [/(^\.NDX$|^NDX$|^QQQ(\b|$)|^NQ[HMUZ]\d{1,2}(\b|=\$)?|Nasdaq\s*100)/i]);

        const us10y = rcKey('US_10Y', /(^US10YT=RR$|^US10YT=X$|^\.TNX$|\^TNX)/i) || symBest('US10Y', [/^US10YT=RR$/i, /^USGV10YUSAB=R$/i, /^TNc\d=\$?$/i, /^TYc\d=\$?$/i, /^\^TNX$/i]);
        const us2y = rcKey('US_2Y', /^US2YT=RR$/i) || symBest('US2Y', [/^US2YT=RR$/i, /^TUc\d=\$?$/i, /^\^IRX$/i]);

        const hk10y = symBest('HK10Y', [/^HK10YT=RR$/i, /\bHong\s*Kong\b.*\b10\b.*\b(Year|anos|anos?)\b/i]);
        const hk1m = symBest('HK1M', [/^HK1MT=RR$/i, /\bHong\s*Kong\b.*\b1\b.*\b(m[eÃª]s|month)\b/i]);
        const hk3m = symBest('HK3M', [/^HK3MT=RR$/i, /\bHong\s*Kong\b.*\b3\b.*\b(meses|months)\b/i]);
        const cn10y = symBest('CN10Y', [/^CN10YT=RR$/i, /\bChina\b.*\b10\b.*\b(Year|anos|anos?)\b/i]);
        const us10hk10 = symBest('SPREAD_HK10Y', [
            /^US10HK10=RR$/i,
            /Spread.*Hong\s*Kong.*10.*(EUA|US|China|CHI).*10/i,
            /Spread.*(EUA|US|China|CHI).*10.*Hong\s*Kong.*10/i,
            /Spread.*EUA.*10A.*(HK|HKG|Hong\s*Kong).*10A/i,
            /Spread.*(HK|HKG|Hong\s*Kong).*10A.*EUA.*10A/i,
        ]);
        const cdsCn5y = symBest('CDS_CN5Y', [/^CNGV5YUSAC=R$/i, /^CNGV/i, /\bCDS\b.*\bChina\b/i, /\bChina\b.*\bCDS\b/i]);

        const vix9d = symBest('VIX9D', [/^\.?VIX9D$/i]);
        const vix30 = symBest('VIX30', [/^VIX$/i, /^\.VIX$/i, /^\.?VIX$/i, /^\.?VIX30$/i]);
        const vix = symBest('VIX', [/^VIX$/i, /^\.VIX$/i, /^\.?VIX(9D)?$/i]) || vix30 || vix9d;
        const vvix = symBest('VVIX', [/^\.VVIX$/i, /\bVVIX\b/i]);
        const vhsi = symBest('VHSI', [/^\.VHSI$/i, /^VHSI(c\d+)?$/i, /\bHSI\s*Volatility\b/i, /\bHang\s*Seng\b.*Vol/i]);

        const eem = symBest('EEM', [/^EEM(\.\w+)?$/i]) || symBest('VWO', [/^VWO(\.\w+)?$/i]);
        const hyg = rcKey('ETF_HYG', /^HYG(\.\w+)?$/i) || symBest('HYG', [/^HYG(\.\w+)?$/i]);
        const tlt = rcKey('ETF_TLT', /^TLT(\.\w+)?$/i) || symBest('TLT', [/^TLT(\.\w+)?$/i]);
        const brent = symBest('BRENT', [/\bBrent\b/i, /^(LCO|BRN)c\d/i, /^BZ=F$/i]);
        const copper = symBest('COPPER', [/^HG=F$/i, /^HGc\d(=\$)?$/i, /^HG$/i, /^CPER(\.\w+)?$/i, /\bCopper\b/i, /\bCobre\b/i]);
        const iron = symBest('IRON', [/^DCE_I0$/i, /\bIron\s*Ore\b/i, /\bMin[eÃª]rio\b/i, /\bTIO\b/i, /\bSM58F\b/i]);
        const gold = symBest('GOLD', [/^GC=F$/i, /^GCc\d(=\$)?$/i, /^XAU(USD)?$/i, /^GLD(\.\w+)?$/i, /\bGold\b/i, /\bOuro\b/i]);
        const btc = symBest('BTC', [/^BTC\/USD$/i, /\bbitcoin\b/i]);

        return {
            hk50,
            hstech,
            hsfin,
            hshares,
            ewh,
            fxi,
            mchi,
            ashr,
            kweb,
            csi300,
            cn50,
            fxChina,
            usdCnh,
            usdCny,
            usdHkd,
            audusd,
            dxy,
            spx,
            ndx,
            us10y,
            us2y,
            hk10y,
            hk1m,
            hk3m,
            cn10y,
            us10hk10,
            cdsCn5y,
            vix9d,
            vix30,
            vix,
            vvix,
            vhsi,
            eem,
            hyg,
            tlt,
            brent,
            copper,
            iron,
            gold,
            btc,
        };
    })();

    const hkVol = sym.vhsi ? get(sym.vhsi) : null;
    const vixPulso = sym.vix9d ? get(sym.vix9d) : null;
    const vixRegime = sym.vix30 ? get(sym.vix30) : null;
    const usdChina = isNum(get(sym.usdCnh)) ? get(sym.usdCnh) : get(sym.usdCny);
    const usdHkd = get(sym.usdHkd);
    const hk50Pct = get(sym.hk50);

    const volAmp = (() => {
        const spot = (s) => {
            const pt = s ? ((typeof getMostRecentPointWithPrice === 'function' ? getMostRecentPointWithPrice(data, s) : null) || getLastPoint(data, s)) : null;
            return pt && typeof pt.price === 'number' && Number.isFinite(pt.price) ? pt.price : null;
        };
        const vix = spot(sym.vix) ?? spot(sym.vix30) ?? spot(sym.vix9d);
        const vhsi = spot(sym.vhsi);
        const vixRel = isNum(vix) ? clamp(vix / 20, 0.75, 1.6) : null;
        const vhsiRel = isNum(vhsi) ? clamp(vhsi / 20, 0.75, 1.6) : null;
        const amp = (vixRel !== null && vhsiRel !== null) ? ((vixRel + vhsiRel) / 2) : (vixRel !== null ? vixRel : (vhsiRel !== null ? vhsiRel : 1));
        return { amp: isNum(amp) ? amp : 1, vix: isNum(vix) ? vix : null, vhsi: isNum(vhsi) ? vhsi : null };
    })();

    const driversCfg = [
        { key: 'hstech', group: 'driver', weight: 0.7, capAbs: 1.8, sign: +1 },
        { key: 'hsfin', group: 'driver', weight: 0.45, capAbs: 1.8, sign: +1 },
        { key: 'hshares', group: 'driver', weight: 0.35, capAbs: 1.8, sign: +1 },
        { key: 'fxi', group: 'driver', weight: 0.35, capAbs: 1.6, sign: +1 },
        { key: 'mchi', group: 'driver', weight: 0.20, capAbs: 1.6, sign: +1 },
        { key: 'kweb', group: 'driver', weight: 0.18, capAbs: 1.8, sign: +1 },
        { key: 'ashr', group: 'driver', weight: 0.15, capAbs: 1.6, sign: +1 },
        { key: 'csi300', group: 'driver', weight: 0.12, capAbs: 1.6, sign: +1 },
        { key: 'cn50', group: 'driver', weight: 0.15, capAbs: 1.8, sign: +1 },
        { key: 'usdChina', group: 'driver', weight: 0.55, capAbs: 0.6, sign: -1 },
        { key: 'usdHkd', group: 'driver', weight: 0.2, capAbs: 0.35, sign: -1 },
        { key: 'dxy', group: 'driver', weight: 0.45, capAbs: 0.6, sign: -1 },
        { key: 'vhsi', group: 'driver', weight: 0.45, capAbs: 5.0, sign: -1 },

        { key: 'spx', group: 'confirm', weight: 0.35, capAbs: 1.1, sign: +1 },
        { key: 'ndx', group: 'confirm', weight: 0.25, capAbs: 1.3, sign: +1 },
        { key: 'audusd', group: 'confirm', weight: 0.12, capAbs: 1.0, sign: +1 },
        { key: 'vixPulso', group: 'confirm', weight: 0.25, capAbs: 4.0, sign: -1 },
        { key: 'vixRegime', group: 'confirm', weight: 0.2, capAbs: 3.5, sign: -1 },
        { key: 'vvix', group: 'confirm', weight: 0.15, capAbs: 5.0, sign: -1 },
        { key: 'us10y', group: 'confirm', weight: 0.2, capAbs: 0.6, sign: -1 },
        { key: 'hk10y', group: 'confirm', weight: 0.12, capAbs: 0.6, sign: -1 },
        { key: 'hk1m', group: 'confirm', weight: 0.08, capAbs: 0.6, sign: -1 },
        { key: 'hk3m', group: 'confirm', weight: 0.08, capAbs: 0.6, sign: -1 },
        { key: 'cn10y', group: 'confirm', weight: 0.1, capAbs: 0.6, sign: -1 },
        { key: 'us10hk10', group: 'confirm', weight: 0.12, capAbs: 0.6, sign: -1 },
        { key: 'cdsCn5y', group: 'confirm', weight: 0.12, capAbs: 2.0, sign: -1 },
        { key: 'hyg', group: 'confirm', weight: 0.15, capAbs: 1.2, sign: +1 },

        { key: 'eem', group: 'context', weight: 0.12, capAbs: 1.2, sign: +1 },
        { key: 'copper', group: 'context', weight: 0.16, capAbs: 1.8, sign: +1 },
        { key: 'iron', group: 'context', weight: 0.12, capAbs: 2.2, sign: +1 },
        { key: 'brent', group: 'context', weight: 0.08, capAbs: 2.2, sign: +1 },
        { key: 'gold', group: 'context', weight: 0.08, capAbs: 1.6, sign: -1 },
        { key: 'tlt', group: 'context', weight: 0.08, capAbs: 1.2, sign: -1 },
        { key: 'us2y', group: 'context', weight: 0.08, capAbs: 0.6, sign: -1 },
        { key: 'btc', group: 'context', weight: 0.05, capAbs: 4.0, sign: +1 },
        { key: 'ewh', group: 'context', weight: 0.05, capAbs: 1.6, sign: +1 },
    ];

    const drv = {
        hk50: { label: 'HK50', pct: hk50Pct, sym: sym.hk50 },
        hstech: { label: 'HSTECH', pct: get(sym.hstech), sym: sym.hstech },
        hsfin: { label: 'HSI Finance', pct: get(sym.hsfin), sym: sym.hsfin },
        hshares: { label: 'H-Shares', pct: get(sym.hshares), sym: sym.hshares },
        ewh: { label: 'EWH', pct: get(sym.ewh), sym: sym.ewh },
        fxi: { label: 'FXI', pct: get(sym.fxi), sym: sym.fxi },
        mchi: { label: 'MCHI', pct: get(sym.mchi), sym: sym.mchi },
        ashr: { label: 'ASHR', pct: get(sym.ashr), sym: sym.ashr },
        kweb: { label: 'KWEB', pct: get(sym.kweb), sym: sym.kweb },
        csi300: { label: 'CSI300', pct: get(sym.csi300), sym: sym.csi300 },
        cn50: { label: 'CN50 (China A50)', pct: get(sym.cn50), sym: sym.cn50 },
        usdChina: { label: 'USD/CNH (ou CNY)', pct: usdChina, sym: sym.usdCnh || sym.usdCny },
        usdHkd: { label: 'USD/HKD', pct: usdHkd, sym: sym.usdHkd },
        audusd: { label: 'AUD/USD (beta China)', pct: get(sym.audusd), sym: sym.audusd },
        dxy: { label: 'DXY', pct: get(sym.dxy), sym: sym.dxy },
        spx: { label: 'SPX', pct: get(sym.spx), sym: sym.spx },
        ndx: { label: 'NDX', pct: get(sym.ndx), sym: sym.ndx },
        us10y: { label: 'US10Y', pct: getRatesMoveProxy(sym.us10y), sym: sym.us10y },
        us2y: { label: 'US2Y', pct: getRatesMoveProxy(sym.us2y), sym: sym.us2y },
        hk10y: { label: 'HK10Y', pct: getRatesMoveProxy(sym.hk10y), sym: sym.hk10y },
        hk1m: { label: 'HK 1M (liquidez)', pct: getRatesMoveProxy(sym.hk1m), sym: sym.hk1m },
        hk3m: { label: 'HK 3M (liquidez)', pct: getRatesMoveProxy(sym.hk3m), sym: sym.hk3m },
        cn10y: { label: 'CN10Y', pct: getRatesMoveProxy(sym.cn10y), sym: sym.cn10y },
        us10hk10: {
            label: 'Spread 10Y (HK vs US/China)',
            pct: isNum(getRatesMoveProxy(sym.us10hk10))
                ? getRatesMoveProxy(sym.us10hk10)
                : (isNum(getRatesMoveProxy(sym.hk10y)) && isNum(getRatesMoveProxy(sym.cn10y)) ? (getRatesMoveProxy(sym.hk10y) - getRatesMoveProxy(sym.cn10y)) : null),
            sym: sym.us10hk10 || null
        },
        cdsCn5y: { label: 'China CDS 5Y (USD)', pct: get(sym.cdsCn5y), sym: sym.cdsCn5y },
        vixPulso: { label: 'VIX9D', pct: vixPulso, sym: sym.vix9d },
        vixRegime: { label: 'VIX', pct: vixRegime, sym: sym.vix30 },
        vvix: { label: 'VVIX', pct: get(sym.vvix), sym: sym.vvix },
        vhsi: { label: 'VHSI', pct: hkVol, sym: sym.vhsi },
        eem: { label: 'EEM/VWO', pct: get(sym.eem), sym: sym.eem },
        hyg: { label: 'HYG', pct: get(sym.hyg), sym: sym.hyg },
        tlt: { label: 'TLT', pct: get(sym.tlt), sym: sym.tlt },
        brent: { label: 'Brent', pct: get(sym.brent), sym: sym.brent },
        copper: { label: 'Cobre', pct: get(sym.copper), sym: sym.copper },
        iron: { label: 'MinÃ©rio', pct: get(sym.iron), sym: sym.iron },
        gold: { label: 'Ouro', pct: get(sym.gold), sym: sym.gold },
        btc: { label: 'BTC', pct: get(sym.btc), sym: sym.btc },
    };

    const rows = [];
    const breadth = { pos: 0, neg: 0, zero: 0 };
    const contribution = { posSum: 0, negSum: 0, net: 0 };
    const pnlLike = { posSum: 0, negSum: 0, net: 0 };
    const groups = {
        driver: { net: 0, pnl: 0, count: 0 },
        confirm: { net: 0, pnl: 0, count: 0 },
        context: { net: 0, pnl: 0, count: 0 },
    };

    for (const cfg of driversCfg) {
        const d = drv[cfg.key];
        const pct = d ? d.pct : null;
        if (!isNum(pct)) continue;
        const signed = cfg.sign * pct;
        const capped = clamp(signed, -cfg.capAbs, cfg.capAbs);
        const contrib = cfg.weight * (cfg.capAbs > 0 ? capped / cfg.capAbs : 0);
        const pnl = cfg.weight * capped;
        const g = cfg.group === 'driver' || cfg.group === 'confirm' || cfg.group === 'context' ? cfg.group : 'context';
        contribution.net += contrib;
        pnlLike.net += pnl;
        groups[g].net += contrib;
        groups[g].pnl += pnl;
        groups[g].count += 1;
        if (contrib > 0) {
            breadth.pos += 1;
            contribution.posSum += contrib;
            pnlLike.posSum += pnl;
        } else if (contrib < 0) {
            breadth.neg += 1;
            contribution.negSum += contrib;
            pnlLike.negSum += pnl;
        } else {
            breadth.zero += 1;
        }
        rows.push({
            key: cfg.key,
            group: g,
            label: d.label,
            symbol: d.sym || null,
            pct,
            signed,
            weight: cfg.weight,
            capAbs: cfg.capAbs,
            contrib,
            pnl,
        });
    }

    const net = clamp(contribution.net, -3, 3);
    const bias = net > 0.25 ? 'buy' : net < -0.25 ? 'sell' : 'neutral';

    const expectedKeys = driversCfg.map(x => x.key);
    const got = new Set(rows.map(r => String(r && r.key ? r.key : '')));
    const missing = expectedKeys.filter(k => !got.has(k));
    const keyLabels = (() => {
        const m = {};
        for (const k of expectedKeys) {
            const d = drv[k];
            m[k] = d && d.label ? String(d.label) : k;
        }
        return m;
    })();
    const missingDetails = (() => {
        const m = {};
        for (const k of missing) {
            const d = drv[k];
            const s = d && d.sym ? String(d.sym) : '';
            if (!s) {
                m[k] = 'sem sÃ­mbolo';
                continue;
            }
            const pts = data && data.series && Array.isArray(data.series[s]) ? data.series[s] : [];
            if (!pts.length) {
                m[k] = 'sem sÃ©rie';
                continue;
            }
            const last = getLastPoint(data, s);
            if (!last) {
                m[k] = 'sem Ãºltimo ponto';
                continue;
            }
            if (pointPct(last) === null) {
                m[k] = pts.length < 2 ? 'apenas 1 ponto (sem var%)' : 'sem var% (changePct/extended)';
                continue;
            }
            m[k] = 'sem var%';
        }
        return m;
    })();

    const parity = (() => {
        const sign = (v, th = 0.10) => (typeof v === 'number' && Number.isFinite(v) ? (v > th ? +1 : v < -th ? -1 : 0) : 0);
        const ok = (a, b, inverse = false) => {
            const sa = sign(a);
            const sb = sign(b);
            if (!sa || !sb) return null;
            return inverse ? (sa === -sb) : (sa === sb);
        };

        const usdCnhPct = sym.usdCnh || sym.usdCny ? getChangePct(data, sym.usdCnh || sym.usdCny) : null;
        const spxPct = sym.spx ? getChangePct(data, sym.spx) : null;
        const chinaPct = (() => {
            const list = [sym.fxi, sym.mchi, sym.ashr, sym.kweb, sym.csi300, sym.cn50].filter(Boolean);
            const vals = list.map(s => getChangePct(data, s)).filter(v => typeof v === 'number' && Number.isFinite(v));
            if (!vals.length) return null;
            return vals.reduce((a, b) => a + b, 0) / vals.length;
        })();

        return {
            hk50_usdcnh_inv: ok(hk50Pct, usdCnhPct, true),
            hk50_spx: ok(hk50Pct, spxPct, false),
            hk50_china: ok(hk50Pct, chinaPct, false),
        };
    })();

    const conviction = (() => {
        const clamp01 = (v) => Math.max(0, Math.min(1, typeof v === 'number' && Number.isFinite(v) ? v : 0));
        const cov = expectedKeys.length ? (rows.length / expectedKeys.length) : 0;
        const strength = clamp01(Math.abs(net) / 0.9);
        const hkAgeMin = (() => {
            const t = mostRecentMs(sym.hk50);
            if (!Number.isFinite(t) || !(t > 0)) return null;
            return (Date.now() - t) / 60000;
        })();
        const freshFactor = (typeof hkAgeMin === 'number' && Number.isFinite(hkAgeMin))
            ? (hkAgeMin <= 15 ? 1 : hkAgeMin <= 30 ? 0.88 : hkAgeMin <= 60 ? 0.74 : 0.6)
            : 0.78;

        let score = clamp01((0.55 * cov + 0.45 * strength) * freshFactor);
        const divs = [];

        const amp = volAmp && typeof volAmp.amp === 'number' && Number.isFinite(volAmp.amp) ? volAmp.amp : 1;
        const stress = amp >= 1.18;
        const p1 = parity.hk50_usdcnh_inv;
        const p2 = parity.hk50_spx;
        const p3 = parity.hk50_china;
        const bad = [p1, p2, p3].filter(v => v === false).length;

        if (stress && bad) {
            const penalty = Math.max(0.65, 1 - (0.10 * bad) - (amp >= 1.30 ? 0.06 : 0));
            score = clamp01(score * penalty);
            if (p1 === false) divs.push('Paridade divergente: HK50Ã—USD/CNH (inv)');
            if (p2 === false) divs.push('Paridade divergente: HK50Ã—SPX');
            if (p3 === false) divs.push('Paridade divergente: HK50Ã—China');
            divs.push(`Vol alta (volAmp ${formatNumber(amp, 2)}) â†’ convicÃ§Ã£o reduzida`);
        }

        const label = score >= 0.74 ? 'ALTA' : score >= 0.56 ? 'MÃ‰DIA' : 'BAIXA';
        const tone = label === 'ALTA' ? 'positive' : label === 'MÃ‰DIA' ? 'neutral' : 'negative';
        return { score, label, tone, divergences: divs };
    })();

    const suggest = (() => {
        const want = [
            { label: 'HK50/HSI (Hang Seng)', key: 'HK50' },
            { label: 'HSI Finance (setor financeiro)', key: 'HSI_FIN' },
            { label: 'USD/HKD', key: 'USD_HKD' },
            { label: 'USD/CNH', key: 'USD_CNH' },
            { label: 'HSTECH', key: 'HSTECH' },
            { label: 'VHSI (vol HK)', key: 'VHSI' },
            { label: 'China A50 / CN50', key: 'CN50' },
            { label: 'H-Shares (HCEI)', key: 'HSHARES' },
            { label: 'FXI', key: 'FXI' },
            { label: 'MCHI', key: 'MCHI' },
            { label: 'KWEB', key: 'KWEB' },
            { label: 'ASHR', key: 'ASHR' },
            { label: 'CSI300', key: 'CSI300' },
            { label: 'HK10Y (yield)', key: 'HK10Y' },
            { label: 'HK 1M (liquidez)', key: 'HK1M' },
            { label: 'HK 3M (liquidez)', key: 'HK3M' },
            { label: 'Spread HK10Y vs US/China 10Y', key: 'SPREAD_HK10Y' },
            { label: 'China CDS 5Y (USD)', key: 'CDS_CN5Y' },
            { label: 'AUD/USD (beta China)', key: 'AUD/USD' },
        ];
        const out = [];
        for (const w of want) {
            const has =
                w.key === 'HSHARES'
                    ? sym.hshares
                    : w.key === 'AUD/USD'
                        ? sym.audusd
                        : (findAliasSymbolBest(data, w.key) || aliasSym(w.key) || pickBest(byMatchers(assetAliasMatchers(w.key), { limit: 6 })));
            if (!has) out.push(w.label);
        }
        return out;
    })();

    const geoNews = (() => {
        const items = web && Array.isArray(web.items) ? web.items : [];
        const picks = [];
        for (const it of items) {
            const t = it && it.title ? String(it.title) : '';
            if (!t) continue;
            if (!/(Hong Kong|China|Taiwan|Beijing|tariff|sanction|chip|semiconductor|HSTECH|Hang Seng|H-Shares|HCEI|HK)/i.test(t)) continue;
            picks.push(it);
            if (picks.length >= 3) break;
        }
        return picks;
    })();

    const flowCorr = (() => {
        const windowPoints = 160;
        const baseSymbol = sym.hk50 || null;
        const base = baseSymbol ? buildReturnSeries(baseSymbol, windowPoints) : [];

        const corrPair = (label, aSym, bSym) => {
            if (!aSym || !bSym) return { label, corr: null, n: 0 };
            const a = buildReturnSeries(aSym, windowPoints);
            const b = buildReturnSeries(bSym, windowPoints);
            const out = correlationAligned(a, b);
            return { label, corr: out.corr, n: out.n };
        };

        const cnhSym = sym.usdCnh || sym.usdCny || null;
        const items = [
            corrPair('HK50 Ã— USD/CNH', baseSymbol, cnhSym),
            corrPair('HK50 Ã— DXY', baseSymbol, sym.dxy),
            corrPair('HK50 Ã— SPX', baseSymbol, sym.spx),
            corrPair('HK50 Ã— China (FXI/MCHI/CSI300)', baseSymbol, sym.fxChina),
            corrPair('HK50 Ã— Cobre', baseSymbol, sym.copper),
            corrPair('HK50 Ã— MinÃ©rio', baseSymbol, sym.iron),
            corrPair('USD/CNH Ã— Cobre', cnhSym, sym.copper),
            corrPair('USD/CNH Ã— MinÃ©rio', cnhSym, sym.iron),
        ];

        return { baseSymbol, windowPoints, items };
    })();

    return {
        sym,
        market: { hk50Pct },
        pulse: { bias, net, breadth, contribution, pnlLike, groups, rows },
        coverage: { expected: expectedKeys.length, observed: rows.length, missing, keyLabels, missingDetails },
        missingAssetsSuggestion: suggest,
        news: geoNews,
        flowCorr,
        volAmp,
        parity,
        conviction,
    };
}

function computeUsEquitiesPulseNow(data, web) {
    const isNum = v => typeof v === 'number' && Number.isFinite(v);
    const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
    const get = s => (s ? getChangePct(data, s) : null);

    const catalog = (typeof window !== 'undefined' && window.InstrumentsCatalog) ? window.InstrumentsCatalog : null;
    const dcDeps = buildDcDeps();
    const catDeps = buildCatDeps(dcDeps);
    const rcKey = (key, fallbackMatcher) => {
        const sym = catalog && typeof catalog.resolveRatesCreditByKey === 'function'
            ? catalog.resolveRatesCreditByKey(catDeps, data, key)
            : null;
        if (sym) return sym;
        if (fallbackMatcher instanceof RegExp) return findAssetSymbol(data, fallbackMatcher);
        return null;
    };

    const assets = data && Array.isArray(data.assets) ? data.assets : [];
    const byMatchers = (matchers, { limit = 10 } = {}) => {
        const out = [];
        const seen = new Set();
        const ms = (s) => {
            const last = s ? (getMostRecentPointWithPrice(data, s) || getLastPoint(data, s)) : null;
            const t = last && last.t ? Date.parse(String(last.t)) : NaN;
            return Number.isFinite(t) ? t : -Infinity;
        };
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
        out.sort((a, b) => ms(b) - ms(a));
        return out;
    };
    const pickBest = (cands) => (Array.isArray(cands) && cands.length ? cands[0] : null);
    const pickPreferred = (futurePatterns, fallbackPatterns, aliasKey = null) => {
        const fut = pickBest(byMatchers(futurePatterns || [], { limit: 12 }));
        if (fut) return fut;
        const ali = aliasKey ? findAliasSymbolBest(data, aliasKey) : null;
        if (ali) return ali;
        return pickBest(byMatchers(fallbackPatterns || [], { limit: 12 }));
    };
    const asSource = (symbol, futurePatterns = []) => {
        const s = String(symbol || '');
        if (!s) return 'missing';
        for (const re of futurePatterns) if (re.test(s)) return 'future';
        return 'proxy';
    };

    const sym = {
        spx: pickPreferred(
            [/^ES[HMUZ]\d{1,2}(=\$)?$/i],
            [/^\.SPX$/i, /^SPX$/i, /^\^GSPC$/i, /^SPY(\.\w+)?$/i, /^IVV(\.\w+)?$/i, /^VOO(\.\w+)?$/i, /\bS&P\s*500\b(?![\s\S]*\bVIX\b)(?![\s\S]*Volatil)/i],
            'SPX'
        ),
        ndx: pickPreferred(
            [/^NQ[HMUZ]\d{1,2}(=\$)?$/i],
            [/^\.NDX$/i, /^NDX$/i, /^QQQ(\.\w+)?$/i, /\bNasdaq\s*100\b(?![\s\S]*Volatil)/i],
            'NDX'
        ),
        dow: pickPreferred(
            [/^YM[HMUZ]\d{1,2}(=\$)?$/i],
            [/^\.DJI$/i, /^\^DJI$/i, /\bDow\s*Jones\b/i, /^DIA(\.\w+)?$/i],
            'DOW'
        ),
        dxy: findAliasSymbolBest(data, 'DXY') || pickBest(byMatchers([/^\.DXY$/i, /^DXY$/i, /^DX=F$/i, /^DXc\d(=\$)?$/i, /\bUS\s*Dollar\s*Index\b/i], { limit: 10 })),
        vix: findAliasSymbolBest(data, 'VIX9D') || findAliasSymbolBest(data, 'VIX') || pickBest(byMatchers([/^\.?VIX(9D)?$/i, /^VIX$/i, /^\.VIX$/i], { limit: 10 })),
        vvix: findAliasSymbolBest(data, 'VVIX') || pickBest(byMatchers([/^\.VVIX$/i, /\bVVIX\b/i], { limit: 8 })),
        vxn: findAliasSymbolBest(data, 'VXN') || pickBest(byMatchers([/^\.VXN$/i, /\bVXN\b/i], { limit: 8 })),
        rvx: pickBest(byMatchers([/^\.?RVX$/i, /\bRussell\s*2000\s*Vol/i], { limit: 8 })),
        us2y: rcKey('US_2Y', /^US2YT=RR$/i) || findAliasSymbolBest(data, 'US2Y') || pickBest(byMatchers([/^US2YT=RR$/i, /^TUc\d=\$?$/i, /\bUnited States 2-Year\b/i, /\bUS2Y\b/i], { limit: 10 })),
        us10y: rcKey('US_10Y', /^US10YT=RR$/i) || findAliasSymbolBest(data, 'US10Y') || pickBest(byMatchers([/^US10YT=RR$/i, /^USGV10YUSAB=R$/i, /^TNc\d=\$?$/i, /^TYc\d=\$?$/i, /\bUnited States 10-Year\b/i, /\bUS10Y\b/i], { limit: 10 })),
        us30y: rcKey('US_30Y', /^US30YT=RR$/i) || findAliasSymbolBest(data, 'US30Y') || pickBest(byMatchers([/^US30YT=RR$/i, /^WNc\d=\$?$/i, /\bUnited States 30-Year\b/i, /\bUS30Y\b/i], { limit: 10 })),
        tlt: rcKey('ETF_TLT', /^TLT(\.\w+)?$/i) || findAliasSymbolBest(data, 'TLT') || pickBest(byMatchers([/^TLT(\.\w+)?$/i], { limit: 10 })),
        hyg: rcKey('ETF_HYG', /^HYG(\.\w+)?$/i) || findAliasSymbolBest(data, 'HYG') || pickBest(byMatchers([/^HYG(\.\w+)?$/i], { limit: 10 })),
        eem: findAliasSymbolBest(data, 'EEM') || findAliasSymbolBest(data, 'VWO') || pickBest(byMatchers([/^EEM(\.\w+)?$/i, /^VWO(\.\w+)?$/i, /\bEmerging\b.*\bMarkets\b/i], { limit: 10 })),
        iwm: pickBest(byMatchers([/^IWM(\.\w+)?$/i, /\bRussell\s*2000\b/i], { limit: 10 })),
        xlf: pickBest(byMatchers([/^XLF(\.\w+)?$/i, /\bFinancial\s*Select\s*Sector\b/i], { limit: 10 })),
        xlk: pickBest(byMatchers([/^XLK(\.\w+)?$/i, /\bTechnology\s*Select\s*Sector\b/i], { limit: 10 })),
        oil: findAliasSymbolBest(data, 'BRENT') || findAliasSymbolBest(data, 'WTI') || pickBest(byMatchers([/^BZ=F$/i, /^(LCO|BRN)c\d(=\$)?$/i, /^CL=F$/i, /^CLc\d(=\$)?$/i, /\bBrent\b/i, /\bWTI\b/i], { limit: 10 })),
        gold: findAliasSymbolBest(data, 'GOLD') || pickBest(byMatchers([/^GC=F$/i, /^GCc\d(=\$)?$/i, /^XAU(USD)?$/i, /^GLD(\.\w+)?$/i, /\bGold\b/i, /\bOuro\b/i], { limit: 10 })),
        copper: findAliasSymbolBest(data, 'COPPER') || pickBest(byMatchers([/^HG=F$/i, /^HGc\d(=\$)?$/i, /^CPER(\.\w+)?$/i, /\bCopper\b/i, /\bCobre\b/i], { limit: 10 })),
        btc: findAliasSymbolBest(data, 'BTC') || pickBest(byMatchers([/^BTC\/USD$/i, /\bbitcoin\b/i], { limit: 10 })),
    };

    const volAmp = (() => {
        const spot = (s) => {
            const pt = s ? (getMostRecentPointWithPrice(data, s) || getLastPoint(data, s)) : null;
            const px = pt && typeof pt.price === 'number' && Number.isFinite(pt.price) ? pt.price : null;
            return px;
        };
        const vix = spot(sym.vix);
        const vxn = spot(sym.vxn);
        const vixRel = isNum(vix) ? clamp(vix / 20, 0.75, 1.5) : null;
        const vxnRel = isNum(vxn) ? clamp(vxn / 25, 0.75, 1.6) : null;
        const amp = (vixRel !== null && vxnRel !== null) ? ((vixRel + vxnRel) / 2) : (vixRel !== null ? vixRel : (vxnRel !== null ? vxnRel : 1));
        return { amp: isNum(amp) ? amp : 1, vix: isNum(vix) ? vix : null, vxn: isNum(vxn) ? vxn : null };
    })();

    const computeNews = (() => {
        const items = web && Array.isArray(web.items) ? web.items : [];
        const confW = c => {
            const s = String(c || '').toLowerCase();
            if (s.includes('high') || s.includes('alta')) return 1.0;
            if (s.includes('medium') || s.includes('mÃ©dia') || s.includes('media')) return 0.75;
            if (s.includes('low') || s.includes('baixa')) return 0.55;
            return 0.7;
        };
        const kw = s =>
            /\bfed\b|\bfomc\b|\bpowell\b|\brate\s*cut\b|\brate\s*hike\b|\byield(s)?\b|\btreasury\b|\binflation\b|\bcpi\b|\bppi\b|\bjobs\b|\bnfp\b|\brecession\b|\bsoft\s*landing\b|\bdollar\b|\bdxy\b|\bbanks?\b|\bcredit\b|\bdefault\b|\bliquidity\b|\brisk\s*off\b|\brisk\s*on\b|\bvix\b|\bgeopolitic\w*\b|\bsanction\w*\b|\bwar\b|\biran\b|\bisrael\b|\brussia\b|\bchina\b|\btaiwan\b|\btariff\w*\b|\boil\b|\bbrent\b|\bwti\b/i.test(s);
        const pos = [
            /\brally\b/i,
            /\bsurge\b/i,
            /\bgain(s|ed)?\b/i,
            /\brise(s|d)?\b/i,
            /\bbull(ish)?\b/i,
            /\brate\s*cut\b/i,
            /\bsoft\s*landing\b/i,
            /\bdisinflation\b/i,
        ];
        const neg = [
            /\bsell[-\s]?off\b/i,
            /\bplunge\b/i,
            /\bcrash\b/i,
            /\bstress\b/i,
            /\bdefault\b/i,
            /\bcredit\s*event\b/i,
            /\brate\s*hike\b/i,
            /\bhot\s*inflation\b/i,
            /\bshock\b/i,
        ];
        let matched = 0;
        let score = 0;
        const top = [];
        for (const it of items.slice(0, 70)) {
            const title = it && it.title ? String(it.title) : '';
            if (!title) continue;
            if (!kw(title)) continue;
            if (top.length < 6) top.push(it);
            matched++;
            const w = confW(it && it.confidence);
            let s = 0;
            for (const re of pos) if (re.test(title)) s += 1;
            for (const re of neg) if (re.test(title)) s -= 1;
            score += w * clamp(s, -3, 3);
        }
        const denom = matched > 0 ? matched * 3 : 1;
        const normalized = clamp(score / denom, -1, 1);
        return { used: !!items.length, matched, score: normalized, top };
    })();

    const buildReturnSeries = (symbol, windowPoints = 96) => {
        const series = data && data.series && Array.isArray(data.series[symbol]) ? data.series[symbol] : [];
        if (!series.length) return [];
        const start = Math.max(0, series.length - windowPoints);
        const out = [];
        for (let i = start + 1; i < series.length; i += 1) {
            const a = series[i - 1];
            const b = series[i];
            const pa = a && typeof a.price === 'number' && Number.isFinite(a.price) ? a.price : null;
            const pb = b && typeof b.price === 'number' && Number.isFinite(b.price) ? b.price : null;
            const tb = b && b.t ? Date.parse(b.t) : NaN;
            const tMs = Number.isFinite(tb) ? tb : null;
            if (pa === null || pb === null || tMs === null) continue;
            if (pa <= 0 || pb <= 0) continue;
            const r = Math.log(pb / pa);
            if (!Number.isFinite(r)) continue;
            out.push({ tMs: tMs, r });
        }
        return out;
    };
    const correlationAligned = (a, b, minPoints = 20) => {
        const mapB = new Map();
        for (const p of (b || [])) mapB.set(p.tMs, p.r);
        const xs = [];
        const ys = [];
        for (const p of (a || [])) {
            const y = mapB.get(p.tMs);
            if (!isNum(p.r) || !isNum(y)) continue;
            xs.push(p.r);
            ys.push(y);
        }
        const n = xs.length;
        if (n < minPoints) return null;
        const mean = arr => arr.reduce((s, v) => s + v, 0) / arr.length;
        const mx = mean(xs);
        const my = mean(ys);
        let cov = 0;
        let vx = 0;
        let vy = 0;
        for (let i = 0; i < n; i += 1) {
            const dx = xs[i] - mx;
            const dy = ys[i] - my;
            cov += dx * dy;
            vx += dx * dx;
            vy += dy * dy;
        }
        if (vx <= 1e-18 || vy <= 1e-18) return null;
        return { corr: cov / Math.sqrt(vx * vy), n };
    };
    const corrPair = (label, aSym, bSym) => {
        if (!aSym || !bSym) return null;
        const out = correlationAligned(buildReturnSeries(aSym), buildReturnSeries(bSym));
        if (!out) return null;
        return { label, corr: out.corr, n: out.n };
    };

    const microStats = (symbol) => {
        const s = String(symbol || '');
        if (!s) return null;
        const series = data && data.series && Array.isArray(data.series[s]) ? data.series[s] : [];
        if (!series.length) return null;
        const last = series[series.length - 1];
        const lastPrice = last && typeof last.price === 'number' && Number.isFinite(last.price) ? last.price : null;
        const lastTmsRaw = last && last.t ? Date.parse(last.t) : NaN;
        const lastTms = Number.isFinite(lastTmsRaw) ? lastTmsRaw : null;
        if (lastPrice === null || lastTms === null) return null;

        const findAt = (lookbackMs) => {
            const target = lastTms - lookbackMs;
            let best = null;
            for (let i = series.length - 1; i >= 0; i -= 1) {
                const p = series[i];
                const tRaw = p && p.t ? Date.parse(p.t) : NaN;
                const t = Number.isFinite(tRaw) ? tRaw : null;
                const price = p && typeof p.price === 'number' && Number.isFinite(p.price) ? p.price : null;
                if (t === null || price === null) continue;
                if (t <= target) { best = { tMs: t, price }; break; }
            }
            return best;
        };
        const pctFrom = (priceThen) => (typeof priceThen === 'number' && Number.isFinite(priceThen) && priceThen > 0 ? ((lastPrice / priceThen) - 1) * 100 : null);

        const p5 = findAt(5 * 60 * 1000);
        const p15 = findAt(15 * 60 * 1000);
        const p60 = findAt(60 * 60 * 1000);
        const ret5 = p5 ? pctFrom(p5.price) : null;
        const ret15 = p15 ? pctFrom(p15.price) : null;
        const ret60 = p60 ? pctFrom(p60.price) : null;

        const range30 = (() => {
            const cut = lastTms - 30 * 60 * 1000;
            let hi = -Infinity;
            let lo = +Infinity;
            let n = 0;
            for (let i = series.length - 1; i >= 0; i -= 1) {
                const p = series[i];
                const tRaw = p && p.t ? Date.parse(p.t) : NaN;
                const t = Number.isFinite(tRaw) ? tRaw : null;
                const price = p && typeof p.price === 'number' && Number.isFinite(p.price) ? p.price : null;
                if (t === null || price === null) continue;
                if (t < cut) break;
                n += 1;
                if (price > hi) hi = price;
                if (price < lo) lo = price;
            }
            if (n < 4 || !Number.isFinite(hi) || !Number.isFinite(lo) || lo <= 0) return null;
            const pct = ((hi / lo) - 1) * 100;
            return { pct, n };
        })();

        const vol30 = (() => {
            const cut = lastTms - 30 * 60 * 1000;
            let sumAbs = 0;
            let prev = null;
            let n = 0;
            for (let i = series.length - 1; i >= 0; i -= 1) {
                const p = series[i];
                const tRaw = p && p.t ? Date.parse(p.t) : NaN;
                const t = Number.isFinite(tRaw) ? tRaw : null;
                const price = p && typeof p.price === 'number' && Number.isFinite(p.price) ? p.price : null;
                if (t === null || price === null) continue;
                if (t < cut) break;
                if (prev && prev.price > 0) {
                    const r = ((prev.price / price) - 1) * 100;
                    if (Number.isFinite(r)) { sumAbs += Math.abs(r); n += 1; }
                }
                prev = { price };
            }
            if (n < 4) return null;
            return { sumAbsPct: sumAbs, n };
        })();

        const scalp = (() => {
            const amp = volAmp && typeof volAmp.amp === 'number' && Number.isFinite(volAmp.amp) ? volAmp.amp : 1;
            const th5 = 0.08 * amp;
            const th15 = 0.14 * amp;
            const s5 = typeof ret5 === 'number' && Number.isFinite(ret5) ? ret5 : null;
            const s15 = typeof ret15 === 'number' && Number.isFinite(ret15) ? ret15 : null;
            if (s5 === null || s15 === null) return { signal: 'neutral', strength: 0, label: 'n/d' };
            const alignedUp = s5 >= th5 && s15 >= th15;
            const alignedDn = s5 <= -th5 && s15 <= -th15;
            if (alignedUp) return { signal: 'buy', strength: Math.min(1, (Math.abs(s15) / 0.6)), label: 'tendÃªncia curta (â†‘)' };
            if (alignedDn) return { signal: 'sell', strength: Math.min(1, (Math.abs(s15) / 0.6)), label: 'tendÃªncia curta (â†“)' };
            const conflict = (s5 > 0 && s15 < 0) || (s5 < 0 && s15 > 0);
            if (conflict && Math.abs(s5) >= th5) return { signal: 'neutral', strength: 0.5, label: 'conflito 5mÃ—15m' };
            return { signal: 'neutral', strength: Math.min(0.6, Math.abs(s5) / 0.5), label: 'range/ruÃ­do' };
        })();

        return { ret5, ret15, ret60, range30, vol30, scalp, lastTms, lastPrice };
    };

    const buildPulse = (baseKey) => {
        const cfgBase = baseKey === 'ndx'
            ? [
                { key: 'ndx', group: 'driver', weight: 0.85, capAbs: 1.1, sign: +1 },
                { key: 'spx', group: 'confirm', weight: 0.45, capAbs: 1.0, sign: +1 },
                { key: 'dow', group: 'confirm', weight: 0.25, capAbs: 1.0, sign: +1 },
                { key: 'vxn', group: 'driver', weight: 0.55, capAbs: 4.5, sign: -1 },
                { key: 'vvix', group: 'confirm', weight: 0.25, capAbs: 4.8, sign: -1 },
                { key: 'vix', group: 'driver', weight: 0.35, capAbs: 4.5, sign: -1 },
                { key: 'dxy', group: 'driver', weight: 0.45, capAbs: 0.7, sign: -1 },
                { key: 'us2y', group: 'driver', weight: 0.35, capAbs: 0.8, sign: -1 },
                { key: 'us10y', group: 'driver', weight: 0.35, capAbs: 0.8, sign: -1 },
                { key: 'hyg', group: 'confirm', weight: 0.35, capAbs: 1.3, sign: +1 },
                { key: 'tlt', group: 'context', weight: 0.2, capAbs: 1.3, sign: +1 },
                { key: 'eem', group: 'context', weight: 0.2, capAbs: 1.4, sign: +1 },
                { key: 'xlk', group: 'context', weight: 0.18, capAbs: 1.6, sign: +1 },
                { key: 'oil', group: 'context', weight: 0.12, capAbs: 2.0, sign: -0.6 },
                { key: 'gold', group: 'context', weight: 0.12, capAbs: 1.6, sign: -0.4 },
                { key: 'btc', group: 'context', weight: 0.12, capAbs: 2.0, sign: +0.4 },
            ]
            : baseKey === 'dow'
                ? [
                    { key: 'dow', group: 'driver', weight: 0.85, capAbs: 1.0, sign: +1 },
                    { key: 'spx', group: 'confirm', weight: 0.45, capAbs: 1.0, sign: +1 },
                    { key: 'ndx', group: 'confirm', weight: 0.25, capAbs: 1.1, sign: +1 },
                    { key: 'vix', group: 'driver', weight: 0.55, capAbs: 4.5, sign: -1 },
                    { key: 'dxy', group: 'driver', weight: 0.45, capAbs: 0.7, sign: -1 },
                    { key: 'us10y', group: 'driver', weight: 0.25, capAbs: 0.8, sign: -1 },
                    { key: 'us30y', group: 'context', weight: 0.18, capAbs: 0.8, sign: -1 },
                    { key: 'hyg', group: 'confirm', weight: 0.35, capAbs: 1.3, sign: +1 },
                    { key: 'tlt', group: 'context', weight: 0.2, capAbs: 1.3, sign: +1 },
                    { key: 'eem', group: 'context', weight: 0.2, capAbs: 1.4, sign: +1 },
                    { key: 'xlf', group: 'context', weight: 0.2, capAbs: 1.6, sign: +1 },
                    { key: 'oil', group: 'context', weight: 0.12, capAbs: 2.0, sign: -0.4 },
                    { key: 'gold', group: 'context', weight: 0.12, capAbs: 1.6, sign: -0.2 },
                ]
                : [
                    { key: 'spx', group: 'driver', weight: 0.9, capAbs: 0.9, sign: +1 },
                    { key: 'ndx', group: 'confirm', weight: 0.35, capAbs: 1.4, sign: +1 },
                    { key: 'dow', group: 'confirm', weight: 0.25, capAbs: 1.2, sign: +1 },
                    { key: 'vix', group: 'driver', weight: 0.6, capAbs: 4.5, sign: -1 },
                    { key: 'dxy', group: 'driver', weight: 0.45, capAbs: 0.7, sign: -1 },
                    { key: 'us2y', group: 'driver', weight: 0.25, capAbs: 0.8, sign: -1 },
                    { key: 'us10y', group: 'driver', weight: 0.25, capAbs: 0.8, sign: -1 },
                    { key: 'hyg', group: 'confirm', weight: 0.35, capAbs: 1.3, sign: +1 },
                    { key: 'tlt', group: 'context', weight: 0.2, capAbs: 1.3, sign: +1 },
                    { key: 'eem', group: 'context', weight: 0.2, capAbs: 1.4, sign: +1 },
                    { key: 'iwm', group: 'context', weight: 0.18, capAbs: 1.6, sign: +1 },
                    { key: 'oil', group: 'context', weight: 0.12, capAbs: 2.0, sign: -0.5 },
                    { key: 'gold', group: 'context', weight: 0.12, capAbs: 1.6, sign: -0.3 },
                    { key: 'copper', group: 'context', weight: 0.12, capAbs: 1.8, sign: +0.3 },
                ];

        const rows = [];
        const groups = {
            driver: { net: 0, pnl: 0, count: 0 },
            confirm: { net: 0, pnl: 0, count: 0 },
            context: { net: 0, pnl: 0, count: 0 },
        };
        const breadth = { pos: 0, neg: 0, zero: 0 };
        const contribution = { posSum: 0, negSum: 0, net: 0 };
        const pnlLike = { posSum: 0, negSum: 0, net: 0 };

        for (const c of cfgBase) {
            const s = sym[c.key] || null;
            const pct = get(s);
            if (!isNum(pct)) continue;
            const signed = pct * c.sign;
            const capped = clamp(signed, -c.capAbs, c.capAbs);
            const contrib = c.weight * (c.capAbs > 0 ? capped / c.capAbs : 0);
            const pnl = c.weight * capped;
            contribution.net += contrib;
            pnlLike.net += pnl;
            const g = groups[c.group] || groups.context;
            g.net += contrib;
            g.pnl += pnl;
            g.count += 1;
            if (contrib > 0) {
                breadth.pos += 1;
                contribution.posSum += contrib;
                pnlLike.posSum += pnl;
            } else if (contrib < 0) {
                breadth.neg += 1;
                contribution.negSum += contrib;
                pnlLike.negSum += pnl;
            } else {
                breadth.zero += 1;
            }
            rows.push({ key: c.key, group: c.group, label: c.key.toUpperCase(), symbol: s, pct, signed, weight: c.weight, capAbs: c.capAbs, contrib, pnl });
        }
        const net = clamp(contribution.net, -3, 3);
        const bias = net > 0.18 ? 'buy' : net < -0.18 ? 'sell' : 'neutral';
        return { bias, net, breadth, contribution, pnlLike, groups, rows };
    };

    const spxPulse = buildPulse('spx');
    const ndxPulse = buildPulse('ndx');
    const dowPulse = buildPulse('dow');
    const micro = {
        spx: microStats(sym.spx),
        ndx: microStats(sym.ndx),
        dow: microStats(sym.dow),
    };

    const corr = {
        spx: {
            items: [
                corrPair('SPX Ã— DXY', sym.spx, sym.dxy),
                corrPair('SPX Ã— VIX', sym.spx, sym.vix),
                corrPair('SPX Ã— US10Y', sym.spx, sym.us10y),
                corrPair('SPX Ã— HYG', sym.spx, sym.hyg),
            ].filter(Boolean),
        },
        ndx: {
            items: [
                corrPair('NDX Ã— DXY', sym.ndx, sym.dxy),
                corrPair('NDX Ã— VXN', sym.ndx, sym.vxn),
                corrPair('NDX Ã— US10Y', sym.ndx, sym.us10y),
                corrPair('NDX Ã— HYG', sym.ndx, sym.hyg),
            ].filter(Boolean),
        },
        dow: {
            items: [
                corrPair('DOW Ã— DXY', sym.dow, sym.dxy),
                corrPair('DOW Ã— VIX', sym.dow, sym.vix),
                corrPair('DOW Ã— US10Y', sym.dow, sym.us10y),
                corrPair('DOW Ã— XLF', sym.dow, sym.xlf),
            ].filter(Boolean),
        },
    };

    const expected = ['spx', 'ndx', 'dow', 'dxy', 'vix', 'vxn', 'us2y', 'us10y', 'us30y', 'hyg', 'tlt', 'eem', 'xlf', 'xlk', 'iwm'];
    const missing = expected.filter(k => !sym[k]);
    const execution = {
        spx: sym.spx,
        ndx: sym.ndx,
        dow: sym.dow,
    };
    const source = {
        spx: asSource(sym.spx, [/^ES[HMUZ]\d{2}$/i]),
        ndx: asSource(sym.ndx, [/^NQ[HMUZ]\d{2}$/i]),
        dow: asSource(sym.dow, [/^YM[HMUZ]\d{2}$/i]),
    };
    const keyLabels = {
        spx: 'S&P 500 (SPX/SPY/ES)',
        ndx: 'Nasdaq 100 (NDX/QQQ/NQ)',
        dow: 'US30/Dow (DIA/.DJI/YM)',
        dxy: 'DXY',
        vix: 'VIX',
        vxn: 'VXN',
        us10y: 'US10Y',
        us2y: 'US2Y',
        us30y: 'US30Y',
        hyg: 'HYG',
        tlt: 'TLT',
        eem: 'EEM/VWO',
        xlf: 'XLF',
        xlk: 'XLK',
        iwm: 'IWM',
    };

    const missingAssetsSuggestion = (() => {
        const hasAny = matchers => {
            for (const a of assets) {
                const sym = String(a && a.symbol ? a.symbol : '');
                const name = String(a && a.name ? a.name : '');
                for (const re of (matchers || [])) {
                    if (!(re instanceof RegExp)) continue;
                    if (re.test(sym) || re.test(name)) return true;
                }
            }
            return false;
        };
        const wants = [
            { label: 'ES (futuro SPX)', matchers: [/^ES[HMUZ]\d{1,2}(=\$)?$/i] },
            { label: 'NQ (futuro NDX)', matchers: [/^NQ[HMUZ]\d{1,2}(=\$)?$/i] },
            { label: 'YM (futuro DOW)', matchers: [/^YM[HMUZ]\d{1,2}(=\$)?$/i] },
            { label: 'VIX/VIX9D', matchers: [/^\.?VIX(9D)?$/i, /^VIX$/i, /^\.VIX$/i] },
            { label: 'VXN', matchers: [/^\.VXN$/i, /\bVXN\b/i] },
            { label: 'DXY', matchers: [/^\.DXY$/i, /\bDXY\b/i] },
            { label: 'US10Y', matchers: [/^US10YT=RR$/i, /^\^TNX$/i, /^TNc\d=\$?$/i] },
            { label: 'US2Y', matchers: [/^US2YT=RR$/i, /^\^IRX$/i, /^TUc\d=\$?$/i] },
            { label: 'HYG', matchers: [/^HYG(\.\w+)?$/i] },
            { label: 'TLT', matchers: [/^TLT(\.\w+)?$/i] },
            { label: 'XLF/XLK', matchers: [/^XLF(\.\w+)?$/i, /^XLK(\.\w+)?$/i] },
            { label: 'IWM', matchers: [/^IWM(\.\w+)?$/i] },
        ];
        const out = [];
        for (const w of wants) if (!hasAny(w.matchers)) out.push(w.label);
        return out;
    })();

    return {
        sym,
        market: {
            spxPct: get(sym.spx),
            ndxPct: get(sym.ndx),
            dowPct: get(sym.dow),
        },
        pulse: { spx: spxPulse, ndx: ndxPulse, dow: dowPulse },
        corr,
        micro,
        execution,
        source,
        coverage: { expected: expected.length, missing, keyLabels },
        volAmp,
        missingAssetsSuggestion,
        news: computeNews.top || [],
        newsMeta: { used: computeNews.used, matched: computeNews.matched, score: computeNews.score },
    };
}

function computeCommoditiesPulseNow(data, web) {
    const isNum = v => typeof v === 'number' && Number.isFinite(v);
    const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
    const get = s => (s ? getChangePct(data, s) : null);
    const catalog = (typeof window !== 'undefined' && window.InstrumentsCatalog) ? window.InstrumentsCatalog : null;
    const dcDeps = buildDcDeps();
    const catDeps = buildCatDeps(dcDeps);
    const rcKey = (key, fallbackMatcher) => {
        const sym = catalog && typeof catalog.resolveRatesCreditByKey === 'function'
            ? catalog.resolveRatesCreditByKey(catDeps, data, key)
            : null;
        if (sym) return sym;
        if (fallbackMatcher instanceof RegExp) return findAssetSymbol(data, fallbackMatcher);
        return null;
    };

    const assets = data && Array.isArray(data.assets) ? data.assets : [];
    const byMatchers = (matchers, { limit = 10 } = {}) => {
        const out = [];
        const seen = new Set();
        const ms = (s) => {
            const last = s ? (getMostRecentPointWithPrice(data, s) || getLastPoint(data, s)) : null;
            const t = last && last.t ? Date.parse(String(last.t)) : NaN;
            return Number.isFinite(t) ? t : -Infinity;
        };
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
        out.sort((a, b) => ms(b) - ms(a));
        return out;
    };
    const pickBest = (cands) => (Array.isArray(cands) && cands.length ? cands[0] : null);

    const asSource = (symbol, futurePatterns = []) => {
        const s = String(symbol || '');
        if (!s) return 'missing';
        for (const re of futurePatterns) if (re.test(s)) return 'future';
        return 'proxy';
    };
    const pickPreferred = (futurePatterns, fallbackPatterns, aliasKey = null) => {
        const futCands = byMatchers(futurePatterns || [], { limit: 10 });
        const fut = pickBest(futCands);
        if (fut) return fut;

        const ali = aliasKey ? findAliasSymbolBest(data, aliasKey) : null;
        if (ali) return ali;

        const cands = byMatchers(fallbackPatterns || [], { limit: 10 });
        return pickBest(cands);
    };

    const sym = {
        gold: pickPreferred(
            [/^GCc\d(=\$)?$/i, /^MGCc\d(=\$)?$/i, /^GC=F$/i],
            [/^XAU\/?USD\b/i, /\bXAU\/?USD\b/i, /^GLD(\.\w+)?$/i, /^\.TRCCRBGC$/i, /\bGold\b/i, /\bOuro\b/i],
            'GOLD'
        ),
        brent: pickPreferred(
            [/^(LCO|BRN)c\d(=\$)?$/i, /^BZ=F$/i],
            [/^BNO(\.\w+)?$/i, /^\.TRCCRBCL$/i, /\bBrent\b/i],
            'BRENT'
        ),
        wti: pickPreferred(
            [/^CLc\d(=\$)?$/i, /^MWCLc\d(=\$)?$/i, /^CL=F$/i],
            [/^USO(\.\w+)?$/i, /^\.TRCCRBCL$/i, /\bWTI\b/i],
            'WTI'
        ),
        gld: pickPreferred([], [/^GLD(\.\w+)?$/i, /\bSPDR Gold\b/i], null),
        slv: pickPreferred([], [/^SLV(\.\w+)?$/i, /\biShares Silver\b/i], null),
        silver: pickPreferred(
            [/^SILc\d(=\$)?$/i, /^SI$/i, /^SIc\d(=\$)?$/i],
            [/^SLV(\.\w+)?$/i, /\bSilver\b/i, /\bPrata\b/i],
            null
        ),
        gas: pickPreferred(
            [/^MNDc\d(=\$)?$/i, /^NGc\d(=\$)?$/i, /^NG$/i, /^NATURAL\s*GAS$/i],
            [/^\.TRCCRBNG$/i, /\bNatural\s*Gas\b/i, /\bG[aÃ¡]s\s*Natural\b/i, /\bTTF\b.*\bGas\b/i],
            null
        ),
        ttfGas: pickPreferred(
            [/^TFAc\d(=\$)?$/i],
            [/\bDutch\b.*\bTTF\b.*\bGas\b/i, /\bTTF\b.*\bGas\b/i, /\bTTF\b/i],
            null
        ),
        uso: pickPreferred([], [/^USO(\.\w+)?$/i], null),
        xle: pickPreferred([], [/^XLE(\.\w+)?$/i, /\bEnergy\s*Select\s*Sector\b/i], null),
        xop: pickPreferred([], [/^XOP(\.\w+)?$/i], null),
        oih: pickPreferred([], [/^OIH(\.\w+)?$/i], null),

        dxy: findAliasSymbolBest(data, 'DXY') || pickBest(byMatchers([/^\.DXY$/i, /^DXY$/i, /^DX=F$/i, /^DXc\d(=\$)?$/i, /\bUS\s*Dollar\s*Index\b/i], { limit: 8 })),
        vix: findAliasSymbolBest(data, 'VIX9D') || findAliasSymbolBest(data, 'VIX') || pickBest(byMatchers([/^\.?VIX(9D)?$/i], { limit: 6 })),
        us2y: rcKey('US_2Y', /^US2YT=RR$/i) || findAliasSymbolBest(data, 'US2Y') || pickBest(byMatchers([/^US2YT=RR$/i, /^TUc\d=\$?$/i, /\bUS2Y\b/i, /\bUnited States 2-Year\b/i], { limit: 8 })),
        us10y: rcKey('US_10Y', /^US10YT=RR$/i) || findAliasSymbolBest(data, 'US10Y') || pickBest(byMatchers([/^US10YT=RR$/i, /^USGV10YUSAB=R$/i, /^TNc\d=\$?$/i, /^TYc\d=\$?$/i, /\bUS10Y\b/i, /\bUnited States 10-Year\b/i], { limit: 10 })),
        tipsEtf: rcKey('ETF_TIP', /^TIP(\.\w+)?$/i) || findAliasSymbolBest(data, 'TIPS_ETF') || pickBest(byMatchers([/^TIP(\.\w+)?$/i, /\bTIPS\b/i], { limit: 6 })),
        tlt: rcKey('ETF_TLT', /^TLT(\.\w+)?$/i) || findAliasSymbolBest(data, 'TLT') || pickBest(byMatchers([/^TLT(\.\w+)?$/i], { limit: 6 })),
        hyg: rcKey('ETF_HYG', /^HYG(\.\w+)?$/i) || findAliasSymbolBest(data, 'HYG') || pickBest(byMatchers([/^HYG(\.\w+)?$/i], { limit: 6 })),
        eem: findAliasSymbolBest(data, 'EEM') || findAliasSymbolBest(data, 'VWO') || pickBest(byMatchers([/^EEM(\.\w+)?$/i, /^VWO(\.\w+)?$/i], { limit: 6 })),
        spx: findAliasSymbolBest(data, 'SPX') || pickBest(byMatchers([/^\.SPX$/i, /^SPX$/i, /^SPY(\.\w+)?$/i, /\bS&P\s*500\b/i, /\bS\s*&\s*P\s*500\b/i], { limit: 10 })),
        copper: pickPreferred(
            [/^HGc\d(=\$)?$/i, /^HG=F$/i, /^MCU$/i],
            [/^CPER(\.\w+)?$/i, /\bCopper\b/i, /\bCobre\b/i],
            'COPPER'
        ),
        gdx: pickPreferred([], [/^GDX(\.\w+)?$/i, /\bGold\s*Miners\b/i], null),
        gdxj: pickPreferred([], [/^GDXJ(\.\w+)?$/i, /\bJunior\s*Gold\s*Miners\b/i], null),
        minerNem: pickPreferred([], [/^NEM(\.\w+)?$/i, /\bNewmont\b/i], null),
        minerAu: pickPreferred([], [/^AU(\.\w+)?$/i, /\bAngloGold\b/i], null),
        minerFnv: pickPreferred([], [/^FNV(\.\w+)?$/i, /^FNV\.TO$/i, /\bFranco[-\s]?Nevada\b/i], null),
        minerGold: pickPreferred([], [/^GOLD(\.\w+)?$/i, /\bBarrick\b/i], null),
        nickel: pickPreferred(
            [/^MNI\d$/i],
            [/\bNickel\b/i, /\bN[iÃ­]quel\b/i],
            null
        ),
        zinc: pickPreferred(
            [/^MZN\d$/i],
            [/\bZinc\b/i, /\bZinco\b/i],
            null
        ),
        usdcad: findAliasSymbolBest(data, 'USD_CAD') || pickBest(byMatchers([/^USD\/CAD\b/i, /\bUSDCAD\b/i], { limit: 6 })),
        audusd: findAliasSymbolBest(data, 'AUD_USD') || pickBest(byMatchers([/^AUD\/USD\b/i, /\bAUDUSD\b/i], { limit: 8 })),
        usdzar: findAliasSymbolBest(data, 'USD_ZAR') || pickBest(byMatchers([/^USD\/ZAR\b/i, /\bUSDZAR\b/i], { limit: 8 })),
        usdmxn: findAliasSymbolBest(data, 'USD_MXN') || pickBest(byMatchers([/^USD\/MXN\b/i, /\bUSDMXN\b/i], { limit: 8 })),
        usdcnh: findAliasSymbolBest(data, 'USD_CNH') || pickBest(byMatchers([/^USD\/CNH\b/i, /\bUSDCNH\b/i], { limit: 8 })),
        usdrub: pickBest(byMatchers([/^USD\/RUB\b/i, /\bUSDRUB\b/i], { limit: 6 })),
        btc: findAliasSymbolBest(data, 'BTC') || pickBest(byMatchers([/^BTC\/USD$/i, /\bbitcoin\b/i], { limit: 6 })),
    };

    const computeNews = (() => {
        const items = web && Array.isArray(web.items) ? web.items : [];
        const confW = c => {
            const s = String(c || '').toLowerCase();
            if (s.includes('high') || s.includes('alta')) return 1.0;
            if (s.includes('medium') || s.includes('mÃ©dia') || s.includes('media')) return 0.75;
            if (s.includes('low') || s.includes('baixa')) return 0.55;
            return 0.7;
        };
        const kwCommodities = s =>
            /\bgold\b|\bouro\b|\bxau\b|\bsilver\b|\bprata\b|\bcopper\b|\bcobre\b|\bnatural\s*gas\b|\bg[aÃ¡]s\s*natural\b|\blng\b|\bttf\b|\bcentral\s*bank\b|\breserves\b|\binflation\b|\bcpi\b|\breal\s*yields?\b|\btreasury\b|\brate\s*cut\b|\brate\s*hike\b|\boil\b|\bcrude\b|\bbrent\b|\bwti\b|\bopec\b|\bpec\b|\boutput\b|\brefiner\w*\b|\bstockpile\w*\b|\binventory\b|\bshipping\b|\bred\s*sea\b|\bhormuz\b|\bsanction\w*\b|\bwar\b|\biran\b|\bisrael\b|\brussia\b|\bukraine\b|\bmiddle\s*east\b|\bchina\b|\btaiwan\b/i.test(s);
        const pos = [
            /\bde[-\s]?escalat\w*\b/i,
            /\bceasefire\b/i,
            /\bincrease\s*supply\b/i,
            /\boutput\s*hike\b/i,
            /\bstock\s*build\b/i,
            /\binventory\s*build\b/i,
            /\brate\s*cut\b/i,
            /\bdisinflation\b/i,
            /\bdovish\b/i,
        ];
        const neg = [
            /\bescalat\w*\b/i,
            /\battack\b/i,
            /\bdrone\b/i,
            /\bmissile\b/i,
            /\bsanction\w*\b/i,
            /\bsupply\s*cut\b/i,
            /\boutage\b/i,
            /\bshipping\s*disrupt\w*\b/i,
            /\brate\s*hike\b/i,
            /\bhawkish\b/i,
        ];
        let matched = 0;
        let score = 0;
        const top = [];
        for (const it of items.slice(0, 80)) {
            const title = it && it.title ? String(it.title) : '';
            if (!title) continue;
            if (!kwCommodities(title)) continue;
            if (top.length < 6) top.push(it);
            matched++;
            const w = confW(it && it.confidence);
            let s = 0;
            for (const re of pos) if (re.test(title)) s += 1;
            for (const re of neg) if (re.test(title)) s -= 1;
            score += w * clamp(s, -3, 3);
        }
        const denom = matched > 0 ? matched * 3 : 1;
        const normalized = clamp(score / denom, -1, 1);
        return { used: !!items.length, matched, score: normalized, top };
    })();

    const buildReturnSeries = (symbol, windowPoints = 96) => {
        const series = data && data.series && Array.isArray(data.series[symbol]) ? data.series[symbol] : [];
        if (!series.length) return [];
        const start = Math.max(0, series.length - windowPoints);
        const out = [];
        for (let i = start + 1; i < series.length; i += 1) {
            const a = series[i - 1];
            const b = series[i];
            const pa = a && typeof a.price === 'number' && Number.isFinite(a.price) ? a.price : null;
            const pb = b && typeof b.price === 'number' && Number.isFinite(b.price) ? b.price : null;
            const tb = b && b.t ? Date.parse(b.t) : NaN;
            const tMs = Number.isFinite(tb) ? tb : null;
            if (pa === null || pb === null || tMs === null) continue;
            if (pa <= 0 || pb <= 0) continue;
            const r = Math.log(pb / pa);
            if (!Number.isFinite(r)) continue;
            out.push({ tMs: tMs, r });
        }
        return out;
    };
    const correlationAligned = (a, b, minPoints = 20) => {
        const mapB = new Map();
        for (const p of (b || [])) mapB.set(p.tMs, p.r);
        const xs = [];
        const ys = [];
        for (const p of (a || [])) {
            const y = mapB.get(p.tMs);
            if (!isNum(p.r) || !isNum(y)) continue;
            xs.push(p.r);
            ys.push(y);
        }
        const n = xs.length;
        if (n < minPoints) return null;
        const mean = arr => arr.reduce((s, v) => s + v, 0) / arr.length;
        const mx = mean(xs);
        const my = mean(ys);
        let cov = 0;
        let vx = 0;
        let vy = 0;
        for (let i = 0; i < n; i += 1) {
            const dx = xs[i] - mx;
            const dy = ys[i] - my;
            cov += dx * dy;
            vx += dx * dx;
            vy += dy * dy;
        }
        if (vx <= 1e-18 || vy <= 1e-18) return null;
        return { corr: cov / Math.sqrt(vx * vy), n };
    };
    const corrPair = (label, aSym, bSym) => {
        if (!aSym || !bSym) return null;
        const out = correlationAligned(buildReturnSeries(aSym), buildReturnSeries(bSym));
        if (!out) return null;
        return { label, corr: out.corr, n: out.n };
    };

    const microStats = (symbol) => {
        const s = String(symbol || '');
        if (!s) return null;
        const series = data && data.series && Array.isArray(data.series[s]) ? data.series[s] : [];
        if (!series.length) return null;
        const last = series[series.length - 1];
        const lastPrice = last && typeof last.price === 'number' && Number.isFinite(last.price) ? last.price : null;
        const lastTmsRaw = last && last.t ? Date.parse(last.t) : NaN;
        const lastTms = Number.isFinite(lastTmsRaw) ? lastTmsRaw : null;
        if (lastPrice === null || lastTms === null) return null;

        const findAt = (lookbackMs) => {
            const target = lastTms - lookbackMs;
            let best = null;
            for (let i = series.length - 1; i >= 0; i -= 1) {
                const p = series[i];
                const tRaw = p && p.t ? Date.parse(p.t) : NaN;
                const t = Number.isFinite(tRaw) ? tRaw : null;
                const price = p && typeof p.price === 'number' && Number.isFinite(p.price) ? p.price : null;
                if (t === null || price === null) continue;
                if (t <= target) { best = { tMs: t, price }; break; }
            }
            return best;
        };
        const pctFrom = (priceThen) => (typeof priceThen === 'number' && Number.isFinite(priceThen) && priceThen > 0 ? ((lastPrice / priceThen) - 1) * 100 : null);

        const p5 = findAt(5 * 60 * 1000);
        const p15 = findAt(15 * 60 * 1000);
        const p60 = findAt(60 * 60 * 1000);
        const ret5 = p5 ? pctFrom(p5.price) : null;
        const ret15 = p15 ? pctFrom(p15.price) : null;
        const ret60 = p60 ? pctFrom(p60.price) : null;

        const range30 = (() => {
            const cut = lastTms - 30 * 60 * 1000;
            let hi = -Infinity;
            let lo = +Infinity;
            let n = 0;
            for (let i = series.length - 1; i >= 0; i -= 1) {
                const p = series[i];
                const tRaw = p && p.t ? Date.parse(p.t) : NaN;
                const t = Number.isFinite(tRaw) ? tRaw : null;
                const price = p && typeof p.price === 'number' && Number.isFinite(p.price) ? p.price : null;
                if (t === null || price === null) continue;
                if (t < cut) break;
                n += 1;
                if (price > hi) hi = price;
                if (price < lo) lo = price;
            }
            if (n < 4 || !Number.isFinite(hi) || !Number.isFinite(lo) || lo <= 0) return null;
            const pct = ((hi / lo) - 1) * 100;
            return { pct, n };
        })();

        const vol30 = (() => {
            const cut = lastTms - 30 * 60 * 1000;
            let sumAbs = 0;
            let prev = null;
            let n = 0;
            for (let i = series.length - 1; i >= 0; i -= 1) {
                const p = series[i];
                const tRaw = p && p.t ? Date.parse(p.t) : NaN;
                const t = Number.isFinite(tRaw) ? tRaw : null;
                const price = p && typeof p.price === 'number' && Number.isFinite(p.price) ? p.price : null;
                if (t === null || price === null) continue;
                if (t < cut) break;
                if (prev && prev.price > 0) {
                    const r = ((prev.price / price) - 1) * 100;
                    if (Number.isFinite(r)) { sumAbs += Math.abs(r); n += 1; }
                }
                prev = { price };
            }
            if (n < 4) return null;
            return { sumAbsPct: sumAbs, n };
        })();

        const scalp = (() => {
            const th5 = 0.10;
            const th15 = 0.18;
            const s5 = typeof ret5 === 'number' && Number.isFinite(ret5) ? ret5 : null;
            const s15 = typeof ret15 === 'number' && Number.isFinite(ret15) ? ret15 : null;
            if (s5 === null || s15 === null) return { signal: 'neutral', strength: 0, label: 'n/d' };
            const alignedUp = s5 >= th5 && s15 >= th15;
            const alignedDn = s5 <= -th5 && s15 <= -th15;
            if (alignedUp) return { signal: 'buy', strength: Math.min(1, (Math.abs(s15) / 0.9)), label: 'tendÃªncia curta (â†‘)' };
            if (alignedDn) return { signal: 'sell', strength: Math.min(1, (Math.abs(s15) / 0.9)), label: 'tendÃªncia curta (â†“)' };
            const conflict = (s5 > 0 && s15 < 0) || (s5 < 0 && s15 > 0);
            if (conflict && Math.abs(s5) >= th5) return { signal: 'neutral', strength: 0.5, label: 'conflito 5mÃ—15m' };
            return { signal: 'neutral', strength: Math.min(0.6, Math.abs(s5) / 0.7), label: 'range/ruÃ­do' };
        })();

        return { ret5, ret15, ret60, range30, vol30, scalp, lastTms, lastPrice };
    };

    const buildPulse = (baseKey) => {
        let cfg = [];
        if (baseKey === 'gold') {
            cfg = [
                { key: 'gold', group: 'driver', weight: 0.9, capAbs: 1.2, sign: +1 },
                { key: 'dxy', group: 'driver', weight: 0.6, capAbs: 0.8, sign: -1 },
                { key: 'us10y', group: 'driver', weight: 0.45, capAbs: 0.9, sign: -1 },
                { key: 'tipsEtf', group: 'driver', weight: 0.28, capAbs: 1.2, sign: +0.6 },
                { key: 'audusd', group: 'confirm', weight: 0.12, capAbs: 0.9, sign: +0.35 },
                { key: 'usdzar', group: 'confirm', weight: 0.08, capAbs: 1.2, sign: -0.25 },
                { key: 'tlt', group: 'confirm', weight: 0.25, capAbs: 1.3, sign: +1 },
                { key: 'gld', group: 'confirm', weight: 0.18, capAbs: 1.6, sign: +1 },
                { key: 'vix', group: 'confirm', weight: 0.25, capAbs: 4.5, sign: +0.6 },
                { key: 'gdx', group: 'confirm', weight: 0.12, capAbs: 3.5, sign: +0.25 },
                { key: 'minerNem', group: 'context', weight: 0.08, capAbs: 4.5, sign: +0.18 },
                { key: 'minerAu', group: 'context', weight: 0.06, capAbs: 5.0, sign: +0.15 },
                { key: 'minerFnv', group: 'context', weight: 0.06, capAbs: 4.0, sign: +0.15 },
                { key: 'minerGold', group: 'context', weight: 0.06, capAbs: 4.5, sign: +0.15 },
                { key: 'hyg', group: 'context', weight: 0.2, capAbs: 1.3, sign: -0.5 },
                { key: 'spx', group: 'context', weight: 0.25, capAbs: 1.2, sign: -0.4 },
                { key: 'eem', group: 'context', weight: 0.18, capAbs: 1.4, sign: -0.3 },
                { key: 'btc', group: 'context', weight: 0.12, capAbs: 2.0, sign: -0.2 },
                { key: 'slv', group: 'context', weight: 0.08, capAbs: 2.2, sign: +0.25 },
            ];
        } else if (baseKey === 'oil') {
            cfg = [
                { key: 'brent', group: 'driver', weight: 0.55, capAbs: 2.0, sign: +1 },
                { key: 'wti', group: 'driver', weight: 0.45, capAbs: 2.0, sign: +1 },
                { key: 'dxy', group: 'driver', weight: 0.35, capAbs: 0.8, sign: -0.6 },
                { key: 'spx', group: 'confirm', weight: 0.25, capAbs: 1.2, sign: +0.4 },
                { key: 'hyg', group: 'confirm', weight: 0.25, capAbs: 1.3, sign: +0.4 },
                { key: 'vix', group: 'confirm', weight: 0.25, capAbs: 4.5, sign: -0.5 },
                { key: 'xop', group: 'confirm', weight: 0.14, capAbs: 1.8, sign: +0.35 },
                { key: 'oih', group: 'confirm', weight: 0.12, capAbs: 2.0, sign: +0.3 },
                { key: 'us10y', group: 'context', weight: 0.2, capAbs: 0.9, sign: -0.25 },
                { key: 'copper', group: 'context', weight: 0.18, capAbs: 1.8, sign: +0.35 },
                { key: 'xle', group: 'context', weight: 0.18, capAbs: 1.6, sign: +0.35 },
                { key: 'uso', group: 'context', weight: 0.12, capAbs: 2.0, sign: +0.35 },
                { key: 'usdcad', group: 'context', weight: 0.15, capAbs: 0.8, sign: -0.35 },
                { key: 'usdrub', group: 'context', weight: 0.12, capAbs: 1.0, sign: +0.15 },
            ];
        } else if (baseKey === 'gas') {
            cfg = [
                { key: 'gas', group: 'driver', weight: 0.85, capAbs: 3.0, sign: +1 },
                { key: 'dxy', group: 'driver', weight: 0.35, capAbs: 0.8, sign: -0.5 },
                { key: 'brent', group: 'confirm', weight: 0.2, capAbs: 2.0, sign: +0.25 },
                { key: 'wti', group: 'confirm', weight: 0.2, capAbs: 2.0, sign: +0.25 },
                { key: 'xle', group: 'context', weight: 0.18, capAbs: 1.6, sign: +0.25 },
                { key: 'spx', group: 'context', weight: 0.15, capAbs: 1.2, sign: +0.1 },
                { key: 'vix', group: 'context', weight: 0.12, capAbs: 4.5, sign: -0.2 },
            ];
        } else if (baseKey === 'ttfGas') {
            cfg = [
                { key: 'ttfGas', group: 'driver', weight: 0.85, capAbs: 3.0, sign: +1 },
                { key: 'dxy', group: 'driver', weight: 0.25, capAbs: 0.8, sign: -0.45 },
                { key: 'brent', group: 'confirm', weight: 0.22, capAbs: 2.0, sign: +0.25 },
                { key: 'wti', group: 'confirm', weight: 0.18, capAbs: 2.0, sign: +0.2 },
                { key: 'xle', group: 'context', weight: 0.15, capAbs: 1.6, sign: +0.2 },
                { key: 'spx', group: 'context', weight: 0.12, capAbs: 1.2, sign: +0.1 },
                { key: 'vix', group: 'context', weight: 0.1, capAbs: 4.5, sign: -0.15 },
            ];
        } else if (baseKey === 'silver') {
            cfg = [
                { key: 'silver', group: 'driver', weight: 0.85, capAbs: 2.2, sign: +1 },
                { key: 'dxy', group: 'driver', weight: 0.4, capAbs: 0.8, sign: -0.6 },
                { key: 'us10y', group: 'driver', weight: 0.3, capAbs: 0.9, sign: -0.35 },
                { key: 'gold', group: 'confirm', weight: 0.25, capAbs: 1.2, sign: +0.35 },
                { key: 'slv', group: 'confirm', weight: 0.18, capAbs: 2.2, sign: +1 },
                { key: 'vix', group: 'context', weight: 0.12, capAbs: 4.5, sign: +0.15 },
                { key: 'spx', group: 'context', weight: 0.12, capAbs: 1.2, sign: -0.15 },
            ];
        } else if (baseKey === 'copper') {
            cfg = [
                { key: 'copper', group: 'driver', weight: 0.85, capAbs: 1.8, sign: +1 },
                { key: 'dxy', group: 'driver', weight: 0.35, capAbs: 0.8, sign: -0.5 },
                { key: 'spx', group: 'confirm', weight: 0.25, capAbs: 1.2, sign: +0.25 },
                { key: 'brent', group: 'context', weight: 0.18, capAbs: 2.0, sign: +0.15 },
                { key: 'vix', group: 'context', weight: 0.12, capAbs: 4.5, sign: -0.25 },
            ];
        } else if (baseKey === 'nickel') {
            cfg = [
                { key: 'nickel', group: 'driver', weight: 0.85, capAbs: 2.4, sign: +1 },
                { key: 'dxy', group: 'driver', weight: 0.3, capAbs: 0.8, sign: -0.5 },
                { key: 'copper', group: 'confirm', weight: 0.22, capAbs: 1.8, sign: +0.25 },
                { key: 'spx', group: 'confirm', weight: 0.18, capAbs: 1.2, sign: +0.2 },
                { key: 'brent', group: 'context', weight: 0.12, capAbs: 2.0, sign: +0.1 },
                { key: 'vix', group: 'context', weight: 0.12, capAbs: 4.5, sign: -0.2 },
            ];
        } else if (baseKey === 'zinc') {
            cfg = [
                { key: 'zinc', group: 'driver', weight: 0.85, capAbs: 2.2, sign: +1 },
                { key: 'dxy', group: 'driver', weight: 0.3, capAbs: 0.8, sign: -0.5 },
                { key: 'copper', group: 'confirm', weight: 0.22, capAbs: 1.8, sign: +0.25 },
                { key: 'spx', group: 'confirm', weight: 0.18, capAbs: 1.2, sign: +0.2 },
                { key: 'brent', group: 'context', weight: 0.12, capAbs: 2.0, sign: +0.1 },
                { key: 'vix', group: 'context', weight: 0.12, capAbs: 4.5, sign: -0.2 },
            ];
        }

        const rows = [];
        const groups = {
            driver: { net: 0, pnl: 0, count: 0 },
            confirm: { net: 0, pnl: 0, count: 0 },
            context: { net: 0, pnl: 0, count: 0 },
        };
        const breadth = { pos: 0, neg: 0, zero: 0 };
        const contribution = { posSum: 0, negSum: 0, net: 0 };
        const pnlLike = { posSum: 0, negSum: 0, net: 0 };

        for (const c of cfg) {
            const s = sym[c.key] || null;
            const pct = get(s);
            if (!isNum(pct)) continue;
            const signed = pct * c.sign;
            const capped = clamp(signed, -c.capAbs, c.capAbs);
            const contrib = c.weight * (c.capAbs > 0 ? capped / c.capAbs : 0);
            const pnl = c.weight * capped;
            contribution.net += contrib;
            pnlLike.net += pnl;
            const g = groups[c.group] || groups.context;
            g.net += contrib;
            g.pnl += pnl;
            g.count += 1;
            if (contrib > 0) {
                breadth.pos += 1;
                contribution.posSum += contrib;
                pnlLike.posSum += pnl;
            } else if (contrib < 0) {
                breadth.neg += 1;
                contribution.negSum += contrib;
                pnlLike.negSum += pnl;
            } else {
                breadth.zero += 1;
            }
            rows.push({ key: c.key, group: c.group, label: c.key.toUpperCase(), symbol: s, pct, signed, weight: c.weight, capAbs: c.capAbs, contrib, pnl });
        }
        const net = clamp(contribution.net, -3, 3);
        const bias = net > 0.25 ? 'buy' : net < -0.25 ? 'sell' : 'neutral';
        return { bias, net, breadth, contribution, pnlLike, groups, rows };
    };

    const goldPulse = buildPulse('gold');
    const oilPulse = buildPulse('oil');
    const gasPulse = sym.gas ? buildPulse('gas') : null;
    const ttfGasPulse = sym.ttfGas ? buildPulse('ttfGas') : null;
    const silverPulse = sym.silver ? buildPulse('silver') : null;
    const copperPulse = sym.copper ? buildPulse('copper') : null;
    const nickelPulse = sym.nickel ? buildPulse('nickel') : null;
    const zincPulse = sym.zinc ? buildPulse('zinc') : null;
    const micro = {
        gold: microStats(sym.gold),
        oil: microStats(sym.brent || sym.wti || null),
        gas: microStats(sym.gas),
        ttfGas: microStats(sym.ttfGas),
        silver: microStats(sym.silver),
        copper: microStats(sym.copper),
        nickel: microStats(sym.nickel),
        zinc: microStats(sym.zinc),
    };

    const corr = {
        gold: {
            items: [
                corrPair('Ouro Ã— DXY', sym.gold, sym.dxy),
                corrPair('Ouro Ã— US10Y', sym.gold, sym.us10y),
                corrPair('Ouro Ã— TIP', sym.gold, sym.tipsEtf),
                corrPair('Ouro Ã— AUD/USD', sym.gold, sym.audusd),
                corrPair('Ouro Ã— USD/ZAR', sym.gold, sym.usdzar),
                corrPair('Ouro Ã— GDX (miners)', sym.gold, sym.gdx),
                corrPair('Ouro Ã— SPX', sym.gold, sym.spx),
                corrPair('Ouro Ã— VIX', sym.gold, sym.vix),
            ].filter(Boolean),
        },
        oil: {
            items: [
                corrPair('Brent Ã— DXY', sym.brent, sym.dxy),
                corrPair('WTI Ã— DXY', sym.wti, sym.dxy),
                corrPair('Brent Ã— SPX', sym.brent, sym.spx),
                corrPair('Brent Ã— Cobre', sym.brent, sym.copper),
                corrPair('Brent Ã— USD/CAD', sym.brent, sym.usdcad),
                corrPair('Brent Ã— XOP', sym.brent, sym.xop),
                corrPair('Brent Ã— OIH', sym.brent, sym.oih),
            ].filter(Boolean),
        },
        gas: {
            items: [
                corrPair('GÃ¡s Ã— DXY', sym.gas, sym.dxy),
                corrPair('GÃ¡s Ã— Brent', sym.gas, sym.brent),
                corrPair('GÃ¡s Ã— US10Y', sym.gas, sym.us10y),
                corrPair('GÃ¡s Ã— SPX', sym.gas, sym.spx),
            ].filter(Boolean),
        },
        ttfGas: {
            items: [
                corrPair('TTF Ã— DXY', sym.ttfGas, sym.dxy),
                corrPair('TTF Ã— Brent', sym.ttfGas, sym.brent),
                corrPair('TTF Ã— US10Y', sym.ttfGas, sym.us10y),
                corrPair('TTF Ã— SPX', sym.ttfGas, sym.spx),
            ].filter(Boolean),
        },
        silver: {
            items: [
                corrPair('Prata Ã— Ouro', sym.silver, sym.gold),
                corrPair('Prata Ã— DXY', sym.silver, sym.dxy),
                corrPair('Prata Ã— US10Y', sym.silver, sym.us10y),
                corrPair('Prata Ã— SPX', sym.silver, sym.spx),
            ].filter(Boolean),
        },
        copper: {
            items: [
                corrPair('Cobre Ã— DXY', sym.copper, sym.dxy),
                corrPair('Cobre Ã— SPX', sym.copper, sym.spx),
                corrPair('Cobre Ã— Brent', sym.copper, sym.brent),
                corrPair('Cobre Ã— US10Y', sym.copper, sym.us10y),
            ].filter(Boolean),
        },
        nickel: {
            items: [
                corrPair('NÃ­quel Ã— DXY', sym.nickel, sym.dxy),
                corrPair('NÃ­quel Ã— Cobre', sym.nickel, sym.copper),
                corrPair('NÃ­quel Ã— SPX', sym.nickel, sym.spx),
                corrPair('NÃ­quel Ã— Brent', sym.nickel, sym.brent),
            ].filter(Boolean),
        },
        zinc: {
            items: [
                corrPair('Zinco Ã— DXY', sym.zinc, sym.dxy),
                corrPair('Zinco Ã— Cobre', sym.zinc, sym.copper),
                corrPair('Zinco Ã— SPX', sym.zinc, sym.spx),
                corrPair('Zinco Ã— Brent', sym.zinc, sym.brent),
            ].filter(Boolean),
        },
    };

    const expected = ['gold', 'brent', 'wti', 'gas', 'ttfGas', 'silver', 'copper', 'nickel', 'zinc', 'dxy', 'us10y', 'vix', 'hyg', 'tlt', 'tipsEtf', 'gld', 'slv', 'usdcad', 'xle', 'xop', 'oih', 'uso'];
    const missing = expected.filter(k => !sym[k]);
    const execution = (() => {
        const gold = sym.gold;
        const oil = sym.wti || sym.brent || sym.uso || null;
        const gas = sym.gas || null;
        const ttfGas = sym.ttfGas || null;
        const silver = sym.silver || sym.slv || null;
        const copper = sym.copper || null;
        const nickel = sym.nickel || null;
        const zinc = sym.zinc || null;
        return { gold, oil, gas, ttfGas, silver, copper, nickel, zinc };
    })();
    const source = {
        gold: asSource(sym.gold, [/^GCc\d(=\$)?$/i, /^MGCc\d(=\$)?$/i, /^GC=F$/i]),
        brent: asSource(sym.brent, [/^(LCO|BRN)c\d(=\$)?$/i, /^BZ=F$/i]),
        wti: asSource(sym.wti, [/^CLc\d(=\$)?$/i, /^MWCLc\d(=\$)?$/i, /^CL=F$/i]),
        oil: asSource(execution.oil || null, [/^(LCO|BRN)c\d(=\$)?$/i, /^BZ=F$/i, /^CLc\d(=\$)?$/i, /^MWCLc\d(=\$)?$/i, /^CL=F$/i]),
        gas: asSource(execution.gas || null, [/^MNDc\d(=\$)?$/i, /^NGc\d(=\$)?$/i, /^NG$/i]),
        ttfGas: asSource(execution.ttfGas || null, [/^TFAc\d(=\$)?$/i]),
        silver: asSource(execution.silver || null, [/^SILc\d(=\$)?$/i, /^SI$/i, /^SIc\d(=\$)?$/i]),
        copper: asSource(execution.copper || null, [/^HGc\d(=\$)?$/i, /^HG=F$/i, /^MCU$/i]),
        nickel: asSource(execution.nickel || null, [/^MNI\d$/i]),
        zinc: asSource(execution.zinc || null, [/^MZN\d$/i]),
    };
    const keyLabels = {
        gold: 'Ouro (GC/XAU/GLD)',
        brent: 'PetrÃ³leo Brent',
        wti: 'PetrÃ³leo WTI',
        dxy: 'DXY',
        us10y: 'US10Y',
        vix: 'VIX',
        hyg: 'HYG',
        tlt: 'TLT',
        tipsEtf: 'TIP (TIPS)',
        gld: 'GLD (ETF ouro)',
        slv: 'SLV (ETF prata)',
        usdcad: 'USD/CAD',
        audusd: 'AUD/USD',
        usdzar: 'USD/ZAR',
        usdmxn: 'USD/MXN',
        usdcnh: 'USD/CNH',
        gdx: 'GDX (miners ETF)',
        gdxj: 'GDXJ (junior miners)',
        minerNem: 'NEM (Newmont)',
        minerAu: 'AU (AngloGold)',
        minerFnv: 'FNV (Franco-Nevada)',
        minerGold: 'GOLD (Barrick)',
        xle: 'XLE',
        xop: 'XOP',
        oih: 'OIH',
        uso: 'USO',
        ttfGas: 'TTF (GÃ¡s Europa)',
        nickel: 'NÃ­quel',
        zinc: 'Zinco',
    };

    const missingAssetsSuggestion = (() => {
        const hasAny = matchers => {
            for (const a of assets) {
                const sym = String(a && a.symbol ? a.symbol : '');
                const name = String(a && a.name ? a.name : '');
                for (const re of (matchers || [])) {
                    if (!(re instanceof RegExp)) continue;
                    if (re.test(sym) || re.test(name)) return true;
                }
            }
            return false;
        };
        const wants = [
            { label: 'MGCc1/MGCc2 (futuro ouro)', matchers: [/^MGCc\d(=\$)?$/i] },
            { label: 'MWCLc1 (futuro petrÃ³leo)', matchers: [/^MWCLc\d(=\$)?$/i] },
            { label: 'GLD (ETF ouro)', matchers: [/^GLD(\.\w+)?$/i] },
            { label: 'BNO/USO (proxy petrÃ³leo)', matchers: [/^BNO(\.\w+)?$/i, /^USO(\.\w+)?$/i] },
            { label: 'XLE/XOP/OIH (energia)', matchers: [/^XLE(\.\w+)?$/i, /^XOP(\.\w+)?$/i, /^OIH(\.\w+)?$/i] },
            { label: 'GDX/GDXJ (miners ETF)', matchers: [/^GDX(\.\w+)?$/i, /^GDXJ(\.\w+)?$/i] },
            { label: 'NEM/AU/FNV/GOLD (miners)', matchers: [/^NEM(\.\w+)?$/i, /^AU(\.\w+)?$/i, /^FNV(\.\w+)?$/i, /^FNV\.TO$/i, /^GOLD(\.\w+)?$/i] },
            { label: 'AUD/USD', matchers: [/^AUD\/USD\b/i, /\bAUDUSD\b/i] },
            { label: 'USD/ZAR', matchers: [/^USD\/ZAR\b/i, /\bUSDZAR\b/i] },
            { label: 'USD/CNH', matchers: [/^USD\/CNH\b/i, /\bUSDCNH\b/i] },
            { label: 'TTF (gÃ¡s Europa)', matchers: [/^TFAc\d(=\$)?$/i, /\bTTF\b/i] },
            { label: 'NÃ­quel (MNI3)', matchers: [/^MNI\d$/i, /\bN[iÃ­]quel\b/i, /\bNickel\b/i] },
            { label: 'Zinco (MZN3)', matchers: [/^MZN\d$/i, /\bZinco\b/i, /\bZinc\b/i] },
            { label: 'DXY', matchers: [/^\.DXY$/i, /\bDXY\b/i] },
            { label: 'VIX', matchers: [/^\.?VIX(9D)?$/i, /\bVIX\b/i] },
            { label: 'US10Y', matchers: [/^US10YT=RR$/i, /^\.TNX$/i, /^\^TNX$/i] },
            { label: 'TIP (TIPS)', matchers: [/^TIP(\.\w+)?$/i, /\bTIPS\b/i] },
            { label: 'HYG', matchers: [/^HYG(\.\w+)?$/i] },
            { label: 'TLT', matchers: [/^TLT(\.\w+)?$/i] },
            { label: 'USD/CAD', matchers: [/^USD\/CAD\b/i, /\bUSDCAD\b/i] },
        ];
        const out = [];
        for (const w of wants) if (!hasAny(w.matchers)) out.push(w.label);
        return out;
    })();

    return {
        sym,
        market: {
            goldPct: get(sym.gold),
            brentPct: get(sym.brent),
            wtiPct: get(sym.wti),
        },
        pulse: { gold: goldPulse, oil: oilPulse, gas: gasPulse, ttfGas: ttfGasPulse, silver: silverPulse, copper: copperPulse, nickel: nickelPulse, zinc: zincPulse },
        corr,
        micro,
        execution,
        source,
        coverage: { expected: expected.length, missing, keyLabels },
        missingAssetsSuggestion,
        news: computeNews.top || [],
        newsMeta: { used: computeNews.used, matched: computeNews.matched, score: computeNews.score },
    };
}

function computeBtcPulseNow(data, web) {
    const isNum = v => typeof v === 'number' && Number.isFinite(v);
    const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
    const dc = (typeof window !== 'undefined' && window.DecisionCore) ? window.DecisionCore : null;
    const catalog = (typeof window !== 'undefined' && window.InstrumentsCatalog) ? window.InstrumentsCatalog : null;
    const dcDeps = buildDcDeps();
    const catDeps = buildCatDeps(dcDeps);
    const rcKey = (key, fallbackMatcher) => {
        const sym = catalog && typeof catalog.resolveRatesCreditByKey === 'function'
            ? catalog.resolveRatesCreditByKey(catDeps, data, key)
            : null;
        if (sym) return sym;
        if (fallbackMatcher instanceof RegExp) return findAssetSymbol(data, fallbackMatcher);
        return null;
    };
    const aliasSym = (k) => findAliasSymbolBest(data, k) || findAliasSymbol(data, k);

    const assets = data && Array.isArray(data.assets) ? data.assets : [];
    const mostRecentMs = (symbol) => {
        if (!symbol) return -Infinity;
        const last = (typeof getMostRecentPointWithPrice === 'function' ? getMostRecentPointWithPrice(data, symbol) : null) || getLastPoint(data, symbol);
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
    const pick = patterns => pickBestByMatchers(patterns, { limit: 10 }) || patterns.map(re => findAssetSymbol(data, re)).find(Boolean) || null;
    const get = s => (s ? getChangePct(data, s) : null);
    const getRatesMoveProxy = s => {
        if (!s) return null;
        const series = data && data.series && Array.isArray(data.series[s]) ? data.series[s] : [];
        if (!series.length) return null;
        const last = series[series.length - 1];
        const lastPrice = last && typeof last.price === 'number' && Number.isFinite(last.price) ? last.price : null;
        const lastPct = pointPct(last);
        if (typeof lastPct === 'number' && Number.isFinite(lastPct)) return lastPct;
        const prev = series.length > 1 ? series[series.length - 2] : null;
        const prevPrice = prev && typeof prev.price === 'number' && Number.isFinite(prev.price) ? prev.price : null;
        const deltaRaw = last && typeof last.change === 'number' && Number.isFinite(last.change)
            ? last.change
            : (lastPrice !== null && prevPrice !== null ? (lastPrice - prevPrice) : null);
        if (deltaRaw === null || !Number.isFinite(deltaRaw)) return null;
        const absPrice = lastPrice !== null ? Math.abs(lastPrice) : 0;
        const looksYield =
            /YT=RR$/i.test(String(s))
            || /^\.TNX$|^\^TNX$/i.test(String(s))
            || absPrice <= 15
            || (absPrice <= 40 && Math.abs(deltaRaw) <= 0.25);
        const deltaBp = looksYield ? (deltaRaw * 100) : (absPrice > 20 ? deltaRaw : (deltaRaw * 100));
        return deltaBp / 10;
    };

    const sym = {
        btc: aliasSym('BTC') || pick([/^BTC\/USD$/i, /\bbitcoin\b/i]),
        eth: aliasSym('ETH') || pick([/\bETH\/USD\b/i, /\bEthereum\b/i]),
        sol: aliasSym('SOL') || pick([/^SOL\/USD$/i, /\bSolana\b/i]),
        doge: aliasSym('DOGE') || pick([/^DOGE\/USD$/i, /\bDogecoin\b/i]),
        xrp: aliasSym('XRP') || pick([/^XRP\/USD$/i, /\bRipple\b/i, /\bXRP\b/i]),
        spx: aliasSym('SPX') || pick([/^\.SPX$/i, /^SPX$/i, /^SPY(\.\w+)?$/i, /\bS&P 500\b/i]),
        ndx: aliasSym('NDX') || pick([/^\.NDX$/i, /^NDX$/i, /^QQQ(\.\w+)?$/i, /\bNasdaq 100\b/i]),
        dxy: aliasSym('DXY') || pick([/^\.DXY$/i, /^DXY$/i, /^DX=F$/i, /^DXc\d$/i, /\bUS\s*Dollar\s*Index\b/i]),
        vix: findAliasSymbolBest(data, 'VIX9D') || findAliasSymbolBest(data, 'VIX30') || aliasSym('VIX') || pick([/^\.?VIX(9D)?$/i, /^VIX$/i]),
        vxn: aliasSym('VXN') || pick([/^\.VXN$/i, /\bNASDAQ\s*100 Volatility\b/i, /\bVXN\b/i]),
        vvix: aliasSym('VVIX') || pick([/^\.VVIX$/i]),
        us2y: rcKey('US_2Y', /^US2YT=RR$/i) || aliasSym('US2Y') || pick([/^US2YT=RR$/i, /^TUc\d=\$?$/i, /\bUS2Y\b/i, /\bUnited States 2-Year\b/i]),
        us10y: rcKey('US_10Y', /(^US10YT=RR$|^US10YT=X$|^\.TNX$|\^TNX)/i) || aliasSym('US10Y') || pick([/^US10YT=RR$/i, /^USGV10YUSAB=R$/i, /^TNc\d=\$?$/i, /^TYc\d=\$?$/i, /\bUS10Y\b/i, /\bUnited States 10-Year\b/i]),
        tlt: rcKey('ETF_TLT', /^TLT(\.\w+)?$/i) || aliasSym('TLT') || pick([/^TLT(\.\w+)?$/i]),
        hyg: rcKey('ETF_HYG', /^HYG(\.\w+)?$/i) || aliasSym('HYG') || pick([/^HYG(\.\w+)?$/i]),
        lqd: rcKey('ETF_LQD', /^LQD(\.\w+)?$/i) || aliasSym('LQD') || pick([/^LQD(\.\w+)?$/i]),
        tips10y: rcKey('US_TIPS_10Y', /(^US10YTIPT=RR$|\bTIPS\b.*\b10\b.*\bYear\b|\bUS\s*TIPS\b)/i) || null,
        tip: rcKey('ETF_TIP', /^TIP(\.\w+)?$/i) || aliasSym('TIPS_ETF') || pick([/^TIP(\.\w+)?$/i]),
        eem: findAliasSymbolBest(data, 'EEM') || findAliasSymbolBest(data, 'VWO') || pick([/^EEM(\.\w+)?$/i, /^VWO(\.\w+)?$/i]),
        gold: findAliasSymbolBest(data, 'GOLD') || pick([/^GC=F$/i, /^GCc\d$/i, /^XAU(USD)?$/i, /^GLD(\.\w+)?$/i, /\bGold\b/i]),
        copper: findAliasSymbolBest(data, 'COPPER') || pick([/^HG=F$/i, /^HGc\d$/i, /^CPER(\.\w+)?$/i, /\bCopper\b/i]),
        brent: findAliasSymbolBest(data, 'BRENT') || pick([/^BZ=F$/i, /^LCOc\d$/i, /^BRNc\d$/i, /^BNO(\.\w+)?$/i, /\bBrent\b/i]),
        wti: findAliasSymbolBest(data, 'WTI') || pick([/^CL=F$/i, /^CLc\d$/i, /^USO(\.\w+)?$/i, /\bWTI\b/i]),
        usdjpy: pick([/^USD\/JPY\b/i]),
        usdcnh: findAliasSymbolBest(data, 'USD_CNH') || pick([/^USD\/CNH\b/i]),
        usdhkd: findAliasSymbolBest(data, 'USD_HKD') || pick([/^USD\/HKD\b/i]),
        usdmxn: pick([/^USD\/MXN\b/i, /\bUSDMXN\b/i]),
        usdzar: pick([/^USD\/ZAR\b/i, /\bUSDZAR\b/i]),
        usdclp: pick([/^USD\/CLP\b/i, /\bUSDCLP\b/i]),
        usdtry: pick([/^USD\/TRY\b/i, /\bUSDTRY\b/i]),
        iron: findAliasSymbolBest(data, 'IRON') || pick([/^TIOc1$/i, /\biron\s*ore\b/i]),
        ibit: pick([/^IBIT(\.\w+)?$/i, /\bIBIT\b/i]),
        fbtc: pick([/^FBTC(\.\w+)?$/i, /\bFBTC\b/i]),
        arkb: pick([/^ARKB(\.\w+)?$/i, /\bARKB\b/i]),
        bitb: pick([/^BITB(\.\w+)?$/i, /\bBITB\b/i]),
        mstr: pick([/^MSTR(\.\w+)?$/i, /\bMicroStrategy\b/i]),
        coin: pick([/^COIN(\.\w+)?$/i, /\bCoinbase\b/i]),
        mara: pick([/^MARA(\.\w+)?$/i, /\bMarathon\b/i]),
        riot: pick([/^RIOT(\.\w+)?$/i, /\bRiot\b/i]),
    };

    const computeNews = (() => {
        const items = web && Array.isArray(web.items) ? web.items : [];
        const confW = c => {
            const s = String(c || '').toLowerCase();
            if (s.includes('high') || s.includes('alta')) return 1.0;
            if (s.includes('medium') || s.includes('mÃ©dia') || s.includes('media')) return 0.75;
            if (s.includes('low') || s.includes('baixa')) return 0.55;
            return 0.7;
        };
        const kwCrypto = s => /\bbitcoin\b|\bbtc\b|\bcrypt(o|os)\b|\bethereum\b|\beth\b|\bsolana\b|\bsol\b|\bspot\b.*\betf\b|\betf\b.*\bbitcoin\b|\bsec\b|\bstablecoin\b|\bdefi\b|\bminers?\b/i.test(s);
        const kwMacroGeo = s => /\bfed\b|\bfomc\b|\brate\s*cut\b|\brate\s*hike\b|\byield(s)?\b|\binflation\b|\bcpi\b|\bjobs\b|\brecession\b|\bliquidity\b|\bdollar\b|\bdxy\b|\bsanction\b|\bwar\b|\biran\b|\bisrael\b|\brussia\b|\bchina\b|\btaiwan\b/i.test(s);
        const pos = [
            /\bapprove(d)?\b/i,
            /\bapproval\b/i,
            /\binflow(s)?\b/i,
            /\brally\b/i,
            /\bsurge\b/i,
            /\bgain(s|ed)?\b/i,
            /\brise(s|d)?\b/i,
            /\bbull(ish)?\b/i,
            /\brate\s*cut\b/i,
            /\bsoft\s*landing\b/i,
        ];
        const neg = [
            /\bhack\b/i,
            /\bexploit\b/i,
            /\bban\b/i,
            /\bcrackdown\b/i,
            /\blawsuit\b/i,
            /\bcharged?\b/i,
            /\bdefault\b/i,
            /\bcollapse\b/i,
            /\boutflow(s)?\b/i,
            /\bsell[-\s]?off\b/i,
            /\bplunge\b/i,
            /\bcrash\b/i,
            /\brate\s*hike\b/i,
        ];
        let matched = 0;
        let score = 0;
        const top = [];
        for (const it of items.slice(0, 60)) {
            const title = it && it.title ? String(it.title) : '';
            if (!title) continue;
            const ok = kwCrypto(title) || kwMacroGeo(title);
            if (!ok) continue;
            if (top.length < 4) top.push(it);
            if (!kwCrypto(title)) continue;
            matched++;
            const w = confW(it && it.confidence);
            let s = 0;
            for (const re of pos) if (re.test(title)) s += 1;
            for (const re of neg) if (re.test(title)) s -= 1;
            score += w * clamp(s, -3, 3);
        }
        const denom = matched > 0 ? matched * 3 : 1;
        const normalized = clamp(score / denom, -1, 1);
        return { used: !!items.length, matched, score: normalized, top };
    })();

    const avgPctFor = syms => {
        const used = [];
        const vals = [];
        for (const s of (syms || [])) {
            const sym = s ? String(s) : '';
            if (!sym) continue;
            const v = get(sym);
            if (!isNum(v)) continue;
            used.push(sym);
            vals.push(v);
        }
        if (!vals.length) return { pct: null, used };
        const pct = vals.reduce((a, b) => a + b, 0) / vals.length;
        return { pct, used };
    };

    const btcEtfBasket = avgPctFor([sym.ibit, sym.fbtc, sym.arkb, sym.bitb]);
    const cryptoEqBasket = avgPctFor([sym.mstr, sym.coin, sym.mara, sym.riot]);
    const emFxBasket = avgPctFor([sym.usdmxn, sym.usdzar, sym.usdclp, sym.usdtry]);
    const relPct = (aPct, bPct) => {
        if (!isNum(aPct) || !isNum(bPct)) return null;
        const v = ((1 + aPct / 100) / Math.max(1e-9, (1 + bPct / 100)) - 1) * 100;
        return Number.isFinite(v) ? Math.max(-99, Math.min(99, v)) : null;
    };
    const ethBtcRel = relPct(get(sym.eth), get(sym.btc));

    const driversCfg = [
        { key: 'ndx', group: 'driver', weight: 0.75, capAbs: 1.4, sign: +1 },
        { key: 'spx', group: 'driver', weight: 0.45, capAbs: 1.2, sign: +1 },
        { key: 'dxy', group: 'driver', weight: 0.7, capAbs: 0.7, sign: -1 },
        { key: 'vix', group: 'driver', weight: 0.55, capAbs: 4.0, sign: -1 },
        { key: 'vxn', group: 'driver', weight: 0.25, capAbs: 4.0, sign: -1 },
        { key: 'us2y', group: 'driver', weight: 0.35, capAbs: 0.7, sign: -1 },
        { key: 'us10y', group: 'driver', weight: 0.25, capAbs: 0.7, sign: -1 },
        { key: 'hyg', group: 'driver', weight: 0.35, capAbs: 1.3, sign: +1 },
        { key: 'lqd', group: 'driver', weight: 0.18, capAbs: 1.1, sign: +1 },
        { key: 'tlt', group: 'driver', weight: 0.2, capAbs: 1.2, sign: +1 },
        { key: 'tips', group: 'driver', weight: 0.18, capAbs: 0.7, sign: -1 },

        { key: 'eth', group: 'confirm', weight: 0.6, capAbs: 4.0, sign: +1 },
        { key: 'sol', group: 'confirm', weight: 0.35, capAbs: 6.0, sign: +1 },
        { key: 'doge', group: 'confirm', weight: 0.15, capAbs: 9.0, sign: +1 },
        { key: 'xrp', group: 'confirm', weight: 0.12, capAbs: 9.0, sign: +1 },
        { key: 'ethBtc', group: 'confirm', weight: 0.22, capAbs: 1.2, sign: +1 },
        { key: 'btcEtf', group: 'confirm', weight: 0.35, capAbs: 2.8, sign: +1 },
        { key: 'cryptoEq', group: 'confirm', weight: 0.25, capAbs: 4.5, sign: +1 },

        { key: 'eem', group: 'context', weight: 0.2, capAbs: 1.3, sign: +1 },
        { key: 'copper', group: 'context', weight: 0.2, capAbs: 1.8, sign: +1 },
        { key: 'brent', group: 'context', weight: 0.12, capAbs: 2.2, sign: +1 },
        { key: 'gold', group: 'context', weight: 0.12, capAbs: 1.6, sign: +1 },
        { key: 'usdjpy', group: 'context', weight: 0.12, capAbs: 1.2, sign: +1 },
        { key: 'vvix', group: 'context', weight: 0.12, capAbs: 5.0, sign: -1 },
        { key: 'emFx', group: 'context', weight: 0.25, capAbs: 0.8, sign: -1 },
        { key: 'cnh', group: 'context', weight: 0.12, capAbs: 0.6, sign: -1 },
        { key: 'hkd', group: 'context', weight: 0.08, capAbs: 0.4, sign: -1 },
        { key: 'iron', group: 'context', weight: 0.12, capAbs: 2.2, sign: +1 },
        { key: 'news', group: 'context', weight: 0.45, capAbs: 1.0, sign: +1 },
    ];

    const drv = {
        btc: { label: 'BTC/USD', pct: get(sym.btc), sym: sym.btc, unit: '%' },
        eth: { label: 'ETH/USD', pct: get(sym.eth), sym: sym.eth, unit: '%' },
        sol: { label: 'SOL/USD', pct: get(sym.sol), sym: sym.sol, unit: '%' },
        doge: { label: 'DOGE/USD', pct: get(sym.doge), sym: sym.doge, unit: '%' },
        btcEtf: {
            label: `Spot ETFs BTC (${btcEtfBasket.used.join('/') || 'IBIT/FBTC/ARKB/BITB'})`,
            pct: btcEtfBasket.pct,
            sym: btcEtfBasket.used.length ? btcEtfBasket.used[0] : null,
            unit: '%'
        },
        cryptoEq: {
            label: `AÃ§Ãµes cripto (${cryptoEqBasket.used.join('/') || 'MSTR/COIN/MARA/RIOT'})`,
            pct: cryptoEqBasket.pct,
            sym: cryptoEqBasket.used.length ? cryptoEqBasket.used[0] : null,
            unit: '%'
        },
        spx: { label: 'SPX', pct: get(sym.spx), sym: sym.spx, unit: '%' },
        ndx: { label: 'NDX', pct: get(sym.ndx), sym: sym.ndx, unit: '%' },
        dxy: { label: 'DXY', pct: get(sym.dxy), sym: sym.dxy, unit: '%' },
        vix: { label: 'VIX', pct: get(sym.vix), sym: sym.vix, unit: '%' },
        vxn: { label: 'VXN', pct: get(sym.vxn), sym: sym.vxn, unit: '%' },
        vvix: { label: 'VVIX', pct: get(sym.vvix), sym: sym.vvix, unit: '%' },
        us2y: { label: 'US2Y (proxy Î”)', pct: getRatesMoveProxy(sym.us2y), sym: sym.us2y, unit: '%' },
        us10y: { label: 'US10Y (proxy Î”)', pct: getRatesMoveProxy(sym.us10y), sym: sym.us10y, unit: '%' },
        tlt: { label: 'TLT', pct: get(sym.tlt), sym: sym.tlt, unit: '%' },
        hyg: { label: 'HYG', pct: get(sym.hyg), sym: sym.hyg, unit: '%' },
        lqd: { label: 'LQD', pct: get(sym.lqd), sym: sym.lqd, unit: '%' },
        tips: { label: sym.tips10y ? 'TIPS 10Y (proxy Î”)' : 'TIP (TIPS ETF)', pct: sym.tips10y ? getRatesMoveProxy(sym.tips10y) : get(sym.tip), sym: sym.tips10y || sym.tip, unit: '%' },
        eem: { label: 'EEM/VWO', pct: get(sym.eem), sym: sym.eem, unit: '%' },
        gold: { label: 'Ouro', pct: get(sym.gold), sym: sym.gold, unit: '%' },
        copper: { label: 'Cobre', pct: get(sym.copper), sym: sym.copper, unit: '%' },
        brent: { label: 'Brent', pct: (get(sym.brent) ?? get(sym.wti)), sym: sym.brent || sym.wti, unit: '%' },
        usdjpy: { label: 'USD/JPY', pct: get(sym.usdjpy), sym: sym.usdjpy, unit: '%' },
        emFx: { label: `FX EM (${[sym.usdmxn, sym.usdzar, sym.usdclp, sym.usdtry].filter(Boolean).join('/') || 'USD/MXN/ZAR/CLP/TRY'})`, pct: emFxBasket.pct, sym: sym.usdmxn || sym.usdzar || sym.usdclp || sym.usdtry, unit: '%' },
        cnh: { label: 'USD/CNH', pct: get(sym.usdcnh), sym: sym.usdcnh, unit: '%' },
        hkd: { label: 'USD/HKD', pct: get(sym.usdhkd), sym: sym.usdhkd, unit: '%' },
        iron: { label: 'MinÃ©rio (SGX/DCE)', pct: get(sym.iron), sym: sym.iron, unit: '%' },
        ethBtc: { label: 'ETH/BTC (rel)', pct: ethBtcRel, sym: sym.eth || null, unit: '%' },
        news: { label: 'NotÃ­cias (macro/cripto)', pct: computeNews.used ? computeNews.score : null, sym: null, unit: 'score' },
    };

    const rows = [];
    const breadth = { pos: 0, neg: 0, zero: 0 };
    const contribution = { posSum: 0, negSum: 0, net: 0 };
    const pnlLike = { posSum: 0, negSum: 0, net: 0 };
    const groups = {
        driver: { net: 0, pnl: 0, count: 0 },
        confirm: { net: 0, pnl: 0, count: 0 },
        context: { net: 0, pnl: 0, count: 0 },
    };

    for (const cfg of driversCfg) {
        const d = drv[cfg.key];
        const pct = d ? d.pct : null;
        if (!isNum(pct)) continue;
        const signed = cfg.sign * pct;
        const capped = clamp(signed, -cfg.capAbs, cfg.capAbs);
        const contrib = cfg.weight * (cfg.capAbs > 0 ? capped / cfg.capAbs : 0);
        const pnl = cfg.weight * capped;
        const g = cfg.group === 'driver' || cfg.group === 'confirm' || cfg.group === 'context' ? cfg.group : 'context';
        contribution.net += contrib;
        pnlLike.net += pnl;
        groups[g].net += contrib;
        groups[g].pnl += pnl;
        groups[g].count += 1;
        if (contrib > 0) {
            breadth.pos += 1;
            contribution.posSum += contrib;
            pnlLike.posSum += pnl;
        } else if (contrib < 0) {
            breadth.neg += 1;
            contribution.negSum += contrib;
            pnlLike.negSum += pnl;
        } else {
            breadth.zero += 1;
        }
        rows.push({
            key: cfg.key,
            group: g,
            label: d.label,
            symbol: d.sym || null,
            pct,
            unit: d.unit || '%',
            signed,
            weight: cfg.weight,
            capAbs: cfg.capAbs,
            contrib,
            pnl,
        });
    }

    const staleCore = (() => {
        if (!dc || typeof dc.symbolAgeMs !== 'function') return false;
        const staleMs = 4 * 60 * 60 * 1000;
        const core = [sym.btc, sym.ndx, sym.dxy, sym.vix, sym.us10y, sym.hyg].filter(Boolean);
        if (!core.length) return false;
        for (const s of core) {
            const age = dc.symbolAgeMs(dcDeps, data, s);
            if (typeof age === 'number' && Number.isFinite(age) && age > staleMs) return true;
        }
        return false;
    })();

    const netRaw = contribution.net;
    const net = clamp(staleCore ? (netRaw * 0.85) : netRaw, -3, 3);
    let bias = net > 0.25 ? 'buy' : net < -0.25 ? 'sell' : 'neutral';
    let nowLabel = 'AGORA';
    const tapePct = drv.btc && isNum(drv.btc.pct) ? drv.btc.pct : null;
    if (staleCore) {
        nowLabel = `${nowLabel} â€¢ STALE`;
    }
    if (isNum(tapePct) && Math.abs(tapePct) >= 0.9) {
        const tapeBias = tapePct > 0 ? 'buy' : 'sell';
        if (bias === 'neutral' || bias === tapeBias) {
            bias = tapeBias;
            nowLabel = 'AGORA â€¢ TAPE';
        } else {
            nowLabel = 'AGORA â€¢ TAPE (diverg.)';
        }
    }

    const expectedKeys = driversCfg.map(x => x.key);
    const got = new Set(rows.map(r => String(r && r.key ? r.key : '')));
    const missing = expectedKeys.filter(k => !got.has(k));
    const keyLabels = (() => {
        const m = {};
        for (const k of expectedKeys) {
            const d = drv[k];
            m[k] = d && d.label ? String(d.label) : k;
        }
        return m;
    })();
    const missingDetails = (() => {
        const m = {};
        for (const k of missing) {
            const d = drv[k];
            const s = d && d.sym ? String(d.sym) : '';
            if (!s) {
                m[k] = 'sem sÃ­mbolo';
                continue;
            }
            const pts = data && data.series && Array.isArray(data.series[s]) ? data.series[s] : [];
            if (!pts.length) {
                m[k] = 'sem sÃ©rie';
                continue;
            }
            const last = getLastPoint(data, s);
            if (!last) {
                m[k] = 'sem Ãºltimo ponto';
                continue;
            }
            if (!isNum(last.changePct) && !isNum(last.extendedChangePct) && !isNum(last.change)) {
                m[k] = 'sem variaÃ§Ã£o';
                continue;
            }
            m[k] = 'sem leitura';
        }
        return m;
    })();

    const suggest = (() => {
        const assets = data && Array.isArray(data.assets) ? data.assets : [];
        const hasAny = matchers => {
            for (const a of assets) {
                const sym = String(a && a.symbol ? a.symbol : '');
                const name = String(a && a.name ? a.name : '');
                for (const re of matchers) if (re.test(sym) || re.test(name)) return true;
            }
            return false;
        };
        const wants = [
            { label: 'BTC/USD', matchers: [/^BTC\/USD$/i, /\bbitcoin\b/i] },
            { label: 'ETH/USD', matchers: [/\bETH\/USD\b/i, /\bEthereum\b/i] },
            { label: 'SOL/USD', matchers: [/^SOL\/USD$/i, /\bSolana\b/i] },
            { label: 'XRP/USD', matchers: [/^XRP\/USD$/i, /\bXRP\b/i, /\bRipple\b/i] },
            { label: 'USD/MXN', matchers: [/^USD\/MXN\b/i, /\bUSDMXN\b/i] },
            { label: 'USD/ZAR', matchers: [/^USD\/ZAR\b/i, /\bUSDZAR\b/i] },
            { label: 'USD/CLP', matchers: [/^USD\/CLP\b/i, /\bUSDCLP\b/i] },
            { label: 'USD/TRY', matchers: [/^USD\/TRY\b/i, /\bUSDTRY\b/i] },
            { label: 'USD/CNH', matchers: [/^USD\/CNH\b/i] },
            { label: 'USD/HKD', matchers: [/^USD\/HKD\b/i] },
            { label: 'MinÃ©rio (TIOc1)', matchers: [/^TIOc1$/i, /\biron\s*ore\b/i] },
            { label: 'IBIT', matchers: [/^IBIT(\.\w+)?$/i, /\bIBIT\b/i] },
            { label: 'FBTC', matchers: [/^FBTC(\.\w+)?$/i, /\bFBTC\b/i] },
            { label: 'ARKB', matchers: [/^ARKB(\.\w+)?$/i, /\bARKB\b/i] },
            { label: 'BITB', matchers: [/^BITB(\.\w+)?$/i, /\bBITB\b/i] },
            { label: 'MSTR', matchers: [/^MSTR(\.\w+)?$/i, /\bMicroStrategy\b/i] },
            { label: 'COIN', matchers: [/^COIN(\.\w+)?$/i, /\bCoinbase\b/i] },
            { label: 'MARA', matchers: [/^MARA(\.\w+)?$/i, /\bMarathon\b/i] },
            { label: 'RIOT', matchers: [/^RIOT(\.\w+)?$/i, /\bRiot\b/i] },
            { label: 'VIX', matchers: [/^\.?VIX(9D)?$/i, /\bVIX\b/i] },
            { label: 'VXN', matchers: [/^\.VXN$/i, /\bVXN\b/i] },
            { label: 'DXY', matchers: [/^DX$|^\.DXY$/i, /\bDXY\b/i] },
            { label: 'US10Y', matchers: [/^US10YT=RR$/i, /^USGV10YUSAB=R$/i, /^TNc\d=\$?$/i, /\bUS10Y\b/i, /\bUnited States 10-Year\b/i] },
            { label: 'US2Y', matchers: [/^US2YT=RR$/i, /^TUc\d=\$?$/i, /\bUS2Y\b/i, /\bUnited States 2-Year\b/i] },
            { label: 'TLT', matchers: [/^TLT(\.\w+)?$/i] },
            { label: 'HYG', matchers: [/^HYG(\.\w+)?$/i] },
            { label: 'LQD', matchers: [/^LQD(\.\w+)?$/i] },
            { label: 'TIPS 10Y / TIP', matchers: [/^US10YTIPT=RR$/i, /^TIP(\.\w+)?$/i, /\bTIPS\b/i] },
            { label: 'SPY (proxy SPX)', matchers: [/^SPY$/i, /^\.SPX$/i, /\bS&P 500\b/i] },
            { label: 'QQQ (proxy NDX)', matchers: [/^QQQ$/i, /^\.NDX$/i, /\bNasdaq 100\b/i] },
            { label: 'Ouro (GC/XAU)', matchers: [/^GC\b/i, /^XAU(USD)?$/i, /\bouro\b/i, /\bgold\b/i] },
            { label: 'Cobre (HG)', matchers: [/^HG\b/i, /\bcobre\b/i, /\bcopper\b/i] },
            { label: 'Brent (BZ=F/LCO/BNO)', matchers: [/^BNO$/i, /^LCO\b/i, /^BRN$|^BRN=F$|^BZ=F$/i, /\bBrent\b/i] },
            { label: 'USD/JPY', matchers: [/^USD\/JPY\b/i] },
        ];
        const out = [];
        for (const w of wants) {
            if (!hasAny(w.matchers)) out.push(w.label);
        }
        return out;
    })();

    return {
        sym,
        phase: { nowLabel },
        market: { btcPct: drv.btc ? drv.btc.pct : null },
        pulse: { bias, net, breadth, contribution, pnlLike, groups, rows },
        coverage: { expected: expectedKeys.length, observed: rows.length, missing, keyLabels, missingDetails, staleCore },
        missingAssetsSuggestion: suggest,
        news: computeNews.top || [],
        newsMeta: { used: computeNews.used, matched: computeNews.matched, score: computeNews.score },
    };
}

function renderBtcOperationalBriefing() {
    const el = document.getElementById('btcOperationalBriefing');
    if (!el) return;

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

function renderUsEquitiesOperationalBriefing() {
    const el = document.getElementById('usEquitiesOperationalBriefing');
    if (!el) return;

    const api = (() => {
        try {
            const mb = window.MercadoBlocks && window.MercadoBlocks.usOperationalEua ? window.MercadoBlocks.usOperationalEua : null;
            if (mb && typeof mb.render === 'function') return mb;
        } catch { }
        try { return window.USOperationalEua || null; } catch { return null; }
    })();

    if (!api || typeof api.render !== 'function') {
        el.innerHTML = fallbackCard('EUA (operacional)', 'MÃ³dulo indisponÃ­vel.');
        return;
    }

    api.render({
        el,
        data: getData(),
        operationalInputs,
        computeUsEquitiesPulseNow,
        getChangePct,
        getMostRecentPointWithPrice,
        getLastPoint,
        formatDateTime,
        formatPercent,
        formatNumber,
        escapeHtml,
        loadScriptFresh,
        renderWebNewsModule,
        renderZqCurveBriefing,
        renderUsTreasuryFuturesBriefing,
    });
}

function renderCommoditiesOperationalBriefing() {
    const el = document.getElementById('commoditiesOperationalBriefing');
    if (!el) return;

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

function renderHk50OperationalBriefing() {
    const el = document.getElementById('hk50OperationalBriefing');
    if (!el) return;
    const mod = (typeof window !== 'undefined' && window.MercadoBlocks && window.MercadoBlocks.hk50Briefing) ? window.MercadoBlocks.hk50Briefing : null;
    if (mod && typeof mod.render === 'function') {
        try {
            mod.render({
                el,
                deps: buildOperationalPulseBriefingDeps({ computeHk50PulseNow }),
            });
            return;
        } catch {
            el.innerHTML = fallbackCard('HK50', 'Falha ao renderizar o mÃ³dulo.');
            return;
        }
    }

    const badge = (tone, text, strength) => pillHtml('signal', tone, text, strength);

    if (!data || !hkNow) {
        el.innerHTML = `
            <div style="padding:12px;border:1px solid rgba(255,255,255,.12);border-radius:14px;background:rgba(0,0,0,.18);opacity:.88;">
                Sem dados suficientes para montar o HK50 agora.
            </div>
        `;
        return;
    }

    const fmtP = v => (typeof v === 'number' && Number.isFinite(v) ? formatPercent(v, 2) : '—');
    const fmt0 = v => (typeof v === 'number' && Number.isFinite(v) ? formatNumber(v, 0) : '—');
    const fmt2 = v => (typeof v === 'number' && Number.isFinite(v) ? formatNumber(v, 2) : '—');

    const p = hkNow.pulse || { bias: 'neutral', net: 0, groups: {}, rows: [] };
    const tone = p.net > 0.25 ? 'positive' : p.net < -0.25 ? 'negative' : 'neutral';
    const netBadge = toneBadgeHtmlFromTone(tone, Math.abs(p.net), `${formatNumber(p.net, 2)}`, { maxAbs: 3 });
    const biasLabel = b => (b === 'buy' ? 'COMPRA' : b === 'sell' ? 'VENDA' : 'NEUTRO');
    const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
    const conv = hkNow.conviction || null;
    const convBadge = conv && conv.label
        ? badge(conv.tone || 'neutral', `Conv: ${String(conv.label)}`)
        : badge('neutral', 'Conv: —');

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
                <svg viewBox="0 0 100 60" width="92" height="54" aria-label="Velocímetro HK">
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
    const hkSpot = spotOf(hkNow.sym.hk50);
    const hkLine = `${hkNow.sym.hk50 ? hkNow.sym.hk50 : '—'} • ${hkSpot.spot !== null ? fmt0(hkSpot.spot) : '—'} • ${fmtP(hkNow.market.hk50Pct)}`;
    const asOf = hkSpot.t ? formatDateTime(hkSpot.t) : '—';

    const scalperPanel = (() => {
        const symbol = hkNow && hkNow.sym && hkNow.sym.hk50 ? String(hkNow.sym.hk50) : '';
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

        const amp = hkNow && hkNow.volAmp && typeof hkNow.volAmp.amp === 'number' && Number.isFinite(hkNow.volAmp.amp) ? hkNow.volAmp.amp : 1;
        const th5 = 0.10 * amp;
        const th15 = 0.18 * amp;
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
        const tone = finalBias === 'buy' ? 'positive' : finalBias === 'sell' ? 'negative' : 'neutral';
        const action = finalBias === 'buy' ? 'COMPRA' : finalBias === 'sell' ? 'VENDA' : 'NEUTRO';

        const sign = (v, th = 0.10) => (typeof v === 'number' && Number.isFinite(v) ? (v > th ? +1 : v < -th ? -1 : 0) : 0);
        const ok = (a, b, inverse = false) => {
            const sa = sign(a);
            const sb = sign(b);
            if (!sa || !sb) return null;
            return inverse ? (sa === -sb) : (sa === sb);
        };
        const usdCnh = hkNow.sym && (hkNow.sym.usdCnh || hkNow.sym.usdCny) ? getChangePct(data, hkNow.sym.usdCnh || hkNow.sym.usdCny) : null;
        const spx = hkNow.sym && hkNow.sym.spx ? getChangePct(data, hkNow.sym.spx) : null;
        const dxy = hkNow.sym && hkNow.sym.dxy ? getChangePct(data, hkNow.sym.dxy) : null;
        const vix = hkNow.sym && hkNow.sym.vix ? getChangePct(data, hkNow.sym.vix) : null;
        const fxi = hkNow.sym && hkNow.sym.fxi ? getChangePct(data, hkNow.sym.fxi) : (hkNow.sym && hkNow.sym.fxChina ? getChangePct(data, hkNow.sym.fxChina) : null);
        const hstech = hkNow.sym && hkNow.sym.hstech ? getChangePct(data, hkNow.sym.hstech) : null;
        const iron = hkNow.sym && hkNow.sym.iron ? getChangePct(data, hkNow.sym.iron) : null;
        const copper = hkNow.sym && hkNow.sym.copper ? getChangePct(data, hkNow.sym.copper) : null;

        const pCnh = ok(hkNow.market.hk50Pct, usdCnh, true);
        const pSpx = ok(hkNow.market.hk50Pct, spx, false);
        const pChina = ok(hkNow.market.hk50Pct, fxi, false);

        const parityBadge = (name, v) => badge(v === true ? 'positive' : v === false ? 'negative' : 'neutral', `${name}: ${v === true ? 'OK' : v === false ? 'DIVERGE' : '—'}`);
        const ampAdj = clamp(0.6 + 0.4 * amp, 0.85, 1.35);
        const stopBase = range30 && typeof range30.pct === 'number' ? Math.max(0.20, range30.pct * 0.25) : null;
        const alvoBase = range30 && typeof range30.pct === 'number' ? Math.max(0.35, range30.pct * 0.5) : null;
        const stop = stopBase !== null ? clamp(stopBase * ampAdj, 0.18, 2.50) : null;
        const alvo = alvoBase !== null ? clamp(alvoBase * ampAdj, 0.30, 4.00) : null;
        const r = (stop !== null && alvo !== null && stop > 1e-9) ? (alvo / stop) : null;
        const plan = finalBias === 'buy'
            ? `Comprar (scalp) • Stop ~${stop !== null ? formatPercent(stop, 2) : '—'} • Alvo ~${alvo !== null ? formatPercent(alvo, 2) : '—'}${r !== null ? ` • R~${formatNumber(r, 1)}` : ''} • volAmp ${formatNumber(amp, 2)}`
            : finalBias === 'sell'
                ? `Vender (scalp) • Stop ~${stop !== null ? formatPercent(stop, 2) : '—'} • Alvo ~${alvo !== null ? formatPercent(alvo, 2) : '—'}${r !== null ? ` • R~${formatNumber(r, 1)}` : ''} • volAmp ${formatNumber(amp, 2)}`
                : 'Neutro (scalp) • aguarde alinhamento 5m×15m e paridades.';
        const convWarn = (conv && Array.isArray(conv.divergences) && conv.divergences.length)
            ? ` • ${conv.divergences[0]}`
            : '';

        return `
            <div style="margin-top:12px;border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:12px;background:rgba(0,0,0,.18);">
                <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
                    <div style="font-weight:900;letter-spacing:.8px;opacity:.95;">⚡ Scalper — HK50</div>
                    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
                        ${badge(tone, `Scalp: ${action}`)}
                        ${badge('neutral', `Macro: ${biasLabel(ctxBias)} (${formatNumber(p.net, 2)})`)}
                        ${parityBadge('HK50×USD/CNH (inv)', pCnh)}
                        ${parityBadge('HK50×SPX', pSpx)}
                        ${parityBadge('HK50×China', pChina)}
                    </div>
                </div>
                <div style="margin-top:8px;opacity:.86;font-size:12px;line-height:1.35;">
                    Micro: 5m ${escapeHtml(typeof r5 === 'number' ? formatPercent(r5, 2) : '—')} • 15m ${escapeHtml(typeof r15 === 'number' ? formatPercent(r15, 2) : '—')} • 60m ${escapeHtml(typeof r60 === 'number' ? formatPercent(r60, 2) : '—')} • Range30 ${escapeHtml(range30 ? formatPercent(range30.pct, 2) : '—')}
                </div>
                <div style="margin-top:8px;opacity:.84;font-size:12px;line-height:1.35;">
                    Fluxo/risco: DXY ${escapeHtml(fmtP(dxy))} • VIX ${escapeHtml(fmtP(vix))} • USD/CNH ${escapeHtml(fmtP(usdCnh))}
                </div>
                <div style="margin-top:8px;opacity:.84;font-size:12px;line-height:1.35;">
                    Setores/proxies: HSTECH ${escapeHtml(fmtP(hstech))} • FXI/MCHI ${escapeHtml(fmtP(fxi))} • Minério ${escapeHtml(fmtP(iron))} • Cobre ${escapeHtml(fmtP(copper))}
                </div>
                <div style="margin-top:10px;opacity:.86;font-size:12px;line-height:1.35;">${escapeHtml(plan)}${escapeHtml(convWarn)}</div>
            </div>
        `;
    })();

    const groupTop = (groupKey, max = 7) => {
        const xs = (p.rows || []).filter(r => r && r.group === groupKey);
        xs.sort((a, b) => Math.abs(b.contrib || 0) - Math.abs(a.contrib || 0));
        return xs.slice(0, max);
    };

    const lineItem = r => {
        const pct = typeof r.pct === 'number' && Number.isFinite(r.pct) ? r.pct : null;
        const contrib = typeof r.contrib === 'number' && Number.isFinite(r.contrib) ? r.contrib : 0;
        const t = contrib > 0.02 ? 'positive' : contrib < -0.02 ? 'negative' : 'neutral';
        const cBadge = toneBadgeHtmlFromTone(t, Math.abs(contrib), fmt2(contrib), { maxAbs: 1 });
        const sym = r.symbol ? String(r.symbol) : '';
        const head = sym ? `${r.label} (${sym})` : String(r.label || '');
        return `<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;padding:6px 8px;border:1px solid rgba(255,255,255,.10);border-radius:10px;background:rgba(0,0,0,.16);">
            <div style="opacity:.92;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:72%;">${escapeHtml(head)}</div>
            <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;justify-content:flex-end;">
                <span style="font-family:'Share Tech Mono',monospace;font-weight:900;opacity:.88;">${escapeHtml(fmtP(pct))}</span>
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
    const corrLine = (() => {
        const fc = hkNow.flowCorr || null;
        const items = fc && Array.isArray(fc.items) ? fc.items : [];
        const parts = items
            .filter(x => x && typeof x.corr === 'number' && Number.isFinite(x.corr) && typeof x.n === 'number' && Number.isFinite(x.n) && x.n >= 20)
            .slice(0, 5)
            .map(x => `${String(x.label || 'Corr')} ${fmt2(x.corr)} (n=${String(Math.floor(x.n))})`);
        return parts.length ? `Corr (fluxo): ${parts.join(' • ')}` : '';
    })();

    const missing = hkNow.coverage && Array.isArray(hkNow.coverage.missing) ? hkNow.coverage.missing : [];
    const missingPretty = (() => {
        const keyLabels = hkNow.coverage && hkNow.coverage.keyLabels && typeof hkNow.coverage.keyLabels === 'object' ? hkNow.coverage.keyLabels : {};
        const details = hkNow.coverage && hkNow.coverage.missingDetails && typeof hkNow.coverage.missingDetails === 'object' ? hkNow.coverage.missingDetails : {};
        return missing.map(k => {
            const label = keyLabels && keyLabels[k] ? String(keyLabels[k]) : String(k);
            const det = details && details[k] ? String(details[k]) : '';
            return det ? `${label} (${det})` : label;
        });
    })();
    const missingLabel = missingPretty.length ? `Faltando (dados): ${missingPretty.slice(0, 10).join(', ')}${missingPretty.length > 10 ? `… +${missingPretty.length - 10}` : ''}` : 'Drivers: completos';
    const missingBadge = badge(missing.length ? 'neutral' : 'positive', missingLabel);

    const sugg = hkNow.missingAssetsSuggestion || [];
    const suggestLine = sugg.length ? `Sugestões p/ carteira (Investing): ${sugg.join(' • ')}` : '';

    const news = Array.isArray(hkNow.news) ? hkNow.news : [];
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

    const ratesAndCreditHtml = (() => {
        const ratesMoveProxy = s => {
            const sym = s ? String(s) : '';
            if (!sym) return null;
            const series = data && data.series && Array.isArray(data.series[sym]) ? data.series[sym] : [];
            if (!series.length) return null;
            const last = series[series.length - 1];
            const lastPrice = last && typeof last.price === 'number' && Number.isFinite(last.price) ? last.price : null;
            const lastPct = pointPct(last);
            if (typeof lastPct === 'number' && Number.isFinite(lastPct)) return lastPct;
            const prev = series.length > 1 ? series[series.length - 2] : null;
            const prevPrice = prev && typeof prev.price === 'number' && Number.isFinite(prev.price) ? prev.price : null;
            const deltaRaw = last && typeof last.change === 'number' && Number.isFinite(last.change)
                ? last.change
                : (lastPrice !== null && prevPrice !== null ? (lastPrice - prevPrice) : null);
            if (deltaRaw === null || !Number.isFinite(deltaRaw)) return null;
            const absPrice = lastPrice !== null ? Math.abs(lastPrice) : 0;
            const deltaBp = absPrice > 20 ? deltaRaw : (deltaRaw * 100);
            return deltaBp * 0.1;
        };
        const mk = (label, s, { fmtSpot, maxAbs } = {}) => {
            const sym = s ? String(s) : '';
            const spot = spotOf(sym).spot;
            const chg = sym ? ratesMoveProxy(sym) : null;
            const spotTxt = typeof fmtSpot === 'function' ? fmtSpot(spot) : (spot !== null ? fmt2(spot) : '—');
            const chgTxt = typeof chg === 'number' && Number.isFinite(chg) ? toneBadgeHtml(chg, formatNumber(chg, 2), { maxAbs: typeof maxAbs === 'number' ? maxAbs : 1 }) : '—';
            return `<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;padding:6px 8px;border:1px solid rgba(255,255,255,.10);border-radius:10px;background:rgba(0,0,0,.16);">
                <div style="opacity:.92;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:60%;">${escapeHtml(label)}${sym ? ` <span style="opacity:.72;">(${escapeHtml(sym)})</span>` : ''}</div>
                <div style="display:flex;gap:8px;align-items:center;justify-content:flex-end;flex-wrap:wrap;">
                    <span style="font-family:'Share Tech Mono',monospace;font-weight:900;opacity:.88;">${escapeHtml(spotTxt)}</span>
                    ${chgTxt}
                </div>
            </div>`;
        };
        const fmtRate = v => (typeof v === 'number' && Number.isFinite(v) ? `${formatNumber(v, 2)}%` : '—');
        const s = hkNow && hkNow.sym ? hkNow.sym : {};
        const items = [
            mk('HK10Y', s.hk10y, { fmtSpot: fmtRate, maxAbs: 0.6 }),
            mk('HK 1M', s.hk1m, { fmtSpot: fmtRate, maxAbs: 0.6 }),
            mk('HK 3M', s.hk3m, { fmtSpot: fmtRate, maxAbs: 0.6 }),
            mk('CN10Y', s.cn10y, { fmtSpot: fmtRate, maxAbs: 0.6 }),
            mk('US10Y', s.us10y, { fmtSpot: fmtRate, maxAbs: 0.6 }),
            mk('Spread 10Y (HK vs US/China)', s.us10hk10, { fmtSpot: fmtRate, maxAbs: 0.6 }),
            mk('China CDS 5Y (USD)', s.cdsCn5y, { maxAbs: 2.0 }),
        ];
        return `<div style="margin-top:12px;border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:12px;background:rgba(0,0,0,.18);">
            <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
                <div style="font-weight:900;letter-spacing:.6px;opacity:.92;">Taxas & Crédito (HK/China)</div>
                <div style="opacity:.72;font-size:12px;">spot + Δ (proxy)</div>
            </div>
            <div style="margin-top:10px;display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:10px;">
                ${items.join('')}
            </div>
        </div>`;
    })();

    el.innerHTML = `
        <div style="padding:12px;border:1px solid rgba(255,255,255,.12);border-radius:14px;background:rgba(0,0,0,.18);">
            <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
                <div style="font-weight:900;letter-spacing:1px;">HK50 — Resumo Operacional</div>
                <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
                    ${badge(p.bias === 'buy' ? 'positive' : p.bias === 'sell' ? 'negative' : 'neutral', `Viés: ${biasLabel(p.bias)}`)}
                    ${badge('neutral', 'Drivers net')} ${netBadge}
                    ${convBadge}
                    ${gaugeHtml}
                </div>
            </div>
            <div style="margin-top:8px;opacity:.86;font-size:12px;line-height:1.35;">
                ${escapeHtml(hkLine)} • asOf ${escapeHtml(asOf)} • ${escapeHtml(layersLine)}
            </div>
            ${corrLine ? `<div style="margin-top:6px;opacity:.82;font-size:12px;line-height:1.35;">${escapeHtml(corrLine)}</div>` : ''}
            <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
                ${missingBadge}
            </div>
            ${suggestLine ? `<div style="margin-top:8px;opacity:.82;font-size:12px;line-height:1.35;">${escapeHtml(suggestLine)}</div>` : ''}
        </div>
        ${scalperPanel}
        ${ratesAndCreditHtml}

        <div style="margin-top:12px;display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:12px;">
            <div style="border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:12px;background:rgba(0,0,0,.18);">
                <div style="font-weight:900;letter-spacing:.6px;opacity:.92;margin-bottom:8px;">Drivers (direto / China-HK)</div>
                ${(groupTop('driver') || []).map(lineItem).join('') || `<div style="opacity:.80;">—</div>`}
            </div>
            <div style="border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:12px;background:rgba(0,0,0,.18);">
                <div style="font-weight:900;letter-spacing:.6px;opacity:.92;margin-bottom:8px;">Confirmação (global risk)</div>
                ${(groupTop('confirm') || []).map(lineItem).join('') || `<div style="opacity:.80;">—</div>`}
            </div>
            <div style="border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:12px;background:rgba(0,0,0,.18);">
                <div style="font-weight:900;letter-spacing:.6px;opacity:.92;margin-bottom:8px;">Contexto (commodities / EM)</div>
                ${(groupTop('context') || []).map(lineItem).join('') || `<div style="opacity:.80;">—</div>`}
            </div>
        </div>

        <div style="margin-top:12px;border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:12px;background:rgba(0,0,0,.18);">
            <div style="font-weight:900;letter-spacing:.6px;opacity:.92;margin-bottom:8px;">Notícias (geo / China-HK)</div>
            <div style="opacity:.92;line-height:1.35;">${newsHtml}</div>
        </div>
    `;
}

function renderBrazilFixedIncomeFlow(data) {
    const el = document.getElementById('brazilFixedIncomeFlow');
    if (!el) return;

    const mod = (typeof window !== 'undefined' && window.MercadoBlocks && window.MercadoBlocks.brazilFixedIncomeFlow)
        ? window.MercadoBlocks.brazilFixedIncomeFlow
        : null;
    if (mod && typeof mod.render === 'function') {
        try {
            mod.render({
                data,
                el,
                deps: {
                    ...buildCommonBlockDeps(),
                    isBrazilRelated,
                    computeBrazilCdsHedgeSignal,
                },
            });
            return;
        } catch {
            el.innerHTML = fallbackCard('Fluxo â€” Renda Fixa BR', 'Falha ao renderizar o mÃ³dulo.');
            return;
        }
    }

    el.innerHTML = fallbackCard('Fluxo â€” Renda Fixa BR', 'MÃ³dulo indisponÃ­vel (nÃ£o carregado).');
}

let agendaAutoCache = null;
let agendaAutoLoading = false;

let operationalInputs = { regime: null, optionsGamma: null, webNews: null, foreignFlow: null, focusSummary: null, zqCurve: null, macro: null };

const operationalTuning = {
    threshold: { dxy: 0.12, em: 0.12, export: 0.25, yields: 0.12, foreignFlow: 0.25, brFlow: 0.22, brBreadth: 0.22, brSectors: 0.18, brRotation: 0.12, zqSlope: 0.08, flowSentinel: 0.25 },
    weight: { flow: 0.5, dxy: 0.4, export: 0.3, em: 0.4, yields: 0.25, foreignFlow: 0.22, brFlow: 0.28, brBreadth: 0.30, brSectors: 0.32, brRotation: 0.22, zq: 0.22, flowSentinel: 0.18 },
};

function loadOperationalTuning() {
    try {
        const raw = localStorage.getItem('mercado_operational_tuning_v1');
        if (!raw) return;
        const cfg = JSON.parse(raw);
        if (cfg && cfg.threshold) Object.assign(operationalTuning.threshold, cfg.threshold);
        if (cfg && cfg.weight) Object.assign(operationalTuning.weight, cfg.weight);
    } catch {
    }
}
loadOperationalTuning();

function fetchAgendaAuto() {
    if (agendaAutoLoading || agendaAutoCache !== null) return;
    try {
        const g = window.ECONOMIC_CALENDAR_DATA;
        const items = g && Array.isArray(g.items) ? g.items : null;
        if (items) {
            agendaAutoCache = items;
            agendaAutoLoading = false;
            return;
        }
    } catch {
    }
    agendaAutoLoading = true;
    fetch(`assets/data/economic_calendar.json?ts=${Date.now()}`)
        .then(r => (r && r.ok ? r.json() : null))
        .then(j => {
            const items = j && Array.isArray(j.items) ? j.items : [];
            agendaAutoCache = items;
        })
        .catch(() => {
            agendaAutoCache = [];
        })
        .finally(() => {
            agendaAutoLoading = false;
            renderAgendaMatrix();
        });
}

function agendaCountryFromCurrency(currency) {
    const c = String(currency || '').toUpperCase().trim();
    if (c === 'BRL') return 'BR';
    if (c === 'USD') return 'EUA';
    if (c === 'CNY' || c === 'CNH' || c === 'HKD') return 'CHINA/HK';
    return c ? 'OUTRO' : 'â€”';
}

function agendaCountryLabel(country) {
    const c = String(country || '').toUpperCase().trim();
    if (c === 'BR') return 'BR';
    if (c === 'EUA') return 'EUA';
    if (c === 'CHINA/HK' || c === 'CHN' || c === 'CN') return 'CHINA/HK';
    if (c === 'OUTRO') return 'OUTRO';
    return 'â€”';
}

function agendaLoadPrefs() {
    try {
        const view = String(localStorage.getItem('mercado_agenda_view') || 'agenda');
        const filter = String(localStorage.getItem('mercado_agenda_filter') || 'TODOS');
        const impact = String(localStorage.getItem('mercado_agenda_impact') || 'ALTO+MÃ‰DIO');
        return { view, filter, impact };
    } catch {
        return { view: 'agenda', filter: 'TODOS', impact: 'ALTO+MÃ‰DIO' };
    }
}

function agendaSavePrefs(next) {
    try {
        if (next && typeof next.view === 'string') localStorage.setItem('mercado_agenda_view', next.view);
        if (next && typeof next.filter === 'string') localStorage.setItem('mercado_agenda_filter', next.filter);
        if (next && typeof next.impact === 'string') localStorage.setItem('mercado_agenda_impact', next.impact);
    } catch {
    }
}

function agendaTabsHtml(current) {
    const cur = String(current || 'agenda');
    const tabs = [
        { k: 'agenda', label: 'AGENDA' },
        { k: 'br', label: 'BRASIL' },
        { k: 'us', label: 'EUA' },
        { k: 'cn', label: 'CHINA/HK' },
    ];
    const chip = t => {
        const active = cur === t.k;
        return `<button type="button" data-agenda-view="${escapeHtml(t.k)}" style="background:${active ? '#1b1b1b' : '#141414'};color:#e0e0e0;border:1px solid ${active ? 'rgba(255,255,255,.28)' : '#333'};padding:8px 12px;border-radius:999px;font-weight:900;cursor:pointer;letter-spacing:1px;">${escapeHtml(t.label)}</button>`;
    };
    return `<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:12px;">${tabs.map(chip).join('')}</div>`;
}

function renderAgendaMatrix() {
    const el = document.getElementById('agendaMatrix');
    if (!el) return;

    const mod = (typeof window !== 'undefined' && window.MercadoBlocks && window.MercadoBlocks.agendaMatrix)
        ? window.MercadoBlocks.agendaMatrix
        : null;
    if (mod && typeof mod.render === 'function') {
        try {
            mod.render({
                el,
                deps: {
                    escapeHtml,
                    fetchAgendaAuto,
                    agendaLoadPrefs,
                    agendaSavePrefs,
                    agendaTabsHtml,
                    agendaCountryFromCurrency,
                    agendaCountryLabel,
                    getAgendaAutoCache: () => agendaAutoCache,
                    isAgendaAutoLoading: () => agendaAutoLoading,
                },
            });
            return;
        } catch {
            el.innerHTML = fallbackCard('Agenda (macro)', 'Falha ao renderizar o mÃ³dulo.');
            return;
        }
    }

    el.innerHTML = fallbackCard('Agenda (macro)', 'MÃ³dulo indisponÃ­vel (nÃ£o carregado).');
}

function renderDataAudit(data) {
    const el = document.getElementById('dataAudit');
    if (!el) return;
    const mod = (typeof window !== 'undefined' && window.MercadoBlocks && window.MercadoBlocks.dataAudit) ? window.MercadoBlocks.dataAudit : null;
    if (mod && typeof mod.render === 'function') {
        try {
            mod.render({
                data,
                el,
                deps: {
                    ...buildCommonBlockDeps(),
                },
            });
            return;
        } catch {
            el.innerHTML = fallbackCard('Auditoria', 'Falha ao renderizar o mÃ³dulo.');
            return;
        }
    }
    el.innerHTML = fallbackCard('Auditoria', 'MÃ³dulo indisponÃ­vel (nÃ£o carregado).');
}

function renderAssetsCatalog(data) {
    const el = document.getElementById('assetsCatalog');
    if (!el) return;

    const isNum = v => typeof v === 'number' && Number.isFinite(v);
    const assets = Array.isArray(data && data.assets) ? data.assets : [];
    const series = data && data.series ? data.series : {};
    const generatedAt = data && data.meta && data.meta.generatedAt ? String(data.meta.generatedAt) : '';
    const portfolioStats = data && data.meta && data.meta.portfolioStats ? data.meta.portfolioStats : null;
    const catalog = (typeof window !== 'undefined' && window.InstrumentsCatalog) ? window.InstrumentsCatalog : null;
    const dcDeps = { findAliasSymbolBest, findAliasSymbol, findAssetSymbol, getLastPoint };
    const catDeps = { findAliasSymbolBest, findAliasSymbol, findAssetSymbol, dcDeps };

    const getBestPoint = sym => getMostRecentPointWithPrice(data, sym);
    const getAnyPoint = sym => {
        const xs = Array.isArray(series[sym]) ? series[sym] : [];
        return xs.length ? xs[xs.length - 1] : null;
    };

    const categories = Array.from(new Set(assets.map(a => String(a && a.category ? a.category : '')).filter(Boolean))).sort((a, b) =>
        a.localeCompare(b, 'pt-BR'),
    );

    const rowsAll = assets
        .map(a => {
            const symbol = String(a && a.symbol ? a.symbol : '');
            const name = String(a && a.name ? a.name : '');
            const category = String(a && a.category ? a.category : '');
            const exchange = a && a.exchange ? String(a.exchange) : '';
            const tags = Array.isArray(a && a.tags) ? a.tags.map(x => String(x)) : [];
            const xs = Array.isArray(series[symbol]) ? series[symbol] : [];
            const best = getBestPoint(symbol);
            const any = getAnyPoint(symbol);
            const lastT = best && best.t ? best.t : any && any.t ? any.t : null;
            const lastPrice = best && isNum(best.price) ? best.price : null;
            const lastChangePct = pointPct(best);
            const lastExtChangePct = best && isNum(best.extendedChangePct) ? best.extendedChangePct : null;
            return {
                symbol,
                name,
                category,
                exchange,
                tags,
                points: xs.length,
                lastT,
                lastPrice,
                lastChangePct,
                lastExtChangePct,
                hasSeries: xs.length > 0,
                hasPrice: lastPrice !== null,
            };
        })
        .sort((a, b) => a.symbol.localeCompare(b.symbol, 'en'));

    const counts = {
        assets: rowsAll.length,
        withSeries: rowsAll.filter(r => r.hasSeries).length,
        withPrice: rowsAll.filter(r => r.hasPrice).length,
        noSeries: rowsAll.filter(r => !r.hasSeries).length,
        noPrice: rowsAll.filter(r => r.hasSeries && !r.hasPrice).length,
    };

    const ratesCreditSummary = (() => {
        if (!catalog) return { baseResolved: [], extras: [], extrasSymbols: [] };
        const defs = typeof catalog.listRatesCredit === 'function' ? catalog.listRatesCredit() : [];
        const baseResolved = typeof catalog.buildResolved === 'function'
            ? defs.map(def => catalog.buildResolved(catDeps, data, def)).filter(Boolean)
            : [];
        const baseSymbols = new Set(baseResolved.map(x => String(x && x.symbol ? x.symbol : '')).filter(Boolean));
        const discovered = typeof catalog.discoverRatesCredit === 'function'
            ? catalog.discoverRatesCredit(data, { max: 80 })
            : [];
        const extras = (discovered || []).filter(x => x && x.symbol && !baseSymbols.has(String(x.symbol)));
        const extrasSymbols = extras.map(x => String(x.symbol));
        return { baseResolved, extras, extrasSymbols };
    })();

    const mkCategoryCounts = () => {
        const map = new Map();
        for (const r of rowsAll) {
            const k = r.category || '—';
            map.set(k, (map.get(k) || 0) + 1);
        }
        return Array.from(map.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 12)
            .map(([k, v]) => badge('neutral', `${k}: ${v}`))
            .join(' ');
    };

    const storageKey = 'edi_market_assets_catalog_v1';
    const prev = (() => {
        try {
            mod.render({
                data,
                el,
                deps: {
                    ...buildCommonBlockDeps(),
                    badge,
                    computeOperationalPulseNow: (typeof computeOperationalPulseNow === 'function') ? computeOperationalPulseNow : null,
                    computeHk50PulseNow: (typeof computeHk50PulseNow === 'function') ? computeHk50PulseNow : null,
                    assetAliasMatchers: (typeof assetAliasMatchers === 'function') ? assetAliasMatchers : null,
                },
            });
            return;
        } catch {
            el.innerHTML = fallbackCard('CatÃ¡logo', 'Falha ao renderizar o mÃ³dulo.');
            return;
        }
    }
    el.innerHTML = fallbackCard('CatÃ¡logo', 'MÃ³dulo indisponÃ­vel (nÃ£o carregado).');
}

function renderSectorHeatmap(data) {
    const el = document.getElementById('sectorHeatmap');
    if (!el) return;
    const mod = (typeof window !== 'undefined' && window.MercadoBlocks && window.MercadoBlocks.sectorHeatmap) ? window.MercadoBlocks.sectorHeatmap : null;
    if (mod && typeof mod.render === 'function') {
        try {
            mod.render({
                data,
                el,
                deps: {
                    ...buildCommonBlockDeps(),
                    toneFromValue,
                },
            });
            return;
        } catch {
            el.innerHTML = fallbackCard('Heatmap', 'Falha ao renderizar o mÃ³dulo.');
            return;
        }
    }
    el.innerHTML = fallbackCard('Heatmap', 'MÃ³dulo indisponÃ­vel (nÃ£o carregado).');
}

function renderIntel(data) {
    const sr = (typeof window !== 'undefined' && window.MercadoUtils && typeof window.MercadoUtils.safeRender === 'function')
        ? window.MercadoUtils.safeRender
        : null;
    const safe = (id, label, fn) => {
        const fixedLabel = fixLegacyText(label);
        if (sr) return sr({ id, label: fixedLabel, fn });
        try { fn(); } catch { }
        return { ok: true };
    };

    safe('regimeConviction', 'INTEL â€” Regime & ConvicÃ§Ã£o', () => renderRegimeConviction(data));
    safe('chinaBrazil', 'INTEL â€” China/Brasil', () => renderChinaBrazil(data));
    safe('metalsZone', 'INTEL â€” Zona de Metais', () => renderMetalsZone(data));
    safe('carryIntel', 'INTEL â€” Carry/Curva', () => renderCarryIntel(data));

    safe('ratesBuckets', 'Rates Buckets', () => renderRatesBuckets(data));
    safe('brazilFixedIncomeFlow', 'Fluxo â€” Renda Fixa BR', () => renderBrazilFixedIncomeFlow(data));
    safe('agendaMatrix', 'Agenda (macro)', () => renderAgendaMatrix());
    safe('dataAudit', 'Auditoria de Dados', () => renderDataAudit(data));
    safe('assetsCatalog', 'CatÃ¡logo de Ativos', () => renderAssetsCatalog(data));
    safe('sectorHeatmap', 'Heatmap de Setores', () => renderSectorHeatmap(data));
}

function setMetric(id, text) {
    const mod = (typeof window !== 'undefined' && window.MercadoBlocks && window.MercadoBlocks.statusUi)
        ? window.MercadoBlocks.statusUi
        : null;
    if (mod && typeof mod.setMetric === 'function') {
        try { mod.setMetric(id, fixLegacyText(text)); } catch { }
    }
}

function escapeHtml(s) {
    const mod = (typeof window !== 'undefined' && window.MercadoBlocks && window.MercadoBlocks.statusUi)
        ? window.MercadoBlocks.statusUi
        : null;
    if (mod && typeof mod.escapeHtml === 'function') {
        try { return mod.escapeHtml(fixLegacyText(s)); } catch { return ''; }
    }
    return '';
}

function wrapLabel(text, maxCharsPerLine = 14, maxLines = 2) {
    const mod = (typeof window !== 'undefined' && window.MercadoBlocks && window.MercadoBlocks.statusUi)
        ? window.MercadoBlocks.statusUi
        : null;
    if (mod && typeof mod.wrapLabel === 'function') {
        try { return mod.wrapLabel(fixLegacyText(text), maxCharsPerLine, maxLines); } catch { return ['\u2014']; }
    }
    return ['\u2014'];
}

function setMetricMultiline(id, text) {
    const mod = (typeof window !== 'undefined' && window.MercadoBlocks && window.MercadoBlocks.statusUi)
        ? window.MercadoBlocks.statusUi
        : null;
    if (mod && typeof mod.setMetricMultiline === 'function') {
        try { mod.setMetricMultiline(id, fixLegacyText(text)); } catch { }
    }
}

function setDataStatus(text, tone = 'neutral') {
    const mod = (typeof window !== 'undefined' && window.MercadoBlocks && window.MercadoBlocks.statusUi)
        ? window.MercadoBlocks.statusUi
        : null;
    if (mod && typeof mod.setDataStatus === 'function') {
        try { mod.setDataStatus(fixLegacyText(text), tone); } catch { }
    }
}

function setHtml(id, html) {
    const mod = (typeof window !== 'undefined' && window.MercadoBlocks && window.MercadoBlocks.statusUi)
        ? window.MercadoBlocks.statusUi
        : null;
    if (mod && typeof mod.setHtml === 'function') {
        try { mod.setHtml(id, fixLegacyText(html)); } catch { }
    }
}

function getMarketServiceBaseUrl() {
    const mod = (typeof window !== 'undefined' && window.MercadoBlocks && window.MercadoBlocks.marketService)
        ? window.MercadoBlocks.marketService
        : null;
    if (mod && typeof mod.getMarketServiceBaseUrl === 'function') {
        try { return mod.getMarketServiceBaseUrl(); } catch { return 'http://127.0.0.1:3033'; }
    }
    return 'http://127.0.0.1:3033';
}

async function ensureMarketServiceOnline(force = false) {
    const mod = (typeof window !== 'undefined' && window.MercadoBlocks && window.MercadoBlocks.marketService)
        ? window.MercadoBlocks.marketService
        : null;
    if (mod && typeof mod.ensureMarketServiceOnline === 'function') {
        try { return await mod.ensureMarketServiceOnline(force); } catch { return false; }
    }
    return false;
}

async function fetchJsonWithTimeout(url, timeoutMs = 3500) {
    const mod = (typeof window !== 'undefined' && window.MercadoBlocks && window.MercadoBlocks.marketService)
        ? window.MercadoBlocks.marketService
        : null;
    if (mod && typeof mod.fetchJsonWithTimeout === 'function') {
        return await mod.fetchJsonWithTimeout(url, timeoutMs);
    }
    throw new Error('fetchJsonWithTimeout_unavailable');
}

function formatDateTimeLoose(val) {
    const fmt = formatDateTime(val);
    return fmt ? fmt : (val ? String(val) : '');
}

function toneFromRegimeText(regime) {
    const r = String(regime || '');
    if (!r) return 'neutral';
    if (/negativo/i.test(r)) return 'negative';
    if (/positivo/i.test(r)) return 'positive';
    return 'neutral';
}

function renderOptionsGammaSummary(payload) {
    const mod = (typeof window !== 'undefined' && window.MercadoBlocks && window.MercadoBlocks.optionsGammaSummary)
        ? window.MercadoBlocks.optionsGammaSummary
        : null;

    operationalInputs.optionsGamma = payload || null;
    try { renderOperationalBriefing(); } catch { }
    try { renderBtcOperationalBriefing(); } catch { }
    try { renderHk50OperationalBriefing(); } catch { }
    try { renderUsEquitiesOperationalBriefing(); } catch { }
    try { renderCommoditiesOperationalBriefing(); } catch { }

    const el = document.getElementById('optionsGammaSummary');
    if (!el) return;

    if (mod && typeof mod.render === 'function') {
        try {
            mod.render({
                data: payload,
                el,
                deps: {
                    toneFromRegimeText,
                    ...buildCommonBlockDeps(),
                },
            });
            return;
        } catch {
            el.innerHTML = fallbackCard('Gamma (OpÃ§Ãµes)', 'Falha ao renderizar o mÃ³dulo.');
            return;
        }
    }

    el.innerHTML = fallbackCard('Gamma (OpÃ§Ãµes)', 'MÃ³dulo indisponÃ­vel (nÃ£o carregado).');
}

async function loadOptionsGammaSummary() {
    const baseUrl = getMarketServiceBaseUrl();
    try {
        const local = (() => {
            try {
                return window.OPTIONS_GAMMA_SUMMARY_DATA || null;
            } catch {
                return null;
            }
        })();
        if (local) {
            renderOptionsGammaSummary(local);
            return true;
        }
        try {
            const fromFile = await fetchJsonWithTimeout(`assets/data/options_gamma_summary.json?ts=${Date.now()}`, 1200);
            if (fromFile) {
                renderOptionsGammaSummary(fromFile);
                return true;
            }
        } catch {
        }

        const fromUnifiedDashboard = await (async () => {
            const normalize = raw => {
                const overview = raw && raw.overview ? raw.overview : null;
                const key = raw && raw.key_levels ? raw.key_levels : null;
                const overviewSpot = overview && typeof overview.spot_price === 'number' ? overview.spot_price : null;
                const topSpot = raw && typeof raw.spot_price === 'number' ? raw.spot_price : null;
                const flip =
                    key && typeof key.gamma_flip_selected === 'number'
                        ? key.gamma_flip_selected
                        : key && typeof key.gamma_flip === 'number'
                            ? key.gamma_flip
                            : key && typeof key.gamma_flip_hvl === 'number'
                                ? key.gamma_flip_hvl
                                : key && typeof key.gamma_flip_hvl_gaussian === 'number'
                                    ? key.gamma_flip_hvl_gaussian
                                    : null;
                return {
                    updatedAt: (overview && overview.last_update) || raw.last_updated || null,
                    spot: overviewSpot ?? topSpot,
                    regime: (overview && overview.regime) || null,
                    keyLevels: {
                        gammaFlip: flip,
                        gammaFlipModel: key && typeof key.gamma_flip_model === 'string' ? key.gamma_flip_model : null,
                        callWall: key && typeof key.call_wall === 'number' ? key.call_wall : null,
                        putWall: key && typeof key.put_wall === 'number' ? key.put_wall : null,
                        effectiveCallWall: key && typeof key.effective_call_wall === 'number' ? key.effective_call_wall : null,
                        effectivePutWall: key && typeof key.effective_put_wall === 'number' ? key.effective_put_wall : null,
                        maxPain: key && typeof key.max_pain === 'number' ? key.max_pain : null,
                        rangeLow: key && typeof key.range_low === 'number' ? key.range_low : null,
                        rangeHigh: key && typeof key.range_high === 'number' ? key.range_high : null,
                    },
                };
            };

            const tryOneBase = async base => {
                const pick = async symbol => {
                    const dataUrl = new URL(`${symbol}/assets/data/market_data.json?ts=${Date.now()}`, base).toString();
                    const raw = await fetchJsonWithTimeout(dataUrl, 450);
                    const dashUrl = new URL(`${symbol}/index.html`, base).toString();
                    const mapped = normalize(raw || {});
                    return {
                        symbol,
                        ...mapped,
                        links: { dashboard: dashUrl, data: dataUrl.split('?ts=')[0] || dataUrl },
                    };
                };

                const out = { ok: true, generatedAt: new Date().toISOString(), source: { kind: 'dashboard_unificado', base }, items: {} };
                try {
                    const wdo = await pick('WDO');
                    out.items.WDO = wdo;
                } catch {
                }
                try {
                    const win = await pick('WIN');
                    out.items.WIN = win;
                } catch {
                }
                return Object.keys(out.items).length ? out : null;
            };

            try {
                const here = new URL('./', location.href);
                const candidates = [
                    new URL(`../../../dashboard_unificado/`, here).toString(),
                    new URL(`../../../../dashboard_unificado/`, here).toString(),
                    new URL(`../../../B3_System/dashboard_unificado/`, here).toString(),
                    new URL(`../../../../B3_System/dashboard_unificado/`, here).toString(),
                ];

                for (const b of candidates) {
                    try {
                        const payload = await tryOneBase(b);
                        if (payload) return payload;
                    } catch {
                    }
                }
            } catch {
            }

            return null;
        })();
        if (fromUnifiedDashboard) {
            renderOptionsGammaSummary(fromUnifiedDashboard);
            return true;
        }

        const online = await ensureMarketServiceOnline();
        if (!online) throw new Error('market_service_offline');
        const payload = await fetchJsonWithTimeout(`${baseUrl}/api/options/summary?t=${Date.now()}`, 2500);
        renderOptionsGammaSummary(payload);
        return true;
    } catch {
        renderOptionsGammaSummary({
            ok: false,
            message: 'IndisponÃ­vel â€¢ Sem pacote local, sem leitura do dashboard_unificado e sem serviÃ§o HTTP.',
        });
        return false;
    }
}

function renderFinancialJuice(payload) {
    const elId = 'newsFinancialJuice';
    const el = document.getElementById(elId);
    const mod = (typeof window !== 'undefined' && window.MercadoBlocks && window.MercadoBlocks.financialJuice)
        ? window.MercadoBlocks.financialJuice
        : null;
    if (!el) return;

    if (mod && typeof mod.render === 'function') {
        try {
            mod.render({
                data: payload,
                el,
                deps: {
                    ...buildCommonBlockDeps(),
                },
            });
            return;
        } catch {
            el.innerHTML = fallbackCard('FinancialJuice', 'Falha ao renderizar o mÃ³dulo.');
            return;
        }
    }

    el.innerHTML = fallbackCard('FinancialJuice', 'MÃ³dulo indisponÃ­vel (nÃ£o carregado).');
}

async function loadFinancialJuice() {
    const baseUrl = getMarketServiceBaseUrl();
    try {
        const online = await ensureMarketServiceOnline();
        if (!online) throw new Error('market_service_offline');
        const payload = await fetchJsonWithTimeout(`${baseUrl}/api/news/financialjuice/headlines?limit=40&t=${Date.now()}`, 4500);
        renderFinancialJuice(payload);
        return true;
    } catch {
        renderFinancialJuice(null);
        return false;
    }
}

function renderWebNewsModule(payload) {
    const elId = 'newsWebModule';
    const el = document.getElementById(elId);
    const mod = (typeof window !== 'undefined' && window.MercadoBlocks && window.MercadoBlocks.webNewsModule)
        ? window.MercadoBlocks.webNewsModule
        : null;

    const ok = payload && payload.ok === true;
    const message = payload && payload.message ? String(payload.message) : '';
    const items = ok && Array.isArray(payload.items) ? payload.items : null;
    const summary = ok && payload.summary ? payload.summary : null;
    const sources = ok && Array.isArray(payload.sources) ? payload.sources : [];
    const windowHours = ok && typeof payload.windowHours === 'number' ? payload.windowHours : null;
    const generatedAt = ok && payload.generatedAt ? String(payload.generatedAt) : '';

    const badge = (tone, text, strength) => pillHtml('signal', tone, text, strength);

    if (!ok) {
        setHtml(elId, `
            <div style="padding:12px;opacity:.90;">
                ${escapeHtml(message || 'Web News Module indisponível.')}
            </div>
        `);
        return;
    }

    if (!el) return;

    if (mod && typeof mod.render === 'function') {
        try {
            mod.render({
                data: payload,
                el,
                deps: {
                    ...buildCommonBlockDeps(),
                },
            });
            return;
        } catch {
            el.innerHTML = fallbackCard('Web News Module', 'Falha ao renderizar o mÃ³dulo.');
            return;
        }
    }

    el.innerHTML = fallbackCard('Web News Module', 'MÃ³dulo indisponÃ­vel (nÃ£o carregado).');
}

async function loadWebNewsModule() {
    const baseUrl = getMarketServiceBaseUrl();
    try {
        const local = (() => {
            try {
                return window.WEB_NEWS_MODULE_DATA || null;
            } catch {
                return null;
            }
        })();
        if (local) {
            renderWebNewsModule(local);
            return true;
        }
        try {
            const fromFile = await fetchJsonWithTimeout(`assets/data/web_news_module.json?ts=${Date.now()}`, 1600);
            if (fromFile) {
                renderWebNewsModule(fromFile);
                return true;
            }
        } catch {
        }

        const online = await ensureMarketServiceOnline();
        if (!online) throw new Error('market_service_offline');
        const payload = await fetchJsonWithTimeout(`${baseUrl}/api/news/web/module?limit=40&t=${Date.now()}`, 5500);
        renderWebNewsModule(payload);
        return true;
    } catch {
        renderWebNewsModule({
            ok: false,
            message: 'Web News Module indisponÃ­vel â€¢ Sem pacote local (assets/data/web_news_module.json) e sem serviÃ§o HTTP.',
        });
        return false;
    }
}

async function loadForeignFlow() {
    try {
        const local = (() => {
            try {
                return window.FOREIGN_FLOW_DATA || null;
            } catch {
                return null;
            }
        })();
        if (local) {
            operationalInputs.foreignFlow = local;
            try {
                renderOperationalBriefing();
            } catch {
            }
            try {
                renderBtcOperationalBriefing();
            } catch {
            }
            try {
                renderHk50OperationalBriefing();
            } catch {
            }
            return true;
        }
    } catch {
    }

    try {
        await loadScriptFresh('assets/data/foreign_flow.js');
        const local = (() => {
            try {
                return window.FOREIGN_FLOW_DATA || null;
            } catch {
                return null;
            }
        })();
        if (local) {
            operationalInputs.foreignFlow = local;
            try {
                renderOperationalBriefing();
            } catch {
            }
            try {
                renderBtcOperationalBriefing();
            } catch {
            }
            try {
                renderHk50OperationalBriefing();
            } catch {
            }
            return true;
        }
    } catch {
    }

    try {
        const fromFile = await fetchJsonWithTimeout(`assets/data/foreign_flow.json?ts=${Date.now()}`, 1600);
        if (fromFile) {
            operationalInputs.foreignFlow = fromFile;
            try {
                renderOperationalBriefing();
            } catch {
            }
            try {
                renderBtcOperationalBriefing();
            } catch {
            }
            try {
                renderHk50OperationalBriefing();
            } catch {
            }
            return true;
        }
    } catch {
    }

    operationalInputs.foreignFlow = { ok: false, message: 'Fluxo estrangeiro indisponÃ­vel (assets/data/foreign_flow.json/js)' };
    try {
        renderOperationalBriefing();
    } catch {
    }
    try {
        renderBtcOperationalBriefing();
    } catch {
    }
    try {
        renderHk50OperationalBriefing();
    } catch {
    }
    return false;
}

async function loadFocusSummary() {
    try {
        const local = (() => {
            try {
                return window.FOCUS_SUMMARY_DATA || null;
            } catch {
                return null;
            }
        })();
        if (local) {
            operationalInputs.focusSummary = local;
            try { renderOperationalBriefing(); } catch { }
            try { renderBtcOperationalBriefing(); } catch { }
            try { renderHk50OperationalBriefing(); } catch { }
            return true;
        }
    } catch {
    }

    try {
        await loadScriptFresh('assets/data/focus_summary.js');
        const local = (() => {
            try {
                return window.FOCUS_SUMMARY_DATA || null;
            } catch {
                return null;
            }
        })();
        if (local) {
            operationalInputs.focusSummary = local;
            try { renderOperationalBriefing(); } catch { }
            try { renderBtcOperationalBriefing(); } catch { }
            try { renderHk50OperationalBriefing(); } catch { }
            return true;
        }
    } catch {
    }

    try {
        const fromFile = await fetchJsonWithTimeout(`assets/data/focus_summary.json?ts=${Date.now()}`, 1600);
        if (fromFile) {
            operationalInputs.focusSummary = fromFile;
            try { renderOperationalBriefing(); } catch { }
            try { renderBtcOperationalBriefing(); } catch { }
            try { renderHk50OperationalBriefing(); } catch { }
            return true;
        }
    } catch {
    }

    operationalInputs.focusSummary = { ok: false, message: 'Boletim Focus indisponÃ­vel (assets/data/focus_summary.json/js)' };
    try { renderOperationalBriefing(); } catch { }
    try { renderBtcOperationalBriefing(); } catch { }
    try { renderHk50OperationalBriefing(); } catch { }
    return false;
}

function renderZqCurveBriefing() {
    const el = document.getElementById('zqCurveBriefing');
    if (!el) return;

    const mod = (typeof window !== 'undefined' && window.MercadoBlocks && window.MercadoBlocks.zqCurve)
        ? window.MercadoBlocks.zqCurve
        : null;
    if (mod && typeof mod.render === 'function') {
        try {
            mod.render({
                el,
                deps: {
                    ...buildCommonBlockDeps(),
                },
            });
            return;
        } catch {
            el.innerHTML = fallbackCard('Curva ZQ', 'Falha ao renderizar o mÃ³dulo.');
            return;
        }
    })();

    const badge = (tone, text, strength) => pillHtml('signal', tone, text, strength);

    if (!data || !Array.isArray(data.items) || !data.items.length) {
        el.innerHTML = `
            <div style="padding:12px;border:1px solid rgba(255,255,255,.12);border-radius:14px;background:rgba(0,0,0,.18);opacity:.88;">
                Curva ZQ indisponível (zq_curve.js/json).
            </div>
        `;
        return;
    }

    const items = data.items.slice(0, 36);
    const count = typeof data.contractCount === 'number' && Number.isFinite(data.contractCount) ? data.contractCount : data.items.length;
    const slope = typeof data.slopePct === 'number' && Number.isFinite(data.slopePct) ? data.slopePct : null;
    const risk = String(data.riskMode || 'N/D');
    const tone = risk === 'RISK_OFF' ? 'risk_off' : risk === 'RISK_ON' ? 'risk_on' : 'neutral';
    const strength = slope === null ? 0.65 : Math.max(0.40, Math.min(1, Math.abs(slope) / 0.15));

    const first = data.items[0] || null;
    const last = data.items[data.items.length - 1] || null;
    const headLine = (() => {
        const a = first && typeof first.impliedRatePct === 'number' ? first.impliedRatePct : null;
        const b = last && typeof last.impliedRatePct === 'number' ? last.impliedRatePct : null;
        const lo = a !== null ? `${formatNumber(a, 3)}%` : '—';
        const hi = b !== null ? `${formatNumber(b, 3)}%` : '—';
        const sl = slope !== null ? `${formatNumber(slope, 2)}%` : '—';
        return `Curva: curto ${lo} → longo ${hi} • slope ${sl}`;
    })();

    const rowsHtml = items.map(it => {
        const vertex = it && it.vertex ? String(it.vertex) : '—';
        const exp = it && it.expirationFmt ? String(it.expirationFmt) : '—';
        const px = it && typeof it.lastPrice === 'number' ? formatNumber(it.lastPrice, 4) : '—';
        const rate = it && typeof it.impliedRatePct === 'number' ? `${formatNumber(it.impliedRatePct, 3)}%` : '—';
        const dayPct = it && typeof it.dayChangePct === 'number' && Number.isFinite(it.dayChangePct) ? formatPercent(it.dayChangePct, 2) : '—';
        return `
            <tr>
                <td style="padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.06);font-family:'Share Tech Mono',monospace;font-weight:900;">${escapeHtml(vertex)}</td>
                <td style="padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.06);opacity:.92;">${escapeHtml(exp)}</td>
                <td style="padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.06);text-align:right;font-family:'Share Tech Mono',monospace;">${escapeHtml(px)}</td>
                <td style="padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.06);text-align:right;font-family:'Share Tech Mono',monospace;font-weight:900;">${escapeHtml(rate)}</td>
                <td style="padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.06);text-align:right;font-family:'Share Tech Mono',monospace;">${escapeHtml(dayPct)}</td>
            </tr>
        `;
    }).join('');

    el.innerHTML = `
        <div style="padding:12px;border:1px solid rgba(255,255,255,.12);border-radius:14px;background:rgba(0,0,0,.18);">
            <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
                <div style="font-weight:900;letter-spacing:1px;">Curva Fed Funds (ZQ)</div>
                <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
                    ${badge(tone, `Regime: ${risk}`, strength)}
                    ${badge('neutral', `Contratos: ${String(count)}`, 0.55)}
                </div>
            </div>
            <div style="margin-top:8px;opacity:.86;font-size:12px;line-height:1.35;">
                ${escapeHtml(headLine)}
            </div>
            <div style="margin-top:10px;border-top:1px solid rgba(255,255,255,.10);padding-top:10px;">
                <table style="width:100%;border-collapse:collapse;">
                    <thead>
                        <tr>
                            <th style="text-align:left;padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.12);opacity:.85;">Vértice</th>
                            <th style="text-align:left;padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.12);opacity:.85;">Venc.</th>
                            <th style="text-align:right;padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.12);opacity:.85;">Preço</th>
                            <th style="text-align:right;padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.12);opacity:.85;">Juro Implícito</th>
                            <th style="text-align:right;padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.12);opacity:.85;">Δ% dia</th>
                        </tr>
                    </thead>
                    <tbody>${rowsHtml}</tbody>
                </table>
            </div>
            <div style="margin-top:10px;opacity:.72;font-size:12px;">
                Fórmula: <span style="font-family:'Share Tech Mono',monospace;">100 - preço</span> • Atualizado em ${escapeHtml(formatDateTime(data.generatedAt || ''))}
            </div>
        </div>
    `;
}

function renderUsTreasuryFuturesBriefing() {
    const el = document.getElementById('usTreasuryFuturesBriefing');
    if (!el) return;

    const mod = (typeof window !== 'undefined' && window.MercadoBlocks && window.MercadoBlocks.usTreasuryFutures)
        ? window.MercadoBlocks.usTreasuryFutures
        : null;
    if (mod && typeof mod.render === 'function') {
        try {
            mod.render({
                el,
                deps: {
                    ...buildCommonBlockDeps(),
                    loadScriptFresh,
                    fetchJsonWithTimeout,
                },
            });
            return;
        } catch {
            el.innerHTML = fallbackCard('Treasuries (futuros)', 'Falha ao renderizar o mÃ³dulo.');
            return;
        }
    })();

    const badge = (tone, text, strength) => pillHtml('signal', tone, text, strength);

    if (!data) {
        el.innerHTML = `
            <div style="padding:12px;border:1px solid rgba(255,255,255,.12);border-radius:14px;background:rgba(0,0,0,.18);opacity:.88;">
                Carregando Treasuries (futuros)…
            </div>
        `;
        try {
            if (!window.__usTsyFuturesLoadStarted) {
                window.__usTsyFuturesLoadStarted = true;
                loadScriptFresh('assets/data/us_tsy_futures.js')
                    .then(() => {
                        try { renderUsTreasuryFuturesBriefing(); } catch { }
                    })
                    .catch(() => {
                        fetchJsonWithTimeout(`assets/data/us_tsy_futures.json?ts=${Date.now()}`, 1600)
                            .then((payload) => {
                                try { window.US_TSY_FUTURES_DATA = payload; } catch { }
                                try { renderUsTreasuryFuturesBriefing(); } catch { }
                            })
                            .catch(() => {
                                try { window.US_TSY_FUTURES_DATA = null; } catch { }
                                try {
                                    el.innerHTML = `
                                        <div style="padding:12px;border:1px solid rgba(255,255,255,.12);border-radius:14px;background:rgba(0,0,0,.18);opacity:.88;">
                                            Treasuries (futuros) indisponível (us_tsy_futures.json).
                                        </div>
                                    `;
                                } catch { }
                            });
                    });
            }
        } catch { }
        return;
    }

    const itemsAll = Array.isArray(data.items) ? data.items : [];
    const items = itemsAll.slice(0, 20);
    const extras = Array.isArray(data.extras) ? data.extras.slice(0, 24) : [];
    const credit = data && data.creditVsTreasury ? data.creditVsTreasury : null;
    if (!items.length && !extras.length) {
        el.innerHTML = `
            <div style="padding:12px;border:1px solid rgba(255,255,255,.12);border-radius:14px;background:rgba(0,0,0,.18);opacity:.88;">
                Treasuries (futuros) indisponível (us_tsy_futures).
            </div>
        `;
        return;
    }
    const risk = String(data.riskMode || 'N/D');
    const shape = String(data.shape || 'N/D');
    const avg = typeof data.avgChangePct === 'number' && Number.isFinite(data.avgChangePct) ? data.avgChangePct : null;
    const slope = typeof data.slopeChangePct === 'number' && Number.isFinite(data.slopeChangePct) ? data.slopeChangePct : null;
    const riskTone = risk === 'RISK_OFF' ? 'risk_off' : risk === 'RISK_ON' ? 'risk_on' : 'neutral';
    const riskStrength = slope === null ? 0.65 : Math.max(0.40, Math.min(1, Math.abs(slope) / 0.6));

    const headLine = (() => {
        const a = avg !== null ? formatPercent(avg, 2) : '—';
        const s = slope !== null ? formatPercent(slope, 2) : '—';
        return `Movimento médio (dia): ${a} • Inclinação (30Y−2Y, Δ%): ${s} • Shape: ${shape}`;
    })();

    const rowsHtml = items.map(it => {
        const tenor = it && it.tenor ? String(it.tenor) : '—';
        const vertex = it && it.vertex ? String(it.vertex) : '—';
        const exp = it && it.expirationFmt ? String(it.expirationFmt) : '—';
        const px = it && typeof it.lastPrice === 'number' ? formatNumber(it.lastPrice, 4) : '—';
        const dayPct = it && typeof it.dayChangePct === 'number' && Number.isFinite(it.dayChangePct) ? formatPercent(it.dayChangePct, 2) : '—';
        return `
            <tr>
                <td style="padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.06);font-family:'Share Tech Mono',monospace;font-weight:900;">${escapeHtml(tenor)}</td>
                <td style="padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.06);font-family:'Share Tech Mono',monospace;">${escapeHtml(vertex)}</td>
                <td style="padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.06);opacity:.92;">${escapeHtml(exp)}</td>
                <td style="padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.06);text-align:right;font-family:'Share Tech Mono',monospace;">${escapeHtml(px)}</td>
                <td style="padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.06);text-align:right;font-family:'Share Tech Mono',monospace;">${escapeHtml(dayPct)}</td>
            </tr>
        `;
    }).join('');

    const futuresHtml = items.length ? `
        <div style="margin-top:10px;border-top:1px solid rgba(255,255,255,.10);padding-top:10px;">
            <table style="width:100%;border-collapse:collapse;">
                <thead>
                    <tr>
                        <th style="text-align:left;padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.12);opacity:.85;">Tenor</th>
                        <th style="text-align:left;padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.12);opacity:.85;">Contrato</th>
                        <th style="text-align:left;padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.12);opacity:.85;">Venc.</th>
                        <th style="text-align:right;padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.12);opacity:.85;">Preço</th>
                        <th style="text-align:right;padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.12);opacity:.85;">Δ% dia</th>
                    </tr>
                </thead>
                <tbody>${rowsHtml}</tbody>
            </table>
        </div>
    ` : `
        <div style="margin-top:10px;border-top:1px solid rgba(255,255,255,.10);padding-top:10px;opacity:.78;font-size:12px;">
            Futuros indisponíveis no momento.
        </div>
    `;

    const extrasHtml = extras.length ? (() => {
        const rows = extras.map(it => {
            const label = it && it.label ? String(it.label) : (it && it.yahooSymbol ? String(it.yahooSymbol) : '—');
            const sym = it && it.yahooSymbol ? String(it.yahooSymbol) : '—';
            const px = it && typeof it.price === 'number' ? formatNumber(it.price, 4) : '—';
            const dayPct = it && typeof it.dayChangePct === 'number' && Number.isFinite(it.dayChangePct) ? formatPercent(it.dayChangePct, 2) : '—';
            const rangePct = it && typeof it.intradayRangePct === 'number' && Number.isFinite(it.intradayRangePct) ? formatPercent(it.intradayRangePct, 2) : '—';
            return `
                <tr>
                    <td style="padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.06);opacity:.95;">${escapeHtml(label)}</td>
                    <td style="padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.06);font-family:'Share Tech Mono',monospace;">${escapeHtml(sym)}</td>
                    <td style="padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.06);text-align:right;font-family:'Share Tech Mono',monospace;">${escapeHtml(px)}</td>
                    <td style="padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.06);text-align:right;font-family:'Share Tech Mono',monospace;">${escapeHtml(dayPct)}</td>
                    <td style="padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.06);text-align:right;font-family:'Share Tech Mono',monospace;">${escapeHtml(rangePct)}</td>
                </tr>
            `;
        }).join('');
        return `
            <div style="margin-top:10px;border-top:1px solid rgba(255,255,255,.10);padding-top:10px;">
                <div style="opacity:.86;font-weight:900;letter-spacing:.6px;margin-bottom:6px;">Extras (Yahoo Quote)</div>
                <table style="width:100%;border-collapse:collapse;">
                    <thead>
                        <tr>
                            <th style="text-align:left;padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.12);opacity:.85;">Ativo</th>
                            <th style="text-align:left;padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.12);opacity:.85;">Ticker</th>
                            <th style="text-align:right;padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.12);opacity:.85;">Preço</th>
                            <th style="text-align:right;padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.12);opacity:.85;">Δ% dia</th>
                            <th style="text-align:right;padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.12);opacity:.85;">Range% intraday</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        `;
    })() : '';

    const creditHtml = credit && credit.ok ? (() => {
        const mode = String(credit.mode || 'N/D');
        const tone = mode === 'FLIGHT_TO_QUALITY' ? 'negative' : mode === 'RISK_ON' ? 'positive' : 'neutral';
        const avgSpread = typeof credit.avgSpreadScore === 'number' && Number.isFinite(credit.avgSpreadScore) ? credit.avgSpreadScore : null;
        const spreads = Array.isArray(credit.spreads) ? credit.spreads.slice(0, 8) : [];
        const line = avgSpread !== null ? `Média spreads (score): ${formatNumber(avgSpread, 3)}` : 'Média spreads (score): —';
        const pills = spreads.length
            ? spreads.map(s => {
                const k = s && s.key ? String(s.key) : '—';
                const v = s && typeof s.spreadScore === 'number' && Number.isFinite(s.spreadScore) ? s.spreadScore : null;
                const txt = v !== null ? `${k} ${formatNumber(v, 3)}` : `${k} —`;
                const pillTone = v !== null && v > 0.18 ? 'positive' : v !== null && v < -0.18 ? 'negative' : 'neutral';
                return badge(pillTone, txt);
            }).join('')
            : '';
        return `
            <div style="margin-top:10px;border-top:1px solid rgba(255,255,255,.10);padding-top:10px;">
                <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
                    <div style="opacity:.92;font-weight:900;letter-spacing:.6px;">Crédito vs Treasury (proxy)</div>
                    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
                        ${badge(tone, `Modo: ${mode}`)}
                    </div>
                </div>
                <div style="margin-top:8px;opacity:.86;font-size:12px;line-height:1.35;">
                    ${escapeHtml(line)}
                </div>
                ${pills ? `<div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap;">${pills}</div>` : ''}
                <div style="margin-top:8px;opacity:.72;font-size:12px;">
                    Interpretação: score > 0 sugere crédito mais forte que TLT (mais RISK ON). Score < 0 sugere TLT mais forte (flight-to-quality). Score combina Δ% + range intraday.
                </div>
            </div>
        `;
    })() : '';

    el.innerHTML = `
        <div style="padding:12px;border:1px solid rgba(255,255,255,.12);border-radius:14px;background:rgba(0,0,0,.18);">
            <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
                <div style="font-weight:900;letter-spacing:1px;">Treasuries (futuros)</div>
                <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
                    ${badge(riskTone, `Regime: ${risk}`, riskStrength)}
                    ${badge('neutral', `Contratos: ${String(items.length)}`, 0.55)}
                    ${extras.length ? badge('neutral', `Extras: ${String(extras.length)}`, 0.55) : ''}
                </div>
            </div>
            <div style="margin-top:8px;opacity:.86;font-size:12px;line-height:1.35;">
                ${escapeHtml(headLine)}
            </div>
            ${futuresHtml}
            ${creditHtml}
            ${extrasHtml}
            <div style="margin-top:10px;opacity:.72;font-size:12px;">
                Fonte: Yahoo (futuresChain + spark) • Atualizado em ${escapeHtml(formatDateTime(data.generatedAt || ''))}
            </div>
        </div>
    `;
}

function renderOperationalCompass(model) {
    try {
        const api = window.OperationalCompass;
        if (api && typeof api.render === 'function') return api.render(model);
    } catch { }
}

function buildOperationalCompassModel(input) {
    try {
        const api = window.OperationalCompass;
        if (api && typeof api.buildModel === 'function') return api.buildModel(input);
    } catch { }
    return null;
}


function buildOperationalBriefingDeps() {
    return {
        ...buildCommonBlockDeps(),
        operationalInputs,
        operationalTuning,
        fetchAgendaAuto,

        formatBrlCompact,

        computeFlowScore,
        computeBrazilCdsHedgeSignal,
        computeOperationalPulseNow,

        buildOperationalCompassModel,
        renderOperationalCompass,

        renderBtcOperationalBriefing,
        renderHk50OperationalBriefing,
        renderOperationalBriefing,

        isBrazilAdr,
    };
}

function renderOperationalBriefing() {
    const el = document.getElementById('operationalBriefing');
    if (!el) return;

    const data = getData();
    const assets = data && Array.isArray(data.assets) ? data.assets : [];
    const rawRegime = operationalInputs.regime;
    const rawOptions = operationalInputs.optionsGamma || null;
    const rawWeb = operationalInputs.webNews || null;
    const rawForeign = operationalInputs.foreignFlow || null;
    const rawFocus = operationalInputs.focusSummary || null;
 
    try { fetchAgendaAuto(); } catch { }

    const dc = (typeof window !== 'undefined' && window.DecisionCore) ? window.DecisionCore : null;
    const nowMs = Date.now();
    const mostRecentMs = (symbol) => {
        if (!data || !symbol) return -Infinity;
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
    const aliasSym = (k) => findAliasSymbolBest(data, k) || findAliasSymbol(data, k);
    const pickFreshestCandidate = (candidates) => {
        const list = Array.isArray(candidates) ? candidates : [];
        const syms = [];
        for (const c of list) {
            if (!c) continue;
            if (c.symbol) syms.push(String(c.symbol));
            else if (c.aliasKey) {
                const s = aliasSym(c.aliasKey);
                if (s) syms.push(String(s));
            } else if (c.matcher instanceof RegExp) {
                const s = pickBestByMatchers([c.matcher]);
                if (s) syms.push(String(s));
            }
        }
        const uniq = Array.from(new Set(syms.filter(Boolean)));
        const ok = uniq.filter(s => data && data.series && Array.isArray(data.series[s]) && data.series[s].length);
        ok.sort((a, b) => mostRecentMs(b) - mostRecentMs(a));
        return ok.length ? ok[0] : (uniq.length ? uniq[0] : null);
    };
    const yieldBp10FromSymbol = (symbol) => {
        if (!data || !symbol) return null;
        const pt = (typeof getMostRecentPointWithPrice === 'function' ? getMostRecentPointWithPrice(data, symbol) : null) || getLastPoint(data, symbol);
        const chg = pt && typeof pt.change === 'number' && Number.isFinite(pt.change) ? pt.change : null;
        if (!(typeof chg === 'number' && Number.isFinite(chg))) return null;
        const bps = chg * 100;
        if (!Number.isFinite(bps)) return null;
        return bps / 10;
    };
    const agendaIntel = (() => {
        const items = Array.isArray(agendaAutoCache) ? agendaAutoCache : (window.ECONOMIC_CALENDAR_DATA && Array.isArray(window.ECONOMIC_CALENDAR_DATA.items) ? window.ECONOMIC_CALENDAR_DATA.items : []);
        if (!dc || typeof dc.analyzeAgenda !== 'function') return { upcoming: [], next: { any: null, high: null, medium: null }, inWindow: [], risk: 'baixo' };
        return dc.analyzeAgenda(items, { now: new Date(), lookaheadMinutes: 240 });
    })();

    const dcDeps = { findAliasSymbolBest, findAliasSymbol, findAssetSymbol, getLastPoint };
    const catalog = (typeof window !== 'undefined' && window.InstrumentsCatalog) ? window.InstrumentsCatalog : null;
    const catDeps = { findAliasSymbolBest, findAliasSymbol, findAssetSymbol, dcDeps };
    const rcKey = (key, fallbackMatcher) => {
        const sym = catalog && typeof catalog.resolveRatesCreditByKey === 'function'
            ? catalog.resolveRatesCreditByKey(catDeps, data, key)
            : null;
        if (sym) return sym;
        if (fallbackMatcher instanceof RegExp) return pickBestByMatchers([fallbackMatcher]);
        return null;
    };
    const agendaNext = agendaIntel && agendaIntel.next ? agendaIntel.next.any : null;
    const agendaIfThen = (dc && typeof dc.getMatrixIfThen === 'function' && agendaNext)
        ? dc.getMatrixIfThen({ currency: agendaNext.currency, matrixKey: agendaNext.matrixKey, eventText: agendaNext.event })
        : { key: '', source: '', lines: [], validators: [] };

    const agendaValidation = (() => {
        if (!dc || !data || !agendaNext) return { score: null, label: '—', detail: '', keys: [] };
        const cur = String(agendaNext.currency || '').toUpperCase();
        const pick = (candidates) => pickFreshestCandidate(candidates);

        const candFor = (k) => {
            const key = String(k || '').toUpperCase();
            if (key === 'DXY') return [{ aliasKey: 'DXY' }, { matcher: /(^\.DXY$|\bDXY\b)/i }];
            if (key === 'US10Y') {
                const sym = rcKey('US_10Y', /(^US10YT=RR$|^\^TNX$|\bUS\s*10Y\b|^\.TNX$)/i);
                return sym ? [{ symbol: sym }] : [{ aliasKey: 'US10Y' }, { matcher: /(^US10YT=RR$|^\^TNX$|\bUS\s*10Y\b)/i }];
            }
            if (key === 'US2Y') {
                const sym = rcKey('US_2Y', /(^US2YT=RR$|\bUS\s*2Y\b)/i);
                return sym ? [{ symbol: sym }] : [{ aliasKey: 'US2Y' }, { matcher: /(^US2YT=RR$|\bUS\s*2Y\b)/i }];
            }
            if (key === 'VIX') return [{ aliasKey: 'VIX9D' }, { aliasKey: 'VIX30' }, { aliasKey: 'VIX' }, { matcher: /^\.?VIX(9D)?$/i }];
            if (key === 'SPX') return [{ aliasKey: 'SPX' }, { matcher: /(^\^GSPC$|\bS&P\s*500\b|^SPX$)/i }];
            if (key === 'HYG') {
                const sym = rcKey('ETF_HYG', /^HYG$/i);
                return sym ? [{ symbol: sym }] : [{ aliasKey: 'HYG' }, { matcher: /^HYG$/i }];
            }
            if (key === 'LQD') {
                const sym = rcKey('ETF_LQD', /^LQD$/i);
                return sym ? [{ symbol: sym }] : [{ aliasKey: 'LQD' }, { matcher: /^LQD$/i }];
            }

            if (key === 'USD_BRL') return [{ aliasKey: 'USD_BRL' }, { matcher: /^USD\/BRL\b/i }];
            if (key === 'BR10Y') {
                const sym = rcKey('BR_10Y', /^BR10YT=RR$/i);
                return sym ? [{ symbol: sym }] : [{ aliasKey: 'BR10Y' }, { matcher: /^BR10YT=RR$/i }];
            }
            if (key === 'IBOV') return [{ aliasKey: 'IBOV' }, { matcher: /(^\.BVSP$|\bIbovespa\b|\bIBOV\b)/i }];
            if (key === 'EWZ') return [{ aliasKey: 'EWZ' }, { matcher: /^EWZ$/i }];

            if (key === 'USD_CNH') return [{ aliasKey: 'USD_CNH' }, { aliasKey: 'USD_CNY' }, { matcher: /^USD\/CNH\b/i }, { matcher: /^USD\/CNY\b/i }];
            if (key === 'IRON') return [{ aliasKey: 'IRON' }, { matcher: /(^DCE_I0$|\bmin[eé]rio\b)/i }];
            if (key === 'COPPER') return [{ aliasKey: 'COPPER' }, { matcher: /(^HG$|HG=F|\bcobre\b)/i }];
            if (key === 'BRENT') return [{ aliasKey: 'BRENT' }, { aliasKey: 'WTI' }, { matcher: /\bBrent\b/i }, { matcher: /\bWTI\b/i }];
            if (key === 'FXI') return [{ aliasKey: 'FXI' }, { matcher: /^FXI$/i }];
            return [];
        };

        const defaultKeys = (() => {
            if (cur === 'USD') return ['DXY', 'US10Y', 'VIX', 'SPX'];
            if (cur === 'BRL') return ['USD_BRL', 'BR10Y', 'IBOV', 'EWZ'];
            if (cur === 'CNY' || cur === 'CNH' || cur === 'HKD') return ['USD_CNH', 'IRON', 'COPPER', 'BRENT', 'FXI'];
            return [];
        })();

        const keys = (agendaIfThen && Array.isArray(agendaIfThen.validators) && agendaIfThen.validators.length)
            ? agendaIfThen.validators.slice(0, 6).map(x => String(x || '').toUpperCase()).filter(Boolean)
            : defaultKeys;

        const syms = keys.map(k => pick(candFor(k))).filter(Boolean);
        if (!syms.length) return { score: null, label: '—', detail: '', keys };
        const cov = dc.computeCoverage(dcDeps, data, syms, { staleMs: 6 * 60 * 60 * 1000 });
        const score = Math.max(0, Math.min(1, (0.55 * cov.ratios.change) + (0.45 * cov.ratios.freshness)));
        const label = score >= 0.78 ? 'ALTA' : score >= 0.60 ? 'MÉDIA' : 'BAIXA';
        const detail = `validadores ${cov.counts.withChange}/${cov.counts.expected} • fresh ${formatNumber(cov.ratios.freshness * 100, 0)}%`;
        return { score, label, detail, keys };
    })();


    const fallbackRegime = (() => {
        if (!data) return null;
        const flow = computeFlowScore(data);
        const label = flow && typeof flow.label === 'string' ? flow.label : 'Neutro';
        const score = flow && typeof flow.score === 'number' && Number.isFinite(flow.score) ? flow.score : 0;
        const operational =
            label === 'Risk-On'
                ? { wdo: 'VENDA', win: 'COMPRA', hint: 'Risk-on tende a WDO↓ / WIN↑ (filtro, não gatilho).' }
                : label === 'Risk-Off'
                    ? { wdo: 'COMPRA', win: 'VENDA', hint: 'Risk-off tende a WDO↑ / WIN↓ (filtro, não gatilho).' }
                    : { wdo: '—', win: '—', hint: 'Regime indefinido (filtro, não gatilho).' };
        return { label, score, convictionLabel: '—', convictionScore: 0.55, operational, divergences: [], updatedAt: null };
    })();

    const regime = rawRegime || fallbackRegime;
    const options = rawOptions && rawOptions.ok === true ? rawOptions : null;
    const web = rawWeb && rawWeb.ok === true ? rawWeb : null;
    const foreignFlow = rawForeign && rawForeign.ok === true ? rawForeign : null;
    const focus = rawFocus && rawFocus.ok === true ? rawFocus : null;

    const fmt0 = v => (typeof v === 'number' && Number.isFinite(v) ? formatNumber(v, 0) : '—');
    const fmt1 = v => (typeof v === 'number' && Number.isFinite(v) ? formatNumber(v, 1) : '—');

    if (!regime && !options && !web && !focus) {
        const badge = (tone, text, strength) => pillHtml('status', tone, text, strength);
        const st = x => (x ? (x.ok === true ? badge('ok', 'OK', 0.75) : badge('bad', 'ERRO', 0.85)) : badge('info', '—', 0.55));
        el.innerHTML = `
            <div style="padding:12px;border:1px solid rgba(255,255,255,.12);border-radius:14px;background:rgba(0,0,0,.18);">
                <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
                    <div style="font-weight:900;letter-spacing:1px;opacity:.95;">Roteiro do momento</div>
                    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
                        ${badge('info', 'Regime', 0.55)} ${st(rawRegime)}
                        ${badge('info', 'Opções', 0.55)} ${st(rawOptions)}
                        ${badge('info', 'News', 0.55)} ${st(rawWeb)}
                        ${badge('info', 'Focus', 0.55)} ${st(rawFocus)}
                    </div>
                </div>
                <div style="margin-top:10px;opacity:.88;line-height:1.35;">
                    Aguardando sinais suficientes para montar o roteiro completo.
                </div>
            </div>
        `;
        return;
    }

    const biasFromLabel = raw => {
        const s = String(raw || '').toUpperCase();
        if (s.includes('COMPRA')) return 'buy';
        if (s.includes('VENDA')) return 'sell';
        return 'neutral';
    };

    const regimeBias = regime && regime.operational
        ? { wdo: biasFromLabel(regime.operational.wdo), win: biasFromLabel(regime.operational.win) }
        : { wdo: 'neutral', win: 'neutral' };

    const newsTilt = (() => {
        const items = web && Array.isArray(web.items) ? web.items.slice(0, 8) : [];
        const weight = conf => {
            const c = String(conf || '').toLowerCase();
            if (c.includes('alta')) return 2.0;
            if (c.includes('média') || c.includes('media')) return 1.0;
            if (c.includes('baixa')) return 0.5;
            return 0.75;
        };
        const aScore = a => (a === '↑' ? 1 : a === '↓' ? -1 : 0);
        const sum = { wdo: 0, win: 0, w: 0 };
        for (const it of items) {
            const w = weight(it && it.confidence);
            const impact = it && it.impact ? it.impact : null;
            sum.wdo += w * aScore(impact && impact.wdo ? String(impact.wdo) : '≈');
            sum.win += w * aScore(impact && impact.win ? String(impact.win) : '≈');
            sum.w += w;
        }
        const norm = k => (sum.w > 0 ? sum[k] / sum.w : 0);
        const toBias = v => (v > 0.22 ? 'buy' : v < -0.22 ? 'sell' : 'neutral');
        return {
            wdo: { bias: toBias(norm('wdo')), score: norm('wdo'), w: sum.w },
            win: { bias: toBias(norm('win')), score: norm('win'), w: sum.w },
        };
    })();

    const combine = (a, b) => {
        if (a === 'neutral') return { bias: b, conflict: false };
        if (b === 'neutral') return { bias: a, conflict: false };
        if (a === b) return { bias: a, conflict: false };
        return { bias: 'neutral', conflict: true };
    };

    const combined = {
        wdo: combine(regimeBias.wdo, newsTilt.wdo.bias),
        win: combine(regimeBias.win, newsTilt.win.bias),
    };

    const macro = operationalInputs.macro || null;
    const brFlowSignal = (() => {
        if (!data) return { score: null, label: '—', confidence: null, detail: '', drivers: [] };
        const symUsdBrl = aliasSym('USD_BRL') || pickBestByMatchers([/^USD\/BRL\b/i]);
        const symDxy = aliasSym('DXY') || pickBestByMatchers([/(^\.DXY$|\bDXY\b|US Dollar Index|\bUSDX\b|Dollar Index)/i]);
        const symVix = findAliasSymbolBest(data, 'VIX9D') || findAliasSymbolBest(data, 'VIX30') || aliasSym('VIX') || pickBestByMatchers([/^\.?VIX(9D)?$/i, /^VIX$/i]);
        const symUs10 = rcKey('US_10Y', /(^US10YT=RR$|^\^TNX$|\bUS\s*10Y\b|^\.TNX$)/i) || aliasSym('US10Y') || pickBestByMatchers([/(^US10YT=RR$|^\^TNX$|\bUS\s*10Y\b|^\.TNX$)/i]);
        const symBr10 = rcKey('BR_10Y', /^BR10YT=RR$/i) || aliasSym('BR10Y') || pickBestByMatchers([/^BR10YT=RR$/i]);
        const symHyg = rcKey('ETF_HYG', /^HYG(\.\w+)?$/i) || aliasSym('HYG') || pickBestByMatchers([/^HYG(\.\w+)?$/i]);
        const symEem = aliasSym('EEM') || pickBestByMatchers([/^EEM(\.\w+)?$/i, /^VWO(\.\w+)?$/i]);
        const symCds = rcKey('CDS_BR_5Y', /^BRGV5YUSAC=R$/i) || aliasSym('CDS_BR5Y') || pickBestByMatchers([/^BRGV5YUSAC=R$/i, /^BRGV/i]);

        const pct = (s) => {
            const v = s ? getChangePct(data, s) : null;
            return typeof v === 'number' && Number.isFinite(v) ? v : null;
        };
        const usdPct = pct(symUsdBrl);
        const dxyPct = pct(symDxy);
        const vixPct = pct(symVix);
        const hygPct = pct(symHyg);
        const eemPct = pct(symEem);
        const cdsPct = pct(symCds);
        const us10Bp10 = yieldBp10FromSymbol(symUs10);
        const br10Bp10 = yieldBp10FromSymbol(symBr10);
        const emPct = (macro && macro.em && typeof macro.em.pct === 'number' && Number.isFinite(macro.em.pct)) ? macro.em.pct : eemPct;
        const exportScore = (macro && typeof macro.exportScore === 'number' && Number.isFinite(macro.exportScore)) ? macro.exportScore : null;
        const flowScore = (foreignFlow && foreignFlow.signal && typeof foreignFlow.signal.score === 'number' && Number.isFinite(foreignFlow.signal.score)) ? foreignFlow.signal.score : null;

        const toDir = (v, t) => {
            if (!(typeof v === 'number' && Number.isFinite(v))) return 0;
            if (v > t) return +1;
            if (v < -t) return -1;
            return 0;
        };
        const tFx = 0.12;
        const tVol = 0.25;
        const tCredit = 0.18;
        const tRates = typeof operationalTuning.threshold.yields === 'number' && Number.isFinite(operationalTuning.threshold.yields) ? operationalTuning.threshold.yields : 0.12;
        const tEm = typeof operationalTuning.threshold.em === 'number' && Number.isFinite(operationalTuning.threshold.em) ? operationalTuning.threshold.em : 0.12;
        const tExport = typeof operationalTuning.threshold.export === 'number' && Number.isFinite(operationalTuning.threshold.export) ? operationalTuning.threshold.export : 0.25;
        const tFlow = typeof operationalTuning.threshold.foreignFlow === 'number' && Number.isFinite(operationalTuning.threshold.foreignFlow) ? operationalTuning.threshold.foreignFlow : 0.25;

        const parts = [];
        const push = (label, dir, w) => {
            if (!dir || !(w > 0)) return;
            parts.push({ label, dir, w });
        };
        push('DXY (↓)', toDir(dxyPct !== null ? -dxyPct : null, tFx), 0.18);
        push('VIX (↓)', toDir(vixPct !== null ? -vixPct : null, tVol), 0.12);
        push('US10Y (Δbp ↓)', toDir(us10Bp10 !== null ? -us10Bp10 : null, tRates), 0.12);
        push('BR10Y (Δbp ↓)', toDir(br10Bp10 !== null ? -br10Bp10 : null, tRates), 0.10);
        push('HYG (↑)', toDir(hygPct, tCredit), 0.10);
        push('EM (↑)', toDir(emPct, tEm), 0.12);
        push('Export Basket (↑)', toDir(exportScore, tExport), 0.10);
        push('USD/BRL (↓)', toDir(usdPct !== null ? -usdPct : null, tFx), 0.10);
        push('Fluxo estrangeiro (↑)', toDir(flowScore, tFlow), 0.06);
        push('CDS BR (↓)', toDir(cdsPct !== null ? -cdsPct : null, 0.12), 0.06);

        const wSum = parts.reduce((acc, p) => acc + p.w, 0);
        const score = wSum > 0 ? parts.reduce((acc, p) => acc + (p.dir * p.w), 0) / wSum : null;

        const cov = (dc && typeof dc.computeCoverage === 'function')
            ? dc.computeCoverage(dcDeps, data, [symUsdBrl, symDxy, symVix, symUs10, symBr10, symHyg, symEem].filter(Boolean), { nowMs, staleMs: 6 * 60 * 60 * 1000 })
            : null;
        const confidence = cov
            ? Math.max(0, Math.min(1, (0.55 * cov.ratios.change) + (0.45 * cov.ratios.freshness)))
            : null;

        const label = (() => {
            if (!(typeof score === 'number' && Number.isFinite(score))) return '—';
            const abs = Math.abs(score);
            const conf = typeof confidence === 'number' && Number.isFinite(confidence) ? confidence : 0.5;
            if (abs >= 0.55 && conf >= 0.72) return score > 0 ? 'ENTRADA FORTE' : 'SAÍDA FORTE';
            if (abs >= 0.38 && conf >= 0.62) return score > 0 ? 'ENTRADA' : 'SAÍDA';
            return 'MISTO';
        })();

        const detail = cov
            ? `validadores ${cov.counts.withChange}/${cov.counts.expected} • fresh ${formatNumber(cov.ratios.freshness * 100, 0)}%`
            : '';

        const drivers = parts
            .slice()
            .sort((a, b) => (b.w - a.w))
            .slice(0, 6)
            .map(p => p.label);

        return { score: (typeof score === 'number' && Number.isFinite(score)) ? score : null, label, confidence, detail, drivers };
    })();

    const brBreadthSectorSignal = (() => {
        if (!data) return { ok: false };

        const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
        const ok = v => typeof v === 'number' && Number.isFinite(v);
        const spot = (symbol) => {
            if (!symbol) return null;
            const pt = (typeof getMostRecentPointWithPrice === 'function' ? getMostRecentPointWithPrice(data, symbol) : null) || getLastPoint(data, symbol);
            const px = pt && typeof pt.price === 'number' && Number.isFinite(pt.price) ? pt.price : null;
            return px;
        };

        const vixSym =
            findAliasSymbolBest(data, 'VIX9D') ||
            findAliasSymbolBest(data, 'VIX30') ||
            aliasSym('VIX') ||
            findAssetSymbol(data, /^\.?VIX(9D)?$/i);
        const vxbrSym =
            findAliasSymbolBest(data, 'VXBR') ||
            findAssetSymbol(data, /(^\.VXBR$|\bVXBR\b)/i);

        const vix = spot(vixSym);
        const vxbr = spot(vxbrSym);
        const vixRel = ok(vix) ? clamp(vix / 20, 0.75, 1.4) : null;
        const vxbrRel = ok(vxbr) ? clamp(vxbr / 18, 0.75, 1.5) : null;
        const amp = (vixRel !== null && vxbrRel !== null)
            ? ((vixRel + vxbrRel) / 2)
            : (vixRel !== null ? vixRel : (vxbrRel !== null ? vxbrRel : 1));

        const pctAt = (symbol, minutes) => {
            if (!symbol) return null;
            const s = String(symbol || '');
            const series = (data && data.series && Array.isArray(data.series[s])) ? data.series[s] : [];
            if (!series.length) return null;
            const last = series[series.length - 1];
            const lastT = last && last.t ? Date.parse(String(last.t)) : NaN;
            const lastP = last && typeof last.price === 'number' && Number.isFinite(last.price) ? last.price : null;
            if (!Number.isFinite(lastT) || lastP === null || !(lastP > 0)) return null;
            const target = lastT - (Number(minutes) * 60 * 1000);
            let prev = null;
            for (let i = series.length - 1; i >= 0; i -= 1) {
                const p = series[i];
                const t = p && p.t ? Date.parse(String(p.t)) : NaN;
                const price = p && typeof p.price === 'number' && Number.isFinite(p.price) ? p.price : null;
                if (!Number.isFinite(t) || price === null || !(price > 0)) continue;
                if (t <= target) { prev = { t, price }; break; }
            }
            if (!prev) return null;
            return ((lastP / prev.price) - 1) * 100;
        };

        const pickEq = (matchers) => pickFreshestCandidate((matchers || []).map(m => ({ matcher: m })));

        const universe = [
            { key: 'PETR', label: 'Petrobras', weight: 0.14, matchers: [/^PETR4(\.\w+)?$/i, /^PETR3(\.\w+)?$/i, /^PBR(\.\w+)?$/i] },
            { key: 'VALE', label: 'Vale', weight: 0.14, matchers: [/^VALE3(\.\w+)?$/i, /^VALE(\.\w+)?$/i] },
            { key: 'BANKS', label: 'Bancos', weight: 0.20, matchers: [/^ITUB4(\.\w+)?$/i, /^ITUB(\.\w+)?$/i, /^BBDC4(\.\w+)?$/i, /^BBDC(\.\w+)?$/i, /^BBAS3(\.\w+)?$/i] },
            { key: 'B3', label: 'B3', weight: 0.07, matchers: [/^B3SA3(\.\w+)?$/i] },
            { key: 'UTIL', label: 'Eletrobras', weight: 0.07, matchers: [/^ELET3(\.\w+)?$/i, /^ELET6(\.\w+)?$/i] },
            { key: 'BEV', label: 'Ambev', weight: 0.06, matchers: [/^ABEV3(\.\w+)?$/i, /^ABEV(\.\w+)?$/i] },
            { key: 'IND', label: 'WEGE/Embraer', weight: 0.06, matchers: [/^WEGE3(\.\w+)?$/i, /^WEGE(\.\w+)?$/i, /^EMBR3(\.\w+)?$/i, /^ERJ(\.\w+)?$/i] },
            { key: 'STEEL', label: 'Siderurgia', weight: 0.05, matchers: [/^GGBR4(\.\w+)?$/i, /^CSNA3(\.\w+)?$/i, /^SID(\.\w+)?$/i] },
            { key: 'OIL2', label: 'PRIO', weight: 0.05, matchers: [/^PRIO3(\.\w+)?$/i] },
            { key: 'PULP', label: 'Papel & Celulose', weight: 0.05, matchers: [/^SUZB3(\.\w+)?$/i, /^KLBN11(\.\w+)?$/i] },
            { key: 'RETL', label: 'Varejo', weight: 0.05, matchers: [/^RENT3(\.\w+)?$/i, /^LREN3(\.\w+)?$/i] },
            { key: 'MIN', label: 'Mineração (extra)', weight: 0.05, matchers: [/^GOLD(\.\w+)?$/i, /^NEM(\.\w+)?$/i] },
            { key: 'ETF', label: 'EWZ/BOVA11', weight: 0.11, matchers: [/^EWZ(\.\w+)?$/i, /^BOVA11(\.\w+)?$/i, /^\.BVSP$/i] },
        ];

        const resolved = universe
            .map(u => {
                const symbol = pickEq(u.matchers);
                return symbol ? { ...u, symbol } : null;
            })
            .filter(Boolean);

        const th15 = 0.06 / (ok(amp) ? amp : 1);
        const th60 = 0.14 / (ok(amp) ? amp : 1);
        const toDir = (v, t) => (ok(v) ? (v > t ? +1 : v < -t ? -1 : 0) : 0);

        const items = resolved.map(u => {
            const p15 = pctAt(u.symbol, 15);
            const p60 = pctAt(u.symbol, 60);
            return { ...u, p15: ok(p15) ? p15 : null, p60: ok(p60) ? p60 : null };
        });

        const eff15 = items.filter(x => ok(x.p15));
        const eff60 = items.filter(x => ok(x.p60));
        const n15 = eff15.length;
        const n60 = eff60.length;
        if (!n15 && !n60) return { ok: false };

        const breadthScore = (() => {
            if (!n15) return null;
            const adv = eff15.filter(x => x.p15 > th15).length;
            const dec = eff15.filter(x => x.p15 < -th15).length;
            const score = n15 > 0 ? (adv - dec) / n15 : null;
            return { score: ok(score) ? score : null, adv, dec, n: n15 };
        })();

        const sectorsScore = (() => {
            const list = eff15.length ? eff15 : eff60;
            const n = list.length;
            if (!n) return null;
            const sumW = list.reduce((acc, x) => acc + (x.weight || 0), 0);
            if (!(sumW > 0)) return null;
            const score = list.reduce((acc, x) => {
                const dir = toDir(eff15.length ? x.p15 : x.p60, eff15.length ? th15 : th60);
                return acc + (x.weight * dir);
            }, 0) / sumW;
            return { score: ok(score) ? score : null, n };
        })();

        const rotation = (() => {
            const symLarge = [
                pickEq([/^EWZ(\.\w+)?$/i]),
                pickEq([/^BOVA11(\.\w+)?$/i]),
                pickEq([/^\.BVSP$/i]),
            ].filter(Boolean);
            const symSmall = [
                pickEq([/^EWZS(\.\w+)?$/i]),
                pickEq([/^SMAL11(\.\w+)?$/i]),
            ].filter(Boolean);

            if (!symLarge.length || !symSmall.length) return null;

            const avg = (vals) => {
                const xs = (vals || []).filter(v => typeof v === 'number' && Number.isFinite(v));
                return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null;
            };

            const large15 = avg(symLarge.map(s => pctAt(s, 15)));
            const small15 = avg(symSmall.map(s => pctAt(s, 15)));
            const large60 = avg(symLarge.map(s => pctAt(s, 60)));
            const small60 = avg(symSmall.map(s => pctAt(s, 60)));

            const use15 = ok(large15) && ok(small15);
            const use60 = ok(large60) && ok(small60);
            if (!use15 && !use60) return null;

            const diff = use15 ? (small15 - large15) : (small60 - large60);
            const baseTh = typeof operationalTuning.threshold.brRotation === 'number' && Number.isFinite(operationalTuning.threshold.brRotation) ? operationalTuning.threshold.brRotation : 0.12;
            const th = baseTh / (ok(amp) ? amp : 1);
            const dir = diff > th ? +1 : diff < -th ? -1 : 0;
            const label = dir > 0 ? 'SMALL> LARGE' : dir < 0 ? 'LARGE> SMALL' : 'MISTO';
            const used = { large: symLarge.slice(0, 2), small: symSmall.slice(0, 2), window: use15 ? '15m' : '60m' };
            return { score: ok(diff) ? diff : null, dir, label, used };
        })();

        const labelFrom = (score) => {
            if (!ok(score)) return 'MISTO';
            const t = typeof operationalTuning.threshold.brBreadth === 'number' && Number.isFinite(operationalTuning.threshold.brBreadth) ? operationalTuning.threshold.brBreadth : 0.22;
            if (score >= t) return 'RISK-ON';
            if (score <= -t) return 'RISK-OFF';
            return 'MISTO';
        };

        const tBreadth = typeof operationalTuning.threshold.brBreadth === 'number' && Number.isFinite(operationalTuning.threshold.brBreadth) ? operationalTuning.threshold.brBreadth : 0.22;
        const tSectors = typeof operationalTuning.threshold.brSectors === 'number' && Number.isFinite(operationalTuning.threshold.brSectors) ? operationalTuning.threshold.brSectors : 0.18;
        const bScore = breadthScore && ok(breadthScore.score) ? breadthScore.score : null;
        const sScore = sectorsScore && ok(sectorsScore.score) ? sectorsScore.score : null;
        const tRot = typeof operationalTuning.threshold.brRotation === 'number' && Number.isFinite(operationalTuning.threshold.brRotation) ? operationalTuning.threshold.brRotation : 0.12;
        const rotScore = rotation && ok(rotation.score) ? rotation.score : null;
        const rotStrongOn = (ok(rotScore) && rotScore >= Math.max(0.18, (tRot * 1.4) / (ok(amp) ? amp : 1)));
        const rotStrongOff = (ok(rotScore) && rotScore <= -Math.max(0.18, (tRot * 1.4) / (ok(amp) ? amp : 1)));
        const strongRiskOff = rotStrongOff || (ok(bScore) && bScore <= -Math.max(0.35, tBreadth * 1.4)) || (ok(sScore) && sScore <= -Math.max(0.30, tSectors * 1.4));
        const strongRiskOn = rotStrongOn || (ok(bScore) && bScore >= Math.max(0.35, tBreadth * 1.4)) || (ok(sScore) && sScore >= Math.max(0.30, tSectors * 1.4));

        const detail = (() => {
            const bits = [];
            if (breadthScore && ok(breadthScore.score)) bits.push(`Breadth15m ${(breadthScore.score * 100) > 0 ? '+' : ''}${formatNumber(breadthScore.score * 100, 0)} (${breadthScore.adv}↑/${breadthScore.dec}↓ n=${breadthScore.n})`);
            if (sectorsScore && ok(sectorsScore.score)) bits.push(`Setores15m ${(sectorsScore.score * 100) > 0 ? '+' : ''}${formatNumber(sectorsScore.score * 100, 0)} (n=${sectorsScore.n})`);
            if (rotation && ok(rotation.score)) bits.push(`Rotação ${rotation.label} (${rotation.used.window}) ${(rotation.score) > 0 ? '+' : ''}${formatNumber(rotation.score, 2)}pp`);
            if (ok(amp) && (ok(vix) || ok(vxbr))) bits.push(`volAmp ${formatNumber(amp, 2)}`);
            return bits.join(' • ');
        })();

        return {
            ok: true,
            amp: ok(amp) ? amp : 1,
            breadth: breadthScore ? breadthScore : null,
            sectors: sectorsScore ? sectorsScore : null,
            rotation,
            breadthLabel: labelFrom(bScore),
            sectorsLabel: (() => {
                if (!ok(sScore)) return 'MISTO';
                if (sScore >= tSectors) return 'RISK-ON';
                if (sScore <= -tSectors) return 'RISK-OFF';
                return 'MISTO';
            })(),
            strongRiskOff,
            strongRiskOn,
            detail,
        };
    })();

    const macroBiasFor = symbol => {
        if (!macro) return { bias: 'neutral', score: 0, parts: [] };
        const neutral = t => String(t || '').toLowerCase().includes('neutro');
        let s = 0;
        let w = 0;
        const parts = [];
        const push = (label, val, wVal) => {
            s += val * wVal;
            w += wVal;
            if (val !== 0) parts.push({ label: String(label || '—'), val: Number(val) * Number(wVal) });
        };
        if (macro.flow && !neutral(macro.flow.label)) {
            const b = macro.flow.label === 'Risk-On' ? (symbol === 'WDO' ? -1 : +1) : (symbol === 'WDO' ? +1 : -1);
            push(`Flow (${macro.flow.label})`, b, operationalTuning.weight.flow);
        }
        if (foreignFlow && foreignFlow.signal && typeof foreignFlow.signal.score === 'number' && Number.isFinite(foreignFlow.signal.score)) {
            const t = typeof operationalTuning.threshold.foreignFlow === 'number' ? operationalTuning.threshold.foreignFlow : 0.25;
            const dir = foreignFlow.signal.score > t ? +1 : foreignFlow.signal.score < -t ? -1 : 0;
            const b = symbol === 'WDO' ? -dir : +dir;
            const wFlow = typeof operationalTuning.weight.foreignFlow === 'number' ? operationalTuning.weight.foreignFlow : 0.22;
            push('Fluxo estrangeiro', b, wFlow);
        }
        if (typeof macro.dxyPct === 'number' && Number.isFinite(macro.dxyPct)) {
            const dir = macro.dxyPct > operationalTuning.threshold.dxy ? +1 : macro.dxyPct < -operationalTuning.threshold.dxy ? -1 : 0;
            const b = symbol === 'WDO' ? dir : -dir;
            push('DXY', b, operationalTuning.weight.dxy);
        }
        if (typeof macro.exportScore === 'number' && Number.isFinite(macro.exportScore)) {
            const dir = macro.exportScore > operationalTuning.threshold.export ? +1 : macro.exportScore < -operationalTuning.threshold.export ? -1 : 0;
            const b = symbol === 'WDO' ? -dir : +dir;
            push('Exportadoras/Commodities', b, operationalTuning.weight.export);
        }
        if (macro.em && typeof macro.em.pct === 'number' && Number.isFinite(macro.em.pct)) {
            const dir = macro.em.pct > operationalTuning.threshold.em ? +1 : macro.em.pct < -operationalTuning.threshold.em ? -1 : 0;
            const b = symbol === 'WDO' ? dir : -dir;
            push('Emergentes (EM)', b, operationalTuning.weight.em);
        }
        if (brFlowSignal && typeof brFlowSignal.score === 'number' && Number.isFinite(brFlowSignal.score)) {
            const t = typeof operationalTuning.threshold.brFlow === 'number' && Number.isFinite(operationalTuning.threshold.brFlow) ? operationalTuning.threshold.brFlow : 0.22;
            const dir = brFlowSignal.score > t ? +1 : brFlowSignal.score < -t ? -1 : 0;
            const b = symbol === 'WDO' ? -dir : +dir;
            const wBr = typeof operationalTuning.weight.brFlow === 'number' && Number.isFinite(operationalTuning.weight.brFlow) ? operationalTuning.weight.brFlow : 0.28;
            push(`Fluxo global→BR (${brFlowSignal.label})`, b, wBr);
        }
        if (brBreadthSectorSignal && brBreadthSectorSignal.ok) {
            const bScore = brBreadthSectorSignal.breadth && typeof brBreadthSectorSignal.breadth.score === 'number' && Number.isFinite(brBreadthSectorSignal.breadth.score) ? brBreadthSectorSignal.breadth.score : null;
            const sScore = brBreadthSectorSignal.sectors && typeof brBreadthSectorSignal.sectors.score === 'number' && Number.isFinite(brBreadthSectorSignal.sectors.score) ? brBreadthSectorSignal.sectors.score : null;
            const rScore = brBreadthSectorSignal.rotation && typeof brBreadthSectorSignal.rotation.score === 'number' && Number.isFinite(brBreadthSectorSignal.rotation.score) ? brBreadthSectorSignal.rotation.score : null;
            const tBreadth = typeof operationalTuning.threshold.brBreadth === 'number' && Number.isFinite(operationalTuning.threshold.brBreadth) ? operationalTuning.threshold.brBreadth : 0.22;
            const tSectors = typeof operationalTuning.threshold.brSectors === 'number' && Number.isFinite(operationalTuning.threshold.brSectors) ? operationalTuning.threshold.brSectors : 0.18;
            const wBreadth = typeof operationalTuning.weight.brBreadth === 'number' && Number.isFinite(operationalTuning.weight.brBreadth) ? operationalTuning.weight.brBreadth : 0.30;
            const wSectors = typeof operationalTuning.weight.brSectors === 'number' && Number.isFinite(operationalTuning.weight.brSectors) ? operationalTuning.weight.brSectors : 0.32;
            const tRot = typeof operationalTuning.threshold.brRotation === 'number' && Number.isFinite(operationalTuning.threshold.brRotation) ? operationalTuning.threshold.brRotation : 0.12;
            const wRot = typeof operationalTuning.weight.brRotation === 'number' && Number.isFinite(operationalTuning.weight.brRotation) ? operationalTuning.weight.brRotation : 0.22;
            const dirB = (typeof bScore === 'number' && Number.isFinite(bScore)) ? (bScore > tBreadth ? +1 : bScore < -tBreadth ? -1 : 0) : 0;
            const dirS = (typeof sScore === 'number' && Number.isFinite(sScore)) ? (sScore > tSectors ? +1 : sScore < -tSectors ? -1 : 0) : 0;
            const dirR = (typeof rScore === 'number' && Number.isFinite(rScore)) ? (rScore > tRot ? +1 : rScore < -tRot ? -1 : 0) : 0;
            if (dirB) {
                const b = symbol === 'WDO' ? -dirB : +dirB;
                push('Breadth BR (15m)', b, wBreadth);
            }
            if (dirS) {
                const b = symbol === 'WDO' ? -dirS : +dirS;
                push('Setores-peso WIN (15m)', b, wSectors);
            }
            if (dirR) {
                const b = symbol === 'WDO' ? -dirR : +dirR;
                const label = dirR > 0 ? 'Rotação BR (small>large)' : 'Rotação BR (large>small)';
                push(label, b, wRot);
            }
        }
        if (data) {
            const t = typeof operationalTuning.threshold.yields === 'number' && Number.isFinite(operationalTuning.threshold.yields)
                ? operationalTuning.threshold.yields
                : 0.12;
            const symUs10 = rcKey('US_10Y', /(^US10YT=RR$|^\^TNX$|\bUS\s*10Y\b|^\.TNX$)/i) || aliasSym('US10Y') || pickBestByMatchers([/(^US10YT=RR$|^\^TNX$|\bUS\s*10Y\b|^\.TNX$)/i]);
            const us10 = yieldBp10FromSymbol(symUs10);
            if (typeof us10 === 'number' && Number.isFinite(us10)) {
                const dir = us10 > t ? +1 : us10 < -t ? -1 : 0;
                const b = symbol === 'WDO' ? dir : -dir;
                push('US10Y (Δbp)', b, operationalTuning.weight.yields);
            }

            const symBr10 = rcKey('BR_10Y', /^BR10YT=RR$/i) || aliasSym('BR10Y') || pickBestByMatchers([/^BR10YT=RR$/i]);
            const br10 = yieldBp10FromSymbol(symBr10);
            if (typeof br10 === 'number' && Number.isFinite(br10)) {
                const dir = br10 > t ? +1 : br10 < -t ? -1 : 0;
                const b = symbol === 'WDO' ? dir : -dir;
                push('BR10Y (Δbp)', b, operationalTuning.weight.yields * 0.8);
            }
        }
        if (macro.zq && typeof macro.zq.slopePct === 'number' && Number.isFinite(macro.zq.slopePct)) {
            const t = typeof operationalTuning.threshold.zqSlope === 'number' && Number.isFinite(operationalTuning.threshold.zqSlope)
                ? operationalTuning.threshold.zqSlope
                : 0.08;
            const dir = macro.zq.slopePct > t ? +1 : macro.zq.slopePct < -t ? -1 : 0;
            const b = symbol === 'WDO' ? dir : -dir;
            const wZq = typeof operationalTuning.weight.zq === 'number' && Number.isFinite(operationalTuning.weight.zq) ? operationalTuning.weight.zq : 0.22;
            push('Curva ZQ (Fed Funds)', b, wZq);
        }
        if (macro.flowSentinel && typeof macro.flowSentinel.composite === 'number' && Number.isFinite(macro.flowSentinel.composite)) {
            const fs = macro.flowSentinel;
            if (!fs.divergence) {
                const t = typeof operationalTuning.threshold.flowSentinel === 'number' && Number.isFinite(operationalTuning.threshold.flowSentinel)
                    ? operationalTuning.threshold.flowSentinel
                    : 0.25;
                const dirUsd = fs.composite < -t ? +1 : fs.composite > t ? -1 : 0;
                const b = symbol === 'WDO' ? dirUsd : -dirUsd;
                const wFs = typeof operationalTuning.weight.flowSentinel === 'number' && Number.isFinite(operationalTuning.weight.flowSentinel) ? operationalTuning.weight.flowSentinel : 0.18;
                push('Flow Sentinel', b, wFs);
            }
        }
        const score = w > 0 ? s / w : 0;
        const bias = score > 0.22 ? 'buy' : score < -0.22 ? 'sell' : 'neutral';
        return { bias, score, parts };
    };

    const macroWdo = macroBiasFor('WDO');
    const macroWin = macroBiasFor('WIN');

    const diSignal = (() => {
        if (!data) return { ok: false };
        const seriesKeys = Object.keys((data && data.series) || {});
        const diMatcher = /^DI1[FGHJKMNQUVXZ]\d{2}$/i;

        const monthNum = code => {
            const c = String(code || '').toUpperCase();
            if (c === 'F') return 1;
            if (c === 'G') return 2;
            if (c === 'H') return 3;
            if (c === 'J') return 4;
            if (c === 'K') return 5;
            if (c === 'M') return 6;
            if (c === 'N') return 7;
            if (c === 'Q') return 8;
            if (c === 'U') return 9;
            if (c === 'V') return 10;
            if (c === 'X') return 11;
            if (c === 'Z') return 12;
            return null;
        };

        const symbolsFromSeries = seriesKeys.filter(sym => diMatcher.test(sym));
        const symbolsFromAssets = (data.assets || [])
            .map(a => String(a && a.symbol ? a.symbol : ''))
            .filter(sym => diMatcher.test(sym));
        const symbolsAll = Array.from(new Set([...symbolsFromSeries, ...symbolsFromAssets]));
        if (!symbolsAll.length) return { ok: false };

        const maturityYears = (y, m) => {
            if (!Number.isFinite(y) || !Number.isFinite(m)) return null;
            const now = new Date();
            const t = new Date(y, m - 1, 1);
            const months = (t.getFullYear() - now.getFullYear()) * 12 + (t.getMonth() - now.getMonth());
            if (!Number.isFinite(months)) return null;
            return months / 12;
        };

        const list = symbolsAll
            .map(symbol => {
                const last = getMostRecentPointWithPrice(data, symbol);
                const rate = last && typeof last.price === 'number' && Number.isFinite(last.price) ? last.price : null;
                const chg = last && typeof last.change === 'number' && Number.isFinite(last.change) ? last.change : null;
                const chgBp10 = typeof chg === 'number' && Number.isFinite(chg) ? (chg * 100) / 10 : null;
                const chgPct = pointPct(last);
                const y = 2000 + Number(String(symbol).slice(-2));
                const m = monthNum(String(symbol)[3]);
                return { symbol, rate, chgBp10, chgPct, year: Number.isFinite(y) ? y : null, month: m };
            })
            .filter(x => x.rate !== null && x.year !== null && x.month !== null)
            .map(x => ({ ...x, yrs: maturityYears(x.year, x.month) }))
            .filter(x => typeof x.yrs === 'number' && Number.isFinite(x.yrs) && x.yrs > 0);

        if (!list.length) return { ok: false };

        const median = vals => {
            const xs = (vals || []).filter(v => typeof v === 'number' && Number.isFinite(v)).slice().sort((a, b) => a - b);
            if (!xs.length) return null;
            const mid = Math.floor(xs.length / 2);
            return xs.length % 2 ? xs[mid] : (xs[mid - 1] + xs[mid]) / 2;
        };
        const bucketOfYears = yrs => yrs < 2 ? 'short' : yrs <= 5 ? 'mid' : 'long';
        const avg = vals => {
            const xs = (vals || []).filter(v => typeof v === 'number' && Number.isFinite(v));
            return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null;
        };
        const pickAnchor = (bucketItems, targetYrs) => {
            const xs = (bucketItems || []).slice().filter(x => x && typeof x.yrs === 'number' && Number.isFinite(x.yrs));
            if (!xs.length) return null;
            const isJan = x => String(x && x.symbol ? x.symbol : '')[3]?.toUpperCase?.() === 'F';
            const jan = xs.filter(isJan);
            const pool = jan.length ? jan : xs;
            const tgt = typeof targetYrs === 'number' && Number.isFinite(targetYrs) ? targetYrs : null;
            const score = x => {
                if (tgt === null) return x.yrs;
                return Math.abs(x.yrs - tgt);
            };
            return pool.reduce((best, cur) => (best === null || score(cur) < score(best) ? cur : best), null);
        };
        const pick = k => list.filter(x => bucketOfYears(x.yrs) === k);

        const short = pick('short');
        const mid = pick('mid');
        const long = pick('long');

        const shortRate = avg(short.map(x => x.rate));
        const midRate = avg(mid.map(x => x.rate));
        const longRate = avg(long.map(x => x.rate));

        const shortChg = avg(short.map(x => x.chgBp10));
        const midChg = avg(mid.map(x => x.chgBp10));
        const longChg = avg(long.map(x => x.chgBp10));

        const avgChg = avg(list.map(x => x.chgBp10));
        const medChg = median(list.map(x => x.chgBp10));
        const slope = typeof longRate === 'number' && typeof shortRate === 'number' ? (longRate - shortRate) : null;
        const shape = slope === null ? 'N/A' : slope > 0.15 ? 'STEEPEN' : slope < -0.15 ? 'FLATTEN' : '≈';

        const th = 0.35;
        const dirUsd = typeof medChg === 'number' && Number.isFinite(medChg) ? (medChg > th ? 1 : medChg < -th ? -1 : 0) : 0;
        const wdoBias = dirUsd > 0 ? 'buy' : dirUsd < 0 ? 'sell' : 'neutral';
        const winBias = dirUsd > 0 ? 'sell' : dirUsd < 0 ? 'buy' : 'neutral';

        return {
            ok: true,
            shape,
            slope,
            buckets: {
                short: { rate: shortRate, chgPct: shortChg, n: short.length },
                mid: { rate: midRate, chgPct: midChg, n: mid.length },
                long: { rate: longRate, chgPct: longChg, n: long.length },
            },
            anchors: {
                short: pickAnchor(short, 1.0),
                mid: pickAnchor(mid, 3.5),
                long: pickAnchor(long, 8.0),
            },
            avgChg,
            medChg,
            dirUsd,
            wdoBias,
            winBias,
        };
    })();

    const resolved = {
        wdo: combined.wdo.conflict ? macroWdo : combined.wdo,
        win: combined.win.conflict ? macroWin : combined.win,
    };

    const finalBias = {
        WDO: { bias: combined.wdo.conflict ? macroWdo.bias : combined.wdo.bias, source: combined.wdo.conflict ? 'MACRO' : 'REGIME+NEWS' },
        WIN: { bias: combined.win.conflict ? macroWin.bias : combined.win.bias, source: combined.win.conflict ? 'MACRO' : 'REGIME+NEWS' },
    };

    const pulseNow = data ? (typeof computeOperationalPulseNow === 'function' ? computeOperationalPulseNow(data) : null) : null;
    const volAmp = (() => {
        const isNum = v => typeof v === 'number' && Number.isFinite(v);
        if (!data || !pulseNow || !pulseNow.sym) return { amp: 1, vix: null, vxbr: null };
        const spot = (s) => {
            if (!s) return null;
            const p = (getMostRecentPointWithPrice(data, s) || getLastPoint(data, s));
            const px = p && typeof p.price === 'number' && Number.isFinite(p.price) ? p.price : null;
            return px;
        };
        const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
        const vixSym = pulseNow.sym.vix || pulseNow.sym.vix30 || pulseNow.sym.vix9d || null;
        const vxbrSym = pulseNow.sym.vxbr || null;
        const vix = spot(vixSym);
        const vxbr = spot(vxbrSym);
        const vixRel = isNum(vix) ? clamp(vix / 20, 0.75, 1.4) : null;
        const vxbrRel = isNum(vxbr) ? clamp(vxbr / 18, 0.75, 1.5) : null;
        const amp = (vixRel !== null && vxbrRel !== null)
            ? ((vixRel + vxbrRel) / 2)
            : (vixRel !== null ? vixRel : (vxbrRel !== null ? vxbrRel : 1));
        return { amp: isNum(amp) ? amp : 1, vix: isNum(vix) ? vix : null, vxbr: isNum(vxbr) ? vxbr : null };
    })();

    const priceLead = (() => {
        if (!data) return { active: false, reason: '' };
        const winPct = pulseNow && pulseNow.market ? pulseNow.market.winPct : null;
        const wdoPct = pulseNow && pulseNow.market ? pulseNow.market.wdoPct : null;
        const usdSym = (pulseNow && pulseNow.sym && pulseNow.sym.usdbrl)
            || findAliasSymbolBest(data, 'USD_BRL')
            || findAliasSymbol(data, 'USD_BRL')
            || findAssetSymbol(data, /^USD\/BRL\b/i);
        const usdPct = usdSym ? getChangePct(data, usdSym) : null;
        const amp = volAmp && typeof volAmp.amp === 'number' && Number.isFinite(volAmp.amp) ? volAmp.amp : 1;
        const thWin = 0.25 / amp;
        const thWdo = 0.25 / amp;
        const okWinWdo = typeof winPct === 'number' && Number.isFinite(winPct) && typeof wdoPct === 'number' && Number.isFinite(wdoPct);
        if (!okWinWdo) return { active: false, reason: '' };

        const riskOn = (winPct >= thWin && wdoPct <= -thWdo);
        const riskOff = (winPct <= -thWin && wdoPct >= thWdo);
        const usdTh = 0.04 / amp;
        const okUsdOn = typeof usdPct === 'number' && Number.isFinite(usdPct) ? (usdPct <= -usdTh) : true;
        const okUsdOff = typeof usdPct === 'number' && Number.isFinite(usdPct) ? (usdPct >= usdTh) : true;

        const volTxt = volAmp && (volAmp.vix !== null || volAmp.vxbr !== null) ? ` • volAmp ${formatNumber(amp, 2)}` : '';
        if (riskOn && okUsdOn) return { active: true, mode: 'risk_on', reason: `WIN ${formatPercent(winPct, 2)} • WDO ${formatPercent(wdoPct, 2)} • USD/BRL ${typeof usdPct === 'number' && Number.isFinite(usdPct) ? formatPercent(usdPct, 2) : '—'}${volTxt}` };
        if (riskOff && okUsdOff) return { active: true, mode: 'risk_off', reason: `WIN ${formatPercent(winPct, 2)} • WDO ${formatPercent(wdoPct, 2)} • USD/BRL ${typeof usdPct === 'number' && Number.isFinite(usdPct) ? formatPercent(usdPct, 2) : '—'}${volTxt}` };
        return { active: false, reason: '' };
    })();

    if (priceLead.active) {
        if (priceLead.mode === 'risk_off') {
            finalBias.WIN = { bias: 'sell', source: 'PREÇO' };
            finalBias.WDO = { bias: 'buy', source: 'PREÇO' };
        } else {
            finalBias.WIN = { bias: 'buy', source: 'PREÇO' };
            finalBias.WDO = { bias: 'sell', source: 'PREÇO' };
        }
    }

    const trendLead = (() => {
        if (!data || !pulseNow || !pulseNow.sym) return { active: false, mode: '', reason: '' };
        const symWin = pulseNow.sym.win;
        const symWdo = pulseNow.sym.wdo;
        const pctAt = (symbol, minutes) => {
            if (!symbol) return null;
            const s = String(symbol || '');
            const series = (data && data.series && Array.isArray(data.series[s])) ? data.series[s] : [];
            if (!series.length) return null;
            const last = series[series.length - 1];
            const lastT = last && last.t ? Date.parse(String(last.t)) : NaN;
            const lastP = last && typeof last.price === 'number' && Number.isFinite(last.price) ? last.price : null;
            if (!Number.isFinite(lastT) || lastP === null || !(lastP > 0)) return null;
            const target = lastT - (Number(minutes) * 60 * 1000);
            let prev = null;
            for (let i = series.length - 1; i >= 0; i -= 1) {
                const p = series[i];
                const t = p && p.t ? Date.parse(String(p.t)) : NaN;
                const price = p && typeof p.price === 'number' && Number.isFinite(p.price) ? p.price : null;
                if (!Number.isFinite(t) || price === null || !(price > 0)) continue;
                if (t <= target) { prev = { t, price }; break; }
            }
            if (!prev) return null;
            return ((lastP / prev.price) - 1) * 100;
        };
        const win60 = pctAt(symWin, 60);
        const wdo60 = pctAt(symWdo, 60);
        const win15 = pctAt(symWin, 15);
        const wdo15 = pctAt(symWdo, 15);
        const win5 = pctAt(symWin, 5);
        const wdo5 = pctAt(symWdo, 5);
        const ok = (x) => (typeof x === 'number' && Number.isFinite(x));
        if (!ok(win60) || !ok(wdo60) || !ok(win15) || !ok(wdo15)) return { active: false, mode: '', reason: '' };

        const amp = volAmp && typeof volAmp.amp === 'number' && Number.isFinite(volAmp.amp) ? volAmp.amp : 1;
        const th60 = 0.22 / amp;
        const th15 = 0.10 / amp;
        const th5 = 0.06 / amp;

        const riskOn60 = (win60 >= th60 && win15 >= th15 && wdo60 <= -th60 && wdo15 <= -th15);
        const riskOff60 = (win60 <= -th60 && win15 <= -th15 && wdo60 >= th60 && wdo15 >= th15);

        const ok5 = ok(win5) && ok(wdo5);
        const microConflict = ok5 && (
            (riskOn60 && (win5 <= -th5 || wdo5 >= th5))
            || (riskOff60 && (win5 >= th5 || wdo5 <= -th5))
        );
        if (microConflict) return { active: false, mode: '', reason: '' };

        const fastAllowed = amp >= 1.12 && ok5;
        const fastOn = fastAllowed
            && (win15 >= th15 && win5 >= th5 && wdo15 <= -th15 && wdo5 <= -th5)
            && (win60 > -th60 * 0.6 && wdo60 < th60 * 0.6);
        const fastOff = fastAllowed
            && (win15 <= -th15 && win5 <= -th5 && wdo15 >= th15 && wdo5 >= th5)
            && (win60 < th60 * 0.6 && wdo60 > -th60 * 0.6);

        const riskOn = riskOn60 || (!riskOff60 && fastOn);
        const riskOff = riskOff60 || (!riskOn60 && fastOff);
        if (!riskOn && !riskOff) return { active: false, mode: '', reason: '' };

        const fast = !riskOn60 && !riskOff60;
        const sfx5 = ok5 ? ` / ${formatPercent(win5, 2)}` : '';
        const sfxW5 = ok5 ? ` / ${formatPercent(wdo5, 2)}` : '';
        const tag = fast ? 'Tendência 15m/5m' : 'Tendência 60m/15m';
        const volTxt = volAmp && (volAmp.vix !== null || volAmp.vxbr !== null) ? ` • volAmp ${formatNumber(amp, 2)}` : '';
        const reason = `${tag}: WIN ${formatPercent(win60, 2)} / ${formatPercent(win15, 2)}${sfx5} • WDO ${formatPercent(wdo60, 2)} / ${formatPercent(wdo15, 2)}${sfxW5}${volTxt}`;
        return { active: true, mode: riskOff ? 'risk_off' : 'risk_on', reason };
    })();

    if (!priceLead.active && trendLead.active) {
        if (trendLead.mode === 'risk_off') {
            finalBias.WIN = { bias: 'sell', source: 'TENDÊNCIA' };
            finalBias.WDO = { bias: 'buy', source: 'TENDÊNCIA' };
        } else {
            finalBias.WIN = { bias: 'buy', source: 'TENDÊNCIA' };
            finalBias.WDO = { bias: 'sell', source: 'TENDÊNCIA' };
        }
    }

    const localTapeLead = (() => {
        if (!data || !pulseNow || !pulseNow.sym) return { active: false, mode: '', reason: '' };

        const pctAt = (symbol, minutes) => {
            if (!symbol) return null;
            const s = String(symbol || '');
            const series = (data && data.series && Array.isArray(data.series[s])) ? data.series[s] : [];
            if (!series.length) return null;
            const last = series[series.length - 1];
            const lastT = last && last.t ? Date.parse(String(last.t)) : NaN;
            const lastP = last && typeof last.price === 'number' && Number.isFinite(last.price) ? last.price : null;
            if (!Number.isFinite(lastT) || lastP === null || !(lastP > 0)) return null;
            const target = lastT - (Number(minutes) * 60 * 1000);
            let prev = null;
            for (let i = series.length - 1; i >= 0; i -= 1) {
                const p = series[i];
                const t = p && p.t ? Date.parse(String(p.t)) : NaN;
                const price = p && typeof p.price === 'number' && Number.isFinite(p.price) ? p.price : null;
                if (!Number.isFinite(t) || price === null || !(price > 0)) continue;
                if (t <= target) { prev = { t, price }; break; }
            }
            if (!prev) return null;
            return ((lastP / prev.price) - 1) * 100;
        };

        const ok = v => typeof v === 'number' && Number.isFinite(v);
        const amp = volAmp && typeof volAmp.amp === 'number' && Number.isFinite(volAmp.amp) ? volAmp.amp : 1;
        const th60 = 0.18 / amp;
        const th15 = 0.08 / amp;
        const th5 = 0.05 / amp;
        const thEq = 0.10 / amp;
        const thFx = 0.05 / amp;
        const thVx = 0.18 / amp;

        const symWin = pulseNow.sym.win || null;
        const symWdo = pulseNow.sym.wdo || null;
        const symIbov = pulseNow.sym.ibov || findAliasSymbolBest(data, 'IBOV') || findAliasSymbol(data, 'IBOV') || findAssetSymbol(data, /(^\.BVSP$|\bIbovespa\b|\bIBOV\b)/i);
        const symEwz = pulseNow.sym.ewz || findAliasSymbolBest(data, 'EWZ') || findAliasSymbol(data, 'EWZ') || findAssetSymbol(data, /^EWZ(\.\w+)?$/i);
        const symUsd = pulseNow.sym.usdbrl || findAliasSymbolBest(data, 'USD_BRL') || findAliasSymbol(data, 'USD_BRL') || findAssetSymbol(data, /^USD\/BRL\b/i);
        const symVxbr = pulseNow.sym.vxbr || findAliasSymbolBest(data, 'VXBR') || findAssetSymbol(data, /(^\.VXBR$|\bVXBR\b)/i);

        const win60 = pctAt(symWin, 60);
        const win15 = pctAt(symWin, 15);
        const win5 = pctAt(symWin, 5);
        const wdo60 = pctAt(symWdo, 60);
        const wdo15 = pctAt(symWdo, 15);
        const ibov15 = pctAt(symIbov, 15);
        const ewz15 = pctAt(symEwz, 15);
        const usd15 = pctAt(symUsd, 15);
        const vxbr15 = pctAt(symVxbr, 15);

        const winDown = ok(win60) && ok(win15) && win60 <= -th60 && win15 <= -th15 && (!ok(win5) || win5 <= th5);
        const winUp = ok(win60) && ok(win15) && win60 >= th60 && win15 >= th15 && (!ok(win5) || win5 >= -th5);
        const wdoUp = ok(wdo60) && ok(wdo15) && wdo60 >= th60 && wdo15 >= th15;
        const wdoDown = ok(wdo60) && ok(wdo15) && wdo60 <= -th60 && wdo15 <= -th15;

        const confirmSell = [
            ok(ibov15) && ibov15 <= -thEq,
            ok(ewz15) && ewz15 <= -thEq,
            ok(usd15) && usd15 >= thFx,
            ok(vxbr15) && vxbr15 >= thVx,
            wdoUp,
        ].filter(Boolean).length;

        const confirmBuy = [
            ok(ibov15) && ibov15 >= thEq,
            ok(ewz15) && ewz15 >= thEq,
            ok(usd15) && usd15 <= -thFx,
            ok(vxbr15) && vxbr15 <= -thVx,
            wdoDown,
        ].filter(Boolean).length;

        const reasonBase = `WIN ${ok(win60) ? formatPercent(win60, 2) : '—'} / ${ok(win15) ? formatPercent(win15, 2) : '—'}${ok(win5) ? ` / ${formatPercent(win5, 2)}` : ''} • IBOV15 ${ok(ibov15) ? formatPercent(ibov15, 2) : '—'} • EWZ15 ${ok(ewz15) ? formatPercent(ewz15, 2) : '—'} • USD/BRL15 ${ok(usd15) ? formatPercent(usd15, 2) : '—'} • VXBR15 ${ok(vxbr15) ? formatPercent(vxbr15, 2) : '—'}`;

        if (winDown && confirmSell >= 2) {
            return { active: true, mode: 'risk_off_local', reason: `Fita local fraca: ${reasonBase}` };
        }
        if (winUp && confirmBuy >= 2) {
            return { active: true, mode: 'risk_on_local', reason: `Fita local forte: ${reasonBase}` };
        }
        return { active: false, mode: '', reason: '' };
    })();

    if (!priceLead.active && !trendLead.active && localTapeLead.active) {
        if (localTapeLead.mode === 'risk_off_local') {
            finalBias.WIN = { bias: 'sell', source: 'FITA_LOCAL' };
            finalBias.WDO = { bias: 'buy', source: 'FITA_LOCAL' };
        } else if (localTapeLead.mode === 'risk_on_local') {
            finalBias.WIN = { bias: 'buy', source: 'FITA_LOCAL' };
            finalBias.WDO = { bias: 'sell', source: 'FITA_LOCAL' };
        }
    }

    const pulseLead = (() => {
        if (!pulseNow || !pulseNow.pulse) return { active: false, wdo: null, win: null, reason: '' };
        const w = pulseNow.pulse.wdo;
        const i = pulseNow.pulse.win;
        const strong = x => x && typeof x.net === 'number' && Number.isFinite(x.net) && Math.abs(x.net) >= 0.95;
        if (!strong(w) || !strong(i)) return { active: false, wdo: null, win: null, reason: '' };
        const wb = w && w.bias ? w.bias : 'neutral';
        const ib = i && i.bias ? i.bias : 'neutral';
        const coherent =
            (wb === 'buy' && ib === 'sell')
            || (wb === 'sell' && ib === 'buy');
        if (!coherent) return { active: false, wdo: null, win: null, reason: '' };
        const reason = `WDO net ${formatNumber(w.net, 2)} • WIN net ${formatNumber(i.net, 2)}`;
        return { active: true, wdo: wb, win: ib, reason };
    })();

    if (!priceLead.active && pulseLead.active) {
        finalBias.WDO = { bias: pulseLead.wdo, source: 'PULSO' };
        finalBias.WIN = { bias: pulseLead.win, source: 'PULSO' };
    }

    const confidence = (() => {
        const base = regime && typeof regime.convictionScore === 'number' && Number.isFinite(regime.convictionScore)
            ? regime.convictionScore
            : 0.55;
        const conflicts = (combined.wdo.conflict ? 1 : 0) + (combined.win.conflict ? 1 : 0);
        const newsW = newsTilt.wdo.w || 0;
        const newsAdj = newsW >= 4 ? 0.06 : newsW >= 2 ? 0.03 : 0;
        const agendaAdj = (() => {
            const win = Array.isArray(agendaIntel.inWindow) ? agendaIntel.inWindow : [];
            const hasHigh = win.some(x => String(x.impact || '').toUpperCase() === 'ALTO');
            const hasMed = win.some(x => String(x.impact || '').toUpperCase() === 'MÉDIO' || String(x.impact || '').toUpperCase() === 'MEDIO');
            if (hasHigh) return -0.10;
            if (hasMed) return -0.06;
            if (String(agendaIntel.risk || '') === 'alto') return -0.06;
            if (String(agendaIntel.risk || '') === 'médio' || String(agendaIntel.risk || '') === 'medio') return -0.03;
            return 0;
        })();
        const macroAdj = (() => {
            let adj = 0;
            if (macroWdo.bias !== 'neutral' && macroWdo.bias === combined.wdo.bias) adj += 0.03;
            if (macroWin.bias !== 'neutral' && macroWin.bias === combined.win.bias) adj += 0.03;
            if (combined.wdo.conflict || combined.win.conflict) {
                if (macroWdo.bias === 'neutral' && macroWin.bias === 'neutral') adj -= 0.04;
                else adj += 0.00;
            }
            return adj;
        })();
        const priceAdj = priceLead.active ? 0.06 : 0;
        const trendAdj = (!priceLead.active && trendLead.active) ? 0.04 : 0;
        const localTapeAdj = (!priceLead.active && !trendLead.active && localTapeLead.active) ? 0.03 : 0;
        const pulseAdj = (!priceLead.active && !trendLead.active && pulseLead.active) ? 0.05 : 0;
        const alignAdj = (() => {
            if (!pulseNow || !pulseNow.align) return 0;
            let adj = 0;
            const wdo = pulseNow.align.wdo_usdbrl;
            if (wdo && wdo.ok === false) {
                const strong = typeof wdo.a === 'number' && Number.isFinite(wdo.a) && Math.abs(wdo.a) >= 0.12
                    && typeof wdo.b === 'number' && Number.isFinite(wdo.b) && Math.abs(wdo.b) >= 0.12;
                if (strong) adj -= 0.06;
            }
            const winIbov = pulseNow.align.win_ibov;
            const winEwz = pulseNow.align.win_ewz;
            const misaligned =
                (winIbov && winIbov.ok === false && typeof winIbov.a === 'number' && typeof winIbov.b === 'number' && Math.abs(winIbov.a) >= 0.10 && Math.abs(winIbov.b) >= 0.10)
                || (winEwz && winEwz.ok === false && typeof winEwz.a === 'number' && typeof winEwz.b === 'number' && Math.abs(winEwz.a) >= 0.10 && Math.abs(winEwz.b) >= 0.10);
            if (misaligned) adj -= 0.05;
            return adj;
        })();
        const out = Math.max(0, Math.min(1, base + newsAdj + agendaAdj + macroAdj + priceAdj + trendAdj + localTapeAdj + pulseAdj + alignAdj - conflicts * 0.10));
        const label = out >= 0.72 ? 'ALTA' : out >= 0.56 ? 'MÉDIA' : 'BAIXA';
        return { score: out, label };
    })();

    try {
        const forced = finalBias && (finalBias.WDO || finalBias.WIN)
            ? (finalBias.WDO.source === 'PREÇO' || finalBias.WDO.source === 'TENDÊNCIA' || finalBias.WDO.source === 'FITA_LOCAL' || finalBias.WDO.source === 'PULSO'
                || finalBias.WIN.source === 'PREÇO' || finalBias.WIN.source === 'TENDÊNCIA' || finalBias.WIN.source === 'FITA_LOCAL' || finalBias.WIN.source === 'PULSO')
            : false;
        const b2v = (b, k) => (b === 'buy' ? k : b === 'sell' ? -k : 0);
        const clamp11 = (x) => Math.max(-1, Math.min(1, typeof x === 'number' && Number.isFinite(x) ? x : 0));
        const driversFor = (symbol) => {
            const sym = String(symbol || '').toUpperCase();
            const isWdo = sym === 'WDO';
            const isWin = sym === 'WIN';
            const fb = isWdo ? finalBias.WDO : isWin ? finalBias.WIN : { bias: 'neutral', source: '—' };
            const nt = isWdo ? newsTilt.wdo : newsTilt.win;
            const mb = isWdo ? macroWdo : macroWin;
            const out = [];

            if (fb && fb.source === 'PREÇO' && priceLead && priceLead.active && priceLead.reason) {
                out.push({ label: `PREÇO: ${String(priceLead.reason)}`, val: b2v(fb.bias, 0.95) });
            } else if (fb && fb.source === 'TENDÊNCIA' && trendLead && trendLead.active && trendLead.reason) {
                out.push({ label: `TENDÊNCIA: ${String(trendLead.reason)}`, val: b2v(fb.bias, 0.85) });
            } else if (fb && fb.source === 'FITA_LOCAL' && localTapeLead && localTapeLead.active && localTapeLead.reason) {
                out.push({ label: `FITA_LOCAL: ${String(localTapeLead.reason)}`, val: b2v(fb.bias, 0.82) });
            } else if (fb && fb.source === 'PULSO' && pulseLead && pulseLead.active && pulseLead.reason) {
                out.push({ label: `PULSO: ${String(pulseLead.reason)}`, val: b2v(fb.bias, 0.78) });
            }

            if (regime && regimeBias) {
                const rb = isWdo ? regimeBias.wdo : isWin ? regimeBias.win : 'neutral';
                if (rb !== 'neutral') out.push({ label: `Regime: ${String(regime.label || '—')}`, val: b2v(rb, 0.60) });
            }
            if (web && nt && typeof nt.score === 'number' && Number.isFinite(nt.score)) {
                const v = clamp11(nt.score) * 0.55;
                if (Math.abs(v) > 0.001) out.push({ label: `News tilt: ${fmt1(nt.score)}`, val: v });
            }
            if (diSignal && diSignal.ok) {
                const db = isWdo ? diSignal.wdoBias : isWin ? diSignal.winBias : 'neutral';
                if (db !== 'neutral') out.push({ label: `DI: ${String(diSignal.shape || '—')}`, val: b2v(db, 0.45) });
            }

            if (fb && fb.source === 'MACRO' && mb && Array.isArray(mb.parts) && mb.parts.length) {
                const parts = mb.parts
                    .slice()
                    .filter(p => p && typeof p.val === 'number' && Number.isFinite(p.val))
                    .sort((a, b) => Math.abs(b.val) - Math.abs(a.val))
                    .slice(0, 4)
                    .map(p => ({ label: String(p.label || 'Macro'), val: clamp11(p.val) * 0.70 }));
                out.push(...parts);
            }

            return out;
        };

        const macroWinCompass = forced
            ? { ...macroWin, bias: 'neutral' }
            : (finalBias && finalBias.WIN && finalBias.WIN.source === 'MACRO' ? macroWin : { ...macroWin, bias: 'neutral' });
        const macroWdoCompass = forced
            ? { ...macroWdo, bias: 'neutral' }
            : (finalBias && finalBias.WDO && finalBias.WDO.source === 'MACRO' ? macroWdo : { ...macroWdo, bias: 'neutral' });
        const model = buildOperationalCompassModel({
            regime,
            options,
            web,
            foreignFlow,
            focus,
            macroWin: macroWinCompass,
            macroWdo: macroWdoCompass,
            fallbackBias: { win: finalBias.WIN.bias, wdo: finalBias.WDO.bias },
            drivers: { win: driversFor('WIN'), wdo: driversFor('WDO') },
        });
        renderOperationalCompass(model);
    } catch {
        try { renderOperationalCompass(null); } catch { }
    }

    const badge = (tone, text, strength) => pillHtml('signal', tone, text, strength);

    const biasTone = b => (b === 'buy' ? 'positive' : b === 'sell' ? 'negative' : 'neutral');
    const biasLabel = (symbol, b) => {
        if (b === 'buy') return `${symbol}: COMPRA`;
        if (b === 'sell') return `${symbol}: VENDA`;
        return `${symbol}: NEUTRO`;
    };

    const finalScoreFor = symbol => {
        const nb = symbol === 'WDO' ? newsTilt.wdo.score : newsTilt.win.score;
        const mb = symbol === 'WDO' ? macroWdo.score : macroWin.score;
        const fb = symbol === 'WDO' ? finalBias.WDO : finalBias.WIN;
        const bDir = fb && fb.bias === 'buy' ? 1 : fb && fb.bias === 'sell' ? -1 : 0;
        const src = fb && fb.source ? String(fb.source) : '';
        const clamp = (x) => Math.max(-1, Math.min(1, x));
        if (bDir !== 0 && (src === 'PREÇO' || src === 'TENDÊNCIA' || src === 'FITA_LOCAL' || src === 'PULSO')) {
            const w = src === 'PREÇO' ? 0.9 : src === 'TENDÊNCIA' ? 0.8 : src === 'FITA_LOCAL' ? 0.82 : 0.75;
            return clamp((w * bDir) + (0.15 * nb) + (0.10 * mb));
        }
        const rb = symbol === 'WDO' ? regimeBias.wdo : regimeBias.win;
        const dir = rb === 'buy' ? 1 : rb === 'sell' ? -1 : 0;
        return clamp((0.5 * dir) + (0.4 * nb) + (0.3 * mb));
    };

    const gaugeHtml = (label, score) => {
        const deg = Math.round(Math.max(-1, Math.min(1, score)) * 60);
        const tone = score > 0.22 ? 'positive' : score < -0.22 ? 'negative' : 'neutral';
        const arcGrad = 'linear-gradient(90deg, rgba(255,60,80,.85) 0%, rgba(255,210,74,.85) 50%, rgba(0,255,160,.85) 100%)';
        const glow = tone === 'positive' ? '0 0 18px rgba(0,255,160,.35)' : tone === 'negative' ? '0 0 18px rgba(255,60,80,.35)' : '0 0 18px rgba(255,210,74,.28)';
        return `
            <div style="display:flex;align-items:center;gap:10px;">
                <div style="width:98px;height:54px;border:1px solid rgba(255,255,255,.18);border-radius:98px 98px 0 0;background:rgba(0,0,0,.22);position:relative;overflow:hidden;box-shadow:${glow};">
                    <div style="position:absolute;left:6px;right:6px;bottom:6px;height:10px;border-radius:999px;background:${arcGrad};opacity:.85;"></div>
                    <div style="position:absolute;left:50%;bottom:6px;width:3px;height:42px;background:${tone === 'positive' ? 'rgba(0,255,160,.95)' : tone === 'negative' ? 'rgba(255,60,80,.95)' : 'rgba(255,210,74,.95)'};transform-origin:bottom center;transform:translateX(-50%) rotate(${deg}deg);box-shadow:0 0 14px rgba(255,255,255,.22);border-radius:3px;"></div>
                    <div style="position:absolute;left:10px;bottom:6px;width:6px;height:6px;border-radius:999px;background:rgba(255,255,255,.35);"></div>
                    <div style="position:absolute;left:26px;bottom:6px;width:6px;height:6px;border-radius:999px;background:rgba(255,255,255,.25);"></div>
                    <div style="position:absolute;right:26px;bottom:6px;width:6px;height:6px;border-radius:999px;background:rgba(255,255,255,.25);"></div>
                    <div style="position:absolute;right:10px;bottom:6px;width:6px;height:6px;border-radius:999px;background:rgba(255,255,255,.35);"></div>
                </div>
                <div style="font-family:'Share Tech Mono',monospace;font-weight:900;letter-spacing:.5px;">${escapeHtml(label)} ${toneBadgeHtmlFromTone(tone, score, formatNumber(score, 2), { maxAbs: 1 })}</div>
            </div>
        `;
    };

    const makePlan = item => {
        const sym = item && item.symbol ? String(item.symbol) : '—';
        const spot = item && typeof item.spot === 'number' ? item.spot : null;
        const r = item && item.regime ? String(item.regime) : '';
        const gammaTone = /negativo/i.test(r) ? 'negative' : /positivo/i.test(r) ? 'positive' : 'neutral';
        const gammaLabel = r ? r : 'Gamma N/A';
        const key = item && item.keyLevels ? item.keyLevels : {};

        const gf = typeof key.gammaFlip === 'number' && Number.isFinite(key.gammaFlip) ? key.gammaFlip : null;
        const put = typeof key.effectivePutWall === 'number' && Number.isFinite(key.effectivePutWall)
            ? key.effectivePutWall
            : (typeof key.putWall === 'number' && Number.isFinite(key.putWall) ? key.putWall : null);
        const call = typeof key.effectiveCallWall === 'number' && Number.isFinite(key.effectiveCallWall)
            ? key.effectiveCallWall
            : (typeof key.callWall === 'number' && Number.isFinite(key.callWall) ? key.callWall : null);
        const rangeLow = typeof key.rangeLow === 'number' && Number.isFinite(key.rangeLow) ? key.rangeLow : null;
        const rangeHigh = typeof key.rangeHigh === 'number' && Number.isFinite(key.rangeHigh) ? key.rangeHigh : null;
        const maxPain = typeof key.maxPain === 'number' && Number.isFinite(key.maxPain) ? key.maxPain : null;

        const width = (typeof rangeLow === 'number' && typeof rangeHigh === 'number' && rangeHigh > rangeLow)
            ? rangeHigh - rangeLow
            : (typeof spot === 'number' ? Math.abs(spot) * 0.012 : 0);
        const near = width > 0 ? width * 0.12 : 0;
        const isNear = (a, b) => typeof a === 'number' && typeof b === 'number' && near > 0 ? Math.abs(a - b) <= near : false;

        const fb = sym === 'WDO' ? finalBias.WDO : sym === 'WIN' ? finalBias.WIN : { bias: 'neutral', source: '—' };
        const bias = fb.bias;

        const gate = (() => {
            if (bias === 'buy') {
                if (typeof gf === 'number' && typeof spot === 'number') return spot >= gf ? `Manter compra acima do Gamma Flip (${fmt0(gf)})` : `Aguardar retomar Gamma Flip (${fmt0(gf)})`;
                return 'Comprar apenas com confirmação (evitar “chase”).';
            }
            if (bias === 'sell') {
                if (typeof gf === 'number' && typeof spot === 'number') return spot <= gf ? `Manter venda abaixo do Gamma Flip (${fmt0(gf)})` : `Aguardar perder Gamma Flip (${fmt0(gf)})`;
                return 'Vender apenas com confirmação (evitar “chase”).';
            }
            if (/positivo/i.test(r)) return 'Sem viés claro: priorize range (comprar perto do fundo, vender perto do topo).';
            if (/negativo/i.test(r)) return 'Sem viés claro: aguarde rompimento com confirmação (tendência).';
            return 'Sem viés claro: reduzir tamanho e operar só nos níveis.';
        })();

        const targets = (() => {
            if (bias === 'buy') {
                const t1 = typeof call === 'number' ? `Alvo 1: ${fmt0(call)} (CallWall)` : (typeof rangeHigh === 'number' ? `Alvo 1: ${fmt0(rangeHigh)} (Range High)` : null);
                const t2 = typeof maxPain === 'number' ? `Referência: ${fmt0(maxPain)} (MaxPain)` : null;
                return [t1, t2].filter(Boolean).join(' • ') || 'Alvos: —';
            }
            if (bias === 'sell') {
                const t1 = typeof put === 'number' ? `Alvo 1: ${fmt0(put)} (PutWall)` : (typeof rangeLow === 'number' ? `Alvo 1: ${fmt0(rangeLow)} (Range Low)` : null);
                const t2 = typeof maxPain === 'number' ? `Referência: ${fmt0(maxPain)} (MaxPain)` : null;
                return [t1, t2].filter(Boolean).join(' • ') || 'Alvos: —';
            }
            return `Níveis: GF ${fmt0(gf)} • Put ${fmt0(put)} • Call ${fmt0(call)} • Range ${fmt0(rangeLow)}–${fmt0(rangeHigh)}`;
        })();

        const stop = (() => {
            if (bias === 'buy') {
                const s = typeof put === 'number' ? `Stop: abaixo de ${fmt0(put)} (PutWall)` : (typeof rangeLow === 'number' ? `Stop: abaixo de ${fmt0(rangeLow)} (Range Low)` : 'Stop: invalidar no rompimento contra.');
                return s;
            }
            if (bias === 'sell') {
                const s = typeof call === 'number' ? `Stop: acima de ${fmt0(call)} (CallWall)` : (typeof rangeHigh === 'number' ? `Stop: acima de ${fmt0(rangeHigh)} (Range High)` : 'Stop: invalidar no rompimento contra.');
                return s;
            }
            return '';
        })();

        const zone = (() => {
            if (typeof spot !== 'number') return 'Zona: —';
            if (isNear(spot, rangeHigh) || isNear(spot, call)) return 'Zona: perto do topo';
            if (isNear(spot, rangeLow) || isNear(spot, put)) return 'Zona: perto do fundo';
            if (typeof gf === 'number') return `Zona: ${spot >= gf ? 'acima' : 'abaixo'} do Gamma Flip`;
            return 'Zona: —';
        })();

        const note = /positivo/i.test(r)
            ? 'Gamma +: tende a mean reversion; prefira entradas “bem posicionadas” em nível.'
            : /negativo/i.test(r)
                ? 'Gamma -: tende a acelerar; prefira rompimento confirmado e gestão rápida.'
                : 'Gamma: sem leitura.';

        const whyLines = (() => {
            const lines = [];
            const symKey = sym === 'WDO' ? 'wdo' : sym === 'WIN' ? 'win' : '';
            const biasTxt = bias === 'buy' ? 'COMPRA' : bias === 'sell' ? 'VENDA' : 'NEUTRO';
            if (regime && regime.label && regime.operational && symKey && regime.operational[symKey]) {
                lines.push(`Regime (${regime.label}): ${String(regime.operational[symKey])}`);
            } else if (regime && regime.label) {
                lines.push(`Regime: ${String(regime.label)}`);
            }
            const nt = sym === 'WDO' ? newsTilt.wdo : newsTilt.win;
            if (web && typeof nt.score === 'number' && Number.isFinite(nt.score)) {
                const nb = nt.bias === 'buy' ? 'COMPRA' : nt.bias === 'sell' ? 'VENDA' : 'NEUTRO';
                lines.push(`News tilt: ${fmt1(nt.score)} → ${nb}`);
            }
            if (priceLead.active && fb.source === 'PREÇO') {
                lines.push(`Preço liderando: ${priceLead.reason}`);
            }
            if (!priceLead.active && trendLead.active && fb.source === 'TENDÊNCIA') {
                lines.push(trendLead.reason);
            }
            if (!priceLead.active && !trendLead.active && localTapeLead.active && fb.source === 'FITA_LOCAL') {
                lines.push(localTapeLead.reason);
            }
            if (!priceLead.active && pulseLead.active && fb.source === 'PULSO') {
                lines.push(`Pulso (drivers+preço): ${pulseLead.reason}`);
            }
            if (pulseNow && pulseNow.align && pulseNow.align.wdo_usdbrl && pulseNow.align.wdo_usdbrl.ok === false) {
                const a = pulseNow.align.wdo_usdbrl;
                const ax = (typeof a.a === 'number' && Number.isFinite(a.a)) ? formatPercent(a.a, 2) : '—';
                const bx = (typeof a.b === 'number' && Number.isFinite(a.b)) ? formatPercent(a.b, 2) : '—';
                lines.push(`Alerta: WDO vs USD/BRL desalinhados (WDO ${ax} vs USD/BRL ${bx})`);
            }
            if (combined && ((sym === 'WDO' && combined.wdo && combined.wdo.conflict) || (sym === 'WIN' && combined.win && combined.win.conflict))) {
                lines.push('Regime x News em conflito → decisão por Macro');
            }
            if (fb.source === 'MACRO') {
                const m = sym === 'WDO' ? macroWdo : macroWin;
                const mb = m && m.bias ? (m.bias === 'buy' ? 'COMPRA' : m.bias === 'sell' ? 'VENDA' : 'NEUTRO') : 'NEUTRO';
                const ms = m && typeof m.score === 'number' && Number.isFinite(m.score) ? fmt1(m.score) : '—';
                lines.push(`Macro: score ${ms} → ${mb}`);
                const parts = m && Array.isArray(m.parts) ? m.parts.slice() : [];
                parts.sort((a, b) => Math.abs(b.val || 0) - Math.abs(a.val || 0));
                const top = parts.slice(0, 3).map(p => String(p.label || '')).filter(Boolean);
                if (top.length) lines.push(`Drivers: ${top.join(' • ')}`);
            }
            if (brBreadthSectorSignal && brBreadthSectorSignal.ok && brBreadthSectorSignal.detail) {
                lines.push(`Fita BR (breadth/setores): ${brBreadthSectorSignal.detail}`);
            }
            if (diSignal && diSignal.ok) {
                const a = diSignal.anchors || {};
                const anchorShort = a && a.short ? a.short : null;
                const d = anchorShort && typeof anchorShort.chgPct === 'number' && Number.isFinite(anchorShort.chgPct) ? `${(anchorShort.chgPct * 10) > 0 ? '+' : ''}${formatNumber(anchorShort.chgPct * 10, 1)}bp` : '—';
                const b = sym === 'WDO' ? diSignal.wdoBias : sym === 'WIN' ? diSignal.winBias : 'neutral';
                const bt = b === 'buy' ? 'COMPRA' : b === 'sell' ? 'VENDA' : 'NEUTRO';
                const lab = anchorShort && anchorShort.symbol ? `Curto ${anchorShort.symbol}` : 'Curto';
                lines.push(`DI (B3): ${diSignal.shape} • ${lab} Δ ${d} → ${bt}`);
            }
            const a = agendaIntel && agendaIntel.inWindow ? agendaIntel.inWindow : [];
            if (a && a.length) {
                const top = a.slice(0, 2).map(e => {
                    const imp = String(e.impact || '').toUpperCase();
                    const cur = String(e.currency || '').toUpperCase();
                    const tt = e.time ? String(e.time) : '';
                    const ev = e.event ? String(e.event) : '';
                    const wdo = e.wdo ? String(e.wdo) : '—';
                    const win = e.win ? String(e.win) : '—';
                    return `${imp} ${cur} ${tt} • ${ev} • WDO ${wdo} / WIN ${win}`;
                });
                lines.push(`Agenda: janela de evento (${top.join(' | ')})`);
                if (agendaIfThen && Array.isArray(agendaIfThen.lines) && agendaIfThen.lines.length) {
                    const conf = agendaValidation && typeof agendaValidation.score === 'number' && Number.isFinite(agendaValidation.score)
                        ? ` • Conf ${agendaValidation.label} (${formatNumber(agendaValidation.score * 100, 0)}%)`
                        : '';
                    const val = agendaValidation && Array.isArray(agendaValidation.keys) && agendaValidation.keys.length
                        ? ` • Validar ${agendaValidation.keys.join('/')}`
                        : '';
                    lines.push(`Se–então (matriz): ${agendaIfThen.lines.join(' | ')}${agendaIfThen.source ? ` • ${agendaIfThen.source}` : ''}${conf}${val}`);
                }
            }
            if (r) lines.push(`Execução: ${gammaLabel} (define tipo de execução, não o lado)`);
            lines.push(`Saída: ${sym} ${biasTxt} (Fonte: ${fb.source})`);
            return lines;
        })();

        return `
            <div style="border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:12px;background:rgba(0,0,0,.18);">
                <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
                    <div style="font-weight:900;letter-spacing:1px;">${escapeHtml(sym)}</div>
                    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
                        ${badge(biasTone(bias), biasLabel(sym, bias))}
                        ${badge(gammaTone, gammaLabel)}
                        ${badge('neutral', `Fonte: ${fb.source}`)}
                    </div>
                    <div style="margin-top:8px;width:100%;">${gaugeHtml(sym, finalScoreFor(sym))}</div>
                </div>
                <div style="margin-top:10px;display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;">
                    <div style="opacity:.92;">
                        <div style="font-family:'Share Tech Mono',monospace;font-weight:900;">Spot: ${fmt0(spot)}</div>
                        <div style="opacity:.85;margin-top:6px;">${escapeHtml(zone)}</div>
                        <div style="opacity:.85;margin-top:6px;">GF ${fmt0(gf)} • Put ${fmt0(put)} • Call ${fmt0(call)}</div>
                        <div style="opacity:.85;margin-top:6px;">Range ${fmt0(rangeLow)}–${fmt0(rangeHigh)} • MaxPain ${fmt0(maxPain)}</div>
                    </div>
                    <div style="opacity:.92;line-height:1.4;">
                        <div style="font-weight:900;letter-spacing:.6px;">Plano</div>
                        <div style="margin-top:6px;">${escapeHtml(gate)}</div>
                        <div style="margin-top:6px;">${escapeHtml(targets)}</div>
                        ${stop ? `<div style="margin-top:6px;opacity:.90;">${escapeHtml(stop)}</div>` : ''}
                        <div style="margin-top:10px;border-top:1px solid rgba(255,255,255,.10);padding-top:10px;">
                            <div style="font-weight:900;letter-spacing:.6px;">Por quê</div>
                            <ul style="margin:6px 0 0 18px;padding:0;opacity:.84;font-size:12px;line-height:1.35;">
                                ${(whyLines || []).map(x => `<li>${escapeHtml(x)}</li>`).join('') || '<li>—</li>'}
                            </ul>
                        </div>
                        <div style="margin-top:6px;opacity:.78;font-size:12px;">${escapeHtml(note)}</div>
                    </div>
                </div>
            </div>
        `;
    };

    const items = options && options.items ? [options.items.WDO, options.items.WIN].filter(Boolean) : [];
    const cdsSignal = computeBrazilCdsHedgeSignal(data);

    const regimeLine = regime
        ? `${String(regime.label || '—')} • convicção ${String(regime.convictionLabel || '—')} (${fmt0((regime.convictionScore || 0) * 100)}%)`
        : 'Regime: —';

    const agendaLine = (() => {
        const next = agendaNext;
        if (!next) return 'Agenda: —';
        const imp = String(next.impact || '').toUpperCase() || '—';
        const cur = String(next.currency || '').toUpperCase() || '—';
        const tt = next.time ? String(next.time) : '—';
        const ev = next.event ? String(next.event) : '—';
        const wdo = next.wdo ? String(next.wdo) : '—';
        const win = next.win ? String(next.win) : '—';
        const key = next.matrixKey ? ` • key ${String(next.matrixKey)}` : '';
        const m = typeof next.minutesTo === 'number' && Number.isFinite(next.minutesTo) ? next.minutesTo : null;
        const when = m === null ? '' : (m < 0 ? ` (há ${String(Math.abs(Math.round(m)))}m)` : ` (em ${String(Math.round(m))}m)`);
        const seEntao = (agendaIfThen && Array.isArray(agendaIfThen.lines) && agendaIfThen.lines.length)
            ? ` • Se–então: ${agendaIfThen.lines.join(' | ')}${agendaIfThen.source ? ` (${agendaIfThen.source})` : ''}`
            : '';
        const conf = agendaValidation && typeof agendaValidation.score === 'number' && Number.isFinite(agendaValidation.score)
            ? ` • Conf ${agendaValidation.label} (${formatNumber(agendaValidation.score * 100, 0)}%)`
            : '';
        const val = agendaValidation && Array.isArray(agendaValidation.keys) && agendaValidation.keys.length
            ? ` • Validar ${agendaValidation.keys.join('/')}`
            : '';
        return `Agenda: ${imp} ${cur} ${tt}${when} • WDO ${wdo} / WIN ${win}${key} • ${ev}${seEntao}${conf}${val}`;
    })();

    const newsLine = web
        ? `News tilt (-1..+1): WDO ${fmt1(newsTilt.wdo.score)} • WIN ${fmt1(newsTilt.win.score)}`
        : 'News tilt: —';

    const macroLine = (() => {
        const ymdToBr = ymd => {
            const s = String(ymd || '');
            if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return '—';
            return `${s.slice(8, 10)}/${s.slice(5, 7)}`;
        };

        const foreignPart = (() => {
            if (!foreignFlow || !foreignFlow.derived || !foreignFlow.derived.foreigners) return 'Fluxo estrangeiro: —';
            const cum5 = foreignFlow.derived.foreigners.cum5;
            const last = foreignFlow.latest && typeof foreignFlow.latest.foreigners === 'number' ? foreignFlow.latest.foreigners : null;
            const lastDate = foreignFlow.latest && foreignFlow.latest.date ? ymdToBr(foreignFlow.latest.date) : '—';
            const t = typeof operationalTuning.threshold.foreignFlow === 'number' ? operationalTuning.threshold.foreignFlow : 0.25;
            const score = foreignFlow.signal && typeof foreignFlow.signal.score === 'number' && Number.isFinite(foreignFlow.signal.score) ? foreignFlow.signal.score : 0;
            const abs = Math.abs(score);
            const dir = score > t ? 'ENTRANDO' : score < -t ? 'SAINDO' : 'NEUTRO';
            const strength = abs >= Math.max(0.5, t * 2) ? 'FORTE' : abs >= t ? 'DIRECIONAL' : 'NEUTRO';
            const diverge =
                typeof last === 'number'
                    ? Math.sign(last) !== 0 && Math.sign(cum5) !== 0 && Math.sign(last) !== Math.sign(cum5)
                    : false;
            const alert = dir === 'NEUTRO'
                ? null
                : `${strength} ${dir}${diverge ? ' • divergência no último dia' : ''}`;

            const hypothesis = (() => {
                if (!data) return null;
                if (dir === 'NEUTRO') return null;
                const symUsd = findAliasSymbolBest(data, 'USD_BRL') || findAssetSymbol(data, /^USD\/BRL\b/i);
                const symIbov = findAliasSymbolBest(data, 'IBOV') || findAssetSymbol(data, /(^\.BVSP$|\bIbovespa\b|\bIBOV\b)/i);
                const symEwz = findAliasSymbolBest(data, 'EWZ') || findAssetSymbol(data, /^EWZ$/i);
                const symBr10y = rcKey('BR_10Y', /^BR10YT=RR$/i) || aliasSym('BR10Y') || pickBestByMatchers([/^BR10YT=RR$/i]);
                const usd = symUsd ? getChangePct(data, symUsd) : null;
                const ibov = symIbov ? getChangePct(data, symIbov) : null;
                const ewz = symEwz ? getChangePct(data, symEwz) : null;
                const br10y = symBr10y ? yieldBp10FromSymbol(symBr10y) : null;

                const hasUsd = typeof usd === 'number' && Number.isFinite(usd);
                const hasIbov = typeof ibov === 'number' && Number.isFinite(ibov);
                const hasEwz = typeof ewz === 'number' && Number.isFinite(ewz);
                const hasBr10y = typeof br10y === 'number' && Number.isFinite(br10y);
                const eq = (() => {
                    const xs = [];
                    if (hasIbov) xs.push(ibov);
                    if (hasEwz) xs.push(ewz);
                    return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null;
                })();
                const hasEq = typeof eq === 'number' && Number.isFinite(eq);

                const brlStronger = hasUsd && usd < -0.25;
                const brlWeaker = hasUsd && usd > 0.25;
                const eqUp = hasEq && eq > 0.25;
                const eqDown = hasEq && eq < -0.25;
                const yieldsDown = hasBr10y && br10y < -0.35;
                const yieldsUp = hasBr10y && br10y > 0.35;

                let label = null;
                if (dir === 'ENTRANDO') {
                    if (brlStronger && yieldsDown && !eqUp) label = 'Hipótese: entrada via juros/títulos (carry)';
                    else if (brlStronger && eqUp) label = 'Hipótese: entrada via ações/índice (risk-on local)';
                    else if (brlWeaker) label = 'Hipótese: fluxo com hedge (derivativos) ou compra de USD';
                    else label = 'Hipótese: entrada para caixa/espera (ainda sem confirmação em preço)';
                } else if (dir === 'SAINDO') {
                    if (brlWeaker && eqDown) label = 'Hipótese: saída de risco (equities) + pressão em FX';
                    else if (yieldsUp && brlWeaker) label = 'Hipótese: desmonte de carry/juros + FX';
                    else label = 'Hipótese: saída parcial (sem confirmação clara em preço)';
                }

                const confirms = [brlStronger || brlWeaker, eqUp || eqDown, yieldsDown || yieldsUp].filter(Boolean).length;
                const available = [hasUsd, hasEq, hasBr10y].filter(Boolean).length;
                const conf = available >= 2 ? (confirms >= 2 ? 'alta' : confirms === 1 ? 'média' : 'baixa') : 'baixa';
                return label ? `${label} • confiança ${conf}` : null;
            })();

            const bits = [
                `Fluxo estrangeiro (5 dias úteis até ${lastDate}) ${formatBrlCompact(cum5, 2)}`,
                `Último dia divulgado (${lastDate}) ${formatBrlCompact(last, 2)}`,
                foreignFlow && foreignFlow.source && foreignFlow.source.updatedAtText ? `Fonte ${String(foreignFlow.source.updatedAtText)}` : null,
                foreignFlow.generatedAt ? `Coletado ${formatDateTime(String(foreignFlow.generatedAt))}` : null,
                alert ? `ALERTA: ${alert}` : null,
                hypothesis,
            ].filter(Boolean);
            return bits.join(' • ');
        })();

        if (!macro) return foreignPart;
        const corrPart = (() => {
            const c = macro.em && macro.em.corrUsdBrlEmBasket ? macro.em.corrUsdBrlEmBasket : null;
            if (!c || typeof c.corr !== 'number' || !Number.isFinite(c.corr)) return null;
            const n = typeof c.n === 'number' && Number.isFinite(c.n) && c.n > 0 ? Math.floor(c.n) : 0;
            return `Corr BRL×EM ${formatNumber(c.corr, 2)}${n ? ` (n=${String(n)})` : ''}`;
        })();
        const extras = (() => {
            if (!data) return '';
            const parts = [];
            const y = macro && macro.yields ? macro.yields : null;
            const symUs10 = rcKey('US_10Y', /(^US10YT=RR$|^\^TNX$|\bUS\s*10Y\b|^\.TNX$)/i) || aliasSym('US10Y') || pickBestByMatchers([/(^US10YT=RR$|^\^TNX$|\bUS\s*10Y\b|^\.TNX$)/i]);
            const us10 = yieldBp10FromSymbol(symUs10);
            if (typeof us10 === 'number' && Number.isFinite(us10)) parts.push(`US10Y Δ ${(us10 * 10) > 0 ? '+' : ''}${formatNumber(us10 * 10, 1)}bp`);
            const symBr10 = rcKey('BR_10Y', /^BR10YT=RR$/i) || aliasSym('BR10Y') || pickBestByMatchers([/^BR10YT=RR$/i]);
            const br10 = yieldBp10FromSymbol(symBr10);
            if (typeof br10 === 'number' && Number.isFinite(br10)) parts.push(`BR10Y Δ ${(br10 * 10) > 0 ? '+' : ''}${formatNumber(br10 * 10, 1)}bp`);
            const zq = macro && macro.zq ? macro.zq : null;
            if (zq && typeof zq.slopePct === 'number' && Number.isFinite(zq.slopePct)) {
                const rm = zq.riskMode ? String(zq.riskMode) : '';
                parts.push(`FedFunds ZQ ${rm ? `${rm} ` : ''}slope ${formatNumber(zq.slopePct, 2)}%`);
            }
            const fs = macro && macro.flowSentinel ? macro.flowSentinel : null;
            if (fs && typeof fs.composite === 'number' && Number.isFinite(fs.composite)) {
                const lab = fs.label ? String(fs.label) : '';
                const riskScore = fs.risk && typeof fs.risk.score === 'number' && Number.isFinite(fs.risk.score) ? fs.risk.score : null;
                const protScore = fs.protection && typeof fs.protection.score === 'number' && Number.isFinite(fs.protection.score) ? fs.protection.score : null;
                const bits = [
                    `FlowSentinel ${lab ? `${lab} ` : ''}${formatNumber(fs.composite, 3)}`,
                    (typeof fs.delta === 'number' && Number.isFinite(fs.delta)) ? `Δ ${formatNumber(fs.delta, 3)}` : null,
                    riskScore !== null ? `Risco ${formatNumber(riskScore, 3)}` : null,
                    protScore !== null ? `Prot ${formatNumber(protScore, 3)}` : null,
                    fs.divergence ? 'DIVERGENTE' : null,
                ].filter(Boolean);
                parts.push(bits.join(' • '));
            }
            const symSpx = findAliasSymbolBest(data, 'SPX') || findAliasSymbol(data, 'SPX');
            const spxPct = symSpx ? getChangePct(data, symSpx) : null;
            if (typeof spxPct === 'number' && Number.isFinite(spxPct)) {
                const isFut = /^ES[HMUZ]\d{2}$/i.test(String(symSpx || ''));
                parts.push(`S&P500${isFut ? ' (fut)' : ''} ${formatPercent(spxPct, 2)}`);
            }
            const symNdx = findAliasSymbolBest(data, 'NDX') || findAliasSymbol(data, 'NDX');
            const ndxPct = symNdx ? getChangePct(data, symNdx) : null;
            if (typeof ndxPct === 'number' && Number.isFinite(ndxPct)) {
                const isFut = /^NQ[HMUZ]\d{2}$/i.test(String(symNdx || ''));
                parts.push(`Nasdaq100${isFut ? ' (fut)' : ''} ${formatPercent(ndxPct, 2)}`);
            }
            const symIbov = findAliasSymbolBest(data, 'WIN') || findAliasSymbolBest(data, 'IBOV') || findAliasSymbol(data, 'IBOV');
            const ibovPct = symIbov ? getChangePct(data, symIbov) : null;
            if (typeof ibovPct === 'number' && Number.isFinite(ibovPct)) {
                const isFut = /^WINc\d$/i.test(String(symIbov || ''));
                parts.push(`Ibovespa${isFut ? ' (fut)' : ''} ${formatPercent(ibovPct, 2)}`);
            }
            const symBr20 = findAliasSymbolBest(data, 'BR20') || findAliasSymbol(data, 'BR20');
            const br20Pct = symBr20 ? getChangePct(data, symBr20) : null;
            if (typeof br20Pct === 'number' && Number.isFinite(br20Pct)) {
                parts.push(`BR20 ${formatPercent(br20Pct, 2)}`);
            }
            const symUsdBrl = findAliasSymbolBest(data, 'WDO') || findAliasSymbol(data, 'USD_BRL');
            const usdbrlPct = symUsdBrl ? getChangePct(data, symUsdBrl) : null;
            if (typeof usdbrlPct === 'number' && Number.isFinite(usdbrlPct)) {
                const isFut = /^WDOc\d$/i.test(String(symUsdBrl || ''));
                parts.push(`USD/BRL${isFut ? ' (fut)' : ''} ${formatPercent(usdbrlPct, 2)}`);
            }
            const symEwz = findAliasSymbolBest(data, 'EWZ') || findAliasSymbol(data, 'EWZ') || findAssetSymbol(data, /^EWZS(\.\w+)?$/i);
            const ewzPct = symEwz ? getChangePct(data, symEwz) : null;
            if (typeof ewzPct === 'number' && Number.isFinite(ewzPct)) {
                const isSmall = /^EWZS(\.\w+)?$/i.test(String(symEwz || ''));
                parts.push(`Brasil${isSmall ? ' (small caps)' : ''} ${formatPercent(ewzPct, 2)}`);
            }
            const symVix =
                findAliasSymbolBest(data, 'VIX9D') ||
                findAliasSymbolBest(data, 'VIX30') ||
                findAliasSymbolBest(data, 'VIX') ||
                findAliasSymbol(data, 'VIX') ||
                findAssetSymbol(data, /^\.?VIX(9D)?$/i);
            const vixPct = symVix ? getChangePct(data, symVix) : null;
            if (typeof vixPct === 'number' && Number.isFinite(vixPct)) {
                const label = String(symVix).toUpperCase().includes('VIX9D') ? 'VIX9D' : 'VIX';
                parts.push(`Vol ${label} ${formatPercent(vixPct, 2)}`);
            }
            return parts.length ? ` • ${parts.join(' • ')}` : '';
        })();
        const brFlowPart = (brFlowSignal && typeof brFlowSignal.score === 'number' && Number.isFinite(brFlowSignal.score))
            ? `Fluxo→BR ${brFlowSignal.label} (${formatNumber(brFlowSignal.score, 2)}${brFlowSignal.detail ? ` • ${brFlowSignal.detail}` : ''})`
            : 'Fluxo→BR: —';
        return `Flow ${String(macro.flow ? macro.flow.label : '—')} • ${foreignPart} • ${brFlowPart} • DXY ${typeof macro.dxyPct === 'number' ? formatPercent(macro.dxyPct, 2) : '—'} • Export ${typeof macro.exportScore === 'number' ? formatPercent(macro.exportScore, 2) : '—'} • EM ${typeof (macro.em && macro.em.pct) === 'number' ? formatPercent(macro.em.pct, 2) : '—'}${corrPart ? ` • ${corrPart}` : ''}${extras}${cdsSignal ? ` • CDS ${typeof cdsSignal.drivers.cds === 'number' ? formatPercent(cdsSignal.drivers.cds, 2) : '—'} (${cdsSignal.mode === 'hedge_on_risk_on' ? 'Hedge-on' : cdsSignal.mode === 'risk_off_classic' ? 'Risk-off' : cdsSignal.mode === 'relief_risk_on' ? 'Alívio' : 'Leitura'})` : ''}`;
    })();

    const corrLine = (() => {
        if (!data) return null;

        const buildReturnSeries = (symbol, maxPoints = 96) => {
            const points = data.series && data.series[symbol] ? data.series[symbol] : [];
            if (!Array.isArray(points) || points.length < 6) return [];
            const start = Math.max(0, points.length - maxPoints);
            const out = [];
            for (let i = start + 1; i < points.length; i += 1) {
                const a = points[i - 1];
                const b = points[i];
                const pa = a && typeof a.price === 'number' && Number.isFinite(a.price) ? a.price : null;
                const pb = b && typeof b.price === 'number' && Number.isFinite(b.price) ? b.price : null;
                const tbRaw = b && b.t ? Date.parse(b.t) : NaN;
                const tMs = Number.isFinite(tbRaw) ? tbRaw : null;
                if (pa === null || pb === null || tMs === null) continue;
                if (pa <= 0 || pb <= 0) continue;
                const r = Math.log(pb / pa);
                if (!Number.isFinite(r)) continue;
                out.push({ tMs: tMs, r });
            }
            return out;
        };

        const correlationAligned = (seriesA, seriesB, minPoints = 20) => {
            if (!Array.isArray(seriesA) || !Array.isArray(seriesB)) return null;
            const mapB = new Map();
            for (const p of seriesB) mapB.set(p.tMs, p.r);
            const xs = [];
            const ys = [];
            for (const p of seriesA) {
                const y = mapB.get(p.tMs);
                if (typeof y !== 'number' || !Number.isFinite(y)) continue;
                if (typeof p.r !== 'number' || !Number.isFinite(p.r)) continue;
                xs.push(p.r);
                ys.push(y);
            }
            const n = xs.length;
            if (n < minPoints) return null;
            const mean = arr => arr.reduce((a, b) => a + b, 0) / arr.length;
            const mx = mean(xs);
            const my = mean(ys);
            let cov = 0;
            let vx = 0;
            let vy = 0;
            for (let i = 0; i < n; i += 1) {
                const dx = xs[i] - mx;
                const dy = ys[i] - my;
                cov += dx * dy;
                vx += dx * dx;
                vy += dy * dy;
            }
            if (vx <= 1e-18 || vy <= 1e-18) return null;
            return { corr: cov / Math.sqrt(vx * vy), n };
        };

        const corrPair = (aSym, bSym) => {
            if (!aSym || !bSym) return null;
            const a = buildReturnSeries(aSym, 96);
            const b = buildReturnSeries(bSym, 96);
            const c = correlationAligned(a, b, 20);
            if (!c || typeof c.corr !== 'number' || !Number.isFinite(c.corr)) return null;
            return c;
        };

        const symWin = findAliasSymbolBest(data, 'WIN') || findAssetSymbol(data, /^WINc\d$/i) || null;
        const symWdo = findAliasSymbolBest(data, 'WDO') || findAssetSymbol(data, /^WDOc\d$/i) || null;
        const symEwz = findAliasSymbolBest(data, 'EWZ') || findAssetSymbol(data, /^EWZ(\.\w+)?$/i) || null;
        const symSpx = findAliasSymbolBest(data, 'SPX') || findAliasSymbol(data, 'SPX') || null;
        const symUsd = findAliasSymbolBest(data, 'USD_BRL') || findAssetSymbol(data, /^USD\/BRL\b/i) || null;
        const symVxbr = findAliasSymbolBest(data, 'VXBR') || findAssetSymbol(data, /(^\.VXBR$|\bVXBR\b)/i) || null;

        const winEwz = corrPair(symWin, symEwz);
        const winSpx = corrPair(symWin, symSpx);
        const wdoUsd = corrPair(symWdo, symUsd);
        const vxbrWin = corrPair(symVxbr, symWin);

        const usdEmfx = (() => {
            if (!symUsd) return null;
            const usd = buildReturnSeries(symUsd, 96);
            const symCnh = findAssetSymbol(data, /^USD\/CNH\b/i);
            const symMxn = findAssetSymbol(data, /^USD\/MXN\b/i);
            const symZar = findAssetSymbol(data, /^USD\/ZAR\b/i);
            const comps = [
                symCnh ? { sym: symCnh, w: 1 } : null,
                symMxn ? { sym: symMxn, w: 1 } : null,
                symZar ? { sym: symZar, w: 1 } : null,
            ].filter(Boolean);
            if (!comps.length) return null;

            const compSeries = comps.map(c => ({ w: c.w, map: new Map(buildReturnSeries(c.sym, 96).map(p => [p.tMs, p.r])) }));
            const basket = [];
            for (const p of usd) {
                let sumW = 0;
                let sumR = 0;
                let have = 0;
                for (const cs of compSeries) {
                    const r = cs.map.get(p.tMs);
                    if (typeof r !== 'number' || !Number.isFinite(r)) continue;
                    sumW += cs.w;
                    sumR += cs.w * r;
                    have += 1;
                }
                if (have < 2 || sumW <= 0) continue;
                basket.push({ tMs: p.tMs, r: sumR / sumW });
            }
            const c = correlationAligned(usd, basket, 20);
            return c && typeof c.corr === 'number' && Number.isFinite(c.corr) ? c : null;
        })();

        const fmt = c => `${formatNumber(c.corr, 2)}${c.n ? ` (n=${String(c.n)})` : ''}`;
        const parts = [];
        if (winEwz) parts.push(`WIN×EWZ ${fmt(winEwz)}`);
        if (winSpx) parts.push(`WIN×SPX ${fmt(winSpx)}`);
        if (wdoUsd) parts.push(`WDO×USD/BRL ${fmt(wdoUsd)}`);
        if (usdEmfx) parts.push(`USD/BRL×EMFX ${fmt(usdEmfx)}`);
        if (vxbrWin) parts.push(`VXBR×WIN ${fmt(vxbrWin)}`);
        if (!parts.length) return null;
        return `Correlações (janela curta): ${parts.join(' • ')}`;
    })();

    const pulseCard = (() => {
        if (!pulseNow) return '';

        const mkPulse = (sym, side) => {
            const p = pulseNow.pulse && pulseNow.pulse[side] ? pulseNow.pulse[side] : null;
            if (!p) return '';
            const tone = p.net > 0.25 ? 'positive' : p.net < -0.25 ? 'negative' : 'neutral';
            const netBadge = toneBadgeHtmlFromTone(tone, Math.abs(p.net), `${formatNumber(p.net, 2)}`, { maxAbs: 3 });
            const pnl = p.pnlLike || { posSum: 0, negSum: 0, net: 0 };
            const br = p.breadth || { pos: 0, neg: 0, zero: 0 };

            const alignBadge = (ok, label) => {
                const fmt = v => (typeof v === 'number' && Number.isFinite(v) ? formatPercent(v, 2) : '—');
                if (!ok || typeof ok !== 'object') return badge('neutral', `${label}: —`);
                if (ok.reason === 'missing') return badge('neutral', `${label}: —`);
                if (ok.reason === 'weak') return badge('neutral', `${label}: FRACO (${fmt(ok.a)} / ${fmt(ok.b)})`);
                if (ok.ok === null) return badge('neutral', `${label}: —`);
                return badge(ok.ok ? 'positive' : 'negative', `${label}: ${ok.ok ? 'OK' : 'DIVERGE'} (${fmt(ok.a)} / ${fmt(ok.b)})`);
            };

            const a1 =
                side === 'wdo'
                    ? alignBadge(pulseNow.align ? pulseNow.align.wdo_usdbrl : null, 'WDO×USD/BRL')
                    : alignBadge(pulseNow.align ? pulseNow.align.win_ibov : null, 'WIN×IBOV');
            const a2 =
                side === 'wdo'
                    ? alignBadge(pulseNow.align ? pulseNow.align.wdo_dxy : null, 'WDO×DXY')
                    : alignBadge(pulseNow.align ? pulseNow.align.win_ewz : null, 'WIN×EWZ');

            const missing = (() => {
                const cov = pulseNow.coverage && pulseNow.coverage[side] ? pulseNow.coverage[side] : null;
                const list = cov && Array.isArray(cov.missing) ? cov.missing : [];
                if (!list.length) return badge('positive', 'Drivers: completos');
                const head = list.slice(0, 6).join(', ');
                const tail = list.length > 6 ? `… +${list.length - 6}` : '';
                return badge('neutral', `Faltando: ${head}${tail ? ` ${tail}` : ''}`);
            })();

            const topNews = (() => {
                const items = web && Array.isArray(web.items) ? web.items.slice(0, 18) : [];
                const out = [];
                for (const it of items) {
                    const title = it && it.title ? String(it.title) : '';
                    const url = it && it.url ? String(it.url) : '';
                    const impact = it && it.impact ? it.impact : null;
                    const sig = impact && impact[side] ? String(impact[side]) : '≈';
                    if (!title || sig === '≈') continue;
                    const safeUrl = url && /^https?:\/\//i.test(url) ? url : '';
                    const a = safeUrl
                        ? `<a href="${escapeHtml(safeUrl)}" target="_blank" rel="noreferrer" style="color:rgba(0,243,255,.92);text-decoration:none;">${escapeHtml(title)}</a>`
                        : escapeHtml(title);
                    out.push(`• ${a} <span style="opacity:.85;font-family:'Share Tech Mono',monospace;">(${escapeHtml(sig)})</span>`);
                    if (out.length >= 2) break;
                }
                return out.length ? out.join('<br>') : '<span style="opacity:.78;">• —</span>';
            })();

            return `
                <div style="border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:12px;background:rgba(0,0,0,.18);">
                    <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
                        <div style="font-weight:900;letter-spacing:1px;">Pulso ${escapeHtml(sym)}</div>
                        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
                            ${badge(biasTone(p.bias), biasLabel(sym, p.bias))}
                            ${badge('neutral', `Drivers net`)} ${netBadge}
                        </div>
                    </div>
                    <div style="margin-top:6px;opacity:.78;font-size:12px;">
                        Cobertura: ${escapeHtml(String((p.rows || []).length))} drivers ativos
                    </div>
                    ${(() => {
                        const g = p.groups || null;
                        if (!g) return '';
                        const fmt = v => (typeof v === 'number' && Number.isFinite(v) ? formatNumber(v, 2) : '—');
                        const d = g.driver || { net: 0, count: 0 };
                        const c = g.confirm || { net: 0, count: 0 };
                        const x = g.context || { net: 0, count: 0 };
                        return `<div style="margin-top:6px;opacity:.78;font-size:12px;">Camadas: Driver ${fmt(d.net)} (${String(d.count)}) • Conf ${fmt(c.net)} (${String(c.count)}) • Contexto ${fmt(x.net)} (${String(x.count)})</div>`;
                    })()}
                    ${(() => {
                        const mk = (label, symbol) => {
                            const pct = symbol ? getChangePct(data, symbol) : null;
                            if (typeof pct !== 'number' || !Number.isFinite(pct)) return null;
                            return `${label} ${formatPercent(pct, 2)}`;
                        };
                        const s = pulseNow.sym || {};
                        const bits = [
                            mk('VIX9D', s.vix9d),
                            mk('VIX', s.vix30),
                            mk('VVIX', s.vvix),
                            mk('VXN', s.vxn),
                            mk('VXEEM', s.vxeem),
                            mk('VXEWZ', s.vxewz),
                            mk('VXBR', s.vxbr),
                        ].filter(Boolean);
                        if (!bits.length) return '';
                        return `<div style="margin-top:6px;opacity:.78;font-size:12px;">Vol: ${escapeHtml(bits.join(' • '))}</div>`;
                    })()}
                    <div style="margin-top:8px;opacity:.88;font-size:12px;line-height:1.35;">
                        PnL (sintético): +${formatNumber(pnl.posSum, 2)} / ${formatNumber(pnl.negSum, 2)} • net ${formatNumber(pnl.net, 2)}
                        • Largura: ${String(br.pos)}↑ ${String(br.neg)}↓ ${String(br.zero)}≈
                    </div>
                    <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
                        ${missing}
                    </div>
                    <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
                        ${a1} ${a2}
                    </div>
                    <div style="margin-top:10px;border-top:1px solid rgba(255,255,255,.08);padding-top:10px;opacity:.92;line-height:1.35;">
                        <div style="font-weight:900;letter-spacing:.6px;opacity:.92;margin-bottom:6px;">Notícias (impacto direto)</div>
                        <div style="font-size:12px;">${topNews}</div>
                    </div>
                </div>
            `;
        };

        return `
            <div style="margin-top:12px;display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:12px;">
                ${mkPulse('WDO', 'wdo')}
                ${mkPulse('WIN', 'win')}
            </div>
        `;
    })();

    const scalpModule = (() => {
        if (!pulseNow) return '';
        const symWdo = pulseNow.sym && pulseNow.sym.wdo ? String(pulseNow.sym.wdo) : '';
        const symWin = pulseNow.sym && pulseNow.sym.win ? String(pulseNow.sym.win) : '';

        const microStats = (symbol, tune) => {
            const s = String(symbol || '');
            if (!s) return null;
            const series = data && data.series && Array.isArray(data.series[s]) ? data.series[s] : [];
            if (!series.length) return null;
            const last = series[series.length - 1];
            const lastPrice = last && typeof last.price === 'number' && Number.isFinite(last.price) ? last.price : null;
            const lastTmsRaw = last && last.t ? Date.parse(last.t) : NaN;
            const lastTms = Number.isFinite(lastTmsRaw) ? lastTmsRaw : null;
            if (lastPrice === null || lastTms === null) return null;

            const findAt = (lookbackMs) => {
                const target = lastTms - lookbackMs;
                for (let i = series.length - 1; i >= 0; i -= 1) {
                    const p = series[i];
                    const tRaw = p && p.t ? Date.parse(p.t) : NaN;
                    const t = Number.isFinite(tRaw) ? tRaw : null;
                    const price = p && typeof p.price === 'number' && Number.isFinite(p.price) ? p.price : null;
                    if (t === null || price === null) continue;
                    if (t <= target) return { tMs: t, price };
                }
                return null;
            };
            const pctFrom = (priceThen) => (typeof priceThen === 'number' && Number.isFinite(priceThen) && priceThen > 0 ? ((lastPrice / priceThen) - 1) * 100 : null);

            const p5 = findAt(5 * 60 * 1000);
            const p15 = findAt(15 * 60 * 1000);
            const p60 = findAt(60 * 60 * 1000);
            const ret5 = p5 ? pctFrom(p5.price) : null;
            const ret15 = p15 ? pctFrom(p15.price) : null;
            const ret60 = p60 ? pctFrom(p60.price) : null;

            const range30 = (() => {
                const cut = lastTms - 30 * 60 * 1000;
                let hi = -Infinity;
                let lo = +Infinity;
                let n = 0;
                for (let i = series.length - 1; i >= 0; i -= 1) {
                    const p = series[i];
                    const tRaw = p && p.t ? Date.parse(p.t) : NaN;
                    const t = Number.isFinite(tRaw) ? tRaw : null;
                    const price = p && typeof p.price === 'number' && Number.isFinite(p.price) ? p.price : null;
                    if (t === null || price === null) continue;
                    if (t < cut) break;
                    n += 1;
                    if (price > hi) hi = price;
                    if (price < lo) lo = price;
                }
                if (n < 4 || !Number.isFinite(hi) || !Number.isFinite(lo) || lo <= 0) return null;
                const pct = ((hi / lo) - 1) * 100;
                const pts = hi - lo;
                return { pct, pts, n, hi, lo };
            })();

            const scalp = (() => {
                const th5 = tune && typeof tune.th5 === 'number' && Number.isFinite(tune.th5) ? tune.th5 : 0.05;
                const th15 = tune && typeof tune.th15 === 'number' && Number.isFinite(tune.th15) ? tune.th15 : 0.10;
                const s5 = typeof ret5 === 'number' && Number.isFinite(ret5) ? ret5 : null;
                const s15 = typeof ret15 === 'number' && Number.isFinite(ret15) ? ret15 : null;
                if (s5 === null || s15 === null) return { signal: 'neutral', label: 'n/d' };
                const alignedUp = s5 >= th5 && s15 >= th15;
                const alignedDn = s5 <= -th5 && s15 <= -th15;
                if (alignedUp) return { signal: 'buy', label: '5m×15m alinhado (↑)' };
                if (alignedDn) return { signal: 'sell', label: '5m×15m alinhado (↓)' };
                const conflict = (s5 > 0 && s15 < 0) || (s5 < 0 && s15 > 0);
                if (conflict && Math.abs(s5) >= th5) return { signal: 'neutral', label: 'conflito 5m×15m' };
                return { signal: 'neutral', label: 'range/ruído' };
            })();

            const risk = (() => {
                const rp = range30 && typeof range30.pct === 'number' && Number.isFinite(range30.pct) ? range30.pct : null;
                const stopPct = rp !== null ? Math.max(0.08, rp * 0.25) : null;
                const alvoPct = rp !== null ? Math.max(0.12, rp * 0.5) : null;
                const stopPts = stopPct !== null ? (lastPrice * (stopPct / 100)) : null;
                const alvoPts = alvoPct !== null ? (lastPrice * (alvoPct / 100)) : null;
                return { stopPct, alvoPct, stopPts, alvoPts };
            })();

            return { lastPrice, ret5, ret15, ret60, range30, scalp, risk };
        };

        const keyLevelsFor = (symKey) => {
            if (!options || !options.items) return null;
            const it = options.items[symKey];
            const key = it && it.keyLevels ? it.keyLevels : null;
            if (!key) return null;
            const gf = typeof key.gammaFlip === 'number' && Number.isFinite(key.gammaFlip) ? key.gammaFlip : null;
            const rangeLow = typeof key.rangeLow === 'number' && Number.isFinite(key.rangeLow) ? key.rangeLow : null;
            const rangeHigh = typeof key.rangeHigh === 'number' && Number.isFinite(key.rangeHigh) ? key.rangeHigh : null;
            return { gf, rangeLow, rangeHigh };
        };

        const mk = (label, sym, symKey, tune) => {
            if (!sym) return '';
            const m = microStats(sym, tune);
            if (!m) return '';
            const side = symKey === 'WDO' ? 'wdo' : 'win';
            const scalpBiasRaw = m.scalp && m.scalp.signal ? m.scalp.signal : 'neutral';
            const ctx = pulseNow && pulseNow.pulse && pulseNow.pulse[side] ? pulseNow.pulse[side] : null;
            const ctxBias = ctx && ctx.bias ? String(ctx.bias) : 'neutral';
            const ctxNet = ctx && typeof ctx.net === 'number' && Number.isFinite(ctx.net) ? ctx.net : 0;
            const ctxStrong = Math.abs(ctxNet) >= 0.35;

            const usdSym = pulseNow && pulseNow.sym && pulseNow.sym.usdbrl ? String(pulseNow.sym.usdbrl) : (findAliasSymbolBest(data, 'USD_BRL') || findAssetSymbol(data, /^USD\/BRL\b/i) || '');
            const ibovSym = pulseNow && pulseNow.sym && pulseNow.sym.ibov ? String(pulseNow.sym.ibov) : (findAliasSymbolBest(data, 'IBOV') || findAssetSymbol(data, /^\.BVSP$/i) || '');
            const usdPct = usdSym ? getChangePct(data, usdSym) : null;
            const ibovPct = ibovSym ? getChangePct(data, ibovSym) : null;
            const selfPct = getChangePct(data, sym);
            const sign = (v, th = 0.06) => (typeof v === 'number' && Number.isFinite(v) ? (v > th ? +1 : v < -th ? -1 : 0) : 0);
            const parity = (() => {
                const sSelf = sign(selfPct);
                if (side === 'wdo') {
                    const sUsd = sign(usdPct);
                    if (!sSelf || !sUsd) return { ok: null, label: 'Paridade: —' };
                    const ok = sSelf === sUsd;
                    return { ok, label: `Paridade USD/BRL: ${ok ? 'OK' : 'DIVERGE'}` };
                }
                const sIbov = sign(ibovPct);
                if (!sSelf || !sIbov) return { ok: null, label: 'Paridade: —' };
                const ok = sSelf === sIbov;
                return { ok, label: `Paridade IBOV: ${ok ? 'OK' : 'DIVERGE'}` };
            })();

            const flowScore = foreignFlow && foreignFlow.signal && typeof foreignFlow.signal.score === 'number' && Number.isFinite(foreignFlow.signal.score)
                ? foreignFlow.signal.score
                : null;
            const tFlow = typeof operationalTuning.threshold.foreignFlow === 'number' && Number.isFinite(operationalTuning.threshold.foreignFlow) ? operationalTuning.threshold.foreignFlow : 0.25;
            const flowDir = typeof flowScore === 'number'
                ? (flowScore > tFlow ? +1 : flowScore < -tFlow ? -1 : 0)
                : 0;
            const flowBias = side === 'win' ? (flowDir > 0 ? 'buy' : flowDir < 0 ? 'sell' : 'neutral') : (flowDir > 0 ? 'sell' : flowDir < 0 ? 'buy' : 'neutral');
            const flowStrong = typeof flowScore === 'number' && Math.abs(flowScore) >= tFlow;

            const brScore = brFlowSignal && typeof brFlowSignal.score === 'number' && Number.isFinite(brFlowSignal.score) ? brFlowSignal.score : null;
            const tBr = typeof operationalTuning.threshold.brFlow === 'number' && Number.isFinite(operationalTuning.threshold.brFlow) ? operationalTuning.threshold.brFlow : 0.22;
            const brDir = typeof brScore === 'number' ? (brScore > tBr ? +1 : brScore < -tBr ? -1 : 0) : 0;
            const brBias = side === 'win' ? (brDir > 0 ? 'buy' : brDir < 0 ? 'sell' : 'neutral') : (brDir > 0 ? 'sell' : brDir < 0 ? 'buy' : 'neutral');
            const brStrong = typeof brScore === 'number' && Math.abs(brScore) >= Math.max(0.28, tBr) && (brFlowSignal && typeof brFlowSignal.confidence === 'number' ? brFlowSignal.confidence >= 0.62 : true);

            const conflictsWith = (a, b) => (a !== 'neutral' && b !== 'neutral' && a !== b);
            const hardBlock = conflictsWith(scalpBiasRaw, ctxBias) && ctxStrong;
            const flowBlock = conflictsWith(scalpBiasRaw, flowBias) && flowStrong;
            const brFlowBlock = conflictsWith(scalpBiasRaw, brBias) && brStrong;
            const parityBlock = parity.ok === false && Math.abs(sign(selfPct)) > 0;

            const scalpBias = (hardBlock || flowBlock || brFlowBlock || parityBlock) ? 'neutral' : scalpBiasRaw;
            const tone = scalpBias === 'buy' ? 'positive' : scalpBias === 'sell' ? 'negative' : 'neutral';
            const txt = scalpBias === 'buy' ? 'COMPRA' : scalpBias === 'sell' ? 'VENDA' : 'NEUTRO';
            const ctxTxt = ctxBias === 'buy' ? 'Compra' : ctxBias === 'sell' ? 'Venda' : 'Neutro';
            const flowTxt = typeof flowScore === 'number' ? `Fluxo ${formatNumber(flowScore, 2)} (${flowBias === 'buy' ? 'Compra' : flowBias === 'sell' ? 'Venda' : 'Neutro'})` : 'Fluxo: —';
            const brTxt = typeof brScore === 'number' ? `Fluxo→BR ${brFlowSignal && brFlowSignal.label ? brFlowSignal.label : ''} ${formatNumber(brScore, 2)} (${brBias === 'buy' ? 'Compra' : brBias === 'sell' ? 'Venda' : 'Neutro'})` : 'Fluxo→BR: —';
            const ctxTone = conflictsWith(scalpBiasRaw, ctxBias) ? 'negative' : (ctxBias !== 'neutral' ? 'positive' : 'neutral');
            const blockReason = hardBlock ? 'Bloqueado por risco/paridade (contexto forte)' : flowBlock ? 'Bloqueado por fluxo estrangeiro (forte)' : brFlowBlock ? 'Bloqueado por fluxo global→BR (forte)' : parityBlock ? 'Bloqueado por paridade' : '';

            const winStats = (lookbackMs) => {
                const s = String(sym || '');
                const series = data && data.series && Array.isArray(data.series[s]) ? data.series[s] : [];
                if (!series.length) return null;
                const last = series[series.length - 1];
                const lastMs = last && last.t ? Date.parse(last.t) : NaN;
                if (!Number.isFinite(lastMs)) return null;
                const cut = lastMs - lookbackMs;
                let hi = -Infinity;
                let lo = +Infinity;
                let hiPrev = -Infinity;
                let loPrev = +Infinity;
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
                    if (i < series.length - 1) {
                        if (price > hiPrev) hiPrev = price;
                        if (price < loPrev) loPrev = price;
                    }
                }
                if (n < 4 || !Number.isFinite(hi) || !Number.isFinite(lo)) return null;
                const rangePts = hi - lo;
                const rangePct = lo > 0 ? ((hi / lo) - 1) * 100 : null;
                return {
                    hi,
                    lo,
                    hiPrev: Number.isFinite(hiPrev) ? hiPrev : hi,
                    loPrev: Number.isFinite(loPrev) ? loPrev : lo,
                    rangePts: Number.isFinite(rangePts) ? rangePts : null,
                    rangePct: typeof rangePct === 'number' && Number.isFinite(rangePct) ? rangePct : null,
                    n,
                };
            };
            const s15 = winStats(15 * 60 * 1000);
            const s30 = winStats(30 * 60 * 1000);
            const priceNow = typeof m.lastPrice === 'number' && Number.isFinite(m.lastPrice) ? m.lastPrice : null;
            const range30Pts = s30 && typeof s30.rangePts === 'number' && Number.isFinite(s30.rangePts) ? s30.rangePts : null;
            const range30Pct = s30 && typeof s30.rangePct === 'number' && Number.isFinite(s30.rangePct) ? s30.rangePct : null;

            const scalpState = (() => {
                if (hardBlock || flowBlock || parityBlock) return { label: 'BLOQUEADO', tone: 'negative', reason: blockReason || 'Bloqueado' };
                if (ctxBias !== 'neutral' && conflictsWith(scalpBiasRaw, ctxBias)) return { label: 'CAUTELA', tone: 'neutral', reason: 'Contexto diverge (reduzir mão / exigir confirmação)' };
                if (parity.ok === null) return { label: 'CAUTELA', tone: 'neutral', reason: 'Sem paridade (reduzir mão / exigir confirmação)' };
                return { label: 'OK', tone: 'positive', reason: 'Liberado (micro + paridade/contexto ok)' };
            })();

            const microGate = scalpBiasRaw;
            const pbFrac = 0.25;
            const pbLevel = (() => {
                if (priceNow === null || range30Pts === null) return null;
                const d = range30Pts * pbFrac;
                if (microGate === 'buy') return priceNow - d;
                if (microGate === 'sell') return priceNow + d;
                return null;
            })();
            const reArm = (() => {
                if (priceNow === null || range30Pts === null) return null;
                const b = range30Pts * 0.10;
                if (microGate === 'buy') return priceNow + b;
                if (microGate === 'sell') return priceNow - b;
                return null;
            })();

            const windowStats = (lookbackMs) => {
                const s = String(sym || '');
                const series = data && data.series && Array.isArray(data.series[s]) ? data.series[s] : [];
                if (!series.length) return null;
                const last = series[series.length - 1];
                const lastMs = last && last.t ? Date.parse(last.t) : NaN;
                if (!Number.isFinite(lastMs)) return null;
                const cut = lastMs - lookbackMs;
                let hi = -Infinity;
                let lo = +Infinity;
                let n = 0;
                let lastPrice = null;
                let prevPrice = null;
                for (let i = series.length - 1; i >= 0; i -= 1) {
                    const p = series[i];
                    const ms = p && p.t ? Date.parse(p.t) : NaN;
                    const price = p && typeof p.price === 'number' && Number.isFinite(p.price) ? p.price : null;
                    if (!Number.isFinite(ms) || price === null) continue;
                    if (lastPrice === null) lastPrice = price;
                    else if (prevPrice === null) prevPrice = price;
                    if (ms < cut) break;
                    n += 1;
                    if (price > hi) hi = price;
                    if (price < lo) lo = price;
                }
                if (n < 3 || !Number.isFinite(hi) || !Number.isFinite(lo)) return null;
                return { hi, lo, n, lastPrice, prevPrice };
            };

            const setups = (() => {
                const fmtLvl = v => (typeof v === 'number' && Number.isFinite(v) ? formatNumber(v, 0) : '—');
                const status = (mode, note = '') => ({ mode, note });
                const w10 = windowStats(10 * 60 * 1000);
                const w5 = windowStats(5 * 60 * 1000);
                const h15 = s15 && typeof s15.hiPrev === 'number' && Number.isFinite(s15.hiPrev) ? s15.hiPrev : null;
                const l15 = s15 && typeof s15.loPrev === 'number' && Number.isFinite(s15.loPrev) ? s15.loPrev : null;
                const rPts = range30Pts;
                const cur = priceNow;

                const distPB = (typeof rPts === 'number' && Number.isFinite(rPts) && rPts > 0) ? rPts * 0.25 : (cur ? cur * 0.0018 : null);
                const distResume = (typeof rPts === 'number' && Number.isFinite(rPts) && rPts > 0) ? rPts * 0.10 : (cur ? cur * 0.0008 : null);

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
                        const pad = (typeof rPts === 'number' && Number.isFinite(rPts) && rPts > 0) ? rPts * 0.05 : cur * 0.0006;
                        const armed = cur >= (h15 - pad) && cur <= (h15 + pad);
                        const fired = cur > (h15 + pad) && typeof w5.prevPrice === 'number' && w5.prevPrice <= (h15 + pad);
                        if (fired) return status('ACIONADO', `Rompimento confirmado > ${fmtLvl(h15)}`);
                        if (armed) return status('ARMADO', `Próximo do H15 ${fmtLvl(h15)}`);
                        return status('ESPERE', `H15 ${fmtLvl(h15)}`);
                    }
                    if (microGate === 'sell' && typeof l15 === 'number' && Number.isFinite(l15)) {
                        const pad = (typeof rPts === 'number' && Number.isFinite(rPts) && rPts > 0) ? rPts * 0.05 : cur * 0.0006;
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
                        const pad = (typeof rPts === 'number' && Number.isFinite(rPts) && rPts > 0) ? rPts * 0.05 : cur * 0.0006;
                        const triedUp = w10.hi >= (h15 + pad);
                        const failed = triedUp && cur < h15 && typeof w10.prevPrice === 'number' && w10.prevPrice > h15;
                        if (failed) return status('ACIONADO', `Falha no topo (volta abaixo de H15 ${fmtLvl(h15)})`);
                        if (triedUp) return status('ARMADO', `Tentou romper H15 ${fmtLvl(h15)} (vigiar falha)`);
                    }
                    if (typeof l15 === 'number' && Number.isFinite(l15)) {
                        const pad = (typeof rPts === 'number' && Number.isFinite(rPts) && rPts > 0) ? rPts * 0.05 : cur * 0.0006;
                        const triedDn = w10.lo <= (l15 - pad);
                        const failed = triedDn && cur > l15 && typeof w10.prevPrice === 'number' && w10.prevPrice < l15;
                        if (failed) return status('ACIONADO', `Falha no fundo (volta acima de L15 ${fmtLvl(l15)})`);
                        if (triedDn) return status('ARMADO', `Tentou romper L15 ${fmtLvl(l15)} (vigiar falha)`);
                    }
                    return status('ESPERE');
                })();

                return { pullback, breakout, failure };
            })();

            const setupBadges = (() => {
                const mkB = (name, st) => {
                    const mode = st && st.mode ? String(st.mode) : 'N/D';
                    const tone = mode === 'ACIONADO' ? 'positive' : mode === 'ARMADO' ? 'neutral' : mode === 'ESPERE' ? 'neutral' : 'neutral';
                    return badge(tone, `${name}: ${mode}`);
                };
                return `
                    <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
                        ${mkB('Pullback', setups.pullback)}
                        ${mkB('Romp.', setups.breakout)}
                        ${mkB('Falha', setups.failure)}
                    </div>
                    ${(() => {
                        const notes = [setups.pullback.note, setups.breakout.note, setups.failure.note].filter(Boolean);
                        if (!notes.length) return '';
                        return `<div style="margin-top:6px;opacity:.78;font-size:12px;line-height:1.35;">${notes.map(n => `• ${escapeHtml(n)}`).join('<br>')}</div>`;
                    })()}
                `;
            })();
            const setupLines = (() => {
                const lines = [];
                const fmtLvl = v => (typeof v === 'number' && Number.isFinite(v) ? formatNumber(v, 0) : '—');
                const fmtP = v => (typeof v === 'number' && Number.isFinite(v) ? formatPercent(v, 2) : '—');
                const h15 = s15 && typeof s15.hiPrev === 'number' && Number.isFinite(s15.hiPrev) ? s15.hiPrev : null;
                const l15 = s15 && typeof s15.loPrev === 'number' && Number.isFinite(s15.loPrev) ? s15.loPrev : null;
                const pb = pbLevel;
                const ra = reArm;

                if (microGate === 'buy') {
                    if (pb !== null && priceNow !== null) {
                        const txt = priceNow > pb
                            ? `Setup (preferido): pullback até ≤ ${fmtLvl(pb)} e retomada (5m volta ↑) • stop curto`
                            : `Setup (preferido): já no pullback • entrar na retomada acima de ${fmtLvl(ra)} (ou candle 5m virar)`;
                        lines.push(txt);
                    }
                    if (h15 !== null) lines.push(`Alternativo: rompimento com confirmação acima de ${fmtLvl(h15)} (H15)`);
                    if (h15 !== null) lines.push(`Reversão: falha no topo • vender se perder ${fmtLvl(h15)} após tentativa`);
                } else if (microGate === 'sell') {
                    if (pb !== null && priceNow !== null) {
                        const txt = priceNow < pb
                            ? `Setup (preferido): repique até ≥ ${fmtLvl(pb)} e rejeição (5m volta ↓) • stop curto`
                            : `Setup (preferido): já no repique • entrar na rejeição abaixo de ${fmtLvl(ra)} (ou candle 5m virar)`;
                        lines.push(txt);
                    }
                    if (l15 !== null) lines.push(`Alternativo: rompimento com confirmação abaixo de ${fmtLvl(l15)} (L15)`);
                    if (l15 !== null) lines.push(`Reversão: falha no fundo • comprar se recuperar ${fmtLvl(l15)} após tentativa`);
                } else {
                    if (h15 !== null && l15 !== null) lines.push(`Range: trabalhar ${fmtLvl(l15)}–${fmtLvl(h15)} com stops curtos`);
                    if (parity.ok === false) lines.push('Evitar scalp direcional: paridade divergente');
                }

                const meta = [
                    s15 ? `H15 ${fmtLvl(s15.hi)} • L15 ${fmtLvl(s15.lo)}` : null,
                    s30 ? `Range30 ${fmtP(range30Pct)} (${fmtLvl(range30Pts)} pts)` : null,
                ].filter(Boolean);
                if (meta.length) lines.push(`Níveis: ${meta.join(' • ')}`);
                return lines;
            })();

            const r5 = typeof m.ret5 === 'number' && Number.isFinite(m.ret5) ? formatPercent(m.ret5, 2) : '—';
            const r15 = typeof m.ret15 === 'number' && Number.isFinite(m.ret15) ? formatPercent(m.ret15, 2) : '—';
            const r60 = typeof m.ret60 === 'number' && Number.isFinite(m.ret60) ? formatPercent(m.ret60, 2) : '—';
            const rangeP = m.range30 && typeof m.range30.pct === 'number' && Number.isFinite(m.range30.pct) ? formatPercent(m.range30.pct, 2) : '—';
            const rangePts = m.range30 && typeof m.range30.pts === 'number' && Number.isFinite(m.range30.pts) ? formatNumber(m.range30.pts, 0) : '—';

            const stop = m.risk && typeof m.risk.stopPct === 'number' && Number.isFinite(m.risk.stopPct) ? formatPercent(m.risk.stopPct, 2) : '—';
            const alvo = m.risk && typeof m.risk.alvoPct === 'number' && Number.isFinite(m.risk.alvoPct) ? formatPercent(m.risk.alvoPct, 2) : '—';
            const stopPts = m.risk && typeof m.risk.stopPts === 'number' && Number.isFinite(m.risk.stopPts) ? formatNumber(m.risk.stopPts, 0) : '—';
            const alvoPts = m.risk && typeof m.risk.alvoPts === 'number' && Number.isFinite(m.risk.alvoPts) ? formatNumber(m.risk.alvoPts, 0) : '—';

            const lvl = keyLevelsFor(symKey);
            const gf = lvl && typeof lvl.gf === 'number' ? fmt0(lvl.gf) : '—';
            const rl = lvl && typeof lvl.rangeLow === 'number' ? fmt0(lvl.rangeLow) : '—';
            const rh = lvl && typeof lvl.rangeHigh === 'number' ? fmt0(lvl.rangeHigh) : '—';

            const plan = (() => {
                if (scalpBias === 'buy') return `Scalp: comprar a favor (5m×15m) • Stop ~${stop} (~${stopPts} pts) • Alvo ~${alvo} (~${alvoPts} pts) • Pivô GF ${gf}`;
                if (scalpBias === 'sell') return `Scalp: vender a favor (5m×15m) • Stop ~${stop} (~${stopPts} pts) • Alvo ~${alvo} (~${alvoPts} pts) • Pivô GF ${gf}`;
                return `Scalp: sem edge (5m×15m) • Range ${rl}–${rh} • Pivô GF ${gf}`;
            })();

            return `
                <div style="border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:12px;background:rgba(0,0,0,.18);">
                    <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
                        <div style="font-weight:900;letter-spacing:1px;">${escapeHtml(label)}</div>
                        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
                            ${badge(tone, `Scalp: ${txt}`)}
                            ${badge('neutral', `${escapeHtml(sym)}`)}
                            ${badge(ctxTone, `Contexto: ${escapeHtml(ctxTxt)} (${formatNumber(ctxNet, 2)})`)}
                            ${badge(scalpState.tone, `Estado: ${escapeHtml(scalpState.label)}`)}
                        </div>
                    </div>
                    <div style="margin-top:8px;opacity:.86;font-size:12px;line-height:1.35;">
                        Micro: 5m ${escapeHtml(r5)} • 15m ${escapeHtml(r15)} • 60m ${escapeHtml(r60)} • Range30 ${escapeHtml(rangeP)} (${escapeHtml(rangePts)} pts)
                    </div>
                    <div style="margin-top:8px;opacity:.90;font-size:12px;line-height:1.35;">
                        ${escapeHtml(m.scalp && m.scalp.label ? m.scalp.label : '—')}
                    </div>
                    <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
                        ${badge(parity.ok === false ? 'negative' : parity.ok === true ? 'positive' : 'neutral', escapeHtml(parity.label))}
                        ${badge(flowStrong && conflictsWith(scalpBiasRaw, flowBias) ? 'negative' : flowBias !== 'neutral' ? 'neutral' : 'neutral', escapeHtml(flowTxt))}
                        ${badge(brStrong && conflictsWith(scalpBiasRaw, brBias) ? 'negative' : brBias !== 'neutral' ? 'neutral' : 'neutral', escapeHtml(brTxt))}
                    </div>
                    <div style="margin-top:10px;border:1px dashed rgba(255,255,255,.16);border-radius:12px;padding:10px;background:rgba(0,0,0,.14);">
                        <div style="font-weight:900;letter-spacing:.6px;opacity:.92;margin-bottom:6px;">Gatilhos (entrada)</div>
                        ${setupBadges}
                        <div style="opacity:.86;font-size:12px;line-height:1.45;">
                            ${setupLines.map(x => `• ${escapeHtml(x)}`).join('<br>')}
                        </div>
                    </div>
                    <div style="margin-top:10px;opacity:.92;line-height:1.35;">
                        <div style="font-weight:900;letter-spacing:.6px;opacity:.92;margin-bottom:6px;">Plano (scalp)</div>
                        <div style="opacity:.86;font-size:12px;">${escapeHtml(plan)}</div>
                        ${blockReason ? `<div style="margin-top:6px;opacity:.78;font-size:12px;">${escapeHtml(blockReason)}</div>` : ''}
                    </div>
                </div>
            `;
        };

        const amp = volAmp && typeof volAmp.amp === 'number' && Number.isFinite(volAmp.amp) ? volAmp.amp : 1;
        const adj = amp >= 1.25 ? 1.25 : amp >= 1.12 ? 1.12 : amp <= 0.90 ? 0.85 : 1;
        const wdoCard = mk('WDO (Day Trade)', symWdo, 'WDO', { th5: 0.05 * adj, th15: 0.10 * adj });
        const winCard = mk('WIN (Day Trade)', symWin, 'WIN', { th5: 0.05 * adj, th15: 0.10 * adj });
        if (!wdoCard && !winCard) return '';

        return `
            <div style="margin-top:12px;border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:12px;background:rgba(0,0,0,.18);">
                <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
                    <div style="font-weight:900;letter-spacing:1px;opacity:.95;">⚡ Scalp (Day Trade) — WDO • WIN</div>
                    <div style="opacity:.78;font-size:12px;">Sinal curto baseado em 5m×15m (microtendência) + Range30 (gestão) • thresholds ajustam por volAmp.</div>
                </div>
                <div style="margin-top:10px;display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:12px;">
                    ${wdoCard}
                    ${winCard}
                </div>
            </div>
        `;
    })();

    const winProjectionModule = (() => {
        if (!data) return '';

        const symWin = pulseNow && pulseNow.sym && pulseNow.sym.win ? String(pulseNow.sym.win) : '';
        const symIron = pulseNow && pulseNow.sym && pulseNow.sym.iron ? String(pulseNow.sym.iron) : (findAliasSymbolBest(data, 'IRON') || findAssetSymbol(data, /^DCE_I0$/i) || '');
        const symCopper = pulseNow && pulseNow.sym && pulseNow.sym.copper ? String(pulseNow.sym.copper) : (findAliasSymbolBest(data, 'COPPER') || '');
        const symOil = pulseNow && pulseNow.sym && pulseNow.sym.brent ? String(pulseNow.sym.brent) : (findAliasSymbolBest(data, 'BRENT') || '');

        const lastPoint = (symbol) => {
            const s = String(symbol || '');
            if (!s) return null;
            const pts = data && data.series && Array.isArray(data.series[s]) ? data.series[s] : [];
            for (let i = pts.length - 1; i >= 0; i -= 1) {
                const p = pts[i];
                const price = p && typeof p.price === 'number' && Number.isFinite(p.price) ? p.price : null;
                if (price === null) continue;
                const t = p && p.t ? String(p.t) : null;
                return { price, t };
            }
            return null;
        };
        const lastPrice = s => {
            const p = lastPoint(s);
            return p && typeof p.price === 'number' ? p.price : null;
        };
        const lastTime = s => {
            const p = lastPoint(s);
            return p && p.t ? p.t : null;
        };

        const pct = s => {
            const v = s ? getChangePct(data, s) : null;
            return typeof v === 'number' && Number.isFinite(v) ? v : null;
        };
        const fmtP = v => (typeof v === 'number' && Number.isFinite(v) ? formatPercent(v, 2) : '—');
        const fmt0 = v => (typeof v === 'number' && Number.isFinite(v) ? formatNumber(v, 0) : '—');

        const readState = () => {
            try {
                const raw = localStorage.getItem('mercado_win_proj_v1');
                const obj = raw ? JSON.parse(raw) : null;
                return obj && typeof obj === 'object' ? obj : {};
            } catch {
                return {};
            }
        };
        const st = (() => {
            const cur = readState();
            const today = (() => {
                const d = new Date();
                const y = d.getFullYear();
                const m = String(d.getMonth() + 1).padStart(2, '0');
                const dd = String(d.getDate()).padStart(2, '0');
                return `${y}-${m}-${dd}`;
            })();
            const day = typeof cur.day === 'string' ? String(cur.day) : '';
            if (day !== today) {
                const next = { ...cur, day: today, overrides: {} };
                delete next.refClose;
                delete next.refAdjust;
                try { localStorage.setItem('mercado_win_proj_v1', JSON.stringify(next)); } catch { }
                return next;
            }
            return cur;
        })();

        const prevClose = (() => {
            const s = String(symWin || '');
            if (!s) return null;
            const pts = data && data.series && Array.isArray(data.series[s]) ? data.series[s] : [];
            if (!pts.length) return null;
            const last = lastPoint(s);
            if (!last || !last.t || typeof last.price !== 'number') return null;
            const lastYmd = (() => {
                const ms = Date.parse(last.t);
                if (!Number.isFinite(ms)) return '';
                return new Date(ms).toISOString().slice(0, 10);
            })();
            if (!lastYmd) return null;
            for (let i = pts.length - 1; i >= 0; i -= 1) {
                const p = pts[i];
                const t = p && p.t ? String(p.t) : '';
                const ms = Date.parse(t);
                if (!Number.isFinite(ms)) continue;
                const ymd = new Date(ms).toISOString().slice(0, 10);
                const price = p && typeof p.price === 'number' && Number.isFinite(p.price) ? p.price : null;
                if (ymd !== lastYmd && price !== null) return price;
            }
            return null;
        })();

        const defaultClose = (() => {
            if (typeof prevClose === 'number' && Number.isFinite(prevClose)) return prevClose;
            const p = lastPrice(symWin);
            return typeof p === 'number' && Number.isFinite(p) ? p : (options && options.items && options.items.WIN && typeof options.items.WIN.spot === 'number' ? options.items.WIN.spot : null);
        })();
        const defaultAdjust = (options && options.items && options.items.WIN && typeof options.items.WIN.spot === 'number' && Number.isFinite(options.items.WIN.spot)) ? options.items.WIN.spot : lastPrice(symWin);
        const refClose = typeof st.refClose === 'number' && Number.isFinite(st.refClose) ? st.refClose : defaultClose;
        const refAdjust = typeof st.refAdjust === 'number' && Number.isFinite(st.refAdjust) ? st.refAdjust : defaultAdjust;

        const betaIron = typeof st.betaIron === 'number' && Number.isFinite(st.betaIron) ? st.betaIron : 1.0;
        const betaCopper = typeof st.betaCopper === 'number' && Number.isFinite(st.betaCopper) ? st.betaCopper : 1.0;
        const betaOil = typeof st.betaOil === 'number' && Number.isFinite(st.betaOil) ? st.betaOil : 1.0;

        const ovr = st.overrides && typeof st.overrides === 'object' ? st.overrides : {};
        const ironManual = (typeof ovr.ironPct === 'number' && Number.isFinite(ovr.ironPct));
        const copperManual = (typeof ovr.copperPct === 'number' && Number.isFinite(ovr.copperPct));
        const oilManual = (typeof ovr.oilPct === 'number' && Number.isFinite(ovr.oilPct));
        const ironPct = ironManual ? ovr.ironPct : pct(symIron);
        const copperPct = copperManual ? ovr.copperPct : pct(symCopper);
        const oilPct = oilManual ? ovr.oilPct : pct(symOil);

        const proj = (base, driverPct, beta) => {
            if (!(typeof base === 'number' && Number.isFinite(base))) return { lvl: null, dPts: null };
            if (!(typeof driverPct === 'number' && Number.isFinite(driverPct))) return { lvl: null, dPts: null };
            const movePct = (driverPct * beta) / 100;
            const lvl = base * (1 + movePct);
            const dPts = lvl - base;
            return { lvl, dPts };
        };

        const row = (label, driverSym, driverPct, beta, k, isManual) => {
            const t = lastTime(driverSym);
            const fromClose = proj(refClose, driverPct, beta);
            const fromAdj = proj(refAdjust, driverPct, beta);
            const betaTxt = (typeof beta === 'number' && Number.isFinite(beta)) ? formatNumber(beta, 2) : '—';
            const dpTxt = `${fmtP(driverPct)}${isManual ? ' (manual)' : ''}`;
            return `
                <tr>
                    <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);font-weight:900;opacity:.92;">${escapeHtml(label)}</td>
                    <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);font-family:'Share Tech Mono',monospace;font-weight:900;opacity:.9;">${escapeHtml(driverSym || '—')}</td>
                    <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);text-align:right;font-family:'Share Tech Mono',monospace;font-weight:900;">${escapeHtml(dpTxt)}</td>
                    <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);text-align:right;font-family:'Share Tech Mono',monospace;font-weight:900;">${escapeHtml(betaTxt)}</td>
                    <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);text-align:right;font-family:'Share Tech Mono',monospace;font-weight:900;">${escapeHtml(fmt0(fromClose.lvl))} <span style="opacity:.7;">(${escapeHtml(fmt0(fromClose.dPts))})</span></td>
                    <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);text-align:right;font-family:'Share Tech Mono',monospace;font-weight:900;">${escapeHtml(fmt0(fromAdj.lvl))} <span style="opacity:.7;">(${escapeHtml(fmt0(fromAdj.dPts))})</span></td>
                    <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);text-align:right;opacity:.78;white-space:nowrap;">${t ? escapeHtml(formatDateTime(t)) : '—'}</td>
                    <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);text-align:right;">
                        <button type="button" data-winproj-copy="${escapeHtml(k)}" style="border:1px solid rgba(255,255,255,.18);border-radius:10px;padding:6px 8px;background:#151515;color:#e0e0e0;font-weight:900;letter-spacing:.4px;cursor:pointer;">Copiar</button>
                    </td>
                </tr>
            `;
        };

        const header = (() => {
            const tWin = lastTime(symWin);
            const winLast = lastPrice(symWin);
            const winBadge = (typeof winLast === 'number' && Number.isFinite(winLast)) ? `${fmt0(winLast)} • ${tWin ? formatDateTime(tWin) : '—'}` : '—';
            return winBadge;
        })();

        return `
            <div style="margin-top:12px;border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:12px;background:rgba(0,0,0,.18);">
                <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
                    <div style="font-weight:900;letter-spacing:1px;opacity:.95;">📐 Projeções WIN (pré) — Ferro • Cobre • Petróleo</div>
                    <div style="opacity:.78;font-size:12px;">Projeção: <span style="font-family:'Share Tech Mono',monospace;font-weight:900;">WIN_ref × (1 + β × Δ%_driver)</span> • Base por Fechamento e por Ajuste.</div>
                </div>
                <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
                    ${badge('neutral', `WIN agora: ${header}`)}
                    ${badge('neutral', `Ref Fechamento: ${fmt0(refClose)}`)}
                    ${badge('neutral', `Ref Ajuste: ${fmt0(refAdjust)}`)}
                    ${pillHtml('status', typeof prevClose === 'number' ? 'info' : 'warn', `Fech (ontem): ${fmt0(prevClose)}`, typeof prevClose === 'number' ? 0.55 : 0.85)}
                </div>
                <div style="margin-top:10px;display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:10px;">
                    <div>
                        <div style="opacity:.85;font-size:12px;margin-bottom:4px;">Ref Fechamento (WIN)</div>
                        <div style="display:flex;gap:8px;align-items:center;">
                            <input id="winproj-ref-close" type="number" step="1" value="${typeof refClose === 'number' && Number.isFinite(refClose) ? String(Math.round(refClose)) : ''}" style="flex:1;background:#101010;color:#e0e0e0;border:1px solid rgba(255,255,255,.14);padding:8px 10px;border-radius:10px;font-weight:900;" />
                            <button type="button" id="winproj-use-prevclose" data-value="${typeof prevClose === 'number' && Number.isFinite(prevClose) ? String(prevClose) : ''}" style="border:1px solid rgba(255,255,255,.18);border-radius:10px;padding:8px 10px;background:#151515;color:#e0e0e0;font-weight:900;letter-spacing:.4px;cursor:pointer;white-space:nowrap;">Usar</button>
                        </div>
                    </div>
                    <div>
                        <div style="opacity:.85;font-size:12px;margin-bottom:4px;">Ref Ajuste (WIN)</div>
                        <div style="display:flex;gap:8px;align-items:center;">
                            <input id="winproj-ref-adjust" type="number" step="1" value="${typeof refAdjust === 'number' && Number.isFinite(refAdjust) ? String(Math.round(refAdjust)) : ''}" style="flex:1;background:#101010;color:#e0e0e0;border:1px solid rgba(255,255,255,.14);padding:8px 10px;border-radius:10px;font-weight:900;" />
                            <button type="button" id="winproj-use-now" data-value="${typeof defaultAdjust === 'number' && Number.isFinite(defaultAdjust) ? String(defaultAdjust) : ''}" style="border:1px solid rgba(255,255,255,.18);border-radius:10px;padding:8px 10px;background:#151515;color:#e0e0e0;font-weight:900;letter-spacing:.4px;cursor:pointer;white-space:nowrap;">Agora</button>
                        </div>
                    </div>
                    <div>
                        <div style="opacity:.85;font-size:12px;margin-bottom:4px;">β Ferro→WIN</div>
                        <input id="winproj-beta-iron" type="number" step="0.05" value="${escapeHtml(String(betaIron))}" style="width:100%;background:#101010;color:#e0e0e0;border:1px solid rgba(255,255,255,.14);padding:8px 10px;border-radius:10px;font-weight:900;" />
                    </div>
                    <div>
                        <div style="opacity:.85;font-size:12px;margin-bottom:4px;">β Cobre→WIN</div>
                        <input id="winproj-beta-copper" type="number" step="0.05" value="${escapeHtml(String(betaCopper))}" style="width:100%;background:#101010;color:#e0e0e0;border:1px solid rgba(255,255,255,.14);padding:8px 10px;border-radius:10px;font-weight:900;" />
                    </div>
                    <div>
                        <div style="opacity:.85;font-size:12px;margin-bottom:4px;">β Petróleo→WIN</div>
                        <input id="winproj-beta-oil" type="number" step="0.05" value="${escapeHtml(String(betaOil))}" style="width:100%;background:#101010;color:#e0e0e0;border:1px solid rgba(255,255,255,.14);padding:8px 10px;border-radius:10px;font-weight:900;" />
                    </div>
                    <div>
                        <div style="opacity:.85;font-size:12px;margin-bottom:4px;">Δ% Ferro override (manual)</div>
                        <input id="winproj-ovr-iron" type="number" step="0.01" value="${ironManual ? escapeHtml(String(ovr.ironPct)) : ''}" placeholder="ex.: 1.00" style="width:100%;background:#101010;color:#e0e0e0;border:1px solid rgba(255,255,255,.14);padding:8px 10px;border-radius:10px;font-weight:900;" />
                    </div>
                    <div>
                        <div style="opacity:.85;font-size:12px;margin-bottom:4px;">Δ% Cobre override (manual)</div>
                        <input id="winproj-ovr-copper" type="number" step="0.01" value="${copperManual ? escapeHtml(String(ovr.copperPct)) : ''}" placeholder="ex.: -0.40" style="width:100%;background:#101010;color:#e0e0e0;border:1px solid rgba(255,255,255,.14);padding:8px 10px;border-radius:10px;font-weight:900;" />
                    </div>
                    <div>
                        <div style="opacity:.85;font-size:12px;margin-bottom:4px;">Δ% Petróleo override (manual)</div>
                        <div style="display:flex;gap:8px;align-items:center;">
                            <input id="winproj-ovr-oil" type="number" step="0.01" value="${oilManual ? escapeHtml(String(ovr.oilPct)) : ''}" placeholder="ex.: 0.70" style="flex:1;background:#101010;color:#e0e0e0;border:1px solid rgba(255,255,255,.14);padding:8px 10px;border-radius:10px;font-weight:900;" />
                            <button type="button" id="winproj-clear-overrides" style="border:1px solid rgba(255,255,255,.18);border-radius:10px;padding:8px 10px;background:#151515;color:#e0e0e0;font-weight:900;letter-spacing:.4px;cursor:pointer;white-space:nowrap;">Limpar</button>
                        </div>
                    </div>
                </div>
                <div style="margin-top:12px;border:1px solid rgba(255,255,255,.10);border-radius:12px;overflow:hidden;">
                    <div style="overflow:auto;">
                        <table style="width:100%;border-collapse:collapse;">
                            <thead>
                                <tr>
                                    <th style="text-align:left;padding:8px;border-bottom:1px solid rgba(255,255,255,.12);opacity:.85;">Driver</th>
                                    <th style="text-align:left;padding:8px;border-bottom:1px solid rgba(255,255,255,.12);opacity:.85;">Símbolo</th>
                                    <th style="text-align:right;padding:8px;border-bottom:1px solid rgba(255,255,255,.12);opacity:.85;">Δ% driver</th>
                                    <th style="text-align:right;padding:8px;border-bottom:1px solid rgba(255,255,255,.12);opacity:.85;">β</th>
                                    <th style="text-align:right;padding:8px;border-bottom:1px solid rgba(255,255,255,.12);opacity:.85;">Proj (Fech.)</th>
                                    <th style="text-align:right;padding:8px;border-bottom:1px solid rgba(255,255,255,.12);opacity:.85;">Proj (Ajuste)</th>
                                    <th style="text-align:right;padding:8px;border-bottom:1px solid rgba(255,255,255,.12);opacity:.85;">Carimbo</th>
                                    <th style="text-align:right;padding:8px;border-bottom:1px solid rgba(255,255,255,.12);opacity:.85;">Ação</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${row('Ferro (Sina/Dalian)', symIron, ironPct, betaIron, 'iron', ironManual)}
                                ${row('Cobre', symCopper, copperPct, betaCopper, 'copper', copperManual)}
                                ${row('Petróleo', symOil, oilPct, betaOil, 'oil', oilManual)}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div style="margin-top:10px;opacity:.78;font-size:12px;line-height:1.35;">
                    Automático quando os drivers estiverem atualizando no <span style="font-family:'Share Tech Mono',monospace;">market_quotes.json</span>. Quando Sina/driver falhar ou você quiser fixar o valor das 08:55, use o override manual (salva localmente por dia).
                </div>
            </div>
        `;
    })();

    const auditLine = (() => {
        const now = Date.now();
        const staleMs = 6 * 60 * 60 * 1000;
        const ageText = (t) => {
            const ms = t ? Date.parse(String(t)) : NaN;
            if (!Number.isFinite(ms)) return '—';
            const age = now - ms;
            if (!Number.isFinite(age) || age < 0) return '—';
            const m = Math.round(age / 60000);
            if (m < 60) return `${m}m`;
            const h = Math.round(m / 60);
            return `${h}h`;
        };
        const toneFromAge = (t) => {
            const ms = t ? Date.parse(String(t)) : NaN;
            if (!Number.isFinite(ms)) return 'neutral';
            const age = now - ms;
            if (!Number.isFinite(age) || age < 0) return 'neutral';
            if (age <= staleMs) return 'positive';
            return 'neutral';
        };
        const pickTs = (x) => {
            if (!x) return null;
            if (x.generatedAt) return x.generatedAt;
            if (x.source && x.source.updatedAt) return x.source.updatedAt;
            if (x.source && x.source.publishedAt) return x.source.publishedAt;
            return null;
        };
        const quotesTs = data && data.generatedAt ? data.generatedAt : null;
        const regTs = regime && regime.updatedAt ? regime.updatedAt : null;
        const optTs = pickTs(rawOptions);
        const webTs = pickTs(rawWeb);
        const flowTs = pickTs(rawForeign);
        const focusTs = pickTs(rawFocus);
        const zqTs = macro && macro.zq && macro.zq.generatedAt ? macro.zq.generatedAt : null;

        const bits = [
            badge(toneFromAge(quotesTs), `Quotes ${ageText(quotesTs)}`),
            badge(regime ? 'neutral' : 'negative', `Regime ${regime ? 'OK' : '—'}`),
            badge(rawOptions && rawOptions.ok === true ? toneFromAge(optTs) : 'neutral', `Opções ${rawOptions && rawOptions.ok === true ? ageText(optTs) : '—'}`),
            badge(rawWeb && rawWeb.ok === true ? toneFromAge(webTs) : 'neutral', `News ${rawWeb && rawWeb.ok === true ? ageText(webTs) : '—'}`),
            badge(rawForeign && rawForeign.ok === true ? toneFromAge(flowTs) : 'neutral', `Fluxo ${rawForeign && rawForeign.ok === true ? ageText(flowTs) : '—'}`),
            badge(rawFocus && rawFocus.ok === true ? toneFromAge(focusTs) : 'neutral', `Focus ${rawFocus && rawFocus.ok === true ? ageText(focusTs) : '—'}`),
            badge(zqTs ? toneFromAge(zqTs) : 'neutral', `ZQ ${zqTs ? ageText(zqTs) : '—'}`),
        ];
        return `<div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;opacity:.95;">${bits.join('')}</div>`;
    })();

    const brFlowModule = (() => {
        if (!brFlowSignal || typeof brFlowSignal.score !== 'number' || !Number.isFinite(brFlowSignal.score)) return '';
        const s = brFlowSignal.score;
        const c = (typeof brFlowSignal.confidence === 'number' && Number.isFinite(brFlowSignal.confidence)) ? brFlowSignal.confidence : null;
        const tone = (s >= 0.38 && (c === null || c >= 0.62)) ? 'positive' : (s <= -0.38 && (c === null || c >= 0.62)) ? 'negative' : 'neutral';
        const bias = s > 0.22 ? 'Entrada em BR/EM' : s < -0.22 ? 'Saída de BR/EM' : 'Misto';
        const confTxt = c === null ? '—' : `${formatNumber(c * 100, 0)}%`;
        const drivers = Array.isArray(brFlowSignal.drivers) ? brFlowSignal.drivers.slice(0, 6) : [];
        const driversTxt = drivers.length ? drivers.join(' • ') : '—';
        const guide = s > 0.22
            ? 'Tese: fluxo global favorecendo emergentes/Brasil → tende a WIN↑ e WDO↓ (buscar alvos curtos a favor, evitar vender WIN “no dedo”).'
            : s < -0.22
                ? 'Tese: fluxo global saindo de emergentes/Brasil → tende a WIN↓ e WDO↑ (buscar alvos curtos a favor, evitar comprar WIN “no dedo”).'
                : 'Tese: misto → priorize scalp por níveis (range) e confirme em 5m×15m.';

        return `
            <div style="margin-top:12px;border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:12px;background:rgba(0,0,0,.18);">
                <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
                    <div style="font-weight:900;letter-spacing:1px;opacity:.95;">📌 Fluxo Global → Brasil (sinal de alta prob.)</div>
                    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
                        ${badge(tone, `${bias}`)}
                        ${badge('neutral', `Score ${formatNumber(s, 2)}`)}
                        ${badge('neutral', `Conf ${confTxt}`)}
                    </div>
                </div>
                <div style="margin-top:8px;opacity:.86;font-size:12px;line-height:1.35;">Drivers: ${escapeHtml(driversTxt)}${brFlowSignal.detail ? ` • ${escapeHtml(brFlowSignal.detail)}` : ''}</div>
                <div style="margin-top:8px;opacity:.86;font-size:12px;line-height:1.35;">${escapeHtml(guide)}</div>
            </div>
        `;
    })();

    el.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
            <div style="font-weight:900;letter-spacing:1px;opacity:.95;">Roteiro do momento</div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
                ${badge(confidence.score >= 0.72 ? 'positive' : confidence.score >= 0.56 ? 'neutral' : 'negative', `Prioridade: ${confidence.label}`)}
                ${badge('neutral', regime ? `Regime: ${regime.label}` : 'Regime: —')}
                <button type="button" id="opTuningToggle" style="border:1px solid rgba(255,255,255,.18);border-radius:999px;padding:4px 10px;background:#151515;color:#e0e0e0;font-weight:900;letter-spacing:.6px;cursor:pointer;">Ajustes</button>
            </div>
        </div>
        ${auditLine}
        ${brFlowModule}
        <div style="margin-top:8px;opacity:.86;font-size:12px;line-height:1.35;">
            ${escapeHtml(regimeLine)} • ${escapeHtml(agendaLine)} • ${escapeHtml(newsLine)} • ${escapeHtml(macroLine)}${corrLine ? ` • ${escapeHtml(corrLine)}` : ''}
        </div>
        <div style="margin-top:6px;opacity:.72;font-size:11px;line-height:1.35;">
            Escalas: scores -1..+1 (sinal + = compra do ativo; sinal - = venda). Regime é discreto (buy/sell/neutral) e entra como direção.
        </div>
        <div id="opTuningPanel" style="display:none;margin-top:10px;border:1px dashed rgba(255,255,255,.20);border-radius:12px;padding:10px;background:rgba(0,0,0,.18);">
            <div style="font-weight:900;letter-spacing:.8px;margin-bottom:8px;opacity:.92;">Calibração rápida</div>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:10px;">
                <div>
                    <div style="opacity:.85;font-size:12px;margin-bottom:4px;">Threshold DXY (${formatNumber(operationalTuning.threshold.dxy, 2)})</div>
                    <input id="op-th-dxy" type="range" min="0" max="0.5" step="0.01" value="${operationalTuning.threshold.dxy}" />
                </div>
                <div>
                    <div style="opacity:.85;font-size:12px;margin-bottom:4px;">Threshold EM (${formatNumber(operationalTuning.threshold.em, 2)})</div>
                    <input id="op-th-em" type="range" min="0" max="0.5" step="0.01" value="${operationalTuning.threshold.em}" />
                </div>
                <div>
                    <div style="opacity:.85;font-size:12px;margin-bottom:4px;">Threshold Export (${formatNumber(operationalTuning.threshold.export, 2)})</div>
                    <input id="op-th-export" type="range" min="0" max="0.6" step="0.01" value="${operationalTuning.threshold.export}" />
                </div>
                <div>
                    <div style="opacity:.85;font-size:12px;margin-bottom:4px;">Threshold Juros (Δbp/10) (${formatNumber(operationalTuning.threshold.yields, 2)})</div>
                    <input id="op-th-yields" type="range" min="0" max="2" step="0.01" value="${operationalTuning.threshold.yields}" />
                </div>
                <div>
                    <div style="opacity:.85;font-size:12px;margin-bottom:4px;">Threshold Fluxo→BR (${formatNumber(operationalTuning.threshold.brFlow, 2)})</div>
                    <input id="op-th-brflow" type="range" min="0" max="0.8" step="0.01" value="${operationalTuning.threshold.brFlow}" />
                </div>
                <div>
                    <div style="opacity:.85;font-size:12px;margin-bottom:4px;">Threshold ZQ slope (${formatNumber(operationalTuning.threshold.zqSlope, 2)}%)</div>
                    <input id="op-th-zq" type="range" min="0" max="0.5" step="0.01" value="${operationalTuning.threshold.zqSlope}" />
                </div>
            </div>
            <div style="margin-top:8px;display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:10px;">
                <div>
                    <div style="opacity:.85;font-size:12px;margin-bottom:4px;">Peso Flow (${formatNumber(operationalTuning.weight.flow, 2)})</div>
                    <input id="op-w-flow" type="range" min="0" max="1" step="0.01" value="${operationalTuning.weight.flow}" />
                </div>
                <div>
                    <div style="opacity:.85;font-size:12px;margin-bottom:4px;">Peso DXY (${formatNumber(operationalTuning.weight.dxy, 2)})</div>
                    <input id="op-w-dxy" type="range" min="0" max="1" step="0.01" value="${operationalTuning.weight.dxy}" />
                </div>
                <div>
                    <div style="opacity:.85;font-size:12px;margin-bottom:4px;">Peso Export (${formatNumber(operationalTuning.weight.export, 2)})</div>
                    <input id="op-w-export" type="range" min="0" max="1" step="0.01" value="${operationalTuning.weight.export}" />
                </div>
                <div>
                    <div style="opacity:.85;font-size:12px;margin-bottom:4px;">Peso EM (${formatNumber(operationalTuning.weight.em, 2)})</div>
                    <input id="op-w-em" type="range" min="0" max="1" step="0.01" value="${operationalTuning.weight.em}" />
                </div>
                <div>
                    <div style="opacity:.85;font-size:12px;margin-bottom:4px;">Peso Juros (${formatNumber(operationalTuning.weight.yields, 2)})</div>
                    <input id="op-w-yields" type="range" min="0" max="1" step="0.01" value="${operationalTuning.weight.yields}" />
                </div>
                <div>
                    <div style="opacity:.85;font-size:12px;margin-bottom:4px;">Peso Fluxo→BR (${formatNumber(operationalTuning.weight.brFlow, 2)})</div>
                    <input id="op-w-brflow" type="range" min="0" max="1" step="0.01" value="${operationalTuning.weight.brFlow}" />
                </div>
                <div>
                    <div style="opacity:.85;font-size:12px;margin-bottom:4px;">Peso ZQ (${formatNumber(operationalTuning.weight.zq, 2)})</div>
                    <input id="op-w-zq" type="range" min="0" max="1" step="0.01" value="${operationalTuning.weight.zq}" />
                </div>
            </div>
        </div>
        ${(() => {
            const raw = operationalInputs.focusSummary || null;
            if (!raw) return '';
            const ok = raw && raw.ok === true;
            const msg = raw && raw.message ? String(raw.message) : 'Indisponível.';
            const pageUrl = raw && raw.source && raw.source.pageUrl ? String(raw.source.pageUrl) : 'https://www.bcb.gov.br/publicacoes/focus';
            const pdfUrl = raw && raw.source && raw.source.pdfUrl ? String(raw.source.pdfUrl) : '';
            const cutoffDate = raw && raw.source && raw.source.cutoffDate ? String(raw.source.cutoffDate) : '';
            const publishedAt = raw && raw.source && raw.source.publishedAt ? String(raw.source.publishedAt) : '';
            const datasetUrl = raw && raw.source && raw.source.datasetUrl ? String(raw.source.datasetUrl) : '';
            const fmt2 = v => (typeof v === 'number' && Number.isFinite(v) ? formatNumber(v, 2) : '—');
            const fmt4 = v => (typeof v === 'number' && Number.isFinite(v) ? formatNumber(v, 4) : '—');
            const dTone = (k, d) => {
                if (!(typeof d === 'number' && Number.isFinite(d)) || d === 0) return 'neutral';
                if (k === 'pib') return d > 0 ? 'positive' : 'negative';
                return d > 0 ? 'negative' : 'positive';
            };
            const dTxt = d => (typeof d === 'number' && Number.isFinite(d) && d !== 0 ? `${d > 0 ? '+' : ''}${fmt2(d)}` : '0.00');
            const line = (label, k, p, fmtVal) => {
                const med = p && typeof p.mediana === 'number' ? p.mediana : null;
                const d = p && typeof p.deltaMediana === 'number' ? p.deltaMediana : null;
                const t = dTone(k, d);
                const deltaBadge = toneBadgeHtmlFromTone(t, d || 0, `Δ ${dTxt(d)}`, { maxAbs: 2 });
                return `
                    <div style="display:flex;justify-content:space-between;gap:10px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06);">
                        <div style="opacity:.9;font-weight:900;">${escapeHtml(label)}</div>
                        <div style="display:flex;gap:8px;align-items:center;font-family:'Share Tech Mono',monospace;font-weight:900;">
                            <span style="opacity:.95;">${escapeHtml(fmtVal(med))}</span>
                            ${deltaBadge}
                        </div>
                    </div>
                `;
            };
            if (!ok) {
                return `
                    <div style="margin-top:12px;border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:12px;background:rgba(0,0,0,.18);">
                        <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
                            <div style="font-weight:900;letter-spacing:1px;opacity:.95;">🧩 Boletim Focus (BCB)</div>
                            <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
                                ${publishedAt ? badge('neutral', `Publicado: ${formatDateTimeLoose(publishedAt)}`) : ''}
                                ${cutoffDate ? badge('neutral', `Corte: ${cutoffDate}`) : ''}
                                <a href="${escapeHtml(pageUrl)}" target="_blank" class="underline_link" style="font-size:12px;opacity:.92;">página</a>
                                ${pdfUrl ? `<a href="${escapeHtml(pdfUrl)}" target="_blank" class="underline_link" style="font-size:12px;opacity:.92;">pdf</a>` : ''}
                            </div>
                        </div>
                        <div style="margin-top:8px;opacity:.88;line-height:1.35;">${escapeHtml(msg)}</div>
                    </div>
                `;
            }
            const refYear = raw && raw.derived && raw.derived.referenceYear ? String(raw.derived.referenceYear) : '';
            const yearKeys = (() => {
                const start = /^\d{4}$/.test(refYear) ? Number(refYear) : NaN;
                if (Number.isFinite(start)) return [start, start + 1, start + 2, start + 3].map(y => String(y));
                const ys = raw && raw.years && typeof raw.years === 'object' ? Object.keys(raw.years) : [];
                return ys.filter(y => /^\d{4}$/.test(y)).sort().slice(0, 4);
            })();
            const y0 = raw && raw.years && yearKeys[0] && raw.years[yearKeys[0]] ? raw.years[yearKeys[0]] : null;
            const bias = raw && raw.derived && raw.derived.bias ? String(raw.derived.bias) : 'mixed';
            const score = raw && raw.derived && typeof raw.derived.score === 'number' && Number.isFinite(raw.derived.score) ? raw.derived.score : 0;
            const wdo = raw && raw.derived && raw.derived.wdo ? String(raw.derived.wdo) : '≈';
            const win = raw && raw.derived && raw.derived.win ? String(raw.derived.win) : '≈';
            const biasLabel = bias === 'hawkish' ? 'mais duro' : bias === 'dovish' ? 'mais leve' : 'misto';
            const biasTone = bias === 'hawkish' ? 'negative' : bias === 'dovish' ? 'positive' : 'neutral';
            const interpretation =
                bias === 'hawkish'
                    ? 'Leitura: revisões para cima em inflação/juros/câmbio e/ou para baixo em crescimento → piora de condições financeiras. Operacional: tende a WDO↑ / WIN↓ (precisa confirmar com preço/fluxo).'
                    : bias === 'dovish'
                        ? 'Leitura: revisões para baixo em inflação/juros/câmbio e/ou para cima em crescimento → alívio de condições financeiras. Operacional: tende a WDO↓ / WIN↑ (precisa confirmar com preço/fluxo).'
                        : 'Leitura: revisões mistas (sem direção clara). Operacional: tratar como neutro e esperar confirmação por preço/fluxo.';
            const focusInsights = (() => {
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
                const ipcaD = head ? head.ipcaD : null;
                const selicD = head ? head.selicD : null;
                const fxD = head ? head.fxD : null;
                const pibD = head ? head.pibD : null;
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
            })();
            const insightCard = (title, text) => {
                if (!text) return '';
                return `
                    <div style="border:1px solid rgba(255,255,255,.10);border-radius:12px;padding:10px;background:rgba(0,0,0,.12);">
                        <div style="font-weight:900;letter-spacing:.6px;opacity:.92;">${escapeHtml(title)}</div>
                        <div style="margin-top:6px;opacity:.86;line-height:1.35;font-size:12px;">${escapeHtml(text)}</div>
                    </div>
                `;
            };
            const insightsHtml = (() => {
                const blocks = [
                    insightCard('Macro', focusInsights.macroText),
                    insightCard('Carry Trade', focusInsights.carryText),
                    insightCard('Curva de Juros', focusInsights.curveText),
                ].filter(Boolean);
                if (!blocks.length) return '';
                return `
                    <div style="margin-top:10px;display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:10px;">
                        ${blocks.join('')}
                    </div>
                `;
            })();
            const yearCard = (title, pack) => {
                if (!pack) return '';
                const updated = pack.updatedAt ? formatDateTimeLoose(pack.updatedAt) : '';
                return `
                    <div style="border:1px solid rgba(255,255,255,.10);border-radius:12px;padding:10px;background:rgba(0,0,0,.12);">
                        <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
                            <div style="font-weight:900;letter-spacing:.8px;">${escapeHtml(title)}</div>
                            <div style="opacity:.75;font-size:12px;white-space:nowrap;">${escapeHtml(updated || '')}</div>
                        </div>
                        <div style="margin-top:8px;">
                            ${line('IPCA (%)', 'ipca', pack.ipca, fmt2)}
                            ${line('Selic (%)', 'selic', pack.selic, fmt2)}
                            ${line('Câmbio (R$/US$)', 'cambio', pack.cambio, fmt4)}
                            ${line('PIB (%)', 'pib', pack.pib, fmt2)}
                        </div>
                    </div>
                `;
            };
            return `
                <div style="margin-top:12px;border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:12px;background:rgba(0,0,0,.18);">
                    <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
                        <div style="font-weight:900;letter-spacing:1px;opacity:.95;">🧩 Boletim Focus (BCB)</div>
                        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
                            ${badge(biasTone, `Viés: ${biasLabel}`)}
                            ${badge('neutral', `Score: ${formatNumber(score, 2)}`)}
                            ${badge('neutral', `WDO ${wdo}`)}
                            ${badge('neutral', `WIN ${win}`)}
                            ${publishedAt ? badge('neutral', `Publicado: ${formatDateTimeLoose(publishedAt)}`) : ''}
                            ${cutoffDate ? badge('neutral', `Corte: ${cutoffDate}`) : ''}
                            <a href="${escapeHtml(pageUrl)}" target="_blank" class="underline_link" style="font-size:12px;opacity:.92;">página</a>
                            ${pdfUrl ? `<a href="${escapeHtml(pdfUrl)}" target="_blank" class="underline_link" style="font-size:12px;opacity:.92;">pdf</a>` : ''}
                            ${datasetUrl ? `<a href="${escapeHtml(datasetUrl)}" target="_blank" class="underline_link" style="font-size:12px;opacity:.75;">dataset</a>` : ''}
                        </div>
                    </div>
                    <div style="margin-top:8px;opacity:.90;line-height:1.35;">${escapeHtml(interpretation)}</div>
                    ${insightsHtml}
                    <div style="margin-top:10px;display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:10px;">
                        ${(yearKeys || [])
                            .map(y => yearCard(`Mediana ${y}`, raw && raw.years ? raw.years[y] : null))
                            .join('')}
                    </div>
                </div>
            `;
        })()}
        ${pulseCard}
        ${scalpModule}
        ${winProjectionModule}
        <div style="margin-top:10px;display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:12px;">
            ${items.length ? items.map(makePlan).join('') : `<div style="padding:12px;border:1px solid rgba(255,255,255,.12);border-radius:14px;background:rgba(0,0,0,.18);opacity:.88;">Sem dados de WDO/WIN em Opções & Gamma (Resumo).</div>`}
        </div>
        ${(() => {
            const now = new Date();
            const hr = now.getHours();
            const min = now.getMinutes();
            if (hr > 11 || (hr === 11 && min >= 1)) return '';
            const assets = data && Array.isArray(data.assets) ? data.assets : [];
            const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
            const isRecentPremarketSnapshot = asOf => {
                if (!(asOf instanceof Date) || !Number.isFinite(asOf.getTime())) return false;
                const ageMs = now.getTime() - asOf.getTime();
                const maxAgeMs = 20 * 60 * 60 * 1000;
                return ageMs >= -2 * 60 * 1000 && ageMs <= maxAgeMs;
            };
            const rows = assets.map(a => {
                const last = getLastPoint(data, a.symbol);
                const asOfVal = last && (last.asOf || last.t) ? (last.asOf || last.t) : null;
                const tMs = asOfVal ? Date.parse(asOfVal) : NaN;
                const asOf = Number.isFinite(tMs) ? new Date(tMs) : null;
                const pct = pointPct(last);
                return { symbol: a.symbol, name: a.name, last, pct, asOf, isAdr: isBrazilAdr({ symbol: a.symbol, name: a.name }) };
            }).filter(r => r.isAdr && r.pct !== null && r.asOf && isRecentPremarketSnapshot(r.asOf));
            if (!rows.length) return '';
            const ups = rows.filter(r => r.pct > 0);
            const downs = rows.filter(r => r.pct < 0);
            const avg = rows.length ? rows.reduce((s, r) => s + r.pct, 0) / rows.length : 0;
            const bias = avg > operationalTuning.threshold.export ? 'ALTISTA' : avg < -operationalTuning.threshold.export ? 'BAIXISTA' : 'NEUTRO';
            const top = rows.slice().sort((a, b) => Math.abs(b.pct) - Math.abs(a.pct)).slice(0, 6);
            const toneColor = avg > 0 ? 'rgba(0,255,160,.95)' : avg < 0 ? 'rgba(255,60,80,.95)' : 'rgba(255,210,74,.95)';
            const deg = Math.round(Math.max(-1, Math.min(1, avg / 0.6)) * 60);
            const gauge = `
                <div style="display:flex;align-items:center;gap:10px;">
                    <div style="width:110px;height:60px;border:1px solid rgba(255,255,255,.18);border-radius:110px 110px 0 0;background:rgba(0,0,0,.22);position:relative;overflow:hidden;box-shadow:${avg > 0 ? '0 0 18px rgba(0,255,160,.35)' : avg < 0 ? '0 0 18px rgba(255,60,80,.35)' : '0 0 18px rgba(255,210,74,.28)'};">
                        <div style="position:absolute;left:8px;right:8px;bottom:8px;height:12px;border-radius:999px;background:linear-gradient(90deg, rgba(255,60,80,.85) 0%, rgba(255,210,74,.85) 50%, rgba(0,255,160,.85) 100%);opacity:.85;"></div>
                        <div style="position:absolute;left:50%;bottom:8px;width:3px;height:46px;background:${toneColor};transform-origin:bottom center;transform:translateX(-50%) rotate(${deg}deg);box-shadow:0 0 14px rgba(255,255,255,.22);border-radius:3px;"></div>
                    </div>
                    <div style="font-family:'Share Tech Mono',monospace;font-weight:900;letter-spacing:.6px;">ADR pré • ${bias} • ${formatPercent(avg, 2)}</div>
                </div>
            `;
            const list = top.map(r => {
                const pct = r.pct;
                const c = pct > 0 ? 'rgba(0,255,160,.95)' : pct < 0 ? 'rgba(255,60,80,.95)' : 'rgba(255,210,74,.95)';
                return `
                    <div style="display:flex;align-items:center;justify-content:space-between;padding:6px 8px;border:1px solid rgba(255,255,255,.10);border-radius:9px;background:rgba(0,0,0,.16);">
                        <div style="display:flex;align-items:center;gap:8px;">
                            <div style="width:8px;height:8px;border-radius:999px;background:${c};"></div>
                            <div style="font-weight:700;letter-spacing:.5px;opacity:.92;">${escapeHtml(r.name || r.symbol)}</div>
                        </div>
                        <div style="font-family:'Share Tech Mono',monospace;">${formatPercent(pct, 2)}</div>
                    </div>
                `;
            }).join('');
            return `
                <div style="margin-top:12px;border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:12px;background:rgba(0,0,0,.18);">
                    <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;">
                        <div style="font-weight:900;letter-spacing:1px;opacity:.95;">ADR BR (Extended Hours) • até 11:00</div>
                        <div style="opacity:.86;font-size:12px;">${ups.length} ↑ • ${downs.length} ↓ • ${rows.length} total</div>
                    </div>
                    <div style="margin-top:8px;">${gauge}</div>
                    <div style="margin-top:10px;display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:8px;">${list}</div>
                </div>
            `;
        })()}
        ${(() => {
            if (!cdsSignal) return '';
            if (cdsSignal.mode === 'neutral') return '';
            const tone = cdsSignal.tone;
            const title = 'CDS Brasil: fluxo x hedge';
            const op = cdsSignal.mode === 'hedge_on_risk_on'
                ? 'Leitura: proteção subindo sem “desmontar Brasil” (possível compra de risco com hedge). Operacional: manter viés do regime, mas exigir confirmação e usar stops/hedge.'
                : cdsSignal.mode === 'risk_off_classic'
                    ? 'Leitura: proteção subindo com BRL enfraquecendo e bolsa caindo (risk-off clássico). Operacional: reduzir risco e priorizar proteção.'
                    : cdsSignal.mode === 'relief_risk_on'
                        ? 'Leitura: melhora de risco (CDS↓) com BRL fortalecendo e bolsa subindo. Operacional: favorece risco (desde que o regime confirme).'
                        : 'Leitura: CDS sinaliza movimento sem confirmação completa. Operacional: tratar como cautela.';
            return `
                <div style="margin-top:12px;border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:12px;background:rgba(0,0,0,.18);">
                    <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
                        <div style="font-weight:900;letter-spacing:1px;opacity:.95;">${escapeHtml(title)}</div>
                        <div style="font-family:'Share Tech Mono',monospace;font-weight:900;">${toneBadgeHtmlFromTone(tone, cdsSignal.confidence, `${formatNumber(cdsSignal.confidence * 100, 0)}%`, { maxAbs: 1 })}</div>
                    </div>
                    <div style="margin-top:8px;font-weight:900;">${toneBadgeHtmlFromTone(tone, 0, cdsSignal.label, { maxAbs: 1 })}</div>
                    <div style="margin-top:8px;opacity:.86;font-family:'Share Tech Mono',monospace;font-weight:900;">${escapeHtml(cdsSignal.detail)}</div>
                    <div style="margin-top:8px;opacity:.92;line-height:1.35;">${escapeHtml(op)}</div>
                </div>
            `;
        })()}
        <div style="margin-top:12px;border-top:1px solid rgba(255,255,255,.10);padding-top:12px;">
            <div style="font-weight:900;letter-spacing:1px;opacity:.95;margin-bottom:6px;">Fatores considerados</div>
            <table class="data-table" style="width:100%;border-collapse:collapse;table-layout:auto;">
                <thead>
                    <tr>
                        <th style="text-align:left;padding:8px;border-bottom:1px solid rgba(255,255,255,.15);">Fator</th>
                        <th style="text-align:left;padding:8px;border-bottom:1px solid rgba(255,255,255,.15);">Valor</th>
                        <th style="text-align:left;padding:8px;border-bottom:1px solid rgba(255,255,255,.15);">Impacto WDO</th>
                        <th style="text-align:left;padding:8px;border-bottom:1px solid rgba(255,255,255,.15);">Impacto WIN</th>
                        <th style="text-align:left;padding:8px;border-bottom:1px solid rgba(255,255,255,.15);">Peso</th>
                    </tr>
                </thead>
                <tbody>
                    ${(() => {
                        const mk = (tone, txt) => toneBadgeHtmlFromTone(tone, 0, txt, { maxAbs: 1 });
                        const mkPct = v => (typeof v === 'number' ? formatPercent(v, 2) : '—');
                        const mkNum = v => (typeof v === 'number' ? formatNumber(v, 2) : '—');
                        const dirTone = d => d > 0 ? 'positive' : d < 0 ? 'negative' : 'neutral';
                        const link = (href, label) => {
                            if (!href) return escapeHtml(label);
                            return `<a href="${href}" style="color:inherit;text-decoration:underline;text-decoration-color:rgba(255,255,255,.25);text-underline-offset:3px;">${escapeHtml(label)}</a>`;
                        };
                        const rows = [];
                        rows.push(`
                            <tr>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${link('#regimeConviction', 'Flow (Regime)')}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${mk('neutral', regime ? regime.label : '—')}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${mk(dirTone(macroWdo.score), macroWdo.bias === 'buy' ? 'Compra' : macroWdo.bias === 'sell' ? 'Venda' : 'Neutro')}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${mk(dirTone(macroWin.score), macroWin.bias === 'buy' ? 'Compra' : macroWin.bias === 'sell' ? 'Venda' : 'Neutro')}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${mk('neutral', String(operationalTuning.weight.flow))}</td>
                            </tr>
                        `);
                        rows.push(`
                            <tr>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${link('#newsWebModule', 'Notícias (tilt)')}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">WDO ${mkNum(newsTilt.wdo.score)} • WIN ${mkNum(newsTilt.win.score)}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${mk(dirTone(newsTilt.wdo.score), newsTilt.wdo.score > 0.22 ? 'Compra' : newsTilt.wdo.score < -0.22 ? 'Venda' : 'Neutro')}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${mk(dirTone(newsTilt.win.score), newsTilt.win.score > 0.22 ? 'Compra' : newsTilt.win.score < -0.22 ? 'Venda' : 'Neutro')}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${mk('neutral', '0.4')}</td>
                            </tr>
                        `);
                        rows.push(`
                            <tr>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${link('#operational-now', 'Confirmação (WIN↑ & WDO↓)')}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${mk(priceLead.active ? 'positive' : 'neutral', priceLead.active ? priceLead.reason : '—')}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${mk(priceLead.active ? 'negative' : 'neutral', priceLead.active ? 'Venda' : 'Neutro')}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${mk(priceLead.active ? 'positive' : 'neutral', priceLead.active ? 'Compra' : 'Neutro')}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${mk('neutral', 'tático')}</td>
                            </tr>
                        `);
                        rows.push(`
                            <tr>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${link('#overview', 'DXY')}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${mkPct(macro ? macro.dxyPct : null)}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${mk(dirTone(macroWdo.score), macroWdo.bias === 'buy' ? 'Compra' : macroWdo.bias === 'sell' ? 'Venda' : 'Neutro')}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${mk(dirTone(macroWin.score), macroWin.bias === 'buy' ? 'Compra' : macroWin.bias === 'sell' ? 'Venda' : 'Neutro')}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${mk('neutral', String(operationalTuning.weight.dxy))}</td>
                            </tr>
                        `);
                        rows.push(`
                            <tr>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${link('#overview', 'USDX (DX=F)')}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${(() => {
                                    const last = getLastPoint(data, 'USDX') || null;
                                    const price = last && typeof last.price === 'number' && Number.isFinite(last.price) ? last.price : null;
                                    const pct = pointPct(last);
                                    const px = price !== null ? mk('neutral', mkNum(price)) : mk('neutral', '—');
                                    const pp = pct !== null ? mk('neutral', mkPct(pct)) : mk('neutral', '—');
                                    return `${px} • ${pp}`;
                                })()}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${(() => {
                                    const last = getLastPoint(data, 'USDX') || null;
                                    const pct = pointPct(last);
                                    const t = typeof operationalTuning.threshold.dxy === 'number' && Number.isFinite(operationalTuning.threshold.dxy) ? operationalTuning.threshold.dxy : 0.12;
                                    const dir = typeof pct === 'number' ? (pct > t ? +1 : pct < -t ? -1 : 0) : 0;
                                    return mk(dirTone(dir), dir > 0 ? 'Compra' : dir < 0 ? 'Venda' : 'Neutro');
                                })()}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${(() => {
                                    const last = getLastPoint(data, 'USDX') || null;
                                    const pct = pointPct(last);
                                    const t = typeof operationalTuning.threshold.dxy === 'number' && Number.isFinite(operationalTuning.threshold.dxy) ? operationalTuning.threshold.dxy : 0.12;
                                    const dir = typeof pct === 'number' ? (pct > t ? -1 : pct < -t ? +1 : 0) : 0;
                                    return mk(dirTone(dir), dir > 0 ? 'Compra' : dir < 0 ? 'Venda' : 'Neutro');
                                })()}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${mk('neutral', 'informativo')}</td>
                            </tr>
                        `);
                        rows.push(`
                            <tr>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${link('#chinaBrazil', 'Export Basket')}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${mkPct(macro ? macro.exportScore : null)}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${mk(dirTone(macroWdo.score), macroWdo.bias === 'sell' ? 'Venda' : macroWdo.bias === 'buy' ? 'Compra' : 'Neutro')}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${mk(dirTone(macroWin.score), macroWin.bias === 'buy' ? 'Compra' : macroWin.bias === 'sell' ? 'Venda' : 'Neutro')}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${mk('neutral', String(operationalTuning.weight.export))}</td>
                            </tr>
                        `);
                        rows.push(`
                            <tr>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${link('#chinaBrazil', 'EM Basket (USD/EM)')}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${mkPct(macro && macro.em ? macro.em.pct : null)}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${mk(dirTone(macroWdo.score), macroWdo.bias === 'buy' ? 'Compra' : macroWdo.bias === 'sell' ? 'Venda' : 'Neutro')}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${mk(dirTone(macroWin.score), macroWin.bias === 'buy' ? 'Compra' : macroWin.bias === 'sell' ? 'Venda' : 'Neutro')}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${mk('neutral', String(operationalTuning.weight.em))}</td>
                            </tr>
                        `);
                        rows.push(`
                            <tr>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${link('#us-equities', 'HTDIX (Dividend+Momentum)')}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${(() => {
                                    const last = getLastPoint(data, 'HTDIX') || null;
                                    const price = last && typeof last.price === 'number' && Number.isFinite(last.price) ? last.price : null;
                                    const pct = pointPct(last);
                                    const px = price !== null ? mk('neutral', mkNum(price)) : mk('neutral', '—');
                                    const pp = pct !== null ? mk('neutral', mkPct(pct)) : mk('neutral', '—');
                                    return `${px} • ${pp}`;
                                })()}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${(() => {
                                    const last = getLastPoint(data, 'HTDIX') || null;
                                    const pct = pointPct(last);
                                    const t = 0.25;
                                    const dir = typeof pct === 'number' ? (pct > t ? -1 : pct < -t ? +1 : 0) : 0;
                                    return mk(dirTone(dir), dir > 0 ? 'Compra' : dir < 0 ? 'Venda' : 'Neutro');
                                })()}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${(() => {
                                    const last = getLastPoint(data, 'HTDIX') || null;
                                    const pct = pointPct(last);
                                    const t = 0.25;
                                    const dir = typeof pct === 'number' ? (pct > t ? +1 : pct < -t ? -1 : 0) : 0;
                                    return mk(dirTone(dir), dir > 0 ? 'Compra' : dir < 0 ? 'Venda' : 'Neutro');
                                })()}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${mk('neutral', 'informativo')}</td>
                            </tr>
                        `);
                        rows.push(`
                            <tr>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${link('#flow-sentinel', 'Sentinela de Fluxo (FX)')}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${(() => {
                                    const fs = macro && macro.flowSentinel ? macro.flowSentinel : null;
                                    if (!fs || typeof fs.composite !== 'number' || !Number.isFinite(fs.composite)) return mk('neutral', '—');
                                    const lab = fs.label ? String(fs.label) : '';
                                    const txt = `${lab ? `${lab} ` : ''}${formatNumber(fs.composite, 3)}${fs.divergence ? ' • DIVERGENTE' : ''}`;
                                    return mk(fs.divergence ? 'negative' : 'neutral', txt);
                                })()}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${(() => {
                                    const fs = macro && macro.flowSentinel ? macro.flowSentinel : null;
                                    if (!fs || fs.divergence || typeof fs.composite !== 'number' || !Number.isFinite(fs.composite)) return mk('neutral', 'Neutro');
                                    const t = typeof operationalTuning.threshold.flowSentinel === 'number' && Number.isFinite(operationalTuning.threshold.flowSentinel) ? operationalTuning.threshold.flowSentinel : 0.25;
                                    const dirUsd = fs.composite < -t ? +1 : fs.composite > t ? -1 : 0;
                                    return mk(dirTone(dirUsd), dirUsd > 0 ? 'Compra' : dirUsd < 0 ? 'Venda' : 'Neutro');
                                })()}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${(() => {
                                    const fs = macro && macro.flowSentinel ? macro.flowSentinel : null;
                                    if (!fs || fs.divergence || typeof fs.composite !== 'number' || !Number.isFinite(fs.composite)) return mk('neutral', 'Neutro');
                                    const t = typeof operationalTuning.threshold.flowSentinel === 'number' && Number.isFinite(operationalTuning.threshold.flowSentinel) ? operationalTuning.threshold.flowSentinel : 0.25;
                                    const dirUsd = fs.composite < -t ? +1 : fs.composite > t ? -1 : 0;
                                    const b = -dirUsd;
                                    return mk(dirTone(b), b > 0 ? 'Compra' : b < 0 ? 'Venda' : 'Neutro');
                                })()}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${mk('neutral', String((typeof operationalTuning.weight.flowSentinel === 'number' && Number.isFinite(operationalTuning.weight.flowSentinel)) ? operationalTuning.weight.flowSentinel : 0.18))}</td>
                            </tr>
                        `);
                        rows.push(`
                            <tr>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${link('#ratesBuckets', 'Juros (US10Y/BR10Y)')}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">US ${mkPct(macro && macro.yields ? macro.yields.us10yPct : null)} • BR ${mkPct(macro && macro.yields ? macro.yields.br10yPct : null)}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${mk(dirTone(macroWdo.score), macroWdo.bias === 'buy' ? 'Compra' : macroWdo.bias === 'sell' ? 'Venda' : 'Neutro')}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${mk(dirTone(macroWin.score), macroWin.bias === 'buy' ? 'Compra' : macroWin.bias === 'sell' ? 'Venda' : 'Neutro')}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${mk('neutral', String(operationalTuning.weight.yields))}</td>
                            </tr>
                        `);
                        rows.push(`
                            <tr>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${link('#ratesBuckets', 'DI1 (B3)')}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${(() => {
                                    if (!diSignal || !diSignal.ok) return mk('neutral', '—');
                                    const fmtRate = v => (typeof v === 'number' && Number.isFinite(v) ? `${formatNumber(v, 2)}%` : '—');
                                    const fmtChg = v => (typeof v === 'number' && Number.isFinite(v) ? `${(v * 10) > 0 ? '+' : ''}${formatNumber(v * 10, 1)}bp` : '—');
                                    const a = diSignal.anchors || {};
                                    const s = a.short || null;
                                    const m = a.mid || null;
                                    const l = a.long || null;
                                    const pickTxt = (label, x) => {
                                        if (!x) return `${label} —`;
                                        const sym = x.symbol ? String(x.symbol) : '—';
                                        return `${label} ${sym} ${fmtRate(x.rate)} (${fmtChg(x.chgPct)})`;
                                    };
                                    const label = `${pickTxt('Curto', s)} • ${pickTxt('Médio', m)} • ${pickTxt('Longo', l)} • ${escapeHtml(diSignal.shape)}`;
                                    return escapeHtml(label);
                                })()}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${(() => {
                                    if (!diSignal || !diSignal.ok) return mk('neutral', 'Neutro');
                                    const b = diSignal.wdoBias;
                                    const tone = b === 'buy' ? 'positive' : b === 'sell' ? 'negative' : 'neutral';
                                    return mk(tone, b === 'buy' ? 'Compra' : b === 'sell' ? 'Venda' : 'Neutro');
                                })()}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${(() => {
                                    if (!diSignal || !diSignal.ok) return mk('neutral', 'Neutro');
                                    const b = diSignal.winBias;
                                    const tone = b === 'buy' ? 'positive' : b === 'sell' ? 'negative' : 'neutral';
                                    return mk(tone, b === 'buy' ? 'Compra' : b === 'sell' ? 'Venda' : 'Neutro');
                                })()}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${mk('neutral', 'informativo')}</td>
                            </tr>
                        `);
                        rows.push(`
                            <tr>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${link('#operational-now', 'CDS Brasil (fluxo x hedge)')}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${mkPct(cdsSignal && cdsSignal.drivers ? cdsSignal.drivers.cds : null)} • ${mk(cdsSignal ? cdsSignal.tone : 'neutral', cdsSignal ? cdsSignal.label : 'n/d')}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${(() => {
                                    if (!cdsSignal) return mk('neutral', 'Neutro');
                                    if (cdsSignal.mode === 'risk_off_classic') return mk('positive', 'Compra');
                                    if (cdsSignal.mode === 'relief_risk_on') return mk('negative', 'Venda');
                                    if (cdsSignal.mode === 'hedge_on_risk_on') return mk('neutral', 'Venda');
                                    return mk('neutral', 'Neutro');
                                })()}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${(() => {
                                    if (!cdsSignal) return mk('neutral', 'Neutro');
                                    if (cdsSignal.mode === 'risk_off_classic') return mk('negative', 'Venda');
                                    if (cdsSignal.mode === 'relief_risk_on') return mk('positive', 'Compra');
                                    if (cdsSignal.mode === 'hedge_on_risk_on') return mk('neutral', 'Compra');
                                    return mk('neutral', 'Neutro');
                                })()}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${mk('neutral', 'informativo')}</td>
                            </tr>
                        `);
                        return rows.join('');
                    })()}
                </tbody>
            </table>
        </div>
        <div style="margin-top:12px;border-top:1px solid rgba(255,255,255,.10);padding-top:12px;opacity:.92;line-height:1.45;">
            <div style="font-weight:900;letter-spacing:1px;opacity:.95;margin-bottom:6px;">Checklist (30s)</div>
            <div>1) Se convicção <b>BAIXA</b>: reduzir tamanho e operar só no nível (sem “chase”).</div>
            <div>2) Use <b>Gamma Flip</b> como pivô: acima favorece compra / abaixo favorece venda (com filtro do regime).</div>
            <div>3) Use <b>Walls</b> e <b>Range</b> como alvos/stop técnicos do dia.</div>
        </div>
    `;

    try {
        const toggle = document.getElementById('opTuningToggle');
        const panel = document.getElementById('opTuningPanel');
        const persist = () => {
            try {
                localStorage.setItem('mercado_operational_tuning_v1', JSON.stringify(operationalTuning));
            } catch {
            }
        };
        if (toggle && panel) {
            toggle.addEventListener('click', () => {
                panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
            });
        }
        const bindRange = (id, group, key) => {
            const el = document.getElementById(id);
            if (!el) return;
            el.addEventListener('input', () => {
                const v = Number(el.value);
                if (!Number.isFinite(v)) return;
                operationalTuning[group][key] = v;
                persist();
                renderOperationalBriefing();
                renderBtcOperationalBriefing();
                renderHk50OperationalBriefing();
            });
        };
        bindRange('op-th-dxy', 'threshold', 'dxy');
        bindRange('op-th-em', 'threshold', 'em');
        bindRange('op-th-export', 'threshold', 'export');
        bindRange('op-th-yields', 'threshold', 'yields');
        bindRange('op-th-brflow', 'threshold', 'brFlow');
        bindRange('op-th-zq', 'threshold', 'zqSlope');
        bindRange('op-w-flow', 'weight', 'flow');
        bindRange('op-w-dxy', 'weight', 'dxy');
        bindRange('op-w-export', 'weight', 'export');
        bindRange('op-w-em', 'weight', 'em');
        bindRange('op-w-yields', 'weight', 'yields');
        bindRange('op-w-brflow', 'weight', 'brFlow');
        bindRange('op-w-zq', 'weight', 'zq');

        const readWinProj = () => {
            try {
                const raw = localStorage.getItem('mercado_win_proj_v1');
                const obj = raw ? JSON.parse(raw) : null;
                return obj && typeof obj === 'object' ? obj : {};
            } catch {
                return {};
            }
        };
        const writeWinProj = (next) => {
            try {
                localStorage.setItem('mercado_win_proj_v1', JSON.stringify(next || {}));
            } catch {
            }
        };
        const bindWinProjNum = (id, field) => {
            const el = document.getElementById(id);
            if (!el) return;
            el.addEventListener('change', () => {
                const v = Number(el.value);
                const st = readWinProj();
                if (!Number.isFinite(v)) {
                    delete st[field];
                    writeWinProj(st);
                    renderOperationalBriefing();
                    return;
                }
                st[field] = v;
                writeWinProj(st);
                renderOperationalBriefing();
            });
        };
        bindWinProjNum('winproj-ref-close', 'refClose');
        bindWinProjNum('winproj-ref-adjust', 'refAdjust');
        bindWinProjNum('winproj-beta-iron', 'betaIron');
        bindWinProjNum('winproj-beta-copper', 'betaCopper');
        bindWinProjNum('winproj-beta-oil', 'betaOil');

        const bindWinProjOverride = (id, key) => {
            const el = document.getElementById(id);
            if (!el) return;
            el.addEventListener('change', () => {
                const v = Number(el.value);
                const st = readWinProj();
                const next = st.overrides && typeof st.overrides === 'object' ? st.overrides : {};
                if (!Number.isFinite(v)) {
                    delete next[key];
                } else {
                    next[key] = v;
                }
                st.overrides = next;
                writeWinProj(st);
                renderOperationalBriefing();
            });
        };
        bindWinProjOverride('winproj-ovr-iron', 'ironPct');
        bindWinProjOverride('winproj-ovr-copper', 'copperPct');
        bindWinProjOverride('winproj-ovr-oil', 'oilPct');

        const clearOvr = document.getElementById('winproj-clear-overrides');
        if (clearOvr) {
            clearOvr.addEventListener('click', () => {
                const st = readWinProj();
                st.overrides = {};
                writeWinProj(st);
                renderOperationalBriefing();
            });
        }

        const usePrevClose = document.getElementById('winproj-use-prevclose');
        if (usePrevClose) {
            usePrevClose.addEventListener('click', () => {
                const v = Number(usePrevClose.getAttribute('data-value'));
                if (!Number.isFinite(v)) return;
                const st = readWinProj();
                st.refClose = v;
                writeWinProj(st);
                renderOperationalBriefing();
            });
        }
        const useNow = document.getElementById('winproj-use-now');
        if (useNow) {
            useNow.addEventListener('click', () => {
                const v = Number(useNow.getAttribute('data-value'));
                if (!Number.isFinite(v)) return;
                const st = readWinProj();
                st.refAdjust = v;
                writeWinProj(st);
                renderOperationalBriefing();
            });
        }

        const copyText = (text) => {
            const s = String(text || '');
            const fallback = () => {
                try {
                    const ta = document.createElement('textarea');
                    ta.value = s;
                    ta.setAttribute('readonly', 'true');
                    ta.style.position = 'fixed';
                    ta.style.left = '-9999px';
                    document.body.appendChild(ta);
                    ta.select();
                    document.execCommand('copy');
                    document.body.removeChild(ta);
                    return true;
                } catch {
                    return false;
                }
            };
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(s).catch(() => fallback());
                return;
            }
            fallback();
        };
        document.querySelectorAll('[data-winproj-copy]').forEach(btn => {
            btn.addEventListener('click', () => {
                const tr = btn.closest('tr');
                if (!tr) return;
                const tds = Array.from(tr.querySelectorAll('td'));
                const label = tds[0] ? tds[0].textContent : '';
                const sym = tds[1] ? tds[1].textContent : '';
                const dp = tds[2] ? tds[2].textContent : '';
                const projClose = tds[4] ? tds[4].textContent : '';
                const projAdj = tds[5] ? tds[5].textContent : '';
                copyText(`WIN proj • ${label} • ${sym} • Δ% ${dp} • Fech ${projClose} • Ajuste ${projAdj}`.replace(/\s+/g, ' ').trim());
            });
        });
    } catch {
    }

    try {
        const key = 'mercado_operational_log_v1';
        const nowMs = Date.now();
        const next = {
            tMs: nowMs,
            regime: regime ? regime.label : null,
            wdo: { bias: resolved.wdo.bias || (macroWdo.bias || 'neutral'), score: finalScoreFor('WDO') },
            win: { bias: resolved.win.bias || (macroWin.bias || 'neutral'), score: finalScoreFor('WIN') },
            inputs: {
                news: { wdo: newsTilt.wdo.score, win: newsTilt.win.score },
                dxy: macro ? macro.dxyPct : null,
                export: macro ? macro.exportScore : null,
                em: macro && macro.em ? macro.em.pct : null,
                us10y: macro && macro.yields ? macro.yields.us10yPct : null,
                br10y: macro && macro.yields ? macro.yields.br10yPct : null,
                zqSlope: macro && macro.zq ? macro.zq.slopePct : null,
            },
        };
        const prev = (() => {
            try {
                const raw = localStorage.getItem(key);
                const arr = raw ? JSON.parse(raw) : [];
                return Array.isArray(arr) ? arr : [];
            } catch {
                return [];
            }
        })();
        prev.push(next);
        const trimmed = prev.slice(-64);
        localStorage.setItem(key, JSON.stringify(trimmed));
    } catch {
    }
}

function findAssetSymbol(data, matcher) {
    const assets = data && data.assets ? data.assets : [];
    for (const a of assets) {
        const symRaw = String(a && a.symbol ? a.symbol : '');
        const sym = symRaw.trim();
        const symCore = sym.split(' - ')[0] ? sym.split(' - ')[0].trim() : sym;
        const name = String(a && a.name ? a.name : '');
        if (matcher.test(sym) || matcher.test(symCore) || matcher.test(name)) return symRaw;
    }
    const series = data && data.series && typeof data.series === 'object' ? data.series : null;
    if (series) {
        for (const symRaw of Object.keys(series)) {
            const sym = String(symRaw || '').trim();
            const symCore = sym.split(' - ')[0] ? sym.split(' - ')[0].trim() : sym;
            if (matcher.test(sym) || matcher.test(symCore)) return symRaw;
        }
    }
    return null;
}

function findAssetSymbolAny(data, matchers) {
    const list = Array.isArray(matchers) ? matchers : [];
    for (const m of list) {
        if (!(m instanceof RegExp)) continue;
        const sym = findAssetSymbol(data, m);
        if (sym) return sym;
    }
    return null;
}

function findAssetSymbolBest(data, matchers, config) {
    const assets = data && data.assets ? data.assets : [];
    const list = Array.isArray(matchers) ? matchers : [];
    const cfg = config && typeof config === 'object' ? config : {};
    const expectedCategories = Array.isArray(cfg.expectedCategories) ? cfg.expectedCategories.map(x => String(x)) : [];
    const expectedTags = Array.isArray(cfg.expectedTags) ? cfg.expectedTags.map(x => String(x)) : [];
    const expectedExchanges = Array.isArray(cfg.expectedExchanges) ? cfg.expectedExchanges.map(x => String(x)) : [];
    const preferSymbols = Array.isArray(cfg.preferSymbols) ? cfg.preferSymbols.filter(x => x instanceof RegExp) : [];
    const avoidSymbols = Array.isArray(cfg.avoidSymbols) ? cfg.avoidSymbols.filter(x => x instanceof RegExp) : [];

    const scoreAsset = a => {
        const sym = String(a && a.symbol ? a.symbol : '');
        const cat = String(a && a.category ? a.category : '');
        const ex = String(a && a.exchange ? a.exchange : '');
        const tags = Array.isArray(a && a.tags ? a.tags : []) ? a.tags.map(x => String(x)) : [];
        let s = 1;
        if (expectedCategories.length && expectedCategories.includes(cat)) s += 2;
        if (expectedExchanges.length && expectedExchanges.includes(ex)) s += 1;
        if (expectedTags.length) {
            for (const t of expectedTags) if (tags.includes(t)) s += 0.6;
        }
        for (const re of preferSymbols) if (re.test(sym)) s += 3;
        for (const re of avoidSymbols) if (re.test(sym)) s -= 3;
        return s;
    };

    let best = null;
    for (const m of list) {
        if (!(m instanceof RegExp)) continue;
        for (const a of assets) {
            const symRaw = String(a && a.symbol ? a.symbol : '');
            const sym = symRaw.trim();
            const symCore = sym.split(' - ')[0] ? sym.split(' - ')[0].trim() : sym;
            const name = String(a && a.name ? a.name : '');
            if (!sym) continue;
            if (!m.test(sym) && !m.test(symCore) && !m.test(name)) continue;
            const sc = scoreAsset(a);
            if (!best || sc > best.score) best = { sym: symRaw, score: sc };
        }
    }
    if (!best) {
        const series = data && data.series && typeof data.series === 'object' ? data.series : null;
        if (series) {
            const scoreSymbol = sym => {
                let s = 1;
                for (const re of preferSymbols) if (re.test(sym)) s += 3;
                for (const re of avoidSymbols) if (re.test(sym)) s -= 3;
                return s;
            };
            for (const m of list) {
                if (!(m instanceof RegExp)) continue;
                for (const symRaw of Object.keys(series)) {
                    const sym = String(symRaw || '').trim();
                    const symCore = sym.split(' - ')[0] ? sym.split(' - ')[0].trim() : sym;
                    if (!sym) continue;
                    if (!m.test(sym) && !m.test(symCore)) continue;
                    const sc = scoreSymbol(sym);
                    if (!best || sc > best.score) best = { sym: symRaw, score: sc };
                }
            }
        }
    }
    return best ? best.sym : null;
}

function assetAliasMatchers(key) {
    const k = String(key || '').toUpperCase().trim();
    if (!k) return [];

    if (k === 'US2Y') return [/^US2YT=RR$/i, /^TUc\d=\$?$/i, /\bUnited States 2-Year\b/i, /\bEUA\b\s+a\s+2\s+anos\b/i, /^US2Y\b/i];
    if (k === 'US10Y')
        return [
            /^US10YT=RR$/i,
            /^US10YT=X$/i,
            /^\.TNX$/i,
            /^\^TNX$/i,
            /^TNc\d=\$?$/i,
            /\bUnited States\b.*\b10\b.*\bYear\b/i,
            /\b10\s*Year\s*Treasury\s*Yield\b/i,
            /\bEUA\b\s+a\s+10\s+anos\b/i,
            /^US10Y\b/i,
        ];
    if (k === 'US30Y') return [/^US30YT=RR$/i, /^USc1=$/i, /\bUnited States 30-Year\b/i, /\bEUA\b\s+a\s+30\s+anos\b/i, /^US30Y\b/i];
    if (k === 'SPREAD_HK10Y')
        return [
            /^(US10HK10|HK10US10|CN10HK10|HK10CN10|CH10HK10|HK10CH10)=RR$/i,
            /\bSpread\b.*\bHong\s*Kong\b.*\b10\b.*\b(EUA|US|China|CHI)\b.*\b10\b/i,
            /\bSpread\b.*\b(EUA|US|China|CHI)\b.*\b10\b.*\bHong\s*Kong\b.*\b10\b/i,
            /\bSpread\b.*\bEUA\b.*\b10A\b.*\b(HK|HKG|Hong\s*Kong)\b.*\b10A\b/i,
            /\bSpread\b.*\b(HK|HKG|Hong\s*Kong)\b.*\b10A\b.*\bEUA\b.*\b10A\b/i,
        ];

    if (k === 'DXY')
        return [
            /^USDX$/i,
            /^\.DXY$/i,
            /\bDXY\b/i,
            /US Dollar Index/i,
            /Dollar Index/i,
            /\bÃndice\s*DÃ³lar\b/i,
            /\bIndice\s*Dolar\b/i,
        ];
    if (k === 'VIX') return [/^\.?VIX(9D)?$/i, /\bVIX9D\b/i, /\bVIX\b/i, /Volatilidade/i];
    if (k === 'VIX9D') return [/^\.VIX9D$/i, /\bVIX9D\b/i, /\b9-Day Volatility\b/i];
    if (k === 'VIX30') return [/^VIX$/i, /^\.VIX$/i, /\bS&P\s*500\s*VIX\b/i];
    if (k === 'VVIX') return [/^\.VVIX$/i, /\bVVIX\b/i, /\bVix Volatility\b/i];
    if (k === 'VXN') return [/^\.VXN$/i, /\bNASDAQ\s*100 Volatility\b/i];
    if (k === 'VXEEM') return [/^\.VXEEM$/i, /\bEmerging Markets\b.*\bVol/i];
    if (k === 'VXEWZ') return [/^\.VXEWZ$/i, /\bBrazil\b.*\bVol/i];
    if (k === 'VXBR') return [/^\.VXBR$/i, /\bIbovespa VIX\b/i, /\bVXBR\b/i];

    if (k === 'BRENT') return [/^BNO$/i, /^LCO\b/i, /^BRN$|^BRN=F$|^BZ=F$/i, /\bBrent\b/i];
    if (k === 'WTI') return [/^USO$/i, /^CL$|^CL=F$|^WTI$/i, /\bWTI\b/i];
    if (k === 'OIL') return [/^BNO$/i, /^LCO\b/i, /^USO$/i, /^CL$|^CL=F$|^BRN$|^BRN=F$|^BZ=F$/i, /\bBrent\b/i, /\bWTI\b/i];

    if (k === 'IRON') return [/^DCE_I0$/i, /^TIOc1$/i, /^SM58Fc1$/i, /^9047$/i, /^3047$/i, /\bmin[eÃ©]rio\b/i, /\biron ore\b/i];
    if (k === 'SOY') return [/^ZS$/i, /\bsoja\b/i, /\bsoy\b/i];
    if (k === 'COPPER') return [/^HG\b/i, /\bcopper\b/i, /\bcobre\b/i];
    if (k === 'BCI') return [/^BCI$/i, /\babrdn Bloomberg All Commodity Strategy\b/i];
    if (k === 'GOLD') return [/^GC\b/i, /^XAU(USD)?$/i, /\bgold\b/i, /\bouro\b/i];
    if (k === 'BTC') return [/^BTC\/USD$/i, /^BTCUSD$/i, /\bBTC\b/i, /\bbitcoin\b/i, /\bXBT\b/i];
    if (k === 'ETH') return [/^ETH\/USD\b/i, /\bETH\/USD\b/i, /\bETH\b/i, /\bEthereum\b/i];
    if (k === 'SOL') return [/^SOL\/USD$/i, /\bSOL\b/i, /\bSolana\b/i];
    if (k === 'DOGE') return [/^DOGE\/USD$/i, /\bDOGE\b/i, /\bDogecoin\b/i];

    if (k === 'SPX')
        return [
            /^SPX$/i,
            /^\.SPX$/i,
            /^\^GSPC$/i,
            /\bSPX\b/i,
            /\bS&P\s*500\b(?![\s\S]*\bVIX\b)(?![\s\S]*Volatil)/i,
            /\bUS\s*500\b/i,
            /^SPY(\b|$)/i,
            /^IVV(\b|$)/i,
            /^VOO(\b|$)/i,
            /^ES\b/i,
            /^ES[HMUZ]\d{2}$/i,
            /\bS&P\s*500\b.*\bFuturos\b/i,
        ];
    if (k === 'NDX')
        return [
            /^NDX$/i,
            /^\.NDX$/i,
            /\bNASDAQ\s*100\b(?![\s\S]*Volatil)/i,
            /\bNasdaq\s*100\b(?![\s\S]*Volatil)/i,
            /\bNDX\b/i,
            /^QQQ(\b|$)/i,
            /\bQQQ\b/i,
            /^NQ\b/i,
            /^NQ[HMUZ]\d{2}$/i,
        ];
    if (k === 'CHINA')
        return [
            /^FXI$/i,
            /^MCHI(\.\w+)?$/i,
            /^2838\.HK$/i,
            /^\.(CSI300)\b/i,
            /China A50/i,
            /Shanghai Shenzhen CSI 300/i,
            /Hang Seng FTSE China 50/i,
            /\bMSCI\b.*\bChina\b/i,
        ];
    if (k === 'CN50') return [/^CHINA50$/i, /\bChina\s*A50\b/i, /\bCN50\b/i];

    if (k === 'FXI') return [/^FXI$/i];
    if (k === 'MCHI') return [/^MCHI(\.\w+)?$/i, /\biShares\b.*\bMSCI\b.*\bChina\b/i, /\bMSCI\b.*\bChina\b/i];
    if (k === 'CSI300') return [/^\.(CSI300)\b/i];

    if (k === 'JP10Y') return [/^JP10YT=RR$/i, /\bJapan\b.*\b10\b.*\bYear\b.*\bYield\b/i, /\bJGB\b.*\b10\b/i];
    if (k === 'JP1Y') return [/^JP1YT=(RR|XX)$/i, /\bJapan\b.*\b1\b.*\bYear\b.*\bYield\b/i, /\bJap[aÃ£]o\b.*\b1\b.*\bano\b/i];
    if (k === 'JP5Y') return [/^JP5YT=(RR|XX)$/i, /\bJapan\b.*\b5\b.*\bYear\b.*\bYield\b/i, /\bJap[aÃ£]o\b.*\b5\b.*\banos\b/i];
    if (k === 'CN10Y') return [/^CN10YT=RR$/i, /\bChina\b.*\b10\b.*\bYear\b.*\bYield\b/i, /\bChina\b.*\b10\b.*\banos\b/i];
    if (k === 'HK10Y') return [/^HK10YT=RR$/i, /\bHong\s*Kong\b.*\b10\b.*\bYear\b.*\bYield\b/i, /\bHong\s*Kong\b.*\b10\b.*\banos\b/i];
    if (k === 'HK1M') return [/^HK1MT=RR$/i, /\bHong\s*Kong\b.*\b1\b.*\bMonth\b/i, /\bHong\s*Kong\b.*\b1\b.*\bm[eÃª]s\b/i];
    if (k === 'HK3M') return [/^HK3MT=RR$/i, /\bHong\s*Kong\b.*\b3\b.*\bMonth\b/i, /\bHong\s*Kong\b.*\b3\b.*\bmeses\b/i];
    if (k === 'VHSI') return [/^\.VHSI$/i, /^VHSI(c\d+)?$/i, /\bHSI Volatility\b/i];
    if (k === 'HSTECH') return [/^HSTECH$/i, /^\.HSTECH$/i, /\bHang Seng TECH\b/i];
    if (k === 'HSI_FIN') return [/^\.(HSNF|HSHFI)\b/i, /\bHSI-?Finance\b/i, /\bHang\s*Seng\b.*\bHFI\b/i, /\bHang\s*Seng\b.*\bFinance\b/i];
    if (k === 'EWH') return [/^EWH$/i, /\biShares MSCI Hong Kong\b/i];
    if (k === 'HK50') return [/^HSIQ/i, /^HK50$/i, /^\.HSI/i, /^HSI$/i, /\bHang\s*Seng\b/i, /\bHK\s*50\b/i];

    if (k === 'USD_BRL') return [/^USD\/BRL\b/i];
    if (k === 'USD_CNH') return [/^USD\/CNH\b/i, /\bUSD\/CNH\b/i, /\bYuan\b.*\boffshore\b/i, /\bchin[eÃª]s\b.*\boffshore\b/i];
    if (k === 'USD_CNY') return [/^USD\/CNY\b/i, /\bUSD\/CNY\b/i, /\bYuan\b/i, /\bchin[eÃª]s\b/i];
    if (k === 'USD_HKD') return [/^USD\/HKD\b/i, /\bUSD\/HKD\b/i, /\bHong\s*Kong\s*Dollar\b/i];
    if (k === 'WDO') return [/(^WDO\b|WDOc\d\b|\bmini\s*d[oÃ³]lar\b)/i];
    if (k === 'WIN') return [/(^WIN\b|WINc\d\b|\bmini\s*(Ã­ndice|indice)\b|\bmini\s*ibovespa\b)/i];
    if (k === 'IBOV') return [/(^\.BVSP$|\bIBOV\b|\bIbovespa\b)/i, /^BOVA11(\b|$)/i];
    if (k === 'IBRX') return [/^\.IBRX$/i, /\bIBRX\b/i, /\bIBrX\b/i, /\bÃndice\s*Brasil\s*100\b/i, /\bIndice\s*Brasil\s*100\b/i];
    if (k === 'BR20') return [/^\.BR20(T)?$/i, /\bBR\s*20\b/i, /\bBR-?20\b/i, /\bBrasil\s*20\b/i];
    if (k === 'IFNC') return [/^IFNC(\.SA)?$/i, /\bÃndice\s*Financeiro\b/i, /\bIndice\s*Financeiro\b/i, /\bFinanceiro\b/i];
    if (k === 'IMAT') return [/^IMAT(\.SA)?$/i, /\bÃndice\s*Materiais\b/i, /\bIndice\s*Materiais\b/i, /\bMateriais\s*(BÃ¡sicos|Basicos)\b/i];
    if (k === 'EWZ') return [/^EWZ$/i, /^EWZS(\.\w+)?$/i, /\bBrazil\b.*\bSmall\b.*\bCap\b.*\bETF\b/i, /\bBrazil\b.*\bETF\b/i];
    if (k === 'HYG') return [/^HYG(\.\w+)?$/i, /\bhigh\s*yield\b/i, /\biBoxx\b/i, /\balto\s*rendimento\b/i];
    if (k === 'TLT') return [/^TLT(\.\w+)?$/i, /\b20\+\s*Year\b.*\bTreasury\b/i, /\bTreasury\b.*\bBond\b/i];
    if (k === 'EEM') return [/^EEM$/i, /\bMSCI\b.*\bEmerging\b.*\bMarkets\b/i, /\bmercados\s*emergentes\b/i];
    if (k === 'VWO') return [/^VWO$/i, /\bFTSE\b.*\bEmerging\b.*\bMarkets\b/i];
    if (k === 'CDS_BR5Y') return [/^BRGV5YUSAC=R$/i, /^BRGV/i, /\bCDS\b.*\bBR\b/i];
    if (k === 'CDS_CN5Y') return [/^CNGV5YUSAC=R$/i, /^CNGV/i, /\bCDS\b.*\bChina\b.*\b5\b/i, /\bChina\b.*\bCDS\b.*\b5\b/i];
    if (k === 'BR10Y') return [/^BR10YT=RR$/i, /\bBR\b.*\b10\b.*\bYear\b/i, /\bBrasil\b.*\b10\b.*\banos\b/i];

    if (k === 'TIPS_ETF') return [/^TIP$/i, /\biShares TIPS\b/i];

    return [];
}

function aliasResolutionConfig(key) {
    const k = String(key || '').toUpperCase().trim();
    if (!k) return {};
    if (k === 'USD_BRL') return { expectedCategories: ['fx_emerging', 'fx'], expectedTags: ['risk_off'] };
    if (k === 'USD_CNH' || k === 'USD_CNY' || k === 'USD_HKD') return { expectedCategories: ['fx_emerging', 'fx_g10', 'fx'], expectedExchanges: ['FX'] };
    if (k === 'DXY') return { expectedCategories: ['fx_major', 'fx'], expectedTags: ['risk_off'] };
    if (k === 'WDO') return { expectedCategories: ['fx_emerging'], preferSymbols: [/^WDOc1$/i] };
    if (k === 'WIN') return { expectedCategories: ['equities'], preferSymbols: [/^WINc1$/i] };
    if (k === 'IBOV') return { expectedCategories: ['equities'], preferSymbols: [/^\.BVSP$/i] };
    if (k === 'IBRX') return { expectedCategories: ['equities'], preferSymbols: [/^\.IBRX$/i] };
    if (k === 'BR20') return { expectedCategories: ['equities'], preferSymbols: [/^\.BR20$/i, /^\.BR20T$/i] };
    if (k === 'IFNC') return { expectedCategories: ['equities'], preferSymbols: [/^IFNC(\.SA)?$/i] };
    if (k === 'IMAT') return { expectedCategories: ['equities'], preferSymbols: [/^IMAT(\.SA)?$/i] };
    if (k === 'VIX9D' || k === 'VIX30' || k === 'VIX' || k === 'VVIX' || k === 'VXN' || k === 'VXEEM' || k === 'VXEWZ' || k === 'VXBR')
        return { expectedCategories: ['volatility'], expectedTags: ['risk_off'] };
    if (k === 'VHSI') return { expectedCategories: ['volatility'], expectedTags: ['risk_off'], expectedExchanges: ['HK', 'HKEx', 'HKEX'] };
    if (k === 'HK50')
        return { expectedCategories: ['equities'], expectedTags: ['risk_on'], expectedExchanges: ['HK', 'HKEx', 'HKEX'], preferSymbols: [/^HSIQ/i, /^HK50$/i, /^\.HSI$/i, /^HSI$/i] };
    if (k === 'HSI_FIN') return { expectedCategories: ['equities'], expectedTags: ['risk_on'], expectedExchanges: ['HK', 'HKEx', 'HKEX'] };
    if (k === 'CN50') return { expectedCategories: ['emerging', 'equities'], expectedTags: ['risk_on'] };
    if (k === 'MCHI') return { expectedCategories: ['emerging', 'equities'], expectedTags: ['risk_on'] };
    if (k === 'SPX')
        return {
            expectedCategories: ['equities'],
            expectedTags: ['risk_on'],
            preferSymbols: [/^ES[HMUZ]\d{2}$/i, /^ES[HMUZ]\d/i, /^\.SPX$/i, /^\^GSPC$/i, /^SPY(\b|$)/i, /^IVV(\b|$)/i, /^VOO(\b|$)/i],
            avoidSymbols: [/^VIX(\b|$)/i, /^\.VIX/i, /^\.VIX9D$/i],
        };
    if (k === 'NDX')
        return {
            expectedCategories: ['equities'],
            expectedTags: ['risk_on'],
            preferSymbols: [/^NQ[HMUZ]\d{2}$/i, /^NQ[HMUZ]\d/i, /^\.NDX$/i, /^QQQ(\.\w+)?$/i],
            avoidSymbols: [/^\.VXN$/i],
        };
    if (k === 'EWZ') return { expectedCategories: ['equities'], expectedTags: ['risk_on'] };
    if (k === 'HYG') return { expectedCategories: ['credit'], expectedTags: ['risk_on'] };
    if (k === 'TLT') return { expectedCategories: ['rates'], expectedTags: ['risk_off'] };
    if (k === 'EEM' || k === 'VWO') return { expectedCategories: ['emerging'], expectedTags: ['risk_on'] };
    if (k === 'BRENT' || k === 'WTI' || k === 'OIL') return { expectedCategories: ['energy'], expectedTags: ['oil'] };
    if (k === 'GOLD') return { expectedCategories: ['metals'], expectedTags: ['risk_off'] };
    if (k === 'COPPER' || k === 'IRON') return { expectedCategories: ['metals'], expectedTags: ['risk_on'] };
    if (k === 'BTC' || k === 'ETH' || k === 'SOL' || k === 'DOGE') return { expectedCategories: ['crypto'], expectedTags: ['risk_on'] };
    if (k === 'US2Y' || k === 'US30Y') return { expectedCategories: ['rates'], expectedTags: ['risk_off'] };
    if (k === 'US10Y')
        return {
            expectedCategories: ['rates'],
            expectedTags: ['risk_off'],
            preferSymbols: [/^US10YT=X$/i, /^US10YT=RR$/i, /^\.TNX$/i, /^\^TNX$/i, /^TNc\d=\$?$/i],
        };
    if (k === 'CN10Y') return { expectedCategories: ['rates'], expectedTags: ['rates'] };
    if (k === 'SPREAD_HK10Y') return { expectedCategories: ['rates'], expectedTags: ['rates'] };
    if (k === 'HK1M' || k === 'HK3M') return { expectedCategories: ['rates'], expectedTags: ['rates'], expectedExchanges: ['HK', 'HKEx', 'HKEX'] };
    if (k === 'CDS_BR5Y') return { expectedCategories: ['credit'], expectedTags: ['risk_off'] };
    if (k === 'CDS_CN5Y') return { expectedCategories: ['credit'], expectedTags: ['risk_off'] };
    if (k === 'BR10Y') return { expectedCategories: ['rates'], expectedTags: ['risk_off'] };
    return {};
}

function findAliasSymbol(data, key) {
    return findAssetSymbolAny(data, assetAliasMatchers(key));
}

function findAliasSymbolBest(data, key) {
    return findAssetSymbolBest(data, assetAliasMatchers(key), aliasResolutionConfig(key));
}

function getChangePct(data, symbol) {
    if (!symbol) return null;
    const last = getLastPoint(data, symbol);
    return pointPct(last);
}

function avg(numbers) {
    const vals = (numbers || []).filter(v => typeof v === 'number' && Number.isFinite(v));
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
}

function buildDcDeps() {
    return { findAliasSymbolBest, findAliasSymbol, findAssetSymbol, getLastPoint };
}

function buildCatDeps(dcDeps) {
    return { findAliasSymbolBest, findAliasSymbol, findAssetSymbol, dcDeps };
}

function fallbackCard(title, message) {
    const mu = (typeof window !== 'undefined' && window.MercadoUtils) ? window.MercadoUtils : null;
    const fixedTitle = fixLegacyText(title || 'Indisponível');
    const fixedMessage = fixLegacyText(message || 'Módulo indisponível.');
    if (mu && typeof mu.fallbackCardHtml === 'function') return mu.fallbackCardHtml({ title: fixedTitle, message: fixedMessage });
    const t = escapeHtml(String(fixedTitle));
    const m = escapeHtml(String(fixedMessage));
    return `
        <div style="border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:12px;background:rgba(0,0,0,.18);">
            <div style="font-weight:900;letter-spacing:1px;margin-bottom:6px;">${t}</div>
            <div style="opacity:.86;font-size:12px;line-height:1.35;">${m}</div>
        </div>
    `;
}

function safeEmptyLineChart(chartId) {
    try {
        buildCommonBlockDeps().renderLineChart(chartId, [], '\u2014');
    } catch {
    }
}

function buildCommonBlockDeps() {
    return {
        escapeHtml,
        formatNumber,
        formatPercent,
        formatDateTime,
        formatDateTimeLoose,
        pillHtml,
        toneBadgeHtml,
        toneBadgeHtmlFromTone,
        setMetric,
        setHtml,
        findAssetSymbol,
        findAliasSymbolBest,
        findAliasSymbol,
        createTable,
        getLastPoint,
        getMostRecentPointWithPrice,
        getChangePct,
        pointPct,
        symbolKey,
        renderAllAssetsTable,
        buildDcDeps,
        buildCatDeps,
        DecisionCore: (typeof window !== 'undefined' && window.DecisionCore) ? window.DecisionCore : null,
        InstrumentsCatalog: (typeof window !== 'undefined' && window.InstrumentsCatalog) ? window.InstrumentsCatalog : null,
        loadFavorites,
        renderLineChart: (id, points, symbol) => {
            if (window.MercadoCharts && typeof window.MercadoCharts.renderLineChart === 'function') {
                window.MercadoCharts.renderLineChart(id, points, symbol);
            }
        },
    };
}

function buildOperationalPulseBriefingDeps(extra) {
    const e = extra && typeof extra === 'object' ? extra : {};
    return {
        ...buildCommonBlockDeps(),
        getData,
        operationalInputs,
        ...e,
    };
}

function renderFlowSentinel(data) {
    const mod = (typeof window !== 'undefined' && window.MercadoBlocks && window.MercadoBlocks.flowSentinel) ? window.MercadoBlocks.flowSentinel : null;
    if (mod && typeof mod.render === 'function') {
        try {
            mod.render({
                data,
                deps: {
                    ...buildCommonBlockDeps(),
                    avg,
                },
            });
            return;
        } catch {
            setHtml('fs-components', fallbackCard('Sentinela de Fluxo', 'Falha ao renderizar o mÃ³dulo.'));
            return;
        }
    }
    setHtml('fs-components', fallbackCard('Sentinela de Fluxo', 'MÃ³dulo indisponÃ­vel (nÃ£o carregado).'));
}

function renderCarryTradeMonitor(data) {
    const dc = (typeof window !== 'undefined' && window.DecisionCore) ? window.DecisionCore : null;
    const catalog = (typeof window !== 'undefined' && window.InstrumentsCatalog) ? window.InstrumentsCatalog : null;
    const dcDeps = { findAliasSymbolBest, findAliasSymbol, findAssetSymbol, getLastPoint };
    const catDeps = { findAliasSymbolBest, findAliasSymbol, findAssetSymbol, dcDeps };
    const rcKey = (key, fallbackMatcher) => {
        const sym = catalog && typeof catalog.resolveRatesCreditByKey === 'function'
            ? catalog.resolveRatesCreditByKey(catDeps, data, key)
            : null;
        if (sym) return sym;
        if (fallbackMatcher instanceof RegExp) return findAssetSymbol(data, fallbackMatcher);
        return null;
    };

    const aliasSym = (k) => findAliasSymbolBest(data, k) || findAliasSymbol(data, k);

    const assets = data && Array.isArray(data.assets) ? data.assets : [];
    const mostRecentMs = (symbol) => {
        if (!symbol) return -Infinity;
        const last = (typeof getMostRecentPointWithPrice === 'function' ? getMostRecentPointWithPrice(data, symbol) : null) || getLastPoint(data, symbol);
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

    const resolveJapan10yYield = () => {
        return rcKey('JP_10Y', /^JP10YT=RR$/i)
            || aliasSym('JP10Y')
            || pickBestByMatchers([/^JP10YT=RR$/i, /\bJapan\b(?!.*\b(CDS|Future|Futures)\b).*?\b10\b.*?\bYear\b.*?\bYield\b/i, /\bJapan\b(?!.*\b(CDS|Future|Futures)\b).*?\b10\b.*?\bYear\b/i])
            || null;
    };

    const symbols = {
        audusd: pickBestByMatchers([/^AUD\/USD\b/i]) || findAssetSymbol(data, /^AUD\/USD\b/i),
        nzdusd: pickBestByMatchers([/^NZD\/USD\b/i]) || findAssetSymbol(data, /^NZD\/USD\b/i),
        eurusd: pickBestByMatchers([/^EUR\/USD\b/i]) || findAssetSymbol(data, /^EUR\/USD\b/i),
        gbpusd: pickBestByMatchers([/^GBP\/USD\b/i]) || findAssetSymbol(data, /^GBP\/USD\b/i),
        usdcad: pickBestByMatchers([/^USD\/CAD\b/i, /\bUSDCAD\b/i]) || findAssetSymbol(data, /^USD\/CAD\b/i),
        usdchf: pickBestByMatchers([/^USD\/CHF\b/i, /\bUSDCHF\b/i]) || findAssetSymbol(data, /^USD\/CHF\b/i),
        usdjpy: pickBestByMatchers([/^USD\/JPY\b/i]) || findAssetSymbol(data, /^USD\/JPY\b/i),
        usdbrl: aliasSym('USD_BRL') || pickBestByMatchers([/^USD\/BRL\b/i]) || findAssetSymbol(data, /^USD\/BRL\b/i),
        usdcnh: aliasSym('USD_CNH') || pickBestByMatchers([/^USD\/CNH\b/i]) || findAssetSymbol(data, /^USD\/CNH\b/i),
        dxy: aliasSym('DXY') || pickBestByMatchers([/(^\.DXY$|\bDXY\b|US Dollar Index|\bUSDX\b|Dollar Index|Índice\s*Dólar|Indice\s*Dolar)/i]) || findAssetSymbol(data, /(^\.DXY$|\bDXY\b|US Dollar Index|\bUSDX\b|Dollar Index|Índice\s*Dólar|Indice\s*Dolar)/i),
        vix: findAliasSymbolBest(data, 'VIX9D') || findAliasSymbolBest(data, 'VIX30') || aliasSym('VIX') || pickBestByMatchers([/^\.?VIX(9D)?$/i, /^VIX$/i]) || findAssetSymbol(data, /^\.?VIX(9D)?$/i),
        hyg: rcKey('ETF_HYG', /^HYG(\.\w+)?$/i) || aliasSym('HYG') || pickBestByMatchers([/^HYG(\.\w+)?$/i]),
        br10y: rcKey('BR_10Y', /^BR10YT=RR$/i),
        us10y: rcKey('US_10Y', /(^US10YT=RR$|^US10YT=X$|^\.TNX$|\^TNX)/i) || aliasSym('US10Y'),
        us10br10: rcKey('SPREAD_US10_BR10', /^US10BR10=RR$/i),
        us10jp10: pickBestByMatchers([/^US10JP10=RR$/i, /\bUS10\b.*\bJP10\b.*\bspread\b/i]) || findAssetSymbol(data, /^US10JP10=RR$/i),
        jp10y: resolveJapan10yYield(),
        jp1y: rcKey('JP_1Y', /^JP1YT=(RR|XX)$/i) || aliasSym('JP1Y') || findAssetSymbol(data, /^JP1YT=(RR|XX)$/i),
        jp5y: rcKey('JP_5Y', /^JP5YT=(RR|XX)$/i) || aliasSym('JP5Y') || findAssetSymbol(data, /^JP5YT=(RR|XX)$/i),
        hk10y: rcKey('HK_10Y', /^HK10YT=RR$/i) || aliasSym('HK10Y'),
        hsi: aliasSym('HSI') || pickBestByMatchers([/\bHang\s*Seng\b/i, /^HSI$/i]) || findAssetSymbol(data, /\bHang\s*Seng\b/i),
        hstech: aliasSym('HSTECH') || pickBestByMatchers([/^HSTECH$/i, /\bHang\s*Seng\b.*\bTech\b/i]) || findAssetSymbol(data, /^HSTECH$/i),
        ewh: aliasSym('EWH') || pickBestByMatchers([/^EWH(\.\w+)?$/i]) || findAssetSymbol(data, /^EWH(\.\w+)?$/i),
        audjpy: pickBestByMatchers([/^AUD\/JPY\b/i]) || findAssetSymbol(data, /^AUD\/JPY\b/i),
        nzdjpy: pickBestByMatchers([/^NZD\/JPY\b/i]) || findAssetSymbol(data, /^NZD\/JPY\b/i),
        mxnjpy: pickBestByMatchers([/^MXN\/JPY\b/i]) || findAssetSymbol(data, /^MXN\/JPY\b/i),
        zarjpy: pickBestByMatchers([/^ZAR\/JPY\b/i]) || findAssetSymbol(data, /^ZAR\/JPY\b/i),
        brljpy: pickBestByMatchers([/^BRL\/JPY\b/i]) || findAssetSymbol(data, /^BRL\/JPY\b/i),
        usdmxn: pickBestByMatchers([/^USD\/MXN\b/i]) || findAssetSymbol(data, /^USD\/MXN\b/i),
        usdzar: pickBestByMatchers([/^USD\/ZAR\b/i]) || findAssetSymbol(data, /^USD\/ZAR\b/i),
        usdtry: pickBestByMatchers([/^USD\/TRY\b/i]) || findAssetSymbol(data, /^USD\/TRY\b/i),
        usdclp: pickBestByMatchers([/^USD\/CLP\b/i]) || findAssetSymbol(data, /^USD\/CLP\b/i),
    };

    const lastOf = symbol => {
        if (!symbol) return null;
        const p = getMostRecentPointWithPrice(data, symbol) || getLastPoint(data, symbol);
        if (!p) return null;
        const price = typeof p.price === 'number' && Number.isFinite(p.price) ? p.price : null;
        const change = typeof p.change === 'number' && Number.isFinite(p.change) ? p.change : null;
        const changePct = pointPct(p);
        const t = p.t ? String(p.t) : '';
        const tMs = t ? Date.parse(t) : NaN;
        return { price, change, changePct, t, tMs: Number.isFinite(tMs) ? tMs : null };
    };

    const audusd = lastOf(symbols.audusd);
    const nzdusd = lastOf(symbols.nzdusd);
    const eurusd = lastOf(symbols.eurusd);
    const gbpusd = lastOf(symbols.gbpusd);
    const usdcad = lastOf(symbols.usdcad);
    const usdchf = lastOf(symbols.usdchf);
    const usdjpy = lastOf(symbols.usdjpy);
    const usdbrl = lastOf(symbols.usdbrl);
    const usdcnh = lastOf(symbols.usdcnh);
    const dxy = lastOf(symbols.dxy);
    const vix = lastOf(symbols.vix);
    const hyg = lastOf(symbols.hyg);
    const br10y = lastOf(symbols.br10y);
    const us10y = lastOf(symbols.us10y);
    const us10br10 = lastOf(symbols.us10br10);
    const us10jp10 = lastOf(symbols.us10jp10);
    const jp10y = lastOf(symbols.jp10y);
    const jp1y = lastOf(symbols.jp1y);
    const jp5y = lastOf(symbols.jp5y);
    const audjpyDirect = lastOf(symbols.audjpy);
    const nzdjpyDirect = lastOf(symbols.nzdjpy);
    const mxnjpyDirect = lastOf(symbols.mxnjpy);
    const zarjpyDirect = lastOf(symbols.zarjpy);
    const brljpyDirect = lastOf(symbols.brljpy);
    const usdmxn = lastOf(symbols.usdmxn);
    const usdzar = lastOf(symbols.usdzar);
    const usdtry = lastOf(symbols.usdtry);
    const usdclp = lastOf(symbols.usdclp);
    const hk10y = lastOf(symbols.hk10y);
    const hsi = lastOf(symbols.hsi);
    const hstech = lastOf(symbols.hstech);
    const ewh = lastOf(symbols.ewh);

    const pctOf = x => pointPct(x);
    const priceOf = x => (x && typeof x.price === 'number' ? x.price : null);
    const changeOf = x => (x && typeof x.change === 'number' ? x.change : null);

    const audusdPct = pctOf(audusd);
    const nzdusdPct = pctOf(nzdusd);
    const eurusdPct = pctOf(eurusd);
    const gbpusdPct = pctOf(gbpusd);
    const usdcadPct = pctOf(usdcad);
    const usdchfPct = pctOf(usdchf);
    const usdjpyPct = pctOf(usdjpy);
    const usdbrlPct = pctOf(usdbrl);
    const usdcnhPct = pctOf(usdcnh);
    const dxyPct = pctOf(dxy);
    const vixPct = pctOf(vix);
    const hygPct = pctOf(hyg);
    const jp10yLevel = priceOf(jp10y);
    const jp10yDelta = changeOf(jp10y);
    const jp10yBps = typeof jp10yDelta === 'number' && Number.isFinite(jp10yDelta) ? jp10yDelta * 100 : null;
    const jp10yCarryV = typeof jp10yBps === 'number' && Number.isFinite(jp10yBps) ? -jp10yBps : null;
    const usjpBps = priceOf(us10jp10);
    const jp1yLevel = priceOf(jp1y);
    const jp5yLevel = priceOf(jp5y);
    const jp1yBps = (() => { const d = changeOf(jp1y); return typeof d === 'number' ? d * 100 : null; })();
    const jp5yBps = (() => { const d = changeOf(jp5y); return typeof d === 'number' ? d * 100 : null; })();
    const slope1_10_bps = typeof jp10yLevel === 'number' && typeof jp1yLevel === 'number' ? (jp10yLevel - jp1yLevel) * 100 : null;
    const slope5_10_bps = typeof jp10yLevel === 'number' && typeof jp5yLevel === 'number' ? (jp10yLevel - jp5yLevel) * 100 : null;
    const slope1_10_delta_bps = typeof jp10yBps === 'number' && typeof jp1yBps === 'number' ? (jp10yBps - jp1yBps) : null;
    const slope5_10_delta_bps = typeof jp10yBps === 'number' && typeof jp5yBps === 'number' ? (jp10yBps - jp5yBps) : null;
    const hk10yBps = (() => { const d = changeOf(hk10y); return typeof d === 'number' ? d * 100 : null; })();
    const hsiPct = pctOf(hsi);
    const hstechPct = pctOf(hstech);
    const ewhPct = pctOf(ewh);
    const hkBaseScore = avg([typeof hsiPct === 'number' ? hsiPct : null, typeof hstechPct === 'number' ? hstechPct : null, typeof ewhPct === 'number' ? ewhPct : null]
        .map((v, i) => (i === 0 ? (typeof v === 'number' ? v * 0.5 : null) : i === 1 ? (typeof v === 'number' ? v * 0.3 : null) : (typeof v === 'number' ? v * 0.2 : null))));
    const hkAdj = typeof hk10yBps === 'number' ? Math.max(-1, Math.min(1, (-hk10yBps) / 8)) : 0;
    const hkScore = (typeof hkBaseScore === 'number' ? hkBaseScore : 0) + hkAdj * 0.2;
    const hkScore10 = (() => {
        const s = typeof hkScore === 'number' ? hkScore : 0;
        const n = Math.max(0, Math.min(10, Math.round((s / 2) * 5 + 5)));
        return n;
    })();

    const audjpyPct =
        pctOf(audjpyDirect) !== null
            ? pctOf(audjpyDirect)
            : audusdPct !== null && usdjpyPct !== null
                ? (Math.max(-99, Math.min(99, ((1 + audusdPct / 100) * (1 + usdjpyPct / 100) - 1) * 100)))
                : null;

    const audjpyLevel =
        priceOf(audjpyDirect) !== null
            ? priceOf(audjpyDirect)
            : priceOf(audusd) !== null && priceOf(usdjpy) !== null
                ? priceOf(audusd) * priceOf(usdjpy)
                : null;

    const nzdjpyPct =
        pctOf(nzdjpyDirect) !== null
            ? pctOf(nzdjpyDirect)
            : nzdusdPct !== null && usdjpyPct !== null
                ? (Math.max(-99, Math.min(99, ((1 + nzdusdPct / 100) * (1 + usdjpyPct / 100) - 1) * 100)))
                : null;

    const synthCross = (quote, base) => {
        const qPct = pctOf(quote);
        const bPct = pctOf(base);
        if (qPct === null || bPct === null) return null;
        const v = ((1 + qPct / 100) / Math.max(1e-9, (1 + bPct / 100)) - 1) * 100;
        return Math.max(-99, Math.min(99, v));
    };
    const synthCrossLevel = (quote, base) => {
        const q = priceOf(quote);
        const b = priceOf(base);
        if (q === null || b === null) return null;
        if (!(b > 0)) return null;
        const v = q / b;
        return Number.isFinite(v) ? v : null;
    };

    const mxnjpyPct = pctOf(mxnjpyDirect) !== null ? pctOf(mxnjpyDirect) : (usdjpyPct !== null ? synthCross(usdjpy, usdmxn) : null);
    const zarjpyPct = pctOf(zarjpyDirect) !== null ? pctOf(zarjpyDirect) : (usdjpyPct !== null ? synthCross(usdjpy, usdzar) : null);
    const brljpyPct = pctOf(brljpyDirect) !== null ? pctOf(brljpyDirect) : (usdjpyPct !== null ? synthCross(usdjpy, usdbrl) : null);
    const usdcnhJpyPct = (usdjpyPct !== null && usdcnhPct !== null)
        ? (Math.max(-99, Math.min(99, ((1 + usdjpyPct / 100) / Math.max(1e-9, (1 + usdcnhPct / 100)) - 1) * 100)))
        : null;

    const mxnjpyLevel = priceOf(mxnjpyDirect) !== null ? priceOf(mxnjpyDirect) : (priceOf(usdjpy) !== null ? synthCrossLevel(usdjpy, usdmxn) : null);
    const zarjpyLevel = priceOf(zarjpyDirect) !== null ? priceOf(zarjpyDirect) : (priceOf(usdjpy) !== null ? synthCrossLevel(usdjpy, usdzar) : null);
    const brljpyLevel = priceOf(brljpyDirect) !== null ? priceOf(brljpyDirect) : (priceOf(usdjpy) !== null ? synthCrossLevel(usdjpy, usdbrl) : null);

    let premiumBps = null;
    let premiumPct = null;
    let premiumSource = '';
    if (us10br10 && typeof us10br10.price === 'number') {
        premiumBps = us10br10.price;
        premiumPct = pctOf(us10br10);
        premiumSource = 'US10BR10';
    } else if (br10y && us10y && typeof br10y.price === 'number' && typeof us10y.price === 'number') {
        premiumBps = (br10y.price - us10y.price) * 100;
        premiumPct = null;
        premiumSource = 'BR10Y-US10Y';
    } else if (br10y && typeof br10y.price === 'number') {
        premiumBps = br10y.price * 100;
        premiumPct = null;
        premiumSource = 'BR10Y';
    }

    const carryCrosses = [
        { label: 'AUD/JPY*', pct: audjpyPct, level: audjpyLevel, w: 0.36 },
        { label: 'NZD/JPY*', pct: nzdjpyPct, level: null, w: 0.22 },
        { label: 'MXN/JPY*', pct: mxnjpyPct, level: mxnjpyLevel, w: 0.18 },
        { label: 'ZAR/JPY*', pct: zarjpyPct, level: zarjpyLevel, w: 0.14 },
        { label: 'BRL/JPY*', pct: brljpyPct, level: brljpyLevel, w: 0.10 },
    ];
    const weightedAvg = (items) => {
        const pairs = (items || [])
            .map(x => ({ v: typeof x.pct === 'number' && Number.isFinite(x.pct) ? x.pct : null, w: typeof x.w === 'number' && Number.isFinite(x.w) ? x.w : 0 }))
            .filter(x => typeof x.v === 'number' && Number.isFinite(x.v) && typeof x.w === 'number' && Number.isFinite(x.w) && x.w > 0);
        const wSum = pairs.reduce((s, x) => s + x.w, 0);
        if (!(wSum > 0)) return null;
        const s = pairs.reduce((acc, x) => acc + x.v * x.w, 0) / wSum;
        return Number.isFinite(s) ? s : null;
    };
    const carryBasketPct = weightedAvg(carryCrosses);
    const g10BetaPct = avg([audusdPct, nzdusdPct, eurusdPct, gbpusdPct]);
    const emUsdPct = avg([usdmxn ? pctOf(usdmxn) : null, usdzar ? pctOf(usdzar) : null, usdclp ? pctOf(usdclp) : null, usdtry ? pctOf(usdtry) : null, usdcnhPct]);

    const hasCore = (carryCrosses.filter(x => typeof x.pct === 'number' && Number.isFinite(x.pct)).length >= 2)
        || ([audusdPct, usdjpyPct].filter(v => typeof v === 'number').length >= 2);
    const hasPremium = typeof premiumBps === 'number' && Number.isFinite(premiumBps);

    const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
    const norm = (v, unit) => {
        if (typeof v !== 'number' || !Number.isFinite(v) || typeof unit !== 'number' || !Number.isFinite(unit) || unit <= 0) return 0;
        return clamp(v / unit, -2, 2);
    };

    let carryStatus = 'Neutro';
    let carryStatusDetail = '—';
    if (!hasCore) {
        carryStatus = 'Dados insuficientes';
        carryStatusDetail = 'Crosses JPY (AUD/NZD/MXN/ZAR/BRL)';
    } else {
        const base = typeof carryBasketPct === 'number' ? carryBasketPct : audjpyPct;
        const riskOff = (typeof vixPct === 'number' && vixPct >= 1.0) || (typeof dxyPct === 'number' && dxyPct >= 0.35);
        const severeFx = (typeof usdjpyPct === 'number' && usdjpyPct <= -0.7) || (typeof audusdPct === 'number' && audusdPct <= -0.6);

        if (typeof base === 'number') {
            if (base <= -0.85 && (riskOff || severeFx)) carryStatus = 'Unwinding (severo)';
            else if (base <= -0.65) carryStatus = 'Unwinding';
            else if (base >= 0.65 && !riskOff) carryStatus = 'Building';
            else carryStatus = 'Neutro';
        }

        const parts = [];
        if (typeof carryBasketPct === 'number') parts.push(`Basket ${formatPercent(carryBasketPct, 2)}`);
        if (typeof audjpyPct === 'number') parts.push(`AUD/JPY ${formatPercent(audjpyPct, 2)}`);
        if (typeof usdjpyPct === 'number') parts.push(`USD/JPY ${formatPercent(usdjpyPct, 2)}`);
        if (typeof vixPct === 'number') parts.push(`VIX ${formatPercent(vixPct, 2)}`);
        carryStatusDetail = parts.join(' • ') || '—';
    }

    let flowLabel = 'Neutro';
    const corePct = typeof carryBasketPct === 'number' ? carryBasketPct : audjpyPct;
    if (typeof corePct === 'number' && typeof premiumPct === 'number') {
        const entering = premiumPct < -0.4 && corePct > 0.4 && (typeof dxyPct !== 'number' || dxyPct <= 0.1) && (typeof vixPct !== 'number' || vixPct <= 0.25);
        const leaving = premiumPct > 0.4 && corePct < -0.4 && (typeof dxyPct !== 'number' || dxyPct >= -0.1) && (typeof vixPct !== 'number' || vixPct >= -0.1);
        flowLabel = entering ? 'Entrando' : leaving ? 'Saindo' : 'Neutro';
    } else if (typeof corePct === 'number') {
        if (corePct > 0.6 && (typeof dxyPct !== 'number' || dxyPct < 0.1) && (typeof vixPct !== 'number' || vixPct <= 0.25) && (typeof usdbrlPct !== 'number' || usdbrlPct < 0.1)) flowLabel = 'Entrando';
        if (corePct < -0.6 && (typeof dxyPct !== 'number' || dxyPct > -0.1) && (typeof vixPct !== 'number' || vixPct >= -0.1) && (typeof usdbrlPct !== 'number' || usdbrlPct > -0.1)) flowLabel = 'Saindo';
    }

    let score = 5;
    score += 2.0 * norm(corePct || 0, 0.9);
    score += 1.2 * norm(-(premiumPct || 0), 0.8);
    score += 1.0 * norm(-(dxyPct || 0), 0.7);
    score += 0.9 * norm(-(vixPct || 0), 0.9);
    score += 1.2 * norm(-(usdbrlPct || 0), 0.7);
    score += 0.8 * norm(hygPct || 0, 0.8);
    if (typeof jp10yCarryV === 'number' && Number.isFinite(jp10yCarryV)) {
        score += 0.8 * norm(jp10yCarryV, 6);
    }

    if (typeof nzdusdPct === 'number' && typeof audusdPct === 'number' && Math.abs(nzdusdPct) > Math.abs(audusdPct) + 0.4) {
        score += nzdusdPct < 0 ? -0.6 : +0.2;
    }

    const staleMs = 4 * 60 * 60 * 1000;
    const ageOf = (sym) => {
        if (!sym) return null;
        if (dc && typeof dc.symbolAgeMs === 'function') {
            const age = dc.symbolAgeMs(dcDeps, data, sym);
            return typeof age === 'number' && Number.isFinite(age) ? age : null;
        }
        const p = lastOf(sym);
        if (!p || typeof p.tMs !== 'number') return null;
        const age = Date.now() - p.tMs;
        return Number.isFinite(age) ? age : null;
    };
    const coreAges = [
        ageOf(symbols.audjpy) ?? ageOf(symbols.audusd),
        ageOf(symbols.usdjpy),
        ageOf(symbols.usdmxn),
        ageOf(symbols.usdzar),
        ageOf(symbols.vix),
        ageOf(symbols.hyg),
    ].filter(x => typeof x === 'number' && Number.isFinite(x));
    const staleCore = coreAges.length ? (coreAges.some(ms => ms > staleMs)) : false;
    if (staleCore) score -= 0.9;

    const score10 = clamp(Math.round(score), 0, 10);
    const scoreTone = score10 >= 7 ? 'positive' : score10 <= 3 ? 'negative' : 'neutral';

    setMetric('carry-premium-level', hasPremium ? formatNumber(premiumBps, 1) : '—');
    setMetric('carry-premium-detail', hasPremium ? `${premiumSource}${typeof premiumPct === 'number' ? ` • ${formatPercent(premiumPct, 2)}` : ''}` : '—');

    setMetric('carry-audjpy-level', typeof audjpyLevel === 'number' ? formatNumber(audjpyLevel, 2) : '—');
    setMetric('carry-audjpy-detail', typeof audjpyPct === 'number' ? formatPercent(audjpyPct, 2) : '—');

    setMetric('carry-usdjpy-level', typeof priceOf(usdjpy) === 'number' ? formatNumber(priceOf(usdjpy), 2) : '—');
    setMetric('carry-usdjpy-detail', typeof usdjpyPct === 'number' ? formatPercent(usdjpyPct, 2) : '—');

    setMetric('carry-state', carryStatus);
    setMetric('carry-state-detail', carryStatusDetail);

    setMetric('carry-score', `${score10}/10`);
    setHtml('carry-score-detail', toneBadgeHtmlFromTone(scoreTone, score10 - 5, `${flowLabel}`, { maxAbs: 5 }));

    const fmtSignedBp = bps => {
        const v = typeof bps === 'number' && Number.isFinite(bps) ? bps : null;
        if (v === null) return '—';
        const sign = v > 0 ? '+' : v < 0 ? '−' : '';
        return `${sign}${formatNumber(Math.abs(v), 0)}bp`;
    };

    const rows = [
        { sep: true, label: 'Macro / Liquidez' },
        { label: 'Basket Carry (crosses JPY)', v: corePct, fmt: x => formatPercent(x, 2), maxAbs: 5 },
        { label: 'Prêmio BR vs US (bps)', v: hasPremium ? premiumBps : null, fmt: x => formatNumber(x, 1), maxAbs: 1200 },
        { label: 'DXY', v: dxyPct, fmt: x => formatPercent(x, 2), maxAbs: 5 },
        { label: 'VIX', v: vixPct, fmt: x => formatPercent(x, 2), maxAbs: 5 },
        { label: 'HYG', v: hygPct, fmt: x => formatPercent(x, 2), maxAbs: 5 },
        { label: 'JP10Y (Δ bp)', v: jp10yCarryV, fmt: () => fmtSignedBp(jp10yBps), maxAbs: 35 },
        { label: 'Spread US10–JP10 (bps)', v: usjpBps, fmt: x => formatNumber(x, 1), maxAbs: 800 },

        { sep: true, label: 'FX G10 (beta + funding)' },
        { label: 'G10 beta (AUD/NZD/EUR/GBP)', v: g10BetaPct, fmt: x => formatPercent(x, 2), maxAbs: 5 },
        { label: 'AUD/USD', v: audusdPct, fmt: x => formatPercent(x, 2), maxAbs: 5 },
        { label: 'NZD/USD', v: nzdusdPct, fmt: x => formatPercent(x, 2), maxAbs: 5 },
        { label: 'EUR/USD', v: eurusdPct, fmt: x => formatPercent(x, 2), maxAbs: 5 },
        { label: 'GBP/USD', v: gbpusdPct, fmt: x => formatPercent(x, 2), maxAbs: 5 },
        { label: 'USD/JPY', v: usdjpyPct, fmt: x => formatPercent(x, 2), maxAbs: 5 },
        { label: 'USD/CAD', v: usdcadPct, fmt: x => formatPercent(x, 2), maxAbs: 5 },
        { label: 'USD/CHF', v: usdchfPct, fmt: x => formatPercent(x, 2), maxAbs: 5 },
        { label: 'AUD/JPY*', v: audjpyPct, fmt: x => formatPercent(x, 2), maxAbs: 5 },
        { label: 'NZD/JPY*', v: nzdjpyPct, fmt: x => formatPercent(x, 2), maxAbs: 5 },

        { sep: true, label: 'FX Emergentes (USD/EM)' },
        { label: 'USD/EM Basket', v: emUsdPct, fmt: x => formatPercent(x, 2), maxAbs: 5 },
        { label: 'USD/CNH', v: usdcnhPct, fmt: x => formatPercent(x, 2), maxAbs: 5 },
        { label: 'USD/BRL', v: usdbrlPct, fmt: x => formatPercent(x, 2), maxAbs: 5 },
        { label: 'USD/MXN', v: pctOf(usdmxn), fmt: x => formatPercent(x, 2), maxAbs: 5 },
        { label: 'USD/ZAR', v: pctOf(usdzar), fmt: x => formatPercent(x, 2), maxAbs: 5 },
        { label: 'USD/CLP', v: pctOf(usdclp), fmt: x => formatPercent(x, 2), maxAbs: 5 },
        { label: 'USD/TRY', v: pctOf(usdtry), fmt: x => formatPercent(x, 2), maxAbs: 5 },
        { label: 'MXN/JPY*', v: mxnjpyPct, fmt: x => formatPercent(x, 2), maxAbs: 5 },
        { label: 'ZAR/JPY*', v: zarjpyPct, fmt: x => formatPercent(x, 2), maxAbs: 5 },
        { label: 'BRL/JPY*', v: brljpyPct, fmt: x => formatPercent(x, 2), maxAbs: 5 },
        { label: 'CNH/JPY*', v: usdcnhJpyPct, fmt: x => formatPercent(x, 2), maxAbs: 5 },
    ];

    const listHtml = `
        <div style="border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:12px;background:rgba(0,0,0,.18);">
            <div style="font-weight:900;letter-spacing:1px;opacity:.95;margin-bottom:8px;">Componentes</div>
            ${rows
                .filter(r => (r && r.sep) || (r && r.v !== null && r.v !== undefined))
                .map(r => {
                    if (r && r.sep) {
                        return `<div style="margin-top:10px;padding-top:10px;border-top:1px solid rgba(255,255,255,.08);font-weight:900;letter-spacing:.8px;opacity:.9;">${escapeHtml(r.label || '')}</div>`;
                    }
                    const txt = r.v === null ? '—' : r.fmt(r.v);
                    const badge = r.v === null ? '—' : toneBadgeHtml(r.v, txt, { maxAbs: r.maxAbs });
                    const note = /\*$/.test(String(r.label)) ? `<span style="opacity:.7;font-size:12px;">(sintético)</span>` : '';
                    return `
                        <div style="display:flex;justify-content:space-between;gap:10px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06);">
                            <div style="opacity:.9;font-weight:800;">${escapeHtml(r.label)} ${note}</div>
                            <div style="font-family:'Share Tech Mono',monospace;">${badge}</div>
                        </div>
                    `;
                })
                .join('')}
        </div>
    `;
    const mkBp = v => (typeof v === 'number' && Number.isFinite(v) ? `${v > 0 ? '+' : v < 0 ? '−' : ''}${formatNumber(Math.abs(v), 0)}bp` : '—');
    const japanCurveHtml = (jp1y || jp5y || jp10y) ? `
        <div style="border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:12px;background:rgba(0,0,0,.18);margin-top:10px;">
            <div style="display:flex;align-items:baseline;justify-content:space-between;gap:10px;margin-bottom:8px;">
                <div style="font-weight:900;letter-spacing:1px;opacity:.95;">Curva Japão</div>
                <button id="japanCurveMoreBtn" class="btn" style="padding:6px 10px;">Ver mais</button>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
                <div style="display:flex;justify-content:space-between;"><div>Δ JP1Y</div><div>${mkBp(jp1yBps)}</div></div>
                <div style="display:flex;justify-content:space-between;"><div>Δ JP5Y</div><div>${mkBp(jp5yBps)}</div></div>
                <div style="display:flex;justify-content:space-between;"><div>Δ JP10Y</div><div>${mkBp(jp10yBps)}</div></div>
                <div style="display:flex;justify-content:space-between;"><div>Inclinação 1–10</div><div>${mkBp(slope1_10_bps)}</div></div>
                <div style="display:flex;justify-content:space-between;"><div>Inclinação 5–10</div><div>${mkBp(slope5_10_bps)}</div></div>
            </div>
        </div>
    ` : '';
    const hkThermoHtml = (hsi || hstech || ewh || hk10y) ? `
        <div style="border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:12px;background:rgba(0,0,0,.18);margin-top:10px;">
            <div style="display:flex;align-items:baseline;justify-content:space-between;">
                <div style="font-weight:900;letter-spacing:1px;opacity:.95;">Termômetro HK</div>
                <div style="display:flex;align-items:center;gap:8px;">
                    <span>${hkScore10}/10</span>
                    <span>${typeof hkScore === 'number' && Number.isFinite(hkScore) ? toneBadgeHtml(hkScore, formatPercent(hkScore, 2), { maxAbs: 5 }) : '—'}</span>
                </div>
            </div>
            <div style="display:flex;flex-direction:column;gap:6px;margin-top:6px;">
                <div style="display:flex;justify-content:space-between;"><div>HSI</div><div>${typeof hsiPct === 'number' ? toneBadgeHtml(hsiPct, formatPercent(hsiPct, 2), { maxAbs: 5 }) : '—'}</div></div>
                <div style="display:flex;justify-content:space-between;"><div>HSTECH</div><div>${typeof hstechPct === 'number' ? toneBadgeHtml(hstechPct, formatPercent(hstechPct, 2), { maxAbs: 5 }) : '—'}</div></div>
                <div style="display:flex;justify-content:space-between;"><div>EWH</div><div>${typeof ewhPct === 'number' ? toneBadgeHtml(ewhPct, formatPercent(ewhPct, 2), { maxAbs: 5 }) : '—'}</div></div>
                <div style="display:flex;justify-content:space-between;"><div>Δ HK10Y</div><div>${mkBp(hk10yBps)}</div></div>
            </div>
        </div>
    ` : '';
    setHtml('carry-components', `${listHtml}${japanCurveHtml}${hkThermoHtml}`);
    const moreBtn = document.getElementById('japanCurveMoreBtn');
    if (moreBtn) {
        moreBtn.addEventListener('click', () => {
            try {
                localStorage.setItem('mercado_table_q:all', 'rates');
                localStorage.setItem('mercado_table_mode:all', 'all');
            } catch {
            }
            renderAllAssetsTable(data);
            location.hash = '#all-assets';
            const section = document.getElementById('all-assets');
            if (section && typeof section.scrollIntoView === 'function') {
                try {
                    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                } catch {
                }
            }
        });
    }

    const historyKey = 'mercado_carry_history_v1';
    const maxHistory = 24;
    const nowMs = Date.now();

    const readHistory = () => {
        try {
            mod.render({
                data,
                deps: {
                    ...buildCommonBlockDeps(),
                    avg,
                },
            });
            return;
        } catch {
            setHtml('carry-components', fallbackCard('FX/Carry', 'Falha ao renderizar o mÃ³dulo.'));
            setHtml('carry-history', '');
            setHtml('carry-alerts', '');
            return;
        }
    }
    setHtml('carry-components', fallbackCard('FX/Carry', 'MÃ³dulo indisponÃ­vel (nÃ£o carregado).'));
    setHtml('carry-history', '');
    setHtml('carry-alerts', '');
}

function renderCarryIntel(data) {
    const el = document.getElementById('carryIntel');
    if (!el) return;
    const mod = (typeof window !== 'undefined' && window.MercadoBlocks && window.MercadoBlocks.carryIntel) ? window.MercadoBlocks.carryIntel : null;
    if (mod && typeof mod.render === 'function') {
        try {
            mod.render({
                data,
                el,
                deps: {
                    ...buildCommonBlockDeps(),
                },
            });
            return;
        } catch {
            el.innerHTML = fallbackCard('Carry Intel', 'Falha ao renderizar o mÃ³dulo.');
            return;
        }
        out.sort((a, b) => mostRecentMs(b) - mostRecentMs(a));
        return out.length ? out[0] : null;
    };

    const resolveJapan10yYield = () => {
        return rcKey('JP_10Y', /^JP10YT=RR$/i)
            || aliasSym('JP10Y')
            || pickBestByMatchers([/^JP10YT=RR$/i, /\bJapan\b(?!.*\b(CDS|Future|Futures)\b).*?\b10\b.*?\bYear\b.*?\bYield\b/i, /\bJapan\b(?!.*\b(CDS|Future|Futures)\b).*?\b10\b.*?\bYear\b/i])
            || null;
    };

    const symbols = {
        audusd: pickBestByMatchers([/^AUD\/USD\b/i]) || findAssetSymbol(data, /^AUD\/USD\b/i),
        nzdusd: pickBestByMatchers([/^NZD\/USD\b/i]) || findAssetSymbol(data, /^NZD\/USD\b/i),
        usdjpy: pickBestByMatchers([/^USD\/JPY\b/i]) || findAssetSymbol(data, /^USD\/JPY\b/i),
        usdbrl: aliasSym('USD_BRL') || pickBestByMatchers([/^USD\/BRL\b/i]) || findAssetSymbol(data, /^USD\/BRL\b/i),
        dxy: aliasSym('DXY') || pickBestByMatchers([/(^\.DXY$|\bDXY\b|US Dollar Index|\bUSDX\b|Dollar Index|Índice\s*Dólar|Indice\s*Dolar)/i]) || findAssetSymbol(data, /(^\.DXY$|\bDXY\b|US Dollar Index|\bUSDX\b|Dollar Index|Índice\s*Dólar|Indice\s*Dolar)/i),
        vix: findAliasSymbolBest(data, 'VIX9D') || findAliasSymbolBest(data, 'VIX30') || aliasSym('VIX') || pickBestByMatchers([/^\.?VIX(9D)?$/i, /^VIX$/i]) || findAssetSymbol(data, /^\.?VIX(9D)?$/i),
        hyg: rcKey('ETF_HYG', /^HYG(\.\w+)?$/i) || aliasSym('HYG') || pickBestByMatchers([/^HYG(\.\w+)?$/i]),
        br10y: rcKey('BR_10Y', /^BR10YT=RR$/i),
        us10y: rcKey('US_10Y', /(^US10YT=RR$|^US10YT=X$|^\.TNX$|\^TNX)/i) || aliasSym('US10Y'),
        us10br10: rcKey('SPREAD_US10_BR10', /^US10BR10=RR$/i),
        jp10y: rcKey('JP_10Y', /^JP10YT=RR$/i) || resolveJapan10yYield(),
        audjpy: pickBestByMatchers([/^AUD\/JPY\b/i]) || findAssetSymbol(data, /^AUD\/JPY\b/i),
        nzdjpy: pickBestByMatchers([/^NZD\/JPY\b/i]) || findAssetSymbol(data, /^NZD\/JPY\b/i),
        mxnjpy: pickBestByMatchers([/^MXN\/JPY\b/i]) || findAssetSymbol(data, /^MXN\/JPY\b/i),
        zarjpy: pickBestByMatchers([/^ZAR\/JPY\b/i]) || findAssetSymbol(data, /^ZAR\/JPY\b/i),
        brljpy: pickBestByMatchers([/^BRL\/JPY\b/i]) || findAssetSymbol(data, /^BRL\/JPY\b/i),
        usdmxn: pickBestByMatchers([/^USD\/MXN\b/i]) || findAssetSymbol(data, /^USD\/MXN\b/i),
        usdzar: pickBestByMatchers([/^USD\/ZAR\b/i]) || findAssetSymbol(data, /^USD\/ZAR\b/i),
    };

    const lastOf = symbol => {
        if (!symbol) return null;
        const p = getMostRecentPointWithPrice(data, symbol) || getLastPoint(data, symbol);
        if (!p) return null;
        const price = typeof p.price === 'number' && Number.isFinite(p.price) ? p.price : null;
        const change = typeof p.change === 'number' && Number.isFinite(p.change) ? p.change : null;
        const changePct = pointPct(p);
        return { price, change, changePct };
    };

    const audusd = lastOf(symbols.audusd);
    const nzdusd = lastOf(symbols.nzdusd);
    const usdjpy = lastOf(symbols.usdjpy);
    const usdbrl = lastOf(symbols.usdbrl);
    const dxy = lastOf(symbols.dxy);
    const vix = lastOf(symbols.vix);
    const hyg = lastOf(symbols.hyg);
    const br10y = lastOf(symbols.br10y);
    const us10y = lastOf(symbols.us10y);
    const us10br10 = lastOf(symbols.us10br10);
    const jp10y = lastOf(symbols.jp10y);
    const audjpyDirect = lastOf(symbols.audjpy);
    const nzdjpyDirect = lastOf(symbols.nzdjpy);
    const mxnjpyDirect = lastOf(symbols.mxnjpy);
    const zarjpyDirect = lastOf(symbols.zarjpy);
    const brljpyDirect = lastOf(symbols.brljpy);
    const usdmxn = lastOf(symbols.usdmxn);
    const usdzar = lastOf(symbols.usdzar);

    const pctOf = x => pointPct(x);

    const audusdPct = pctOf(audusd);
    const nzdusdPct = pctOf(nzdusd);
    const usdjpyPct = pctOf(usdjpy);
    const usdbrlPct = pctOf(usdbrl);
    const dxyPct = pctOf(dxy);
    const vixPct = pctOf(vix);
    const hygPct = pctOf(hyg);
    const jp10yPct = pctOf(jp10y);
    const jp10yBps = jp10y && typeof jp10y.change === 'number' && Number.isFinite(jp10y.change) ? jp10y.change * 100 : null;

    const audjpyPct =
        pctOf(audjpyDirect) !== null
            ? pctOf(audjpyDirect)
            : audusdPct !== null && usdjpyPct !== null
                ? (Math.max(-99, Math.min(99, ((1 + audusdPct / 100) * (1 + usdjpyPct / 100) - 1) * 100)))
                : null;

    const nzdjpyPct =
        pctOf(nzdjpyDirect) !== null
            ? pctOf(nzdjpyDirect)
            : nzdusdPct !== null && usdjpyPct !== null
                ? (Math.max(-99, Math.min(99, ((1 + nzdusdPct / 100) * (1 + usdjpyPct / 100) - 1) * 100)))
                : null;

    const synthCross = (quote, base) => {
        const qPct = pctOf(quote);
        const bPct = pctOf(base);
        if (qPct === null || bPct === null) return null;
        const v = ((1 + qPct / 100) / Math.max(1e-9, (1 + bPct / 100)) - 1) * 100;
        return Math.max(-99, Math.min(99, v));
    };
    const mxnjpyPct = pctOf(mxnjpyDirect) !== null ? pctOf(mxnjpyDirect) : (usdjpyPct !== null ? synthCross(usdjpy, usdmxn) : null);
    const zarjpyPct = pctOf(zarjpyDirect) !== null ? pctOf(zarjpyDirect) : (usdjpyPct !== null ? synthCross(usdjpy, usdzar) : null);
    const brljpyPct = pctOf(brljpyDirect) !== null ? pctOf(brljpyDirect) : (usdjpyPct !== null ? synthCross(usdjpy, usdbrl) : null);

    const carryCrosses = [
        { label: 'AUD/JPY', pct: audjpyPct, w: 0.36 },
        { label: 'NZD/JPY', pct: nzdjpyPct, w: 0.22 },
        { label: 'MXN/JPY', pct: mxnjpyPct, w: 0.18 },
        { label: 'ZAR/JPY', pct: zarjpyPct, w: 0.14 },
        { label: 'BRL/JPY', pct: brljpyPct, w: 0.10 },
    ];
    const weightedAvg = (items) => {
        const pairs = (items || [])
            .map(x => ({ v: typeof x.pct === 'number' && Number.isFinite(x.pct) ? x.pct : null, w: typeof x.w === 'number' && Number.isFinite(x.w) ? x.w : 0 }))
            .filter(x => typeof x.v === 'number' && Number.isFinite(x.v) && typeof x.w === 'number' && Number.isFinite(x.w) && x.w > 0);
        const wSum = pairs.reduce((s, x) => s + x.w, 0);
        if (!(wSum > 0)) return null;
        const s = pairs.reduce((acc, x) => acc + x.v * x.w, 0) / wSum;
        return Number.isFinite(s) ? s : null;
    };
    const carryBasketPct = weightedAvg(carryCrosses);

    const premiumPct = pctOf(us10br10) !== null ? pctOf(us10br10) : null;
    const hasPremium = premiumPct !== null || pctOf(br10y) !== null || pctOf(us10y) !== null;

    const moveLabel = (pct, { strong = 0.8, medium = 0.3 } = {}) => {
        if (pct === null) return { txt: 'Sem dado', tone: 'neutral' };
        if (pct >= strong) return { txt: 'Alta forte', tone: 'positive' };
        if (pct >= medium) return { txt: 'Alta', tone: 'positive' };
        if (pct <= -strong) return { txt: 'Queda forte', tone: 'negative' };
        if (pct <= -medium) return { txt: 'Queda', tone: 'negative' };
        return { txt: 'Estável', tone: 'neutral' };
    };

    const moveLabelInverted = (pct, cfg) => {
        const r = moveLabel(pct, cfg);
        if (r.tone === 'positive') return { txt: r.txt, tone: 'negative' };
        if (r.tone === 'negative') return { txt: r.txt, tone: 'positive' };
        return r;
    };

    const mk = (tone, txt) => toneBadgeHtmlFromTone(tone, 0, txt, { maxAbs: 1 });

    const coreOk = (carryCrosses.filter(x => typeof x.pct === 'number' && Number.isFinite(x.pct)).length >= 2)
        || ([audusdPct, usdjpyPct].filter(v => typeof v === 'number').length >= 2);
    let carryState = 'Inconclusivo';
    const corePct = typeof carryBasketPct === 'number' ? carryBasketPct : audjpyPct;
    if (coreOk && typeof corePct === 'number') {
        const riskOff = (typeof vixPct === 'number' && vixPct >= 1.0) || (typeof dxyPct === 'number' && dxyPct >= 0.35);
        const severeFx = (typeof usdjpyPct === 'number' && usdjpyPct <= -0.7) || (typeof audusdPct === 'number' && audusdPct <= -0.6);
        if (corePct <= -0.85 && (riskOff || severeFx)) carryState = 'Unwinding (severo)';
        else if (corePct <= -0.65) carryState = 'Unwinding';
        else if (corePct >= 0.65 && !riskOff) carryState = 'Building';
        else carryState = 'Neutro';
    } else if (!coreOk) {
        carryState = 'Dados insuficientes';
    }
    el.innerHTML = fallbackCard('Carry Intel', 'MÃ³dulo indisponÃ­vel.');
}

function resolveTickerSymbol(data, matchers) {
    for (const m of matchers || []) {
        const sym = findAssetSymbol(data, m);
        if (sym) return sym;
    }
    return null;
}

function formatTickerPrice(symbol, price, fmt) {
    if (price === null || price === undefined || !Number.isFinite(price)) return 'â€”';
    const s = String(symbol || '');
    const f = String(fmt || '');
    if (f === 'yield') return `${formatNumber(price, 2)}%`;
    if (f === 'fx') return formatNumber(price, 4);
    if (price >= 1000) return formatNumber(price, 0);
    if (price >= 100) return formatNumber(price, 2);
    if (/\//.test(s)) return formatNumber(price, 4);
    return formatNumber(price, 2);
}

function renderGlobalTicker(data) {
    const el = document.getElementById('globalTicker');
    if (!el) return;

    const defs = [
        { short: 'S&P 500', fmt: 'price', matchers: [/\bS&P 500 Futures\b/i, /\bSPDR.*S&P 500\b/i, /^\.(SPX|SP500)\b/i, /^SPY\b/i] },
        { short: 'NASDAQ', fmt: 'price', matchers: [/\bNasdaq 100 Futures\b/i, /\bNasdaq 100\b/i, /^QQQ\b/i, /^\.(NDX|IXIC)\b/i] },
        { short: 'DAX', fmt: 'price', matchers: [/\bDAX\b/i, /^\.(GDAXI)\b/i] },
        { short: 'NIKKEI', fmt: 'price', matchers: [/\bNikkei 225\b/i, /^JP225\b/i, /^\.(N225)\b/i] },
        { short: 'HSI', fmt: 'price', matchers: [/\bHang Seng\b/i, /\bHang Seng Futures\b/i] },
        { short: 'HSTECH', fmt: 'price', matchers: [/^HSTECH$/i, /\bHang Seng TECH\b/i] },
        { short: 'VHSI', fmt: 'price', matchers: [/^VHSI(c\d+)?$/i, /\bHSI Volatility\b/i] },
        { short: 'FTSE', fmt: 'price', matchers: [/\bFTSE 100\b/i, /^UK100\b/i] },
        { short: 'EEM', fmt: 'price', matchers: [/^EEM\b/i, /\bMSCI Emerging Markets\b/i] },
        { short: 'EWH', fmt: 'price', matchers: [/^EWH\b/i, /\biShares MSCI Hong Kong\b/i] },
        { short: 'DOW', fmt: 'price', matchers: [/^\.(DJI)\b/i, /\bDow Jones\b/i, /^DIA\b/i] },
        { short: 'IBOV', fmt: 'price', matchers: [/^\.(BVSP)\b/i, /\bBovespa\b/i] },
        { short: 'DXY', fmt: 'price', matchers: [/^\.(DXY)\b/i, /^DX\b/i, /\bUS Dollar Index\b/i, /\bÍndice Dólar\b/i, /\bIndice Dolar\b/i] },
        { short: 'VIX', fmt: 'price', matchers: [/^VIX\b/i, /^\.(VIX9D|VIX)\b/i, /\bVolatility\b/i] },
        { short: 'US2Y', fmt: 'yield', matchers: [/\bUnited States 2-Year\b/i, /\bEUA\b\s+a\s+2\s+anos\b/i, /\bEstados Unidos\b.*\b2\b.*anos\b/i, /^TUc/i, /^US2YT=RR\b/i] },
        { short: 'US10Y', fmt: 'yield', matchers: [/\bUnited States 10-Year\b/i, /\bEUA\b\s+a\s+10\s+anos\b/i, /\bEstados Unidos\b.*\b10\b.*anos\b/i, /^TNc2=/i, /^US10YT=RR\b/i] },
        { short: 'US30Y', fmt: 'yield', matchers: [/\bUnited States 30-Year\b/i, /\bEUA\b\s+a\s+30\s+anos\b/i, /\bEstados Unidos\b.*\b30\b.*anos\b/i, /^WNc/i, /^US30YT=RR\b/i] },
        { short: 'USD/BRL', fmt: 'fx', matchers: [/^USD\/BRL\b/i] },
        { short: 'EUR/USD', fmt: 'fx', matchers: [/^EUR\/USD\b/i] },
        { short: 'OURO', fmt: 'price', matchers: [/\bXAU\/USD\b/i, /\bGold Spot\b/i, /\bSPDR.*Gold\b/i] },
        { short: 'WTI', fmt: 'price', matchers: [/\bCrude Oil WTI Futures\b/i, /\bWTI\b/i] },
        { short: 'BRENT', fmt: 'price', matchers: [/\bBrent Oil Futures\b/i, /\bBrent\b/i] },
        { short: 'BTC', fmt: 'price', matchers: [/^BTC\/USD\b/i, /\bBitcoin\b/i] },
        { short: 'ETH', fmt: 'price', matchers: [/\bETH\/USD\b/i, /\bEthereum\b/i] },
    ];

    const items = defs
        .map(d => {
            const symbol = resolveTickerSymbol(data, d.matchers);
            if (!symbol) return null;
            const asset = (data.assets || []).find(a => String(a.symbol) === String(symbol)) || null;
            const last = getLastPoint(data, symbol);
            if (!last || typeof last.price !== 'number') return null;
            const pct = pointPct(last);
            const badge = pct === null ? toneBadgeHtmlFromTone('neutral', 0, '—') : toneBadgeHtml(pct, formatPercent(pct, 2), { maxAbs: 5 });
            const priceTxt = formatTickerPrice(symbol, last.price, d.fmt);
            const title = asset && asset.name ? `${asset.name} • ${symbol}` : symbol;
            return { symbol, short: d.short, title, priceTxt, badge };
        })
        .filter(Boolean);

    if (!items.length) {
        el.innerHTML = '';
        return;
    }
    el.innerHTML = fallbackCard('Ticker Global', 'MÃ³dulo indisponÃ­vel (nÃ£o carregado).');
}

function renderOverview(data) {
    const retentionDays = (data.meta && data.meta.retentionDays) || 10;
    setMetric('metric-assets', String((data.assets || []).length));
    setMetric('metric-retention', `${retentionDays} dias`);

    const rowsAll = (data.assets || [])
        .map(a => ({ a, last: getLastPoint(data, a.symbol) }))
        .filter(x => pointPct(x.last) !== null);

    const sorted = rowsAll.slice().sort((x, y) => (pointPct(y.last) ?? 0) - (pointPct(x.last) ?? 0));
    const topUp = sorted.length ? sorted[0] : null;
    const topDown = sorted.length ? sorted[sorted.length - 1] : null;

    if (topUp) {
        setMetricMultiline('metric-top-up', topUp.a.name || topUp.a.symbol);
        const pct = pointPct(topUp.last);
        setHtml('metric-top-up-pct', toneBadgeHtml(pct, formatPercent(pct), { maxAbs: 5 }));
    }
    if (topDown) {
        setMetricMultiline('metric-top-down', topDown.a.name || topDown.a.symbol);
        const pct = pointPct(topDown.last);
        setHtml('metric-top-down-pct', toneBadgeHtml(pct, formatPercent(pct), { maxAbs: 5 }));
    }

    const flow = computeFlowScore(data);
    setMetric('metric-flow', flow.label);
    setHtml('metric-flow-score', toneBadgeHtmlFromTone(flow.score > 0.35 ? 'positive' : flow.score < -0.35 ? 'negative' : 'neutral', flow.score, formatNumber(flow.score, 2), { maxAbs: 1 }));

    renderGlobalTicker(data);
    renderTopMovers(data);

    const groups = [
        { key: 'commodities', label: 'Commodities', categories: ['commodities', 'energy', 'agriculture'] },
        { key: 'metals', label: 'Metais', categories: ['metals'] },
        { key: 'fx', label: 'FX', categories: ['fx_g10', 'fx_emerging'] },
        { key: 'emerging', label: 'Emergentes', categories: ['emerging'] },
    ];
    const avgs = computeCategoryAverages(data, groups);
    const labels = avgs.map(a => `${a.label} (${a.count})`);
    const values = avgs.map(a => Number.isFinite(a.avg) ? Number(a.avg.toFixed(3)) : 0);
    window.MercadoCharts.renderBarChart('overviewChart', labels, values, 'Média de Chg% (agora)');
}

function renderAllAssetsTable(data) {
    const containerId = 'allAssetsTable';
    const el = document.getElementById(containerId);
    if (!el) return;

    const mod = (typeof window !== 'undefined' && window.MercadoBlocks && window.MercadoBlocks.allAssetsTable)
        ? window.MercadoBlocks.allAssetsTable
        : null;
    if (mod && typeof mod.render === 'function') {
        try {
            mod.render({
                data,
                deps: {
                    ...buildCommonBlockDeps(),
                    buildRows,
                },
            });
            return;
        } catch {
            el.innerHTML = fallbackCard('Todos os Ativos', 'Falha ao renderizar o mÃ³dulo.');
            return;
        }
    }

    el.innerHTML = fallbackCard('Todos os Ativos', 'MÃ³dulo indisponÃ­vel (nÃ£o carregado).');
}

function renderBrazilExportBasket(data) {
    const el = document.getElementById('exportBasket');
    if (!el) return;

    const mk = (tone, txt) => toneBadgeHtmlFromTone(tone, 0, txt, { maxAbs: 1 });
    const pctOf = x => pointPct(x);
    const dc = (typeof window !== 'undefined' && window.DecisionCore) ? window.DecisionCore : null;
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
    }
    el.innerHTML = fallbackCard('Export Basket', 'MÃ³dulo indisponÃ­vel (nÃ£o carregado).');
}

function renderBrazilMarket(data) {
    const mod = (typeof window !== 'undefined' && window.MercadoBlocks && window.MercadoBlocks.brazilMarket)
        ? window.MercadoBlocks.brazilMarket
        : null;
    if (mod && typeof mod.render === 'function') {
        try {
            mod.render({
                data,
                deps: {
                    ...buildCommonBlockDeps(),
                    isBrazilRelated,
                    brazilGroup,
                    safeRender: (typeof window !== 'undefined' && window.MercadoUtils && typeof window.MercadoUtils.safeRender === 'function')
                        ? window.MercadoUtils.safeRender
                        : null,
                    renderBrazilExportBasket,
                },
            });
            return;
        } catch {
            const metricsEl = document.getElementById('brazilMetrics');
            const pulseEl = document.getElementById('brazilPulse');
            const tableEl = document.getElementById('brazilTable');
            if (metricsEl) metricsEl.innerHTML = fallbackCard('Brasil', 'Falha ao renderizar o mÃ³dulo.');
            if (pulseEl) pulseEl.innerHTML = '';
            if (tableEl) tableEl.innerHTML = fallbackCard('Brasil', 'Falha ao renderizar o mÃ³dulo.');
            safeEmptyLineChart('brazilChart');
            return;
        }
    }

    const metricsEl = document.getElementById('brazilMetrics');
    const pulseEl = document.getElementById('brazilPulse');
    const tableEl = document.getElementById('brazilTable');
    if (metricsEl) metricsEl.innerHTML = fallbackCard('Brasil', 'MÃ³dulo indisponÃ­vel (nÃ£o carregado).');
    if (pulseEl) pulseEl.innerHTML = '';
    if (tableEl) tableEl.innerHTML = fallbackCard('Brasil', 'MÃ³dulo indisponÃ­vel (nÃ£o carregado).');
    safeEmptyLineChart('brazilChart');
}

function renderFavorites(data) {
    const mod = (typeof window !== 'undefined' && window.MercadoBlocks && window.MercadoBlocks.favorites) ? window.MercadoBlocks.favorites : null;
    if (mod && typeof mod.render === 'function') {
        try {
            mod.render({
                data,
                deps: {
                    ...buildCommonBlockDeps(),
                },
            });
            return;
        } catch {
            const el = document.getElementById('favoritesTable');
            if (!el) return;
            el.innerHTML = fallbackCard('Favoritos', 'Falha ao renderizar o mÃ³dulo.');
            safeEmptyLineChart('favoritesChart');
            return;
        }
    }
    const tableId = 'favoritesTable';
    const el = document.getElementById(tableId);
    if (!el) return;
    el.innerHTML = fallbackCard('Favoritos', 'MÃ³dulo indisponÃ­vel (nÃ£o carregado).');
    safeEmptyLineChart('favoritesChart');
}

function renderCategory(data, containerId, chartId, categories, defaultSymbol) {
    const el = document.getElementById(containerId);
    if (!el) return;

    const mod = (typeof window !== 'undefined' && window.MercadoBlocks && window.MercadoBlocks.categoryTable)
        ? window.MercadoBlocks.categoryTable
        : null;
    if (mod && typeof mod.render === 'function') {
        try {
            mod.render({
                data,
                containerId,
                chartId,
                categories,
                defaultSymbol,
                deps: {
                    ...buildCommonBlockDeps(),
                    buildRows,
                },
            });
            return;
        } catch {
            el.innerHTML = fallbackCard('Tabela', 'Falha ao renderizar o mÃ³dulo.');
            safeEmptyLineChart(chartId);
            return;
        }
    }

    el.innerHTML = fallbackCard('Tabela', 'MÃ³dulo indisponÃ­vel (nÃ£o carregado).');
    safeEmptyLineChart(chartId);
}

function renderMercosul(data) {
    const mod = (typeof window !== 'undefined' && window.MercadoBlocks && window.MercadoBlocks.mercosul) ? window.MercadoBlocks.mercosul : null;
    if (mod && typeof mod.render === 'function') {
        try {
            mod.render({
                data,
                deps: {
                    ...buildCommonBlockDeps(),
                },
            });
            return;
        } catch {
            const metricsEl = document.getElementById('mercosulMetrics');
            if (metricsEl) metricsEl.innerHTML = fallbackCard('Mercosul', 'Falha ao renderizar o mÃ³dulo.');
            const pulseEl = document.getElementById('mercosulPulse');
            if (pulseEl) pulseEl.innerHTML = '';
            const tableEl = document.getElementById('mercosulTable');
            if (tableEl) tableEl.innerHTML = '';
            try { buildCommonBlockDeps().renderLineChart('mercosulChart', [], 'â€”'); } catch { }
            return;
        }
        out.sort((a, b) => mostRecentMs(b) - mostRecentMs(a));
        return out.length ? out[0] : null;
    };
    const aliasSym = (k) => findAliasSymbolBest(data, k) || findAliasSymbol(data, k);

    const pick = (label, matchers, { invertForScore = false, aliasKey = null } = {}) => {
        const symbol = aliasKey ? (aliasSym(aliasKey) || pickBestByMatchers(matchers) || null) : (pickBestByMatchers(matchers) || null);
        const last = symbol ? (getMostRecentPointWithPrice(data, symbol) || getLastPoint(data, symbol)) : null;
        const pct = pointPct(last);
        const score = pct === null ? null : (invertForScore ? -pct : pct);
        const a = symbol ? (assetBySymbol.get(symbol) || null) : null;
        return { label, symbol, last, pct, score, asset: a, invertForScore: !!invertForScore };
    };

    const weightedAvg = (pairs) => {
        const xs = (pairs || [])
            .filter(p => p && typeof p.v === 'number' && Number.isFinite(p.v) && typeof p.w === 'number' && Number.isFinite(p.w) && p.w > 0);
        const wSum = xs.reduce((s, p) => s + p.w, 0);
        if (!(wSum > 0)) return null;
        const v = xs.reduce((acc, p) => acc + p.v * p.w, 0) / wSum;
        return Number.isFinite(v) ? v : null;
    };

    const fxPairs = [
        pick('USD/BRL (BR)', [/^USD\/BRL\b/i], { invertForScore: true, aliasKey: 'USD_BRL' }),
        pick('USD/MXN (MX)', [/^USD\/MXN\b/i, /\bUSDMXN\b/i], { invertForScore: true }),
        pick('USD/CLP (CL)', [/^USD\/CLP\b/i, /\bUSDCLP\b/i], { invertForScore: true }),
        pick('USD/COP (CO)', [/^USD\/COP\b/i, /\bUSDCOP\b/i], { invertForScore: true }),
        pick('USD/PEN (PE)', [/^USD\/PEN\b/i, /\bUSDPEN\b/i], { invertForScore: true }),
        pick('USD/ARS (AR)', [/^USD\/ARS\b/i, /\bUSDARS\b/i], { invertForScore: true }),
        pick('USD/UYU (UY)', [/^USD\/UYU\b/i, /\bUSDUYU\b/i], { invertForScore: true }),
        pick('USD/PYG (PY)', [/^USD\/PYG\b/i, /\bUSDPYG\b/i], { invertForScore: true }),
    ].filter(x => x && x.symbol);

    const eqProxies = [
        pick('Ibovespa', [/^\.BVSP$/i, /\bIbovespa\b/i, /^BOVA11\.SA$/i], { aliasKey: 'IBOV' }),
        pick('EWZ (Brasil)', [/^EWZ(\.\w+)?$/i]),
        pick('EWW (México)', [/^EWW(\.\w+)?$/i]),
        pick('ECH (Chile)', [/^ECH(\.\w+)?$/i]),
        pick('ARGT (Argentina)', [/^ARGT(\.\w+)?$/i]),
        pick('EPU (Peru)', [/^EPU(\.\w+)?$/i]),
        pick('GXG (Colômbia)', [/^GXG(\.\w+)?$/i]),
    ].filter(x => x && x.symbol);

    const context = [
        pick('DXY', [/(^\.DXY$|\bDXY\b|US Dollar Index|\bUSDX\b|Dollar Index|Índice\s*Dólar|Indice\s*Dolar)/i], { invertForScore: true, aliasKey: 'DXY' }),
        pick('VIX', [/^\.?VIX(9D)?$/i, /^VIX$/i], { invertForScore: true, aliasKey: 'VIX' }),
        pick('Cobre', [/^HG=F$/i, /^HGc\d$/i, /\bCopper\b/i, /\bCobre\b/i], { invertForScore: false, aliasKey: 'COPPER' }),
        pick('Brent/WTI', [/^BZ=F$/i, /^LCOc\d$/i, /^BRNc\d$/i, /^CL=F$/i, /^CLc\d$/i, /\bBrent\b/i, /\bWTI\b/i], { invertForScore: false, aliasKey: 'BRENT' }),
    ].filter(x => x && x.symbol);

    const fxStrength = weightedAvg(fxPairs.map(x => ({ v: x.score, w: x.symbol && /USD\/BRL/i.test(String(x.symbol)) ? 0.34 : /USD\/MXN/i.test(String(x.symbol)) ? 0.20 : /USD\/CLP/i.test(String(x.symbol)) ? 0.14 : /USD\/COP/i.test(String(x.symbol)) ? 0.10 : /USD\/PEN/i.test(String(x.symbol)) ? 0.08 : /USD\/ARS/i.test(String(x.symbol)) ? 0.06 : /USD\/UYU/i.test(String(x.symbol)) ? 0.04 : /USD\/PYG/i.test(String(x.symbol)) ? 0.04 : 0.06 })));

    const eqStrength = weightedAvg(eqProxies.map(x => ({ v: x.score, w: x.symbol && /^\.BVSP$/i.test(String(x.symbol)) ? 0.24 : x.symbol && /^EWZ/i.test(String(x.symbol)) ? 0.20 : x.symbol && /^EWW/i.test(String(x.symbol)) ? 0.18 : x.symbol && /^ECH/i.test(String(x.symbol)) ? 0.12 : x.symbol && /^ARGT/i.test(String(x.symbol)) ? 0.10 : x.symbol && /^EPU/i.test(String(x.symbol)) ? 0.10 : x.symbol && /^GXG/i.test(String(x.symbol)) ? 0.06 : 0.10 })));

    const ctxStrength = weightedAvg(context.map(x => ({ v: x.score, w: x.label === 'DXY' ? 0.40 : x.label === 'VIX' ? 0.30 : x.label === 'Cobre' ? 0.20 : 0.10 })));

    const score = weightedAvg([
        { v: fxStrength, w: 0.65 },
        { v: eqStrength, w: 0.25 },
        { v: ctxStrength, w: 0.10 },
    ]);

    let state = '—';
    if (typeof score === 'number' && Number.isFinite(score)) {
        if (score > 0.25) state = 'Entrada (LatAm forte / USD fraco)';
        else if (score < -0.25) state = 'Saída (USD/Stress LatAm)';
        else state = 'Misto / neutro';
    }

    const metricsEl = document.getElementById('mercosulMetrics');
    if (metricsEl) metricsEl.innerHTML = fallbackCard('Mercosul', 'MÃ³dulo indisponÃ­vel (nÃ£o carregado).');
    const pulseEl = document.getElementById('mercosulPulse');
    if (pulseEl) pulseEl.innerHTML = '';
    const tableEl = document.getElementById('mercosulTable');
    if (tableEl) tableEl.innerHTML = '';
    try {
        if (window.MercadoCharts && typeof window.MercadoCharts.renderLineChart === 'function') {
            window.MercadoCharts.renderLineChart('mercosulChart', [], 'â€”');
        }
    } catch {
    }
}

function renderPetrobrasModule(data) {
    const mod = (window.MercadoBlocks && window.MercadoBlocks.petrobras) ? window.MercadoBlocks.petrobras : null;
    if (mod && typeof mod.render === 'function') {
        try {
            mod.render({
                data,
                deps: {
                    toneFromValue,
                    ...buildCommonBlockDeps(),
                    getMostRecentPointWithPrice: (typeof getMostRecentPointWithPrice === 'function') ? getMostRecentPointWithPrice : null,
                    renderBrazilMarket,
                },
            });
            return;
        } catch {
            const gaugeEl = document.getElementById('petrobrasGauge');
            const tableEl = document.getElementById('petrobrasTable');
            const newsEl = document.getElementById('petrobrasNews');
            const missingEl = document.getElementById('petrobrasMissing');
            if (!gaugeEl || !tableEl || !newsEl || !missingEl) return;
            gaugeEl.innerHTML = fallbackCard('Petrobras', 'Falha ao renderizar o mÃ³dulo.');
            tableEl.innerHTML = '';
            newsEl.innerHTML = '';
            missingEl.innerHTML = '';
            return;
        }
    }

    const gaugeEl = document.getElementById('petrobrasGauge');
    const tableEl = document.getElementById('petrobrasTable');
    const newsEl = document.getElementById('petrobrasNews');
    const missingEl = document.getElementById('petrobrasMissing');
    if (!gaugeEl || !tableEl || !newsEl || !missingEl) return;

    gaugeEl.innerHTML = fallbackCard('Petrobras', 'MÃ³dulo indisponÃ­vel (nÃ£o carregado).');
    tableEl.innerHTML = '';
    newsEl.innerHTML = '';
    missingEl.innerHTML = '';
}

function renderMarketPanorama(data) {
    const el = document.getElementById('marketPanorama');
    if (!el) return;
    const mod = (typeof window !== 'undefined' && window.MercadoBlocks && window.MercadoBlocks.marketPanorama) ? window.MercadoBlocks.marketPanorama : null;
    if (mod && typeof mod.render === 'function') {
        try {
            mod.render({
                data,
                el,
                deps: {
                    ...buildCommonBlockDeps(),
                    assetIcon,
                },
            });
            return;
        } catch {
            return null;
        }
    };

    const frozenKey = 'mercado_panorama_frozen_v2';
    const frozen = safeParse(localStorage.getItem(frozenKey)) || {};

    const expandKey = 'mercado_panorama_expand_v1';
    const expandedState = safeParse(localStorage.getItem(expandKey)) || {};

    const saveFrozen = next => {
        try {
            localStorage.setItem(frozenKey, JSON.stringify(next || {}));
        } catch {
        }
    };

    const saveExpanded = next => {
        try {
            localStorage.setItem(expandKey, JSON.stringify(next || {}));
        } catch {
        }
    };

    const formatPrice = (symbol, price) => {
        if (price === null || price === undefined || !Number.isFinite(price)) return '—';
        const s = String(symbol || '');
        if (/\b(BTC|ETH|XRP|SOL|ADA)\b/i.test(s)) return formatNumber(price, price >= 1000 ? 0 : 2);
        if (/\/\w{3}\b/i.test(s) || s.includes('/')) return formatNumber(price, 4);
        if (price >= 1000) return formatNumber(price, 0);
        if (price >= 100) return formatNumber(price, 2);
        return formatNumber(price, 4);
    };

    const formatHm = iso => {
        const full = iso ? formatDateTime(iso) : '';
        const parts = full.split(' ');
        return parts.length > 1 ? parts[1] : full || '';
    };

    const assets = data && Array.isArray(data.assets) ? data.assets : [];
    const assetBySymbol = new Map(assets.map(a => [String(a && a.symbol ? a.symbol : ''), a]));
    const seriesKeys = Object.keys((data && data.series) || {});
    const diMatcher = /^DI1[FGHJKMNQUVXZ]\d{2}$/i;
    const favorites = loadFavorites();

    const isFav = symbol => {
        const s = String(symbol || '');
        if (!s) return false;
        return favorites.has(s) || favorites.has(symbolKey(s));
    };

    const pinnedMatchers = groupKey => {
        const k = String(groupKey || '');
        if (k === 'fx_g10') return [/^\.(DXY)\b/i, /^EUR\/USD\b/i, /^USD\/JPY\b/i, /^GBP\/USD\b/i, /^AUD\/USD\b/i, /^NZD\/USD\b/i, /^USD\/CHF\b/i, /^USD\/CAD\b/i];
        if (k === 'fx_em') return [/^USD\/BRL\b/i, /^USD\/MXN\b/i, /^USD\/ZAR\b/i, /^USD\/TRY\b/i, /^USD\/(CNY|CNH)\b/i];
        if (k === 'rates' || k === 'credit') return [/^US2YT=RR$/i, /^US10YT=RR$/i, /^US30YT=RR$/i, /^BR2YT=RR$/i, /^BR10YT=RR$/i, /^US10BR10=RR$/i];
        if (k === 'equities') return [/^\.(SPX|NDX)\b/i, /^SPY$/i, /^QQQ$/i, /^IWM$/i, /^DIA$/i, /^EWZ$/i];
        if (k === 'emerging') return [/^FXI$/i, /^\.(CSI300)\b/i, /^EEM$/i, /^EWW$/i];
        if (k === 'energy') return [/\bBrent\b/i, /\bWTI\b/i, /^CO1\b/i, /^CL1\b/i];
        if (k === 'metals') return [/\bGold\b/i, /\bSilver\b/i, /\bCopper\b/i, /^GC1\b/i, /^SI1\b/i, /^HG\b/i];
        if (k === 'agri') return [/\bSoy\b/i, /\bCorn\b/i, /\bWheat\b/i];
        if (k === 'crypto') return [/\bBTC\b/i, /\bETH\b/i];
        if (k === 'vol') return [/\bVIX\b/i, /^\.VIX\b/i];
        return [];
    };

    const pinnedIndex = (groupKey, row) => {
        const matchers = pinnedMatchers(groupKey);
        if (!matchers.length) return 999;
        const s = String(row && row.symbol ? row.symbol : '');
        const n = String(row && row.label ? row.label : '');
        for (let i = 0; i < matchers.length; i++) {
            const re = matchers[i];
            if (re.test(s) || re.test(n)) return i;
        }
        return 999;
    };

    const sortRows = (groupKey, rows) => {
        const key = String(groupKey || '');
        rows.sort((a, b) => {
            const af = isFav(a && a.symbol ? a.symbol : '') ? 0 : 1;
            const bf = isFav(b && b.symbol ? b.symbol : '') ? 0 : 1;
            if (af !== bf) return af - bf;
            const ap = pinnedIndex(key, a);
            const bp = pinnedIndex(key, b);
            if (ap !== bp) return ap - bp;
            return String(a && a.label ? a.label : '').localeCompare(String(b && b.label ? b.label : ''), 'pt-BR');
        });
    };

    const diMonthNum = code => {
        const c = String(code || '').toUpperCase();
        if (c === 'F') return 1;
        if (c === 'G') return 2;
        if (c === 'H') return 3;
        if (c === 'J') return 4;
        if (c === 'K') return 5;
        if (c === 'M') return 6;
        if (c === 'N') return 7;
        if (c === 'Q') return 8;
        if (c === 'U') return 9;
        if (c === 'V') return 10;
        if (c === 'X') return 11;
        if (c === 'Z') return 12;
        return null;
    };

    const diRows = () => {
        const symbols = seriesKeys.filter(s => diMatcher.test(s));
        const parsed = symbols
            .map(symbol => {
                const last = getMostRecentPointWithPrice(data, symbol);
                const price = last && typeof last.price === 'number' ? last.price : null;
                const pct = pointPct(last);
                const t = last && last.t ? String(last.t) : '';
                const yy = Number(String(symbol).slice(-2));
                const mm = diMonthNum(String(symbol)[3]);
                const tag = Number.isFinite(yy) && Number.isFinite(mm) ? ` ${String(mm).padStart(2, '0')}/${String(yy).padStart(2, '0')}` : '';
                const label = `${symbol}${tag ? ` (${tag.trim()})` : ''}`;
                const icon = assetIcon({ symbol, name: label, category: 'rates', tags: [] });
                return { label, symbol, icon, price, pct, t, yy: Number.isFinite(yy) ? yy : null, mm };
            })
            .filter(r => typeof r.price === 'number' && Number.isFinite(r.price))
            .sort((a, b) => ((a.yy || 0) - (b.yy || 0)) || ((a.mm || 0) - (b.mm || 0)));
        return parsed.map(({ yy, mm, ...rest }) => rest);
    };

    const rowsFor = (groupKey, categories, { includeDxy = false, excludeSymbols = [], includeMissing = false } = {}) => {
        const cats = Array.isArray(categories) ? categories : [];
        const exclude = new Set((excludeSymbols || []).map(s => String(s)));
        const base = assets.filter(a => cats.includes(a && a.category ? a.category : ''));
        const rows = base
            .map(a => {
                const symbol = String(a && a.symbol ? a.symbol : '');
                const last = includeMissing ? getLastPoint(data, symbol) : getMostRecentPointWithPrice(data, symbol);
                const price = last && typeof last.price === 'number' ? last.price : null;
                const pct = pointPct(last);
                const t = last && last.t ? String(last.t) : '';
                const label = String(a && a.name ? a.name : symbol);
                const icon = assetIcon({ symbol, name: label, category: a && a.category ? a.category : 'other', tags: a && a.tags ? a.tags : [] });
                return { label, symbol, icon, price, pct, t };
            })
            .filter(r => r.symbol && !exclude.has(r.symbol))
            .filter(r => includeMissing ? true : (typeof r.price === 'number' && Number.isFinite(r.price)));

        if (includeDxy) {
            const dxySymbol = findAssetSymbol(data, /(^\.DXY$|\bDXY\b|US Dollar Index)/i);
            if (dxySymbol && !rows.some(r => r.symbol === dxySymbol)) {
                const a = assetBySymbol.get(String(dxySymbol)) || null;
                const last = getMostRecentPointWithPrice(data, dxySymbol);
                const price = last && typeof last.price === 'number' ? last.price : null;
                const pct = pointPct(last);
                const t = last && last.t ? String(last.t) : '';
                const label = a && a.name ? String(a.name) : 'DXY';
                const icon = assetIcon({ symbol: dxySymbol, name: label, category: a && a.category ? a.category : 'other', tags: a && a.tags ? a.tags : [] });
                rows.unshift({ label, symbol: dxySymbol, icon, price, pct, t });
            }
        }

        sortRows(groupKey, rows);
        return rows;
    };

    const baseGroups = [
        { key: 'equities', title: 'Ações & ETFs', maxRows: 18, categories: ['equities'], opt: { includeMissing: true } },
        { key: 'emerging', title: 'Emergentes (ETFs/Índices)', maxRows: 14, categories: ['emerging'], opt: { includeMissing: true } },
        { key: 'fx_g10', title: 'FX G10', maxRows: 14, categories: ['fx_g10'], opt: { includeDxy: true, includeMissing: true } },
        { key: 'fx_em', title: 'FX Emergentes', maxRows: 14, categories: ['fx_emerging'], opt: { includeMissing: true } },
        { key: 'br_di', title: 'Juros Brasil (DI)', maxRows: 16, kind: 'di' },
        { key: 'rates', title: 'Juros & Títulos', maxRows: 14, categories: ['rates'], opt: { includeMissing: true } },
        { key: 'credit', title: 'Crédito (CDS/Spreads)', maxRows: 14, categories: ['credit'], opt: { includeMissing: true } },
        { key: 'vol', title: 'Volatilidade', maxRows: 12, categories: ['volatility'], opt: { includeMissing: true } },
        { key: 'energy', title: 'Commodities • Energia', maxRows: 12, categories: ['energy'], opt: { includeMissing: true } },
        { key: 'metals', title: 'Commodities • Metais', maxRows: 12, categories: ['metals'], opt: { includeMissing: true } },
        { key: 'agri', title: 'Commodities • Agrícolas', maxRows: 12, categories: ['agriculture'], opt: { includeMissing: true } },
        { key: 'commodities', title: 'Commodities • Outras', maxRows: 12, categories: ['commodities'], opt: { includeMissing: true } },
        { key: 'crypto', title: 'Criptos', maxRows: 12, categories: ['crypto'], opt: { includeMissing: true } },
    ];

    const usedCats = new Set(baseGroups.flatMap(g => (g && g.categories ? g.categories : [])));
    const allCats = Array.from(new Set(assets.map(a => (a && a.category ? String(a.category) : '')).filter(Boolean)));
    const extras = allCats.filter(c => c && !usedCats.has(c));
    const uncategorized = assets.filter(a => !(a && a.category)).filter(a => a && a.symbol);
    const groups = []
        .concat(baseGroups)
        .concat(extras.length ? [{ key: 'outros', title: 'Outros', categories: extras, opt: { includeMissing: true } }] : [])
        .concat(uncategorized.length ? [{ key: 'sem_categoria', title: 'Sem categoria', kind: 'uncategorized', maxRows: 12 }] : []);

    const buildSnapshot = group => {
        if (group && group.kind === 'di') {
            const rows = diRows();
            return { at: new Date().toISOString(), rows };
        }
        if (group && group.kind === 'uncategorized') {
            const rows = uncategorized
                .map(a => {
                    const symbol = String(a && a.symbol ? a.symbol : '');
                    const last = getLastPoint(data, symbol);
                    const price = last && typeof last.price === 'number' ? last.price : null;
                    const pct = pointPct(last);
                    const t = last && last.t ? String(last.t) : '';
                    const label = String(a && a.name ? a.name : symbol);
                    const icon = assetIcon({ symbol, name: label, category: '', tags: a && a.tags ? a.tags : [] });
                    return { label, symbol, icon, price, pct, t };
                })
                .filter(r => r && r.symbol);
            sortRows(group.key, rows);
            return { at: new Date().toISOString(), rows };
        }
        const rows = rowsFor(group.key, group.categories, group.opt);
        return { at: new Date().toISOString(), rows };
    };

    const renderCard = (group, snap, isFrozen) => {
        const allRows = (snap && Array.isArray(snap.rows) ? snap.rows : []).slice().filter(r => r && r.symbol);
        const maxRows = typeof group.maxRows === 'number' && Number.isFinite(group.maxRows) && group.maxRows > 0 ? group.maxRows : 14;
        const isExpanded = !!(expandedState && expandedState[group.key]);
        const canExpand = allRows.length > maxRows;
        const rows = canExpand && !isExpanded ? allRows.slice(0, maxRows) : allRows;
        const freezeAt = snap && snap.at ? formatDateTime(snap.at) : '';
        const subtitle = isFrozen && freezeAt ? `Congelado • ${freezeAt}` : '';
        const countTxt = allRows.length ? `${allRows.length}` : '';
        const headRight = `
            <div style="display:flex;gap:10px;align-items:center;">
                ${subtitle ? `<div style="opacity:.75;font-weight:800;letter-spacing:.6px;font-size:12px;">${escapeHtml(subtitle)}</div>` : ''}
                ${canExpand ? `<button class="panorama-freeze" data-panorama-expand="${escapeHtml(group.key)}" aria-pressed="${isExpanded ? 'true' : 'false'}">${isExpanded ? 'Recolher' : `Ver tudo (${escapeHtml(countTxt)})`}</button>` : ''}
                <button class="panorama-freeze" data-panorama-freeze="${escapeHtml(group.key)}" aria-pressed="${isFrozen ? 'true' : 'false'}">Congelar</button>
            </div>
        `;

        const body = rows.length
            ? `<table class="panorama-table">
                <thead>
                    <tr>
                        <th>Ativo</th>
                        <th class="panorama-mono" style="text-align:right;">Último</th>
                        <th class="panorama-mono" style="text-align:right;">Var%</th>
                        <th class="panorama-mono" style="text-align:right;">Hora</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows
                        .map(r => {
                            const pct = typeof r.pct === 'number' ? r.pct : null;
                            const pctTxt = pct === null ? '—' : formatPercent(pct, 2);
                            const pctHtml = pct === null ? escapeHtml(pctTxt) : toneBadgeHtml(pct, pctTxt, { maxAbs: 3 });
                            const lastTxt = formatPrice(r.symbol, r.price);
                            const hm = r.t ? formatHm(r.t) : '';
                            const fullT = r.t ? formatDateTime(r.t) : '';
                            return `
                                <tr>
                                    <td>
                                        <div class="panorama-asset" title="${escapeHtml(r.symbol)}">
                                            <span class="panorama-asset__icon">${escapeHtml(r.icon || '•')}</span>
                                            <span class="panorama-asset__name">${escapeHtml(r.label)}</span>
                                        </div>
                                    </td>
                                    <td class="panorama-mono" style="text-align:right;">${escapeHtml(lastTxt)}</td>
                                    <td class="panorama-mono" style="text-align:right;">${pctHtml}</td>
                                    <td class="panorama-mono" style="text-align:right;" title="${escapeHtml(fullT)}">${escapeHtml(hm || '—')}</td>
                                </tr>
                            `;
                        })
                        .join('')}
                </tbody>
            </table>`
            : `<div style="opacity:.85;">Sem dados suficientes para este bloco.</div>`;

        return `<div class="panorama-card" data-panorama-card="${escapeHtml(group.key)}">
            <div class="panorama-card__header">
                <div class="panorama-card__title">${escapeHtml(group.title)}${countTxt ? ` <span style="opacity:.7;font-weight:900;">(${escapeHtml(countTxt)})</span>` : ''}</div>
                ${headRight}
            </div>
            ${body}
        </div>`;
    };

    const monitoredSymbols = assets.map(a => String(a && a.symbol ? a.symbol : '')).filter(Boolean);
    const monitoredUnique = new Set(monitoredSymbols);
    const duplicates = monitoredSymbols.length - monitoredUnique.size;

    const panoramaSet = new Set();
    for (const g of groups) {
        const snap = buildSnapshot(g);
        const rows = snap && Array.isArray(snap.rows) ? snap.rows : [];
        for (const r of rows) {
            const s = String(r && r.symbol ? r.symbol : '');
            if (s) panoramaSet.add(s);
        }
    }
    el.innerHTML = fallbackCard('Panorama', 'MÃ³dulo indisponÃ­vel (nÃ£o carregado).');
}

function renderAll(data) {
    const safeRender = (id, label, fn) => {
        const sr = (typeof window !== 'undefined' && window.MercadoUtils && typeof window.MercadoUtils.safeRender === 'function')
            ? window.MercadoUtils.safeRender
            : null;
        if (sr) return sr({ id, label, fn });
        try { fn(); } catch { }
        return { ok: true };
    };
    const safe = fn => safeRender(null, null, fn);

    if (!data || !(data.assets || []).length) {
        setDataStatus('SEM DADOS â€¢ Rode "npm run market:update" e clique â†» Dados', 'negative');
    } else {
        setDataStatus('', 'neutral');
    }

    const lastUpdate = data.meta && data.meta.generatedAt ? formatDateTime(data.meta.generatedAt) : '';
    const lastUpdateLabel = document.getElementById('last-update-label');
    if (lastUpdateLabel) lastUpdateLabel.textContent = lastUpdate ? ` â€¢ ${lastUpdate}` : '';

    const guarded = [
        { id: null, label: null, fn: () => renderOverview(data) },
        { id: 'operationalBriefing', label: 'Resumo Operacional', fn: () => renderOperationalBriefing() },
        { id: 'zqCurveBriefing', label: 'Curva Fed Funds (ZQ)', fn: () => renderZqCurveBriefing() },
        { id: 'usTreasuryFuturesBriefing', label: 'Treasuries (futuros)', fn: () => renderUsTreasuryFuturesBriefing() },
        { id: 'btcOperationalBriefing', label: 'BTC (Criptos) â€” Resumo Operacional', fn: () => renderBtcOperationalBriefing() },
        { id: 'hk50OperationalBriefing', label: 'HK50 â€” Resumo Operacional', fn: () => renderHk50OperationalBriefing() },
        { id: 'usEquitiesOperationalBriefing', label: 'Operacional EUA â€” US30 â€¢ Nasdaq â€¢ S&P 500', fn: () => renderUsEquitiesOperationalBriefing() },
        { id: 'commoditiesOperationalBriefing', label: 'Operacional Commodities â€” Ouro â€¢ PetrÃ³leo', fn: () => renderCommoditiesOperationalBriefing() },
        { id: 'marketPanorama', label: 'Panorama de Mercado', fn: () => renderMarketPanorama(data) },
    ];
    for (const b of guarded) {
        if (b.id) safeRender(b.id, b.label, b.fn);
        else safe(b.fn);
    }

    const blocks = [
        { id: 'favoritesTable', label: 'Watchlist', fn: () => renderFavorites(data) },
        { id: 'fs-components', label: 'Sentinela de Fluxo (FX)', fn: () => renderFlowSentinel(data) },
        { id: 'carry-components', label: 'FX / Carry (MVP)', fn: () => renderCarryTradeMonitor(data) },
        { id: 'allAssetsTable', label: 'Todos os Ativos', fn: () => renderAllAssetsTable(data) },
        { id: 'brazilTable', label: 'Mercado Brasileiro', fn: () => renderBrazilMarket(data) },
        { id: 'commoditiesTable', label: 'Commodities', fn: () => renderCategory(data, 'commoditiesTable', 'commoditiesChart', ['commodities', 'energy', 'agriculture']) },
        { id: 'metalsTable', label: 'Metais', fn: () => renderCategory(data, 'metalsTable', 'metalsChart', ['metals']) },
        { id: 'fxTable', label: 'FX', fn: () => renderCategory(data, 'fxTable', 'fxChart', ['fx_g10', 'fx_emerging']) },
        { id: 'emergingTable', label: 'Emergentes', fn: () => renderCategory(data, 'emergingTable', 'emergingChart', ['emerging']) },
        { id: 'mercosulTable', label: 'Mercosul', fn: () => renderMercosul(data) },
        { id: 'petrobrasTable', label: 'Operacional Petrobras', fn: () => renderPetrobrasModule(data) },
        { id: 'alertsList', label: 'Alertas', fn: () => renderAlerts(data) },
        { id: null, label: null, fn: () => renderIntel(data) },
    ];
    for (const b of blocks) {
        if (b.id) safeRender(b.id, b.label, b.fn);
        else safe(b.fn);
    }
}

function loadScriptFresh(src) {
    const mod = (typeof window !== 'undefined' && window.MercadoBlocks && window.MercadoBlocks.scriptLoader)
        ? window.MercadoBlocks.scriptLoader
        : null;
    if (mod && typeof mod.loadScriptFresh === 'function') {
        return mod.loadScriptFresh(src);
    }
    return Promise.reject(new Error('loadScriptFresh_unavailable'));
}

function formatUpdaterSummary(payload) {
    const mod = (typeof window !== 'undefined' && window.MercadoBlocks && window.MercadoBlocks.updaterSummary)
        ? window.MercadoBlocks.updaterSummary
        : null;
    if (mod && typeof mod.formatUpdaterSummary === 'function') {
        try {
            return mod.formatUpdaterSummary(payload);
        } catch {
            return null;
        }
    }
    return null;
}

function requestAutoRefreshPage(reason) {
    const mod = (typeof window !== 'undefined' && window.MercadoBlocks && window.MercadoBlocks.scriptLoader)
        ? window.MercadoBlocks.scriptLoader
        : null;
    if (mod && typeof mod.requestAutoRefreshPage === 'function') {
        try {
            mod.requestAutoRefreshPage(reason);
            return;
        } catch {
        }
    }
    window.location.reload();
}

async function triggerUpdaterAndReload() {
    const mod = (typeof window !== 'undefined' && window.MercadoBlocks && window.MercadoBlocks.updater)
        ? window.MercadoBlocks.updater
        : null;
    if (mod && typeof mod.trigger === 'function') {
        try {
            return await mod.trigger({
                deps: {
                    getMarketServiceBaseUrl,
                    setDataStatus,
                    loadScriptFresh,
                    resetAgendaAutoCache: () => { agendaAutoCache = null; },
                    getData,
                    renderAll,
                    loadOptionsGammaSummary,
                    loadFinancialJuice,
                    loadWebNewsModule,
                    loadFocusSummary,
                    loadForeignFlow,
                    formatUpdaterSummary,
                    requestAutoRefreshPage,
                },
            });
        } catch {
            return false;
        }
    }
    setDataStatus('ATUALIZADOR OFFLINE â€¢ Rode "Atualizar_Dados_Mercado.bat" e tente novamente', 'negative');
    return false;
}

function setupNav() {
    const mod = (typeof window !== 'undefined' && window.MercadoBlocks && window.MercadoBlocks.smoothScrollNav)
        ? window.MercadoBlocks.smoothScrollNav
        : null;
    if (mod && typeof mod.setup === 'function') {
        try {
            mod.setup();
        } catch {
        }
    }
}

const NAVIGATION_DEFINITION = {
    top: [
        { href: '#overview', label: 'Agora' },
        { href: '#flow-sentinel', label: 'Flow' },
        { href: '#intel', label: 'Intel' },
        { href: '#brazil-market', label: 'Brasil' },
        { href: '#petrobras', label: 'Petrobras' },
        { href: '#my-assets', label: 'Ativos' },
        { href: '#alerts', label: 'Alertas' },
    ],
    groups: [
        {
            title: 'Operacional',
            items: [
                { href: '#overview', label: 'VisÃ£o Geral' },
                { href: '#operational-now', label: 'Resumo (agora)' },
                { href: '#petrobras', label: 'Petrobras' },
                { href: '#btcOperationalBriefing', label: 'BTC' },
                { href: '#hk50OperationalBriefing', label: 'HK50' },
                { href: '#topMovers', label: 'Top Movers' },
                { href: '#panorama', label: 'Panorama' },
            ],
        },
        {
            title: 'Macro & Fluxo',
            items: [
                { href: '#flow-sentinel', label: 'Flow Sentinel' },
                { href: '#intel', label: 'Intel' },
                { href: '#regimeConviction', label: 'Regime & ConvicÃ§Ã£o' },
                { href: '#chinaBrazil', label: 'China + Brasil' },
                { href: '#fx-carry', label: 'FX / Carry' },
                { href: '#carryIntel', label: 'Carry Trade' },
                { href: '#ratesBuckets', label: 'Curva (Buckets)' },
                { href: '#zq-curve', label: 'Curva ZQ' },
                { href: '#brazilFixedIncomeFlow', label: 'Renda Fixa ðŸ‡§ðŸ‡·' },
                { href: '#agendaMatrix', label: 'Agenda & Matriz' },
            ],
        },
        {
            title: 'Mercados',
            items: [
                { href: '#brazil-market', label: 'Brasil' },
                { href: '#commodities', label: 'Commodities' },
                { href: '#metals', label: 'Metais' },
                { href: '#emerging', label: 'Emergentes' },
                { href: '#mercosul', label: 'Mercosul' },
            ],
        },
        {
            title: 'Ferramentas',
            items: [
                { href: '#my-assets', label: 'Meus Ativos' },
                { href: '#all-assets', label: 'Todos os Ativos' },
                { href: '#data-pack', label: 'Data Pack' },
                { href: '#dataAudit', label: 'Auditoria de Dados' },
                { href: '#alerts', label: 'Alertas' },
            ],
        },
        {
            title: 'Flow Sentinel (blocos)',
            items: [
                { href: '#fs-components', label: 'Componentes' },
                { href: '#fs-history', label: 'HistÃ³rico' },
                { href: '#fs-alerts', label: 'Alertas (FS)' },
            ],
        },
    ],
};

function getNavigationItemsFlat() {
    const all = [];
    for (const it of NAVIGATION_DEFINITION.top) all.push({ ...it, source: 'top' });
    for (const g of NAVIGATION_DEFINITION.groups) for (const it of g.items) all.push({ ...it, source: 'more' });
    return all;
}

function filterNavigationItemsByExistingTargets(items) {
    const byHref = new Map();
    for (const it of items) {
        const href = String(it && it.href ? it.href : '').trim();
        if (!href.startsWith('#')) continue;
        const label = String(it && it.label ? it.label : '').trim();
        if (!label) continue;
        const id = href.slice(1);
        if (!id) continue;
        const target = document.getElementById(id);
        if (!target) continue;
        const prev = byHref.get(href);
        if (!prev || label.length > prev.label.length) byHref.set(href, { href, label });
    }
    return Array.from(byHref.values());
}

function renderNavigationFromDefinition() {
    const primary = document.getElementById('navPrimaryLinks');
    const grid = document.getElementById('navMoreGrid');
    if (!primary || !grid) return;

    const topItems = filterNavigationItemsByExistingTargets(NAVIGATION_DEFINITION.top);
    primary.innerHTML = topItems
        .map((x, i) => {
            const active = i === 0 ? ' active' : '';
            return `<a href="${escapeHtml(x.href)}" class="nav-link nav-chip${active}" data-nav="1" data-nav-top="1">${escapeHtml(x.label)}</a>`;
        })
        .join('');

    const groupsHtml = NAVIGATION_DEFINITION.groups
        .map(g => {
            const items = filterNavigationItemsByExistingTargets(g.items);
            if (!items.length) return '';
            const itemsHtml = items
                .map(x => `<a href="${escapeHtml(x.href)}" class="nav-link nav-chip" data-nav="1" role="menuitem">${escapeHtml(x.label)}</a>`)
                .join('');
            return `<div class="nav-more__group"><div class="nav-more__title">${escapeHtml(g.title)}</div>${itemsHtml}</div>`;
        })
        .join('');

    grid.innerHTML = groupsHtml;
}

function setupAssetSwitchNav() {
    const sel = document.getElementById('assetSelect');
    if (!sel) return;
    const mod = (typeof window !== 'undefined' && window.MercadoBlocks && window.MercadoBlocks.assetSwitchNav)
        ? window.MercadoBlocks.assetSwitchNav
        : null;
    if (mod && typeof mod.setup === 'function') {
        try {
            mod.setup();
            return;
        } catch {
        }
    }
    const prodRoot = 'https://szeskoskiinvestimentos-art.github.io/edi-openinterest-stranger/';
    const prodUnified = prodRoot + 'dashboard_unificado/';
    const prodMercado = prodRoot + 'Cotacoes/dashboard/MERCADO/';
    function isProdHost() {
        const host = location.hostname || '';
        return host.indexOf('github.io') !== -1 || host.indexOf('sites.google.com') !== -1;
    }
    function toUrl(pathOrUrl) {
        try {
            return new URL(pathOrUrl, location.href).toString();
        } catch {
            return String(pathOrUrl || location.href);
        }
    }
    function targetFor(val) {
        if (val === 'MERCADO') return isProdHost() ? prodMercado : location.href;
        if (val === 'CORR') return isProdHost() ? prodUnified + 'correlation/' : toUrl('../../../dashboard_unificado/correlation/index.html');
        if (val === 'WDO') return isProdHost() ? prodUnified + 'WDO/' : toUrl('../../../dashboard_unificado/WDO/index.html');
        if (val === 'WIN') return isProdHost() ? prodUnified + 'WIN/' : toUrl('../../../dashboard_unificado/WIN/index.html');
        return location.href;
    }
    function go(url) {
        try {
            window.top.location.href = url;
        } catch {
            location.href = url;
        }
    }
    sel.addEventListener('change', function (e) {
        go(targetFor(e.target.value));
    });
}

function setupQuickNavDrawer() {
    const mod = (typeof window !== 'undefined' && window.MercadoBlocks && window.MercadoBlocks.quickNavDrawer)
        ? window.MercadoBlocks.quickNavDrawer
        : null;
    if (mod && typeof mod.setup === 'function') {
        try {
            mod.setup({
                deps: {
                    filterNavigationItemsByExistingTargets,
                    getNavigationItemsFlat,
                },
            });
            return;
        } catch {
            return;
        }
    }
}

function setupNavMorePanel() {
    const mod = (typeof window !== 'undefined' && window.MercadoBlocks && window.MercadoBlocks.navMorePanel)
        ? window.MercadoBlocks.navMorePanel
        : null;
    if (mod && typeof mod.setup === 'function') {
        try {
            mod.setup();
        } catch {
        }
    }
}

function setupInvestingCalendarWidgetLazyLoad() {
    const mod = (typeof window !== 'undefined' && window.MercadoBlocks && window.MercadoBlocks.investingCalendarWidget)
        ? window.MercadoBlocks.investingCalendarWidget
        : null;
    if (mod && typeof mod.setup === 'function') {
        try {
            mod.setup();
        } catch {
        }
    }
}

function renderAlerts(data) {
    const mod = (typeof window !== 'undefined' && window.MercadoBlocks && window.MercadoBlocks.alerts) ? window.MercadoBlocks.alerts : null;
    const list = document.getElementById('alertsList');
    if (!list) return;

    if (mod && typeof mod.render === 'function') {
        try {
            mod.render({
                data,
                deps: {
                    ...buildCommonBlockDeps(),
                },
            });
            return;
        } catch {
            list.innerHTML = fallbackCard('Alertas', 'Falha ao renderizar o mÃ³dulo.');
            return;
        }
    }

    const threshold = Math.abs(state.threshold);
    const hits = (data.assets || [])
        .map(a => {
            const last = getLastPoint(data, a.symbol);
            return { a, last, pct: pointPct(last) };
        })
        .filter(x => typeof x.pct === 'number' && Number.isFinite(x.pct))
        .filter(x => Math.abs(x.pct) >= threshold)
        .sort((x, y) => Math.abs(y.pct) - Math.abs(x.pct))
        .slice(0, 12);

    if (!hits.length) {
        list.innerHTML = '<p style="opacity:.8">Nenhum alerta no momento.</p>';
        return;
    }

    const html = hits
        .map(x => {
            const pct = x.pct || 0;
            const badge = toneBadgeHtml(pct, formatPercent(pct), { maxAbs: 5 });
            return `
                <div style="display:flex;justify-content:space-between;gap:10px;padding:10px 12px;border:1px solid rgba(255,255,255,.12);border-radius:8px;margin-bottom:10px;background:rgba(0,0,0,.35);">
                    <div style="min-width:0;">
                        <div style="font-weight:800;letter-spacing:1px;">${x.a.symbol} <span style="opacity:.8;font-weight:600;">(${x.a.category})</span></div>
                        <div style="opacity:.85;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${x.a.name}</div>
                    </div>
                    <div style="text-align:right;min-width:130px;">
                        <div style="font-weight:900;">${badge}</div>
                        <div style="opacity:.85;font-family:'Share Tech Mono',monospace;">${formatNumber(x.last.price)}</div>
                    </div>
                </div>
            `;
        })
        .join('');

    list.innerHTML = html;

    const lastNotifiedKey = 'mercado_alerts_last_notified';
    const key = `${(data.meta && data.meta.generatedAt) || ''}:${threshold}:${hits.map(h => h.a.symbol).join(',')}`;
    const prev = localStorage.getItem(lastNotifiedKey);
    if (prev !== key && 'Notification' in window && Notification.permission === 'granted') {
        const top = hits[0];
        const pct = top.pct || 0;
        new Notification('Alerta de Fluxo (MVP)', {
            body: `${top.a.symbol} ${formatPercent(pct)} • ${top.a.category}`,
        });
        localStorage.setItem(lastNotifiedKey, key);
    } else {
        localStorage.setItem(lastNotifiedKey, key);
    }
}

function adaptSplitLayouts() {
    const mod = (typeof window !== 'undefined' && window.MercadoBlocks && window.MercadoBlocks.splitLayoutAdapter)
        ? window.MercadoBlocks.splitLayoutAdapter
        : null;
    if (mod && typeof mod.adapt === 'function') {
        try {
            mod.adapt();
        } catch {
        }
    }
}

function scheduleAdaptSplitLayouts() {
    const mod = (typeof window !== 'undefined' && window.MercadoBlocks && window.MercadoBlocks.splitLayoutAdapter)
        ? window.MercadoBlocks.splitLayoutAdapter
        : null;
    if (mod && typeof mod.schedule === 'function') {
        try {
            mod.schedule();
        } catch {
        }
    }
}

window.addEventListener('resize', scheduleAdaptSplitLayouts);

async function boot() {
    const mod = (typeof window !== 'undefined' && window.MercadoBlocks && window.MercadoBlocks.boot)
        ? window.MercadoBlocks.boot
        : null;
    if (mod && typeof mod.run === 'function') {
        try {
            await mod.run({
                deps: {
                    renderNavigationFromDefinition,
                    setupNav,
                    setupAssetSwitchNav,
                    setupQuickNavDrawer,
                    setupNavMorePanel,
                    setupInvestingCalendarWidgetLazyLoad,
                    renderOperationalBriefing,
                    renderBtcOperationalBriefing,
                    renderHk50OperationalBriefing,
                    renderUsEquitiesOperationalBriefing,
                    renderCommoditiesOperationalBriefing,
                    getData,
                    loadScriptFresh,
                    resetAgendaAutoCache: () => { agendaAutoCache = null; },
                    renderAll,
                    setDataStatus,
                    adaptSplitLayouts,
                    loadOptionsGammaSummary,
                    loadFinancialJuice,
                    renderFinancialJuice,
                    loadWebNewsModule,
                    loadFocusSummary,
                    loadForeignFlow,
                    triggerUpdaterAndReload,
                    renderFavorites,
                    requestAutoRefreshPage,
                },
            });
            return;
        } catch {
        }
    }

    try { renderNavigationFromDefinition(); } catch { }
    try { setupNav(); } catch { }
    try { setupAssetSwitchNav(); } catch { }
    try { setupQuickNavDrawer(); } catch { }
    try { setupNavMorePanel(); } catch { }
    try { setupInvestingCalendarWidgetLazyLoad(); } catch { }
    try {
        const data = getData();
        if (data) renderAll(data);
    } catch {
    }
}

boot();
