export type AgentStatus =
  | "CREATING"
  | "PREPARING"
  | "PREPARED"
  | "NOT_PREPARED"
  | "DELETING"
  | "FAILED"
  | "VERSIONING"
  | "UPDATING";

export interface Agent {
  agentId: string;
  agentName: string;
  agentArn: string;
  agentStatus: AgentStatus;
  agentVersion: string;
  agentResourceRoleArn?: string;
  foundationModel?: string;
  description?: string;
  instruction?: string;
  idleSessionTTLInSeconds?: number;
  createdAt?: string;
  updatedAt?: string;
  preparedAt?: string;
  latestAgentVersion?: string;
  failureReasons?: string[];
  recommendedActions?: string[];
  memoryConfiguration?: {
    enabledMemoryTypes?: string[];
    storageDays?: number;
  };
  promptOverrideConfiguration?: unknown;
  guardrailConfiguration?: {
    guardrailIdentifier?: string;
    guardrailVersion?: string;
  };
}

export interface AgentInstruction {
  agentId: string;
  version: number;
  instruction: string;
  isActive: boolean;
  updatedBy: string;
  changeNote?: string;
  createdAt: string;
  updatedAt: string;
}

export type AgentListItem = Pick<
  Agent,
  | "agentId"
  | "agentName"
  | "agentStatus"
  | "description"
  | "latestAgentVersion"
  | "updatedAt"
>;
