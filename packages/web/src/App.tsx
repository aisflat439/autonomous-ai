import React from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

function App() {
  const [bedrockInfo, setBedrockInfo] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchApiData = async () => {
      try {
        const response = await fetch(import.meta.env.VITE_BEDROCK_INFO);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setBedrockInfo(data);
      } catch (error) {
        console.error("Error fetching API data:", error);
      }
    }
    fetchApiData();
  }, []);

  return (
    <>
      <div className="bg-blue-500">
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <h2>{import.meta.env.VITE_AUTH_URL}</h2>
      <div className="card">
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
        {bedrockInfo && <pre>{JSON.stringify(bedrockInfo, null, 2)}</pre>}
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
