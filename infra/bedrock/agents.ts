// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./../../.sst/platform/config.d.ts" />

import { type FoundationModelName } from "./models";
type KnowledgeBaseState = "ENABLED" | "DISABLED";
type AgentCollaboration = "SUPERVISOR" | "COLLABORATOR";

export const createAgent = (params: {
  name: string;
  foundationModel: FoundationModelName;
  instruction: string;
  agentResourceRoleArn: $util.Output<string>;
  agentCollaboration?: AgentCollaboration;
  prepareAgent?: boolean;
  knowledgeBases?: {
    knowledgeBaseId: $util.Output<string>;
    description: string;
    knowledgeBaseState?: KnowledgeBaseState;
  }[];
  collaborators?: {
    name: string;
    instruction: string;
    aliasArn: $util.Output<string>;
  }[];
}): { agent: aws.bedrock.AgentAgent; alias?: aws.bedrock.AgentAgentAlias } => {
  /*
    see documentation here
    https://www.pulumi.com/registry/packages/aws/api-docs/bedrock/agentagent/
   */
  const agent = new aws.bedrock.AgentAgent(params.name, {
    agentName: `${$app.stage}-${params.name}`,
    agentResourceRoleArn: params.agentResourceRoleArn,
    idleSessionTtlInSeconds: 500,
    foundationModel: params.foundationModel,
    instruction: params.instruction,
    agentCollaboration: params.agentCollaboration,
    prepareAgent: params.prepareAgent,
  });

  /*
    Sometimes we'll have knowledge bases that we want to attach to the agent.
    when we want to do that we'll pass in the knowledgeBases parameter.
    each of those will then get added to the agent.
  */
  params.knowledgeBases.forEach((kb, index) => {
    new aws.bedrock.AgentAgentKnowledgeBaseAssociation(
      `${params.name}-knowledge-base-${index}`,
      {
        agentId: agent.agentId,
        /*
          Notice that we're creating the agent as DRAFT
          we can version agents just like we can
          with an API. So we'll use DRAFT
          as we build out our process
          eventually we can hit
          V1 and call it
          good.
        */
        agentVersion: "DRAFT",
        knowledgeBaseId: kb.knowledgeBaseId,
        description: kb.description || `Knowledge Base for ${params.name}`,
        knowledgeBaseState: kb.knowledgeBaseState || "ENABLED",
      }
    );
  });

  params.collaborators?.forEach((collaborator) => {
    /*
      see documentation here
      https://www.pulumi.com/registry/packages/aws/api-docs/bedrock/agentagentcollaborator/
    */
    new aws.bedrock.AgentAgentCollaborator(collaborator.name, {
      agentId: agent.agentId,
      collaborationInstruction: collaborator.instruction,
      collaboratorName: `${$app.stage}-${collaborator.name}`,
      relayConversationHistory: "TO_COLLABORATOR",
      agentDescriptor: {
        aliasArn: collaborator.aliasArn,
      },
    });
  });

  let alias: aws.bedrock.AgentAgentAlias | undefined;

  if (params.prepareAgent) {
    /*
      see documentation here
      https://www.pulumi.com/registry/packages/aws/api-docs/bedrock/agentagentalias/
    */
    alias = new aws.bedrock.AgentAgentAlias(params.name, {
      agentAliasName: `${$app.stage}-${params.name}-alias`,
      agentId: agent.agentId,
      description: params.name,
    });
  }

  return { agent, alias };
};
