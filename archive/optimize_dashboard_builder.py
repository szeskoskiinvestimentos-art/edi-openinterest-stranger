import os

file_path = 'build_dashboard_v2.py'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Inject Print CSS
# We look for the end of the style block
if "/* Print CSS Injected */" not in content:
    css_to_add = """
        /* Print CSS Injected */
        @media print {
            @page { 
                size: A4 landscape; 
                margin: 5mm; 
            }
            body { 
                background-color: #0f172a !important; 
                -webkit-print-color-adjust: exact; 
                print-color-adjust: exact; 
                color: #f1f5f9 !important; 
                overflow: visible !important;
                height: auto !important;
            }
            .sidebar, .topbar, .no-print { 
                display: none !important; 
            }
            .main {
                display: block !important;
            }
            .content { 
                margin: 0 !important; 
                padding: 0 !important;
                width: 100% !important; 
                height: auto !important;
                overflow: visible !important;
            }
            .grid {
                display: block !important;
            }
            .card { 
                break-inside: avoid; 
                page-break-inside: avoid; 
                background-color: #1e293b !important; 
                border: 1px solid #334155 !important; 
                margin-bottom: 20px !important;
                box-shadow: none !important;
                width: 100% !important;
            }
            .card h3 {
                color: #3b82f6 !important;
            }
            .card p {
                color: #94a3b8 !important;
            }
            iframe {
                height: 600px !important; 
                width: 100% !important;
                page-break-inside: avoid;
            }
            /* Hide scrollbars */
            ::-webkit-scrollbar { display: none; }
        }
    """
    content = content.replace("</style>", css_to_add + "\n    </style>")
    print("CSS Injected.")

# 2. Inject Print Button
# We look for the closing of the nav div
target_str = 'html += f"""\n        </div>\n        <div class="footer">'
if 'Salvar PDF' not in content:
    button_html = """
            <div style="padding: 0 24px 20px;">
                <button onclick="window.print()" style="width: 100%; background: #3b82f6; color: white; border: none; padding: 12px; border-radius: 6px; cursor: pointer; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px; transition: background 0.2s; box-shadow: 0 4px 6px rgba(0,0,0,0.2);">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V2h12v7"></path><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2-2v5a2 2 0 0 1-2 2h-2"></path><path d="M6 14h12v8H6z"></path></svg>
                    Salvar PDF
                </button>
            </div>
    """
    # Use replace on the known string sequence from the file read
    # The file has:
    # html += f"""
    #         </div>
    #         <div class="footer">
    
    # Let's try to match the code block. 
    # Since we are modifying python code string, we need to be careful with indentation.
    
    # Code in file:
    # html += f"""
    #     </div>
    #     <div class="footer">
    
    # We will insert the button HTML into the f-string before the closing div.
    
    replacement = f'{button_html}\n        </div>\n        <div class="footer">'
    
    # We need to find the specific line in the python script.
    # It is around line 164.
    # Let's use a unique string.
    unique_anchor = 'html += f"""\n        </div>\n        <div class="footer">'
    
    if unique_anchor in content:
        content = content.replace(unique_anchor, 'html += f"""\n' + button_html + '\n        </div>\n        <div class="footer">')
        print("Button Injected.")
    else:
        # Fallback if exact string match fails due to whitespace
        # We search for the nav closing
        print("Warning: Exact anchor not found. Trying flexible search.")
        # Attempt to insert before footer
        if '<div class="footer">' in content:
            content = content.replace('<div class="footer">', button_html + '\n        <div class="footer">')
            print("Button Injected (Fallback).")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
