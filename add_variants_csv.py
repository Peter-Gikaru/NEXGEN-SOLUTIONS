import csv
import json
import uuid

input_csv = r'c:\Users\njoki\.gemini\antigravity\scratch\laptop-ecommerce-frontend\products_upload_v10.csv'
output_csv = r'c:\Users\njoki\.gemini\antigravity\scratch\laptop-ecommerce-frontend\products_upload_v11.csv'

# Standard laptop variants
laptop_variants = [
    {
        "id": str(uuid.uuid4()),
        "name": "8GB RAM / 256GB SSD",
        "priceOffset": 0,
        "stock": 10
    },
    {
        "id": str(uuid.uuid4()),
        "name": "16GB RAM / 512GB SSD",
        "priceOffset": 4000,
        "stock": 5
    }
]

def fix_name(name):
    n = name.strip()
    nl = n.lower()
    
    # HP EliteBook fixes
    if '830' in nl or '840' in nl or '820' in nl or '1030' in nl or '1040' in nl or '845' in nl or '745' in nl:
        if not n.lower().startswith('hp'):
            n = 'HP EliteBook ' + n
            
    # HP ProBook fixes
    elif '640' in nl or '440' in nl or '450' in nl or '630' in nl:
        if not n.lower().startswith('hp'):
            n = 'HP ProBook ' + n
            
    # Lenovo Thinkpad fixes
    elif 't460' in nl or 't470' in nl or 't480' in nl or 't490' in nl or 'x240' in nl or 'x250' in nl or 'x280' in nl or 'x390' in nl or 't14' in nl or 't15' in nl:
        if not n.lower().startswith('lenovo'):
            n = 'Lenovo ThinkPad ' + n
            
    return n

with open(input_csv, 'r', encoding='utf-8') as fin, open(output_csv, 'w', encoding='utf-8', newline='') as fout:
    reader = csv.DictReader(fin)
    writer = csv.DictWriter(fout, fieldnames=reader.fieldnames)
    writer.writeheader()
    
    for row in reader:
        original_name = row['name']
        row['name'] = fix_name(original_name)
        
        # If it's a laptop (not a bag, sleeve, or printer), add the standard variants
        cat = row.get('categoryName', '').lower()
        if 'printer' not in cat and 'bag' not in cat and 'sleeve' not in cat and 'accessory' not in cat:
            # Inject variants
            # We generate fresh UUIDs for each row to avoid duplicate IDs across products
            row_variants = [
                {
                    "id": str(uuid.uuid4()),
                    "name": "8GB RAM / 256GB SSD",
                    "priceOffset": 0,
                    "stock": 10
                },
                {
                    "id": str(uuid.uuid4()),
                    "name": "16GB RAM / 512GB SSD",
                    "priceOffset": 4000,
                    "stock": 5
                }
            ]
            # Don't overwrite if existing variants are more complex, but here we want to enforce standard
            # Actually, let's always overwrite for laptops based on the user's request.
            row['variants'] = json.dumps(row_variants)
            
        writer.writerow(row)

print("v11 CSV generated with fixed names and standardized variants!")
