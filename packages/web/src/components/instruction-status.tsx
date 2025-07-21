interface InstructionStatusProps {
  customInstruction?: {
    version: number;
    updatedBy: string;
    updatedAt: string;
  } | null;
}

export function InstructionStatus({
  customInstruction,
}: InstructionStatusProps) {
  if (!customInstruction) {
    return (
      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
        Default
      </span>
    );
  }

  return (
    <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded font-medium">
      v{customInstruction.version}
    </span>
  );
}
