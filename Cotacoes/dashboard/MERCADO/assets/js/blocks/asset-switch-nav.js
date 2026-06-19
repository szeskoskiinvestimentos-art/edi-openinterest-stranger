(function () {
    const w = typeof window !== 'undefined' ? window : null;
    if (!w) return;
    const root = (w.MercadoBlocks && typeof w.MercadoBlocks === 'object') ? w.MercadoBlocks : {};

    function setup() {
        const sel = document.getElementById('assetSelect');
        if (!sel) return;
        const prodBase = 'https://szeskoskiinvestimentos-art.github.io/edi-openinterest-stranger/dashboard_unificado/';
        function isProdHost() {
            const host = location.hostname || '';
            return host.indexOf('github.io') !== -1 || host.indexOf('sites.google.com') !== -1;
        }
        function targetFor(val) {
            if (val === 'MERCADO') return location.href;
            if (val === 'HUB') {
                if (isProdHost()) return prodBase;
                return '../../../dashboard_unificado/index.html';
            }
            if (val === 'CORR') {
                if (isProdHost()) return prodBase + 'correlation/';
                return '../../../dashboard_unificado/correlation/index.html';
            }
            if (val === 'CONTROLE') {
                if (isProdHost()) return prodBase.replace('dashboard_unificado/', '') + 'controle_de_dados.html';
                return '../../../controle_de_dados.html';
            }
            if (isProdHost()) return prodBase + (val === 'WDO' ? 'WDO/' : 'WIN/');
            return '../../../dashboard_unificado/' + (val === 'WDO' ? 'WDO/index.html' : 'WIN/index.html');
        }
        sel.addEventListener('change', function (e) {
            const url = targetFor(e.target.value);
            try {
                window.top.location.href = url;
            } catch {
                location.href = url;
            }
        });
    }

    root.assetSwitchNav = { setup };
    w.MercadoBlocks = root;
})();
