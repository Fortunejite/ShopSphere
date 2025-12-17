import { z } from 'zod';

export const variantsSchema = z.object({
  variants: z.array(z.object({
    attributes: z.record(z.string(), z.string()),
    price: z.number().min(0, 'Variant price must be non-negative'),
    discount: z.number().min(0, 'Variant discount must be non-negative').max(100, 'Discount cannot exceed 100%'),
    stock_quantity: z.number().int().min(0, 'Variant stock quantity must be non-negative'),
    is_default: z.boolean(),
  })).default([]),
});

export const basicInfoSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(255, 'Name too long'),
  description: z.string(),
  category_ids: z.array(z.number()).min(1, 'At least one category is required'),
});

export const pricingSchema = z.object({
  price: z.number().min(0.01, 'Price must be greater than 0'),
  discount: z.number().min(0, 'Discount must be non-negative').max(100, 'Discount cannot exceed 100%'),
  stock_quantity: z.number().int().min(0, 'Stock quantity must be non-negative'),
  is_featured: z.boolean(),
});

export const mediaSchema = z.object({
  image: z.string().min(1, 'Main image is required'),
  thumbnails: z.array(z.string().url('Thumbnail must be a valid URL'))
    .max(10, 'Maximum of 10 thumbnails allowed')
    .default([]),
});

export const shippingSchema = z.object({
  weight: z.number().min(0, 'Weight must be non-negative'),
  length: z.number().min(0, 'Length must be non-negative'),
  width: z.number().min(0, 'Width must be non-negative'),
  height: z.number().min(0, 'Height must be non-negative'),
});

export const createProductSchema = z.object({
  ...basicInfoSchema.shape,
  ...pricingSchema.shape,
  ...mediaSchema.shape,
  ...shippingSchema.shape,
  ...variantsSchema.shape,
});

export const updateProductSchema = createProductSchema.partial();

export const productQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
  search: z.string().optional(),
  category: z.string().optional(),
  status: z.enum(['active', 'inactive', 'out_of_stock', 'all']).default('active'),
  featured: z.enum(['true', 'false']).optional(),
  inStock: z.enum(['true', 'false']).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  sortBy: z.enum(['name', 'price', 'created_at', 'updated_at', 'sales_count', 'stock_quantity', 'is_featured']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  // Legacy support for frontend sort parameter
  sort: z.string().optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductQueryInput = z.infer<typeof productQuerySchema>;
