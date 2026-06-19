/**
 * EDI Market Guardian - Shared Main Module
 * Common functionality for WDO and WIN dashboards
 */

class EDIApp {
    constructor() {
        this.currentSection = 'overview';
        this.contextBoxes = {};
        this.init();
    }

    init() {
        const cfg = this.getOperationalSectionConfig();
        this.applyOperationalWeights(cfg);
        this.reorderSections(cfg);
        this.reorderOverviewBlocks();
        this.buildNavigationMenu(cfg);
        this.buildSectionSelect(cfg);
        this.setupNavigation();
        this.setupContextBoxes();
        this.setupSmoothScrolling();
        this.setupScrollSpy();
        this.setupKeyboardShortcuts();
        this.startAutoRefresh(300000);
        
        console.log('EDI Market Guardian initialized');
    }

    getOperationalSectionConfig() {
        return [
            { id: 'advanced', label: 'Niveis Chave', group: 'Core', weight: 10 },
            { id: 'overview', label: 'Visao Geral', group: 'Core', weight: 9 },
            { id: 'structure', label: 'Estrutura', group: 'Core', weight: 9 },
            { id: 'delta', label: 'Delta', group: 'Core', weight: 8 },
            { id: 'gamma', label: 'Gamma', group: 'Core', weight: 8 },
            { id: 'volatility', label: 'Volatilidade', group: 'Core', weight: 7 },
            { id: 'structure-v3', label: 'V3 Analysis', group: 'Analises', weight: 6 },
            { id: 'risk', label: 'Risco', group: 'Analises', weight: 6 },
            { id: 'tools', label: 'Ferramentas (Yahoo)', group: 'Ferramentas', weight: 5 },
            { id: 'consolidated', label: 'Consolidado', group: 'Dados', weight: 4 },
            { id: 'greeks2', label: 'Gregas', group: 'Dados', weight: 3 },
            { id: 'greeks-cum', label: 'Gregas Acum.', group: 'Dados', weight: 2 },
            { id: 'youtube', label: 'YouTube', group: 'Outros', weight: 0 },
        ];
    }

    applyOperationalWeights(cfg) {
        const byId = new Map((cfg || []).map((c) => [String(c.id), Number(c.weight)]));
        document.querySelectorAll('section[id]').forEach((sec) => {
            const id = String(sec.id || '');
            const w = byId.has(id) ? byId.get(id) : 0;
            sec.setAttribute('data-operational-weight', String(w));
        });
    }

    reorderSections(cfg) {
        const container = document.querySelector('main.main .container');
        if (!container) return;
        const children = Array.from(container.children || []).filter((el) => el && el.tagName === 'SECTION' && el.id);
        if (!children.length) return;

        const byId = new Map((cfg || []).map((c) => [String(c.id), Number(c.weight)]));
        const withIdx = children.map((el, idx) => ({ el, idx, w: byId.has(el.id) ? byId.get(el.id) : 0 }));
        withIdx.sort((a, b) => (b.w - a.w) || (a.idx - b.idx));
        withIdx.forEach((x) => container.appendChild(x.el));
    }

    reorderOverviewBlocks() {
        const section = document.getElementById('overview');
        if (!section) return;
        const header = section.querySelector('.section-header');
        if (!header) return;

        const blocks = [];
        const metrics = section.querySelector('.metrics-grid');
        if (metrics) blocks.push({ el: metrics, w: 10 });

        const bySelector = [
            { sel: '#oiExpiryChart', w: 8 },
            { sel: '#most-actives-container', w: 7 },
            { sel: '#volumeVolatilityChart', w: 7 },
            { sel: '#fair-value-container-overview', w: 6 },
        ];

        bySelector.forEach((it) => {
            const target = section.querySelector(it.sel);
            if (!target) return;
            const wrap = target.closest ? target.closest('.split-layout') : null;
            if (!wrap) return;
            blocks.push({ el: wrap, w: it.w });
        });

        const uniq = [];
        const seen = new Set();
        blocks.forEach((b) => {
            if (!b || !b.el) return;
            if (seen.has(b.el)) return;
            seen.add(b.el);
            uniq.push(b);
        });

        if (!uniq.length) return;
        uniq.sort((a, b) => b.w - a.w);
        uniq.forEach((b) => {
            b.el.setAttribute('data-operational-weight', String(b.w));
            section.appendChild(b.el);
        });
    }

