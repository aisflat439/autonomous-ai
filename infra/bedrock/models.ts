/*
  Supported Bedrock Foundation Models
  https://docs.aws.amazon.com/bedrock/latest/userguide/models-supported.html
*/

export const FoundationModels = {
  Claude3_Haiku: "anthropic.claude-3-haiku-20240307-v1:0",
  Claude3_5Sonnet: "us.anthropic.claude-3-5-sonnet-20241022-v2:0",
  Amazon_Nova_Lite: "amazon.nova-lite-v1:0",
  Amazon_Nova_Micro: "amazon.nova-micro-v1:0",
  Amazon_Titan_Text_Express: "amazon.titan-text-express-v1",
  Amazon_Titan_Text_Lite: "amazon.titan-text-lite-v1",
} as const;

export type FoundationModelName =
  (typeof FoundationModels)[keyof typeof FoundationModels];
