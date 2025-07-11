# HOWTO: Building an Autonomous AI Back Office System

## Project Timeline & Development Steps

### Phase 1: Initial Setup

- **Initial commit** - Created the base SST v3 project structure with monorepo setup using npm workspaces. This established the foundation for separating core logic, functions, and web UI into distinct packages.
- **Web foundation** - Set up Vite + React + TypeScript in the web package for fast HMR development. Configured with strict TypeScript settings and ESM modules throughout the project.
- **Routing** - Integrated TanStack Router for type-safe, file-based routing with automatic route generation. This provides better developer experience compared to traditional React Router.
  - Added route files for customers, knowledge base, model selector, and tickets
  - Configured automatic route tree generation
- **Project standards** - Added "vibe rules" (caferules.md) as a humorous example document for the knowledge base. This serves as test data for the AI to learn from when answering customer service questions.

### Phase 2: Knowledge Base Infrastructure

- **Storage setup** - Configured S3 bucket for document storage with automatic sync triggers. The bucket stores markdown files that get processed into vector embeddings for semantic search.
- **File management** - Built UI components (kb-files.tsx) for uploading and managing knowledge base documents. Implemented presigned URL generation for secure direct uploads to S3.
- **Vector database** - Set up RDS Aurora PostgreSQL with pgvector extension for storing 1024-dimensional embeddings. Created the bedrock_integration schema with proper indexes for vector similarity search.
  - Requires manual setup: "SST doesn't know about aws.bedrock.AgentKnowledgeBase" so wrapped it in Linkable
  - Added HNSW index for fast cosine similarity searches
- **Bedrock integration** - Connected knowledge base to AWS Bedrock using Titan embeddings model. Implemented automatic ingestion triggers when files are added/removed from S3.

### Phase 3: Customer Management

- **Data models** - Defined customer shapes with separate schemas for v1 (old) and v2 (new) customers. This demonstrates API versioning strategy with different data structures per version.
- **API documentation** - Created OpenAPI specs using Hono's Zod integration for automatic schema generation. Each version has its own set of endpoints with proper request/response validation.
- **UI components** - Built customer list and form components with shadcn/ui for consistent styling. Implemented real-time updates and form validation using React Hook Form patterns.
- **Database** - Wired up separate DynamoDB tables for old and new customers to demonstrate data migration patterns. Each table has its own access patterns optimized for different use cases.

### Phase 4: API Development

- **Framework** - Implemented Hono as a lightweight, fast API framework with first-class TypeScript support. Chose Hono over Express for better performance and smaller bundle size in Lambda.
- **Endpoints** - Created RESTful routes with versioned paths (/v1/customers, /v2/customers) for backward compatibility. Each endpoint includes proper error handling and status codes.
- **CRUD operations** - Added full create, read, update, delete functionality with consistent response formats. All operations use the core package functions for business logic separation.
- **Validation** - Integrated Zod schemas for runtime validation and TypeScript type inference. This ensures type safety from API to database with automatic OpenAPI documentation generation.

### Phase 5: Agent & Automation

- **Agent setup** - Configured AWS Bedrock agent with specific instructions for ticket creation only. The agent uses Claude 3 Haiku for cost-effective, fast responses with strict tool usage requirements.
  - "You MUST call the createTicket tool for EVERY customer message - NO EXCEPTIONS"
  - Agent cannot respond without first creating a ticket
- **Ticket automation** - Implemented Lambda function (ticket-creation.ts) as an action group for the agent. The function generates unique ticket IDs and stores them in DynamoDB with proper status tracking.
- **Model selection** - Added UI for choosing between different AI models (stored in model-info.ts). This allows testing different models for cost/performance optimization.
- **Integration** - Connected agent to knowledge base for context and APIs for actions. The agent can query the knowledge base but is restricted to only use the ticket creation tool.

### Phase 6: Polish & Refinement

