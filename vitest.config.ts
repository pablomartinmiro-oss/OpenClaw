import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./__tests__/setup.ts"],
    include: ["__tests__/**/*.test.ts"],
    env: {
      NEXTAUTH_URL: "http://localhost:3000",
      NEXTAUTH_SECRET: "test-secret-that-is-at-least-32-characters-long",
      DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/ghl_dashboard_test",
      REDIS_URL: "redis://localhost:6379",
      GHL_CLIENT_ID: "test-client-id",
      GHL_CLIENT_SECRET: "test-client-secret",
      GHL_REDIRECT_URI: "http://localhost:3000/api/ghl/oauth/callback",
      ENCRYPTION_KEY: "a".repeat(64),
      ENABLE_MOCK_GHL: "true",
      NODE_ENV: "test",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
