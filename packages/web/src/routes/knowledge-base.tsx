import React from "react";
import { useNavigate } from "@tanstack/react-router";
import { KbFiles } from "@/components/kb-files";
import type { File } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Typography } from "@/components/ui/typography";

export const Route = createFileRoute({
  component: KnowledgeBase,
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

function KnowledgeBase() {
  const { files } = Route.useLoaderData();
  const navigate = useNavigate();

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
        navigate({ to: "/" });
      } else {
        console.error("Upload failed:", response.statusText);
        alert("Upload failed. Please try again.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload error. Please try again.");
    }
  };

  const handleDelete = async (fileName: string) => {
    try {
      const response = await fetch(
        import.meta.env.VITE_API_URL +
          "kb-files/" +
          encodeURIComponent(fileName),
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        alert("File deleted successfully!");
        navigate({ to: "/" });
      } else {
        console.error("Delete failed:", response.statusText);
        alert("Delete failed. Please try again.");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Delete error. Please try again.");
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
        Knowledge Base
      </Typography>

      <div className="flex flex-col md:flex-row md:space-x-6">
        {/* Left side - File list */}
        <KbFiles files={files} onDelete={handleDelete} />

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
