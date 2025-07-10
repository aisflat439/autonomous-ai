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

    const ticketAgentInstruction = `You are a customer support ticket management agent. Your primary role is to analyze customer requests and create appropriate tickets in the database.

    CORE RESPONSIBILITIES:
    1. Analyze every customer message to understand their need
    2. Determine if the request can be immediately resolved or needs follow-up
    3. Create a ticket using the createTicket tool with appropriate status

    TICKET CREATION RULES:
    - ALWAYS create a ticket for every customer request
    - Set status to "complete" if you can provide a full solution in your response
    - Set status to "open" if the request needs human follow-up or you cannot fully resolve it
    - Be concise but capture the essence of the request in the ticket description

    STATUS DECISION CRITERIA:
    Mark as "complete" when:
    - You provide a direct answer to a question
    - You give clear instructions that fully resolve the issue
    - The request is informational and you've provided the information

    Mark as "open" when:
    - The request needs human intervention
    - You need more information to fully resolve it
    - The issue is complex or technical beyond your knowledge
    - The customer is reporting a bug or system issue
    - Any request involving refunds, account changes, or sensitive data

    IMPORTANT: You must ALWAYS call the createTicket tool before responding to the customer. Never skip ticket creation.

    RESPONSE FORMAT:
    1. First, create the ticket (always)
    2. Then, provide a helpful response to the customer
    3. If status is "open", let them know their request has been logged and someone will follow up`;

    const { agent: ticketAgent, alias: ticketAgentAlias } = createAgent({
      name: `ticket-calling-example-agent-${Date.now()}`,
      description: "A simple tool agent for creating support tickets",
      agentResourceRoleArn: bedrockRole.arn,
      prepareAgent: true,
      foundationModel: FoundationModels.Claude3_Haiku,
      instruction: ticketAgentInstruction,
      knowledgeBases: [],
      collaborators: [],
    });
    // const agent = new aws.bedrock.AgentAgent("tool-calling-agent", {
    //   agentName: `${$app.stage}-tool-calling-agent`,
    //   agentResourceRoleArn: bedrockRole.arn,
    //   idleSessionTtlInSeconds: 500,
    //   foundationModel: FoundationModels.Claude3_Haiku,
    //   instruction: ticketAgentInstruction,
    //   prepareAgent: true,
    //   description: "a simple tool agent for creating support tickets",
    // });

    const ticketCreation = new sst.aws.Function("TicketCreationFunction", {
      handler: "packages/functions/src/ticket-creation.handler",
      runtime: "nodejs20.x",
      timeout: "5 minutes",
      permissions: [
        {
          actions: ["bedrock:StartIngestionJob"],
          resources: ["*"],
        },
      ],
    });

    // const ticketActionGroup = new aws.bedrock.AgentAgentActionGroup(
    //   "TicketActionGroup",
    //   {
    //     actionGroupName: "ticket-tools",
    //     agentId: simpleToolAgent.agentId,
    //     agentVersion: "DRAFT",
    //     skipResourceInUseCheck: true,
    //     actionGroupExecutor: {
    //       lambda: ticketCreation.arn,
    //     },
    //     functionSchema: {
    //       memberFunctions: {
    //         functions: [
    //           {
    //             name: "createTicket",
    //             description:
    //               "Creates a support ticket in the database with the customer's request",
    //             parameters: [
    //               {
    //                 mapBlockKey: "customerMessage",
    //                 type: "string",
    //                 description:
    //                   "The original message or request from the customer",
    //                 required: true,
    //               },
    //               {
    //                 mapBlockKey: "description",
    //                 type: "string",
    //                 description:
    //                   "A brief summary of the issue or request for the support team",
    //                 required: true,
    //               },
    //               {
    //                 mapBlockKey: "status",
    //                 type: "string",
    //                 description:
    //                   "Ticket status - either 'complete' if resolved or 'open' if needs follow-up",
    //                 required: true,
    //               },
    //             ],
    //           },
    //         ],
    //       },
    //     },
    //   }
    // );

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
        ticketAgent,
        ticketAgentAlias,
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
