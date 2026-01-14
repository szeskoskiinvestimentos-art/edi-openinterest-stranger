
import os

index_path = 'exports/index.html'

if os.path.exists(index_path):
    with open(index_path, 'r', encoding='utf-8') as f:
        html = f.read()
    
    # Check if link already exists or if using new layout
    if 'Trading Station' in html:
        print("Layout novo detectado. Link já incluído no design.")
    elif 'dashboard.html' not in html:
        # Add link in the top bar or header
        # Finding the header div
        link_html = '<a href="dashboard.html" style="background:#2563eb;color:white;padding:6px 12px;border-radius:4px;text-decoration:none;font-weight:bold;margin-left:10px;">Ver Dashboard Completo &#8599;</a>'
        
        # Try to insert after the title or in the header actions
        if '<h1>EDI &#8212; Market Guardian' in html:
            html = html.replace('<h1>EDI &#8212; Market Guardian', f'<h1>EDI &#8212; Market Guardian {link_html}')
        elif '<body>' in html:
            html = html.replace('<body>', f'<body><div style="padding:10px;text-align:right;">{link_html}</div>')
            
        with open(index_path, 'w', encoding='utf-8') as f:
            f.write(html)
        print("Link para dashboard.html adicionado ao index.html")
    else:
        print("Link já existe no index.html")
else:
    print("index.html não encontrado")
