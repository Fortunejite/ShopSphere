import { z } from 'zod';

export const cartItemSchema = z.object({
  product_id: z.number().min(1, 'Product ID must be a positive integer'),
  variant_index: z.number().min(0).optional(),
  quantity: z.number().min(1, 'Quantity must be at least 1').default(1),
});

export const cartSchema = z.object({
  user_id: z.number().min(1),
  shop_id: z.number().min(1),
  items: z.array(cartItemSchema),
  created_at: z.date(),
  updated_at: z.date()
});