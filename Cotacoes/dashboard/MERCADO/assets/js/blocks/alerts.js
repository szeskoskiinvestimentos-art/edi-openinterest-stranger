(function () {
    const w = typeof window !== 'undefined' ? window : null;
    if (!w) return;
    const root = (w.MercadoBlocks && typeof w.MercadoBlocks === 'object') ? w.MercadoBlocks : {};

    function getAlertsState() {
        const enabled = localStorage.getItem('mercado_alerts_enabled') === '1';
        const threshold = Number(localStorage.getItem('mercado_alerts_threshold_pct') || '1');
        return { enabled, threshold: Number.isFinite(threshold) ? threshold : 1 };
    }

    function setAlertsState(state) {
        localStorage.setItem('mercado_alerts_enabled', state.enabled ? '1' : '0');
        localStorage.setItem('mercado_alerts_threshold_pct', String(state.threshold));
    }

    function evaluateAlerts(data, deps) {
        const list = document.getElementById('alertsList');
        if (!list) return;
        const state = getAlertsState();

        if (!state.enabled) {
            list.innerHTML = '<p style="opacity:.8">Alertas desativados.</p>';
            return;
        }

        const threshold = Math.abs(state.threshold);
        const hits = (data.assets || [])
            .map(a => {
                const last = deps.getLastPoint(data, a.symbol);
                return { a, last, pct: deps.pointPct(last) };
            })
            .filter(x => typeof x.pct === 'number' && Number.isFinite(x.pct))
            .filter(x => Math.abs(x.pct) >= threshold)
            .sort((x, y) => Math.abs(y.pct) - Math.abs(x.pct))
            .slice(0, 12);

        if (!hits.length) {
            list.innerHTML = '<p style="opacity:.8">Nenhum alerta no momento.</p>';
            return;
        }

        const html = hits
            .map(x => {
                const pct = x.pct || 0;
                const badge = deps.toneBadgeHtml(pct, deps.formatPercent(pct), { maxAbs: 5 });
                return `
                <div style="display:flex;justify-content:space-between;gap:10px;padding:10px 12px;border:1px solid rgba(255,255,255,.12);border-radius:8px;margin-bottom:10px;background:rgba(0,0,0,.35);">
                    <div style="min-width:0;">
                        <div style="font-weight:800;letter-spacing:1px;">${x.a.symbol} <span style="opacity:.8;font-weight:600;">(${x.a.category})</span></div>
                        <div style="opacity:.85;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${x.a.name}</div>
                    </div>
                    <div style="text-align:right;min-width:130px;">
                        <div style="font-weight:900;">${badge}</div>
                        <div style="opacity:.85;font-family:'Share Tech Mono',monospace;">${deps.formatNumber(x.last.price)}</div>
                    </div>
                </div>
            `;
            })
            .join('');

        list.innerHTML = html;

        const lastNotifiedKey = 'mercado_alerts_last_notified';
        const key = `${(data.meta && data.meta.generatedAt) || ''}:${threshold}:${hits.map(h => h.a.symbol).join(',')}`;
        const prev = localStorage.getItem(lastNotifiedKey);
        if (prev !== key && 'Notification' in w && w.Notification.permission === 'granted') {
            const top = hits[0];
            const pct = top.pct || 0;
            new w.Notification('Alerta de Fluxo (MVP)', {
                body: `${top.a.symbol} ${deps.formatPercent(pct)} • ${top.a.category}`,
            });
            localStorage.setItem(lastNotifiedKey, key);
        } else {
            localStorage.setItem(lastNotifiedKey, key);
        }
    }

    function render({ data, deps } = {}) {
        const enabledInput = document.getElementById('alertsEnabled');
        const thresholdInput = document.getElementById('alertsThresholdPct');
        const requestBtn = document.getElementById('alertsRequestPermission');

        const state = getAlertsState();
        if (enabledInput) enabledInput.checked = state.enabled;
        if (thresholdInput) thresholdInput.value = String(state.threshold);

        if (enabledInput) {
            enabledInput.onchange = () => {
                setAlertsState({ ...getAlertsState(), enabled: enabledInput.checked });
                evaluateAlerts(data, deps);
            };
        }
        if (thresholdInput) {
            thresholdInput.onchange = () => {
                const val = Number(thresholdInput.value);
                setAlertsState({ ...getAlertsState(), threshold: Number.isFinite(val) ? val : 1 });
                evaluateAlerts(data, deps);
            };
        }
        if (requestBtn) {
            requestBtn.onclick = async () => {
                if (!('Notification' in w)) return;
                await w.Notification.requestPermission();
            };
        }

        evaluateAlerts(data, deps);
    }

    root.alerts = { render };
    w.MercadoBlocks = root;
})();

