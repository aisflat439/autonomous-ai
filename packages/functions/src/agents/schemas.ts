import { z } from "@hono/zod-openapi";

const AgentStatusEnum = z.enum([
  "CREATING",
  "PREPARING",
  "PREPARED",
  "NOT_PREPARED",
  "DELETING",
  "FAILED",
  "VERSIONING",
  "UPDATING",
]);

export const AgentSchema = z.object({
  agentId: z.string().openapi({ example: "ABCDEFGHIJ" }),
  agentName: z.string().openapi({ example: "production-ticket-agent" }),
  agentStatus: AgentStatusEnum.openapi({ example: "PREPARED" }),
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

export const ErrorSchema = z.object({
  error: z.string().openapi({ example: "Failed to fetch agents" }),
});

export const DetailedAgentSchema = AgentSchema.extend({
  agentArn: z.string().openapi({
    example: "arn:aws:bedrock:us-east-1:123456789012:agent/ABCDEFGHIJ",
  }),
  agentVersion: z.string().openapi({ example: "DRAFT" }),
  agentResourceRoleArn: z.string().optional(),
  foundationModel: z
    .string()
    .optional()
    .openapi({ example: "anthropic.claude-3-haiku-20240307-v1:0" }),
  instruction: z.string().optional(),
  idleSessionTTLInSeconds: z.number().optional(),
  createdAt: z.string().datetime().optional(),
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

export const AgentIdParamSchema = z.object({
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
});
