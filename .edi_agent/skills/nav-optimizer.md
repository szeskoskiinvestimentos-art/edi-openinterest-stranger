# Skill: Navigation Optimizer

## Descrição
Otimiza a navegação entre telas do dashboard unificado.

## Telas do Sistema

1. **Hub Principal**: `dashboard_unificado/index.html`
2. **WDO**: `dashboard_unificado/WDO/index.html`
3. **WIN**: `dashboard_unificado/WIN/index.html`
4. **Mercado**: `Cotacoes/dashboard/MERCADO/index.html`
5. **Correlação**: `dashboard_unificado/correlation/index.html`
6. **Controle**: `controle_de_dados.html`

## Regras de Navegação

1. **Usar caminhos relativos** para portabilidade
2. **Manter consistência** no menu de navegação
3. **Testar todos os links** após mudanças
4. **Documentar rotas** no README

## Padrões de Implementação

### Menu Compartilhado
```javascript
// unified-nav.js deve conter:
const navItems = [
  { name: 'Hub', url: '../index.html' },
  { name: 'WDO', url: '../WDO/index.html' },
  { name: 'WIN', url: '../WIN/index.html' },
  { name: 'Mercado', url: '../../Cotacoes/dashboard/MERCADO/index.html' },
  { name: 'Correlação', url: '../correlation/index.html' },
  { name: 'Controle', url: '../../controle_de_dados.html' }
];
```

### Estrutura de Pastas
```
dashboard_unificado/
├── index.html (hub)
├── shared/
│   ├── styles.css
│   └── unified-nav.js
├── WDO/
├── WIN/
└── correlation/
```