    buildNavigationMenu(cfg) {
        const ul = document.querySelector('.nav-list');
        if (!ul) return;
        const groups = ['Core', 'Analises', 'Ferramentas', 'Dados', 'Outros'];
        const items = (cfg || []).filter((c) => document.getElementById(String(c.id)));
        const byGroup = new Map(groups.map((g) => [g, []]));
        items.forEach((it) => {
            const g = groups.includes(it.group) ? it.group : 'Outros';
            byGroup.get(g).push(it);
        });
        groups.forEach((g) => byGroup.get(g).sort((a, b) => Number(b.weight) - Number(a.weight)));

        ul.innerHTML = '';
        let first = true;
        groups.forEach((g) => {
            const arr = byGroup.get(g) || [];
            if (!arr.length) return;
            const sep = document.createElement('li');
            sep.textContent = g.toUpperCase();
            sep.style.cssText =
                "padding:0 10px;color:#ff00ff;font-family:'Share Tech Mono',monospace;font-size:11px;opacity:.85;user-select:none;";
            ul.appendChild(sep);
            arr.forEach((it) => {
                const li = document.createElement('li');
                const a = document.createElement('a');
                a.href = `#${it.id}`;
                a.className = 'nav-link' + (first ? ' active' : '');
                a.textContent = it.label;
                first = false;
                li.appendChild(a);
                ul.appendChild(li);
            });
        });
    }

    buildSectionSelect(cfg) {
        const host = document.querySelector('.nav-actions');
        if (!host) return;
        if (document.getElementById('sectionSelect')) return;

        const sel = document.createElement('select');
        sel.id = 'sectionSelect';
        sel.setAttribute('aria-label', 'Selecionar secao');
        sel.style.cssText =
            "background:#141414;color:#e0e0e0;border:1px solid #333;padding:6px 10px;border-radius:4px;font-weight:700;margin-left:8px;max-width:190px;";

        const groups = ['Core', 'Analises', 'Ferramentas', 'Dados', 'Outros'];
        const items = (cfg || []).filter((c) => document.getElementById(String(c.id)));
        const byGroup = new Map(groups.map((g) => [g, []]));
        items.forEach((it) => {
            const g = groups.includes(it.group) ? it.group : 'Outros';
            byGroup.get(g).push(it);
        });
        groups.forEach((g) => byGroup.get(g).sort((a, b) => Number(b.weight) - Number(a.weight)));

        groups.forEach((g) => {
            const arr = byGroup.get(g) || [];
            if (!arr.length) return;
            const og = document.createElement('optgroup');
            og.label = g;
            arr.forEach((it) => {
                const opt = document.createElement('option');
                opt.value = it.id;
                opt.textContent = it.label;
                og.appendChild(opt);
            });
            sel.appendChild(og);
        });

        sel.addEventListener('change', () => {
            const id = String(sel.value || '');
            if (!id) return;
            this.navigateToSection(id);
        });

        host.appendChild(sel);
    }

    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                this.navigateToSection(targetId);
                this.updateActiveNav(link);
            });
        });
    }

    navigateToSection(sectionId) {
        const targetElement = document.getElementById(sectionId);
        if (!targetElement) return;

        targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });

        this.currentSection = sectionId;
        
        targetElement.classList.add('fade-in');
        setTimeout(() => {
            targetElement.classList.remove('fade-in');
        }, 1000);
    }

    updateActiveNav(activeLink) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        activeLink.classList.add('active');
    }

    setupContextBoxes() {
        console.log('Context boxes initialized in always-visible mode.');
    }

    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    setupScrollSpy() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const sectionId = entry.target.id;
                    
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${sectionId}`) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }, {
            threshold: 0.3,
            rootMargin: '-50px 0px -50px 0px'
        });

        sections.forEach(section => {
            observer.observe(section);
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }

            switch (e.key) {
                case '1':
                    e.preventDefault();
                    this.navigateToSection('advanced');
                    break;
                case '2':
                    e.preventDefault();
                    this.navigateToSection('overview');
                    break;
                case '3':
                    e.preventDefault();
                    this.navigateToSection('structure');
                    break;
                case '4':
                    e.preventDefault();
                    this.navigateToSection('delta');
                    break;
                case '5':
                    e.preventDefault();
                    this.navigateToSection('gamma');
                    break;
                case '6':
                    e.preventDefault();
                    this.navigateToSection('volatility');
                    break;
                case 'h':
                case 'H':
                    e.preventDefault();
                    this.showHelp();
                    break;
                case 'r':
                case 'R':
                    e.preventDefault();
                    this.refreshData();
                    break;
            }
        });
    }

    showHelp() {
        const helpText = `
EDI Market Guardian - Atalhos de Teclado

