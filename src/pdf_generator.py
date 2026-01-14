import os
from playwright.sync_api import sync_playwright

def export_to_pdf(html_path, output_path):
    """
    Converte um arquivo HTML local em PDF usando Playwright (Chromium).
    Aguarda o carregamento completo (networkidle) para garantir que gráficos (Plotly) sejam renderizados.
    """
    # Garante caminhos absolutos
    abs_html_path = os.path.abspath(html_path)
    abs_output_path = os.path.abspath(output_path)
    
    # URL no formato file:///
    file_url = f"file:///{abs_html_path.replace(os.sep, '/')}"

    print(f"Iniciando exportação PDF via Playwright...")
    print(f"  - Fonte: {file_url}")
    print(f"  - Destino: {abs_output_path}")

    with sync_playwright() as p:
        # Lança o navegador (headless=True é o padrão)
        browser = p.chromium.launch()
        page = browser.new_page()
        
        # Carrega a página e aguarda a rede ficar ociosa
        # Timeout de 60s para garantir
        page.goto(file_url, wait_until='networkidle', timeout=60000)
        
        # Aguarda especificamente que os gráficos sejam renderizados
        # A classe 'plotly-graph-div' é adicionada pelo Plotly
        try:
            page.wait_for_selector('.plotly-graph-div', state='visible', timeout=30000)
            # Pausa adicional para garantir que as animações/desenhos terminem
            page.wait_for_timeout(3000) 
        except Exception as e:
            print(f"AVISO: Timeout aguardando renderização dos gráficos: {e}")

        # Gera o PDF
        # format='A4' ou 'Letter'
        # print_background=True para manter cores de fundo (tema dark)
        page.pdf(
            path=abs_output_path,
            format='A4',
            print_background=True,
            landscape=True, # Dashboard costuma ser melhor em paisagem
            margin={'top': '1cm', 'right': '1cm', 'bottom': '1cm', 'left': '1cm'}
        )
        
        browser.close()
    
    print("PDF gerado com sucesso!")
