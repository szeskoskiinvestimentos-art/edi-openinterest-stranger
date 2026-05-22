(function () {
    const w = typeof window !== 'undefined' ? window : null;
    if (!w) return;
    const root = (w.MercadoBlocks && typeof w.MercadoBlocks === 'object') ? w.MercadoBlocks : {};

    function render({ data, el, deps } = {}) {
        if (!el) return;
        const d = deps || {};
        const resolveTickerSymbol = d.resolveTickerSymbol;
        const formatTickerPrice = d.formatTickerPrice;
        const getLastPoint = d.getLastPoint;
        const pointPct = d.pointPct;
        const toneBadgeHtmlFromTone = d.toneBadgeHtmlFromTone;
        const toneBadgeHtml = d.toneBadgeHtml;
        const formatPercent = d.formatPercent;
        const formatNumber = d.formatNumber;
        const escapeHtml = d.escapeHtml;
        const symbolKey = d.symbolKey;
        const renderAllAssetsTable = d.renderAllAssetsTable;

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
            .map(d0 => {
                const symbol = resolveTickerSymbol(data, d0.matchers);
                if (!symbol) return null;
                const asset = (data.assets || []).find(a => String(a.symbol) === String(symbol)) || null;
                const last = getLastPoint(data, symbol);
                if (!last || typeof last.price !== 'number') return null;
                const pct = pointPct(last);
                const badge = pct === null ? toneBadgeHtmlFromTone('neutral', 0, '—') : toneBadgeHtml(pct, formatPercent(pct, 2), { maxAbs: 5 });
                const priceTxt = formatTickerPrice(symbol, last.price, d0.fmt);
                const title = asset && asset.name ? `${asset.name} • ${symbol}` : symbol;
                return { symbol, short: d0.short, title, priceTxt, badge };
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

    root.globalTicker = { render };
    w.MercadoBlocks = root;
})();
