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

## What is this project

This project imagines a back office that has the following features
1 - it's run entirely on your own infrastructure
2 - it supports normal back office functions
3 - it encrouages the back office to think in terms of automation, rather than one off tasks
