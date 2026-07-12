import re

filepath = r'c:\Users\njoki\.gemini\antigravity\scratch\laptop-ecommerce-frontend\backend\src\controllers\products.ts'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Define the new Smart Categorization logic
smart_category_engine = """
          // --- SMART CATEGORIZATION ENGINE ---
          const productName = row.name.toLowerCase();
          
          // 1. Keyword Dictionary Mapping
          const categoryRules = [
            { category: 'Laptops', keywords: ['laptop', 'macbook', 'notebook', 'chromebook', 'thinkpad', 'elitebook'] },
            { category: 'Mobile Phones', keywords: ['phone', 'iphone', 'galaxy', 'smartphone', 'pixel'] },
            { category: 'Printers', keywords: ['printer', 'laserjet', 'deskjet', 'inkjet', 'epson'] },
            { category: 'Monitors', keywords: ['monitor', 'display', 'screen'] },
            { category: 'UPS', keywords: ['ups', 'uninterruptible power supply', 'apc', 'mecer'] },
            { category: 'Smart Watches', keywords: ['watch', 'apple watch', 'smartwatch'] },
            { category: 'Accessories', keywords: ['mouse', 'keyboard', 'cable', 'adapter', 'charger', 'headset', 'headphones', 'earbuds', 'case'] },
            { category: 'Networking', keywords: ['router', 'switch', 'access point', 'wifi'] },
          ];

          let targetCategoryName = null;
          
          // Try to map based on product name
          for (const rule of categoryRules) {
            if (rule.keywords.some(kw => productName.includes(kw))) {
              targetCategoryName = rule.category;
              break;
            }
          }

          // 2. Fallback to CSV if no rule matched
          if (!targetCategoryName) {
            targetCategoryName = row.categoryName || 'Uncategorized';
          }

          const catNameLower = targetCategoryName.toLowerCase();
          let finalCategoryId = categoryCache.get(catNameLower);
          
          if (!finalCategoryId) {
            const newSlug = catNameLower.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
            const newCat = await prisma.category.create({
              data: {
                name: targetCategoryName,
                slug: newSlug,
                description: `Auto-generated category for ${targetCategoryName}`
              }
            });
            finalCategoryId = newCat.id;
            categoryCache.set(catNameLower, finalCategoryId);
          }
"""

# We need to replace the old category logic in createBulkProducts
# Old logic starts at: const catNameLower = row.categoryName.toLowerCase();
# Ends at: categoryCache.set(catNameLower, finalCategoryId);
#          }

regex_pattern = r'const catNameLower = row\.categoryName\.toLowerCase\(\);[\s\S]*?categoryCache\.set\(catNameLower, finalCategoryId\);\n\s*\}'

new_content = re.sub(regex_pattern, smart_category_engine.strip(), content)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Patched products.ts with Smart Categorization Engine")
