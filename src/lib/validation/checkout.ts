import { z } from "zod";

export const checkoutCustomerSchema = z.object({
  buyerName: z.string().min(2, "Buyer name must be at least 2 characters."),
  buyerPhone: z.string().min(8, "Buyer phone is required."),
  recipientName: z.string().min(2, "Recipient name must be at least 2 characters."),
  recipientPhone: z.string().min(8, "Recipient phone is required."),
  zipCode: z.string().min(3, "Zip code is required."),
  address1: z.string().min(3, "Address is required."),
  address2: z.string().optional(),
  requestNote: z.string().optional(),
});

export const checkoutCartItemSchema = z.object({
  productId: z.number().int().positive(),
  qty: z.number().int().min(1).max(99),
  selectedOptions: z.record(z.string()),
});

export const checkoutRequestSchema = z.object({
  customer: checkoutCustomerSchema,
  cartItems: z.array(checkoutCartItemSchema).min(1, "Cart is empty."),
});

export type CheckoutCustomerInput = z.infer<typeof checkoutCustomerSchema>;
export type CheckoutRequestInput = z.infer<typeof checkoutRequestSchema>;
