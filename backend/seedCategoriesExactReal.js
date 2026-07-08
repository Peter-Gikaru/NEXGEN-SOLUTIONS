const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const categories = [
  { name: 'All-in-Ones', subcategories: [] },
  { name: 'Desktops', subcategories: [] },
  { name: 'PC Accessories', subcategories: ['Keyboards & Mice', 'USB Hubs & Docks', 'External Storage', 'Laptop Cooling Pads'] },
  { name: 'Laptops', subcategories: ['HP Laptops', 'Dell Laptops', 'Lenovo Laptops', 'Apple MacBooks', 'ASUS Laptops', 'Acer Laptops', 'Samsung Laptops', 'Laptop Bags & Sleeves'] },
  { name: 'Mobiles', subcategories: ['Smartphones', 'Tablets & iPads', 'Powerbanks & Cables'] },
  { name: 'Monitors', subcategories: ['Gaming Monitors', 'Office Monitors', '4K Professional Screens'] },
  { name: 'Printers', subcategories: [] },
  { name: 'UPS', subcategories: [] }
];

async function main() {
  console.log('Seeding REAL exact categories...');
  await prisma.subcategory.deleteMany({});
  await prisma.category.deleteMany({});

  for (const cat of categories) {
    const slug = cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const createdCat = await prisma.category.create({
      data: {
        name: cat.name,
        slug: slug,
        description: cat.name
      }
    });

    for (const sub of cat.subcategories) {
      const subSlug = sub.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      await prisma.subcategory.create({
        data: {
          name: sub,
          slug: subSlug,
          categoryId: createdCat.id
        }
      });
    }
  }
  console.log('Done seeding REAL exact categories.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
