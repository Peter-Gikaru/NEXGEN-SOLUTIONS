const fetch = require('node-fetch');

async function testSearch(query) {
  const res = await fetch(`http://localhost:5000/api/products?search=${encodeURIComponent(query)}`);
  const data = await res.json();
  console.log(`Query: "${query}" -> Found ${data.products ? data.products.length : 0} products`);
  if (data.products && data.products.length > 0) {
    console.log(`  e.g. ${data.products[0].name}`);
  }
}

async function run() {
  await testSearch('patek');
  await testSearch('patek ph');
  await testSearch('Patek phillipe');
}
run();
