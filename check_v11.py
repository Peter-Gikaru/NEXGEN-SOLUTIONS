import csv
with open('c:/Users/njoki/.gemini/antigravity/scratch/laptop-ecommerce-frontend/products_upload_v11.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        if 'EliteBook' in row['name'] or 'ProBook' in row['name']:
            print(f"Name: {row['name']}")
            print(f"Variants: {row.get('variants', 'MISSING')}")
            break
