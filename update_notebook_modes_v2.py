import json
import os

file_path = r'c:\Users\ednil\Downloads\Gamma\Edi_OpenInterest\USDBRL_AnaliseDeOpcoes - Rev4.ipynb'

with open(file_path, 'r', encoding='utf-8') as f:
    nb = json.load(f)

search_modes_full = """modes = [
    ('Delta_Agregado', 'Delta Agregado', 'Delta Agregado'),
    ('Delta_Acumulado', 'Delta Acumulado', 'Delta Acumulado'),
    ('Gamma_Exposure', 'Gamma Exposure', 'Gamma Exposure'),
    ('OI_Strike', 'Open Interest por Strike', 'Open Interest por Strike'),
    ('Charm_Exposure', 'Charm Exposure', 'Charm Exposure'),
    ('Vanna_Exposure', 'Vanna Exposure', 'Vanna Exposure'),
    ('Theta_Exposure', 'Theta Exposure', 'Theta Exposure'),
    ('Delta_Flip_Profile', 'Delta Flip Profile', 'Delta Flip Profile')
]"""

new_modes_full = """modes = [
    ('Delta_Agregado', 'Delta Agregado', 'Delta Agregado'),
    ('Delta_Acumulado', 'Delta Acumulado', 'Delta Acumulado'),
    ('Gamma_Exposure', 'Gamma Exposure', 'Gamma Exposure'),
    ('OI_Strike', 'Open Interest por Strike', 'Open Interest por Strike'),
    ('Charm_Exposure', 'Charm Exposure', 'Charm Exposure'),
    ('Vanna_Exposure', 'Vanna Exposure', 'Vanna Exposure'),
    ('Theta_Exposure', 'Theta Exposure', 'Theta Exposure'),
    ('Delta_Flip_Profile', 'Delta Flip Profile', 'Delta Flip Profile'),
    ('Gamma_Flip_Profile', 'Gamma Flip Profile', 'Gamma Flip Profile'),
    ('Gamma_Flip_Analysis', 'Quadro Comparativo de Flips', 'Tabela explicativa dos modelos')
]"""

updates_count = 0
for cell in nb['cells']:
    if cell['cell_type'] == 'code':
        source = "".join(cell['source']).replace('\r\n', '\n')
        
        if search_modes_full.replace('\r\n', '\n') in source:
             new_source = source.replace(search_modes_full.replace('\r\n', '\n'), new_modes_full)
             cell['source'] = new_source.splitlines(keepends=True)
             updates_count += 1
             print("Updated full modes list at the end of the file.")

if updates_count > 0:
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(nb, f, indent=1, ensure_ascii=False)
    print(f"Notebook updated successfully with {updates_count} changes.")
else:
    print("No changes made. Pattern not found or already updated.")
