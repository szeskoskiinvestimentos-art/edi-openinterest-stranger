import os
import subprocess
from datetime import datetime
import plotly.io as pio
from src.data_loader import load_data
from src.calculator import OptionsCalculator
from src.charts import create_dashboard_figure, create_analysis_figure, create_summary_table, create_exploded_charts
from src.tables import create_detailed_table, create_model_comparison_table
from src.ntsl import generate_ntsl_script
from src import config as settings


def auto_push_dashboard_v1():
    try:
        print("\n=== Enviando dashboard V1 para o Git ===")
        subprocess.run(["git", "add", "dashboard_v1"], check=True)
        subprocess.run(["git", "add", "dashboard_v3.html"], check=False)
        subprocess.run(["git", "add", "Script_ProfitChart_NTSL.txt"], check=False)
        status = subprocess.run(
            ["git", "status", "--porcelain"],
            capture_output=True,
            text=True,
            check=True,
        )
        if not status.stdout.strip():
            print("Nenhuma alteração para enviar ao Git.")
            return
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")
        message = f"Atualiza dashboards após execução do main.py ({timestamp})"
        subprocess.run(["git", "commit", "-m", message], check=True)
        subprocess.run(["git", "push"], check=True)
        print("Envio para o Git concluído com sucesso.")
    except FileNotFoundError:
        print("AVISO: Git não encontrado no sistema. Pulei a etapa de envio automático.")
    except subprocess.CalledProcessError as e:
        print(f"AVISO: Falha ao executar comando Git: {e}")
    except Exception as e:
        print(f"AVISO: Erro inesperado ao enviar para o Git: {e}")

