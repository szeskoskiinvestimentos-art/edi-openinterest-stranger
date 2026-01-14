
import subprocess
import sys
import time

def run_script(script_name):
    print(f"--- Executando {script_name} ---")
    try:
        # Usar sys.executable para garantir o mesmo python
        result = subprocess.run([sys.executable, script_name], check=True, capture_output=False)
        print(f"--- {script_name} concluído com sucesso ---\n")
        return True
    except subprocess.CalledProcessError as e:
        print(f"!!! Erro ao executar {script_name}: {e}")
        return False

if __name__ == "__main__":
    start_time = time.time()
    
    # 1. Gerar Gráficos e HTMLs base
    if not run_script('run_notebook_headless.py'):
        print("Abortando devido a erro no script principal.")
        sys.exit(1)
        
    # 2. Construir Dashboard Unificado
    run_script('build_dashboard_v2.py')
    
    # 3. Atualizar Links
    run_script('update_index_link.py')
    
    # 4. Copiar index.html para a raiz
    print("--- Copiando index.html para a raiz ---")
    try:
        import shutil
        shutil.copy('exports/index.html', 'index.html')
        print("index.html copiado para a raiz com sucesso.\n")
    except Exception as e:
        print(f"!!! Erro ao copiar index.html: {e}")
    
    print(f"=== Processo Completo Finalizado em {time.time() - start_time:.1f}s ===")
