import { Card } from "@/components/ui/card";
import {
  DescriptionList,
  DescriptionListItem,
} from "@/components/ui/description-list";
import type { Agent } from "@/types/agent";

interface MemoryConfigurationProps {
  agent: Agent;
}

export function MemoryConfiguration({ agent }: MemoryConfigurationProps) {
  if (!agent.memoryConfiguration) {
    return null;
  }

  return (
    <Card title="Memory Configuration">
      <DescriptionList>
        {agent.memoryConfiguration.enabledMemoryTypes && (
          <DescriptionListItem
            label="Enabled Memory Types"
            value={
              agent.memoryConfiguration.enabledMemoryTypes.join(", ") || "None"
            }
          />
        )}
        {agent.memoryConfiguration.storageDays && (
          <DescriptionListItem
            label="Storage Days"
            value={`${agent.memoryConfiguration.storageDays} days`}
          />
        )}
      </DescriptionList>
    </Card>
  );
}
