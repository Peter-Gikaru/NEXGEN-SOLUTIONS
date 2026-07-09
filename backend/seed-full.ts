import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

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
  console.log('Seeding admin user...');
  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@nexgen.com' },
    update: {},
    create: {
      email: 'admin@nexgen.com',
      name: 'Admin User',
      passwordHash: adminPassword,
      role: 'ADMIN',
      isVerified: true,
    },
  });

  console.log('Clearing existing products and categories...');
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});

  console.log('Seeding original categories in recursive structure...');
  const createdCategories: Record<string, string> = {};

  for (const cat of categories) {
    const slug = cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    let category = await prisma.category.findUnique({ where: { slug } });
    if (!category) {
       category = await prisma.category.create({
         data: { name: cat.name, slug }
       });
       console.log(`Created root category: ${cat.name}`);
    }
    createdCategories[cat.name] = category.id;

    for (const sub of cat.subCats) {
       const subSlug = sub.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
       let subcategory = await prisma.category.findUnique({ where: { slug: subSlug } });
       if (!subcategory) {
         subcategory = await prisma.category.create({
           data: { name: sub, slug: subSlug, parentId: category.id }
         });
         console.log(`  Created subcategory: ${sub}`);
       }
       createdCategories[sub] = subcategory.id;
    }
  }

  console.log('Seeding products...');
  const products = [
    {
      name: 'Huawei Matebook X Pro',
      brand: 'Huawei',
      price: 180000,
      compareAtPrice: 200000,
      stock: 15,
      categoryId: createdCategories['Laptops'] || createdCategories['HP Laptops'],
      imageUrls: 'https://images.unsplash.com/photo-1531297172814-af260eeaafc5?auto=format&fit=crop&q=80&w=800',
      description: 'A premium ultrabook with amazing display.'
    },
    {
      name: 'Dell XPS 15',
      brand: 'Dell',
      price: 250000,
      stock: 8,
      categoryId: createdCategories['Dell Laptops'] || createdCategories['Laptops'],
      imageUrls: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&q=80&w=800',
      description: 'The ultimate creator laptop.'
    },
    {
      name: 'Samsung Galaxy S24 Ultra',
      brand: 'Samsung',
      price: 160000,
      stock: 30,
      categoryId: createdCategories['Smartphones'] || createdCategories['Mobiles'],
      imageUrls: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=800',
      description: 'AI-powered flagship phone.'
    },
    {
      name: 'LG 27" 4K Monitor',
      brand: 'LG',
      price: 45000,
      stock: 20,
      categoryId: createdCategories['4K Professional Screens'] || createdCategories['Monitors'],
      imageUrls: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=800',
      description: 'Crystal clear 4K IPS display.'
    },
    {
      name: 'Logitech MX Master 3',
      brand: 'Logitech',
      price: 12000,
      stock: 50,
      categoryId: createdCategories['Keyboards & Mice'] || createdCategories['PC Accessories'],
      imageUrls: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&q=80&w=800',
      description: 'Advanced wireless mouse for professionals.'
    }
  ];

  for (const prod of products) {
    const slug = prod.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    let existingProd = await prisma.product.findUnique({ where: { slug } });
    if (!existingProd && prod.categoryId) {
      await prisma.product.create({
        data: {
          name: prod.name,
          slug,
          description: prod.description,
          brand: prod.brand,
          price: prod.price,
          compareAtPrice: prod.compareAtPrice,
          stock: prod.stock,
          categoryId: prod.categoryId,
          imageUrls: prod.imageUrls,
          specs: '{}',
        }
      });
      console.log(`Created product: ${prod.name}`);
    }
  }

  console.log('Seed completed successfully!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
