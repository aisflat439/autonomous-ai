import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import {
  BedrockAgentClient,
  ListAgentsCommand,
  GetAgentCommand,
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

const DetailedAgentSchema = z.object({
  agentId: z.string().openapi({ example: "ABCDEFGHIJ" }),
  agentName: z.string().openapi({ example: "production-ticket-agent" }),
  agentArn: z.string().openapi({
    example: "arn:aws:bedrock:us-east-1:123456789012:agent/ABCDEFGHIJ",
  }),
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
  agentVersion: z.string().openapi({ example: "DRAFT" }),
  agentResourceRoleArn: z.string().optional(),
  foundationModel: z
    .string()
    .optional()
    .openapi({ example: "anthropic.claude-3-haiku-20240307-v1:0" }),
  description: z.string().optional(),
  instruction: z.string().optional(),
  idleSessionTTLInSeconds: z.number().optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
  preparedAt: z.string().datetime().optional(),
  failureReasons: z.array(z.string()).optional(),
  recommendedActions: z.array(z.string()).optional(),
  memoryConfiguration: z
    .object({
      enabledMemoryTypes: z.array(z.string()).optional(),
      storageDays: z.number().optional(),
    })
    .optional(),
  promptOverrideConfiguration: z.any().optional(),
  guardrailConfiguration: z
    .object({
      guardrailIdentifier: z.string().optional(),
      guardrailVersion: z.string().optional(),
    })
    .optional(),
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

const getAgent = createRoute({
  method: "get",
  path: "/agents/{agentId}",
  tags: ["agents"],
  summary: "Get a specific agent by ID",
  request: {
    params: z.object({
      agentId: z
        .string()
        .regex(/^[0-9a-zA-Z]{10}$/)
        .openapi({
          param: {
            name: "agentId",
            in: "path",
          },
          example: "ABCDEFGHIJ",
        }),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            agent: DetailedAgentSchema,
          }),
        },
      },
      description: "Agent details",
    },
    404: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "Agent not found",
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

agentsApp.openapi(getAgent, async (c) => {
  const { agentId } = c.req.valid("param");
  console.log(`Fetching agent ${agentId} from Bedrock...`);

  try {
    const client = new BedrockAgentClient({ region: "us-east-1" });

    const command = new GetAgentCommand({
      agentId: agentId,
    });

    const response = await client.send(command);
    console.log("Bedrock GetAgent response:", response);

    if (!response.agent) {
      return c.json({ error: "Agent not found" }, 404);
    }

    const agent: z.infer<typeof DetailedAgentSchema> = {
      agentId: response.agent.agentId!,
      agentName: response.agent.agentName!,
      agentArn: response.agent.agentArn!,
      agentStatus: response.agent.agentStatus!,
      agentVersion: response.agent.agentVersion!,
      agentResourceRoleArn: response.agent.agentResourceRoleArn,
      foundationModel: response.agent.foundationModel,
      description: response.agent.description,
      instruction: response.agent.instruction,
      idleSessionTTLInSeconds: response.agent.idleSessionTTLInSeconds,
      createdAt: response.agent.createdAt?.toISOString(),
      updatedAt: response.agent.updatedAt?.toISOString(),
      preparedAt: response.agent.preparedAt?.toISOString(),
      failureReasons: response.agent.failureReasons,
      recommendedActions: response.agent.recommendedActions,
      memoryConfiguration: response.agent.memoryConfiguration
        ? {
            enabledMemoryTypes:
              response.agent.memoryConfiguration.enabledMemoryTypes,
            storageDays: response.agent.memoryConfiguration.storageDays,
          }
        : undefined,
      promptOverrideConfiguration: response.agent.promptOverrideConfiguration,
      guardrailConfiguration: response.agent.guardrailConfiguration
        ? {
            guardrailIdentifier:
              response.agent.guardrailConfiguration.guardrailIdentifier,
            guardrailVersion:
              response.agent.guardrailConfiguration.guardrailVersion,
          }
        : undefined,
    };

    return c.json({ agent }, 200);
  } catch (error) {
    console.error(`Error fetching agent ${agentId} from Bedrock:`, error);

    if (error instanceof Error && error.name === "ResourceNotFoundException") {
      return c.json({ error: "Agent not found" }, 404);
    }

    return c.json({ error: "Failed to fetch agent" }, 500);
  }
});

export { agentsApp };
