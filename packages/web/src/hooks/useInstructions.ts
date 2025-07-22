import { useState } from "react";

export const useInstructions = ({
  instruction = {
    text: "",
    changeNote: "",
  },
  agent,
}: {
  instruction: { text: string; changeNote?: string };
  agent: { agentId: string };
}) => {
  const [instructionData, setInstructionData] = useState(instruction);

  const [status, setStatus] = useState("idle");

  const handleSave = async () => {
    setStatus("loading");
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}agents/${agent.agentId}/instructions`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            instruction: instructionData.text,
            changeNote: instructionData.changeNote || undefined,
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
      setStatus("idle");
    }
  };

  const handleEdit = ({
    text,
    changeNote,
  }: {
    text?: string;
    changeNote?: string;
  }) => {
    setInstructionData((prev) => ({
      ...prev,
      text: text !== undefined ? text : prev.text,
      changeNote: changeNote !== undefined ? changeNote : prev.changeNote,
    }));
  };

  const handleClear = () => {
    setInstructionData({
      text: "",
      changeNote: "",
    });
  };

  return {
    instructionData,
    handleSave,
    handleEdit,
    handleClear,
    status,
  };
};
