import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('should display login page for unauthenticated users', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('ログイン')
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button:has-text("ログイン")')).toBeVisible()
  })

  test('should show validation errors for empty form', async ({ page }) => {
    await page.click('button:has-text("ログイン")')
    await expect(page.locator('text=メールアドレスを入力してください')).toBeVisible()
    await expect(page.locator('text=パスワードを入力してください')).toBeVisible()
  })

  test('should navigate to register form', async ({ page }) => {
    await page.click('text=新規登録はこちら')
    await expect(page.locator('h1')).toContainText('新規登録')
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[name="password"]')).toBeVisible()
    await expect(page.locator('input[name="confirmPassword"]')).toBeVisible()
    await expect(page.locator('button:has-text("登録")')).toBeVisible()
  })

  test('should validate email format', async ({ page }) => {
    await page.fill('input[type="email"]', 'invalid-email')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button:has-text("ログイン")')
    await expect(page.locator('text=正しいメールアドレスを入力してください')).toBeVisible()
  })

  test('should validate password length', async ({ page }) => {
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', '123')
    await page.click('button:has-text("ログイン")')
    await expect(page.locator('text=パスワードは6文字以上で入力してください')).toBeVisible()
  })
})