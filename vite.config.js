import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/CleanEst_Pro_Business_PWA/", // 👈 nome exato do repositório
});
