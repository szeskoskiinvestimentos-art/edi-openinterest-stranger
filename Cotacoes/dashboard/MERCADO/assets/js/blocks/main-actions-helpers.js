(function () {
    const w = typeof window !== 'undefined' ? window : null;
    if (!w) return;

    const errorMessage = (e) => {
        try {
            if (!e) return '';
            if (typeof e === 'string') return e;
            if (typeof e === 'object' && 'message' in e) return String(e.message || '');
            return String(e);
        } catch {
            return '';
        }
    };

    const tryRender = ({ el, title, fallbackCard, fn, logTag } = {}) => {
        if (!el) return false;
        const card = typeof fallbackCard === 'function' ? fallbackCard : (() => '');
        try {
            if (typeof fn !== 'function') throw new Error('render_fn_missing');
            fn();
            return true;
        } catch (e) {
            try { if (logTag) console.error(`[${String(logTag)}] render failed`, e); } catch { }
            const msg = errorMessage(e);
            const text = msg ? `Falha ao renderizar o módulo: ${msg}` : 'Falha ao renderizar o módulo.';
            try { el.innerHTML = card(String(title || 'Módulo'), text); } catch { }
            return false;
        }
    };

    const isBrazilAdr = (symbol) => {
        const s = String(symbol || '').toUpperCase();
        return /(PBR|VALE|ABEV|ITUB|BBD|BSBR|NU|STNE)\b/.test(s);
    };

    w.MainActionsHelpers = { tryRender, errorMessage, isBrazilAdr };
})();
