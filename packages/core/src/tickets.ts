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

export const Ticket = new Entity(
  {
    model: {
      entity: "Ticket",
      version: "1",
      service: "TicketService",
    },
    attributes: {
      ticketId: {
        type: "string",
        required: true,
      },
      customerMessage: {
        type: "string",
        required: true,
      },
      description: {
        type: "string",
        required: true,
      },
      status: {
        type: ["open", "in-progress", "complete", "cancelled"] as const,
        required: true,
        default: "open",
      },
      priority: {
        type: ["low", "medium", "high", "urgent"] as const,
        required: false,
        default: "medium",
      },
      customerEmail: {
        type: "string",
        required: false,
      },
      assignedTo: {
        type: "string",
        required: false,
      },
      resolution: {
        type: "string",
        required: false,
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
      resolvedAt: {
        type: "string",
        required: false,
      },
    },
    indexes: {
      primary: {
        pk: {
          field: "pk",
          composite: ["ticketId"],
        },
        sk: {
          field: "sk",
          composite: [],
        },
      },
      byStatus: {
        index: "StatusIndex",
        pk: {
          field: "gsi1pk",
          composite: ["status"],
        },
        sk: {
          field: "gsi1sk",
          composite: ["createdAt"],
        },
      },
      byCustomer: {
        index: "CustomerIndex",
        pk: {
          field: "gsi2pk",
          composite: ["customerEmail"],
        },
        sk: {
          field: "gsi2sk",
          composite: ["createdAt"],
        },
      },
    },
  },
  { client, table: Resource.Tickets.name },
);

export async function createTicket(data: {
  ticketId: string;
  customerMessage: string;
  description: string;
  status?: "open" | "in-progress" | "complete" | "cancelled";
  priority?: "low" | "medium" | "high" | "urgent";
  customerEmail?: string;
  assignedTo?: string;
}) {
  return await Ticket.create(data).go();
}

export async function getTicket(ticketId: string) {
  return await Ticket.get({ ticketId }).go();
}

export async function listTickets() {
  return await Ticket.scan.go();
}

export async function listTicketsByStatus(
  status: "open" | "in-progress" | "complete" | "cancelled",
) {
  return await Ticket.query.byStatus({ status }).go();
}

export async function listTicketsByCustomer(customerEmail: string) {
  return await Ticket.query.byCustomer({ customerEmail }).go();
}

export async function updateTicket(
  ticketId: string,
  updates: Partial<{
    description: string;
    status: "open" | "in-progress" | "complete" | "cancelled";
    priority: "low" | "medium" | "high" | "urgent";
    assignedTo: string;
    resolution: string;
    resolvedAt: string;
  }>,
) {
  const updateData = { ...updates };

  // If status is being set to complete, set resolvedAt
  if (updates.status === "complete" && !updates.resolvedAt) {
    updateData.resolvedAt = new Date().toISOString();
  }

  return await Ticket.update({ ticketId }).set(updateData).go();
}

export async function deleteTicket(ticketId: string) {
  return await Ticket.delete({ ticketId }).go();
}

export type TicketItem = EntityItem<typeof Ticket>;
export type TicketRecord = EntityRecord<typeof Ticket>;
export type CreateTicketItem = CreateEntityItem<typeof Ticket>;
export type UpdateTicketItem = UpdateEntityItem<typeof Ticket>;
export type TicketIdentifiers = EntityIdentifiers<typeof Ticket>;
