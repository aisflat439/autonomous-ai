# Dynamic Agent Instructions Plan

## Overview

This document outlines the plan to make agent instructions dynamic and editable at runtime, while keeping agent creation in the infrastructure layer. This is a focused approach that allows updating agent behavior without redeploying infrastructure.

## Current Implementation Status (Updated)

### ✅ Completed

#### Phase 1: Storage & API

1. **DynamoDB Table** - Fully implemented with ElectroDB
   - Table: `AgentInstructions` with pk/sk and GSIs
   - Versioning support with auto-increment
   - Active instruction tracking
   - Audit fields (updatedBy, createdAt, updatedAt)

2. **API Endpoints** - All implemented
   - GET `/agents/{agentId}/instructions` - Get active instruction ✅
   - PUT `/agents/{agentId}/instructions` - Create/update instruction ✅
   - GET `/agents/{agentId}/instructions/history` - Get version history ✅
   - POST `/agents/{agentId}/instructions/{version}/activate` - Activate version ✅

3. **Core Data Layer** - Complete
   - Version management with padding for proper sorting
   - Active instruction queries via GSI
   - History retrieval by date or version

#### Phase 2: Web Interface (Partial)

- Basic display of custom instructions on agent detail page ✅
- Instruction status component showing custom vs default ✅

### ❌ Not Started

#### Infrastructure Integration (Critical)

- Agents still use hardcoded instructions from `sst.config.ts`
- No Lambda function to fetch from DynamoDB
- No connection between Bedrock agents and dynamic instructions

#### Web UI Editor

- No instruction editing capability
- No markdown editor or preview
- No version history UI
- No rollback functionality

#### Other Gaps

- Authentication hardcoded to "taytay1989"
- No permission system
- No migration of existing instructions
- No validation or safety features

## Updated Implementation Plan

### Priority 1: Infrastructure Integration (Critical Path)

1. **Create Instruction Fetcher Lambda**
   - [ ] Lambda to fetch active instruction from DynamoDB
   - [ ] Fallback to hardcoded instruction if not found
   - [ ] Cache with 5-minute TTL for performance

2. **Update Agent Creation**
   - [ ] Modify `createAgent` in `infra/bedrock/agents.ts`
   - [ ] Use dynamic instruction during agent preparation
   - [ ] Test with one pilot agent first

3. **Migration**
   - [ ] Script to import existing instructions to DynamoDB
   - [ ] Set imported instructions as active
   - [ ] Verify agents work with dynamic instructions

### Priority 2: Web Interface

1. **Instruction Editor Component**
   - [ ] Markdown editor (@uiw/react-md-editor recommended)
   - [ ] Live preview pane
   - [ ] Version comparison/diff view
   - [ ] Save with change notes

2. **Update Agent Detail Page**
   - [ ] Add "Edit Instruction" button
   - [ ] Modal or inline editor
   - [ ] Version history with rollback
   - [ ] Loading states and error handling

3. **Safety Features**
   - [ ] Confirm dialog before saving
   - [ ] Validation for instruction format
   - [ ] Auto-save drafts to localStorage
   - [ ] Show who last updated and when

### Priority 3: Authentication & Permissions

1. **Fix Authentication**
   - [ ] Extract user from auth context
   - [ ] Replace hardcoded "taytay1989"
   - [ ] Add to all instruction endpoints

2. **Implement Permissions**
   - [ ] Define roles (admin, editor, viewer)
   - [ ] Check permissions in API
   - [ ] Hide/disable UI based on permissions
   - [ ] Audit log for compliance

## Technical Implementation Details

### Infrastructure Integration Strategy

1. **Instruction Fetcher Lambda**

```typescript
// packages/functions/src/agent-instruction-fetcher.ts
import { getActiveInstruction } from "@autonomous-ai/core/agent-instructions";

export const handler = async (event: { agentId: string }) => {
  try {
    const instruction = await getActiveInstruction(event.agentId);
    return instruction?.instruction || getDefaultInstruction(event.agentId);
  } catch (error) {
    console.error(`Failed to fetch instruction: ${error}`);
    return getDefaultInstruction(event.agentId);
  }
};
```

2. **Updated Agent Creation**

