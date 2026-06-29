import { test, expect } from '@playwright/test'
import { allure } from 'allure-playwright'
import { TodoPage } from '../pages/TodoPage'

test.describe('Page load', () => {
  let todoPage: TodoPage

  test.beforeEach(async ({ page }) => {
    todoPage = new TodoPage(page)
    await todoPage.goto()
  })

  test('shows 2 default todos on first visit', async ({ page }) => {
    allure.label('feature', 'Page Load')
    // This test needs its own fresh state — navigate again with empty storage
    const freshPage = new TodoPage(page)
    await freshPage.gotoFreshStorage()
    await expect(freshPage.getTodoItems()).toHaveCount(2)
    await expect(freshPage.todoCount).toHaveText('2 items left')
  })

  test('selects the "All" filter tab by default', async () => {
    allure.label('feature', 'Page Load')
    await todoPage.addTodo('task one')
    await expect(todoPage.filterAll).toHaveClass(/selected/)
  })

  test('shows the footer and main section when todos exist', async () => {
    allure.label('feature', 'Page Load')
    await todoPage.addTodo('task one')
    await expect(todoPage.footer).toBeVisible()
    await expect(todoPage.mainSection).toBeVisible()
  })

  test('hides the footer and main section when the list is empty', async () => {
    allure.label('feature', 'Page Load')
    await expect(todoPage.footer).not.toBeVisible()
    await expect(todoPage.mainSection).not.toBeVisible()
  })

  test('hides the footer after the last todo is deleted', async () => {
    allure.label('feature', 'Page Load')
    await todoPage.addTodo('task one')
    await todoPage.deleteTodoAt(0)
    await expect(todoPage.footer).not.toBeVisible()
  })
})

test.describe('Adding todos', () => {
  let todoPage: TodoPage

  test.beforeEach(async ({ page }) => {
    todoPage = new TodoPage(page)
    await todoPage.goto()
  })

  test('adds a new todo when Enter is pressed', async () => {
    allure.label('feature', 'Adding todos')
    await todoPage.addTodo('task one')
    await expect(todoPage.getTodoItems()).toHaveCount(1)
    await expect(todoPage.todoCount).toHaveText('1 item left')
  })

  test('adds multiple todos in sequence', async () => {
    allure.label('feature', 'Adding todos')
    await todoPage.addTodo('task one')
    await todoPage.addTodo('task two')
    await todoPage.addTodo('task three')
    await expect(todoPage.getTodoItems()).toHaveCount(3)
    await expect(todoPage.todoCount).toHaveText('3 items left')
  })
})

test.describe('Deleting todos', () => {
  let todoPage: TodoPage

  test.beforeEach(async ({ page }) => {
    todoPage = new TodoPage(page)
    await todoPage.goto()
  })

  test('deletes a todo using the destroy button', async () => {
    allure.label('feature', 'Deleting todos')
    await todoPage.addTodo('task one')
    await todoPage.addTodo('task two')
    await todoPage.deleteTodoAt(0)
    await expect(todoPage.todoList.locator('li').filter({ hasText: 'task one' })).toHaveCount(0)
    await expect(todoPage.todoList.locator('li').filter({ hasText: 'task two' })).toBeVisible()
    await expect(todoPage.todoCount).toHaveText('1 item left')
  })
})

