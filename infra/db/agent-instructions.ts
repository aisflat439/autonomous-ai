export const agentInstructions = new sst.aws.Dynamo("AgentInstructions", {
  fields: {
    pk: "string",
    sk: "string",
    gsi1pk: "string",
    gsi1sk: "string",
    gsi2pk: "string",
    gsi2sk: "string",
  },
  primaryIndex: { hashKey: "pk", rangeKey: "sk" },
  globalIndexes: {
    ActiveIndex: { hashKey: "gsi1pk", rangeKey: "gsi1sk" },
    VersionIndex: { hashKey: "gsi2pk", rangeKey: "gsi2sk" },
  },
});
