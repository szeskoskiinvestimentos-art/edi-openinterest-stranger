import os

print("Inspecting exports directory...")
try:
    files = os.listdir('exports')
    print(f"Files in exports: {len(files)} files found.")
    for f in sorted(files):
        if f.endswith('.html'):
            size = os.path.getsize(os.path.join('exports', f))
            print(f"{f}: {size/1024:.1f} KB")
except Exception as e:
    print(f"Error accessing exports: {e}")
