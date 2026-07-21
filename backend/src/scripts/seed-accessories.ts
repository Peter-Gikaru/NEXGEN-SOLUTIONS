import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const BAGS_DATA = [
  {
    name: 'Standard Laptop Sleeve',
    brand: 'Generic',
    description: 'A standard protective laptop sleeve available in multiple sizes and colors.',
    price: 0,
    sizes: ['11"', '13"', '14"', '15"'],
    colors: ['Black', 'Grey', 'Light Blue', 'Dark Blue', 'Pink', 'Purple']
  },
  {
    name: 'Leather Laptop Sleeve',
    brand: 'Generic',
    description: 'Premium leather laptop sleeve for extra protection and style.',
    price: 0,
    sizes: ['13"', '14"'],
    colors: ['Grey', 'Black', 'Blue', 'Green', 'Brown']
  },
  {
    name: 'Business King Side Bag',
    brand: 'Business King',
    description: 'Professional business side bag with ample storage.',
    price: 0,
    sizes: ['13"', '14.5"'],
    colors: ['Brown', 'Black', 'Jungle Green']
  },
  {
    name: 'Jeep Side Bag',
    brand: 'Jeep',
    description: 'Durable side bag perfect for 15-inch laptops.',
    price: 0,
    sizes: ['15"'],
    colors: ['Light Brown', 'Dark Brown', 'Black']
  },
  {
    name: 'Nuoxiya 3-Way Bag',
    brand: 'Nuoxiya',
    description: 'Versatile 3-way convertible laptop bag.',
    price: 0,
    sizes: ['14"', '15.6"'],
    colors: ['Black', 'Blue']
  },
  {
    name: 'Nuoxiya 2-Way Bag',
    brand: 'Nuoxiya',
    description: 'Sleek 2-way convertible bag for everyday use.',
    price: 0,
    sizes: ['15.6"'],
    colors: ['Black', 'Blue']
  },
  {
    name: 'Nuoxiya 3-Way Stand Bag',
    brand: 'Nuoxiya',
    description: 'Innovative 3-way bag with built-in laptop stand.',
    price: 0,
    sizes: ['15"'],
    colors: ['Blue', 'Black']
  }
];

const WATCHES_DATA = [
  { name: 'CURREN GENTS WATCH #8457', brand: 'Curren' },
  { name: 'POEDAGAR GENTS 680', brand: 'Poedagar' },
  { name: 'PATEK PHILLIPE', brand: 'Patek Phillipe' },
  { name: 'CURREN GENTS WATCH #8450', brand: 'Curren' },
  { name: 'CARTIER MECHANICAL GENTS WATCH', brand: 'Cartier' },
  { name: 'CASIO G-SHOCK', brand: 'Casio' },
  { name: 'TAG HEUER CARRERA CR7', brand: 'Tag Heuer' }
];

async function seed() {
  try {
    console.log('Seeding accessories...');

    // Get or Create Parent Category
    let accessoriesCat = await prisma.category.findUnique({ where: { slug: 'accessories' } });
    if (!accessoriesCat) {
      accessoriesCat = await prisma.category.create({
        data: { name: 'Accessories', slug: 'accessories', description: 'Various accessories' }
      });
    }

    // Get or Create Bags & Sleeves Category
    let bagsCat = await prisma.category.findUnique({ where: { slug: 'bags-and-sleeves' } });
    if (!bagsCat) {
      bagsCat = await prisma.category.create({
        data: { name: 'Bags & Sleeves', slug: 'bags-and-sleeves', parentId: accessoriesCat.id }
      });
    }

    // Get or Create Watches Category
    let watchesCat = await prisma.category.findUnique({ where: { slug: 'watches' } });
    if (!watchesCat) {
      watchesCat = await prisma.category.create({
        data: { name: 'Watches', slug: 'watches', parentId: accessoriesCat.id }
      });
    }

    // Seed Bags
    for (const bag of BAGS_DATA) {
      const slug = bag.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const existing = await prisma.product.findFirst({ where: { slug } });
      if (!existing) {
        // Build variants array
        const variants = [];
        for (const size of bag.sizes) {
          for (const color of bag.colors) {
            variants.push({ size, color });
          }
        }

        await prisma.product.create({
          data: {
            name: bag.name,
            slug,
            description: bag.description,
            brand: bag.brand,
            price: bag.price,
            stock: 10,
            categoryId: bagsCat.id,
            imageUrls: [],
            specs: { availableSizes: bag.sizes, availableColors: bag.colors },
            variants: variants,
            condition: 'NEW'
          }
        });
        console.log(`Created bag: ${bag.name}`);
      } else {
        console.log(`Bag already exists: ${bag.name}`);
      }
    }

    // Seed Watches
    for (const watch of WATCHES_DATA) {
      const slug = watch.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const existing = await prisma.product.findFirst({ where: { slug } });
      if (!existing) {
        await prisma.product.create({
          data: {
            name: watch.name,
            slug,
            description: `Premium ${watch.name} watch.`,
            brand: watch.brand,
            price: 0,
            stock: 10,
            categoryId: watchesCat.id,
            imageUrls: [],
            specs: {},
            condition: 'NEW'
          }
        });
        console.log(`Created watch: ${watch.name}`);
      } else {
         console.log(`Watch already exists: ${watch.name}`);
      }
    }

    console.log('Seeding completed successfully!');
  } catch (err) {
    console.error('Error seeding accessories:', err);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
