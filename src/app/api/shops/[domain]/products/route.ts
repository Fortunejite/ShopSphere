import { NextResponse } from 'next/server';
import { errorHandler } from '@/lib/errorHandler';
import {
  createProductSchema,
  productQuerySchema,
  CreateProductInput,
} from '@/lib/schema/product';
import { requireAuth } from '@/lib/apiAuth';
import slugify from 'slugify';
import { getShopByDomain } from '@/lib/shop';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// Derive the Prisma result type with included relations
type ProductWithDetails = Prisma.ProductGetPayload<{
  include: {
    shop: { select: { name: true; domain: true } };
    categories: { select: { name: true } };
  };
}>;

interface ProductsResponse {
  products: ProductWithDetails[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export const GET = errorHandler(async (request, { params }) => {
  const { searchParams } = new URL(request.url);
  const { domain } = await params;

  if (!domain) {
    return NextResponse.json(
      { message: 'Shop domain is required' },
      { status: 400 },
    );
  }

  const shop = await getShopByDomain(domain);

  const queryParamsObj = Object.fromEntries(searchParams.entries());
  const validationResult = productQuerySchema.safeParse(queryParamsObj);

  if (!validationResult.success) {
    const errors = validationResult.error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }));
    return NextResponse.json(
      { message: 'Invalid query parameters', errors },
      { status: 400 },
    );
  }

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
  } = validationResult.data;

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

  // Parse categories from comma-separated string
  const categoryList = category
    ? category
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean)
    : [];

  // Build Prisma where clause
  const where: Prisma.ProductWhereInput = {
    shop_id: shop.id,
  };

  if (status && status !== 'all') {
    where.status = status as Prisma.EnumProductStatusFilter;
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

  // Category filter — resolve names/slugs to IDs if needed
  if (categoryList.length > 0) {
    const isNumericIds = categoryList.every((cat) => !isNaN(Number(cat)));

    if (isNumericIds) {
      const categoryIds = categoryList.map((cat) => Number(cat));
      // category_ids array must overlap (hasSome) the requested IDs
      where.category_ids = { hasSome: categoryIds };
    } else {
      // Resolve names/slugs → IDs via Prisma
      const matchedCategories = await prisma.category.findMany({
        where: {
          OR: [{ name: { in: categoryList } }, { slug: { in: categoryList } }],
        },
        select: { id: true },
      });

      const resolvedIds = matchedCategories.map((c) => c.id);
      if (resolvedIds.length > 0) {
        where.category_ids = { hasSome: resolvedIds };
      }
    }
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

  const include = {
    shop: { select: { name: true, domain: true } },
    categories: { select: { name: true } },
  } satisfies Prisma.ProductInclude;

  // Run count + findMany in parallel
  const [totalCount, products] = await prisma.$transaction([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include,
      orderBy,
      take: limit,
      skip: offset,
    }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  const response: ProductsResponse = {
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

  return NextResponse.json(response);
});

export const POST = errorHandler(async (request, { params }) => {
  const { domain } = await params;

  if (!domain) {
    return NextResponse.json(
      { message: 'Shop domain is required' },
      { status: 400 },
    );
  }

  const user = await requireAuth();

  const shop = await getShopByDomain(domain);

  if (shop.owner_id !== user.id) {
    return NextResponse.json(
      { message: 'Unauthorized to add products to this shop' },
      { status: 403 },
    );
  }

  const body = await request.json();
  const validationResult = createProductSchema.safeParse(body);

  if (!validationResult.success) {
    const errors = validationResult.error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }));
    return NextResponse.json(
      { message: 'Validation failed', errors },
      { status: 400 },
    );
  }

  const validatedData: CreateProductInput = validationResult.data;
  const slug = slugify(validatedData.name, { lower: true, strict: true });

  // Check for duplicate slug in this shop
  const existingProduct = await prisma.product.findUnique({
    where: { shop_id_slug: { shop_id: shop.id, slug } },
  });

  if (existingProduct) {
    return NextResponse.json(
      { message: 'Product with this slug already exists in this shop' },
      { status: 409 },
    );
  }

  // Validate that all provided category IDs exist
  if (validatedData.category_ids.length > 0) {
    const existingCategories = await prisma.category.count({
      where: { id: { in: validatedData.category_ids } },
    });

    if (existingCategories !== validatedData.category_ids.length) {
      return NextResponse.json(
        { message: 'One or more category IDs are invalid' },
        { status: 400 },
      );
    }
  }

  // Create product — connect categories via relation AND store raw IDs array
  const product = await prisma.product.create({
    data: {
      shop_id: shop.id,
      category_ids: validatedData.category_ids,
      name: validatedData.name,
      slug,
      description: validatedData.description,
      price: validatedData.price,
      discount: validatedData.discount ?? 0,
      variants: validatedData.variants ?? [],
      image: validatedData.image,
      thumbnails: validatedData.thumbnails ?? [],
      is_featured: validatedData.is_featured ?? false,
      weight: validatedData.weight ?? 0,
      length: validatedData.length ?? 0,
      width: validatedData.width ?? 0,
      height: validatedData.height ?? 0,
      stock_quantity: validatedData.stock_quantity ?? 0,
      status: 'active',
      sales_count: 0,
      // Connect the Category relation rows so the join table stays in sync
      categories: {
        connect: validatedData.category_ids.map((id) => ({ id })),
      },
    },
    include: {
      shop: { select: { name: true, domain: true } },
      categories: { select: { name: true } },
    },
  });

  return NextResponse.json(
    { message: 'Product created successfully', product },
    { status: 201 },
  );
});