- **UI library** - Added shadcn/ui components for consistent, accessible UI elements. Configured with Tailwind CSS and custom theme using CSS variables for easy customization.
- **Styling** - Improved visual design with proper spacing, typography, and responsive layouts. Added loading states and error boundaries for better user experience.
- **Type safety** - Updated and refined TypeScript types across all packages with strict mode enabled. Used type inference from Zod schemas to avoid duplication and ensure consistency.
- **Documentation** - Cleaned up inline comments and added comprehensive README with setup instructions. Documented special AWS requirements like model access and RDS setup challenges.

## Key Technical Decisions

### Infrastructure

- **SST v3 for serverless deployment** - Chosen for its superior DX over CDK/SAM with hot reloading and local Lambda simulation. Required special provider configuration (version 6.73.0) for Bedrock model access.
- **AWS Bedrock for AI capabilities** - Provides managed access to foundation models without infrastructure overhead. Using Claude 3 Haiku for cost-effective agent responses and Titan for embeddings.
- **Aurora PostgreSQL with pgvector** - Selected over OpenSearch for vector storage due to lower operational overhead. Supports 1024-dimensional vectors with HNSW indexing for fast similarity search.
- **DynamoDB for customer data** - Separate tables for v1/v2 customers demonstrate migration patterns. Single-table design wasn't used to keep examples simple and clear.

### Frontend

- **Vite for fast development** - Provides instant HMR and optimized builds out of the box. Configured with React plugin and proper TypeScript paths for monorepo imports.
- **TanStack Router for type-safe routing** - File-based routing with automatic route generation eliminates route typos. Provides better TypeScript integration than React Router.
- **shadcn/ui for component library** - Copy-paste components maintain flexibility while ensuring consistency. No runtime dependencies keeps bundle size small.
- **TypeScript for type safety** - Strict mode enabled across all packages with shared tsconfig. Uses Node 22 config as base for modern JavaScript features.

### Backend

- **Hono for lightweight API framework** - Smaller and faster than Express with built-in TypeScript support. Native integration with OpenAPI/Swagger for automatic documentation.
- **OpenAPI + Zod for API documentation** - Single source of truth for validation and documentation. Zod schemas generate both runtime validation and TypeScript types automatically.
- **AWS SDK v3 for service integration** - Modular imports reduce Lambda cold start times. Tree-shakeable design only includes used services in bundle.
- **Modular package structure** - Separation of concerns with core (business logic), functions (Lambda handlers), and web (UI). Enables independent testing and deployment.

## Common Tasks

### Running the Project

```bash
npx sst dev
```

Starts the SST development environment with hot reloading for Lambda functions. The web UI runs separately on port 5173 with its own dev server.

### Setting Up Database

1. **Wait for RDS instance to be ready** - Aurora serverless v2 can take 5-10 minutes to provision. Watch for "Cannot find DBInstance in DBCluster" error which means it's still starting.
2. **Connect via RDS Query Editor** - Use AWS Console since SST tunnel is unreliable. Database name is "autonomous_ai" and username is "postgres".
3. **Run vector extension setup** - Execute CREATE EXTENSION vector to enable pgvector. This is required before creating the knowledge base tables.
4. **Create bedrock_integration schema** - Run the full SQL script from README including table creation and indexes. The HNSW index is critical for performance.

### Adding New Features

1. **Define types in core package** - Create new types in packages/core/src with corresponding DynamoDB operations. Export everything through barrel exports for clean imports.
2. **Create API endpoints with Hono** - Add routes in packages/functions/src/api.ts with OpenAPI documentation. Use createRoute helper for automatic validation and docs.
3. **Build UI components in web package** - Create components in packages/web/src/components using shadcn/ui patterns. Add new routes in the routes directory for automatic routing.
4. **Wire up to AWS services** - Link resources in sst.config.ts and add necessary permissions. Remember to wrap Bedrock resources in Linkable for SST compatibility.

### Testing Changes

- **Core**: `cd packages/core && npm test` or `sst shell vitest` - Runs Vitest tests with SST environment variables loaded
- **Web**: `cd packages/web && npm run dev` - Starts Vite dev server with HMR on localhost:5173
- **Build**: `cd packages/web && npm run build` - Creates production build to verify no TypeScript errors
- **Lint**: `cd packages/web && npm run lint` - Runs ESLint to catch code quality issues
