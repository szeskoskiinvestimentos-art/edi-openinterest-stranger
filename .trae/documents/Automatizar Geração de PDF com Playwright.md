# Implementação da Geração de PDF via Playwright

Para completar a automatização do fluxo conforme sua sugestão (v3.0), irei integrar a biblioteca **Playwright** para gerar PDFs "pixel-perfect" diretamente do HTML do dashboard.

## Passos da Implementação:

1.  **Instalação de Dependências**:
    *   Instalar `playwright` via pip.
    *   Baixar os binários do navegador (Chromium) necessários para a renderização headless.

2.  **Novo Módulo: `src/pdf_generator.py`**:
    *   Criar uma função `export_to_pdf(html_path, output_path)` que:
        *   Inicia uma instância headless do Chromium.
        *   Carrega o arquivo HTML gerado.
        *   Aguarda o carregamento completo dos gráficos Plotly (network idle).
        *   Gera o arquivo PDF com configurações de impressão adequadas (formato A4, background impresso).

3.  **Atualização do `main.py`**:
    *   Adicionar a etapa de exportação para PDF ao final do fluxo de execução.
    *   Garantir que o processo seja opcional (via `try/except`) para não quebrar a execução caso o ambiente não suporte PDF.

4.  **Validação**:
    *   Executar o script completo e verificar a criação do arquivo `dashboard_v3.pdf`.

Esta abordagem garante que o PDF final seja uma cópia fiel do dashboard interativo, sem depender da renderização do navegador do usuário final.