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
