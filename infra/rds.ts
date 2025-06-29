export const vpc = new sst.aws.Vpc("Vpc", {
  nat: "ec2",
  bastion: true,
});

export const rds = new sst.aws.Aurora("Rds", {
  dataApi: true, // required for Bedrock KnowledgeBase to access RDS
  engine: "postgres",
  vpc: vpc,
  scaling: {
    min: "0.5 ACU",
  },
});
