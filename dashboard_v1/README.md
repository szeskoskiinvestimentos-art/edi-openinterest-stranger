# 🚀 EDI Market Guardin V1 - Dashboard Stranger Things

Um dashboard interativo e visualmente impressionante para análise de dados de mercado, inspirado no tema Stranger Things com efeitos neon e estética retro-futurista.

## ✨ Características Principais

### 🎨 Design Visual
- **Tema Stranger Things**: Cores neon, efeitos glow, estética dos anos 80
- **Partículas Flutuantes**: Sistema de partículas animadas com efeitos de brilho
- **Animações Suaves**: Transições fluidas e efeitos de hover
- **Responsivo**: Adaptável a diferentes tamanhos de tela

### 📊 Visualizações de Dados
- **Delta Acumulado**: Gráfico de linha mostrando exposição delta por strike
- **Gamma Exposure**: Gráfico de barras com gamma exposure
- **Volume de Negociação**: Gráfico de linha comparando calls vs puts
- **Volatilidade Implícita**: Tendência de IV ao longo dos strikes
- **Tabela Detalhada**: Dados completos por strike price

### 🎯 Contexto Educacional
Cada seção inclui uma caixa de contexto explicativa que aparece antes do gráfico:
- ✅ **Delta Acumulado**: Explicação do que representa e sua importância
- ✅ **Gamma Exposure**: Contexto sobre como o gamma afeta o mercado
- ✅ **Volume de Negociação**: Entendimento sobre volume e sua relevância
- ✅ **Volatilidade Implícita**: Conceito e aplicação prática

### ⌨️ Interatividade
- **Navegação por Teclado**: Atalhos rápidos (1-5 para seções, H para ajuda, R para refresh)
- **Scroll Spy**: Navegação automática baseada na posição da página
- **Context Boxes Interativas**: Podem ser fechadas ou desaparecem automaticamente
- **Auto-refresh**: Atualização automática de dados a cada 30 segundos

## 🛠️ Tecnologias Utilizadas

- **HTML5/CSS3**: Estrutura e estilização
- **JavaScript Vanilla**: Interatividade e lógica
- **Chart.js**: Biblioteca de gráficos
- **Canvas API**: Sistema de partículas
- **CSS Variables**: Temas e cores customizáveis
- **Intersection Observer**: Scroll spy e animações

## 📁 Estrutura de Arquivos

```
dashboard_v1/
├── index.html              # Página principal
├── assets/
│   ├── css/
│   │   └── style.css       # Estilos com tema Stranger Things
│   ├── js/
│   │   ├── main.js         # Lógica principal e interatividade
│   │   ├── charts.js       # Configuração dos gráficos
│   │   └── particles.js    # Sistema de partículas
│   └── data/
│       └── market_data.json # Dados de mercado simulados
└── README.md              # Este arquivo
```

## 🚀 Como Executar

### Opção 1: Servidor Python (Recomendado)
```bash
# Navegue até o diretório do dashboard
cd dashboard_v1

# Inicie o servidor web
python -m http.server 8080

# Acesse no navegador
# http://localhost:8080
```

### Opção 2: Abrir Diretamente
Simplesmente abra o arquivo `index.html` no seu navegador, mas algumas funcionalidades podem ser limitadas devido a restrições de CORS.

## 🎮 Atalhos de Teclado

| Tecla | Função |
|-------|---------|
| `1`   | Visão Geral |
| `2`   | Delta Acumulado |
| `3`   | Gamma Exposure |
| `4`   | Volume de Negociação |
| `5`   | Volatilidade Implícita |
| `H`   | Mostrar Ajuda |
| `R`   | Atualizar Dados |
| `ESC` | Fechar modais |

## 📊 Dados Incluídos

O dashboard vem com dados de mercado simulados incluindo:
- **Preços de Strike**: De 5.6 a 6.5
- **Delta**: Valores de -0.85 a +0.84
- **Gamma**: Exposição gamma por strike
- **Volume**: Dados horários de negociação
- **Open Interest**: OI por strike
- **Volatilidade Implícita**: IV de 16.3% a 18.5%

## 🎨 Customização

### Cores
As cores podem ser facilmente alteradas modificando as variáveis CSS em `style.css`:

```css
:root {
    --primary-neon: #ff073a;    /* Vermelho neon */
    --secondary-neon: #00f3ff;   /* Azul neon */
    --accent-neon: #ff00ff;      /* Roxo neon */
    --warning-neon: #ffff00;     /* Amarelo neon */
    --success-neon: #00ff00;     /* Verde neon */
}
```

### Dados
Para usar seus próprios dados, edite o arquivo `assets/data/market_data.json` seguindo a estrutura existente.

## 🔧 Funcionalidades Avançadas

### Sistema de Partículas
- 100 partículas flutuantes com cores neon
- Conexões entre partículas próximas
- Efeitos de brilho e animação contínua
- Responsivo à mudança de tamanho da tela

### Animações
- **Fade-in**: Elementos aparecem suavemente
- **Glow Effects**: Efeitos de brilho pulsante
- **Scan Lines**: Animações de varredura
- **Hover Effects**: Transições suaves no mouse

### Contexto Educacional
Cada seção tem uma caixa de contexto que:
- Explica o conceito de forma simples
- Mostra a relevância para o trading
- Pode ser fechada manualmente
- Desaparece automaticamente após 10 segundos

## 🌟 Próximas Melhorias Sugeridas

1. **Dados em Tempo Real**: Integração com APIs de mercado
2. **Filtros Avançados**: Opções para personalizar visualizações
3. **Exportação**: Gerar relatórios em PDF/Excel
4. **Modo Escuro/Claro**: Alternância entre temas
5. **Alertas**: Notificações para condições específicas
6. **Análise Técnica**: Adicionar indicadores técnicos

## 📱 Compatibilidade

- **Desktop**: Chrome, Firefox, Safari, Edge
- **Mobile**: iOS Safari, Chrome Mobile
- **Tablets**: Todos os navegadores modernos

## ⚠️ Notas Importantes

- Este é um dashboard de demonstração com dados simulados
- Não deve ser usado para tomada de decisões de investimento reais
- Os dados são fictícios e apenas para fins educacionais
- Em produção, integrar com fontes de dados reais e apropriadas

## 🤝 Contribuições

Sinta-se à vontade para:
- Reportar bugs
- Sugerir melhorias
- Adicionar novas funcionalidades
- Melhorar a documentação

---

**EDI Market Guardin V1** - Transformando dados complexos em insights visuais impressionantes! 🚀