(function () {
    const w = typeof window !== 'undefined' ? window : null;
    if (!w) return;
    const root = (w.MercadoBlocks && typeof w.MercadoBlocks === 'object') ? w.MercadoBlocks : {};

    function setMetric(id, text) {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    }

    function escapeHtml(s) {
        return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    }

    function wrapLabel(text, maxCharsPerLine = 14, maxLines = 2) {
        const raw = String(text || '').trim();
        if (!raw) return ['—'];
        if (raw.length <= maxCharsPerLine) return [raw];

        const words = raw.split(/\s+/).filter(Boolean);
        if (words.length <= 1) {
            const mid = Math.min(Math.max(6, Math.floor(raw.length / 2)), raw.length - 1);
            return [raw.slice(0, mid), raw.slice(mid)].slice(0, maxLines);
        }

        let idx = 0;
        let line1 = '';
        while (idx < words.length) {
            const next = line1 ? `${line1} ${words[idx]}` : words[idx];
            if (next.length > maxCharsPerLine && line1) break;
            line1 = next;
            idx++;
        }

        const remainder = words.slice(idx).join(' ').trim();
        if (!remainder) return [line1].slice(0, maxLines);

        const room = Math.max(6, maxCharsPerLine - 1);
        const line2 = remainder.length > room ? `${remainder.slice(0, room).trimEnd()}…` : remainder;
        return [line1, line2].slice(0, maxLines);
    }

    function setMetricMultiline(id, text) {
        const el = document.getElementById(id);
        if (!el) return;
        const lines = wrapLabel(text);
        el.innerHTML = lines.map(escapeHtml).join('<br>');
    }

    function setDataStatus(text, tone = 'neutral') {
        const el = document.getElementById('dataStatus');
        if (!el) return;
        el.textContent = text || '';
        el.classList.remove('positive', 'negative', 'neutral');
        el.classList.add(tone);
    }

    function setHtml(id, html) {
        const el = document.getElementById(id);
        if (el) el.innerHTML = html;
    }

    root.statusUi = {
        setMetric,
        escapeHtml,
        wrapLabel,
        setMetricMultiline,
        setDataStatus,
        setHtml,
    };
    w.MercadoBlocks = root;
})();
