/// <reference path="./.sst/platform/config.d.ts" />


export default $config({
  app(input) {
    return {
      name: "autonomous-ai",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "aws",
      providers: {
        aws: {
          region: "us-east-1",
          version: "6.73.0",
        },
      },
    };
  },
  async run() {
    const storage = await import("./infra/storage");
    const { FoundationModels } = await import("./infra/bedrock/models");
    const { createBedrockRole } = await import("./infra/bedrock/iam");
    const { createAgent } = await import("./infra/bedrock/agents");
    const bedrockRole = createBedrockRole();


    const { alias: autonomousAgentManager } = createAgent({
      name: 'autonomous-action-manager',
      agentResourceRoleArn: bedrockRole.arn,
      prepareAgent: true,
      foundationModel: FoundationModels.Claude3_5Sonnet,
      instruction:
        '' +
        ':\n' +
        '1. .\n' +
        '2. \n\n' +
        'You must not do any action yourself. You must Delegate all work to the collaborators.',
    });

    const api = await import("./infra/api");

    const web = new sst.aws.StaticSite("MyWeb", {
      path: "packages/web",
      build: {
        output: "dist",
        command: "npm run build",
      },
      environment: {
        VITE_BEDROCK_INFO: api.modelInfo.url,
        VITE_API_URL: "api.url",
        VITE_AUTH_URL: "auth.url",
      },
    });

    return {
      Bucket: storage.bucket.name,
      Web: web.url,
    };
  },
});
