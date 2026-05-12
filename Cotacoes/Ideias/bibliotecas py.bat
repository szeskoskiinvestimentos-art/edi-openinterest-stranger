@echo off
chcp 65001 >nul
title 🚀 INSTALADOR COMPLETO - BIBLIOTECAS FINANCEIRAS PYTHON
color 0A
echo =======================================================
echo      INSTALANDO TODAS BIBLIOTECAS FINANCEIRAS PYTHON
echo =======================================================
echo.

:: Verificar se Python está instalado
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Python não encontrado!
    echo Instale Python primeiro: https://python.org
    echo Ou execute: winget install Python.Python.3.10
    echo.
    pause
    exit /b 1
)

echo [1] Atualizando pip...
python -m pip install --upgrade pip

echo.
echo [2] INSTALANDO BIBLIOTECAS DE DADOS FINANCEIROS...
echo =======================================================

:: Yahoo Finance e similares
echo [2.1] Yahoo Finance...
pip install yfinance
pip install yahoo-fin
pip install yahooquery
pip install pandas-datareader

:: Dados de mercado
echo [2.2] APIs de mercado...
pip install alpha-vantage
pip install quandl
pip install investpy
pip install tiingo
pip install iexfinance
pip install finnhub-python
pip install eodhd
pip install polygon-api-client

echo.
echo [3] BIBLIOTECAS DE ANÁLISE TÉCNICA...
echo =======================================================

:: Gráficos financeiros (mplfinance)
echo [3.1] Visualização financeira...
pip install mplfinance
pip install finplot
pip install plotly
pip install bokeh
pip install cufflinks

:: Análise técnica
echo [3.2] Análise técnica...
pip install ta
pip install pandas-ta
pip install ta-lib
pip install technical
pip install tradingview-ta
pip install finta

echo.
echo [4] BIBLIOTECAS DE ANÁLISE QUANTITATIVA...
echo =======================================================

echo [4.1] Backtesting e trading...
pip install backtrader
pip install zipline-reloaded
pip install pyalgotrade
pip install quantlib-python
pip install pyfolio
pip install empyrical
pip install riskfolio-lib

:: Machine Learning para finanças
echo [4.2] Machine Learning financeiro...
pip install scikit-learn
pip install xgboost
pip install lightgbm
pip install catboost
pip install tensorflow
pip install torch

echo.
echo [5] BIBLIOTECAS CORE PARA ANÁLISE...
echo =======================================================

echo [5.1] Análise de dados...
pip install pandas
pip install numpy
pip install scipy
pip install statsmodels
pip install arch

echo [5.2] Visualização...
pip install matplotlib
pip install seaborn
pip install plotly
pip install bokeh
pip install altair

echo.
echo [6] BIBLIOTECAS DE WEB SCRAPING E APIS...
echo =======================================================

echo [6.1] Web scraping...
pip install requests
pip install beautifulsoup4
pip install selenium
pip install scrapy
pip install lxml

echo [6.2] APIs específicas...
pip install tweepy              # Twitter
pip install praw                # Reddit
pip install google-api-python-client  # Google APIs
pip install yagmail             # Email

echo.
echo [7] BIBLIOTECAS UTILITÁRIAS...
echo =======================================================

echo [7.1] Utilitários...
pip install tqdm                # Barras de progresso
pip install jupyter             # Jupyter Notebook
pip install ipython
pip install openpyxl            # Excel
pip install xlrd                # Excel antigo
pip install pyarrow             # Parquet
pip install python-dotenv       # Variáveis de ambiente
pip install schedule            # Agendamento
pip install watchdog            # Monitoramento de arquivos
pip install psutil              # Sistema
pip install pyautogui           # Automação

echo.
echo [8] VERIFICANDO INSTALAÇÃO...
echo =======================================================

:: Criar script de verificação
echo import sys > verificar_instalacoes.py
echo print("=" * 60) >> verificar_instalacoes.py
echo print("VERIFICAÇÃO DAS BIBLIOTECAS INSTALADAS") >> verificar_instalacoes.py
echo print("=" * 60) >> verificar_instalacoes.py
echo. >> verificar_instalacoes.py

echo bibliotecas = [ >> verificar_instalacoes.py
echo     # Financeiras >> verificar_instalacoes.py
echo     "yfinance", "mplfinance", "pandas", "numpy", "matplotlib", >> verificar_instalacoes.py
echo     "ta", "pandas_ta", "plotly", "seaborn", "backtrader", >> verificar_instalacoes.py
echo     # Core >> verificar_instalacoes.py
echo     "scipy", "statsmodels", "sklearn", >> verificar_instalacoes.py
echo     # Web/APIs >> verificar_instalacoes.py
echo     "requests", "bs4", "selenium", >> verificar_instalacoes.py
echo     # Utilitários >> verificar_instalacoes.py
echo     "tqdm", "jupyter", "openpyxl", >> verificar_instalacoes.py
echo ] >> verificar_instalacoes.py

