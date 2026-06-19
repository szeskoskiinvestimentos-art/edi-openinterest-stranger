(function () {
  var DASHBOARDS = [
    { val: 'HUB',      label: 'Dashboard Unificado', icon: '🏠', path: 'dashboard_unificado/index.html' },
    { val: 'WDO',      label: 'WDO',                 icon: '💱', path: 'dashboard_unificado/WDO/index.html' },
    { val: 'WIN',      label: 'WIN',                 icon: '📈', path: 'dashboard_unificado/WIN/index.html' },
    { val: 'MERCADO',  label: 'Cotações',            icon: '🧾', path: 'Cotacoes/dashboard/MERCADO/index.html' },
    { val: 'CORR',     label: 'Correlações',         icon: '🧠', path: 'dashboard_unificado/correlation/index.html' },
    { val: 'CONTROLE', label: 'Controle de Dados',   icon: '🛰️', path: 'dashboard_unificado/controle/index.html' },
  ];

  function getRootBaseHref() {
    var href = window.location.href;
    var idx = href.indexOf('/dashboard_unificado/');
    if (idx >= 0) return href.slice(0, idx) + '/';
    idx = href.indexOf('/Cotacoes/');
    if (idx >= 0) return href.slice(0, idx) + '/';
    return href.replace(/\/[^\/?#]+(\?|#|$).*/, '/');
  }

  function guessCurrentDashboard() {
    var href = window.location.href;
    if (href.indexOf('/dashboard_unificado/WDO/') >= 0) return 'WDO';
    if (href.indexOf('/dashboard_unificado/WIN/') >= 0) return 'WIN';
    if (href.indexOf('/dashboard_unificado/correlation/') >= 0) return 'CORR';
    if (href.indexOf('/dashboard_unificado/controle/') >= 0) return 'CONTROLE';
    if (href.indexOf('/dashboard_unificado/index.html') >= 0) return 'HUB';
    if (href.indexOf('/dashboard_unificado/') >= 0) return 'HUB';
    if (href.indexOf('/Cotacoes/dashboard/MERCADO/') >= 0) return 'MERCADO';
    return null;
  }

  function getTargetHref(baseRoot, val) {
    var entry = DASHBOARDS.find(function (d) { return d.val === val; });
    if (!entry) return null;
    return baseRoot + entry.path;
  }

  function isActive(val, current) {
    return val === current;
  }

  /* ── Select dropdown handler ────────────────────────────── */
  var sel = document.getElementById('assetSelect');
  var current = (sel && sel.getAttribute('data-current-dashboard')) || guessCurrentDashboard();
  if (sel && current) sel.value = current;
  if (sel) {
    sel.addEventListener('change', function () {
      var base = getRootBaseHref();
      var href = getTargetHref(base, sel.value);
      if (href) window.location.href = href;
    });
  }

  /* ── Quick Nav panel (auto-inject if not present) ──────── */
  if (document.getElementById('ediQuickNav')) return;

  var CSS = '\
    .edi-qn-overlay{position:fixed;inset:0;background:rgba(0,0,0,.55);backdrop-filter:blur(2px);z-index:1200;opacity:0;pointer-events:none;transition:opacity .18s ease}\
    .edi-qn-overlay.is-open{opacity:1;pointer-events:auto}\
    .edi-qn{position:fixed;top:0;right:0;width:min(400px,calc(100vw - 24px));height:100vh;background:linear-gradient(180deg,rgba(10,10,16,.98),rgba(8,8,12,.96));border-left:1px solid rgba(0,243,255,.18);box-shadow:-10px 0 40px rgba(0,0,0,.45);z-index:1201;transform:translateX(105%);transition:transform .22s ease;display:flex;flex-direction:column}\
    .edi-qn.is-open{transform:translateX(0)}\
    .edi-qn__head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:14px 14px 10px;border-bottom:1px solid rgba(255,255,255,.08)}\
    .edi-qn__title{font-family:Orbitron,sans-serif;font-weight:900;letter-spacing:2px;font-size:13px;color:rgba(0,243,255,.92)}\
    .edi-qn__close{background:rgba(0,0,0,.18);color:#e0e0e0;border:1px solid rgba(255,255,255,.14);padding:7px 10px;border-radius:10px;font-weight:900;cursor:pointer}\
    .edi-qn__close:hover{border-color:rgba(0,243,255,.45);color:rgba(0,243,255,.95)}\
    .edi-qn__body{padding:12px 14px 16px;overflow:auto;flex:1}\
    .edi-qn__search{margin-bottom:12px}\
    .edi-qn__search input{width:100%;background:#141414;color:#e0e0e0;border:1px solid rgba(255,255,255,.14);padding:10px 12px;border-radius:12px;font-weight:800;outline:none;box-sizing:border-box}\
    .edi-qn__search input:focus{border-color:rgba(0,243,255,.55);box-shadow:0 0 0 3px rgba(0,243,255,.12)}\
    .edi-qn__list{display:flex;flex-direction:column;gap:8px}\
    .edi-qn__item{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px 14px;border-radius:12px;border:1px solid rgba(255,255,255,.10);background:rgba(0,0,0,.22);text-decoration:none;color:#e0e0e0;font-weight:900;letter-spacing:.3px;transition:transform .12s ease,border-color .12s ease,background .12s ease}\
    .edi-qn__item:hover{transform:translateY(-1px);border-color:rgba(0,243,255,.35);background:rgba(0,243,255,.08)}\
    .edi-qn__item.is-active{border-color:rgba(0,243,255,.55);background:rgba(0,243,255,.12);color:rgba(0,243,255,.95);box-shadow:0 0 18px rgba(0,243,255,.12)}\
    .edi-qn__item-label{display:flex;align-items:center;gap:10px;min-width:0}\
    .edi-qn__item-icon{font-size:18px;flex:0 0 auto}\
    .edi-qn__item-name{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\
    .edi-qn__item-pill{font-size:11px;opacity:.7;border:1px solid rgba(255,255,255,.12);padding:4px 8px;border-radius:999px;background:rgba(0,0,0,.20);white-space:nowrap}\
    .edi-qn__hint{margin-top:14px;text-align:center;opacity:.5;font-size:11px;font-weight:700;letter-spacing:.5px}\
    .edi-qn__trigger{position:fixed;bottom:20px;right:20px;width:48px;height:48px;border-radius:999px;background:rgba(10,10,16,.92);border:1px solid rgba(0,243,255,.28);color:rgba(0,243,255,.92);font-size:20px;font-weight:900;cursor:pointer;z-index:1199;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(0,0,0,.4);transition:border-color .15s,box-shadow .15s}\
    .edi-qn__trigger:hover{border-color:rgba(0,243,255,.55);box-shadow:0 0 24px rgba(0,243,255,.15)}\
  ';

  var style = document.createElement('style');
  style.textContent = CSS;
  document.head.appendChild(style);

  var overlay = document.createElement('div');
  overlay.className = 'edi-qn-overlay';
  overlay.id = 'ediQuickNavOverlay';
  document.body.appendChild(overlay);

  var panel = document.createElement('aside');
  panel.className = 'edi-qn';
  panel.id = 'ediQuickNav';
  panel.setAttribute('aria-hidden', 'true');
  panel.innerHTML =
    '<div class="edi-qn__head">' +
      '<div class="edi-qn__title">NAVEGAÇÃO</div>' +
      '<button class="edi-qn__close" type="button" aria-label="Fechar">Fechar</button>' +
    '</div>' +
    '<div class="edi-qn__body">' +
      '<div class="edi-qn__search"><input type="text" inputmode="search" autocomplete="off" placeholder="Buscar dashboard..." aria-label="Buscar dashboard" /></div>' +
      '<div class="edi-qn__list"></div>' +
      '<div class="edi-qn__hint">Ctrl+K para abrir · Esc para fechar</div>' +
    '</div>';
  document.body.appendChild(panel);

  var trigger = document.createElement('button');
  trigger.className = 'edi-qn__trigger';
  trigger.type = 'button';
  trigger.setAttribute('aria-label', 'Abrir navegação');
  trigger.textContent = '☰';
  document.body.appendChild(trigger);

  var qnList = panel.querySelector('.edi-qn__list');
  var searchInput = panel.querySelector('input');
  var closeBtn = panel.querySelector('.edi-qn__close');

  function renderList(filter) {
    var f = (filter || '').toLowerCase();
    var base = getRootBaseHref();
    var html = '';
    DASHBOARDS.forEach(function (d) {
      if (f && d.label.toLowerCase().indexOf(f) < 0 && d.val.toLowerCase().indexOf(f) < 0) return;
      var active = isActive(d.val, current);
      var cls = 'edi-qn__item' + (active ? ' is-active' : '');
      html += '<a class="' + cls + '" href="' + base + d.path + '">' +
        '<span class="edi-qn__item-label">' +
          '<span class="edi-qn__item-icon">' + d.icon + '</span>' +
          '<span class="edi-qn__item-name">' + d.label + '</span>' +
        '</span>' +
        '<span class="edi-qn__item-pill">' + d.val + '</span>' +
      '</a>';
    });
    qnList.innerHTML = html || '<div class="edi-qn__hint">Nenhum resultado</div>';
  }

  function openQN() {
    renderList('');
    searchInput.value = '';
    overlay.classList.add('is-open');
    panel.classList.add('is-open');
    panel.setAttribute('aria-hidden', 'false');
    setTimeout(function () { searchInput.focus(); }, 100);
  }
  function closeQN() {
    overlay.classList.remove('is-open');
    panel.classList.remove('is-open');
    panel.setAttribute('aria-hidden', 'true');
  }

  trigger.addEventListener('click', openQN);
  closeBtn.addEventListener('click', closeQN);
  overlay.addEventListener('click', closeQN);
  searchInput.addEventListener('input', function () { renderList(searchInput.value); });

  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); openQN(); }
    if (e.key === 'Escape' && panel.classList.contains('is-open')) { closeQN(); }
  });

  renderList('');
})();
