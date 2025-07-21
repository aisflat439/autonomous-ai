import { z } from "@hono/zod-openapi";

// Common schemas used by both v1 and v2
export const ErrorSchema = z.object({
  error: z.string().openapi({ example: "Customer not found" }),
});

export const CustomerIdParamSchema = z.object({
  customerId: z.string().openapi({
    param: { name: "customerId", in: "path" },
    example: "cust_123",
  }),
});

// V1 Customer schemas (Old Customers)
export const OldCustomerItemSchema = z.object({
  customerId: z.string().openapi({ example: "cust_123" }),
  name: z.string().openapi({ example: "John Doe" }),
  email: z.string().email().openapi({ example: "john@example.com" }),
  createdAt: z
    .string()
    .datetime()
    .openapi({ example: "2024-01-01T00:00:00.000Z" }),
  updatedAt: z
    .string()
    .datetime()
    .openapi({ example: "2024-01-01T00:00:00.000Z" }),
});

export const CreateOldCustomerItemSchema = z.object({
  customerId: z.string().openapi({ example: "cust_123" }),
  name: z.string().openapi({ example: "John Doe" }),
  email: z.string().email().openapi({ example: "john@example.com" }),
});

export const UpdateOldCustomerItemSchema = z.object({
  name: z.string().optional().openapi({ example: "John Doe" }),
  email: z.string().email().optional().openapi({ example: "john@example.com" }),
});

// V2 Customer schemas (New Customers)
export const NewCustomerItemSchema = z.object({
  customerId: z.string().openapi({ example: "cust_123" }),
  name: z.string().openapi({ example: "John Doe" }),
  email: z.string().email().openapi({ example: "john@example.com" }),
  createdAt: z
    .string()
    .datetime()
    .openapi({ example: "2024-01-01T00:00:00.000Z" }),
  updatedAt: z
    .string()
    .datetime()
    .openapi({ example: "2024-01-01T00:00:00.000Z" }),
});

export const CreateNewCustomerItemSchema = z.object({
  customerId: z.string().openapi({ example: "cust_123" }),
  name: z.string().openapi({ example: "John Doe" }),
  email: z.string().email().openapi({ example: "john@example.com" }),
});

export const UpdateNewCustomerItemSchema = z.object({
  name: z.string().optional().openapi({ example: "John Doe" }),
  email: z.string().email().optional().openapi({ example: "john@example.com" }),
});
