const MercadoCharts = (() => {
    const charts = new Map();

    function destroyIfExists(key) {
        const existing = charts.get(key);
        if (existing) {
            existing.destroy();
            charts.delete(key);
        }
    }

    function formatNumber(val) {
        if (val === null || val === undefined || Number.isNaN(val)) return '—';
        return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 4 }).format(val);
    }

    function formatPercent(val) {
        if (val === null || val === undefined || Number.isNaN(val)) return '—';
        const sign = val > 0 ? '+' : '';
        return `${sign}${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(val)}%`;
    }

    function buildTimeSeriesDataset(points, label) {
        const labels = points.map(p => {
            const d = new Date(p.t);
            const dd = String(d.getDate()).padStart(2, '0');
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const hh = String(d.getHours()).padStart(2, '0');
            const mi = String(d.getMinutes()).padStart(2, '0');
            return `${dd}/${mm} ${hh}:${mi}`;
        });
        const values = points.map(p => p.price);
        const meta = points.length ? points[points.length - 1] : null;
        const subtitle = meta ? `${formatNumber(meta.price)} (${formatPercent(meta.changePct)})` : '—';
        return { labels, values, subtitle, label };
    }

    function renderLineChart(canvasId, points, label) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        destroyIfExists(canvasId);

        const { labels, values, subtitle } = buildTimeSeriesDataset(points, label);
        const ctx = canvas.getContext('2d');
        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [
                    {
                        label: `${label}  ${subtitle}`,
                        data: values,
                        borderColor: '#00f3ff',
                        backgroundColor: 'rgba(0, 243, 255, 0.12)',
                        pointRadius: 0,
                        borderWidth: 2,
                        tension: 0.25,
                        fill: true,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: '#e0e0e0', font: { family: 'Share Tech Mono' } },
                    },
                    tooltip: {
                        intersect: false,
                        mode: 'index',
                    },
                },
                scales: {
                    x: {
                        ticks: { color: '#a0a0a0', maxRotation: 0, autoSkip: true },
                        grid: { color: 'rgba(255,255,255,0.05)' },
                    },
                    y: {
                        ticks: { color: '#a0a0a0' },
                        grid: { color: 'rgba(255,255,255,0.05)' },
                    },
                },
            },
        });

        charts.set(canvasId, chart);
    }

    function renderBarChart(canvasId, labels, values, title) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        destroyIfExists(canvasId);

        const ctx = canvas.getContext('2d');
        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [
                    {
                        label: title,
                        data: values,
                        backgroundColor: values.map(v => (v >= 0 ? 'rgba(0,255,0,0.25)' : 'rgba(255,7,58,0.25)')),
                        borderColor: values.map(v => (v >= 0 ? '#00ff00' : '#ff073a')),
                        borderWidth: 1,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                },
                scales: {
                    x: {
                        ticks: { color: '#a0a0a0', maxRotation: 0, autoSkip: true },
                        grid: { color: 'rgba(255,255,255,0.05)' },
                    },
                    y: {
                        ticks: { color: '#a0a0a0' },
                        grid: { color: 'rgba(255,255,255,0.05)' },
                    },
                },
            },
        });

        charts.set(canvasId, chart);
    }

    return { renderLineChart, renderBarChart };
})();

window.MercadoCharts = MercadoCharts;
