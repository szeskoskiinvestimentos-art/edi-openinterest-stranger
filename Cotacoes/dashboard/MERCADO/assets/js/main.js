function formatNumber(val, digits = 4) {
    if (val === null || val === undefined || Number.isNaN(val)) return '—';
    return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: digits }).format(val);
}

function formatPercent(val, digits = 2) {
    if (val === null || val === undefined || Number.isNaN(val)) return '—';
    const sign = val > 0 ? '+' : '';
    return `${sign}${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: digits }).format(val)}%`;
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
            const ap = a.last && typeof a.last.changePct === 'number' ? a.last.changePct : -Infinity;
            const bp = b.last && typeof b.last.changePct === 'number' ? b.last.changePct : -Infinity;
            return bp - ap;
        });
}

function assetIcon(row) {
    const cat = String(row && row.category ? row.category : '').toLowerCase();
    const name = String(row && row.name ? row.name : '').toLowerCase();
    const sym = String(row && row.symbol ? row.symbol : '').toLowerCase();
    const tags = Array.isArray(row && row.tags) ? row.tags.map(t => String(t).toLowerCase()) : [];

    const flagFromCurrency = ccy => {
        const c = String(ccy || '').toUpperCase().trim();
        if (!c) return '';
        if (c === 'USD') return '🇺🇸';
        if (c === 'BRL') return '🇧🇷';
        if (c === 'EUR') return '🇪🇺';
        if (c === 'GBP') return '🇬🇧';
        if (c === 'JPY') return '🇯🇵';
        if (c === 'CHF') return '🇨🇭';
        if (c === 'AUD') return '🇦🇺';
        if (c === 'NZD') return '🇳🇿';
        if (c === 'CAD') return '🇨🇦';
        if (c === 'CNY' || c === 'CNH') return '🇨🇳';
        if (c === 'MXN') return '🇲🇽';
        if (c === 'ZAR') return '🇿🇦';
        if (c === 'TRY') return '🇹🇷';
        if (c === 'KRW') return '🇰🇷';
        if (c === 'INR') return '🇮🇳';
        if (c === 'NOK') return '🇳🇴';
        if (c === 'SEK') return '🇸🇪';
        if (c === 'DKK') return '🇩🇰';
        return '';
    };

    const flagFromIso2 = iso2 => {
        const c = String(iso2 || '').toUpperCase().trim();
        if (!c) return '';
        if (c === 'US') return '🇺🇸';
        if (c === 'BR') return '🇧🇷';
        if (c === 'CN') return '🇨🇳';
        if (c === 'JP') return '🇯🇵';
        if (c === 'MX') return '🇲🇽';
        if (c === 'GB') return '🇬🇧';
        if (c === 'DE') return '🇩🇪';
        if (c === 'FR') return '🇫🇷';
        if (c === 'IT') return '🇮🇹';
        if (c === 'ES') return '🇪🇸';
        if (c === 'CA') return '🇨🇦';
        if (c === 'AU') return '🇦🇺';
        if (c === 'NZ') return '🇳🇿';
        if (c === 'CH') return '🇨🇭';
        if (c === 'SE') return '🇸🇪';
        if (c === 'NO') return '🇳🇴';
        if (c === 'DK') return '🇩🇰';
        if (c === 'TR') return '🇹🇷';
        if (c === 'AR') return '🇦🇷';
        if (c === 'CL') return '🇨🇱';
        if (c === 'CO') return '🇨🇴';
        if (c === 'PE') return '🇵🇪';
        if (c === 'ZA') return '🇿🇦';
        if (c === 'RU') return '🇷🇺';
        if (c === 'IN') return '🇮🇳';
        if (c === 'KR') return '🇰🇷';
        if (c === 'ID') return '🇮🇩';
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
        const n = String(row && row.name ? row.name : '');
        const ex = String(row && row.exchange ? row.exchange : '');

        const cdsIso2 = s.match(/^([A-Z]{2})GV/i);
        if (cdsIso2) {
            const f = flagFromIso2(cdsIso2[1]);
            if (f) return f;
        }

        if (s.endsWith('.SA') || /\bbrasil\b|\bbrazil\b/i.test(n) || /\bB3\b/i.test(ex)) return '🇧🇷';
        if (/^US\d+(YT|MT)=RR$/i.test(s) || /\bUnited States\b|\bEUA\b/i.test(n)) return '🇺🇸';
        if (/^BR\d+(YT|MT)=RR$/i.test(s) || /\bBrazil\b|\bBrasil\b/i.test(n)) return '🇧🇷';
        if (/\bChina\b|\bCNY\b|\bCNH\b/i.test(n) || /\bCSI 300\b/i.test(n)) return '🇨🇳';
        if (/\bJapan\b|\bJPY\b/i.test(n)) return '🇯🇵';
        if (/\bMexico\b|\bMéxico\b|\bMXN\b/i.test(n)) return '🇲🇽';
        if (/\bTurkey\b|\bTurquia\b|\bTRY\b/i.test(n)) return '🇹🇷';
        if (/\bRussia\b|\bRússia\b|\bRUB\b/i.test(n)) return '🇷🇺';
        if (/\bEurope\b|\bEuro\b/i.test(n)) return '🇪🇺';
        if (/\bUK\b|\bBritain\b|\bGBP\b/i.test(n)) return '🇬🇧';
        return '';
    };

    const risk = tags.includes('risk_on') ? '🟢' : tags.includes('risk_off') ? '🔴' : '';

    if (name.includes('brent') || name.includes('wti') || name.includes('crude') || sym.includes('wti') || sym.includes('brent')) return `🛢️${risk ? ` ${risk}` : ''}`;
    if (name.includes('gold') || name.includes('silver') || name.includes('copper') || cat.includes('metals')) return `🪙${risk ? ` ${risk}` : ''}`;
    if (cat.includes('crypto') || name.includes('bitcoin') || name.includes('ethereum') || sym.includes('btc') || sym.includes('eth')) return `₿${risk ? ` ${risk}` : ''}`;
    if (cat.includes('volatility') || name.includes('vix') || name.includes('volatility')) return `🌡️${risk ? ` ${risk}` : ''}`;
    if (cat.includes('energy') || cat.includes('agriculture') || cat.includes('commodities')) return `🌾${risk ? ` ${risk}` : ''}`;
    if (cat.includes('rates') || name.includes('yield') || name.includes('bond') || sym.includes('=rr')) {
        const f = countryHint();
        return `${f || '📈'}${risk ? ` ${risk}` : ''}`;
    }
    if (cat.includes('credit') || name.includes('cds') || tags.includes('credit')) {
        const f = countryHint();
        return `${f || '🧾'}${risk ? ` ${risk}` : ''}`;
    }
    if (cat.includes('fx') || name.includes('usd/') || name.includes('/usd') || name.includes('dollar') || name.includes('eur/') || name.includes('/eur')) {
        const flags = fxPairFlags(row && row.symbol ? row.symbol : row && row.name ? row.name : '');
        return `${flags || '💱'}${risk ? ` ${risk}` : ''}`;
    }
    if (cat.includes('emerging')) return `🌍${risk ? ` ${risk}` : ''}`;

    const f = countryHint();
    return `${f || '🔹'}${risk ? ` ${risk}` : ''}`;
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
    'BBD',
    'BOLSY.PK',
    'BSBR.K',
    'EMBJ.K',
    'GGB',
    'LND',
    'PBR',
    'PBRA',
    'SID',
    'SUZ',
    'UGP',
    'VALE.K',
    'WEGZY.PK',
    'BDORY.PK',
    'ITUB.K',
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
        pct: { label: 'Variação', align: 'right', minWidth: 110, numeric: true },
        trend: { label: 'Tendência', align: 'right', minWidth: 110, numeric: true },
        symbol: { label: 'Símbolo', align: 'left', minWidth: 140, numeric: false },
        time: { label: 'Atualização', align: 'right', minWidth: 170, numeric: true },
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
        if (key === 'pct') return r.last && typeof r.last.changePct === 'number' ? r.last.changePct : -Infinity;
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
        const arrow = sortKey === key ? (sortDir === 'asc' ? ' ▲' : ' ▼') : '';
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
                const change = r.last && typeof r.last.changePct === 'number' ? r.last.changePct : null;
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

                            const pct = r.last && typeof r.last.changePct === 'number' ? r.last.changePct : null;
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
        const changes = rows.map(r => r.last.changePct).filter(v => typeof v === 'number');
        const avg = changes.length ? changes.reduce((a, b) => a + b, 0) / changes.length : 0;
        return { key: g.key, label: g.label, avg, count: rows.length };
    });
}

function computeFlowScore(data) {
    const pctOf = (matcherOrAlias, { invert = false } = {}) => {
        const sym = typeof matcherOrAlias === 'string' ? findAliasSymbol(data, matcherOrAlias) : findAssetSymbol(data, matcherOrAlias);
        if (!sym) return null;
        const last = getLastPoint(data, sym);
        const v = last && typeof last.changePct === 'number' ? last.changePct : null;
        if (v === null || v === undefined || !Number.isFinite(v)) return null;
        return invert ? -v : v;
    };

    const cap = (v, maxAbs) => {
        const x = typeof v === 'number' && Number.isFinite(v) ? v : 0;
        const m = typeof maxAbs === 'number' && Number.isFinite(maxAbs) && maxAbs > 0 ? maxAbs : 2;
        return Math.max(-m, Math.min(m, x));
    };

    const parts = [
        { k: 'SPX', w: 0.18, v: pctOf('SPX') },
        { k: 'NQ', w: 0.12, v: pctOf('NDX') },
        { k: 'EEM', w: 0.10, v: pctOf(/^EEM$/i) },
        { k: 'EWZ', w: 0.08, v: pctOf(/^EWZ$/i) },
        { k: 'CHINA', w: 0.06, v: pctOf('CHINA') },
        { k: 'VIX', w: 0.09, v: pctOf('VIX', { invert: true }) },
        { k: 'DXY', w: 0.08, v: pctOf('DXY', { invert: true }) },
        { k: 'US10Y', w: 0.06, v: pctOf('US10Y', { invert: true }) },
        { k: 'CDS BR', w: 0.05, v: pctOf(/(^BRGV5YUSAC=R$|\bCDS\b.*\bBrasil\b|\bBrasil\b.*\bCDS\b)/i, { invert: true }) },
        { k: 'Brent/WTI', w: 0.08, v: pctOf('OIL') },
        { k: 'Minério', w: 0.07, v: pctOf('IRON') },
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

    const rowsAll = (data.assets || [])
        .map(a => ({ a, last: getLastPoint(data, a.symbol) }))
        .filter(x => x.last && typeof x.last.changePct === 'number');

    const pickExtremes = list => {
        if (!list.length) return { up: null, down: null };
        let up = list[0];
        let down = list[0];
        for (const x of list) {
            const v = x.last.changePct || 0;
            if ((up.last.changePct || 0) < v) up = x;
            if ((down.last.changePct || 0) > v) down = x;
        }
        return { up, down };
    };

    const groups = [
        { key: 'commodities', label: 'Commodities', categories: ['commodities', 'energy', 'agriculture'], target: 'all-assets', tableKey: 'all' },
        { key: 'metals', label: 'Metais', categories: ['metals'], target: 'all-assets', tableKey: 'all' },
        { key: 'fx', label: 'FX', categories: ['fx_g10', 'fx_emerging'], target: 'all-assets', tableKey: 'all' },
        { key: 'emerging', label: 'Emergentes', categories: ['emerging'], target: 'all-assets', tableKey: 'all' },
        { key: 'rates', label: 'Juros', categories: ['rates'], target: 'all-assets', tableKey: 'all' },
        { key: 'vol', label: 'Volatilidade', categories: ['volatility'], target: 'all-assets', tableKey: 'all' },
        { key: 'br', label: 'Brasil', predicate: isBrazilRelated, target: 'brazil-market', tableKey: 'br' },
    ];

    const cards = groups
        .map(g => {
            const list = g.predicate
                ? rowsAll.filter(x => g.predicate({ ...x.a, last: x.last }))
                : rowsAll.filter(x => g.categories.includes(x.a.category));
            const { up, down } = pickExtremes(list);
            if (!up || !down) return null;

            const upSym = symbolKey(up.a.symbol);
            const downSym = symbolKey(down.a.symbol);

            const line = (x, dir) => {
                const pct = x.last.changePct || 0;
                const arrow = dir === 'up' ? '▲' : '▼';
                const abs = Math.abs(pct);
                const a = Math.max(0.18, Math.min(0.85, abs / 5));
                const tone = pct > 0 ? 'tm-item--pos' : pct < 0 ? 'tm-item--neg' : 'tm-item--neu';
                const badge = toneBadgeHtml(pct, formatPercent(pct), { maxAbs: 5 });
                return `
                    <div class="tm-item ${tone}" data-tm="${escapeHtml(g.tableKey)}" data-target="${escapeHtml(g.target)}" data-symbol="${escapeHtml(x.a.symbol)}" style="--tm-a:${String(a)};">
                        <div style="min-width:0;">
                            <div style="font-weight:900;letter-spacing:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${arrow} ${escapeHtml(symbolKey(x.a.symbol) || x.a.symbol)}</div>
                            <div style="opacity:.82;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(x.a.name || '')}</div>
                        </div>
                        <div style="text-align:right;min-width:90px;font-weight:900;align-self:center;">${badge}</div>
                    </div>
                `;
            };

            return `
                <div class="tm-card">
                    <div class="tm-card__title">${escapeHtml(g.label)}</div>
                    <div class="tm-card__list">
                        ${line(up, 'up')}
                        ${line(down, 'down')}
                    </div>
                </div>
            `;
        })
        .filter(Boolean)
        .join('');

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
        audusd: findAssetSymbol(data, /^AUD\/USD\b/i),
        nzdusd: findAssetSymbol(data, /^NZD\/USD\b/i),
        usdcad: findAssetSymbol(data, /^USD\/CAD\b/i),
        usdrub: findAssetSymbol(data, /^USD\/RUB\b/i),
        usdjpy: findAssetSymbol(data, /^USD\/JPY\b/i),
        usdchf: findAssetSymbol(data, /^USD\/CHF\b/i),
        usdsek: findAssetSymbol(data, /^USD\/SEK\b/i),
        dxy: findAssetSymbol(data, /(^\.DXY$|\bDXY\b|US Dollar Index)/i),
        brent: findAssetSymbol(data, /\bBrent\b/i),
        wti: findAssetSymbol(data, /\bWTI\b/i),
        usdbbrl: findAssetSymbol(data, /^USD\/BRL\b/i),
        usdmxn: findAssetSymbol(data, /^USD\/MXN\b/i),
        usdzar: findAssetSymbol(data, /^USD\/ZAR\b/i),
        usdclp: findAssetSymbol(data, /^USD\/CLP\b/i),
        usdtry: findAssetSymbol(data, /^USD\/TRY\b/i),
    };

    const betaPosItems = [
        { label: 'AUD/USD', symbol: sentinelSymbols.audusd, sign: +1 },
        { label: 'NZD/USD', symbol: sentinelSymbols.nzdusd, sign: +1 },
        { label: 'USD/CAD', symbol: sentinelSymbols.usdcad, sign: -1 },
        { label: 'USD/RUB', symbol: sentinelSymbols.usdrub, sign: -1 },
    ].map(x => ({ ...x, raw: getChangePct(data, x.symbol) }))
        .map(x => ({ ...x, val: x.raw === null ? null : x.sign * x.raw }));

    const betaNegItems = [
        { label: 'USD/JPY', symbol: sentinelSymbols.usdjpy, sign: -1 },
        { label: 'USD/CHF', symbol: sentinelSymbols.usdchf, sign: -1 },
        { label: 'USD/SEK', symbol: sentinelSymbols.usdsek, sign: -1 },
        { label: 'DXY', symbol: sentinelSymbols.dxy, sign: +1 },
    ].map(x => ({ ...x, raw: getChangePct(data, x.symbol) }))
        .map(x => ({ ...x, val: x.raw === null ? null : x.sign * x.raw }));

    const betaPosScore = avg(betaPosItems.map(x => x.val));
    const betaNegScore = (() => {
        const pairs = betaNegItems.filter(x => x.val !== null).map(x => ({ v: x.val, w: (typeof x.weight === 'number' ? x.weight : 1) }));
        const wsum = pairs.reduce((a, b) => a + b.w, 0);
        const s = pairs.reduce((a, b) => a + b.v * b.w, 0);
        if (!wsum) return null;
        let score = s / wsum;
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
    const oilScore = [wti, brent].filter(v => typeof v === 'number' && Number.isFinite(v)).length ? Math.max(wti || -Infinity, brent || -Infinity) : null;

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

    const assets = data.assets || [];
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
        { k: 'Brent/WTI', a: 'OIL' },
        { k: 'FXI', a: 'FXI' },
        { k: 'CSI300', a: 'CSI300' },
        { k: 'Minério', a: 'IRON' },
        { k: 'Soja', a: 'SOY' },
        { k: 'Cobre', a: 'COPPER' },
        { k: 'BR10Y', r: /^BR10YT=RR$/i },
    ];

    const criticalFound = criticalMatchers.filter(m => (m.a ? findAliasSymbol(data, m.a) : findAssetSymbol(data, m.r))).length;
    const criticalRatio = criticalMatchers.length ? criticalFound / criticalMatchers.length : 0;

    let convictionScore = 0.5 * coverageRatio + 0.3 * freshnessRatio + 0.2 * criticalRatio;
    const divergences = [];
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

    const hasFxi = !!findAliasSymbol(data, 'FXI');
    const hasCsi = !!findAliasSymbol(data, 'CSI300');
    const hasChinaCore = hasFxi || hasCsi;
    const hasIron = !!findAliasSymbol(data, 'IRON');
    const hasSoy = !!findAliasSymbol(data, 'SOY');
    const hasCopper = !!findAliasSymbol(data, 'COPPER');

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
        dxy: findAliasSymbol(data, 'DXY') || findAssetSymbol(data, /(^\.DXY$|\bDXY\b|US Dollar Index)/i),
        oil: findAliasSymbol(data, 'OIL') || findAssetSymbol(data, /\bBrent\b|\bWTI\b/i),
        iron: findAssetSymbol(data, /^DCE_I0$/i) || findAliasSymbol(data, 'IRON'),
        copper: findAliasSymbol(data, 'COPPER'),
    };

    const drivers = [];
    drivers.push({ k: 'Risco (tags)', v: regimeScore, fmt: x => formatNumber(x, 2), tone: regimeScore > 0.35 ? 'positive' : regimeScore < -0.35 ? 'negative' : 'neutral' });
    drivers.push({ k: 'Beta Δ', v: betaDelta, fmt: x => formatNumber(x, 3), tone: betaDelta > 0.25 ? 'positive' : betaDelta < -0.25 ? 'negative' : 'neutral' });
    if (sentinelSymbols.dxy) {
        const dxy = getChangePct(data, sentinelSymbols.dxy);
        drivers.push({ k: 'DXY', v: dxy, fmt: x => formatPercent(x, 2), tone: dxy === null ? 'neutral' : dxy > 0 ? 'positive' : dxy < 0 ? 'negative' : 'neutral' });
    }
    if (typeof oilScore === 'number') drivers.push({ k: 'Petróleo', v: oilScore, fmt: x => formatPercent(x, 2), tone: oilScore > 0 ? 'positive' : oilScore < 0 ? 'negative' : 'neutral' });
    if (sentinelSymbols.usdbbrl) {
        const brl = getChangePct(data, sentinelSymbols.usdbbrl);
        drivers.push({ k: 'USD/BRL', v: brl, fmt: x => formatPercent(x, 2), tone: brl === null ? 'neutral' : brl > 0 ? 'positive' : brl < 0 ? 'negative' : 'neutral' });
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
                    <div style="opacity:.80;">Chaves: ${escapeHtml([convictionAssets.usdbrl, convictionAssets.dxy, convictionAssets.iron, convictionAssets.copper, convictionAssets.oil].filter(Boolean).join(' • ') || '—')}</div>
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
        const aliasSym = k => findAliasSymbol(data, k);
        const pctOfAlias = k => {
            const s = aliasSym(k);
            return s ? getChangePct(data, s) : null;
        };
        const dxyPct = pctOfAlias('DXY');
        const oilPct = pctOfAlias('OIL');
        const ironPct = pctOfAlias('IRON');
        const soyPct = pctOfAlias('SOY');
        const copperPct = pctOfAlias('COPPER');
        const us10yPct = pctOfAlias('US10Y');
        const br10yPct = (() => {
            const s = findAssetSymbol(data, /^BR10YT=RR$/i);
            return s ? getChangePct(data, s) : null;
        })();
        const weights = { iron: 0.28, soy: 0.20, oil: 0.18, copper: 0.12 };
        const basketParts = [
            { v: ironPct, w: weights.iron },
            { v: soyPct, w: weights.soy },
            { v: oilPct, w: weights.oil },
            { v: copperPct, w: weights.copper },
        ].filter(x => typeof x.v === 'number' && Number.isFinite(x.v) && typeof x.w === 'number' && x.w > 0);
        const wSum = basketParts.reduce((s, x) => s + x.w, 0);
        const exportScore = wSum > 0 ? basketParts.reduce((s, x) => s + (x.v * x.w), 0) / wSum : null;
        const tipsEtfPct = pctOfAlias('TIPS_ETF');
        operationalInputs.macro = {
            flow: { label: regimeLabel, score: regimeScore },
            betaDelta,
            dxyPct,
            oilPct: typeof oilScore === 'number' ? oilScore : null,
            em: { state: emGateState, pct: typeof emBasketPct === 'number' ? emBasketPct : null },
            exportScore,
            yields: { us10yPct, br10yPct, tipsEtfPct },
        };
    } catch {
    }
    try { renderOperationalBriefing(); } catch { }
    try { renderBtcOperationalBriefing(); } catch { }
    try { renderHk50OperationalBriefing(); } catch { }

    el.innerHTML = html;
}

