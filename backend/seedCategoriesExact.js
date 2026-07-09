const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const categories = [
  {
    name: 'Laptops',
    subcategories: ['Gaming Laptops', 'Business Laptops', 'Student Laptops', 'Ultrabooks', '2-in-1 Convertibles']
  },
  {
    name: 'Desktops & Monitors',
    subcategories: ['Gaming Desktops', 'All-in-One PCs', 'Monitors']
  },
  {
    name: 'PC Components',
    subcategories: ['Processors (CPU)', 'Graphics Cards (GPU)', 'Motherboards', 'RAM (Memory)', 'Storage (SSD/HDD)', 'Power Supplies (PSU)', 'PC Cases']
  },
  {
    name: 'PC Accessories',
    subcategories: ['Keyboards & Mice', 'Headsets & Audio', 'Webcams & Microphones', 'Cables & Adapters', 'Laptop Bags & Sleeves']
  },
  {
    name: 'Networking',
    subcategories: ['Routers', 'Switches', 'Wi-Fi Adapters']
  },
  {
    name: 'Software',
    subcategories: ['Operating Systems', 'Office Applications', 'Antivirus & Security']
  },
  {
    name: 'Printers',
    subcategories: []
  },
  {
    name: 'UPS',
    subcategories: []
  }
];

async function main() {
  console.log('Seeding exact categories...');
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
  console.log('Done seeding exact categories.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
