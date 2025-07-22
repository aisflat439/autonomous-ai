import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import {
  BedrockAgentClient,
  GetAgentCommand,
} from "@aws-sdk/client-bedrock-agent";
import {
  DetailedAgentSchema,
  ErrorSchema,
  AgentIdParamSchema,
  AgentInstructionSchema,
  CreateInstructionSchema,
  InstructionHistoryQuerySchema,
  VersionParamSchema,
} from "./schemas";
import {
  createInstruction,
  getActiveInstruction,
  listInstructionsByCreatedAt,
  listInstructionsByVersion,
  activateInstruction,
} from "@autonomous-ai/core/agent-instructions";
import { listAgents, listAgentsHandler } from "./listAgents";

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

agentsApp.openapi(listAgents, listAgentsHandler);

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

const getAgentInstruction = createRoute({
  method: "get",
  path: "/agents/{agentId}/instructions",
  tags: ["agent-instructions"],
  summary: "Get current active instruction for an agent",
  request: {
    params: AgentIdParamSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            instruction: AgentInstructionSchema,
          }),
        },
      },
      description: "Active instruction",
    },
    404: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "No active instruction found",
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

const getInstructionHistory = createRoute({
  method: "get",
  path: "/agents/{agentId}/instructions/history",
  tags: ["agent-instructions"],
  summary: "Get instruction version history for an agent",
  request: {
    params: AgentIdParamSchema,
    query: InstructionHistoryQuerySchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            instructions: z.array(AgentInstructionSchema),
          }),
        },
      },
      description: "Instruction history",
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

const updateAgentInstruction = createRoute({
  method: "put",
  path: "/agents/{agentId}/instructions",
  tags: ["agent-instructions"],
  summary: "Create or update agent instruction",
  request: {
    params: AgentIdParamSchema,
    body: {
      content: {
        "application/json": {
          schema: CreateInstructionSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            instruction: AgentInstructionSchema,
          }),
        },
      },
      description: "Instruction created/updated",
    },
    400: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "Invalid request",
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

const activateAgentInstruction = createRoute({
  method: "post",
  path: "/agents/{agentId}/instructions/{version}/activate",
  tags: ["agent-instructions"],
  summary: "Activate a specific instruction version",
  request: {
    params: AgentIdParamSchema.merge(VersionParamSchema),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
      description: "Instruction activated",
    },
    404: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "Instruction version not found",
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

agentsApp.openapi(getAgentInstruction, async (c) => {
  const { agentId } = c.req.valid("param");

  try {
    const instruction = await getActiveInstruction(agentId);

    if (!instruction) {
      return c.json(
        { error: "No active instruction found for this agent" },
        404
      );
    }

    const instructionData: z.infer<typeof AgentInstructionSchema> =
      instruction as any;
    return c.json({ instruction: instructionData }, 200);
  } catch (error) {
    console.error(
      `Error fetching active instruction for agent ${agentId}:`,
      error
    );
    return c.json({ error: "Failed to fetch instruction" }, 500);
  }
});

agentsApp.openapi(getInstructionHistory, async (c) => {
  const { agentId } = c.req.valid("param");
  const { order, limit, sortBy } = c.req.valid("query");

  try {
    let instructions;

    if (sortBy === "version") {
      instructions = await listInstructionsByVersion(agentId, { order, limit });
    } else {
      instructions = await listInstructionsByCreatedAt(agentId, {
        order,
        limit,
      });
    }

    const instructionsData: z.infer<typeof AgentInstructionSchema>[] =
      instructions as any;
    return c.json({ instructions: instructionsData }, 200);
  } catch (error) {
    console.error(
      `Error fetching instruction history for agent ${agentId}:`,
      error
    );
    return c.json({ error: "Failed to fetch instruction history" }, 500);
  }
});

agentsApp.openapi(updateAgentInstruction, async (c) => {
  const { agentId } = c.req.valid("param");
  const { instruction, version, changeNote } = c.req.valid("json");

  // TODO: Integrate auth and pull updatedBy from context
  const updatedBy = "taytay1989";

  try {
    const result = await createInstruction({
      agentId,
      instruction,
      updatedBy,
      version,
      changeNote,
    });

    const instructionData: z.infer<typeof AgentInstructionSchema> =
      result.data as any;
    return c.json({ instruction: instructionData }, 200);
  } catch (error) {
    console.error(`Error updating instruction for agent ${agentId}:`, error);
    return c.json({ error: "Failed to update instruction" }, 500);
  }
});

agentsApp.openapi(activateAgentInstruction, async (c) => {
  const { agentId, version } = c.req.valid("param");

  // TODO: Integrate auth and pull updatedBy from context
  const updatedBy = "taytay1989";

  try {
    await activateInstruction(agentId, version, updatedBy);

    return c.json(
      { message: `Instruction version ${version} activated successfully` },
      200
    );
  } catch (error) {
    console.error(
      `Error activating instruction version ${version} for agent ${agentId}:`,
      error
    );

    if (error instanceof Error && error.message.includes("not found")) {
      return c.json({ error: error.message }, 404);
    }

    return c.json({ error: "Failed to activate instruction" }, 500);
  }
});

export { agentsApp };
