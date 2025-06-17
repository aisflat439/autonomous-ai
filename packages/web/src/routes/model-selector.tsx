import { useState, useMemo } from "react";

interface BedrockModel {
  name: string;
  modelId: string;
  description: string;
  inputModalities?: string[];
  outputModalities?: string[];
}

export const Route = createFileRoute({
  component: ModelSelector,
  loader: async () => {
    try {
      const response = await fetch(import.meta.env.VITE_BEDROCK_INFO);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = (await response.json()) as BedrockModel[];
      return { bedrockInfo: data };
    } catch (error) {
      console.error("Error fetching API data:", error);
      return { bedrockInfo: null };
    }
  },
});

function ModelSelector() {
  const { bedrockInfo } = Route.useLoaderData();
  const [activeInputModalities, setActiveInputModalities] = useState<string[]>(
    []
  );
  const [activeOutputModalities, setActiveOutputModalities] = useState<
    string[]
  >([]);

  // Extract all unique modalities from models
  const allInputModalities = useMemo(() => {
    if (!Array.isArray(bedrockInfo)) return [];
    const modalities = new Set<string>();
    bedrockInfo.forEach((model) => {
      model.inputModalities?.forEach((modality) => modalities.add(modality));
    });
    return Array.from(modalities).sort();
  }, [bedrockInfo]);

  const allOutputModalities = useMemo(() => {
    if (!Array.isArray(bedrockInfo)) return [];
    const modalities = new Set<string>();
    bedrockInfo.forEach((model) => {
      model.outputModalities?.forEach((modality) => modalities.add(modality));
    });
    return Array.from(modalities).sort();
  }, [bedrockInfo]);

  // Filter models based on active modalities
  const filteredModels = useMemo(() => {
    if (!Array.isArray(bedrockInfo)) return [];

    return bedrockInfo.filter((model) => {
      // If no filters are active, show all models
      if (
        activeInputModalities.length === 0 &&
        activeOutputModalities.length === 0
      ) {
        return true;
      }

      // Check if model matches input modalities filter
      const matchesInputFilter =
        activeInputModalities.length === 0 ||
        activeInputModalities.some((filter) =>
          model.inputModalities?.includes(filter)
        );

      // Check if model matches output modalities filter
      const matchesOutputFilter =
        activeOutputModalities.length === 0 ||
        activeOutputModalities.some((filter) =>
          model.outputModalities?.includes(filter)
        );

      // Model must match both filters to be shown
      return matchesInputFilter && matchesOutputFilter;
    });
  }, [bedrockInfo, activeInputModalities, activeOutputModalities]);

  const toggleInputModality = (modality: string) => {
    setActiveInputModalities((current) =>
      current.includes(modality)
        ? current.filter((m) => m !== modality)
        : [...current, modality]
    );
  };

  const toggleOutputModality = (modality: string) => {
    setActiveOutputModalities((current) =>
      current.includes(modality)
        ? current.filter((m) => m !== modality)
        : [...current, modality]
    );
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">About</h1>

      {bedrockInfo ? (
        <div>
          <h2 className="text-lg font-semibold mb-3">Bedrock Models</h2>
          <p>
            This is a quick list of AWS models using the AWS bedrock client to
            ask what's available.
          </p>

          {/* Filters */}
          <div className="mb-6">
            <div className="mb-4">
              <h3 className="text-md font-medium mb-2">Input Modalities:</h3>
              <div className="flex flex-wrap gap-2">
                {allInputModalities.map((modality) => (
                  <button
                    key={`input-${modality}`}
                    onClick={() => toggleInputModality(modality)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      activeInputModalities.includes(modality)
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {modality}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <h3 className="text-md font-medium mb-2">Output Modalities:</h3>
              <div className="flex flex-wrap gap-2">
                {allOutputModalities.map((modality) => (
                  <button
                    key={`output-${modality}`}
                    onClick={() => toggleOutputModality(modality)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      activeOutputModalities.includes(modality)
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {modality}
                  </button>
                ))}
              </div>
            </div>

            {(activeInputModalities.length > 0 ||
              activeOutputModalities.length > 0) && (
              <button
                onClick={() => {
                  setActiveInputModalities([]);
                  setActiveOutputModalities([]);
                }}
                className="text-sm text-blue-600 hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredModels.map((model: BedrockModel, index: number) => (
              <div
                key={model.modelId || index}
                className="bg-white rounded-lg shadow-md p-4 border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <h3 className="text-xl font-semibold text-blue-700 mb-2">
                  {model.name}
                </h3>
                <div className="mb-2 text-sm text-gray-500">
                  <code className="bg-gray-100 px-1 py-0.5 rounded">
                    {model.modelId}
                  </code>
                </div>
                <p className="text-gray-700">{model.description}</p>

                {/* Display input/output modalities as tags */}
                {model.inputModalities && model.inputModalities.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-1">Input:</p>
                    <div className="flex flex-wrap gap-1">
                      {model.inputModalities.map((modality) => (
                        <span
                          key={`${model.modelId}-input-${modality}`}
                          className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded"
                        >
                          {modality}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {model.outputModalities &&
                  model.outputModalities.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 mb-1">Output:</p>
                      <div className="flex flex-wrap gap-1">
                        {model.outputModalities.map((modality) => (
                          <span
                            key={`${model.modelId}-output-${modality}`}
                            className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded"
                          >
                            {modality}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-gray-500">Unable to load Bedrock information.</div>
      )}
    </div>
  );
}
