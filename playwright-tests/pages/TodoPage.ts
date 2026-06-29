import { type Page, type Locator } from '@playwright/test'
import { allure } from 'allure-playwright'

export class TodoPage {
  readonly page: Page

  // Public locators — tests assert on these directly via expect()
  readonly newTodoInput: Locator
  readonly toggleAll: Locator
  readonly todoCount: Locator
  readonly clearCompletedBtn: Locator
  readonly mainSection: Locator
  readonly footer: Locator
  readonly filterBar: Locator
  readonly filterAll: Locator
  readonly filterActive: Locator
  readonly filterCompleted: Locator

  // Private — consumed only through the getter methods below
  private readonly todoList: Locator

  constructor(page: Page) {
    this.page = page

    this.newTodoInput      = page.locator('[data-test="new-todo"]')
    this.todoList          = page.locator('.todo-list')
    this.toggleAll         = page.locator('#toggle-all')
    this.todoCount         = page.locator('.todo-count')
    this.clearCompletedBtn = page.locator('.clear-completed')
    this.mainSection       = page.locator('.main')
    this.footer            = page.locator('.footer')
    this.filterBar         = page.locator('.filters')
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
   * Delete all visible todos one by one.
   * Private — called only by goto() to produce a clean empty state.
   */
  private async deleteAllTodos(): Promise<void> {
    const items = this.todoList.locator('li')
    let count = await items.count()
    while (count > 0) {
      const item = items.first()
      await item.hover()
      await item.locator('.destroy').click()
      count = await items.count()
    }
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
      const input = this.getEditInput()
      await input.fill(newTitle)
      await input.press('Enter')
    })
  }

  /**
   * Replace the current edit input value with newTitle and click outside to save.
   * Clicking the page header moves focus away, triggering the blur/save handler.
   */
  async saveEditWithBlur(newTitle: string): Promise<void> {
    await allure.step(`Save edit with blur: "${newTitle}"`, async () => {
      const input = this.getEditInput()
      await input.fill(newTitle)
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

  // Test data helpers

  /** Pre-seed localStorage with two todos sharing the same ID before navigation.
   * Reproduces the duplicate-ID bug from new Date().getTime() returning the same
   * millisecond for both seed items. Must be called before page.goto(). */
  async seedWithDuplicateIds(): Promise<void> {
    await this.page.addInitScript((id: number) => {
      localStorage.setItem('todos-vanillajs', JSON.stringify([
        { id, title: 'Pay electric bill', completed: false },
        { id, title: 'Walk the dog', completed: false },
      ]))
    }, 1_000_000_000_000)
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

  /** All todo <li> elements. */
  getTodoItems(): Locator {
    return this.todoList.locator('li')
  }

  /** All completed todo <li> elements. */
  getCompletedItems(): Locator {
    return this.todoList.locator('li.completed')
  }

  /** The first todo <li> whose visible text matches title. */
  getTodoByTitle(title: string): Locator {
    return this.todoList.locator('li').filter({ hasText: title })
  }

  /** The <label> element of the todo at the given 0-based index. */
  getTodoLabelAt(index: number): Locator {
    return this.todoList.locator('li label').nth(index)
  }
}