function renderChinaBrazil(data) {
    const el = document.getElementById('chinaBrazil');
    if (!el) return;

    const sym = {
        fxi: findAliasSymbol(data, 'FXI'),
        csi: findAliasSymbol(data, 'CSI300'),
        hsi: findAssetSymbol(data, /\bHSI\b|Hang Seng|^\.HSI/i),
        mchi: findAssetSymbol(data, /^MCHI$/i),
        ashr: findAssetSymbol(data, /^ASHR$/i),
        kweb: findAssetSymbol(data, /^KWEB$/i),
        iron: findAliasSymbol(data, 'IRON'),
        ironDalian: findAssetSymbol(data, /^DCE_I0$/i),
        soy: findAliasSymbol(data, 'SOY'),
        corn: findAssetSymbol(data, /^ZC$/i),
        coffee: findAssetSymbol(data, /^KC$/i),
        sugar: findAssetSymbol(data, /^SB$/i),
        copper: findAliasSymbol(data, 'COPPER'),
        bci: findAliasSymbol(data, 'BCI'),
        brent: findAliasSymbol(data, 'BRENT'),
        wti: findAliasSymbol(data, 'WTI'),
        ewz: findAssetSymbol(data, /^EWZ$/i),
        bova11: findAssetSymbol(data, /^BOVA11\.SA$/i),
        ibov: findAssetSymbol(data, /(^\.BVSP$|\bIbovespa\b)/i),
        usdbbrl: findAliasSymbol(data, 'USD_BRL'),
    };

    const pick = (label, symbol) => {
        const pct = getChangePct(data, symbol);
        const cls = pct === null ? 'neutral' : pct > 0 ? 'positive' : pct < 0 ? 'negative' : 'neutral';
        const name = symbol ? (data.assets || []).find(a => String(a.symbol) === String(symbol))?.name : '';
        return { label, symbol, pct, cls, name: name || '' };
    };

    const chinaCore = [pick('FXI', sym.fxi), pick('CSI300', sym.csi), pick('HSI', sym.hsi)];
    const chinaExtra = [pick('MCHI', sym.mchi), pick('ASHR', sym.ashr), pick('KWEB', sym.kweb)].filter(x => x.symbol);
    const china = chinaExtra.length ? [...chinaCore, ...chinaExtra] : chinaCore;
    const comm = [
        pick('Minério (TIO/SM58F)', sym.iron),
        pick('Minério Dalian (Sina)', sym.ironDalian),
        pick('Soja (ZS)', sym.soy),
        pick('Milho (ZC)', sym.corn),
        pick('Café (KC)', sym.coffee),
        pick('Açúcar (SB)', sym.sugar),
        pick('Cobre (HG)', sym.copper),
        pick('BCI (ETF commodities)', sym.bci),
        pick('Brent', sym.brent),
        pick('WTI', sym.wti),
    ];
    const br = [pick('USD/BRL', sym.usdbbrl), pick('EWZ', sym.ewz), pick('BOVA11', sym.bova11), pick('IBOV', sym.ibov)];

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
    const chinaAvg = avg([getChangePct(data, sym.fxi), getChangePct(data, sym.csi), getChangePct(data, sym.hsi)]);
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

    const brlPressure = (typeof oilPct === 'number' && oilPct > 0 ? 0.65 * oilPct : 0)
        + (typeof chinaAvg === 'number' && chinaAvg < 0 ? 0.55 * (-chinaAvg) : 0)
        + (typeof usdbbrl === 'number' && usdbbrl > 0 ? 0.35 * usdbbrl : 0);

    const ibovPressure = (typeof oilPct === 'number' && oilPct > 0 ? 0.75 * oilPct : 0)
        + (typeof chinaAvg === 'number' && chinaAvg < 0 ? 0.60 * (-chinaAvg) : 0);

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

    const chinaPcts = [getChangePct(data, sym.fxi), getChangePct(data, sym.csi), getChangePct(data, sym.hsi), getChangePct(data, sym.mchi), getChangePct(data, sym.ashr), getChangePct(data, sym.kweb)]
        .filter(v => typeof v === 'number' && Number.isFinite(v));
    const chinaPos = chinaPcts.filter(v => v > 0.15).length;
    const chinaNeg = chinaPcts.filter(v => v < -0.15).length;
    const chinaCov = chinaPcts.length;
    const chinaScenario = classifyChinaScenario({ avgPct: chinaAvg, pos: chinaPos, neg: chinaNeg, cov: chinaCov });

    const coverageChecks = (() => {
        const hasFxi = !!sym.fxi;
        const hasCsi = !!sym.csi;
        const hasHsi = !!sym.hsi;
        const hasChinaCore = hasFxi || hasCsi;
        const hasIron = !!sym.iron;
        const hasSoy = !!sym.soy;
        const hasOil = !!(sym.brent || sym.wti);
        const hasCopper = !!sym.copper;
        const hasBci = !!sym.bci;
        const missingCritical = [];
        const missingOptional = [];
        if (!hasChinaCore) missingCritical.push('FXI/CSI300');
        if (!hasIron) missingCritical.push('Minério');
        if (!hasSoy) missingCritical.push('Soja');
        if (!hasOil) missingCritical.push('Petróleo (Brent/WTI)');
        if (!hasCopper) missingOptional.push('Cobre (HG)');
        if (!hasBci) missingOptional.push('BCI (ETF commodities)');

        const status = missingCritical.length === 0 ? { tone: 'positive', label: 'OK' } : missingCritical.length === 1 ? { tone: 'neutral', label: 'Parcial' } : { tone: 'negative', label: 'Crítico' };
        const conviction = missingCritical.length === 0 ? { tone: 'positive', label: 'Sem redução' } : { tone: 'negative', label: 'Convicção reduzida' };
        const missingTxt = [...missingCritical, ...missingOptional].filter(Boolean).join(', ');
        const why = missingTxt ? `Faltando: ${missingTxt}` : 'Cobertura adequada para o módulo China↔Brasil.';

        return {
            status,
            conviction,
            why,
            lines: [
                { label: 'FXI ou CSI300 (≥1)', ok: hasChinaCore },
                { label: 'HSI (fallback)', ok: hasHsi },
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

    if (typeof fxi === 'number' && typeof iron === 'number' && fxi > 0.4 && iron < -0.4) divergences.push('China forte sem confirmação em Minério');
    if (typeof csi === 'number' && typeof soy === 'number' && csi < -0.4 && soy > 0.4) divergences.push('Soja forte com China fraca (ver oferta/clima)');
    if (typeof fxi === 'number' && typeof copper === 'number' && fxi > 0.4 && copper < -0.4) divergences.push('China forte sem confirmação em Cobre');
    if (typeof oil === 'number' && typeof usdbbrl === 'number' && oil > 0.7 && usdbbrl > 0.2) divergences.push('Petróleo ajuda, mas USD/BRL não confirma (stress local)');

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
        const fallback = typeof last.changePct === 'number' && Number.isFinite(last.changePct) ? last.changePct : null;
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

        if (typeof last.changePct === 'number' && Number.isFinite(last.changePct) && last.changePct !== -100) {
            const denom = 1 + (last.changePct / 100);
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

    const seriesKeys = Object.keys((data && data.series) || {});
    const diMatcher = /^DI1[FGHJKMNQUVXZ]\d{2}$/i;
    const fmtRate = v => typeof v === 'number' && Number.isFinite(v) ? `${formatNumber(v, 2)}%` : '—';
    const takeGlobal = (label, matcherOrAlias) => {
        const symbol = typeof matcherOrAlias === 'string' ? findAliasSymbol(data, matcherOrAlias) : findAssetSymbol(data, matcherOrAlias);
        const last = getMostRecentPointWithPrice(data, symbol);
        const rate = last && typeof last.price === 'number' ? last.price : null;
        const pct = last && typeof last.changePct === 'number' ? last.changePct : null;
        const cls = pct === null ? 'neutral' : pct > 0 ? 'positive' : pct < 0 ? 'negative' : 'neutral';
        return { label, symbol, rate, pct, cls };
    };

    const gl = [
        takeGlobal('US 2Y', 'US2Y'),
        takeGlobal('US 5Y', /(^US5YT=RR$|\bUnited States 5-Year\b|^US5Y\b)/i),
        takeGlobal('US 10Y', 'US10Y'),
        takeGlobal('US 30Y', 'US30Y'),
        takeGlobal('DE 10Y', /(^DE10YT=RR$|\bGermany 10-Year\b|^DE10Y\b)/i),
        takeGlobal('GB 10Y', /(^GB10YT=RR$|\bUnited Kingdom 10-Year\b|^GB10Y\b)/i),
        takeGlobal('IT 10Y', /(^IT10YT=RR$|\bItaly 10-Year\b|^IT10Y\b)/i),
    ].filter(x => x.symbol);

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

    const diSymbolsFromSeries = seriesKeys.filter(sym => diMatcher.test(sym));
    const diSymbolsFromAssets = (data.assets || [])
        .map(a => String(a && a.symbol ? a.symbol : ''))
        .filter(sym => diMatcher.test(sym));
    const diSymbolsAll = Array.from(new Set([...diSymbolsFromSeries, ...diSymbolsFromAssets]));

    const diList = diSymbolsAll
        .map(symbol => {
            const last = getMostRecentPointWithPrice(data, symbol);
            const rate = last && typeof last.price === 'number' ? last.price : null;
            const chgPct = last && typeof last.changePct === 'number' ? last.changePct : null;
            const cls = chgPct === null ? 'neutral' : chgPct > 0 ? 'positive' : chgPct < 0 ? 'negative' : 'neutral';
            const y = 2000 + Number(String(symbol).slice(-2));
            const m = monthNum(String(symbol)[3]);
            return { label: symbol, symbol, rate, chgPct, cls, year: Number.isFinite(y) ? y : null, month: m };
        })
        .filter(x => x.rate !== null && x.year !== null && x.month !== null)
        .sort((a, b) => (a.year - b.year) || (a.month - b.month));

    const renderGlobalTable = (title, list) => {
        if (!list.length) {
            return `<div style="border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:12px;background:rgba(0,0,0,.18);opacity:.9;">
                <div style="font-weight:900;letter-spacing:1px;margin-bottom:8px;">${escapeHtml(title)}</div>
                <div style="opacity:.85;">Sem yields disponíveis.</div>
            </div>`;
        }
        return `<div style="border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:12px;background:rgba(0,0,0,.18);">
            <div style="font-weight:900;letter-spacing:1px;opacity:.95;margin-bottom:8px;">${escapeHtml(title)}</div>
            ${list
                .map(x => {
                    const txt = x.pct === null ? '—' : formatPercent(x.pct, 2);
                    const pctHtml = x.pct === null ? escapeHtml(txt) : toneBadgeHtmlFromTone(x.cls, x.pct, txt, { maxAbs: 1 });
                    const rateTxt = x.rate === null ? '—' : fmtRate(x.rate);
                    return `<div style="display:flex;justify-content:space-between;gap:10px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06);">
                        <div style="opacity:.9;font-weight:900;letter-spacing:1px;">${escapeHtml(x.label)}</div>
                        <div style="display:flex;gap:14px;align-items:center;">
                            <div style="font-family:'Share Tech Mono',monospace;font-weight:900;opacity:.95;">${escapeHtml(rateTxt)}</div>
                            <div style="font-family:'Share Tech Mono',monospace;font-weight:900;min-width:72px;text-align:right;">${pctHtml}</div>
                        </div>
                    </div>`;
                })
                .join('')}
        </div>`;
    };

    const renderDiTable = (list, { detectedCount, limit, title } = {}) => {
        if (!list.length) {
            const det = typeof detectedCount === 'number' && Number.isFinite(detectedCount) ? detectedCount : 0;
            const msg = det
                ? `DI detectado no histórico (${det} contratos), mas sem preços válidos no momento.`
                : 'Sem DI disponível no histórico.';
            return `<div style="border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:12px;background:rgba(0,0,0,.18);opacity:.9;">
                <div style="font-weight:900;letter-spacing:1px;margin-bottom:8px;">${escapeHtml(title || 'DI (B3)')}</div>
                <div style="opacity:.85;">${escapeHtml(msg)}</div>
            </div>`;
        }
        return `<div style="border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:12px;background:rgba(0,0,0,.18);">
            <div style="font-weight:900;letter-spacing:1px;opacity:.95;margin-bottom:8px;">${escapeHtml(title || 'DI (B3)')}</div>
            ${list
                .slice(0, typeof limit === 'number' && Number.isFinite(limit) ? limit : 18)
                .map(x => {
                    const dTxt = x.chgPct === null ? '—' : `${x.chgPct > 0 ? '+' : ''}${formatNumber(x.chgPct, 2)}%`
                    const dHtml = x.chgPct === null ? escapeHtml(dTxt) : toneBadgeHtml(x.chgPct, dTxt, { maxAbs: 1 });
                    return `<div style="display:flex;justify-content:space-between;gap:10px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06);">
                        <div style="opacity:.9;font-weight:900;letter-spacing:1px;">${escapeHtml(x.label)}</div>
                        <div style="display:flex;gap:14px;align-items:center;">
                            <div style="font-family:'Share Tech Mono',monospace;font-weight:900;opacity:.95;">${escapeHtml(fmtRate(x.rate))}</div>
                            <div style="font-family:'Share Tech Mono',monospace;font-weight:900;min-width:72px;text-align:right;">${dHtml}</div>
                        </div>
                    </div>`;
                })
                .join('')}
        </div>`;
    };

    const bucketAvgRate = list => {
        const vals = list.map(x => x.rate).filter(v => typeof v === 'number' && Number.isFinite(v));
        return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
    };

    const maturityYears = (y, m) => {
        if (!Number.isFinite(y) || !Number.isFinite(m)) return null;
        const now = new Date();
        const t = new Date(y, m - 1, 1);
        const months = (t.getFullYear() - now.getFullYear()) * 12 + (t.getMonth() - now.getMonth());
        if (!Number.isFinite(months)) return null;
        return months / 12;
    };

    const bucketOfYears = yrs => yrs < 2 ? 'Curto' : yrs <= 5 ? 'Médio' : 'Longo';
    const diWithTenor = diList.map(x => ({ ...x, yrs: maturityYears(x.year, x.month) })).filter(x => typeof x.yrs === 'number' && x.yrs > 0);
    const diShort = bucketAvgRate(diWithTenor.filter(x => bucketOfYears(x.yrs) === 'Curto'));
    const diMid = bucketAvgRate(diWithTenor.filter(x => bucketOfYears(x.yrs) === 'Médio'));
    const diLong = bucketAvgRate(diWithTenor.filter(x => bucketOfYears(x.yrs) === 'Longo'));
    const slope = typeof diLong === 'number' && typeof diShort === 'number' ? diLong - diShort : null;
    const shape = slope === null ? 'N/A' : slope > 0.15 ? 'STEEPEN' : slope < -0.15 ? 'FLATTEN' : '≈';

    const diHeads = diList.filter(x => x.month === 1).sort((a, b) => (a.year - b.year));
    const diAnchor = diHeads.find(x => x.symbol === 'DI1F35') || (diHeads.length ? diHeads[diHeads.length - 1] : null);
    const diTopChanges = diList.filter(x => typeof x.chgPct === 'number' && Number.isFinite(x.chgPct)).slice().sort((a, b) => Math.abs(b.chgPct) - Math.abs(a.chgPct)).slice(0, 12);

    const summary = `
        <div style="margin:0 0 14px;border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:12px;background:rgba(0,0,0,.18);">
            <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;">
                <div style="font-weight:900;letter-spacing:1px;opacity:.95;">${escapeHtml(diList.length ? 'DI Buckets' : 'BR Buckets (proxy)')}</div>
                <div style="display:flex;gap:12px;align-items:center;font-family:'Share Tech Mono',monospace;font-weight:900;opacity:.95;">
                    <span>Shape: ${escapeHtml(shape)}</span>
                    ${diAnchor ? `<span>Âncora: ${escapeHtml(diAnchor.symbol)}</span>` : ''}
                </div>
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;margin-top:10px;">
                <div style="border:1px solid rgba(255,255,255,.10);border-radius:10px;padding:10px;background:rgba(0,0,0,.22);">
                    <div style="opacity:.85;font-weight:800;">Curto</div>
                    <div style="font-weight:900;">${escapeHtml(diShort === null ? '—' : fmtRate(diShort))}</div>
                </div>
                <div style="border:1px solid rgba(255,255,255,.10);border-radius:10px;padding:10px;background:rgba(0,0,0,.22);">
                    <div style="opacity:.85;font-weight:800;">Médio</div>
                    <div style="font-weight:900;">${escapeHtml(diMid === null ? '—' : fmtRate(diMid))}</div>
                </div>
                <div style="border:1px solid rgba(255,255,255,.10);border-radius:10px;padding:10px;background:rgba(0,0,0,.22);">
                    <div style="opacity:.85;font-weight:800;">Longo</div>
                    <div style="font-weight:900;">${escapeHtml(diLong === null ? '—' : fmtRate(diLong))}</div>
                </div>
            </div>
            <div style="margin-top:10px;opacity:.86;line-height:1.35;">
                <div style="font-weight:900;letter-spacing:1px;margin-bottom:4px;">Leitura rápida</div>
                <div style="opacity:.9;">
                    <b>STEEPEN</b> (curva abrindo): longos acima do curto. <b>Operacional</b>: tende a piorar condições financeiras → viés mais defensivo (reduz risco, aumenta proteção). Confirme com <b>DXY</b> e <b>yields globais</b>.
                    <br><b>FLATTEN</b> (curva fechando): curto acima do longo. <b>Operacional</b>: mercado precificando aperto no curto e/ou desaceleração; se vier com <b>DXY forte</b>, costuma ser pior para emergentes; se vier com <b>DXY fraco</b>, pode ser alívio/normalização.
                    <br><b>≈</b> (estável): sem mensagem clara na inclinação. <b>Operacional</b>: use o <b>nível</b> (curto/médio/longo) e valide com o bloco <b>Regime</b>.
                </div>
            </div>
        </div>
    `;

    el.innerHTML = `
        ${summary}
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px;">
            ${renderDiTable(diList, { detectedCount: diSymbolsAll.length, limit: 18, title: 'DI (B3) • Principais' })}
            ${renderGlobalTable('Globais (10Y/5Y)', gl)}
        </div>
        <div style="margin-top:14px;display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px;">
            ${renderDiTable(diHeads, { detectedCount: diHeads.length, limit: 9999, title: 'DI Cabeças de Ano (DI1F)' })}
            ${renderDiTable(diTopChanges, { detectedCount: diList.length, limit: 12, title: 'Maiores variações (DI %)' })}
        </div>
    `;
}

function computeBrazilCdsHedgeSignal(data) {
    const symCds =
        findAliasSymbolBest(data, 'CDS_BR5Y')
        || findAssetSymbol(data, /^BRGV5YUSAC=R$/i)
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

    const fmt = v => (typeof v === 'number' && Number.isFinite(v) ? formatPercent(v, 2) : '—');

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
        if (mode === 'hedge_on_risk_on') return 'Hedge-on (CDS↑ com Brasil comprado)';
        if (mode === 'risk_off_classic') return 'Risk-off clássico (CDS↑ + BRL↓ + bolsa↓)';
        if (mode === 'relief_risk_on') return 'Alívio (CDS↓ + BRL↑ + bolsa↑)';
        if (mode === 'protection_isolated') return 'Proteção (CDS↑ sem confirmação)';
        if (mode === 'relief_isolated') return 'Alívio (CDS↓ sem confirmação)';
        return 'Neutro/ruído';
    })();

    const detail = `CDS ${fmt(cds)} • USD/BRL ${fmt(fx)} • BR (EWZ/IBOV) ${fmt(eq)}`;

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
        br10y: findAliasSymbolBest(data, 'BR10Y') || pick([/^BR10YT=RR$/i]),
        cds: findAliasSymbolBest(data, 'CDS_BR5Y') || pick([/^BRGV5YUSAC=R$/i, /^BRGV/i]),
        spx: findAliasSymbolBest(data, 'SPX') || findAliasSymbol(data, 'SPX') || pick([/(^SPX$|^\.SPX$|^\^GSPC$|\bS&P\s*500\b)/i]),
        us10y: findAliasSymbolBest(data, 'US10Y') || findAliasSymbol(data, 'US10Y') || pick([/^US10YT=RR$/i, /(^\^TNX$|\bUS\s*10Y\b|\bUST\s*10Y\b)/i]),
        us2y: findAliasSymbolBest(data, 'US2Y') || findAliasSymbol(data, 'US2Y') || pick([/^US2YT=RR$/i, /(^\^IRX$|\bUS\s*2Y\b|\bUST\s*2Y\b)/i]),
        hyg: findAliasSymbolBest(data, 'HYG') || pick([/^HYG(\.\w+)?$/i, /\bhigh\s*yield\b/i, /\biboxx\b/i, /\balto\s*rendimento\b/i]),
        tlt: findAliasSymbolBest(data, 'TLT') || pick([/^TLT(\.\w+)?$/i, /\bTLT\b/i, /\b20\+\s*Year\b.*\bTreasury\b/i, /\bTreasury\b.*\bBond\b/i, /\btreasuries\b/i]),
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
        hyg: { label: 'HYG (crédito)', pct: get(sym.hyg) },
        tlt: { label: 'TLT (duration)', pct: get(sym.tlt) },
        eem: { label: 'EEM/VWO (EM)', pct: get(sym.eem) },
        brent: { label: 'Brent', pct: get(sym.brent) },
        copper: { label: 'Cobre', pct: get(sym.copper) },
        gold: { label: 'Ouro', pct: get(sym.gold) },
        iron: { label: 'Minério', pct: get(sym.iron) },
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

    const pick = patterns => patterns.map(re => findAssetSymbol(data, re)).find(Boolean) || null;
    const get = s => (s ? getChangePct(data, s) : null);
    const getRatesMoveProxy = s => {
        if (!s) return null;
        const series = data && data.series && Array.isArray(data.series[s]) ? data.series[s] : [];
        if (!series.length) return null;
        const last = series[series.length - 1];
        const lastPrice = last && typeof last.price === 'number' && Number.isFinite(last.price) ? last.price : null;
        if (last && typeof last.changePct === 'number' && Number.isFinite(last.changePct)) return last.changePct;
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

    const sym = {
        hk50: findAliasSymbolBest(data, 'HK50') || pick([/\bHang\s*Seng\b/i]),
        hstech: findAliasSymbolBest(data, 'HSTECH') || pick([/^\.(HSTECH)\b/i]),
        hsfin: findAliasSymbolBest(data, 'HSI_FIN') || pick([/^\.(HSNF|HSHFI)\b/i, /\bHSI-?Finance\b/i, /\bHang\s*Seng\b.*\bFinance\b/i]),
        hshares: pick([/^HCEI/i, /\bH-Shares\b/i, /\bH\s*Shares\b/i, /\bChina H-Shares\b/i]),
        ewh: findAliasSymbolBest(data, 'EWH') || pick([/^EWH$/i]),
        fxChina: findAliasSymbolBest(data, 'CHINA') || findAliasSymbolBest(data, 'FXI') || findAliasSymbolBest(data, 'MCHI') || findAliasSymbolBest(data, 'CSI300') || pick([/\bChina\b/i]),
        cn50: findAliasSymbolBest(data, 'CN50') || pick([/^CHINA50$/i, /\bChina\s*A50\b/i]),
        usdCnh: findAliasSymbolBest(data, 'USD_CNH') || pick([/^USD\/CNH\b/i]),
        usdCny: findAliasSymbolBest(data, 'USD_CNY') || pick([/^USD\/CNY\b/i]),
        usdHkd: findAliasSymbolBest(data, 'USD_HKD') || pick([/^USD\/HKD\b/i]),
        audusd: pick([/^AUD\/USD\b/i]),
        dxy: findAliasSymbolBest(data, 'DXY') || findAliasSymbol(data, 'DXY'),
        spx: findAliasSymbolBest(data, 'SPX') || findAliasSymbol(data, 'SPX'),
        ndx: findAliasSymbolBest(data, 'NDX') || pick([/(^\.NDX$|\bNasdaq 100\b)/i]),
        us10y: findAliasSymbolBest(data, 'US10Y') || findAliasSymbol(data, 'US10Y'),
        us2y: findAliasSymbolBest(data, 'US2Y') || findAliasSymbol(data, 'US2Y'),
        hk10y: findAliasSymbolBest(data, 'HK10Y') || pick([/^HK10YT=RR$/i]),
        hk1m: findAliasSymbolBest(data, 'HK1M') || pick([/^HK1MT=RR$/i, /\bHong\s*Kong\b.*\b1\b.*\bm[eê]s\b/i]),
        hk3m: findAliasSymbolBest(data, 'HK3M') || pick([/^HK3MT=RR$/i, /\bHong\s*Kong\b.*\b3\b.*\bmeses\b/i]),
        cn10y: findAliasSymbolBest(data, 'CN10Y') || pick([/^CN10YT=RR$/i]),
        us10hk10: findAliasSymbolBest(data, 'SPREAD_HK10Y') || pick([
            /^US10HK10=RR$/i,
            /Spread.*Hong\s*Kong.*10.*(EUA|US|China|CHI).*10/i,
            /Spread.*(EUA|US|China|CHI).*10.*Hong\s*Kong.*10/i,
            /Spread.*EUA.*10A.*(HK|HKG|Hong\s*Kong).*10A/i,
            /Spread.*(HK|HKG|Hong\s*Kong).*10A.*EUA.*10A/i,
        ]),
        cdsCn5y: findAliasSymbolBest(data, 'CDS_CN5Y') || pick([/^CNGV5YUSAC=R$/i, /^CNGV/i]),
        vix9d: findAliasSymbolBest(data, 'VIX9D') || pick([/^\.VIX9D$/i]),
        vix30: findAliasSymbolBest(data, 'VIX30') || pick([/^VIX$/i, /^\.VIX$/i]),
        vvix: findAliasSymbolBest(data, 'VVIX') || pick([/^\.VVIX$/i]),
        vhsi: findAliasSymbolBest(data, 'VHSI') || pick([/^\.VHSI$/i, /^VHSI(c\d+)?$/i]),
        eem: findAliasSymbolBest(data, 'EEM') || findAliasSymbolBest(data, 'VWO'),
        hyg: findAliasSymbolBest(data, 'HYG'),
        tlt: findAliasSymbolBest(data, 'TLT'),
        brent: findAliasSymbolBest(data, 'BRENT'),
        copper: findAliasSymbolBest(data, 'COPPER'),
        iron: findAliasSymbolBest(data, 'IRON'),
        gold: findAliasSymbolBest(data, 'GOLD'),
        btc: findAliasSymbolBest(data, 'BTC'),
    };

    const hkVol = sym.vhsi ? get(sym.vhsi) : null;
    const vixPulso = sym.vix9d ? get(sym.vix9d) : null;
    const vixRegime = sym.vix30 ? get(sym.vix30) : null;
    const usdChina = isNum(get(sym.usdCnh)) ? get(sym.usdCnh) : get(sym.usdCny);
    const usdHkd = get(sym.usdHkd);
    const hk50Pct = get(sym.hk50);

    const driversCfg = [
        { key: 'hstech', group: 'driver', weight: 0.7, capAbs: 1.8, sign: +1 },
        { key: 'hsfin', group: 'driver', weight: 0.45, capAbs: 1.8, sign: +1 },
        { key: 'hshares', group: 'driver', weight: 0.35, capAbs: 1.8, sign: +1 },
        { key: 'fxChina', group: 'driver', weight: 0.55, capAbs: 1.6, sign: +1 },
        { key: 'cn50', group: 'driver', weight: 0.35, capAbs: 1.8, sign: +1 },
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
        fxChina: { label: 'China (FXI/MCHI/CSI300)', pct: get(sym.fxChina), sym: sym.fxChina },
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
        iron: { label: 'Minério', pct: get(sym.iron), sym: sym.iron },
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
                m[k] = 'sem símbolo';
                continue;
            }
            const pts = data && data.series && Array.isArray(data.series[s]) ? data.series[s] : [];
            if (!pts.length) {
                m[k] = 'sem série';
                continue;
            }
            const last = getLastPoint(data, s);
            if (!last) {
                m[k] = 'sem último ponto';
                continue;
            }
            if (typeof last.changePct !== 'number') {
                m[k] = pts.length < 2 ? 'apenas 1 ponto (sem var%)' : 'sem var% (changePct)';
                continue;
            }
            m[k] = 'sem var%';
        }
        return m;
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
            { label: 'HK10Y (yield)', key: 'HK10Y' },
            { label: 'HK 1M (liquidez)', key: 'HK1M' },
            { label: 'HK 3M (liquidez)', key: 'HK3M' },
            { label: 'Spread HK10Y vs US/China 10Y', key: 'SPREAD_HK10Y' },
            { label: 'China CDS 5Y (USD)', key: 'CDS_CN5Y' },
            { label: 'China ETF (MCHI)', key: 'MCHI' },
            { label: 'AUD/USD (beta China)', key: 'AUD/USD' },
        ];
        const out = [];
        for (const w of want) {
            const has =
                w.key === 'HSHARES'
                    ? sym.hshares
                    : w.key === 'AUD/USD'
                        ? sym.audusd
                        : findAliasSymbolBest(data, w.key);
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

    return {
        sym,
        market: { hk50Pct },
        pulse: { bias, net, breadth, contribution, pnlLike, groups, rows },
        coverage: { expected: expectedKeys.length, observed: rows.length, missing, keyLabels, missingDetails },
        missingAssetsSuggestion: suggest,
        news: geoNews,
    };
}

function computeBtcPulseNow(data, web) {
    const isNum = v => typeof v === 'number' && Number.isFinite(v);
    const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
    const pick = patterns => patterns.map(re => findAssetSymbol(data, re)).find(Boolean) || null;
    const get = s => (s ? getChangePct(data, s) : null);
    const getRatesMoveProxy = s => {
        if (!s) return null;
        const series = data && data.series && Array.isArray(data.series[s]) ? data.series[s] : [];
        if (!series.length) return null;
        const last = series[series.length - 1];
        const lastPrice = last && typeof last.price === 'number' && Number.isFinite(last.price) ? last.price : null;
        if (last && typeof last.changePct === 'number' && Number.isFinite(last.changePct)) return last.changePct;
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

    const sym = {
        btc: findAliasSymbolBest(data, 'BTC') || pick([/^BTC\/USD$/i, /\bbitcoin\b/i]),
        eth: findAliasSymbolBest(data, 'ETH') || pick([/\bETH\/USD\b/i, /\bEthereum\b/i]),
        sol: findAliasSymbolBest(data, 'SOL') || pick([/^SOL\/USD$/i, /\bSolana\b/i]),
        doge: findAliasSymbolBest(data, 'DOGE') || pick([/^DOGE\/USD$/i, /\bDogecoin\b/i]),
        spx: findAliasSymbolBest(data, 'SPX') || findAliasSymbol(data, 'SPX'),
        ndx: findAliasSymbolBest(data, 'NDX') || findAliasSymbol(data, 'NDX'),
        dxy: findAliasSymbolBest(data, 'DXY') || findAliasSymbol(data, 'DXY'),
        vix: findAliasSymbolBest(data, 'VIX') || pick([/^\.?VIX(9D)?$/i]),
        vvix: findAliasSymbolBest(data, 'VVIX') || pick([/^\.VVIX$/i]),
        us2y: findAliasSymbolBest(data, 'US2Y') || findAliasSymbol(data, 'US2Y'),
        us10y: findAliasSymbolBest(data, 'US10Y') || findAliasSymbol(data, 'US10Y'),
        tlt: findAliasSymbolBest(data, 'TLT'),
        hyg: findAliasSymbolBest(data, 'HYG'),
        eem: findAliasSymbolBest(data, 'EEM') || findAliasSymbolBest(data, 'VWO'),
        gold: findAliasSymbolBest(data, 'GOLD'),
        copper: findAliasSymbolBest(data, 'COPPER'),
        brent: findAliasSymbolBest(data, 'BRENT'),
        wti: findAliasSymbolBest(data, 'WTI'),
        usdjpy: pick([/^USD\/JPY\b/i]),
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
            if (s.includes('medium') || s.includes('média') || s.includes('media')) return 0.75;
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

    const driversCfg = [
        { key: 'ndx', group: 'driver', weight: 0.75, capAbs: 1.4, sign: +1 },
        { key: 'spx', group: 'driver', weight: 0.45, capAbs: 1.2, sign: +1 },
        { key: 'dxy', group: 'driver', weight: 0.7, capAbs: 0.7, sign: -1 },
        { key: 'vix', group: 'driver', weight: 0.55, capAbs: 4.0, sign: -1 },
        { key: 'us2y', group: 'driver', weight: 0.35, capAbs: 0.7, sign: -1 },
        { key: 'us10y', group: 'driver', weight: 0.25, capAbs: 0.7, sign: -1 },
        { key: 'hyg', group: 'driver', weight: 0.35, capAbs: 1.3, sign: +1 },
        { key: 'tlt', group: 'driver', weight: 0.2, capAbs: 1.2, sign: +1 },

        { key: 'eth', group: 'confirm', weight: 0.6, capAbs: 4.0, sign: +1 },
        { key: 'sol', group: 'confirm', weight: 0.35, capAbs: 6.0, sign: +1 },
        { key: 'doge', group: 'confirm', weight: 0.15, capAbs: 9.0, sign: +1 },
        { key: 'btcEtf', group: 'confirm', weight: 0.35, capAbs: 2.8, sign: +1 },
        { key: 'cryptoEq', group: 'confirm', weight: 0.25, capAbs: 4.5, sign: +1 },

        { key: 'eem', group: 'context', weight: 0.2, capAbs: 1.3, sign: +1 },
        { key: 'copper', group: 'context', weight: 0.2, capAbs: 1.8, sign: +1 },
        { key: 'brent', group: 'context', weight: 0.12, capAbs: 2.2, sign: +1 },
        { key: 'gold', group: 'context', weight: 0.12, capAbs: 1.6, sign: +1 },
        { key: 'usdjpy', group: 'context', weight: 0.12, capAbs: 1.2, sign: +1 },
        { key: 'vvix', group: 'context', weight: 0.12, capAbs: 5.0, sign: -1 },
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
            label: `Ações cripto (${cryptoEqBasket.used.join('/') || 'MSTR/COIN/MARA/RIOT'})`,
            pct: cryptoEqBasket.pct,
            sym: cryptoEqBasket.used.length ? cryptoEqBasket.used[0] : null,
            unit: '%'
        },
        spx: { label: 'SPX', pct: get(sym.spx), sym: sym.spx, unit: '%' },
        ndx: { label: 'NDX', pct: get(sym.ndx), sym: sym.ndx, unit: '%' },
        dxy: { label: 'DXY', pct: get(sym.dxy), sym: sym.dxy, unit: '%' },
        vix: { label: 'VIX', pct: get(sym.vix), sym: sym.vix, unit: '%' },
        vvix: { label: 'VVIX', pct: get(sym.vvix), sym: sym.vvix, unit: '%' },
        us2y: { label: 'US2Y (proxy Δ)', pct: getRatesMoveProxy(sym.us2y), sym: sym.us2y, unit: '%' },
        us10y: { label: 'US10Y (proxy Δ)', pct: getRatesMoveProxy(sym.us10y), sym: sym.us10y, unit: '%' },
        tlt: { label: 'TLT', pct: get(sym.tlt), sym: sym.tlt, unit: '%' },
        hyg: { label: 'HYG', pct: get(sym.hyg), sym: sym.hyg, unit: '%' },
        eem: { label: 'EEM/VWO', pct: get(sym.eem), sym: sym.eem, unit: '%' },
        gold: { label: 'Ouro', pct: get(sym.gold), sym: sym.gold, unit: '%' },
        copper: { label: 'Cobre', pct: get(sym.copper), sym: sym.copper, unit: '%' },
        brent: { label: 'Brent', pct: (get(sym.brent) ?? get(sym.wti)), sym: sym.brent || sym.wti, unit: '%' },
        usdjpy: { label: 'USD/JPY', pct: get(sym.usdjpy), sym: sym.usdjpy, unit: '%' },
        news: { label: 'Notícias (macro/cripto)', pct: computeNews.used ? computeNews.score : null, sym: null, unit: 'score' },
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

    const net = clamp(contribution.net, -3, 3);
    let bias = net > 0.25 ? 'buy' : net < -0.25 ? 'sell' : 'neutral';
    let nowLabel = 'AGORA';
    const tapePct = drv.btc && isNum(drv.btc.pct) ? drv.btc.pct : null;
    if (isNum(tapePct) && Math.abs(tapePct) >= 0.9) {
        const tapeBias = tapePct > 0 ? 'buy' : 'sell';
        if (bias === 'neutral' || bias === tapeBias) {
            bias = tapeBias;
            nowLabel = 'AGORA • TAPE';
        } else {
            nowLabel = 'AGORA • TAPE (diverg.)';
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
                m[k] = 'sem símbolo';
                continue;
            }
            const pts = data && data.series && Array.isArray(data.series[s]) ? data.series[s] : [];
            if (!pts.length) {
                m[k] = 'sem série';
                continue;
            }
            const last = getLastPoint(data, s);
            if (!last) {
                m[k] = 'sem último ponto';
                continue;
            }
            if (!isNum(last.changePct) && !isNum(last.extendedChangePct) && !isNum(last.change)) {
                m[k] = 'sem variação';
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
            { label: 'IBIT', matchers: [/^IBIT(\.\w+)?$/i, /\bIBIT\b/i] },
            { label: 'FBTC', matchers: [/^FBTC(\.\w+)?$/i, /\bFBTC\b/i] },
            { label: 'ARKB', matchers: [/^ARKB(\.\w+)?$/i, /\bARKB\b/i] },
            { label: 'BITB', matchers: [/^BITB(\.\w+)?$/i, /\bBITB\b/i] },
            { label: 'MSTR', matchers: [/^MSTR(\.\w+)?$/i, /\bMicroStrategy\b/i] },
            { label: 'COIN', matchers: [/^COIN(\.\w+)?$/i, /\bCoinbase\b/i] },
            { label: 'MARA', matchers: [/^MARA(\.\w+)?$/i, /\bMarathon\b/i] },
            { label: 'RIOT', matchers: [/^RIOT(\.\w+)?$/i, /\bRiot\b/i] },
            { label: 'VIX', matchers: [/^\.?VIX(9D)?$/i, /\bVIX\b/i] },
            { label: 'DXY', matchers: [/^DX$|^\.DXY$/i, /\bDXY\b/i] },
            { label: 'US10Y', matchers: [/^US10YT=RR$/i, /^USGV10YUSAB=R$/i, /^TNc\d=\$?$/i, /\bUS10Y\b/i, /\bUnited States 10-Year\b/i] },
            { label: 'US2Y', matchers: [/^US2YT=RR$/i, /^TUc\d=\$?$/i, /\bUS2Y\b/i, /\bUnited States 2-Year\b/i] },
            { label: 'TLT', matchers: [/^TLT(\.\w+)?$/i] },
            { label: 'HYG', matchers: [/^HYG(\.\w+)?$/i] },
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
        coverage: { expected: expectedKeys.length, observed: rows.length, missing, keyLabels, missingDetails },
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

    const badge = (tone, text) => {
        const cls = tone === 'positive' ? 'positive' : tone === 'negative' ? 'negative' : 'neutral';
        return `<span class="${cls}" style="display:inline-flex;align-items:center;gap:8px;border:1px solid rgba(255,255,255,.14);border-radius:999px;padding:4px 10px;background:rgba(0,0,0,.18);font-family:'Share Tech Mono',monospace;font-weight:900;">${escapeHtml(text)}</span>`;
    };

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
    const missingBadge = badge(missing.length ? 'neutral' : 'positive', missingLabel);

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
            </div>
            ${suggestLine ? `<div style="margin-top:8px;opacity:.82;font-size:12px;line-height:1.35;">${escapeHtml(suggestLine)}</div>` : ''}
        </div>

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

function renderHk50OperationalBriefing() {
    const el = document.getElementById('hk50OperationalBriefing');
    if (!el) return;

    const data = getData();
    const rawWeb = operationalInputs.webNews || null;
    const web = rawWeb && rawWeb.ok === true ? rawWeb : null;
    const hkNow = data ? computeHk50PulseNow(data, web) : null;

    const badge = (tone, text) => {
        const cls = tone === 'positive' ? 'positive' : tone === 'negative' ? 'negative' : 'neutral';
        return `<span class="${cls}" style="display:inline-flex;align-items:center;gap:8px;border:1px solid rgba(255,255,255,.14);border-radius:999px;padding:4px 10px;background:rgba(0,0,0,.18);font-family:'Share Tech Mono',monospace;font-weight:900;">${escapeHtml(text)}</span>`;
    };

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
            if (last && typeof last.changePct === 'number' && Number.isFinite(last.changePct)) return last.changePct;
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
                    ${gaugeHtml}
                </div>
            </div>
            <div style="margin-top:8px;opacity:.86;font-size:12px;line-height:1.35;">
                ${escapeHtml(hkLine)} • asOf ${escapeHtml(asOf)} • ${escapeHtml(layersLine)}
            </div>
            <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
                ${missingBadge}
            </div>
            ${suggestLine ? `<div style="margin-top:8px;opacity:.82;font-size:12px;line-height:1.35;">${escapeHtml(suggestLine)}</div>` : ''}
        </div>
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

    const mk = (tone, txt) => toneBadgeHtmlFromTone(tone, 0, txt, { maxAbs: 1 });

    const assets = data && Array.isArray(data.assets) ? data.assets : [];
    const rates = assets.filter(a => String(a && a.category ? a.category : '') === 'rates');

    const looksLikeBrazilFixedIncome = a => {
        const name = String(a && a.name ? a.name : '');
        const sym = symbolKey(a && a.symbol ? a.symbol : '');
        if (!name && !sym) return false;
        if (isBrazilRelated({ symbol: sym, name, category: 'rates' })) return true;
        if (/\btesouro\b|\btesouro direto\b|\bntn\b|\bltn\b|\blft\b|\bipca\b|\bselic\b|\bcupom\b|\bprefixad|\bpre[-\s]?fixad/i.test(name)) return true;
        if (/^BR\d+(YT|MT)=RR$/i.test(sym) || /^US10BR10=RR$/i.test(sym) || /^DAPC\d+$/i.test(sym) || /^DDIC/i.test(sym)) return true;
        return false;
    };

    const fmtRate = v => typeof v === 'number' && Number.isFinite(v) ? `${formatNumber(v, 2)}%` : '—';
    const fmtMoney = v => typeof v === 'number' && Number.isFinite(v) ? `R$ ${formatNumber(v, 2)}` : '—';
    const avg = xs => {
        const ns = (xs || []).filter(x => typeof x === 'number' && Number.isFinite(x));
        if (!ns.length) return null;
        return ns.reduce((a, b) => a + b, 0) / ns.length;
    };

    const extractYear = s => {
        const m = String(s || '').match(/\b(20\d{2})\b/);
        if (!m) return null;
        const y = Number(m[1]);
        if (!Number.isFinite(y) || y < 2000 || y > 2100) return null;
        return y;
    };

    const inferTenorYears = (name, symbol) => {
        const src = `${String(symbol || '')} ${String(name || '')}`.toUpperCase();
        const m = src.match(/\b(?:BR|US|BRNB)(\d+)([YM])T=RR\b/);
        if (m) {
            const n = Number(m[1]);
            const u = m[2];
            if (!Number.isFinite(n) || n <= 0) return null;
            return u === 'M' ? n / 12 : n;
        }
        return null;
    };

    const toBrtDateKey = ms => {
        if (!Number.isFinite(ms)) return '';
        const d = new Date(ms);
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const yy = String(d.getFullYear());
        return `${yy}-${mm}-${dd}`;
    };

    const pointMs = p => {
        const t = p && p.t ? Date.parse(p.t) : NaN;
        return Number.isFinite(t) ? t : NaN;
    };

    const lastAndPrev = symbol => {
        const series = (data && data.series && data.series[symbol]) ? data.series[symbol] : [];
        const last = getMostRecentPointWithPrice(data, symbol) || getLastPoint(data, symbol);
        if (!last || typeof last.price !== 'number' || !Number.isFinite(last.price)) return { last: null, prev: null };
        const lastMs = pointMs(last);
        const lastKey = toBrtDateKey(lastMs);
        let prev = null;
        let prevMs = -Infinity;
        for (const p of series) {
            if (!p || typeof p.price !== 'number' || !Number.isFinite(p.price)) continue;
            const ms = pointMs(p);
            if (!Number.isFinite(ms)) continue;
            const key = toBrtDateKey(ms);
            if (key >= lastKey) continue;
            if (ms > prevMs) {
                prevMs = ms;
                prev = p;
            }
        }
        return { last, prev };
    };

    const isYieldLike = (asset, symKey) => {
        const name = String(asset && asset.name ? asset.name : '');
        const sym = String(symKey || '');
        if (/^BR\d+(YT|MT)=RR$/i.test(sym) || /^US\d+(YT|MT)=RR$/i.test(sym) || /^US10BR10=RR$/i.test(sym)) return true;
        if (/^DAPC\d+$/i.test(sym) || /^DDIC/i.test(sym) || /^DI\d/i.test(sym) || /^DI1/i.test(sym)) return true;
        if (/\byield\b|\btaxa\b|\bjuros\b|\bselic\b/i.test(name) && !/\btesouro\b/i.test(name)) return true;
        return false;
    };

    const isTesouroDiretoPrice = (asset, symKey) => {
        const name = String(asset && asset.name ? asset.name : '');
        const sym = String(symKey || '');
        if (!/\btesouro\b/i.test(name)) return false;
        if (isYieldLike(asset, sym)) return false;
        return true;
    };

    const items = rates
        .filter(looksLikeBrazilFixedIncome)
        .map(a => {
            const symbol = String(a && a.symbol ? a.symbol : '');
            const { last, prev } = lastAndPrev(symbol);
            if (!last || !(typeof last.price === 'number' && Number.isFinite(last.price))) return null;
            const delta = typeof last.change === 'number' && Number.isFinite(last.change)
                ? last.change
                : (prev && typeof prev.price === 'number' && Number.isFinite(prev.price) ? last.price - prev.price : null);
            const yieldLike = isYieldLike(a, symbol);
            const tesouroPrice = isTesouroDiretoPrice(a, symbol);
            const unit = tesouroPrice && !yieldLike ? 'price' : 'yield';
            const bps = unit === 'yield' && typeof delta === 'number' && Number.isFinite(delta) ? delta * 100 : null;
            const year = extractYear(a.name) || extractYear(symbol);
            const nowY = new Date().getFullYear();
            const tenorYrs = inferTenorYears(a.name, symbol);
            const yrs = typeof year === 'number' ? year - nowY : (typeof tenorYrs === 'number' ? tenorYrs : null);
            const bucket = typeof yrs === 'number' ? (yrs <= 3 ? 'Curto' : yrs <= 7 ? 'Médio' : 'Longo') : '—';
            return {
                symbol,
                name: String(a && a.name ? a.name : symbol),
                rate: last.price,
                bps,
                delta,
                unit,
                year,
                yrs,
                bucket,
                updatedAt: last.t || null,
            };
        })
        .filter(Boolean)
        .sort((x, y) => {
            const ax = typeof x.year === 'number' ? x.year : 9999;
            const ay = typeof y.year === 'number' ? y.year : 9999;
            return ax - ay || String(x.name).localeCompare(String(y.name));
        });

    if (!items.length) {
        el.innerHTML = `<div style="border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:12px;background:rgba(0,0,0,.18);opacity:.9;">
            <div style="font-weight:900;letter-spacing:1px;margin-bottom:6px;">🇧🇷 Renda Fixa Brasil &amp; Fluxo</div>
            <div style="opacity:.85;line-height:1.4;">Sem títulos/curva do Brasil no monitoramento no momento. Atualize o pacote de dados e clique em <b>↻ Dados</b>.</div>
        </div>`;
        return;
    }

    const yieldItems = items.filter(x => x && x.unit === 'yield');
    const latestUpdate = (() => {
        const msList = items
            .map(x => (x && x.updatedAt ? Date.parse(String(x.updatedAt)) : NaN))
            .filter(ms => typeof ms === 'number' && Number.isFinite(ms));
        if (!msList.length) return '';
        const ms = Math.max(...msList);
        try {
            return formatDateTime(new Date(ms).toISOString());
        } catch {
            return '';
        }
    })();

    const pick = (label, matcher) => {
        const symbol = findAssetSymbol(data, matcher);
        const { last, prev } = lastAndPrev(symbol);
        if (!symbol || !last || !(typeof last.price === 'number' && Number.isFinite(last.price))) return null;
        const delta = typeof last.change === 'number' && Number.isFinite(last.change)
            ? last.change
            : (prev && typeof prev.price === 'number' && Number.isFinite(prev.price) ? last.price - prev.price : null);
        const bps = typeof delta === 'number' && Number.isFinite(delta) ? delta * 100 : null;
        return { label, symbol, rate: last.price, bps };
    };

    const essentials = [
        pick('BR 3M', /^BR3MT=RR$/i),
        pick('BR 1Y', /^BR1YT=RR$/i),
        pick('BR 2Y', /^BR2YT=RR$/i),
        pick('BR 5Y', /^BR5YT=RR$/i),
        pick('BR 10Y', /^BR10YT=RR$/i),
        pick('IPCA+ (real)', /^BRNB10YT=RR$/i),
        pick('DAP 1 (real)', /^DAPc1$/i),
        pick('DAP 2 (real)', /^DAPc2$/i),
        pick('DAP 3 (real)', /^DAPc3$/i),
    ].filter(Boolean);

    const eByLabel = new Map(essentials.map(x => [x.label, x]));
    const br2y = eByLabel.get('BR 2Y') || null;
    const br10y = eByLabel.get('BR 10Y') || null;
    const slope10_2 = br2y && br10y && typeof br2y.rate === 'number' && typeof br10y.rate === 'number' ? br10y.rate - br2y.rate : null;

    const essentialsNominal = essentials.filter(x => /^BR\s+\d/i.test(String(x.label || '')));
    const essentialsReal = essentials.filter(x => /(real)|(^DAP\s+)/i.test(String(x.label || '')));

    const byBucket = bucket => yieldItems.filter(x => x.bucket === bucket);
    const shortAvg = avg(byBucket('Curto').map(x => x.rate));
    const midAvg = avg(byBucket('Médio').map(x => x.rate));
    const longAvg = avg(byBucket('Longo').map(x => x.rate));
    const slope = typeof longAvg === 'number' && typeof shortAvg === 'number' ? longAvg - shortAvg : null;
    const shape = slope === null ? 'N/A' : slope > 0.15 ? 'STEEPEN' : slope < -0.15 ? 'FLATTEN' : '≈';

    const avgBps = avg(yieldItems.map(x => x.bps));
    const keyBpsNominal = essentialsNominal.map(x => x.bps).filter(v => typeof v === 'number' && Number.isFinite(v));
    const keyBpsReal = essentialsReal.map(x => x.bps).filter(v => typeof v === 'number' && Number.isFinite(v));
    const avgNominalAbs = keyBpsNominal.length ? (keyBpsNominal.map(v => Math.abs(v)).reduce((a, b) => a + b, 0) / keyBpsNominal.length) : null;

    const shortKeyBps = avg([eByLabel.get('BR 3M')?.bps, eByLabel.get('BR 1Y')?.bps, eByLabel.get('BR 2Y')?.bps]);
    const longKeyBps = avg([eByLabel.get('BR 5Y')?.bps, eByLabel.get('BR 10Y')?.bps]);
    const termPremiumBps = typeof longKeyBps === 'number' && typeof shortKeyBps === 'number' ? longKeyBps - shortKeyBps : null;

    const reference = (() => {
        if (!(essentialsNominal.length >= 3) || !(typeof avgNominalAbs === 'number' && Number.isFinite(avgNominalAbs))) return { tone: 'neutral', label: 'n/d', detail: '—' };
        if (avgNominalAbs <= 0.8) return { tone: 'neutral', label: 'Fraca', detail: 'taxas travadas' };
        return { tone: 'positive', label: 'Ativa', detail: 'boa leitura' };
    })();

    const classifyFlowBps = (src) => {
        if (!(typeof src === 'number' && Number.isFinite(src))) return { tone: 'neutral', label: 'n/d', detail: 'Δ —' };
        const d = `${src > 0 ? '+' : ''}${formatNumber(src, 1)} bp`;
        if (src <= -3) return { tone: 'positive', label: 'Entrada', detail: `Δ ${d}` };
        if (src >= 3) return { tone: 'negative', label: 'Saída', detail: `Δ ${d}` };
        return { tone: 'neutral', label: 'Neutro', detail: `Δ ${d}` };
    };

    const flowNominal = (() => {
        const src = keyBpsNominal.length >= 3 ? avg(keyBpsNominal) : avgBps;
        return classifyFlowBps(src);
    })();

    const flowReal = (() => {
        const src = keyBpsReal.length >= 2 ? avg(keyBpsReal) : keyBpsReal.length >= 1 ? keyBpsReal[0] : null;
        return keyBpsReal.length ? classifyFlowBps(src) : { tone: 'neutral', label: 'n/d', detail: 'sem real' };
    })();

    const termPremium = (() => {
        if (!(typeof termPremiumBps === 'number' && Number.isFinite(termPremiumBps))) return { tone: 'neutral', label: 'n/d', detail: '—' };
        const d = `${termPremiumBps > 0 ? '+' : ''}${formatNumber(termPremiumBps, 1)} bp`;
        if (termPremiumBps >= 3) return { tone: 'negative', label: 'Abrindo', detail: `Δ ${d}` };
        if (termPremiumBps <= -3) return { tone: 'positive', label: 'Fechando', detail: `Δ ${d}` };
        return { tone: 'neutral', label: 'Neutro', detail: `Δ ${d}` };
    })();

    const riskAlert = (() => {
        if (reference.label !== 'Ativa') return null;
        const br10 = eByLabel.get('BR 10Y');
        const br10Bps = br10 && typeof br10.bps === 'number' && Number.isFinite(br10.bps) ? br10.bps : null;
        const shock = (typeof br10Bps === 'number' && br10Bps >= 10)
            || (typeof longKeyBps === 'number' && longKeyBps >= 8 && (typeof termPremiumBps !== 'number' || termPremiumBps >= 6))
            || (typeof termPremiumBps === 'number' && termPremiumBps >= 10);
        if (!shock) return null;
        const br10Txt = typeof br10Bps === 'number' ? `${br10Bps > 0 ? '+' : ''}${formatNumber(br10Bps, 1)} bp` : '—';
        const premTxt = typeof termPremiumBps === 'number' ? `${termPremiumBps > 0 ? '+' : ''}${formatNumber(termPremiumBps, 1)} bp` : '—';
        const longTxt = typeof longKeyBps === 'number' ? `${longKeyBps > 0 ? '+' : ''}${formatNumber(longKeyBps, 1)} bp` : '—';
        return {
            title: 'Alerta: long end abrindo (prêmio/fiscal)',
            detail: `BR10Y ${br10Txt} • long ${longTxt} • Δ long−short ${premTxt}`,
            op: 'Tende a pressionar USD/BRL e a piorar a convexidade do índice. Procure confirmação em USD/BRL↑, EWZ↓ e CDS↑.',
        };
    })();

    const symEwz = findAssetSymbol(data, /^EWZ$/i);
    const symUsdbbrl = findAliasSymbol(data, 'USD_BRL') || findAssetSymbol(data, /^USD\/BRL\b/i);
    const symBrCds = findAssetSymbol(data, /^BRGV/i) || findAssetSymbol(data, /\bBrazil\b.*\bCDS\b|\bCDS\b.*\bBrazil\b/i);

    const ewz = getChangePct(data, symEwz);
    const usdbbrl = getChangePct(data, symUsdbbrl);
    const cds = getChangePct(data, symBrCds);
    const cdsSignal = computeBrazilCdsHedgeSignal(data);

    const flowBr = (() => {
        const cdsAdj = (() => {
            if (cdsSignal && cdsSignal.mode === 'hedge_on_risk_on') return null;
            return typeof cds === 'number' && Number.isFinite(cds) ? -cds : null;
        })();
        const parts = [
            typeof ewz === 'number' && Number.isFinite(ewz) ? ewz : null,
            typeof usdbbrl === 'number' && Number.isFinite(usdbbrl) ? -usdbbrl : null,
            cdsAdj,
        ].filter(x => typeof x === 'number' && Number.isFinite(x));
        const score = parts.length ? parts.reduce((a, b) => a + b, 0) / parts.length : null;
        if (!(typeof score === 'number' && Number.isFinite(score))) return { tone: 'neutral', label: 'n/d', detail: 'sem confirmação' };
        if (score > 0.25) return { tone: 'positive', label: 'Entrada', detail: `score ${formatNumber(score, 2)}` };
        if (score < -0.25) return { tone: 'negative', label: 'Saída', detail: `score ${formatNumber(score, 2)}` };
        return { tone: 'neutral', label: 'Neutro', detail: `score ${formatNumber(score, 2)}` };
    })();

    const summary = `
        <div style="border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:12px;background:rgba(0,0,0,.18);">
            <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap;">
                <div style="font-weight:900;letter-spacing:1px;opacity:.95;">🇧🇷 Renda Fixa Brasil &amp; Fluxo</div>
                <div style="font-family:'Share Tech Mono',monospace;font-weight:900;opacity:.95;">Shape: ${escapeHtml(shape)}${latestUpdate ? ` • Atualização: ${escapeHtml(latestUpdate)}` : ''}</div>
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px;margin-top:10px;">
                <div style="border:1px solid rgba(255,255,255,.10);border-radius:10px;padding:10px;background:rgba(0,0,0,.22);">
                    <div style="opacity:.85;font-weight:800;">Curto</div>
                    <div style="font-weight:900;">${escapeHtml(shortAvg === null ? '—' : fmtRate(shortAvg))}</div>
                </div>
                <div style="border:1px solid rgba(255,255,255,.10);border-radius:10px;padding:10px;background:rgba(0,0,0,.22);">
                    <div style="opacity:.85;font-weight:800;">Médio</div>
                    <div style="font-weight:900;">${escapeHtml(midAvg === null ? '—' : fmtRate(midAvg))}</div>
                </div>
                <div style="border:1px solid rgba(255,255,255,.10);border-radius:10px;padding:10px;background:rgba(0,0,0,.22);">
                    <div style="opacity:.85;font-weight:800;">Longo</div>
                    <div style="font-weight:900;">${escapeHtml(longAvg === null ? '—' : fmtRate(longAvg))}</div>
                </div>
                <div style="border:1px solid rgba(255,255,255,.10);border-radius:10px;padding:10px;background:rgba(0,0,0,.22);">
                    <div style="opacity:.85;font-weight:800;">10Y−2Y (nível)</div>
                    <div style="font-weight:900;">${escapeHtml(slope10_2 === null ? '—' : `${formatNumber(slope10_2, 2)} p.p.`)}</div>
                </div>
                <div style="border:1px solid rgba(255,255,255,.10);border-radius:10px;padding:10px;background:rgba(0,0,0,.22);">
                    <div style="opacity:.85;font-weight:800;">Referência (Tesouro)</div>
                    <div style="font-weight:900;">${mk(reference.tone, `${reference.label} • ${reference.detail}`)}</div>
                </div>
                <div style="border:1px solid rgba(255,255,255,.10);border-radius:10px;padding:10px;background:rgba(0,0,0,.22);">
                    <div style="opacity:.85;font-weight:800;">Prêmio (Δ long−short)</div>
                    <div style="font-weight:900;">${mk(termPremium.tone, `${termPremium.label} • ${termPremium.detail}`)}</div>
                </div>
                <div style="border:1px solid rgba(255,255,255,.10);border-radius:10px;padding:10px;background:rgba(0,0,0,.22);">
                    <div style="opacity:.85;font-weight:800;">Fluxo (Nominal)</div>
                    <div style="font-weight:900;">${mk(flowNominal.tone, `${flowNominal.label} • ${flowNominal.detail}`)}</div>
                </div>
                <div style="border:1px solid rgba(255,255,255,.10);border-radius:10px;padding:10px;background:rgba(0,0,0,.22);">
                    <div style="opacity:.85;font-weight:800;">Fluxo (Real)</div>
                    <div style="font-weight:900;">${mk(flowReal.tone, `${flowReal.label} • ${flowReal.detail}`)}</div>
                </div>
                <div style="border:1px solid rgba(255,255,255,.10);border-radius:10px;padding:10px;background:rgba(0,0,0,.22);">
                    <div style="opacity:.85;font-weight:800;">Fluxo (BR • confirmação)</div>
                    <div style="font-weight:900;">${mk(flowBr.tone, `${flowBr.label} • ${flowBr.detail}`)}</div>
                </div>
                <div style="border:1px solid rgba(255,255,255,.10);border-radius:10px;padding:10px;background:rgba(0,0,0,.22);">
                    <div style="opacity:.85;font-weight:800;">CDS x Brasil (leitura)</div>
                    <div style="font-weight:900;">${mk(cdsSignal ? cdsSignal.tone : 'neutral', cdsSignal ? cdsSignal.label : 'n/d')}</div>
                    <div style="margin-top:6px;opacity:.85;font-family:'Share Tech Mono',monospace;font-weight:900;">${escapeHtml(cdsSignal ? cdsSignal.detail : '—')}</div>
                </div>
            </div>
            <div style="margin-top:10px;opacity:.82;font-size:12px;line-height:1.35;">
                Operacional: <b>yield ↓</b> costuma indicar <b>demanda por renda fixa</b> (entrada/compra); <b>yield ↑</b> costuma indicar <b>redução de posição</b> (saída/venda). Separe <b>nominal</b> (prefixado/curva) de <b>real</b> (IPCA+/cupom) quando houver divergência. Se a <b>Referência</b> estiver <b>fraca</b> (taxas travadas), trate o sinal como <b>baixo peso</b> (ex.: dias de leilão/cancelamento/feriado).
            </div>
        </div>
    `;

    const essentialsRow = x => {
        const deltaTxt = x.unit === 'price'
            ? (typeof x.delta === 'number' && Number.isFinite(x.delta) ? `${x.delta > 0 ? '+' : ''}${formatNumber(x.delta, 2)} R$` : '—')
            : (x.bps === null ? '—' : `${x.bps > 0 ? '+' : ''}${formatNumber(x.bps, 1)} bp`);
        const deltaTone = x.unit === 'price'
            ? (typeof x.delta === 'number' && Number.isFinite(x.delta) ? (x.delta > 0 ? 'positive' : x.delta < 0 ? 'negative' : 'neutral') : 'neutral')
            : (x.bps === null ? 'neutral' : x.bps < 0 ? 'positive' : x.bps > 0 ? 'negative' : 'neutral');
        const deltaHtml = (x.unit === 'yield' && x.bps !== null) || (x.unit === 'price' && typeof x.delta === 'number' && Number.isFinite(x.delta))
            ? toneBadgeHtmlFromTone(deltaTone, x.unit === 'price' ? x.delta : x.bps, deltaTxt, { maxAbs: x.unit === 'price' ? 2 : 20 })
            : escapeHtml(deltaTxt);
        return `<div style="display:flex;justify-content:space-between;gap:10px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06);">
            <div style="opacity:.92;font-weight:900;letter-spacing:.6px;">${escapeHtml(x.label)}</div>
            <div style="display:flex;gap:14px;align-items:center;">
                <div style="font-family:'Share Tech Mono',monospace;font-weight:900;opacity:.95;min-width:92px;text-align:right;">${escapeHtml(x.unit === 'price' ? fmtMoney(x.rate) : fmtRate(x.rate))}</div>
                <div style="font-family:'Share Tech Mono',monospace;font-weight:900;min-width:92px;text-align:right;">${deltaHtml}</div>
            </div>
        </div>`;
    };

    const row = x => {
        const deltaTxt = x.unit === 'price'
            ? (typeof x.delta === 'number' && Number.isFinite(x.delta) ? `${x.delta > 0 ? '+' : ''}${formatNumber(x.delta, 2)} R$` : '—')
            : (x.bps === null ? '—' : `${x.bps > 0 ? '+' : ''}${formatNumber(x.bps, 1)} bp`);
        const deltaTone = x.unit === 'price'
            ? (typeof x.delta === 'number' && Number.isFinite(x.delta) ? (x.delta > 0 ? 'positive' : x.delta < 0 ? 'negative' : 'neutral') : 'neutral')
            : (x.bps === null ? 'neutral' : x.bps < 0 ? 'positive' : x.bps > 0 ? 'negative' : 'neutral');
        const deltaHtml = (x.unit === 'yield' && x.bps !== null) || (x.unit === 'price' && typeof x.delta === 'number' && Number.isFinite(x.delta))
            ? toneBadgeHtmlFromTone(deltaTone, x.unit === 'price' ? x.delta : x.bps, deltaTxt, { maxAbs: x.unit === 'price' ? 2 : 20 })
            : escapeHtml(deltaTxt);
        return `<div style="display:flex;justify-content:space-between;gap:10px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06);">
            <div style="opacity:.92;font-weight:900;letter-spacing:.6px;">${escapeHtml(x.name || x.symbol)}</div>
            <div style="display:flex;gap:14px;align-items:center;">
                <div style="font-family:'Share Tech Mono',monospace;font-weight:900;opacity:.95;min-width:92px;text-align:right;">${escapeHtml(x.unit === 'price' ? fmtMoney(x.rate) : fmtRate(x.rate))}</div>
                <div style="font-family:'Share Tech Mono',monospace;font-weight:900;min-width:92px;text-align:right;">${deltaHtml}</div>
            </div>
        </div>`;
    };

    el.innerHTML = `
        ${summary}
        ${riskAlert
            ? `<div style="margin-top:14px;border:1px solid rgba(255,80,90,.35);border-radius:12px;padding:12px;background:rgba(255,80,90,.08);">
                <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap;">
                    <div style="font-weight:900;letter-spacing:1px;opacity:.95;">${escapeHtml(riskAlert.title)}</div>
                    <div style="font-family:'Share Tech Mono',monospace;font-weight:900;opacity:.9;">${escapeHtml(riskAlert.detail)}</div>
                </div>
                <div style="margin-top:8px;opacity:.9;line-height:1.35;">${escapeHtml(riskAlert.op)}</div>
            </div>`
            : ''}
        ${essentials.length
            ? `<div style="margin-top:14px;border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:12px;background:rgba(0,0,0,.18);">
                <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;">
                    <div style="font-weight:900;letter-spacing:1px;opacity:.95;">Essenciais (nominal + real)</div>
                    <div style="opacity:.75;font-family:'Share Tech Mono',monospace;font-weight:900;">${escapeHtml(String(essentials.length))} itens</div>
                </div>
                <div style="margin-top:10px;">
                    ${essentials.map(essentialsRow).join('')}
                </div>
            </div>`
            : ''}
        <div style="margin-top:14px;border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:12px;background:rgba(0,0,0,.18);">
            <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;">
                <div style="font-weight:900;letter-spacing:1px;opacity:.95;">Títulos / Curva (último ponto)</div>
                <div style="opacity:.75;font-family:'Share Tech Mono',monospace;font-weight:900;">${escapeHtml(String(Math.min(items.length, 18)))} / ${escapeHtml(String(items.length))}</div>
            </div>
            <div style="margin-top:6px;opacity:.75;font-size:12px;">Para <b>yields</b>: Δ em <b>bp</b> (1bp ≈ 0,01 p.p.). Para <b>Tesouro Direto (PU)</b>: Δ em <b>R$</b>.</div>
            <div style="margin-top:10px;">
                ${items.slice(0, 18).map(row).join('')}
            </div>
        </div>
    `;
}

function loadAgenda() {
    try {
        const raw = localStorage.getItem('mercado_agenda');
        const arr = raw ? JSON.parse(raw) : [];
        return Array.isArray(arr) ? arr : [];
    } catch {
        return [];
    }
}

function saveAgenda(items) {
    try {
        localStorage.setItem('mercado_agenda', JSON.stringify(items || []));
    } catch {
    }
}

let agendaAutoCache = null;
let agendaAutoLoading = false;

let operationalInputs = {
    regime: null,
    optionsGamma: null,
    webNews: null,
    macro: null,
};

const operationalTuning = {
    threshold: { dxy: 0.12, em: 0.12, export: 0.25, yields: 0.12 },
    weight: { flow: 0.5, dxy: 0.4, export: 0.3, em: 0.4, yields: 0.25 },
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

let agendaReportCache = { br: null, us: null, cn: null };
let agendaReportLoading = { br: false, us: false, cn: false };

function agendaCountryFromCurrency(currency) {
    const c = String(currency || '').toUpperCase().trim();
    if (c === 'BRL') return 'BR';
    if (c === 'USD') return 'EUA';
    if (c === 'CNY' || c === 'CNH' || c === 'HKD') return 'CHINA/HK';
    return c ? 'OUTRO' : '—';
}

function agendaCountryLabel(country) {
    const c = String(country || '').toUpperCase().trim();
    if (c === 'BR') return 'BR';
    if (c === 'EUA') return 'EUA';
    if (c === 'CHINA/HK' || c === 'CHN' || c === 'CN') return 'CHINA/HK';
    if (c === 'OUTRO') return 'OUTRO';
    return '—';
}

function agendaLoadPrefs() {
    try {
        const view = String(localStorage.getItem('mercado_agenda_view') || 'agenda');
        const filter = String(localStorage.getItem('mercado_agenda_filter') || 'TODOS');
        const impact = String(localStorage.getItem('mercado_agenda_impact') || 'ALTO+MÉDIO');
        return { view, filter, impact };
    } catch {
        return { view: 'agenda', filter: 'TODOS', impact: 'ALTO+MÉDIO' };
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

function agendaExtractSection(text, startMarker, endMarkers) {
    const src = String(text || '');
    const startAt = src.indexOf(startMarker);
    if (startAt < 0) return '';
    const from = startAt + startMarker.length;
    let endAt = src.length;
    (Array.isArray(endMarkers) ? endMarkers : []).forEach(m => {
        const idx = src.indexOf(m, from);
        if (idx >= 0 && idx < endAt) endAt = idx;
    });
    return src.slice(from, endAt).trim();
}

function agendaRenderMarkdownBlock(raw) {
    const text = String(raw || '').replace(/\r\n/g, '\n');
    const lines = text.split('\n');
    const out = [];

    const flushPara = buf => {
        const t = buf.join(' ').trim();
        if (t) out.push(`<div style="opacity:.92;line-height:1.45;margin:8px 0;">${escapeHtml(t)}</div>`);
    };

    const renderTable = rows => {
        const cells = r => r
            .trim()
            .replace(/^\|/, '')
            .replace(/\|$/, '')
            .split('|')
            .map(x => escapeHtml(String(x || '').trim()));
        const head = cells(rows[0] || '');
        const body = rows.slice(2).map(cells).filter(r => r.length && r.some(x => x));
        const th = head.map(x => `<th style="text-align:left;padding:10px;border-bottom:1px solid rgba(255,255,255,.15);white-space:nowrap;">${x}</th>`).join('');
        const tr = body
            .map(r => `<tr>${r.map(x => `<td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.06);opacity:.92;">${x || '—'}</td>`).join('')}</tr>`)
            .join('');
        return `<table class="data-table" style="width:100%;border-collapse:collapse;table-layout:auto;margin:10px 0;">${th ? `<thead><tr>${th}</tr></thead>` : ''}<tbody>${tr}</tbody></table>`;
    };

    let para = [];
    let i = 0;
    while (i < lines.length) {
        const line = String(lines[i] || '');
        const t = line.trim();

        const isTableStart = t.startsWith('|') && i + 1 < lines.length && String(lines[i + 1] || '').trim().includes('|---');
        if (isTableStart) {
            flushPara(para);
            para = [];
            const rows = [];
            while (i < lines.length && String(lines[i] || '').trim().startsWith('|')) {
                rows.push(String(lines[i] || ''));
                i += 1;
            }
            out.push(renderTable(rows));
            continue;
        }

        const isHeading = /^#{2,4}\s+/.test(t);
        if (isHeading) {
            flushPara(para);
            para = [];
            const title = t.replace(/^#{2,4}\s+/, '').trim();
            out.push(`<div style="margin:14px 0 6px;font-weight:900;letter-spacing:1px;opacity:.95;">${escapeHtml(title)}</div>`);
            i += 1;
            continue;
        }

        const isListItem = /^(\d+\.)\s+/.test(t) || /^-\s+/.test(t);
        if (isListItem) {
            flushPara(para);
            para = [];
            const items = [];
            const isOrdered = /^\d+\.\s+/.test(t);
            while (i < lines.length) {
                const tt = String(lines[i] || '').trim();
                if (isOrdered && /^\d+\.\s+/.test(tt)) items.push(tt.replace(/^\d+\.\s+/, '').trim());
                else if (!isOrdered && /^-\s+/.test(tt)) items.push(tt.replace(/^-+\s+/, '').trim());
                else break;
                i += 1;
            }
            out.push(
                `<${isOrdered ? 'ol' : 'ul'} style="margin:8px 0 10px 18px;opacity:.92;line-height:1.45;">${items
                    .map(x => `<li style="margin:4px 0;">${escapeHtml(x)}</li>`)
                    .join('')}</${isOrdered ? 'ol' : 'ul'}>`,
            );
            continue;
        }

        if (!t) {
            flushPara(para);
            para = [];
            i += 1;
            continue;
        }

        if (/^={6,}/.test(t)) {
            flushPara(para);
            para = [];
            i += 1;
            continue;
        }

        para.push(t);
        i += 1;
    }
    flushPara(para);

    return out.join('');
}

function agendaFetchReport(key) {
    const k = String(key || '');
    if (!['br', 'us', 'cn'].includes(k)) return Promise.resolve(null);
    if (agendaReportCache[k] !== null) return Promise.resolve(agendaReportCache[k]);
    if (agendaReportLoading[k]) return Promise.resolve(null);

    try {
        const pre = window.AGENDA_REPORTS_SNIPPETS;
        const txt = pre && typeof pre === 'object' ? pre[k] : null;
        if (typeof txt === 'string' && txt.trim()) {
            agendaReportCache[k] = txt;
            return Promise.resolve(txt);
        }
    } catch {
    }

    agendaReportLoading[k] = true;

    const pathsByKey = {
        br: ['../../Ideias/Relatorios Brasil (padrao).txt', '../../Ideias/Relatorios Brasil.txt'],
        us: ['../../Ideias/Relatorios USA (padrao).txt', '../../Ideias/Relatorios USA.txt'],
        cn: ['../../Ideias/Relatorios CNY (padrao).txt', '../../Ideias/Relatorios CNY,txt'],
    };

    const candidates = pathsByKey[k] || [];
    const tryOne = idx => {
        const path = candidates[idx];
        if (!path) return Promise.resolve(null);
        return fetch(`${path}?ts=${Date.now()}`)
            .then(r => (r && r.ok ? r.text() : null))
            .catch(() => null)
            .then(t => (t ? t : tryOne(idx + 1)));
    };

    return tryOne(0)
        .then(text => {
            agendaReportCache[k] = text;
            return text;
        })
        .finally(() => {
            agendaReportLoading[k] = false;
        });
}

function agendaRenderReference(key, targetEl) {
    const k = String(key || '');
    const host = targetEl;
    if (!host) return;

    const renderError = () => {
        host.innerHTML = `<div style="padding:12px;opacity:.9;line-height:1.45;">
            Arquivo de referência não disponível. Para habilitar:
            <br>- mantenha os arquivos em <b>Ideias/</b> (Relatorios Brasil/USA/CNY)
            <br>- abra este dashboard via servidor (evita bloqueio do navegador em <b>file://</b>)
        </div>`;
    };

    agendaFetchReport(k).then(text => {
        if (!text) return renderError();

        if (k === 'br') {
            const agenda = agendaExtractSection(text, '## AGENDA (ALTA FREQUÊNCIA)', ['## MATRIZ', '# ', '===============================================================================']);
            const matrix = agendaExtractSection(text, '## MATRIZ (SE-ENTÃO) — BRASIL', ['===============================================================================', '# ', '## ']);
            const matrixCut = matrix ? matrix.split('\n').slice(0, 120).join('\n') : '';
            host.innerHTML = agendaRenderMarkdownBlock(`## AGENDA (ALTA FREQUÊNCIA)\n${agenda}\n\n## MATRIZ (SE-ENTÃO) — BRASIL\n${matrixCut}`);
            return;
        }

        if (k === 'us') {
            const conv = agendaExtractSection(text, '## CONVERSAO ET->BRT', ['## ', '# ', '===============================================================================']);
            const matrix = agendaExtractSection(text, '## MATRIZ DE REACAO CRUZADA', ['## ', '# ', '===============================================================================']);
            const danger = agendaExtractSection(text, '## COMBINACOES PERIGOSAS', ['## ', '# ', '===============================================================================']);
            const dangerCut = danger ? danger.split('\n').slice(0, 30).join('\n') : '';
            host.innerHTML = agendaRenderMarkdownBlock(
                `## CONVERSAO ET->BRT\n${conv}\n\n## MATRIZ DE REACAO CRUZADA\n${matrix}\n\n## COMBINACOES PERIGOSAS\n${dangerCut}`,
            );
            return;
        }

        if (k === 'cn') {
            const trig = agendaExtractSection(text, '## GATILHOS-CHAVE (TOP)', ['## MATRIZ', '# ', '===============================================================================']);
            const matrix = agendaExtractSection(text, '## MATRIZ (SE-ENTAO) — CHINA->BR (preencher)', ['## ', '# ', '===============================================================================']);
            const matrixCut = matrix ? matrix.split('\n').slice(0, 120).join('\n') : '';
            host.innerHTML = agendaRenderMarkdownBlock(
                `## GATILHOS-CHAVE (TOP)\n${trig}\n\n## MATRIZ (SE-ENTAO) — CHINA->BR (preencher)\n${matrixCut}`,
            );
            return;
        }

        renderError();
    });
}

function renderAgendaMatrix() {
    const el = document.getElementById('agendaMatrix');
    if (!el) return;

    fetchAgendaAuto();

    const prefs = agendaLoadPrefs();
    const view = String(prefs.view || 'agenda');
    const filter = String(prefs.filter || 'TODOS');
    const impactFilter = String(prefs.impact || 'ALTO+MÉDIO');

    const seen = new Set();

    const autoRaw = Array.isArray(agendaAutoCache) ? agendaAutoCache : [];
    const allowedAutoCurrencies = new Set(['BRL', 'USD', 'EUR', 'CNY', 'CNH', 'HKD', 'JPY', 'GBP']);
    const autoAll = autoRaw
        .map(x => ({
            id: `auto_${String(x && x.id ? x.id : `${Date.now()}_${Math.random().toString(16).slice(2)}`)}`,
            time: String(x && x.time ? x.time : ''),
            currency: String(x && x.currency ? x.currency : '').toUpperCase(),
            event: String(x && x.event ? x.event : ''),
            country: agendaCountryFromCurrency(x && x.currency ? x.currency : ''),
            impact: String(x && x.impact ? x.impact : 'MÉDIO').toUpperCase(),
            wdo: String(x && x.wdo ? x.wdo : ''),
            win: String(x && x.win ? x.win : ''),
            src: 'auto',
        }))
        .filter(x => (x.event || x.time) && allowedAutoCurrencies.has(x.currency))
        .filter(x => {
            const k = `${x.country}::${x.time}::${x.event}`;
            if (seen.has(k)) return false;
            seen.add(k);
            return true;
        })
        .sort((a, b) => {
            const aa = String(a.time || '').replace(/[^\d:]/g, '');
            const bb = String(b.time || '').replace(/[^\d:]/g, '');
            return aa.localeCompare(bb) || String(a.event || '').localeCompare(String(b.event || ''));
        });

    const byCountryKey = items => {
        const out = { BR: [], EUA: [], 'CHINA/HK': [], OUTRO: [] };
        items.forEach(x => {
            const k = agendaCountryLabel(x && x.country ? x.country : '');
            if (k === 'BR') out.BR.push(x);
            else if (k === 'EUA') out.EUA.push(x);
            else if (k === 'CHINA/HK') out['CHINA/HK'].push(x);
            else out.OUTRO.push(x);
        });
        return out;
    };

    const sortItems = list => list.slice().sort((a, b) => {
        const aa = String(a.time || '').replace(/[^\d:]/g, '');
        const bb = String(b.time || '').replace(/[^\d:]/g, '');
        return aa.localeCompare(bb) || String(a.event || '').localeCompare(String(b.event || ''));
    });

    const normalizeAgendaText = s => {
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

    const isMustInclude = item => {
        const ev = normalizeAgendaText(item && item.event ? item.event : '');
        if (!ev) return false;
        return /\b(estoques?\s+de\s+petroleo\s+bruto|crude\s+oil\s+inventories)\b/.test(ev);
    };

    const pickWithMustInclude = (list, limit) => {
        const sorted = sortItems(list);
        const head = sorted.slice(0, Math.max(0, limit || 0));
        const must = sorted.filter(isMustInclude);
        const byId = new Set(head.map(x => String(x && x.id ? x.id : '')));
        for (const m of must) {
            const id = String(m && m.id ? m.id : '');
            if (!id) continue;
            if (byId.has(id)) continue;
            byId.add(id);
            head.push(m);
        }
        return head;
    };

    const autoByCountry = byCountryKey(autoAll);
    const autoItems = []
        .concat(pickWithMustInclude(autoByCountry.BR, 14))
        .concat(pickWithMustInclude(autoByCountry.EUA, 14))
        .concat(pickWithMustInclude(autoByCountry['CHINA/HK'], 14))
        .concat(pickWithMustInclude(autoByCountry.OUTRO, 10));

    const allItems = autoItems;
    const viewKey = String(view || 'agenda').toLowerCase();
    const viewCountry = viewKey === 'br' ? 'BR' : viewKey === 'us' ? 'EUA' : viewKey === 'cn' ? 'CHINA/HK' : null;
    const wanted = String(viewCountry || filter || 'TODOS').toUpperCase();
    const impactWanted = String(impactFilter || 'ALTO+MÉDIO').toUpperCase();
    const impactOk = impact => {
        const v = String(impact || '').toUpperCase();
        if (impactWanted === 'TODOS') return true;
        if (impactWanted === 'ALTO+MÉDIO') return v === 'ALTO' || v === 'MÉDIO';
        return v === impactWanted;
    };
    const filteredItems = (wanted !== 'TODOS'
        ? allItems.filter(x => String(agendaCountryLabel(x.country) || '').toUpperCase() === wanted)
        : allItems).filter(x => impactOk(x.impact));

    const autoKnownEmpty = Array.isArray(agendaAutoCache) && agendaAutoCache.length === 0;
    const emptyMessage = agendaAutoLoading
        ? 'Carregando eventos automáticos…'
        : autoKnownEmpty
            ? 'Sem eventos automáticos (captura bloqueada/indisponível).'
            : 'Sem eventos do dia.';

    const rowHtml = list => list
        .map(x => {
            const tone = x.impact === 'ALTO' ? 'negative' : x.impact === 'BAIXO' ? 'neutral' : 'positive';
            const ev = x.src === 'auto' ? `AUTO • ${x.event}` : x.event;
            return `<tr>
                <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.06);font-family:'Share Tech Mono',monospace;font-weight:900;opacity:.9;">${escapeHtml(x.time || '—')}</td>
                <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.06);font-weight:800;opacity:.95;">${escapeHtml(ev || '—')}</td>
                <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.06);"><span class="${tone}" style="font-weight:900;">${escapeHtml(x.impact)}</span></td>
                <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.06);opacity:.9;">${escapeHtml(x.wdo || '—')}</td>
                <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.06);opacity:.9;">${escapeHtml(x.win || '—')}</td>
            </tr>`;
        })
        .join('');

    const tableHtml = (title, list) => {
        const rows = rowHtml(list);
        const msg = agendaAutoLoading && agendaAutoCache === null ? 'Carregando…' : emptyMessage;
        return `
            <div style="margin:14px 0 8px;display:flex;align-items:center;justify-content:space-between;gap:10px;">
                <div style="font-weight:900;letter-spacing:1px;opacity:.95;">${escapeHtml(title)}</div>
                <div style="opacity:.75;font-family:'Share Tech Mono',monospace;font-weight:900;">${escapeHtml(String(list.length))} itens</div>
            </div>
            <table class="data-table" style="width:100%;border-collapse:collapse;table-layout:auto;">
                <thead>
                    <tr>
                        <th style="text-align:left;padding:10px;border-bottom:1px solid rgba(255,255,255,.15);min-width:90px;width:1%;">Hora</th>
                        <th style="text-align:left;padding:10px;border-bottom:1px solid rgba(255,255,255,.15);">Evento</th>
                        <th style="text-align:left;padding:10px;border-bottom:1px solid rgba(255,255,255,.15);min-width:90px;width:1%;">Impacto</th>
                        <th style="text-align:left;padding:10px;border-bottom:1px solid rgba(255,255,255,.15);">Reação WDO</th>
                        <th style="text-align:left;padding:10px;border-bottom:1px solid rgba(255,255,255,.15);">Reação WIN</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows || `<tr><td colspan="5" style="padding:12px;opacity:.85;">${escapeHtml(msg)}</td></tr>`}
                </tbody>
            </table>
        `;
    };

    const shown = wanted !== 'TODOS'
        ? { [wanted]: sortItems(filteredItems) }
        : {
            BR: sortItems(filteredItems.filter(x => agendaCountryLabel(x.country) === 'BR')),
            EUA: sortItems(filteredItems.filter(x => agendaCountryLabel(x.country) === 'EUA')),
            'CHINA/HK': sortItems(filteredItems.filter(x => agendaCountryLabel(x.country) === 'CHINA/HK')),
            OUTRO: sortItems(filteredItems.filter(x => agendaCountryLabel(x.country) === 'OUTRO')),
        };

    const filterBarAgenda = `
        <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin:0 0 12px;">
            <div style="opacity:.88;font-weight:900;letter-spacing:1px;">Mostrar</div>
            <select id="agendaFilter" style="width:160px;background:#141414;color:#e0e0e0;border:1px solid #333;padding:8px 10px;border-radius:6px;font-weight:900;">
                <option value="TODOS">TODOS</option>
                <option value="BR">BR</option>
                <option value="EUA">EUA</option>
                <option value="CHINA/HK">CHINA/HK</option>
                <option value="OUTRO">OUTRO</option>
            </select>
            <div style="opacity:.88;font-weight:900;letter-spacing:1px;">Impacto</div>
            <select id="agendaImpactFilter" style="width:180px;background:#141414;color:#e0e0e0;border:1px solid #333;padding:8px 10px;border-radius:6px;font-weight:900;">
                <option value="ALTO+MÉDIO">ALTO+MÉDIO</option>
                <option value="ALTO">ALTO</option>
                <option value="MÉDIO">MÉDIO</option>
                <option value="BAIXO">BAIXO</option>
                <option value="TODOS">TODOS</option>
            </select>
        </div>
    `;
    const filterBarCountry = `
        <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin:0 0 12px;">
            <div style="opacity:.88;font-weight:900;letter-spacing:1px;">Impacto</div>
            <select id="agendaImpactFilter" style="width:180px;background:#141414;color:#e0e0e0;border:1px solid #333;padding:8px 10px;border-radius:6px;font-weight:900;">
                <option value="ALTO+MÉDIO">ALTO+MÉDIO</option>
                <option value="ALTO">ALTO</option>
                <option value="MÉDIO">MÉDIO</option>
                <option value="BAIXO">BAIXO</option>
                <option value="TODOS">TODOS</option>
            </select>
        </div>
    `;
    el.innerHTML =
        viewKey !== 'agenda'
            ? `
        ${agendaTabsHtml(view)}
        ${filterBarCountry}
        <div>
            ${tableHtml(`${agendaCountryLabel(wanted)} (eventos do dia)`, shown[wanted] || [])}
        </div>
    `
            : `
        ${agendaTabsHtml(view)}
        ${filterBarAgenda}
        <div>
            ${wanted === 'TODOS'
                ? `${tableHtml('BRASIL (eventos do dia)', shown.BR)}${tableHtml('EUA (eventos do dia)', shown.EUA)}${tableHtml('CHINA/HK (eventos do dia)', shown['CHINA/HK'])}${shown.OUTRO && shown.OUTRO.length ? tableHtml('OUTRO', shown.OUTRO) : ''}`
                : tableHtml(agendaCountryLabel(wanted), shown[wanted] || [])}
        </div>
    `;

    el.querySelectorAll('button[data-agenda-view]').forEach(btn => {
        btn.addEventListener('click', () => {
            const nextView = btn.getAttribute('data-agenda-view') || 'agenda';
            agendaSavePrefs({ view: nextView });
            renderAgendaMatrix();
        });
    });

    const filterSel = document.getElementById('agendaFilter');
    if (filterSel) {
        try {
            filterSel.value = filter || 'TODOS';
        } catch {
        }
        filterSel.addEventListener('change', () => {
            const nextFilter = String(filterSel.value || 'TODOS');
            agendaSavePrefs({ filter: nextFilter });
            renderAgendaMatrix();
        });
    }

    const impactSel = document.getElementById('agendaImpactFilter');
    if (impactSel) {
        try {
            impactSel.value = impactFilter || 'ALTO+MÉDIO';
        } catch {
        }
        impactSel.addEventListener('change', () => {
            const nextImpact = String(impactSel.value || 'ALTO+MÉDIO');
            agendaSavePrefs({ impact: nextImpact });
            renderAgendaMatrix();
        });
    }
}

function renderDataAudit(data) {
    const el = document.getElementById('dataAudit');
    if (!el) return;

    const assets = data.assets || [];
    const nowMs = Date.now();
    const rows = assets.map(a => ({ a, last: getLastPoint(data, a.symbol) }));
    const withPrice = rows.filter(x => x.last && typeof x.last.price === 'number');
    const missing = rows.filter(x => !(x.last && typeof x.last.price === 'number'));
    const withTime = withPrice
        .map(x => {
            const t = x.last && x.last.t ? Date.parse(x.last.t) : NaN;
            return { ...x, tMs: Number.isFinite(t) ? t : null };
        })
        .filter(x => x.tMs !== null);

    const staleMs = 6 * 60 * 60 * 1000;
    const fresh = withTime.filter(x => nowMs - x.tMs <= staleMs);
    const stale = withTime
        .filter(x => nowMs - x.tMs > staleMs)
        .map(x => ({ ...x, ageMs: nowMs - x.tMs }))
        .sort((a, b) => b.ageMs - a.ageMs)
        .slice(0, 12);

    const fmtAge = ms => {
        const m = Math.floor(ms / 60000);
        const h = Math.floor(m / 60);
        const mm = m - h * 60;
        return h > 0 ? `${h}h${String(mm).padStart(2, '0')}` : `${m}m`;
    };

    const critical = [
        { label: 'USD/BRL', r: /^USD\/BRL\b/i },
        { label: 'WDO', r: /^WDO/i },
        { label: 'WIN', r: /^WIN/i },
        { label: 'IBOV', r: /(^\.BVSP$|\bIbovespa\b)/i },
        { label: 'EWZ', r: /^EWZ$/i },
        { label: 'BOVA11', r: /^BOVA11\.SA$/i },
        { label: 'DXY', r: /(^\.DXY$|\bDXY\b)/i },
        { label: 'Brent', r: /\bBrent\b/i },
        { label: 'WTI', r: /\bWTI\b/i },
        { label: 'FXI', r: /^FXI$/i },
        { label: 'CSI300', r: /^\.(CSI300)\b/i },
        { label: 'Minério', r: /^TIOc1$|^SM58Fc1$/i },
        { label: 'Soja', r: /^ZS$/i },
        { label: 'BR10Y', r: /^BR10YT=RR$/i },
    ].map(x => ({ ...x, found: !!findAssetSymbol(data, x.r) }));

    const chips = critical
        .map(x => {
            const tone = x.found ? 'rgba(0,255,160,.18)' : 'rgba(255,60,80,.18)';
            const border = x.found ? 'rgba(0,255,160,.35)' : 'rgba(255,60,80,.35)';
            const color = x.found ? 'rgba(0,255,160,.95)' : 'rgba(255,60,80,.95)';
            return `<span style="display:inline-flex;align-items:center;gap:8px;padding:6px 10px;border-radius:999px;border:1px solid ${border};background:${tone};color:${color};font-weight:900;letter-spacing:1px;">
                ${escapeHtml(x.label)} ${x.found ? '✓' : '✕'}
            </span>`;
        })
        .join(' ');

    const staleRows = stale
        .map(x => `<tr>
            <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.06);font-family:'Share Tech Mono',monospace;font-weight:900;opacity:.9;">${escapeHtml(symbolKey(x.a.symbol) || x.a.symbol)}</td>
            <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.06);opacity:.9;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(x.a.name || '')}</td>
            <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.06);text-align:right;opacity:.9;">${escapeHtml(fmtAge(x.ageMs))}</td>
            <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.06);text-align:right;opacity:.9;">${escapeHtml(x.last && x.last.t ? formatDateTime(x.last.t) : '—')}</td>
        </tr>`)
        .join('');

    el.innerHTML = `
        <div class="metrics-grid" style="margin:0;">
            <div class="metric-card">
                <div class="metric-icon">🧭</div>
                <div class="metric-value">${escapeHtml(String(assets.length))}</div>
                <div class="metric-label">Ativos</div>
                <div class="metric-change neutral">monitorados</div>
            </div>
            <div class="metric-card">
                <div class="metric-icon">✅</div>
                <div class="metric-value">${escapeHtml(String(withPrice.length))}</div>
                <div class="metric-label">Com preço</div>
                <div class="metric-change neutral">${escapeHtml(formatNumber((assets.length ? (withPrice.length / assets.length) * 100 : 0), 0))}%</div>
            </div>
            <div class="metric-card">
                <div class="metric-icon">⏱️</div>
                <div class="metric-value">${escapeHtml(String(fresh.length))}</div>
                <div class="metric-label">Atualizados (&lt;6h)</div>
                <div class="metric-change neutral">${escapeHtml(formatNumber((withTime.length ? (fresh.length / withTime.length) * 100 : 0), 0))}%</div>
            </div>
            <div class="metric-card">
                <div class="metric-icon">⚠️</div>
                <div class="metric-value">${escapeHtml(String(missing.length))}</div>
                <div class="metric-label">Sem preço</div>
                <div class="metric-change neutral">${escapeHtml(formatNumber((assets.length ? (missing.length / assets.length) * 100 : 0), 0))}%</div>
            </div>
        </div>

        <div style="margin-top:14px;border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:12px;background:rgba(0,0,0,.18);">
            <div style="font-weight:900;letter-spacing:1px;opacity:.95;margin-bottom:8px;">Críticos</div>
            <div style="display:flex;flex-wrap:wrap;gap:8px;line-height:1.6;">${chips}</div>
        </div>

        <div style="margin-top:14px;border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:12px;background:rgba(0,0,0,.18);">
            <div style="font-weight:900;letter-spacing:1px;opacity:.95;margin-bottom:8px;">Mais desatualizados</div>
            <table class="data-table" style="width:100%;border-collapse:collapse;table-layout:auto;">
                <thead>
                    <tr>
                        <th style="text-align:left;padding:10px;border-bottom:1px solid rgba(255,255,255,.15);min-width:120px;width:1%;">Símbolo</th>
                        <th style="text-align:left;padding:10px;border-bottom:1px solid rgba(255,255,255,.15);">Ativo</th>
                        <th style="text-align:right;padding:10px;border-bottom:1px solid rgba(255,255,255,.15);min-width:90px;width:1%;">Idade</th>
                        <th style="text-align:right;padding:10px;border-bottom:1px solid rgba(255,255,255,.15);min-width:160px;width:1%;">Atualização</th>
                    </tr>
                </thead>
                <tbody>
                    ${staleRows || `<tr><td colspan="4" style="padding:12px;opacity:.85;">Nenhum item está &gt; 6h (ou sem timestamps).</td></tr>`}
                </tbody>
            </table>
        </div>
    `;
}

function renderAssetsCatalog(data) {
    const el = document.getElementById('assetsCatalog');
    if (!el) return;

    const isNum = v => typeof v === 'number' && Number.isFinite(v);
    const assets = Array.isArray(data && data.assets) ? data.assets : [];
    const series = data && data.series ? data.series : {};
    const generatedAt = data && data.meta && data.meta.generatedAt ? String(data.meta.generatedAt) : '';

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
            const lastChangePct = best && isNum(best.changePct) ? best.changePct : null;
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
            const raw = localStorage.getItem(storageKey);
            if (!raw) return null;
            const obj = JSON.parse(raw);
            if (!obj || typeof obj !== 'object') return null;
            const syms = Array.isArray(obj.symbols) ? obj.symbols.map(x => String(x)) : [];
            return { symbols: new Set(syms), at: obj.at ? String(obj.at) : '' };
        } catch {
            return null;
        }
    })();
    const curSymbols = new Set(rowsAll.map(r => r.symbol));
    const delta = (() => {
        if (!prev) return { added: [], removed: [], at: '' };
        const added = [];
        const removed = [];
        for (const s of curSymbols) if (!prev.symbols.has(s)) added.push(s);
        for (const s of prev.symbols) if (!curSymbols.has(s)) removed.push(s);
        return { added: added.sort(), removed: removed.sort(), at: prev.at };
    })();
    try {
        localStorage.setItem(storageKey, JSON.stringify({ at: generatedAt || new Date().toISOString(), symbols: Array.from(curSymbols).sort() }));
    } catch {
    }

    const pulseNow = typeof computeOperationalPulseNow === 'function' ? computeOperationalPulseNow(data) : null;
    const hkNow = typeof computeHk50PulseNow === 'function' ? computeHk50PulseNow(data, null) : null;
    const mapping = (() => {
        const a = pulseNow && pulseNow.sym ? pulseNow.sym : {};
        const b = hkNow && hkNow.sym ? hkNow.sym : {};
        const extras = {
            usdCnh: b.usdCnh || findAliasSymbolBest(data, 'USD_CNH') || null,
            usdCny: b.usdCny || findAliasSymbolBest(data, 'USD_CNY') || null,
            usdHkd: findAliasSymbolBest(data, 'USD_HKD') || null,
            hk50: b.hk50 || findAliasSymbolBest(data, 'HK50') || null,
            hstech: b.hstech || findAliasSymbolBest(data, 'HSTECH') || null,
            hsfin: b.hsfin || findAliasSymbolBest(data, 'HSI_FIN') || null,
            ewh: b.ewh || findAliasSymbolBest(data, 'EWH') || null,
            ndx: b.ndx || findAliasSymbolBest(data, 'NDX') || null,
            vhsi: b.vhsi || findAliasSymbolBest(data, 'VHSI') || null,
            hk1m: b.hk1m || findAliasSymbolBest(data, 'HK1M') || null,
            hk3m: b.hk3m || findAliasSymbolBest(data, 'HK3M') || null,
            us10hk10: b.us10hk10 || findAliasSymbolBest(data, 'SPREAD_HK10Y') || null,
            mchi: findAliasSymbolBest(data, 'MCHI') || null,
            audusd: findAssetSymbol(data, /^AUD\/USD\b/i) || null,
            cdsCn5y: findAliasSymbolBest(data, 'CDS_CN5Y') || null,
        };
        return { ...a, ...b, ...extras };
    })();
    const bySymbol = (() => {
        const m = new Map();
        for (const r of rowsAll) m.set(r.symbol, r);
        return m;
    })();
    const candidatesFor = aliasKey => {
        const matchers = typeof assetAliasMatchers === 'function' ? assetAliasMatchers(aliasKey) : [];
        const out = [];
        const seen = new Set();
        for (const re of matchers) {
            if (!(re instanceof RegExp)) continue;
            for (const r of rowsAll) {
                const sym = String(r.symbol || '');
                const name = String(r.name || '');
                if (!sym || seen.has(sym)) continue;
                if (re.test(sym) || re.test(name)) {
                    out.push(sym);
                    seen.add(sym);
                    if (out.length >= 6) return out;
                }
            }
        }
        return out;
    };
    const mappingRow = (label, key, aliasKey) => {
        const val = mapping && mapping[key] ? String(mapping[key]) : '—';
        const meta = val && val !== '—' ? bySymbol.get(val) : null;
        const metaLine = meta ? `${String(meta.name || '—')} • ${String(meta.category || '—')} • ${String(meta.exchange || '—')}` : '';
        const cands = aliasKey ? candidatesFor(aliasKey).filter(s => s !== val) : [];
        const candLine = cands.length ? `candidatos: ${cands.slice(0, 4).join(', ')}${cands.length > 4 ? `… +${cands.length - 4}` : ''}` : '';
        return `<tr>
            <td style="padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.06);font-weight:900;opacity:.92;">${escapeHtml(label)}</td>
            <td style="padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.06);">
                <div style="font-family:'Share Tech Mono',monospace;font-weight:900;opacity:.9;">${escapeHtml(val)}</div>
                ${metaLine ? `<div style="opacity:.72;font-size:12px;margin-top:2px;line-height:1.25;">${escapeHtml(metaLine)}</div>` : ''}
                ${candLine ? `<div style="opacity:.72;font-size:12px;margin-top:2px;line-height:1.25;">${escapeHtml(candLine)}</div>` : ''}
            </td>
        </tr>`;
    };

    const render = () => {
        const qEl = document.getElementById('assetsCatalogQuery');
        const cEl = document.getElementById('assetsCatalogCategory');
        const onlyEl = document.getElementById('assetsCatalogOnly');
        const sortEl = document.getElementById('assetsCatalogSort');
        const q = qEl ? String(qEl.value || '').trim().toLowerCase() : '';
        const cat = cEl ? String(cEl.value || '') : '';
        const only = onlyEl ? String(onlyEl.value || 'all') : 'all';
        const sort = sortEl ? String(sortEl.value || 'symbol') : 'symbol';

        let rows = rowsAll.slice();
        if (cat) rows = rows.filter(r => r.category === cat);
        if (only === 'no_price') rows = rows.filter(r => r.hasSeries && !r.hasPrice);
        if (only === 'no_series') rows = rows.filter(r => !r.hasSeries);
        if (q) {
            rows = rows.filter(r => {
                const hay = `${r.symbol} ${r.name} ${r.category} ${r.exchange} ${(r.tags || []).join(' ')}`.toLowerCase();
                return hay.includes(q);
            });
        }

        const ms = t => {
            const x = t ? Date.parse(t) : NaN;
            return Number.isFinite(x) ? x : -Infinity;
        };
        if (sort === 'last') rows.sort((a, b) => ms(b.lastT) - ms(a.lastT));
        if (sort === 'pct') rows.sort((a, b) => (isNum(b.lastChangePct) ? b.lastChangePct : -Infinity) - (isNum(a.lastChangePct) ? a.lastChangePct : -Infinity));
        if (sort === 'points') rows.sort((a, b) => b.points - a.points);
        if (sort === 'symbol') rows.sort((a, b) => a.symbol.localeCompare(b.symbol, 'en'));

        const tbody = rows
            .slice(0, 240)
            .map(r => {
                const t = r.lastT ? formatDateTime(r.lastT) : '—';
                const pct = isNum(r.lastChangePct) ? formatPercent(r.lastChangePct, 2) : '—';
                const ext = isNum(r.lastExtChangePct) ? formatPercent(r.lastExtChangePct, 2) : '—';
                const price = isNum(r.lastPrice) ? formatNumber(r.lastPrice, 6) : '—';
                const seriesTxt = r.hasSeries ? escapeHtml(String(r.points)) : '—';
                const tone = r.hasPrice ? 'neutral' : r.hasSeries ? 'negative' : 'negative';
                const symCell = badge(tone, r.symbol);
                return `<tr>
                    <td style="padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.06);">${symCell}</td>
                    <td style="padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.06);opacity:.92;">${escapeHtml(r.name || '')}</td>
                    <td style="padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.06);opacity:.85;white-space:nowrap;">${escapeHtml(r.category || '—')}</td>
                    <td style="padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.06);text-align:right;font-family:'Share Tech Mono',monospace;font-weight:900;opacity:.9;white-space:nowrap;">${escapeHtml(pct)}</td>
                    <td style="padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.06);text-align:right;font-family:'Share Tech Mono',monospace;font-weight:900;opacity:.75;white-space:nowrap;">${escapeHtml(ext)}</td>
                    <td style="padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.06);text-align:right;font-family:'Share Tech Mono',monospace;font-weight:900;opacity:.92;white-space:nowrap;">${escapeHtml(price)}</td>
                    <td style="padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.06);text-align:right;font-family:'Share Tech Mono',monospace;font-weight:900;opacity:.85;">${seriesTxt}</td>
                    <td style="padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.06);text-align:right;opacity:.88;white-space:nowrap;">${escapeHtml(t)}</td>
                </tr>`;
            })
            .join('');

        const out = document.getElementById('assetsCatalogTableBody');
        if (out) out.innerHTML = tbody || '';
        const meta = document.getElementById('assetsCatalogMeta');
        if (meta) meta.innerHTML = `${badge('neutral', `Exibindo: ${rows.length}`)} ${badge('neutral', `Limite: ${Math.min(240, rows.length)}`)}`;
    };

    const onCopy = () => {
        const qEl = document.getElementById('assetsCatalogQuery');
        const cEl = document.getElementById('assetsCatalogCategory');
        const onlyEl = document.getElementById('assetsCatalogOnly');
        const q = qEl ? String(qEl.value || '').trim().toLowerCase() : '';
        const cat = cEl ? String(cEl.value || '') : '';
        const only = onlyEl ? String(onlyEl.value || 'all') : 'all';
        let rows = rowsAll.slice();
        if (cat) rows = rows.filter(r => r.category === cat);
        if (only === 'no_price') rows = rows.filter(r => r.hasSeries && !r.hasPrice);
        if (only === 'no_series') rows = rows.filter(r => !r.hasSeries);
        if (q) {
            rows = rows.filter(r => {
                const hay = `${r.symbol} ${r.name} ${r.category} ${r.exchange} ${(r.tags || []).join(' ')}`.toLowerCase();
                return hay.includes(q);
            });
        }
        const text = rows.map(r => r.symbol).join('\n');
        const fallback = () => {
            try {
                const ta = document.createElement('textarea');
                ta.value = text;
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
        const ok = navigator.clipboard && navigator.clipboard.writeText ? navigator.clipboard.writeText(text).then(() => true).catch(() => fallback()) : Promise.resolve(fallback());
        ok.then(() => {
            const btn = document.getElementById('assetsCatalogCopy');
            if (!btn) return;
            const prev = btn.textContent;
            btn.textContent = 'Copiado';
            setTimeout(() => {
                btn.textContent = prev || 'Copiar símbolos';
            }, 900);
        });
    };

    el.innerHTML = `
        <div style="border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:12px;background:rgba(0,0,0,.18);">
            <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
                <div style="font-weight:900;letter-spacing:1px;opacity:.95;">Catálogo CSV (autoatualizável)</div>
                <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
                    ${badge('neutral', `Ativos: ${counts.assets}`)}
                    ${badge('neutral', `Com série: ${counts.withSeries}`)}
                    ${badge('neutral', `Com preço: ${counts.withPrice}`)}
                    ${counts.noSeries ? badge('negative', `Sem série: ${counts.noSeries}`) : badge('positive', 'Sem série: 0')}
                    ${counts.noPrice ? badge('negative', `Sem preço: ${counts.noPrice}`) : badge('positive', 'Sem preço: 0')}
                </div>
            </div>

            <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;opacity:.95;line-height:1.45;">
                ${mkCategoryCounts()}
            </div>

            <div style="margin-top:12px;display:flex;gap:10px;flex-wrap:wrap;align-items:center;">
                <input id="assetsCatalogQuery" type="text" inputmode="search" autocomplete="off" placeholder="Buscar símbolo/nome/categoria..." style="flex:1;min-width:220px;background:#101010;color:#e0e0e0;border:1px solid rgba(255,255,255,.14);padding:8px 10px;border-radius:10px;font-weight:900;" />
                <select id="assetsCatalogCategory" style="background:#101010;color:#e0e0e0;border:1px solid rgba(255,255,255,.14);padding:8px 10px;border-radius:10px;font-weight:900;">
                    <option value="">Todas categorias</option>
                    ${categories.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('')}
                </select>
                <select id="assetsCatalogOnly" style="background:#101010;color:#e0e0e0;border:1px solid rgba(255,255,255,.14);padding:8px 10px;border-radius:10px;font-weight:900;">
                    <option value="all">Tudo</option>
                    <option value="no_price">Somente sem preço</option>
                    <option value="no_series">Somente sem série</option>
                </select>
                <select id="assetsCatalogSort" style="background:#101010;color:#e0e0e0;border:1px solid rgba(255,255,255,.14);padding:8px 10px;border-radius:10px;font-weight:900;">
                    <option value="symbol">Ordenar: símbolo</option>
                    <option value="last">Ordenar: atualização</option>
                    <option value="pct">Ordenar: variação</option>
                    <option value="points">Ordenar: pontos</option>
                </select>
                <button id="assetsCatalogCopy" type="button" style="border:1px solid rgba(255,255,255,.18);border-radius:10px;padding:8px 10px;background:#151515;color:#e0e0e0;font-weight:900;letter-spacing:.4px;cursor:pointer;">Copiar símbolos</button>
            </div>

            <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
                <div id="assetsCatalogMeta"></div>
                ${delta.added.length ? badge('positive', `Novos: ${delta.added.length}`) : badge('neutral', 'Novos: 0')}
                ${delta.removed.length ? badge('negative', `Removidos: ${delta.removed.length}`) : badge('neutral', 'Removidos: 0')}
                ${delta.at ? badge('neutral', `Última base: ${formatDateTime(delta.at)}`) : badge('neutral', 'Última base: —')}
            </div>

            ${(delta.added.length || delta.removed.length) ? `
                <div style="margin-top:10px;display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:10px;">
                    <div style="border:1px solid rgba(255,255,255,.10);border-radius:12px;padding:10px;background:rgba(0,0,0,.16);">
                        <div style="font-weight:900;letter-spacing:.6px;opacity:.9;margin-bottom:6px;">Novos</div>
                        <div style="font-family:'Share Tech Mono',monospace;font-weight:900;opacity:.9;line-height:1.5;white-space:pre-wrap;">${escapeHtml(delta.added.slice(0, 24).join('  ') || '—')}${delta.added.length > 24 ? `<span style="opacity:.75;"> …</span>` : ''}</div>
                    </div>
                    <div style="border:1px solid rgba(255,255,255,.10);border-radius:12px;padding:10px;background:rgba(0,0,0,.16);">
                        <div style="font-weight:900;letter-spacing:.6px;opacity:.9;margin-bottom:6px;">Removidos</div>
                        <div style="font-family:'Share Tech Mono',monospace;font-weight:900;opacity:.9;line-height:1.5;white-space:pre-wrap;">${escapeHtml(delta.removed.slice(0, 24).join('  ') || '—')}${delta.removed.length > 24 ? `<span style="opacity:.75;"> …</span>` : ''}</div>
                    </div>
                </div>
            ` : ''}

            <div style="margin-top:12px;border:1px solid rgba(255,255,255,.10);border-radius:12px;overflow:hidden;">
                <div style="overflow:auto;max-height:520px;">
                    <table style="width:100%;border-collapse:collapse;">
                        <thead>
                            <tr>
                                <th style="position:sticky;top:0;background:rgba(10,10,10,.98);backdrop-filter:blur(6px);padding:9px 10px;text-align:left;border-bottom:1px solid rgba(255,255,255,.08);font-weight:900;letter-spacing:.6px;opacity:.85;">Símbolo</th>
                                <th style="position:sticky;top:0;background:rgba(10,10,10,.98);backdrop-filter:blur(6px);padding:9px 10px;text-align:left;border-bottom:1px solid rgba(255,255,255,.08);font-weight:900;letter-spacing:.6px;opacity:.85;">Nome</th>
                                <th style="position:sticky;top:0;background:rgba(10,10,10,.98);backdrop-filter:blur(6px);padding:9px 10px;text-align:left;border-bottom:1px solid rgba(255,255,255,.08);font-weight:900;letter-spacing:.6px;opacity:.85;">Cat</th>
                                <th style="position:sticky;top:0;background:rgba(10,10,10,.98);backdrop-filter:blur(6px);padding:9px 10px;text-align:right;border-bottom:1px solid rgba(255,255,255,.08);font-weight:900;letter-spacing:.6px;opacity:.85;">Δ%</th>
                                <th style="position:sticky;top:0;background:rgba(10,10,10,.98);backdrop-filter:blur(6px);padding:9px 10px;text-align:right;border-bottom:1px solid rgba(255,255,255,.08);font-weight:900;letter-spacing:.6px;opacity:.65;">Ext%</th>
                                <th style="position:sticky;top:0;background:rgba(10,10,10,.98);backdrop-filter:blur(6px);padding:9px 10px;text-align:right;border-bottom:1px solid rgba(255,255,255,.08);font-weight:900;letter-spacing:.6px;opacity:.85;">Preço</th>
                                <th style="position:sticky;top:0;background:rgba(10,10,10,.98);backdrop-filter:blur(6px);padding:9px 10px;text-align:right;border-bottom:1px solid rgba(255,255,255,.08);font-weight:900;letter-spacing:.6px;opacity:.85;">Pts</th>
                                <th style="position:sticky;top:0;background:rgba(10,10,10,.98);backdrop-filter:blur(6px);padding:9px 10px;text-align:right;border-bottom:1px solid rgba(255,255,255,.08);font-weight:900;letter-spacing:.6px;opacity:.85;">Último</th>
                            </tr>
                        </thead>
                        <tbody id="assetsCatalogTableBody"></tbody>
                    </table>
                </div>
            </div>

            <div style="margin-top:12px;display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:10px;">
                <div style="border:1px solid rgba(255,255,255,.10);border-radius:12px;padding:10px;background:rgba(0,0,0,.16);">
                    <div style="font-weight:900;letter-spacing:.6px;opacity:.92;margin-bottom:8px;">Mapeamento (Resumo Operacional)</div>
                    <div style="overflow:auto;max-height:240px;border:1px solid rgba(255,255,255,.08);border-radius:10px;">
                        <table style="width:100%;border-collapse:collapse;">
                            <tbody>
                                ${mappingRow('WDO', 'wdo', 'WDO')}
                                ${mappingRow('WIN', 'win', 'WIN')}
                                ${mappingRow('HK50 (Hang Seng)', 'hk50', 'HK50')}
                                ${mappingRow('HSTECH', 'hstech', 'HSTECH')}
                                ${mappingRow('HSI Finance', 'hsfin', 'HSI_FIN')}
                                ${mappingRow('EWH (ETF HK)', 'ewh', 'EWH')}
                                ${mappingRow('USD/BRL', 'usdbrl', 'USD_BRL')}
                                ${mappingRow('USD/CNH', 'usdCnh', 'USD_CNH')}
                                ${mappingRow('USD/CNY', 'usdCny', 'USD_CNY')}
                                ${mappingRow('USD/HKD', 'usdHkd', 'USD_HKD')}
                                ${mappingRow('AUD/USD', 'audusd', '')}
                                ${mappingRow('IBOV', 'ibov', 'IBOV')}
                                ${mappingRow('EWZ', 'ewz', 'EWZ')}
                                ${mappingRow('DXY', 'dxy', 'DXY')}
                                ${mappingRow('VIX (usado)', 'vix', 'VIX')}
                                ${mappingRow('VIX9D', 'vix9d', 'VIX9D')}
                                ${mappingRow('VIX (clássico)', 'vix30', 'VIX30')}
                                ${mappingRow('VVIX', 'vvix', 'VVIX')}
                                ${mappingRow('VXN', 'vxn', 'VXN')}
                                ${mappingRow('VXEEM', 'vxeem', 'VXEEM')}
                                ${mappingRow('VXEWZ', 'vxewz', 'VXEWZ')}
                                ${mappingRow('VXBR', 'vxbr', 'VXBR')}
                                ${mappingRow('VHSI (vol HK)', 'vhsi', 'VHSI')}
                                ${mappingRow('BR10Y', 'br10y', 'BR10Y')}
                                ${mappingRow('CDS', 'cds', 'CDS_BR5Y')}
                                ${mappingRow('China CDS 5Y', 'cdsCn5y', 'CDS_CN5Y')}
                                ${mappingRow('SPX', 'spx', 'SPX')}
                                ${mappingRow('NDX', 'ndx', 'NDX')}
                                ${mappingRow('US10Y', 'us10y', 'US10Y')}
                                ${mappingRow('US2Y', 'us2y', 'US2Y')}
                                ${mappingRow('HK 1M', 'hk1m', 'HK1M')}
                                ${mappingRow('HK 3M', 'hk3m', 'HK3M')}
                                ${mappingRow('Spread HK10Y vs US/China 10Y', 'us10hk10', 'SPREAD_HK10Y')}
                                ${mappingRow('HYG', 'hyg', 'HYG')}
                                ${mappingRow('TLT', 'tlt', 'TLT')}
                                ${mappingRow('EEM/VWO', 'eem', 'EEM')}
                                ${mappingRow('China ETF (MCHI)', 'mchi', 'MCHI')}
                                ${mappingRow('Brent', 'brent', 'BRENT')}
                                ${mappingRow('Cobre', 'copper', 'COPPER')}
                                ${mappingRow('Ouro', 'gold', 'GOLD')}
                                ${mappingRow('Minério', 'iron', 'IRON')}
                                ${mappingRow('BTC', 'btc', 'BTC')}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div style="border:1px solid rgba(255,255,255,.10);border-radius:12px;padding:10px;background:rgba(0,0,0,.16);">
                    <div style="font-weight:900;letter-spacing:.6px;opacity:.92;margin-bottom:8px;">Carimbo</div>
                    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
                        ${badge('neutral', `Gerado: ${generatedAt ? formatDateTime(generatedAt) : '—'}`)}
                        ${badge('neutral', `Fonte: ${data && data.meta && data.meta.source ? String(data.meta.source) : '—'}`)}
                        ${badge('neutral', `Intervalo: ${data && data.meta && data.meta.intervalMinutes ? String(data.meta.intervalMinutes) : '—'}m`)}
                        ${badge('neutral', `Retenção: ${data && data.meta && data.meta.retentionDays ? String(data.meta.retentionDays) : '—'}d`)}
                    </div>
                    <div style="margin-top:10px;opacity:.86;line-height:1.45;">
                        Use este bloco como “base de dados” do CSV: ele lista tudo que existe, indica se tem série/preço e mostra o que entrou/saiu desde a última vez que você abriu o dashboard.
                    </div>
                </div>
            </div>
        </div>
    `;

    const bind = (id, evt, fn) => {
        const x = document.getElementById(id);
        if (!x) return;
        x.addEventListener(evt, fn);
    };
    bind('assetsCatalogQuery', 'input', render);
    bind('assetsCatalogCategory', 'change', render);
    bind('assetsCatalogOnly', 'change', render);
    bind('assetsCatalogSort', 'change', render);
    bind('assetsCatalogCopy', 'click', onCopy);
    render();
}

function renderSectorHeatmap(data) {
    const el = document.getElementById('sectorHeatmap');
    if (!el) return;

    const sectors = [
        { code: 'XLF', name: 'Financeiro', profile: 'cíclico / value', r: /^XLF$/i },
        { code: 'XLK', name: 'Tecnologia', profile: 'growth', r: /^XLK$/i },
        { code: 'XLE', name: 'Energia', profile: 'cíclico', r: /^XLE$/i },
        { code: 'XLV', name: 'Saúde', profile: 'defensivo', r: /^XLV$/i },
        { code: 'XLY', name: 'Consumo discricionário', profile: 'cíclico', r: /^XLY$/i },
        { code: 'XLI', name: 'Industriais', profile: 'cíclico', r: /^XLI$/i },
        { code: 'XLP', name: 'Consumo básico', profile: 'defensivo', r: /^XLP$/i },
        { code: 'XLU', name: 'Utilities', profile: 'defensivo', r: /^XLU$/i },
        { code: 'XLB', name: 'Materiais', profile: 'cíclico', r: /^XLB$/i },
        { code: 'XLC', name: 'Comunicação', profile: 'growth / defensivo', r: /^XLC$/i },
        { code: 'XLRE', name: 'Imobiliário', profile: 'sensível a juros', r: /^XLRE/i },
    ].map(s => ({ ...s, symbol: findAssetSymbol(data, s.r) }))
        .filter(s => s.symbol);

    if (!sectors.length) {
        el.innerHTML = '<p style="opacity:.85">Setoriais não encontrados no monitoramento.</p>';
        return;
    }

    const maxAbs = 3;
    const toneCardStyleFromValue = (pct) => {
        if (pct === null || pct === undefined || !Number.isFinite(pct)) {
            return 'border:1px solid rgba(255,255,255,.12);background:rgba(0,0,0,.18);box-shadow:none;';
        }
        const t = toneFromValue(pct, { maxAbs });
        const rgb = t.tone === 'tone--pos' ? '0,255,140' : t.tone === 'tone--neg' ? '255,60,80' : '255,255,255';
        if (t.tone === 'tone--neu') {
            return 'border:1px solid rgba(255,255,255,.12);background:rgba(0,0,0,.18);box-shadow:none;';
        }
        return `--tone-a:${String(t.a)};border:1px solid rgba(${rgb},var(--tone-a, .35));background:linear-gradient(135deg, rgba(${rgb}, calc(var(--tone-a, .25) * .30)), rgba(0,0,0,.22));box-shadow:0 0 calc(28px * var(--tone-a, .25)) rgba(${rgb}, calc(var(--tone-a, .25) * .55));`;
    };

    const calc = sectors.map(s => {
        const pct = getChangePct(data, s.symbol);
        const val = typeof pct === 'number' && Number.isFinite(pct) ? pct : null;
        return { ...s, pct: val };
    });

    const ranked = calc.filter(s => typeof s.pct === 'number' && Number.isFinite(s.pct)).slice().sort((a, b) => (b.pct || 0) - (a.pct || 0));
    const top = ranked.slice(0, 3);
    const bottom = ranked.slice(-3).slice().reverse();
    const defensiveSet = new Set(['XLU', 'XLP', 'XLV', 'XLRE']);
    const cyclicalSet = new Set(['XLY', 'XLI', 'XLB', 'XLE', 'XLF']);

    const countIn = (list, set) => list.reduce((acc, x) => acc + (set.has(x.code) ? 1 : 0), 0);
    const topDef = countIn(top, defensiveSet);
    const topCyc = countIn(top, cyclicalSet);
    const lead = top.length ? top[0] : null;
    const leadTxt = lead ? `${lead.code} ${formatPercent(lead.pct, 2)} (${lead.name})` : '—';
    const tail = bottom.length ? bottom[0] : null;
    const tailTxt = tail ? `${tail.code} ${formatPercent(tail.pct, 2)} (${tail.name})` : '—';

    let bias = 'Neutro';
    let biasWhy = 'Sem dominância clara entre defensivos e cíclicos no topo.';
    if (topDef >= 2) {
        bias = 'Viés risk-off';
        biasWhy = 'Defensivos liderando (típico de busca por proteção).';
    } else if (topCyc >= 2) {
        bias = 'Viés risk-on';
        biasWhy = 'Cíclicos liderando (típico de apetite ao risco).';
    } else if (lead && lead.code === 'XLK') {
        bias = 'Risk-on (growth-led)';
        biasWhy = 'Tecnologia liderando sugere rotação para growth.';
    } else if (lead && lead.code === 'XLF') {
        bias = 'Rotação para value';
        biasWhy = 'Financeiro na liderança costuma indicar rotação para value (checar yields).';
    }

    const biasPct = lead && typeof lead.pct === 'number' ? lead.pct : null;
    const biasBadge = biasPct === null ? escapeHtml('—') : toneBadgeHtml(biasPct, bias, { maxAbs });

    const chips = top
        .map(x => `<span style="display:inline-flex;align-items:center;gap:8px;border:1px solid rgba(255,255,255,.12);background:rgba(0,0,0,.18);border-radius:999px;padding:6px 10px;">
            <span style="font-weight:900;letter-spacing:1px;">${escapeHtml(x.code)}</span>
            <span style="font-family:'Share Tech Mono',monospace;font-weight:900;">${escapeHtml(formatPercent(x.pct, 2))}</span>
        </span>`)
        .join('');

    const summary = `
        <div style="border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:12px;background:rgba(0,0,0,.18);margin-bottom:12px;">
            <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;">
                <div style="font-weight:900;letter-spacing:1px;opacity:.95;">Resumo do dia</div>
                <div style="font-family:'Share Tech Mono',monospace;font-weight:900;">${biasBadge}</div>
            </div>
            <div style="margin-top:8px;opacity:.92;line-height:1.4;">
                <div><b>Líder</b>: ${escapeHtml(leadTxt)} • <b>Pior</b>: ${escapeHtml(tailTxt)}</div>
                <div style="margin-top:6px;"><b>Interpretação</b>: ${escapeHtml(biasWhy)}</div>
            </div>
            ${chips ? `<div style="margin-top:10px;display:flex;flex-wrap:wrap;gap:8px;">${chips}</div>` : ''}
        </div>
    `;

    const cells = calc
        .map(s => {
            const val = typeof s.pct === 'number' && Number.isFinite(s.pct) ? s.pct : null;
            const txt = val === null ? '—' : formatPercent(val, 2);
            const badge = val === null ? escapeHtml(txt) : toneBadgeHtml(val, txt, { maxAbs });
            const style = toneCardStyleFromValue(val);
            const title = `${s.name} (${s.code}) • ${s.profile}`;
            const subtitle = `${s.name} • ${s.profile}`;
            return `<div data-sector="${escapeHtml(s.symbol)}" title="${escapeHtml(title)}" style="${style}border-radius:14px;padding:12px;cursor:pointer;">
                <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;">
                    <div style="font-weight:900;letter-spacing:1px;">${escapeHtml(s.code)}</div>
                    <div style="font-family:'Share Tech Mono',monospace;font-weight:900;">${badge}</div>
                </div>
                <div style="opacity:.85;font-size:12px;margin-top:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(subtitle)}</div>
            </div>`;
        })
        .join('');

    el.innerHTML = `${summary}<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;">${cells}</div>`;

    el.querySelectorAll('[data-sector]').forEach(node => {
        node.addEventListener('click', () => {
            const symbol = node.getAttribute('data-sector') || '';
            if (!symbol) return;
            try {
                localStorage.setItem('mercado_table_q:all', symbolKey(symbol));
                localStorage.setItem('mercado_table_mode:all', 'all');
            } catch {
            }
            renderAllAssetsTable(data);
            location.hash = '#all-assets';
        });
    });
}

function renderIntel(data) {
    renderRegimeConviction(data);
    renderChinaBrazil(data);
    renderMetalsZone(data);
    renderCarryIntel(data);
    renderRatesBuckets(data);
    renderBrazilFixedIncomeFlow(data);
    renderAgendaMatrix();
    renderDataAudit(data);
    renderAssetsCatalog(data);
    renderSectorHeatmap(data);
}

function setMetric(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function wrapLabel(text, maxCharsPerLine = 14, maxLines = 2) {
    const raw = String(text || '').trim();
    if (!raw) return ['—'];
    if (raw.length <= maxCharsPerLine) return [raw];

    const words = raw.split(/\s+/).filter(Boolean);
    if (words.length <= 1) {
        const mid = Math.min(Math.max(6, Math.floor(raw.length / 2)), raw.length - 1);
        return [raw.slice(0, mid), raw.slice(mid)].slice(0, maxLines);
    }

    let idx = 0;
    let line1 = '';
    while (idx < words.length) {
        const next = line1 ? `${line1} ${words[idx]}` : words[idx];
        if (next.length > maxCharsPerLine && line1) break;
        line1 = next;
        idx++;
    }

    const remainder = words.slice(idx).join(' ').trim();
    if (!remainder) return [line1].slice(0, maxLines);

    const room = Math.max(6, maxCharsPerLine - 1);
    const line2 = remainder.length > room ? `${remainder.slice(0, room).trimEnd()}…` : remainder;
    return [line1, line2].slice(0, maxLines);
}

function setMetricMultiline(id, text) {
    const el = document.getElementById(id);
    if (!el) return;
    const lines = wrapLabel(text);
    el.innerHTML = lines.map(escapeHtml).join('<br>');
}

function setMetricClass(id, cls) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('positive', 'negative', 'neutral');
    el.classList.add(cls);
}

function setDataStatus(text, tone = 'neutral') {
    const el = document.getElementById('dataStatus');
    if (!el) return;
    el.textContent = text || '';
    el.classList.remove('positive', 'negative', 'neutral');
    el.classList.add(tone);
}

function setHtml(id, html) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
}

function getMarketServiceBaseUrl() {
    try {
        const v = localStorage.getItem('mercado_service_base_url');
        if (v && /^https?:\/\/[^/]+:\d+$/i.test(v)) return v;
    } catch {
    }
    return 'http://127.0.0.1:3033';
}

let marketServiceOnlineCache = { atMs: 0, ok: null };
let marketServiceOnlineInFlight = null;

async function ensureMarketServiceOnline(force = false) {
    const now = Date.now();
    if (!force && marketServiceOnlineCache.ok !== null && now - marketServiceOnlineCache.atMs < 30000) {
        return marketServiceOnlineCache.ok;
    }

    if (!force && marketServiceOnlineInFlight) {
        return await marketServiceOnlineInFlight;
    }

    const run = (async () => {
        const atMs = Date.now();
        const baseUrl = getMarketServiceBaseUrl();
        try {
            await fetchJsonWithTimeout(`${baseUrl}/api/market/health?t=${atMs}`, 1200);
            marketServiceOnlineCache = { atMs, ok: true };
            return true;
        } catch {
            marketServiceOnlineCache = { atMs, ok: false };
            return false;
        }
    })();

    marketServiceOnlineInFlight = run;
    try {
        return await run;
    } finally {
        if (marketServiceOnlineInFlight === run) marketServiceOnlineInFlight = null;
    }
}

async function fetchJsonWithTimeout(url, timeoutMs = 3500) {
    const once = async u => {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), timeoutMs);
        try {
            const res = await fetch(u, { method: 'GET', signal: ctrl.signal });
            if (!res.ok) {
                if (res.status === 0) {
                    const txt = await res.text();
                    const clean = String(txt || '').trim();
                    if (!clean) throw new Error('HTTP 0');
                    return JSON.parse(clean);
                }
                throw new Error(`HTTP ${res.status}`);
            }
            return await res.json();
        } finally {
            clearTimeout(t);
        }
    };

    const swap = u => {
        if (u.indexOf('http://127.0.0.1:3033') === 0) return u.replace('http://127.0.0.1:3033', 'http://127.0.0.1:3034');
        if (u.indexOf('http://127.0.0.1:3034') === 0) return u.replace('http://127.0.0.1:3034', 'http://127.0.0.1:3033');
        return null;
    };

    try {
        return await once(url);
    } catch (e) {
        const alt = swap(url);
        if (alt) {
            try {
                const out = await once(alt);
                try {
                    localStorage.setItem('mercado_service_base_url', alt.split('/api/')[0]);
                } catch {
                }
                return out;
            } catch {
            }
        }
        throw e;
    }
}

async function fetchJsonPostWithTimeout(url, body, timeoutMs = 6500) {
    const once = async u => {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), timeoutMs);
        try {
            const res = await fetch(u, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body || {}),
                signal: ctrl.signal,
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return await res.json();
        } finally {
            clearTimeout(t);
        }
    };

    const swap = u => {
        if (u.indexOf('http://127.0.0.1:3033') === 0) return u.replace('http://127.0.0.1:3033', 'http://127.0.0.1:3034');
        if (u.indexOf('http://127.0.0.1:3034') === 0) return u.replace('http://127.0.0.1:3034', 'http://127.0.0.1:3033');
        return null;
    };

    try {
        return await once(url);
    } catch (e) {
        const alt = swap(url);
        if (alt) {
            try {
                const out = await once(alt);
                try {
                    localStorage.setItem('mercado_service_base_url', alt.split('/api/')[0]);
                } catch {
                }
                return out;
            } catch {
            }
        }
        throw e;
    }
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
    if (!payload) {
        setHtml('optionsGammaSummary', `<div style="padding:12px;opacity:.9;">Indisponível • Sem dados.</div>`);
        return;
    }
    if (payload.ok !== true || !payload.items) {
        const msg = payload && payload.message ? String(payload.message) : 'Indisponível • Sem dados.';
        setHtml('optionsGammaSummary', `<div style="padding:12px;opacity:.9;">${escapeHtml(msg)}</div>`);
        return;
    }

    const items = [payload.items.WDO, payload.items.WIN].filter(Boolean);
    if (!items.length) {
        setHtml('optionsGammaSummary', `<div style="padding:12px;opacity:.9;">Sem dados</div>`);
        return;
    }

    operationalInputs.optionsGamma = payload;
    try { renderOperationalBriefing(); } catch { }
    try { renderBtcOperationalBriefing(); } catch { }
    try { renderHk50OperationalBriefing(); } catch { }

    const fmt0 = v => (typeof v === 'number' && Number.isFinite(v) ? formatNumber(v, 0) : '—');
    const fmt2 = v => (typeof v === 'number' && Number.isFinite(v) ? formatNumber(v, 2) : '—');

    const rows = items.map(item => {
        const regime = item && item.regime ? String(item.regime) : '—';
        const tone = toneFromRegimeText(regime);
        const badge = toneBadgeHtmlFromTone(tone, 1, regime, { maxAbs: 1 });

        const key = item && item.keyLevels ? item.keyLevels : {};
        const model = key && key.gammaFlipModel ? String(key.gammaFlipModel) : '';
        const gammaTxt = fmt0(key.gammaFlip);
        const gammaHtml = model
            ? `${escapeHtml(gammaTxt)}<div style="opacity:.72;font-size:11px;margin-top:2px;line-height:1.1;">${escapeHtml(model)}</div>`
            : escapeHtml(gammaTxt);

        const range =
            typeof key.rangeLow === 'number' && typeof key.rangeHigh === 'number'
                ? `${fmt0(key.rangeLow)}–${fmt0(key.rangeHigh)}`
                : '—';

        const dash = item && item.links && item.links.dashboard ? String(item.links.dashboard) : '';
        const data = item && item.links && item.links.data ? String(item.links.data) : '';
        const links = [
            dash ? `<a href="${escapeHtml(dash)}" target="_blank" class="underline_link">Dashboard</a>` : null,
            data ? `<a href="${escapeHtml(data)}" target="_blank" class="underline_link">Data</a>` : null,
        ].filter(Boolean).join(' • ');

        return `
            <tr>
                <td style="font-weight:900;letter-spacing:.5px;">${escapeHtml(item.symbol || '—')}</td>
                <td>${badge}</td>
                <td>${fmt2(item.spot)}</td>
                <td>${gammaHtml}</td>
                <td>${fmt0(key.putWall)}</td>
                <td>${fmt0(key.callWall)}</td>
                <td>${range}</td>
                <td>${fmt0(key.maxPain)}</td>
                <td style="white-space:nowrap;">${escapeHtml(formatDateTimeLoose(item.updatedAt))}</td>
                <td style="white-space:nowrap;">${links || '—'}</td>
            </tr>
        `;
    }).join('');

    setHtml(
        'optionsGammaSummary',
        `
            <table class="data-table" style="width:100%;">
                <thead>
                    <tr>
                        <th>Ativo</th>
                        <th>Regime</th>
                        <th>Spot</th>
                        <th>Gamma Flip</th>
                        <th>PutWall</th>
                        <th>CallWall</th>
                        <th>Range</th>
                        <th>MaxPain</th>
                        <th>Atualizado</th>
                        <th>Abrir</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        `,
    );
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
            message: 'Indisponível • Sem pacote local, sem leitura do dashboard_unificado e sem serviço HTTP.',
        });
        return false;
    }
}

function renderFinancialJuice(payload) {
    const url = payload && payload.url ? String(payload.url) : 'https://www.financialjuice.com/home';

    const items = payload && payload.ok === true && Array.isArray(payload.items) ? payload.items : null;
    const mode = payload && payload.mode ? String(payload.mode) : '';
    const message = payload && payload.message ? String(payload.message) : '';

    const rows = (items || []).map(x => {
        const createdAt = x && x.createdAt ? formatDateTime(String(x.createdAt)) : '';
        const original = x && x.original ? String(x.original) : '';
        const link = x && x.url ? String(x.url) : url;

        return `
            <div style="padding:10px 12px;border:1px solid rgba(255,255,255,.08);border-radius:12px;background:rgba(0,0,0,.14);">
                <div style="display:flex;align-items:baseline;justify-content:space-between;gap:10px;flex-wrap:wrap;">
                    <div style="font-weight:900;line-height:1.25;">${escapeHtml(original || '—')}</div>
                    <div style="opacity:.80;font-size:12px;white-space:nowrap;">${escapeHtml(createdAt || '')}</div>
                </div>
                <div style="margin-top:6px;">
                    <a href="${escapeHtml(link)}" target="_blank" class="underline_link" style="font-size:12px;opacity:.95;">ver fonte</a>
                </div>
            </div>
        `;
    }).join('');

        const body = items && items.length
        ? `
            <div style="max-height:56vh;overflow:auto;overscroll-behavior:contain;padding:0 12px 12px;">
                <div style="display:grid;gap:10px;">${rows}</div>
            </div>
        `
        : `
            <div style="padding:0 12px 10px;opacity:.90;">
                ${escapeHtml(message || (mode ? `Sem manchetes disponíveis (${mode}).` : 'Sem manchetes disponíveis.'))}
            </div>
        `;

    setHtml('newsFinancialJuice', `
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:10px 12px;">
            <a href="${escapeHtml(url)}" target="_blank" class="underline_link" style="font-weight:900;">Abrir FinancialJuice</a>
        </div>
        ${body}
    `);
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
    const ok = payload && payload.ok === true;
    const message = payload && payload.message ? String(payload.message) : '';
    const items = ok && Array.isArray(payload.items) ? payload.items : null;
    const summary = ok && payload.summary ? payload.summary : null;
    const sources = ok && Array.isArray(payload.sources) ? payload.sources : [];
    const windowHours = ok && typeof payload.windowHours === 'number' ? payload.windowHours : null;
    const generatedAt = ok && payload.generatedAt ? String(payload.generatedAt) : '';

    const badge = (tone, text) => {
        const cls = tone === 'positive' ? 'positive' : tone === 'negative' ? 'negative' : 'neutral';
        return `<span class="${cls}" style="display:inline-flex;align-items:center;gap:8px;border:1px solid rgba(255,255,255,.14);border-radius:999px;padding:4px 10px;background:rgba(0,0,0,.18);font-family:'Share Tech Mono',monospace;font-weight:900;">${escapeHtml(text)}</span>`;
    };

    if (!ok) {
        setHtml(elId, `
            <div style="padding:12px;opacity:.90;">
                ${escapeHtml(message || 'Web News Module indisponível.')}
            </div>
        `);
        return;
    }

    operationalInputs.webNews = payload;
    try { renderOperationalBriefing(); } catch { }
    try { renderBtcOperationalBriefing(); } catch { }
    try { renderHk50OperationalBriefing(); } catch { }

    const sentiment = summary && summary.sentiment ? String(summary.sentiment) : 'Neutro';
    const conflicts = summary && Array.isArray(summary.conflicts) ? summary.conflicts : [];
    const thesis = summary && summary.thesis ? summary.thesis : null;
    const globalTop = summary && Array.isArray(summary.globalTop) ? summary.globalTop : [];
    const brasilTop = summary && Array.isArray(summary.brasilTop) ? summary.brasilTop : [];
    const commoditiesTop = summary && Array.isArray(summary.commoditiesTop) ? summary.commoditiesTop : [];
    const bullish = summary && Array.isArray(summary.bullish) ? summary.bullish : [];
    const bearish = summary && Array.isArray(summary.bearish) ? summary.bearish : [];

    const sentimentTone =
        sentiment === 'Muito Otimista' || sentiment === 'Otimista' ? 'positive'
            : sentiment === 'Muito Pessimista' || sentiment === 'Pessimista' ? 'negative'
                : 'neutral';

    const topicsLine = (label, arr) => {
        if (!arr || !arr.length) return '';
        return `<div style="padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06);"><span style="opacity:.9;font-weight:900;">${escapeHtml(label)}:</span> <span style="opacity:.92;">${escapeHtml(arr.join(' • '))}</span></div>`;
    };

    const renderItems = () => {
        if (!items || !items.length) return `<div style="padding:0 12px 10px;opacity:.90;">Sem manchetes no momento.</div>`;

        const rows = items.map(x => {
            const publishedAt = x && x.publishedAt ? formatDateTime(String(x.publishedAt)) : '';
            const title = x && x.title ? String(x.title) : '';
            const link = x && x.url ? String(x.url) : '';
            const source = x && x.source ? String(x.source) : '';
            const bucket = x && x.bucket ? String(x.bucket) : '';
            const driver = x && x.driver ? String(x.driver) : '';
            const wdo = x && x.impact && x.impact.wdo ? String(x.impact.wdo) : '≈';
            const win = x && x.impact && x.impact.win ? String(x.impact.win) : '≈';
            const conf = x && x.confidence ? String(x.confidence) : 'média';

            const wdoTone = wdo === '↑' ? 'negative' : wdo === '↓' ? 'positive' : 'neutral';
            const winTone = win === '↑' ? 'positive' : win === '↓' ? 'negative' : 'neutral';

            return `
                <div style="padding:10px 12px;border:1px solid rgba(255,255,255,.08);border-radius:12px;background:rgba(0,0,0,.14);">
                    <div style="display:flex;align-items:baseline;justify-content:space-between;gap:10px;flex-wrap:wrap;">
                        <div style="font-weight:900;line-height:1.25;">${escapeHtml(title || '—')}</div>
                        <div style="opacity:.80;font-size:12px;white-space:nowrap;">${escapeHtml(publishedAt || '')}</div>
                    </div>
                    <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
                        ${badge('neutral', `${bucket}${driver ? ` • ${driver}` : ''}`)}
                        ${badge(wdoTone, `WDO ${wdo}`)}
                        ${badge(winTone, `WIN ${win}`)}
                        ${badge('neutral', `conf: ${conf}`)}
                    </div>
                    <div style="margin-top:8px;display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
                        <div style="opacity:.85;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(source || '')}</div>
                        ${link ? `<a href="${escapeHtml(link)}" target="_blank" class="underline_link" style="font-size:12px;opacity:.95;">ver fonte</a>` : ''}
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div style="padding:0 12px 12px;">
                <div style="display:grid;gap:10px;">${rows}</div>
            </div>
        `;
    };

    setHtml(elId, `
        <div style="padding:10px 12px;">
            <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;">
                <div style="font-weight:900;letter-spacing:1px;">Web News Module</div>
                <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
                    ${badge(sentimentTone, `Sentimento: ${sentiment}`)}
                    ${badge('neutral', `Janela: ${windowHours ? `${windowHours}h` : '—'}`)}
                    ${generatedAt ? badge('neutral', `Carimbo: ${formatDateTimeLoose(generatedAt)}`) : ''}
                </div>
            </div>
            <div style="margin-top:10px;border-top:1px solid rgba(255,255,255,.08);padding-top:10px;">
                ${topicsLine('TOP Global', globalTop)}
                ${topicsLine('TOP Brasil', brasilTop)}
                ${topicsLine('TOP Commodities', commoditiesTop)}
            </div>
            ${(bullish && bullish.length) || (bearish && bearish.length)
        ? `
                <div style="margin-top:12px;border:1px solid rgba(255,255,255,.10);border-radius:12px;padding:10px;background:rgba(0,0,0,.12);">
                    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:10px;">
                        <div>
                            <div style="font-weight:900;letter-spacing:1px;opacity:.92;margin-bottom:8px;">Bullish (Top 3)</div>
                            ${(bullish || []).slice(0, 3).map(t => `<div style="opacity:.92;line-height:1.35;">• ${escapeHtml(String(t))}</div>`).join('') || `<div style="opacity:.80;">—</div>`}
                        </div>
                        <div>
                            <div style="font-weight:900;letter-spacing:1px;opacity:.92;margin-bottom:8px;">Bearish (Top 3)</div>
                            ${(bearish || []).slice(0, 3).map(t => `<div style="opacity:.92;line-height:1.35;">• ${escapeHtml(String(t))}</div>`).join('') || `<div style="opacity:.80;">—</div>`}
                        </div>
                    </div>
                </div>
              `
        : ''}
            ${thesis
        ? `
                <div style="margin-top:12px;border:1px solid rgba(255,255,255,.10);border-radius:12px;padding:10px;background:rgba(0,0,0,.12);">
                    <div style="font-weight:900;letter-spacing:1px;opacity:.92;margin-bottom:8px;">O que está sendo precificado (3 frases)</div>
                    <div style="opacity:.92;line-height:1.45;">${escapeHtml(String(thesis.global || ''))}</div>
                    <div style="opacity:.92;line-height:1.45;margin-top:6px;">${escapeHtml(String(thesis.brasil || ''))}</div>
                    <div style="opacity:.92;line-height:1.45;margin-top:6px;">${escapeHtml(String(thesis.commodities || ''))}</div>
                </div>
              `
        : ''}
            ${conflicts && conflicts.length
        ? `
                <div style="margin-top:12px;border:1px solid rgba(255,255,255,.10);border-radius:12px;padding:10px;background:rgba(0,0,0,.12);">
                    <div style="font-weight:900;letter-spacing:1px;opacity:.92;margin-bottom:8px;">Conflitos</div>
                    ${conflicts.map(t => `<div style="opacity:.92;line-height:1.35;">• ${escapeHtml(String(t))}</div>`).join('')}
                </div>
              `
        : ''}
            ${sources && sources.length
        ? `
                <div style="margin-top:12px;opacity:.80;font-size:12px;">Fontes: ${escapeHtml(sources.join(' • '))}</div>
              `
        : ''}
        </div>
        ${renderItems()}
    `);
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
            message: 'Web News Module indisponível • Sem pacote local (assets/data/web_news_module.json) e sem serviço HTTP.',
        });
        return false;
    }
}

function renderOperationalBriefing() {
    const el = document.getElementById('operationalBriefing');
    if (!el) return;

    const data = getData();
    const rawRegime = operationalInputs.regime;
    const rawOptions = operationalInputs.optionsGamma || null;
    const rawWeb = operationalInputs.webNews || null;

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

    const fmt0 = v => (typeof v === 'number' && Number.isFinite(v) ? formatNumber(v, 0) : '—');
    const fmt1 = v => (typeof v === 'number' && Number.isFinite(v) ? formatNumber(v, 1) : '—');

    if (!regime && !options && !web) {
        const badge = (tone, text) => {
            const cls = tone === 'positive' ? 'positive' : tone === 'negative' ? 'negative' : 'neutral';
            return `<span class="${cls}" style="display:inline-flex;align-items:center;gap:8px;border:1px solid rgba(255,255,255,.14);border-radius:999px;padding:4px 10px;background:rgba(0,0,0,.18);font-family:'Share Tech Mono',monospace;font-weight:900;">${escapeHtml(text)}</span>`;
        };
        const st = x => (x ? (x.ok === true ? badge('positive', 'OK') : badge('negative', 'ERRO')) : badge('neutral', '—'));
        el.innerHTML = `
            <div style="padding:12px;border:1px solid rgba(255,255,255,.12);border-radius:14px;background:rgba(0,0,0,.18);">
                <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
                    <div style="font-weight:900;letter-spacing:1px;opacity:.95;">Roteiro do momento</div>
                    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
                        ${badge('neutral', 'Regime')} ${st(rawRegime)}
                        ${badge('neutral', 'Opções')} ${st(rawOptions)}
                        ${badge('neutral', 'News')} ${st(rawWeb)}
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
    const macroBiasFor = symbol => {
        if (!macro) return { bias: 'neutral', score: 0 };
        const neutral = t => String(t || '').toLowerCase().includes('neutro');
        let s = 0;
        let w = 0;
        const push = (val, wVal) => {
            s += val * wVal;
            w += wVal;
        };
        if (macro.flow && !neutral(macro.flow.label)) {
            const b = macro.flow.label === 'Risk-On' ? (symbol === 'WDO' ? -1 : +1) : (symbol === 'WDO' ? +1 : -1);
            push(b, operationalTuning.weight.flow);
        }
        if (typeof macro.dxyPct === 'number' && Number.isFinite(macro.dxyPct)) {
            const dir = macro.dxyPct > operationalTuning.threshold.dxy ? +1 : macro.dxyPct < -operationalTuning.threshold.dxy ? -1 : 0;
            const b = symbol === 'WDO' ? dir : -dir;
            push(b, operationalTuning.weight.dxy);
        }
        if (typeof macro.exportScore === 'number' && Number.isFinite(macro.exportScore)) {
            const dir = macro.exportScore > operationalTuning.threshold.export ? +1 : macro.exportScore < -operationalTuning.threshold.export ? -1 : 0;
            const b = symbol === 'WDO' ? -dir : +dir;
            push(b, operationalTuning.weight.export);
        }
        if (macro.em && typeof macro.em.pct === 'number' && Number.isFinite(macro.em.pct)) {
            const dir = macro.em.pct > operationalTuning.threshold.em ? +1 : macro.em.pct < -operationalTuning.threshold.em ? -1 : 0;
            const b = symbol === 'WDO' ? dir : -dir;
            push(b, operationalTuning.weight.em);
        }
        if (macro.yields) {
            const y = macro.yields;
            if (typeof y.us10yPct === 'number' && Number.isFinite(y.us10yPct)) {
                const dir = y.us10yPct > operationalTuning.threshold.yields ? +1 : y.us10yPct < -operationalTuning.threshold.yields ? -1 : 0;
                const b = symbol === 'WDO' ? dir : -dir;
                push(b, operationalTuning.weight.yields);
            }
            if (typeof y.br10yPct === 'number' && Number.isFinite(y.br10yPct)) {
                const dir = y.br10yPct > operationalTuning.threshold.yields ? +1 : y.br10yPct < -operationalTuning.threshold.yields ? -1 : 0;
                const b = symbol === 'WDO' ? dir : -dir;
                push(b, operationalTuning.weight.yields * 0.8);
            }
        }
        const score = w > 0 ? s / w : 0;
        const bias = score > 0.22 ? 'buy' : score < -0.22 ? 'sell' : 'neutral';
        return { bias, score };
    };

    const macroWdo = macroBiasFor('WDO');
    const macroWin = macroBiasFor('WIN');

    const resolved = {
        wdo: combined.wdo.conflict ? macroWdo : combined.wdo,
        win: combined.win.conflict ? macroWin : combined.win,
    };

    const confidence = (() => {
        const base = regime && typeof regime.convictionScore === 'number' && Number.isFinite(regime.convictionScore)
            ? regime.convictionScore
            : 0.55;
        const conflicts = (combined.wdo.conflict ? 1 : 0) + (combined.win.conflict ? 1 : 0);
        const newsW = newsTilt.wdo.w || 0;
        const newsAdj = newsW >= 4 ? 0.06 : newsW >= 2 ? 0.03 : 0;
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
        const out = Math.max(0, Math.min(1, base + newsAdj + macroAdj - conflicts * 0.10));
        const label = out >= 0.72 ? 'ALTA' : out >= 0.56 ? 'MÉDIA' : 'BAIXA';
        return { score: out, label };
    })();

    const badge = (tone, text) => {
        const cls = tone === 'positive' ? 'positive' : tone === 'negative' ? 'negative' : 'neutral';
        return `<span class="${cls}" style="display:inline-flex;align-items:center;gap:8px;border:1px solid rgba(255,255,255,.14);border-radius:999px;padding:4px 10px;background:rgba(0,0,0,.18);font-family:'Share Tech Mono',monospace;font-weight:900;">${escapeHtml(text)}</span>`;
    };

    const biasTone = b => (b === 'buy' ? 'positive' : b === 'sell' ? 'negative' : 'neutral');
    const biasLabel = (symbol, b) => {
        if (b === 'buy') return `${symbol}: COMPRA`;
        if (b === 'sell') return `${symbol}: VENDA`;
        return `${symbol}: NEUTRO`;
    };

    const finalScoreFor = symbol => {
        const rb = symbol === 'WDO' ? regimeBias.wdo : regimeBias.win;
        const nb = symbol === 'WDO' ? newsTilt.wdo.score : newsTilt.win.score;
        const mb = symbol === 'WDO' ? macroWdo.score : macroWin.score;
        const dir = rb === 'buy' ? 1 : rb === 'sell' ? -1 : 0;
        const s = (0.5 * dir) + (0.4 * nb) + (0.3 * mb);
        const c = Math.max(-1, Math.min(1, s));
        return c;
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

        const bias = sym === 'WDO' ? combined.wdo.bias : sym === 'WIN' ? combined.win.bias : 'neutral';

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

        return `
            <div style="border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:12px;background:rgba(0,0,0,.18);">
                <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
                    <div style="font-weight:900;letter-spacing:1px;">${escapeHtml(sym)}</div>
                    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
                        ${badge(biasTone(bias), biasLabel(sym, bias))}
                        ${badge(gammaTone, gammaLabel)}
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

    const newsLine = web
        ? `News tilt (0–1): WDO ${fmt1(newsTilt.wdo.score)} • WIN ${fmt1(newsTilt.win.score)}`
        : 'News tilt: —';

    const macroLine = macro
        ? `Flow ${escapeHtml(String(macro.flow ? macro.flow.label : '—'))} • DXY ${typeof macro.dxyPct === 'number' ? formatPercent(macro.dxyPct, 2) : '—'} • Export ${typeof macro.exportScore === 'number' ? formatPercent(macro.exportScore, 2) : '—'} • EM ${typeof (macro.em && macro.em.pct) === 'number' ? formatPercent(macro.em.pct, 2) : '—'}${cdsSignal ? ` • CDS ${typeof cdsSignal.drivers.cds === 'number' ? formatPercent(cdsSignal.drivers.cds, 2) : '—'} (${cdsSignal.mode === 'hedge_on_risk_on' ? 'Hedge-on' : cdsSignal.mode === 'risk_off_classic' ? 'Risk-off' : cdsSignal.mode === 'relief_risk_on' ? 'Alívio' : 'Leitura'})` : ''}`
        : 'Macro: —';

    const pulseNow = data ? computeOperationalPulseNow(data) : null;
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

    el.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
            <div style="font-weight:900;letter-spacing:1px;opacity:.95;">Roteiro do momento</div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
                ${badge(confidence.score >= 0.72 ? 'positive' : confidence.score >= 0.56 ? 'neutral' : 'negative', `Prioridade: ${confidence.label}`)}
                ${badge('neutral', regime ? `Regime: ${regime.label}` : 'Regime: —')}
                <button type="button" id="opTuningToggle" style="border:1px solid rgba(255,255,255,.18);border-radius:999px;padding:4px 10px;background:#151515;color:#e0e0e0;font-weight:900;letter-spacing:.6px;cursor:pointer;">Ajustes</button>
            </div>
        </div>
        <div style="margin-top:8px;opacity:.86;font-size:12px;line-height:1.35;">
            ${escapeHtml(regimeLine)} • ${escapeHtml(newsLine)} • ${escapeHtml(macroLine)}
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
                    <div style="opacity:.85;font-size:12px;margin-bottom:4px;">Threshold Juros (${formatNumber(operationalTuning.threshold.yields, 2)})</div>
                    <input id="op-th-yields" type="range" min="0" max="0.5" step="0.01" value="${operationalTuning.threshold.yields}" />
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
            </div>
        </div>
        ${pulseCard}
        <div style="margin-top:10px;display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:12px;">
            ${items.length ? items.map(makePlan).join('') : `<div style="padding:12px;border:1px solid rgba(255,255,255,.12);border-radius:14px;background:rgba(0,0,0,.18);opacity:.88;">Sem dados de WDO/WIN em Opções & Gamma (Resumo).</div>`}
        </div>
        ${(() => {
            const now = new Date();
            const hr = now.getHours();
            const min = now.getMinutes();
            if (hr > 9 || (hr === 9 && min >= 1)) return '';
            const assets = data && Array.isArray(data.assets) ? data.assets : [];
            const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
            const rows = assets.map(a => {
                const last = getLastPoint(data, a.symbol);
                const asOfVal = last && (last.asOf || last.t) ? (last.asOf || last.t) : null;
                const tMs = asOfVal ? Date.parse(asOfVal) : NaN;
                const asOf = Number.isFinite(tMs) ? new Date(tMs) : null;
                const extPct = last && typeof last.extendedChangePct === 'number' && Number.isFinite(last.extendedChangePct) ? last.extendedChangePct : null;
                const regularPct = last && typeof last.changePct === 'number' && Number.isFinite(last.changePct) ? last.changePct : null;
                const asOfMin = asOf ? asOf.getHours() * 60 + asOf.getMinutes() : null;
                const pct = extPct !== null ? extPct : asOf && sameDay(asOf, now) && typeof asOfMin === 'number' && asOfMin <= 9 * 60 ? regularPct : null;
                return { symbol: a.symbol, name: a.name, last, pct, asOf, isAdr: isBrazilAdr({ symbol: a.symbol, name: a.name }) };
            }).filter(r => r.isAdr && r.pct !== null && r.asOf && sameDay(r.asOf, now));
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
                        <div style="font-weight:900;letter-spacing:1px;opacity:.95;">ADR BR (Extended Hours) • até 09:00</div>
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
                        const rows = [];
                        rows.push(`
                            <tr>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">Flow (Regime)</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${mk('neutral', regime ? regime.label : '—')}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${mk(dirTone(macroWdo.score), macroWdo.bias === 'buy' ? 'Compra' : macroWdo.bias === 'sell' ? 'Venda' : 'Neutro')}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${mk(dirTone(macroWin.score), macroWin.bias === 'buy' ? 'Compra' : macroWin.bias === 'sell' ? 'Venda' : 'Neutro')}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${mk('neutral', String(operationalTuning.weight.flow))}</td>
                            </tr>
                        `);
                        rows.push(`
                            <tr>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">Notícias (tilt)</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">WDO ${mkNum(newsTilt.wdo.score)} • WIN ${mkNum(newsTilt.win.score)}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${mk(dirTone(newsTilt.wdo.score), newsTilt.wdo.score > 0.22 ? 'Compra' : newsTilt.wdo.score < -0.22 ? 'Venda' : 'Neutro')}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${mk(dirTone(newsTilt.win.score), newsTilt.win.score > 0.22 ? 'Compra' : newsTilt.win.score < -0.22 ? 'Venda' : 'Neutro')}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${mk('neutral', '0.4')}</td>
                            </tr>
                        `);
                        rows.push(`
                            <tr>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">DXY</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${mkPct(macro ? macro.dxyPct : null)}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${mk(dirTone(macroWdo.score), macroWdo.bias === 'buy' ? 'Compra' : macroWdo.bias === 'sell' ? 'Venda' : 'Neutro')}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${mk(dirTone(macroWin.score), macroWin.bias === 'buy' ? 'Compra' : macroWin.bias === 'sell' ? 'Venda' : 'Neutro')}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${mk('neutral', String(operationalTuning.weight.dxy))}</td>
                            </tr>
                        `);
                        rows.push(`
                            <tr>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">Export Basket</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${mkPct(macro ? macro.exportScore : null)}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${mk(dirTone(macroWdo.score), macroWdo.bias === 'sell' ? 'Venda' : macroWdo.bias === 'buy' ? 'Compra' : 'Neutro')}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${mk(dirTone(macroWin.score), macroWin.bias === 'buy' ? 'Compra' : macroWin.bias === 'sell' ? 'Venda' : 'Neutro')}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${mk('neutral', String(operationalTuning.weight.export))}</td>
                            </tr>
                        `);
                        rows.push(`
                            <tr>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">EM Basket (USD/EM)</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${mkPct(macro && macro.em ? macro.em.pct : null)}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${mk(dirTone(macroWdo.score), macroWdo.bias === 'buy' ? 'Compra' : macroWdo.bias === 'sell' ? 'Venda' : 'Neutro')}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${mk(dirTone(macroWin.score), macroWin.bias === 'buy' ? 'Compra' : macroWin.bias === 'sell' ? 'Venda' : 'Neutro')}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${mk('neutral', String(operationalTuning.weight.em))}</td>
                            </tr>
                        `);
                        rows.push(`
                            <tr>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">Juros (US10Y/BR10Y)</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">US ${mkPct(macro && macro.yields ? macro.yields.us10yPct : null)} • BR ${mkPct(macro && macro.yields ? macro.yields.br10yPct : null)}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${mk(dirTone(macroWdo.score), macroWdo.bias === 'buy' ? 'Compra' : macroWdo.bias === 'sell' ? 'Venda' : 'Neutro')}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${mk(dirTone(macroWin.score), macroWin.bias === 'buy' ? 'Compra' : macroWin.bias === 'sell' ? 'Venda' : 'Neutro')}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${mk('neutral', String(operationalTuning.weight.yields))}</td>
                            </tr>
                        `);
                        rows.push(`
                            <tr>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">CDS Brasil (fluxo x hedge)</td>
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
        bindRange('op-w-flow', 'weight', 'flow');
        bindRange('op-w-dxy', 'weight', 'dxy');
        bindRange('op-w-export', 'weight', 'export');
        bindRange('op-w-em', 'weight', 'em');
        bindRange('op-w-yields', 'weight', 'yields');
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
        const sym = String(a && a.symbol ? a.symbol : '');
        const name = String(a && a.name ? a.name : '');
        if (matcher.test(sym) || matcher.test(name)) return sym;
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
            const sym = String(a && a.symbol ? a.symbol : '');
            const name = String(a && a.name ? a.name : '');
            if (!sym) continue;
            if (!m.test(sym) && !m.test(name)) continue;
            const sc = scoreAsset(a);
            if (!best || sc > best.score) best = { sym, score: sc };
        }
    }
    return best ? best.sym : null;
}

function assetAliasMatchers(key) {
    const k = String(key || '').toUpperCase().trim();
    if (!k) return [];

    if (k === 'US2Y') return [/^US2YT=RR$/i, /^TUc\d=\$?$/i, /\bUnited States 2-Year\b/i, /\bEUA\b\s+a\s+2\s+anos\b/i, /^US2Y\b/i];
    if (k === 'US10Y') return [/^US10YT=RR$/i, /^TNc\d=\$?$/i, /\bUnited States 10-Year\b/i, /\bEUA\b\s+a\s+10\s+anos\b/i, /^US10Y\b/i];
    if (k === 'US30Y') return [/^US30YT=RR$/i, /^USc1=$/i, /\bUnited States 30-Year\b/i, /\bEUA\b\s+a\s+30\s+anos\b/i, /^US30Y\b/i];
    if (k === 'SPREAD_HK10Y')
        return [
            /^(US10HK10|HK10US10|CN10HK10|HK10CN10|CH10HK10|HK10CH10)=RR$/i,
            /\bSpread\b.*\bHong\s*Kong\b.*\b10\b.*\b(EUA|US|China|CHI)\b.*\b10\b/i,
            /\bSpread\b.*\b(EUA|US|China|CHI)\b.*\b10\b.*\bHong\s*Kong\b.*\b10\b/i,
            /\bSpread\b.*\bEUA\b.*\b10A\b.*\b(HK|HKG|Hong\s*Kong)\b.*\b10A\b/i,
            /\bSpread\b.*\b(HK|HKG|Hong\s*Kong)\b.*\b10A\b.*\bEUA\b.*\b10A\b/i,
        ];

    if (k === 'DXY') return [/^\.DXY$/i, /\bDXY\b/i, /US Dollar Index/i, /Indice Dolar/i];
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

    if (k === 'IRON') return [/^TIOc1$/i, /^SM58Fc1$/i, /^9047$/i, /^3047$/i, /\bmin[eé]rio\b/i, /\biron ore\b/i];
    if (k === 'SOY') return [/^ZS$/i, /\bsoja\b/i, /\bsoy\b/i];
    if (k === 'COPPER') return [/^HG\b/i, /\bcopper\b/i, /\bcobre\b/i];
    if (k === 'BCI') return [/^BCI$/i, /\babrdn Bloomberg All Commodity Strategy\b/i];
    if (k === 'GOLD') return [/^GC\b/i, /^XAU(USD)?$/i, /\bgold\b/i, /\bouro\b/i];
    if (k === 'BTC') return [/^BTC\/USD$/i, /^BTCUSD$/i, /\bBTC\b/i, /\bbitcoin\b/i, /\bXBT\b/i];
    if (k === 'ETH') return [/^ETH\/USD\b/i, /\bETH\/USD\b/i, /\bETH\b/i, /\bEthereum\b/i];
    if (k === 'SOL') return [/^SOL\/USD$/i, /\bSOL\b/i, /\bSolana\b/i];
    if (k === 'DOGE') return [/^DOGE\/USD$/i, /\bDOGE\b/i, /\bDogecoin\b/i];

    if (k === 'SPX') return [/^\.SPX$/i, /\bS&P 500\b/i, /^SPY$/i, /^ES\b/i, /^ES[HMUZ]\d{2}$/i];
    if (k === 'NDX') return [/^\.NDX$/i, /\bNasdaq 100\b/i, /^QQQ$/i, /^NQ\b/i, /^NQ[HMUZ]\d{2}$/i];
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
    if (k === 'JP1Y') return [/^JP1YT=(RR|XX)$/i, /\bJapan\b.*\b1\b.*\bYear\b.*\bYield\b/i, /\bJap[aã]o\b.*\b1\b.*\bano\b/i];
    if (k === 'JP5Y') return [/^JP5YT=(RR|XX)$/i, /\bJapan\b.*\b5\b.*\bYear\b.*\bYield\b/i, /\bJap[aã]o\b.*\b5\b.*\banos\b/i];
    if (k === 'CN10Y') return [/^CN10YT=RR$/i, /\bChina\b.*\b10\b.*\bYear\b.*\bYield\b/i, /\bChina\b.*\b10\b.*\banos\b/i];
    if (k === 'HK10Y') return [/^HK10YT=RR$/i, /\bHong\s*Kong\b.*\b10\b.*\bYear\b.*\bYield\b/i, /\bHong\s*Kong\b.*\b10\b.*\banos\b/i];
    if (k === 'HK1M') return [/^HK1MT=RR$/i, /\bHong\s*Kong\b.*\b1\b.*\bMonth\b/i, /\bHong\s*Kong\b.*\b1\b.*\bm[eê]s\b/i];
    if (k === 'HK3M') return [/^HK3MT=RR$/i, /\bHong\s*Kong\b.*\b3\b.*\bMonth\b/i, /\bHong\s*Kong\b.*\b3\b.*\bmeses\b/i];
    if (k === 'VHSI') return [/^\.VHSI$/i, /^VHSI(c\d+)?$/i, /\bHSI Volatility\b/i];
    if (k === 'HSTECH') return [/^HSTECH$/i, /^\.HSTECH$/i, /\bHang Seng TECH\b/i];
    if (k === 'HSI_FIN') return [/^\.(HSNF|HSHFI)\b/i, /\bHSI-?Finance\b/i, /\bHang\s*Seng\b.*\bHFI\b/i, /\bHang\s*Seng\b.*\bFinance\b/i];
    if (k === 'EWH') return [/^EWH$/i, /\biShares MSCI Hong Kong\b/i];
    if (k === 'HK50') return [/^HSIQ/i, /^HK50$/i, /^\.HSI/i, /^HSI$/i, /\bHang\s*Seng\b/i, /\bHK\s*50\b/i];

    if (k === 'USD_BRL') return [/^USD\/BRL\b/i];
    if (k === 'USD_CNH') return [/^USD\/CNH\b/i, /\bUSD\/CNH\b/i, /\bYuan\b.*\boffshore\b/i, /\bchin[eê]s\b.*\boffshore\b/i];
    if (k === 'USD_CNY') return [/^USD\/CNY\b/i, /\bUSD\/CNY\b/i, /\bYuan\b/i, /\bchin[eê]s\b/i];
    if (k === 'USD_HKD') return [/^USD\/HKD\b/i, /\bUSD\/HKD\b/i, /\bHong\s*Kong\s*Dollar\b/i];
    if (k === 'WDO') return [/(^WDO\b|WDOc\d\b|\bmini\s*d[oó]lar\b)/i];
    if (k === 'WIN') return [/(^WIN\b|WINc\d\b|\bmini\s*(índice|indice)\b|\bmini\s*ibovespa\b)/i];
    if (k === 'IBOV') return [/(^\.BVSP$|\bIBOV\b|\bIbovespa\b)/i, /^BOVA11(\b|$)/i];
    if (k === 'EWZ') return [/^EWZ$/i, /\bBrazil\b.*\bETF\b/i];
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
    if (k === 'VIX9D' || k === 'VIX30' || k === 'VIX' || k === 'VVIX' || k === 'VXN' || k === 'VXEEM' || k === 'VXEWZ' || k === 'VXBR')
        return { expectedCategories: ['volatility'], expectedTags: ['risk_off'] };
    if (k === 'VHSI') return { expectedCategories: ['volatility'], expectedTags: ['risk_off'], expectedExchanges: ['HK', 'HKEx', 'HKEX'] };
    if (k === 'HK50')
        return { expectedCategories: ['equities'], expectedTags: ['risk_on'], expectedExchanges: ['HK', 'HKEx', 'HKEX'], preferSymbols: [/^HSIQ/i, /^HK50$/i, /^\.HSI$/i, /^HSI$/i] };
    if (k === 'HSI_FIN') return { expectedCategories: ['equities'], expectedTags: ['risk_on'], expectedExchanges: ['HK', 'HKEx', 'HKEX'] };
    if (k === 'CN50') return { expectedCategories: ['emerging', 'equities'], expectedTags: ['risk_on'] };
    if (k === 'MCHI') return { expectedCategories: ['emerging', 'equities'], expectedTags: ['risk_on'] };
    if (k === 'SPX') return { expectedCategories: ['equities'], preferSymbols: [/^\.SPX$/i, /^\^GSPC$/i, /^SPY$/i] };
    if (k === 'NDX') return { expectedCategories: ['equities'], preferSymbols: [/^\.NDX$/i, /^QQQ(\.\w+)?$/i] };
    if (k === 'EWZ') return { expectedCategories: ['equities'], expectedTags: ['risk_on'] };
    if (k === 'HYG') return { expectedCategories: ['credit'], expectedTags: ['risk_on'] };
    if (k === 'TLT') return { expectedCategories: ['rates'], expectedTags: ['risk_off'] };
    if (k === 'EEM' || k === 'VWO') return { expectedCategories: ['emerging'], expectedTags: ['risk_on'] };
    if (k === 'BRENT' || k === 'WTI' || k === 'OIL') return { expectedCategories: ['energy'], expectedTags: ['oil'] };
    if (k === 'GOLD') return { expectedCategories: ['metals'], expectedTags: ['risk_off'] };
    if (k === 'COPPER' || k === 'IRON') return { expectedCategories: ['metals'], expectedTags: ['risk_on'] };
    if (k === 'BTC' || k === 'ETH' || k === 'SOL' || k === 'DOGE') return { expectedCategories: ['crypto'], expectedTags: ['risk_on'] };
    if (k === 'US2Y' || k === 'US10Y' || k === 'US30Y') return { expectedCategories: ['rates'], expectedTags: ['risk_off'] };
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
    return last && typeof last.changePct === 'number' ? last.changePct : null;
}

function avg(numbers) {
    const vals = (numbers || []).filter(v => typeof v === 'number' && Number.isFinite(v));
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
}

function renderFlowSentinel(data) {
    const symbols = {
        audusd: findAssetSymbol(data, /^AUD\/USD\b/i),
        nzdusd: findAssetSymbol(data, /^NZD\/USD\b/i),
        usdcad: findAssetSymbol(data, /^USD\/CAD\b/i),
        usdrub: findAssetSymbol(data, /^USD\/RUB\b/i),
        usdjpy: findAssetSymbol(data, /^USD\/JPY\b/i),
        usdchf: findAssetSymbol(data, /^USD\/CHF\b/i),
        usdsek: findAssetSymbol(data, /^USD\/SEK\b/i),
        dxy: findAliasSymbolBest(data, 'DXY') || findAliasSymbol(data, 'DXY'),
        vix: findAliasSymbolBest(data, 'VIX9D') || findAliasSymbolBest(data, 'VIX30') || findAliasSymbolBest(data, 'VIX') || findAliasSymbol(data, 'VIX') || findAssetSymbol(data, /^\.?VIX(9D)?$/i),
        vhsi: findAliasSymbol(data, 'VHSI') || findAssetSymbol(data, /^VHSI(c\d+)?$/i),
        jp1y: findAliasSymbol(data, 'JP1Y') || findAssetSymbol(data, /^JP1YT=(RR|XX)$/i),
        jp10y: findAliasSymbol(data, 'JP10Y') || findAssetSymbol(data, /^JP10YT=RR$/i),
        brent: findAliasSymbolBest(data, 'BRENT') || findAliasSymbol(data, 'BRENT'),
        wti: findAliasSymbolBest(data, 'WTI') || findAliasSymbol(data, 'WTI'),
    };

    const neutralThreshold = 0.12;

    const sessionNow = () => {
        const h = new Date().getUTCHours();
        if (h >= 14 && h < 21) return 'us';
        if (h >= 7 && h < 14) return 'eu';
        return 'asia';
    };
    const sess = sessionNow();
    const vhsiWeight = sess === 'asia' ? 1.0 : 0.8;

    const setDot = (id, state, blink) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.classList.remove('fs-dot--sell-usd', 'fs-dot--buy-usd', 'fs-dot--neutral', 'fs-dot--blink');
        if (state === 'sell-usd') el.classList.add('fs-dot--sell-usd');
        else if (state === 'buy-usd') el.classList.add('fs-dot--buy-usd');
        else el.classList.add('fs-dot--neutral');
        if (blink) el.classList.add('fs-dot--blink');
    };

    const classifyRiskBlockAction = score => {
        if (typeof score !== 'number' || !Number.isFinite(score)) return { state: 'neutral', label: 'Neutro' };
        if (Math.abs(score) < neutralThreshold) return { state: 'neutral', label: 'Neutro' };
        if (score > 0) return { state: 'sell-usd', label: 'Vender USD' };
        return { state: 'buy-usd', label: 'Comprar USD' };
    };

    const classifyProtectionBlockAction = score => {
        if (typeof score !== 'number' || !Number.isFinite(score)) return { state: 'neutral', label: 'Neutro' };
        if (Math.abs(score) < neutralThreshold) return { state: 'neutral', label: 'Neutro' };
        if (score > 0) return { state: 'buy-usd', label: 'Comprar USD' };
        return { state: 'sell-usd', label: 'Vender USD' };
    };

    const pre = data && data.meta && data.meta.flowSentinel ? data.meta.flowSentinel : null;
    if (pre && pre.riskBlock && pre.protectionBlock && pre.oil && pre.regime && pre.thermo) {
        const betaPosScore = typeof pre.riskBlock.score === 'number' && Number.isFinite(pre.riskBlock.score) ? pre.riskBlock.score : null;
        const betaNegScore = typeof pre.protectionBlock.score === 'number' && Number.isFinite(pre.protectionBlock.score) ? pre.protectionBlock.score : null;
        const delta = typeof pre.delta === 'number' && Number.isFinite(pre.delta) ? pre.delta : null;
        const composite = typeof pre.composite === 'number' && Number.isFinite(pre.composite) ? pre.composite : null;
        const oilScore = typeof pre.oil.score === 'number' && Number.isFinite(pre.oil.score) ? pre.oil.score : null;
        const oilAdj = typeof pre.oil.adj === 'number' && Number.isFinite(pre.oil.adj) ? pre.oil.adj : 0;

        const betaPosAction = pre.riskBlock.action && pre.riskBlock.action.state ? pre.riskBlock.action : classifyRiskBlockAction(betaPosScore);
        const betaNegAction = pre.protectionBlock.action && pre.protectionBlock.action.state ? pre.protectionBlock.action : classifyProtectionBlockAction(betaNegScore);

        const betaPosCount = typeof pre.riskBlock.observed === 'number' ? pre.riskBlock.observed : 0;
        const betaNegCount = typeof pre.protectionBlock.observed === 'number' ? pre.protectionBlock.observed : 0;

        setDot('fs-beta-pos-dot', betaPosAction.state, betaPosAction.state === 'buy-usd');
        setDot('fs-beta-neg-dot', betaNegAction.state, betaNegAction.state === 'sell-usd');

        setMetric('fs-beta-pos-score', betaPosScore === null ? '—' : formatNumber(betaPosScore, 3));
        setMetric('fs-beta-pos-detail', betaPosCount ? `${betaPosCount}/4 • ${betaPosAction.label}` : '—');
        setMetric('fs-beta-neg-score', betaNegScore === null ? '—' : formatNumber(betaNegScore, 3));
        setMetric('fs-beta-neg-detail', betaNegCount ? `${betaNegCount}/4 • ${betaNegAction.label}` : '—');
        setMetric('fs-oil-score', oilScore === null ? '—' : formatPercent(oilScore, 2));
        setMetric('fs-oil-detail', pre.oil && typeof pre.oil.intel === 'string' ? pre.oil.intel : '—');
        setMetric('fs-signal', pre.regime && typeof pre.regime.label === 'string' ? pre.regime.label : '—');
        setMetric('fs-signal-score', composite === null ? '—' : `${formatNumber(composite, 3)} • ${pre.regime && typeof pre.regime.action === 'string' ? pre.regime.action : '—'}`);

        const observedCount = betaPosCount + betaNegCount;
        if (observedCount < 3 || !(pre.thermo && typeof pre.thermo.score10 === 'number' && typeof pre.thermo.pct === 'number')) {
            setMetric('fs-thermo-score', '—');
            setMetric('fs-thermo-detail', '—');
            setHtml('fs-history', '');
            setHtml('fs-alerts', '');
        } else {
            const score10 = Math.max(0, Math.min(10, Math.round(pre.thermo.score10)));
            const pct = Math.max(0, Math.min(100, Math.round(pre.thermo.pct)));
            const thermoLabel = typeof pre.thermo.label === 'string' && pre.thermo.label ? pre.thermo.label : (score10 >= 7 ? 'Risk-On' : score10 <= 3 ? 'Risk-Off' : 'Neutro');

            setMetric('fs-thermo-score', `${score10}/10`);
            setHtml('fs-thermo-detail', `
            <div style="display:flex;flex-direction:column;gap:6px;">
                <div style="opacity:.90;">${escapeHtml(thermoLabel)}${oilAdj !== 0 ? ` • Ajuste petróleo ${oilAdj > 0 ? '+' : ''}${formatNumber(oilAdj, 2)}` : ''}</div>
                <div class="fs-thermo" aria-label="Termômetro de pré-mercado">
                    <div class="fs-thermo__fill" style="width:${pct}%;"></div>
                    <div class="fs-thermo__pin" style="left:${pct}%;"></div>
                </div>
            </div>
        `);

            const historyKey = 'mercado_fs_history_v1';
            const maxHistory = 24;
            const nowMs = Date.now();

            const readHistory = () => {
                try {
                    const raw = localStorage.getItem(historyKey);
                    const parsed = raw ? JSON.parse(raw) : null;
                    if (!Array.isArray(parsed)) return [];
                    return parsed
                        .filter(x => x && typeof x === 'object')
                        .map(x => {
                            const o = x;
                            const tMs = typeof o.tMs === 'number' && Number.isFinite(o.tMs) ? o.tMs : null;
                            const s10 = typeof o.s10 === 'number' && Number.isFinite(o.s10) ? o.s10 : null;
                            const p = typeof o.pct === 'number' && Number.isFinite(o.pct) ? o.pct : null;
                            const d = typeof o.delta === 'number' && Number.isFinite(o.delta) ? o.delta : null;
                            const oa = typeof o.oilAdj === 'number' && Number.isFinite(o.oilAdj) ? o.oilAdj : 0;
                            const lab = typeof o.label === 'string' ? o.label : '';
                            if (tMs === null || s10 === null || p === null || d === null) return null;
                            return { tMs, s10, pct: p, delta: d, oilAdj: oa, label: lab };
                        })
                        .filter(Boolean);
                } catch {
                    return [];
                }
            };

            const writeHistory = items => {
                try {
                    localStorage.setItem(historyKey, JSON.stringify(items));
                } catch {
                }
            };

            const toTime = tMs => {
                try {
                    return new Date(tMs).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                } catch {
                    return '';
                }
            };

            const clamp10 = v => Math.max(0, Math.min(10, Math.round(v)));
            const toneColor = s10 => {
                const x = clamp10(s10);
                if (x <= 3) return 'rgba(255,60,80,.95)';
                if (x >= 7) return 'rgba(0,255,160,.95)';
                return 'rgba(255,210,74,.95)';
            };

            const history = readHistory();
            const nextItem = { tMs: nowMs, s10: score10, pct: pct, delta: delta === null ? 0 : delta, oilAdj: oilAdj, label: thermoLabel };
            const last = history.length ? history[history.length - 1] : null;
            if (last && nowMs - last.tMs < 20000) {
                history[history.length - 1] = nextItem;
            } else {
                history.push(nextItem);
            }
            const trimmed = history.slice(-maxHistory);
            writeHistory(trimmed);

            const bars = trimmed
                .slice(-12)
                .map(h => {
                    const height = 8 + clamp10(h.s10) * 2.3;
                    const title = `${toTime(h.tMs)} • ${clamp10(h.s10)}/10 • Δ ${formatNumber(h.delta, 3)}${h.oilAdj ? ` • oil ${h.oilAdj > 0 ? '+' : ''}${formatNumber(h.oilAdj, 2)}` : ''}`;
                    return `<div title="${escapeHtml(title)}" style="width:10px;height:${height}px;background:${toneColor(h.s10)};border-radius:4px;opacity:.92;"></div>`;
                })
                .join('');

            setHtml('fs-history', `
            <div style="border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:12px;background:rgba(0,0,0,.18);">
                <div style="display:flex;align-items:baseline;justify-content:space-between;gap:10px;flex-wrap:wrap;">
                    <div style="font-weight:900;letter-spacing:1px;opacity:.95;">Histórico (últimas janelas)</div>
                    <div style="opacity:.80;font-size:12px;">${escapeHtml(trimmed.length ? `${toTime(trimmed[trimmed.length - 1].tMs)}` : '')}</div>
                </div>
                <div style="display:flex;align-items:flex-end;gap:6px;margin-top:10px;min-height:38px;">
                    ${bars || '<div style="opacity:.85;">—</div>'}
                </div>
            </div>
        `);

            const alerts = Array.isArray(pre.alerts) ? pre.alerts : [];
            const merged = Array.from(new Set(alerts.map(x => String(x || '').trim()).filter(Boolean)));
            setHtml('fs-alerts', merged.length
                ? `
                <div style="border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:12px;background:rgba(0,0,0,.18);">
                    <div style="font-weight:900;letter-spacing:1px;opacity:.95;margin-bottom:8px;">Alertas (divergência)</div>
                    ${merged.map(t => `<div style="padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06);opacity:.92;line-height:1.35;">${escapeHtml(t)}</div>`).join('')}
                </div>
              `
                : '');
        }

        const rows = []
            .concat([{ title: 'Bloco Risco (FX)' }])
            .concat((pre.riskBlock.items || []).map(x => ({ label: x.label, val: x.val })))
            .concat([{ title: 'Bloco Proteção (FX)' }])
            .concat((pre.protectionBlock.items || []).map(x => ({ label: x.label, val: x.val })));

        const html = `
        <div style="border:1px solid rgba(255,255,255,.12);border-radius:10px;padding:12px 12px;background:rgba(0,0,0,.25);">
            ${rows
                .map(r => {
                    if (r.title) {
                        return `<div style="font-weight:900;letter-spacing:1px;opacity:.9;margin-top:10px;">${escapeHtml(r.title)}</div>`;
                    }
                    const val = typeof r.val === 'number' ? r.val : null;
                    const txt = val === null ? '—' : formatPercent(val, 2);
                    const badge = val === null ? '—' : toneBadgeHtml(val, txt, { maxAbs: 5 });
                    return `
                        <div style="display:flex;justify-content:space-between;gap:10px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06);">
                            <div style="opacity:.9;font-weight:700;">${escapeHtml(r.label)}</div>
                            <div style="font-family:'Share Tech Mono',monospace;">${badge}</div>
                        </div>
                    `;
                })
                .join('')}
        </div>
    `;
        setHtml('fs-components', html);
        return;
    }

    const betaPosItems = [
        { label: 'AUD/USD', symbol: symbols.audusd, sign: +1 },
        { label: 'NZD/USD', symbol: symbols.nzdusd, sign: +1 },
        { label: 'USD/CAD', symbol: symbols.usdcad, sign: -1 },
        { label: 'USD/RUB', symbol: symbols.usdrub, sign: -1 },
    ].map(x => ({ ...x, raw: getChangePct(data, x.symbol) }))
        .map(x => ({ ...x, val: x.raw === null ? null : x.sign * x.raw }));

    const betaNegItemsRaw = [
        { label: 'USD/JPY', symbol: symbols.usdjpy, sign: -1, weight: 1.0 },
        { label: 'USD/CHF', symbol: symbols.usdchf, sign: -1, weight: 1.0 },
        { label: 'USD/SEK', symbol: symbols.usdsek, sign: -1, weight: 1.0 },
        { label: 'DXY', symbol: symbols.dxy, sign: +1, weight: 1.0 },
        { label: 'VIX', symbol: symbols.vix, sign: +1, weight: 1.0 },
        { label: 'VHSI', symbol: symbols.vhsi, sign: +1, weight: vhsiWeight },
    ];
    const betaNegItems = betaNegItemsRaw
        .map(x => ({ ...x, raw: getChangePct(data, x.symbol) }))
        .map(x => ({ ...x, val: x.raw === null ? null : x.sign * x.raw }));

    const betaPosScore = avg(betaPosItems.map(x => x.val));
    const betaNegScore = avg(betaNegItems.map(x => x.val));

    const wti = getChangePct(data, symbols.wti);
    const brent = getChangePct(data, symbols.brent);
    const oilScore = [wti, brent].filter(v => typeof v === 'number' && Number.isFinite(v)).length ? Math.max(wti || -Infinity, brent || -Infinity) : null;

    const delta = (typeof betaPosScore === 'number' ? betaPosScore : 0) - (typeof betaNegScore === 'number' ? betaNegScore : 0);
    let signal = 'Neutro';
    if (delta > 0.25) signal = 'Apetite ao Risco';
    if (delta < -0.25) signal = 'Proteção';

    const cadStrength = betaPosItems.find(x => x.label === 'USD/CAD');
    const rubStrength = betaPosItems.find(x => x.label === 'USD/RUB');
    const cadRubConfirm =
        cadStrength &&
        rubStrength &&
        typeof cadStrength.raw === 'number' &&
        typeof rubStrength.raw === 'number' &&
        cadStrength.raw <= -0.15 &&
        rubStrength.raw <= -0.15;
    const oilUpStrong = typeof oilScore === 'number' && Number.isFinite(oilScore) && oilScore >= 0.7;
    const oilBias = oilUpStrong && cadRubConfirm ? 'Reforça Bloco Risco' : 'Neutro';

    const betaPosCount = betaPosItems.filter(x => x.val !== null).length;
    const betaNegCount = betaNegItems.filter(x => x.val !== null).length;
    const betaPosAction = classifyRiskBlockAction(betaPosScore);
    const betaNegAction = classifyProtectionBlockAction(betaNegScore);

    setDot('fs-beta-pos-dot', betaPosAction.state, betaPosAction.state === 'buy-usd');
    setDot('fs-beta-neg-dot', betaNegAction.state, betaNegAction.state === 'sell-usd');

    setMetric('fs-beta-pos-score', betaPosScore === null ? '—' : formatNumber(betaPosScore, 3));
    setMetric('fs-beta-pos-detail', betaPosCount ? `${betaPosCount}/4 • ${betaPosAction.label}` : '—');
    setMetric('fs-beta-neg-score', betaNegScore === null ? '—' : formatNumber(betaNegScore, 3));
    setMetric('fs-beta-neg-detail', betaNegCount ? `${betaNegCount}/4 • ${betaNegAction.label}` : '—');
    setMetric('fs-oil-score', oilScore === null ? '—' : formatPercent(oilScore, 2));
    setMetric('fs-oil-detail', oilBias);
    setMetric('fs-signal', signal);
    setMetric('fs-signal-score', `${formatNumber(delta, 3)} • ${delta > 0.25 ? 'Vender USD' : delta < -0.25 ? 'Comprar USD' : 'Neutro'}`);

    const observedCount = betaPosCount + betaNegCount;
    if (observedCount < 3) {
        setMetric('fs-thermo-score', '—');
        setMetric('fs-thermo-detail', '—');
        setHtml('fs-history', '');
        setHtml('fs-alerts', '');
    } else {
        const oilAdj = oilBias === 'Reforça Bloco Risco' ? +0.15 : 0;

        const composite = delta + oilAdj;
        const score01 = Math.max(0, Math.min(1, (composite + 0.8) / 1.6));
        const score10 = Math.round(score01 * 10);
        const pct = Math.round(score01 * 100);
        const thermoLabel = score10 >= 7 ? 'Risk-On' : score10 <= 3 ? 'Risk-Off' : 'Neutro';

        setMetric('fs-thermo-score', `${score10}/10`);
        setHtml('fs-thermo-detail', `
            <div style="display:flex;flex-direction:column;gap:6px;">
                <div style="opacity:.90;">${escapeHtml(thermoLabel)}${oilAdj !== 0 ? ` • Ajuste petróleo ${oilAdj > 0 ? '+' : ''}${formatNumber(oilAdj, 2)}` : ''}</div>
                <div class="fs-thermo" aria-label="Termômetro de pré-mercado">
                    <div class="fs-thermo__fill" style="width:${pct}%;"></div>
                    <div class="fs-thermo__pin" style="left:${pct}%;"></div>
                </div>
            </div>
        `);

        const historyKey = 'mercado_fs_history_v1';
        const maxHistory = 24;
        const nowMs = Date.now();

        const readHistory = () => {
            try {
                const raw = localStorage.getItem(historyKey);
                const parsed = raw ? JSON.parse(raw) : null;
                if (!Array.isArray(parsed)) return [];
                return parsed
                    .filter(x => x && typeof x === 'object')
                    .map(x => {
                        const o = x;
                        const tMs = typeof o.tMs === 'number' && Number.isFinite(o.tMs) ? o.tMs : null;
                        const s10 = typeof o.s10 === 'number' && Number.isFinite(o.s10) ? o.s10 : null;
                        const p = typeof o.pct === 'number' && Number.isFinite(o.pct) ? o.pct : null;
                        const d = typeof o.delta === 'number' && Number.isFinite(o.delta) ? o.delta : null;
                        const oa = typeof o.oilAdj === 'number' && Number.isFinite(o.oilAdj) ? o.oilAdj : 0;
                        const lab = typeof o.label === 'string' ? o.label : '';
                        if (tMs === null || s10 === null || p === null || d === null) return null;
                        return { tMs, s10, pct: p, delta: d, oilAdj: oa, label: lab };
                    })
                    .filter(Boolean);
            } catch {
                return [];
            }
        };

        const writeHistory = items => {
            try {
                localStorage.setItem(historyKey, JSON.stringify(items));
            } catch {
            }
        };

        const toTime = tMs => {
            try {
                return new Date(tMs).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            } catch {
                return '';
            }
        };

        const clamp10 = v => Math.max(0, Math.min(10, Math.round(v)));
        const toneColor = s10 => {
            const x = clamp10(s10);
            if (x <= 3) return 'rgba(255,60,80,.95)';
            if (x >= 7) return 'rgba(0,255,160,.95)';
            return 'rgba(255,210,74,.95)';
        };

        const history = readHistory();
        const nextItem = { tMs: nowMs, s10: score10, pct: pct, delta: delta, oilAdj: oilAdj, label: thermoLabel };
        const last = history.length ? history[history.length - 1] : null;
        if (last && nowMs - last.tMs < 20000) {
            history[history.length - 1] = nextItem;
        } else {
            history.push(nextItem);
        }
        const trimmed = history.slice(-maxHistory);
        writeHistory(trimmed);

        const bars = trimmed
            .slice(-12)
            .map(h => {
                const height = 8 + clamp10(h.s10) * 2.3;
                const title = `${toTime(h.tMs)} • ${clamp10(h.s10)}/10 • Δ ${formatNumber(h.delta, 3)}${h.oilAdj ? ` • oil ${h.oilAdj > 0 ? '+' : ''}${formatNumber(h.oilAdj, 2)}` : ''}`;
                return `<div title="${escapeHtml(title)}" style="width:10px;height:${height}px;background:${toneColor(h.s10)};border-radius:4px;opacity:.92;"></div>`;
            })
            .join('');

        setHtml('fs-history', `
            <div style="border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:12px;background:rgba(0,0,0,.18);">
                <div style="display:flex;align-items:baseline;justify-content:space-between;gap:10px;flex-wrap:wrap;">
                    <div style="font-weight:900;letter-spacing:1px;opacity:.95;">Histórico (últimas janelas)</div>
                    <div style="opacity:.80;font-size:12px;">${escapeHtml(trimmed.length ? `${toTime(trimmed[trimmed.length - 1].tMs)}` : '')}</div>
                </div>
                <div style="display:flex;align-items:flex-end;gap:6px;margin-top:10px;min-height:38px;">
                    ${bars || '<div style="opacity:.85;">—</div>'}
                </div>
            </div>
        `);

        const alerts = [];
        const betaPosAbs = typeof betaPosScore === 'number' ? Math.abs(betaPosScore) : 0;
        const betaNegAbs = typeof betaNegScore === 'number' ? Math.abs(betaNegScore) : 0;
        if (betaPosCount >= 2 && betaNegCount >= 2 && betaPosAction.state !== betaNegAction.state && betaPosAbs >= 0.18 && betaNegAbs >= 0.18) {
            alerts.push('Divergência: blocos Risco e Proteção estão puxando para lados opostos.');
        }
        if (Math.abs(delta) < 0.12 && betaPosAbs >= 0.18 && betaNegAbs >= 0.18) {
            alerts.push('Sem consenso: delta neutro com blocos “fortes” (ruído/abertura).');
        }
        setHtml('fs-alerts', alerts.length
            ? `
                <div style="border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:12px;background:rgba(0,0,0,.18);">
                    <div style="font-weight:900;letter-spacing:1px;opacity:.95;margin-bottom:8px;">Alertas (divergência)</div>
                    ${alerts.map(t => `<div style="padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06);opacity:.92;line-height:1.35;">${escapeHtml(t)}</div>`).join('')}
                </div>
              `
            : '');
    }

    const rows = []
        .concat([{ title: 'Bloco Risco (FX)' }])
        .concat(betaPosItems.map(x => ({ label: x.label, val: x.val })))
        .concat([{ title: 'Bloco Proteção (FX)' }])
        .concat(betaNegItems.map(x => ({ label: x.label, val: x.val })));

    const html = `
        <div style="border:1px solid rgba(255,255,255,.12);border-radius:10px;padding:12px 12px;background:rgba(0,0,0,.25);">
            ${rows
                .map(r => {
                    if (r.title) {
                        return `<div style="font-weight:900;letter-spacing:1px;opacity:.9;margin-top:10px;">${escapeHtml(r.title)}</div>`;
                    }
                    const val = typeof r.val === 'number' ? r.val : null;
                    const txt = val === null ? '—' : formatPercent(val, 2);
                    const badge = val === null ? '—' : toneBadgeHtml(val, txt, { maxAbs: 5 });
                    return `
                        <div style="display:flex;justify-content:space-between;gap:10px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06);">
                            <div style="opacity:.9;font-weight:700;">${escapeHtml(r.label)}</div>
                            <div style="font-family:'Share Tech Mono',monospace;">${badge}</div>
                        </div>
                    `;
                })
                .join('')}
        </div>
    `;
    setHtml('fs-components', html);
}

function renderCarryTradeMonitor(data) {
    const resolveJapan10yYield = () => {
        const yieldSymbol =
            findAssetSymbol(data, /^JP10YT=RR$/i)
            || findAssetSymbol(data, /\bJapan\b(?!.*\b(CDS|Future|Futures)\b).*?\b10\b.*?\bYear\b.*?\bYield\b/i)
            || findAssetSymbol(data, /\bJapan\b(?!.*\b(CDS|Future|Futures)\b).*?\b10\b.*?\bYear\b/i);
        return yieldSymbol || null;
    };

    const symbols = {
        audusd: findAssetSymbol(data, /^AUD\/USD\b/i),
        nzdusd: findAssetSymbol(data, /^NZD\/USD\b/i),
        usdjpy: findAssetSymbol(data, /^USD\/JPY\b/i),
        usdbrl: findAliasSymbol(data, 'USD_BRL'),
        dxy: findAliasSymbol(data, 'DXY'),
        br10y: findAssetSymbol(data, /^BR10YT=RR$/i),
        us10y: findAliasSymbol(data, 'US10Y'),
        us10br10: findAssetSymbol(data, /^US10BR10=RR$/i),
        us10jp10: findAssetSymbol(data, /^US10JP10=RR$/i),
        jp10y: resolveJapan10yYield(),
        jp1y: findAliasSymbol(data, 'JP1Y') || findAssetSymbol(data, /^JP1YT=(RR|XX)$/i),
        jp5y: findAliasSymbol(data, 'JP5Y') || findAssetSymbol(data, /^JP5YT=(RR|XX)$/i),
        hk10y: findAliasSymbol(data, 'HK10Y'),
        hsi: findAssetSymbol(data, /\bHang\s*Seng\b/i),
        hstech: findAliasSymbol(data, 'HSTECH') || findAssetSymbol(data, /^HSTECH$/i),
        ewh: findAliasSymbol(data, 'EWH'),
        audjpy: findAssetSymbol(data, /^AUD\/JPY\b/i),
        nzdjpy: findAssetSymbol(data, /^NZD\/JPY\b/i),
    };

    const lastOf = symbol => {
        if (!symbol) return null;
        const p = getMostRecentPointWithPrice(data, symbol) || getLastPoint(data, symbol);
        if (!p) return null;
        const price = typeof p.price === 'number' && Number.isFinite(p.price) ? p.price : null;
        const change = typeof p.change === 'number' && Number.isFinite(p.change) ? p.change : null;
        const changePct = typeof p.changePct === 'number' && Number.isFinite(p.changePct) ? p.changePct : null;
        const t = p.t ? String(p.t) : '';
        return { price, change, changePct, t };
    };

    const audusd = lastOf(symbols.audusd);
    const nzdusd = lastOf(symbols.nzdusd);
    const usdjpy = lastOf(symbols.usdjpy);
    const usdbrl = lastOf(symbols.usdbrl);
    const dxy = lastOf(symbols.dxy);
    const br10y = lastOf(symbols.br10y);
    const us10y = lastOf(symbols.us10y);
    const us10br10 = lastOf(symbols.us10br10);
    const us10jp10 = lastOf(symbols.us10jp10);
    const jp10y = lastOf(symbols.jp10y);
    const jp1y = lastOf(symbols.jp1y);
    const jp5y = lastOf(symbols.jp5y);
    const audjpyDirect = lastOf(symbols.audjpy);
    const nzdjpyDirect = lastOf(symbols.nzdjpy);
    const hk10y = lastOf(symbols.hk10y);
    const hsi = lastOf(symbols.hsi);
    const hstech = lastOf(symbols.hstech);
    const ewh = lastOf(symbols.ewh);

    const pctOf = x => (x && typeof x.changePct === 'number' ? x.changePct : null);
    const priceOf = x => (x && typeof x.price === 'number' ? x.price : null);
    const changeOf = x => (x && typeof x.change === 'number' ? x.change : null);

    const audusdPct = pctOf(audusd);
    const nzdusdPct = pctOf(nzdusd);
    const usdjpyPct = pctOf(usdjpy);
    const usdbrlPct = pctOf(usdbrl);
    const dxyPct = pctOf(dxy);
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

    const hasCore = [audusdPct, usdjpyPct].filter(v => typeof v === 'number').length >= 2;
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
        carryStatusDetail = 'AUD/USD e USD/JPY';
    } else if (typeof audjpyPct === 'number') {
        const severe = typeof usdjpyPct === 'number' && typeof audusdPct === 'number' && usdjpyPct <= -0.8 && audusdPct <= -0.6;
        if (audjpyPct <= -1.0 && severe) {
            carryStatus = 'Unwinding (severo)';
        } else if (audjpyPct <= -1.0) {
            carryStatus = 'Unwinding';
        } else if (audjpyPct >= 1.0) {
            carryStatus = 'Building';
        } else {
            carryStatus = 'Neutro';
        }
        const parts = [];
        if (typeof audjpyPct === 'number') parts.push(`AUD/JPY ${formatPercent(audjpyPct, 2)}`);
        if (typeof usdjpyPct === 'number') parts.push(`USD/JPY ${formatPercent(usdjpyPct, 2)}`);
        if (typeof audusdPct === 'number') parts.push(`AUD/USD ${formatPercent(audusdPct, 2)}`);
        carryStatusDetail = parts.join(' • ') || '—';
    }

    let flowLabel = 'Neutro';
    if (typeof audjpyPct === 'number' && typeof premiumPct === 'number') {
        const entering = premiumPct < -0.4 && audjpyPct > 0.4 && (typeof dxyPct !== 'number' || dxyPct <= 0.1);
        const leaving = premiumPct > 0.4 && audjpyPct < -0.4 && (typeof dxyPct !== 'number' || dxyPct >= -0.1);
        flowLabel = entering ? 'Entrando' : leaving ? 'Saindo' : 'Neutro';
    } else if (typeof audjpyPct === 'number') {
        if (audjpyPct > 0.6 && (typeof dxyPct !== 'number' || dxyPct < 0.1) && (typeof usdbrlPct !== 'number' || usdbrlPct < 0.1)) flowLabel = 'Entrando';
        if (audjpyPct < -0.6 && (typeof dxyPct !== 'number' || dxyPct > -0.1) && (typeof usdbrlPct !== 'number' || usdbrlPct > -0.1)) flowLabel = 'Saindo';
    }

    let score = 5;
    score += 1.8 * norm(audjpyPct || 0, 1.0);
    score += 1.2 * norm(-(premiumPct || 0), 0.8);
    score += 1.0 * norm(-(dxyPct || 0), 0.7);
    score += 1.2 * norm(-(usdbrlPct || 0), 0.7);
    if (typeof jp10yCarryV === 'number' && Number.isFinite(jp10yCarryV)) {
        score += 0.8 * norm(jp10yCarryV, 6);
    }

    if (typeof nzdusdPct === 'number' && typeof audusdPct === 'number' && Math.abs(nzdusdPct) > Math.abs(audusdPct) + 0.4) {
        score += nzdusdPct < 0 ? -0.6 : +0.2;
    }

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
        { label: 'DXY', v: dxyPct, fmt: x => formatPercent(x, 2), maxAbs: 5 },
        { label: 'USD/BRL', v: usdbrlPct, fmt: x => formatPercent(x, 2), maxAbs: 5 },
        { label: 'AUD/USD', v: audusdPct, fmt: x => formatPercent(x, 2), maxAbs: 5 },
        { label: 'NZD/USD', v: nzdusdPct, fmt: x => formatPercent(x, 2), maxAbs: 5 },
        { label: 'USD/JPY', v: usdjpyPct, fmt: x => formatPercent(x, 2), maxAbs: 5 },
        { label: 'AUD/JPY*', v: audjpyPct, fmt: x => formatPercent(x, 2), maxAbs: 5 },
        { label: 'NZD/JPY*', v: nzdjpyPct, fmt: x => formatPercent(x, 2), maxAbs: 5 },
        { label: 'JP10Y (Δ bp)', v: jp10yCarryV, fmt: () => fmtSignedBp(jp10yBps), maxAbs: 35 },
        { label: 'Spread US10–JP10 (bps)', v: usjpBps, fmt: x => formatNumber(x, 1), maxAbs: 800 },
        { label: 'Prêmio BR vs US (bps)', v: hasPremium ? premiumBps : null, fmt: x => formatNumber(x, 1), maxAbs: 1200 },
    ];

    const listHtml = `
        <div style="border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:12px;background:rgba(0,0,0,.18);">
            <div style="font-weight:900;letter-spacing:1px;opacity:.95;margin-bottom:8px;">Componentes</div>
            ${rows
                .filter(r => r.v !== null && r.v !== undefined)
                .map(r => {
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
            const raw = localStorage.getItem(historyKey);
            const parsed = raw ? JSON.parse(raw) : null;
            if (!Array.isArray(parsed)) return [];
            return parsed
                .filter(x => x && typeof x === 'object')
                .map(x => {
                    const o = x;
                    const tMs = typeof o.tMs === 'number' && Number.isFinite(o.tMs) ? o.tMs : null;
                    const s10 = typeof o.s10 === 'number' && Number.isFinite(o.s10) ? o.s10 : null;
                    const label = typeof o.label === 'string' ? o.label : '';
                    const aj = typeof o.audjpyPct === 'number' && Number.isFinite(o.audjpyPct) ? o.audjpyPct : null;
                    const prem = typeof o.premiumPct === 'number' && Number.isFinite(o.premiumPct) ? o.premiumPct : null;
                    if (tMs === null || s10 === null) return null;
                    return { tMs, s10, label, audjpyPct: aj, premiumPct: prem };
                })
                .filter(Boolean);
        } catch {
            return [];
        }
    };

    const writeHistory = items => {
        try {
            localStorage.setItem(historyKey, JSON.stringify(items));
        } catch {
        }
    };

    const toTime = tMs => {
        try {
            return new Date(tMs).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        } catch {
            return '';
        }
    };

    const toneColor = s10 => {
        const x = clamp(Math.round(s10), 0, 10);
        if (x <= 3) return 'rgba(255,60,80,.95)';
        if (x >= 7) return 'rgba(0,255,160,.95)';
        return 'rgba(255,210,74,.95)';
    };

    const history = readHistory();
    const nextItem = { tMs: nowMs, s10: score10, label: flowLabel, audjpyPct: audjpyPct, premiumPct: premiumPct };
    const last = history.length ? history[history.length - 1] : null;
    if (last && nowMs - last.tMs < 20000) {
        history[history.length - 1] = nextItem;
    } else {
        history.push(nextItem);
    }
    const trimmed = history.slice(-maxHistory);
    writeHistory(trimmed);

    const bars = trimmed
        .slice(-12)
        .map(h => {
            const height = 8 + clamp(h.s10, 0, 10) * 2.3;
            const parts = [`${toTime(h.tMs)} • ${clamp(h.s10, 0, 10)}/10 • ${h.label}`];
            if (typeof h.audjpyPct === 'number') parts.push(`AUD/JPY ${formatPercent(h.audjpyPct, 2)}`);
            if (typeof h.premiumPct === 'number') parts.push(`Prêmio ${formatPercent(h.premiumPct, 2)}`);
            const title = parts.join(' • ');
            return `<div title="${escapeHtml(title)}" style="width:10px;height:${height}px;background:${toneColor(h.s10)};border-radius:4px;opacity:.92;"></div>`;
        })
        .join('');

    setHtml('carry-history', `
        <div style="border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:12px;background:rgba(0,0,0,.18);">
            <div style="display:flex;align-items:baseline;justify-content:space-between;gap:10px;flex-wrap:wrap;">
                <div style="font-weight:900;letter-spacing:1px;opacity:.95;">Histórico (últimas janelas)</div>
                <div style="opacity:.80;font-size:12px;">${escapeHtml(trimmed.length ? `${toTime(trimmed[trimmed.length - 1].tMs)}` : '')}</div>
            </div>
            <div style="display:flex;align-items:flex-end;gap:6px;margin-top:10px;min-height:38px;">
                ${bars || '<div style="opacity:.85;">—</div>'}
            </div>
        </div>
    `);

    const alerts = [];
    if (typeof audjpyPct === 'number' && Math.abs(audjpyPct) >= 1.0) alerts.push(`AUD/JPY (sintético) ${formatPercent(audjpyPct, 2)}: movimento significativo.`);
    if (typeof usdjpyPct === 'number' && Math.abs(usdjpyPct) >= 0.8) alerts.push(`USD/JPY ${formatPercent(usdjpyPct, 2)}: funding mexendo forte.`);
    if (typeof nzdjpyPct === 'number' && Math.abs(nzdjpyPct) >= 1.0) alerts.push(`NZD/JPY (sintético) ${formatPercent(nzdjpyPct, 2)}: early warning possível.`);
    if (typeof premiumPct === 'number' && Math.abs(premiumPct) >= 0.6) alerts.push(`Prêmio BR vs US ${formatPercent(premiumPct, 2)}: compressão/abertura relevante.`);
    if (typeof jp10yLevel === 'number' && Number.isFinite(jp10yLevel) && jp10yLevel > 0 && typeof jp10yBps === 'number' && Number.isFinite(jp10yBps) && jp10yBps >= 4) {
        alerts.push(`JP10Y ${formatNumber(jp10yLevel, 2)}% com alta de ~${formatNumber(jp10yBps, 0)}bp: juros do Japão abrindo → risco de carry voltar para JPY (pressão em FX beta).`);
    }
    if (carryStatus === 'Unwinding (severo)') alerts.push('Duplo unwinding: USD/JPY e AUD/USD caindo com força.');
    if (!hasPremium) alerts.push('Prêmio BR vs US não disponível (US10BR10 ou US10Y/BR10Y ausentes).');

    setHtml('carry-alerts', alerts.length
        ? `
            <div style="border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:12px;background:rgba(0,0,0,.18);">
                <div style="font-weight:900;letter-spacing:1px;opacity:.95;margin-bottom:8px;">Alertas</div>
                ${alerts.map(t => `<div style="padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06);opacity:.92;line-height:1.35;">${escapeHtml(t)}</div>`).join('')}
            </div>
          `
        : '');
}

function renderCarryIntel(data) {
    const el = document.getElementById('carryIntel');
    if (!el) return;

    const resolveJapan10yYield = () => {
        const yieldSymbol =
            findAssetSymbol(data, /^JP10YT=RR$/i)
            || findAssetSymbol(data, /\bJapan\b(?!.*\b(CDS|Future|Futures)\b).*?\b10\b.*?\bYear\b.*?\bYield\b/i)
            || findAssetSymbol(data, /\bJapan\b(?!.*\b(CDS|Future|Futures)\b).*?\b10\b.*?\bYear\b/i);
        return yieldSymbol || null;
    };

    const symbols = {
        audusd: findAssetSymbol(data, /^AUD\/USD\b/i),
        nzdusd: findAssetSymbol(data, /^NZD\/USD\b/i),
        usdjpy: findAssetSymbol(data, /^USD\/JPY\b/i),
        usdbrl: findAssetSymbol(data, /^USD\/BRL\b/i),
        dxy: findAssetSymbol(data, /(^\.DXY$|\bDXY\b|US Dollar Index)/i),
        br10y: findAssetSymbol(data, /^BR10YT=RR$/i),
        us10y: findAssetSymbol(data, /^US10YT=RR$/i),
        us10br10: findAssetSymbol(data, /^US10BR10=RR$/i),
        jp10y: resolveJapan10yYield(),
        audjpy: findAssetSymbol(data, /^AUD\/JPY\b/i),
        nzdjpy: findAssetSymbol(data, /^NZD\/JPY\b/i),
    };

    const lastOf = symbol => {
        if (!symbol) return null;
        const p = getMostRecentPointWithPrice(data, symbol) || getLastPoint(data, symbol);
        if (!p) return null;
        const price = typeof p.price === 'number' && Number.isFinite(p.price) ? p.price : null;
        const change = typeof p.change === 'number' && Number.isFinite(p.change) ? p.change : null;
        const changePct = typeof p.changePct === 'number' && Number.isFinite(p.changePct) ? p.changePct : null;
        return { price, change, changePct };
    };

    const audusd = lastOf(symbols.audusd);
    const nzdusd = lastOf(symbols.nzdusd);
    const usdjpy = lastOf(symbols.usdjpy);
    const usdbrl = lastOf(symbols.usdbrl);
    const dxy = lastOf(symbols.dxy);
    const br10y = lastOf(symbols.br10y);
    const us10y = lastOf(symbols.us10y);
    const us10br10 = lastOf(symbols.us10br10);
    const jp10y = lastOf(symbols.jp10y);
    const audjpyDirect = lastOf(symbols.audjpy);
    const nzdjpyDirect = lastOf(symbols.nzdjpy);

    const pctOf = x => (x && typeof x.changePct === 'number' ? x.changePct : null);

    const audusdPct = pctOf(audusd);
    const nzdusdPct = pctOf(nzdusd);
    const usdjpyPct = pctOf(usdjpy);
    const usdbrlPct = pctOf(usdbrl);
    const dxyPct = pctOf(dxy);
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

    const coreOk = [audusdPct, usdjpyPct].filter(v => typeof v === 'number').length >= 2;
    let carryState = 'Inconclusivo';
    if (coreOk && typeof audjpyPct === 'number') {
        const severe = typeof usdjpyPct === 'number' && typeof audusdPct === 'number' && usdjpyPct <= -0.8 && audusdPct <= -0.6;
        if (audjpyPct <= -1.0 && severe) carryState = 'Unwinding (severo)';
        else if (audjpyPct <= -1.0) carryState = 'Unwinding';
        else if (audjpyPct >= 1.0) carryState = 'Building';
        else carryState = 'Neutro';
    } else if (!coreOk) {
        carryState = 'Dados insuficientes';
    }

    let carryFlow = 'Neutro';
    if (typeof audjpyPct === 'number' && typeof premiumPct === 'number') {
        const entering = premiumPct < -0.4 && audjpyPct > 0.4 && (typeof dxyPct !== 'number' || dxyPct <= 0.1);
        const leaving = premiumPct > 0.4 && audjpyPct < -0.4 && (typeof dxyPct !== 'number' || dxyPct >= -0.1);
        carryFlow = entering ? 'Entrando' : leaving ? 'Saindo' : 'Neutro';
    } else if (typeof audjpyPct === 'number') {
        if (audjpyPct > 0.6 && (typeof dxyPct !== 'number' || dxyPct < 0.1) && (typeof usdbrlPct !== 'number' || usdbrlPct < 0.1)) carryFlow = 'Entrando';
        if (audjpyPct < -0.6 && (typeof dxyPct !== 'number' || dxyPct > -0.1) && (typeof usdbrlPct !== 'number' || usdbrlPct > -0.1)) carryFlow = 'Saindo';
    }

    const cov = [audjpyPct, usdjpyPct, audusdPct, dxyPct, usdbrlPct, premiumPct].filter(v => typeof v === 'number').length;
    const confidence = cov >= 5 ? 'Alta' : cov >= 3 ? 'Média' : 'Baixa';

    const rows = [
        { label: 'Estado do carry', badge: mk(carryState.includes('Unwinding') ? 'negative' : carryState === 'Building' ? 'positive' : 'neutral', carryState) },
        { label: 'Carrego entrando/saindo', badge: mk(carryFlow === 'Saindo' ? 'negative' : carryFlow === 'Entrando' ? 'positive' : 'neutral', carryFlow) },
        { label: 'Confiança', badge: mk(confidence === 'Alta' ? 'positive' : confidence === 'Baixa' ? 'negative' : 'neutral', confidence) },
    ];

    const evidence = [
        { label: 'AUD/JPY (proxy carry)', ...moveLabel(audjpyPct, { strong: 1.0, medium: 0.4 }), note: pctOf(audjpyDirect) === null ? 'Sintético' : '' },
        { label: 'USD/JPY (funding)', ...moveLabel(usdjpyPct, { strong: 0.8, medium: 0.3 }) },
        { label: 'AUD/USD (beta)', ...moveLabel(audusdPct, { strong: 0.8, medium: 0.3 }) },
        { label: 'DXY (USD global)', ...moveLabelInverted(dxyPct, { strong: 0.7, medium: 0.25 }) },
        { label: 'USD/BRL (risco BR)', ...moveLabelInverted(usdbrlPct, { strong: 0.7, medium: 0.25 }) },
        {
            label: 'JP10Y (juros Japão)',
            ...(jp10yBps === null
                ? (jp10yPct === null ? { txt: 'Sem dado', tone: 'neutral' } : moveLabelInverted(jp10yPct, { strong: 1.0, medium: 0.35 }))
                : (() => {
                    const bps = jp10yBps;
                    if (bps >= 4) return { txt: 'Alta forte', tone: 'negative' };
                    if (bps >= 1.5) return { txt: 'Alta', tone: 'negative' };
                    if (bps <= -4) return { txt: 'Queda forte', tone: 'positive' };
                    if (bps <= -1.5) return { txt: 'Queda', tone: 'positive' };
                    return { txt: 'Estável', tone: 'neutral' };
                })()),
        },
        { label: 'Prêmio BR vs US (proxy)', ...(premiumPct === null ? { txt: hasPremium ? 'Disponível (sem var%)' : 'Indisponível', tone: hasPremium ? 'neutral' : 'negative' } : moveLabelInverted(premiumPct, { strong: 0.6, medium: 0.25 })) },
        { label: 'NZD/JPY (early warning)', ...moveLabel(nzdjpyPct, { strong: 1.0, medium: 0.4 }), note: pctOf(nzdjpyDirect) === null ? 'Sintético' : '' },
    ];

    const html = `
        <div style="border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:12px;background:rgba(0,0,0,.18);">
            <div style="display:grid;grid-template-columns:1fr;gap:10px;">
                ${rows
                    .map(r => `
                        <div style="display:flex;justify-content:space-between;gap:12px;align-items:center;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06);">
                            <div style="font-weight:900;letter-spacing:.6px;opacity:.92;">${escapeHtml(r.label)}</div>
                            <div style="font-family:'Share Tech Mono',monospace;font-weight:900;">${r.badge}</div>
                        </div>
                    `)
                    .join('')}
            </div>
        </div>
        <div style="margin-top:12px;border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:12px;background:rgba(0,0,0,.18);">
            <div style="font-weight:900;letter-spacing:1px;opacity:.95;margin-bottom:8px;">Evidências (qualitativas)</div>
            ${evidence
                .map(e => {
                    const badge = mk(e.tone, e.txt);
                    const note = e.note ? `<span style="opacity:.7;font-size:12px;margin-left:8px;">${escapeHtml(e.note)}</span>` : '';
                    return `
                        <div style="display:flex;justify-content:space-between;gap:10px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06);align-items:center;">
                            <div style="opacity:.92;font-weight:800;">${escapeHtml(e.label)}${note}</div>
                            <div style="font-family:'Share Tech Mono',monospace;font-weight:900;">${badge}</div>
                        </div>
                    `;
                })
                .join('')}
        </div>
    `;

    el.innerHTML = html;
}

function resolveTickerSymbol(data, matchers) {
    for (const m of matchers || []) {
        const sym = findAssetSymbol(data, m);
        if (sym) return sym;
    }
    return null;
}

function formatTickerPrice(symbol, price, fmt) {
    if (price === null || price === undefined || !Number.isFinite(price)) return '—';
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
            const pct = typeof last.changePct === 'number' ? last.changePct : null;
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

    const group = items
        .map(x => {
            return `
                <div class="market-ticker__item" data-symbol="${escapeHtml(x.symbol)}" title="${escapeHtml(x.title)}">
                    <div style="display:flex;align-items:baseline;gap:10px;min-width:0;">
                        <span class="market-ticker__short">${escapeHtml(x.short)}</span>
                        <span class="market-ticker__price">${escapeHtml(x.priceTxt)}</span>
                    </div>
                    <div style="font-family:'Share Tech Mono',monospace;">${x.badge}</div>
                </div>
            `;
        })
        .join('');

    el.innerHTML = `<div class="market-ticker__group">${group}</div><div class="market-ticker__group" aria-hidden="true">${group}</div>`;

    el.querySelectorAll('.market-ticker__item').forEach(node => {
        node.addEventListener('click', () => {
            const symbol = node.getAttribute('data-symbol') || '';
            if (!symbol) return;
            try {
                localStorage.setItem('mercado_table_q:all', symbolKey(symbol));
                localStorage.setItem('mercado_table_mode:all', 'all');
            } catch {
            }
            renderAllAssetsTable(data);
            location.hash = '#all-assets';
        });
    });
}

function renderOverview(data) {
    const retentionDays = (data.meta && data.meta.retentionDays) || 10;
    setMetric('metric-assets', String((data.assets || []).length));
    setMetric('metric-retention', `${retentionDays} dias`);

    const rowsAll = (data.assets || [])
        .map(a => ({ a, last: getLastPoint(data, a.symbol) }))
        .filter(x => x.last && typeof x.last.changePct === 'number');

    const sorted = rowsAll.slice().sort((x, y) => (y.last.changePct || 0) - (x.last.changePct || 0));
    const topUp = sorted.length ? sorted[0] : null;
    const topDown = sorted.length ? sorted[sorted.length - 1] : null;

    if (topUp) {
        setMetricMultiline('metric-top-up', topUp.a.name || topUp.a.symbol);
        setHtml('metric-top-up-pct', toneBadgeHtml(topUp.last.changePct, formatPercent(topUp.last.changePct), { maxAbs: 5 }));
    }
    if (topDown) {
        setMetricMultiline('metric-top-down', topDown.a.name || topDown.a.symbol);
        setHtml('metric-top-down-pct', toneBadgeHtml(topDown.last.changePct, formatPercent(topDown.last.changePct), { maxAbs: 5 }));
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
    const groups = [
        { label: 'Ações & ETFs', categories: ['equities'] },
        { label: 'Emergentes (ETFs/Índices)', categories: ['emerging'] },
        { label: 'FX G10', categories: ['fx_g10'] },
        { label: 'FX Emergentes', categories: ['fx_emerging'] },
        { label: 'Juros', categories: ['rates'] },
        { label: 'Crédito (CDS/Spreads)', categories: ['credit'] },
        { label: 'Volatilidade', categories: ['volatility'] },
        { label: 'Commodities • Energia', categories: ['energy'] },
        { label: 'Commodities • Metais', categories: ['metals'] },
        { label: 'Commodities • Agrícolas', categories: ['agriculture'] },
        { label: 'Commodities • Outras', categories: ['commodities'] },
        { label: 'Crypto', categories: ['crypto'] },
    ];

    const used = new Set(groups.flatMap(g => g.categories));
    const extras = Array.from(new Set((data.assets || []).map(a => a.category))).filter(c => c && !used.has(c));
    if (extras.length) groups.push({ label: 'Outros', categories: extras });

    const rows = [];
    for (const g of groups) {
        const rs = buildRows(data, g.categories, true)
            .slice()
            .sort((a, b) => String(a.name).localeCompare(String(b.name)));
        if (!rs.length) continue;
        rows.push({ separator: true, label: g.label });
        rows.push(...rs);
    }

    createTable(containerId, rows, data, null, { limit: null, sortable: true, grouped: true, tableKey: 'all', toolbar: true, favorites: true });
}

function renderBrazilExportBasket(data) {
    const el = document.getElementById('exportBasket');
    if (!el) return;

    const mk = (tone, txt) => toneBadgeHtmlFromTone(tone, 0, txt, { maxAbs: 1 });
    const pctOf = x => (x && typeof x.changePct === 'number' ? x.changePct : null);

    const dirFromPct = pct => {
        if (pct === null) return { txt: 'Sem dado', tone: 'neutral' };
        if (pct >= 0.35) return { txt: 'Alta', tone: 'positive' };
        if (pct <= -0.35) return { txt: 'Queda', tone: 'negative' };
        return { txt: 'Estável', tone: 'neutral' };
    };

    const getItem = ({ key, label, matchers, weight }) => {
        const symbol = resolveTickerSymbol(data, matchers);
        const last = symbol ? getLastPoint(data, symbol) : null;
        const pct = pctOf(last);
        const present = !!(symbol && last && typeof last.price === 'number');
        return { key, label, symbol, last, pct, present, weight: Number(weight) || 0 };
    };

    const items = [
        getItem({ key: 'iron', label: 'Minério', matchers: [/^TIOc1$/i, /^SM58Fc1$/i, /^9047$/i, /^3047$/i], weight: 0.28 }),
        getItem({ key: 'soy', label: 'Soja', matchers: [/^ZS$/i], weight: 0.20 }),
        getItem({ key: 'oil', label: 'Petróleo', matchers: [/\bBrent\b/i, /\bWTI\b/i], weight: 0.18 }),
        getItem({ key: 'lumber', label: 'Madeira serrada', matchers: [/^LBc1$/i, /^LBc\d+$/i, /^LXRc1$/i, /^LXRc\d+$/i, /\bMadeira Serrada\b/i, /\bLumber\b/i], weight: 0.02 }),
        getItem({ key: 'cattle', label: 'Boi', matchers: [/^BGIc1$/i, /^LCc1$/i, /^BBOI11\.SA$/i, /\bBoi Gordo\b/i, /\bLive Cattle\b/i, /^LE$/i], weight: 0.12 }),
        getItem({ key: 'hogs', label: 'Porco Magro', matchers: [/^LHc1$/i, /^LHc\d+$/i, /\bPorco Magro\b/i, /\bLean Hogs\b/i], weight: 0.03 }),
        getItem({ key: 'coffee', label: 'Café', matchers: [/^KC$/i], weight: 0.07 }),
        getItem({ key: 'sugar', label: 'Açúcar', matchers: [/^SB$/i], weight: 0.05 }),
        getItem({ key: 'corn', label: 'Milho', matchers: [/^ZC$/i], weight: 0.04 }),
    ];

    const score = (() => {
        let wSum = 0;
        let sum = 0;
        for (const it of items) {
            if (typeof it.pct !== 'number') continue;
            const w = Number(it.weight) || 0;
            if (!Number.isFinite(w) || w <= 0) continue;
            wSum += w;
            sum += w * it.pct;
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

    const essentials = ['iron', 'soy', 'oil', 'cattle', 'coffee'];
    const presentEssentials = essentials.filter(k => items.find(x => x.key === k && x.present)).length;
    const coverage = presentEssentials >= essentials.length ? { label: 'Completo', tone: 'positive' } : presentEssentials >= 3 ? { label: 'Parcial', tone: 'neutral' } : { label: 'Insuficiente', tone: 'negative' };

    const rowHtml = items
        .map(it => {
            const status = it.present ? { label: 'OK', tone: 'positive' } : { label: 'AUSENTE', tone: 'negative' };
            const dir = dirFromPct(it.pct);
            const sym = it.symbol ? `<span style="opacity:.7;margin-left:8px;font-size:12px;">${escapeHtml(it.symbol)}</span>` : '';
            return `
                <div style="display:flex;justify-content:space-between;gap:10px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06);align-items:center;">
                    <div style="min-width:0;">
                        <div style="font-weight:900;letter-spacing:.6px;opacity:.92;">${it.present ? '✅' : '❌'} ${escapeHtml(it.label)}${sym}</div>
                        <div style="opacity:.75;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(it.present ? 'Presente no feed' : 'Não encontrado no feed')}</div>
                    </div>
                    <div style="text-align:right;min-width:150px;display:flex;gap:8px;justify-content:flex-end;align-items:center;font-family:'Share Tech Mono',monospace;font-weight:900;">
                        <span>${mk(status.tone, status.label)}</span>
                        <span>${mk(dir.tone, dir.txt)}</span>
                    </div>
                </div>
            `;
        })
        .join('');

    el.innerHTML = `
        <div style="border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:12px;background:rgba(0,0,0,.18);">
            <div style="display:grid;grid-template-columns:1fr;gap:10px;">
                <div style="display:flex;justify-content:space-between;gap:12px;align-items:center;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06);">
                    <div style="font-weight:900;letter-spacing:.6px;opacity:.92;">Export Basket</div>
                    <div style="font-family:'Share Tech Mono',monospace;font-weight:900;">${mk(basket.tone, basket.label)}</div>
                </div>
                <div style="display:flex;justify-content:space-between;gap:12px;align-items:center;padding:6px 0;">
                    <div style="font-weight:900;letter-spacing:.6px;opacity:.92;">Cobertura (essenciais)</div>
                    <div style="font-family:'Share Tech Mono',monospace;font-weight:900;">${mk(coverage.tone, coverage.label)}</div>
                </div>
            </div>
        </div>
        <div style="margin-top:12px;border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:12px;background:rgba(0,0,0,.18);">
            <div style="font-weight:900;letter-spacing:1px;opacity:.95;margin-bottom:8px;">Checklist de commodities-chave</div>
            ${rowHtml}
        </div>
    `;
}

function renderBrazilMarket(data) {
    const tableId = 'brazilTable';
    const chartId = 'brazilChart';
    const assets = data && data.assets ? data.assets : [];

    renderBrazilExportBasket(data);

    const allRows = assets.map(a => {
        const last = getLastPoint(data, a.symbol);
        return {
            symbol: a.symbol,
            name: a.name,
            exchange: a.exchange || '',
            category: a.category,
            tags: a.tags || [],
            last,
        };
    });

    const brazilOnly = allRows.filter(isBrazilRelated);
    if (!brazilOnly.length) {
        const container = document.getElementById(tableId);
        if (container) container.innerHTML = '<p style="opacity:.8">Sem ativos do Brasil no monitoramento.</p>';
        return;
    }

    const groupOrder = [
        'Índices & Volatilidade',
        'Índice (Futuros)',
        'Câmbio BRL',
        'Juros Brasil',
        'Risco País (CDS)',
        'ETFs Brasil',
        'B3 (Ações/ETFs)',
        'Empresas BR (ADR)',
        'Brasil (Outros)',
    ];

    const byGroup = new Map();
    for (const r of brazilOnly) {
        const g = brazilGroup(r);
        if (!byGroup.has(g)) byGroup.set(g, []);
        byGroup.get(g).push(r);
    }

    const rows = [];
    for (const g of groupOrder) {
        const list = (byGroup.get(g) || []).slice().sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')));
        if (!list.length) continue;
        rows.push({ separator: true, label: g });
        rows.push(...list);
    }

    const prioritySymbols = ['.BVSP', 'WINc1', 'WDOc1', 'USD/BRL', 'EWZ', 'BOVA11.SA', 'BR10YT=RR'];
    let selected = null;
    for (const ps of prioritySymbols) {
        const found = brazilOnly.find(r => symbolKey(r.symbol) === ps || symbolKey(r.symbol).startsWith(ps));
        if (found && data.series && data.series[found.symbol] && data.series[found.symbol].length) {
            selected = found.symbol;
            break;
        }
    }
    if (!selected) {
        const first = brazilOnly.find(r => data.series && data.series[r.symbol] && data.series[r.symbol].length);
        selected = first ? first.symbol : null;
    }

    createTable(tableId, rows, data, symbol => {
        const points = data.series[symbol] || [];
        window.MercadoCharts.renderLineChart(chartId, points, symbol);
    }, { limit: null, sortable: true, grouped: true, tableKey: 'br', toolbar: true, favorites: true });

    if (selected) {
        const points = data.series[selected] || [];
        window.MercadoCharts.renderLineChart(chartId, points, selected);
    }
}

function renderFavorites(data) {
    const tableId = 'favoritesTable';
    const chartId = 'favoritesChart';
    const container = document.getElementById(tableId);
    if (!container) return;

    const fav = loadFavorites();
    const allRows = (data.assets || []).map(a => {
        const last = getLastPoint(data, a.symbol);
        return {
            symbol: a.symbol,
            name: a.name,
            exchange: a.exchange || '',
            category: a.category,
            tags: a.tags || [],
            last,
        };
    });

    const selectedRows = allRows.filter(r => fav.has(r.symbol));
    if (!selectedRows.length) {
        container.innerHTML = '<p style="opacity:.8">Nenhum favorito ainda. Use a estrela nas tabelas para adicionar.</p>';
        const c = document.getElementById(chartId);
        if (c && c.getContext) {
            window.MercadoCharts.renderLineChart(chartId, [], '—');
        }
        return;
    }

    const byCat = new Map();
    for (const r of selectedRows) {
        const key = String(r.category || 'other');
        if (!byCat.has(key)) byCat.set(key, []);
        byCat.get(key).push(r);
    }

    const catOrder = ['commodities', 'energy', 'agriculture', 'metals', 'fx_g10', 'fx_emerging', 'emerging', 'rates', 'volatility', 'crypto', 'other'];
    const labelFor = c => {
        if (c === 'fx_g10' || c === 'fx_emerging') return 'FX';
        if (c === 'energy' || c === 'agriculture' || c === 'commodities') return 'Commodities';
        if (c === 'metals') return 'Metais';
        if (c === 'emerging') return 'Emergentes';
        if (c === 'rates') return 'Juros';
        if (c === 'volatility') return 'Volatilidade';
        if (c === 'crypto') return 'Crypto';
        return 'Outros';
    };

    const rows = [];
    for (const c of catOrder) {
        const list = (byCat.get(c) || []).slice().sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')));
        if (!list.length) continue;
        rows.push({ separator: true, label: labelFor(c) });
        rows.push(...list);
    }

    const first = selectedRows.find(r => data.series && data.series[r.symbol] && data.series[r.symbol].length) || selectedRows[0];
    const selectedSymbol = first ? first.symbol : null;

    createTable(
        tableId,
        rows,
        data,
        symbol => {
        const points = data.series[symbol] || [];
        window.MercadoCharts.renderLineChart(chartId, points, symbol);
        },
        { limit: null, sortable: true, grouped: true, tableKey: 'fav', toolbar: true, favorites: true, modes: [], export: true }
    );

    if (selectedSymbol) {
        const points = data.series[selectedSymbol] || [];
        window.MercadoCharts.renderLineChart(chartId, points, selectedSymbol);
    }
}

function renderCategory(data, containerId, chartId, categories, defaultSymbol) {
    const rows = buildRows(data, categories);
    let selected = defaultSymbol && data.series[defaultSymbol] ? defaultSymbol : (rows.length ? rows[0].symbol : null);

    createTable(containerId, rows, data, symbol => {
        selected = symbol;
        const points = data.series[selected] || [];
        window.MercadoCharts.renderLineChart(chartId, points, selected);
    }, { limit: 60, sortable: true, tableKey: containerId, toolbar: false, favorites: true });

    if (selected) {
        const points = data.series[selected] || [];
        window.MercadoCharts.renderLineChart(chartId, points, selected);
    }
}

function renderMercosul(data) {
    const tableId = 'mercosulTable';
    const chartId = 'mercosulChart';
    const metricsId = 'mercosulMetrics';
    const pulseId = 'mercosulPulse';

    const metricsEl = document.getElementById(metricsId);
    const pulseEl = document.getElementById(pulseId);
    const tableEl = document.getElementById(tableId);
    if (!metricsEl || !pulseEl || !tableEl) return;

    const assets = data && Array.isArray(data.assets) ? data.assets : [];
    const assetBySymbol = new Map(assets.map(a => [String(a && a.symbol ? a.symbol : ''), a]));

    const pick = (label, matcher, { invertForScore = false } = {}) => {
        const symbol = findAssetSymbol(data, matcher);
        const last = symbol ? getLastPoint(data, symbol) : null;
        const pct = last && typeof last.changePct === 'number' ? last.changePct : null;
        const score = pct === null || pct === undefined || !Number.isFinite(pct) ? null : (invertForScore ? -pct : pct);
        const a = symbol ? (assetBySymbol.get(symbol) || null) : null;
        return { label, symbol, last, pct, score, asset: a };
    };

    const components = [
        pick('USD/BRL (BR)', /^USD\/BRL\b/i, { invertForScore: true }),
        pick('USD/UYU (UY)', /^USD\/UYU\b/i, { invertForScore: true }),
        pick('USD/PYG (PY)', /^USD\/PYG\b/i, { invertForScore: true }),
        pick('USD/ARS (AR)', /^USD\/ARS\b/i, { invertForScore: true }),
        pick('Ibovespa', /(^\.BVSP$|\bIbovespa\b)/i),
        pick('EWZ', /^EWZ\b/i),
    ];

    const fxStrength = avg(components.slice(0, 4).map(x => x.score));
    const eqStrength = avg(components.slice(4).map(x => x.score));
    const hasFx = typeof fxStrength === 'number' && Number.isFinite(fxStrength);
    const hasEq = typeof eqStrength === 'number' && Number.isFinite(eqStrength);
    const score = hasFx && hasEq ? (0.7 * fxStrength + 0.3 * eqStrength) : hasFx ? fxStrength : hasEq ? eqStrength : null;

    let state = '—';
    if (typeof score === 'number' && Number.isFinite(score)) {
        if (score > 0.25) state = 'Entrada (LatAm/BR forte)';
        else if (score < -0.25) state = 'Saída (USD/Stress LatAm)';
        else state = 'Misto / neutro';
    }

    const badge = toneBadgeHtml(score, state, { maxAbs: 1.2 });
    metricsEl.innerHTML = `
        <div class="metric-card">
            <div class="metric-icon">🌎</div>
            <div class="metric-value">${score === null ? '—' : formatPercent(score, 2)}</div>
            <div class="metric-label">Mercosul Pulse</div>
            <div class="metric-change neutral">${badge}</div>
        </div>
        <div class="metric-card">
            <div class="metric-icon">💱</div>
            <div class="metric-value">${fxStrength === null ? '—' : formatPercent(fxStrength, 2)}</div>
            <div class="metric-label">Cesta FX (força local)</div>
            <div class="metric-change neutral">USD/BRL, UYU, PYG, ARS</div>
        </div>
        <div class="metric-card">
            <div class="metric-icon">📊</div>
            <div class="metric-value">${eqStrength === null ? '—' : formatPercent(eqStrength, 2)}</div>
            <div class="metric-label">Proxies (Bolsa)</div>
            <div class="metric-change neutral">Ibovespa + EWZ</div>
        </div>
    `;

    const lines = components
        .filter(x => x && x.symbol)
        .map(x => {
            const pctTxt = x && typeof x.pct === 'number' && Number.isFinite(x.pct) ? formatPercent(x.pct, 2) : '—';
            const tone = toneBadgeHtml(x.pct, pctTxt, { maxAbs: 2.5, inverse: false });
            return `<div style="display:flex;justify-content:space-between;gap:12px;">
                <div style="opacity:.92;font-weight:900;">${escapeHtml(x.label)}</div>
                <div>${tone}</div>
            </div>`;
        })
        .join('');

    pulseEl.innerHTML = lines ? `<div style="display:flex;flex-direction:column;gap:8px;">${lines}</div>` : '<div style="opacity:.85;">Sem dados suficientes para montar o bloco.</div>';

    const rows = components
        .filter(x => x && x.symbol)
        .map(x => {
            const a = x.asset || {};
            return {
                symbol: x.symbol,
                name: x.label,
                exchange: a && a.exchange ? a.exchange : '',
                category: a && a.category ? a.category : 'other',
                tags: a && Array.isArray(a.tags) ? a.tags : [],
                last: x.last,
            };
        })
        .filter(r => r.last && typeof r.last.price === 'number');

    let selected = rows.length ? rows[0].symbol : null;
    createTable(tableId, rows, data, symbol => {
        selected = symbol;
        const points = data.series[selected] || [];
        window.MercadoCharts.renderLineChart(chartId, points, selected);
    }, { limit: 20, sortable: false, tableKey: tableId, toolbar: false, favorites: true });

    if (selected) {
        const points = data.series[selected] || [];
        window.MercadoCharts.renderLineChart(chartId, points, selected);
    }
}

function renderPetrobrasModule(data) {
    const payload = window.PETROBRAS_MODULE_DATA;
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
    const biasBadge = toneBadgeHtmlFromTone(biasTone, Math.abs(score), `${bias} • ${formatNumber(score, 2)}`, { maxAbs: 10 });
    const confBadge = toneBadgeHtmlFromTone(confidence >= 0.75 ? 'positive' : confidence >= 0.45 ? 'neutral' : 'negative', Math.abs(confidence * 10), `Confiança ${formatNumber(confidence * 100, 0)}%`, { maxAbs: 10 });
    const fmt2 = v => (typeof v === 'number' && Number.isFinite(v) ? formatNumber(v, 2) : '—');
    const fmt1 = v => (typeof v === 'number' && Number.isFinite(v) ? formatNumber(v, 1) : '—');
    const breadthLine = metrics && metrics.breadth
        ? `Largura: ${String(metrics.breadth.pos || 0)}↑ • ${String(metrics.breadth.neg || 0)}↓ • ${String(metrics.breadth.zero || 0)}≈`
        : '';
    const contribLine = metrics && metrics.contribution
        ? `Contrib: +${fmt2(metrics.contribution.posSum)} / ${fmt2(metrics.contribution.negSum)} • net ${fmt2(metrics.contribution.net)}`
        : '';
    const pnlLine = metrics && metrics.pnlLike
        ? `PnL (sintético): +${fmt1(metrics.pnlLike.posSum)} / ${fmt1(metrics.pnlLike.negSum)} • net ${fmt1(metrics.pnlLike.net)}`
        : '';

    gaugeEl.innerHTML = `
        <div style="border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:12px;background:rgba(0,0,0,.18);">
            <div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap;">
                <div style="font-weight:900;letter-spacing:1px;opacity:.95;">Velocímetro Petrobras</div>
                <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
                    ${biasBadge}
                    ${confBadge}
                </div>
            </div>
            <div style="margin-top:8px;opacity:.85;">${escapeHtml(phaseLabel)}</div>
            ${breadthLine || contribLine || pnlLine ? `<div style="margin-top:8px;opacity:.86;font-size:12px;line-height:1.35;">
                ${escapeHtml([breadthLine, contribLine, pnlLine].filter(Boolean).join(' • '))}
            </div>` : ''}
            <div style="margin-top:8px;opacity:.82;font-size:12px;line-height:1.35;">
                ${escapeHtml(`Escala: -10 a +10 • Zona neutra: -${formatNumber(neutralCutAbs, 1)} a +${formatNumber(neutralCutAbs, 1)} • Posição: ${formatNumber(pctPos * 100, 0)}%`)}
            </div>
            <div style="margin-top:14px;position:relative;padding:18px 4px 8px 4px;">
                <div style="height:14px;border-radius:999px;background:linear-gradient(90deg, rgba(255,60,80,.85), rgba(255,255,255,.18) 50%, rgba(0,255,160,.85));border:1px solid rgba(255,255,255,.10);position:relative;">
                    <div style="position:absolute;left:${escapeHtml(cutNegPct)};top:-1px;transform:translateX(-50%);width:2px;height:16px;background:rgba(255,255,255,.45);"></div>
                    <div style="position:absolute;left:${escapeHtml(cutPosPct)};top:-1px;transform:translateX(-50%);width:2px;height:16px;background:rgba(255,255,255,.45);"></div>
                    <div style="position:absolute;left:${escapeHtml(leftPct)};top:-2px;transform:translateX(-50%);width:2px;height:18px;background:rgba(0,243,255,.90);box-shadow:0 0 10px rgba(0,243,255,.20);border-radius:2px;"></div>
                </div>
                <div style="position:absolute;left:${escapeHtml(leftPct)};top:30px;transform:translateX(-50%);width:0;height:0;border-left:8px solid transparent;border-right:8px solid transparent;border-top:10px solid rgba(0,243,255,.95);filter:drop-shadow(0 0 6px rgba(0,243,255,.25));"></div>
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
                const label = x && x.label ? String(x.label) : 'Ativo'
                const patterns = x && Array.isArray(x.patterns) ? x.patterns.map(p => String(p)).filter(Boolean).slice(0, 8) : []
                return `<div style="padding:10px 12px;border:1px solid rgba(255,255,255,.10);border-radius:12px;background:rgba(0,0,0,.14);">
                    <div style="font-weight:900;letter-spacing:.8px;opacity:.92;">${escapeHtml(label)}</div>
                    <div style="margin-top:6px;opacity:.85;font-family:'Share Tech Mono',monospace;word-break:break-word;">${escapeHtml(patterns.join(', '))}</div>
                </div>`
            })
            .join('')
        missingEl.innerHTML = `
            <div style="border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:12px;background:rgba(0,0,0,.18);">
                <div style="font-weight:900;letter-spacing:1px;opacity:.95;margin-bottom:10px;">Ativos correlacionados faltando (para adicionar no Investing)</div>
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;">${items}</div>
            </div>
        `
    }

    const topNews = payload.news && Array.isArray(payload.news.top) ? payload.news.top : [];
    if (!topNews.length) {
        newsEl.innerHTML = '<div style="opacity:.85;">Sem destaques de notícias para Petrobras agora.</div>';
    } else {
        const li = topNews
            .map(n => {
                const title = n && n.title ? String(n.title) : ''
                const url = n && n.url ? String(n.url) : ''
                const safeUrl = url && /^https?:\/\//i.test(url) ? url : ''
                const a = safeUrl ? `<a href="${escapeHtml(safeUrl)}" target="_blank" rel="noreferrer" style="color:rgba(0,243,255,.92);text-decoration:none;">${escapeHtml(title || safeUrl)}</a>` : escapeHtml(title || '—')
                return `<li style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,.06);">${a}</li>`
            })
            .join('')
        newsEl.innerHTML = `
            <div style="border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:12px;background:rgba(0,0,0,.18);">
                <div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap;">
                    <div style="font-weight:900;letter-spacing:1px;opacity:.95;">Notícias (pré-mercado / drivers)</div>
                    <div style="opacity:.85;font-family:'Share Tech Mono',monospace;">match: ${escapeHtml(String(payload.news.matched || 0))}</div>
                </div>
                <ul style="margin:10px 0 0 0;padding:0 0 0 18px;">${li}</ul>
            </div>
        `
    }

    const rows = Array.isArray(payload.rows) ? payload.rows : [];
    const phaseKey = payload.phase && String(payload.phase.nowLabel || '').toLowerCase().includes('pré') ? 'pre' : 'regular'
    const used = rows.filter(r => r && (r.phase === 'any' || r.phase === phaseKey))
    const operableKeySet = { petr4: true, petr3: true }
    const operables = used.filter(r => r && operableKeySet[String(r.key || '')])
    const drivers = used.filter(r => r && !operableKeySet[String(r.key || '')])

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
    `

    const body = drivers
        .map(r => {
            const sym = r && r.symbol ? String(r.symbol) : ''
            const clickable = sym && data && data.series && Array.isArray(data.series[sym]) && data.series[sym].length
            const v =
                r && r.unit === '%'
                    ? formatPercent(typeof r.value === 'number' ? r.value : null, 2)
                    : formatNumber(typeof r.value === 'number' ? r.value : null, 2)
            const contrib = formatNumber(typeof r.contribution === 'number' ? r.contribution : null, 3)
            const weight = formatNumber(typeof r.weight === 'number' ? r.weight : null, 2)
            const cap = formatNumber(typeof r.capAbs === 'number' ? r.capAbs : null, 2)
            const asOf = r && r.asOf ? formatDateTime(r.asOf) : ''
            const tone = typeof r.contribution === 'number' ? toneFromValue(r.contribution, { maxAbs: Math.max(0.01, Math.abs(r.weight || 1)) }) : { tone: 'tone--neu', a: 0.2 }
            const rowStyle = clickable ? 'cursor:pointer;' : ''
            return `
                <tr data-petro-row="1" data-symbol="${escapeHtml(sym)}" style="${rowStyle}">
                    <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.06);font-weight:900;letter-spacing:.4px;">${escapeHtml(String(r.label || ''))}</td>
                    <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.06);font-family:'Share Tech Mono',monospace;opacity:.9;">${escapeHtml(sym || '—')}</td>
                    <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.06);text-align:right;font-family:'Share Tech Mono',monospace;font-weight:900;">${escapeHtml(v)}</td>
                    <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.06);text-align:right;font-family:'Share Tech Mono',monospace;opacity:.9;">${escapeHtml(weight)}</td>
                    <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.06);text-align:right;font-family:'Share Tech Mono',monospace;opacity:.9;">${escapeHtml(cap)}</td>
                    <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.06);text-align:right;font-family:'Share Tech Mono',monospace;font-weight:900;">
                        <span class="tone ${escapeHtml(tone.tone)}" style="--tone-a:${String(tone.a)};">${escapeHtml(contrib)}</span>
                    </td>
                    <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.06);text-align:right;font-family:'Share Tech Mono',monospace;opacity:.85;">${escapeHtml(asOf || '')}</td>
                    <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.06);opacity:.85;">${escapeHtml(String(r.note || ''))}</td>
                </tr>
            `
        })
        .join('')

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
            `
            const opBody = operables
                .map(r => {
                    const sym = r && r.symbol ? String(r.symbol) : ''
                    const clickable = sym && data && data.series && Array.isArray(data.series[sym]) && data.series[sym].length
                    const v = formatPercent(typeof r.value === 'number' ? r.value : null, 2)
                    const asOf = r && r.asOf ? formatDateTime(r.asOf) : ''
                    const rowStyle = clickable ? 'cursor:pointer;' : ''
                    return `
                        <tr data-petro-row="1" data-symbol="${escapeHtml(sym)}" style="${rowStyle}">
                            <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.06);font-weight:900;letter-spacing:.4px;">${escapeHtml(String(r.label || ''))}</td>
                            <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.06);font-family:'Share Tech Mono',monospace;opacity:.9;">${escapeHtml(sym || '—')}</td>
                            <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.06);text-align:right;font-family:'Share Tech Mono',monospace;font-weight:900;">${escapeHtml(v)}</td>
                            <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.06);text-align:right;font-family:'Share Tech Mono',monospace;opacity:.85;">${escapeHtml(asOf || '')}</td>
                            <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.06);opacity:.85;">${escapeHtml(String(r.note || ''))}</td>
                        </tr>
                    `
                })
                .join('')
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
            `
        })()
        : ''

    tableEl.innerHTML = `
        ${operablesHtml}
        <div style="border:1px solid rgba(255,255,255,.12);border-radius:14px;background:rgba(0,0,0,.18);overflow:hidden;">
            <div style="padding:12px 12px 0 12px;display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap;">
                <div style="font-weight:900;letter-spacing:1px;opacity:.95;">Tabela (drivers usados no score)</div>
                <div style="opacity:.85;font-family:'Share Tech Mono',monospace;">gerado: ${escapeHtml(formatDateTime(payload.generatedAt || ''))}</div>
            </div>
            <div style="overflow:auto;">
                <table style="width:100%;border-collapse:collapse;min-width:1100px;">
                    <thead>${header}</thead>
                    <tbody>${body || '<tr><td colspan="8" style="padding:12px;opacity:.85;">Sem linhas para esta fase.</td></tr>'}</tbody>
                </table>
            </div>
        </div>
    `

    tableEl.querySelectorAll('tr[data-petro-row="1"]').forEach(tr => {
        tr.addEventListener('click', () => {
            const symbol = tr.getAttribute('data-symbol') || ''
            if (!symbol || !data || !data.series || !Array.isArray(data.series[symbol]) || !data.series[symbol].length) return
            const points = data.series[symbol] || []
            window.MercadoCharts.renderLineChart('brazilChart', points, symbol)
            const sec = document.getElementById('brazil-market')
            if (sec && sec.scrollIntoView) sec.scrollIntoView({ behavior: 'smooth', block: 'start' })
        })
    })
}

function renderMarketPanorama(data) {
    const el = document.getElementById('marketPanorama');
    if (!el) return;

    const safeParse = raw => {
        try {
            return raw ? JSON.parse(raw) : null;
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
                const pct = last && typeof last.changePct === 'number' ? last.changePct : null;
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
                const pct = last && typeof last.changePct === 'number' ? last.changePct : null;
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
                const pct = last && typeof last.changePct === 'number' ? last.changePct : null;
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
                    const pct = last && typeof last.changePct === 'number' ? last.changePct : null;
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
                                            <span style="opacity:.9;">${escapeHtml(r.icon || '•')}</span>
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
    const missingInPanorama = Array.from(monitoredUnique).filter(s => !panoramaSet.has(s));
    const inPanoramaCount = Array.from(monitoredUnique).filter(s => panoramaSet.has(s)).length;
    const extrasInPanorama = Array.from(panoramaSet).filter(s => !monitoredUnique.has(s)).length;

    const coverageHtml = `
        <div style="border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:12px;background:rgba(0,0,0,.18);margin-bottom:12px;">
            <div style="display:flex;align-items:baseline;justify-content:space-between;gap:12px;flex-wrap:wrap;">
                <div style="font-weight:900;letter-spacing:1px;opacity:.95;">Cobertura do Panorama</div>
                <div style="opacity:.80;font-size:12px;">Ativos: ${escapeHtml(String(monitoredUnique.size))} • No panorama: ${escapeHtml(String(inPanoramaCount))}${extrasInPanorama ? ` • Extras: ${escapeHtml(String(extrasInPanorama))}` : ''}${duplicates ? ` • Duplicados: ${escapeHtml(String(duplicates))}` : ''}</div>
            </div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;">
                <span class="neutral" style="display:inline-flex;align-items:center;gap:8px;border:1px solid rgba(255,255,255,.14);border-radius:999px;padding:4px 10px;background:rgba(0,0,0,.18);font-family:'Share Tech Mono',monospace;font-weight:900;">Sem categoria: ${escapeHtml(String(uncategorized.length))}</span>
                <span class="${missingInPanorama.length ? 'negative' : 'positive'}" style="display:inline-flex;align-items:center;gap:8px;border:1px solid rgba(255,255,255,.14);border-radius:999px;padding:4px 10px;background:rgba(0,0,0,.18);font-family:'Share Tech Mono',monospace;font-weight:900;">Fora do panorama: ${escapeHtml(String(missingInPanorama.length))}</span>
            </div>
            ${missingInPanorama.length
        ? `<div style="margin-top:10px;opacity:.88;line-height:1.35;">Faltando: ${escapeHtml(missingInPanorama.slice(0, 14).join(' • '))}${missingInPanorama.length > 14 ? ' • …' : ''}</div>`
        : ''
    }
        </div>
    `;

    const cards = groups
        .map(g => {
            const snap = frozen && frozen[g.key] ? frozen[g.key] : buildSnapshot(g);
            const isFrozen = !!(frozen && frozen[g.key]);
            const rows = snap && Array.isArray(snap.rows) ? snap.rows : [];
            if (!rows.length) return null;
            return renderCard(g, snap, isFrozen);
        })
        .filter(Boolean)
        .join('');

    el.innerHTML = `${coverageHtml}${cards ? `<div class="panorama-grid">${cards}</div>` : '<div style="opacity:.85;">Sem dados suficientes para montar o panorama.</div>'}`;

    el.querySelectorAll('[data-panorama-freeze]').forEach(btn => {
        btn.addEventListener('click', () => {
            const key = btn.getAttribute('data-panorama-freeze') || '';
            if (!key) return;
            const exists = frozen && frozen[key];
            if (exists) {
                const next = { ...(frozen || {}) };
                delete next[key];
                saveFrozen(next);
            } else {
                const group = groups.find(g => g.key === key);
                if (!group) return;
                const snap = buildSnapshot(group);
                const next = { ...(frozen || {}), [key]: snap };
                saveFrozen(next);
            }
            renderMarketPanorama(data);
        });
    });

    el.querySelectorAll('[data-panorama-expand]').forEach(btn => {
        btn.addEventListener('click', () => {
            const key = btn.getAttribute('data-panorama-expand') || '';
            if (!key) return;
            const next = { ...(expandedState || {}) };
            if (next[key]) delete next[key];
            else next[key] = true;
            saveExpanded(next);
            renderMarketPanorama(data);
        });
    });
}

function renderAll(data) {
    const safe = fn => {
        try {
            fn();
        } catch {
        }
    };

    if (!data || !(data.assets || []).length) {
        setDataStatus('SEM DADOS • Rode "npm run market:update" e clique ↻ Dados', 'negative');
    } else {
        setDataStatus('', 'neutral');
    }

    const lastUpdate = data.meta && data.meta.generatedAt ? formatDateTime(data.meta.generatedAt) : '';
    const lastUpdateLabel = document.getElementById('last-update-label');
    if (lastUpdateLabel) lastUpdateLabel.textContent = lastUpdate ? ` • ${lastUpdate}` : '';

    safe(() => renderOverview(data));
    safe(() => renderOperationalBriefing());
    safe(() => renderBtcOperationalBriefing());
    safe(() => renderHk50OperationalBriefing());
    safe(() => renderFavorites(data));
    safe(() => renderFlowSentinel(data));
    safe(() => renderCarryTradeMonitor(data));
    safe(() => renderIntel(data));
    safe(() => renderAllAssetsTable(data));
    safe(() => renderBrazilMarket(data));
    safe(() => renderCategory(data, 'commoditiesTable', 'commoditiesChart', ['commodities', 'energy', 'agriculture']));
    safe(() => renderCategory(data, 'metalsTable', 'metalsChart', ['metals']));
    safe(() => renderCategory(data, 'fxTable', 'fxChart', ['fx_g10', 'fx_emerging']));
    safe(() => renderCategory(data, 'emergingTable', 'emergingChart', ['emerging']));
    safe(() => renderMercosul(data));
    safe(() => renderPetrobrasModule(data));
    safe(() => renderAlerts(data));
    safe(() => renderMarketPanorama(data));
}

function loadScriptFresh(src) {
    return new Promise((resolve, reject) => {
        const old = document.querySelector(`script[data-reload="${src}"]`);
        if (old) old.remove();
        const script = document.createElement('script');
        script.src = `${src}?t=${Date.now()}`;
        script.async = true;
        script.dataset.reload = src;
        script.onload = () => resolve(null);
        script.onerror = () => reject(new Error('Falha ao carregar dados'));
        document.head.appendChild(script);
    });
}

function formatUpdaterSummary(payload) {
    try {
        const st = payload && payload.state ? payload.state : null;
        if (!st || st.running) return null;
        const last = st.last || null;
        const summary = last && last.summary ? last.summary : null;
        if (!summary) return null;

        const parts = [];
        const csv = summary.portfolio || null;
        const di = summary.di || null;
        const cal = summary.calendar || null;

        const partFrom = (label, x, extra) => {
            if (!x || !x.status) return null;
            const s = String(x.status || '');
            if (s === 'ok') return `${label} ok${extra ? ` (${extra})` : ''}`;
            if (s === 'blocked') return `${label} bloqueado`;
            if (s === 'fail') return `${label} falhou`;
            if (s === 'skip') return `${label} skip`;
            return `${label} ${s}`;
        };

        const csvPart = partFrom('CSV', csv, null);
        if (csvPart) parts.push(csvPart);
        const diPart = partFrom('DI', di, di && typeof di.count === 'number' ? di.count : null);
        if (diPart) parts.push(diPart);
        const calPart = partFrom('CAL', cal, cal && typeof cal.count === 'number' ? cal.count : null);
        if (calPart) parts.push(calPart);

        const hasFail = parts.some(p => /falhou/i.test(p));
        const hasBlocked = parts.some(p => /bloqueado/i.test(p));
        const exitCode = typeof last.exitCode === 'number' ? last.exitCode : 0;

        const tone = hasFail || exitCode !== 0 ? 'negative' : hasBlocked ? 'neutral' : 'positive';
        const mode = summary.mode ? String(summary.mode).toUpperCase() : '';
        const prefix = tone === 'negative' ? 'ATENÇÃO' : tone === 'neutral' ? 'OK' : 'OK';
        const modeTxt = mode ? ` • ${mode}` : '';

        return {
            tone,
            text: `${prefix}${modeTxt} • ${parts.join(' / ')}`.trim(),
        };
    } catch (e) {
        return null;
    }
}

function requestAutoRefreshPage(reason) {
    try {
        sessionStorage.setItem('mercado_force_refresh_once', '1');
        sessionStorage.setItem('mercado_force_refresh_reason', String(reason || ''));
        sessionStorage.setItem('mercado_force_refresh_at', String(Date.now()));
    } catch {
    }

    try {
        const url = new URL(window.location.href);
        url.searchParams.set('r', String(Date.now()));
        window.location.replace(url.toString());
    } catch {
        window.location.reload();
    }
}

async function triggerUpdaterAndReload() {
    const baseUrl = getMarketServiceBaseUrl();
    try {
        setDataStatus('ATUALIZANDO • Coletando no Investing...', 'neutral');
        const res = await fetch(`${baseUrl}/api/market/update`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reason: 'dashboard' }),
        });
        if (res.status === 429) {
            let msg = 'AGUARDE • Atualização manual limitada';
            try {
                const payload = await res.json();
                const cd = payload && payload.manualCooldown ? payload.manualCooldown : null;
                if (cd && typeof cd.remainingSec === 'number' && cd.remainingSec > 0) {
                    const m = Math.floor(cd.remainingSec / 60);
                    const s = Math.max(0, cd.remainingSec - m * 60);
                    msg = `AGUARDE • Próxima atualização em ${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
                }
            } catch (e) {
            }
            setDataStatus(msg, 'neutral');
            return false;
        }
        if (!res.ok && res.status !== 409) throw new Error('Falha ao iniciar atualizador');

        const startedAt = Date.now();
        let lastPayload = null;
        while (Date.now() - startedAt < 180000) {
            const statusRes = await fetch(`${baseUrl}/api/market/status`, { method: 'GET' });
            if (statusRes.ok) {
                const payload = await statusRes.json();
                lastPayload = payload;
                const st = payload && payload.state ? payload.state : null;
                if (st && st.running === false) break;
            }
            await new Promise(r => setTimeout(r, 1500));
        }

        await loadScriptFresh('assets/data/market_quotes.js');
        await loadScriptFresh('assets/data/economic_calendar.js');
        agendaAutoCache = null;
        const updated = getData();
        if (updated) renderAll(updated);
        void loadOptionsGammaSummary();
        void loadFinancialJuice();
        void loadWebNewsModule();
        const sum = formatUpdaterSummary(lastPayload);
        if (sum && sum.text) {
            setDataStatus(sum.text, sum.tone || 'neutral');
            setTimeout(() => setDataStatus('', 'neutral'), 3500);
        } else {
            setDataStatus('OK • Dados atualizados', 'positive');
            setTimeout(() => setDataStatus('', 'neutral'), 2500);
        }
        setTimeout(() => requestAutoRefreshPage('manual_update_done'), 650);
        return true;
    } catch (e) {
        setDataStatus('ATUALIZADOR OFFLINE • Rode "Atualizar_Dados_Mercado.bat" e tente novamente', 'negative');
        return false;
    }
}

