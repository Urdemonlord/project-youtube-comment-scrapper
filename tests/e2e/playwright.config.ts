import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  testDir: __dirname,
  use: {
    headless: true
  }
};

export default config;
