import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test('should load the homepage and redirect to login', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveTitle(/Vite \+ React \+ TS/)
    // Should redirect to login for unauthenticated users
    await expect(page).toHaveURL(/\/login/)
  })

  test('should be responsive on mobile devices', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    // Wait for login form to load
    await expect(page.locator('form')).toBeVisible()
    await expect(page.locator('input[type="email"]')).toBeVisible()
  })

  test('should handle 404 routes gracefully', async ({ page }) => {
    await page.goto('/non-existent-route')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
    // Should redirect to login since user is not authenticated
    await expect(page).toHaveURL(/\/login/)
  })
})