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
    const { bedrockRole } = await import("./infra/bedrock/iam");
    const { createAgent } = await import("./infra/bedrock/agents");
    const { knowledgeBase, s3DataSource } = await import(
      "./infra/bedrock/knowledge-base"
    );
    const { oldCustomers } = await import("./infra/db/old-customers");
    const { newCustomers } = await import("./infra/db/new-customers");
    const { tickets } = await import("./infra/db/tickets");

    const ticketAgentInstruction = `You are a customer support ticket management agent. Your ONLY job is to create tickets using the createTicket tool.

    CRITICAL RULES:
    1. You MUST call the createTicket tool for EVERY customer message - NO EXCEPTIONS
    2. You cannot respond to customers without first creating a ticket
    3. If you try to respond without using createTicket, you have FAILED your task

    TOOL USAGE:
    - Tool name: createTicket
    - Required parameters:
      - customerMessage: The exact message from the customer
      - description: Brief summary for support team
      - status: "open" | "in-progress" 

    Status should be set to "in-progress" if the issue is resolved with your answer
    Status should be set to "open" if you do not have enough information to resolve the issue
    Status should be set to "complete" only if the customer is say
    WORKFLOW:
    1. Read the customer message
    2. IMMEDIATELY call createTicket tool
    3. Only after the tool responds, provide your response

    IMPORTANT: Your ONLY job is to create tickets. The support team will handle resolutions.

    If you respond without calling createTicket first, the system will reject your response.`;

    const { agent: ticketAgent } = createAgent({
      name: `agent-for-ticket-creation-v1`,
      description: "A simple tool agent for creating support tickets",
      agentResourceRoleArn: bedrockRole.arn,
      prepareAgent: false,
      foundationModel: FoundationModels.Claude3_Haiku,
      instruction: ticketAgentInstruction,
      knowledgeBases: [],
      collaborators: [],
    });

    const ticketCreation = new sst.aws.Function("TicketCreationFunction", {
      handler: "packages/functions/src/ticket-creation.handler",
      runtime: "nodejs20.x",
      timeout: "5 minutes",
      link: [tickets],
      permissions: [
        {
          actions: ["bedrock:StartIngestionJob"],
          resources: ["*"],
        },
      ],
    });

    // Allow Bedrock to invoke the ticket creation function
    new aws.lambda.Permission("BedrockInvokeTicketCreation", {
      function: ticketCreation.name,
      principal: "bedrock.amazonaws.com",
      action: "lambda:InvokeFunction",
      sourceArn: ticketAgent.agentArn,
    });

    const ticketActionGroup = new aws.bedrock.AgentAgentActionGroup(
      "TicketActionGroup",
      {
        actionGroupName: "ticket-tools-for-agent",
        agentId: ticketAgent.agentId,
        agentVersion: "DRAFT",
        skipResourceInUseCheck: true,
        actionGroupExecutor: {
          lambda: ticketCreation.arn,
        },
        functionSchema: {
          memberFunctions: {
            functions: [
              {
                name: "createTicket",
                description:
                  "Creates a support ticket in the database with the customer's request",
                parameters: [
                  {
                    mapBlockKey: "customerMessage",
                    type: "string",
                    description:
                      "The original message or request from the customer",
                    required: true,
                  },
                  {
                    mapBlockKey: "description",
                    type: "string",
                    description:
                      "A brief summary of the issue or request for the support team",
                    required: true,
                  },
                  {
                    mapBlockKey: "status",
                    type: "string",
                    description:
                      "Ticket status - either 'complete' if resolved or 'open' if needs follow-up",
                    required: true,
                  },
                ],
              },
            ],
          },
        },
      },
    );

    const ticketAgentAlias = new aws.bedrock.AgentAgentAlias(
      "ticket-agent-alias",
      {
        agentAliasName: `${$app.stage}-ticket-agent-alias`,
        agentId: ticketAgent.agentId,
        description: "Ticket agent alias",
      },
      { dependsOn: [ticketActionGroup] },
    );

    const { modelInfo } = await import("./infra/api");
    const myApi = new sst.aws.Function("MyApi", {
      url: {
        cors: {
          allowOrigins: ["http://localhost:5173", "http://localhost:5174"],
          allowMethods: ["*"],
          allowHeaders: ["*"],
        },
      },
      environment: {
        MODEL_ARN: FoundationModels.Claude3_Haiku,
      },
      link: [
        storage.bucket,
        knowledgeBase,
        oldCustomers,
        newCustomers,
        ticketAgent,
        ticketAgentAlias,
        tickets,
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
            "bedrock:ListAgents",
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
