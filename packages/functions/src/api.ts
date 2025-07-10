import { Resource } from "sst";

import { OpenAPIHono } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";

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
  InvokeAgentCommand,
  RetrieveAndGenerateCommand,
} from "@aws-sdk/client-bedrock-agent-runtime";
import { v1CustomersApp } from "./customers/v1";
import { v2CustomersApp } from "./customers/v2";

const client = new BedrockAgentRuntimeClient({ region: "us-east-1" });

const s3 = new S3Client();

const app = new OpenAPIHono();
app.route("/v1", v1CustomersApp);
app.route("/v2", v2CustomersApp);

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

/*
  Here we get contacted by customers. By default our normal process
  would be to create a ticket. The ticket would be the request
  from the customer and manual responses would come from 
  support. 

  KB can help here by reviewing the request that comes in 
  and, if the answer is in the knowledge base, it will 
  reply with answer so the ticket never gets created.

  Supervisor Agent comes next. Here we can really use our imagination.
  As we understand what customers are asking we can create 
  tools that we can give access to for our agents.

  Example:
  - Customer asks about why friends company has better pricing?
  - Agent checks V1 customers and sees that customer is not
    in v1 customers. therefore they have new pricing

  if neither thing works
  - Agent creates ticket in the database
*/
app.post("/contact-us", async (c) => {
  const body = await c.req.json();
  if (!body || !body.message) {
    return c.json({ error: "Message is required" }, 400);
  }

  try {
    const enhancedMessage = `[SYSTEM: You MUST search the knowledge base before responding to this query]
    
    User Question: ${body.message}`;

    const command = new InvokeAgentCommand({
      agentId: Resource["contact-us-agent-kb-alias"].agentId,
      agentAliasId: Resource["contact-us-agent-kb-alias"].agentAliasId,
      sessionId: "session-" + Date.now(),
      inputText: enhancedMessage,
      sessionState: {
        sessionAttributes: {
          forceKnowledgeBase: "true",
          instruction: "You must search the knowledge base before responding",
        },
      },
    });

    const response = await client.send(command);

    let finalText = "";
    if (response.completion) {
      for await (const chunk of response.completion) {
        if (chunk.chunk) {
          const bytes = chunk.chunk.bytes;
          if (bytes) {
            const text = new TextDecoder().decode(bytes);
            finalText += text;
          }
        }
      }
    }

    console.log("Agent response: ", finalText); // Log the final response text
  } catch (error) {
    console.log("error: ", error);
    //   // if (response !== "not in KB")
    //   // return c.json({
    //   //   message: "response.completion?.text" || "Thank you for your message!",
    //   // });
    //   // create ticket in the database
  }
  return c.json({
    message: "Thank you for your message! We will get back to you soon.",
  });
});

app.doc("/doc", {
  openapi: "3.0.0",
  info: {
    version: "1.0.0",
    title: "Customer API",
    description: "API for managing customers with versioned endpoints",
  },
});
app.get("/ui", swaggerUI({ url: "/doc" }));

export const handler = handle(app);
