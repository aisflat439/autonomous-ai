import { Resource } from "sst";

import { Hono } from "hono";
import { handle } from "hono/aws-lambda";

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import {
  BedrockAgentRuntimeClient,
  RetrieveAndGenerateCommand,
} from "@aws-sdk/client-bedrock-agent-runtime";

const client = new BedrockAgentRuntimeClient({ region: "us-east-1" });

const s3 = new S3Client();

const app = new Hono();

app.get("/", async (c) => {
  return c.text(
    "Welcome to the Autonomous AI API! Use /latest to get the latest file from S3."
  );
});

app.get("/upload", async (c) => {
  const fileName = c.req.query("filename");
  if (!fileName) {
    return c.json({ error: "Filename is required" }, 400);
  }

  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, "");
  const command = new PutObjectCommand({
    Key: sanitizedFileName,
    Bucket: Resource.MyBucket.name,
  });
  const url = await getSignedUrl(s3, command);

  return c.json({ url });
});

app.get("/kb-files", async (c) => {
  const objects = await s3.send(
    new ListObjectsV2Command({
      Bucket: Resource.MyBucket.name,
    })
  );

  if (!objects.Contents) {
    return c.json({ files: [] });
  }

  const files = objects.Contents.map((obj) => ({
    name: obj.Key,
    lastModified: obj.LastModified,
  }));

  return c.json({ files: files });
});

app.put("/kb-request", async (c) => {
  const requestBody = await c.req.json();
  if (!requestBody || !requestBody.text) {
    return c.json({ error: "Request body must contain 'text' field" }, 400);
  }
  const response = await client.send(
    new RetrieveAndGenerateCommand({
      input: {
        text: requestBody.text,
      },
      retrieveAndGenerateConfiguration: {
        type: "KNOWLEDGE_BASE",
        knowledgeBaseConfiguration: {
          knowledgeBaseId: Resource.knowledgeBase.id,
          modelArn:
            "arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-haiku-20240307-v1:0", // Choose your model
        },
      },
    })
  );

  console.log(response.output?.text); // Natural language response!

  return c.json({
    message:
      response.output?.text || "The request happened but there was an issue.",
  });
});

app.delete("/kb-files/:fileName", async (c) => {
  const fileName = c.req.param("fileName");

  if (!fileName) {
    return c.json({ error: "File name is required" }, 400);
  }

  const command = new DeleteObjectCommand({
    Key: fileName,
    Bucket: Resource.MyBucket.name,
  });

  await s3.send(command);

  return c.json({ message: "File deleted successfully." });
});

export const handler = handle(app);
