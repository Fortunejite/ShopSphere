import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters long')
    .trim(),
  phone_number: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, "Phone number can't be more than 15 digits")
    .regex(/^\d+$/, 'Phone number must contain only numbers'),
  address: z.string().min(5, 'Address must be at least 5 characters long'),
});

// export type CreateUserInput = z.infer<typeof createUserSchema>;

export const loginUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export const updateProfileSchema = z.object({
  username: z.string().min(2, 'Username must be at least 2 characters').max(50, 'Username must be less than 50 characters').optional(),
  phone_number: z.string().min(10, 'Phone number must be at least 10 characters').max(20, 'Phone number must be less than 20 characters').optional(),
  address: z.string().max(255, 'Address must be less than 255 characters').optional(),
});