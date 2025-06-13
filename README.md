# autonomous-ai

A project example for a talk at NoCo AWS. [Learn more](https://sst.dev/).

## Get started

From the project root run

`npx sst dev`

#### Special considerations

It's important that we add a special key to our standard SST experience

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
