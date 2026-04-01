import z from "zod";

export const accountConnectSchema = z.object({
  bankCode: z.string(),
  accountNumber: z.string(),
})