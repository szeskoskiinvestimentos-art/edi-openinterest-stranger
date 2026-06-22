# Price Alerts Design Spec

## [S1] Problem

Traders need visual + audio alerts when price approaches key levels (max_pain, gamma_flip, effective_walls). Currently, no automated price-level alerts exist on WDO/WIN/MERCADO dashboards.

## [S2] Solution Overview

New shared module `shared/js/price-alerts.js` that:
- Auto-detects key levels from existing `window.marketData` (WDO/WIN) and `window.MARKET_QUOTES_DATA` (MERCADO)
- Compares spot_price against levels with configurable threshold
- Shows visual banner + plays beep sound when alert triggers
- Works across WDO, WIN, and MERCADO dashboards

## [S3] Architecture

**Module**: `shared/js/price-alerts.js` (IIFE, ~200 lines)

**Data sources**:
- WDO/WIN: `window.marketData` → `spot_price`, `overview.max_pain`, `v3_data.gamma_flip_cone`, `key_levels`
- MERCADO: `window.MARKET_QUOTES_DATA` → assets with significant price changes

**Detection logic**:
1. Extract spot_price from data source
2. Extract key levels (max_pain, gamma_flip, walls, support/resistance)
3. For each level: calculate `abs(spot - level) / spot * 100`
4. If distance < thresholdPct → trigger alert
5. Deduplicate: don't re-alert same level within 5 minutes

## [S4] UI Design

**Banner** (fixed, top-center, z-index: 1600):
- Background: `rgba(255,7,58,0.9)` (neon red)
- Text: white, Share Tech Mono font
- Animation: slide-down + pulse
- Auto-dismiss: 10 seconds (configurable)
- Max 3 simultaneous alerts (queue system)

**Sound**: Web Audio API OscillatorNode, 800Hz, 200ms beep

**Format**: "PREÇO PRÓXIMO: {LEVEL_NAME} {LEVEL_VALUE} (dist: {DISTANCE}%)"

## [S5] Integration

**WDO/WIN**:
- Add `<script src="../shared/js/price-alerts.js">` after daytrade-tools.js
- Call `EDI.priceAlerts.init({ source: 'marketData' })` on DOMContentLoaded

**MERCADO**:
- Add `<script src="../../dashboard_unificado/shared/js/price-alerts.js">`
- Call `EDI.priceAlerts.init({ source: 'marketQuotes' })`

**Configuration** (optional, via `window.EDI_PRICE_ALERTS_CONFIG`):
```js
{
  thresholdPct: 0.3,     // % distance to trigger
  maxAlerts: 3,          // max simultaneous banners
  soundEnabled: true,    // beep enabled
  autoDismissMs: 10000   // auto-dismiss after 10s
}
```

## [S6] Error Handling

- If data source unavailable → silent no-op (no errors)
- If Web Audio API unavailable → visual only (no sound)
- If multiple levels trigger simultaneously → queue, show max 3
- If same level re-triggers within 5 min → deduplicate

## [S7] Testing

- Unit test: level detection logic (spot vs levels)
- Unit test: deduplication (same level within 5 min)
- Integration test: banner renders correctly
- Integration test: sound plays without errors
- Manual test: open WDO dashboard, verify alerts appear near key levels
