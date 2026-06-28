# Test Plan — Todo Application

**App under test:** `http://localhost:8080/todo`  
**Syntax:** Gherkin  
**Scope:** Create, update, and delete tasks; filtering; bulk actions; counter; persistence

---

```gherkin
Feature: Todo Application
  As a user
  I want to manage my tasks using the Todo application
  So that I can keep track of what needs to be done

  Background:
    Given I open the Todo application

  # ─────────────────────────────────────────────────────────
  # PAGE LOAD
  # ─────────────────────────────────────────────────────────

  Scenario: Default todos are displayed on first visit
    Given localStorage has no saved todos
    Then I should see 2 pre-populated todos
    And the active item counter should display "2 items left"

  Scenario: The "All" filter tab is selected by default
    Given I have an existing todo
    Then the "All" filter link should have the "selected" class

  Scenario: Footer is visible when todos exist
    Given I have an existing todo
    Then the footer section should be visible
    And the filter bar should be visible

  Scenario: Footer is hidden when no todos exist
    Given the todo list is empty
    Then the footer section should not be visible

  Scenario: Footer is hidden after the last todo is deleted
    Given I have an existing todo
    When I delete that todo
    Then the footer section should not be visible

  # ─────────────────────────────────────────────────────────
  # ADDING TODOS
  # ─────────────────────────────────────────────────────────

  Scenario: Add a new todo by pressing Enter
    Given the todo list is empty
    When I type a valid title in the new todo input
    And I press Enter
    Then the new todo should appear in the todo list
    And the active item counter should display "1 item left"

  Scenario: Add multiple todos in sequence
    Given the todo list is empty
    When I add 3 todos with distinct titles
    Then the todo list should contain exactly 3 items
    And the active item counter should display "3 items left"

  # ─────────────────────────────────────────────────────────
  # DELETING TODOS
  # ─────────────────────────────────────────────────────────

  Scenario: Delete a specific todo using the destroy button
    Given I have 2 todos in the list
    When I hover over the first todo
    And I click its delete button
    Then the first todo should no longer appear in the todo list
    And the second todo should still be visible
    And the active item counter should display "1 item left"

  # ─────────────────────────────────────────────────────────
  # COMPLETING TODOS
  # ─────────────────────────────────────────────────────────

  Scenario: Mark a todo as complete
    Given I have an active todo
    When I click its checkbox
    Then the todo should be marked as completed
    And the active item counter should display "0 items left"

  Scenario: Unmark a completed todo
    Given I have a completed todo
    When I click its checkbox
    Then the todo should be marked as active
    And the active item counter should display "1 item left"

  Scenario: Mark all todos as complete using toggle-all checkbox
    Given I have 3 active todos
    When I click the "toggle all" checkbox
    Then all todos should be marked as completed
    And the active item counter should display "0 items left"
    And the "toggle all" checkbox should be checked

  Scenario: Unmark all todos using toggle-all checkbox
    Given I have 2 todos
    And all todos are marked as completed
    When I click the "toggle all" checkbox
    Then all todos should be marked as active
    And the "toggle all" checkbox should be unchecked

  Scenario: Toggle-all checkbox becomes checked when all todos are individually completed
    Given I have 3 active todos
    When I complete each todo individually
    Then the "toggle all" checkbox should be checked

  # ─────────────────────────────────────────────────────────
  # EDITING TODOS
  # ─────────────────────────────────────────────────────────

  Scenario: Edit a todo title by double-clicking
    Given I have an existing todo
    When I double-click on it
    Then the todo should be in edit mode
    And the edit input should contain the original title

  Scenario: Save an edited todo by pressing Enter
    Given I have an existing todo in edit mode
    When I replace the title with a new title
    And I press Enter
    Then the todo should display the new title
    And the todo should no longer be in edit mode

  Scenario: Save an edited todo by clicking outside
    Given I have an existing todo in edit mode
    When I replace the title with a new title
    And I click outside the edit input
    Then the todo should display the new title

  Scenario: Cancel editing a todo with Escape key
    Given I have an existing todo in edit mode
    When I replace the title with a different title
    And I press Escape
    Then the todo should still display the original title
    And the todo should no longer be in edit mode

  Scenario: Delete a todo by clearing its title during edit
    Given I have an existing todo in edit mode
    When I clear the edit input completely
    And I press Enter
    Then the todo should no longer appear in the todo list

  Scenario: Leading and trailing whitespace is trimmed when saving an edit
    Given I have an existing todo in edit mode
    When I update the title with leading and trailing spaces
    And I press Enter
    Then the todo should display the title without the extra whitespace

  # ─────────────────────────────────────────────────────────
  # FILTERING TODOS
  # ─────────────────────────────────────────────────────────

  Scenario: Filter by Active shows only incomplete todos
    Given I have 2 active todos and 1 completed todo
    When I click the "Active" filter
    Then I should see 2 todos in the list
    And the completed todo should not be visible

  Scenario: Filter by Completed shows only completed todos
    Given I have 2 active todos and 1 completed todo
    When I click the "Completed" filter
    Then I should see 1 todo in the list
    And the active todos should not be visible

  Scenario: Filter by All shows every todo regardless of state
    Given I have 2 active todos and 1 completed todo
    When I click the "All" filter
    Then I should see 3 todos in the list

  Scenario: Active filter updates when a todo is completed
    Given I have 1 active todo
    And I am on the "Active" filter
    When I mark the todo as complete
    Then the todo should disappear from the Active view

  Scenario: Completed filter updates when a todo is uncompleted
    Given I have 1 completed todo
    And I am on the "Completed" filter
    When I unmark the todo
    Then the todo should disappear from the Completed view

  Scenario Outline: Selected filter tab is highlighted when clicked
    Given I have an existing todo
    When I click the "<filter>" filter
    Then the "<filter>" filter link should have the "selected" class

    Examples:
      | filter    |
      | Active    |
      | Completed |
      | All       |

  # ─────────────────────────────────────────────────────────
  # CLEAR COMPLETED
  # ─────────────────────────────────────────────────────────

  Scenario: "Clear completed" button is hidden when no todos are completed
    Given I have 1 active todo
    Then the "Clear completed" button should not be visible

  Scenario: "Clear completed" button is visible when todos are completed
    Given I have 1 completed todo
    Then the "Clear completed" button should be visible

  Scenario: Clear completed removes all completed todos and hides the button
    Given I have 1 active todo and 2 completed todos
    When I click "Clear completed"
    Then only the active todo should remain in the list
    And the "Clear completed" button should not be visible

  # ─────────────────────────────────────────────────────────
  # ITEM COUNTER
  # ─────────────────────────────────────────────────────────

  Scenario Outline: Active item counter uses correct singular/plural
    Given I have <active> active todo(s)
    Then the active item counter should display "<expected_text>"

    Examples:
      | active | expected_text |
      | 1      | 1 item left   |
      | 2      | 2 items left  |

  Scenario: Counter only counts active (not completed) todos
    Given I have 1 active todo and 2 completed todos
    Then the active item counter should display "1 item left"

  # ─────────────────────────────────────────────────────────
  # PERSISTENCE
  # ─────────────────────────────────────────────────────────

  Scenario: Todos persist after page reload
    Given I have added a todo
    When I reload the page
    Then the todo should still be visible in the todo list

  Scenario: Completed state persists after page reload
    Given I have a completed todo
    When I reload the page
    Then the todo should still be marked as completed
```
