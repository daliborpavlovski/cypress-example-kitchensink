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

  /** Type a title into the new-todo input and press Enter to add it. */
  async addTodo(title: string): Promise<void> {
    await allure.step(`Add todo: "${title}"`, async () => {
      await this.newTodoInput.fill(title)
      await this.newTodoInput.press('Enter')
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

  /** Delete the first todo whose label matches the given title. */
  async deleteTodoByTitle(title: string): Promise<void> {
    await allure.step(`Delete todo: "${title}"`, async () => {
      const item = this.todoList.locator('li').filter({ hasText: title })
      await item.hover()
      await item.locator('.destroy').click()
    })
  }

  // Completing todos

  /** Toggle the completion checkbox of the todo at the given 0-based index. */
  async toggleTodoAt(index: number): Promise<void> {
    await allure.step(`Toggle todo at index ${index}`, async () => {
      await this.todoList.locator('li .toggle').nth(index).click()
    })
  }

  /** Click the toggle-all checkbox to mark all todos complete or active at once. */
  async clickToggleAll(): Promise<void> {
    await allure.step('Click toggle-all', async () => {
      // The #toggle-all input is hidden (opacity:0); users click its label
      await this.page.locator('label[for="toggle-all"]').click()
    })
  }

  // Editing

  /** Double-click a todo label to enter edit mode. */
  async startEditTodo(index: number): Promise<void> {
    await allure.step(`Enter edit mode for todo at index ${index}`, async () => {
      await this.todoList.locator('li label').nth(index).dblclick()
    })
  }

  /** The edit input of the currently-editing todo. */
  getEditInput(): Locator {
    return this.todoList.locator('li.editing .edit')
  }

  /** Replace the current edit input value with newTitle and press Enter to save. */
  async saveEditWithEnter(newTitle: string): Promise<void> {
    await allure.step(`Save edit with Enter: "${newTitle}"`, async () => {
      await this.getEditInput().fill(newTitle)
      await this.getEditInput().press('Enter')
    })
  }

  /**
   * Replace the current edit input value with newTitle and click outside to save.
   * Clicking the page header moves focus away, triggering the blur/save handler.
   */
  async saveEditWithBlur(newTitle: string): Promise<void> {
    await allure.step(`Save edit with blur: "${newTitle}"`, async () => {
      await this.getEditInput().fill(newTitle)
      await this.page.locator('.header h1').click()
    })
  }

  /** Press Escape in the edit input to cancel editing without saving. */
  async cancelEdit(): Promise<void> {
    await allure.step('Cancel edit with Escape', async () => {
      await this.getEditInput().press('Escape')
    })
  }

  // Filtering

  async clickFilterActive(): Promise<void> {
    await allure.step('Click the Active filter', async () => {
      await this.filterActive.click()
    })
  }

  async clickFilterCompleted(): Promise<void> {
    await allure.step('Click the Completed filter', async () => {
      await this.filterCompleted.click()
    })
  }

  async clickFilterAll(): Promise<void> {
    await allure.step('Click the All filter', async () => {
      await this.filterAll.click()
    })
  }

  // Clear completed

  async clickClearCompleted(): Promise<void> {
    await allure.step('Click Clear completed', async () => {
      await this.clearCompletedBtn.click()
    })
  }

  // Persistence

  /** Reload the page and wait for the app to be ready. */
  async reloadPage(): Promise<void> {
    await allure.step('Reload the page', async () => {
      await this.page.reload()
      await this.newTodoInput.waitFor({ state: 'visible' })
    })
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
