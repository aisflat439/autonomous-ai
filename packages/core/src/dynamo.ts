export * as Dynamo from "./dynamo";

import { EntityConfiguration } from "electrodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

export const Client = new DynamoDBClient({});

export const Configuration: EntityConfiguration = {
  // @ts-ignore
  table: Table.table.tableName,
  client: Client,
};
