import { test, expect } from '@playwright/test'

test.describe('Component Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('should display loading spinner', async ({ page }) => {
    // Check if loading button shows loading state when clicked
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'password123')
    
    // Click login button
    const loginButton = page.locator('button:has-text("ログイン")')
    await loginButton.click()
    
    // Check if button changes to loading state
    await expect(page.locator('button:has-text("ログイン中...")')).toBeVisible({ timeout: 2000 })
  })

  test('should display error messages appropriately', async ({ page }) => {
    // Test UI validation error display
    await page.fill('input[type="email"]', 'invalid-email')
    await page.locator('input[type="email"]').blur()
    
    // Should show email validation error
    await expect(page.locator('text=正しいメールアドレスを入力してください')).toBeVisible({ timeout: 2000 })
  })

  test('should handle form validation', async ({ page }) => {
    // Test email validation
    await page.fill('input[type="email"]', 'invalid')
    await page.locator('input[type="email"]').blur()
    await expect(page.locator('text=正しいメールアドレスを入力してください')).toBeVisible()
    
    // Test password validation
    await page.fill('input[type="password"]', '123')
    await page.locator('input[type="password"]').blur()
    await expect(page.locator('text=パスワードは6文字以上で入力してください')).toBeVisible()
  })
})