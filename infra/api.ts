import { bucket } from "./storage";

export const myApi = new sst.aws.Function("MyApi", {
  url: true,
  link: [bucket],
  handler: "packages/functions/src/api.handler",
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
