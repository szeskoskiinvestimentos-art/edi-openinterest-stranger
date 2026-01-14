import json

nb_path = "USDBRL_AnaliseDeOpcoes - Rev4.ipynb"

with open(nb_path, 'r', encoding='utf-8') as f:
    nb = json.load(f)

src31 = "".join(nb['cells'][31]['source'])
if "metrics.json" in src31:
    idx = src31.find("metrics.json")
    print("--- Cell 31 Metrics Write ---")
    print(src31[idx-300:idx+300])
else:
    print("No metrics.json in Cell 31")
