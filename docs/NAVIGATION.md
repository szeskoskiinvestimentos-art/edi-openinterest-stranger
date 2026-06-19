# Mapa de Navegação — EDI Market Guardian

## Visão Geral

O sistema possui **6 telas principais** interligadas por um menu de navegação unificado. A navegação é composta por dois elementos:

1. **Select dropdown** (`<select id="assetSelect">`) — presente em todas as telas, no canto superior direito
2. **Quick Nav panel** (`shared/unified-nav.js`) — painel lateral ativado pelo botão ☰ ou `Ctrl+K`

## Rotas Principais

```
┌─────────────────────────────────────────────────────────────────┐
│                        dashboard_unificado/                      │
│                                                                 │
│  index.html (HUB)                                               │
│  ├── WDO/index.html          (Dólar Futuro)                     │
│  ├── WIN/index.html          (Índice Futuro)                    │
│  ├── correlation/index.html  (Correlações)                      │
│  │                                                            │
│  └── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──  │
│                                                                 │
│  shared/unified-nav.js    (Navegação unificada)                  │
│  shared/styles.css        (Estilos compartilhados)               │
│  shared/js/particles.js   (Efeito partículas)                    │
│  shared/js/main.js        (Lógica compartilhada)                 │
│  shared/js/chart_data_utils.js  (Utilitários de dados)          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  Cotacoes/dashboard/MERCADO/index.html  (Cotações de Mercado)   │
│  — Caminho externo ao dashboard_unificado                        │
│  — Tem sistema de navegação próprio (quickNav + navMore)         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  controle_de_dados.html  (Controle de Dados)                    │
│  — Caminho externo ao dashboard_unificado                        │
│  — Link "Menu principal" → dashboard_unificado/index.html        │
└─────────────────────────────────────────────────────────────────┘
```

## Tela → Tela (Caminhos de Navegação)

| Origem | Destino | Caminho |
|--------|---------|---------|
| HUB → WDO | `WDO/index.html` | relativo |
| HUB → WIN | `WIN/index.html` | relativo |
| HUB → Cotações | `../Cotacoes/dashboard/MERCADO/index.html` | relativo |
| HUB → Correlações | `correlation/index.html` | relativo |
| HUB → Controle | `../controle_de_dados.html` | relativo |
| WDO → HUB | Select dropdown | via unified-nav.js |
| WDO → WIN | Select dropdown | via unified-nav.js |
| WDO → Cotações | Select dropdown | via unified-nav.js |
| WDO → Correlações | Select dropdown | via unified-nav.js |
| WDO → Controle | Select dropdown | via unified-nav.js |
| WIN → HUB | Select dropdown | via unified-nav.js |
| WIN → WDO | Select dropdown | via unified-nav.js |
| WIN → Cotações | Select dropdown | via unified-nav.js |
| WIN → Correlações | Select dropdown | via unified-nav.js |
| WIN → Controle | Select dropdown | via unified-nav.js |
| Cotações → HUB | Select dropdown | via unified-nav.js |
| Cotações → WDO | Select dropdown | via unified-nav.js |
| Cotações → WIN | Select dropdown | via unified-nav.js |
| Cotações → Correlações | Select dropdown | via unified-nav.js |
| Cotações → Controle | Select dropdown | via unified-nav.js |
| Correlações → HUB | Select dropdown + "Voltar" link | via unified-nav.js |
| Correlações → WDO | Select dropdown | via unified-nav.js |
| Correlações → WIN | Select dropdown | via unified-nav.js |
| Correlações → Cotações | Select dropdown | via unified-nav.js |
| Correlações → Controle | Select dropdown | via unified-nav.js |
| Controle → HUB | Link "Menu principal" | relativo |
| Controle → WDO | Select dropdown | via unified-nav.js |
| Controle → WIN | Select dropdown | via unified-nav.js |
| Controle → Cotações | Select dropdown | via unified-nav.js |
| Controle → Correlações | Select dropdown | via unified-nav.js |

## Mecanismos de Navegação

### 1. Select Dropdown (`assetSelect`)

Presente em todas as telas. Detecta a tela atual via `data-current-dashboard` ou `guessCurrentDashboard()`.

**Opções disponíveis:**
- `HUB` → Dashboard Unificado
- `WDO` → WDO (Dólar Futuro)
- `WIN` → WIN (Índice Futuro)
- `MERCADO` → Cotações de Mercado
- `CORR` → Correlações
- `CONTROLE` → Controle de Dados

### 2. Quick Nav Panel (`shared/unified-nav.js`)

Painel lateral deslizante acessível via:
- Botão **☰** no canto inferior direito
- Atalho **Ctrl+K**

Lista todos os dashboards com filtros de busca. Destaca a tela atual.

### 3. Navegação por Âncoras (seções)

Cada dashboard possui links internos para suas seções:
- **HUB**: Atalhos, Status
- **WDO**: Visão Geral, Essenciais, Estrutura, Gregas, V3 Analysis, Risco, Consolidado, YouTube
- **WIN**: Visão Geral, Essenciais, Estrutura, Gregas, V3 Analysis, Risco, Consolidado, YouTube
- **Cotações**: Visão Geral, Fluxo, Commodities, FX, Criptos, Calendário, Intel
- **Correlações**: Matriz, Supergráficos
- **Controle**: (sem seções internas — cards de status)

## Arquivos de Navegação

| Arquivo | Função |
|---------|--------|
| `dashboard_unificado/shared/unified-nav.js` | Lógica central de navegação (select + quick nav) |
| `dashboard_unificado/shared/styles.css` | Estilos compartilhados |
| `dashboard_unificado/shared/js/particles.js` | Efeito visual de partículas |

## Regras de Caminhos

- Usar **caminhos relativos** para portabilidade (sem `/` no início)
- Dashboard principal (`dashboard_unificado/`) é a raiz de referência
- `Cotacoes/dashboard/MERCADO/` e `controle_de_dados.html` ficam fora de `dashboard_unificado/`
- Scripts compartilhados ficam em `dashboard_unificado/shared/`