echo. >> verificar_instalacoes.py
echo for lib in bibliotecas: >> verificar_instalacoes.py
echo     try: >> verificar_instalacoes.py
echo         module = __import__(lib) >> verificar_instalacoes.py
echo         if hasattr(module, "__version__"): >> verificar_instalacoes.py
echo             print(f"✓ {lib:20} v{module.__version__}") >> verificar_instalacoes.py
echo         else: >> verificar_instalacoes.py
echo             print(f"✓ {lib:20} OK") >> verificar_instalacoes.py
echo     except ImportError: >> verificar_instalacoes.py
echo         print(f"✗ {lib:20} FALTA") >> verificar_instalacoes.py
echo     except Exception as e: >> verificar_instalacoes.py
echo         print(f"⚠ {lib:20} ERRO: {str(e)[:30]}") >> verificar_instalacoes.py
echo. >> verificar_instalacoes.py
echo print("=" * 60) >> verificar_instalacoes.py
echo print(f"Total verificado: {len(bibliotecas)} bibliotecas") >> verificar_instalacoes.py

python verificar_instalacoes.py
del verificar_instalacoes.py

echo.
echo [9] CRIANDO ARQUIVO requirements.txt...
echo =======================================================

:: Criar requirements.txt completo
pip freeze > requirements_completo.txt
echo ✅ Arquivo "requirements_completo.txt" criado!

echo.
echo [10] CRIANDO EXEMPLO DE CÓDIGO...
echo =======================================================

echo import yfinance as yf > exemplo_financas.py
echo import pandas as pd >> exemplo_financas.py
echo import mplfinance as mpf >> exemplo_financas.py
echo import pandas_ta as ta >> exemplo_financas.py
echo import matplotlib.pyplot as plt >> exemplo_financas.py
echo. >> exemplo_financas.py
echo # Baixar dados >> exemplo_financas.py
echo ticker = "AAPL" >> exemplo_financas.py
echo dados = yf.download(ticker, period="6mo") >> exemplo_financas.py
echo. >> exemplo_financas.py
echo # Calcular indicadores >> exemplo_financas.py
echo dados["RSI"] = ta.rsi(dados["Close"]) >> exemplo_financas.py
echo dados["EMA_20"] = ta.ema(dados["Close"], length=20) >> exemplo_financas.py
echo dados["MACD"] = ta.macd(dados["Close"]).iloc[:,0] >> exemplo_financas.py
echo. >> exemplo_financas.py
echo # Criar gráfico >> exemplo_financas.py
echo fig, axes = plt.subplots(3, 1, figsize=(12, 10)) >> exemplo_financas.py
echo. >> exemplo_financas.py
echo # Gráfico de candlestick >> exemplo_financas.py
echo mpf.plot(dados, type="candle", style="charles", >> exemplo_financas.py
echo          title=f"{ticker} - Análise Técnica", >> exemplo_financas.py
echo          volume=True, mav=(20,50), >> exemplo_financas.py
echo          savefig="grafico_candle.png") >> exemplo_financas.py
echo. >> exemplo_financas.py
echo print("✅ Análise completa!") >> exemplo_financas.py
echo print(f"Dados: {len(dados)} dias") >> exemplo_financas.py
echo print(f"Preço atual: {dados['Close'].iloc[-1]:.2f}") >> exemplo_financas.py
echo print(f"RSI atual: {dados['RSI'].iloc[-1]:.2f}") >> exemplo_financas.py

echo.
echo =======================================================
echo ✅ INSTALAÇÃO COMPLETA COM SUCESSO!
echo.
echo 📚 Bibliotecas instaladas:
echo    • yfinance, yahoo-fin, pandas-datareader
echo    • mplfinance, finplot, plotly
echo    • ta, pandas-ta, ta-lib
echo    • backtrader, zipline, pyfolio
echo    • pandas, numpy, matplotlib, seaborn
echo    • scikit-learn, tensorflow, torch
echo    • requests, beautifulsoup4, selenium
echo    • E muitas outras!
echo.
echo 🚀 Para testar:
echo    python exemplo_financas.py
echo.
echo 💾 Para replicar em outro computador:
echo    pip install -r requirements_completo.txt
echo.
echo ⚡ Dica: Crie ambientes virtuais para cada projeto!
echo    python -m venv meu_projeto
echo    meu_projeto\Scripts\activate
echo =======================================================
echo.
pause