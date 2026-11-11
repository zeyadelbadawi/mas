import { defineConfig, devices } from "@playwright/test";

// Smoke tests against production builds of the three apps (run `pnpm build` first).
const apps = [
  { name: "mas", port: 3000 },
  { name: "covy", port: 3001 },
  { name: "aroma", port: 3002 },
] as const;

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  use: { trace: "retain-on-failure" },
  projects: apps.flatMap(({ name, port }) => [
    {
      name: `${name}-desktop`,
      use: { ...devices["Desktop Chrome"], baseURL: `http://localhost:${port}` },
      metadata: { app: name },
    },
    {
      name: `${name}-mobile`,
      use: { ...devices["Pixel 7"], baseURL: `http://localhost:${port}` },
      metadata: { app: name },
    },
  ]),
  webServer: apps.map(({ name, port }) => ({
    command: `pnpm --filter @mas/app-${name} exec next start -p ${port}`,
    url: `http://localhost:${port}/robots.txt`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  })),
});