function setupNav() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const target = document.getElementById(targetId);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
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
                { href: '#overview', label: 'Visão Geral' },
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
                { href: '#regimeConviction', label: 'Regime & Convicção' },
                { href: '#chinaBrazil', label: 'China + Brasil' },
                { href: '#fx-carry', label: 'FX / Carry' },
                { href: '#carryIntel', label: 'Carry Trade' },
                { href: '#ratesBuckets', label: 'Curva (Buckets)' },
                { href: '#brazilFixedIncomeFlow', label: 'Renda Fixa 🇧🇷' },
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
                { href: '#fs-history', label: 'Histórico' },
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
    const prodBase = 'https://szeskoskiinvestimentos-art.github.io/edi-openinterest-stranger/dashboard_unificado/';
    function isProdHost() {
        const host = location.hostname || '';
        return host.indexOf('github.io') !== -1 || host.indexOf('sites.google.com') !== -1;
    }
    function targetFor(val) {
        if (val === 'MERCADO') return location.href;
        if (isProdHost()) return prodBase + (val === 'WDO' ? 'WDO/' : 'WIN/');
        return '../../../B3_System/dashboard_unificado/' + (val === 'WDO' ? 'WDO/index.html' : 'WIN/index.html');
    }
    sel.addEventListener('change', function (e) {
        const url = targetFor(e.target.value);
        try {
            window.top.location.href = url;
        } catch (err) {
            location.href = url;
        }
    });
}

