import { useState, useEffect } from "react";
import { Typography } from "@/components/ui/typography";

interface Ticket {
  ticketId: string;
  customerMessage: string;
  description: string;
  status: "open" | "in-progress" | "complete" | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
  customerEmail?: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

export const Route = createFileRoute({
  component: TicketsPage,
});

function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      const response = await fetch(import.meta.env.VITE_API_URL + "tickets");
      if (response.ok) {
        const data = await response.json();
        setTickets(data);
      } else {
        console.error("Failed to fetch tickets");
      }
    } catch (error) {
      console.error("Error loading tickets:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "text-yellow-600 bg-yellow-50";
      case "in-progress":
        return "text-blue-600 bg-blue-50";
      case "complete":
        return "text-green-600 bg-green-50";
      case "cancelled":
        return "text-gray-600 bg-gray-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "text-red-600";
      case "high":
        return "text-orange-600";
      case "medium":
        return "text-yellow-600";
      case "low":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <Typography
        variant="4xl/normal"
        color="secondary"
        as="h1"
        className="mb-6"
      >
        Support Tickets
      </Typography>

      <div className="border rounded-lg p-4 bg-gray-50">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Typography variant="md/thin">Loading tickets...</Typography>
          </div>
        ) : tickets.length > 0 ? (
          <ul className="space-y-3">
            {tickets.map((ticket) => (
              <li key={ticket.ticketId} className="p-4 bg-white rounded border">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-mono text-gray-500">
                        {ticket.ticketId}
                      </span>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          ticket.status,
                        )}`}
                      >
                        {ticket.status}
                      </span>
                      <span
                        className={`text-xs font-medium ${getPriorityColor(
                          ticket.priority,
                        )}`}
                      >
                        {ticket.priority} priority
                      </span>
                    </div>
                    <div className="text-gray-900 font-medium mb-1">
                      {ticket.description}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      Customer: {ticket.customerMessage}
                    </div>
                    {ticket.customerEmail && (
                      <div className="text-xs text-gray-500">
                        Email: {ticket.customerEmail}
                      </div>
                    )}
                    <div className="text-xs text-gray-500 mt-2">
                      Created: {new Date(ticket.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <Typography variant="md/thin" className="text-center py-8">
            No tickets found.
          </Typography>
        )}
      </div>
    </div>
  );
}
