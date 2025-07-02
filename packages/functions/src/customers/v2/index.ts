import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import {
  createNewCustomer,
  getNewCustomer,
  listNewCustomers,
  updateNewCustomer,
  deleteNewCustomer,
  NewCustomerItem,
} from "@autonomous-ai/core/new-customers";

const NewCustomerItemSchema = z.object({
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

const CreateNewCustomerItemSchema = z.object({
  customerId: z.string().openapi({ example: "cust_123" }),
  name: z.string().openapi({ example: "John Doe" }),
  email: z.string().email().openapi({ example: "john@example.com" }),
});

const UpdateNewCustomerItemSchema = z.object({
  name: z.string().optional().openapi({ example: "John Doe" }),
  email: z.string().email().optional().openapi({ example: "john@example.com" }),
});

const ErrorSchema = z.object({
  error: z.string().openapi({ example: "Customer not found" }),
});

const CustomerIdParamSchema = z.object({
  customerId: z.string().openapi({
    param: { name: "customerId", in: "path" },
    example: "cust_123",
  }),
});

const getCustomers = createRoute({
  method: "get",
  path: "/customers",
  tags: ["v2-customers"],
  summary: "Get all customers (v2)",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.array(NewCustomerItemSchema),
        },
      },
      description: "List of customers",
    },
    500: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "Internal server error",
    },
  },
});

const getCustomer = createRoute({
  method: "get",
  path: "/customers/{customerId}",
  tags: ["v2-customers"],
  summary: "Get customer by ID (v2)",
  request: {
    params: CustomerIdParamSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: NewCustomerItemSchema,
        },
      },
      description: "Customer details",
    },
    404: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "Customer not found",
    },
  },
});

const createCustomer = createRoute({
  method: "post",
  path: "/customers",
  tags: ["v2-customers"],
  summary: "Create new customer (v2)",
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateNewCustomerItemSchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: NewCustomerItemSchema,
        },
      },
      description: "Customer created",
    },
    400: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "Invalid request",
    },
  },
});

const updateCustomer = createRoute({
  method: "put",
  path: "/customers/{customerId}",
  tags: ["v2-customers"],
  summary: "Update customer (v2)",
  request: {
    params: CustomerIdParamSchema,
    body: {
      content: {
        "application/json": {
          schema: UpdateNewCustomerItemSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: NewCustomerItemSchema,
        },
      },
      description: "Customer updated",
    },
    404: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "Customer not found",
    },
  },
});

const deleteCustomer = createRoute({
  method: "delete",
  path: "/customers/{customerId}",
  tags: ["v2-customers"],
  summary: "Delete customer (v2)",
  request: {
    params: CustomerIdParamSchema,
  },
  responses: {
    204: {
      description: "Customer deleted",
    },
    404: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "Customer not found",
    },
  },
});

const v2CustomersApp = new OpenAPIHono();

v2CustomersApp.openapi(getCustomers, async (c) => {
  try {
    const result = await listNewCustomers();
    return c.json(result.data, 200);
  } catch (error) {
    return c.json({ error: "Failed to fetch customers" }, 500);
  }
});

v2CustomersApp.openapi(getCustomer, async (c) => {
  const { customerId } = c.req.valid("param");

  try {
    const result = await getNewCustomer(customerId);
    if (!result.data) {
      return c.json({ error: "Customer not found" }, 404);
    }
    return c.json(result.data, 200);
  } catch (error) {
    return c.json({ error: "Customer not found" }, 404);
  }
});

v2CustomersApp.openapi(createCustomer, async (c) => {
  const { customerId, name, email } = c.req.valid("json");

  try {
    const result = await createNewCustomer({ customerId, name, email });
    return c.json(result.data, 201);
  } catch (error) {
    return c.json({ error: "Failed to create customer" }, 400);
  }
});

v2CustomersApp.openapi(updateCustomer, async (c) => {
  const { customerId } = c.req.valid("param");
  const updates = c.req.valid("json");

  try {
    const result = await updateNewCustomer(customerId, updates);

    return c.json(result.data as NewCustomerItem, 200);
  } catch (error) {
    return c.json({ error: "Customer not found" }, 404);
  }
});

v2CustomersApp.openapi(deleteCustomer, async (c) => {
  const { customerId } = c.req.valid("param");

  try {
    await deleteNewCustomer(customerId);
    return c.body(null, 204);
  } catch (error) {
    return c.json({ error: "Customer not found" }, 404);
  }
});

export { v2CustomersApp };
