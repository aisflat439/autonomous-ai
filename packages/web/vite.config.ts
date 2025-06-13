import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  // @ts-expect-error - incorrect vite version installed, TODO: fix this
  plugins: [react(), tailwindcss()],
});
