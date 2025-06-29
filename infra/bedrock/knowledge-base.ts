// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./../../.sst/platform/config.d.ts" />

import { rds } from "../rds";
import { bucket } from "../storage";
import { knowledgeBaseRole } from "./iam";

export function createKnowledgeBase(
  bedrockRole: aws.iam.Role,
  rds: sst.aws.Aurora,
  bucket: sst.aws.Bucket
) {
  const knowledgeBase = new aws.bedrock.AgentKnowledgeBase(
    "knowledgeBase",
    {
      name: "sop-knowledge-base",
      roleArn: bedrockRole.arn,
      knowledgeBaseConfiguration: {
        type: "VECTOR",
        vectorKnowledgeBaseConfiguration: {
          embeddingModelArn:
            "arn:aws:bedrock:us-east-1::foundation-model/amazon.titan-embed-text-v2:0",
        },
      },
      storageConfiguration: {
        type: "RDS",
        rdsConfiguration: {
          databaseName: rds.database,
          credentialsSecretArn: rds.secretArn,
          resourceArn: rds.clusterArn,
          tableName: "bedrock_integration.bedrock_kb",
          fieldMapping: {
            primaryKeyField: "id",
            textField: "chunks",
            vectorField: "embedding",
            metadataField: "metadata",
          },
        },
      },
    },
    {
      dependsOn: [bedrockRole],
    }
  );

  const s3DataSource = new aws.bedrock.AgentDataSource(
    "KnowledgeBaseS3DataSource",
    {
      knowledgeBaseId: knowledgeBase.id,
      name: `${$app.name}-${$app.stage}-knowledge-base-s3`,
      dataSourceConfiguration: {
        type: "S3",
        s3Configuration: {
          bucketArn: bucket.arn,
        },
      },
    }
  );

  return { knowledgeBase, s3DataSource };
}

export const { knowledgeBase, s3DataSource } = createKnowledgeBase(
  knowledgeBaseRole,
  rds,
  bucket
);
