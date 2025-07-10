import { Resource } from "sst";

export const handler = async (event: any) => {
  console.log("Ticket tool called with:", JSON.stringify(event, null, 2));

  const { actionGroup, apiPath, httpMethod, parameters } = event;

  // if (apiPath === "/createTicket") {
  // try {
  //   // Extract parameters from the agent's request
  //   const customerMessage =
  //     parameters?.find((p: any) => p.name === "customerMessage")?.value || "";
  //   const ticketDescription =
  //     parameters?.find((p: any) => p.name === "description")?.value || "";
  //   const status =
  //     parameters?.find((p: any) => p.name === "status")?.value || "open";

  //   // Create ticket in database
  //   const ticket = await NewCustomers.create({
  //     customerId: `ticket-${Date.now()}`,
  //     name: "Support Ticket",
  //     email: "pending@support.com", // You might want to capture this from context
  //     request: customerMessage,
  //     response: ticketDescription,
  //     status: status,
  //   });

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
            ticketId: "ticket.customerId",
            status: "status",
            message: `Ticket created successfully`,
          }),
        },
      },
    },
  };
  // } catch (error) {
  //   console.error("Error creating ticket:", error);
  //   return {
  //     response: {
  //       actionGroup,
  //       apiPath,
  //       httpMethod,
  //       httpStatusCode: 500,
  //       responseBody: {
  //         "application/json": {
  //           body: JSON.stringify({
  //             success: false,
  //             error: "Failed to create ticket",
  //           }),
  //         },
  //       },
  //     },
  //   };
  // }
  // }

  // return {
  //   response: {
  //     actionGroup,
  //     apiPath,
  //     httpMethod,
  //     httpStatusCode: 404,
  //     responseBody: {
  //       "application/json": {
  //         body: JSON.stringify({ error: "Unknown action" }),
  //       },
  //     },
  //   },
  // };
};
