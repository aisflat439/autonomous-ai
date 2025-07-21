import {
  Entity,
  EntityItem,
  EntityRecord,
  CreateEntityItem,
  UpdateEntityItem,
  EntityIdentifiers,
} from "electrodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { Resource } from "sst";

const client = new DynamoDBClient({});

export const AgentInstruction = new Entity(
  {
    model: {
      entity: "AgentInstruction",
      version: "1",
      service: "AgentInstructionService",
    },
    attributes: {
      agentId: {
        type: "string",
        required: true,
      },
      version: {
        type: "string",
        required: true,
      },
      instruction: {
        type: "string",
        required: true,
      },
      isActive: {
        type: "boolean",
        required: true,
        default: false,
      },
      changeNote: {
        type: "string",
        required: false,
      },
      updatedBy: {
        type: "string",
        required: true,
      },
      createdAt: {
        type: "string",
        required: true,
        default: () => new Date().toISOString(),
      },
      updatedAt: {
        type: "string",
        required: true,
        default: () => new Date().toISOString(),
        set: () => new Date().toISOString(),
      },
    },
    indexes: {
      byCreatedAt: {
        pk: {
          field: "pk",
          composite: ["agentId"],
        },
        sk: {
          field: "sk",
          composite: ["createdAt"],
        },
      },
      byActive: {
        index: "ActiveIndex",
        pk: {
          field: "gsi1pk",
          composite: [],
          template: "ACTIVE",
        },
        sk: {
          field: "gsi1sk",
          composite: ["agentId"],
        },
        condition: (attr) => attr.isActive === true,
      },
      byVersion: {
        index: "VersionIndex",
        pk: {
          field: "gsi2pk",
          composite: ["agentId"],
        },
        sk: {
          field: "gsi2sk",
          composite: ["version"],
          template: "${version}",
        },
      },
    },
  },
  { client, table: Resource.AgentInstructions.name }
);

function padVersion(version: string): string {
  const [major, minor = "0"] = version.split(".");
  return `${major.padStart(4, "0")}.${minor}`;
}

function unpadVersion(paddedVersion: string): string {
  const [major, minor] = paddedVersion.split(".");
  return `${parseInt(major, 10)}.${minor}`;
}

export async function createInstruction(data: {
  agentId: string;
  instruction: string;
  updatedBy: string;
  version?: string;
  changeNote?: string;
}) {
  let version = data.version;

  if (!version) {
    const latest = await getLatestVersion(data.agentId);
    if (latest) {
      const [major, minor = "0"] = latest.version.split(".");
      const newMinor = parseInt(minor, 10) + 1;
      version = `${major}.${newMinor}`;
    } else {
      version = "1.0";
    }
  }

  const currentActive = await getActiveInstruction(data.agentId);
  if (currentActive) {
    await AgentInstruction.update({
      agentId: currentActive.agentId,
      createdAt: currentActive.createdAt,
    })
      .set({ isActive: false })
      .go();
  }

  const result = await AgentInstruction.create({
    ...data,
    version: padVersion(version),
    isActive: true,
  }).go();

  return {
    ...result,
    data: {
      ...result.data,
      version: unpadVersion(result.data.version),
    },
  };
}

export async function getActiveInstruction(agentId: string) {
  const result = await AgentInstruction.query
    .byActive({ agentId })
    .where(({ isActive }, { eq }) => eq(isActive, true))
    .go();

  if (result.data.length > 0) {
    return {
      ...result.data[0],
      version: unpadVersion(result.data[0].version),
    };
  }
  return null;
}

export async function getLatestVersion(agentId: string) {
  const result = await AgentInstruction.query
    .byVersion({ agentId })
    .go({ order: "desc", limit: 1 });

  if (result.data.length > 0) {
    return {
      ...result.data[0],
      version: unpadVersion(result.data[0].version),
    };
  }
  return null;
}

export async function listInstructionsByCreatedAt(
  agentId: string,
  options?: { order?: "asc" | "desc"; limit?: number }
) {
  const result = await AgentInstruction.query
    .byCreatedAt({ agentId })
    .go({ order: options?.order || "desc", limit: options?.limit });

  return result.data.map((item) => ({
    ...item,
    version: unpadVersion(item.version),
  }));
}

export async function listInstructionsByVersion(
  agentId: string,
  options?: { order?: "asc" | "desc"; limit?: number }
) {
  const result = await AgentInstruction.query
    .byVersion({ agentId })
    .go({ order: options?.order || "desc", limit: options?.limit });

  return result.data.map((item) => ({
    ...item,
    version: unpadVersion(item.version),
  }));
}

export async function activateInstruction(
  agentId: string,
  version: string,
  updatedBy: string
) {
  // Find the instruction by version
  const instructions = await AgentInstruction.query
    .byVersion({ agentId })
    .where(({ version: v }, { eq }) => eq(v, padVersion(version)))
    .go();

  if (instructions.data.length === 0) {
    throw new Error(
      `Instruction version ${version} not found for agent ${agentId}`
    );
  }

  const targetInstruction = instructions.data[0];

  const currentActive = await getActiveInstruction(agentId);
  if (currentActive) {
    await AgentInstruction.update({
      agentId: currentActive.agentId,
      createdAt: currentActive.createdAt,
    })
      .set({ isActive: false, updatedBy })
      .go();
  }

  return await AgentInstruction.update({
    agentId: targetInstruction.agentId,
    createdAt: targetInstruction.createdAt,
  })
    .set({ isActive: true, updatedBy })
    .go();
}

export async function getInstruction(agentId: string, createdAt: string) {
  const result = await AgentInstruction.get({ agentId, createdAt }).go();
  if (result.data) {
    return {
      ...result.data,
      version: unpadVersion(result.data.version),
    };
  }
  return null;
}

export type AgentInstructionItem = EntityItem<typeof AgentInstruction>;
export type AgentInstructionRecord = EntityRecord<typeof AgentInstruction>;
export type CreateAgentInstructionItem = CreateEntityItem<
  typeof AgentInstruction
>;
export type UpdateAgentInstructionItem = UpdateEntityItem<
  typeof AgentInstruction
>;
export type AgentInstructionIdentifiers = EntityIdentifiers<
  typeof AgentInstruction
>;
