import { z } from 'zod';
import { currencySymbols } from '@/lib/currency';

// Color theme schema for validation
export const colorThemeSchema = z.object({
  primary: z.string().regex(/^#[0-9A-Fa-f]{6}$|^#[0-9A-Fa-f]{3}$|^rgb\(.*\)$|^rgba\(.*\)$|^oklch\(.*\)$/, 'Invalid color format'),
  secondary: z.string().regex(/^#[0-9A-Fa-f]{6}$|^#[0-9A-Fa-f]{3}$|^rgb\(.*\)$|^rgba\(.*\)$|^oklch\(.*\)$/, 'Invalid color format'),
  background: z.string().regex(/^#[0-9A-Fa-f]{6}$|^#[0-9A-Fa-f]{3}$|^rgb\(.*\)$|^rgba\(.*\)$|^oklch\(.*\)$/, 'Invalid color format'),
  text: z.string().regex(/^#[0-9A-Fa-f]{6}$|^#[0-9A-Fa-f]{3}$|^rgb\(.*\)$|^rgba\(.*\)$|^oklch\(.*\)$/, 'Invalid color format'),
  accent: z.string().regex(/^#[0-9A-Fa-f]{6}$|^#[0-9A-Fa-f]{3}$|^rgb\(.*\)$|^rgba\(.*\)$|^oklch\(.*\)$/, 'Invalid color format'),
});

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
  tagline: z.string().max(100, 'Tagline must be less than 100 characters').optional(),
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
  light_theme: colorThemeSchema.optional(),
  dark_theme: colorThemeSchema.optional(),
});
