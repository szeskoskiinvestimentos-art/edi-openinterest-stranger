import json
import sys

nb_path = "USDBRL_AnaliseDeOpcoes - Rev4.ipynb"
with open(nb_path, 'r', encoding='utf-8') as f:
    nb = json.load(f)

indices = [39, 40]
print(f"Total cells: {len(nb['cells'])}")
for i in indices:
    if i < len(nb['cells']):
        print(f"--- Cell {i} ({nb['cells'][i]['cell_type']}) ---")
        src = "".join(nb['cells'][i]['source'])
        for ln, line in enumerate(src.splitlines()):
             print(f"{ln+1}: {line}")
        print("\n")
    else:
        print(f"Cell {i} not found")
