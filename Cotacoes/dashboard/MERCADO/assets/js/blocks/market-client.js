(function () {
    const w = typeof window !== 'undefined' ? window : null;
    if (!w) return;
    const root = (w.MercadoBlocks && typeof w.MercadoBlocks === 'object') ? w.MercadoBlocks : {};

    const DEFAULT_BASE_URL = 'http://127.0.0.1:3033';
    const DEFAULT_TIMEOUT_HEALTH_MS = 900;
    const DEFAULT_TIMEOUT_JSON_MS = 3500;
    const ONLINE_CACHE_MS = 30000;

    function getBaseUrl() {
        try {
            const v = localStorage.getItem('mercado_service_base_url');
            if (v && /^https?:\/\/[^/]+:\d+$/i.test(v)) return v;
        } catch {
        }
        return DEFAULT_BASE_URL;
    }

    function buildUrl(path) {
        const base = getBaseUrl();
        const p = String(path || '');
        if (!p) return base;
        if (/^https?:\/\//i.test(p)) return p;
        if (p.startsWith('/')) return `${base}${p}`;
        return `${base}/${p}`;
    }

    function swapLocalPortIfLocalhost(u) {
        if (u.indexOf('http://127.0.0.1:3033') === 0) return u.replace('http://127.0.0.1:3033', 'http://127.0.0.1:3034');
        if (u.indexOf('http://127.0.0.1:3034') === 0) return u.replace('http://127.0.0.1:3034', 'http://127.0.0.1:3033');
        return null;
    }

    async function fetchJson(u, timeoutMs = DEFAULT_TIMEOUT_JSON_MS) {
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
    }

    async function getJson(u, timeoutMs = DEFAULT_TIMEOUT_JSON_MS) {
        const url = String(u || '');
        try {
            return await fetchJson(url, timeoutMs);
        } catch (e) {
            const alt = swapLocalPortIfLocalhost(url);
            if (alt) {
                try {
                    const out = await fetchJson(alt, timeoutMs);
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

    let onlineCache = { atMs: 0, ok: null };
    let onlineInFlight = null;

    async function getHealth({ baseUrl, timeoutMs } = {}) {
        const atMs = Date.now();
        const base = baseUrl || getBaseUrl();
        const url = `${base}/api/market/health?t=${atMs}`;
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), typeof timeoutMs === 'number' ? timeoutMs : DEFAULT_TIMEOUT_HEALTH_MS);
        try {
            const res = await fetch(url, { method: 'GET', signal: ctrl.signal });
            return !!(res && res.ok);
        } catch {
            return false;
        } finally {
            clearTimeout(t);
        }
    }

    async function ensureOnline(force = false) {
        const now = Date.now();
        if (!force && onlineCache.ok !== null && now - onlineCache.atMs < ONLINE_CACHE_MS) {
            return onlineCache.ok;
        }

        if (!force && onlineInFlight) {
            return await onlineInFlight;
        }

        const atMs = Date.now();
        const p = (async () => {
            try {
                return await getHealth({ timeoutMs: DEFAULT_TIMEOUT_HEALTH_MS });
            } catch {
                return false;
            }
        })();
        onlineInFlight = p;

        try {
            const ok = await p;
            onlineCache = { atMs, ok: !!ok };
            return !!ok;
        } finally {
            if (onlineInFlight === p) onlineInFlight = null;
        }
    }

    root.marketClient = {
        getBaseUrl,
        buildUrl,
        getHealth,
        ensureOnline,
        getJson,
        timeouts: {
            healthMs: DEFAULT_TIMEOUT_HEALTH_MS,
            jsonMs: DEFAULT_TIMEOUT_JSON_MS,
        },
    };
    w.MercadoBlocks = root;
})();
