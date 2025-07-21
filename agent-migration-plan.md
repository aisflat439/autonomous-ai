# Dynamic Agent Instructions Plan

## Overview

This document outlines the plan to make agent instructions dynamic and editable at runtime, while keeping agent creation in the infrastructure layer. This is a focused approach that allows updating agent behavior without redeploying infrastructure.

## Current State Analysis

### Infrastructure Layer (Current)

- **Agent Creation**: Remains in `infra/bedrock/agents.ts` and `sst.config.ts`
- **Instructions**: Hardcoded strings in `sst.config.ts`
- **Updates**: Require full infrastructure deployment

### Application Layer (Current)

- **Functionality**: Read-only operations (list and get agents)
- **No Instruction Management**: Cannot modify agent instructions

## Target State

### Hybrid Approach

- **Agent Creation**: Still managed in infrastructure (no change)
- **Instruction Management**: Dynamic via application layer
- **Storage**: DynamoDB table for instructions
- **Updates**: Real-time instruction updates without deployment

## Implementation Plan

### Phase 1: Storage & API (Week 1)

1. **Create DynamoDB Table**
   - [x] Table name: `agent-instructions`
   - [x] Primary key: `agentId`
   - [x] Sort key: `version`
   - [x] Attributes: instruction, updatedAt, updatedBy, isActive

2. **Build API Endpoints**
   - [ ] GET /agents/{agentId}/instructions - Get current instruction
   - [ ] PUT /agents/{agentId}/instructions - Update instruction
   - [ ] GET /agents/{agentId}/instructions/history - Get version history

3. **Modify Infrastructure**
   - [ ] Update agent creation to reference dynamic instructions
   - [ ] Add Lambda function to fetch instructions from DynamoDB
   - [ ] Configure Bedrock to use dynamic instruction source

### Phase 2: Web Interface (Week 2)

1. **Create Instruction Editor**
   - [ ] Add instruction editing to agent detail page
   - [ ] Implement markdown editor with preview
   - [ ] Add syntax highlighting for variables/placeholders
   - [ ] Include save and version history

2. **Add Safety Features**
   - [ ] Instruction validation before save
   - [ ] Preview changes before applying
   - [ ] Rollback to previous versions
   - [ ] Change tracking and audit log

### Phase 3: Integration & Testing (Week 3)

1. **Connect Infrastructure to Dynamic Instructions**
   - [ ] Update agent creation to pull from DynamoDB
   - [ ] Implement instruction refresh mechanism
   - [ ] Add fallback to default instructions
   - [ ] Test instruction updates

2. **Migration**
   - [ ] Import existing instructions to DynamoDB
   - [ ] Update infrastructure to use dynamic source
   - [ ] Verify agents work with new system

## Technical Details

### DynamoDB Schema

```typescript
interface AgentInstruction {
  agentId: string; // Partition key
  version: number; // Sort key
  instruction: string; // The actual instruction text
  isActive: boolean; // Currently active version
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  updatedBy: string; // User who made the change
  changeNote?: string; // Optional description of changes
}
```

### API Design

```yaml
/api/agents/{agentId}/instructions:
  get:
    summary: Get current active instruction
    responses:
      200: Current instruction
      404: Agent not found

  put:
    summary: Update agent instruction
    requestBody:
      content:
        application/json:
          schema:
            type: object
            properties:
              instruction: string
              changeNote: string
    responses:
      200: Instruction updated
      400: Invalid instruction

/api/agents/{agentId}/instructions/history:
  get:
    summary: Get instruction version history
    parameters:
      - name: limit
        in: query
        schema:
          type: integer
          default: 10
    responses:
      200: List of instruction versions
```

### Infrastructure Integration

```typescript
// In agent creation (infra/bedrock/agents.ts)
const getAgentInstruction = async (agentId: string): Promise<string> => {
  // Fetch from DynamoDB
  // Fallback to default if not found
};

// Modified agent creation
const agent = new aws.bedrock.AgentAgent(uniqueLogicalName, {
  agentName: `${$app.stage}-${params.name}`,
  instruction: $util.output(getAgentInstruction(params.name)),
  // ... other params
});
```

## Implementation Approach

### How It Works

1. **Agent Creation**: Infrastructure creates agent with a reference to fetch dynamic instructions
2. **Instruction Storage**: DynamoDB stores versioned instructions
3. **Runtime Behavior**: Agent fetches latest active instruction when needed
4. **Updates**: Web UI allows editing instructions, creating new versions
5. **Activation**: Mark specific version as active for the agent to use

### Key Benefits

- No infrastructure redeploy for instruction changes
- Version history and rollback capability
- Audit trail of who changed what and when
- Test instructions before making them active
- Simple focused scope - just instructions

## Risks & Mitigation

### Risks

1. **Instruction Sync**: Agent might cache old instructions
2. **Invalid Instructions**: Bad syntax could break agent
3. **Access Control**: Who can edit instructions?

### Mitigation Strategies

1. **Cache TTL**: Set appropriate cache expiration
2. **Validation**: Validate instruction format before saving
3. **Permissions**: Implement proper IAM/auth checks
4. **Fallback**: Keep default instruction if DB fails

## Success Criteria

- [ ] Instructions editable without infrastructure deployment
- [ ] Version history maintained in DynamoDB
- [ ] Web interface for editing instructions
- [ ] Agents use dynamic instructions successfully
- [ ] Rollback capability works

## Timeline

- **Week 1**: DynamoDB setup and API endpoints
- **Week 2**: Web UI for instruction editing
- **Week 3**: Infrastructure integration and testing

## Next Steps

1. Create DynamoDB table for instructions
2. Build API endpoints for instruction management
3. Update infrastructure to use dynamic instructions
4. Create web UI for editing
5. Test with existing agents

## Questions to Consider

1. Should we implement instruction templates?
2. How often should agents refresh instructions?
3. Do we need approval workflow for changes?
4. Should we support markdown in instructions?
5. How to handle instruction variables/placeholders?
