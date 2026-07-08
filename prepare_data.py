import os
import csv
import re
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
    brands = ['hp', 'dell', 'lenovo', 'apple', 'asus', 'acer']
    for b in brands:
        if b in name_lower:
            return b.capitalize()
    return 'Unknown'

def main():
    data_dir = Path(r"C:\Users\njoki\.gemini\antigravity\scratch\laptop-ecommerce-frontend\data")
    laptops_dir = data_dir / "NEX GEN LAPTOPS" / "NEX GEN LAPTOPS"
    docx_path = data_dir / "NEXGEN SOLUTIONS PRICING LIST  1 u.docx"
    output_csv = Path(r"C:\Users\njoki\.gemini\antigravity\scratch\laptop-ecommerce-frontend\products_upload_v3.csv")

    products = []

    # 1. Parse Bags
    print("Parsing bags...")
    for file in data_dir.iterdir():
        if file.is_file() and file.suffix.lower() in ['.jpeg', '.jpg', '.png']:
            filename = file.stem
            # Format usually: Name@Price
            if '@' in filename:
                name_part, price_part = filename.rsplit('@', 1)
                price = parse_price(price_part)
                original_name = name_part.strip().capitalize()
            else:
                original_name = filename.capitalize()
                price = 0.0
            
            # Determine properties
            name_lower = original_name.lower()
            is_sleeve = 'sleeve' in name_lower
            size = '14"' if is_sleeve else '15.6"'
            product_type = 'Laptop Sleeve' if is_sleeve else 'Laptop Bag'
            
            # Extract color
            colors = ['black', 'blue', 'brown', 'dark brown', 'green', 'grey', 'jungle green', 'pink', 'purple']
            color = 'Black' # default
            for c in colors:
                if c in name_lower:
                    color = c.capitalize()
                    break
            
            # Extract features/material
            features = []
            if 'waterproof' in name_lower: features.append('Waterproof')
            if 'leather' in name_lower: features.append('Leather')
            if 'antitheft' in name_lower: features.append('Anti-theft')
            if 'padded' in name_lower: features.append('Padded')
            
            if not features:
                features = ['Padded', 'Protective'] if is_sleeve else ['Waterproof', 'Padded']
            
            feature_str = ', '.join(features)
            
            # Formulate Title
            title = f"{size} {product_type} – {feature_str}, {color}"
            
            # Formulate Description
            if is_sleeve:
                desc = (
                    f"Protect your laptop with this {size.replace('\"', '-inch')} {color.lower()} {feature_str.lower()} laptop sleeve. "
                    "This laptop sleeve offers reliable protection against scratches, dust, and minor shocks. "
                    "It is lightweight, slim, and easy to carry on its own or inside a backpack. "
                    "The soft inner lining helps keep your laptop safe while the smooth zip closure allows quick access. "
                    "Ideal for students, professionals, and anyone looking for a simple protective laptop case.\n\n"
                    "Keywords: laptop sleeve in Kenya, padded laptop sleeve, slim laptop sleeve, waterproof laptop sleeve, 13 inch laptop sleeve, 14 inch laptop sleeve, 15.6 inch laptop sleeve."
                )
            else:
                desc = (
                    f"Protect your laptop with this durable {size.replace('\"', '-inch')} {color.lower()} {feature_str.lower()} laptop bag. "
                    "This high-quality laptop bag is designed for safe and convenient carrying of your laptop and accessories. "
                    "It features a padded laptop compartment, durable zip closure, comfortable handles, and extra pockets for charger, mouse, documents, and other essentials. "
                    "Suitable for office use, school, travel, and daily business needs. Fits many laptop brands including HP, Dell, Lenovo, Acer, Asus, and Toshiba.\n\n"
                    "Keywords: laptop bag in Kenya, waterproof laptop bag, office laptop bag, school laptop bag, travel laptop bag, padded laptop bag."
                )

            products.append({
                'name': title,
                'description': desc,
                'brand': 'Unknown',
                'price': price,
                'compareAtPrice': '',
                'stock': 10, # Default stock
                'categoryName': 'Bags',
                'imageUrls': f"data/{file.name}",
                'specs': '{}'
            })

    # 2. Parse Laptops from docx
    print("Parsing laptops from docx...")
    laptops = []
    if docx_path.exists():
        doc = Document(docx_path)
        for para in doc.paragraphs:
            text = para.text.strip()
            if not text or text.lower().startswith('nexgen') or text.lower().startswith('quality'):
                continue
            
            # Extract price at the end
            match = re.search(r'(?:=|@)?\s*([\d,]+(?:k|K)?)\s*$', text)
            if match:
                price_str = match.group(1)
                price = parse_price(price_str)
                name = text[:match.start()].strip()
                if name.endswith('=') or name.endswith('@'):
                    name = name[:-1].strip()
            else:
                name = text
                price = 0.0
                
            laptops.append({
                'name': name,
                'description': name,
                'brand': extract_brand(name),
                'price': price,
                'compareAtPrice': '',
                'stock': 5, # Default stock
                'categoryName': 'Laptops',
                'imageUrls': '',
                'specs': '{}',
                'matched_image': False
            })

    # 3. Match Laptop Images
    print("Matching laptop images...")
    if laptops_dir.exists():
        image_files = [f for f in laptops_dir.iterdir() if f.is_file() and f.suffix.lower() in ['.jpeg', '.jpg', '.png', '.jfif']]
        matched_images = set()
        
        for laptop in laptops:
            laptop_name_clean = re.sub(r'\b(hp|dell|lenovo|probook|elitebook|latitude|thinkpad)\b', '', laptop['name'].lower())
            laptop_words = set(re.findall(r'[a-z0-9]+', laptop_name_clean))
            
            best_img = None
            best_img_path = None
            best_score = 0
            
            for file in image_files:
                img_name_clean = re.sub(r'\b(hp|dell|lenovo|probook|elitebook|latitude|thinkpad)\b', '', file.stem.lower())
                img_words = set(re.findall(r'[a-z0-9]+', img_name_clean))
                
                score = len(laptop_words.intersection(img_words))
                if score > 0 and score > best_score:
                    best_score = score
                    best_img = file
                    best_img_path = f"data/NEX GEN LAPTOPS/NEX GEN LAPTOPS/{file.name}"
            
            # If we found a good match for this laptop, assign the image
            if best_img:
                laptop['imageUrls'] = best_img_path
                matched_images.add(best_img)
        
        # If any images weren't matched to ANY laptop in the docx, add them as standalone products
        for file in image_files:
            if file not in matched_images:
                products.append({
                    'name': file.stem.capitalize(),
                    'description': file.stem.capitalize(),
                    'brand': extract_brand(file.stem),
                    'price': 0.0,
                    'compareAtPrice': '',
                    'stock': 5,
                    'categoryName': 'Laptops',
                    'imageUrls': f"data/NEX GEN LAPTOPS/NEX GEN LAPTOPS/{file.name}",
                    'specs': '{}'
                })
    
    products.extend(laptops)

    # 4. Write to CSV
    print(f"Writing to {output_csv}...")
    headers = ['name', 'description', 'brand', 'price', 'compareAtPrice', 'stock', 'categoryName', 'imageUrls', 'specs']
    with open(output_csv, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=headers)
        writer.writeheader()
        for p in products:
            # Remove the temporary key
            if 'matched_image' in p:
                del p['matched_image']
            writer.writerow(p)

    print("Successfully generated products_upload_v3.csv!")

if __name__ == '__main__':
    main()
