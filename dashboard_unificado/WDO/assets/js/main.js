/**
 * EDI Market Guardian V1 - WDO Dashboard
 * Main entry point - loads shared module and data-specific code
 */

// Load shared EDIApp class
document.addEventListener('DOMContentLoaded', () => {
    window.ediApp = new EDIApp();
    
    setTimeout(() => {
        if (window.ediApp) {
            window.ediApp.showNotification('Bem-vindo ao EDI Market Guardian WDO! Pressione H para ajuda.');
        }
    }, 2000);
});
