# Autonomous AI - Agent Guidelines

## Build/Lint/Test Commands

- **Test (core)**: `cd packages/core && npm test` or `sst shell vitest`
- **Test single file**: `cd packages/core && sst shell vitest path/to/test.test.ts`
- **Build (web)**: `cd packages/web && npm run build`
- **Lint (web)**: `cd packages/web && npm run lint`
- **Dev (web)**: `cd packages/web && npm run dev`

## Code Style Guidelines

- **Module System**: ESM modules with `"type": "module"` in package.json
- **TypeScript**: Strict mode, Node 22 config extends, ESNext module resolution
- **Imports**: Use named exports, avoid default exports. Group imports: external deps, then internal deps
- **File Structure**: Organize by feature (e.g., `/customers/v1/`, `/customers/v2/`)
- **Naming**: camelCase for variables/functions, PascalCase for types/interfaces/components
- **React Components**: Function components with TypeScript, props interface defined inline or as type
- **Error Handling**: Use try-catch blocks, return appropriate HTTP status codes in APIs
- **Testing**: Vitest for unit tests, place tests in `test/` subdirectories
- **AWS SDK**: Use v3 modular imports (e.g., `@aws-sdk/client-s3`)
- **SST Resources**: Access via `Resource` object from `sst` package
- **API Routes**: Use Hono framework with OpenAPI/Zod validation for type-safe APIs
