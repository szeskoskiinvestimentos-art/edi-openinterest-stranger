/**
 * stale-banner.js - E37: Auto-pull snapshots quando dados estao stale
 *
 * Detecta se o `last_update` em window.marketData (ou similar) e
 * muito antigo (> 30 min). Se sim, mostra banner perguntando se
 * o usuario quer restaurar o ultimo snapshot.
 *
 * Uso:
 *   <script src="shared/stale-banner.js"></script>
 *
 * O script detecta automaticamente:
 *   - window.marketData.last_update (formato ISO ou HH:MM:SS)
 *   - .last_update text em elemento #last-update-label
 *
 * Configuravel via window.EDI_STALE_CONFIG:
 *   - maxAgeMin: idade maxima em minutos (default 30)
 *   - onRestore: callback ao clicar 'Restaurar' (default: alert placeholder)
 *   - onDismiss: callback ao clicar 'Dispensar' (default: hide)
 */
(function () {
  var CONFIG = Object.assign({
    maxAgeMin: 30,
    onRestore: null,  // se null, mostra alert
    onDismiss: null,  // se null, esconde banner
  }, window.EDI_STALE_CONFIG || {});

  function parseLastUpdate() {
    // 1) Tentar window.marketData.last_update (ISO)
    try {
      if (window.marketData && window.marketData.last_update) {
        var d = new Date(window.marketData.last_update);
        if (!isNaN(d.getTime())) return d;
      }
    } catch (e) {}

    // 2) Tentar #last-update-label (texto visivel)
    try {
      var el = document.getElementById('last-update-label');
      if (el) {
        var txt = el.textContent.trim();
        if (txt) {
          // Tenta parse HH:MM:SS
          var m = txt.match(/(\d{1,2}):(\d{2})/);
          if (m) {
            var now = new Date();
            var hh = parseInt(m[1], 10);
            var mm = parseInt(m[2], 10);
            var d2 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hh, mm);
            return d2;
          }
        }
      }
    } catch (e) {}

    return null;
  }

  function minutesSince(d) {
    if (!d) return 0;
    return (Date.now() - d.getTime()) / 60000;
  }

  function showBanner(minutesOld) {
    if (document.getElementById('edi-stale-banner')) return;

    var banner = document.createElement('div');
    banner.id = 'edi-stale-banner';
    banner.style.cssText = [
      'position: fixed',
      'top: 80px',
      'right: 20px',
      'z-index: 1500',
      'background: rgba(20, 20, 20, 0.95)',
      'border: 1px solid rgba(255, 7, 58, 0.55)',
      'border-left: 4px solid #ff073a',
      'border-radius: 8px',
      'padding: 14px 18px',
      'max-width: 380px',
      'box-shadow: 0 0 22px rgba(255, 7, 58, 0.18)',
      'font-family: "Share Tech Mono", monospace',
      'color: #e0e0e0',
      'z-index: 1500'
    ].join(';');

    banner.innerHTML = [
      '<div style="display:flex;align-items:flex-start;gap:12px;">',
      '  <div style="font-size:22px;line-height:1;">⚠️</div>',
      '  <div style="flex:1;">',
      '    <div style="font-weight:900;color:#ff073a;letter-spacing:1px;margin-bottom:6px;">DADOS DESATUALIZADOS</div>',
      '    <div style="font-size:12px;opacity:.92;line-height:1.4;">Última atualização há <b>' + Math.round(minutesOld) + ' min</b>. Restaurar último snapshot?</div>',
      '    <div style="display:flex;gap:8px;margin-top:10px;">',
      '      <button id="edi-stale-restore" style="background:rgba(0,243,255,.18);color:#00f3ff;border:1px solid #00f3ff;padding:6px 12px;border-radius:6px;font-weight:900;cursor:pointer;font-family:inherit;">RESTAURAR</button>',
      '      <button id="edi-stale-dismiss" style="background:rgba(255,255,255,.06);color:#e0e0e0;border:1px solid rgba(255,255,255,.2);padding:6px 12px;border-radius:6px;font-weight:900;cursor:pointer;font-family:inherit;">DISPENSAR</button>',
      '    </div>',
      '  </div>',
      '  <button id="edi-stale-close" style="background:transparent;color:#999;border:none;font-size:18px;cursor:pointer;line-height:1;padding:0;width:20px;height:20px;">×</button>',
      '</div>'
    ].join('');

    document.body.appendChild(banner);

    function dismiss() {
      banner.style.opacity = '0';
      banner.style.transition = 'opacity 0.3s';
      setTimeout(function () { banner.remove(); }, 300);
      if (typeof CONFIG.onDismiss === 'function') {
        try { CONFIG.onDismiss(); } catch (e) {}
      }
    }

    function restore() {
      if (typeof CONFIG.onRestore === 'function') {
        try { CONFIG.onRestore(); dismiss(); } catch (e) { dismiss(); }
      } else {
        alert('Funcionalidade de restore sera habilitada em E35 (API REST).');
        dismiss();
      }
    }

    document.getElementById('edi-stale-restore').addEventListener('click', restore);
    document.getElementById('edi-stale-dismiss').addEventListener('click', dismiss);
    document.getElementById('edi-stale-close').addEventListener('click', dismiss);
  }

  function check() {
    var lastUpdate = parseLastUpdate();
    if (!lastUpdate) return;

    var minutesOld = minutesSince(lastUpdate);
    if (minutesOld > CONFIG.maxAgeMin) {
      showBanner(minutesOld);
    }
  }

  // Verificar no load e a cada 5 min
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(check, 2000);  // pequeno delay para marketData carregar
      setInterval(check, 5 * 60000);
    });
  } else {
    setTimeout(check, 2000);
    setInterval(check, 5 * 60000);
  }
})();
