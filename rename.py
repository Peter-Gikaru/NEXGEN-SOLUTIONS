import os

replacements = {
    "nexgensolutions.com": "nexgen-gadgets.com",
    "nexgensolutions.co.ke": "nexgen-gadgets.com",
    "NexGen Solutions": "NexGen Gadgets",
    "NEXGEN SOLUTIONS": "NEXGEN GADGETS",
    "nexgensolutions": "nexgengadgets",
    "NexGen Laptops": "NexGen Gadgets",
    "Nexgen Laptops": "Nexgen Gadgets",
    "NEXGEN LAPTOPS": "NEXGEN GADGETS"
}

# Directories to exclude
exclude_dirs = {'.git', 'node_modules', 'dist', 'dist-ssr', '.vscode', '.idea'}
exclude_files = {'rename.py', 'package-lock.json', '.env'}

def replace_in_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as file:
            content = file.read()
    except Exception:
        return # Skip binary files or unreadable files

    original_content = content
    for old, new in replacements.items():
        content = content.replace(old, new)
        
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as file:
            file.write(content)
        print(f"Updated: {filepath}")

for root, dirs, files in os.walk('.'):
    dirs[:] = [d for d in dirs if d not in exclude_dirs]
    for file in files:
        if file in exclude_files or file.endswith('.db') or file.endswith('.png') or file.endswith('.jpg'):
            continue
        filepath = os.path.join(root, file)
        replace_in_file(filepath)

print("Renaming completed.")
