import os
import csv
import re
import uuid
import json
from pathlib import Path

try:
    from docx import Document
except ImportError:
    print("Please install python-docx by running: pip install python-docx")
    exit(1)

def parse_price(price_str):
    price_str = price_str.lower().replace(',', '').strip()
    if price_str.endswith('k'):
        try:
            return float(price_str[:-1]) * 1000
        except:
            pass
    try:
        return float(price_str)
    except:
        return 0.0

def extract_brand(name):
    name_lower = name.lower()
    brands = ['hp', 'dell', 'lenovo', 'apple', 'asus', 'acer', 'toshiba']
    for b in brands:
        if b in name_lower:
            return b.capitalize()
    return 'Generic'

def classify_laptop(name, brand):
    # The user requested that laptops are subcategorized by their Brand.
    return brand

def extract_specs_from_name(name):
    specs = {}
    name_lower = name.lower()
    
    # Extract Processor
    proc_match = re.search(r'\b(i3|i5|i7|i9|ryzen\s*\d?|m1|m2)\b', name_lower)
    if proc_match:
        p = proc_match.group(1).capitalize()
        if p.startswith('I'): p = 'Intel Core ' + p.lower()
        if p.startswith('Ryzen'): p = 'AMD ' + p.capitalize()
        specs['Processor'] = p
        
    # Extract RAM and Storage like 8/256 or 16gb/512ssd
    rs_match = re.search(r'\b(\d+)\s*(?:gb|ram)?\s*/\s*(\d+)\s*(?:gb|tb|ssd)?\b', name_lower)
    if rs_match:
        specs['RAM'] = f"{rs_match.group(1)}GB"
        specs['Storage'] = f"{rs_match.group(2)}GB"
    else:
        # Fallback single regex
        ram_match = re.search(r'\b(\d+)\s*(?:gb|ram)\b', name_lower)
        if ram_match:
            specs['RAM'] = f"{ram_match.group(1)}GB"
        storage_match = re.search(r'\b(\d+)\s*(?:ssd|hdd|tb)\b', name_lower)
        if storage_match:
            val = storage_match.group(1)
            unit = "TB" if 'tb' in name_lower else "GB"
            specs['Storage'] = f"{val}{unit}"
            
    # Touchscreen
    if 'touch' in name_lower or 'ts' in name_lower.split():
        specs['Touchscreen'] = 'Yes'
        
    if not specs:
        # Fallbacks for specific known models that were missing from docx
        if '1030 g8' in name_lower:
            return {"Processor": "Intel Core i5 11th Gen", "RAM": "16GB", "Storage": "512GB SSD", "Touchscreen": "Yes"}
        elif '1030 g3' in name_lower:
            return {"Processor": "Intel Core i5 8th Gen", "RAM": "8GB", "Storage": "256GB SSD", "Touchscreen": "Yes"}
        elif 'pavillion' in name_lower or 'pavilion' in name_lower:
            return {"Processor": "Intel Core i5", "RAM": "8GB", "Storage": "512GB SSD"}
        elif '390' in name_lower:
            return {"Processor": "Intel Core i5 8th Gen", "RAM": "8GB", "Storage": "256GB SSD"}
    
    return specs

