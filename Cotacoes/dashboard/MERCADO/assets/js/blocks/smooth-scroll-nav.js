(function () {
    const w = typeof window !== 'undefined' ? window : null;
    if (!w) return;
    const root = (w.MercadoBlocks && typeof w.MercadoBlocks === 'object') ? w.MercadoBlocks : {};

    function setup() {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', e => {
                e.preventDefault();
                const href = link.getAttribute('href') || '';
                const targetId = href.startsWith('#') ? href.substring(1) : href;
                const target = document.getElementById(targetId);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }

    root.smoothScrollNav = { setup };
    w.MercadoBlocks = root;
})();
