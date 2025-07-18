import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";

// Define the Agent schema for OpenAPI documentation
const AgentSchema = z.object({
  id: z.string().openapi({ example: "agent_123" }),
  name: z.string().openapi({ example: "ticket-agent" }),
  description: z
    .string()
    .openapi({ example: "Customer support ticket management agent" }),
  status: z
    .enum(["active", "inactive", "preparing"])
    .openapi({ example: "active" }),
  foundationModel: z.string().openapi({ example: "anthropic.claude-3-haiku" }),
  lastUpdated: z
    .string()
    .datetime()
    .optional()
    .openapi({ example: "2024-01-01T00:00:00.000Z" }),
});

const ErrorSchema = z.object({
  error: z.string().openapi({ example: "Failed to fetch agents" }),
});

// Define the list agents route
const listAgents = createRoute({
  method: "get",
  path: "/agents",
  tags: ["agents"],
  summary: "List all agents",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            agents: z.array(AgentSchema),
          }),
        },
      },
      description: "List of agents",
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

// Create the agents app
const agentsApp = new OpenAPIHono();

// Implement the list agents endpoint
agentsApp.openapi(listAgents, async (c) => {
  console.log("Fetching agents...");

  try {
    // TODO: Implement actual agent fetching from Bedrock
    // For now, return an empty array
    const agents: z.infer<typeof AgentSchema>[] = [];
    console.log("agents are here: ", agents);

    return c.json({ agents }, 200);
  } catch (error) {
    console.error("Error fetching agents:", error);
    return c.json({ error: "Failed to fetch agents" }, 500);
  }
});

export { agentsApp };
