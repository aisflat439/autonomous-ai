export const tickets = new sst.aws.Dynamo("Tickets", {
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
    StatusIndex: { hashKey: "gsi1pk", rangeKey: "gsi1sk" },
    CustomerIndex: { hashKey: "gsi2pk", rangeKey: "gsi2sk" },
  },
});
