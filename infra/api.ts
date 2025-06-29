import { knowledgeBase } from "./bedrock/knowledge-base";
import { bucket } from "./storage";

export const myApi = new sst.aws.Function("MyApi", {
  url: {
    cors: {
      allowOrigins: ["http://localhost:5173"],
      allowMethods: ["*"],
      allowHeaders: ["*"],
    },
  },
  link: [bucket, knowledgeBase],
  handler: "packages/functions/src/api.handler",
  permissions: [
    {
      actions: [
        "bedrock:RetrieveAndGenerate",
        "bedrock:Retrieve",
        "bedrock:InvokeModel",
      ],
      resources: ["*"],
    },
  ],
});

export const modelInfo = new sst.aws.Function("ModelInfo", {
  url: true,
  handler: "packages/functions/src/model-info.handler",
  permissions: [
    {
      actions: ["bedrock:ListFoundationModels"],
      resources: ["*"],
    },
  ],
});
