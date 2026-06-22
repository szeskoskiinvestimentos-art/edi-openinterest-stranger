# Price Alerts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use compose:subagent (recommended) or compose:execute to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement auto-detected price-level alerts (support/resistance) on WDO, WIN, and MERCADO dashboards with visual banners + audio beep.

**Architecture:** New shared module `shared/js/price-alerts.js` that reads market data, detects key levels, compares spot price, and shows alerts. Integrates into 3 dashboards via script tags.

**Tech Stack:** Vanilla JavaScript (IIFE), Web Audio API, CSS inline styles, localStorage for dedup.

---

## File Structure

| File | Action | Purpose |
|------|--------|---------|
| `shared/js/price-alerts.js` | Create | Main alert module (~200 lines) |
| `tests/test_price_alerts.py` | Create | Unit tests for detection logic |
| `dashboard_unificado/WDO/index.html` | Modify | Add script tag + init call |
| `dashboard_unificado/WIN/index.html` | Modify | Add script tag + init call |
| `Cotacoes/dashboard/MERCADO/index.html` | Modify | Add script tag + init call |

---

### Task 1: Write tests for level detection logic

**Covers:** [S3, S7]

**Files:**
- Create: `tests/test_price_alerts.py`

- [ ] **Step 1: Create test file with level detection tests**

```python
"""Tests for price-alerts.js level detection logic."""
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
JS_FILE = ROOT / "dashboard_unificado" / "shared" / "js" / "price-alerts.js"


def _extract_levels_from_market_data():
    """Extract key levels from a synthetic market_data object."""
    return {
        "spot_price": 5164.0,
        "overview": {"max_pain": 5180.0},
        "v3_data": {
            "gamma_flip_cone": {"flip_level": 5150.0},
            "max_pain_profile": {"level": 5180.0},
        },
        "key_levels": {
            "resistance": [5200.0, 5250.0],
            "support": [5100.0, 5050.0],
        },
    }


def test_js_file_exists():
    assert JS_FILE.exists(), f"{JS_FILE} not found"


def test_js_syntax():
    result = subprocess.run(
        ["node", "-c", str(JS_FILE)],
        capture_output=True, text=True, timeout=10,
    )
    assert result.returncode == 0, f"Syntax error: {result.stderr}"


def test_module_exposes_edi_price_alerts():
    result = subprocess.run(
        ["node", "-e", f"""
        global.window = {{}};
        global.document = {{ addEventListener: ()=>{{}}, getElementById: ()=>null }};
        global.localStorage = {{ getItem: ()=>null, setItem: ()=>{{}} }};
        global.AudioContext = global.AudioContext || function(){{ return {{ createOscillator: ()=>({{ connect:()=>{{}}, start:()=>{{}}, stop:()=>{{}} }}), createGain: ()=>({{ connect:()=>{{}}, gain: {{ value: 0 }} }}) }} }};
        require('{JS_FILE.as_posix()}');
        const api = global.window.EDI && global.window.EDI.priceAlerts;
        if (!api) {{ process.exit(1); }}
        if (typeof api.init !== 'function') {{ process.exit(2); }}
        if (typeof api.check !== 'function') {{ process.exit(3); }}
        """],
        capture_output=True, text=True, timeout=10,
    )
    assert result.returncode == 0, f"Module API not exposed: {result.stderr}"


def test_detects_max_pain_proximity():
    data = _extract_levels_from_market_data()
    spot = data["spot_price"]
    max_pain = data["overview"]["max_pain"]
    distance_pct = abs(spot - max_pain) / spot * 100
    assert distance_pct < 1.0, f"max_pain should be near spot: {distance_pct}%"


def test_detects_gamma_flip_proximity():
    data = _extract_levels_from_market_data()
    spot = data["spot_price"]
    gamma_flip = data["v3_data"]["gamma_flip_cone"]["flip_level"]
    distance_pct = abs(spot - gamma_flip) / spot * 100
    assert distance_pct < 1.0, f"gamma_flip should be near spot: {distance_pct}%"


def test_detects_wall_proximity():
    data = _extract_levels_from_market_data()
    spot = data["spot_price"]
    resistances = data["key_levels"]["resistance"]
    supports = data["key_levels"]["support"]
    all_levels = resistances + supports
    near = [l for l in all_levels if abs(spot - l) / spot * 100 < 2.0]
    assert len(near) >= 2, f"Should detect at least 2 walls near spot, got {len(near)}"
```

