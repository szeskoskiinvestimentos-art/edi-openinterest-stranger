import json

nb_path = "USDBRL_AnaliseDeOpcoes - Rev4.ipynb"

try:
    with open(nb_path, 'r', encoding='utf-8') as f:
        nb = json.load(f)

    # 1. Prepare Top Cell content
    top_imports = [
        "import os\n",
        "import sys\n",
        "import json\n",
        "import pandas as pd\n",
        "import numpy as np\n",
        "import plotly.graph_objects as go\n",
        "import plotly.io as pio\n",
        "\n",
        "# Configuration\n",
        "TOP_N_CONTRACTS = 5\n",
        "pd.options.display.float_format = '{:,.2f}'.format\n",
        "pd.set_option('display.max_columns', None)\n",
        "\n",
        "print('Environment initialized.')\n"
    ]

    # Check if first cell is code
    if nb['cells'][0]['cell_type'] == 'code':
        # Prepend to existing source
        current_src = nb['cells'][0]['source']
        # Avoid duplicates
        new_src = []
        existing_lines_stripped = [l.strip() for l in current_src]
        
        for line in top_imports:
            # Check if line essentially exists
            if line.strip() and line.strip() not in existing_lines_stripped:
                 new_src.append(line)
        
        nb['cells'][0]['source'] = new_src + current_src
    else:
        # Insert new cell at top
        nb['cells'].insert(0, {
            "cell_type": "code",
            "execution_count": None,
            "metadata": {},
            "outputs": [],
            "source": top_imports
        })
        print("Inserted new top cell.")

    # 2. Remove later definition of TOP_N_CONTRACTS
    count_removed = 0
    # Start from index 1 (or 0 if we prepended)
    # Actually if we inserted, the old cells shifted. 
    # If we prepended, index 0 is the one we touched.
    # Safe to iterate all and skip the one we just added/modified if it matches top_imports exactly, but easier to just check line content.
    
    for i, cell in enumerate(nb['cells']):
        if i == 0: continue # Skip the top cell we just ensured
        
        if cell['cell_type'] == 'code':
            new_src = []
            for line in cell['source']:
                if ('TOP_N_CONTRACTS =' in line or 'TOP_N_CONTRACTS=' in line) and not line.strip().startswith('#'):
                    new_src.append('# ' + line.strip() + ' # Moved to top\n')
                    count_removed += 1
                else:
                    new_src.append(line)
            cell['source'] = new_src

    print(f"Removed {count_removed} redundant constant definitions.")

    with open(nb_path, 'w', encoding='utf-8') as f:
        json.dump(nb, f, indent=1)

    print("Notebook optimized successfully.")

except Exception as e:
    print(f"Error optimizing notebook: {e}")
