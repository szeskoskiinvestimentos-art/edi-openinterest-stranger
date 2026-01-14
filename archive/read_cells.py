import json

nb_path = r'c:\Users\ednil\Downloads\Gamma\Edi_OpenInterest\USDBRL_AnaliseDeOpcoes - Rev4.ipynb'
with open(nb_path, 'r', encoding='utf-8') as f:
    nb = json.load(f)

# Print cells 3, 4, 5
for i in range(3, 6):
    cell = nb['cells'][i]
    if cell['cell_type'] == 'code':
        print(f"--- Cell {i} ---")
        print("".join(cell['source']))
