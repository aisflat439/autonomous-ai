/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "autonomous-ai-sst-presentation",
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
    /*
      SST doesn't know about aws.bedrock.AgentKnowledgeBase and we want it to
      so what we do is we tell SST about it by wrapping it in a Linkable.
      then we define exactly what properties we want to expose
      and what permissions we want to pass along.
      now we can link to other resources.
    */
    sst.Linkable.wrap(aws.bedrock.AgentKnowledgeBase, (knowledgeBase) => {
      return {
        properties: {
          id: knowledgeBase.id,
          arn: knowledgeBase.arn,
        },
        include: [
          sst.aws.permission({
            actions: ["bedrock-agent:StartIngestionJob"],
            resources: ["*"],
          }),
        ],
      };
    });

    sst.Linkable.wrap(aws.bedrock.AgentDataSource, (dataSource) => {
      return {
        properties: {
          id: dataSource.dataSourceId,
        },
      };
    });

    sst.Linkable.wrap(aws.bedrock.AgentAgent, (agent) => ({
      properties: { agentId: agent.agentId },
    }));

    sst.Linkable.wrap(aws.bedrock.AgentAgentAlias, (alias) => ({
      properties: {
        agentId: alias.agentId,
        agentAliasId: alias.agentAliasId,
        agentAliasArn: alias.agentAliasArn,
      },
    }));

    const storage = await import("./infra/storage");
    const { rds } = await import("./infra/rds");

    const { FoundationModels } = await import("./infra/bedrock/models");
    // const { bedrockRole, knowledgeBaseRole } = await import(
    //   "./infra/bedrock/iam"
    // );
    // const { createAgent } = await import("./infra/bedrock/agents");
    const { knowledgeBase, s3DataSource } = await import(
      "./infra/bedrock/knowledge-base"
    );
    // const { createKnowledgeBase } = await import(
    //   "./infra/bedrock/knowledge-base"
    // );
    const { oldCustomers } = await import("./infra/db/old-customers");
    const { newCustomers } = await import("./infra/db/new-customers");

    // const { alias: contactUsAgent } = createAgent({
    //   name: "contact-us-agent-kb",
    //   agentResourceRoleArn: bedrockRole.arn,
    //   prepareAgent: true,
    //   foundationModel: FoundationModels.Claude3_5Sonnet,
    //   instruction: `
    //     You are a helpful customer support agent. You have access to our knowledge base.
    //     When customers contact you you should:
    //     1 - Be friendly and professional
    //     2 - Use the knowledge base to answer their questions
    //     3 - Keep your replies short and to the point, but helpful!

    //     SYSTEM INSTRUCTION: You must ALWAYS use the knowledge base to answer questions. You cannot answer questions that are not in the knowledge base.

    //     CRITICAL FAILURE HANDLING:
    //     If you check the knowledge base and cannot find the answer, you MUST respond with EXACTLY this phrase and nothing else: "I've created a ticket for this request"

    //     Do NOT attempt to answer questions that are not in the knowledge base.
    //     Do NOT provide general advice or suggestions.
    //     Do NOT apologize or explain why you can't help.
    //     ONLY respond with: "I've created a ticket for this request"
    //   `,
    //   knowledgeBases: [
    //     {
    //       knowledgeBaseId: knowledgeBase.id,
    //       description: "Knowledge Base for Contact Us Agent",
    //       knowledgeBaseState: "ENABLED",
    //     },
    //   ],
    // });

    // const bedrockRole = createBedrockRole();

    // const knowledgeBaseRole = createKnowledgeBaseRole(storage.bucket, rds);

    // const { knowledgeBase, s3DataSource } = createKnowledgeBase(
    //   knowledgeBaseRole,
    //   rds,
    //   storage.bucket
    // );

    // const { alias: autonomousAgentManager } = createAgent({
    //   name: "autonomous-action-manager",
    //   agentResourceRoleArn: bedrockRole.arn,
    //   prepareAgent: true,
    //   foundationModel: FoundationModels.Claude3_5Sonnet,
    //   instruction:
    //     "You are an agent that replies with a haiku about literally anything" +
    //     "say what you like to say, but make it a haiku.\n\n",
    //   // ':\n' +
    //   // '1. .\n' +
    //   // '2. \n\n' +
    //   // 'You must not d≥o any action yourself. You must Delegate all work to the collaborators.',
    // });

    const { modelInfo } = await import("./infra/api");
    const myApi = new sst.aws.Function("MyApi", {
      url: {
        cors: {
          allowOrigins: ["http://localhost:5173", "http://localhost:5174"],
          allowMethods: ["*"],
          allowHeaders: ["*"],
        },
      },
      link: [
        storage.bucket,
        knowledgeBase,
        oldCustomers,
        newCustomers,
        // contactUsAgent,
      ],
      handler: "packages/functions/src/api.handler",
      permissions: [
        {
          actions: [
            /*
              The only exciting or intereting bit here is that we're getting the
              correct permissions to use the Bedrock knowledge base.
              we need to be able to use. They make sense in
              plain english.
            */
            "bedrock:RetrieveAndGenerate",
            "bedrock:Retrieve",
            "bedrock:InvokeModel",
            "bedrock:InvokeAgent",
          ],
          resources: ["*"],
        },
      ],
    });

    // const taskManager = new sst.aws.Function("TaskManager", {
    //   url: true,
    //   handler: "packages/functions/src/task-manager.handler",
    //   environment: {
    //     AGENT_MODEL_ID: autonomousAgentManager.agentId,
    //     AGENT_ALIAS_ID: autonomousAgentManager?.agentAliasId!,
    //   },
    //   permissions: [
    //     {
    //       effect: "allow",
    //       actions: ["bedrock:InvokeAgent"],
    //       resources: [autonomousAgentManager.agentAliasArn],
    //     },
    //   ],
    // });

    const web = new sst.aws.StaticSite("MyWeb", {
      path: "packages/web",
      build: {
        command: "npm run build",
        output: "dist",
      },
      environment: {
        VITE_BEDROCK_INFO: modelInfo.url,
        VITE_API_URL: myApi.url,
        VITE_AUTH_URL: "auth.url",
      },
    });

    const syncFunction = new sst.aws.Function("KnowledgeBaseSyncFunction", {
      handler: "packages/functions/src/sync.handler",
      runtime: "nodejs20.x",
      timeout: "5 minutes",
      link: [knowledgeBase, s3DataSource],
      permissions: [
        {
          actions: ["bedrock:StartIngestionJob"],
          resources: ["*"],
        },
      ],
    });

    storage.bucket.notify({
      notifications: [
        {
          name: "SyncTrigger",
          function: syncFunction.arn,
          events: ["s3:ObjectCreated:*", "s3:ObjectRemoved:*"],
        },
      ],
    });

    return {
      Bucket: storage.bucket.name,
      Web: web.url,
      Api: myApi.url,
      rdsHost: rds.host,
      rdsPort: rds.port,
      rdsName: rds.database,
      rdsUsername: rds.username,
      rdsDatabase: rds.database,
      apiDocs: myApi.url,
    };
  },
});
