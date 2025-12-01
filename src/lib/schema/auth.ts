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
  role: z.enum(['user', 'admin']).default('user'),
  address: z.string().min(5, 'Address must be at least 5 characters long'),
  city: z.string().min(2, 'City must be at least 2 characters long'),
});

// export type CreateUserInput = z.infer<typeof createUserSchema>;

export const loginUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});
