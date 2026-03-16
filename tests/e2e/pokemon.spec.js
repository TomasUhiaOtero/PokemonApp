import { test, expect } from '@playwright/test'

test.describe('Pokemon App E2E', () => {
  test('should load and have correct title', async ({ page }) => {
    await page.goto('http://localhost:5173')
    await page.waitForLoadState('load')
    await page.waitForTimeout(5000)
    
    const title = await page.title()
    expect(title).toContain('Pokedex')
  })

  test('should load without critical errors', async ({ page }) => {
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    
    await page.goto('http://localhost:5173')
    await page.waitForLoadState('load')
    await page.waitForTimeout(5000)
    
    const criticalErrors = errors.filter(e => !e.includes('Console Ninja'))
    expect(criticalErrors.length).toBe(0)
  })

  test('should load complete HTML with React root', async ({ page }) => {
    await page.goto('http://localhost:5173')
    await page.waitForLoadState('load')
    await page.waitForTimeout(5000)
    
    const rootElement = await page.locator('#root').count()
    expect(rootElement).toBeGreaterThan(0)
  })
})
