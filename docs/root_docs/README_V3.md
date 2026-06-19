# Dashboard de Opções v3.0

Esta versão refatorada migra a lógica do Jupyter Notebook para scripts Python modulares, permitindo execução automatizada, maior robustez e facilidade de manutenção. Inclui geração automática de PDF "pixel-perfect" via Playwright.

## Estrutura do Projeto

*   **`config/settings.py`**: **Inputs Diários** e Configurações.
    *   Este é o "local apropriado" para definir o **Spot**, **Volatilidade (IV)** e outros parâmetros diários.
    *   Edite este arquivo antes de rodar o script.
*   **`src/`**: Módulos de código fonte.
    *   `data_loader.py`: Responsável por encontrar, ler e consolidar os arquivos CSV de opções.
    *   `calculator.py`: Contém a lógica matemática (Black-Scholes, Griegas, Flips, Walls).
    *   `charts.py`: Responsável pela criação dos gráficos interativos Plotly.
    *   `pdf_generator.py`: Responsável pela geração do PDF final usando Playwright.
    *   `utils.py`: Funções utilitárias.
*   **`main.py`**: Script orquestrador que executa todo o fluxo (Carregar -> Calcular -> Gerar Gráfico -> Salvar HTML -> Gerar PDF).

## Instalação

1.  **Instale as dependências Python**:
    ```bash
    python -m pip install -r requirements.txt
    ```

2.  **Instale os navegadores do Playwright**:
    ```bash
    python -m playwright install chromium
    ```

## Como Executar

1.  **Prepare os Dados**: Certifique-se de que os arquivos CSV das opções (ex: `xdf26...csv`) estejam na pasta raiz do projeto.
2.  **Atualize os Inputs**: Abra `config/settings.py` e atualize as variáveis:
    ```python
    SPOT = 5.40950
    IV_ANNUAL = 0.1318
    # ...
    ```
3.  **Execute o Script**:
    Abra o terminal e rode:
    ```bash
    python main.py
    ```
4.  **Visualize**:
    *   O arquivo `dashboard_v3.html` será gerado com o relatório interativo.
    *   O arquivo `dashboard_v3.pdf` será gerado automaticamente pronto para distribuição.

## Notas Técnicas

*   A geração de PDF utiliza o **Playwright** para garantir que o layout renderizado seja idêntico ao visto no navegador.
*   O sistema foi desenhado para ser modular. Novos gráficos podem ser adicionados em `src/charts.py` e chamados no `main.py`.
