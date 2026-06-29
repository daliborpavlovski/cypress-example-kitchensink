import { test, expect } from '../fixtures'
import { type Locator } from '@playwright/test'
import { allure } from 'allure-playwright'
import { TodoPage } from '../pages/TodoPage'

// Parameterized data — mirrors Gherkin Scenario Outline tables

const counterCases = [
  { count: 1, expected: '1 item left' },
  { count: 2, expected: '2 items left' },
] as const

type FilterCase = {
  name: string
  setup: (p: TodoPage) => Promise<void>
  click: (p: TodoPage) => Promise<void>
  getTab: (p: TodoPage) => Locator
}

const filterTabCases: FilterCase[] = [
  {
    name: 'Active',
    setup: async (_p) => {},
    click: (p) => p.clickFilterActive(),
    getTab: (p) => p.filterActive,
  },
  {
    name: 'Completed',
    setup: (p) => p.toggleTodoAt(0),
    click: (p) => p.clickFilterCompleted(),
    getTab: (p) => p.filterCompleted,
  },
  {
    name: 'All',
    setup: (p) => p.clickFilterActive(),
    click: (p) => p.clickFilterAll(),
    getTab: (p) => p.filterAll,
  },
]

// Tests

test.describe('Page load', () => {
  // Each test gets its own fresh browser context, so localStorage is empty at the start.
  // This test requests { page } directly — the todoPage fixture is lazy and won't run —
  // so we navigate once and let the app seed its 2 default todos naturally.
  test('shows 2 default todos on first visit', async ({ page }) => {
    allure.label('feature', 'Page Load')
    const todoPage = new TodoPage(page)
    await page.goto('/todo')
    await todoPage.newTodoInput.waitFor({ state: 'visible' })
    await expect(todoPage.getTodoItems()).toHaveCount(2)
    await expect(todoPage.todoCount).toHaveText('2 items left')
  })

  test('selects the "All" filter tab by default', async ({ todoPage }) => {
    allure.label('feature', 'Page Load')
    await todoPage.addTodo('task one')
    await expect(todoPage.filterAll).toHaveClass(/selected/)
  })

  test('shows the footer and main section when todos exist', async ({ todoPage }) => {
    allure.label('feature', 'Page Load')
    await todoPage.addTodo('task one')
    await expect(todoPage.footer).toBeVisible()
    await expect(todoPage.mainSection).toBeVisible()
    await expect(todoPage.filterBar).toBeVisible()
  })

  test('hides the footer and main section when the list is empty', async ({ todoPage }) => {
    allure.label('feature', 'Page Load')
    await expect(todoPage.footer).not.toBeVisible()
    await expect(todoPage.mainSection).not.toBeVisible()
  })

  test('hides the footer after the last todo is deleted', async ({ todoPage }) => {
    allure.label('feature', 'Page Load')
    await todoPage.addTodo('task one')
    await todoPage.deleteTodoAt(0)
    await expect(todoPage.footer).not.toBeVisible()
  })
})

test.describe('Adding todos', () => {
  test('adds a new todo when Enter is pressed', async ({ todoPage }) => {
    allure.label('feature', 'Adding todos')
    await todoPage.addTodo('task one')
    await expect(todoPage.getTodoItems()).toHaveCount(1)
    await expect(todoPage.todoCount).toHaveText('1 item left')
  })

  test('adds multiple todos in sequence', async ({ todoPage }) => {
    allure.label('feature', 'Adding todos')
    await todoPage.addTodo('task one')
    await todoPage.addTodo('task two')
    await todoPage.addTodo('task three')
    await expect(todoPage.getTodoItems()).toHaveCount(3)
    await expect(todoPage.todoCount).toHaveText('3 items left')
  })
})

test.describe('Deleting todos', () => {
  test('deletes a todo using the destroy button', async ({ todoPage }) => {
    allure.label('feature', 'Deleting todos')
    await todoPage.addTodo('task one')
    await todoPage.addTodo('task two')
    await todoPage.deleteTodoAt(0)
    await expect(todoPage.getTodoByTitle('task one')).toHaveCount(0)
    await expect(todoPage.getTodoByTitle('task two')).toBeVisible()
    await expect(todoPage.todoCount).toHaveText('1 item left')
  })
})

