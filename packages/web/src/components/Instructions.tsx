import { useState } from "react";
import { InstructionStatus } from "./instruction-status";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import type { Agent, AgentInstruction } from "@/types/agent";
import { Typography } from "./ui/typography";

export const Instructions = ({
  customInstruction,
  agent,
}: {
  customInstruction: AgentInstruction | null;
  agent: Agent;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [instructionText, setInstructionText] = useState(
    customInstruction?.instruction || ""
  );
  const [isSaving, setIsSaving] = useState(false);
  const [changeNote, setChangeNote] = useState("");

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}agents/${agent.agentId}/instructions`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            instruction: instructionText,
            changeNote: changeNote || undefined,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update instruction");
      }

      // Reload the page to get the updated instruction
      window.location.reload();
    } catch (error) {
      console.error("Error updating instruction:", error);
      alert("Failed to update instruction. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setInstructionText(
      customInstruction?.instruction || agent.instruction || ""
    );
    setChangeNote("");
  };

  return (
    <section className="border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Instruction</h2>
        <InstructionStatus customInstruction={customInstruction} />
      </div>

      <div className="flex items-center gap-2">
        {!isEditing ? (
          <Button
            onClick={() => setIsEditing(true)}
            variant="outline"
            size="sm"
          >
            Edit
          </Button>
        ) : (
          <div className="mb-4 gap-2 flex flex-row">
            <Button
              onClick={handleSave}
              disabled={isSaving || instructionText.trim() === ""}
            >
              {isSaving ? "Saving..." : "Save"}
            </Button>
            <Button
              onClick={handleCancel}
              variant="outline"
              disabled={isSaving}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
      {isEditing ? (
        <div className="space-y-4">
          <div>
            <Label htmlFor="instruction">Instruction</Label>
            <Typography color="muted" as="pre">
              {agent.instruction}
            </Typography>
            <Textarea
              id="instruction"
              value={instructionText}
              onChange={(e) => setInstructionText(e.target.value)}
              className="mt-1 min-h-[200px] font-mono text-sm"
              placeholder="Enter agent instruction..."
            />
          </div>

          <div>
            <Label htmlFor="changeNote">Change Note (optional)</Label>
            <Textarea
              id="changeNote"
              value={changeNote}
              onChange={(e) => setChangeNote(e.target.value)}
              className="mt-1 min-h-[60px]"
              placeholder="Describe what changed..."
            />
          </div>
        </div>
      ) : (
        <>
          <pre className="text-sm whitespace-pre-wrap font-mono bg-gray-200 p-4 rounded">
            {agent.instruction}
          </pre>
          <pre className="text-sm whitespace-pre-wrap font-mono bg-gray-50 p-4 rounded">
            {customInstruction?.instruction || "No instruction set"}
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
        </>
      )}
    </section>
  );
};
