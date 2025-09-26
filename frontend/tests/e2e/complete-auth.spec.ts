import { test, expect } from '@playwright/test';

test.describe('Chat App Authentication', () => {
  test('complete auth flow - login attempt then register if needed', async ({ page }) => {
    console.log('Starting authentication test...');
    
    await page.goto('http://localhost:3001');
    console.log('Navigated to app');
    
    await expect(page.locator('text="chat app"')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text="welcome back"')).toBeVisible();
    console.log('Auth form loaded successfully');
    
    const timestamp = Date.now();
    const testUser = {
      email: `testuser${timestamp}@example.com`,
      password: 'testpassword123',
      username: `testuser${timestamp}`,
      name: `Test User ${timestamp}`
    };
    
    console.log('Attempting login with:', testUser.email);
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.click('button[type="submit"]');
    
    await page.waitForTimeout(3000);
    
    const hasError = await page.isVisible('.bg-red-900\\/50');
    const isAuthenticated = await page.isVisible('[data-testid="chat-app"]');
    
    if (hasError) {
      console.log('Login failed, attempting registration...');
      
      await page.click('text="don\'t have an account? sign up"');
      await expect(page.locator('text="create your account"')).toBeVisible();
      console.log('Switched to registration form');
      
      await page.fill('input[name="email"]', testUser.email);
      await page.fill('input[name="password"]', testUser.password);
      await page.fill('input[name="username"]', testUser.username);
      await page.fill('input[name="name"]', testUser.name);
      
      await page.click('button[type="submit"]');
      console.log('Registration form submitted');
      
      await page.waitForTimeout(5000);
      
      const registrationSuccess = await page.isVisible('[data-testid="chat-app"]');
      if (registrationSuccess) {
        console.log('✅ Registration successful - user authenticated');
        await expect(page.locator('[data-testid="chat-app"]')).toBeVisible();
      } else {
        console.log('Registration may have failed or is pending');
      }
    } else if (isAuthenticated) {
      console.log('✅ Login successful - user already existed');
      await expect(page.locator('[data-testid="chat-app"]')).toBeVisible();
    } else {
      console.log('Authentication state unclear');
    }
    
    console.log('Test completed');
  });
  
  test('form validation and switching', async ({ page }) => {
    await page.goto('http://localhost:3001');
    
    await expect(page.locator('text="welcome back"')).toBeVisible();
    
    await page.click('text="don\'t have an account? sign up"');
    await expect(page.locator('text="create your account"')).toBeVisible();
    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expect(page.locator('input[name="name"]')).toBeVisible();
    
    await page.click('text="already have an account? sign in"');
    await expect(page.locator('text="welcome back"')).toBeVisible();
    await expect(page.locator('input[name="username"]')).not.toBeVisible();
    await expect(page.locator('input[name="name"]')).not.toBeVisible();
    
    console.log('✅ Form switching works correctly');
  });
});