import { Resource } from "sst";

import { Hono } from "hono";
import { handle } from "hono/aws-lambda";
import { v7 as uuidv7 } from "uuid";

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";

const s3 = new S3Client();

const app = new Hono();

app.get("/", async (c) => {
  return c.text(
    "Welcome to the Autonomous AI API! Use /latest to get the latest file from S3."
  );
});

app.get("/upload", async (c) => {
  const command = new PutObjectCommand({
    Key: uuidv7(),
    Bucket: Resource.MyBucket.name,
  });
  console.log("Resource.MyBucket.name: ", Resource.MyBucket.name);
  const url = await getSignedUrl(s3, command);

  return c.json({ url });
});

app.get("/kb-files", async (c) => {
  const objects = await s3.send(
    new ListObjectsV2Command({
      Bucket: Resource.MyBucket.name,
    })
  );

  const fileNames =
    objects.Contents?.map((obj) => obj.Key).filter(
      (key): key is string => typeof key === "string"
    ) ?? [];

  console.log("fileNames: ", fileNames);
  // return the list of file names
  return c.json({ files: fileNames });
});

export const handler = handle(app);
