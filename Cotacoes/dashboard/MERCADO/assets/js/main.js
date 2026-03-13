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
    const assets = data.assets || [];
    const lastByTag = tag => {
        const vals = assets
            .filter(a => (a.tags || []).includes(tag))
            .map(a => getLastPoint(data, a.symbol))
            .filter(p => p && typeof p.changePct === 'number')
            .map(p => p.changePct);
        return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
    };

    const riskOn = lastByTag('risk_on');
    const riskOff = lastByTag('risk_off');
    const score = riskOn - riskOff;
    let label = 'Neutro';
    if (score > 0.35) label = 'Risk-On';
    if (score < -0.35) label = 'Risk-Off';
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

    const flow = computeFlowScore(data);
    const regimeScore = Number(flow.score.toFixed(3));
    const regimeLabel = flow.label;

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
        { k: 'USD/BRL', r: /^USD\/BRL\b/i },
        { k: 'WDO', r: /^WDO/i },
        { k: 'WIN', r: /^WIN/i },
        { k: 'IBOV', r: /(^\.BVSP$|\bIbovespa\b)/i },
        { k: 'EWZ', r: /^EWZ$/i },
        { k: 'BOVA11', r: /^BOVA11\.SA$/i },
        { k: 'DXY', r: /(^\.DXY$|\bDXY\b)/i },
        { k: 'Brent/WTI', r: /\bBrent\b|\bWTI\b/i },
        { k: 'FXI', r: /^FXI$/i },
        { k: 'CSI300', r: /^\.(CSI300)\b/i },
        { k: 'Minério', r: /^TIOc1$|^SM58Fc1$/i },
        { k: 'Soja', r: /^ZS$/i },
        { k: 'BR10Y', r: /^BR10YT=RR$/i },
    ];

    const criticalFound = criticalMatchers.filter(m => findAssetSymbol(data, m.r)).length;
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

    convictionScore = Math.max(0, Math.min(1, convictionScore));
    const convictionLabel = convictionScore >= 0.75 ? 'ALTA' : convictionScore >= 0.55 ? 'MÉDIA' : 'BAIXA';
    const convictionTone = convictionScore >= 0.75 ? 'positive' : convictionScore >= 0.55 ? 'neutral' : 'negative';

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
    `;

    const html = `
        <div class="metrics-grid" style="margin:0;">
            <div class="metric-card">
                <div class="metric-icon">🧭</div>
                <div class="metric-value">${escapeHtml(regimeLabel)}</div>
                <div class="metric-label">Regime</div>
                <div class="metric-change">${toneBadgeHtmlFromTone(regimeScore > 0.35 ? 'positive' : regimeScore < -0.35 ? 'negative' : 'neutral', regimeScore, formatNumber(regimeScore, 2), { maxAbs: 1 })}</div>
            </div>
            <div class="metric-card">
                <div class="metric-icon">🧱</div>
                <div class="metric-value">${escapeHtml(convictionLabel)}</div>
                <div class="metric-label">Convicção</div>
                <div class="metric-change">${toneBadgeHtmlFromTone(convictionTone, convictionScore * 100, `${formatNumber(convictionScore * 100, 0)}%`, { maxAbs: 100 })}</div>
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
        fxi: findAssetSymbol(data, /^FXI$/i),
        csi: findAssetSymbol(data, /^\.(CSI300)\b/i),
        hsi: findAssetSymbol(data, /\bHSI\b|Hang Seng|^\.HSI/i),
        iron: findAssetSymbol(data, /^TIOc1$|^SM58Fc1$/i),
        soy: findAssetSymbol(data, /^ZS$/i),
        corn: findAssetSymbol(data, /^ZC$/i),
        coffee: findAssetSymbol(data, /^KC$/i),
        sugar: findAssetSymbol(data, /^SB$/i),
        brent: findAssetSymbol(data, /\bBrent\b/i),
        wti: findAssetSymbol(data, /\bWTI\b/i),
        ewz: findAssetSymbol(data, /^EWZ$/i),
        bova11: findAssetSymbol(data, /^BOVA11\.SA$/i),
        ibov: findAssetSymbol(data, /(^\.BVSP$|\bIbovespa\b)/i),
        usdbbrl: findAssetSymbol(data, /^USD\/BRL\b/i),
    };

    const pick = (label, symbol) => {
        const pct = getChangePct(data, symbol);
        const cls = pct === null ? 'neutral' : pct > 0 ? 'positive' : pct < 0 ? 'negative' : 'neutral';
        const name = symbol ? (data.assets || []).find(a => String(a.symbol) === String(symbol))?.name : '';
        return { label, symbol, pct, cls, name: name || '' };
    };

    const china = [pick('FXI', sym.fxi), pick('CSI300', sym.csi), pick('HSI', sym.hsi)];
    const comm = [
        pick('Minério (TIO/SM58F)', sym.iron),
        pick('Soja (ZS)', sym.soy),
        pick('Milho (ZC)', sym.corn),
        pick('Café (KC)', sym.coffee),
        pick('Açúcar (SB)', sym.sugar),
        pick('Brent', sym.brent),
        pick('WTI', sym.wti),
    ];
    const br = [pick('USD/BRL', sym.usdbbrl), pick('EWZ', sym.ewz), pick('BOVA11', sym.bova11), pick('IBOV', sym.ibov)];

    const w = [
        { key: 'iron', symbol: sym.iron, w: 0.4 },
        { key: 'soy', symbol: sym.soy, w: 0.25 },
        { key: 'oil', symbol: sym.brent || sym.wti, w: 0.35 },
    ];
    const parts = w
        .map(x => ({ ...x, pct: getChangePct(data, x.symbol) }))
        .filter(x => typeof x.pct === 'number' && Number.isFinite(x.pct));
    const wSum = parts.reduce((a, b) => a + b.w, 0);
    const score = wSum ? parts.reduce((a, b) => a + b.w * b.pct, 0) / wSum : 0;
    const scoreLbl = score > 0.35 ? 'Suporte (Produtor)' : score < -0.35 ? 'Pressão (Produtor)' : 'Neutro';
    const scoreCls = score > 0.35 ? 'positive' : score < -0.35 ? 'negative' : 'neutral';

    const divergences = [];
    const fxi = getChangePct(data, sym.fxi);
    const csi = getChangePct(data, sym.csi);
    const iron = getChangePct(data, sym.iron);
    const soy = getChangePct(data, sym.soy);
    const oil = getChangePct(data, sym.brent) ?? getChangePct(data, sym.wti);
    const usdbbrl = getChangePct(data, sym.usdbbrl);

    if (typeof fxi === 'number' && typeof iron === 'number' && fxi > 0.4 && iron < -0.4) divergences.push('China forte sem confirmação em Minério');
    if (typeof csi === 'number' && typeof soy === 'number' && csi < -0.4 && soy > 0.4) divergences.push('Soja forte com China fraca (ver oferta/clima)');
    if (typeof oil === 'number' && typeof usdbbrl === 'number' && oil > 0.7 && usdbbrl > 0.2) divergences.push('Petróleo ajuda, mas USD/BRL não confirma (stress local)');

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
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px;">
            ${renderList('China (Proxies)', china)}
            ${renderList('Commodities BR (críticas)', comm)}
            ${renderList('Brasil (Proxies)', br)}
        </div>
        <div style="margin-top:14px;border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:12px;background:rgba(0,0,0,.18);">
            <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;">
                <div style="font-weight:900;letter-spacing:1px;opacity:.95;">Score Produtor BR</div>
                <div style="font-family:'Share Tech Mono',monospace;font-weight:900;">${toneBadgeHtmlFromTone(scoreCls, score, `${scoreLbl} • ${formatNumber(score, 2)}`, { maxAbs: 1 })}</div>
            </div>
            ${divergences.length
                ? `<div style="margin-top:10px;opacity:.92;border-top:1px solid rgba(255,255,255,.08);padding-top:10px;">
                    <div style="font-weight:900;letter-spacing:1px;margin-bottom:6px;">Divergências</div>
                    ${divergences.map(t => `<div style="opacity:.9;line-height:1.35;">• ${escapeHtml(t)}</div>`).join('')}
                </div>`
                : `<div style="margin-top:10px;opacity:.85;">Sem divergências relevantes detectadas.</div>`}
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
    const takeGlobal = (label, matcher) => {
        const symbol = findAssetSymbol(data, matcher);
        const last = getMostRecentPointWithPrice(data, symbol);
        const rate = last && typeof last.price === 'number' ? last.price : null;
        const pct = last && typeof last.changePct === 'number' ? last.changePct : null;
        const cls = pct === null ? 'neutral' : pct > 0 ? 'positive' : pct < 0 ? 'negative' : 'neutral';
        return { label, symbol, rate, pct, cls };
    };

    const gl = [
        takeGlobal('US 2Y', /(^US2YT=RR$|\bUnited States 2-Year\b|^US2Y\b)/i),
        takeGlobal('US 5Y', /(^US5YT=RR$|\bUnited States 5-Year\b|^US5Y\b)/i),
        takeGlobal('US 10Y', /(^TNc2=$|\bUnited States 10-Year\b|^US10YT=RR$|^US10Y\b)/i),
        takeGlobal('US 30Y', /(^US30YT=RR$|\bUnited States 30-Year\b|^US30Y\b)/i),
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

function renderAgendaMatrix() {
    const el = document.getElementById('agendaMatrix');
    if (!el) return;

    fetchAgendaAuto();

    const manualItems = loadAgenda()
        .map(x => ({
            id: String(x && x.id ? x.id : ''),
            time: String(x && x.time ? x.time : ''),
            event: String(x && x.event ? x.event : ''),
            impact: String(x && x.impact ? x.impact : 'MÉDIO').toUpperCase(),
            wdo: String(x && x.wdo ? x.wdo : ''),
            win: String(x && x.win ? x.win : ''),
            src: 'manual',
        }))
        .filter(x => x.event || x.time);

    const seen = new Set(manualItems.map(x => `${x.time}::${x.event}`));

    const autoRaw = Array.isArray(agendaAutoCache) ? agendaAutoCache : [];
    const allowedAutoCurrencies = new Set(['BRL', 'USD', 'EUR', 'CNY', 'CNH', 'JPY', 'GBP']);
    const autoItems = autoRaw
        .map(x => ({
            id: `auto_${String(x && x.id ? x.id : `${Date.now()}_${Math.random().toString(16).slice(2)}`)}`,
            time: String(x && x.time ? x.time : ''),
            currency: String(x && x.currency ? x.currency : '').toUpperCase(),
            event: String(x && x.event ? x.event : ''),
            impact: String(x && x.impact ? x.impact : 'MÉDIO').toUpperCase(),
            wdo: String(x && x.wdo ? x.wdo : ''),
            win: String(x && x.win ? x.win : ''),
            src: 'auto',
        }))
        .filter(x => (x.event || x.time) && x.impact !== 'BAIXO' && allowedAutoCurrencies.has(x.currency))
        .filter(x => {
            const k = `${x.time}::${x.event}`;
            if (seen.has(k)) return false;
            seen.add(k);
            return true;
        })
        .slice(0, 18);

    const items = manualItems.concat(autoItems).sort((a, b) => {
        const aa = String(a.time || '').replace(/[^\d:]/g, '');
        const bb = String(b.time || '').replace(/[^\d:]/g, '');
        return aa.localeCompare(bb) || String(a.event || '').localeCompare(String(b.event || ''));
    });

    const autoKnownEmpty = Array.isArray(agendaAutoCache) && agendaAutoCache.length === 0;
    const emptyMessage = agendaAutoLoading
        ? 'Carregando eventos automáticos…'
        : autoKnownEmpty
            ? 'Sem eventos automáticos (captura bloqueada/indisponível). Você ainda pode adicionar manualmente.'
            : 'Sem eventos cadastrados.';

    const rowHtml = items
        .map(x => {
            const tone = x.impact === 'ALTO' ? 'negative' : x.impact === 'BAIXO' ? 'neutral' : 'positive';
            const ev = x.src === 'auto' ? `AUTO • ${x.event}` : x.event;
            const action = x.src === 'auto'
                ? `<span style="opacity:.55;">—</span>`
                : `<button type="button" data-agenda-del="${escapeHtml(x.id)}" style="background:#141414;color:#e0e0e0;border:1px solid #333;padding:6px 10px;border-radius:6px;font-weight:900;cursor:pointer;">Remover</button>`;
            return `<tr>
                <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.06);font-family:'Share Tech Mono',monospace;font-weight:900;opacity:.9;">${escapeHtml(x.time || '—')}</td>
                <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.06);font-weight:800;opacity:.95;">${escapeHtml(ev || '—')}</td>
                <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.06);"><span class="${tone}" style="font-weight:900;">${escapeHtml(x.impact)}</span></td>
                <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.06);opacity:.9;">${escapeHtml(x.wdo || '—')}</td>
                <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.06);opacity:.9;">${escapeHtml(x.win || '—')}</td>
                <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.06);text-align:right;">
                    ${action}
                </td>
            </tr>`;
        })
        .join('');

    el.innerHTML = `
        <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:10px;">
            <input id="agendaTime" type="text" placeholder="HH:MM" style="width:110px;background:#141414;color:#e0e0e0;border:1px solid #333;padding:8px 10px;border-radius:6px;font-weight:800;" />
            <input id="agendaEvent" type="text" placeholder="Evento" style="flex:1;min-width:220px;background:#141414;color:#e0e0e0;border:1px solid #333;padding:8px 10px;border-radius:6px;font-weight:800;" />
            <select id="agendaImpact" style="width:140px;background:#141414;color:#e0e0e0;border:1px solid #333;padding:8px 10px;border-radius:6px;font-weight:900;">
                <option value="ALTO">ALTO</option>
                <option value="MÉDIO" selected>MÉDIO</option>
                <option value="BAIXO">BAIXO</option>
            </select>
            <input id="agendaWdo" type="text" placeholder="SE–ENTÃO WDO" style="flex:1;min-width:180px;background:#141414;color:#e0e0e0;border:1px solid #333;padding:8px 10px;border-radius:6px;font-weight:800;" />
            <input id="agendaWin" type="text" placeholder="SE–ENTÃO WIN" style="flex:1;min-width:180px;background:#141414;color:#e0e0e0;border:1px solid #333;padding:8px 10px;border-radius:6px;font-weight:800;" />
            <button id="agendaAdd" type="button" style="background:#141414;color:#e0e0e0;border:1px solid #333;padding:8px 12px;border-radius:6px;font-weight:900;cursor:pointer;">Adicionar</button>
            <button id="agendaClear" type="button" style="background:#141414;color:#e0e0e0;border:1px solid #333;padding:8px 12px;border-radius:6px;font-weight:900;cursor:pointer;opacity:.85;">Limpar</button>
        </div>

        <table class="data-table" style="width:100%;border-collapse:collapse;table-layout:auto;">
            <thead>
                <tr>
                    <th style="text-align:left;padding:10px;border-bottom:1px solid rgba(255,255,255,.15);min-width:90px;width:1%;">Hora</th>
                    <th style="text-align:left;padding:10px;border-bottom:1px solid rgba(255,255,255,.15);">Evento</th>
                    <th style="text-align:left;padding:10px;border-bottom:1px solid rgba(255,255,255,.15);min-width:90px;width:1%;">Impacto</th>
                    <th style="text-align:left;padding:10px;border-bottom:1px solid rgba(255,255,255,.15);">Reação WDO</th>
                    <th style="text-align:left;padding:10px;border-bottom:1px solid rgba(255,255,255,.15);">Reação WIN</th>
                    <th style="text-align:right;padding:10px;border-bottom:1px solid rgba(255,255,255,.15);min-width:110px;width:1%;">Ações</th>
                </tr>
            </thead>
            <tbody>
                ${rowHtml || `<tr><td colspan="6" style="padding:12px;opacity:.85;">${escapeHtml(emptyMessage)}</td></tr>`}
            </tbody>
        </table>
    `;

    const addBtn = document.getElementById('agendaAdd');
    const clearBtn = document.getElementById('agendaClear');
    if (addBtn) {
        addBtn.onclick = () => {
            const time = String(document.getElementById('agendaTime')?.value || '').trim();
            const event = String(document.getElementById('agendaEvent')?.value || '').trim();
            const impact = String(document.getElementById('agendaImpact')?.value || 'MÉDIO').trim();
            const wdo = String(document.getElementById('agendaWdo')?.value || '').trim();
            const win = String(document.getElementById('agendaWin')?.value || '').trim();
            if (!event) return;
            const next = loadAgenda();
            next.push({ id: `${Date.now()}_${Math.random().toString(16).slice(2)}`, time, event, impact, wdo, win });
            saveAgenda(next);
            renderAgendaMatrix();
        };
    }
    if (clearBtn) {
        clearBtn.onclick = () => {
            saveAgenda([]);
            renderAgendaMatrix();
        };
    }
    el.querySelectorAll('button[data-agenda-del]').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-agenda-del') || '';
            const next = loadAgenda().filter(x => String(x && x.id ? x.id : '') !== id);
            saveAgenda(next);
            renderAgendaMatrix();
        });
    });
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
    renderRatesBuckets(data);
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
        const pt = x && x.ptBR ? String(x.ptBR) : '';
        const original = x && x.original ? String(x.original) : '';
        const headline = pt || original;
        const link = x && x.url ? String(x.url) : url;
        const originalLine = pt && original ? `<div style="opacity:.70;font-size:12px;line-height:1.25;margin-top:4px;">${escapeHtml(original)}</div>` : '';

        return `
            <div style="padding:10px 12px;border:1px solid rgba(255,255,255,.08);border-radius:12px;background:rgba(0,0,0,.14);">
                <div style="display:flex;align-items:baseline;justify-content:space-between;gap:10px;flex-wrap:wrap;">
                    <div style="font-weight:900;line-height:1.25;">${escapeHtml(headline || '—')}</div>
                    <div style="opacity:.80;font-size:12px;white-space:nowrap;">${escapeHtml(createdAt || '')}</div>
                </div>
                ${originalLine}
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
            <div style="padding:0 12px 12px;">
                <div style="border:1px solid rgba(255,255,255,.10);border-radius:12px;background:rgba(0,0,0,.14);padding:10px 12px;">
                    <div style="font-weight:900;margin-bottom:6px;">Colar manchetes para traduzir (pt-BR)</div>
                    <div style="opacity:.85;font-size:12px;line-height:1.35;margin-bottom:10px;">
                        Cole abaixo as linhas do FinancialJuice (ou de outra fonte) e clique em “Traduzir”.
                    </div>
                    <textarea id="fjPaste" rows="5" style="width:100%;resize:vertical;background:#0f0f0f;color:#e0e0e0;border:1px solid rgba(255,255,255,.14);border-radius:10px;padding:10px;outline:none;"></textarea>
                    <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:10px;">
                        <button id="fjPasteBtn" type="button" style="background:#141414;color:#e0e0e0;border:1px solid rgba(0,243,255,.28);padding:8px 12px;border-radius:10px;cursor:pointer;font-weight:900;">
                            Traduzir
                        </button>
                        <div id="fjPasteStatus" style="opacity:.85;font-size:12px;"></div>
                    </div>
                </div>
            </div>
        `;

    const translateErr = payload && payload.translate && payload.translate.error ? String(payload.translate.error) : '';
    const translateHint = translateErr
        ? `<span style="opacity:.90;color:#ff6b6b;">${escapeHtml(translateErr)}</span>`
        : '';

    setHtml('newsFinancialJuice', `
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:10px 12px;">
            <a href="${escapeHtml(url)}" target="_blank" class="underline_link" style="font-weight:900;">Abrir FinancialJuice</a>
            ${translateHint}
        </div>
        ${body}
    `);

    const btn = document.getElementById('fjPasteBtn');
    const input = document.getElementById('fjPaste');
    const status = document.getElementById('fjPasteStatus');
    if (btn && input && status) {
        btn.onclick = async function () {
            const raw = String(input.value || '').trim();
            const lines = raw.split(/\r?\n/g).map(s => s.trim()).filter(Boolean).slice(0, 30);
            if (!lines.length) {
                status.textContent = 'Cole ao menos 1 linha.';
                return;
            }
            status.textContent = 'Traduzindo...';
            try {
                const baseUrl = getMarketServiceBaseUrl();
                const translated = await fetchJsonPostWithTimeout(`${baseUrl}/api/news/translate`, { items: lines, source: 'en', target: 'pt-BR' }, 9000);
                if (!translated || translated.ok !== true || !Array.isArray(translated.items)) {
                    status.textContent = (translated && translated.message) ? String(translated.message) : 'Tradução indisponível.';
                    return;
                }
                const sum = translated && translated.summary ? translated.summary : null;
                if (sum && sum.translatedCount === 0 && sum.errorCount > 0 && sum.firstError) {
                    status.textContent = String(sum.firstError);
                } else {
                    status.textContent = '';
                }
                const items = translated.items.map((x, idx) => ({
                    id: `manual_${Date.now()}_${idx}`,
                    createdAt: null,
                    original: x && x.original ? String(x.original) : '',
                    ptBR: x && x.translated ? String(x.translated) : null,
                    url: url,
                }));
                renderFinancialJuice({ ok: true, url: url, mode: 'manual', items: items });
            } catch (e) {
                status.textContent = 'Falha ao traduzir. Confirme o serviço local e o tradutor.';
            }
        };
    }
}

