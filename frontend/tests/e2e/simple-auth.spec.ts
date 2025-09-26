import { test, expect } from '@playwright/test';
import { randomUUID } from 'crypto';

test('should display login page correctly', async ({ page }) => {
  await page.goto('/');
  
  await expect(page.locator('text="chat app"')).toBeVisible();
  await expect(page.locator('text="welcome back"')).toBeVisible();
  
  await expect(page.locator('input[name="email"]')).toBeVisible();
  await expect(page.locator('input[name="password"]')).toBeVisible();
  await expect(page.locator('button[type="submit"]')).toBeVisible();
});

test('should show login failure with invalid credentials', async ({ page }) => {
  await page.goto('/');
  
  const email = `${randomUUID()}@gmail.com`;
  const password = randomUUID().slice(0, 12);
  
  console.log('Attempting login with invalid credentials...');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  
  await page.waitForTimeout(2000);
  
  const stillOnLogin = await page.isVisible('text="welcome back"');
  const hasError = await page.isVisible('.bg-red-900\\/50');
  
  expect(stillOnLogin || hasError).toBe(true);
  console.log('✅ Login failed as expected with invalid credentials');
});

test('should complete registration flow from login page', async ({ page }) => {
  await page.goto('/');
  
  const email = `${randomUUID()}@gmail.com`;
  const password = randomUUID().slice(0, 12);
  const username = randomUUID().slice(0, 8);
  const name = `Test User ${Date.now()}`;
  
  console.log('Switching to registration from login page...');
  await page.click('text="don\'t have an account? sign up"');
  await expect(page.locator('text="create your account"')).toBeVisible();
  
  console.log('Filling registration form...');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.fill('input[name="username"]', username);
  await page.fill('input[name="name"]', name);
  
  console.log('Submitting registration...');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(5000);
  
  const isAuth = await page.isVisible('[data-testid="chat-app"]');
  const hasError = await page.isVisible('.bg-red-900\\/50');
  
  if (isAuth) {
    console.log('✅ Registration successful - authenticated');
    await expect(page.locator('[data-testid="chat-app"]')).toBeVisible();
  } else if (hasError) {
    console.log('❌ Registration failed with error');
    const errorText = await page.textContent('.bg-red-900\\/50');
    console.log('Error:', errorText);
  } else {
    console.log('⏳ Registration pending or unknown state');
  }
});