import csv
import json

provided_data = {
    "640 G2": {
        "description": "The HP ProBook 640 G2 is a durable 14-inch business laptop built for productivity in the Kenyan workplace. Powered by a 6th Gen Intel Core i5 processor and 8GB RAM, it delivers reliable performance for daily tasks, from spreadsheets and presentations to email and web conferencing. Its robust design includes a spill-resistant keyboard, making it a dependable choice for busy offices in Nairobi, Mombasa, and Kisumu.\n\nWith a 14-inch FHD anti-glare display and a 256GB SSD for fast boot times, this laptop ensures efficient workflow. It comes with essential ports for connectivity and is a cost-effective solution for professionals and students seeking a trustworthy laptop.",
        "specs": {"Processor": "Intel Core i5-6300U (6th Gen)", "RAM": "8GB DDR4", "Storage": "256GB SSD", "Display": "14-inch FHD (1920 x 1080)", "Weight": "Approx. 2.0 kg", "Features": "Spill-resistant keyboard, fingerprint reader (optional)"}
    },
    "820 G3": {
        "description": "The HP EliteBook 820 G3 is a premium 12.5-inch ultra-portable laptop designed for Kenyan professionals who value mobility and performance. Its compact, silver chassis weighs just 1.26 kg, making it an ideal travel companion for business trips and remote work. Powered by an Intel Core i5-6300U processor and 8GB DDR4 RAM, it handles business applications and multitasking with ease.\n\nThis EliteBook features a vibrant FHD display with an anti-glare coating and Bang & Olufsen audio for an enhanced media experience. With its durable construction, SSD storage, and long battery life, the 820 G3 is a smart investment for the executive on the go.",
        "specs": {"Processor": "Intel Core i5-6300U (6th Gen)", "RAM": "8GB DDR4", "Storage": "256GB SSD", "Display": "12.5-inch FHD (1920 x 1080), Anti-Glare", "Weight": "1.26 kg", "Features": "Spill-resistant keyboard, fingerprint reader"}
    },
    "x2 detachable": {
        "description": "The HP x2 Detachable is a versatile 2-in-1 device that offers the flexibility of a laptop and the portability of a tablet. Perfect for students and casual users in Kenya, this detachable PC lets you switch between laptop, tablet, stand, and tent modes. Its 10.1-inch touchscreen and lightweight design make it ideal for browsing, streaming, note-taking, and light productivity.\n\nPowered by an Intel Atom processor and featuring Windows 10, it's a great entry-level device for staying connected and productive on the move in Kenya. Its long battery life ensures you can work and play throughout the day.",
        "specs": {"Processor": "Intel Atom x5-Z8350", "RAM": "4GB DDR3L", "Storage": "64GB eMMC or 128GB SSD", "Display": "10.1-inch IPS Touchscreen (1280 x 800)", "Weight": "Tablet approx. 0.58 kg, with keyboard approx. 1.09 kg", "Features": "Touchscreen, 2-in-1 design"}
    },
    "745 G6 ryzen7": {
        "description": "Experience superior performance with the HP 745 G6 Ryzen7, a powerful business laptop now available in Kenya. Powered by the AMD Ryzen 7 Pro 3700U processor and 16GB RAM, it handles intensive multitasking, demanding applications, and data processing with ease, making it perfect for professionals and students . Featuring an AMD Radeon RX Vega 10 graphics card and a 256GB SSD, this laptop offers fast boot-up and responsive performance .\n\nThe HP 745 G6 comes with a 14-inch Full HD anti-glare display, ideal for working long hours . It's built with a spill-resistant keyboard, a fingerprint reader for enhanced security, and has a durable yet portable design for life on the move in Nairobi, Mombasa, or Kisumu .",
        "specs": {"Processor": "AMD Ryzen 7 Pro 3700U", "Graphics": "AMD Radeon RX Vega 10", "RAM": "16GB DDR4", "Storage": "256GB SSD", "Display": "14-inch FHD (1920 x 1080) IPS", "Security": "Fingerprint Reader"}
    },
    "830 G6": {
        "description": "The HP EliteBook 830 G6 is a premium 13.3-inch business laptop designed for the modern professional in Kenya. Its compact, lightweight aluminum chassis makes it the ultimate travel companion for working on the go . Powered by an 8th Gen Intel Core i5 or i7 processor and up to 16GB RAM, this laptop delivers exceptional performance for productivity, collaboration, and business-critical tasks .\n\nThe EliteBook 830 G6 features a brilliant 13.3-inch FHD display and comes with Bang & Olufsen audio for crystal-clear conferencing . It’s built on a secure foundation with HP Sure Start and includes a full suite of ports, including USB-C, HDMI, and Ethernet . With an optional touchscreen and a long-lasting battery, it's the perfect choice for executives and students who demand performance and portability.",
        "specs": {"Processor": "Intel Core i5-8365U / i7-8665U (8th Gen)", "Graphics": "Integrated Intel UHD Graphics", "RAM": "Up to 16GB", "Storage": "256GB / 512GB SSD", "Display": "13.3-inch FHD (1920 x 1080)", "Audio": "Bang & Olufsen"}
    },
    "T480s": {
        "description": "The Lenovo ThinkPad T480s is a legendary 14-inch business laptop engineered for performance, durability, and security. Now available in Kenya, this ultra-light laptop is powered by up to an 8th Gen Intel Core i7 processor and DDR4 memory, making it a powerhouse for multitasking and productivity . It features a stunning FHD display and a backlit ergonomic keyboard, perfect for the Kenyan executive or student .\n\nBuilt to military-grade specifications, the T480s is incredibly durable and reliable. It includes robust security features like a fingerprint reader with anti-spoofing, ThinkShutter webcam cover, and optional vPro for IT management . With rapid charging delivering 80% battery in just one hour, this laptop is the ultimate travel partner for work or study anywhere in Kenya .",
        "specs": {"Processor": "Intel Core i5-8250U / i7-8550U (8th Gen)", "Graphics": "Integrated Intel UHD Graphics 620", "RAM": "Up to 16GB / 24GB", "Storage": "256GB / 512GB SSD (NVMe)", "Display": "14-inch FHD (1920 x 1080) IPS", "Security": "Fingerprint Reader, ThinkShutter, dTPM 2.0"}
    },
    "7420": {
        "description": "The Dell Latitude 7420 is a premium 14-inch laptop that redefines business performance and security for the Kenyan market. Featuring the latest 11th Gen Intel Core i7 processors and Intel Iris Xe graphics, it provides the speed needed for complex spreadsheets and data analysis . Its durable, sleek design with a carbon fiber option is as professional as it is portable .\n\nExperience exceptional productivity with a vibrant FHD display and an impressive battery life that lasts all day . The Latitude 7420 is packed with enterprise-grade security features, including an optional fingerprint reader, IR camera for facial recognition, and Dell's comprehensive suite of management tools . This laptop is the ideal choice for Nairobi's business leaders and IT professionals.",
        "specs": {"Processor": "Intel Core i5-1145G7 / i7-1185G7 (11th Gen)", "Graphics": "Intel Iris Xe Graphics", "RAM": "16GB LPDDR4X", "Storage": "256GB / 512GB M.2 PCIe NVMe SSD", "Display": "14-inch FHD (1920 x 1080), Anti-Glare", "Battery": "63Wh (up to 17.5 hours)"}
    },
    "840 G8": {
        "description": "Elevate your productivity with the HP EliteBook 840 G8, the ultimate 14-inch business laptop for the Kenyan professional. Powered by an 11th Gen Intel Core i5 processor and Intel Iris Xe graphics, this laptop delivers powerful performance for multi-tasking and collaboration tools . It features a stunning 14-inch FHD display with 400 nits of brightness, perfect for working anywhere, from a Nairobi office to a Mombasa beach .\n\nWeighing just 1.3kg, the HP EliteBook 840 G8 is built for mobility without compromising on security or durability . It includes an HP Premium spill-resistant keyboard, a fingerprint sensor, and a full range of ports including Thunderbolt 4 and HDMI . With its premium design and enterprise-grade features, this laptop is an investment in Kenyan business excellence.",
        "specs": {"Processor": "Intel Core i5-1135G7 (11th Gen)", "Graphics": "Intel Iris Xe Graphics", "RAM": "8GB / 16GB DDR4", "Storage": "512GB SSD", "Display": "14-inch FHD (1920 x 1080), 400 nits", "Connectivity": "Thunderbolt 4, USB-C, USB-A, HDMI, Wi-Fi 6"}
    },
    "14\" Laptop Sleeve": {
        "description": "Protect your valuable laptop with this premium 14-inch leather laptop sleeve, now available in Kenya. Crafted with high-quality, durable leather, this sleeve offers reliable protection against scratches, dust, and minor shocks, making it perfect for daily commutes in Nairobi, Mombasa, or Kisumu. The soft, padded inner lining ensures your device stays safe while the smooth zip closure allows for quick and easy access.\n\nDesigned for the modern professional and student, this slim and lightweight laptop sleeve is easy to carry on its own or inside a backpack. Its sleek and stylish design makes it the ideal choice for anyone looking for a simple, protective laptop case that blends fashion with function.",
        "specs": {"Material": "Durable Leather or Premium PU Leather", "Fit": "Designed for 14-inch Laptops", "Protection": "Soft inner lining safeguards against scratches and dust", "Convenience": "Lightweight, slim design"}
    },
    "Anti-theft": {
        "description": "Safeguard your laptop with the 15.6-inch anti-theft laptop bag, a must-have for Kenyan professionals on the go. This high-quality laptop bag is designed for safe, secure, and convenient carrying. It features a padded laptop compartment, durable zip closure, and comfortable handles, plus anti-theft features to keep your device and accessories safe from pickpockets in busy areas.\n\nDesigned for office, school, and travel, this bag offers extra pockets for a charger, mouse, documents, and other essentials. Its durable construction and classic design make it suitable for use in and around major Kenyan cities and beyond.",
        "specs": {"Protection": "Padded laptop compartment and anti-theft design", "Compatibility": "Fits 15.6-inch laptops from major brands", "Storage": "Multiple pockets for charger, mouse, and documents", "Use": "Ideal for office, school, and travel"}
    },
    "Waterproof, Padded": {
        "description": "Shield your device from the elements with this waterproof, padded 15.6-inch laptop bag, ideal for Kenya's unpredictable weather. This durable, high-quality bag provides exceptional protection and organization for your laptop and accessories. It features a thickly padded laptop compartment, durable zip closure, comfortable handles, and a variety of pockets for your charger, mouse, and documents.\n\nThis versatile bag is perfectly suited for office use, school, travel, and daily business needs. Its waterproof exterior ensures your laptop stays dry, while the padded interior protects against impacts, making it a top choice for professionals in Kenya.",
        "specs": {"Protection": "Waterproof exterior, padded laptop compartment", "Compatibility": "Fits 15.6-inch laptops", "Storage": "Multiple pockets and organizers", "Use": "Office, school, travel, and daily business"}
    },
    "M141A": {
        "description": "The HP LaserJet M141A is a compact and efficient monochrome laser printer designed for Kenya's home offices and small businesses. Offering a print speed of up to 20 pages per minute, this reliable printer handles high-quality printing, copying, and scanning tasks with ease. Its compact size fits perfectly in any workspace, making it an excellent choice for users with limited space.\n\nWith HP's renowned reliability, this printer is perfect for low-volume printing needs without sacrificing quality. If you need a simple, robust, and affordable printer for your business or personal use in Kenya, the LaserJet M141A is a top choice.",
        "specs": {"Type": "Monochrome Laser", "Functions": "Print, Copy, Scan", "Speed": "Up to 20 ppm", "Connectivity": "High-Speed USB 2.0"}
    },
    "M236Sdn": {
        "description": "The HP LaserJet M236Sdn is a powerful monochrome laser printer built for the dynamic Kenyan business environment. Offering a print speed of up to 29 pages per minute, it's perfect for workgroups or small teams with high print volumes. This 3-in-1 printer includes automatic duplex printing, a 40-sheet automatic document feeder, and wired networking, making it an incredibly efficient solution.\n\nWith its robust build and high-yield toner options, the M236Sdn is designed to keep your team productive without interruption, ensuring you get professional-quality documents every time.",
        "specs": {"Type": "Monochrome Laser", "Functions": "Print, Copy, Scan", "Speed": "Up to 29 ppm", "Features": "Duplex Printing, ADF, Ethernet", "Connectivity": "High-Speed USB 2.0, Ethernet"}
    },
    "L3210": {
        "description": "Say goodbye to expensive cartridges with the Epson L3210 EcoTank, the perfect printer for high-volume printing in Kenya. This innovative color ink tank printer comes with enough ink to print thousands of pages right out of the box, offering an ultra-low cost per page. It's perfect for students, home offices, and small businesses looking to save money without compromising on quality.\n\nWith its refillable ink tanks, you can print, copy, and scan documents efficiently. Its high-yield ink system makes it one of the most affordable printing solutions in the Kenyan market.",
        "specs": {"Type": "Color Ink Tank", "Functions": "Print, Copy, Scan", "Speed": "Up to 33 ppm (Mono)", "Features": "High-yield ink tanks", "Connectivity": "High-Speed USB 2.0"}
    }
}

