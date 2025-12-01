import { z } from "zod";

export const orderSchema = z.object({
  name: z.string().trim().min(3, 'Name should be more than 3 charactrers'),
  email: z.string().email('Invalid email format'),
  phone: z.string().min(0, 'Phone number is required'),
  address: z.string().min(1, 'Address is Reqiured'),
  note: z.string().optional()
})