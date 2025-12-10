import { z } from 'zod';

// Address schema
export const addressSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(1, 'Phone is required'),
  address_line_1: z.string().min(1, 'Address is required'),
  address_line_2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postal_code: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
});

// Create order schema
export const createOrderSchema = z.object({
  shipping_address: addressSchema,
  billing_address: addressSchema.optional(),
  payment_method: z.string().optional(),
  notes: z.string().max(500).optional(),
  tax_rate: z.number().min(0).max(100).default(0),
  shipping_cost: z.number().min(0).default(0),
  discount_amount: z.number().min(0).default(0),
});

// Update order status schema
export const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']),
  admin_notes: z.string().max(1000).optional(),
});

// Update payment status schema
export const updatePaymentStatusSchema = z.object({
  payment_status: z.enum(['pending', 'paid', 'failed', 'refunded']),
  payment_method: z.string().optional(),
});

// Order filters schema
export const orderFiltersSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']).optional(),
  payment_status: z.enum(['pending', 'paid', 'failed', 'refunded']).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
});

// Order item schema
export const orderItemSchema = z.object({
  product_id: z.number().int().positive(),
  quantity: z.number().int().min(1).max(999),
  variant_index: z.number().int().min(0).optional(),
  unit_price_at_purchase: z.number().min(0),
  discount_at_purchase: z.number().min(0).max(100).default(0),
  subtotal: z.number().min(0),
});

// Cancel order schema
export const cancelOrderSchema = z.object({
  reason: z.string().min(1).max(500),
});