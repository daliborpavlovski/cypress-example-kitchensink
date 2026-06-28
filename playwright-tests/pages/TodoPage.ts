import { type Page, type Locator } from '@playwright/test'
import { allure } from 'allure-playwright'

export class TodoPage {
  readonly page: Page

  readonly newTodoInput: Locator
  readonly todoList: Locator
  readonly toggleAll: Locator
  readonly todoCount: Locator
  readonly clearCompletedBtn: Locator
  readonly mainSection: Locator
  readonly footer: Locator
  readonly filterAll: Locator
  readonly filterActive: Locator
  readonly filterCompleted: Locator

  constructor(page: Page) {
    this.page = page

    this.newTodoInput      = page.locator('[data-test="new-todo"]')
    this.todoList          = page.locator('.todo-list')
    this.toggleAll         = page.locator('#toggle-all')
    this.todoCount         = page.locator('.todo-count')
    this.clearCompletedBtn = page.locator('.clear-completed')
    this.mainSection       = page.locator('.main')
    this.footer            = page.locator('.footer')
    this.filterAll         = page.locator('.filters a[href="#/"]')
    this.filterActive      = page.locator('.filters a[href="#/active"]')
    this.filterCompleted   = page.locator('.filters a[href="#/completed"]')
  }

  // Navigation

  /**
   * Navigate to /todo and remove any pre-existing todos.
   * app.js seeds 2 todos whenever localStorage is empty (app.js:33), so we
   * delete whatever is on screen rather than relying on a clean storage state.
   */
  async goto(): Promise<void> {
    await allure.step('Open the Todo application', async () => {
      await this.page.goto('/todo')
      await this.newTodoInput.waitFor({ state: 'visible' })
      await this.deleteAllTodos()
    })
  }

  /**
   * Navigate to /todo with cleared localStorage so the app seeds its 2 default
   * todos. Use this only in tests that verify the first-visit experience.
   */
  async gotoFreshStorage(): Promise<void> {
    await allure.step('Open the Todo application with fresh storage', async () => {
      await this.page.evaluate(() => localStorage.clear())
      await this.page.goto('/todo')
      await this.newTodoInput.waitFor({ state: 'visible' })
    })
  }

  // Todo management

  /**
   * Add a todo by blurring the input field (Tab key).
   *
   * The app binds to the `change` event on the new-todo input (view.js:189).
   * `change` fires on blur, not on Enter — pressing Tab is the only reliable
   * way to submit a new todo in the current implementation.
   */
  async addTodo(title: string): Promise<void> {
    await allure.step(`Add todo: "${title}"`, async () => {
      await this.newTodoInput.fill(title)
      await this.newTodoInput.press('Tab')
    })
  }

  /** Delete the todo at the given 0-based index. */
  async deleteTodoAt(index: number): Promise<void> {
    await allure.step(`Delete todo at index ${index}`, async () => {
      const item = this.todoList.locator('li').nth(index)
      await item.hover()
      await item.locator('.destroy').click()
    })
  }

  /**
   * Delete all visible todos.
   * Called by goto() to clear seeded items so tests start from a known empty state.
   */
  async deleteAllTodos(): Promise<void> {
    const items = this.todoList.locator('li')
    let count = await items.count()
    while (count > 0) {
      const item = items.first()
      await item.hover()
      await item.locator('.destroy').click()
      count = await items.count()
    }
  }

  // Getters

  /** All visible todo <li> elements. */
  getTodoItems(): Locator {
    return this.todoList.locator('li')
  }

  /** Raw text of the item counter, e.g. "3 items left". */
  async getCounterText(): Promise<string> {
    return (await this.todoCount.textContent()) ?? ''
  }
}
