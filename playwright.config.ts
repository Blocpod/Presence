import { defineConfig } from "@playwright/test";

const baseURL = process.env.PRESENCE_TEST_URL || "http://127.0.0.1:3000";

export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.ts",
  fullyParallel: false,
  workers: 1,
  timeout: 45000,
  expect: { timeout: 10000 },
  retries: 0,
  outputDir: "output/playwright/test-results",
  reporter: [
    ["list"],
    ["html", { outputFolder: "output/playwright/report", open: "never" }],
  ],
  use: {
    baseURL,
    channel: process.env.PRESENCE_BROWSER_CHANNEL || undefined,
    headless: true,
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  webServer: {
    command: `npm run start -- --port ${new URL(baseURL).port || "3000"}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    env: { PRESENCE_ENABLE_LOCAL_DEMO: "true", PRESENCE_PROVIDER: "demo" },
  },
});
