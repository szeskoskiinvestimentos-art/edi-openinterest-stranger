import json

nb_path = "USDBRL_AnaliseDeOpcoes - Rev4.ipynb"

with open(nb_path, 'r', encoding='utf-8') as f:
    nb = json.load(f)

src28 = "".join(nb['cells'][28]['source'])
if "metrics.json" in src28:
    idx = src28.find("metrics.json")
    print("--- Cell 28 Metrics Write ---")
    print(src28[idx-300:idx+300])
else:
    print("No metrics.json in Cell 28")
