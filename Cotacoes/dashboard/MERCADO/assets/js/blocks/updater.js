(function () {
    const w = typeof window !== 'undefined' ? window : null;
    if (!w) return;
    const root = (w.MercadoBlocks && typeof w.MercadoBlocks === 'object') ? w.MercadoBlocks : {};

    async function trigger({ deps } = {}) {
        const d = deps || {};

        const getMarketServiceBaseUrl = d.getMarketServiceBaseUrl;
        const setDataStatus = d.setDataStatus;
        const loadScriptFresh = d.loadScriptFresh;
        const resetAgendaAutoCache = d.resetAgendaAutoCache;
        const getData = d.getData;
        const renderAll = d.renderAll;
        const loadOptionsGammaSummary = d.loadOptionsGammaSummary;
        const loadFinancialJuice = d.loadFinancialJuice;
        const loadWebNewsModule = d.loadWebNewsModule;
        const loadFocusSummary = d.loadFocusSummary;
        const loadForeignFlow = d.loadForeignFlow;
        const formatUpdaterSummary = d.formatUpdaterSummary;
        const requestAutoRefreshPage = d.requestAutoRefreshPage;

        if (typeof getMarketServiceBaseUrl !== 'function'
            || typeof setDataStatus !== 'function'
            || typeof loadScriptFresh !== 'function'
            || typeof resetAgendaAutoCache !== 'function'
            || typeof getData !== 'function'
            || typeof renderAll !== 'function'
            || typeof loadOptionsGammaSummary !== 'function'
            || typeof loadFinancialJuice !== 'function'
            || typeof loadWebNewsModule !== 'function'
            || typeof loadFocusSummary !== 'function'
            || typeof loadForeignFlow !== 'function'
            || typeof formatUpdaterSummary !== 'function'
            || typeof requestAutoRefreshPage !== 'function'
        ) {
            throw new Error('deps_missing');
        }

        const baseUrl = getMarketServiceBaseUrl();
        try {
            setDataStatus('ATUALIZANDO • Coletando no Investing...', 'neutral');
            const res = await fetch(`${baseUrl}/api/market/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason: 'dashboard' }),
            });
            if (res.status === 429) {
                let msg = 'AGUARDE • Atualização manual limitada';
                try {
                    const payload = await res.json();
                    const cd = payload && payload.manualCooldown ? payload.manualCooldown : null;
                    if (cd && typeof cd.remainingSec === 'number' && cd.remainingSec > 0) {
                        const m = Math.floor(cd.remainingSec / 60);
                        const s = Math.max(0, cd.remainingSec - m * 60);
                        msg = `AGUARDE • Próxima atualização em ${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
                    }
                } catch {
                }
                setDataStatus(msg, 'neutral');
                return false;
            }
            if (!res.ok && res.status !== 409) throw new Error('Falha ao iniciar atualizador');

            const startedAt = Date.now();
            let lastPayload = null;
            while (Date.now() - startedAt < 180000) {
                const statusRes = await fetch(`${baseUrl}/api/market/status`, { method: 'GET' });
                if (statusRes.ok) {
                    const payload = await statusRes.json();
                    lastPayload = payload;
                    const st = payload && payload.state ? payload.state : null;
                    if (st && st.running === false) break;
                }
                await new Promise(r => setTimeout(r, 1500));
            }

            await loadScriptFresh('assets/data/market_quotes.js');
            await loadScriptFresh('assets/data/zq_curve.js');
            await loadScriptFresh('assets/data/economic_calendar.js');
            resetAgendaAutoCache();
            const updated = getData();
            if (updated) renderAll(updated);
            void loadOptionsGammaSummary();
            void loadFinancialJuice();
            void loadWebNewsModule();
            void loadFocusSummary();
            void loadForeignFlow();
            const sum = formatUpdaterSummary(lastPayload);
            if (sum && sum.text) {
                setDataStatus(sum.text, sum.tone || 'neutral');
                setTimeout(() => setDataStatus('', 'neutral'), 3500);
            } else {
                setDataStatus('OK • Dados atualizados', 'positive');
                setTimeout(() => setDataStatus('', 'neutral'), 2500);
            }
            setTimeout(() => requestAutoRefreshPage('manual_update_done'), 650);
            return true;
        } catch {
            setDataStatus('ATUALIZADOR OFFLINE • Rode "Atualizar_Dados_Mercado.bat" e tente novamente', 'negative');
            return false;
        }
    }

    root.updater = { trigger };
    w.MercadoBlocks = root;
})();
