/**
 * EDI Market Guardian V1 - WIN Dashboard
 * Main entry point - loads shared module and data-specific code
 */

// Load shared EDIApp class
document.addEventListener('DOMContentLoaded', () => {
    window.ediApp = new EDIApp();
    
    setTimeout(() => {
        if (window.ediApp) {
            window.ediApp.showNotification('Bem-vindo ao EDI Market Guardian WIN! Pressione H para ajuda.');
        }
    }, 2000);
});