1 - Niveis Chave
2 - Visao Geral
3 - Estrutura
4 - Delta
5 - Gamma
6 - Volatilidade
H - Ajuda
R - Atualizar Dados

Pressione ESC ou clique fora para fechar.`;

        const modal = document.createElement('div');
        modal.className = 'help-modal';
        modal.innerHTML = `
            <div class="help-content">
                <pre>${helpText}</pre>
                <button class="help-close">Fechar</button>
            </div>
        `;
        
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            backdrop-filter: blur(5px);
        `;
        
        const content = modal.querySelector('.help-content');
        content.style.cssText = `
            background: linear-gradient(135deg, #1a1a1a, #2a2a2a);
            border: 2px solid #00f3ff;
            border-radius: 15px;
            padding: 30px;
            box-shadow: 0 0 30px rgba(0, 243, 255, 0.5);
            max-width: 500px;
            text-align: center;
        `;
        
        const pre = modal.querySelector('pre');
        pre.style.cssText = `
            color: #ffffff;
            font-family: 'Share Tech Mono', monospace;
            font-size: 14px;
            line-height: 1.6;
            margin-bottom: 20px;
            white-space: pre-wrap;
        `;
        
        const closeBtn = modal.querySelector('.help-close');
        closeBtn.style.cssText = `
            background: linear-gradient(45deg, #ff073a, #ff00ff);
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-family: 'Orbitron', monospace;
            text-transform: uppercase;
            letter-spacing: 1px;
            transition: all 0.3s ease;
        `;
        
        document.body.appendChild(modal);
        
        const closeModal = () => {
            modal.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(modal);
            }, 300);
        };
        
        closeBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
        
        document.addEventListener('keydown', function escHandler(e) {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', escHandler);
            }
        });
        
        modal.style.opacity = '0';
        setTimeout(() => {
            modal.style.opacity = '1';
        }, 50);
    }

    refreshData() {
        this._softRefresh();
    }

    _softRefresh() {
        if (this._refreshing) return;
        this._refreshing = true;
        this._showRefreshStatus('Atualizando...');

        const scripts = Array.from(document.querySelectorAll('script[src]'))
            .filter(s => s.src && (s.src.includes('market_data.js') || s.src.includes('yahoo_ewz_options.js') || s.src.includes('yahoo_usdu_options.js') || s.src.includes('yahoo_uup_options.js')));

        if (!scripts.length) {
            this._refreshing = false;
            this._hideRefreshStatus();
            window.location.reload();
            return;
        }

        const urls = scripts.map(s => {
            const url = new URL(s.src);
            return url.pathname;
        });

        const cacheBust = '?t=' + Date.now();
        const fetches = urls.map(u => fetch(u + cacheBust).then(r => r.ok ? r.text() : null).catch(() => null));

        Promise.all(fetches).then(results => {
            let updated = 0;
            results.forEach((text, i) => {
                if (!text) return;
                try {
                    const sandbox = {};
                    const fn = new Function('window', 'document', text);
                    fn(sandbox, document);
                    if (sandbox.marketData) {
                        window.marketData = sandbox.marketData;
                        updated++;
                    }
                    if (sandbox.yahooEwzOptionsData) {
                        window.yahooEwzOptionsData = sandbox.yahooEwzOptionsData;
                        updated++;
                    }
                    if (sandbox.yahooUsduOptionsData) {
                        window.yahooUsduOptionsData = sandbox.yahooUsduOptionsData;
                        updated++;
                    }
                    if (sandbox.yahooUupOptionsData) {
                        window.yahooUupOptionsData = sandbox.yahooUupOptionsData;
                        updated++;
                    }
                } catch (_) {
                    try {
                        eval(text);
                        updated++;
                    } catch (_) {}
                }
            });

            if (updated > 0) {
                this._updateLastRefreshLabel();
                this._reRenderCharts();
                this._showRefreshStatus('OK ' + new Date().toLocaleTimeString('pt-BR'));
            } else {
                this._showRefreshStatus('Sem alteracoes');
            }

            setTimeout(() => this._hideRefreshStatus(), 3000);
            this._refreshing = false;
        }).catch(() => {
            this._refreshing = false;
            this._hideRefreshStatus();
        });
    }

    _reRenderCharts() {
        try {
            if (typeof renderAllCharts === 'function') renderAllCharts();
            else if (typeof drawCharts === 'function') drawCharts();
        } catch (_) {}
        try {
            if (typeof renderOverviewMetrics === 'function') renderOverviewMetrics();
        } catch (_) {}
    }

    _showRefreshStatus(text) {
        let el = document.getElementById('edi-refresh-status');
        if (!el) {
            el = document.createElement('div');
            el.id = 'edi-refresh-status';
            el.style.cssText = `
                position:fixed;bottom:12px;right:12px;z-index:999;
                background:rgba(0,0,0,0.75);color:#00f3ff;
                font-family:'Share Tech Mono',monospace;font-size:11px;
                padding:5px 10px;border-radius:6px;border:1px solid rgba(0,243,255,0.3);
                pointer-events:none;transition:opacity 0.3s;
            `;
            document.body.appendChild(el);
        }
        el.textContent = text;
        el.style.opacity = '1';
    }

    _hideRefreshStatus() {
        const el = document.getElementById('edi-refresh-status');
        if (el) el.style.opacity = '0';
    }

    _updateLastRefreshLabel() {
        const label = document.getElementById('last-update-label');
        if (label) {
            const now = new Date();
            label.textContent = 'Atualizado: ' + now.toLocaleTimeString('pt-BR');
        }
    }

    _isMarketHoursBRT() {
        const now = new Date();
        const brt = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
        const h = brt.getHours();
        const m = brt.getMinutes();
        const day = brt.getDay();
        if (day === 0 || day === 6) return false;
        const mins = h * 60 + m;
        return mins >= 9 * 60 && mins < 18 * 60;
    }

    _createRefreshButton() {
        const nav = document.querySelector('.nav-actions');
        if (!nav) return;
        const btn = document.createElement('button');
        btn.id = 'edi-refresh-btn';
        btn.textContent = '\u21BB';
        btn.title = 'Atualizar dados (R)';
        btn.setAttribute('aria-label', 'Atualizar dados');
        btn.style.cssText = `
            background:#141414;color:#00f3ff;border:1px solid #333;
            padding:5px 10px;border-radius:4px;font-size:16px;font-weight:700;
            cursor:pointer;margin-left:8px;transition:all 0.2s;
        `;
        btn.addEventListener('mouseenter', () => {
            btn.style.borderColor = '#00f3ff';
            btn.style.boxShadow = '0 0 8px rgba(0,243,255,0.4)';
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.borderColor = '#333';
            btn.style.boxShadow = 'none';
        });
        btn.addEventListener('click', () => this.refreshData());
        nav.appendChild(btn);
    }

    startAutoRefresh(intervalMs) {
        this._autoRefreshInterval = intervalMs || 300000;
        this._autoRefreshTimer = null;
        this._refreshing = false;
        this._createRefreshButton();

        const tick = () => {
            if (this._isMarketHoursBRT()) {
                this._softRefresh();
            }
        };

        this._autoRefreshTimer = setInterval(tick, this._autoRefreshInterval);
        console.log('Auto-refresh: interval=' + (this._autoRefreshInterval / 1000) + 's, only during B3 market hours (9:00-18:00 BRT)');
    }

    stopAutoRefresh() {
        if (this._autoRefreshTimer) {
            clearInterval(this._autoRefreshTimer);
            this._autoRefreshTimer = null;
        }
    }

    showLoadingIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'loading-indicator';
        indicator.innerHTML = `
            <div class="loading-spinner"></div>
            <span>Atualizando dados...</span>
        `;
        
        indicator.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #1a1a1a, #2a2a2a);
            border: 2px solid #00f3ff;
            border-radius: 10px;
            padding: 15px 20px;
            color: #ffffff;
            font-family: 'Orbitron', monospace;
            font-size: 12px;
            z-index: 1001;
            display: flex;
            align-items: center;
            gap: 10px;
            box-shadow: 0 0 20px rgba(0, 243, 255, 0.5);
        `;
        
        const spinner = indicator.querySelector('.loading-spinner');
        spinner.style.cssText = `
            width: 16px;
            height: 16px;
            border: 2px solid rgba(0, 243, 255, 0.3);
            border-top: 2px solid #00f3ff;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(indicator);
        this.loadingIndicator = indicator;
    }

    hideLoadingIndicator() {
        if (this.loadingIndicator) {
            this.loadingIndicator.style.opacity = '0';
            setTimeout(() => {
                if (this.loadingIndicator && this.loadingIndicator.parentNode) {
                    document.body.removeChild(this.loadingIndicator);
                }
            }, 300);
        }
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(45deg, #00ff00, #00f3ff);
            color: #000000;
            padding: 15px 20px;
            border-radius: 5px;
            font-family: 'Orbitron', monospace;
            font-weight: bold;
            z-index: 1002;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 50);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

if (typeof window !== 'undefined') {
    window.EDIApp = EDIApp;
}
