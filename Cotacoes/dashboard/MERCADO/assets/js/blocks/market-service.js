(function () {
    const w = typeof window !== 'undefined' ? window : null;
    if (!w) return;
    const root = (w.MercadoBlocks && typeof w.MercadoBlocks === 'object') ? w.MercadoBlocks : {};

    function getMarketServiceBaseUrl() {
        const client = (w.MercadoBlocks && w.MercadoBlocks.marketClient) ? w.MercadoBlocks.marketClient : null;
        if (client && typeof client.getBaseUrl === 'function') {
            try { return client.getBaseUrl(); } catch { return 'http://127.0.0.1:3033'; }
        }
        return 'http://127.0.0.1:3033';
    }

    async function ensureMarketServiceOnline(force = false) {
        const client = (w.MercadoBlocks && w.MercadoBlocks.marketClient) ? w.MercadoBlocks.marketClient : null;
        if (client && typeof client.ensureOnline === 'function') {
            try { return await client.ensureOnline(force); } catch { return false; }
        }
        return false;
    }

    async function fetchJsonWithTimeout(url, timeoutMs = 3500) {
        const client = (w.MercadoBlocks && w.MercadoBlocks.marketClient) ? w.MercadoBlocks.marketClient : null;
        if (client && typeof client.getJson === 'function') {
            return await client.getJson(url, timeoutMs);
        }
        throw new Error('fetchJsonWithTimeout_unavailable');
    }

    root.marketService = {
        getMarketServiceBaseUrl,
        ensureMarketServiceOnline,
        fetchJsonWithTimeout,
    };
    w.MercadoBlocks = root;
})();
