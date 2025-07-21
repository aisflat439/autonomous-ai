import { Link } from "@tanstack/react-router";
import { Typography } from "@/components/ui/typography";
import { InstructionStatus } from "@/components/instruction-status";
import { Card } from "@/components/ui/card";
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
          <Card title="Basic Information">
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Agent ID</dt>
                <dd className="text-sm font-mono">{agent.agentId}</dd>
              </div>
              {agent.description && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Description
                  </dt>
                  <dd className="text-sm">{agent.description}</dd>
                </div>
              )}
              {agent.foundationModel && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Foundation Model
                  </dt>
                  <dd className="text-sm font-mono">{agent.foundationModel}</dd>
                </div>
              )}
              {agent.idleSessionTTLInSeconds && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Idle Session Timeout
                  </dt>
                  <dd className="text-sm">
                    {agent.idleSessionTTLInSeconds} seconds
                  </dd>
                </div>
              )}
            </dl>
          </Card>

          {/* Technical Details */}
          <Card title="Technical Details">
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">ARN</dt>
                <dd className="text-sm font-mono break-all">
                  {agent.agentArn}
                </dd>
              </div>
              {agent.agentResourceRoleArn && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Resource Role ARN
                  </dt>
                  <dd className="text-sm font-mono break-all">
                    {agent.agentResourceRoleArn}
                  </dd>
                </div>
              )}
            </dl>
          </Card>

          {/* Timestamps */}
          <Card title="Timestamps">
            <dl className="space-y-3">
              {agent.createdAt && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Created</dt>
                  <dd className="text-sm">
                    {new Date(agent.createdAt).toLocaleString()}
                  </dd>
                </div>
              )}
              {agent.updatedAt && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Last Updated
                  </dt>
                  <dd className="text-sm">
                    {new Date(agent.updatedAt).toLocaleString()}
                  </dd>
                </div>
              )}
              {agent.preparedAt && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Prepared
                  </dt>
                  <dd className="text-sm">
                    {new Date(agent.preparedAt).toLocaleString()}
                  </dd>
                </div>
              )}
            </dl>
          </Card>
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
          {agent.memoryConfiguration && (
            <Card title="Memory Configuration">
              <dl className="space-y-3">
                {agent.memoryConfiguration.enabledMemoryTypes && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Enabled Memory Types
                    </dt>
                    <dd className="text-sm">
                      {agent.memoryConfiguration.enabledMemoryTypes.join(
                        ", ",
                      ) || "None"}
                    </dd>
                  </div>
                )}
                {agent.memoryConfiguration.storageDays && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Storage Days
                    </dt>
                    <dd className="text-sm">
                      {agent.memoryConfiguration.storageDays} days
                    </dd>
                  </div>
                )}
              </dl>
            </Card>
          )}

          {/* Guardrail Configuration */}
          {agent.guardrailConfiguration && (
            <Card title="Guardrail Configuration">
              <dl className="space-y-3">
                {agent.guardrailConfiguration.guardrailIdentifier && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Guardrail ID
                    </dt>
                    <dd className="text-sm font-mono">
                      {agent.guardrailConfiguration.guardrailIdentifier}
                    </dd>
                  </div>
                )}
                {agent.guardrailConfiguration.guardrailVersion && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Guardrail Version
                    </dt>
                    <dd className="text-sm">
                      {agent.guardrailConfiguration.guardrailVersion}
                    </dd>
                  </div>
                )}
              </dl>
            </Card>
          )}

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
