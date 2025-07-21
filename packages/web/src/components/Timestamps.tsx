import { Card } from "@/components/ui/card";
import {
  DescriptionList,
  DescriptionListItem,
} from "@/components/ui/description-list";
import type { Agent } from "@/types/agent";

interface TimestampsProps {
  agent: Agent;
}

export function Timestamps({ agent }: TimestampsProps) {
  return (
    <Card title="Timestamps">
      <DescriptionList>
        {agent.createdAt && (
          <DescriptionListItem
            label="Created"
            value={new Date(agent.createdAt).toLocaleString()}
          />
        )}
        {agent.updatedAt && (
          <DescriptionListItem
            label="Last Updated"
            value={new Date(agent.updatedAt).toLocaleString()}
          />
        )}
        {agent.preparedAt && (
          <DescriptionListItem
            label="Prepared"
            value={new Date(agent.preparedAt).toLocaleString()}
          />
        )}
      </DescriptionList>
    </Card>
  );
}
