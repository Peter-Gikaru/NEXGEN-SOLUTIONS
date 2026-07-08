import re
import os

file = 'src/pages/AdminDashboardPage.tsx'
with open(file, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update the parseData function to validate headers and image URLs
old_parse = '''    const parseData = (data: any[]) => {
      // Mapping logic
      const mapped = data.map((row: any) => ({'''

new_parse = '''    const parseData = (data: any[]) => {
      // Validate headers
      if (data.length === 0) {
         toast.error('The file is empty.');
         return;
      }
      
      const firstRow = data[0];
      const requiredColumns = ['Product Name', 'Price (KES)', 'Category'];
      const missingColumns = requiredColumns.filter(col => !(col in firstRow));
      
      if (missingColumns.length > 0) {
         toast.error(`Missing required columns: ${missingColumns.join(', ')}`);
         setParsedBulkData([]);
         return;
      }

      // Mapping logic
      const mapped = data.map((row: any) => {
        const imageUrlsStr = row['Product Images'] || row.imageUrls || '';
        let isValidImage = true;
        if (imageUrlsStr) {
           const urls = imageUrlsStr.split(',');
           for (const url of urls) {
             const cleanUrl = url.trim().toLowerCase();
             // We only check if it ends with an image extension, or if it's an external url we assume they uploaded a link to an image.
             // But the user requested to validate "whether the images are images or text or word or pdf"
             // If it ends with .pdf, .docx, .txt, etc. we reject it.
             if (cleanUrl.match(/\.(pdf|doc|docx|txt|xls|xlsx|csv)$/i)) {
                isValidImage = false;
             }
           }
        }
        
        return {
          name: row['Product Name'] || row.name || '',
          brand: row['Brand'] || row.brand || '',
          description: row['Description'] || row.description || '',
          price: row['Price (KES)'] || row.price || '0',
          compareAtPrice: row['Compare Price (KES)'] || row.compareAtPrice || '',
          stock: row['Initial stock'] || row.stock || '0',
          categoryName: row['Category'] || row.categoryName || '',
          subcategoryId: row['Subcategory'] || row.subcategoryId || '',
          imageUrls: imageUrlsStr,
          threeDModelUrl: row['3D Model (.glb / .gltf)'] || row.threeDModelUrl || '',
          specs: row['Specs (JSON Format)'] || row.specs || '',
          _isValidImage: isValidImage
        };
      }).filter(row => row.name && row.price);

      const invalidImages = mapped.filter(r => !r._isValidImage);
      if (invalidImages.length > 0) {
         toast.error(`Found ${invalidImages.length} products with invalid image formats. Images cannot be pdf, word, or text files.`);
         setParsedBulkData([]);
         return;
      }'''

content = content.replace(old_parse, new_parse)

# 2. Rename button and remove old text
old_button = '''                    <button
                      type="submit"
                      disabled={isUploadingBulk || parsedBulkData.length === 0}
                      className="whitespace-nowrap bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300 disabled:cursor-not-allowed text-sm"
                    >
                      {isUploadingBulk ? 'Uploading...' : 'Upload CSV'}
                    </button>
                  </form>
                  <p className="text-xs text-slate-500 mt-3">
                    CSV should contain columns: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">name, slug, description, brand, price, compareAtPrice, stock, categoryName, imageUrls</code>
                  </p>'''

new_button = '''                    <button
                      type="submit"
                      disabled={isUploadingBulk || parsedBulkData.length === 0}
                      className="whitespace-nowrap bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:bg-emerald-300 disabled:cursor-not-allowed text-sm"
                    >
                      {isUploadingBulk ? 'Publishing...' : 'Confirm & Publish'}
                    </button>
                  </form>'''

content = content.replace(old_button, new_button)

with open(file, 'w', encoding='utf-8') as f:
    f.write(content)
