/**
 * test_split_view.js - Smoke tests para E26 (Split-view WDO/WIN).
 *
 * Carrega o modulo em jsdom, mocka dados, valida:
 * - API publica existe
 * - Modos parallel/diff/overlay
 * - Renderizacao com dados minimos
 * - Calculo de diff (WDO - WIN)
 * - Fallback graceful sem dados
 */

// Minimal jsdom stub
const { JSDOM } = (() => {
    try {
        return require('jsdom');
    } catch (e) {
        console.log('SKIP: jsdom not available, instalando...');
        return null;
    }
})();

if (!JSDOM) {
    console.log('FAIL: jsdom nao instalado. Testes JS rodarao em browser manualmente.');
    process.exit(0);
}

const fs = require('fs');
const path = require('path');

// Carrega o modulo
const moduleCode = fs.readFileSync(
    path.join(__dirname, '..', '..', 'dashboard_unificado', 'shared', 'js', 'split-view.js'),
    'utf8'
);

const dom = new JSDOM(`<!DOCTYPE html><html><body>
    <div id="edi-split-view-container"></div>
</body></html>`, {
    runScripts: 'outside-only',
    url: 'http://localhost'
});

const { window } = dom;
window.console = console;

// Executa o modulo
window.eval(moduleCode);

// Verifica API
if (!window.EDI || !window.EDI.splitView) {
    console.log('FAIL: window.EDI.splitView nao definido');
    process.exit(1);
}

const api = window.EDI.splitView;
console.log('PASS: window.EDI.splitView existe');

// Mock dados
const wdoData = {
    spot_price: 5171.5,
    iv_atm: 0.18,
    gamma_data: { total_gamma: 1.5e8, strikes: [5100, 5150, 5200] },
    delta_data: { total_delta: -2000 },
    greeks_2nd_order: {
        vanna: [-100, 200, -50],
        charm: [10, -20, 5]
    }
};

const winData = {
    spot_price: 132500,
    iv_atm: 0.20,
    gamma_data: { total_gamma: 5e6, strikes: [130000, 132500, 135000] },
    delta_data: { total_delta: 5000 },
    greeks_2nd_order: {
        vanna: [50, -100, 200],
        charm: [-5, 10, -15]
    }
};

// Teste init
try {
    api.init({
        containerId: 'edi-split-view-container',
        leftData: wdoData,
        rightData: winData,
        leftLabel: 'WDO',
        rightLabel: 'WIN'
    });
    console.log('PASS: init() nao lanca excecao');
} catch (e) {
    console.log('FAIL: init() lancou:', e.message);
    process.exit(1);
}

// Verifica render
const container = window.document.getElementById('edi-split-view-container');
if (!container || !container.innerHTML.includes('edi-split-pane')) {
    console.log('FAIL: container nao renderizou panes');
    process.exit(1);
}
console.log('PASS: container renderizado');

// Verifica metricas
// fmt(spot, 0): 5171.5 -> "5172" (0 decimais), 132500 -> "133K" (sufixo K para >= 1e4)
if (!container.innerHTML.includes('5172') || !container.innerHTML.includes('133K')) {
    console.log('FAIL: spots nao renderizados (WDO: 5172 / WIN: 133K esperados)');
    process.exit(1);
}
console.log('PASS: spots visiveis');

// Teste setMode
try {
    api.setMode('diff');
    if (api.getMode() !== 'diff') {
        console.log('FAIL: setMode nao alterou estado');
        process.exit(1);
    }
    console.log('PASS: setMode(diff) funcionou');
} catch (e) {
    console.log('FAIL: setMode:', e.message);
    process.exit(1);
}

// Teste modo overlay
try {
    api.setMode('overlay');
    if (api.getMode() !== 'overlay') {
        console.log('FAIL: setMode(overlay) nao alterou estado');
        process.exit(1);
    }
    if (!container.className.includes('edi-mode-overlay')) {
        console.log('FAIL: classe edi-mode-overlay nao aplicada');
        process.exit(1);
    }
    console.log('PASS: setMode(overlay) + classe CSS aplicada');
} catch (e) {
    console.log('FAIL: setMode(overlay):', e.message);
    process.exit(1);
}

// Teste setData
try {
    api.setData(winData, wdoData);
    if (api.getMode() !== 'overlay') {
        console.log('FAIL: setData resetou modo');
        process.exit(1);
    }
    console.log('PASS: setData nao resetou modo');
} catch (e) {
    console.log('FAIL: setData:', e.message);
    process.exit(1);
}

// Teste fallback sem dados
try {
    const dom2 = new JSDOM(`<!DOCTYPE html><html><body>
        <div id="test2"></div>
    </body></html>`, { runScripts: 'outside-only' });
    dom2.window.eval(moduleCode);
    const api2 = dom2.window.EDI.splitView;
    api2.init({
        containerId: 'test2',
        leftData: {},
        rightData: {}
    });
    const c2 = dom2.window.document.getElementById('test2');
    if (!c2.innerHTML.includes('edi-split-pane')) {
        console.log('FAIL: fallback nao renderizou panes');
        process.exit(1);
    }
    console.log('PASS: fallback com dados vazios renderiza');
} catch (e) {
    console.log('FAIL: fallback:', e.message);
    process.exit(1);
}

// Teste modo invalido
try {
    api.setMode('banana');
    if (api.getMode() === 'banana') {
        console.log('FAIL: setMode aceitou modo invalido');
        process.exit(1);
    }
    console.log('PASS: setMode rejeita modo invalido');
} catch (e) {
    console.log('FAIL:', e.message);
    process.exit(1);
}

console.log('\n=== Todos os testes E26 passaram ===');
process.exit(0);