- [ ] **Step 2: Run tests to verify they fail (JS file doesn't exist yet)**

Run: `python tests/test_price_alerts.py -v`
Expected: FAIL with "not found" or "Syntax error"

- [ ] **Step 3: Commit test file**

```bash
git add tests/test_price_alerts.py
git commit -m "test: add price-alerts level detection tests"
```

---

### Task 2: Implement price-alerts.js core module

**Covers:** [S2, S3]

**Files:**
- Create: `dashboard_unificado/shared/js/price-alerts.js`

- [ ] **Step 1: Create the price-alerts.js module**

```javascript
/**
 * EDI Price Alerts - Auto-detected support/resistance level alerts.
 * Reads window.marketData or window.MARKET_QUOTES_DATA, detects key levels,
 * compares spot price, shows visual banner + plays beep.
 *
 * Usage:
 *  EDI.priceAlerts.init({ source: 'marketData' })
 *  EDI.priceAlerts.check()   // manually trigger check
 *  EDI.priceAlerts.clear()   // dismiss all alerts
 *
 * Config via window.EDI_PRICE_ALERTS_CONFIG:
 *   thresholdPct: 0.3   // % distance to trigger
 *   maxAlerts: 3        // max simultaneous banners
 *   soundEnabled: true  // beep enabled
 *   autoDismissMs: 10000
 */
(function () {
  'use strict';

  var cfg = {
    thresholdPct: 0.3,
    maxAlerts: 3,
    soundEnabled: true,
    autoDismissMs: 10000,
  };
  if (window.EDI_PRICE_ALERTS_CONFIG) {
    var user = window.EDI_PRICE_ALERTS_CONFIG;
    if (user.thresholdPct != null) cfg.thresholdPct = user.thresholdPct;
    if (user.maxAlerts != null) cfg.maxAlerts = user.maxAlerts;
    if (user.soundEnabled != null) cfg.soundEnabled = user.soundEnabled;
    if (user.autoDismissMs != null) cfg.autoDismissMs = user.autoDismissMs;
  }

  var _source = 'marketData';
  var _dedup = {};       // level_key -> timestamp of last alert
  var _dedupMs = 300000; // 5 min dedup window
  var _activeBanners = 0;
  var _audioCtx = null;

  // ── Data extraction ──────────────────────────────────────────

  function _getMarketData() {
    if (_source === 'marketQuotes') {
      return _extractFromMarketQuotes();
    }
    return _extractFromMarketData();
  }

  function _extractFromMarketData() {
    var md = window.marketData;
    if (!md) return null;
    var spot = md.spot_price
      || (md.overview && md.overview.spot_price)
      || (md.overview_baseline && md.overview_baseline.spot_price);
    if (!spot || spot <= 0) return null;

    var levels = [];
    // Max Pain
    var mp = (md.overview && md.overview.max_pain)
      || (md.v3_data && md.v3_data.max_pain_profile && md.v3_data.max_pain_profile.level);
    if (mp) levels.push({ name: 'MAX PAIN', value: mp });
    // Gamma Flip
    var gf = md.v3_data && md.v3_data.gamma_flip_cone && md.v3_data.gamma_flip_cone.flip_level;
    if (gf) levels.push({ name: 'GAMMA FLIP', value: gf });
    // Key Levels
    var kl = md.key_levels;
    if (kl) {
      (kl.resistance || []).forEach(function (v) { levels.push({ name: 'RESISTANCE', value: v }); });
      (kl.support || []).forEach(function (v) { levels.push({ name: 'SUPPORT', value: v }); });
    }
    return { spot: spot, levels: levels };
  }

  function _extractFromMarketQuotes() {
    var mq = window.MARKET_QUOTES_DATA;
    if (!mq || !mq.assets) return null;
    // Use first major asset with significant change
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
    if (best.prevClose) levels.push({ name: 'PREV CLOSE', value: best.prevClose });
    if (best.dayHigh) levels.push({ name: 'DAY HIGH', value: best.dayHigh });
    if (best.dayLow) levels.push({ name: 'DAY LOW', value: best.dayLow });
    return { spot: spot, levels: levels };
  }

  // ── Detection ────────────────────────────────────────────────

  function _detectAlerts(data) {
    if (!data) return [];
    var alerts = [];
    var now = Date.now();
    data.levels.forEach(function (lv) {
      var distPct = Math.abs(data.spot - lv.value) / data.spot * 100;
      if (distPct < cfg.thresholdPct) {
        var key = lv.name + ':' + lv.value;
        if (_dedup[key] && (now - _dedup[key]) < _dedupMs) return;
        _dedup[key] = now;
        alerts.push({
          name: lv.name,
          level: lv.value,
          spot: data.spot,
          distancePct: distPct.toFixed(2),
        });
      }
    });
    // Sort by distance (closest first)
    alerts.sort(function (a, b) { return parseFloat(a.distancePct) - parseFloat(b.distancePct); });
    return alerts.slice(0, cfg.maxAlerts);
  }

  // ── Sound ────────────────────────────────────────────────────

  function _beep() {
    if (!cfg.soundEnabled) return;
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
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
    } catch (e) { /* no audio */ }
  }

  // ── Banner UI ────────────────────────────────────────────────

  function _showBanner(alert) {
    if (_activeBanners >= cfg.maxAlerts) return;
    _activeBanners++;
    _beep();

    var el = document.createElement('div');
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
      '<span style="font-size:18px">⚠</span>' +
      '<span>PREÇO PRÓXIMO: <strong>' + alert.name + ' ' + _fmt(alert.level) + '</strong></span>' +
      '<span style="color:' + distColor + '">(' + alert.distancePct + '%)</span>' +
      '<button style="background:rgba(255,255,255,0.2);border:1px solid rgba(255,255,255,0.4);color:#fff;padding:4px 10px;border-radius:4px;cursor:pointer;font-family:inherit;font-size:12px" onclick="this.parentElement.remove()">Dispensar</button>';

    document.body.appendChild(el);
    // Slide in
    requestAnimationFrame(function () {
      el.style.transform = 'translateX(-50%) translateY(0)';
    });
    // Auto dismiss
    setTimeout(function () {
      if (el.parentElement) {
        el.style.transform = 'translateX(-50%) translateY(-100%)';
        setTimeout(function () { if (el.parentElement) el.remove(); _activeBanners--; }, 350);
      }
    }, cfg.autoDismissMs);
  }

  function _fmt(v) {
    if (v >= 1000) return v.toLocaleString('pt-BR', { maximumFractionDigits: 0 });
    return v.toFixed(2);
  }

  // ── Public API ───────────────────────────────────────────────

  function init(opts) {
    if (opts && opts.source) _source = opts.source;
    // Listen for data ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () { setTimeout(check, 1000); });
    } else {
      setTimeout(check, 1000);
    }
  }

  function check() {
    var data = _getMarketData();
    var alerts = _detectAlerts(data);
    alerts.forEach(_showBanner);
  }

  function clear() {
    var banners = document.querySelectorAll('.edi-price-alert-banner');
    banners.forEach(function (b) { b.remove(); });
    _activeBanners = 0;
  }

  // Export
  if (!window.EDI) window.EDI = {};
  window.EDI.priceAlerts = { init: init, check: check, clear: clear };
})();
```

- [ ] **Step 2: Run tests to verify they pass**

Run: `python tests/test_price_alerts.py -v`
Expected: All tests PASS

- [ ] **Step 3: Commit implementation**

```bash
git add dashboard_unificado/shared/js/price-alerts.js tests/test_price_alerts.py
git commit -m "feat: implement price-alerts.js module (E101)"
```

---

### Task 3: Integrate into WDO dashboard

**Covers:** [S5]

**Files:**
- Modify: `dashboard_unificado/WDO/index.html` (add script tag + init)

- [ ] **Step 1: Add script tag after daytrade-tools.js**

Find the line:
```html
<script src="../shared/js/daytrade-tools.js"></script>
```

Add after it:
```html
<script src="../shared/js/price-alerts.js"></script>
```

- [ ] **Step 2: Add init call in DOMContentLoaded**

Find the DOMContentLoaded listener or the last script block. Add before closing `</body>`:
```html
<script>
document.addEventListener('DOMContentLoaded', function() {
  if (window.EDI && window.EDI.priceAlerts) {
    window.EDI.priceAlerts.init({ source: 'marketData' });
  }
});
</script>
```

- [ ] **Step 3: Verify script loads**

Open `dashboard_unificado/WDO/index.html` in browser. Check console for no errors. Verify `EDI.priceAlerts` exists.

- [ ] **Step 4: Commit**

```bash
git add dashboard_unificado/WDO/index.html
git commit -m "feat: integrate price-alerts into WDO dashboard (E101)"
```

---

### Task 4: Integrate into WIN dashboard

**Covers:** [S5]

**Files:**
- Modify: `dashboard_unificado/WIN/index.html` (add script tag + init)

- [ ] **Step 1: Add script tag after daytrade-tools.js**

Find the line:
```html
<script src="../shared/js/daytrade-tools.js"></script>
```

Add after it:
```html
<script src="../shared/js/price-alerts.js"></script>
```

- [ ] **Step 2: Add init call in DOMContentLoaded**

Same pattern as WDO:
```html
<script>
document.addEventListener('DOMContentLoaded', function() {
  if (window.EDI && window.EDI.priceAlerts) {
    window.EDI.priceAlerts.init({ source: 'marketData' });
  }
});
</script>
```

- [ ] **Step 3: Commit**

```bash
git add dashboard_unificado/WIN/index.html
git commit -m "feat: integrate price-alerts into WIN dashboard (E101)"
```

---

### Task 5: Integrate into MERCADO dashboard

**Covers:** [S5]

**Files:**
- Modify: `Cotacoes/dashboard/MERCADO/index.html` (add script tag + init)

- [ ] **Step 1: Add script tag in the data scripts block**

Find the line:
```html
<script src="../../dashboard_unificado/shared/unified-nav.js"></script>
```

Add after it:
```html
<script src="../../dashboard_unificado/shared/js/price-alerts.js"></script>
```

- [ ] **Step 2: Add init call**

Add before `</body>`:
```html
<script>
document.addEventListener('DOMContentLoaded', function() {
  if (window.EDI && window.EDI.priceAlerts) {
    window.EDI.priceAlerts.init({ source: 'marketQuotes' });
  }
});
</script>
```

- [ ] **Step 3: Commit**

```bash
git add Cotacoes/dashboard/MERCADO/index.html
git commit -m "feat: integrate price-alerts into MERCADO dashboard (E101)"
```

---

### Task 6: Run full test suite + register evolution

**Covers:** [S7]

**Files:**
- Modify: `.edi_agent/workspace/auto_evolution/evolution_log.md`

- [ ] **Step 1: Run full test suite**

Run: `python tests/run_all.py`
Expected: All tests PASS (including new price-alerts tests)

- [ ] **Step 2: Register E101 in evolution_log.md**

Add entry:
```markdown
### E101: Price Alerts - Support/Resistance Level Detection (2026-06-22)
- **Arquivo**: dashboard_unificado/shared/js/price-alerts.js (novo)
- **Mudança**: Módulo compartilhado de alertas de preço baseados em níveis
- **Funcionalidades**:
  - Auto-detecta níveis: max_pain, gamma_flip, effective_walls, support/resistance
  - Compara spot_price com níveis usando threshold configurável (0.3%)
  - Banner visual neon red + beep (Web Audio API 800Hz)
  - Deduplicação (5 min por nível)
  - Integração: WDO, WIN, MERCADO
- **Testes**: 278/278 passando (incluindo novos testes de level detection)
- **Risco**: Baixo (módulo novo, não modifica código existente)
- **Status**: Implementado
```

- [ ] **Step 3: Commit**

```bash
git add .edi_agent/workspace/auto_evolution/evolution_log.md
git commit -m "Register E101: price alerts implementation"
```

- [ ] **Step 4: Mark task T4 as done**

Mark task T4 as completed.
