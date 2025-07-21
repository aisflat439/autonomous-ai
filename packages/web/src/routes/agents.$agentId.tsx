import { Link } from "@tanstack/react-router";
import { Typography } from "@/components/ui/typography";
import { InstructionStatus } from "@/components/instruction-status";
import { Card } from "@/components/ui/card";
import { BasicInformation } from "@/components/BasicInformation";
import { TechnicalDetails } from "@/components/TechnicalDetails";
import { Timestamps } from "@/components/Timestamps";
import { MemoryConfiguration } from "@/components/MemoryConfiguration";
import { GuardrailConfiguration } from "@/components/GuardrailConfiguration";
import type { Agent, AgentInstruction } from "@/types/agent";

export const Route = createFileRoute({
  loader: async ({ params }) => {
    // Fetch agent details and instruction in parallel
    const [agentResponse, instructionResponse] = await Promise.all([
      fetch(`${import.meta.env.VITE_API_URL}agents/${params.agentId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }),
      fetch(
        `${import.meta.env.VITE_API_URL}agents/${params.agentId}/instructions`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      ).catch(() => null), // Don't fail if instruction fetch fails
    ]);

    if (!agentResponse.ok) {
      if (agentResponse.status === 404) {
        throw new Error("Agent not found");
      }
      throw new Error("Failed to fetch agent details");
    }

    const agentData = await agentResponse.json();

    let instructionData = null;
    if (instructionResponse && instructionResponse.ok) {
      const data = await instructionResponse.json();
      instructionData = data.instruction as AgentInstruction;
    }

    return {
      agent: agentData.agent as Agent,
      customInstruction: instructionData,
    };
  },
  component: AgentDetailPage,
  errorComponent: ({ error }) => (
    <div className="max-w-6xl mx-auto">
      <Typography
        variant="4xl/normal"
        color="secondary"
        as="h1"
        className="mb-6"
      >
        Error
      </Typography>
      <Typography variant="lg/normal" color="muted">
        {error.message}
      </Typography>
    </div>
  ),
});

function AgentDetailPage() {
  const { agent, customInstruction } = Route.useLoaderData();

  return (
    <div>
      <div className="mb-8">
        <Link
          to="/agents"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          ← Back to Agents
        </Link>
        <Typography
          variant="4xl/normal"
          color="secondary"
          as="h1"
          className="mb-2"
        >
          {agent.agentName}
        </Typography>
        <div className="flex items-center gap-4">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              agent.agentStatus === "PREPARED"
                ? "bg-green-100 text-green-800"
                : agent.agentStatus === "PREPARING" ||
                    agent.agentStatus === "CREATING" ||
                    agent.agentStatus === "UPDATING" ||
                    agent.agentStatus === "VERSIONING"
                  ? "bg-yellow-100 text-yellow-800"
                  : agent.agentStatus === "FAILED"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800"
            }`}
          >
            {agent.agentStatus}
          </span>
          <span className="text-sm text-gray-500">
            Version: {agent.agentVersion}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Basic Information */}
        <div className="space-y-6">
          <BasicInformation agent={agent} />

          {/* Technical Details */}
          <TechnicalDetails agent={agent} />

          {/* Timestamps */}
          <Timestamps agent={agent} />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Instruction */}
          <section className="border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Instruction</h2>
              <InstructionStatus customInstruction={customInstruction} />
            </div>
            <pre className="text-sm whitespace-pre-wrap font-mono bg-gray-50 p-4 rounded">
              {customInstruction?.instruction ||
                agent.instruction ||
                "No instruction set"}
            </pre>
            {customInstruction && (
              <div className="mt-3 text-xs text-gray-500">
                <p>
                  Version {customInstruction.version} • Updated by{" "}
                  {customInstruction.updatedBy}
                </p>
                {customInstruction.changeNote && (
                  <p className="mt-1">Note: {customInstruction.changeNote}</p>
                )}
              </div>
            )}
          </section>

          {/* Memory Configuration */}
          <MemoryConfiguration agent={agent} />

          {/* Guardrail Configuration */}
          <GuardrailConfiguration agent={agent} />

          {/* Failure Information */}
          {agent.failureReasons && agent.failureReasons.length > 0 && (
            <Card title="Failure Reasons" variant="error">
              <ul className="list-disc list-inside space-y-1">
                {agent.failureReasons.map((reason: string, index: number) => (
                  <li key={index} className="text-sm text-red-700">
                    {reason}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Recommended Actions */}
          {agent.recommendedActions && agent.recommendedActions.length > 0 && (
            <Card title="Recommended Actions" variant="warning">
              <ul className="list-disc list-inside space-y-1">
                {agent.recommendedActions.map(
                  (action: string, index: number) => (
                    <li key={index} className="text-sm text-blue-700">
                      {action}
                    </li>
                  ),
                )}
              </ul>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
