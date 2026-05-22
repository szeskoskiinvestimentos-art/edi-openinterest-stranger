(function () {
    const w = typeof window !== 'undefined' ? window : null;
    if (!w) return;
    const root = (w.MercadoBlocks && typeof w.MercadoBlocks === 'object') ? w.MercadoBlocks : {};

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

    root.scriptLoader = { loadScriptFresh, requestAutoRefreshPage };
    w.MercadoBlocks = root;
})();
