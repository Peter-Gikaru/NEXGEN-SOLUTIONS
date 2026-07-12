import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';

const escapeCsv = (str: string | null | undefined) => {
  if (!str) return '';
  const escaped = String(str).replace(/"/g, '""');
  if (escaped.includes(',') || escaped.includes('\n') || escaped.includes('"')) {
    return `"${escaped}"`;
  }
  return escaped;
};

export const exportFacebookCatalog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await prisma.product.findMany({
      include: { category: true }
    });

    const FRONTEND_URL = process.env.FRONTEND_URL || 'https://yourdomain.co.ke';

    const headers = [
      'id', 'title', 'description', 'availability', 'condition', 
      'price', 'link', 'image_link', 'brand', 'google_product_category'
    ];

    let csvContent = headers.join(',') + '\n';

    for (const p of products) {
      
      
      const id = escapeCsv(p.id);
      const title = escapeCsv(p.name);
      
      
      const description = escapeCsv(p.description || p.name);
      
      const availability = p.stock > 0 ? 'in stock' : 'out of stock';
      const condition = 'new';
      
      
      const price = escapeCsv(`${p.price.toFixed(2)} KES`);
      
      const link = escapeCsv(`${FRONTEND_URL}/product/${p.slug}`);
      
      
      let image_link = '';
      const images = p.imageUrls as string[];
      if (images && Array.isArray(images) && images.length > 0) {
        // Ensure image URL is absolute
        const firstImage = images[0];
        image_link = firstImage.startsWith('http') ? firstImage : `${FRONTEND_URL}${firstImage}`;
      }
      image_link = escapeCsv(image_link);
      
      const brand = escapeCsv(p.brand || 'Unbranded');
      
      
      const google_product_category = escapeCsv('Electronics > Computers > Laptops');

      const row = [id, title, description, availability, condition, price, link, image_link, brand, google_product_category];
      csvContent += row.join(',') + '\n';
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=facebook_catalog.csv');
    return res.status(200).send(csvContent);
  } catch (error) {
    console.error('Catalog Export Error:', error);
    return next(error);
  }
};
