(() => {
    const w = (typeof window !== 'undefined') ? window : null;
    if (!w) return;

    const isNum = v => typeof v === 'number' && Number.isFinite(v);
    const pointPct = p => (p && isNum(p.extendedChangePct)) ? p.extendedChangePct : (p && isNum(p.changePct)) ? p.changePct : null;

    const escapeHtml = (s) => String(s || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

    const fallbackCardHtml = ({ title, message } = {}) => {
        const t = escapeHtml(String(title || 'Indisponível'));
        const m = escapeHtml(String(message || 'Módulo indisponível.'));
        return `
            <div style="border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:12px;background:rgba(0,0,0,.18);">
                <div style="font-weight:900;letter-spacing:1px;margin-bottom:6px;">${t}</div>
                <div style="opacity:.86;font-size:12px;line-height:1.35;">${m}</div>
            </div>
        `;
    };

    const safeRender = ({ id, label, fn } = {}) => {
        try {
            if (typeof fn === 'function') fn();
            return { ok: true };
        } catch (e) {
            try { console.error(`[MERCADO] render falhou: ${String(label || id || 'bloco')}`, e); } catch { }
            try {
                const el = id ? document.getElementById(String(id)) : null;
                if (el) {
                    const msg = e instanceof Error ? (e.message || String(e)) : String(e);
                    el.innerHTML = fallbackCardHtml({
                        title: String(label || 'Falha no bloco'),
                        message: msg || 'Erro inesperado',
                    }) + `
                        <div style="opacity:.68;font-size:12px;margin-top:8px;">Dica: clique em “↻ Dados” para recarregar. Se persistir, verifique o console.</div>
                    `;
                }
            } catch { }
            return { ok: false };
        }
    };

    const current = (w.MercadoUtils && typeof w.MercadoUtils === 'object') ? w.MercadoUtils : {};
    w.MercadoUtils = { ...current, isNum, pointPct, escapeHtml, fallbackCardHtml, safeRender };
})();