async function loadFinancialJuice() {
    const baseUrl = getMarketServiceBaseUrl();
    try {
        const payload = await fetchJsonWithTimeout(`${baseUrl}/api/news/financialjuice/headlines?limit=40&translate=1&t=${Date.now()}`, 4500);
        renderFinancialJuice(payload);
        return true;
    } catch {
        renderFinancialJuice(null);
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
        dxy: findAssetSymbol(data, /(^\.DXY$|\bDXY\b|US Dollar Index)/i),
        brent: findAssetSymbol(data, /\bBrent\b/i),
        wti: findAssetSymbol(data, /\bWTI\b/i),
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

    const classifyUsdAction = score => {
        if (typeof score !== 'number' || !Number.isFinite(score)) return { state: 'neutral', label: 'Neutro' };
        if (Math.abs(score) < neutralThreshold) return { state: 'neutral', label: 'Neutro' };
        if (score > 0) return { state: 'sell-usd', label: 'Vender USD' };
        return { state: 'buy-usd', label: 'Comprar USD' };
    };

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
    const oilBias =
        typeof oilScore === 'number' &&
        oilScore >= 1 &&
        cadStrength &&
        rubStrength &&
        typeof cadStrength.val === 'number' &&
        typeof rubStrength.val === 'number' &&
        cadStrength.val > 0 &&
        rubStrength.val > 0
            ? 'Fluxo pró-produtor'
            : 'Neutro';

    const betaPosCount = betaPosItems.filter(x => x.val !== null).length;
    const betaNegCount = betaNegItems.filter(x => x.val !== null).length;
    const betaPosAction = classifyUsdAction(betaPosScore);
    const betaNegAction = classifyUsdAction(betaNegScore);

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
        { short: 'DXY', fmt: 'price', matchers: [/^\.(DXY)\b/i, /\bUS Dollar Index\b/i] },
        { short: 'VIX', fmt: 'price', matchers: [/^VIX\b/i, /^\.(VIX9D|VIX)\b/i, /\bVolatility\b/i] },
        { short: 'US10Y', fmt: 'yield', matchers: [/\bUnited States 10-Year\b/i, /^TNc2=/i] },
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
        { label: 'Commodities', categories: ['commodities', 'energy', 'agriculture'] },
        { label: 'Metais', categories: ['metals'] },
        { label: 'FX / Carry', categories: ['fx_g10', 'fx_emerging'] },
        { label: 'Emergentes', categories: ['emerging'] },
        { label: 'Volatilidade', categories: ['volatility'] },
        { label: 'Juros', categories: ['rates'] },
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

function renderBrazilMarket(data) {
    const tableId = 'brazilTable';
    const chartId = 'brazilChart';
    const assets = data && data.assets ? data.assets : [];

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

    const frozenKey = 'mercado_panorama_frozen_v1';
    const frozen = safeParse(localStorage.getItem(frozenKey)) || {};

    const saveFrozen = next => {
        try {
            localStorage.setItem(frozenKey, JSON.stringify(next || {}));
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

    const rowsFor = (categories, { includeDxy = false, excludeSymbols = [] } = {}) => {
        const cats = Array.isArray(categories) ? categories : [];
        const exclude = new Set((excludeSymbols || []).map(s => String(s)));
        const base = assets.filter(a => cats.includes(a && a.category ? a.category : ''));
        const rows = base
            .map(a => {
                const symbol = String(a && a.symbol ? a.symbol : '');
                const last = getMostRecentPointWithPrice(data, symbol);
                const price = last && typeof last.price === 'number' ? last.price : null;
                const pct = last && typeof last.changePct === 'number' ? last.changePct : null;
                const t = last && last.t ? String(last.t) : '';
                const label = String(a && a.name ? a.name : symbol);
                const icon = assetIcon({ symbol, name: label, category: a && a.category ? a.category : 'other', tags: a && a.tags ? a.tags : [] });
                return { label, symbol, icon, price, pct, t };
            })
            .filter(r => r.symbol && !exclude.has(r.symbol))
            .filter(r => typeof r.price === 'number' && Number.isFinite(r.price));

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

    const groups = [
        { key: 'asia', title: 'Ásia/Pacífico', categories: ['asia'], opt: {} },
        { key: 'dxy', title: 'DXY', categories: ['fx_g10'], opt: { includeDxy: true } },
        { key: 'emerging', title: 'Emergentes', categories: ['fx_emerging', 'emerging'], opt: {} },
        { key: 'br_di', title: 'Juros Brasil (DI)', kind: 'di' },
        { key: 'rates', title: 'Títulos', categories: ['rates'], opt: {} },
        { key: 'metals', title: 'Metais', categories: ['metals'], opt: {} },
        { key: 'agri', title: 'Agrícolas', categories: ['agriculture'], opt: {} },
        { key: 'energy', title: 'Energia', categories: ['energy'], opt: {} },
        { key: 'commodities', title: 'Commodities', categories: ['commodities'], opt: {} },
        { key: 'principal', title: 'Principais', categories: ['volatility'], opt: { excludeSymbols: [findAssetSymbol(data, /(^\.DXY$|\bDXY\b|US Dollar Index)/i) || ''] } },
        { key: 'crypto', title: 'Criptos', categories: ['crypto'], opt: {} },
    ];

    const buildSnapshot = group => {
        if (group && group.kind === 'di') {
            const rows = diRows();
            return { at: new Date().toISOString(), rows };
        }
        const rows = rowsFor(group.categories, group.opt);
        return { at: new Date().toISOString(), rows };
    };

    const renderCard = (group, snap, isFrozen) => {
        const rows = (snap && Array.isArray(snap.rows) ? snap.rows : []).slice().filter(r => r && r.symbol);
        const freezeAt = snap && snap.at ? formatDateTime(snap.at) : '';
        const subtitle = isFrozen && freezeAt ? `Congelado • ${freezeAt}` : '';
        const headRight = `
            <div style="display:flex;gap:10px;align-items:center;">
                ${subtitle ? `<div style="opacity:.75;font-weight:800;letter-spacing:.6px;font-size:12px;">${escapeHtml(subtitle)}</div>` : ''}
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
                <div class="panorama-card__title">${escapeHtml(group.title)}</div>
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
    renderIntel(data);
    renderAllAssetsTable(data);
    renderBrazilMarket(data);
    renderCategory(data, 'commoditiesTable', 'commoditiesChart', ['commodities', 'energy', 'agriculture']);
    renderCategory(data, 'metalsTable', 'metalsChart', ['metals']);
    renderCategory(data, 'fxTable', 'fxChart', ['fx_g10', 'fx_emerging']);
    renderCategory(data, 'emergingTable', 'emergingChart', ['emerging']);
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
        const sum = formatUpdaterSummary(lastPayload);
        if (sum && sum.text) {
            setDataStatus(sum.text, sum.tone || 'neutral');
            setTimeout(() => setDataStatus('', 'neutral'), 3500);
        } else {
            setDataStatus('OK • Dados atualizados', 'positive');
            setTimeout(() => setDataStatus('', 'neutral'), 2500);
        }
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

    const data = getData();
    if (data) renderAll(data);
    else setDataStatus('DADOS NÃO CARREGADOS • Verifique assets/data/market_quotes.js', 'negative');
    adaptSplitLayouts();
    void loadOptionsGammaSummary();
    void loadFinancialJuice();

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
            if (source) {
                setDataStatus('AUTO • Dados atualizados', 'positive');
                setTimeout(() => setDataStatus('', 'neutral'), 1500);
            }
            return true;
        } catch (e) {
            if (location.protocol === 'file:') {
                window.location.reload();
            }
            return false;
        }
    };

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
