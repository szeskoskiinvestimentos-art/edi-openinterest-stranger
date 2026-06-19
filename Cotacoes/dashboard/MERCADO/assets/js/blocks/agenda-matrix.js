(function () {
    const w = typeof window !== 'undefined' ? window : null;
    if (!w) return;
    const root = (w.MercadoBlocks && typeof w.MercadoBlocks === 'object') ? w.MercadoBlocks : {};

    function render({ el, deps } = {}) {
        if (!el) return;
        const d = deps || {};

        const escapeHtml = d.escapeHtml;
        const fetchAgendaAuto = d.fetchAgendaAuto;
        const agendaLoadPrefs = d.agendaLoadPrefs;
        const agendaSavePrefs = d.agendaSavePrefs;
        const agendaTabsHtml = d.agendaTabsHtml;
        const agendaCountryFromCurrency = d.agendaCountryFromCurrency;
        const agendaCountryLabel = d.agendaCountryLabel;
        const getAgendaAutoCache = d.getAgendaAutoCache;
        const isAgendaAutoLoading = d.isAgendaAutoLoading;
        const DecisionCore = d.DecisionCore || (w.DecisionCore || null);
        const getLastPoint = d.getLastPoint;
        const getMostRecentPointWithPrice = d.getMostRecentPointWithPrice;
        const pointPct = d.pointPct;
        const formatNumber = d.formatNumber;
        const formatPercent = d.formatPercent;
        const findAliasSymbolBest = d.findAliasSymbolBest;
        const findAliasSymbol = d.findAliasSymbol;
        const findAssetSymbol = d.findAssetSymbol;
        const assetAliasMatchers = d.assetAliasMatchers;

        if (typeof escapeHtml !== 'function'
            || typeof fetchAgendaAuto !== 'function'
            || typeof agendaLoadPrefs !== 'function'
            || typeof agendaSavePrefs !== 'function'
            || typeof agendaTabsHtml !== 'function'
            || typeof agendaCountryFromCurrency !== 'function'
            || typeof agendaCountryLabel !== 'function'
            || typeof getAgendaAutoCache !== 'function'
            || typeof isAgendaAutoLoading !== 'function'
        ) {
            throw new Error('deps_missing');
        }

        fetchAgendaAuto();

        const prefs = agendaLoadPrefs();
        const view = String(prefs.view || 'agenda');
        const filter = String(prefs.filter || 'TODOS');
        const impactFilter = String(prefs.impact || 'ALTO+MÉDIO');

        const seen = new Set();

        const agendaAutoCache = getAgendaAutoCache();
        const agendaAutoLoading = isAgendaAutoLoading();

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

        const calendarPayload = (() => { try { return w.ECONOMIC_CALENDAR_DATA || null; } catch { return null; } })();
        const marketData = (() => { try { return w.MARKET_QUOTES_DATA || null; } catch { return null; } })();

        const isNum = v => typeof v === 'number' && Number.isFinite(v);
        const bestPoint = (data, symbol) => {
            if (typeof getMostRecentPointWithPrice === 'function') {
                const p = getMostRecentPointWithPrice(data, symbol);
                if (p) return p;
            }
            return typeof getLastPoint === 'function' ? (getLastPoint(data, symbol) || null) : null;
        };
        const bestTsMs = (pt) => {
            if (!pt) return null;
            const a = pt.asOf ? Date.parse(String(pt.asOf)) : NaN;
            const t = pt.t ? Date.parse(String(pt.t)) : NaN;
            const aOk = Number.isFinite(a);
            const tOk = Number.isFinite(t);
            if (aOk && tOk) return Math.max(a, t);
            if (aOk) return a;
            if (tOk) return t;
            return null;
        };
        const fmtAge = (ms) => {
            if (!isNum(ms) || ms < 0) return '—';
            const m = Math.floor(ms / 60000);
            const h = Math.floor(m / 60);
            const mm = m - h * 60;
            return h > 0 ? `${h}h${String(mm).padStart(2, '0')}` : `${m}m`;
        };
        const resolveValidatorSymbol = (data, key) => {
            const k = String(key || '').trim();
            if (!k) return null;
            if (typeof findAliasSymbolBest === 'function') {
                const sym = findAliasSymbolBest(data, k) || (typeof findAliasSymbol === 'function' ? findAliasSymbol(data, k) : null);
                if (sym) return sym;
            }
            const matchers = typeof assetAliasMatchers === 'function' ? assetAliasMatchers(k) : [];
            if (typeof findAssetSymbol === 'function') {
                for (const re of (Array.isArray(matchers) ? matchers : [])) {
                    if (!(re instanceof RegExp)) continue;
                    const sym = findAssetSymbol(data, re);
                    if (sym) return sym;
                }
            }
            return null;
        };

        const validatorsForItem = (it) => {
            const cur = String(it && it.currency ? it.currency : '').toUpperCase();
            const ev = String(it && it.event ? it.event : '');
            const key = it && (it.matrixKey || it.canonicalKey) ? String(it.matrixKey || it.canonicalKey) : '';
            const m = DecisionCore && typeof DecisionCore.getMatrixIfThen === 'function'
                ? DecisionCore.getMatrixIfThen({ currency: cur, matrixKey: key, eventText: ev })
                : null;
            const list = m && Array.isArray(m.validators) ? m.validators : [];
            if (list.length) return { matrix: m, validators: list };
            if (cur === 'USD') return { matrix: m, validators: ['DXY', 'US10Y', 'VIX', 'SPX'] };
            if (cur === 'BRL') return { matrix: m, validators: ['USD_BRL', 'BR10Y', 'IBOV', 'EWZ'] };
            if (cur === 'EUR') return { matrix: m, validators: ['DXY', 'US10Y', 'SPX', 'VIX'] };
            if (cur === 'CNY' || cur === 'CNH' || cur === 'HKD') return { matrix: m, validators: ['USD_CNH', 'IRON', 'COPPER', 'BRENT', 'FXI'] };
            return { matrix: m, validators: [] };
        };

        const validatorsChipsHtml = (data, keys, opts) => {
            const nowMs = Date.now();
            const staleMs = opts && typeof opts.staleMs === 'number' ? opts.staleMs : 6 * 60 * 60 * 1000;
            const out = [];
            const missing = [];
            const stale = [];
            const noChange = [];
            for (const k0 of (Array.isArray(keys) ? keys : [])) {
                const k = String(k0 || '').trim();
                if (!k) continue;
                const sym = resolveValidatorSymbol(data, k);
                if (!sym) {
                    missing.push(k);
                    continue;
                }
                const pt = bestPoint(data, sym);
                const px = pt && isNum(pt.price) ? pt.price : null;
                const pct = pt && typeof pointPct === 'function' ? pointPct(pt) : null;
                const ts = bestTsMs(pt);
                const age = ts !== null ? (nowMs - ts) : null;
                const isStale = age !== null ? age > staleMs : true;
                if (isStale) stale.push(k);
                if (!isNum(pct)) noChange.push(k);
                const tone =
                    !isNum(px) ? 'rgba(255,60,80,.22)'
                        : (isStale ? 'rgba(255,200,0,.20)' : 'rgba(0,255,160,.16)');
                const border =
                    !isNum(px) ? 'rgba(255,60,80,.35)'
                        : (isStale ? 'rgba(255,200,0,.35)' : 'rgba(0,255,160,.28)');
                const color =
                    !isNum(px) ? 'rgba(255,60,80,.95)'
                        : (isStale ? 'rgba(255,200,0,.95)' : 'rgba(0,255,160,.92)');
                const pctTxt = isNum(pct) && typeof formatPercent === 'function' ? formatPercent(pct, 2) : '—';
                const pxTxt = isNum(px) && typeof formatNumber === 'function' ? formatNumber(px, px >= 100 ? 2 : 4) : '—';
                const ageTxt = age !== null ? fmtAge(age) : '—';
                out.push(`<span style="display:inline-flex;align-items:center;gap:8px;padding:4px 8px;border-radius:999px;border:1px solid ${border};background:${tone};color:${color};font-family:'Share Tech Mono',monospace;font-weight:900;letter-spacing:.3px;">
                    ${escapeHtml(k)} <span style="opacity:.85;">${escapeHtml(pxTxt)}</span> <span style="opacity:.9;">${escapeHtml(pctTxt)}</span> <span style="opacity:.75;">${escapeHtml(ageTxt)}</span>
                </span>`);
            }
            return {
                html: out.join(' '),
                stats: { expected: (Array.isArray(keys) ? keys.length : 0), missing, stale, noChange },
            };
        };

        const matrixCellHtml = (it) => {
            const cur = String(it && it.currency ? it.currency : '').toUpperCase();
            const ev = String(it && it.event ? it.event : '');
            const key = it && (it.matrixKey || it.canonicalKey) ? String(it.matrixKey || it.canonicalKey) : '';
            const m = DecisionCore && typeof DecisionCore.getMatrixIfThen === 'function'
                ? DecisionCore.getMatrixIfThen({ currency: cur, matrixKey: key, eventText: ev })
                : null;
            const lines = m && Array.isArray(m.lines) ? m.lines : [];
            const src = m && m.source ? String(m.source) : '';
            const fallback = (() => {
                const wdo = it && it.wdo ? String(it.wdo) : '';
                const win = it && it.win ? String(it.win) : '';
                if (!wdo && !win) return '';
                return `${wdo ? `WDO ${wdo}` : ''}${wdo && win ? ' • ' : ''}${win ? `WIN ${win}` : ''}`;
            })();
            if (lines.length) {
                const top = lines.slice(0, 3).map(x => `• ${escapeHtml(String(x || ''))}`).join('<br>');
                return `<div style="opacity:.92;line-height:1.35;">
                    ${src ? `<div style="opacity:.72;font-size:11px;font-family:'Share Tech Mono',monospace;font-weight:900;">${escapeHtml(src)}</div>` : ''}
                    <div style="margin-top:2px;font-size:12px;">${top}</div>
                </div>`;
            }
            const tone = it && it.mappedBy && String(it.mappedBy) !== 'fallback' ? 'rgba(0,255,160,.92)' : 'rgba(255,200,0,.92)';
            return `<div style="opacity:.9;line-height:1.35;">
                <div style="opacity:.72;font-size:11px;font-family:'Share Tech Mono',monospace;font-weight:900;color:${tone};">Matriz: fallback</div>
                <div style="margin-top:2px;font-size:12px;">${escapeHtml(fallback || '—')}</div>
            </div>`;
        };

        const rowHtml = list => list
            .map(x => {
                const tone = x.impact === 'ALTO' ? 'negative' : x.impact === 'BAIXO' ? 'neutral' : 'positive';
                const ev = x.src === 'auto' ? `AUTO • ${x.event}` : x.event;
                const vPack = validatorsForItem(x);
                const vKeys = vPack.validators || [];
                const v = validatorsChipsHtml(marketData, vKeys, { staleMs: 6 * 60 * 60 * 1000 });
                const chips = v.html || '';
                const miss = v.stats.missing || [];
                const st = v.stats.stale || [];
                const ch = v.stats.noChange || [];
                const covTxt = vKeys.length
                    ? `${String(vKeys.length - miss.length)}/${String(vKeys.length)} • Δ% ${String(vKeys.length - ch.length)}/${String(vKeys.length)} • fresh ${String(vKeys.length - st.length)}/${String(vKeys.length)}`
                    : '—';
                return `<tr>
                <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.06);font-family:'Share Tech Mono',monospace;font-weight:900;opacity:.9;">${escapeHtml(x.time || '—')}</td>
                <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.06);font-weight:800;opacity:.95;">${escapeHtml(ev || '—')}</td>
                <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.06);"><span class="${tone}" style="font-weight:900;">${escapeHtml(x.impact)}</span></td>
                <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.06);min-width:260px;">${matrixCellHtml(x)}</td>
                <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.06);min-width:300px;">${chips || '<span style=\"opacity:.75;\">—</span>'}</td>
                <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.06);opacity:.9;font-family:'Share Tech Mono',monospace;font-weight:900;white-space:nowrap;width:1%;text-align:right;">${escapeHtml(covTxt)}</td>
            </tr>`;
            })
            .join('');

        const tableHtml = (title, list) => {
            const rows = rowHtml(list);
            const msg = agendaAutoLoading && agendaAutoCache === null ? 'Carregando…' : emptyMessage;
            const summary = (() => {
                const total = Array.isArray(list) ? list.length : 0;
                if (!total) return '';
                let withMatrix = 0;
                let withValidators = 0;
                let okAll = 0;
                for (const it of list) {
                    const cur = String(it && it.currency ? it.currency : '').toUpperCase();
                    const ev = String(it && it.event ? it.event : '');
                    const key = it && (it.matrixKey || it.canonicalKey) ? String(it.matrixKey || it.canonicalKey) : '';
                    const m = DecisionCore && typeof DecisionCore.getMatrixIfThen === 'function'
                        ? DecisionCore.getMatrixIfThen({ currency: cur, matrixKey: key, eventText: ev })
                        : null;
                    const hasMatrix = !!(m && Array.isArray(m.lines) && m.lines.length);
                    if (hasMatrix) withMatrix += 1;
                    const pack = validatorsForItem(it);
                    const keys = pack.validators || [];
                    if (keys.length) withValidators += 1;
                    const v = keys.length ? validatorsChipsHtml(marketData, keys, { staleMs: 6 * 60 * 60 * 1000 }) : null;
                    const miss = v && v.stats && Array.isArray(v.stats.missing) ? v.stats.missing : [];
                    const stale = v && v.stats && Array.isArray(v.stats.stale) ? v.stats.stale : [];
                    const noChg = v && v.stats && Array.isArray(v.stats.noChange) ? v.stats.noChange : [];
                    if (keys.length && !miss.length && !stale.length && !noChg.length) okAll += 1;
                }
                return `<div style="margin:6px 0 10px;opacity:.78;font-size:12px;line-height:1.35;font-family:'Share Tech Mono',monospace;font-weight:900;">
                    Matriz ${escapeHtml(String(withMatrix))}/${escapeHtml(String(total))} • Validadores ${escapeHtml(String(withValidators))}/${escapeHtml(String(total))} • OK total ${escapeHtml(String(okAll))}/${escapeHtml(String(total))}
                </div>`;
            })();
            return `
            <div style="margin:14px 0 8px;display:flex;align-items:center;justify-content:space-between;gap:10px;">
                <div style="font-weight:900;letter-spacing:1px;opacity:.95;">${escapeHtml(title)}</div>
                <div style="opacity:.75;font-family:'Share Tech Mono',monospace;font-weight:900;">${escapeHtml(String(list.length))} itens</div>
            </div>
            ${summary}
            <table class="data-table" style="width:100%;border-collapse:collapse;table-layout:auto;">
                <thead>
                    <tr>
                        <th style="text-align:left;padding:10px;border-bottom:1px solid rgba(255,255,255,.15);min-width:90px;width:1%;">Hora</th>
                        <th style="text-align:left;padding:10px;border-bottom:1px solid rgba(255,255,255,.15);">Evento</th>
                        <th style="text-align:left;padding:10px;border-bottom:1px solid rgba(255,255,255,.15);min-width:90px;width:1%;">Impacto</th>
                        <th style="text-align:left;padding:10px;border-bottom:1px solid rgba(255,255,255,.15);min-width:260px;">Matriz (WDO/WIN)</th>
                        <th style="text-align:left;padding:10px;border-bottom:1px solid rgba(255,255,255,.15);min-width:300px;">Ativos p/ validar</th>
                        <th style="text-align:right;padding:10px;border-bottom:1px solid rgba(255,255,255,.15);min-width:180px;width:1%;">Cobertura</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows || `<tr><td colspan="6" style="padding:12px;opacity:.85;">${escapeHtml(msg)}</td></tr>`}
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

        const reportsPanel = (() => {
            const meta = calendarPayload && calendarPayload.meta && typeof calendarPayload.meta === 'object' ? calendarPayload.meta : null;
            const m = meta && meta.matrix && typeof meta.matrix === 'object' ? meta.matrix : null;
            const req = m && Array.isArray(m.requestedReports) ? m.requestedReports : [];
            if (!req.length) return '';
            const items = calendarPayload && Array.isArray(calendarPayload.items) ? calendarPayload.items : [];
            const by = { BR: [], EUA: [], 'CHINA/HK': [] };
            for (const r of req) {
                const c = r && r.country ? String(r.country) : '';
                if (c === 'BR') by.BR.push(r);
                else if (c === 'EUA') by.EUA.push(r);
                else if (c === 'CHINA/HK') by['CHINA/HK'].push(r);
            }
            const has = (key) => items.some(it => String(it && (it.canonicalKey || it.matrixKey || '')).toUpperCase() === String(key || '').toUpperCase());
            const li = (r) => {
                const key = String(r && r.key ? r.key : '');
                const ok = key ? has(key) : false;
                const tone = ok ? 'rgba(0,255,160,.90)' : 'rgba(255,60,80,.95)';
                const bg = ok ? 'rgba(0,255,160,.12)' : 'rgba(255,60,80,.14)';
                const br = ok ? 'rgba(0,255,160,.25)' : 'rgba(255,60,80,.25)';
                const q = r && r.query ? String(r.query) : '';
                return `<li style="display:flex;align-items:center;justify-content:space-between;gap:10px;padding:6px 8px;border-radius:10px;border:1px solid ${br};background:${bg};">
                    <span style="font-family:'Share Tech Mono',monospace;font-weight:900;letter-spacing:.2px;color:${tone};">${escapeHtml(key || '—')}</span>
                    <span style="opacity:.75;font-size:12px;">${escapeHtml(q || (ok ? 'coberto' : 'faltando no calendário'))}</span>
                </li>`;
            };
            const box = (title, arr) => {
                if (!arr.length) return '';
                const okN = arr.reduce((n, r) => n + (has(r.key) ? 1 : 0), 0);
                return `<div style="border:1px solid rgba(255,255,255,.10);border-radius:14px;padding:10px;background:rgba(0,0,0,.20);">
                    <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin:0 0 8px;">
                        <div style="font-weight:900;letter-spacing:.6px;opacity:.92;">${escapeHtml(title)}</div>
                        <div style="opacity:.8;font-family:'Share Tech Mono',monospace;font-weight:900;">${escapeHtml(String(okN))}/${escapeHtml(String(arr.length))}</div>
                    </div>
                    <ul style="list-style:none;margin:0;padding:0;display:grid;gap:6px;">${arr.map(li).join('')}</ul>
                </div>`;
            };
            return `<div style="margin:10px 0 14px;">
                <div style="font-weight:900;letter-spacing:.8px;opacity:.9;margin:0 0 8px;">Relatórios do dia (base matriz)</div>
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:10px;">
                    ${box('Brasil (BR)', by.BR)}
                    ${box('EUA (USD)', by.EUA)}
                    ${box('China/HK', by['CHINA/HK'])}
                </div>
            </div>`;
        })();

        const unmappedPanel = (() => {
            const meta = calendarPayload && calendarPayload.meta && typeof calendarPayload.meta === 'object' ? calendarPayload.meta : null;
            const m = meta && meta.matrix && typeof meta.matrix === 'object' ? meta.matrix : null;
            const unmapped = m && Array.isArray(m.unmappedTop) ? m.unmappedTop : [];
            if (!unmapped.length) return '';
            const li = (x) => {
                const c = x && x.country ? String(x.country) : '';
                const ev = x && x.sampleEvent ? String(x.sampleEvent) : '';
                const n = x && typeof x.count === 'number' ? x.count : 0;
                const tokens = x && Array.isArray(x.suggestTokens) ? x.suggestTokens : [];
                const inc = x && x.suggestIncludes ? String(x.suggestIncludes) : '';
                const rx = x && x.suggestRegex ? String(x.suggestRegex) : '';
                const sug = (tokens.length || inc || rx)
                    ? `<div style="margin-top:4px;opacity:.78;font-size:11px;line-height:1.25;font-family:'Share Tech Mono',monospace;font-weight:900;">
                        <div>tokens: ${escapeHtml(tokens.join(', ') || '—')}</div>
                        <div>includes: ${escapeHtml(inc || '—')}</div>
                        <div>regex: ${escapeHtml(rx || '—')}</div>
                    </div>`
                    : '';
                return `<li style="display:flex;align-items:center;justify-content:space-between;gap:10px;padding:6px 8px;border-radius:10px;border:1px solid rgba(255,200,0,.22);background:rgba(255,200,0,.08);">
                    <span style="opacity:.9;font-weight:900;">${escapeHtml(c || '—')}</span>
                    <span style="flex:1;opacity:.85;">${escapeHtml(ev || '—')}${sug}</span>
                    <span style="opacity:.9;font-family:'Share Tech Mono',monospace;font-weight:900;">${escapeHtml(String(n))}</span>
                </li>`;
            };
            return `<div style="margin:10px 0 14px;">
                <div style="font-weight:900;letter-spacing:.8px;opacity:.9;margin:0 0 8px;">Não mapeados (candidatos p/ matriz)</div>
                <ul style="list-style:none;margin:0;padding:0;display:grid;gap:6px;">${unmapped.map(li).join('')}</ul>
            </div>`;
        })();
        el.innerHTML =
            viewKey !== 'agenda'
                ? `
        ${agendaTabsHtml(view)}
        ${reportsPanel}
        ${unmappedPanel}
        ${filterBarCountry}
        <div>
            ${tableHtml(`${agendaCountryLabel(wanted)} (eventos do dia)`, shown[wanted] || [])}
        </div>
    `
                : `
        ${agendaTabsHtml(view)}
        ${reportsPanel}
        ${unmappedPanel}
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
                render({ el, deps });
            });
        });

        const filterSel = el.querySelector('#agendaFilter');
        if (filterSel) {
            try {
                filterSel.value = filter || 'TODOS';
            } catch {
            }
            filterSel.addEventListener('change', () => {
                const nextFilter = String(filterSel.value || 'TODOS');
                agendaSavePrefs({ filter: nextFilter });
                render({ el, deps });
            });
        }

        const impactSel = el.querySelector('#agendaImpactFilter');
        if (impactSel) {
            try {
                impactSel.value = impactFilter || 'ALTO+MÉDIO';
            } catch {
            }
            impactSel.addEventListener('change', () => {
                const nextImpact = String(impactSel.value || 'ALTO+MÉDIO');
                agendaSavePrefs({ impact: nextImpact });
                render({ el, deps });
            });
        }
    }

    root.agendaMatrix = { render };
    w.MercadoBlocks = root;
})();
