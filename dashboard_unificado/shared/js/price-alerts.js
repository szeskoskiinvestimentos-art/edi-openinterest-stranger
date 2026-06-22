(function (root) {
  'use strict';

  var cfg = {
    thresholdPct: 2.0,
    maxAlerts: 3,
    soundEnabled: true,
    autoDismissMs: 10000,
  };
  if (root.EDI_PRICE_ALERTS_CONFIG) {
    var user = root.EDI_PRICE_ALERTS_CONFIG;
    if (user.thresholdPct != null) cfg.thresholdPct = user.thresholdPct;
    if (user.maxAlerts != null) cfg.maxAlerts = user.maxAlerts;
    if (user.soundEnabled != null) cfg.soundEnabled = user.soundEnabled;
    if (user.autoDismissMs != null) cfg.autoDismissMs = user.autoDismissMs;
  }

  var _source = 'marketData';
  var _levels = [];
  var _dedup = {};
  var _dedupMs = 300000;
  var _activeBanners = 0;
  var _audioCtx = null;

  function _getMarketData() {
    if (_source === 'marketQuotes') return _extractFromMarketQuotes();
    return _extractFromMarketData();
  }

  function _extractFromMarketData() {
    var md = root.marketData;
    if (!md) return null;
    var spot = md.spot_price
      || (md.overview && md.overview.spot_price)
      || (md.overview_baseline && md.overview_baseline.spot_price);
    if (!spot || spot <= 0) return null;
    var levels = [];
    var mp = (md.overview && md.overview.max_pain)
      || (md.v3_data && md.v3_data.max_pain_profile && md.v3_data.max_pain_profile.level);
    if (mp) levels.push({ type: 'max_pain', value: mp });
    var gf = md.v3_data && md.v3_data.gamma_flip_cone && md.v3_data.gamma_flip_cone.flip_level;
    if (gf) levels.push({ type: 'gamma_flip', value: gf });
    var kl = md.key_levels;
    if (kl) {
      (kl.resistance || []).forEach(function (v) { levels.push({ type: 'resistance', value: v }); });
      (kl.support || []).forEach(function (v) { levels.push({ type: 'support', value: v }); });
    }
    return { spot: spot, levels: levels };
  }

  function _extractFromMarketQuotes() {
    var mq = root.MARKET_QUOTES_DATA;
    if (!mq || !mq.assets) return null;
    var assets = mq.assets.items || mq.assets;
    if (!Array.isArray(assets)) return null;
    var best = null;
    assets.forEach(function (a) {
      var pct = Math.abs(a.pct || 0);
      if (pct > 0.5 && (!best || pct > Math.abs(best.pct || 0))) best = a;
    });
    if (!best) return null;
    var spot = best.last || best.price || 0;
    if (spot <= 0) return null;
    var levels = [];
    if (best.prevClose) levels.push({ type: 'prev_close', value: best.prevClose });
    if (best.dayHigh) levels.push({ type: 'day_high', value: best.dayHigh });
    if (best.dayLow) levels.push({ type: 'day_low', value: best.dayLow });
    return { spot: spot, levels: levels };
  }

  function _initLevels(opts) {
    _levels = [];
    if (opts.max_pain != null) _levels.push({ type: 'max_pain', value: opts.max_pain });
    if (opts.gamma_flip != null) _levels.push({ type: 'gamma_flip', value: opts.gamma_flip });
    if (opts.walls && Array.isArray(opts.walls)) {
      opts.walls.forEach(function (w) {
        _levels.push({ type: w.type || 'wall', value: w.price });
      });
    }
  }

  function _detectFromLevels(spot, levels) {
    if (!spot || !levels || !levels.length) return [];
    var alerts = [];
    var now = Date.now();
    var storage = null;
    try { storage = root.localStorage; } catch (e) {}
    levels.forEach(function (lv) {
      var distPct = Math.abs(spot - lv.value) / spot * 100;
      if (distPct < cfg.thresholdPct) {
        var key = lv.type + ':' + lv.value;
        var lastTime = 0;
        if (storage) {
          try { lastTime = parseInt(storage.getItem('edi_pa_' + key) || '0', 10); } catch (e) {}
        }
        if (lastTime && (now - lastTime) < _dedupMs) return;
        if (storage) {
          try { storage.setItem('edi_pa_' + key, String(now)); } catch (e) {}
        }
        _dedup[key] = now;
        alerts.push({
          type: lv.type,
          level: lv.type,
          price: lv.value,
          spot: spot,
          distancePct: distPct.toFixed(2),
        });
      }
    });
    return alerts;
  }

  function _beep() {
    if (!cfg.soundEnabled) return;
    try {
      var AC = root.AudioContext || root.webkitAudioContext;
      if (!AC) return;
      if (!_audioCtx) _audioCtx = new AC();
      var osc = _audioCtx.createOscillator();
      var gain = _audioCtx.createGain();
      osc.connect(gain);
      gain.connect(_audioCtx.destination);
      osc.frequency.value = 800;
      osc.type = 'sine';
      gain.gain.value = 0.3;
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.001, _audioCtx.currentTime + 0.2);
      osc.stop(_audioCtx.currentTime + 0.25);
    } catch (e) {}
  }

  function _fmt(v) {
    if (v >= 1000) return v.toLocaleString('pt-BR', { maximumFractionDigits: 0 });
    return v.toFixed(2);
  }

  function _showBanner(alert) {
    if (!root.document) return;
    if (_activeBanners >= cfg.maxAlerts) return;
    _activeBanners++;
    _beep();
    var el = root.document.createElement('div');
    el.className = 'edi-price-alert-banner';
    el.style.cssText = [
      'position:fixed',
      'top:' + (10 + (_activeBanners - 1) * 70) + 'px',
      'left:50%',
      'transform:translateX(-50%) translateY(-100%)',
      'z-index:1600',
      'background:rgba(255,7,58,0.92)',
      'color:#fff',
      'font-family:"Share Tech Mono",monospace',
      'font-size:14px',
      'padding:14px 24px',
      'border-radius:8px',
      'border:1px solid rgba(255,7,58,1)',
      'box-shadow:0 0 20px rgba(255,7,58,0.5)',
      'display:flex',
      'align-items:center',
      'gap:12px',
      'transition:transform 0.3s ease',
      'white-space:nowrap',
    ].join(';');
    var distColor = parseFloat(alert.distancePct) < 0.15 ? '#ffcc00' : '#fff';
    el.innerHTML =
      '<span style="font-size:18px">\u26A0</span>' +
      '<span>PRE\u00c7O PR\u00d3XIMO: <strong>' + alert.level + ' ' + _fmt(alert.price) + '</strong></span>' +
      '<span style="color:' + distColor + '">(' + alert.distancePct + '%)</span>' +
      '<button style="background:rgba(255,255,255,0.2);border:1px solid rgba(255,255,255,0.4);color:#fff;padding:4px 10px;border-radius:4px;cursor:pointer;font-family:inherit;font-size:12px" onclick="this.parentElement.remove()">Dispensar</button>';
    root.document.body.appendChild(el);
    root.requestAnimationFrame(function () {
      el.style.transform = 'translateX(-50%) translateY(0)';
    });
    setTimeout(function () {
      if (el.parentElement) {
        el.style.transform = 'translateX(-50%) translateY(-100%)';
        setTimeout(function () { if (el.parentElement) el.remove(); _activeBanners--; }, 350);
      }
    }, cfg.autoDismissMs);
  }

  function init(opts) {
    if (!opts) return;
    if (opts.max_pain != null || opts.gamma_flip != null || opts.walls) {
      _initLevels(opts);
    }
    if (opts.source) _source = opts.source;
    if (root.document) {
      if (root.document.readyState === 'loading') {
        root.document.addEventListener('DOMContentLoaded', function () { setTimeout(check, 1000); });
      } else {
        setTimeout(check, 1000);
      }
    }
  }

  function check(spotOrNothing) {
    if (typeof spotOrNothing === 'number' && spotOrNothing > 0) {
      return _detectFromLevels(spotOrNothing, _levels);
    }
    var data = _getMarketData();
    if (!data) return [];
    var allLevels = _levels.length > 0 ? _levels : data.levels;
    var alerts = _detectFromLevels(data.spot, allLevels);
    alerts.forEach(_showBanner);
    return alerts;
  }

  function clear() {
    if (!root.document) return;
    var banners = root.document.querySelectorAll('.edi-price-alert-banner');
    banners.forEach(function (b) { b.remove(); });
    _activeBanners = 0;
  }

  var api = { init: init, check: check, clear: clear };
  var EDI = { priceAlerts: api };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { EDI: EDI };
  }
  root.EDI = EDI;

})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