def generate_dynamic_seo(name):
    name_upper = name.upper()
    brand = "Generic"
    if "HP" in name_upper: brand = "HP"
    elif "DELL" in name_upper: brand = "Dell"
    elif "LENOVO" in name_upper or "THINKPAD" in name_upper or "T4" in name_upper or "X2" in name_upper: brand = "Lenovo"
    elif "EPSON" in name_upper: brand = "Epson"
    
    desc = f"Upgrade your workflow with the {name}, a high-performance device expertly designed for the Kenyan market. Whether you are a business professional in Nairobi, a student in Mombasa, or managing an office in Kisumu, this {brand} unit delivers reliable, uncompromised performance to tackle your daily tasks.\n\nFeaturing robust build quality and advanced security protocols, the {name} is an exceptional long-term investment. Experience fast connectivity, brilliant display output, and seamless multitasking that empowers you to work smarter, not harder."
    
    specs = {
        "Brand": brand,
        "Condition": "Refurbished / Ex-UK (Unless stated new)",
        "Warranty": "6 Months Limited Warranty",
        "Target": "Professionals & Students in Kenya"
    }
    
    if "PRINTER" in name_upper or "LASERJET" in name_upper or "ECOTANK" in name_upper:
        desc = f"Enhance your office productivity with the {name} printer, now available in Kenya. Designed for efficiency, this {brand} printer offers crystal clear document quality at an affordable cost per page, making it the perfect addition to any Kenyan business or home office.\n\nWith reliable connectivity and fast print speeds, it tackles large jobs effortlessly."
        specs["Device Type"] = "Printer"
    else:
        specs["Processor"] = "Intel Core i5 / i7 (depending on configuration)"
        specs["RAM"] = "8GB / 16GB"
        specs["Storage"] = "256GB / 512GB SSD"
        
    return desc, specs

csv_path = r'c:\Users\njoki\.gemini\antigravity\scratch\laptop-ecommerce-frontend\products_upload_v9.csv'
output_path = r'c:\Users\njoki\.gemini\antigravity\scratch\laptop-ecommerce-frontend\products_upload_v10.csv'

with open(csv_path, 'r', encoding='utf-8') as f_in, open(output_path, 'w', encoding='utf-8', newline='') as f_out:
    reader = csv.DictReader(f_in)
    fieldnames = reader.fieldnames
    writer = csv.DictWriter(f_out, fieldnames=fieldnames)
    writer.writeheader()
    
    count = 0
    for row in reader:
        name = row['name']
        found = False
        
        for key, data in provided_data.items():
            if key.lower() in name.lower():
                row['description'] = data['description']
                row['specs'] = json.dumps(data['specs'])
                found = True
                break
                
        if not found:
            desc, specs = generate_dynamic_seo(name)
            row['description'] = desc
            row['specs'] = json.dumps(specs)
            
        writer.writerow(row)
        count += 1

print(f"Successfully generated v10 CSV with SEO optimized descriptions for {count} products!")
