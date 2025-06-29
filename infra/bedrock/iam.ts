// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./../../.sst/platform/config.d.ts" />

import { bucket } from "../storage";
import { rds } from "../rds";

export const createBedrockRole = (): aws.iam.Role => {
  const role = new aws.iam.Role("bedrock-role", {
    assumeRolePolicy: JSON.stringify({
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Action: ["sts:AssumeRole"],
          Principal: {
            Service: ["bedrock.amazonaws.com"],
          },
        },
      ],
    }),
  });

  new aws.iam.RolePolicyAttachment("bedrock-policy-attachment", {
    role: role.name,
    policyArn: "arn:aws:iam::aws:policy/AmazonBedrockFullAccess",
  });

  return role;
};

export const createKnowledgeBaseRole = (
  bucket: sst.aws.Bucket,
  rds: sst.aws.Aurora
) => {
  const role = new aws.iam.Role("knowledge-base-role", {
    assumeRolePolicy: JSON.stringify({
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Action: ["sts:AssumeRole"],
          Principal: {
            Service: "bedrock.amazonaws.com",
          },
        },
      ],
    }),
  });

  // Foundation Models permission
  new aws.iam.RolePolicyAttachment("kb-bedrock-policy", {
    role: role.name,
    policyArn: "arn:aws:iam::aws:policy/AmazonBedrockFullAccess",
  });

  // S3 access
  new aws.iam.RolePolicy("kb-s3-policy", {
    role: role.name,
    policy: bucket.arn.apply((arn) =>
      JSON.stringify({
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Action: ["s3:GetObject", "s3:ListBucket"],
            Resource: [arn, `${arn}/*`],
          },
        ],
      })
    ),
  });

  // RDS access
  new aws.iam.RolePolicy("kb-rds-policy", {
    role: role.name,
    policy: $resolve([rds.clusterArn, rds.secretArn]).apply(
      ([clusterArn, secretArn]) =>
        JSON.stringify({
          Version: "2012-10-17",
          Statement: [
            {
              Sid: "RDSDescribe",
              Effect: "Allow",
              Action: ["rds:DescribeDBClusters"],
              Resource: [clusterArn],
            },
            {
              Sid: "RDSDataApiAccess",
              Effect: "Allow",
              Action: [
                "rds-data:BatchExecuteStatement",
                "rds-data:ExecuteStatement",
              ],
              Resource: [clusterArn],
            },
            {
              Sid: "SecretsManagerAccess",
              Effect: "Allow",
              Action: ["secretsmanager:GetSecretValue"],
              Resource: [secretArn],
            },
          ],
        })
    ),
  });

  return role;
};

export const bedrockRole = createBedrockRole();
export const knowledgeBaseRole = createKnowledgeBaseRole(bucket, rds);
