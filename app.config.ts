import { defineConfig } from "@solidjs/start/config";

export default defineConfig({
  ssr: false, 
  appRoot: "./src",
  vite: {
    server: false
  },
  server: {
    baseURL: process.env.BASE_PATH,
    preset: "static",
    prerender: {
      routes: ["/"]
    }
  }
});
