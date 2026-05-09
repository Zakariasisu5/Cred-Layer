// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Configuration for deployment
// For Cloudflare: use server entry with @cloudflare/vite-plugin
// For Vercel: use default node adapter
export default defineConfig({
  tanstackStart: {
    // Comment out for Vercel deployment, uncomment for Cloudflare
    // server: { entry: "server" },
  },
});