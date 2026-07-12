import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const regions = [
  {
    regionName: 'Nairobi',
    fee: 0,
    estimatedDays: 'Next Day Delivery',
    counties: ['Nairobi']
  },
  {
    regionName: 'Central',
    fee: 300,
    estimatedDays: '1 - 2 Business Days',
    counties: ['Kiambu', 'Kirinyaga', 'Nyeri', "Murang'a", 'Nyandarua']
  },
  {
    regionName: 'Coast',
    fee: 300,
    estimatedDays: '2 - 3 Business Days',
    counties: ['Mombasa', 'Kwale', 'Kilifi', 'Tana River', 'Lamu', 'Taita Taveta']
  },
  {
    regionName: 'Eastern',
    fee: 300,
    estimatedDays: '2 - 3 Business Days',
    counties: ['Embu', 'Machakos', 'Makueni', 'Kitui', 'Meru', 'Tharaka Nithi', 'Marsabit', 'Isiolo']
  },
  {
    regionName: 'North Eastern',
    fee: 300,
    estimatedDays: '3 - 5 Business Days',
    counties: ['Garissa', 'Wajir', 'Mandera']
  },
  {
    regionName: 'Nyanza',
    fee: 300,
    estimatedDays: '2 - 3 Business Days',
    counties: ['Siaya', 'Kisumu', 'Homa Bay', 'Migori', 'Kisii', 'Nyamira']
  },
  {
    regionName: 'Rift Valley',
    fee: 300,
    estimatedDays: '2 - 4 Business Days',
    counties: ['Nakuru', 'Narok', 'Kajiado', 'Kericho', 'Bomet', 'Uasin Gishu', 'Trans Nzoia', 'Nandi', 'Elgeyo Marakwet', 'Baringo', 'Laikipia', 'Samburu', 'Turkana', 'West Pokot']
  },
  {
    regionName: 'Western',
    fee: 300,
    estimatedDays: '2 - 3 Business Days',
    counties: ['Kakamega', 'Vihiga', 'Bungoma', 'Busia']
  }
];

async function main() {
  console.log('Clearing existing shipping zones...');
  await prisma.shippingZone.deleteMany({});

  console.log('Seeding Kenyan Regions...');
  for (const region of regions) {
    await prisma.shippingZone.create({
      data: {
        regionName: region.regionName,
        fee: region.fee,
        estimatedDays: region.estimatedDays,
        counties: region.counties
      }
    });
    console.log(`Created Region: ${region.regionName}`);
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
