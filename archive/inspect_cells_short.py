import json
import sys

nb_path = "USDBRL_AnaliseDeOpcoes - Rev4.ipynb"
with open(nb_path, 'r', encoding='utf-8') as f:
    nb = json.load(f)

indices = [39, 40]
for i in indices:
    if i < len(nb['cells']):
        print(f"--- Cell {i} ---")
        src = "".join(nb['cells'][i]['source'])
        lines = src.splitlines()
        for ln in range(min(30, len(lines))):
             print(f"{ln+1}: {lines[ln]}")
        print("\n")
