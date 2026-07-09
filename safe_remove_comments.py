import os

exclude_dirs = {'.git', 'node_modules', 'dist', 'dist-ssr', '.vscode', '.idea'}

def clean_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            lines = f.readlines()
    except Exception:
        return
        
    new_lines = []
    changed = False
    for line in lines:
        stripped = line.strip()
        # Remove full line comments
        if stripped.startswith('//') and not stripped.startswith('// eslint'):
            changed = True
            continue
        # Remove trailing comments
        if '// ' in line and 'http' not in line:
            new_lines.append(line.split('// ')[0].rstrip() + '\n')
            changed = True
            continue
        new_lines.append(line)
        
    if changed:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.writelines(new_lines)
        print(f"Cleaned {filepath}")

for root, dirs, files in os.walk('.'):
    dirs[:] = [d for d in dirs if d not in exclude_dirs]
    for file in files:
        if file.endswith(('.ts', '.tsx', '.js', '.jsx', '.prisma')):
            filepath = os.path.join(root, file)
            clean_file(filepath)
