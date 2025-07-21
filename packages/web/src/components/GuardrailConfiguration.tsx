import { Card } from "@/components/ui/card";
import {
  DescriptionList,
  DescriptionListItem,
} from "@/components/ui/description-list";
import type { Agent } from "@/types/agent";

interface GuardrailConfigurationProps {
  agent: Agent;
}

export function GuardrailConfiguration({ agent }: GuardrailConfigurationProps) {
  if (!agent.guardrailConfiguration) {
    return null;
  }

  return (
    <Card title="Guardrail Configuration">
      <DescriptionList>
        {agent.guardrailConfiguration.guardrailIdentifier && (
          <DescriptionListItem
            label="Guardrail ID"
            value={agent.guardrailConfiguration.guardrailIdentifier}
            mono
          />
        )}
        {agent.guardrailConfiguration.guardrailVersion && (
          <DescriptionListItem
            label="Guardrail Version"
            value={agent.guardrailConfiguration.guardrailVersion}
          />
        )}
      </DescriptionList>
    </Card>
  );
}
