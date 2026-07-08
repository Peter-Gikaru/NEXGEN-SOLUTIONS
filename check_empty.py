import csv
with open('products_upload_v6.csv', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for r in reader:
        if r['specs'] == '{}' or not r['imageUrls']:
            print(f"Name: {r['name']} | Specs: {r['specs']} | Image: {'MISSING' if not r['imageUrls'] else 'OK'}")
