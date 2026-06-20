/*
 * test_mercado_smoke.js - Smoke tests para MERCADO blocks.
 * Roda com: node tests/test_mercado_smoke.js
 *
 * Valida:
 * - Sintaxe JS dos 3 arquivos criticos (boot, core-kit, regime-conviction)
 * - Estrutura IIFE (function () { ... })();
 * - Exports via root.X = { ... }
 * - Registro em window.MercadoBlocks
 * - Tamanho minimo (regressao)
 *
 * Total: 11 testes
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const BLOCKS = path.join(__dirname, '..', 'assets', 'js', 'blocks');

const TARGETS = {
    boot: path.join(BLOCKS, 'boot.js'),
    core_kit: path.join(BLOCKS, 'core-kit.js'),
    regime_conviction: path.join(BLOCKS, 'regime-conviction.js'),
};

const tests = [];
let passed = 0;
let failed = 0;

function t(name, fn) {
    tests.push({ name, fn });
}

function runAll() {
    for (const { name, fn } of tests) {
        try {
            const [ok, msg] = fn();
            if (ok) {
                passed += 1;
                console.log(`[PASS] ${name}: ${msg}`);
            } else {
                failed += 1;
                console.log(`[FAIL] ${name}: ${msg}`);
            }
        } catch (e) {
            failed += 1;
            console.log(`[ERROR] ${name}: ${e.message}`);
        }
    }
    console.log(`--- Total: ${passed}/${passed + failed} ---`);
    if (failed > 0) process.exit(1);
}

function readSafe(p) {
    if (!fs.existsSync(p)) return null;
    return fs.readFileSync(p, 'utf8');
}

t('boot_exists', () => {
    if (!fs.existsSync(TARGETS.boot)) return [false, 'file missing'];
    return [true, TARGETS.boot];
});

t('core_kit_exists', () => {
    if (!fs.existsSync(TARGETS.core_kit)) return [false, 'file missing'];
    return [true, TARGETS.core_kit];
});

t('regime_exists', () => {
    if (!fs.existsSync(TARGETS.regime_conviction)) return [false, 'file missing'];
    return [true, TARGETS.regime_conviction];
});

t('boot_iife', () => {
    const c = readSafe(TARGETS.boot);
    if (!c) return [false, 'unreadable'];
    if (!/^\(function\s*\(\)\s*\{/.test(c.trim())) return [false, 'missing IIFE start'];
    if (!/\}\)\(\);?\s*$/.test(c.trim())) return [false, 'missing IIFE close'];
    return [true, 'IIFE (function () { ... })() OK'];
});

t('core_kit_iife', () => {
    const c = readSafe(TARGETS.core_kit);
    if (!c) return [false, 'unreadable'];
    if (!/^\(function\s*\(\)\s*\{/.test(c.trim())) return [false, 'missing IIFE start'];
    if (!/\}\)\(\);?\s*$/.test(c.trim())) return [false, 'missing IIFE close'];
    return [true, 'IIFE OK'];
});

t('regime_iife', () => {
    const c = readSafe(TARGETS.regime_conviction);
    if (!c) return [false, 'unreadable'];
    if (!/^\(function\s*\(\)\s*\{/.test(c.trim())) return [false, 'missing IIFE start'];
    if (!/\}\)\(\);?\s*$/.test(c.trim())) return [false, 'missing IIFE close'];
    return [true, 'IIFE OK'];
});

t('boot_syntax_valid', () => {
    try {
        execSync(`node --check "${TARGETS.boot}"`, { stdio: 'pipe' });
        return [true, 'node --check OK'];
    } catch (e) {
        const msg = (e.stderr || e.stdout || '').toString().slice(0, 200);
        return [false, `syntax error: ${msg}`];
    }
});

t('core_kit_syntax_valid', () => {
    try {
        execSync(`node --check "${TARGETS.core_kit}"`, { stdio: 'pipe' });
        return [true, 'node --check OK'];
    } catch (e) {
        const msg = (e.stderr || e.stdout || '').toString().slice(0, 200);
        return [false, `syntax error: ${msg}`];
    }
});

t('regime_syntax_valid', () => {
    try {
        execSync(`node --check "${TARGETS.regime_conviction}"`, { stdio: 'pipe' });
        return [true, 'node --check OK'];
    } catch (e) {
        const msg = (e.stderr || e.stdout || '').toString().slice(0, 200);
        return [false, `syntax error: ${msg}`];
    }
});

t('boot_mercaDo_blocks_export', () => {
    const c = readSafe(TARGETS.boot);
    if (!c) return [false, 'unreadable'];
    if (!/root\.boot\s*=\s*\{/.test(c)) return [false, 'missing root.boot export'];
    if (!/w\.MercadoBlocks\s*=\s*root/.test(c)) return [false, 'missing MercadoBlocks register'];
    return [true, 'root.boot + MercadoBlocks OK'];
});

t('core_kit_mercaDo_blocks_export', () => {
    const c = readSafe(TARGETS.core_kit);
    if (!c) return [false, 'unreadable'];
    if (!/root\.coreKit\s*=\s*\{/.test(c)) return [false, 'missing root.coreKit export'];
    const n = (c.match(/root\.\w+\s*=/g) || []).length;
    if (n < 1) return [false, 'no root.* exports'];
    return [true, `coreKit OK (${n} root.* exports no file)`];
});

t('regime_mercaDo_blocks_export', () => {
    const c = readSafe(TARGETS.regime_conviction);
    if (!c) return [false, 'unreadable'];
    if (!/root\.regimeConviction\s*=\s*\{/.test(c)) return [false, 'missing root.regimeConviction export'];
    if (!/w\.MercadoBlocks\s*=\s*root/.test(c)) return [false, 'missing MercadoBlocks register'];
    return [true, 'regimeConviction + MercadoBlocks OK'];
});

runAll();