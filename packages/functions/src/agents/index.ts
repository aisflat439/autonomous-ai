import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import {
  BedrockAgentClient,
  ListAgentsCommand,
  GetAgentCommand,
} from "@aws-sdk/client-bedrock-agent";
import {
  AgentSchema,
  DetailedAgentSchema,
  ErrorSchema,
  AgentIdParamSchema,
} from "./schemas";

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
    params: AgentIdParamSchema,
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
