/**
 * EDI Market Guardin V1 - Main JavaScript
 * Handles interactions, context boxes, and navigation
 */

class EDIApp {
    constructor() {
        this.currentSection = 'overview';
        this.contextBoxes = {};
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupContextBoxes();
        this.setupSmoothScrolling();
        this.setupScrollSpy();
        this.setupKeyboardShortcuts();
        // Remove auto-refresh logic as per user request
        // Auto-refresh is not needed since data is updated once a day via Python script
        // this.startAutoRefresh();
        
        console.log('🚀 EDI Market Guardin V1 initialized');
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

        // Hide all context boxes before navigation - Removed
        // this.hideAllContextBoxes();
        
        // Smooth scroll to target
        targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });

        this.currentSection = sectionId;
        
        // Add entrance animation
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
        // Context boxes are now always visible. 
        // No setup needed for close buttons or auto-hide logic.
        console.log('Context boxes initialized in always-visible mode.');
    }

    setupSmoothScrolling() {
        // Add smooth scrolling for all internal links
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
                    
                    // Update active nav link
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
            // Prevent shortcuts when typing in inputs
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }

            switch (e.key) {
                case '1':
                    e.preventDefault();
                    this.navigateToSection('overview');
                    break;
                case '2':
                    e.preventDefault();
                    this.navigateToSection('delta');
                    break;
                case '3':
                    e.preventDefault();
                    this.navigateToSection('gamma');
                    break;
                case '4':
                    e.preventDefault();
                    this.navigateToSection('volume');
                    break;
                case '5':
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
🎮 EDI Market Guardin V1 - Atalhos de Teclado

1 - Visão Geral
2 - Delta
3 - Gamma  
4 - Volume
5 - Volatilidade
H - Ajuda
R - Atualizar Dados

Pressione ESC ou clique fora para fechar.`;

        // Create help modal
        const modal = document.createElement('div');
        modal.className = 'help-modal';
        modal.innerHTML = `
            <div class="help-content">
                <pre>${helpText}</pre>
                <button class="help-close">Fechar</button>
            </div>
        `;
        
        // Add styles
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
        
        // Close handlers
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
        
        // Animate in
        modal.style.opacity = '0';
        setTimeout(() => {
            modal.style.opacity = '1';
        }, 50);
    }

    refreshData() {
        // Show loading indicator
        this.showLoadingIndicator();
        
        // Em vez de simular dados, vamos recarregar a página para buscar o novo JS do disco
        setTimeout(() => {
            // Se estivermos rodando localmente (file://), o reload é a única forma de ler o novo arquivo JS
            // Se o usuário já rodou o script Python, o reload vai trazer os dados novos.
            
            this.showNotification('Recarregando dashboard para ler novos dados... 🔄');
            
            setTimeout(() => {
                window.location.reload();
            }, 1000);
            
        }, 500);
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
        
        // Add spin animation
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
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 50);
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    startAutoRefresh() {
        // Disabled
        console.log('🔄 Auto-refresh disabled');
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.ediApp = new EDIApp();
    
    // Add welcome message
    setTimeout(() => {
        if (window.ediApp) {
            window.ediApp.showNotification('Bem-vindo ao EDI Market Guardin V1! Pressione H para ajuda. 🚀');
        }
    }, 2000);
});