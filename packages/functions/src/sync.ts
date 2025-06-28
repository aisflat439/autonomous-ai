import {
  BedrockAgentClient,
  StartIngestionJobCommand,
} from "@aws-sdk/client-bedrock-agent";
import { Resource } from "sst";

export const handler = async () => {
  const client = new BedrockAgentClient({ region: "us-east-1" });

  try {
    const command = new StartIngestionJobCommand({
      knowledgeBaseId: Resource.knowledgeBase.id,
      dataSourceId: Resource.KnowledgeBaseS3DataSource.id,
    });

    const response = await client.send(command);

    return { statusCode: 200, body: "Sync initiated" };
  } catch (error) {
    throw error;
  }
};
