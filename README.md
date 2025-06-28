# autonomous-ai

A project example for a talk at NoCo AWS. [Learn more](https://sst.dev/).

## Get started

From the project root run

`npx sst dev`

#### Special considerations

1 - It's important that we add a special key to our standard SST experience

```ts
// in sst.config note this ensures that we have
// access to the correct models
    providers: {
        aws: {
            region: "us-east-1",
            version: "6.73.0",
        },
    },
```

2 - Model Access

If you haven't gotten access to the models you may need to request access from the aws console.

3 - RDS and Agents

We need to be sure to load up our RDS instance first, then we can fire up our Knowledge Base. This is sorta annoying and I wish there was a smarter way to do it but... I don't know another approach.

This is the error to watch for:

```
ValidationException: The knowledge base storage configuration
provided is invalid... The vector database encountered an error while processing the request: Cannot find DBInstance in
DBCluster
```

4 - Setting up the db instance

SST tunnel is a thing, but it kinda sucks. If you can't get it running, just manually go into the console to create the table.

### Connect to Aurora PostgreSQL via RDS Query Editor

1. Go to **AWS Console → RDS → Your Aurora Cluster**
2. Click on the **writer instance**
3. Click **Query Editor**
4. Fill in connection details:

- **Database username**: Check dropdown for available usernames (should be `postgres`)
- **Database password**: Get from AWS Secrets Manager → your RDS secret → "Retrieve secret value"
- **Database name**: `autonomous_ai` (or from your SST output)

### Run SQL Commands

Execute these commands one by one in the query editor:

```sql
-- Enable vector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create schema for Bedrock
CREATE SCHEMA bedrock_integration;

-- Create main table for vector storage
CREATE TABLE bedrock_integration.bedrock_kb (
 id uuid PRIMARY KEY,
 embedding vector(1024),
 chunks text,
 metadata json,
 custom_metadata jsonb
);

-- Create vector similarity search index
CREATE INDEX ON bedrock_integration.bedrock_kb USING hnsw (embedding vector_cosine_ops) WITH (ef_construction=256);

-- Create text search index
CREATE INDEX ON bedrock_integration.bedrock_kb USING gin (to_tsvector('simple', chunks));

-- Create metadata search index
CREATE INDEX ON bedrock_integration.bedrock_kb USING gin (custom_metadata);
```

## What is this project

This project imagines a back office that has the following features
1 - it's run entirely on your own infrastructure
2 - it supports normal back office functions
3 - it encrouages the back office to think in terms of automation, rather than one off tasks
