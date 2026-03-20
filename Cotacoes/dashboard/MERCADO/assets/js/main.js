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

    if (name.includes('brent') || name.includes('wti') || name.includes('crude') || sym.includes('wti') || sym.includes('brent')) return '🛢️';
    if (name.includes('gold') || name.includes('silver') || name.includes('copper') || cat.includes('metals')) return '🪙';
    if (cat.includes('fx') || name.includes('usd/') || name.includes('/usd') || name.includes('dollar') || name.includes('eur/') || name.includes('/eur')) return '💱';
    if (cat.includes('rates') || name.includes('yield') || name.includes('bond') || sym.includes('=rr')) return '📈';
    if (cat.includes('crypto') || name.includes('bitcoin') || name.includes('ethereum') || sym.includes('btc') || sym.includes('eth')) return '₿';
    if (cat.includes('volatility') || name.includes('vix') || name.includes('volatility')) return '🌡️';
    if (cat.includes('energy') || cat.includes('agriculture') || cat.includes('commodities')) return '🌾';
    if (tags.includes('risk_on')) return '🟢';
    if (tags.includes('risk_off')) return '🔴';
    if (cat.includes('emerging')) return '🌍';
    return '🔹';
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
    const betaNegScore = avg(betaNegItems.map(x => x.val));
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

    const renderDiTable = (list, { detectedCount } = {}) => {
        if (!list.length) {
            const det = typeof detectedCount === 'number' && Number.isFinite(detectedCount) ? detectedCount : 0;
            const msg = det
                ? `DI detectado no histórico (${det} contratos), mas sem preços válidos no momento.`
                : 'Sem DI disponível no histórico.';
            return `<div style="border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:12px;background:rgba(0,0,0,.18);opacity:.9;">
                <div style="font-weight:900;letter-spacing:1px;margin-bottom:8px;">${escapeHtml('DI (B3)')}</div>
                <div style="opacity:.85;">${escapeHtml(msg)}</div>
            </div>`;
        }
        return `<div style="border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:12px;background:rgba(0,0,0,.18);">
            <div style="font-weight:900;letter-spacing:1px;opacity:.95;margin-bottom:8px;">${escapeHtml('DI (B3)')}</div>
            ${list
                .slice(0, 18)
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

    const summary = `
        <div style="margin:0 0 14px;border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:12px;background:rgba(0,0,0,.18);">
            <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;">
                <div style="font-weight:900;letter-spacing:1px;opacity:.95;">${escapeHtml(diList.length ? 'DI Buckets' : 'BR Buckets (proxy)')}</div>
                <div style="font-family:'Share Tech Mono',monospace;font-weight:900;opacity:.95;">Shape: ${escapeHtml(shape)}</div>
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
            ${renderDiTable(diList, { detectedCount: diSymbolsAll.length })}
            ${renderGlobalTable('Globais (10Y/5Y)', gl)}
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

    const items = rates
        .filter(looksLikeBrazilFixedIncome)
        .map(a => {
            const symbol = String(a && a.symbol ? a.symbol : '');
            const last = getMostRecentPointWithPrice(data, symbol);
            if (!last || !(typeof last.price === 'number' && Number.isFinite(last.price))) return null;
            const bps = typeof last.change === 'number' && Number.isFinite(last.change) ? last.change * 100 : null;
            const year = extractYear(a.name) || extractYear(symbol);
            const nowY = new Date().getFullYear();
            const yrs = typeof year === 'number' ? year - nowY : null;
            const bucket = typeof yrs === 'number' ? (yrs <= 3 ? 'Curto' : yrs <= 7 ? 'Médio' : 'Longo') : '—';
            return {
                symbol,
                name: String(a && a.name ? a.name : symbol),
                rate: last.price,
                bps,
                year,
                yrs,
                bucket,
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

    const pick = (label, matcher) => {
        const symbol = findAssetSymbol(data, matcher);
        const last = getMostRecentPointWithPrice(data, symbol);
        if (!symbol || !last || !(typeof last.price === 'number' && Number.isFinite(last.price))) return null;
        const bps = typeof last.change === 'number' && Number.isFinite(last.change) ? last.change * 100 : null;
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

    const byBucket = bucket => items.filter(x => x.bucket === bucket);
    const shortAvg = avg(byBucket('Curto').map(x => x.rate));
    const midAvg = avg(byBucket('Médio').map(x => x.rate));
    const longAvg = avg(byBucket('Longo').map(x => x.rate));
    const slope = typeof longAvg === 'number' && typeof shortAvg === 'number' ? longAvg - shortAvg : null;
    const shape = slope === null ? 'N/A' : slope > 0.15 ? 'STEEPEN' : slope < -0.15 ? 'FLATTEN' : '≈';

    const avgBps = avg(items.map(x => x.bps));
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

    const flowBr = (() => {
        const parts = [
            typeof ewz === 'number' && Number.isFinite(ewz) ? ewz : null,
            typeof usdbbrl === 'number' && Number.isFinite(usdbbrl) ? -usdbbrl : null,
            typeof cds === 'number' && Number.isFinite(cds) ? -cds : null,
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
                <div style="font-family:'Share Tech Mono',monospace;font-weight:900;opacity:.95;">Shape: ${escapeHtml(shape)}</div>
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
            </div>
            <div style="margin-top:10px;opacity:.82;font-size:12px;line-height:1.35;">
                Operacional: <b>yield ↓</b> costuma indicar <b>demanda por renda fixa</b> (entrada/compra); <b>yield ↑</b> costuma indicar <b>redução de posição</b> (saída/venda). Separe <b>nominal</b> (prefixado/curva) de <b>real</b> (IPCA+/cupom) quando houver divergência. Se a <b>Referência</b> estiver <b>fraca</b> (taxas travadas), trate o sinal como <b>baixo peso</b> (ex.: dias de leilão/cancelamento/feriado).
            </div>
        </div>
    `;

    const essentialsRow = x => {
        const bpsTxt = x.bps === null ? '—' : `${x.bps > 0 ? '+' : ''}${formatNumber(x.bps, 1)} bp`;
        const bpsTone = x.bps === null ? 'neutral' : x.bps < 0 ? 'positive' : x.bps > 0 ? 'negative' : 'neutral';
        const bpsHtml = x.bps === null ? escapeHtml(bpsTxt) : toneBadgeHtmlFromTone(bpsTone, x.bps, bpsTxt, { maxAbs: 20 });
        return `<div style="display:flex;justify-content:space-between;gap:10px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06);">
            <div style="opacity:.92;font-weight:900;letter-spacing:.6px;">${escapeHtml(x.label)}</div>
            <div style="display:flex;gap:14px;align-items:center;">
                <div style="font-family:'Share Tech Mono',monospace;font-weight:900;opacity:.95;min-width:84px;text-align:right;">${escapeHtml(fmtRate(x.rate))}</div>
                <div style="font-family:'Share Tech Mono',monospace;font-weight:900;min-width:86px;text-align:right;">${bpsHtml}</div>
            </div>
        </div>`;
    };

    const row = x => {
        const bpsTxt = x.bps === null ? '—' : `${x.bps > 0 ? '+' : ''}${formatNumber(x.bps, 1)} bp`;
        const bpsTone = x.bps === null ? 'neutral' : x.bps < 0 ? 'positive' : x.bps > 0 ? 'negative' : 'neutral';
        const bpsHtml = x.bps === null ? escapeHtml(bpsTxt) : toneBadgeHtmlFromTone(bpsTone, x.bps, bpsTxt, { maxAbs: 20 });
        return `<div style="display:flex;justify-content:space-between;gap:10px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06);">
            <div style="opacity:.92;font-weight:900;letter-spacing:.6px;">${escapeHtml(x.name || x.symbol)}</div>
            <div style="display:flex;gap:14px;align-items:center;">
                <div style="font-family:'Share Tech Mono',monospace;font-weight:900;opacity:.95;min-width:84px;text-align:right;">${escapeHtml(fmtRate(x.rate))}</div>
                <div style="font-family:'Share Tech Mono',monospace;font-weight:900;min-width:86px;text-align:right;">${bpsHtml}</div>
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
                <div style="opacity:.75;font-family:'Share Tech Mono',monospace;font-weight:900;">${escapeHtml(String(items.length))} itens</div>
            </div>
            <div style="margin-top:6px;opacity:.75;font-size:12px;">Δ em bp (aprox.) a partir da variação do yield no último ponto (1bp ≈ 0,01 p.p.).</div>
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

    const autoByCountry = byCountryKey(autoAll);
    const autoItems = []
        .concat(sortItems(autoByCountry.BR).slice(0, 14))
        .concat(sortItems(autoByCountry.EUA).slice(0, 14))
        .concat(sortItems(autoByCountry['CHINA/HK']).slice(0, 14))
        .concat(sortItems(autoByCountry.OUTRO).slice(0, 10));

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

async function fetchJsonWithTimeout(url, timeoutMs = 3500) {
    const once = async u => {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), timeoutMs);
        try {
            const res = await fetch(u, { method: 'GET', signal: ctrl.signal });
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
    if (!payload || payload.ok !== true || !payload.items) {
        setHtml(
            'optionsGammaSummary',
            `<div style="padding:12px;opacity:.9;">Indisponível • Ative o serviço local e confirme o dashboard_unificado.</div>`,
        );
        return;
    }

    const items = [payload.items.WDO, payload.items.WIN].filter(Boolean);
    if (!items.length) {
        setHtml('optionsGammaSummary', `<div style="padding:12px;opacity:.9;">Sem dados</div>`);
        return;
    }

    const fmt0 = v => (typeof v === 'number' && Number.isFinite(v) ? formatNumber(v, 0) : '—');
    const fmt2 = v => (typeof v === 'number' && Number.isFinite(v) ? formatNumber(v, 2) : '—');

    const rows = items.map(item => {
        const regime = item && item.regime ? String(item.regime) : '—';
        const tone = toneFromRegimeText(regime);
        const badge = toneBadgeHtmlFromTone(tone, 1, regime, { maxAbs: 1 });

        const key = item && item.keyLevels ? item.keyLevels : {};

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
                <td>${fmt0(key.gammaFlip)}</td>
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
        const payload = await fetchJsonWithTimeout(`${baseUrl}/api/options/summary?t=${Date.now()}`, 2500);
        renderOptionsGammaSummary(payload);
        return true;
    } catch {
        renderOptionsGammaSummary(null);
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
            <div style="max-height:56vh;overflow:auto;overscroll-behavior:contain;padding:0 12px 12px;">
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
        const payload = await fetchJsonWithTimeout(`${baseUrl}/api/news/web/module?limit=40&t=${Date.now()}`, 5500);
        renderWebNewsModule(payload);
        return true;
    } catch {
        renderWebNewsModule({ ok: false, message: 'Web News Module offline. Rode "Atualizar_Dados_Mercado.bat" para subir o serviço.' });
        return false;
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

function assetAliasMatchers(key) {
    const k = String(key || '').toUpperCase().trim();
    if (!k) return [];

    if (k === 'US2Y') return [/^US2YT=RR$/i, /^TUc1=$/i, /\bUnited States 2-Year\b/i, /\bEUA\b\s+a\s+2\s+anos\b/i, /^US2Y\b/i];
    if (k === 'US10Y') return [/^US10YT=RR$/i, /^TNc2=$/i, /\bUnited States 10-Year\b/i, /\bEUA\b\s+a\s+10\s+anos\b/i, /^US10Y\b/i];
    if (k === 'US30Y') return [/^US30YT=RR$/i, /^USc1=$/i, /\bUnited States 30-Year\b/i, /\bEUA\b\s+a\s+30\s+anos\b/i, /^US30Y\b/i];

    if (k === 'DXY') return [/^\.DXY$/i, /\bDXY\b/i, /US Dollar Index/i, /Indice Dolar/i];
    if (k === 'VIX') return [/^\.VIX$/i, /\bVIX\b/i, /Volatilidade/i];

    if (k === 'BRENT') return [/\bBrent\b/i];
    if (k === 'WTI') return [/\bWTI\b/i];
    if (k === 'OIL') return [/\bBrent\b/i, /\bWTI\b/i];

    if (k === 'IRON') return [/^TIOc1$/i, /^SM58Fc1$/i, /\bmin[eé]rio\b/i, /\biron ore\b/i];
    if (k === 'SOY') return [/^ZS$/i, /\bsoja\b/i, /\bsoy\b/i];
    if (k === 'COPPER') return [/^HG\b/i, /\bcopper\b/i, /\bcobre\b/i];
    if (k === 'BCI') return [/^BCI$/i, /\babrdn Bloomberg All Commodity Strategy\b/i];

    if (k === 'SPX') return [/^\.SPX$/i, /\bS&P 500\b/i, /^SPY$/i, /^ES\b/i, /^ES[HMUZ]\d{2}$/i];
    if (k === 'NDX') return [/^\.NDX$/i, /\bNasdaq 100\b/i, /^QQQ$/i, /^NQ\b/i, /^NQ[HMUZ]\d{2}$/i];
    if (k === 'CHINA') return [/^FXI$/i, /^\.(CSI300)\b/i, /China A50/i, /Shanghai Shenzhen CSI 300/i];

    if (k === 'FXI') return [/^FXI$/i];
    if (k === 'CSI300') return [/^\.(CSI300)\b/i];

    if (k === 'USD_BRL') return [/^USD\/BRL\b/i];

    return [];
}

function findAliasSymbol(data, key) {
    return findAssetSymbolAny(data, assetAliasMatchers(key));
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
        dxy: findAliasSymbol(data, 'DXY'),
        brent: findAliasSymbol(data, 'BRENT'),
        wti: findAliasSymbol(data, 'WTI'),
    };

    const neutralThreshold = 0.12;

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

    const betaNegItems = [
        { label: 'USD/JPY', symbol: symbols.usdjpy, sign: -1 },
        { label: 'USD/CHF', symbol: symbols.usdchf, sign: -1 },
        { label: 'USD/SEK', symbol: symbols.usdsek, sign: -1 },
        { label: 'DXY', symbol: symbols.dxy, sign: +1 },
    ].map(x => ({ ...x, raw: getChangePct(data, x.symbol) }))
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
    const symbols = {
        audusd: findAssetSymbol(data, /^AUD\/USD\b/i),
        nzdusd: findAssetSymbol(data, /^NZD\/USD\b/i),
        usdjpy: findAssetSymbol(data, /^USD\/JPY\b/i),
        usdbrl: findAliasSymbol(data, 'USD_BRL'),
        dxy: findAliasSymbol(data, 'DXY'),
        br10y: findAssetSymbol(data, /^BR10YT=RR$/i),
        us10y: findAliasSymbol(data, 'US10Y'),
        us10br10: findAssetSymbol(data, /^US10BR10=RR$/i),
        audjpy: findAssetSymbol(data, /^AUD\/JPY\b/i),
        nzdjpy: findAssetSymbol(data, /^NZD\/JPY\b/i),
    };

    const lastOf = symbol => {
        if (!symbol) return null;
        const p = getMostRecentPointWithPrice(data, symbol) || getLastPoint(data, symbol);
        if (!p) return null;
        const price = typeof p.price === 'number' && Number.isFinite(p.price) ? p.price : null;
        const changePct = typeof p.changePct === 'number' && Number.isFinite(p.changePct) ? p.changePct : null;
        const t = p.t ? String(p.t) : '';
        return { price, changePct, t };
    };

    const audusd = lastOf(symbols.audusd);
    const nzdusd = lastOf(symbols.nzdusd);
    const usdjpy = lastOf(symbols.usdjpy);
    const usdbrl = lastOf(symbols.usdbrl);
    const dxy = lastOf(symbols.dxy);
    const br10y = lastOf(symbols.br10y);
    const us10y = lastOf(symbols.us10y);
    const us10br10 = lastOf(symbols.us10br10);
    const audjpyDirect = lastOf(symbols.audjpy);
    const nzdjpyDirect = lastOf(symbols.nzdjpy);

    const pctOf = x => (x && typeof x.changePct === 'number' ? x.changePct : null);
    const priceOf = x => (x && typeof x.price === 'number' ? x.price : null);

    const audusdPct = pctOf(audusd);
    const nzdusdPct = pctOf(nzdusd);
    const usdjpyPct = pctOf(usdjpy);
    const usdbrlPct = pctOf(usdbrl);
    const dxyPct = pctOf(dxy);

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

    const rows = [
        { label: 'DXY', v: dxyPct, fmt: x => formatPercent(x, 2), maxAbs: 5 },
        { label: 'USD/BRL', v: usdbrlPct, fmt: x => formatPercent(x, 2), maxAbs: 5 },
        { label: 'AUD/USD', v: audusdPct, fmt: x => formatPercent(x, 2), maxAbs: 5 },
        { label: 'NZD/USD', v: nzdusdPct, fmt: x => formatPercent(x, 2), maxAbs: 5 },
        { label: 'USD/JPY', v: usdjpyPct, fmt: x => formatPercent(x, 2), maxAbs: 5 },
        { label: 'AUD/JPY*', v: audjpyPct, fmt: x => formatPercent(x, 2), maxAbs: 5 },
        { label: 'NZD/JPY*', v: nzdjpyPct, fmt: x => formatPercent(x, 2), maxAbs: 5 },
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
    setHtml('carry-components', listHtml);

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

    const symbols = {
        audusd: findAssetSymbol(data, /^AUD\/USD\b/i),
        nzdusd: findAssetSymbol(data, /^NZD\/USD\b/i),
        usdjpy: findAssetSymbol(data, /^USD\/JPY\b/i),
        usdbrl: findAssetSymbol(data, /^USD\/BRL\b/i),
        dxy: findAssetSymbol(data, /(^\.DXY$|\bDXY\b|US Dollar Index)/i),
        br10y: findAssetSymbol(data, /^BR10YT=RR$/i),
        us10y: findAssetSymbol(data, /^US10YT=RR$/i),
        us10br10: findAssetSymbol(data, /^US10BR10=RR$/i),
        audjpy: findAssetSymbol(data, /^AUD\/JPY\b/i),
        nzdjpy: findAssetSymbol(data, /^NZD\/JPY\b/i),
    };

    const lastOf = symbol => {
        if (!symbol) return null;
        const p = getMostRecentPointWithPrice(data, symbol) || getLastPoint(data, symbol);
        if (!p) return null;
        const changePct = typeof p.changePct === 'number' && Number.isFinite(p.changePct) ? p.changePct : null;
        return { changePct };
    };

    const audusd = lastOf(symbols.audusd);
    const nzdusd = lastOf(symbols.nzdusd);
    const usdjpy = lastOf(symbols.usdjpy);
    const usdbrl = lastOf(symbols.usdbrl);
    const dxy = lastOf(symbols.dxy);
    const br10y = lastOf(symbols.br10y);
    const us10y = lastOf(symbols.us10y);
    const us10br10 = lastOf(symbols.us10br10);
    const audjpyDirect = lastOf(symbols.audjpy);
    const nzdjpyDirect = lastOf(symbols.nzdjpy);

    const pctOf = x => (x && typeof x.changePct === 'number' ? x.changePct : null);

    const audusdPct = pctOf(audusd);
    const nzdusdPct = pctOf(nzdusd);
    const usdjpyPct = pctOf(usdjpy);
    const usdbrlPct = pctOf(usdbrl);
    const dxyPct = pctOf(dxy);

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
        { short: 'FTSE', fmt: 'price', matchers: [/\bFTSE 100\b/i, /^UK100\b/i] },
        { short: 'EEM', fmt: 'price', matchers: [/^EEM\b/i, /\bMSCI Emerging Markets\b/i] },
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
        getItem({ key: 'iron', label: 'Minério', matchers: [/^TIOc1$|^SM58Fc1$/i], weight: 0.28 }),
        getItem({ key: 'soy', label: 'Soja', matchers: [/^ZS$/i], weight: 0.20 }),
        getItem({ key: 'oil', label: 'Petróleo', matchers: [/\bBrent\b/i, /\bWTI\b/i], weight: 0.18 }),
        getItem({ key: 'lumber', label: 'Madeira serrada', matchers: [/^LBc1$/i, /^LBc\d+$/i, /\bMadeira Serrada\b/i, /\bLumber\b/i], weight: 0.02 }),
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

    const rowsFor = (categories, { includeDxy = false, excludeSymbols = [], includeMissing = false } = {}) => {
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

        rows.sort((x, y) => String(x.label || '').localeCompare(String(y.label || ''), 'pt-BR'));
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
    const groups = extras.length
        ? baseGroups.concat([{ key: 'outros', title: 'Outros', categories: extras, opt: { includeMissing: true } }])
        : baseGroups;

    const buildSnapshot = group => {
        if (group && group.kind === 'di') {
            const rows = diRows();
            return { at: new Date().toISOString(), rows };
        }
        const rows = rowsFor(group.categories, group.opt);
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

    el.innerHTML = cards ? `<div class="panorama-grid">${cards}</div>` : '<div style="opacity:.85;">Sem dados suficientes para montar o panorama.</div>';

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
    if (!data || !(data.assets || []).length) {
        setDataStatus('SEM DADOS • Rode "npm run market:update" e clique ↻ Dados', 'negative');
    } else {
        setDataStatus('', 'neutral');
    }

    const lastUpdate = data.meta && data.meta.generatedAt ? formatDateTime(data.meta.generatedAt) : '';
    const lastUpdateLabel = document.getElementById('last-update-label');
    if (lastUpdateLabel) lastUpdateLabel.textContent = lastUpdate ? ` • ${lastUpdate}` : '';

    renderOverview(data);
    renderFavorites(data);
    renderFlowSentinel(data);
    renderCarryTradeMonitor(data);
    renderIntel(data);
    renderAllAssetsTable(data);
    renderBrazilMarket(data);
    renderCategory(data, 'commoditiesTable', 'commoditiesChart', ['commodities', 'energy', 'agriculture']);
    renderCategory(data, 'metalsTable', 'metalsChart', ['metals']);
    renderCategory(data, 'fxTable', 'fxChart', ['fx_g10', 'fx_emerging']);
    renderCategory(data, 'emergingTable', 'emergingChart', ['emerging']);
    renderMercosul(data);
    renderAlerts(data);
    renderMarketPanorama(data);
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
    setupNav();

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
