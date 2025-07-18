import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import {
  BedrockAgentClient,
  ListAgentsCommand,
} from "@aws-sdk/client-bedrock-agent";

// Define the Agent schema for OpenAPI documentation - matching Bedrock's schema
const AgentSchema = z.object({
  agentId: z.string().openapi({ example: "ABCDEFGHIJ" }),
  agentName: z.string().openapi({ example: "production-ticket-agent" }),
  agentStatus: z
    .enum([
      "CREATING",
      "PREPARING",
      "PREPARED",
      "NOT_PREPARED",
      "DELETING",
      "FAILED",
      "VERSIONING",
      "UPDATING",
    ])
    .openapi({ example: "PREPARED" }),
  description: z
    .string()
    .optional()
    .openapi({ example: "Customer support ticket management agent" }),
  latestAgentVersion: z.string().optional().openapi({ example: "1" }),
  updatedAt: z
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

const agentsApp = new OpenAPIHono();

agentsApp.openapi(listAgents, async (c) => {
  console.log("Fetching agents from Bedrock...");

  try {
    const client = new BedrockAgentClient({ region: "us-east-1" });

    const command = new ListAgentsCommand({
      maxResults: 100,
    });

    const response = await client.send(command);

    const agents: z.infer<typeof AgentSchema>[] =
      response.agentSummaries?.map((agent) => ({
        agentId: agent.agentId!,
        agentName: agent.agentName!,
        agentStatus: agent.agentStatus!,
        description: agent.description,
        latestAgentVersion: agent.latestAgentVersion,
        updatedAt: agent.updatedAt?.toISOString(),
      })) || [];

    return c.json({ agents }, 200);
  } catch (error) {
    console.error("Error fetching agents from Bedrock:", error);
    return c.json({ error: "Failed to fetch agents" }, 500);
  }
});

export { agentsApp };
