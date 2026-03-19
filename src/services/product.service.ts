import {
  count,
  create,
  deleteById,
  findMany,
  findOne,
  findUnique,
  update,
} from '@/repositories/product.repository';
import { Prisma, Product, Shop } from '@prisma/client';
import { authorizeUser } from './user.service';
import ShopService from './shop.service';
import z from 'zod';
import {
  createProductSchema,
  productQuerySchema,
  updateProductSchema,
} from '@/lib/schema/product';
import slugify from 'slugify';
import CategoryService from './category.service';

class ProductService {
  static async getProductByIds(productIds: Product['id'][]) {
    return await findMany({ where: { id: { in: productIds } } });
  }
  
  static async getProductById(productId: Product['id']) {
    const product = await findOne({ id: productId });

    if (!product) {
      throw { message: 'Product not found', status: 404 };
    }
    return product;
  }

  static async getProductsByShopDomain(
    domain: Shop['domain'],
    params: {
      [k: string]: string;
    },
  ) {
    const shop = await ShopService.getShopByDomain(domain);

    const queryParamsObj = productQuerySchema.parse(params);
    const {
      page,
      limit,
      search,
      category,
      status,
      featured,
      inStock,
      minPrice,
      maxPrice,
      sortBy: originalSortBy,
      sortOrder: originalSortOrder,
      sort,
    } = queryParamsObj;

    // Handle legacy sort parameter
    let sortBy = originalSortBy;
    let sortOrder = originalSortOrder;
    let isFeaturedSort = false;

    if (sort) {
      const sortMapping: Record<
        string,
        { field: string; order: 'asc' | 'desc'; featured?: boolean }
      > = {
        featured: { field: 'is_featured', order: 'desc', featured: true },
        price_low: { field: 'price', order: 'asc' },
        price_high: { field: 'price', order: 'desc' },
        newest: { field: 'created_at', order: 'desc' },
        popular: { field: 'sales_count', order: 'desc' },
        rating: { field: 'created_at', order: 'desc' },
      };
      const mapping = sortMapping[sort];
      if (mapping) {
        sortBy = mapping.field as typeof sortBy;
        sortOrder = mapping.order;
        isFeaturedSort = mapping.featured || false;
      }
    }

    const offset = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      shop_id: shop.id,
    };

    if (status && status !== 'all') {
      where.status = status as Prisma.EnumProductStatusFilter;
    }

    if (category && category !== 'all') {
      where.category_ids = { hasSome: [Number(category)] };
    }

    if (featured !== null && featured !== undefined) {
      where.is_featured = featured === 'true';
    }

    if (inStock === 'true') {
      where.stock_quantity = { gt: 0 };
    } else if (inStock === 'false') {
      where.stock_quantity = { equals: 0 };
    }

    if (minPrice && !isNaN(Number(minPrice))) {
      where.price = { ...(where.price as object), gte: Number(minPrice) };
    }

    if (maxPrice && !isNaN(Number(maxPrice))) {
      where.price = { ...(where.price as object), lte: Number(maxPrice) };
    }

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Build orderBy — featured sort uses multi-field ordering
    const orderBy: Prisma.ProductOrderByWithRelationInput[] = isFeaturedSort
      ? [{ is_featured: 'desc' }, { created_at: 'desc' }]
      : [{ [sortBy ?? 'created_at']: sortOrder ?? 'desc' }];

    const [totalCount, products] = await Promise.all([
      count(where),
      findMany({
        where,
        orderBy,
        take: limit,
        skip: offset,
      }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      products,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  static async getProductBySlug(slug: Product['slug'], domain: Shop['domain']) {
    const shop = await ShopService.getShopByDomain(domain);
    const product = await findUnique({
      shop_id_slug: { shop_id: shop.id, slug },
    });
    if (!product) {
      throw { message: 'Product not found', status: 404 };
    }
    return product;
  }

  static async getProductByShopId(shopId: Shop['id'], slug: Product['slug']) {
    const product = await findUnique({
      shop_id_slug: { shop_id: shopId, slug },
    });
    if (!product) {
      throw { message: 'Product not found', status: 404 };
    }
    return product;
  }

  static async createProduct(
    domain: Shop['domain'],
    data: z.infer<typeof createProductSchema>,
  ) {
    const user = await authorizeUser();
    const shop = await ShopService.getShopByDomain(domain);

    if (shop.owner_id !== user.id) {
      throw {
        message: 'Unauthorized to create product for this shop',
        status: 403,
      };
    }

    const validationResult = createProductSchema.parse(data);
    const slug = slugify(validationResult.name, { lower: true, strict: true });

    // Validate that all provided category IDs exist
    await CategoryService.verifyCategoriesExists(validationResult.category_ids);

    const productData: Prisma.ProductCreateInput = {
      category_ids: validationResult.category_ids,
      name: validationResult.name,
      slug,
      description: validationResult.description,
      price: validationResult.price,
      discount: validationResult.discount ?? 0,
      variants: validationResult.variants ?? [],
      image: validationResult.image,
      thumbnails: validationResult.thumbnails ?? [],
      is_featured: validationResult.is_featured ?? false,
      weight: validationResult.weight ?? 0,
      length: validationResult.length ?? 0,
      width: validationResult.width ?? 0,
      height: validationResult.height ?? 0,
      stock_quantity: validationResult.stock_quantity ?? 0,
      status: 'active',
      sales_count: 0,

      // connect relations
      shop: { connect: { id: shop.id } },
    };
    return await create(productData);
  }

  static async updateProductBySlug(
    slug: Product['slug'],
    domain: Shop['domain'],
    data: z.infer<typeof updateProductSchema>,
  ) {
    const shop = await ShopService.getShopByDomain(domain);
    const product = await ProductService.getProductByShopId(shop.id, slug);
    const user = await authorizeUser();
    if (shop.owner_id !== user.id) {
      throw { message: 'Unauthorized to update this product', status: 403 };
    }

    const validationResult = updateProductSchema.parse(data);
    return await update(product.id, validationResult);
  }

  static async deleteProductBySlug(
    slug: Product['slug'],
    domain: Shop['domain'],
  ) {
    const shop = await ShopService.getShopByDomain(domain);
    const product = await ProductService.getProductByShopId(shop.id, slug);

    const user = await authorizeUser();
    if (shop.owner_id !== user.id) {
      throw { message: 'Unauthorized to delete this product', status: 403 };
    }
    return await deleteById(product.id);
  }
}

export default ProductService;
