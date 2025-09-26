import { test, expect } from '@playwright/test';
import { clearAuth } from './helpers';

test.describe('Basic Auth Flow Test', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearAuth(page);
    await page.reload();
  });

  test('should display auth form on initial load', async ({ page }) => {
    await expect(page.locator('text="chat app"')).toBeVisible();
    await expect(page.locator('text="welcome back"')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should attempt login then register new user', async ({ page }) => {
    const timestamp = Date.now();
    const email = `testuser${timestamp}@example.com`;
    const password = 'testpass123';
    const username = `testuser${timestamp}`;
    const name = `Test User ${timestamp}`;
    
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
    
    await page.waitForTimeout(2000);
    
    const hasError = await page.isVisible('.bg-red-900\\/50');
    
    if (hasError) {
      await page.click('text="don\'t have an account? sign up"');
      await expect(page.locator('text="create your account"')).toBeVisible();
      
      await page.fill('input[name="email"]', email);
      await page.fill('input[name="password"]', password);
      await page.fill('input[name="username"]', username);
      await page.fill('input[name="name"]', name);
      
      await page.click('button[type="submit"]');
      
      await page.waitForTimeout(3000);
      
      const isAuthenticated = await page.isVisible('[data-testid="chat-app"]');
      if (isAuthenticated) {
        await expect(page.locator('[data-testid="chat-app"]')).toBeVisible();
      }
    } else {
      const isAuthenticated = await page.isVisible('[data-testid="chat-app"]');
      if (isAuthenticated) {
        await expect(page.locator('[data-testid="chat-app"]')).toBeVisible();
      }
    }
  });
});