def main():
    print("=== Gerador de Dashboard de Opções v3.0 ===")
    print("Iniciando processo...")
    
    try:
        # 1. Carregar Dados
        print("Carregando dados CSV...")
        # Assume que os CSVs estão no diretório atual ou subdiretórios
        # Verifica se há CSVs na raiz, senão tenta 'Histórico barchart'
        target_dir = 'data_input'
        
        if os.path.exists(target_dir) and any(f.endswith('.csv') for f in os.listdir(target_dir)):
             print(f"Utilizando diretório de dados: {target_dir}")
        else:
            target_dir = '.'
            has_csv_root = any(f.endswith('.csv') for f in os.listdir('.') if os.path.isfile(f))
            if not has_csv_root and os.path.exists('Histórico barchart'):
                target_dir = 'Histórico barchart'
                print(f"Redirecionando busca para: {target_dir}")
    
        options_df, spot, expiry = load_data(directory=target_dir, use_csv_spot=settings.USE_CSV_SPOT, spot_override=settings.SPOT)
        
        if options_df.empty:
            print("ERRO CRÍTICO: Nenhum dado de opções encontrado nos arquivos CSV.")
            print("Verifique se há arquivos CSV no diretório atual.")
            return
    
        print(f"Dados carregados com sucesso.")
        print(f"  - Spot Atual: {spot}")
        print(f"  - Vencimento Detectado: {expiry}")
        print(f"  - Total de Strikes Carregados: {len(options_df['StrikeK'].unique())}")
        
        # 2. Calcular Métricas
        print("Calculando Griegas (Delta, Gamma, Vega, Theta) e Métricas Derivadas (Charm, Vanna)...")
        try:
            calc = OptionsCalculator(options_df, spot, expiry)
            calc.calculate_greeks_exposure()
            calc.calculate_flips_and_walls()
            calc.calculate_max_pain()
            calc.calculate_expected_moves()
            calc.calculate_mm_pnl_simulation()
            metrics = calc.get_summary_metrics()
            print("Cálculos concluídos.")
            print(f"  - Regime Detectado: {metrics['regime']}")
            print(f"  - Gamma Flip: {metrics['gamma_flip']}")
            print(f"  - Call Wall: {metrics['call_wall']}")
            print(f"  - Put Wall: {metrics['put_wall']}")
        except Exception as e:
            print(f"ERRO nos cálculos: {e}")
            import traceback
            traceback.print_exc()
            return
        
        # 3. Gerar Gráficos
        print("Gerando visualizações interativas...")
        try:
            # Tabela de Resumo
            fig_table = create_summary_table(metrics)
    
            # Tabelas Adicionais (Detalhada e Comparativo)
            fig_detailed = create_detailed_table(calc, metrics)
            fig_models = create_model_comparison_table(calc)
            
            # Gráfico Analítico (Análise Detalhada)
            fig_analysis = create_analysis_figure(calc, metrics)
            
            # Gráficos Individuais (Explodidos)
            exploded_charts = create_exploded_charts(calc, metrics)
    
            # Gerar Script NTSL
            ntsl_code = generate_ntsl_script(metrics, calc)
            with open("Script_ProfitChart_NTSL.txt", "w", encoding="utf-8") as f:
                f.write(ntsl_code)
            print("Script NTSL gerado: Script_ProfitChart_NTSL.txt")
            
        except Exception as e:
            print(f"ERRO na geração de gráficos: {e}")
            import traceback
            traceback.print_exc()
            return
        
        # 4. Salvar HTML Combinado
        output_file = "dashboard_v3.html"
        print(f"Salvando arquivo final: {output_file}...")
        try:
            # Calcular Simulação de Valor Justo
            fair_value_sim = calc.calculate_fair_value_scenario(target_spot=calc.call_wall, target_days_from_now=0) # Exemplo inicial: Call Wall
            
            # Converter figuras para HTML div strings
            html_table = pio.to_html(fig_table, include_plotlyjs=True, full_html=False)
            html_detailed = pio.to_html(fig_detailed, include_plotlyjs=False, full_html=False)
            html_models = pio.to_html(fig_models, include_plotlyjs=False, full_html=False)
            html_analysis = pio.to_html(fig_analysis, include_plotlyjs=False, full_html=False)
            
            # Gerar Tabela HTML de Simulação (Simples)
            html_sim_table = """
            <table style="width:100%; border-collapse: collapse; text-align: center; color: #e0e0e0;">
                <thead>
                    <tr style="background-color: #333;">
                        <th style="padding: 8px;">Strike</th>
                        <th style="padding: 8px;">Call (Agora)</th>
                        <th style="padding: 8px;">Call (Simul)</th>
                        <th style="padding: 8px;">Var% Call</th>
                        <th style="padding: 8px;">Put (Agora)</th>
                        <th style="padding: 8px;">Put (Simul)</th>
                        <th style="padding: 8px;">Var% Put</th>
                    </tr>
                </thead>
                <tbody>
            """
            for row in fair_value_sim:
                color_call = "#4caf50" if row['Call_Chg'] > 0 else "#f44336"
                color_put = "#4caf50" if row['Put_Chg'] > 0 else "#f44336"
                html_sim_table += f"""
                    <tr style="border-bottom: 1px solid #444;">
                        <td style="padding: 8px;">{row['Strike']:.2f}</td>
                        <td style="padding: 8px;">{row['Call_Now']:.2f}</td>
                        <td style="padding: 8px;">{row['Call_Sim']:.2f}</td>
                        <td style="padding: 8px; color: {color_call};">{row['Call_Chg']:.1f}%</td>
                        <td style="padding: 8px;">{row['Put_Now']:.2f}</td>
                        <td style="padding: 8px;">{row['Put_Sim']:.2f}</td>
                        <td style="padding: 8px; color: {color_put};">{row['Put_Chg']:.1f}%</td>
                    </tr>
                """
            html_sim_table += "</tbody></table>"
    
            html_charts = []
            # Prepara lista para TOC
            toc_items = [
                '<li><a href="#section_1">1. Resumo Executivo</a></li>',
                '<li><a href="#section_sim">1.1 Simulação de Valor Justo (Fair Value)</a></li>',
                '<li><a href="#section_2">2. Tabela Detalhada (Fig 3)</a></li>',
                '<li><a href="#section_3">3. Comparativo de Modelos Flip/Delta</a></li>',
                '<li><a href="#section_4">4. Análise Detalhada de Estrutura</a></li>',
                '<li><a href="#section_ntsl">5. Código NTSL (ProfitChart)</a></li>'
            ]
            
            exploded_start_idx = 6
            for i, (title, fig) in enumerate(exploded_charts):
                idx = exploded_start_idx + i
                html_div = pio.to_html(fig, include_plotlyjs=False, full_html=False)
                section_id = f"section_{idx}"
                toc_items.append(f'<li><a href="#{section_id}">{idx}. {title}</a></li>')
                html_charts.append((title, html_div, section_id, idx))
            
            toc_html = f"""
            <div class="section">
                <h2>Índice</h2>
                <ul>
                    {''.join(toc_items)}
                </ul>
            </div>
            """
    
            # Estilos CSS (com suporte a quebra de página para impressão/PDF)
            style = """
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0e0e0e; color: #e0e0e0; margin: 0; padding: 20px; }
                .container { max_width: 1200px; margin: 0 auto; }
                .section { margin-bottom: 30px; background-color: #1a1a1a; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.3); }
                /* Força quebra de página antes desta classe na impressão/PDF */
                .page-break { page-break-before: always; }
                h1 { color: #fff; border-bottom: 2px solid #333; padding-bottom: 10px; }
                h2 { color: #4db8ff; margin-top: 0; }
                a { color: #4db8ff; text-decoration: none; }
                a:hover { text-decoration: underline; }
                ul { list-style-type: none; padding: 0; }
                li { margin-bottom: 8px; }
                .footer { font-size: 0.8em; color: #666; text-align: center; margin-top: 20px; }
                pre { background-color: #333; padding: 10px; border-radius: 4px; overflow-x: auto; }
                .copy-btn {
                    background-color: #4db8ff;
                    color: #0e0e0e;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: bold;
                    margin-bottom: 10px;
                    font-family: inherit;
                }
                .copy-btn:hover {
                    background-color: #3399cc;
                }
            """
            
            script_js = """
            <script>
                function copyToClipboard() {
                    const codeBlock = document.getElementById('ntsl-code');
                    const text = codeBlock.innerText;
                    navigator.clipboard.writeText(text).then(() => {
                        const btn = document.getElementById('copyBtn');
                        const originalText = btn.innerText;
                        btn.innerText = 'Copiado!';
                        setTimeout(() => {
                            btn.innerText = originalText;
                        }, 2000);
                    }).catch(err => {
                        console.error('Falha ao copiar: ', err);
                        alert('Erro ao copiar automaticamente. Por favor, selecione e copie manualmente.');
                    });
                }
            </script>
            """
            
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Relatório Gamma V3</title>
                <style>{style}</style>
                {script_js}
            </head>
            <body>
                <div class="container">
                    <h1>Relatório Gamma Diário - {metrics['dataref']}</h1>
                    
                    {toc_html}
                    
                    <div id="section_1" class="section page-break">
                        <h2>1. Resumo Executivo</h2>
                        {html_table}
                    </div>
    
                    <div id="section_sim" class="section">
                        <h2>1.1 Simulação de Valor Justo (Cenário: Alvo na Call Wall)</h2>
                        <p>Estimativa de preço das opções caso o mercado atinja a Call Wall hoje (mantendo IV constante).</p>
                        {html_sim_table}
                    </div>
                    
                    <div id="section_2" class="section page-break">
                        <h2>2. Tabela Detalhada (Fig 3)</h2>
                        {html_detailed}
                    </div>
    
                    <div id="section_3" class="section page-break">
                        <h2>3. Comparativo de Modelos Flip/Delta</h2>
                        {html_models}
                    </div>
                    
                    <div id="section_4" class="section page-break">
                        <h2>4. Análise Detalhada de Estrutura</h2>
                        <p>Visualização focada em Delta Agregado, Gamma Flip e Walls.</p>
                        {html_analysis}
                    </div>
    
                    <div id="section_ntsl" class="section page-break">
                        <h2>5. Código NTSL (ProfitChart)</h2>
                        <p>Copie o código abaixo e cole no Editor de Estratégias do ProfitChart.</p>
                        <button id="copyBtn" class="copy-btn" onclick="copyToClipboard()">Copiar Código</button>
                        <pre><code id="ntsl-code">{ntsl_code}</code></pre>
                    </div>
            """
            
            # Adicionar gráficos explodidos, cada um em sua seção (com quebra de página)
            for title, div, sec_id, idx in html_charts:
                html_content += f"""
                    <div id="{sec_id}" class="section page-break">
                        <h2>{idx}. {title}</h2>
                        {div}
                    </div>
                """
                
            html_content += f"""
                    <div class="footer">
                        Gerado automaticamente por Gamma Dashboard V3.0 | Spot: {spot:.2f} | Exp: {expiry}
                    </div>
                </div>
            </body>
            </html>
            """
            
            with open(output_file, "w", encoding="utf-8") as f:
                f.write(html_content)
            print(f"SUCESSO! Dashboard salvo em {os.path.abspath(output_file)}")
        except Exception as e:
            print(f"ERRO ao salvar arquivo: {e}")
            import traceback
            traceback.print_exc()
            # Não retorna, tenta atualizar V1 mesmo assim
            
        # 5. Atualizar Dashboard V1 (Stranger Things) - PRIORIDADE ALTA
        # Executa antes do PDF para garantir que o dashboard principal esteja atualizado
        print("\n=== Atualização Automática Dashboard V1 ===")
        print("Executando export_v1_data.py para recalcular gregas e atualizar NTSL...")
        try:
            import export_v1_data
            # Recarrega o módulo caso já tenha sido importado
            import importlib
            importlib.reload(export_v1_data)
            export_v1_data.main()
            print(">> Dashboard V1 e código NTSL atualizados com sucesso!")
        except ImportError:
            print("ERRO: Módulo export_v1_data.py não encontrado.")
        except Exception as e:
            print(f"ERRO CRÍTICO ao atualizar Dashboard V1: {e}")
            import traceback
            traceback.print_exc()
    
        # 6. Gerar PDF (Playwright) - Passo Final (Pode demorar)
        print("\nGerando PDF (Playwright)...")
        try:
            from src.pdf_generator import export_to_pdf
            pdf_file = "dashboard_v3.pdf"
            export_to_pdf(output_file, pdf_file)
        except ImportError:
            print("AVISO: Playwright não instalado. Pulando etapa de PDF.")
        except Exception as e:
            print(f"ERRO ao gerar PDF: {e}")

        print("\nRotina concluída. Iniciando envio automático para o Git...")
        auto_push_dashboard_v1()
            
    except KeyboardInterrupt:
        print("\n\n!!! Operação cancelada pelo usuário (KeyboardInterrupt) !!!")
        print("Saindo com segurança...")
        return
        
if __name__ == "__main__":
    main()
