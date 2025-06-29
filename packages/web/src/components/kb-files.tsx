import type { File } from "../types";
import { Button } from "./ui/button";
import { Typography } from "./ui/typography";

export const KbFiles = ({
  files,
  onDelete,
}: {
  files: File[];
  onDelete: (fileName: string) => void;
}) => {
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="w-full md:w-1/2 mb-6 md:mb-0">
      <Typography variant="xl/normal">Existing Files:</Typography>
      <div className="border rounded-lg p-4 h-full bg-gray-50">
        {files && files.length > 0 ? (
          <ul className="space-y-2 max-h-80 overflow-y-auto">
            {files.map((file) => (
              <li
                key={file.name}
                className="flex items-center justify-between p-2 bg-white rounded border"
              >
                <div className="flex-1">
                  <div className="text-gray-900 font-medium">{file.name}</div>
                  <div className="text-sm text-gray-500">
                    Last Modified: {formatTime(file.lastModified)}
                  </div>
                </div>
                <Button
                  variant="destructive"
                  onClick={() => onDelete(file.name)}
                >
                  Delete
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <Typography variant="md/thin">
            No files found in the knowledge base.
          </Typography>
        )}
      </div>
    </div>
  );
};
