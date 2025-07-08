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

export const NewCustomer = new Entity(
  {
    model: {
      entity: "NewCustomer",
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
  { client, table: Resource.NewCustomers.name }
);

export async function createNewCustomer(data: {
  customerId: string;
  name: string;
  email: string;
}) {
  return await NewCustomer.create(data).go();
}

export async function getNewCustomer(customerId: string) {
  return await NewCustomer.get({ customerId }).go();
}

export async function listNewCustomers() {
  return await NewCustomer.scan.go();
}

export async function updateNewCustomer(
  customerId: string,
  updates: Partial<{ name: string; email: string }>
) {
  return await NewCustomer.update({ customerId }).set(updates).go();
}

export async function deleteNewCustomer(customerId: string) {
  return await NewCustomer.delete({ customerId }).go();
}

export type NewCustomerItem = EntityItem<typeof NewCustomer>;
export type NewCustomerRecord = EntityRecord<typeof NewCustomer>;
export type CreateNewCustomerItem = CreateEntityItem<typeof NewCustomer>;
export type UpdateNewCustomerItem = UpdateEntityItem<typeof NewCustomer>;
export type NewCustomerIdentifiers = EntityIdentifiers<typeof NewCustomer>;
