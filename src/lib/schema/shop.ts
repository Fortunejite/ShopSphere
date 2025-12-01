import { z } from 'zod';
import { currencySymbols } from '@/lib/currency';

export const createShopSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  subdomain: z
    .string()
    .min(3, 'Subdomain must be at least 3 characters')
    .max(63, 'Subdomain must be less than 63 characters')
    .regex(
      /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/,
      'Subdomain must contain only lowercase letters, numbers, and hyphens',
    ),
  category: z.string(),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters long'),
  currency: z.enum(Object.keys(currencySymbols) as [string, ...string[]], {
    required_error: 'Currency is required',
  }),
  logo: z.string().url('Invalid logo URL').optional(),
  socialLinks: z.array(z.string().url('Invalid social link URL')).optional(),
});
