(function () {
    const w = typeof window !== 'undefined' ? window : null;
    if (!w) return;
    const root = (w.MercadoBlocks && typeof w.MercadoBlocks === 'object') ? w.MercadoBlocks : {};

    function setup() {
        const details = document.getElementById('investingCalendarWidget');
        if (!details) return;
        const enabled = localStorage.getItem('mercado_investing_iframe_autoload') !== '0';
        if (!enabled) return;
        const iframe = details.querySelector && details.querySelector('iframe[data-src]');
        if (!iframe) return;
        let loaded = false;
        function tryLoad() {
            if (loaded) return;
            if (!details.open) return;
            const current = String(iframe.getAttribute('src') || '');
            if (current && current !== 'about:blank') {
                loaded = true;
                return;
            }
            const url = iframe.getAttribute('data-src');
            if (!url) return;
            try {
                iframe.setAttribute('src', url);
                loaded = true;
            } catch {
            }
        }
        details.addEventListener('toggle', tryLoad);
    }

    root.investingCalendarWidget = { setup };
    w.MercadoBlocks = root;
})();