function setupQuickNavDrawer() {
    const btn = document.getElementById('quickNavBtn');
    const overlay = document.getElementById('quickNavOverlay');
    const drawer = document.getElementById('quickNav');
    const closeBtn = document.getElementById('quickNavClose');
    const list = document.getElementById('quickNavList');
    const search = document.getElementById('quickNavSearch');
    const quickSearchBtn = document.getElementById('quickSearchBtn');
    const sourceItems = filterNavigationItemsByExistingTargets(getNavigationItemsFlat());

    if (!btn || !overlay || !drawer || !closeBtn || !list || !search || !sourceItems.length) return;

    const normalize = s => String(s || '').toLowerCase().trim();

    function render(q) {
        const query = normalize(q);
        const items = sourceItems.filter(x => (!query ? true : normalize(x.label).includes(query)));

        list.innerHTML = items
            .map(x => {
                const hash = x.href;
                const id = hash.slice(1);
                return `<a class="quicknav__item" href="${hash}" data-target="${id}"><span>${x.label}</span><span class="quicknav__pill">#${id}</span></a>`;
            })
            .join('');
    }

    function isOpen() {
        return drawer.classList.contains('is-open');
    }

    function setOpen(open) {
        if (open) {
            overlay.classList.add('is-open');
            drawer.classList.add('is-open');
            drawer.setAttribute('aria-hidden', 'false');
            btn.setAttribute('aria-expanded', 'true');
            overlay.setAttribute('aria-hidden', 'false');
            setTimeout(() => search.focus(), 0);
        } else {
            overlay.classList.remove('is-open');
            drawer.classList.remove('is-open');
            drawer.setAttribute('aria-hidden', 'true');
            btn.setAttribute('aria-expanded', 'false');
            overlay.setAttribute('aria-hidden', 'true');
            btn.focus();
        }
    }

    btn.addEventListener('click', () => setOpen(!isOpen()));
    closeBtn.addEventListener('click', () => setOpen(false));
    overlay.addEventListener('click', () => setOpen(false));

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && isOpen()) setOpen(false);
    });

    search.addEventListener('input', e => render(e.target.value));

    list.addEventListener('click', e => {
        const a = e.target && e.target.closest ? e.target.closest('a.quicknav__item') : null;
        if (!a) return;
        setOpen(false);
    });

    const targets = sourceItems
        .map(x => x.href)
        .filter(h => h.startsWith('#'))
        .map(h => document.getElementById(h.slice(1)))
        .filter(Boolean);

    function setActive(id) {
        const links = Array.from(list.querySelectorAll('a.quicknav__item'));
        for (const l of links) {
            const match = (l.getAttribute('data-target') || '') === id;
            if (match) l.classList.add('is-active');
            else l.classList.remove('is-active');
        }

        const top = Array.from(document.querySelectorAll('.nav a.nav-link.nav-chip[data-nav-top="1"]'));
        const tops = top.length ? top : Array.from(document.querySelectorAll('.nav a.nav-link.nav-chip'));
        for (const a of tops) {
            const href = String(a.getAttribute('href') || '');
            const match = href === `#${id}`;
            if (match) a.classList.add('active');
            else a.classList.remove('active');
        }
    }

    if (targets.length && 'IntersectionObserver' in window) {
        const io = new IntersectionObserver(
            entries => {
                const visible = entries
                    .filter(x => x.isIntersecting)
                    .sort((a, b) => (b.intersectionRatio || 0) - (a.intersectionRatio || 0))[0];
                const id = visible && visible.target ? visible.target.id : '';
                if (id) setActive(id);
            },
            { root: null, rootMargin: '-10% 0px -70% 0px', threshold: [0.1, 0.2, 0.3] },
        );
        for (const t of targets) io.observe(t);
    }

    render('');

    function openSearch() {
        setOpen(true);
        search.value = '';
        render('');
        setTimeout(() => search.focus(), 0);
    }

    if (quickSearchBtn) quickSearchBtn.addEventListener('click', openSearch);
    document.addEventListener('keydown', e => {
        const k = String(e.key || '').toLowerCase();
        if ((e.ctrlKey || e.metaKey) && k === 'k') {
            e.preventDefault();
            openSearch();
        }
    });
}

