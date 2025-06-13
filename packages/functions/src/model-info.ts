import { Resource } from "sst";
import {
  BedrockClient,
  ListFoundationModelsCommand,
} from "@aws-sdk/client-bedrock";

import { Handler } from "aws-lambda";

const client = new BedrockClient({});

export const handler: Handler = async (event) => {
  let response;
  try {
    const command = new ListFoundationModelsCommand({});
    response = await client.send(command);
  } catch (error) {
    console.error("Error fetching foundation models: ", error);
  }

  const simplified = response!.modelSummaries?.map((m) => ({
    name: m.modelName,
    modelId: m.modelId,
    description: `${
      m.providerName
    } model supporting: ${m.outputModalities?.join(", ")}${
      m.responseStreamingSupported ? " (streaming)" : ""
    }`,
  }));

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(simplified),
  };
};
