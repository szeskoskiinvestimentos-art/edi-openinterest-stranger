# Estado Atual do Projeto

## Data: 2026-06-22 (atualizado 13:15)

## Resumo
- **Bat files reescritos** (v2.0 → v3.0) com lógica robusta do backup
- **278/278 testes passando** (100%)
- **Sistema modular** (calculator split em 6 submodules)
- **Dashboards auditados e corrigidos** (tema Neon Terminal, 9 arquivos corrigidos)
- **Dados atualizados** (WDO/WIN fresh 22/06, MERCADO fresh 13:12)
- **Sistema portável** (AUTO_DETECT paths)

## Estrutura
```
src/calculator/        # 6 submodules (mixin pattern)
tests/                 # 278/278 testes (100%)
scripts/               # orquestrador.py (substitui .bat)
dashboard_unificado/   # 6 dashboards normalizados + auditados
Cotacoes/              # Node side (Investing, InfoMoney, Calendar)
edi_agent/            # Auto-aprendizado ativo
```

## Bat Files v3.0 (2026-06-22)
| Arquivo | Linhas | Mudança Principal |
|---------|--------|-------------------|
| Servico_Unificado.bat | ~378 | Health check robusto, env vars, args loop, exit watcher |
| Servico_Unificado_FORCE.bat | ~344 | Mesmas melhorias + confirmação interativa |
| Servico_Unificado_SAFE.bat | ~70 | Python detection consistente |

## Testes
```
278/278 PASS (100%)
├── 278 arquivos de teste: todos passando
└── Unicode fix aplicado (run_all.py)
```

## Dashboard Audit (2026-06-22)
| Dashboard | Tema | Dados | Scripts | Navegação |
|-----------|------|-------|---------|-----------|
| HUB | OK | OK (hub/status) | OK | unified-nav.js OK |
| WDO | OK | OK (fresh 22/06) | 12 OK | unified-nav.js OK |
| WIN | OK | OK (fresh 22/06) | 10 OK | unified-nav.js OK |
| MERCADO | OK | OK (fresh 13:12) | 86 OK | Nav própria |
| CORR | OK (CSS corrigido) | OK (usa MERCADO) | 8 OK (1 fix) | unified-nav.js OK |
| CONTROLE | OK (meta tags fix) | Redirect | OK | unified-nav.js OK |
| CONTROLE_DADOS | INDIGO (legado) | Dados inline | particles fix | Nav diferente |

## Evoluções (E1-E98)
| # | Categoria | Status |
|---|-----------|--------|
| E1-E5 | Pipeline & Dados | ✅ |
| E6-E8, E17 | Código & Bug Fixes | ✅ |
| E9-E12, E20 | Testes | ✅ |
| E10 | Matemática IV | ✅ |
| E13-E14, E18-E19 | Limpeza | ✅ |
| E15-E16 | UI & Navegação | ✅ |
| E21-E28 | Performance & Docs | ✅ |
| E29-E78 | Modelos Matemáticos | ✅ |
| E80 | Day-Trade Tools | ✅ |
| E83 | Greeks Heatmap | ✅ |
| E95b | Safe Operations | ✅ |
| E96 | Bat Files v3.0 | ✅ |
| E97 | Dashboard Bug Fixes (9 files) | ✅ |
| E98 | Data Pipeline + Test Runner Fix | ✅ |

## Pendências
1. EWZ spot divergence: Barchart $38.06 vs Yahoo $33.73 (investigar automacao_dados.py)
2. Decidir workaround Barchart E97 (A/B/C/D/E)
3. CONTROLE_DADOS legado: tema Indigo divergente (decidir se normaliza ou mantém)
4. MERCADO: nav própria diverge do unified-nav.js (decidir se migra)