function setupNavMorePanel() {
    const btn = document.getElementById('navMoreBtn');
    const panel = document.getElementById('navMorePanel');
    if (!btn || !panel) return;

    function isOpen() {
        return panel.classList.contains('is-open');
    }

    function setOpen(open) {
        if (open) {
            panel.classList.add('is-open');
            btn.setAttribute('aria-expanded', 'true');
        } else {
            panel.classList.remove('is-open');
            btn.setAttribute('aria-expanded', 'false');
        }
    }

    btn.addEventListener('click', () => setOpen(!isOpen()));
    panel.addEventListener('click', e => {
        const a = e.target && e.target.closest ? e.target.closest('a.nav-link') : null;
        if (!a) return;
        setOpen(false);
    });
    document.addEventListener('click', e => {
        const t = e.target;
        if (t === btn) return;
        if (panel.contains(t)) return;
        setOpen(false);
    });
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') setOpen(false);
    });
}

function setupInvestingCalendarWidgetLazyLoad() {
    const details = document.getElementById('investingCalendarWidget');
    if (!details) return;
    const iframe = details.querySelector && details.querySelector('iframe[data-src]');
    if (!iframe) return;
    let loaded = false;
    function tryLoad() {
        if (loaded) return;
        if (!details.open) return;
        const url = iframe.getAttribute('data-src');
        if (!url) return;
        iframe.setAttribute('src', url);
        loaded = true;
    }
    details.addEventListener('toggle', tryLoad);
    tryLoad();
}

