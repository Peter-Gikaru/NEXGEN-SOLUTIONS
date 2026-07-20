import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth';
import fs from 'fs';
import csv from 'csv-parser';
import { logAdminAction } from '../utils/adminLogger';
function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
        );
      }
    }
  }
  return matrix[b.length][a.length];
}
export const getFilterMetadata = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const brands = await prisma.product.findMany({
      select: { brand: true },
      distinct: ['brand'],
      where: { isActive: true }
    });
    const uniqueBrands = brands.map(b => b.brand).filter(Boolean).sort();

    const productsWithSpecs = await prisma.product.findMany({
      select: { specs: true },
      where: { isActive: true }
    });

    const dynamicSpecsRaw: Record<string, Set<string>> = {};
    productsWithSpecs.forEach(p => {
      if (p.specs && typeof p.specs === 'object' && !Array.isArray(p.specs)) {
        Object.entries(p.specs as Record<string, any>).forEach(([key, value]) => {
          if (value === undefined || value === null || String(value).trim() === '') return;
          if (!dynamicSpecsRaw[key]) dynamicSpecsRaw[key] = new Set();
          dynamicSpecsRaw[key].add(String(value).trim());
        });
      }
    });

    const dynamicSpecs: Record<string, string[]> = {};
    Object.entries(dynamicSpecsRaw).forEach(([key, valSet]) => {
      dynamicSpecs[key] = Array.from(valSet).sort();
    });

    return res.json({ brands: uniqueBrands, dynamicSpecs });
  } catch (error) {
    return next(error);
  }
};

