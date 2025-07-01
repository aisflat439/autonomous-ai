import {
  Entity,
  EntityItem,
  EntityRecord,
  CreateEntityItem,
  UpdateEntityItem,
  EntityIdentifiers,
} from "electrodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({});

export const OldCustomer = new Entity(
  {
    model: {
      entity: "OldCustomer",
      version: "1",
      service: "CustomerService",
    },
    attributes: {
      customerId: {
        type: "string",
        required: true,
      },
      name: {
        type: "string",
        required: true,
      },
      email: {
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
      primary: {
        pk: {
          field: "pk",
          composite: ["customerId"],
        },
        sk: {
          field: "sk",
          composite: [],
        },
      },
      byEmail: {
        index: "gsi1",
        pk: {
          field: "gsi1pk",
          composite: ["email"],
        },
        sk: {
          field: "gsi1sk",
          composite: ["customerId"],
        },
      },
    },
  },
  { client, table: "OldCustomersTable" },
);

export async function createOldCustomer(data: {
  customerId: string;
  name: string;
  email: string;
}) {
  return await OldCustomer.create(data).go();
}

export async function getOldCustomer(customerId: string) {
  return await OldCustomer.get({ customerId }).go();
}

export async function listOldCustomers() {
  return await OldCustomer.scan.go();
}

export async function updateOldCustomer(
  customerId: string,
  updates: Partial<{ name: string; email: string }>,
) {
  return await OldCustomer.update({ customerId }).set(updates).go();
}

export async function deleteOldCustomer(customerId: string) {
  return await OldCustomer.delete({ customerId }).go();
}

export type OldCustomerItem = EntityItem<typeof OldCustomer>;
export type OldCustomerRecord = EntityRecord<typeof OldCustomer>;
export type CreateOldCustomerItem = CreateEntityItem<typeof OldCustomer>;
export type UpdateOldCustomerItem = UpdateEntityItem<typeof OldCustomer>;
export type OldCustomerIdentifiers = EntityIdentifiers<typeof OldCustomer>;
