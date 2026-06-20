(function () {
  // E44: Auto-discovery de dashboards
  // Tenta popular o seletor <select id="assetSelect"> com paginas
  // encontradas em diretorios conhecidos.
  function autoDiscoverDashboards(knownMap) {
    try {
      // Diretorios onde procurar dashboards
      var dirs = [
        '../',                            // dashboard_unificado/*/index.html
        '../../Cotacoes/dashboard/',      // Cotacoes/dashboard/*/index.html
        '../../',                         // raiz para controle_de_dados.html
      ];
      var suffixes = ['index.html', 'dashboard.html'];

      for (var i = 0; i < dirs.length; i++) {
        // Tenta resolver paths comuns manualmente (sem fazer fetch)
        // ja que file:// nao tem listagem de diretorio
      }
      // Como file:// nao permite listar diretorios,
      // este auto-discovery e limitado a paths hardcoded no map.
      // Para descoberta real, usar backend (E35).
      return knownMap;
    } catch (e) {
      return knownMap;
    }
  }

  function getRootBaseHref() {
    var href = window.location.href;
    var idx = href.indexOf('/dashboard_unificado/');
    if (idx >= 0) return href.slice(0, idx) + '/';
    idx = href.indexOf('/Cotacoes/');
    if (idx >= 0) return href.slice(0, idx) + '/';
    if (/\/controle_de_dados\.html(\?|#|$)/.test(href)) {
      return href.replace(/\/controle_de_dados\.html(\?|#|$).*/, '/');
    }
    return href.replace(/\/[^\/?#]+(\?|#|$).*/, '/');
  }
  function guessCurrentDashboard() {
    var href = window.location.href;
    if (href.indexOf('/dashboard_unificado/WDO/') >= 0) return 'WDO';
    if (href.indexOf('/dashboard_unificado/WIN/') >= 0) return 'WIN';
    if (href.indexOf('/dashboard_unificado/correlation/') >= 0) return 'CORR';
    if (href.indexOf('/dashboard_unificado/index.html') >= 0) return 'HUB';
    if (href.indexOf('/Cotacoes/dashboard/MERCADO/') >= 0) return 'MERCADO';
    if (/\/controle_de_dados\.html(\?|#|$)/.test(href)) return 'CONTROLE';
    return null;
  }
  function getTargetHref(baseRoot, val) {
    var map = {
      HUB: 'dashboard_unificado/index.html',
      WDO: 'dashboard_unificado/WDO/index.html',
      WIN: 'dashboard_unificado/WIN/index.html',
      MERCADO: 'Cotacoes/dashboard/MERCADO/index.html',
      CORR: 'dashboard_unificado/correlation/index.html',
      CONTROLE: 'controle_de_dados.html',
    };
    // E44: auto-discovery: extender map com paginas customizadas
    if (window.EDI_EXTRA_DASHBOARDS && typeof window.EDI_EXTRA_DASHBOARDS === 'object') {
      Object.keys(window.EDI_EXTRA_DASHBOARDS).forEach(function (k) {
        if (!map[k]) map[k] = window.EDI_EXTRA_DASHBOARDS[k];
      });
    }
    var rel = map[val];
    if (!rel) return null;
    return baseRoot + rel;
  }
  var sel = document.getElementById('assetSelect');
  if (!sel) return;
  var current = sel.getAttribute('data-current-dashboard') || guessCurrentDashboard();
  if (current) sel.value = current;
  sel.addEventListener('change', function () {
    var base = getRootBaseHref();
    var href = getTargetHref(base, sel.value);
    if (href) window.location.href = href;
  });
})();
