(function () {
    const w = typeof window !== 'undefined' ? window : null;
    if (!w) return;

    function bindOperationalBriefingUi({
        operationalTuning,
        renderOperationalBriefing,
        renderBtcOperationalBriefing,
        renderHk50OperationalBriefing,
    } = {}) {
        if (!operationalTuning || typeof operationalTuning !== 'object') return;
        if (typeof document === 'undefined') return;

        const toggle = document.getElementById('opTuningToggle');
        const panel = document.getElementById('opTuningPanel');
        const persistTuning = () => {
            try {
                localStorage.setItem('mercado_operational_tuning_v1', JSON.stringify(operationalTuning));
            } catch {
            }
        };
        if (toggle && panel) {
            toggle.addEventListener('click', () => {
                panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
            });
        }

        const rerenderAll = () => {
            try { if (typeof renderOperationalBriefing === 'function') renderOperationalBriefing(); } catch { }
            try { if (typeof renderBtcOperationalBriefing === 'function') renderBtcOperationalBriefing(); } catch { }
            try { if (typeof renderHk50OperationalBriefing === 'function') renderHk50OperationalBriefing(); } catch { }
        };

        const bindRange = (id, group, key) => {
            const el = document.getElementById(id);
            if (!el) return;
            el.addEventListener('input', () => {
                const v = Number(el.value);
                if (!Number.isFinite(v)) return;
                if (!operationalTuning[group] || typeof operationalTuning[group] !== 'object') return;
                operationalTuning[group][key] = v;
                persistTuning();
                rerenderAll();
            });
        };
        bindRange('op-th-dxy', 'threshold', 'dxy');
        bindRange('op-th-em', 'threshold', 'em');
        bindRange('op-th-export', 'threshold', 'export');
        bindRange('op-th-yields', 'threshold', 'yields');
        bindRange('op-th-brflow', 'threshold', 'brFlow');
        bindRange('op-th-zq', 'threshold', 'zqSlope');
        bindRange('op-w-flow', 'weight', 'flow');
        bindRange('op-w-dxy', 'weight', 'dxy');
        bindRange('op-w-export', 'weight', 'export');
        bindRange('op-w-em', 'weight', 'em');
        bindRange('op-w-yields', 'weight', 'yields');
        bindRange('op-w-brflow', 'weight', 'brFlow');
        bindRange('op-w-zq', 'weight', 'zq');

        const readWinProj = () => {
            try {
                const raw = localStorage.getItem('mercado_win_proj_v1');
                const obj = raw ? JSON.parse(raw) : null;
                return obj && typeof obj === 'object' ? obj : {};
            } catch {
                return {};
            }
        };
        const writeWinProj = (next) => {
            try {
                localStorage.setItem('mercado_win_proj_v1', JSON.stringify(next || {}));
            } catch {
            }
        };
        const bindWinProjNum = (id, field) => {
            const el = document.getElementById(id);
            if (!el) return;
            el.addEventListener('change', () => {
                const v = Number(el.value);
                const st = readWinProj();
                if (!Number.isFinite(v)) {
                    delete st[field];
                    writeWinProj(st);
                    try { if (typeof renderOperationalBriefing === 'function') renderOperationalBriefing(); } catch { }
                    return;
                }
                st[field] = v;
                writeWinProj(st);
                try { if (typeof renderOperationalBriefing === 'function') renderOperationalBriefing(); } catch { }
            });
        };
        bindWinProjNum('winproj-ref-close', 'refClose');
        bindWinProjNum('winproj-ref-adjust', 'refAdjust');
        bindWinProjNum('winproj-beta-iron', 'betaIron');
        bindWinProjNum('winproj-beta-copper', 'betaCopper');
        bindWinProjNum('winproj-beta-oil', 'betaOil');

        const bindWinProjOverride = (id, key) => {
            const el = document.getElementById(id);
            if (!el) return;
            el.addEventListener('change', () => {
                const v = Number(el.value);
                const st = readWinProj();
                const next = st.overrides && typeof st.overrides === 'object' ? st.overrides : {};
                if (!Number.isFinite(v)) {
                    delete next[key];
                } else {
                    next[key] = v;
                }
                st.overrides = next;
                writeWinProj(st);
                try { if (typeof renderOperationalBriefing === 'function') renderOperationalBriefing(); } catch { }
            });
        };
        bindWinProjOverride('winproj-ovr-iron', 'ironPct');
        bindWinProjOverride('winproj-ovr-copper', 'copperPct');
        bindWinProjOverride('winproj-ovr-oil', 'oilPct');

        const clearOvr = document.getElementById('winproj-clear-overrides');
        if (clearOvr) {
            clearOvr.addEventListener('click', () => {
                const st = readWinProj();
                st.overrides = {};
                writeWinProj(st);
                try { if (typeof renderOperationalBriefing === 'function') renderOperationalBriefing(); } catch { }
            });
        }

        const usePrevClose = document.getElementById('winproj-use-prevclose');
        if (usePrevClose) {
            usePrevClose.addEventListener('click', () => {
                const v = Number(usePrevClose.getAttribute('data-value'));
                if (!Number.isFinite(v)) return;
                const st = readWinProj();
                st.refClose = v;
                writeWinProj(st);
                try { if (typeof renderOperationalBriefing === 'function') renderOperationalBriefing(); } catch { }
            });
        }
        const useNow = document.getElementById('winproj-use-now');
        if (useNow) {
            useNow.addEventListener('click', () => {
                const v = Number(useNow.getAttribute('data-value'));
                if (!Number.isFinite(v)) return;
                const st = readWinProj();
                st.refAdjust = v;
                writeWinProj(st);
                try { if (typeof renderOperationalBriefing === 'function') renderOperationalBriefing(); } catch { }
            });
        }

        const copyText = (text) => {
            const s = String(text || '');
            const fallback = () => {
                try {
                    const ta = document.createElement('textarea');
                    ta.value = s;
                    ta.setAttribute('readonly', 'true');
                    ta.style.position = 'fixed';
                    ta.style.left = '-9999px';
                    document.body.appendChild(ta);
                    ta.select();
                    document.execCommand('copy');
                    document.body.removeChild(ta);
                    return true;
                } catch {
                    return false;
                }
            };
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(s).catch(() => fallback());
                return;
            }
            fallback();
        };
        document.querySelectorAll('[data-winproj-copy]').forEach(btn => {
            btn.addEventListener('click', () => {
                const tr = btn.closest('tr');
                if (!tr) return;
                const tds = Array.from(tr.querySelectorAll('td'));
                const label = tds[0] ? tds[0].textContent : '';
                const sym = tds[1] ? tds[1].textContent : '';
                const dp = tds[2] ? tds[2].textContent : '';
                const projClose = tds[4] ? tds[4].textContent : '';
                const projAdj = tds[5] ? tds[5].textContent : '';
                copyText(`WIN proj • ${label} • ${sym} • Δ% ${dp} • Fech ${projClose} • Ajuste ${projAdj}`.replace(/\s+/g, ' ').trim());
            });
        });
    }

    w.opBriefing_bindOperationalBriefingUi = bindOperationalBriefingUi;
})();
