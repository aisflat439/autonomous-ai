export const oldCustomers = new sst.aws.Dynamo("OldCustomers", {
  fields: {
    pk: "string",
    sk: "string",
    gsi1pk: "string",
    gsi1sk: "string",
  },
  primaryIndex: { hashKey: "pk", rangeKey: "sk" },
  globalIndexes: {
    CreatedAtIndex: { hashKey: "gsi1pk", rangeKey: "gsi1sk" },
  },
});
