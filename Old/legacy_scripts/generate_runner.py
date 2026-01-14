import json
import re

nb_path = r'c:\Users\ednil\Downloads\Gamma\Edi_OpenInterest\USDBRL_AnaliseDeOpcoes - Rev4.ipynb'
out_path = r'c:\Users\ednil\Downloads\Gamma\Edi_OpenInterest\run_notebook_headless.py'

with open(nb_path, 'r', encoding='utf-8') as f:
    nb = json.load(f)

code_lines = []
code_lines.append("import sys")
code_lines.append("import pandas as pd")
code_lines.append("import plotly.graph_objects as go")
code_lines.append("from IPython.display import display")
code_lines.append("# Mock display if needed")
code_lines.append("def display(*args): pass")
code_lines.append("def get_ipython(): return type('MockIPython', (object,), {'run_line_magic': lambda self, *args: None})()")
code_lines.append("\n")

for cell in nb.get('cells', []):
    if cell.get('cell_type') == 'code':
        source = cell.get('source', [])
        # Join lines and split again to handle different line ending formats if any
        full_source = "".join(source)
        lines = full_source.splitlines()
        
        for line in lines:
            # Comment out magics
            if line.strip().startswith('%') or line.strip().startswith('!'):
                code_lines.append(f"# {line}")
            else:
                code_lines.append(line)
        code_lines.append("\n# --- End of Cell ---\n")

with open(out_path, 'w', encoding='utf-8') as f:
    f.write("\n".join(code_lines))

print(f"Generated {out_path} with {len(code_lines)} lines.")
