import { z } from 'zod';
import { currencySymbols } from '@/lib/currency';

// Color theme schema for validation
const colorFormatRegex = /^#[0-9A-Fa-f]{6}$|^#[0-9A-Fa-f]{3}$|^rgb\(.*\)$|^rgba\(.*\)$|^oklch\(.*\)$/;
const colorValidation = z.string().regex(colorFormatRegex, 'Invalid color format');
const optionalColorValidation = colorValidation.optional();

export const colorThemeSchema = z.object({
  // Core colors (required)
  primary: colorValidation,
  secondary: colorValidation,
  background: colorValidation,
  text: colorValidation,
  accent: colorValidation,
  
  // Core foreground colors
  primaryForeground: optionalColorValidation,
  secondaryForeground: optionalColorValidation,
  accentForeground: optionalColorValidation,
  
  // UI colors
  card: optionalColorValidation,
  cardForeground: optionalColorValidation,
  popover: optionalColorValidation,
  popoverForeground: optionalColorValidation,
  muted: optionalColorValidation,
  mutedForeground: optionalColorValidation,
  border: optionalColorValidation,
  input: optionalColorValidation,
  ring: optionalColorValidation,
  
  // Semantic colors
  destructive: optionalColorValidation,
  destructiveForeground: optionalColorValidation,
  success: optionalColorValidation,
  successForeground: optionalColorValidation,
  warning: optionalColorValidation,
  warningForeground: optionalColorValidation,
  error: optionalColorValidation,
  errorForeground: optionalColorValidation,
  info: optionalColorValidation,
  infoForeground: optionalColorValidation,
  
  // Chart colors
  chart1: optionalColorValidation,
  chart2: optionalColorValidation,
  chart3: optionalColorValidation,
  chart4: optionalColorValidation,
  chart5: optionalColorValidation,
  
  // Sidebar colors
  sidebar: optionalColorValidation,
  sidebarForeground: optionalColorValidation,
  sidebarPrimary: optionalColorValidation,
  sidebarPrimaryForeground: optionalColorValidation,
  sidebarAccent: optionalColorValidation,
  sidebarAccentForeground: optionalColorValidation,
  sidebarBorder: optionalColorValidation,
  sidebarRing: optionalColorValidation,
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
