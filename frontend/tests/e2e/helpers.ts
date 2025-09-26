import { type Page } from '@playwright/test';

export const TEST_USERS = {
  EXISTING: {
    email: 'test@example.com',
    password: 'password123'
  }
};

export const generateTestUser = () => {
  const timestamp = Date.now();
  return {
    email: `user${timestamp}@example.com`,
    password: 'password123',
    username: `user${timestamp}`,
    name: `Test User ${timestamp}`
  };
};

export const clearAuth = async (page: Page) => {
  await page.context().clearCookies();
  try {
    await page.evaluate(() => localStorage.clear());
  } catch {
    // Ignore localStorage errors on initial load
  }
};

export const waitForNavigation = async (page: Page) => {
  return Promise.race([
    page.waitForSelector('[data-testid="chat-app"]', { timeout: 10000 }),
    page.waitForSelector('.bg-red-900\\/50', { timeout: 5000 }).then(() => 'error')
  ]);
};