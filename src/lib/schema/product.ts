import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  categories: z.array(z.string()),
  tags: z.array(z.string()),
  variants: z.array(
    z.object({
      attributes: z.record(z.string(), z.string()),
      price: z.coerce.number().optional(),
      stock: z.coerce.number().optional(),
      discount: z.coerce.number().optional(),
      isDefault: z.boolean(),
    }),
  ).default([]),
  price: z.coerce.number(),
  discount: z.coerce.number().optional(),
  stock: z.coerce.number().optional(),
  weight: z.coerce.number().optional(),
  saleStart: z.date().optional(),
  saleEnd: z.date().optional(),
  mainPic: z.string(),
  thumbnails: z
    .array(z.string())
    .max(5, 'A maximum of 5 thumbnails is required'),
  isFeatured: z.boolean(),
  status: z.enum(['active', 'draft']).default('active'),
});
