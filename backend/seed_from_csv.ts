import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding products from CSV...');

  // Fetch all categories to map them
  const categories = await prisma.category.findMany();
  
  // Create a default Laptops category fallback if mapping fails
  let fallbackCategory = categories.find(c => c.name.toLowerCase() === 'laptops');
  if (!fallbackCategory) {
    fallbackCategory = await prisma.category.create({
      data: { name: 'Laptops', slug: 'laptops-fallback' }
    });
  }

  const results: any[] = [];
  const csvPath = path.join(__dirname, '..', 'products_upload_v9.csv');
  
  fs.createReadStream(csvPath)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      console.log(`Found ${results.length} products to import.`);
      
      for (const row of results) {
        // Find best matching category by name
        const catName = (row.categoryName || '').toLowerCase();
        let matchedCategory = categories.find(c => c.name.toLowerCase() === catName || catName.includes(c.name.toLowerCase()));
        
        if (!matchedCategory) {
          // Additional fallback heuristics based on the original data structure
          if (catName.includes('sleeve') || catName.includes('bag')) {
            matchedCategory = categories.find(c => c.name === 'Laptop Bags & Sleeves');
          } else if (catName.includes('desktop') || catName.includes('tower')) {
            matchedCategory = categories.find(c => c.name === 'Desktops');
          } else if (catName.includes('monitor') || catName.includes('screen')) {
            matchedCategory = categories.find(c => c.name === 'Monitors');
          } else if (catName.includes('keyboard') || catName.includes('mouse')) {
            matchedCategory = categories.find(c => c.name === 'Keyboards & Mice');
          }
        }
        
        const categoryId = matchedCategory ? matchedCategory.id : fallbackCategory!.id;
        
        let price = parseFloat(row.price);
        if (isNaN(price)) price = 0;
        
        let compareAtPrice = null;
        if (row.compareAtPrice) {
           const cPrice = parseFloat(row.compareAtPrice);
           if (!isNaN(cPrice)) compareAtPrice = cPrice;
        }

        let stock = parseInt(row.stock, 10);
        if (isNaN(stock)) stock = 10;
        
        let imageUrls = '[]';
        try {
           if (row.imageUrls) {
               // If it's a JSON array, parse it, otherwise wrap it
               if (row.imageUrls.startsWith('[')) {
                   imageUrls = row.imageUrls;
               } else {
                   // Split by comma if multiple, or just array
                   imageUrls = JSON.stringify(row.imageUrls.split(',').map((u:string) => u.trim()));
               }
           } else {
               imageUrls = JSON.stringify(['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&auto=format&fit=crop&q=60']);
           }
        } catch(e) {}

        const slug = (row.name || 'product').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Math.floor(Math.random()*10000);

        try {
            await prisma.product.create({
                data: {
                    name: row.name || 'Unnamed Product',
                    slug,
                    description: row.description || '',
                    brand: row.brand || 'Generic',
                    price,
                    compareAtPrice,
                    stock,
                    categoryId,
                    imageUrls,
                    specs: row.specs || '{}',
                }
            });
            console.log(`Imported: ${row.name}`);
        } catch (err) {
            console.error(`Failed to import ${row.name}: ${err}`);
        }
      }
      
      console.log('Finished importing CSV.');
      await prisma.$disconnect();
    });
}

main().catch(console.error);
