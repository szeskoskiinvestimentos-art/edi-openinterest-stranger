(function () {
    const w = typeof window !== 'undefined' ? window : null;
    if (!w) return;
    const root = (w.MercadoBlocks && typeof w.MercadoBlocks === 'object') ? w.MercadoBlocks : {};

    function setup({ deps } = {}) {
        const d = deps || {};

        const filterNavigationItemsByExistingTargets = d.filterNavigationItemsByExistingTargets;
        const getNavigationItemsFlat = d.getNavigationItemsFlat;

        if (typeof filterNavigationItemsByExistingTargets !== 'function' || typeof getNavigationItemsFlat !== 'function') {
            throw new Error('deps_missing');
        }

        const btn = document.getElementById('quickNavBtn');
        const overlay = document.getElementById('quickNavOverlay');
        const drawer = document.getElementById('quickNav');
        const closeBtn = document.getElementById('quickNavClose');
        const list = document.getElementById('quickNavList');
        const search = document.getElementById('quickNavSearch');
        const quickSearchBtn = document.getElementById('quickSearchBtn');
        const sourceItems = filterNavigationItemsByExistingTargets(getNavigationItemsFlat());

        if (!btn || !overlay || !drawer || !closeBtn || !list || !search || !sourceItems.length) return;

        const normalize = s => String(s || '').toLowerCase().trim();

        function render(q) {
            const query = normalize(q);
            const items = sourceItems.filter(x => (!query ? true : normalize(x.label).includes(query)));

            list.innerHTML = items
                .map(x => {
                    const hash = x.href;
                    const id = hash.slice(1);
                    return `<a class="quicknav__item" href="${hash}" data-target="${id}"><span>${x.label}</span><span class="quicknav__pill">#${id}</span></a>`;
                })
                .join('');
        }

        function isOpen() {
            return drawer.classList.contains('is-open');
        }

        function setOpen(open) {
            if (open) {
                overlay.classList.add('is-open');
                drawer.classList.add('is-open');
                drawer.setAttribute('aria-hidden', 'false');
                btn.setAttribute('aria-expanded', 'true');
                overlay.setAttribute('aria-hidden', 'false');
                setTimeout(() => search.focus(), 0);
            } else {
                overlay.classList.remove('is-open');
                drawer.classList.remove('is-open');
                drawer.setAttribute('aria-hidden', 'true');
                btn.setAttribute('aria-expanded', 'false');
                overlay.setAttribute('aria-hidden', 'true');
                btn.focus();
            }
        }

        btn.addEventListener('click', () => setOpen(!isOpen()));
        closeBtn.addEventListener('click', () => setOpen(false));
        overlay.addEventListener('click', () => setOpen(false));

        document.addEventListener('keydown', e => {
            if (e.key === 'Escape' && isOpen()) setOpen(false);
        });

        search.addEventListener('input', e => render(e.target.value));

        list.addEventListener('click', e => {
            const a = e.target && e.target.closest ? e.target.closest('a.quicknav__item') : null;
            if (!a) return;
            setOpen(false);
        });

        const targets = sourceItems
            .map(x => x.href)
            .filter(h => h.startsWith('#'))
            .map(h => document.getElementById(h.slice(1)))
            .filter(Boolean);

        function setActive(id) {
            const links = Array.from(list.querySelectorAll('a.quicknav__item'));
            for (const l of links) {
                const match = (l.getAttribute('data-target') || '') === id;
                if (match) l.classList.add('is-active');
                else l.classList.remove('is-active');
            }

            const top = Array.from(document.querySelectorAll('.nav a.nav-link.nav-chip[data-nav-top="1"]'));
            const tops = top.length ? top : Array.from(document.querySelectorAll('.nav a.nav-link.nav-chip'));
            for (const a of tops) {
                const href = String(a.getAttribute('href') || '');
                const match = href === `#${id}`;
                if (match) a.classList.add('active');
                else a.classList.remove('active');
            }
        }

        if (targets.length && 'IntersectionObserver' in window) {
            const io = new IntersectionObserver(
                entries => {
                    const visible = entries
                        .filter(x => x.isIntersecting)
                        .sort((a, b) => (b.intersectionRatio || 0) - (a.intersectionRatio || 0))[0];
                    const id = visible && visible.target ? visible.target.id : '';
                    if (id) setActive(id);
                },
                { root: null, rootMargin: '-10% 0px -70% 0px', threshold: [0.1, 0.2, 0.3] },
            );
            for (const t of targets) io.observe(t);
        }

        render('');

        function openSearch() {
            setOpen(true);
            search.value = '';
            render('');
            setTimeout(() => search.focus(), 0);
        }

        if (quickSearchBtn) quickSearchBtn.addEventListener('click', openSearch);
        document.addEventListener('keydown', e => {
            const k = String(e.key || '').toLowerCase();
            if ((e.ctrlKey || e.metaKey) && k === 'k') {
                e.preventDefault();
                openSearch();
            }
        });
    }

    root.quickNavDrawer = { setup };
    w.MercadoBlocks = root;
})();
