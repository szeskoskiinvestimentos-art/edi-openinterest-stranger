(function () {
    const w = typeof window !== 'undefined' ? window : null;
    if (!w) return;
    const root = (w.MercadoBlocks && typeof w.MercadoBlocks === 'object') ? w.MercadoBlocks : {};

    function render({ data, el, deps } = {}) {
        if (!el) return;
        const d = deps || {};
        const escapeHtml = d.escapeHtml;
        const formatNumber = d.formatNumber;
        const formatDateTime = d.formatDateTime;
        const symbolKey = d.symbolKey;
        const getLastPoint = d.getLastPoint;
        const findAssetSymbol = d.findAssetSymbol;

        const safeEscape = (s) => (typeof escapeHtml === 'function' ? escapeHtml(s) : String(s ?? ''));
        const safeFormatNumber = (v, dec) => (typeof formatNumber === 'function' ? formatNumber(v, dec) : (typeof v === 'number' ? String(v) : '—'));
        const safeFormatDateTime = (t) => (typeof formatDateTime === 'function' ? formatDateTime(t) : String(t || '—'));
        const safeSymbolKey = (sym) => (typeof symbolKey === 'function' ? symbolKey(sym) : String(sym || ''));

        const h = w.DataAuditHelpers || {};
        const computeAudit = typeof h.computeAudit === 'function' ? h.computeAudit : (() => ({ assets: [], withPrice: [], missing: [], withTime: [], fresh: [], stale: [], critical: [] }));
        const fmtAge = typeof h.fmtAge === 'function' ? h.fmtAge : (() => '—');

        const audit = computeAudit({ data, getLastPoint, findAssetSymbol, staleMs: 6 * 60 * 60 * 1000, operationalInputs: d.operationalInputs });
        const assets = audit.assets || [];
        const withPrice = audit.withPrice || [];
        const missing = audit.missing || [];
        const withTime = audit.withTime || [];
        const fresh = audit.fresh || [];
        const stale = audit.stale || [];
        const critical = audit.critical || [];
        const modules = audit.modules || [];

        const metaAudit = data && data.meta && data.meta.audit ? data.meta.audit : null;
        const missingPriceSymbols = metaAudit && Array.isArray(metaAudit.missingPriceSymbols) ? metaAudit.missingPriceSymbols : [];
        const duplicateSymbols = metaAudit && Array.isArray(metaAudit.duplicateSymbols) ? metaAudit.duplicateSymbols : [];
        const outliers = metaAudit && Array.isArray(metaAudit.outliers) ? metaAudit.outliers : [];

        const yahooAudit = w.MARKET_YAHOO_AUDIT_DATA && typeof w.MARKET_YAHOO_AUDIT_DATA === 'object' ? w.MARKET_YAHOO_AUDIT_DATA : null;
        const yahooItems = yahooAudit && Array.isArray(yahooAudit.items) ? yahooAudit.items : [];
        const isNum = (v) => typeof v === 'number' && Number.isFinite(v);

        const criticalDefs = typeof h.defaultCritical === 'function' ? h.defaultCritical() : [];
        const isCriticalYahooItem = (it) => {
            if (!it || !criticalDefs || !criticalDefs.length) return false;
            const assetSymbol = String(it.assetSymbol || '');
            const yahooSymbol = String(it.yahooSymbol || '');
            const tradingViewSymbol = String(it.tradingViewSymbol || '');
            for (const d0 of criticalDefs) {
                const r = d0 && d0.r;
                if (!(r instanceof RegExp)) continue;
                if (r.test(assetSymbol) || r.test(yahooSymbol) || r.test(tradingViewSymbol)) return true;
            }
            return false;
        };

        let yahooOnlyCritical = false;
        try { yahooOnlyCritical = localStorage.getItem('mercado_data_audit_yahoo_only_critical') === '1'; } catch { }

        const yahooSuppressed = yahooItems.filter(it => !!(it && it.changePctSuppressed === true));
        const yahooMissingPct = yahooItems.filter(it => !!(it && String(it.status || '').toLowerCase() === 'updated' && it.changePctSource === 'missing'));
        const yahooMissingAssets = yahooItems.filter(it => !!(it && String(it.status || '').toLowerCase() !== 'updated'));
        const yahooAnomalies = yahooItems.filter(it => !!(it && (it.changePctSuppressed === true || it.changePctSource === 'missing')));

        const yahooAnomaliesFiltered = yahooOnlyCritical ? yahooAnomalies.filter(isCriticalYahooItem) : yahooAnomalies;
        const yahooCategorySummary = (() => {
            const byCat = new Map();
            for (const it of yahooAnomaliesFiltered) {
                const cat = String(it && it.category ? it.category : '—');
                const cur = byCat.get(cat) || { category: cat, total: 0, suppressed: 0, missingPct: 0, missingAssets: 0 };
                cur.total += 1;
                if (it && it.changePctSuppressed === true) cur.suppressed += 1;
                if (it && String(it.status || '').toLowerCase() !== 'updated') cur.missingAssets += 1;
                if (it && String(it.status || '').toLowerCase() === 'updated' && it.changePctSource === 'missing') cur.missingPct += 1;
                byCat.set(cat, cur);
            }
            const rows = Array.from(byCat.values())
                .sort((a, b) => {
                    if (b.total !== a.total) return b.total - a.total;
                    if (b.suppressed !== a.suppressed) return b.suppressed - a.suppressed;
                    return String(a.category).localeCompare(String(b.category));
                })
                .slice(0, 10);
            return { rows, totalCategories: byCat.size };
        })();

        const yahooAnomaliesSorted = yahooAnomaliesFiltered
            .slice()
            .sort((a, b) => {
                const aSup = a && a.changePctSuppressed === true ? 1 : 0;
                const bSup = b && b.changePctSuppressed === true ? 1 : 0;
                if (aSup !== bSup) return bSup - aSup;
                const ac = String(a && a.category ? a.category : '');
                const bc = String(b && b.category ? b.category : '');
                if (ac !== bc) return ac.localeCompare(bc);
                const as = String(a && a.assetSymbol ? a.assetSymbol : '');
                const bs = String(b && b.assetSymbol ? b.assetSymbol : '');
                return as.localeCompare(bs);
            })
            .slice(0, 80);

        const yahooAnomaliesRows = yahooAnomaliesSorted
            .map(it => {
                const status = String(it && it.status ? it.status : '');
                const src = it && it.changePctSource ? String(it.changePctSource) : '—';
                const resolvedBy = it && it.resolvedBy ? String(it.resolvedBy) : '—';
                const supKind = it && it.changePctSuppressedKind ? String(it.changePctSuppressedKind) : '—';
                const supVal = it && isNum(it.changePctSuppressedValue) ? safeFormatNumber(it.changePctSuppressedValue, 2) : '—';
                const supThr = it && isNum(it.changePctSuppressedThreshold) ? safeFormatNumber(it.changePctSuppressedThreshold, 0) : '—';
                const price = it && isNum(it.price) ? it.price : null;
                const priceTxt = price === null ? '—' : safeFormatNumber(price, price < 10 ? 4 : 2);
                const intervalTxt = it && it.dataInterval ? String(it.dataInterval) : '—';
                const reason = it && it.reason ? String(it.reason) : '';
                const criticalBadge = isCriticalYahooItem(it)
                    ? `<span style="display:inline-flex;align-items:center;padding:4px 8px;border-radius:999px;border:1px solid rgba(255,200,0,.35);background:rgba(255,200,0,.18);color:rgba(255,200,0,.95);font-weight:900;letter-spacing:1px;">CRÍTICO</span>`
                    : '';
                const statusBadge = status && status.toLowerCase() !== 'updated'
                    ? `<span style="display:inline-flex;align-items:center;padding:4px 8px;border-radius:999px;border:1px solid rgba(255,60,80,.35);background:rgba(255,60,80,.18);color:rgba(255,60,80,.95);font-weight:900;letter-spacing:1px;">${safeEscape(status.toUpperCase())}</span>`
                    : `<span style="display:inline-flex;align-items:center;padding:4px 8px;border-radius:999px;border:1px solid rgba(0,255,160,.35);background:rgba(0,255,160,.18);color:rgba(0,255,160,.95);font-weight:900;letter-spacing:1px;">UPDATED</span>`;

                return `<tr>
                    <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.06);font-weight:900;letter-spacing:.4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${safeEscape(String(it && it.assetSymbol ? it.assetSymbol : '—'))}</td>
                    <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.06);opacity:.9;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${safeEscape(String(it && it.category ? it.category : '—'))}</td>
                    <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.06);text-align:right;white-space:nowrap;">${statusBadge}</td>
                    <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.06);text-align:right;white-space:nowrap;opacity:.9;">${safeEscape(resolvedBy)}</td>
                    <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.06);font-family:'Share Tech Mono',monospace;font-weight:900;opacity:.9;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${safeEscape(String(it && it.yahooSymbol ? it.yahooSymbol : '—'))}</td>
                    <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.06);font-family:'Share Tech Mono',monospace;font-weight:900;opacity:.9;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${safeEscape(String(it && it.tradingViewSymbol ? it.tradingViewSymbol : '—'))}</td>
                    <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.06);text-align:right;opacity:.9;white-space:nowrap;">${safeEscape(src)}</td>
                    <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.06);text-align:right;opacity:.9;white-space:nowrap;">${safeEscape(priceTxt)}</td>
                    <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.06);text-align:right;opacity:.9;white-space:nowrap;">${safeEscape(intervalTxt)}</td>
                    <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.06);text-align:right;opacity:.9;white-space:nowrap;">${safeEscape(supKind)}</td>
                    <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.06);text-align:right;opacity:.9;white-space:nowrap;">${safeEscape(supVal)}${supVal !== '—' ? '%' : ''}</td>
                    <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.06);text-align:right;opacity:.9;white-space:nowrap;">${safeEscape(supThr)}${supThr !== '—' ? '%' : ''}</td>
                    <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.06);text-align:right;white-space:nowrap;">${criticalBadge}</td>
                    <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.06);opacity:.85;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${safeEscape(reason || '—')}</td>
                </tr>`;
            })
            .join('');

        const yahooAuditHtml = (() => {
            if (!yahooAudit) {
                return `
                    <div style="margin-top:14px;border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:12px;background:rgba(0,0,0,.18);">
                        <div style="font-weight:900;letter-spacing:1px;opacity:.95;margin-bottom:8px;">Anomalias Yahoo (Δ%)</div>
                        <div style="opacity:.88;line-height:1.5;">
                            Audit não carregado. Garanta que <span style="font-family:'Share Tech Mono',monospace;font-weight:900;">assets/data/market_yahoo_audit.js</span> existe e está sendo carregado no boot.
                        </div>
                    </div>
                `;
            }

            const genAt = yahooAudit && yahooAudit.generatedAt ? String(yahooAudit.generatedAt) : '';
            const generatedAtLabel = genAt ? safeFormatDateTime(genAt) : '—';

            const headerChips = [
                `<span style="display:inline-flex;align-items:center;gap:8px;padding:6px 10px;border-radius:999px;border:1px solid rgba(255,255,255,.12);background:rgba(0,0,0,.18);font-weight:900;opacity:.95;">Items ${safeEscape(String(yahooItems.length))}</span>`,
                `<span style="display:inline-flex;align-items:center;gap:8px;padding:6px 10px;border-radius:999px;border:1px solid rgba(255,255,255,.12);background:rgba(0,0,0,.18);font-weight:900;opacity:.95;">Missing ${safeEscape(String(yahooMissingAssets.length))}</span>`,
                `<span style="display:inline-flex;align-items:center;gap:8px;padding:6px 10px;border-radius:999px;border:1px solid rgba(255,255,255,.12);background:rgba(0,0,0,.18);font-weight:900;opacity:.95;">Sem Δ% ${safeEscape(String(yahooMissingPct.length))}</span>`,
                `<span style="display:inline-flex;align-items:center;gap:8px;padding:6px 10px;border-radius:999px;border:1px solid rgba(255,255,255,.12);background:rgba(0,0,0,.18);font-weight:900;opacity:.95;">Suprimidos ${safeEscape(String(yahooSuppressed.length))}</span>`,
                `<span style="display:inline-flex;align-items:center;gap:8px;padding:6px 10px;border-radius:999px;border:1px solid rgba(255,255,255,.12);background:rgba(0,0,0,.18);font-weight:900;opacity:.95;">Execução ${safeEscape(generatedAtLabel)}</span>`,
            ].join(' ');

            const topOffendersRows = (yahooCategorySummary.rows || [])
                .map(r => `<tr>
                    <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.06);font-weight:900;letter-spacing:.4px;">${safeEscape(String(r.category || '—'))}</td>
                    <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.06);text-align:right;font-family:'Share Tech Mono',monospace;font-weight:900;opacity:.9;">${safeEscape(String(r.total))}</td>
                    <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.06);text-align:right;font-family:'Share Tech Mono',monospace;font-weight:900;opacity:.9;">${safeEscape(String(r.suppressed))}</td>
                    <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.06);text-align:right;font-family:'Share Tech Mono',monospace;font-weight:900;opacity:.9;">${safeEscape(String(r.missingPct))}</td>
                    <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.06);text-align:right;font-family:'Share Tech Mono',monospace;font-weight:900;opacity:.9;">${safeEscape(String(r.missingAssets))}</td>
                </tr>`)
                .join('');

            return `
                <div style="margin-top:14px;border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:12px;background:rgba(0,0,0,.18);">
                    <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px;flex-wrap:wrap;">
                        <div style="font-weight:900;letter-spacing:1px;opacity:.95;">Anomalias Yahoo (Δ%)</div>
                        <div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:flex-end;">${headerChips}</div>
                    </div>
                    <div style="margin-top:10px;display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
                        <div style="opacity:.85;line-height:1.4;">
                            Lista quando o Δ% está ausente (<span style="font-family:'Share Tech Mono',monospace;font-weight:900;">changePctSource=missing</span>) ou foi suprimido por ser implausível.
                        </div>
                        <label style="display:inline-flex;align-items:center;gap:8px;opacity:.9;font-weight:900;letter-spacing:.4px;cursor:pointer;user-select:none;">
                            <input id="dataAuditYahooOnlyCritical" type="checkbox" ${yahooOnlyCritical ? 'checked' : ''} />
                            Só críticos
                        </label>
                    </div>
                    <div style="margin-top:10px;">
                        <div style="font-weight:900;letter-spacing:.6px;margin-bottom:6px;opacity:.92;">Top offenders (categorias)</div>
                        <table class="data-table" style="width:100%;border-collapse:collapse;table-layout:auto;">
                            <thead>
                                <tr>
                                    <th style="text-align:left;padding:10px;border-bottom:1px solid rgba(255,255,255,.15);min-width:160px;">Categoria</th>
                                    <th style="text-align:right;padding:10px;border-bottom:1px solid rgba(255,255,255,.15);min-width:90px;width:1%;">Total</th>
                                    <th style="text-align:right;padding:10px;border-bottom:1px solid rgba(255,255,255,.15);min-width:110px;width:1%;">Suprimidos</th>
                                    <th style="text-align:right;padding:10px;border-bottom:1px solid rgba(255,255,255,.15);min-width:100px;width:1%;">Sem Δ%</th>
                                    <th style="text-align:right;padding:10px;border-bottom:1px solid rgba(255,255,255,.15);min-width:110px;width:1%;">Missing</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${topOffendersRows || `<tr><td colspan="5" style="padding:12px;opacity:.85;">Sem anomalias (com os filtros atuais).</td></tr>`}
                            </tbody>
                        </table>
                    </div>
                    <div style="margin-top:10px;">
                        <table class="data-table" style="width:100%;border-collapse:collapse;table-layout:auto;">
                            <thead>
                                <tr>
                                    <th style="text-align:left;padding:10px;border-bottom:1px solid rgba(255,255,255,.15);min-width:200px;">Ativo</th>
                                    <th style="text-align:left;padding:10px;border-bottom:1px solid rgba(255,255,255,.15);min-width:120px;width:1%;">Categoria</th>
                                    <th style="text-align:right;padding:10px;border-bottom:1px solid rgba(255,255,255,.15);min-width:110px;width:1%;">Status</th>
                                    <th style="text-align:right;padding:10px;border-bottom:1px solid rgba(255,255,255,.15);min-width:120px;width:1%;">Resolved</th>
                                    <th style="text-align:left;padding:10px;border-bottom:1px solid rgba(255,255,255,.15);min-width:150px;width:1%;">Yahoo</th>
                                    <th style="text-align:left;padding:10px;border-bottom:1px solid rgba(255,255,255,.15);min-width:190px;width:1%;">TradingView</th>
                                    <th style="text-align:right;padding:10px;border-bottom:1px solid rgba(255,255,255,.15);min-width:120px;width:1%;">Δ% source</th>
                                    <th style="text-align:right;padding:10px;border-bottom:1px solid rgba(255,255,255,.15);min-width:120px;width:1%;">Preço</th>
                                    <th style="text-align:right;padding:10px;border-bottom:1px solid rgba(255,255,255,.15);min-width:90px;width:1%;">Interval</th>
                                    <th style="text-align:right;padding:10px;border-bottom:1px solid rgba(255,255,255,.15);min-width:120px;width:1%;">Sup kind</th>
                                    <th style="text-align:right;padding:10px;border-bottom:1px solid rgba(255,255,255,.15);min-width:110px;width:1%;">Sup val</th>
                                    <th style="text-align:right;padding:10px;border-bottom:1px solid rgba(255,255,255,.15);min-width:110px;width:1%;">Thr</th>
                                    <th style="text-align:right;padding:10px;border-bottom:1px solid rgba(255,255,255,.15);min-width:90px;width:1%;">Crítico</th>
                                    <th style="text-align:right;padding:10px;border-bottom:1px solid rgba(255,255,255,.15);min-width:140px;width:1%;">Motivo</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${yahooAnomaliesRows || `<tr><td colspan="14" style="padding:12px;opacity:.85;">Nenhuma anomalia de Δ% encontrada (com os filtros atuais).</td></tr>`}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        })();

        const chips = critical
            .map(x => {
                const tone = x.found ? 'rgba(0,255,160,.18)' : 'rgba(255,60,80,.18)';
                const border = x.found ? 'rgba(0,255,160,.35)' : 'rgba(255,60,80,.35)';
                const color = x.found ? 'rgba(0,255,160,.95)' : 'rgba(255,60,80,.95)';
                return `<span style="display:inline-flex;align-items:center;gap:8px;padding:6px 10px;border-radius:999px;border:1px solid ${border};background:${tone};color:${color};font-weight:900;letter-spacing:1px;">
                    ${safeEscape(x.label)} ${x.found ? '✓' : '✕'}
                </span>`;
            })
            .join(' ');

        const staleRows = stale
            .map(x => `<tr>
                <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.06);font-family:'Share Tech Mono',monospace;font-weight:900;opacity:.9;">${safeEscape(safeSymbolKey(x.a && x.a.symbol))}</td>
                <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.06);opacity:.9;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${safeEscape((x.a && x.a.name) || '')}</td>
                <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.06);text-align:right;opacity:.9;">${safeEscape(fmtAge(x.ageMs))}</td>
                <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.06);text-align:right;opacity:.9;">${safeEscape(x.last && x.last.t ? safeFormatDateTime(x.last.t) : '—')}</td>
            </tr>`)
            .join('');

        const moduleRows = (modules || [])
            .map(m => {
                const tone = m.present ? (m.stale ? 'rgba(255,200,0,.18)' : 'rgba(0,255,160,.18)') : 'rgba(255,60,80,.18)';
                const border = m.present ? (m.stale ? 'rgba(255,200,0,.35)' : 'rgba(0,255,160,.35)') : 'rgba(255,60,80,.35)';
                const color = m.present ? (m.stale ? 'rgba(255,200,0,.95)' : 'rgba(0,255,160,.95)') : 'rgba(255,60,80,.95)';
                const status = m.present ? (m.stale ? 'STALE' : 'OK') : 'AUSENTE';
                return `<tr>
                    <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.06);font-weight:900;letter-spacing:.6px;">${safeEscape(m.label)}</td>
                    <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.06);text-align:right;opacity:.9;">${safeEscape(m.ts ? safeFormatDateTime(m.ts) : '—')}</td>
                    <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.06);text-align:right;opacity:.9;">${safeEscape(m.ageMs !== null ? fmtAge(m.ageMs) : '—')}</td>
                    <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.06);text-align:right;">
                        <span style="display:inline-flex;align-items:center;gap:8px;padding:6px 10px;border-radius:999px;border:1px solid ${border};background:${tone};color:${color};font-weight:900;letter-spacing:1px;">
                            ${safeEscape(status)}
                        </span>
                    </td>
                </tr>`;
            })
            .join('');

        const listSymbols = (xs, limit = 24) => {
            const arr = Array.isArray(xs) ? xs.filter(Boolean).slice(0, limit) : [];
            return arr.length ? arr.map(s => `<span style="display:inline-flex;align-items:center;padding:4px 8px;border-radius:999px;border:1px solid rgba(255,255,255,.12);background:rgba(0,0,0,.18);font-family:'Share Tech Mono',monospace;font-weight:900;opacity:.9;">${safeEscape(s)}</span>`).join(' ') : '';
        };

        const duplicatesHtml = (duplicateSymbols || [])
            .slice(0, 12)
            .map(x => `<tr>
                <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.06);font-family:'Share Tech Mono',monospace;font-weight:900;opacity:.9;">${safeEscape(safeSymbolKey(x.symbol))}</td>
                <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.06);font-family:'Share Tech Mono',monospace;font-weight:900;opacity:.85;">${safeEscape(x.rawSymbol || '—')}</td>
                <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.06);text-align:right;opacity:.9;font-family:'Share Tech Mono',monospace;font-weight:900;">${safeEscape((typeof x.csvLine === 'number' && Number.isFinite(x.csvLine)) ? String(Math.floor(x.csvLine)) : '—')}</td>
                <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.06);opacity:.9;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${safeEscape(x.rawName || x.name || '')}</td>
                <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.06);opacity:.9;">${safeEscape(x.exchange || '')}</td>
            </tr>`)
            .join('');

        const outliersHtml = (outliers || [])
            .slice(0, 12)
            .map(x => `<tr>
                <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.06);font-family:'Share Tech Mono',monospace;font-weight:900;opacity:.9;">${safeEscape(safeSymbolKey(x.symbol))}</td>
                <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.06);opacity:.9;">${safeEscape(String(x.kind || ''))}</td>
                <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.06);text-align:right;opacity:.9;">${safeEscape(safeFormatNumber(x.value, 2))}%</td>
                <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.06);text-align:right;opacity:.9;">${safeEscape(x.at ? safeFormatDateTime(x.at) : '—')}</td>
            </tr>`)
            .join('');

        el.innerHTML = `
            <div class="metrics-grid" style="margin:0;">
                <div class="metric-card">
                    <div class="metric-icon">🧭</div>
                    <div class="metric-value">${safeEscape(String(assets.length))}</div>
                    <div class="metric-label">Ativos</div>
                    <div class="metric-change neutral">monitorados</div>
                </div>
                <div class="metric-card">
                    <div class="metric-icon">✅</div>
                    <div class="metric-value">${safeEscape(String(withPrice.length))}</div>
                    <div class="metric-label">Com preço</div>
                    <div class="metric-change neutral">${safeEscape(safeFormatNumber((assets.length ? (withPrice.length / assets.length) * 100 : 0), 0))}%</div>
                </div>
                <div class="metric-card">
                    <div class="metric-icon">⏱️</div>
                    <div class="metric-value">${safeEscape(String(fresh.length))}</div>
                    <div class="metric-label">Atualizados (&lt;6h)</div>
                    <div class="metric-change neutral">${safeEscape(safeFormatNumber((withTime.length ? (fresh.length / withTime.length) * 100 : 0), 0))}%</div>
                </div>
                <div class="metric-card">
                    <div class="metric-icon">⚠️</div>
                    <div class="metric-value">${safeEscape(String(missing.length))}</div>
                    <div class="metric-label">Sem preço</div>
                    <div class="metric-change neutral">${safeEscape(safeFormatNumber((assets.length ? (missing.length / assets.length) * 100 : 0), 0))}%</div>
                </div>
            </div>

            <div style="margin-top:14px;border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:12px;background:rgba(0,0,0,.18);">
                <div style="font-weight:900;letter-spacing:1px;opacity:.95;margin-bottom:8px;">Críticos</div>
                <div style="display:flex;flex-wrap:wrap;gap:8px;line-height:1.6;">${chips}</div>
            </div>

            <div style="margin-top:14px;border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:12px;background:rgba(0,0,0,.18);">
                <div style="font-weight:900;letter-spacing:1px;opacity:.95;margin-bottom:8px;">Módulos (Resumo Operacional)</div>
                <table class="data-table" style="width:100%;border-collapse:collapse;table-layout:auto;">
                    <thead>
                        <tr>
                            <th style="text-align:left;padding:10px;border-bottom:1px solid rgba(255,255,255,.15);">Módulo</th>
                            <th style="text-align:right;padding:10px;border-bottom:1px solid rgba(255,255,255,.15);min-width:160px;width:1%;">Timestamp</th>
                            <th style="text-align:right;padding:10px;border-bottom:1px solid rgba(255,255,255,.15);min-width:90px;width:1%;">Idade</th>
                            <th style="text-align:right;padding:10px;border-bottom:1px solid rgba(255,255,255,.15);min-width:120px;width:1%;">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${moduleRows || `<tr><td colspan="4" style="padding:12px;opacity:.85;">Módulos não informados.</td></tr>`}
                    </tbody>
                </table>
            </div>

            ${(missingPriceSymbols.length || duplicateSymbols.length || outliers.length) ? `
            <div style="margin-top:14px;border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:12px;background:rgba(0,0,0,.18);">
                <div style="font-weight:900;letter-spacing:1px;opacity:.95;margin-bottom:8px;">Anomalias (server-side)</div>
                ${missingPriceSymbols.length ? `<div style="opacity:.88;margin-bottom:10px;line-height:1.5;"><div style="font-weight:900;letter-spacing:.6px;margin-bottom:6px;">Sem preço (amostra)</div><div style="display:flex;flex-wrap:wrap;gap:8px;">${listSymbols(missingPriceSymbols, 30)}</div></div>` : ''}
                ${duplicateSymbols.length ? `
                    <div style="margin-top:8px;">
                        <div style="font-weight:900;letter-spacing:.6px;margin-bottom:6px;">Colisões de símbolo (amostra)</div>
                        <table class="data-table" style="width:100%;border-collapse:collapse;table-layout:auto;">
                            <thead>
                                <tr>
                                    <th style="text-align:left;padding:10px;border-bottom:1px solid rgba(255,255,255,.15);min-width:120px;width:1%;">Símbolo</th>
                                    <th style="text-align:left;padding:10px;border-bottom:1px solid rgba(255,255,255,.15);min-width:140px;width:1%;">Raw símbolo</th>
                                    <th style="text-align:right;padding:10px;border-bottom:1px solid rgba(255,255,255,.15);min-width:80px;width:1%;">Linha</th>
                                    <th style="text-align:left;padding:10px;border-bottom:1px solid rgba(255,255,255,.15);">Nome</th>
                                    <th style="text-align:left;padding:10px;border-bottom:1px solid rgba(255,255,255,.15);min-width:120px;width:1%;">Bolsa</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${duplicatesHtml || `<tr><td colspan="5" style="padding:12px;opacity:.85;">—</td></tr>`}
                            </tbody>
                        </table>
                    </div>
                ` : ''}
                ${outliers.length ? `
                    <div style="margin-top:12px;">
                        <div style="font-weight:900;letter-spacing:.6px;margin-bottom:6px;">Outliers de variação (%), filtrados</div>
                        <table class="data-table" style="width:100%;border-collapse:collapse;table-layout:auto;">
                            <thead>
                                <tr>
                                    <th style="text-align:left;padding:10px;border-bottom:1px solid rgba(255,255,255,.15);min-width:120px;width:1%;">Símbolo</th>
                                    <th style="text-align:left;padding:10px;border-bottom:1px solid rgba(255,255,255,.15);min-width:140px;width:1%;">Campo</th>
                                    <th style="text-align:right;padding:10px;border-bottom:1px solid rgba(255,255,255,.15);min-width:100px;width:1%;">Valor</th>
                                    <th style="text-align:right;padding:10px;border-bottom:1px solid rgba(255,255,255,.15);min-width:160px;width:1%;">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${outliersHtml || `<tr><td colspan="4" style="padding:12px;opacity:.85;">—</td></tr>`}
                            </tbody>
                        </table>
                    </div>
                ` : ''}
            </div>
            ` : ''}

            ${yahooAuditHtml}

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

        try {
            const cb = el.querySelector('#dataAuditYahooOnlyCritical');
            if (cb) {
                cb.onchange = () => {
                    try { localStorage.setItem('mercado_data_audit_yahoo_only_critical', cb.checked ? '1' : '0'); } catch { }
                    try { render({ data, el, deps }); } catch { }
                };
            }
        } catch { }
    }

    root.dataAudit = { render };
    w.MercadoBlocks = root;
})();
