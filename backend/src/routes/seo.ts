import express from 'express';
import { PrismaClient } from '@prisma/client';
const router = express.Router();
const prisma = new PrismaClient();
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://nexgen-gadgets.com';
router.get('/sitemap.xml', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      select: { slug: true, updatedAt: true }
    });
    const categories = await prisma.category.findMany({
      select: { slug: true }
    });
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${FRONTEND_URL}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${FRONTEND_URL}/products</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
`;
    for (const category of categories) {
      sitemap += `  <url>
    <loc>${FRONTEND_URL}/products?category=${category.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>\n`;
    }
    for (const product of products) {
      sitemap += `  <url>
    <loc>${FRONTEND_URL}/product/${product.slug}</loc>
    <lastmod>${product.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>\n`;
    }
    const staticPages = ['about', 'contact', 'privacy', 'terms', 'shipping', 'returns', 'faq'];
    for (const page of staticPages) {
      sitemap += `  <url>
    <loc>${FRONTEND_URL}/${page}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>\n`;
    }
    sitemap += `</urlset>`;
    res.header('Content-Type', 'application/xml');
    res.send(sitemap.replace(/&/g, '&amp;').replace(/'/g, '&apos;').replace(/"/g, '&quot;').replace(/>/g, '&gt;').replace(/<(?!\/?url|<loc|<\/loc|<lastmod|<\/lastmod|<changefreq|<\/changefreq|<priority|<\/priority|urlset|<\/urlset|\?xml)/g, '&lt;'));
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
});
router.get('/robots.txt', (req, res) => {
  const robots = `User-agent: *
Allow: /
Sitemap: ${FRONTEND_URL}/api/seo/sitemap.xml
`;
  res.header('Content-Type', 'text/plain');
  res.send(robots);
});
export default router;
