import React from "react";

export const Route = createFileRoute({
  component: RouteComponent,
  loader: async () => {
    let files: { files: string[] } | null = null;
    const filesRes = await fetch(import.meta.env.VITE_API_URL + "kb-files", {
      method: "get",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (filesRes.ok) {
      files = await filesRes.json();
    } else {
      console.error("Failed to fetch latest file:", filesRes.statusText);
    }

    const uploadRes = await fetch(import.meta.env.VITE_API_URL + "upload", {
      method: "get",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (uploadRes.ok) {
      const data = await uploadRes.json();
      return { url: data.url, files: files!.files };
    } else {
      console.error("Failed to fetch API data:", uploadRes.statusText);
    }
    return { url: "", files: [] };
  },
});

function RouteComponent() {
  const { url, files } = Route.useLoaderData();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formElement = e.target as HTMLFormElement;
    const fileInput = formElement.elements.namedItem(
      "file"
    ) as HTMLInputElement;
    const file = fileInput.files?.[0];

    if (!file || !url) {
      console.error("No file selected or upload URL unavailable");
      return;
    }

    try {
      const response = await fetch(url, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
          "Content-Disposition": `attachment; filename="${file.name}"`,
        },
      });

      if (response.ok) {
        alert("File uploaded successfully!");
      } else {
        console.error("Upload failed:", response.statusText);
        alert("Upload failed. Please try again.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload error. Please try again.");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
      <h1 className="text-2xl font-bold mb-6 text-blue-700">
        Add to knowledge base
      </h1>

      <div className="flex flex-col md:flex-row md:space-x-6">
        {/* Left side - File list */}
        <div className="w-full md:w-1/2 mb-6 md:mb-0">
          <h2 className="text-lg font-semibold mb-2">Existing Files:</h2>
          <div className="border rounded-lg p-4 h-full bg-gray-50">
            {files && files.length > 0 ? (
              <ul className="list-disc pl-5 space-y-1 max-h-80 overflow-y-auto">
                {files.map((file) => (
                  <li key={file} className="text-gray-700">
                    {file}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">
                No files found in the knowledge base.
              </p>
            )}
          </div>
        </div>

        {/* Right side - Upload form */}
        <div className="w-full md:w-1/2">
          <h2 className="text-lg font-semibold mb-2">Upload New File</h2>
          <div className="border rounded-lg p-4">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select file to upload:
                </label>
                <input
                  name="file"
                  type="file"
                  accept="image/png, image/jpeg, application/pdf, text/plain"
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={!url}
                className={`w-full py-2 px-4 rounded-md text-white font-medium ${
                  !url
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                Upload to KB
              </button>
            </form>

            {!url && (
              <div className="mt-4 p-2 bg-yellow-100 text-yellow-700 rounded text-sm">
                Upload URL not available. Please try refreshing the page.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
