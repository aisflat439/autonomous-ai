import { Typography } from "@/components/ui/typography";

interface Agent {
  id: string;
  name: string;
  description: string;
  status: "active" | "inactive" | "preparing";
  foundationModel: string;
  lastUpdated?: string;
}

export const Route = createFileRoute({
  component: AgentsPage,
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

function AgentsPage() {
  const { agents } = Route.useLoaderData();

  return (
    <div className="max-w-6xl mx-auto">
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
            <div
              key={agent.id}
              className="border rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <h3 className="text-lg font-semibold mb-2">{agent.name}</h3>
              <p className="text-gray-600 mb-4">{agent.description}</p>
              <div className="flex justify-between items-center">
                <span
                  className={`px-2 py-1 rounded text-sm ${
                    agent.status === "active"
                      ? "bg-green-100 text-green-800"
                      : agent.status === "preparing"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {agent.status}
                </span>
                <span className="text-sm text-gray-500">
                  {agent.foundationModel}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <Typography variant="lg/normal" color="muted">
              No agents available. The API endpoint needs to be implemented.
            </Typography>
          </div>
        )}
      </div>
    </div>
  );
}
