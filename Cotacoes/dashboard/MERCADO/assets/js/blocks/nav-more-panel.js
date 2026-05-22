(function () {
    const w = typeof window !== 'undefined' ? window : null;
    if (!w) return;
    const root = (w.MercadoBlocks && typeof w.MercadoBlocks === 'object') ? w.MercadoBlocks : {};

    function setup() {
        const btn = document.getElementById('navMoreBtn');
        const panel = document.getElementById('navMorePanel');
        if (!btn || !panel) return;

        function isOpen() {
            return panel.classList.contains('is-open');
        }

        function setOpen(open) {
            if (open) {
                panel.classList.add('is-open');
                btn.setAttribute('aria-expanded', 'true');
            } else {
                panel.classList.remove('is-open');
                btn.setAttribute('aria-expanded', 'false');
            }
        }

        btn.addEventListener('click', () => setOpen(!isOpen()));
        panel.addEventListener('click', e => {
            const a = e.target && e.target.closest ? e.target.closest('a.nav-link') : null;
            if (!a) return;
            setOpen(false);
        });
        document.addEventListener('click', e => {
            const t = e.target;
            if (t === btn) return;
            if (panel.contains(t)) return;
            setOpen(false);
        });
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') setOpen(false);
        });
    }

    root.navMorePanel = { setup };
    w.MercadoBlocks = root;
})();
