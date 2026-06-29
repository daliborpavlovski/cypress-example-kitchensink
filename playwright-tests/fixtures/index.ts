import { test as base, expect } from '@playwright/test'
import { TodoPage } from '../pages/TodoPage'

type Fixtures = {
  todoPage: TodoPage
}

export const test = base.extend<Fixtures>({
  todoPage: async ({ page }, use) => {
    // Intercept console.error before any page scripts run.
    // addInitScript() is the only hook that fires before the app boots;
    // page.evaluate() would be too late (app already running by then).
    await page.addInitScript(() => {
      ;(window as any).__consoleErrors = []
      const orig = console.error.bind(console)
      console.error = (...args: unknown[]) => {
        ;(window as any).__consoleErrors.push(args.join(' '))
        orig(...args)
      }
    })
    const todoPage = new TodoPage(page)
    await todoPage.goto()
    await use(todoPage)
    // Teardown: fail the test if the app threw any unexpected JS errors
    const errors: string[] = await page.evaluate(() => (window as any).__consoleErrors ?? [])
    expect(errors, 'No unexpected console.error calls during test').toHaveLength(0)
  },
})

export { expect } from '@playwright/test'