function getAlertsState() {
    const enabled = localStorage.getItem('mercado_alerts_enabled') === '1';
    const threshold = Number(localStorage.getItem('mercado_alerts_threshold_pct') || '1');
    return { enabled, threshold: Number.isFinite(threshold) ? threshold : 1 };
}

function setAlertsState(state) {
    localStorage.setItem('mercado_alerts_enabled', state.enabled ? '1' : '0');
    localStorage.setItem('mercado_alerts_threshold_pct', String(state.threshold));
}

function renderAlerts(data) {
    const enabledInput = document.getElementById('alertsEnabled');
    const thresholdInput = document.getElementById('alertsThresholdPct');
    const requestBtn = document.getElementById('alertsRequestPermission');

    const state = getAlertsState();
    if (enabledInput) enabledInput.checked = state.enabled;
    if (thresholdInput) thresholdInput.value = String(state.threshold);

    if (enabledInput) {
        enabledInput.onchange = () => {
            setAlertsState({ ...getAlertsState(), enabled: enabledInput.checked });
            evaluateAlerts(data);
        };
    }
    if (thresholdInput) {
        thresholdInput.onchange = () => {
            const val = Number(thresholdInput.value);
            setAlertsState({ ...getAlertsState(), threshold: Number.isFinite(val) ? val : 1 });
            evaluateAlerts(data);
        };
    }
    if (requestBtn) {
        requestBtn.onclick = async () => {
            if (!('Notification' in window)) return;
            await Notification.requestPermission();
        };
    }

    evaluateAlerts(data);
}

