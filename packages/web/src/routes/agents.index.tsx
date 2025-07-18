import { Link } from "@tanstack/react-router";
import { Typography } from "@/components/ui/typography";

interface Agent {
  agentId: string;
  agentName: string;
  agentStatus:
    | "CREATING"
    | "PREPARING"
    | "PREPARED"
    | "NOT_PREPARED"
    | "DELETING"
    | "FAILED"
    | "VERSIONING"
    | "UPDATING";
  description?: string;
  latestAgentVersion?: string;
  updatedAt?: string;
}

export const Route = createFileRoute({
  component: AgentsListPage,
  loader: async () => {
    let agents: Agent[] = [];

    try {
      const response = await fetch(import.meta.env.VITE_API_URL + "agents", {
        method: "get",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        agents = data.agents || [];
      } else {
        console.error("Failed to fetch agents:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching agents:", error);
    }

    return { agents };
  },
});

function AgentsListPage() {
  const { agents } = Route.useLoaderData();

  return (
    <>
      <Typography
        variant="4xl/normal"
        color="secondary"
        as="h1"
        className="mb-6"
      >
        Agents
      </Typography>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.length > 0 ? (
          agents.map((agent) => (
            <Link
              key={agent.agentId}
              to="/agents/$agentId"
              params={{ agentId: agent.agentId }}
              className="block border rounded-lg p-6 hover:shadow-lg transition-shadow hover:border-blue-300"
            >
              <h3 className="text-lg font-semibold mb-2">{agent.agentName}</h3>
              <p className="text-gray-600 mb-4">
                {agent.description || "No description available"}
              </p>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Status:</span>
                  <span
                    className={`px-2 py-1 rounded text-sm ${
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
                </div>
                {agent.updatedAt && (
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">Last updated:</span>{" "}
                    {new Date(agent.updatedAt).toLocaleString()}
                  </div>
                )}
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <Typography variant="lg/normal" color="muted">
              No agents found in your Bedrock account.
            </Typography>
          </div>
        )}
      </div>
    </>
  );
}
