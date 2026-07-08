import re
import os

file = 'backend/src/controllers/products.ts'
with open(file, 'r', encoding='utf-8') as f:
    content = f.read()

new_logic = '''        let categoryId = row.categoryId;
        if (!categoryId && row.categoryName) {
           let cat = await prisma.category.findFirst({ where: { name: row.categoryName } });
           if (!cat) {
             const catSlug = row.categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
             cat = await prisma.category.create({ data: { name: row.categoryName, slug: catSlug } });
           }
           categoryId = cat.id;
        }
        if (!categoryId) throw new Error("Category is required");

        let realSubcategoryId = null;
        if (row.subcategoryId && typeof row.subcategoryId === 'string') {
           let subCat = await prisma.subcategory.findFirst({ where: { name: row.subcategoryId, categoryId } });
           if (!subCat) {
             const subCatSlug = row.subcategoryId.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
             subCat = await prisma.subcategory.create({ data: { name: row.subcategoryId, slug: subCatSlug, categoryId } });
           }
           realSubcategoryId = subCat.id;
        }'''

old_logic = '''        // Check if category exists
        let categoryId = row.categoryId;
        if (!categoryId && row.categoryName) {
           const cat = await prisma.category.findFirst({ where: { name: row.categoryName } });
           if (cat) categoryId = cat.id;
        }
        if (!categoryId) throw new Error("categoryId or valid categoryName is required");'''

content = content.replace(old_logic, new_logic)
content = content.replace('subcategoryId: row.subcategoryId || null,', 'subcategoryId: realSubcategoryId,')

with open(file, 'w', encoding='utf-8') as f:
    f.write(content)