def main():
    data_dir = Path(r"C:\Users\njoki\.gemini\antigravity\scratch\laptop-ecommerce-frontend\data")
    laptops_dir = data_dir / "NEX GEN LAPTOPS" / "NEX GEN LAPTOPS"
    docx_path = data_dir / "NEXGEN SOLUTIONS PRICING LIST  1 u.docx"
    output_csv = Path(r"C:\Users\njoki\.gemini\antigravity\scratch\laptop-ecommerce-frontend\products_upload_v9.csv")

    raw_bags = []
    raw_laptops = []

    # 1. Parse Bags
    print("Parsing bags...")
    for file in data_dir.iterdir():
        if file.is_file() and file.suffix.lower() in ['.jpeg', '.jpg', '.png']:
            filename = file.stem
            if '@' in filename:
                name_part, price_part = filename.rsplit('@', 1)
                price = parse_price(price_part)
                original_name = name_part.strip().capitalize()
            else:
                original_name = filename.capitalize()
                price = 0.0
            
            name_lower = original_name.lower()
            is_sleeve = 'sleeve' in name_lower
            size = '14"' if is_sleeve else '15.6"'
            product_type = 'Laptop Sleeve' if is_sleeve else 'Laptop Bag'
            
            colors = ['black', 'blue', 'brown', 'dark brown', 'green', 'grey', 'jungle green', 'pink', 'purple']
            color = 'Black'
            for c in colors:
                if c in name_lower:
                    color = c.capitalize()
                    break
            
            features = []
            if 'waterproof' in name_lower: features.append('Waterproof')
            if 'leather' in name_lower: features.append('Leather')
            if 'antitheft' in name_lower: features.append('Anti-theft')
            if 'padded' in name_lower: features.append('Padded')
            if not features:
                features = ['Padded', 'Protective'] if is_sleeve else ['Waterproof', 'Padded']
            
            feature_str = ', '.join(features)
            
            # Base name for grouping
            base_name = f"{size} {product_type} – {feature_str}"
            
            if is_sleeve:
                desc = (f"Protect your laptop with this {size.replace('\"', '-inch')} {feature_str.lower()} laptop sleeve. "
                        "This laptop sleeve offers reliable protection against scratches, dust, and minor shocks. "
                        "It is lightweight, slim, and easy to carry on its own or inside a backpack. "
                        "The soft inner lining helps keep your laptop safe while the smooth zip closure allows quick access. "
                        "Ideal for students, professionals, and anyone looking for a simple protective laptop case.\n\n"
                        "Keywords: laptop sleeve in Kenya, padded laptop sleeve, slim laptop sleeve, waterproof laptop sleeve, 13 inch laptop sleeve, 14 inch laptop sleeve, 15.6 inch laptop sleeve.")
            else:
                desc = (f"Protect your laptop with this durable {size.replace('\"', '-inch')} {feature_str.lower()} laptop bag. "
                        "This high-quality laptop bag is designed for safe and convenient carrying of your laptop and accessories. "
                        "It features a padded laptop compartment, durable zip closure, comfortable handles, and extra pockets for charger, mouse, documents, and other essentials. "
                        "Suitable for office use, school, travel, and daily business needs. Fits many laptop brands including HP, Dell, Lenovo, Acer, Asus, and Toshiba.\n\n"
                        "Keywords: laptop bag in Kenya, waterproof laptop bag, office laptop bag, school laptop bag, travel laptop bag, padded laptop bag.")

            raw_bags.append({
                'base_name': base_name,
                'variant_name': color,
                'description': desc,
                'brand': extract_brand(original_name),
                'price': price,
                'categoryName': 'Laptop Bags & Sleeves',
                'image': f"data/{file.name}",
                'specs': {'Material': feature_str, 'Color': color, 'Size': size}
            })

    # 2. Parse Laptops from docx
    print("Parsing laptops from docx...")
    if docx_path.exists():
        doc = Document(docx_path)
        for para in doc.paragraphs:
            text = para.text.strip()
            if not text or text.lower().startswith('nexgen') or text.lower().startswith('quality'):
                continue
            
            match = re.search(r'(?:=|@)?\s*([\d,]+(?:k|K)?)\s*$', text)
            if match:
                price_str = match.group(1)
                price = parse_price(price_str)
                full_name = text[:match.start()].strip()
                if full_name.endswith('=') or full_name.endswith('@'):
                    full_name = full_name[:-1].strip()
            else:
                full_name = text
                price = 0.0
                
            # Find base model vs variant specs
            split_match = re.search(r'\b(i3|i5|i7|i9|ryzen|core|\d+/\d+|\d+gb|\d+ram)\b', full_name, re.IGNORECASE)
            if split_match:
                base_name = full_name[:split_match.start()].strip()
                variant_name = full_name[split_match.start():].strip()
            else:
                base_name = full_name
                variant_name = "Standard"
                
            # Fallback if base_name is empty
            if not base_name: 
                base_name = full_name
                variant_name = "Standard"
                
            raw_laptops.append({
                'base_name': base_name,
                'variant_name': variant_name,
                'full_name': full_name,
                'description': full_name,
                'brand': extract_brand(base_name),
                'price': price,
                'categoryName': classify_laptop(base_name, extract_brand(base_name)),
                'image': None,
                'specs': extract_specs_from_name(full_name)
            })

    # 3. Match Laptop Images to raw_laptops
    print("Matching laptop images...")
    if laptops_dir.exists():
        image_files = [f for f in laptops_dir.iterdir() if f.is_file() and f.suffix.lower() in ['.jpeg', '.jpg', '.png', '.jfif']]
        matched_images = set()
        
        for laptop in raw_laptops:
            laptop_name_clean = re.sub(r'\b(hp|dell|lenovo|probook|elitebook|latitude|thinkpad)\b', '', laptop['base_name'].lower())
            laptop_words = set(re.findall(r'[a-z]+|\d+', laptop_name_clean))
            
            best_img = None
            best_score = 0
            
            for file in image_files:
                img_name_clean = re.sub(r'\b(hp|dell|lenovo|probook|elitebook|latitude|thinkpad)\b', '', file.stem.lower())
                img_words = set(re.findall(r'[a-z]+|\d+', img_name_clean))
                
                score = len(laptop_words.intersection(img_words))
                if score > 0 and score > best_score:
                    best_score = score
                    best_img = file
                    
            if best_img:
                laptop['image'] = f"data/NEX GEN LAPTOPS/NEX GEN LAPTOPS/{best_img.name}"
                matched_images.add(best_img)
        
        # Unmatched images
        for file in image_files:
            if file not in matched_images:
                raw_laptops.append({
                    'base_name': file.stem.capitalize(),
                    'variant_name': "Standard",
                    'full_name': file.stem.capitalize(),
                    'description': file.stem.capitalize(),
                    'brand': extract_brand(file.stem),
                    'price': 0.0,
                    'categoryName': classify_laptop(file.stem, extract_brand(file.stem)),
                    'image': f"data/NEX GEN LAPTOPS/NEX GEN LAPTOPS/{file.name}",
                    'specs': extract_specs_from_name(file.stem)
                })

    # Group into products
    print("Grouping into final products...")
    grouped_products = {}
    
    # Process Bags
    for b in raw_bags:
        base = b['base_name']
        if base not in grouped_products:
            grouped_products[base] = {
                'name': base,
                'description': b['description'],
                'brand': b['brand'],
                'categoryName': b['categoryName'],
                'images': set(),
                'variants_raw': [],
                'specs': b['specs']
            }
        grouped_products[base]['variants_raw'].append(b)
        if b['image']: grouped_products[base]['images'].add(b['image'])

    # Process Laptops
    for l in raw_laptops:
        base = l['base_name']
        if base not in grouped_products:
            grouped_products[base] = {
                'name': base,
                'description': l['description'],
                'brand': l['brand'],
                'categoryName': l['categoryName'],
                'images': set(),
                'variants_raw': [],
                'specs': l['specs'] # take specs of first variant as base
            }
        grouped_products[base]['variants_raw'].append(l)
        if l['image']: grouped_products[base]['images'].add(l['image'])
        # merge specs
        grouped_products[base]['specs'].update(l['specs'])

    final_rows = []
    
    for base, data in grouped_products.items():
        # Find base price (lowest)
        valid_prices = [v['price'] for v in data['variants_raw'] if v['price'] > 0]
        base_price = min(valid_prices) if valid_prices else 0.0
        
        # Calculate compareAtPrice (approx 20% higher, round to nearest 500)
        compare_at = 0.0
        if base_price > 0:
            compare_at = round((base_price * 1.2) / 500) * 500

        # Build variants JSON
        variants_json = []
        for v in data['variants_raw']:
            price_offset = v['price'] - base_price if v['price'] > 0 else 0
            variants_json.append({
                'id': str(uuid.uuid4()),
                'name': v['variant_name'],
                'priceOffset': price_offset,
                'stock': 5
            })

        final_rows.append({
            'name': data['name'],
            'description': data['description'],
            'brand': data['brand'],
            'price': base_price,
            'compareAtPrice': compare_at,
            'stock': 15,
            'categoryName': data['categoryName'],
            'imageUrls': ",".join(list(data['images'])),
            'specs': json.dumps(data['specs']),
            'variants': json.dumps(variants_json)
        })

    # Add Printers parsed from image
    print("Adding printers from photo...")
    printers = [
        {"name": "HP LaserJet M141A", "price": 22500, "brand": "HP", "specs": {"Type": "Monochrome Laser", "Functions": "Print, Copy, Scan", "Speed": "20 ppm"}},
        {"name": "HP LaserJet M141W", "price": 23500, "brand": "HP", "specs": {"Type": "Monochrome Laser", "Functions": "Print, Copy, Scan, Wi-Fi", "Speed": "20 ppm"}},
        {"name": "HP LaserJet M236Sdn", "price": 36000, "brand": "HP", "specs": {"Type": "Monochrome Laser", "Functions": "Print, Copy, Scan, Duplex, Ethernet", "Speed": "29 ppm"}},
        {"name": "HP LaserJet 4003Dn", "price": 39000, "brand": "HP", "specs": {"Type": "Monochrome Laser", "Functions": "Print only, Duplex, Ethernet", "Speed": "40 ppm"}},
        {"name": "HP Colour LaserJet M182N", "price": 51000, "brand": "HP", "specs": {"Type": "Color Laser", "Functions": "Print, Copy, Scan, Ethernet", "Speed": "16 ppm"}},
        {"name": "Epson L3210 EcoTank", "price": 23500, "brand": "Epson", "specs": {"Type": "Color Ink Tank", "Functions": "Print, Copy, Scan", "Speed": "33 ppm (Mono)"}},
        {"name": "Epson L3250 EcoTank", "price": 25000, "brand": "Epson", "specs": {"Type": "Color Ink Tank", "Functions": "Print, Copy, Scan, Wi-Fi", "Speed": "33 ppm (Mono)"}},
        {"name": "Epson LQ350 Dot Matrix", "price": 29000, "brand": "Epson", "specs": {"Type": "Dot Matrix", "Functions": "Print", "Pins": "24-pin"}},
        {"name": "Epson L6490 EcoTank", "price": 66000, "brand": "Epson", "specs": {"Type": "Color Ink Tank", "Functions": "Print, Copy, Scan, Fax, Wi-Fi, Ethernet, ADF", "Speed": "17 ipm"}},
        {"name": "Epson L8100 Photo Printer", "price": 60000, "brand": "Epson", "specs": {"Type": "Color Photo Ink Tank", "Functions": "Print, Copy, Scan, CD/DVD Print", "Ink": "6-color dye"}}
    ]

    for p in printers:
        final_rows.append({
            'name': p['name'],
            'description': f"{p['brand']} printer offering excellent speed and high quality output.",
            'brand': p['brand'],
            'price': p['price'],
            'compareAtPrice': round((p['price'] * 1.2) / 500) * 500,
            'stock': 10,
            'categoryName': 'Printers',
            'imageUrls': 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=500&auto=format&fit=crop&q=60',
            'specs': json.dumps(p['specs']),
            'variants': '[]'
        })

    # 4. Write to CSV
    print(f"Writing to {output_csv}...")
    headers = ['name', 'description', 'brand', 'price', 'compareAtPrice', 'stock', 'categoryName', 'imageUrls', 'specs', 'variants']
    with open(output_csv, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=headers)
        writer.writeheader()
        for p in final_rows:
            writer.writerow(p)

    print(f"Successfully generated {output_csv.name}!")

if __name__ == '__main__':
    main()
