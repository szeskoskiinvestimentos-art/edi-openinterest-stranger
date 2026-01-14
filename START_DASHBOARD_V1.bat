@echo off
title EDI Market Guardin V1 Server
color 0b
cls
echo ===================================================
echo.
echo     [ EDI MARKET GUARDIN - DASHBOARD V1 ]
echo.
echo     1. Atualizando dados de mercado...
python export_v1_data.py
echo.
echo     2. Iniciando servidor local...
echo     Acesse: http://localhost:8080/dashboard_v1/index.html
echo.
echo ===================================================
echo.

start http://localhost:8080/dashboard_v1/index.html
python -m http.server 8080