test.describe('Completing todos', () => {
  let todoPage: TodoPage

  test.beforeEach(async ({ page }) => {
    todoPage = new TodoPage(page)
    await todoPage.goto()
  })

  test('marks a todo as complete', async () => {
    allure.label('feature', 'Completing todos')
    await todoPage.addTodo('task one')
    await todoPage.toggleTodoAt(0)
    await expect(todoPage.getTodoItems().nth(0)).toHaveClass(/completed/)
    await expect(todoPage.todoCount).toHaveText('0 items left')
  })

  test('unmarks a completed todo', async () => {
    allure.label('feature', 'Completing todos')
    await todoPage.addTodo('task one')
    await todoPage.toggleTodoAt(0)
    await todoPage.toggleTodoAt(0)
    await expect(todoPage.getTodoItems().nth(0)).not.toHaveClass(/completed/)
    await expect(todoPage.todoCount).toHaveText('1 item left')
  })

  test('marks all todos as complete using toggle-all', async () => {
    allure.label('feature', 'Completing todos')
    await todoPage.addTodo('task one')
    await todoPage.addTodo('task two')
    await todoPage.addTodo('task three')
    await todoPage.clickToggleAll()
    await expect(todoPage.todoList.locator('li.completed')).toHaveCount(3)
    await expect(todoPage.todoCount).toHaveText('0 items left')
    await expect(todoPage.toggleAll).toBeChecked()
  })

  test('unmarks all todos using toggle-all', async () => {
    allure.label('feature', 'Completing todos')
    await todoPage.addTodo('task one')
    await todoPage.addTodo('task two')
    await todoPage.clickToggleAll()
    await todoPage.clickToggleAll()
    await expect(todoPage.todoList.locator('li.completed')).toHaveCount(0)
    await expect(todoPage.toggleAll).not.toBeChecked()
  })

  test('toggle-all becomes checked when all todos are individually completed', async () => {
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
  let todoPage: TodoPage

  test.beforeEach(async ({ page }) => {
    todoPage = new TodoPage(page)
    await todoPage.goto()
  })

  test('enters edit mode when a todo is double-clicked', async () => {
    allure.label('feature', 'Editing todos')
    await todoPage.addTodo('task one')
    await todoPage.startEditTodo(0)
    await expect(todoPage.getTodoItems().nth(0)).toHaveClass(/editing/)
    await expect(todoPage.getEditInput()).toHaveValue('task one')
  })

  test('saves an edited todo by pressing Enter', async () => {
    allure.label('feature', 'Editing todos')
    await todoPage.addTodo('task one')
    await todoPage.startEditTodo(0)
    await todoPage.saveEditWithEnter('updated task')
    await expect(todoPage.todoList.locator('li label').nth(0)).toHaveText('updated task')
    await expect(todoPage.getTodoItems().nth(0)).not.toHaveClass(/editing/)
  })

  test('saves an edited todo by clicking outside', async () => {
    allure.label('feature', 'Editing todos')
    await todoPage.addTodo('task one')
    await todoPage.startEditTodo(0)
    await todoPage.saveEditWithBlur('updated task')
    await expect(todoPage.todoList.locator('li label').nth(0)).toHaveText('updated task')
  })

  test('cancels an edit when Escape is pressed', async () => {
    allure.label('feature', 'Editing todos')
    await todoPage.addTodo('task one')
    await todoPage.startEditTodo(0)
    await todoPage.cancelEdit()
    await expect(todoPage.todoList.locator('li label').nth(0)).toHaveText('task one')
    await expect(todoPage.getTodoItems().nth(0)).not.toHaveClass(/editing/)
  })

  test('deletes a todo when its title is cleared during edit', async () => {
    allure.label('feature', 'Editing todos')
    await todoPage.addTodo('task one')
    await todoPage.startEditTodo(0)
    await todoPage.saveEditWithEnter('')
    await expect(todoPage.getTodoItems()).toHaveCount(0)
  })

  test('trims leading and trailing whitespace when saving an edit', async () => {
    allure.label('feature', 'Editing todos')
    await todoPage.addTodo('task one')
    await todoPage.startEditTodo(0)
    await todoPage.saveEditWithEnter('  updated task  ')
    await expect(todoPage.todoList.locator('li label').nth(0)).toHaveText('updated task')
  })
})

test.describe('Filtering', () => {
  let todoPage: TodoPage

  test.beforeEach(async ({ page }) => {
    todoPage = new TodoPage(page)
    await todoPage.goto()
  })

  test('shows only active todos when the Active filter is selected', async () => {
    allure.label('feature', 'Filtering')
    await todoPage.addTodo('active one')
    await todoPage.addTodo('active two')
    await todoPage.addTodo('done task')
    await todoPage.toggleTodoAt(2)
    await todoPage.clickFilterActive()
    await expect(todoPage.todoList.locator('li').filter({ hasText: 'active one' })).toBeVisible()
    await expect(todoPage.todoList.locator('li').filter({ hasText: 'active two' })).toBeVisible()
    await expect(todoPage.todoList.locator('li').filter({ hasText: 'done task' })).not.toBeVisible()
  })

  test('shows only completed todos when the Completed filter is selected', async () => {
    allure.label('feature', 'Filtering')
    await todoPage.addTodo('active one')
    await todoPage.addTodo('active two')
    await todoPage.addTodo('done task')
    await todoPage.toggleTodoAt(2)
    await todoPage.clickFilterCompleted()
    await expect(todoPage.todoList.locator('li').filter({ hasText: 'done task' })).toBeVisible()
    await expect(todoPage.todoList.locator('li').filter({ hasText: 'active one' })).not.toBeVisible()
    await expect(todoPage.todoList.locator('li').filter({ hasText: 'active two' })).not.toBeVisible()
  })

  test('shows all todos when the All filter is selected', async () => {
    allure.label('feature', 'Filtering')
    await todoPage.addTodo('active one')
    await todoPage.addTodo('active two')
    await todoPage.addTodo('done task')
    await todoPage.toggleTodoAt(2)
    await todoPage.clickFilterActive()
    await todoPage.clickFilterAll()
    await expect(todoPage.todoList.locator('li').filter({ hasText: 'active one' })).toBeVisible()
    await expect(todoPage.todoList.locator('li').filter({ hasText: 'active two' })).toBeVisible()
    await expect(todoPage.todoList.locator('li').filter({ hasText: 'done task' })).toBeVisible()
  })

  test('hides a completed todo from the Active filter view', async () => {
    allure.label('feature', 'Filtering')
    await todoPage.addTodo('task one')
    await todoPage.clickFilterActive()
    await todoPage.toggleTodoAt(0)
    await expect(todoPage.todoList.locator('li').filter({ hasText: 'task one' })).not.toBeVisible()
  })

  test('hides an active todo from the Completed filter view', async () => {
    allure.label('feature', 'Filtering')
    await todoPage.addTodo('task one')
    await todoPage.toggleTodoAt(0)
    await todoPage.clickFilterCompleted()
    await todoPage.toggleTodoAt(0)
    await expect(todoPage.todoList.locator('li').filter({ hasText: 'task one' })).not.toBeVisible()
  })

  test('highlights the Active filter tab when clicked', async () => {
    allure.label('feature', 'Filtering')
    await todoPage.addTodo('task one')
    await todoPage.clickFilterActive()
    await expect(todoPage.filterActive).toHaveClass(/selected/)
  })

  test('highlights the Completed filter tab when clicked', async () => {
    allure.label('feature', 'Filtering')
    await todoPage.addTodo('task one')
    await todoPage.toggleTodoAt(0)
    await todoPage.clickFilterCompleted()
    await expect(todoPage.filterCompleted).toHaveClass(/selected/)
  })

  test('highlights the All filter tab when clicked', async () => {
    allure.label('feature', 'Filtering')
    await todoPage.addTodo('task one')
    await todoPage.clickFilterActive()
    await todoPage.clickFilterAll()
    await expect(todoPage.filterAll).toHaveClass(/selected/)
  })
})

test.describe('Clear completed', () => {
  let todoPage: TodoPage

  test.beforeEach(async ({ page }) => {
    todoPage = new TodoPage(page)
    await todoPage.goto()
  })

  test('hides the Clear completed button when no todos are completed', async () => {
    allure.label('feature', 'Clear completed')
    await todoPage.addTodo('task one')
    await expect(todoPage.clearCompletedBtn).not.toBeVisible()
  })

  test('shows the Clear completed button when a todo is completed', async () => {
    allure.label('feature', 'Clear completed')
    await todoPage.addTodo('task one')
    await todoPage.toggleTodoAt(0)
    await expect(todoPage.clearCompletedBtn).toBeVisible()
  })

  test('removes all completed todos and hides the button after clicking Clear completed', async () => {
    allure.label('feature', 'Clear completed')
    await todoPage.addTodo('active task')
    await todoPage.addTodo('done one')
    await todoPage.addTodo('done two')
    await todoPage.toggleTodoAt(1)
    await todoPage.toggleTodoAt(2)
    await todoPage.clickClearCompleted()
    await expect(todoPage.getTodoItems()).toHaveCount(1)
    await expect(todoPage.todoList.locator('li').filter({ hasText: 'active task' })).toBeVisible()
    await expect(todoPage.clearCompletedBtn).not.toBeVisible()
  })
})

test.describe('Item counter', () => {
  let todoPage: TodoPage

  test.beforeEach(async ({ page }) => {
    todoPage = new TodoPage(page)
    await todoPage.goto()
  })

  test('displays "1 item left" for a single active todo', async () => {
    allure.label('feature', 'Item counter')
    await todoPage.addTodo('task one')
    await expect(todoPage.todoCount).toHaveText('1 item left')
  })

  test('displays "2 items left" for multiple active todos', async () => {
    allure.label('feature', 'Item counter')
    await todoPage.addTodo('task one')
    await todoPage.addTodo('task two')
    await expect(todoPage.todoCount).toHaveText('2 items left')
  })

  test('only counts active todos in the counter', async () => {
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
  let todoPage: TodoPage

  test.beforeEach(async ({ page }) => {
    todoPage = new TodoPage(page)
    await todoPage.goto()
  })

  test('persists todos after page reload', async () => {
    allure.label('feature', 'Persistence')
    await todoPage.addTodo('task one')
    await todoPage.reloadPage()
    await expect(todoPage.todoList.locator('li').filter({ hasText: 'task one' })).toBeVisible()
  })

  test('persists completed state after page reload', async () => {
    allure.label('feature', 'Persistence')
    await todoPage.addTodo('task one')
    await todoPage.toggleTodoAt(0)
    await todoPage.reloadPage()
    await expect(todoPage.getTodoItems().nth(0)).toHaveClass(/completed/)
  })
})
