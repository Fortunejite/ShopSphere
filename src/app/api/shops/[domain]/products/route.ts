import { NextResponse } from 'next/server';
import { Product, ProductAttributes, ProductWithDetails } from '@/models/Product';
import { Shop } from '@/models/Shop';
import { database } from '@/lib/db';
import { errorHandler } from '@/lib/errorHandler';
import { createProductSchema, productQuerySchema, CreateProductInput } from '@/lib/schema/product';
import { requireAuth } from '@/lib/apiAuth';
import slugify from 'slugify';

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

  // Get shop by domain
  const shop = await Shop.findByDomain(domain);
  if (!shop) {
    return NextResponse.json({ message: 'Shop not found' }, { status: 404 });
  }

  const queryParams = Object.fromEntries(searchParams.entries());
  const validationResult = productQuerySchema.safeParse(queryParams);
  
  if (!validationResult.success) {
    const errors = validationResult.error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
    }));
    
    return NextResponse.json(
      { 
        message: 'Invalid query parameters',
        errors 
      },
      { status: 400 }
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
    sortBy,
    sortOrder,
  } = validationResult.data;

  const offset = (page - 1) * limit;

  // Parse categories from comma-separated string
  const categories = category
    ? category
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean)
    : [];

  let products: ProductWithDetails[] = [];
  let totalCount = 0;

  if (search) {
  // Use search functionality
  products = await Product.search(search, limit, offset, shop.id);
  // Get count for search results (simplified - you might want to create a separate count method for search)
  totalCount = await Product.count(shop.id);
} else {
  // Build complex query for filtering
  const whereConditions: string[] = ['p.shop_id = $1'];
  const queryParams: (string | number | boolean | string[] | number[])[] = [
    shop.id,
  ];
  let paramCount = 1;

  // Status filter
  if (status && status !== 'all') {
    paramCount++;
    whereConditions.push(`p.status = $${paramCount}`);
    queryParams.push(status);
  }

  // Featured filter
  if (featured !== null && featured !== undefined) {
    paramCount++;
    whereConditions.push(`p.is_featured = $${paramCount}`);
    queryParams.push(featured === 'true');
  }

  // In stock filter
  if (inStock === 'true') {
    whereConditions.push('p.stock_quantity > 0');
  } else if (inStock === 'false') {
    whereConditions.push('p.stock_quantity = 0');
  }

  // Price range filters
  if (minPrice && !isNaN(Number(minPrice))) {
    paramCount++;
    whereConditions.push(`p.price >= $${paramCount}`);
    queryParams.push(Number(minPrice));
  }

  if (maxPrice && !isNaN(Number(maxPrice))) {
    paramCount++;
    whereConditions.push(`p.price <= $${paramCount}`);
    queryParams.push(Number(maxPrice));
  }

  // Category filter using array operations
  if (categories.length > 0) {
    // First, get category IDs from names/slugs
    const categoryQuery = `
      SELECT ARRAY_AGG(id) as category_ids 
      FROM categories 
      WHERE name = ANY($${paramCount + 1}) OR slug = ANY($${paramCount + 1})
    `;
    paramCount++;
    queryParams.push(categories);

    const categoryResult = await database.query(categoryQuery, [categories]);
    const categoryIds = categoryResult.rows[0]?.category_ids || [];

    if (categoryIds.length > 0) {
      paramCount++;
      whereConditions.push(`p.category_ids && $${paramCount}`);
      queryParams.push(categoryIds);
    }
  }

    // Sort parameters are already validated by schema
    const sortField = sortBy;
    const order = sortOrder;

  // Build the main query
  const query = `
    SELECT 
      p.*,
      s.name AS shop_name,
      s.domain AS shop_domain,
      COALESCE(
        ARRAY_AGG(c.name) FILTER (WHERE c.name IS NOT NULL), 
        '{}'::text[]
      ) AS category_names
    FROM products p
    JOIN shops s ON p.shop_id = s.id
    LEFT JOIN categories c ON c.id = ANY(p.category_ids)
    WHERE ${whereConditions.join(' AND ')}
    GROUP BY p.id, s.name, s.domain
    ORDER BY p.${sortField} ${order}
    LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
  `;

  queryParams.push(limit, offset);

  const result = await database.query(query, queryParams);
  products = result.rows;

  // Get total count for pagination
  const countQuery = `
    SELECT COUNT(DISTINCT p.id) as total
    FROM products p
    WHERE ${whereConditions.join(' AND ')}
  `;

  const countResult = await database.query(
    countQuery,
    queryParams.slice(0, -2),
  ); // Remove limit and offset
  totalCount = parseInt(countResult.rows[0].total);
}

// Calculate pagination info
const totalPages = Math.ceil(totalCount / limit);
const hasNext = page < totalPages;
const hasPrev = page > 1;

const response: ProductsResponse = {
  products,
  pagination: {
    page,
    limit,
    total: totalCount,
    totalPages,
    hasNext,
    hasPrev,
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

  // Get shop by domain
  const shop = await Shop.findByDomain(domain);
  if (!shop) {
    return NextResponse.json({ message: 'Shop not found' }, { status: 404 });
  }

  if (shop.owner_id !== user.id) {
    return NextResponse.json(
      { message: 'Unauthorized to add products to this shop' },
      { status: 403 },
    );
  }

  const body = await request.json();
  body.slug = slugify(body.name, { lower: true, strict: true })

  // Validate input using Zod schema
  const validationResult = createProductSchema.safeParse(body);
  
  if (!validationResult.success) {
    const errors = validationResult.error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
    }));
    
    return NextResponse.json(
      { 
        message: 'Validation failed',
        errors 
      },
      { status: 400 }
    );
  }

  const validatedData: CreateProductInput = validationResult.data;

  // Check if product with same slug already exists in this shop
  const existingProduct = await Product.existsByShopAndSlug(
    shop.id,
    validatedData.slug,
  );
  
  if (existingProduct) {
    return NextResponse.json(
      { message: 'Product with this slug already exists in this shop' },
      { status: 409 },
    );
  }

  // Validate category IDs exist if provided
  if (validatedData.category_ids.length > 0) {
    const categoryCheckQuery = `
      SELECT COUNT(*) as count 
      FROM categories 
      WHERE id = ANY($1)
    `;
    
    const categoryResult = await database.query(categoryCheckQuery, [validatedData.category_ids]);
    const existingCategoriesCount = parseInt(categoryResult.rows[0].count);
    
    if (existingCategoriesCount !== validatedData.category_ids.length) {
      return NextResponse.json(
        { message: 'One or more category IDs are invalid' },
        { status: 400 }
      );
    }
  }

  // Prepare product data for database insertion
  const newProductData = {
    shop_id: shop.id,
    category_ids: validatedData.category_ids,
    name: validatedData.name,
    slug: validatedData.slug,
    description: validatedData.description,
    price: validatedData.price,
    discount: validatedData.discount,
    variants: validatedData.variants,
    image: validatedData.image,
    thumbnails: validatedData.thumbnails,
    is_featured: validatedData.is_featured,
    weight: validatedData.weight,
    length: validatedData.length,
    width: validatedData.width,
    height: validatedData.height,
    stock_quantity: validatedData.stock_quantity,
    status: 'active' as ProductAttributes['status'],
    sales_count: 0,
  };

  // Create the product
  const product = await Product.create(newProductData);

  // Return created product with success status
  return NextResponse.json(
    {
      message: 'Product created successfully',
      product
    },
    { status: 201 }
  );
});
