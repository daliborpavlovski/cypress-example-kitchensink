import { test, expect } from '../fixtures'
import { allure } from 'allure-playwright'

test.describe('HTTP server', () => {
  test('serves the todo page with HTTP 200', async ({ request }) => {
    allure.label('feature', 'HTTP server')
    const res = await request.get('/todo')
    expect(res.status()).toBe(200)
  })

  test('serves the app JavaScript with the correct content-type', async ({ request }) => {
    allure.label('feature', 'HTTP server')
    const res = await request.get('/assets/js/todo/app.js')
    expect(res.status()).toBe(200)
    expect(res.headers()['content-type']).toContain('javascript')
  })

  test('loads all page resources without failures', async ({ page }) => {
    allure.label('feature', 'HTTP server')
    const failedRequests: string[] = []
    page.on('requestfailed', req => failedRequests.push(req.url()))
    await page.goto('/todo')
    await page.waitForLoadState('networkidle')
    expect(failedRequests, 'All page resources should load without errors').toHaveLength(0)
  })
})
