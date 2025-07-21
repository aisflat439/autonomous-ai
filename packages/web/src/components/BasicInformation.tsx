import { Card } from "@/components/ui/card";
import {
  DescriptionList,
  DescriptionListItem,
} from "@/components/ui/description-list";
import type { Agent } from "@/types/agent";

interface BasicInformationProps {
  agent: Agent;
}

export function BasicInformation({ agent }: BasicInformationProps) {
  return (
    <Card title="Basic Information">
      <DescriptionList>
        <DescriptionListItem label="Agent ID" value={agent.agentId} mono />
        {agent.description && (
          <DescriptionListItem label="Description" value={agent.description} />
        )}
        {agent.foundationModel && (
          <DescriptionListItem
            label="Foundation Model"
            value={agent.foundationModel}
            mono
          />
        )}
        {agent.idleSessionTTLInSeconds && (
          <DescriptionListItem
            label="Idle Session Timeout"
            value={`${agent.idleSessionTTLInSeconds} seconds`}
          />
        )}
      </DescriptionList>
    </Card>
  );
}