```typescript
// infra/bedrock/agents.ts
const instructionFetcher = new sst.aws.Function("InstructionFetcher", {
  handler: "packages/functions/src/agent-instruction-fetcher.handler",
  link: [agentInstructions],
});

// In createAgent function
const instruction = await instructionFetcher.invoke({
  agentId: params.name,
});

const agent = new aws.bedrock.AgentAgent(uniqueLogicalName, {
  agentName: `${$app.stage}-${params.name}`,
  instruction: instruction || params.instruction, // Fallback
  // ... other params
});
```

### Web UI Architecture

1. **Editor Component Structure**

```typescript
// packages/web/src/components/instruction-editor.tsx
interface InstructionEditorProps {
  agentId: string;
  currentInstruction: string;
  onSave: (instruction: string, changeNote: string) => Promise<void>;
}

export function InstructionEditor({
  agentId,
  currentInstruction,
  onSave,
}: InstructionEditorProps) {
  // Markdown editor with preview
  // Version history sidebar
  // Save/cancel actions
}
```

2. **State Management**

```typescript
// Using React Query for data fetching
const { data: instruction } = useQuery({
  queryKey: ["agent-instruction", agentId],
  queryFn: () => fetchActiveInstruction(agentId),
});

const updateMutation = useMutation({
  mutationFn: (data: UpdateInstructionData) => updateInstruction(agentId, data),
  onSuccess: () => {
    queryClient.invalidateQueries(["agent-instruction", agentId]);
  },
});
```

## Migration Strategy

### Step 1: Pilot Testing

1. Choose one agent (ticket-agent) as pilot
2. Implement fetcher Lambda
3. Update pilot agent to use dynamic instructions
4. Monitor for 24-48 hours

### Step 2: Full Migration

1. Run migration script for all agents
2. Update all agents to use dynamic instructions
3. Keep hardcoded as fallback for 1 week
4. Remove hardcoded after validation

### Migration Script

```typescript
// scripts/migrate-instructions.ts
const agents = [
  { id: "ticket-agent", instruction: ticketAgentInstruction },
  { id: "customer-agent", instruction: customerAgentInstruction },
  // ... other agents
];

for (const agent of agents) {
  await createInstruction({
    agentId: agent.id,
    instruction: agent.instruction,
    updatedBy: "migration-script",
    changeNote: "Initial migration from hardcoded instructions",
  });
}
```

## Success Metrics

- ✅ All API endpoints functional
- ✅ DynamoDB table with versioning
- ✅ Basic UI display of instructions
- [ ] Agents using dynamic instructions
- [ ] < 100ms latency for instruction fetch
- [ ] Web editor for instructions
- [ ] Proper authentication/authorization
- [ ] 50% reduction in deployments for instruction changes

## Immediate Next Steps

1. **This Week**
   - [ ] Create instruction fetcher Lambda
   - [ ] Update ticket-agent as pilot
   - [ ] Test end-to-end flow

2. **Next Week**
   - [ ] Build instruction editor UI
   - [ ] Add authentication to API
   - [ ] Create migration script

3. **Following Week**
   - [ ] Run full migration
   - [ ] Remove hardcoded instructions
   - [ ] Documentation and training

## Risk Assessment

### High Priority Risks

1. **Performance**: Lambda cold starts could impact agent response time
   - Mitigation: Pre-warm Lambda, implement caching

2. **Data Loss**: Accidental deletion of instructions
   - Mitigation: Soft deletes, version history, backups

3. **Breaking Changes**: Invalid instructions breaking agents
   - Mitigation: Validation, testing, gradual rollout

### Medium Priority Risks

1. **User Errors**: Incorrect instruction edits
   - Mitigation: Preview, confirmation, easy rollback

2. **Permissions**: Unauthorized edits
   - Mitigation: Role-based access control

## Questions Resolved

1. ~~Should we implement instruction templates?~~ → Yes, in Phase 4
2. ~~How often should agents refresh instructions?~~ → 5-minute cache TTL
3. ~~Do we need approval workflow for changes?~~ → Not for MVP, consider later
4. ~~Should we support markdown in instructions?~~ → Yes, with preview
5. ~~How to handle instruction variables/placeholders?~~ → Phase 4 feature
