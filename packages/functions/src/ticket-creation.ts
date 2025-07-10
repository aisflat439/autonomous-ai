import { createTicket } from "@autonomous-ai/core/tickets";

export const handler = async (event: any) => {
  console.log("Ticket tool called with:", JSON.stringify(event, null, 2));

  const { actionGroup, apiPath, httpMethod, parameters } = event;

  try {
    // Extract parameters from the agent's request
    const customerMessage =
      parameters?.find((p: any) => p.name === "customerMessage")?.value || "";
    const ticketDescription =
      parameters?.find((p: any) => p.name === "description")?.value || "";
    const status =
      parameters?.find((p: any) => p.name === "status")?.value || "open";

    // Create ticket in database
    const ticketId = `ticket-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

    const ticket = await createTicket({
      ticketId,
      customerMessage,
      description: ticketDescription,
      status: status as "open" | "complete",
      priority: "medium",
    });

    console.log("Ticket created:", ticket);

    return {
      response: {
        actionGroup,
        apiPath,
        httpMethod,
        httpStatusCode: 200,
        responseBody: {
          "application/json": {
            body: JSON.stringify({
              success: true,
              ticketId: ticket.data.ticketId,
              status: ticket.data.status,
              message: `Ticket ${ticket.data.ticketId} created successfully`,
            }),
          },
        },
      },
    };
  } catch (error) {
    console.error("Error creating ticket:", error);
    return {
      response: {
        actionGroup,
        apiPath,
        httpMethod,
        httpStatusCode: 500,
        responseBody: {
          "application/json": {
            body: JSON.stringify({
              success: false,
              error: "Failed to create ticket",
            }),
          },
        },
      },
    };
  }
};