export const listProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { category, search, minPrice, maxPrice, brand, sort, page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;
    const skip = (pageNum - 1) * limitNum;
    const whereClause: any = {};
    const userRole = (req as AuthenticatedRequest).user?.role;
    if (req.query.includeInactive === 'true' && userRole === 'ADMIN') {
      
    } else {
      whereClause.isActive = true;
    }
    if (category) {
      whereClause.category = {
        OR: [
          { slug: category as string },
          { name: category as string }
        ]
      };
    }
    if (brand) {
      if (Array.isArray(brand)) {
        whereClause.brand = { in: brand as string[] };
      } else {
        whereClause.brand = brand as string;
      }
    }
    if (minPrice || maxPrice) {
      whereClause.price = {};
      if (minPrice) {
        whereClause.price.gte = parseFloat(minPrice as string);
      }
      if (maxPrice) {
        whereClause.price.lte = parseFloat(maxPrice as string);
      }
    }
    if (search) {
      const searchStr = search as string;
      whereClause.OR = [
        { name: { contains: searchStr } },
        { slug: { contains: searchStr } },
        { description: { contains: searchStr } },
        { brand: { contains: searchStr } },
        { category: { name: { contains: searchStr } } },
      ];
    }
    const standardQueries = ['category', 'search', 'minPrice', 'maxPrice', 'brand', 'sort', 'page', 'limit', 'includeInactive'];
    
    const buildSpecsOr = (field: string, value: any) => {
      if (!value) return null;
      const values = Array.isArray(value) ? value : [value];
      if (values.length === 1) {
        return { specs: { path: [field], equals: values[0] as string } };
      }
      return {
        OR: values.map((v: any) => ({
          specs: { path: [field], equals: v as string }
        }))
      };
    };

    Object.keys(req.query).forEach(key => {
      if (!standardQueries.includes(key)) {
        if (!whereClause.AND) whereClause.AND = [];
        const specClause = buildSpecsOr(key, req.query[key]);
        if (specClause) whereClause.AND.push(specClause);
      }
    });

    let orderByClause: any = { createdAt: 'desc' };
    if (sort === 'price_asc') {
      orderByClause = { price: 'asc' };
    } else if (sort === 'price_desc') {
      orderByClause = { price: 'desc' };
    } else if (sort === 'rating') {
    }
    const [total, products] = await Promise.all([
      prisma.product.count({ where: whereClause }),
      prisma.product.findMany({
        where: whereClause,
        orderBy: orderByClause,
        skip,
        take: limitNum,
        include: {
          category: true,
          reviews: true
        }
      })
    ]);
    const formattedProducts = products.map(product => {
      let images = [];
      if (Array.isArray(product.imageUrls)) {
        images = product.imageUrls;
      } else if (typeof product.imageUrls === 'string') {
        try { images = JSON.parse(product.imageUrls); } catch(e) { images = [product.imageUrls]; }
      }
      let totalRating = 0;
      product.reviews.forEach(r => totalRating += r.rating);
      const avgRating = product.reviews.length > 0 ? totalRating / product.reviews.length : 0;
      let parsedVariants = product.variants || [];
      if (typeof parsedVariants === 'string') {
        try { parsedVariants = JSON.parse(parsedVariants); } catch(e) {}
      }
      let parsedSpecs = product.specs || {};
      if (typeof parsedSpecs === 'string') {
        try { parsedSpecs = JSON.parse(parsedSpecs); } catch(e) {}
      }
      return {
        ...product,
        imageUrls: images,
        rating: avgRating,
        reviewCount: product.reviews.length,
        variants: parsedVariants,
        specs: parsedSpecs,
        category: product.category,
      };
    });
    let didYouMean = null;
    if (total === 0 && search) {
      const allProducts = await prisma.product.findMany({ select: { name: true } });
      const queryLower = (search as string).toLowerCase();
      let minDistance = Infinity;
      for (const p of allProducts) {
        const pNameLower = p.name.toLowerCase();
        const distFull = levenshteinDistance(queryLower, pNameLower);
        let minWordDist = Infinity;
        const words = pNameLower.split(/\s+/);
        for(let i=0; i<words.length; i++) {
            for (let j=i+1; j<=words.length; j++) {
                const subPhrase = words.slice(i, j).join(" ");
                const d = levenshteinDistance(queryLower, subPhrase);
                if (d < minWordDist) minWordDist = d;
            }
        }
        const dist = Math.min(distFull, minWordDist);
        if (dist < minDistance) {
          minDistance = dist;
          didYouMean = p.name;
        }
      }
      if (minDistance > 4) didYouMean = null; 
    }
    return res.json({
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      products: formattedProducts,
      didYouMean
    });
  } catch (error) {
    return next(error);
  }
};
export const getProductBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug } = req.params;
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
    
    let product = await prisma.product.findFirst({
      where: isUUID ? { id: slug } : { slug },
      include: {
        category: true,
        reviews: {
          include: { user: { select: { name: true } } },
          orderBy: { createdAt: 'desc' }
        },
        questions: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    const userRole = (req as AuthenticatedRequest).user?.role;
    if (product && (product.isActive || (req.query.includeInactive === 'true' && userRole === 'ADMIN'))) {
      let images = [];
      if (Array.isArray(product.imageUrls)) {
        images = product.imageUrls;
      } else if (typeof product.imageUrls === 'string') {
        try { images = JSON.parse(product.imageUrls); } catch(e) { images = [product.imageUrls]; }
      }
      let totalRating = 0;
      product.reviews.forEach(r => totalRating += r.rating);
      const avgRating = product.reviews.length > 0 ? totalRating / product.reviews.length : 0;
      let parsedVariants = product.variants || [];
      if (typeof parsedVariants === 'string') {
        try { parsedVariants = JSON.parse(parsedVariants); } catch(e) {}
      }
      let parsedSpecs = product.specs || {};
      if (typeof parsedSpecs === 'string') {
        try { parsedSpecs = JSON.parse(parsedSpecs); } catch(e) {}
      }
      return res.json({
        ...product,
        imageUrls: images,
        rating: avgRating,
        reviewCount: product.reviews.length,
        variants: parsedVariants,
        specs: parsedSpecs,
        category: product.category,
      });
    }
    const allProducts = await prisma.product.findMany({ select: { slug: true, name: true } });
    let bestMatch = null;
    let minDistance = Infinity;
    const queryLower = slug.toLowerCase().replace(/-/g, ' ');
    for (const p of allProducts) {
      const pSlugLower = p.slug.toLowerCase().replace(/-/g, ' ');
      const pNameLower = p.name.toLowerCase();
      const dist1 = levenshteinDistance(queryLower, pSlugLower);
      const dist2 = levenshteinDistance(queryLower, pNameLower);
      const dist = Math.min(dist1, dist2);
      if (dist < minDistance) {
        minDistance = dist;
        bestMatch = p.slug;
      }
    }
    if (bestMatch && minDistance <= 3) {
      return res.status(404).json({
        message: 'Product not found',
        didYouMean: bestMatch
      });
    }
    return res.status(404).json({ message: 'Product not found' });
  } catch (error) {
    return next(error);
  }
};
export const createProduct = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, description, brand, price, compareAtPrice, stock, categoryId, specs, imageUrls, threeDModelUrl } = req.body;
    let slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        brand,
        price: Number(price),
        compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
        stock: Number(stock),
        categoryId,
        specs: typeof specs === 'string' ? JSON.parse(specs) : specs,
        imageUrls: Array.isArray(imageUrls) ? imageUrls : (typeof imageUrls === 'string' ? imageUrls.split(',').map((s: string) => s.trim()).filter(Boolean) : []),
        threeDModelUrl,
      }
    });
    await logAdminAction(req.user!.id, 'CREATE_PRODUCT', `Created product: ${product.name} (${product.id})`, req.ip);
    return res.status(201).json(product);
  } catch (error) {
    return next(error);
  }
};
export const updateProduct = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { name, description, brand, price, compareAtPrice, stock, categoryId, specs, imageUrls, isActive, variants } = req.body;
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: 'Product not found' });
    const updateData: any = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (brand) updateData.brand = brand;
    if (price !== undefined) updateData.price = Number(price);
    if (compareAtPrice !== undefined) updateData.compareAtPrice = compareAtPrice ? Number(compareAtPrice) : null;
    if (stock !== undefined) updateData.stock = Number(stock);
    if (categoryId) updateData.categoryId = categoryId;
    if (specs) updateData.specs = typeof specs === 'string' ? JSON.parse(specs) : specs;
    if (imageUrls) updateData.imageUrls = Array.isArray(imageUrls) ? imageUrls : (typeof imageUrls === 'string' ? imageUrls.split(',').map((s: string) => s.trim()).filter(Boolean) : []);
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);
    if (variants !== undefined) updateData.variants = typeof variants === 'string' ? JSON.parse(variants) : variants;
    const product = await prisma.product.update({
      where: { id },
      data: updateData
    });
    await logAdminAction(req.user!.id, 'UPDATE_PRODUCT', `Updated product: ${product.name} (${product.id})`, req.ip);
    return res.json(product);
  } catch (error) {
    return next(error);
  }
};
export const deleteProduct = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: 'Product not found' });
    
    // Safety check: Prevent deleting products that have been ordered
    const orderItemsCount = await prisma.orderItem.count({ where: { productId: id } });
    if (orderItemsCount > 0) {
      return res.status(400).json({ 
        message: "This product is linked to past orders and cannot be permanently deleted. Please use 'Recall' to hide it from the store instead." 
      });
    }

    await prisma.product.delete({ where: { id } });
    await logAdminAction(req.user!.id, 'DELETE_PRODUCT', `Deleted product: ${existing.name} (${existing.id})`, req.ip);
    return res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    return next(error);
  }
};
export const getRelatedProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({ 
      where: { id },
      select: { id: true, categoryId: true }
    });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    const related = await prisma.product.findMany({
      where: {
        id: { not: product.id },
        isActive: true,
        OR: [
          { categoryId: product.categoryId },
        ]
      },
      take: 4,
      include: {
        category: true
      }
    });
      const formattedRelated = related.map(product => {
        let images = [];
        if (Array.isArray(product.imageUrls)) {
          images = product.imageUrls;
        } else if (typeof product.imageUrls === 'string') {
          try { images = JSON.parse(product.imageUrls); } catch(e) { images = [product.imageUrls]; }
        }
        let parsedVariants = product.variants || [];
        if (typeof parsedVariants === 'string') {
          try { parsedVariants = JSON.parse(parsedVariants); } catch(e) {}
        }
        return {
          ...product,
          imageUrls: images,
          variants: parsedVariants
        };
      });
      return res.json(formattedRelated);
  } catch (error) {
    return next(error);
  }
};
export const createBulkProducts = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const results = req.body.products;
    if (!results || !Array.isArray(results)) {
      return res.status(400).json({ message: 'No valid products array found in request body' });
    }
    const errors: any[] = [];
    const createdProducts = [];
    let rowNumber = 1;
    for (const row of results) {
      row._rowNumber = ++rowNumber;
      try {
        if (!row.name || !row.price || !row.categoryName) {
          throw new Error('Missing required fields (name, price, categoryName)');
        }
        let cat = await prisma.category.findUnique({ where: { name: row.categoryName } });
        if (!cat) {
          cat = await prisma.category.findFirst({ where: { name: { equals: row.categoryName } } });
        }
        if (!cat) {
            const newSlug = row.categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
            cat = await prisma.category.create({
              data: {
                name: row.categoryName,
                slug: newSlug,
                description: `Auto-generated category for ${row.categoryName}`
              }
            });
        }
        let finalCategoryId = cat.id;
          if (row.subcategoryName) {
            let subCat = await prisma.category.findFirst({
              where: { 
                name: { equals: row.subcategoryName },
                parentId: cat.id
              }
            });
            if (!subCat) {
              const subSlug = row.subcategoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
              let uniqueSubSlug = subSlug;
              let counter = 1;
              while (await prisma.category.findUnique({ where: { slug: uniqueSubSlug } })) {
                uniqueSubSlug = `${subSlug}-${counter}`;
                counter++;
              }
              subCat = await prisma.category.create({
                data: {
                  name: row.subcategoryName,
                  slug: uniqueSubSlug,
                  description: `Auto-generated subcategory for ${row.subcategoryName}`,
                  parentId: cat.id
                }
              });
            }
            finalCategoryId = subCat.id;
          }
          const categoryId = finalCategoryId;
        let slug = row.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        const existing = await prisma.product.findUnique({ where: { slug } });
        if (existing) {
          slug = `${slug}-${Date.now().toString().slice(-4)}`;
        }
        const product = await prisma.product.create({
          data: {
            name: row.name,
            slug,
            description: row.description || '',
            brand: row.brand || 'Generic',
            price: parseFloat(row.price),
            compareAtPrice: row.compareAtPrice ? parseFloat(row.compareAtPrice) : null,
            stock: parseInt(row.stock) || 0,
            categoryId,
            imageUrls: typeof row.imageUrls === 'string' ? row.imageUrls.split(',').map((s: string) => s.trim()).filter(Boolean) : (Array.isArray(row.imageUrls) ? row.imageUrls : []),
            specs: typeof row.specs === 'string' ? JSON.parse(row.specs) : (row.specs || {}),
            variants: typeof row.variants === 'string' ? JSON.parse(row.variants) : (row.variants || []),
          }
        });
        createdProducts.push(product);
      } catch (err: any) {
        errors.push({ row: row._rowNumber, data: row, error: err.message });
      }
    }
    await logAdminAction(req.user!.id, 'BULK_UPLOAD_PRODUCTS', `Uploaded ${createdProducts.length} products. Errors: ${errors.length}`, req.ip);
    res.json({
      message: 'Bulk upload completed',
      successCount: createdProducts.length,
      errorsCount: errors.length,
      errors
    });
  } catch (error) {
    return next(error);
  }
};
export const toggleProductActive = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: 'Product not found' });
    const product = await prisma.product.update({
      where: { id },
      data: { isActive: Boolean(isActive) }
    });
    await logAdminAction(req.user!.id, 'TOGGLE_PRODUCT', `${isActive ? 'Activated' : 'Deactivated'} product: ${product.name} (${product.id})`, req.ip);
    return res.json(product);
  } catch (error) {
    return next(error);
  }
};
export const deleteAllProducts = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const deleted = await prisma.product.deleteMany({});
    await logAdminAction(
      req.user!.id,
      'DELETE_ALL_PRODUCTS',
      `Deleted ${deleted.count} products from the database`,
      req.ip
    );
    return res.json({ message: 'All products deleted successfully', count: deleted.count });
  } catch (error) {
    return next(error);
  }
};
export const validateBulkProducts = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const results = req.body.products;
    if (!results || !Array.isArray(results)) {
      return res.status(400).json({ message: 'No valid products array found in request body' });
    }
    const existingProducts = await prisma.product.findMany({
      select: { slug: true }
    });
    const existingSlugs = new Set(existingProducts.map(p => p.slug));
    const newProducts = [];
    let duplicateCount = 0;
    for (const row of results) {
       if (!row.name) continue;
       const slug = row.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
       if (existingSlugs.has(slug)) {
          duplicateCount++;
       } else {
          newProducts.push(row);
          existingSlugs.add(slug);
       }
    }
    return res.json({ newProducts, duplicateCount });
  } catch (error) {
    return next(error);
  }
};
