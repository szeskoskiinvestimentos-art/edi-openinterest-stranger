(function () {
    const w = typeof window !== 'undefined' ? window : null;
    if (!w) return;
    const root = (w.MercadoBlocks && typeof w.MercadoBlocks === 'object') ? w.MercadoBlocks : {};

    function render({ deps } = {}) {
        const d = deps || {};

        const NAVIGATION_DEFINITION = d.NAVIGATION_DEFINITION;
        const filterNavigationItemsByExistingTargets = d.filterNavigationItemsByExistingTargets;
        const escapeHtml = d.escapeHtml;

        if (!NAVIGATION_DEFINITION || typeof NAVIGATION_DEFINITION !== 'object'
            || typeof filterNavigationItemsByExistingTargets !== 'function'
            || typeof escapeHtml !== 'function'
        ) {
            throw new Error('deps_missing');
        }

        const primary = document.getElementById('navPrimaryLinks');
        const grid = document.getElementById('navMoreGrid');
        if (!primary || !grid) return;

        const topItems = filterNavigationItemsByExistingTargets(NAVIGATION_DEFINITION.top);
        primary.innerHTML = topItems
            .map((x, i) => {
                const active = i === 0 ? ' active' : '';
                return `<a href="${escapeHtml(x.href)}" class="nav-link nav-chip${active}" data-nav="1" data-nav-top="1">${escapeHtml(x.label)}</a>`;
            })
            .join('');

        const groupsHtml = (NAVIGATION_DEFINITION.groups || [])
            .map(g => {
                const items = filterNavigationItemsByExistingTargets(g.items);
                if (!items.length) return '';
                const itemsHtml = items
                    .map(x => `<a href="${escapeHtml(x.href)}" class="nav-link nav-chip" data-nav="1" role="menuitem">${escapeHtml(x.label)}</a>`)
                    .join('');
                return `<div class="nav-more__group"><div class="nav-more__title">${escapeHtml(g.title)}</div>${itemsHtml}</div>`;
            })
            .join('');

        grid.innerHTML = groupsHtml;
    }

    root.navigationDefinition = { render };
    w.MercadoBlocks = root;
})();
