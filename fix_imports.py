import os
import re

# Fix toast.tsx
toast_path = r'c:\Users\njoki\.gemini\antigravity\scratch\laptop-ecommerce-frontend\src\lib\toast.tsx'
with open(toast_path, 'r', encoding='utf-8') as f:
    content = f.read()
content = content.replace("import { toast, Toast } from 'react-hot-toast';", "import { toast } from 'react-hot-toast';\nimport type { Toast } from 'react-hot-toast';")
with open(toast_path, 'w', encoding='utf-8') as f:
    f.write(content)

# Fix api.ts
api_path = r'c:\Users\njoki\.gemini\antigravity\scratch\laptop-ecommerce-frontend\src\services\api.ts'
with open(api_path, 'r', encoding='utf-8') as f:
    content = f.read()
content = content.replace("import toast from 'react-hot-toast';\n", "")
with open(api_path, 'w', encoding='utf-8') as f:
    f.write(content)

# Fix Loader imports
files_with_loader_missing = [
    r'c:\Users\njoki\.gemini\antigravity\scratch\laptop-ecommerce-frontend\src\components\admin\AdminAnnouncements.tsx',
    r'c:\Users\njoki\.gemini\antigravity\scratch\laptop-ecommerce-frontend\src\components\admin\AdminCoupons.tsx',
    r'c:\Users\njoki\.gemini\antigravity\scratch\laptop-ecommerce-frontend\src\components\admin\AdminReturns.tsx',
    r'c:\Users\njoki\.gemini\antigravity\scratch\laptop-ecommerce-frontend\src\components\admin\AdminWarranties.tsx',
    r'c:\Users\njoki\.gemini\antigravity\scratch\laptop-ecommerce-frontend\src\pages\CustomerDashboardPage.tsx',
    r'c:\Users\njoki\.gemini\antigravity\scratch\laptop-ecommerce-frontend\src\pages\ProductListingPage.tsx'
]

for filepath in files_with_loader_missing:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'import { Loader }' not in content:
        if 'pages' in filepath:
            import_str = "import { Loader } from '../components/Loader';\n"
        else:
            import_str = "import { Loader } from '../Loader';\n"
            
        last_import = content.rfind('import ')
        end_last_import = content.find('\n', last_import)
        content = content[:end_last_import+1] + import_str + content[end_last_import+1:]
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'Fixed {filepath}')
