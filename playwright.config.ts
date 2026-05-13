import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  use: {
    baseURL: "http://127.0.0.1:3001",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run dev -- --port 3001",
    url: "http://127.0.0.1:3001",
    timeout: 30_000,
    reuseExistingServer: !process.env.CI,
    env: {
      ALLOWED_DEV_ORIGINS: "http://127.0.0.1:3001,http://localhost:3001",
      OPENAI_API_KEY: "sk-playwright-placeholder",
      GITHUB_USERNAME: "takagibit18",
    },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
