import json
import re

nb_path = "USDBRL_AnaliseDeOpcoes - Rev4.ipynb"

try:
    with open(nb_path, 'r', encoding='utf-8') as f:
        nb = json.load(f)

    # 1. Remove Logo (add_layout_image) - Handle Multiline
    count_logo = 0
    for cell in nb['cells']:
        if cell['cell_type'] == 'code':
            lines = cell['source']
            new_lines = []
            skip = False
            
            for line in lines:
                # Detect start of add_layout_image block
                if 'fig.add_layout_image' in line:
                    new_lines.append('# ' + line.rstrip() + ' # DISABLED LOGO\n')
                    # If it's not a one-liner (doesn't have closing paren for the function call)
                    # We assume it's multiline if it ends with ( or doesn't have matching )
                    # Simple heuristic: if it ends with ( or doesn't have )
                    if line.strip().endswith('(') or ')' not in line:
                        skip = True
                    count_logo += 1
                elif skip:
                    new_lines.append('# ' + line.rstrip() + '\n')
                    # Check for end of block
                    # Usually it's a line with just ')' or '))' or '        )'
                    if line.strip() == ')' or line.strip() == '))':
                        skip = False
                else:
                    new_lines.append(line)
            
            cell['source'] = new_lines

    print(f"Disabled {count_logo} logo blocks.")

    # 2. Disable Index Overwrite (Re-run just in case)
    count_idx = 0
    for cell in nb['cells']:
        if cell['cell_type'] == 'code':
            lines = cell['source']
            new_lines = []
            for line in lines:
                if "open('exports/index.html'" in line or "open(\'exports/index.html\'" in line:
                    if not line.strip().startswith('#'):
                        new_lines.append('# ' + line.rstrip() + ' # DISABLED INDEX OVERWRITE\n')
                        count_idx += 1
                    else:
                        new_lines.append(line)
                elif "f.write(index_html)" in line:
                    if not line.strip().startswith('#'):
                        new_lines.append('# ' + line.rstrip() + ' # DISABLED INDEX OVERWRITE\n')
                    else:
                        new_lines.append(line)
                else:
                    new_lines.append(line)
            cell['source'] = new_lines

    print(f"Disabled {count_idx} index.html writes.")

    # 3. Inject Metrics Saver at the END (Idempotent)
    metrics_code = [
        "\n",
        "# --- AUTOMATIC METRICS EXPORT (INJECTED) ---\n",
        "import json, os\n",
        "try:\n",
        "    _m = {}\n",
        "    # 1. Spot\n",
        "    try: _m['spot'] = float(SPOT)\n",
        "    except: _m['spot'] = 0.0\n",
        "    \n",
        "    # 2. Gamma Flip\n",
        "    try: _m['gamma_flip'] = float(gamma_flip)\n",
        "    except: _m['gamma_flip'] = 0.0\n",
        "    \n",
        "    # 3. Regime Logic\n",
        "    try:\n",
        "        if 'regime' in locals(): _m['regime'] = regime\n",
        "        else: _m['regime'] = 'Positivo' if _m['spot'] > _m['gamma_flip'] else 'Negativo'\n",
        "    except: _m['regime'] = '---'\n",
        "    \n",
        "    # 4. Clima Logic\n",
        "    try:\n",
        "        if 'clima' in locals(): _m['clima'] = clima\n",
        "        else: _m['clima'] = 'Normal' # Default\n",
        "    except: _m['clima'] = '---'\n",
        "    \n",
        "    # 5. Delta Flip\n",
        "    try:\n",
        "        if 'delta_flip_val' in locals(): _m['delta_flip'] = float(delta_flip_val)\n",
        "        elif 'delta_flip' in locals(): _m['delta_flip'] = float(delta_flip)\n",
        "    except: pass\n",
        "    \n",
        "    os.makedirs('exports', exist_ok=True)\n",
        "    with open('exports/metrics.json', 'w') as f: json.dump(_m, f, indent=2)\n",
        "    print('Metrics exported successfully:', _m)\n",
        "except Exception as e: print(f'Error exporting metrics: {e}')\n"
    ]

    last_cell_src = "".join(nb['cells'][-1]['source'])
    if 'AUTOMATIC METRICS EXPORT' not in last_cell_src:
        nb['cells'].append({
            "cell_type": "code",
            "execution_count": None,
            "metadata": {},
            "outputs": [],
            "source": metrics_code
        })
        print("Injected metrics export cell.")
    else:
        print("Metrics export cell already exists.")
        # Optional: Update it if needed
        nb['cells'][-1]['source'] = metrics_code

    with open(nb_path, 'w', encoding='utf-8') as f:
        json.dump(nb, f, indent=1)

    print("Notebook patched successfully.")

except Exception as e:
    print(f"Error patching notebook: {e}")
