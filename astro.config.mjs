// @ts-check
import { defineConfig, fontProviders } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: "https://taipinc.github.io",
  base: "/my-tools/",
  integrations: [react()],
  fonts: [
    {
      provider: fontProviders.google(),
      name: "Akt",
      cssVariable: "--font-open-sans",
      weights: [400, 500, 600, 700],
      styles: ["normal", "italic"],
    },
  ],
  vite: {
    plugins: [tailwindcss()],
    server: { port: 4327, strictPort: true },
  },
});
