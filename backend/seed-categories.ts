import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  { name: 'All-in-Ones', subCats: [] },
  { name: 'Desktops', subCats: [] },
  { name: 'PC Accessories', subCats: [
      'Keyboards & Mice', 'USB Hubs & Docks', 'External Storage', 'Laptop Cooling Pads'
    ]
  },
  { name: 'Laptops', subCats: [
      'HP Laptops', 'Dell Laptops', 'Lenovo Laptops', 'Apple MacBooks', 'ASUS Laptops', 'Acer Laptops', 'Samsung Laptops', 'Laptop Bags & Sleeves'
    ]
  },
  { name: 'Mobiles', subCats: [
      'Smartphones', 'Tablets & iPads', 'Powerbanks & Cables'
    ]
  },
  { name: 'Monitors', subCats: [
      'Gaming Monitors', 'Office Monitors', '4K Professional Screens'
    ]
  },
  { name: 'Printers', subCats: [] },
  { name: 'UPS', subCats: [] }
];

async function main() {
  console.log('Seeding categories...');
  for (const cat of categories) {
    const slug = cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    let category = await prisma.category.findUnique({ where: { slug } });
    if (!category) {
       category = await prisma.category.create({
         data: { name: cat.name, slug }
       });
       console.log(`Created category: ${cat.name}`);
    }

    for (const sub of cat.subCats) {
       const subSlug = sub.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
       let subcategory = await prisma.subcategory.findUnique({ where: { slug: subSlug } });
       if (!subcategory) {
         await prisma.subcategory.create({
           data: { name: sub, slug: subSlug, categoryId: category.id }
         });
         console.log(`Created subcategory: ${sub}`);
       }
    }
  }
  console.log('Done!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
