import { defineConfig, devices } from '@playwright/test';

// Testy przeglądarkowe uruchamiają zbudowaną wersję (dist/) na własnym serwerze Node.js.
export default defineConfig({
  testDir: 'test/e2e',
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://127.0.0.1:4174',
    trace: 'retain-on-failure'
  },
  webServer: {
    command: 'npm run build && node scripts/serve.mjs dist 4174',
    url: 'http://127.0.0.1:4174',
    reuseExistingServer: !process.env.CI
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } }
  ]
});
