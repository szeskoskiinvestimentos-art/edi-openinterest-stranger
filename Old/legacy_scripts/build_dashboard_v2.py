import os
import glob
import json

def build_index_v2():
    print("Gerando Dashboard Profissional (Trading Station)...")
    
    # Carregar Métricas
    metrics = {}
    if os.path.exists('exports/metrics.json'):
        try:
            with open('exports/metrics.json', 'r', encoding='utf-8') as f:
                metrics = json.load(f)
        except: pass
        
    def fmt(v): 
        try: return f"{float(v):.2f}"
        except: return str(v)

    spot_val = fmt(metrics.get('spot', '---'))
    regime_val = metrics.get('regime', '---')
    clima_val = metrics.get('clima', '---')
    gflip_val = fmt(metrics.get('gamma_flip', '---'))
    dflip_val = fmt(metrics.get('delta_flip', '---'))
    
    # Categorias de Gráficos
    categories = {
        "PRINCIPAL": ["dashboard.html", "Figura3.html", "Figura4.html"],
        "EXPOSIÇÃO": ["Delta_Agregado.html", "Delta_Acumulado.html", "GEX.html", "Gamma_Exposure.html", "Gamma_Exposure_Curve.html"],
        "DETALHAMENTO FIG3": ["GEX_OI.html", "GEX_IV.html", "R_Gamma_PVOP.html", "Visao_Completa.html"],
        "FLUXO": ["Flow_Sentiment.html", "Fluxo_Hedge.html", "Charm_Flow.html", "Dealer_Pressure.html"],
        "ESTRUTURAL": ["OI_Strike.html", "Vanna_Sensitivity.html", "Vanna_Exposure.html", "Theta_Exposure.html", "Charm_Exposure.html"],
        "OVERLAYS": ["Overlay_Fibo.html", "Overlay_Range_Walls.html", "Overlay_Range.html", "Overlay_Walls.html", "Overlay_Clean.html"],
        "RISCO": ["Gamma_Flip_Cone.html", "Delta_Flip_Profile.html", "Gamma_Flip_Analysis.html", "Pin_Risk.html", "Rails_Bounce.html", "Expiry_Pressure.html"],
        "DADOS": ["Figura3_Tabela.html", "Figura4_Tabela.html"]
    }

    # Descrições manuais para enriquecer a UI
    desc_map = {
        "dashboard.html": "Relatório sequencial completo com guia explicativo.",
        "Figura3.html": "Painel Mestre: Delta, Gamma e OI combinados.",
        "Figura4.html": "Estrutura de Gamma e análise de Flips.",
        "Delta_Agregado.html": "Exposição líquida de Delta por strike.",
        "Gamma_Exposure.html": "Exposição de Gamma (GEX) dos Market Makers.",
        "GEX.html": "Exposição Gamma (GEX) isolada (Nova Visualização).",
        "GEX_OI.html": "Relação GEX vs Open Interest.",
        "GEX_IV.html": "Superfície de Volatilidade Implícita no GEX.",
        "R_Gamma_PVOP.html": "Perfil de Volume e Gamma relativo.",
        "Visao_Completa.html": "Visão integrada de todos os componentes da Figura 3.",
        "Flow_Sentiment.html": "Fluxo de agressão e sentimento de mercado.",
        "Gamma_Flip_Cone.html": "Projeção de volatilidade e níveis de flip.",
        "Dealer_Pressure.html": "Índice de pressão dos Dealers nos strikes.",
        "OI_Strike.html": "Distribuição de contratos em aberto (Call/Put).",
        "Delta_Acumulado.html": "Soma cumulativa de delta ao longo dos strikes.",
        "Fluxo_Hedge.html": "Necessidade estimada de hedge dinâmico.",
        "Vanna_Exposure.html": "Impacto da mudança de Volatilidade no Delta.",
        "Charm_Exposure.html": "Impacto da passagem do Tempo no Delta.",
        "Theta_Exposure.html": "Decaimento temporal da carteira (Theta).",
        "Gamma_Flip_Analysis.html": "Comparativo de múltiplos modelos de Flip.",
        "Overlay_Fibo.html": "Níveis de Fibonacci sobrepostos.",
        "Overlay_Range_Walls.html": "Range do dia e Walls de liquidez.",
        "Overlay_Range.html": "Foco no Range de negociação estimado.",
        "Overlay_Walls.html": "Foco nas barreiras de liquidez (Walls).",
        "Overlay_Clean.html": "Gráfico limpo para análise de preço.",
        "Figura3_Tabela.html": "Dados brutos do Painel Mestre.",
        "Figura4_Tabela.html": "Dados brutos do Painel GEX."
    }
    
    # Encontrar todos os arquivos
    all_files = [os.path.basename(f) for f in glob.glob('exports/*.html')]
    
    # Construir HTML
    html = f"""<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EDI - Trading Station</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {{
            --bg-dark: #0f172a;
            --bg-card: #1e293b;
            --bg-hover: #334155;
            --text-main: #f1f5f9;
            --text-muted: #94a3b8;
            --accent: #3b82f6;
            --accent-hover: #2563eb;
            --success: #10b981;
            --danger: #ef4444;
            --border: #334155;
        }}
        body {{ background-color: var(--bg-dark); color: var(--text-main); font-family: 'Inter', sans-serif; margin: 0; padding: 0; display: flex; height: 100vh; overflow: hidden; }}
        
        /* Sidebar */
        .sidebar {{ width: 260px; background: #0b1120; border-right: 1px solid var(--border); display: flex; flex-direction: column; flex-shrink: 0; }}
        .brand {{ padding: 24px; border-bottom: 1px solid var(--border); }}
        .brand h1 {{ margin: 0; font-size: 1.25rem; color: var(--accent); letter-spacing: -0.5px; }}
        .brand span {{ font-size: 0.75rem; color: var(--text-muted); font-weight: normal; display: block; margin-top: 4px; }}
        
        .nav {{ flex: 1; padding: 20px 0; overflow-y: auto; }}
        .nav-item {{ display: block; padding: 12px 24px; color: var(--text-muted); text-decoration: none; font-size: 0.9rem; transition: all 0.2s; border-left: 3px solid transparent; }}
        .nav-item:hover, .nav-item.active {{ background: rgba(59, 130, 246, 0.1); color: var(--text-main); border-left-color: var(--accent); }}
        .nav-header {{ padding: 20px 24px 8px; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 1px; color: #475569; font-weight: 700; }}
        
        .footer {{ padding: 20px; font-size: 0.75rem; color: #475569; border-top: 1px solid var(--border); text-align: center; }}

        /* Main Content */
        .main {{ flex: 1; display: flex; flex-direction: column; overflow: hidden; }}
        
        /* Top Bar Metrics */
        .topbar {{ height: 60px; background: #0b1120; border-bottom: 1px solid var(--border); display: flex; align-items: center; padding: 0 24px; gap: 24px; flex-shrink: 0; overflow-x: auto; white-space: nowrap; }}
        .metric {{ display: flex; flex-direction: column; }}
        .metric-label {{ font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; }}
        .metric-value {{ font-size: 1rem; font-weight: 600; color: var(--text-main); font-feature-settings: "tnum"; }}
        .metric-value.up {{ color: var(--success); }}
        .metric-value.down {{ color: var(--danger); }}
        .divider {{ width: 1px; height: 30px; background: var(--border); }}

        /* Content Area */
        .content {{ flex: 1; overflow-y: auto; padding: 30px; scroll-behavior: smooth; }}
        .section-title {{ font-size: 1.5rem; font-weight: 700; margin-bottom: 20px; color: var(--text-main); display: flex; align-items: center; gap: 10px; }}
        .section-title::before {{ content: ''; width: 6px; height: 24px; background: var(--accent); border-radius: 2px; display: inline-block; }}
        
        .grid {{ display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px; margin-bottom: 40px; }}
        
        .card {{ background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s; display: flex; flex-direction: column; }}
        .card:hover {{ transform: translateY(-4px); box-shadow: 0 10px 20px rgba(0,0,0,0.3); border-color: var(--accent); }}
        
        .card-body {{ padding: 20px; flex: 1; }}
        .card-tag {{ font-size: 0.7rem; font-weight: 700; color: var(--accent); text-transform: uppercase; margin-bottom: 8px; display: inline-block; background: rgba(59, 130, 246, 0.1); padding: 4px 8px; border-radius: 4px; }}
        .card h3 {{ margin: 0 0 8px 0; font-size: 1.1rem; font-weight: 600; color: #fff; }}
        .card p {{ margin: 0; font-size: 0.85rem; color: var(--text-muted); line-height: 1.5; }}
        
        .card-footer {{ padding: 15px 20px; background: rgba(0,0,0,0.2); border-top: 1px solid var(--border); display: flex; gap: 10px; }}
        .btn {{ flex: 1; text-align: center; padding: 10px; border-radius: 6px; font-size: 0.85rem; font-weight: 600; text-decoration: none; transition: all 0.2s; }}
        .btn-primary {{ background: var(--accent); color: white; }}
        .btn-primary:hover {{ background: var(--accent-hover); }}
        .btn-outline {{ background: transparent; border: 1px solid var(--border); color: var(--text-muted); }}
        .btn-outline:hover {{ border-color: var(--text-muted); color: var(--text-main); }}

        /* Scrollbar */
        ::-webkit-scrollbar {{ width: 8px; height: 8px; }}
        ::-webkit-scrollbar-track {{ background: #0b1120; }}
        ::-webkit-scrollbar-thumb {{ background: #334155; border-radius: 4px; }}
        ::-webkit-scrollbar-thumb:hover {{ background: #475569; }}

        @media print {{
            @page {{ 
                size: A4 landscape; 
                margin: 5mm; 
            }}
            body {{ 
                background-color: #0f172a !important; 
                -webkit-print-color-adjust: exact; 
                print-color-adjust: exact; 
                color: #f1f5f9 !important; 
                overflow: visible !important;
                height: auto !important;
            }}
            .sidebar, .topbar, .no-print {{ 
                display: none !important; 
            }}
            .main {{
                display: block !important;
            }}
            .content {{ 
                margin: 0 !important; 
                padding: 0 !important;
                width: 100% !important; 
                height: auto !important;
                overflow: visible !important;
            }}
            .grid {{
                display: block !important;
            }}
            .card {{ 
                break-inside: avoid; 
                page-break-inside: avoid; 
                background-color: #1e293b !important; 
                border: 1px solid #334155 !important; 
                margin-bottom: 20px !important;
                box-shadow: none !important;
                width: 100% !important;
            }}
            .card h3 {{
                color: #3b82f6 !important;
            }}
            .card p {{
                color: #94a3b8 !important;
            }}
            iframe {{
                height: 600px !important; 
                width: 100% !important;
                page-break-inside: avoid;
            }}
            ::-webkit-scrollbar {{ display: none; }}
        }}
    </style>
</head>
<body>

    <!-- Sidebar -->
    <nav class="sidebar">
        <div class="brand">
            <h1>EDI System</h1>
            <span>Intelligence Station</span>
        </div>
        <div class="nav">
            <div class="nav-header">Navegação</div>
"""
    # Gerar Links da Sidebar
    for cat in categories.keys():
        html += f'<a href="#{cat}" class="nav-item">{cat.title()}</a>'
    
    html += f"""
        </div>
        <div style="padding: 0 24px 20px;">
            <button onclick="window.print()" style="width: 100%; background: #3b82f6; color: white; border: none; padding: 12px; border-radius: 6px; cursor: pointer; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px; transition: background 0.2s; box-shadow: 0 4px 6px rgba(0,0,0,0.2);">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V2h12v7"></path><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2-2v5a2 2 0 0 1-2 2h-2"></path><path d="M6 14h12v8H6z"></path></svg>
                Salvar PDF
            </button>
        </div>
        <div class="footer">
            &copy; 2025 EDI Analytics<br>v2.1 Updated
        </div>
    </nav>

    <!-- Main Area -->
    <main class="main">
        <!-- Top Bar -->
        <div class="topbar">
            <div class="metric">
                <span class="metric-label">Spot Price</span>
                <span class="metric-value">{spot_val}</span>
            </div>
            <div class="divider"></div>
            <div class="metric">
                <span class="metric-label">Regime</span>
                <span class="metric-value" style="color: {'#10b981' if 'Positivo' in regime_val else '#ef4444'}">{regime_val}</span>
            </div>
            <div class="divider"></div>
             <div class="metric">
                <span class="metric-label">Clima</span>
                <span class="metric-value">{clima_val}</span>
            </div>
            <div class="divider"></div>
            <div class="metric">
                <span class="metric-label">Gamma Flip</span>
                <span class="metric-value" style="color: #f59e0b">{gflip_val}</span>
            </div>
            <div class="divider"></div>
            <div class="metric">
                <span class="metric-label">Delta Flip</span>
                <span class="metric-value" style="color: #a855f7">{dflip_val}</span>
            </div>
            <div style="flex:1"></div>
            <button id="copyNtsl" class="btn btn-outline" style="min-width:140px">Copiar NTSL</button>
        </div>

        <!-- Content -->
        <div class="content">
"""
    
    # Gerar Seções
    for cat, files in categories.items():
        html += f"""
            <div id="{cat}" style="padding-top: 20px;">
                <h2 class="section-title">{cat}</h2>
                <div class="grid">
        """
        
        for f in files:
            if f in all_files:
                name = f.replace(".html", "").replace("_", " ")
                desc = desc_map.get(f, "Análise detalhada do mercado de opções.")
                
                # Highlight Dashboard
                is_dash = "dashboard.html" in f
                btn_cls = "btn-primary" if is_dash else "btn-outline"
                
                html += f"""
                    <div class="card">
                        <div class="card-body">
                            <span class="card-tag">{cat}</span>
                            <h3>{name}</h3>
                            <p>{desc}</p>
                        </div>
                        <div class="card-footer">
                            <a href="{f}" target="_blank" class="{btn_cls}">Abrir Painel &#8599;</a>
                        </div>
                    </div>
                """
        html += """
                </div>
            </div>
        """

    html += """
        </div>
    </main>

    <script>
        // Simples script para marcar link ativo na sidebar
        const links = document.querySelectorAll('.nav-item');
        const content = document.querySelector('.content');
        
        // Ativar no scroll
        content.addEventListener('scroll', () => {
            let current = '';
            document.querySelectorAll('[id]').forEach(section => {
                const sectionTop = section.offsetTop;
                if (content.scrollTop >= sectionTop - 100) {
                    current = section.getAttribute('id');
                }
            });
            links.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href').includes(current)) {
                    link.classList.add('active');
                }
            });
        });
        const btn = document.getElementById('copyNtsl');
        if (btn) {
            btn.addEventListener('click', async () => {
                try {
                    const resp = await fetch('Profit_NTSL.txt');
                    const txt = await resp.text();
                    await navigator.clipboard.writeText(txt);
                    btn.textContent = 'Copiado ✔';
                    setTimeout(()=>btn.textContent='Copiar NTSL',1500);
                } catch(e) {
                    window.open('Profit_NTSL.txt','_blank');
                }
            });
        }
    </script>
</body>
</html>"""

    with open('exports/index.html', 'w', encoding='utf-8') as f:
        f.write(html)
    print("index.html (Trading Station) gerado com sucesso.")

