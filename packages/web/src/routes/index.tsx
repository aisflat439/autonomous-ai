import React from "react";
import { KbFiles } from "../components/kb-files";
import type { File } from "../types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Typography } from "@/components/ui/typography";

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
      <Typography variant="4xl/normal" color="secondary" as="h1">
        Add to knowledge base
      </Typography>
      <Button onClick={handleCallKbRequestEndpoint}>
        Call KB Request Endpoint
      </Button>

      <div className="flex flex-col md:flex-row md:space-x-6">
        {/* Left side - File list */}
        <KbFiles files={files} />

        {/* Right side - Upload form */}
        <div className="w-full md:w-1/2">
          <h2 className="text-lg font-semibold mb-2">Upload New File</h2>
          <div className="border rounded-lg p-4">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-2">
                  Select file to upload:
                </Label>
                <Input
                  name="file"
                  type="file"
                  accept="image/png, image/jpeg, application/pdf, text/plain, text/markdown"
                  required
                />
              </div>

              <Button variant="secondary" type="submit">
                Upload to KB
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
