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
});
