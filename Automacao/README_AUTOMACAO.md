# Automação de Dados B3 (Barchart)

Este módulo automatiza a coleta de dados de Opções e Fechamentos para o Auto_B3_System.

## Funcionalidades
1. **Coleta de Fechamentos (Spot)**: Busca `DOL1!` e `IND1!` no TradingView (via Selenium/Requests).
2. **Coleta de Opções EWZ**: Baixa a cadeia completa de opções do ETF EWZ via API interna do Barchart (com paginação e delays anti-bloqueio).
3. **Coleta de Opções WDO**: Identifica automaticamente os contratos vigentes (ex: `J26`, `K26`) e baixa as cadeias de opções via API de Futuros.
4. **Geração de CSVs**: Salva arquivos compatíveis com o `data_loader.py` (colunas: Strike, Open Int, OptionType, Expiry, etc.) nas pastas `CSV_Dolar` e `CSV_Indice`.
5. **Atualização Automática**: Gera o arquivo `.env.auto` com os dados coletados (Spot, IV, etc.), que é lido automaticamente pelo `config.py`.

## Como Usar
1. Certifique-se de ter o Google Chrome instalado.
2. Execute o script:
   ```bash
   python automacao_dados.py
   ```
3. O navegador abrirá brevemente apenas para autenticação inicial (cookies) e depois fechará ou ficará em segundo plano.
4. O processo pode levar alguns minutos devido aos intervalos de segurança entre as requisições (para evitar bloqueios do Barchart).
5. Ao final, verifique se os arquivos `.csv` foram criados e se o `.env.auto` foi gerado.

## Configurações (WDO)
- `WDO_CONTRACTS_MONTHS_AHEAD`: quantidade de meses à frente para coletar contratos (padrão do código: 24).
- `WDO_CONTRACTS_UNTIL_YYYY_MM`: alternativa ao `MONTHS_AHEAD` para coletar até um alvo fixo (formato `YYYY-MM`, ex.: `2031-01`).
- `WDO_CONTRACTS_MAX_MONTHS`: trava de segurança para evitar coletar meses demais por engano.

## Solução de Problemas
- **Erro de Versão do Chrome**: O script tenta detectar a versão. Se falhar, verifique se o `undetected-chromedriver` está atualizado (`pip install --upgrade undetected-chromedriver`).
- **Bloqueio do Barchart (429 Too Many Requests)**: O script usa delays aleatórios. Se ocorrer erro 429, aguarde alguns minutos antes de tentar novamente.
- **Travamento**: Se parecer travado, verifique o console. O script imprime o progresso da coleta de páginas.
