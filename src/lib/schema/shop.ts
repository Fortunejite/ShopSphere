import { z } from 'zod';
import { currencySymbols } from '@/lib/currency';

export const createShopSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  domain: z
    .string()
    .min(3, 'Domain must be at least 3 characters')
    .max(63, 'Domain must be less than 63 characters')
    .regex(
      /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/,
      'Subdomain must contain only lowercase letters, numbers, and hyphens',
    ),
  category_id: z.number().min(1, 'Category is required'),
  description: z.string().optional(),
  currency: z.enum(Object.keys(currencySymbols) as [string, ...string[]], {
    required_error: 'Currency is required',
  }),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postal_code: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
  free_shipping_threshold: z.number().min(0, 'Free shipping threshold must be 0 or greater').optional(),
  logo: z.string().optional(),
  banner: z.string().optional(),
});
