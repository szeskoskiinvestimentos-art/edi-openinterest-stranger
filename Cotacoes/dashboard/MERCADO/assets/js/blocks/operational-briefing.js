(function () {
    const w = typeof window !== 'undefined' ? window : null;
    if (!w) return;
    const root = (w.MercadoBlocks && typeof w.MercadoBlocks === 'object') ? w.MercadoBlocks : {};

    function render({ data, el, deps } = {}) {
        const target = el || document.getElementById('operationalBriefing');
        if (!target) return;
        const d = deps && typeof deps === 'object' ? deps : {};

        const operationalInputs = d.operationalInputs && typeof d.operationalInputs === 'object' ? d.operationalInputs : {};
        const rawRegime = operationalInputs.regime;
        const rawOptions = operationalInputs.optionsGamma || null;
        const rawWeb = operationalInputs.webNews || null;
        const rawForeign = operationalInputs.foreignFlow || null;
        const rawFocus = operationalInputs.focusSummary || null;

        try { if (typeof d.fetchAgendaAuto === 'function') d.fetchAgendaAuto(); } catch { }

        const assets = data && Array.isArray(data.assets) ? data.assets : [];
        const dc = d.DecisionCore || ((typeof w !== 'undefined' && w.DecisionCore) ? w.DecisionCore : null);
        const nowMs = Date.now();

        const formatNumber = d.formatNumber;
        const formatPercent = d.formatPercent;
        const formatDateTime = d.formatDateTime;
        const formatDateTimeLoose = d.formatDateTimeLoose;
        const formatBrlCompact = d.formatBrlCompact;
        const escapeHtml = d.escapeHtml;
        const pillHtml = d.pillHtml;
        const toneBadgeHtmlFromTone = d.toneBadgeHtmlFromTone;

        const computeFlowScore = d.computeFlowScore;
        const computeBrazilCdsHedgeSignal = d.computeBrazilCdsHedgeSignal;
        const computeOperationalPulseNow = d.computeOperationalPulseNow;

        const buildOperationalCompassModel = d.buildOperationalCompassModel;
        const renderOperationalCompass = d.renderOperationalCompass;

        const renderBtcOperationalBriefing = d.renderBtcOperationalBriefing;
        const renderHk50OperationalBriefing = d.renderHk50OperationalBriefing;
        const renderOperationalBriefing = d.renderOperationalBriefing;

        const findAliasSymbolBest = d.findAliasSymbolBest;
        const findAliasSymbol = d.findAliasSymbol;
        const findAssetSymbol = d.findAssetSymbol;
        const getMostRecentPointWithPrice = d.getMostRecentPointWithPrice;
        const getLastPoint = d.getLastPoint;
        const getChangePct = d.getChangePct;
        const pointPct = d.pointPct;
        const isBrazilAdr = d.isBrazilAdr;

        const operationalTuning = d.operationalTuning;

        const opBriefing_computeAgendaIntel = d.opBriefing_computeAgendaIntel || w.opBriefing_computeAgendaIntel;
        const opBriefing_computeAgendaValidation = d.opBriefing_computeAgendaValidation || w.opBriefing_computeAgendaValidation;
        const opBriefing_computeFallbackRegime = d.opBriefing_computeFallbackRegime || w.opBriefing_computeFallbackRegime;
        const opBriefing_computeNewsTilt = d.opBriefing_computeNewsTilt || w.opBriefing_computeNewsTilt;
        const opBriefing_biasFromLabel = d.opBriefing_biasFromLabel || w.opBriefing_biasFromLabel;
        const opBriefing_combineBias = d.opBriefing_combineBias || w.opBriefing_combineBias;
        const opBriefing_computeBrFlowSignal = d.opBriefing_computeBrFlowSignal || w.opBriefing_computeBrFlowSignal;
        const opBriefing_computeBrBreadthSectorSignal = d.opBriefing_computeBrBreadthSectorSignal || w.opBriefing_computeBrBreadthSectorSignal;
        const opBriefing_computeMacroBias = d.opBriefing_computeMacroBias || w.opBriefing_computeMacroBias;
        const opBriefing_computeDiSignal = d.opBriefing_computeDiSignal || w.opBriefing_computeDiSignal;
        const opBriefing_computeVolAmp = d.opBriefing_computeVolAmp || w.opBriefing_computeVolAmp;
        const opBriefing_computePriceLead = d.opBriefing_computePriceLead || w.opBriefing_computePriceLead;
        const opBriefing_computeTrendLead = d.opBriefing_computeTrendLead || w.opBriefing_computeTrendLead;
        const opBriefing_computeLocalTapeLead = d.opBriefing_computeLocalTapeLead || w.opBriefing_computeLocalTapeLead;
        const opBriefing_computePulseLead = d.opBriefing_computePulseLead || w.opBriefing_computePulseLead;
        const opBriefing_computeConfidence = d.opBriefing_computeConfidence || w.opBriefing_computeConfidence;
        const opBriefing_biasTone = d.opBriefing_biasTone || w.opBriefing_biasTone;
        const opBriefing_biasLabel = d.opBriefing_biasLabel || w.opBriefing_biasLabel;
        const opBriefing_computeFinalScore = d.opBriefing_computeFinalScore || w.opBriefing_computeFinalScore;
        const opBriefing_gaugeHtml = d.opBriefing_gaugeHtml || w.opBriefing_gaugeHtml;
        const opBriefing_makePlanHtml = d.opBriefing_makePlanHtml || w.opBriefing_makePlanHtml;
        const opBriefing_formatAgendaLine = d.opBriefing_formatAgendaLine || w.opBriefing_formatAgendaLine;
        const opBriefing_formatNewsLine = d.opBriefing_formatNewsLine || w.opBriefing_formatNewsLine;
        const opBriefing_computeMacroLine = d.opBriefing_computeMacroLine || w.opBriefing_computeMacroLine;
        const opBriefing_computeCorrLine = d.opBriefing_computeCorrLine || w.opBriefing_computeCorrLine;
        const opBriefing_computePulseCardHtml = d.opBriefing_computePulseCardHtml || w.opBriefing_computePulseCardHtml;
        const opBriefing_computeScalpModuleHtml = d.opBriefing_computeScalpModuleHtml || w.opBriefing_computeScalpModuleHtml;
        const opBriefing_computeWinProjectionModuleHtml = d.opBriefing_computeWinProjectionModuleHtml || w.opBriefing_computeWinProjectionModuleHtml;
        const opBriefing_computeAuditLineHtml = d.opBriefing_computeAuditLineHtml || w.opBriefing_computeAuditLineHtml;
        const opBriefing_computeBrFlowModuleHtml = d.opBriefing_computeBrFlowModuleHtml || w.opBriefing_computeBrFlowModuleHtml;
        const opBriefing_computeFocusSummaryHtml = d.opBriefing_computeFocusSummaryHtml || w.opBriefing_computeFocusSummaryHtml;
        const opBriefing_computeAdrPremarketHtml = d.opBriefing_computeAdrPremarketHtml || w.opBriefing_computeAdrPremarketHtml;
        const opBriefing_computeCdsSignalCardHtml = d.opBriefing_computeCdsSignalCardHtml || w.opBriefing_computeCdsSignalCardHtml;
        const opBriefing_computeFactorsRowsHtml = d.opBriefing_computeFactorsRowsHtml || w.opBriefing_computeFactorsRowsHtml;
        const pillBadge = d.pillHtml;

        if (
            !formatNumber || !formatPercent || !formatDateTime || !escapeHtml || !pillHtml || !toneBadgeHtmlFromTone
            || typeof opBriefing_computeAgendaIntel !== 'function'
            || typeof opBriefing_computeAgendaValidation !== 'function'
            || typeof opBriefing_computeFallbackRegime !== 'function'
            || typeof opBriefing_computeNewsTilt !== 'function'
            || typeof opBriefing_biasFromLabel !== 'function'
            || typeof opBriefing_combineBias !== 'function'
            || typeof opBriefing_computeBrFlowSignal !== 'function'
            || typeof opBriefing_computeBrBreadthSectorSignal !== 'function'
            || typeof opBriefing_computeMacroBias !== 'function'
            || typeof opBriefing_computeDiSignal !== 'function'
            || typeof opBriefing_computeVolAmp !== 'function'
            || typeof opBriefing_computePriceLead !== 'function'
            || typeof opBriefing_computeTrendLead !== 'function'
            || typeof opBriefing_computeLocalTapeLead !== 'function'
            || typeof opBriefing_computePulseLead !== 'function'
            || typeof opBriefing_computeConfidence !== 'function'
            || typeof opBriefing_computeFinalScore !== 'function'
            || typeof opBriefing_gaugeHtml !== 'function'
            || typeof opBriefing_makePlanHtml !== 'function'
            || typeof opBriefing_formatAgendaLine !== 'function'
            || typeof opBriefing_formatNewsLine !== 'function'
            || typeof opBriefing_computeMacroLine !== 'function'
            || typeof opBriefing_computeCorrLine !== 'function'
            || typeof opBriefing_computePulseCardHtml !== 'function'
            || typeof opBriefing_computeScalpModuleHtml !== 'function'
            || typeof opBriefing_computeWinProjectionModuleHtml !== 'function'
            || typeof opBriefing_computeAuditLineHtml !== 'function'
            || typeof opBriefing_computeBrFlowModuleHtml !== 'function'
            || typeof opBriefing_computeFocusSummaryHtml !== 'function'
            || typeof opBriefing_computeAdrPremarketHtml !== 'function'
            || typeof opBriefing_computeCdsSignalCardHtml !== 'function'
            || typeof opBriefing_computeFactorsRowsHtml !== 'function'
        ) {
            target.innerHTML = '<div style="opacity:.86;font-weight:900;letter-spacing:.6px;">Roteiro do momento indisponível (deps ausentes).</div>';
            return;
        }

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

        const agendaIntel = opBriefing_computeAgendaIntel({ dc });

        const dcDeps = (typeof d.buildDcDeps === 'function')
            ? d.buildDcDeps()
            : { findAliasSymbolBest, findAliasSymbol, findAssetSymbol, getLastPoint };
        const catalog = d.InstrumentsCatalog || ((typeof w !== 'undefined' && w.InstrumentsCatalog) ? w.InstrumentsCatalog : null);
        const catDeps = (typeof d.buildCatDeps === 'function')
            ? d.buildCatDeps(dcDeps)
            : { findAliasSymbolBest, findAliasSymbol, findAssetSymbol, dcDeps };
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

        const agendaValidation = opBriefing_computeAgendaValidation({
            dc,
            data,
            agendaNext,
            agendaIfThen,
            dcDeps,
            pickFreshestCandidate,
            rcKey,
            formatNumber,
        });

        const fallbackRegime = opBriefing_computeFallbackRegime({ data, computeFlowScore });

        const regime = rawRegime || fallbackRegime;
        const options = rawOptions && rawOptions.ok === true ? rawOptions : null;
        const web = rawWeb && rawWeb.ok === true ? rawWeb : null;
        const foreignFlow = rawForeign && rawForeign.ok === true ? rawForeign : null;
        const focus = rawFocus && rawFocus.ok === true ? rawFocus : null;

        const fmt0 = v => (typeof v === 'number' && Number.isFinite(v) ? formatNumber(v, 0) : '—');
        const fmt1 = v => (typeof v === 'number' && Number.isFinite(v) ? formatNumber(v, 1) : '—');

        if (!regime && !options && !web && !focus) {
            const badge = (tone, text, strength) => pillBadge('status', tone, text, strength);
            const st = x => (x ? (x.ok === true ? badge('ok', 'OK', 0.75) : badge('bad', 'ERRO', 0.85)) : badge('info', '—', 0.55));
            target.innerHTML = `
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

        const regimeBias = regime && regime.operational
            ? { wdo: opBriefing_biasFromLabel(regime.operational.wdo), win: opBriefing_biasFromLabel(regime.operational.win) }
            : { wdo: 'neutral', win: 'neutral' };

        const newsTilt = opBriefing_computeNewsTilt({ web });

        const combined = {
            wdo: opBriefing_combineBias(regimeBias.wdo, newsTilt.wdo.bias),
            win: opBriefing_combineBias(regimeBias.win, newsTilt.win.bias),
        };

        const macro = operationalInputs.macro || null;
        const brFlowSignal = opBriefing_computeBrFlowSignal({
            data,
            dc,
            dcDeps,
            nowMs,
            aliasSym,
            pickBestByMatchers,
            rcKey,
            yieldBp10FromSymbol,
            foreignFlow,
            macro,
            operationalTuning,
        });

        const brBreadthSectorSignal = opBriefing_computeBrBreadthSectorSignal({
            data,
            aliasSym,
            pickFreshestCandidate,
            operationalTuning,
        });

        const macroWdo = opBriefing_computeMacroBias({
            symbol: 'WDO',
            data,
            macro,
            foreignFlow,
            brFlowSignal,
            brBreadthSectorSignal,
            operationalTuning,
            rcKey,
            aliasSym,
            pickBestByMatchers,
            yieldBp10FromSymbol,
        });
        const macroWin = opBriefing_computeMacroBias({
            symbol: 'WIN',
            data,
            macro,
            foreignFlow,
            brFlowSignal,
            brBreadthSectorSignal,
            operationalTuning,
            rcKey,
            aliasSym,
            pickBestByMatchers,
            yieldBp10FromSymbol,
        });

        const diSignal = opBriefing_computeDiSignal({ data });

        const resolved = {
            wdo: combined.wdo.conflict ? macroWdo : combined.wdo,
            win: combined.win.conflict ? macroWin : combined.win,
        };

        const finalBias = {
            WDO: { bias: combined.wdo.conflict ? macroWdo.bias : combined.wdo.bias, source: combined.wdo.conflict ? 'MACRO' : 'REGIME+NEWS' },
            WIN: { bias: combined.win.conflict ? macroWin.bias : combined.win.bias, source: combined.win.conflict ? 'MACRO' : 'REGIME+NEWS' },
        };

        const pulseNow = data ? (typeof computeOperationalPulseNow === 'function' ? computeOperationalPulseNow(data) : null) : null;
        const volAmp = opBriefing_computeVolAmp({ data, pulseNow });

        const priceLead = opBriefing_computePriceLead({ data, pulseNow, volAmp });

        if (priceLead.active) {
            if (priceLead.mode === 'risk_off') {
                finalBias.WIN = { bias: 'sell', source: 'PREÇO' };
                finalBias.WDO = { bias: 'buy', source: 'PREÇO' };
            } else {
                finalBias.WIN = { bias: 'buy', source: 'PREÇO' };
                finalBias.WDO = { bias: 'sell', source: 'PREÇO' };
            }
        }

        const trendLead = opBriefing_computeTrendLead({ data, pulseNow, volAmp });

        if (!priceLead.active && trendLead.active) {
            if (trendLead.mode === 'risk_off') {
                finalBias.WIN = { bias: 'sell', source: 'TENDÊNCIA' };
                finalBias.WDO = { bias: 'buy', source: 'TENDÊNCIA' };
            } else {
                finalBias.WIN = { bias: 'buy', source: 'TENDÊNCIA' };
                finalBias.WDO = { bias: 'sell', source: 'TENDÊNCIA' };
            }
        }

        const localTapeLead = opBriefing_computeLocalTapeLead({ data, pulseNow, volAmp });

        if (!priceLead.active && !trendLead.active && localTapeLead.active) {
            if (localTapeLead.mode === 'risk_off_local') {
                finalBias.WIN = { bias: 'sell', source: 'FITA_LOCAL' };
                finalBias.WDO = { bias: 'buy', source: 'FITA_LOCAL' };
            } else if (localTapeLead.mode === 'risk_on_local') {
                finalBias.WIN = { bias: 'buy', source: 'FITA_LOCAL' };
                finalBias.WDO = { bias: 'sell', source: 'FITA_LOCAL' };
            }
        }

        const pulseLead = opBriefing_computePulseLead({ pulseNow });

        if (!priceLead.active && pulseLead.active) {
            finalBias.WDO = { bias: pulseLead.wdo, source: 'PULSO' };
            finalBias.WIN = { bias: pulseLead.win, source: 'PULSO' };
        }

        const confidence = opBriefing_computeConfidence({
            regime,
            combined,
            newsTilt,
            agendaIntel,
            macroWdo,
            macroWin,
            priceLead,
            trendLead,
            localTapeLead,
            pulseLead,
            pulseNow,
        });

        try {
            const forced = finalBias && (finalBias.WDO || finalBias.WIN)
                ? (finalBias.WDO.source === 'PREÇO' || finalBias.WDO.source === 'TENDÊNCIA' || finalBias.WDO.source === 'FITA_LOCAL' || finalBias.WDO.source === 'PULSO'
                    || finalBias.WIN.source === 'PREÇO' || finalBias.WIN.source === 'TENDÊNCIA' || finalBias.WIN.source === 'FITA_LOCAL' || finalBias.WIN.source === 'PULSO')
                : false;
            const macroWinCompass = forced ? { ...macroWin, bias: 'neutral' } : macroWin;
            const macroWdoCompass = forced ? { ...macroWdo, bias: 'neutral' } : macroWdo;
            const model = buildOperationalCompassModel({
                regime,
                options,
                web,
                foreignFlow,
                focus,
                macroWin: macroWinCompass,
                macroWdo: macroWdoCompass,
                fallbackBias: { win: finalBias.WIN.bias, wdo: finalBias.WDO.bias },
            });
            renderOperationalCompass(model);
        } catch {
            try { renderOperationalCompass(null); } catch { }
        }

        const badge = (tone, text, strength) => pillHtml('signal', tone, text, strength);

        const biasTone = opBriefing_biasTone;
        const biasLabel = opBriefing_biasLabel;

        const finalScoreFor = symbol => opBriefing_computeFinalScore({ symbol, newsTilt, macroWdo, macroWin, finalBias, regimeBias });

        const gaugeHtml = (label, score) => opBriefing_gaugeHtml({ label, score, escapeHtml, toneBadgeHtmlFromTone, formatNumber });

        const makePlan = (item) => opBriefing_makePlanHtml({
            item,
            finalBias,
            fmt0,
            fmt1,
            badge,
            biasTone,
            biasLabel,
            gaugeHtml,
            finalScoreFor,
            escapeHtml,
            regime,
            newsTilt,
            web,
            priceLead,
            trendLead,
            localTapeLead,
            pulseLead,
            pulseNow,
            combined,
            macroWdo,
            macroWin,
            brBreadthSectorSignal,
            diSignal,
            agendaIntel,
            agendaIfThen,
            agendaValidation,
            formatPercent,
            formatNumber,
        });

        const items = options && options.items ? [options.items.WDO, options.items.WIN].filter(Boolean) : [];
        const cdsSignal = typeof computeBrazilCdsHedgeSignal === 'function' ? computeBrazilCdsHedgeSignal(data) : null;

        const regimeLine = regime
            ? `${String(regime.label || '—')} • convicção ${String(regime.convictionLabel || '—')} (${fmt0((regime.convictionScore || 0) * 100)}%)`
            : 'Regime: —';

        const agendaLine = opBriefing_formatAgendaLine({ agendaNext, agendaIfThen, agendaValidation, formatNumber });

        const newsLine = opBriefing_formatNewsLine({ web, newsTilt, fmt1 });

        const macroLine = opBriefing_computeMacroLine({
            foreignFlow,
            operationalTuning,
            data,
            rcKey,
            aliasSym,
            pickBestByMatchers,
            yieldBp10FromSymbol,
            findAliasSymbolBest,
            findAliasSymbol,
            findAssetSymbol,
            getChangePct,
            formatBrlCompact,
            formatDateTime,
            macro,
            formatNumber,
            formatPercent,
            brFlowSignal,
            cdsSignal,
        });

        const corrLine = opBriefing_computeCorrLine({ data, findAliasSymbolBest, findAssetSymbol, findAliasSymbol, formatNumber });

        const pulseCard = opBriefing_computePulseCardHtml({
            pulseNow,
            web,
            data,
            badge,
            biasTone,
            biasLabel,
            escapeHtml,
            formatNumber,
            formatPercent,
            toneBadgeHtmlFromTone,
            getChangePct,
        });

        const scalpModule = opBriefing_computeScalpModuleHtml({
            pulseNow,
            data,
            options,
            volAmp,
            foreignFlow,
            brFlowSignal,
            operationalTuning,
            findAliasSymbolBest,
            findAssetSymbol,
            getChangePct,
            formatNumber,
            formatPercent,
            escapeHtml,
            badge,
            biasTone,
            biasLabel,
            fmt0,
        });

        const winProjectionModule = opBriefing_computeWinProjectionModuleHtml({
            pulseNow,
            data,
            options,
            findAliasSymbolBest,
            findAssetSymbol,
            getChangePct,
            formatNumber,
            formatPercent,
            formatDateTime,
            escapeHtml,
            badge,
            pillHtml,
        });

        const auditLine = opBriefing_computeAuditLineHtml({
            data,
            regime,
            rawOptions,
            rawWeb,
            rawForeign,
            rawFocus,
            macro,
            badge,
        });

        const brFlowModule = opBriefing_computeBrFlowModuleHtml({
            brFlowSignal,
            badge,
            formatNumber,
            escapeHtml,
        });

        const focusSummaryCard = opBriefing_computeFocusSummaryHtml({
            rawFocus,
            data,
            diSignal,
            findAliasSymbolBest,
            findAliasSymbol,
            findAssetSymbol,
            getMostRecentPointWithPrice,
            getLastPoint,
            badge,
            escapeHtml,
            formatNumber,
            formatDateTimeLoose,
            toneBadgeHtmlFromTone,
        });

        const adrPremarketCard = opBriefing_computeAdrPremarketHtml({
            data,
            operationalTuning,
            getLastPoint,
            getMostRecentPointWithPrice,
            pointPct,
            isBrazilAdr,
            formatPercent,
            escapeHtml,
        });

        const cdsSignalCard = opBriefing_computeCdsSignalCardHtml({
            cdsSignal,
            escapeHtml,
            toneBadgeHtmlFromTone,
            formatNumber,
        });

        const factorsRowsHtml = opBriefing_computeFactorsRowsHtml({
            data,
            regime,
            macro,
            macroWdo,
            macroWin,
            newsTilt,
            priceLead,
            trendLead,
            localTapeLead,
            pulseLead,
            operationalTuning,
            diSignal,
            cdsSignal,
            getLastPoint,
            pointPct,
            formatPercent,
            formatNumber,
            escapeHtml,
            toneBadgeHtmlFromTone,
        });

        target.innerHTML = `
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
        ${focusSummaryCard}
        ${pulseCard}
        ${scalpModule}
        ${winProjectionModule}
        <div style="margin-top:10px;display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:12px;">
            ${items.length ? items.map(makePlan).join('') : `<div style="padding:12px;border:1px solid rgba(255,255,255,.12);border-radius:14px;background:rgba(0,0,0,.18);opacity:.88;">Sem dados de WDO/WIN em Opções & Gamma (Resumo).</div>`}
        </div>
        ${adrPremarketCard}
        ${cdsSignalCard}
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
                    ${factorsRowsHtml}
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
            const bindUi = d.opBriefing_bindOperationalBriefingUi || w.opBriefing_bindOperationalBriefingUi;
            if (typeof bindUi === 'function') {
                bindUi({
                    operationalTuning,
                    renderOperationalBriefing,
                    renderBtcOperationalBriefing,
                    renderHk50OperationalBriefing,
                });
            }
        } catch {
        }

        try {
            const key = 'mercado_operational_log_v1';
            const nowMs2 = Date.now();
            const next = {
                tMs: nowMs2,
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

    root.operationalBriefing = { render };
    w.MercadoBlocks = root;
})();
