(function () {
    const w = typeof window !== 'undefined' ? window : null;
    if (!w) return;
    const root = (w.MercadoBlocks && typeof w.MercadoBlocks === 'object') ? w.MercadoBlocks : {};

    function render({ data, el, deps } = {}) {
        if (!el) return;
        const d = deps || {};
        const toneBadgeHtmlFromTone = d.toneBadgeHtmlFromTone;
        const toneBadgeHtml = d.toneBadgeHtml;
        const findAliasSymbolBest = d.findAliasSymbolBest;
        const findAliasSymbol = d.findAliasSymbol;
        const findAssetSymbol = d.findAssetSymbol;
        const getLastPoint = d.getLastPoint;
        const getMostRecentPointWithPrice = d.getMostRecentPointWithPrice;
        const findAsset = d.findAsset;
        const escapeHtml = d.escapeHtml;
        const formatNumber = d.formatNumber;
        const formatDateTime = d.formatDateTime;
        const getChangePct = d.getChangePct;
        const symbolKey = d.symbolKey;
        const isBrazilRelated = d.isBrazilRelated;
        const pointPct = d.pointPct;
        const computeBrazilCdsHedgeSignal = d.computeBrazilCdsHedgeSignal;

        const mk = (tone, txt) => toneBadgeHtmlFromTone(tone, 0, txt, { maxAbs: 1 });
        const catalog = (typeof window !== 'undefined' && window.InstrumentsCatalog) ? window.InstrumentsCatalog : null;
        const dc = (typeof window !== 'undefined' && window.DecisionCore) ? window.DecisionCore : null;
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
        const aliasSym = (k) => findAliasSymbolBest(data, k) || findAliasSymbol(data, k);

        const looksLikeBrazilFixedIncome = a => {
            const name = String(a && a.name ? a.name : '');
            const sym = symbolKey(a && a.symbol ? a.symbol : '');
            if (!name && !sym) return false;
            if (isBrazilRelated({ symbol: sym, name, category: 'rates' })) return true;
            if (/\btesouro\b|\btesouro direto\b|\bntn\b|\bntn-?b\b|\bltn\b|\blft\b|\bipca\b|\bselic\b|\bcupom\b|\bdi\b|\bjuros?\s*futuros?\b|\bima[-\s]?b\b|\birf[-\s]?m\b|\bprefixad|\bpre[-\s]?fixad/i.test(name)) return true;
            if (/^BR\d+(YT|MT)=RR$/i.test(sym) || /^BRNB\d+(YT|MT)=RR$/i.test(sym) || /^US10BR10=RR$/i.test(sym) || /^DAPC\d+$/i.test(sym) || /^DDIC/i.test(sym) || /^DI1\b/i.test(sym) || /^DI[A-Z]\d$/i.test(sym)) return true;
            return false;
        };
        const rates = assets;

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
            const dt = new Date(ms);
            const dd = String(dt.getDate()).padStart(2, '0');
            const mm = String(dt.getMonth() + 1).padStart(2, '0');
            const yy = String(dt.getFullYear());
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

        const pick = (label, { key, matcher } = {}) => {
            const symbol = key
                ? (rcKey(key, matcher) || (matcher ? pickBestByMatchers([matcher]) : null))
                : (matcher ? (pickBestByMatchers([matcher]) || findAssetSymbol(data, matcher)) : null);
            const { last, prev } = lastAndPrev(symbol);
            if (!symbol || !last || !(typeof last.price === 'number' && Number.isFinite(last.price))) return null;
            const delta = typeof last.change === 'number' && Number.isFinite(last.change)
                ? last.change
                : (prev && typeof prev.price === 'number' && Number.isFinite(prev.price) ? last.price - prev.price : null);
            const bps = typeof delta === 'number' && Number.isFinite(delta) ? delta * 100 : null;
            return { label, symbol, rate: last.price, bps };
        };

        const essentials = [
            pick('BR 3M', { key: 'BR_3M', matcher: /^BR3MT=RR$/i }),
            pick('BR 1Y', { key: 'BR_1Y', matcher: /^BR1YT=RR$/i }),
            pick('BR 2Y', { key: 'BR_2Y', matcher: /^BR2YT=RR$/i }),
            pick('BR 5Y', { key: 'BR_5Y', matcher: /^BR5YT=RR$/i }),
            pick('BR 10Y', { key: 'BR_10Y', matcher: /^BR10YT=RR$/i }),
            pick('IPCA+ (real)', { key: 'BR_IPCA_10Y', matcher: /^BRNB10YT=RR$/i }),
            pick('DAP 1 (real)', { key: 'BR_DAPC1', matcher: /^DAPc1$/i }),
            pick('DAP 2 (real)', { key: 'BR_DAPC2', matcher: /^DAPc2$/i }),
            pick('DAP 3 (real)', { key: 'BR_DAPC3', matcher: /^DAPc3$/i }),
            pick('DI 1 (DDI)', { key: 'BR_DDI1', matcher: /^DDIC1$/i }),
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
            const det = `${src > 0 ? '+' : ''}${formatNumber(src, 1)} bp`;
            if (src <= -3) return { tone: 'positive', label: 'Entrada', detail: `Δ ${det}` };
            if (src >= 3) return { tone: 'negative', label: 'Saída', detail: `Δ ${det}` };
            return { tone: 'neutral', label: 'Neutro', detail: `Δ ${det}` };
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
            const det = `${termPremiumBps > 0 ? '+' : ''}${formatNumber(termPremiumBps, 1)} bp`;
            if (termPremiumBps >= 3) return { tone: 'negative', label: 'Abrindo', detail: `Δ ${det}` };
            if (termPremiumBps <= -3) return { tone: 'positive', label: 'Fechando', detail: `Δ ${det}` };
            return { tone: 'neutral', label: 'Neutro', detail: `Δ ${det}` };
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

        const symEwz = aliasSym('EWZ') || pickBestByMatchers([/^EWZ$/i, /^EWZ(\.\w+)?$/i, /\bEWZ\b/i]) || findAssetSymbol(data, /^EWZ$/i);
        const symIbov = aliasSym('IBOV') || pickBestByMatchers([/^\.BVSP$/i, /\bIbovespa\b/i, /^BOVA11\.SA$/i, /^EWZ$/i]) || findAssetSymbol(data, /^\.BVSP$/i);
        const symUsdbbrl = aliasSym('USD_BRL') || pickBestByMatchers([/^USD\/BRL\b/i]) || findAssetSymbol(data, /^USD\/BRL\b/i);
        const symBrCds = pickBestByMatchers([/^BRGV/i, /\bBrazil\b.*\bCDS\b|\bCDS\b.*\bBrazil\b/i]) || findAssetSymbol(data, /^BRGV/i) || findAssetSymbol(data, /\bBrazil\b.*\bCDS\b|\bCDS\b.*\bBrazil\b/i);
        const symVix = findAliasSymbolBest(data, 'VIX9D') || findAliasSymbolBest(data, 'VIX30') || aliasSym('VIX') || pickBestByMatchers([/^\.?VIX(9D)?$/i, /^VIX$/i]) || findAssetSymbol(data, /^\.?VIX(9D)?$/i);
        const symDxy = aliasSym('DXY') || pickBestByMatchers([/(^\.DXY$|\bDXY\b|US Dollar Index|\bUSDX\b|Dollar Index|Índice\s*Dólar|Indice\s*Dolar)/i]) || findAssetSymbol(data, /(^\.DXY$|\bDXY\b|US Dollar Index|\bUSDX\b|Dollar Index|Índice\s*Dólar|Indice\s*Dolar)/i);
        const symUs10y = rcKey('US_10Y', /(^US10YT=RR$|^US10YT=X$|^\.TNX$|\^TNX)/i) || aliasSym('US10Y') || pickBestByMatchers([/^US10YT=RR$/i, /^\.TNX$/i, /^\^TNX$/i]);

        const ewz = getChangePct(data, symEwz);
        const ibov = getChangePct(data, symIbov);
        const usdbbrl = getChangePct(data, symUsdbbrl);
        const cds = getChangePct(data, symBrCds);
        const vix = getChangePct(data, symVix);
        const dxy = getChangePct(data, symDxy);
        const us10y = symUs10y ? (() => {
            const last = getMostRecentPointWithPrice(data, symUs10y) || getLastPoint(data, symUs10y);
            const chg = last && typeof last.change === 'number' && Number.isFinite(last.change) ? last.change : null;
            return typeof chg === 'number' ? (chg * 100) / 10 : null;
        })() : null;
        const cdsSignal = computeBrazilCdsHedgeSignal(data);

        const rfCoverage = (() => {
            if (!dc || typeof dc.computeCoverage !== 'function') return null;
            const syms = [
                ...essentials.map(x => x && x.symbol ? String(x.symbol) : '').filter(Boolean),
                symUsdbbrl,
                symEwz,
                symIbov,
                symBrCds,
                symVix,
                symDxy,
                symUs10y,
            ].filter(Boolean);
            if (!syms.length) return null;
            return dc.computeCoverage(dcDeps, data, syms, { staleMs: 6 * 60 * 60 * 1000 });
        })();

        const flowBr = (() => {
            const cdsAdj = (() => {
                if (cdsSignal && cdsSignal.mode === 'hedge_on_risk_on') return null;
                return typeof cds === 'number' && Number.isFinite(cds) ? -cds : null;
            })();
            const weightedAvg = (pairs) => {
                const xs = (pairs || [])
                    .filter(p => p && typeof p.v === 'number' && Number.isFinite(p.v) && typeof p.w === 'number' && Number.isFinite(p.w) && p.w > 0);
                const wSum = xs.reduce((s, p) => s + p.w, 0);
                if (!(wSum > 0)) return null;
                const s = xs.reduce((acc, p) => acc + p.v * p.w, 0) / wSum;
                return Number.isFinite(s) ? s : null;
            };
            const score = weightedAvg([
                { v: typeof ewz === 'number' && Number.isFinite(ewz) ? ewz : null, w: 0.28 },
                { v: typeof ibov === 'number' && Number.isFinite(ibov) ? ibov : null, w: 0.22 },
                { v: typeof usdbbrl === 'number' && Number.isFinite(usdbbrl) ? -usdbbrl : null, w: 0.30 },
                { v: typeof vix === 'number' && Number.isFinite(vix) ? -vix : null, w: 0.10 },
                { v: typeof dxy === 'number' && Number.isFinite(dxy) ? -dxy : null, w: 0.10 },
                { v: typeof us10y === 'number' && Number.isFinite(us10y) ? -us10y : null, w: 0.08 },
                { v: cdsAdj, w: 0.32 },
            ]);
            if (!(typeof score === 'number' && Number.isFinite(score))) return { tone: 'neutral', label: 'n/d', detail: 'sem confirmação' };
            if (score > 0.25) return { tone: 'positive', label: 'Entrada', detail: `score ${formatNumber(score, 2)}` };
            if (score < -0.25) return { tone: 'negative', label: 'Saída', detail: `score ${formatNumber(score, 2)}` };
            return { tone: 'neutral', label: 'Neutro', detail: `score ${formatNumber(score, 2)}` };
        })();

        const suggestLine = (() => {
            const hasAny = (matchers) => {
                for (const a of assets) {
                    const sym = String(a && a.symbol ? a.symbol : '');
                    const name = String(a && a.name ? a.name : '');
                    for (const re of matchers) if (re.test(sym) || re.test(name)) return true;
                }
                return false;
            };
            const wants = [
                { label: 'BR 3M/1Y/2Y/5Y/10Y (yields)', matchers: [/^BR(3M|1Y|2Y|5Y|10Y)T=RR$/i] },
                { label: 'IPCA+ (BRNB10Y)', matchers: [/^BRNB10YT=RR$/i, /\bIPCA\+\b/i] },
                { label: 'DAPc1/DAPc2/DAPc3', matchers: [/^DAPc[123]$/i] },
                { label: 'DDIC1 (DI 1)', matchers: [/^DDIC1$/i] },
                { label: 'USD/BRL', matchers: [/^USD\/BRL\b/i, /\bUSD_BRL\b/i] },
                { label: 'CDS Brasil', matchers: [/\bBrazil\b.*\bCDS\b|\bCDS\b.*\bBrazil\b/i, /^BRGV/i] },
                { label: 'IBOV/EWZ', matchers: [/^\.BVSP$/i, /\bIbovespa\b/i, /^EWZ(\.\w+)?$/i] },
                { label: 'VIX/DXY/US10Y', matchers: [/^\.?VIX(9D)?$/i, /(^\.DXY$|\bDXY\b)/i, /(^US10YT=RR$|^\.TNX$|\^TNX)/i] },
            ];
            const missing = wants.filter(w0 => !hasAny(w0.matchers)).map(w0 => w0.label);
            return missing.length ? `Sugestões p/ carteira (Investing): ${missing.slice(0, 6).join(' • ')}${missing.length > 6 ? `… +${missing.length - 6}` : ''}` : '';
        })();

        const summary = `
        <div style="border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:12px;background:rgba(0,0,0,.18);">
            <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap;">
                <div style="font-weight:900;letter-spacing:1px;opacity:.95;">🇧🇷 Renda Fixa Brasil &amp; Fluxo</div>
                <div style="font-family:'Share Tech Mono',monospace;font-weight:900;opacity:.95;">Shape: ${escapeHtml(shape)}${latestUpdate ? ` • Atualização: ${escapeHtml(latestUpdate)}` : ''}</div>
            </div>
            ${rfCoverage ? `<div style="margin-top:6px;opacity:.75;font-size:12px;line-height:1.35;font-family:'Share Tech Mono',monospace;font-weight:900;">
                Cobertura ${escapeHtml(String(rfCoverage.counts.withChange))}/${escapeHtml(String(rfCoverage.counts.expected))} • Fresh ${escapeHtml(formatNumber(rfCoverage.ratios.freshness * 100, 0))}%
            </div>` : ''}
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
            ${suggestLine ? `<div style="margin-top:8px;opacity:.82;font-size:12px;line-height:1.35;">${escapeHtml(suggestLine)}</div>` : ''}
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

    root.brazilFixedIncomeFlow = { render };
    w.MercadoBlocks = root;
})();