def build_full_dashboard():
    print("Iniciando construção do Dashboard Completo...")
    
    # 1. Carregar NTSL
    ntsl_content = ""
    if os.path.exists('exports/Profit_NTSL.txt'):
        with open('exports/Profit_NTSL.txt', 'r', encoding='utf-8') as f:
            ntsl_content = f.read().replace('\n', '<br>')
    
    # 2. Carregar Tabelas
    tables_html = ""
    for tbl_file in ['Figura3_Tabela.html', 'Figura4_Tabela.html', 'Gamma_Flip_Analysis.html']:
        path = f'exports/{tbl_file}'
        if os.path.exists(path):
            with open(path, 'r', encoding='utf-8') as f:
                c = f.read()
                if '<body' in c:
                    try:
                        c = c.split('<body')[1].split('>', 1)[1].split('</body>')[0]
                    except: pass
                c = c.replace('<script src="help.js"></script>', '')
                tables_html += f'<div class="section-card"><h3>Dados: {tbl_file.replace(".html","").replace("_"," ")}</h3>{c}</div>'

    # 3. Lista de Gráficos

    priority_charts = [
        'Figura3.html', 'Figura4.html',
        'Delta_Agregado.html', 'Gamma_Exposure.html', 'GEX.html', 'OI_Strike.html', 
        'Flow_Sentiment.html', 'Fluxo_Hedge.html', 
        'Gamma_Flip_Cone.html', 'Delta_Flip_Profile.html',
        'Dealer_Pressure.html', 'Charm_Exposure.html', 'Vanna_Exposure.html',
        'Theta_Exposure.html', 'Gamma_Exposure_Curve.html'
    ]
    
    all_htmls = [os.path.basename(x) for x in glob.glob('exports/*.html')]
    ignore = ['index.html', 'dashboard.html', 'relatorio_completo.html', 'name.html', 
              'Figura3_Tabela.html', 'Figura4_Tabela.html', 'Gamma_Flip_Analysis.html']
    
    chart_cards = ""
    processed = set()
    
    for p in priority_charts:
        if p in all_htmls:
            processed.add(p)
            chart_cards += f'''
            <div class="chart-container">
                <div class="chart-header">
                    <h3>{p.replace(".html", "").replace("_", " ")}</h3>
                    <a href="{p}" target="_blank" class="btn-open">Abrir Individual &#8599;</a>
                </div>
                <iframe src="{p}" loading="lazy" title="{p}"></iframe>
            </div>
            '''
            
    for f in sorted(all_htmls):
        if f not in processed and f not in ignore:
            chart_cards += f'''
            <div class="chart-container">
                <div class="chart-header">
                    <h3>{f.replace(".html", "").replace("_", " ")}</h3>
                    <a href="{f}" target="_blank" class="btn-open">Abrir Individual &#8599;</a>
                </div>
                <iframe src="{f}" loading="lazy" title="{f}"></iframe>
            </div>
            '''

    html_template = f'''<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EDI - Dashboard Analítico</title>
    <style>
        body {{ background-color: #111827; color: #e5e7eb; font-family: 'Segoe UI', sans-serif; margin: 0; padding: 20px; }}
        h1, h2, h3 {{ color: #93c5fd; }}
        .header {{ display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #374151; padding-bottom: 20px; margin-bottom: 20px; }}
        .btn-home {{ background: #1f2937; color: #fff; padding: 8px 16px; text-decoration: none; border-radius: 6px; border: 1px solid #374151; transition: background 0.2s; }}
        .btn-home:hover {{ background: #374151; }}
        
        .help-intro {{ background: #1f2937; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; margin-bottom: 30px; }}
        .help-intro h2 {{ margin-top: 0; color: #60a5fa; }}
        .help-intro p {{ line-height: 1.6; color: #cbd5e1; }}
        
        .grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(650px, 1fr)); gap: 24px; margin-bottom: 40px; }}
        
        .section-card {{ background: #1f2937; padding: 20px; border-radius: 8px; border: 1px solid #374151; margin-bottom: 20px; overflow: auto; }}
        
        .chart-container {{ background: #1f2937; border-radius: 8px; border: 1px solid #374151; overflow: hidden; height: 650px; display: flex; flex-direction: column; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }}
        .chart-header {{ padding: 12px 16px; background: #374151; display: flex; justify-content: space-between; align-items: center; }}
        .chart-header h3 {{ margin: 0; font-size: 16px; font-weight: 600; }}
        .btn-open {{ font-size: 12px; color: #93c5fd; text-decoration: none; background: #111827; padding: 4px 8px; border-radius: 4px; }}
        
        iframe {{ flex-grow: 1; border: none; width: 100%; }}
        
        .ntsl-box {{ font-family: 'Consolas', monospace; white-space: pre-wrap; background: #0f172a; padding: 15px; border-radius: 4px; border: 1px solid #334155; color: #a5f3fc; font-size: 0.9rem; }}
    </style>
</head>
<body>
    <div class="header">
        <h1>EDI - Dashboard Analítico (Principal)</h1>
        <div>
            <a href="dashboard.html" class="btn-home">Relatório Sequencial</a>
        </div>
    </div>

    <!-- 1. Introdução / Ajuda -->
    <div class="help-intro">
        <h2>Guia de Leitura Rápida</h2>
        <p>
            Bem-vindo ao Dashboard de Inteligência de Mercado. <br>
            <strong>Gráficos:</strong> Cada painel abaixo é interativo. Use o zoom, pan e hover para ver detalhes. As linhas tracejadas indicam pontos críticos como Flips (inversão de regime), Walls (paredes de liquidez) e Range do dia.<br>
            <strong>Interpretação:</strong> Barras Verdes/Azuis indicam suporte ou call. Barras Vermelhas indicam resistência ou put.
        </p>
    </div>

    <!-- 2. Gráficos -->
    <h2>Painéis Gráficos Interativos</h2>
    <div class="grid">
        {chart_cards}
    </div>

    <!-- 3. Tabelas -->
    <div class="section-card">
        <h2>Tabelas Detalhadas & Dados Brutos</h2>
        {tables_html}
    </div>

    <!-- 4. NTSL (Profit) -->
    <div class="section-card">
        <h2>Indicador NTSL (Script para Profit)</h2>
        <div class="ntsl-box">{ntsl_content}</div>
    </div>

</body>
</html>'''

    # Salvar o arquivo antigo com outro nome para não sobrescrever o novo index
    print("Salvando dashboard legado em exports/dashboard_legacy.html...")
    with open('exports/dashboard_legacy.html', 'w', encoding='utf-8') as f:
        f.write(html_template)
    
    print("Dashboard legado gerado com sucesso!")

