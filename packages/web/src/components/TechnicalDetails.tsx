import { Card } from "@/components/ui/card";
import {
  DescriptionList,
  DescriptionListItem,
} from "@/components/ui/description-list";
import type { Agent } from "@/types/agent";

interface TechnicalDetailsProps {
  agent: Agent;
}

export function TechnicalDetails({ agent }: TechnicalDetailsProps) {
  return (
    <Card title="Technical Details">
      <DescriptionList>
        <DescriptionListItem
          label="ARN"
          value={agent.agentArn}
          mono
          className="break-all"
        />
        {agent.agentResourceRoleArn && (
          <DescriptionListItem
            label="Resource Role ARN"
            value={agent.agentResourceRoleArn}
            mono
            className="break-all"
          />
        )}
      </DescriptionList>
    </Card>
  );
}