test.describe('Completing todos', () => {
  test('marks a todo as complete', async ({ todoPage }) => {
    allure.label('feature', 'Completing todos')
    await todoPage.addTodo('task one')
    await todoPage.toggleTodoAt(0)
    await expect(todoPage.getTodoItems().nth(0)).toHaveClass(/completed/)
    await expect(todoPage.todoCount).toHaveText('0 items left')
  })

  test('unmarks a completed todo', async ({ todoPage }) => {
    allure.label('feature', 'Completing todos')
    await todoPage.addTodo('task one')
    await todoPage.toggleTodoAt(0)
    await todoPage.toggleTodoAt(0)
    await expect(todoPage.getTodoItems().nth(0)).not.toHaveClass(/completed/)
    await expect(todoPage.todoCount).toHaveText('1 item left')
  })

  test('marks all todos as complete using toggle-all', async ({ todoPage }) => {
    allure.label('feature', 'Completing todos')
    await todoPage.addTodo('task one')
    await todoPage.addTodo('task two')
    await todoPage.addTodo('task three')
    await todoPage.clickToggleAll()
    await expect(todoPage.getCompletedItems()).toHaveCount(3)
    await expect(todoPage.todoCount).toHaveText('0 items left')
    await expect(todoPage.toggleAll).toBeChecked()
  })

  test('unmarks all todos using toggle-all', async ({ todoPage }) => {
    allure.label('feature', 'Completing todos')
    await todoPage.addTodo('task one')
    await todoPage.addTodo('task two')
    await todoPage.clickToggleAll()
    await todoPage.clickToggleAll()
    await expect(todoPage.getCompletedItems()).toHaveCount(0)
    await expect(todoPage.toggleAll).not.toBeChecked()
  })

  test('toggle-all becomes checked when all todos are individually completed', async ({ todoPage }) => {
    allure.label('feature', 'Completing todos')
    await todoPage.addTodo('task one')
    await todoPage.addTodo('task two')
    await todoPage.addTodo('task three')
    await todoPage.toggleTodoAt(0)
    await todoPage.toggleTodoAt(1)
    await todoPage.toggleTodoAt(2)
    await expect(todoPage.toggleAll).toBeChecked()
  })
})

test.describe('Editing todos', () => {
  test('enters edit mode when a todo is double-clicked', async ({ todoPage }) => {
    allure.label('feature', 'Editing todos')
    await todoPage.addTodo('task one')
    await todoPage.startEditTodo(0)
    await expect(todoPage.getTodoItems().nth(0)).toHaveClass(/editing/)
    await expect(todoPage.getEditInput()).toHaveValue('task one')
  })

  test('saves an edited todo by pressing Enter', async ({ todoPage }) => {
    allure.label('feature', 'Editing todos')
    await todoPage.addTodo('task one')
    await todoPage.startEditTodo(0)
    await todoPage.saveEditWithEnter('updated task')
    await expect(todoPage.getTodoLabelAt(0)).toHaveText('updated task')
    await expect(todoPage.getTodoItems().nth(0)).not.toHaveClass(/editing/)
  })

  test('saves an edited todo by clicking outside', async ({ todoPage }) => {
    allure.label('feature', 'Editing todos')
    await todoPage.addTodo('task one')
    await todoPage.startEditTodo(0)
    await todoPage.saveEditWithBlur('updated task')
    await expect(todoPage.getTodoLabelAt(0)).toHaveText('updated task')
  })

  test('cancels an edit when Escape is pressed', async ({ todoPage }) => {
    allure.label('feature', 'Editing todos')
    await todoPage.addTodo('task one')
    await todoPage.startEditTodo(0)
    await todoPage.cancelEdit()
    await expect(todoPage.getTodoLabelAt(0)).toHaveText('task one')
    await expect(todoPage.getTodoItems().nth(0)).not.toHaveClass(/editing/)
  })

  test('deletes a todo when its title is cleared during edit', async ({ todoPage }) => {
    allure.label('feature', 'Editing todos')
    await todoPage.addTodo('task one')
    await todoPage.startEditTodo(0)
    await todoPage.saveEditWithEnter('')
    await expect(todoPage.getTodoItems()).toHaveCount(0)
  })

  test('trims leading and trailing whitespace when saving an edit', async ({ todoPage }) => {
    allure.label('feature', 'Editing todos')
    await todoPage.addTodo('task one')
    await todoPage.startEditTodo(0)
    await todoPage.saveEditWithEnter('  updated task  ')
    await expect(todoPage.getTodoLabelAt(0)).toHaveText('updated task')
  })
})

