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
    const mod = (typeof window !== 'undefined' && window.MercadoBlocks && window.MercadoBlocks.topMovers) ? window.MercadoBlocks.topMovers : null;
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
    const mod = (typeof window !== 'undefined' && window.MercadoBlocks && window.MercadoBlocks.btcBriefing) ? window.MercadoBlocks.btcBriefing : null;
    if (mod && typeof mod.render === 'function') {
        try {
            mod.render({
                el,
                deps: buildOperationalPulseBriefingDeps({ computeBtcPulseNow }),
            });
            return;
        } catch {
            el.innerHTML = fallbackCard('BTC', 'Falha ao renderizar o mÃ³dulo.');
            return;
        }
    }
    el.innerHTML = fallbackCard('BTC', 'MÃ³dulo indisponÃ­vel.');
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
    const mod = (typeof window !== 'undefined' && window.MercadoBlocks && window.MercadoBlocks.commoditiesBriefing) ? window.MercadoBlocks.commoditiesBriefing : null;
    if (mod && typeof mod.render === 'function') {
        try {
            mod.render({
                el,
                deps: buildOperationalPulseBriefingDeps({ computeCommoditiesPulseNow }),
            });
            return;
        } catch {
            el.innerHTML = fallbackCard('Commodities', 'Falha ao renderizar o mÃ³dulo.');
            return;
        }
    }
    el.innerHTML = fallbackCard('Commodities', 'MÃ³dulo indisponÃ­vel.');
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
    el.innerHTML = fallbackCard('HK50', 'MÃ³dulo indisponÃ­vel.');
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
    const mod = (typeof window !== 'undefined' && window.MercadoBlocks && window.MercadoBlocks.assetsCatalog) ? window.MercadoBlocks.assetsCatalog : null;
    if (mod && typeof mod.render === 'function') {
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
    if (ok) {
        operationalInputs.webNews = payload;
        try { renderOperationalBriefing(); } catch { }
        try { renderBtcOperationalBriefing(); } catch { }
        try { renderHk50OperationalBriefing(); } catch { }
        try { renderUsEquitiesOperationalBriefing(); } catch { }
        try { renderCommoditiesOperationalBriefing(); } catch { }
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
    }

    el.innerHTML = fallbackCard('Curva ZQ', 'MÃ³dulo indisponÃ­vel (nÃ£o carregado).');
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
    }

    el.innerHTML = fallbackCard('Treasuries (futuros)', 'MÃ³dulo indisponÃ­vel (nÃ£o carregado).');
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

    const mod = (typeof window !== 'undefined' && window.MercadoBlocks && window.MercadoBlocks.operationalBriefing)
        ? window.MercadoBlocks.operationalBriefing
        : null;

    if (mod && typeof mod.render === 'function') {
        try {
            mod.render({
                data: getData(),
                el,
                deps: buildOperationalBriefingDeps(),
            });
            return;
        } catch {
            el.innerHTML = fallbackCard('Roteiro do momento', 'Falha ao renderizar o mÃ³dulo.');
            return;
        }
    }

    el.innerHTML = fallbackCard('Roteiro do momento', 'MÃ³dulo indisponÃ­vel (nÃ£o carregado).');
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
    const mod = (typeof window !== 'undefined' && window.MercadoBlocks && window.MercadoBlocks.fxCarry) ? window.MercadoBlocks.fxCarry : null;
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

    const mod = (typeof window !== 'undefined' && window.MercadoBlocks && window.MercadoBlocks.globalTicker)
        ? window.MercadoBlocks.globalTicker
        : null;
    if (mod && typeof mod.render === 'function') {
        try {
            mod.render({
                data,
                el,
                deps: {
                    resolveTickerSymbol,
                    formatTickerPrice,
                    ...buildCommonBlockDeps(),
                },
            });
            return;
        } catch {
            el.innerHTML = fallbackCard('Ticker Global', 'Falha ao renderizar o mÃ³dulo.');
            return;
        }
    }
    el.innerHTML = fallbackCard('Ticker Global', 'MÃ³dulo indisponÃ­vel (nÃ£o carregado).');
}

function renderOverview(data) {
    const mod = (typeof window !== 'undefined' && window.MercadoBlocks && window.MercadoBlocks.overview)
        ? window.MercadoBlocks.overview
        : null;
    if (mod && typeof mod.render === 'function') {
        try {
            mod.render({
                data,
                deps: {
                    setMetric,
                    setMetricMultiline,
                    setHtml,
                    getLastPoint,
                    pointPct,
                    formatPercent,
                    formatNumber,
                    toneBadgeHtml,
                    toneBadgeHtmlFromTone,
                    computeFlowScore,
                    computeCategoryAverages,
                    renderGlobalTicker,
                    renderTopMovers,
                    safeRender: (typeof window !== 'undefined' && window.MercadoUtils && typeof window.MercadoUtils.safeRender === 'function')
                        ? window.MercadoUtils.safeRender
                        : null,
                    renderBarChart: (id, labels, values, title) => {
                        if (window.MercadoCharts && typeof window.MercadoCharts.renderBarChart === 'function') {
                            window.MercadoCharts.renderBarChart(id, labels, values, title);
                        }
                    },
                },
            });
            return;
        } catch {
            const c = document.getElementById('overviewChart');
            const host = c && c.parentElement ? c.parentElement : null;
            if (host) host.innerHTML = fallbackCard('VisÃ£o Geral', 'Falha ao renderizar o mÃ³dulo.');
            return;
        }
    }
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

    const mod = (typeof window !== 'undefined' && window.MercadoBlocks && window.MercadoBlocks.brazilExportBasket)
        ? window.MercadoBlocks.brazilExportBasket
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
            el.innerHTML = fallbackCard('Export Basket', 'Falha ao renderizar o mÃ³dulo.');
            return;
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
            el.innerHTML = fallbackCard('Panorama', 'Falha ao renderizar o mÃ³dulo.');
            return;
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
    const mod = (typeof window !== 'undefined' && window.MercadoBlocks && window.MercadoBlocks.navigationDefinition)
        ? window.MercadoBlocks.navigationDefinition
        : null;
    if (mod && typeof mod.render === 'function') {
        try {
            mod.render({
                deps: {
                    NAVIGATION_DEFINITION,
                    filterNavigationItemsByExistingTargets,
                    escapeHtml,
                },
            });
        } catch {
        }
    }
}

function setupAssetSwitchNav() {
    const mod = (typeof window !== 'undefined' && window.MercadoBlocks && window.MercadoBlocks.assetSwitchNav)
        ? window.MercadoBlocks.assetSwitchNav
        : null;
    if (mod && typeof mod.setup === 'function') {
        try {
            mod.setup();
        } catch {
        }
    }
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

    list.innerHTML = fallbackCard('Alertas', 'MÃ³dulo indisponÃ­vel (nÃ£o carregado).');
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
