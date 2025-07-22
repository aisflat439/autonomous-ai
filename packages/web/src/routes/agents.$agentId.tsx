import { Link } from "@tanstack/react-router";
import { Typography } from "@/components/ui/typography";
import { BasicInformation } from "@/components/BasicInformation";
import { TechnicalDetails } from "@/components/TechnicalDetails";
import { Timestamps } from "@/components/Timestamps";
import { MemoryConfiguration } from "@/components/MemoryConfiguration";
import { GuardrailConfiguration } from "@/components/GuardrailConfiguration";
import type { Agent, AgentInstruction } from "@/types/agent";
import { Instructions } from "@/components/Instructions";

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
        }
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
          <Instructions customInstruction={customInstruction} agent={agent} />

          {/* Memory Configuration */}
          <MemoryConfiguration agent={agent} />

          {/* Guardrail Configuration */}
          <GuardrailConfiguration agent={agent} />
        </div>
      </div>
    </div>
  );
}
