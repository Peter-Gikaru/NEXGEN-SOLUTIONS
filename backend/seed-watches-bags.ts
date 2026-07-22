// @ts-nocheck
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const productsToSeed = [
  {
    "id": "56367a52-28ce-4e11-ba0b-e8fb1ce3d812",
    "name": "Nuoxiya 3-Way Bag",
    "slug": "nuoxiya-3-way-bag",
    "description": "Versatile 3-way convertible laptop bag.",
    "brand": "Nuoxiya",
    "price": 0,
    "compareAtPrice": null,
    "stock": 10,
    "categoryId": "cf9f03d4-d4c7-4848-b3f7-5de0d15b7efc",
    "imageUrls": [],
    "specs": {
      "availableSizes": [
        "14\"",
        "15.6\""
      ],
      "availableColors": [
        "Black",
        "Blue"
      ]
    },
    "createdAt": "2026-07-21T17:36:57.236Z",
    "updatedAt": "2026-07-21T17:36:57.236Z",
    "variants": [
      {
        "size": "14\"",
        "color": "Black"
      },
      {
        "size": "14\"",
        "color": "Blue"
      },
      {
        "size": "15.6\"",
        "color": "Black"
      },
      {
        "size": "15.6\"",
        "color": "Blue"
      }
    ],
    "warranty": "1 Year",
    "threeDModelUrl": null,
    "isActive": true,
    "condition": "NEW",
    "category": {
      "id": "cf9f03d4-d4c7-4848-b3f7-5de0d15b7efc",
      "name": "Bags & Sleeves",
      "slug": "bags-and-sleeves",
      "description": null,
      "parentId": "343657e9-e388-4df1-914b-f43e324c867c"
    }
  },
  {
    "id": "94d99d87-a256-4f40-8ebc-fce07f85210e",
    "name": "Nuoxiya 2-Way Bag",
    "slug": "nuoxiya-2-way-bag",
    "description": "Sleek 2-way convertible bag for everyday use.",
    "brand": "Nuoxiya",
    "price": 0,
    "compareAtPrice": null,
    "stock": 10,
    "categoryId": "cf9f03d4-d4c7-4848-b3f7-5de0d15b7efc",
    "imageUrls": [],
    "specs": {
      "availableSizes": [
        "15.6\""
      ],
      "availableColors": [
        "Black",
        "Blue"
      ]
    },
    "createdAt": "2026-07-21T17:36:59.519Z",
    "updatedAt": "2026-07-21T17:36:59.519Z",
    "variants": [
      {
        "size": "15.6\"",
        "color": "Black"
      },
      {
        "size": "15.6\"",
        "color": "Blue"
      }
    ],
    "warranty": "1 Year",
    "threeDModelUrl": null,
    "isActive": true,
    "condition": "NEW",
    "category": {
      "id": "cf9f03d4-d4c7-4848-b3f7-5de0d15b7efc",
      "name": "Bags & Sleeves",
      "slug": "bags-and-sleeves",
      "description": null,
      "parentId": "343657e9-e388-4df1-914b-f43e324c867c"
    }
  },
  {
    "id": "8ee7a30b-5df2-4fd7-91e0-268338575024",
    "name": "Nuoxiya 3-Way Stand Bag",
    "slug": "nuoxiya-3-way-stand-bag",
    "description": "Innovative 3-way bag with built-in laptop stand.",
    "brand": "Nuoxiya",
    "price": 0,
    "compareAtPrice": null,
    "stock": 10,
    "categoryId": "cf9f03d4-d4c7-4848-b3f7-5de0d15b7efc",
    "imageUrls": [],
    "specs": {
      "availableSizes": [
        "15\""
      ],
      "availableColors": [
        "Blue",
        "Black"
      ]
    },
    "createdAt": "2026-07-21T17:37:01.863Z",
    "updatedAt": "2026-07-21T17:37:01.863Z",
    "variants": [
      {
        "size": "15\"",
        "color": "Blue"
      },
      {
        "size": "15\"",
        "color": "Black"
      }
    ],
    "warranty": "1 Year",
    "threeDModelUrl": null,
    "isActive": true,
    "condition": "NEW",
    "category": {
      "id": "cf9f03d4-d4c7-4848-b3f7-5de0d15b7efc",
      "name": "Bags & Sleeves",
      "slug": "bags-and-sleeves",
      "description": null,
      "parentId": "343657e9-e388-4df1-914b-f43e324c867c"
    }
  },
  {
    "id": "25d5e9a9-1fbc-41c4-9fe2-c3054ecca6d3",
    "name": "CURREN GENTS WATCH #8457",
    "slug": "curren-gents-watch-8457",
    "description": "Premium CURREN GENTS WATCH #8457 watch.",
    "brand": "Curren",
    "price": 0,
    "compareAtPrice": null,
    "stock": 10,
    "categoryId": "aede7f57-b94d-49b4-9003-58f5e97aeccf",
    "imageUrls": [],
    "specs": {},
    "createdAt": "2026-07-21T17:37:03.946Z",
    "updatedAt": "2026-07-21T17:37:03.946Z",
    "variants": null,
    "warranty": "1 Year",
    "threeDModelUrl": null,
    "isActive": true,
    "condition": "NEW",
    "category": {
      "id": "aede7f57-b94d-49b4-9003-58f5e97aeccf",
      "name": "Watches",
      "slug": "watches",
      "description": "",
      "parentId": null
    }
  },
  {
    "id": "7c85d48d-881f-49c9-84ff-69da5d9122e1",
    "name": "CURREN GENTS WATCH #8450",
    "slug": "curren-gents-watch-8450",
    "description": "Premium CURREN GENTS WATCH #8450 watch.",
    "brand": "Curren",
    "price": 0,
    "compareAtPrice": null,
    "stock": 10,
    "categoryId": "aede7f57-b94d-49b4-9003-58f5e97aeccf",
    "imageUrls": [],
    "specs": {},
    "createdAt": "2026-07-21T17:37:09.967Z",
    "updatedAt": "2026-07-21T17:37:09.967Z",
    "variants": null,
    "warranty": "1 Year",
    "threeDModelUrl": null,
    "isActive": true,
    "condition": "NEW",
    "category": {
      "id": "aede7f57-b94d-49b4-9003-58f5e97aeccf",
      "name": "Watches",
      "slug": "watches",
      "description": "",
      "parentId": null
    }
  },
  {
    "id": "92b32f8d-e52e-41bb-8a1b-4d890108bc23",
    "name": "CARTIER MECHANICAL GENTS WATCH",
    "slug": "cartier-mechanical-gents-watch",
    "description": "Premium CARTIER MECHANICAL GENTS WATCH watch.",
    "brand": "Cartier",
    "price": 0,
    "compareAtPrice": null,
    "stock": 10,
    "categoryId": "aede7f57-b94d-49b4-9003-58f5e97aeccf",
    "imageUrls": [],
    "specs": {},
    "createdAt": "2026-07-21T17:37:12.020Z",
    "updatedAt": "2026-07-21T17:37:12.020Z",
    "variants": null,
    "warranty": "1 Year",
    "threeDModelUrl": null,
    "isActive": true,
    "condition": "NEW",
    "category": {
      "id": "aede7f57-b94d-49b4-9003-58f5e97aeccf",
      "name": "Watches",
      "slug": "watches",
      "description": "",
      "parentId": null
    }
  },
  {
    "id": "32d013e3-3ba1-4093-83cd-f9e7af23b958",
    "name": "Business King Side Bag",
    "slug": "business-king-side-bag",
    "description": "Professional business side bag with ample storage.",
    "brand": "Business King",
    "price": 0,
    "compareAtPrice": null,
    "stock": 10,
    "categoryId": "cf9f03d4-d4c7-4848-b3f7-5de0d15b7efc",
    "imageUrls": [],
    "specs": {
      "availableSizes": [
        "13\"",
        "14.5\""
      ],
      "availableColors": [
        "Brown",
        "Black",
        "Jungle Green"
      ]
    },
    "createdAt": "2026-07-21T17:36:53.131Z",
    "updatedAt": "2026-07-21T17:36:53.131Z",
    "variants": [
      {
        "size": "13\"",
        "color": "Brown"
      },
      {
        "size": "13\"",
        "color": "Black"
      },
      {
        "size": "13\"",
        "color": "Jungle Green"
      },
      {
        "size": "14.5\"",
        "color": "Brown"
      },
      {
        "size": "14.5\"",
        "color": "Black"
      },
      {
        "size": "14.5\"",
        "color": "Jungle Green"
      }
    ],
    "warranty": "1 Year",
    "threeDModelUrl": null,
    "isActive": true,
    "condition": "NEW",
    "category": {
      "id": "cf9f03d4-d4c7-4848-b3f7-5de0d15b7efc",
      "name": "Bags & Sleeves",
      "slug": "bags-and-sleeves",
      "description": null,
      "parentId": "343657e9-e388-4df1-914b-f43e324c867c"
    }
  },
  {
    "id": "206113a6-e7ae-4998-a954-26ebf2ff9bc1",
    "name": "Jeep Side Bag",
    "slug": "jeep-side-bag",
    "description": "Durable side bag perfect for 15-inch laptops.",
    "brand": "Jeep",
    "price": 0,
    "compareAtPrice": null,
    "stock": 10,
    "categoryId": "cf9f03d4-d4c7-4848-b3f7-5de0d15b7efc",
    "imageUrls": [],
    "specs": {
      "availableSizes": [
        "15\""
      ],
      "availableColors": [
        "Light Brown",
        "Dark Brown",
        "Black"
      ]
    },
    "createdAt": "2026-07-21T17:36:55.137Z",
    "updatedAt": "2026-07-21T17:36:55.137Z",
    "variants": [
      {
        "size": "15\"",
        "color": "Light Brown"
      },
      {
        "size": "15\"",
        "color": "Dark Brown"
      },
      {
        "size": "15\"",
        "color": "Black"
      }
    ],
    "warranty": "1 Year",
    "threeDModelUrl": null,
    "isActive": true,
    "condition": "NEW",
    "category": {
      "id": "cf9f03d4-d4c7-4848-b3f7-5de0d15b7efc",
      "name": "Bags & Sleeves",
      "slug": "bags-and-sleeves",
      "description": null,
      "parentId": "343657e9-e388-4df1-914b-f43e324c867c"
    }
  }
];

async function main() {
  console.log('Seeding watches and bags...');
  for (const p of productsToSeed) {
    let category = await prisma.category.findUnique({ where: { slug: p.category.slug } });
    if (!category) { 
      category = await prisma.category.create({ data: { name: p.category.name, slug: p.category.slug } }); 
    }
    
    const { id, createdAt, updatedAt, category: cat, ...productData } = p;
    
    // Fix null JSON fields
    if (productData.variants === null) productData.variants = undefined;
    if (productData.specs === null) productData.specs = undefined;
    if (productData.imageUrls === null) productData.imageUrls = undefined;
    
    await prisma.product.upsert({ 
      where: { slug: p.slug }, 
      update: { ...productData, categoryId: category.id }, 
      create: { ...productData, categoryId: category.id } 
    });
    console.log('Seeded: ' + p.name);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
