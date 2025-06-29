import type { File } from "../types";

export const KbFiles = ({ files }: { files: File[] }) => {
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDelete = (fileName: string) => {
    fetch(import.meta.env.VITE_API_URL + "delete-file", {
      method: "put",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fileName }),
    });
  };

  return (
    <div className="w-full md:w-1/2 mb-6 md:mb-0">
      <h2 className="text-lg font-semibold mb-2">Existing Files:</h2>
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
                <button
                  onClick={() => handleDelete(file.name)}
                  className="ml-3 px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No files found in the knowledge base.</p>
        )}
      </div>
    </div>
  );
};
