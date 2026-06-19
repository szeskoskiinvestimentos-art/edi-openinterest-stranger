# Padrões Identificados - EDI Agent

## Padrões de Código

### 1. Export JS Pattern
Todos os arquivos .js de dados seguem:
```javascript
window.VariavelGlobal = {JSON};
```

### 2. Dashboard Structure
Cada dashboard tem:
- index.html (página principal)
- assets/js/ (lógica)
- assets/data/ (dados JSON/JS)
- assets/css/ (estilos)

### 3. Shared Resources
- shared/styles.css - Estilo base
- shared/unified-nav.js - Navegação global
- shared/main-shared.js - EDIApp class
- shared/js/particles.js - Animação

### 4. Data Flow Pattern
Fonte → Scraper → CSV/JSON → Calculadora → JS → Dashboard

## Padrões de Arquitetura

### 1. Hub-and-Spoke
index.html é o hub, cada dashboard é um spoke

### 2. Layered Assets
shared/ → domain-specific → page-specific

### 3. Script Orchestration
.bat para Windows, .py para lógica complexa