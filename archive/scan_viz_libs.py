import json

nb_path = "USDBRL_AnaliseDeOpcoes - Rev4.ipynb"
try:
    with open(nb_path, 'r', encoding='utf-8') as f:
        nb = json.load(f)

    imports = set()
    plot_calls = 0
    
    for cell in nb['cells']:
        if cell['cell_type'] == 'code':
            src = "".join(cell['source'])
            for line in cell['source']:
                line = line.strip()
                if line.startswith('import ') or line.startswith('from '):
                    imports.add(line)
                if '.plot(' in line:
                    plot_calls += 1

    print("Imports found:")
    for imp in sorted(imports):
        print(imp)
    
    print(f"\nPandas .plot() calls found: {plot_calls}")

except Exception as e:
    print(f"Error: {e}")
