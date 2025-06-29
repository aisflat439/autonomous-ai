import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Typography } from "@/components/ui/typography";
import React from "react";

export const Route = createFileRoute({
  component: RouteComponent,
});

function RouteComponent() {
  const [status, setStatus] = React.useState<"loading" | "error" | "idle">(
    "idle"
  );
  const [requestString, setRequestString] = React.useState<string>("");
  const [responses, setResponses] = React.useState<string[]>([]);

  const handleCallKbRequestEndpoint = async () => {
    setStatus("loading");

    try {
      const result = await fetch(import.meta.env.VITE_API_URL + "kb-request", {
        method: "put",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: requestString }),
      });

      const data = await result.json();
      setResponses([data.message, ...responses]);
      console.log("data.message: ", data.message);
      setStatus("idle");
    } catch (error) {
      console.error("Error fetching KB request:", error);
      setStatus("error");
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Typography
        variant="4xl/normal"
        color="secondary"
        as="h1"
        className="mb-6"
      >
        Autonomous AI
      </Typography>

      <div className="mb-6">
        <Label htmlFor="kb-request" className="mb-2">
          Knowledge Base Request
        </Label>
        <Input
          name="kb-request"
          value={requestString}
          onChange={(e) => setRequestString(e.target.value)}
        />
      </div>
      <Button
        onClick={handleCallKbRequestEndpoint}
        disabled={status === "loading" || !requestString}
        className="w-auto"
      >
        {status === "loading" ? (
          <div className="flex items-center">
            <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Loading...
          </div>
        ) : (
          "Call KB Request Endpoint"
        )}
      </Button>
      <div className="mb-6">
        <Typography
          variant="2xl/normal"
          color="secondary"
          as="h2"
          className="mb-4"
        >
          Responses
        </Typography>
        {responses.length > 0 ? (
          <ul>
            {responses.map((response, index) => (
              <li key={index} className="mb-2">
                {response}
              </li>
            ))}
          </ul>
        ) : (
          <p>No responses yet.</p>
        )}
      </div>
    </div>
  );
}
