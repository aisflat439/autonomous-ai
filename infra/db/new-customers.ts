export const newCustomers = new sst.aws.Dynamo("NewCustomers", {
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
