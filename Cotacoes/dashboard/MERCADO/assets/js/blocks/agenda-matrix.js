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
