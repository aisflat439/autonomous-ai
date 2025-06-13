import { Resource } from "sst";
import {
  BedrockClient,
  ListFoundationModelsCommand,
} from "@aws-sdk/client-bedrock";

import { Handler } from "aws-lambda";
import { Example } from "@autonomous-ai/core/example";

export const handler: Handler = async (event) => {
  console.log("event: ", event);
  if (event.httpMethod !== "GET") {
  }

  return {
    statusCode: 200,
    body: `${Example.hello()} Linked to ${Resource.MyBucket.name}.`,
  };
};
