import json

nb_path = r'c:\Users\ednil\Downloads\Gamma\Edi_OpenInterest\USDBRL_AnaliseDeOpcoes - Rev4.ipynb'

with open(nb_path, 'r', encoding='utf-8') as f:
    nb = json.load(f)

print("".join(nb['cells'][10]['source']))
