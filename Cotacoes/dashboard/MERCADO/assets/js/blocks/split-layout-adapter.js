(function () {
    const w = typeof window !== 'undefined' ? window : null;
    if (!w) return;
    const root = (w.MercadoBlocks && typeof w.MercadoBlocks === 'object') ? w.MercadoBlocks : {};

    let timer = null;

    function adapt() {
        const wide = window.innerWidth > 900;
        const layouts = Array.from(document.querySelectorAll('.split-layout'));
        for (const l of layouts) {
            try {
                const kids = Array.from(l.children);
                if (kids.length < 2) continue;

                const left = kids.find(x => x && x.classList && x.classList.contains('context-box')) || kids[0];
                const right = kids.find(x => x && x !== left) || kids[1];

                if (!left || !right) continue;

                const leftH = left.getBoundingClientRect().height || 0;
                const rightH = right.getBoundingClientRect().height || 0;

                const isChart = right.classList.contains('chart-container') || !!right.querySelector('canvas');
                const isCalendar = right.classList.contains('calendar-widget') || !!right.querySelector('iframe');
                const canStack = isChart || isCalendar;

                const shouldStack =
                    wide &&
                    canStack &&
                    leftH >= 520 &&
                    rightH <= 520 &&
                    leftH - rightH >= 240;

                if (shouldStack) l.classList.add('split-layout--stack');
                else l.classList.remove('split-layout--stack');
            } catch {
            }
        }
    }

    function schedule() {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
            timer = null;
            adapt();
        }, 120);
    }

    function setup() {
        window.addEventListener('resize', schedule);
    }

    root.splitLayoutAdapter = { adapt, schedule, setup };
    w.MercadoBlocks = root;
})();