test.describe('Filtering', () => {
  test('shows only active todos when the Active filter is selected', async ({ todoPage }) => {
    allure.label('feature', 'Filtering')
    await todoPage.addTodo('active one')
    await todoPage.addTodo('active two')
    await todoPage.addTodo('done task')
    await todoPage.toggleTodoAt(2)
    await todoPage.clickFilterActive()
    await expect(todoPage.getTodoByTitle('active one')).toBeVisible()
    await expect(todoPage.getTodoByTitle('active two')).toBeVisible()
    await expect(todoPage.getTodoByTitle('done task')).not.toBeVisible()
  })

  test('shows only completed todos when the Completed filter is selected', async ({ todoPage }) => {
    allure.label('feature', 'Filtering')
    await todoPage.addTodo('active one')
    await todoPage.addTodo('active two')
    await todoPage.addTodo('done task')
    await todoPage.toggleTodoAt(2)
    await todoPage.clickFilterCompleted()
    await expect(todoPage.getTodoByTitle('done task')).toBeVisible()
    await expect(todoPage.getTodoByTitle('active one')).not.toBeVisible()
    await expect(todoPage.getTodoByTitle('active two')).not.toBeVisible()
  })

  test('shows all todos when the All filter is selected', async ({ todoPage }) => {
    allure.label('feature', 'Filtering')
    await todoPage.addTodo('active one')
    await todoPage.addTodo('active two')
    await todoPage.addTodo('done task')
    await todoPage.toggleTodoAt(2)
    await todoPage.clickFilterActive()
    await todoPage.clickFilterAll()
    await expect(todoPage.getTodoByTitle('active one')).toBeVisible()
    await expect(todoPage.getTodoByTitle('active two')).toBeVisible()
    await expect(todoPage.getTodoByTitle('done task')).toBeVisible()
  })

  test('hides a completed todo from the Active filter view', async ({ todoPage }) => {
    allure.label('feature', 'Filtering')
    await todoPage.addTodo('task one')
    await todoPage.clickFilterActive()
    await todoPage.toggleTodoAt(0)
    await expect(todoPage.getTodoByTitle('task one')).not.toBeVisible()
  })

  test('hides an active todo from the Completed filter view', async ({ todoPage }) => {
    allure.label('feature', 'Filtering')
    await todoPage.addTodo('task one')
    await todoPage.toggleTodoAt(0)
    await todoPage.clickFilterCompleted()
    await todoPage.toggleTodoAt(0)
    await expect(todoPage.getTodoByTitle('task one')).not.toBeVisible()
  })

  // Scenario Outline: Selected filter tab is highlighted when clicked (3 examples)
  for (const { name, setup, click, getTab } of filterTabCases) {
    test(`highlights the ${name} filter tab when clicked`, async ({ todoPage }) => {
      allure.label('feature', 'Filtering')
      await todoPage.addTodo('task one')
      await setup(todoPage)
      await click(todoPage)
      await expect(getTab(todoPage)).toHaveClass(/selected/)
    })
  }
})

test.describe('Clear completed', () => {
  test('hides the Clear completed button when no todos are completed', async ({ todoPage }) => {
    allure.label('feature', 'Clear completed')
    await todoPage.addTodo('task one')
    await expect(todoPage.clearCompletedBtn).not.toBeVisible()
  })

  test('shows the Clear completed button when a todo is completed', async ({ todoPage }) => {
    allure.label('feature', 'Clear completed')
    await todoPage.addTodo('task one')
    await todoPage.toggleTodoAt(0)
    await expect(todoPage.clearCompletedBtn).toBeVisible()
  })

  test('removes all completed todos and hides the button after clicking Clear completed', async ({ todoPage }) => {
    allure.label('feature', 'Clear completed')
    await todoPage.addTodo('active task')
    await todoPage.addTodo('done one')
    await todoPage.addTodo('done two')
    await todoPage.toggleTodoAt(1)
    await todoPage.toggleTodoAt(2)
    await todoPage.clickClearCompleted()
    await expect(todoPage.getTodoItems()).toHaveCount(1)
    await expect(todoPage.getTodoByTitle('active task')).toBeVisible()
    await expect(todoPage.clearCompletedBtn).not.toBeVisible()
  })
})

test.describe('Item counter', () => {
  // Scenario Outline: Active item counter uses correct singular/plural (2 examples)
  for (const { count, expected } of counterCases) {
    test(`displays "${expected}" with ${count} active todo(s)`, async ({ todoPage }) => {
      allure.label('feature', 'Item counter')
      for (let i = 0; i < count; i++) {
        await todoPage.addTodo(`task ${i + 1}`)
      }
      await expect(todoPage.todoCount).toHaveText(expected)
    })
  }

  test('only counts active todos in the counter', async ({ todoPage }) => {
    allure.label('feature', 'Item counter')
    await todoPage.addTodo('active task')
    await todoPage.addTodo('done one')
    await todoPage.addTodo('done two')
    await todoPage.toggleTodoAt(1)
    await todoPage.toggleTodoAt(2)
    await expect(todoPage.todoCount).toHaveText('1 item left')
  })
})

test.describe('Persistence', () => {
  test('persists todos after page reload', async ({ todoPage }) => {
    allure.label('feature', 'Persistence')
    await todoPage.addTodo('task one')
    await todoPage.reloadPage()
    await expect(todoPage.getTodoByTitle('task one')).toBeVisible()
  })

  test('persists completed state after page reload', async ({ todoPage }) => {
    allure.label('feature', 'Persistence')
    await todoPage.addTodo('task one')
    await todoPage.toggleTodoAt(0)
    await todoPage.reloadPage()
    await expect(todoPage.getTodoItems().nth(0)).toHaveClass(/completed/)
  })
})
