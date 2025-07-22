import { createRoute, z, RouteHandler } from "@hono/zod-openapi";
import { AgentSchema, ErrorSchema } from "./schemas";
import {
  BedrockAgentClient,
  ListAgentsCommand,
} from "@aws-sdk/client-bedrock-agent";

export const listAgents = createRoute({
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

export const listAgentsHandler: RouteHandler<typeof listAgents> = async (c) => {
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
};