function evaluateAlerts(data) {
    const list = document.getElementById('alertsList');
    if (!list) return;
    const state = getAlertsState();

    if (!state.enabled) {
        list.innerHTML = '<p style="opacity:.8">Alertas desativados.</p>';
        return;
    }

    const threshold = Math.abs(state.threshold);
    const hits = (data.assets || [])
        .map(a => ({ a, last: getLastPoint(data, a.symbol) }))
        .filter(x => x.last && typeof x.last.changePct === 'number')
        .filter(x => Math.abs(x.last.changePct) >= threshold)
        .sort((x, y) => Math.abs(y.last.changePct) - Math.abs(x.last.changePct))
        .slice(0, 12);

    if (!hits.length) {
        list.innerHTML = '<p style="opacity:.8">Nenhum alerta no momento.</p>';
        return;
    }

    const html = hits
        .map(x => {
            const pct = x.last.changePct || 0;
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
        const pct = top.last.changePct || 0;
        new Notification('Alerta de Fluxo (MVP)', {
            body: `${top.a.symbol} ${formatPercent(pct)} • ${top.a.category}`,
        });
        localStorage.setItem(lastNotifiedKey, key);
    } else {
        localStorage.setItem(lastNotifiedKey, key);
    }
}

let adaptSplitLayoutsTimer = null;

function adaptSplitLayouts() {
    const wide = window.innerWidth > 900;
    const layouts = Array.from(document.querySelectorAll('.split-layout'));
    for (const l of layouts) {
        try {
            const kids = Array.from(l.children);
            if (kids.length < 2) continue;

            const left = kids.find(x => x && x.classList && x.classList.contains('context-box')) || kids[0];
            const right = kids.find(x => x && x !== left) || kids[1];

            if (!left || !right) continue;

            const leftH = left.getBoundingClientRect().height || 0;
            const rightH = right.getBoundingClientRect().height || 0;

            const isChart = right.classList.contains('chart-container') || !!right.querySelector('canvas');
            const isCalendar = right.classList.contains('calendar-widget') || !!right.querySelector('iframe');
            const canStack = isChart || isCalendar;

            const shouldStack =
                wide &&
                canStack &&
                leftH >= 520 &&
                rightH <= 520 &&
                leftH - rightH >= 240;

            if (shouldStack) l.classList.add('split-layout--stack');
            else l.classList.remove('split-layout--stack');
        } catch {
        }
    }
}

function scheduleAdaptSplitLayouts() {
    if (adaptSplitLayoutsTimer) clearTimeout(adaptSplitLayoutsTimer);
    adaptSplitLayoutsTimer = setTimeout(() => {
        adaptSplitLayoutsTimer = null;
        adaptSplitLayouts();
    }, 120);
}

window.addEventListener('resize', scheduleAdaptSplitLayouts);

async function boot() {
    renderNavigationFromDefinition();
    setupNav();
    setupAssetSwitchNav();
    setupQuickNavDrawer();
    setupNavMorePanel();
    setupInvestingCalendarWidgetLazyLoad();
    try { renderOperationalBriefing(); } catch { }
    try { renderBtcOperationalBriefing(); } catch { }
    try { renderHk50OperationalBriefing(); } catch { }

    let data = getData();
    if (!data) {
        try {
            await loadScriptFresh('assets/data/market_quotes.js');
            await loadScriptFresh('assets/data/economic_calendar.js');
            agendaAutoCache = null;
            data = getData();
        } catch {
        }
    }
    if (data) renderAll(data);
    else setDataStatus('DADOS NÃO CARREGADOS • Verifique assets/data/market_quotes.js', 'negative');
    adaptSplitLayouts();
    void loadOptionsGammaSummary();
    void loadFinancialJuice();
    void loadWebNewsModule();

    const reloadBtn = document.getElementById('reloadDataBtn');
    if (reloadBtn) {
        reloadBtn.onclick = async () => {
            try {
                const ok = await triggerUpdaterAndReload();
                if (!ok) {
                    await loadScriptFresh('assets/data/market_quotes.js');
                    await loadScriptFresh('assets/data/economic_calendar.js');
                    agendaAutoCache = null;
                    const updated = getData();
                    if (updated) renderAll(updated);
                }
                void loadOptionsGammaSummary();
                void loadFinancialJuice();
                void loadWebNewsModule();
            } catch (e) {
            }
        };
    }

    document.addEventListener('mercado:favoritesChanged', () => {
        try {
            const updated = getData();
            if (updated) renderFavorites(updated);
        } catch (e) {
        }
    });

    const interval = 15;
    const pollMs = interval * 60 * 1000;
    let nextAt = Date.now() + pollMs;

    const refreshQuotes = async source => {
        try {
            await loadScriptFresh('assets/data/market_quotes.js');
            await loadScriptFresh('assets/data/economic_calendar.js');
            agendaAutoCache = null;
            const updated = getData();
            if (updated) renderAll(updated);
            void loadOptionsGammaSummary();
            void loadFinancialJuice();
            void loadWebNewsModule();
            if (source) {
                setDataStatus('AUTO • Dados atualizados', 'positive');
                setTimeout(() => setDataStatus('', 'neutral'), 1500);
            }
            if (source) setTimeout(() => requestAutoRefreshPage('auto_update_done'), 650);
            return true;
        } catch (e) {
            if (location.protocol === 'file:') {
                window.location.reload();
            }
            return false;
        }
    };

    try {
        const force = sessionStorage.getItem('mercado_force_refresh_once') === '1';
        if (force) {
            sessionStorage.removeItem('mercado_force_refresh_once');
            void refreshQuotes('');
        }
    } catch {
    }

    const scheduleNext = () => {
        const delay = Math.max(0, nextAt - Date.now());
        setTimeout(async () => {
            while (nextAt <= Date.now()) nextAt += pollMs;
            await refreshQuotes('');
            scheduleNext();
        }, delay);
    };

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) return;
        if (Date.now() >= nextAt) {
            nextAt = Date.now() + pollMs;
            void refreshQuotes('visible');
        }
    });

    scheduleNext();
}

boot();