def build_sequential_report():
    print("Gerando Relatório Sequencial (dashboard.html)...")
    ntsl_content = ""
    if os.path.exists('exports/Profit_NTSL.txt'):
        with open('exports/Profit_NTSL.txt', 'r', encoding='utf-8') as f:
            ntsl_content = f.read().replace('\n', '<br>')
            
    # Reutilizar categorias do build_index_v2 para consistência
    categories = {
        "PRINCIPAL": ["dashboard.html", "Figura3.html", "Figura4.html"],
        "EXPOSIÇÃO": ["Delta_Agregado.html", "Delta_Acumulado.html", "GEX.html", "Gamma_Exposure.html", "Gamma_Exposure_Curve.html"],
        "DETALHAMENTO FIG3": ["GEX_OI.html", "GEX_IV.html", "R_Gamma_PVOP.html", "Visao_Completa.html"],
        "FLUXO": ["Flow_Sentiment.html", "Fluxo_Hedge.html", "Charm_Flow.html", "Dealer_Pressure.html"],
        "ESTRUTURAL": ["OI_Strike.html", "Vanna_Sensitivity.html", "Vanna_Exposure.html", "Theta_Exposure.html", "Charm_Exposure.html"],
        "OVERLAYS": ["Overlay_Fibo.html", "Overlay_Range_Walls.html", "Overlay_Range.html", "Overlay_Walls.html", "Overlay_Clean.html"],
        "RISCO": ["Gamma_Flip_Cone.html", "Delta_Flip_Profile.html", "Gamma_Flip_Analysis.html", "Pin_Risk.html", "Rails_Bounce.html", "Expiry_Pressure.html"],
        "DADOS": ["Figura3_Tabela.html", "Figura4_Tabela.html"]
    }

    all_htmls = [os.path.basename(x) for x in glob.glob('exports/*.html')]
    ignore = {'index.html', 'dashboard.html', 'name.html', 'relatorio_completo.html'}
    
    explanations = {
        'Figura3.html': ('Painel Mestre', 'Integra Delta Agregado, Exposição de Gamma e OI por strike. Serve para identificar regime de mercado, zonas de suporte/resistência e sensibilidade a variações do spot. Leitura: observe o zero gamma, flips e paredes (walls) para mapear risco.'),
        'Figura4.html': ('Estrutura de Gamma', 'Mostra a distribuição detalhada de Gamma (Put vs Call) e os pontos de Flip. Importante para prever reversões e acelerações de movimento.'),
        'Delta_Agregado.html': ('Delta Líquido', 'Mostra o Delta líquido por strike. Barras altas indicam onde o mercado está posicionado (comprado ou vendido).'),
        'GEX.html': ('Gamma Exposure (GEX)', 'Exposição de Gamma dos Market Makers. Barras positivas (Long Gamma) inibem volatilidade; barras negativas (Short Gamma) amplificam.'),
        'Gamma_Exposure.html': ('GEX (Legacy)', 'Versão anterior do GEX.'),
        'Flow_Sentiment.html': ('Sentimento de Fluxo', 'Analisa a agressão de compra vs venda no curto prazo. Ajuda a confirmar tendências intraday.'),
        'Fluxo_Hedge.html': ('Fluxo de Hedge', 'Estima a necessidade de hedge dos dealers baseado na movimentação do spot.'),
        'OI_Strike.html': ('Open Interest', 'Contratos em aberto. Mostra onde está o "dinheiro" e o interesse dos players.'),
        'Overlay_Range_Walls.html': ('Range & Walls', 'Visualização focada nos limites operacionais do dia (Range) e barreiras de liquidez (Walls).'),
        'Visao_Completa.html': ('Visão Completa Fig3', 'Todos os componentes da Figura 3 em um único gráfico.'),
        'GEX_OI.html': ('GEX vs OI', 'Comparação direta entre exposição Gamma e contratos em aberto.'),
        'Overlay_Fibo.html': ('Fibo Overlay', 'Retrações e projeções de Fibonacci sobrepostas aos dados de mercado.'),
        'Overlay_Walls.html': ('Liquidity Walls', 'Foco exclusivo nas barreiras de liquidez.'),
        'Gamma_Flip_Cone.html': ('Gamma Flip Cone', 'Cone de projeção de volatilidade baseada no Gamma Flip.'),
        'Dealer_Pressure.html': ('Dealer Pressure', 'Pressão de compra/venda exercida pelos dealers.'),
        'Vanna_Sensitivity.html': ('Vanna Sensitivity', 'Sensibilidade do delta em relação à mudança na volatilidade.'),
        'Charm_Exposure.html': ('Charm Exposure', 'Decaimento do delta em relação ao tempo.'),
        'Pin_Risk.html': ('Pin Risk', 'Risco de pinagem em strikes com alto OI próximo ao vencimento.'),
        'Rails_Bounce.html': ('Rails & Bounce', 'Pontos de possível reversão ou aceleração baseados em níveis estruturais.'),
    }
    
    slides = ""
    processed_files = set()
    
    # Gerar slides por categoria
    for cat_name, file_list in categories.items():
        # Skip dashboard.html inside categories to avoid redundancy
        valid_files = [f for f in file_list if f in all_htmls and f not in ignore and f not in processed_files]
        
        if not valid_files:
            continue
            
        # Adicionar separador de categoria
        slides += f'''
        <div class="category-separator">
            <h1>{cat_name}</h1>
        </div>
        '''
        
        for f in valid_files:
            processed_files.add(f)
            title, desc = explanations.get(f, (f.replace('.html','').replace('_',' '), "Análise detalhada do componente."))
            
            slides += f'''
            <div class="slide" id="{f.replace('.html','')}">
                <div class="slide-text">
                    <span class="cat-tag">{cat_name}</span>
                    <h2>{title}</h2>
                    <p>{desc}</p>
                    <a href="{f}" target="_blank" class="btn-zoom">Abrir Zoom ⇗</a>
                </div>
                <div class="slide-chart">
                    <iframe src="{f}" loading="lazy"></iframe>
                </div>
            </div>
            '''
    
    # Adicionar arquivos restantes não categorizados
    others = [x for x in all_htmls if x not in ignore and x not in processed_files]
    if others:
        slides += '<div class="category-separator"><h1>OUTROS</h1></div>'
        for f in sorted(others):
            title, desc = explanations.get(f, (f.replace('.html','').replace('_',' '), "Gráfico complementar."))
            slides += f'''
            <div class="slide" id="{f.replace('.html','')}">
                <div class="slide-text">
                    <span class="cat-tag">EXTRA</span>
                    <h2>{title}</h2>
                    <p>{desc}</p>
                    <a href="{f}" target="_blank" class="btn-zoom">Abrir Zoom ⇗</a>
                </div>
                <div class="slide-chart">
                    <iframe src="{f}" loading="lazy"></iframe>
                </div>
            </div>
            '''
            
    html = f'''<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório Sequencial - EDI</title>
    <style>
        body {{ margin: 0; padding: 0; background: #000; color: #fff; font-family: 'Segoe UI', sans-serif; overflow-x: hidden; }}
        .slide {{ height: 100vh; display: flex; border-bottom: 1px solid #333; scroll-snap-align: start; }}
        .slide-text {{ width: 320px; padding: 40px; background: #0f172a; display: flex; flex-direction: column; justify-content: center; border-right: 1px solid #1e293b; box-shadow: 5px 0 15px rgba(0,0,0,0.3); z-index: 10; }}
        .slide-chart {{ flex: 1; background: #000; position: relative; }}
        iframe {{ width: 100%; height: 100%; border: none; }}
        h2 {{ color: #60a5fa; margin-top: 10px; font-size: 1.8rem; }}
        p {{ line-height: 1.6; color: #94a3b8; font-size: 1rem; }}
        .btn-zoom {{ margin-top: 20px; display: inline-block; color: #38bdf8; text-decoration: none; border: 1px solid #38bdf8; padding: 10px 20px; border-radius: 6px; text-align: center; transition: all 0.2s; font-weight: 600; }}
        .btn-zoom:hover {{ background: #38bdf8; color: #0f172a; }}
        .nav-fixed {{ position: fixed; top: 20px; right: 20px; z-index: 1000; background: rgba(15, 23, 42, 0.9); padding: 12px 20px; border-radius: 50px; border: 1px solid #334155; backdrop-filter: blur(5px); box-shadow: 0 4px 12px rgba(0,0,0,0.5); }}
        .nav-fixed a {{ color: #e2e8f0; text-decoration: none; margin-left: 0; font-weight: 600; font-size: 0.9rem; display: flex; align-items: center; gap: 8px; }}
        .nav-fixed a:hover {{ color: #38bdf8; }}
        
        .category-separator {{ height: 100vh; display: flex; align-items: center; justify-content: center; background: #020617; scroll-snap-align: start; text-align: center; border-bottom: 1px solid #1e293b; }}
        .category-separator h1 {{ font-size: 4rem; color: #1e293b; text-transform: uppercase; letter-spacing: 10px; margin: 0; font-weight: 800; background: linear-gradient(to right, #1e293b, #475569); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }}
        
        .cat-tag {{ font-size: 0.75rem; color: #f472b6; text-transform: uppercase; letter-spacing: 2px; font-weight: 700; background: rgba(244, 114, 182, 0.1); padding: 4px 10px; border-radius: 4px; align-self: flex-start; }}
        
        /* Scroll Snap */
        html {{ scroll-snap-type: y mandatory; }}
    </style>
</head>
<body>
    <div class="nav-fixed">
        <a href="index.html">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            Menu Principal
        </a>
    </div>
    {slides}
</body>
</html>'''

    with open('exports/dashboard.html', 'w', encoding='utf-8') as f:
        f.write(html)
    print("dashboard.html (Relatório Sequencial) gerado com sucesso.")

if __name__ == "__main__":
    build_index_v2()
    build_full_dashboard()
    build_sequential_report()
