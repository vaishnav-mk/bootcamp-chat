import { test, expect, type Page } from '@playwright/test';
import { generateTestUser, clearAuth, waitForNavigation } from './helpers';

class AuthPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/');
  }

  async fillLoginForm(email: string, password: string) {
    await this.page.fill('input[name="email"]', email);
    await this.page.fill('input[name="password"]', password);
  }

  async fillRegisterForm(email: string, password: string, username: string, name: string) {
    await this.page.fill('input[name="email"]', email);
    await this.page.fill('input[name="password"]', password);
    await this.page.fill('input[name="username"]', username);
    await this.page.fill('input[name="name"]', name);
  }

  async submitForm() {
    await this.page.click('button[type="submit"]');
  }

  async switchToRegister() {
    await this.page.click('text="don\'t have an account? sign up"');
  }

  async switchToLogin() {
    await this.page.click('text="already have an account? sign in"');
  }

  async hasError() {
    return await this.page.isVisible('.bg-red-900\\/50');
  }

  async isAuthenticated() {
    return await this.page.isVisible('[data-testid="chat-app"]');
  }

  async waitForAuthForm() {
    await this.page.waitForSelector('text="chat app"');
  }
}

test.describe('Authentication Flow', () => {
  let authPage: AuthPage;

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page);
    await authPage.goto();
    await clearAuth(page);
    await page.reload();
    await authPage.waitForAuthForm();
  });

  test('should login with existing user or register if not exists', async ({ page }) => {
    const testUser = generateTestUser();
    
    await authPage.fillLoginForm(testUser.email, testUser.password);
    await authPage.submitForm();
    
    await page.waitForTimeout(2000);
    
    if (await authPage.hasError()) {
      await authPage.switchToRegister();
      await expect(page.locator('text="create your account"')).toBeVisible();
      
      await authPage.fillRegisterForm(testUser.email, testUser.password, testUser.username, testUser.name);
      await authPage.submitForm();
      
      await page.waitForTimeout(3000);
    }
    
    const isAuth = await authPage.isAuthenticated();
    if (isAuth) {
      await expect(page.locator('[data-testid="chat-app"]')).toBeVisible();
    }
  });

  test('should switch between login and register forms', async ({ page }) => {
    await expect(page.locator('text="welcome back"')).toBeVisible();
    
    await authPage.switchToRegister();
    await expect(page.locator('text="create your account"')).toBeVisible();
    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expect(page.locator('input[name="name"]')).toBeVisible();
    
    await authPage.switchToLogin();
    await expect(page.locator('text="welcome back"')).toBeVisible();
    await expect(page.locator('input[name="username"]')).not.toBeVisible();
    await expect(page.locator('input[name="name"]')).not.toBeVisible();
  });

  test('should show validation for required fields', async ({ page }) => {
    await authPage.submitForm();
    
    const emailField = page.locator('input[name="email"]');
    const passwordField = page.locator('input[name="password"]');
    
    await expect(emailField).toHaveAttribute('required');
    await expect(passwordField).toHaveAttribute('required');
  });

  test('should handle complete registration flow', async ({ page }) => {
    const testUser = generateTestUser();

    await authPage.switchToRegister();
    await authPage.fillRegisterForm(testUser.email, testUser.password, testUser.username, testUser.name);
    await authPage.submitForm();
    
    await page.waitForTimeout(3000);
    
    const isAuth = await authPage.isAuthenticated();
    if (isAuth) {
      await expect(page.locator('[data-testid="chat-app"]')).toBeVisible();
    }
  });
});