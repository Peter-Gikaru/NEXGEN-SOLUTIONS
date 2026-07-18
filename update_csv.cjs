const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { createObjectCsvWriter } = require('csv-writer');

const inputFilePath = path.join(__dirname, 'products_upload_v9.csv');
const outputFilePath = path.join(__dirname, 'products_upload_v9_updated.csv');

const updates = [
  {
    match: (name) => name.includes('640 G2'),
    description: `The HP ProBook 640 G2 is a durable 14-inch business laptop built for productivity in the Kenyan workplace. Powered by a 6th Gen Intel Core i5 processor and 8GB RAM, it delivers reliable performance for daily tasks, from spreadsheets and presentations to email and web conferencing. Its robust design includes a spill-resistant keyboard, making it a dependable choice for busy offices in Nairobi, Mombasa, and Kisumu.\n\nWith a 14-inch FHD anti-glare display and a 256GB SSD for fast boot times, this laptop ensures efficient workflow. It comes with essential ports for connectivity and is a cost-effective solution for professionals and students seeking a trustworthy laptop.\n\nTechnical Specifications\n\nProcessor: Intel Core i5-6300U (6th Gen)\nRAM: 8GB DDR4\nStorage: 256GB SSD\nDisplay: 14-inch FHD (1920 x 1080)\nWeight: Approx. 2.0 kg\nFeatures: Spill-resistant keyboard, fingerprint reader (optional)`
  },
  {
    match: (name) => name.includes('820 G3'),
    description: `The HP EliteBook 820 G3 is a premium 12.5-inch ultra-portable laptop designed for Kenyan professionals who value mobility and performance. Its compact, silver chassis weighs just 1.26 kg, making it an ideal travel companion for business trips and remote work. Powered by an Intel Core i5-6300U processor and 8GB DDR4 RAM, it handles business applications and multitasking with ease.\n\nThis EliteBook features a vibrant FHD display with an anti-glare coating and Bang & Olufsen audio for an enhanced media experience. With its durable construction, SSD storage, and long battery life, the 820 G3 is a smart investment for the executive on the go.\n\nTechnical Specifications\n\nProcessor: Intel Core i5-6300U (6th Gen)\nRAM: 8GB DDR4\nStorage: 256GB SSD\nDisplay: 12.5-inch FHD (1920 x 1080), Anti-Glare\nWeight: 1.26 kg\nFeatures: Spill-resistant keyboard, fingerprint reader`
  },
  {
    match: (name) => name.toLowerCase().includes('hp x2 detachable'),
    description: `The HP x2 Detachable is a versatile 2-in-1 device that offers the flexibility of a laptop and the portability of a tablet. Perfect for students and casual users in Kenya, this detachable PC lets you switch between laptop, tablet, stand, and tent modes. Its 10.1-inch touchscreen and lightweight design make it ideal for browsing, streaming, note-taking, and light productivity.\n\nPowered by an Intel Atom processor and featuring Windows 10, it's a great entry-level device for staying connected and productive on the move in Kenya. Its long battery life ensures you can work and play throughout the day.\n\nTechnical Specifications\n\nProcessor: Intel Atom x5-Z8350\nRAM: 4GB DDR3L\nStorage: 64GB eMMC or 128GB SSD (depending on variant)\nDisplay: 10.1-inch IPS Touchscreen (1280 x 800)\nWeight: Tablet approx. 0.58 kg, with keyboard approx. 1.09 kg\nFeatures: Touchscreen, 2-in-1 design, HP Active Pen support (in some variants)`
  },
  {
    match: (name) => name.toLowerCase().includes('745 g6'),
    description: `Experience superior performance with the HP 745 G6 Ryzen7, a powerful business laptop now available in Kenya. Powered by the AMD Ryzen 7 Pro 3700U processor and 16GB RAM, it handles intensive multitasking, demanding applications, and data processing with ease, making it perfect for professionals and students. Featuring an AMD Radeon RX Vega 10 graphics card and a 256GB SSD, this laptop offers fast boot-up and responsive performance.\n\nThe HP 745 G6 comes with a 14-inch Full HD anti-glare display, ideal for working long hours. It's built with a spill-resistant keyboard, a fingerprint reader for enhanced security, and has a durable yet portable design for life on the move in Nairobi, Mombasa, or Kisumu.\n\nTechnical Specifications\n\nProcessor: AMD Ryzen 7 Pro 3700U\nGraphics: AMD Radeon RX Vega 10\nRAM: 16GB DDR4\nStorage: 256GB SSD\nDisplay: 14-inch FHD (1920 x 1080) IPS, Anti-Glare\nSecurity: Fingerprint Reader\nConnectivity: USB-C, HDMI, Wi-Fi, Bluetooth\nOperating System: Windows 10/11 Pro\nWeight: 1.53 kg`
  },
  {
    match: (name) => name.toLowerCase().includes('830 g6'),
    description: `The HP EliteBook 830 G6 is a premium 13.3-inch business laptop designed for the modern professional in Kenya. Its compact, lightweight aluminum chassis makes it the ultimate travel companion for working on the go. Powered by an 8th Gen Intel Core i5 or i7 processor and up to 16GB RAM, this laptop delivers exceptional performance for productivity, collaboration, and business-critical tasks.\n\nThe EliteBook 830 G6 features a brilliant 13.3-inch FHD display and comes with Bang & Olufsen audio for crystal-clear conferencing. It’s built on a secure foundation with HP Sure Start and includes a full suite of ports, including USB-C, HDMI, and Ethernet. With an optional touchscreen and a long-lasting battery, it's the perfect choice for executives and students who demand performance and portability.\n\nTechnical Specifications\n\nProcessor: Intel Core i5-8365U / i7-8665U (8th Gen)\nGraphics: Integrated Intel UHD Graphics\nRAM: Up to 16GB (Expandable)\nStorage: 256GB / 512GB SSD\nDisplay: 13.3-inch FHD (1920 x 1080)\nAudio: Bang & Olufsen\nConnectivity: USB-C, HDMI, Ethernet (RJ45), USB-A\nSecurity: Fingerprint Reader, HP Sure Start`
  },
  {
    match: (name) => name.toLowerCase().includes('t480s'),
    description: `The Lenovo ThinkPad T480s is a legendary 14-inch business laptop engineered for performance, durability, and security. Now available in Kenya, this ultra-light laptop is powered by up to an 8th Gen Intel Core i7 processor and DDR4 memory, making it a powerhouse for multitasking and productivity. It features a stunning FHD display and a backlit ergonomic keyboard, perfect for the Kenyan executive or student.\n\nBuilt to military-grade specifications, the T480s is incredibly durable and reliable. It includes robust security features like a fingerprint reader with anti-spoofing, ThinkShutter webcam cover, and optional vPro for IT management. With rapid charging delivering 80% battery in just one hour, this laptop is the ultimate travel partner for work or study anywhere in Kenya.\n\nTechnical Specifications\n\nProcessor: Intel Core i5-8250U / i7-8550U (8th Gen)\nGraphics: Integrated Intel UHD Graphics 620\nRAM: Up to 16GB / 24GB\nStorage: 256GB / 512GB SSD (NVMe)\nDisplay: 14-inch FHD (1920 x 1080) IPS, Anti-Glare; Optional Touchscreen\nConnectivity: USB-C, Thunderbolt 3, HDMI, Ethernet\nSecurity: Fingerprint Reader, ThinkShutter, dTPM 2.0\nWeight: 1.31 kg`
  },
  {
    match: (name) => name.toLowerCase().includes('dell 7420') || name.toLowerCase().includes('dell latitude 7420'),
    description: `The Dell Latitude 7420 is a premium 14-inch laptop that redefines business performance and security for the Kenyan market. Featuring the latest 11th Gen Intel Core i7 processors and Intel Iris Xe graphics, it provides the speed needed for complex spreadsheets and data analysis. Its durable, sleek design with a carbon fiber option is as professional as it is portable.\n\nExperience exceptional productivity with a vibrant FHD display and an impressive battery life that lasts all day. The Latitude 7420 is packed with enterprise-grade security features, including an optional fingerprint reader, IR camera for facial recognition, and Dell's comprehensive suite of management tools. This laptop is the ideal choice for Nairobi's business leaders and IT professionals.\n\nTechnical Specifications\n\nProcessor: Intel Core i5-1145G7 / i7-1185G7 (11th Gen)\nGraphics: Intel Iris Xe Graphics\nRAM: 16GB LPDDR4X\nStorage: 256GB / 512GB M.2 PCIe NVMe SSD\nDisplay: 14-inch FHD (1920 x 1080), Anti-Glare; Optional Touch\nBattery: 63Wh (up to 17.5 hours)\nConnectivity: Thunderbolt 4 (x2), USB-A, HDMI, microSD, Optional 4G LTE\nSecurity: Fingerprint Reader, IR Camera, SmartCard Reader`
  },
  {
    match: (name) => name.toLowerCase().includes('840 g8'),
    description: `Elevate your productivity with the HP EliteBook 840 G8, the ultimate 14-inch business laptop for the Kenyan professional. Powered by an 11th Gen Intel Core i5 processor and Intel Iris Xe graphics, this laptop delivers powerful performance for multi-tasking and collaboration tools. It features a stunning 14-inch FHD display with 400 nits of brightness, perfect for working anywhere, from a Nairobi office to a Mombasa beach.\n\nWeighing just 1.3kg, the HP EliteBook 840 G8 is built for mobility without compromising on security or durability. It includes an HP Premium spill-resistant keyboard, a fingerprint sensor, and a full range of ports including Thunderbolt 4 and HDMI. With its premium design and enterprise-grade features, this laptop is an investment in Kenyan business excellence.\n\nTechnical Specifications\n\nProcessor: Intel Core i5-1135G7 (11th Gen)\nGraphics: Intel Iris Xe Graphics\nRAM: 8GB / 16GB DDR4\nStorage: 512GB SSD\nDisplay: 14-inch FHD (1920 x 1080), 400 nits, Anti-Glare\nConnectivity: Thunderbolt 4, USB-C, USB-A, HDMI, Wi-Fi 6\nSecurity: Fingerprint Sensor, HP Sure Start\nWeight: 1.3 kg`
  },
  {
    match: (name) => name.toLowerCase().includes('14" laptop sleeve') || name.toLowerCase().includes('14"" laptop sleeve – leather'),
    description: `Protect your valuable laptop with this premium 14-inch leather laptop sleeve, now available in Kenya. Crafted with high-quality, durable leather, this sleeve offers reliable protection against scratches, dust, and minor shocks, making it perfect for daily commutes in Nairobi, Mombasa, or Kisumu. The soft, padded inner lining ensures your device stays safe while the smooth zip closure allows for quick and easy access.\n\nDesigned for the modern professional and student, this slim and lightweight laptop sleeve is easy to carry on its own or inside a backpack. Its sleek and stylish design makes it the ideal choice for anyone looking for a simple, protective laptop case that blends fashion with function.\n\nKey Features\n\nMaterial: Durable Leather or Premium PU Leather\nFit: Designed for 14-inch Laptops\nProtection: Soft inner lining safeguards against scratches and dust\nConvenience: Lightweight, slim design with a smooth zip closure`
  },
  {
    match: (name) => name.toLowerCase().includes('15.6" laptop bag – anti-theft') || name.toLowerCase().includes('15.6"" laptop bag – anti-theft'),
    description: `Safeguard your laptop with the 15.6-inch anti-theft laptop bag, a must-have for Kenyan professionals on the go. This high-quality laptop bag is designed for safe, secure, and convenient carrying. It features a padded laptop compartment, durable zip closure, and comfortable handles, plus anti-theft features to keep your device and accessories safe from pickpockets in busy areas.\n\nDesigned for office, school, and travel, this bag offers extra pockets for a charger, mouse, documents, and other essentials. Its durable construction and classic design make it suitable for use in and around major Kenyan cities and beyond.\n\nKey Features\n\nProtection: Padded laptop compartment and anti-theft design\nCompatibility: Fits 15.6-inch laptops from major brands like HP, Dell, and Lenovo\nStorage: Multiple pockets for charger, mouse, and documents\nUse: Ideal for office, school, and travel`
  },
  {
    match: (name) => name.toLowerCase().includes('15.6" laptop bag – waterproof') || name.toLowerCase().includes('15.6"" laptop bag – waterproof, padded'),
    description: `Shield your device from the elements with this waterproof, padded 15.6-inch laptop bag, ideal for Kenya's unpredictable weather. This durable, high-quality bag provides exceptional protection and organization for your laptop and accessories. It features a thickly padded laptop compartment, durable zip closure, comfortable handles, and a variety of pockets for your charger, mouse, and documents.\n\nThis versatile bag is perfectly suited for office use, school, travel, and daily business needs. Its waterproof exterior ensures your laptop stays dry, while the padded interior protects against impacts, making it a top choice for professionals in Kenya.\n\nKey Features\n\nProtection: Waterproof exterior, padded laptop compartment\nCompatibility: Fits 15.6-inch laptops from brands like HP, Dell, and Lenovo\nStorage: Multiple pockets and organizers for accessories\nUse: Office, school, travel, and daily business`
  },
  {
    match: (name) => name.toLowerCase().includes('m141a'),
    description: `The HP LaserJet M141A is a compact and efficient monochrome laser printer designed for Kenya's home offices and small businesses. Offering a print speed of up to 20 pages per minute, this reliable printer handles high-quality printing, copying, and scanning tasks with ease. Its compact size fits perfectly in any workspace, making it an excellent choice for users with limited space.\n\nWith HP's renowned reliability, this printer is perfect for low-volume printing needs without sacrificing quality. If you need a simple, robust, and affordable printer for your business or personal use in Kenya, the LaserJet M141A is a top choice.\n\nTechnical Specifications\n\nType: Monochrome Laser\nFunctions: Print, Copy, Scan\nSpeed: Up to 20 ppm\nConnectivity: High-Speed USB 2.0`
  },
  {
    match: (name) => name.toLowerCase().includes('m236sdn'),
    description: `The HP LaserJet M236Sdn is a powerful monochrome laser printer built for the dynamic Kenyan business environment. Offering a print speed of up to 29 pages per minute, it's perfect for workgroups or small teams with high print volumes. This 3-in-1 printer includes automatic duplex printing, a 40-sheet automatic document feeder, and wired networking, making it an incredibly efficient solution.\n\nWith its robust build and high-yield toner options, the M236Sdn is designed to keep your team productive without interruption, ensuring you get professional-quality documents every time.\n\nTechnical Specifications\n\nType: Monochrome Laser\nFunctions: Print, Copy, Scan\nSpeed: Up to 29 ppm\nFeatures: Duplex Printing, ADF, Ethernet\nConnectivity: High-Speed USB 2.0, Ethernet`
  },
  {
    match: (name) => name.toLowerCase().includes('l3210'),
    description: `Say goodbye to expensive cartridges with the Epson L3210 EcoTank, the perfect printer for high-volume printing in Kenya. This innovative color ink tank printer comes with enough ink to print thousands of pages right out of the box, offering an ultra-low cost per page. It's perfect for students, home offices, and small businesses looking to save money without compromising on quality.\n\nWith its refillable ink tanks, you can print, copy, and scan documents efficiently. Its high-yield ink system makes it one of the most affordable printing solutions in the Kenyan market.\n\nTechnical Specifications\n\nType: Color Ink Tank\nFunctions: Print, Copy, Scan\nSpeed: Up to 33 ppm (Mono)\nFeatures: High-yield ink tanks\nConnectivity: High-Speed USB 2.0`
  }
];

const results = [];
let columns = [];

fs.createReadStream(inputFilePath)
  .pipe(csv())
  .on('headers', (headers) => {
    columns = headers;
  })
  .on('data', (data) => {
    const originalName = data.name;
    
    // Check if it matches any update
    for (const update of updates) {
      if (update.match(originalName)) {
        data.description = update.description;
        console.log("Updated description for: " + originalName);
        break; // Only apply first match
      }
    }
    
    results.push(data);
  })
  .on('end', () => {
    // Determine headers
    const headerParams = columns.map(col => ({ id: col, title: col }));
    
    const csvWriter = createObjectCsvWriter({
      path: outputFilePath,
      header: headerParams
    });

    csvWriter.writeRecords(results)
      .then(() => {
        console.log('Successfully updated CSV file!');
        
        // Replace original with updated
        fs.renameSync(outputFilePath, inputFilePath);
        console.log('Original file overwritten.');
      });
  });
