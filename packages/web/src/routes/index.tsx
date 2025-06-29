import React from "react";
import { KbFiles } from "../components/kb-files";
import type { File } from "../types";

export const Route = createFileRoute({
  component: RouteComponent,
  loader: async () => {
    let files: { files: File[] } | null = null;
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

    return { files: files!.files };
  },
});

function RouteComponent() {
  const { files } = Route.useLoaderData();

  const handleCallKbRequestEndpoint = async () => {
    await fetch(import.meta.env.VITE_API_URL + "kb-request", {
      method: "get",
      headers: {
        "Content-Type": "application/json",
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formElement = e.target as HTMLFormElement;
    const fileInput = formElement.elements.namedItem(
      "file"
    ) as HTMLInputElement;
    const file = fileInput.files?.[0];

    if (!file) {
      console.error("No file selected");
      return;
    }

    const uploadRes = await fetch(
      import.meta.env.VITE_API_URL +
        "upload?filename=" +
        encodeURIComponent(file.name),
      {
        method: "get",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const { url } = await uploadRes.json();

    if (!url) {
      console.error("No upload URL unavailable");
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
      <button
        onClick={handleCallKbRequestEndpoint}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Call KB Request Endpoint
      </button>

      <div className="flex flex-col md:flex-row md:space-x-6">
        {/* Left side - File list */}
        <KbFiles files={files} />

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
                  accept="image/png, image/jpeg, application/pdf, text/plain, text/markdown"
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
                className={`w-full py-2 px-4 rounded-md text-white font-medium ${"bg-blue-600 hover:bg-blue-700"}`}
              >
                Upload to KB
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
