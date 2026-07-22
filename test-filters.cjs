const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

  console.log('Navigating to page...');
  await page.goto('http://127.0.0.1:5174/products', { waitUntil: 'networkidle2' });
  
  console.log('Clicking the first filter checkbox...');
  
  const checkboxes = await page.$$('input[type="checkbox"]');
  console.log(`Found ${checkboxes.length} checkboxes.`);
  
  if (checkboxes.length > 0) {
    await checkboxes[0].click();
    await new Promise(r => setTimeout(r, 1000));
    
    const rootHtml = await page.content();
    if (rootHtml.includes('Oops! Something went wrong.')) {
       console.log('ERROR BOUNDARY TRIGGERED!');
    }
    
    const sidebar = await page.$('.w-72');
    if (sidebar) {
      const text = await page.evaluate(el => el.innerText, sidebar);
      console.log('Sidebar text length:', text.length);
      console.log('Sidebar text snippet:', text.substring(0, 100));
    }
  }
  
  await browser.close();
})();
