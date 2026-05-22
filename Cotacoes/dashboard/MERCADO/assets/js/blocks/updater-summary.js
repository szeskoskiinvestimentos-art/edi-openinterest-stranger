(function () {
    const w = typeof window !== 'undefined' ? window : null;
    if (!w) return;
    const root = (w.MercadoBlocks && typeof w.MercadoBlocks === 'object') ? w.MercadoBlocks : {};

    function formatUpdaterSummary(payload) {
        try {
            if (!payload || typeof payload !== 'object') return null;
            const st = payload.state || null;
            if (!st || typeof st !== 'object') return null;
            const errors = Array.isArray(payload.errors) ? payload.errors : [];
            const warn = Array.isArray(payload.warnings) ? payload.warnings : [];
            const updated = payload.updated || null;

            const ok = st.ok === true || st.success === true;
            const done = st.running === false || st.done === true || st.finished === true;
            const hasErrors = errors.length > 0;
            const hasWarn = warn.length > 0;

            if (!done && typeof st.stage === 'string' && st.stage) {
                return { tone: 'neutral', text: `ATUALIZANDO • ${st.stage}` };
            }

            if (hasErrors) {
                return { tone: 'negative', text: `FALHA • ${errors[0]}` };
            }

            if (hasWarn) {
                return { tone: 'neutral', text: `OK • ${warn[0]}` };
            }

            if (ok) {
                if (updated && typeof updated === 'object') {
                    const parts = [];
                    if (typeof updated.quotes === 'number') parts.push(`quotes:${updated.quotes}`);
                    if (typeof updated.calendar === 'number') parts.push(`agenda:${updated.calendar}`);
                    if (typeof updated.curve === 'number') parts.push(`curva:${updated.curve}`);
                    const suffix = parts.length ? ` • ${parts.join(' ')}` : '';
                    return { tone: 'positive', text: `OK • Dados atualizados${suffix}` };
                }
                return { tone: 'positive', text: 'OK • Dados atualizados' };
            }

            return null;
        } catch {
            return null;
        }
    }

    root.updaterSummary = { formatUpdaterSummary };
    w.MercadoBlocks = root;
})();
