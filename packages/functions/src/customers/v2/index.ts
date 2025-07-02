import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";

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

const customers = new Map([
  [
    "cust_1",
    {
      customerId: "cust_1",
      name: "John Doe",
      email: "john@example.com",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    },
  ],
  [
    "cust_2",
    {
      customerId: "cust_2",
      name: "Jane Smith",
      email: "jane@example.com",
      createdAt: "2024-01-02T00:00:00.000Z",
      updatedAt: "2024-01-02T00:00:00.000Z",
    },
  ],
]);

v2CustomersApp.openapi(getCustomers, (c) => {
  return c.json(Array.from(customers.values()));
});

v2CustomersApp.openapi(getCustomer, (c) => {
  const { customerId } = c.req.valid("param");
  const customer = customers.get(customerId);

  if (!customer) {
    return c.json({ error: "Customer not found" }, 404);
  }

  return c.json(customer, 200);
});

v2CustomersApp.openapi(createCustomer, (c) => {
  const { customerId, name, email } = c.req.valid("json");
  const now = new Date().toISOString();
  const customer = {
    customerId,
    name,
    email,
    createdAt: now,
    updatedAt: now,
  };

  customers.set(customerId, customer);
  return c.json(customer, 201);
});

v2CustomersApp.openapi(updateCustomer, (c) => {
  const { customerId } = c.req.valid("param");
  const updates = c.req.valid("json");
  const customer = customers.get(customerId);

  if (!customer) {
    return c.json({ error: "Customer not found" }, 404);
  }

  const updatedCustomer = {
    ...customer,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  customers.set(customerId, updatedCustomer);
  return c.json(updatedCustomer, 200);
});

v2CustomersApp.openapi(deleteCustomer, (c) => {
  const { customerId } = c.req.valid("param");

  if (!customers.has(customerId)) {
    return c.json({ error: "Customer not found" }, 404);
  }

  customers.delete(customerId);
  return c.body(null, 204);
});

export { v2CustomersApp };
