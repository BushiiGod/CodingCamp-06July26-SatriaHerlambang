# Requirements Document

## Introduction

This document defines the requirements for the **Expense & Budget Visualizer** — a mobile-friendly single-page web application built with plain HTML, CSS, and Vanilla JavaScript (no frameworks). The app helps users track daily spending by recording transactions, displaying a running total balance, visualizing spending distribution by category in a pie chart, and optionally enforcing a spending limit. All state is stored client-side via LocalStorage; no backend or build tooling is required.

---

## Glossary

- **App**: The Expense & Budget Visualizer single-page application.
- **LocalStorage**: The browser Web Storage API (`window.localStorage`) used for all client-side persistence.
- **Theme**: The visual color scheme — either `dark` (default) or `light`.
- **Transaction**: A single expense entry consisting of an item name, a numeric amount (Rupiah), and a category.
- **Category**: A label grouping transactions — built-in options are `Food`, `Transport`, and `Fun`; users may also define custom categories.
- **Spending Limit**: An optional numeric threshold (Rupiah) set by the user; triggers visual warnings when total or individual transaction spending approaches or exceeds it.
- **Balance**: The running total of all transaction amounts, displayed at the top of the page.
- **Pie Chart**: A Chart.js doughnut-style pie chart visualizing spending distribution by category.
- **Transaction List**: The scrollable list of all recorded transactions.
- **Sort Mode**: The ordering applied to the Transaction List — one of `newest`, `oldest`, `amount-desc`, `amount-asc`, `category-az`, `category-za`.
- **Shake Animation**: A CSS keyframe animation applied to input fields to signal a validation error.

---

## Requirements

### Requirement 1: Theme Toggle

**User Story:** As a user, I want to switch between dark and light color themes so that I can comfortably use the app in any lighting condition.

#### Acceptance Criteria

1. IF no theme preference exists in LocalStorage under the key `expense_theme`, THEN the App SHALL apply the `dark` theme on page load.
2. WHEN the theme toggle button is clicked, the App SHALL switch the active theme from `dark` to `light` or from `light` to `dark`.
3. WHEN a theme is applied, the App SHALL persist the selected theme value to LocalStorage under the key `expense_theme`.
4. WHEN the page is loaded and a theme value exists in LocalStorage under `expense_theme`, the App SHALL apply that saved theme before any content is painted.
5. WHEN the `dark` theme is active, the App SHALL display a moon emoji (🌙) on the theme toggle button.
6. WHEN the `light` theme is active, the App SHALL display a sun emoji (☀️) on the theme toggle button.
7. The App SHALL apply the theme by setting the `data-theme` attribute on the `<html>` element.
8. IF the LocalStorage read for `expense_theme` fails or returns an unrecognized value, the App SHALL fall back to `dark` without throwing an error.

---

### Requirement 2: Total Balance Display

**User Story:** As a user, I want to see my total spending at the top of the page so that I always know how much I have spent.

#### Acceptance Criteria

1. The App SHALL display the sum of all transaction amounts as `Rp [formatted number]` in the balance section at the top of the page on load.
2. WHEN a transaction is added or deleted, the App SHALL recalculate and immediately update the displayed balance.
3. The balance amount SHALL be formatted using Indonesian locale number formatting (e.g., `Rp 1.500.000`).
4. WHEN no transactions exist, the App SHALL display `Rp 0` as the balance.

---

### Requirement 3: Spending Limit

**User Story:** As a user, I want to set an optional spending limit so that I receive a visual warning when I am close to or over budget.

#### Acceptance Criteria

1. The App SHALL provide a numeric input and a "Set Limit" button in the balance section.
2. WHEN the Set Limit button is clicked (or Enter is pressed in the limit input) with a valid non-negative number, the App SHALL save the limit to LocalStorage under the key `expense_limit` and immediately update the limit status indicator.
3. IF the limit input is empty, non-numeric, or negative WHEN the Set Limit button is clicked, the App SHALL apply the `input-error` CSS class to the input for 400 milliseconds (triggering the Shake Animation) and take no further action.
4. WHEN total spending is less than 80% of the limit, the App SHALL display a green status message in the format `✓ N% of limit used`.
5. WHEN total spending is 80% or more but less than 100% of the limit, the App SHALL display an amber warning message in the format `⚠️ N% of limit used`.
6. WHEN total spending equals or exceeds 100% of the limit, the App SHALL display a red status message `⚠️ Over limit!` and apply the `over-limit` CSS class to the balance amount element.
7. WHEN no limit is set (limit is 0 or absent), the App SHALL display no limit status message and SHALL NOT apply the `over-limit` CSS class.
8. WHEN the page loads and a saved limit exists in LocalStorage, the App SHALL restore the limit value into the input field and apply the appropriate status indicator.

---

### Requirement 4: Add Transaction — Input Form

**User Story:** As a user, I want to add a new expense with a name, amount, and category so that I can record each spending item.

#### Acceptance Criteria

1. The form SHALL provide three fields: Item Name (text, max 80 characters), Amount in Rupiah (number, min 1), and Category (select).
2. The Category select SHALL include built-in options `Food`, `Transport`, and `Fun`, plus a `Custom…` option that reveals an additional text input for a custom category name (max 40 characters).
3. WHEN the Add Transaction button is clicked, the App SHALL validate all fields before saving.
4. IF Item Name is empty or whitespace-only, the App SHALL display the error `Item name is required.` below the field and apply the Shake Animation to the input.
5. IF Amount is empty, non-numeric, or less than or equal to 0, the App SHALL display the error `Enter a valid amount greater than 0.` below the field and apply the Shake Animation to the input.
6. IF no category is selected, the App SHALL display the error `Please select a category.` below the field and apply the Shake Animation to the select element.
7. IF `Custom…` is selected and the custom category input is empty, the App SHALL display the error `Enter your custom category name.` below the custom field and apply the Shake Animation to it.
8. IF all fields are valid, the App SHALL create a new Transaction object with a unique timestamp ID, the trimmed name, the numeric amount, and the resolved category, append it to the transactions array, persist to LocalStorage, clear all form fields, hide the custom category group, and re-render the balance, chart, and list.
9. WHEN the Enter key is pressed while the Item Name or Amount field is focused, the App SHALL perform the same validation and action as clicking the Add Transaction button.
10. All validation errors SHALL be cleared at the start of each add attempt.

---

### Requirement 5: Add Transaction — Custom Categories

**User Story:** As a user, I want to define my own spending categories so that I can track expenses beyond the built-in options.

#### Acceptance Criteria

1. WHEN `Custom…` is selected in the category dropdown, the App SHALL reveal a text input for the custom category name and move focus to it.
2. WHEN a different built-in category is selected, the App SHALL hide the custom category input and clear its value.
3. WHEN a transaction is saved with a custom category, the App SHALL insert that category as a new `<option>` in the category select (before the `Custom…` option) so it is reusable in the same session.
4. WHEN the page loads, the App SHALL scan all persisted transactions and restore any previously-used custom categories as selectable options in the category dropdown.
5. The same custom category SHALL NOT be added as a duplicate option if it already exists.

---

### Requirement 6: Transaction List

**User Story:** As a user, I want to see a scrollable list of all my recorded transactions so that I can review my spending history.

#### Acceptance Criteria

1. The Transaction List SHALL display each transaction as a row containing: a colored category dot, the item name, the amount formatted as `Rp [number]`, and a category tag pill.
2. WHEN the transactions array is empty, the App SHALL display the placeholder message `No transactions yet — add one above!`.
3. WHEN the page loads, the App SHALL restore all persisted transactions and render them.
4. The Transaction List container SHALL have `max-height: 420px` and `overflow-y: auto` with a styled 4px scrollbar.
5. Each transaction row SHALL have a delete button (🗑) with an `aria-label` of `Delete transaction`.
6. WHEN the delete button for a transaction is clicked, the App SHALL remove that transaction from the array, persist the updated array, and re-render the balance, chart, and list.

---

### Requirement 7: Sort Transactions

**User Story:** As a user, I want to sort my transaction list by different criteria so that I can find or analyze expenses easily.

#### Acceptance Criteria

1. The App SHALL provide a sort dropdown with six options: `Newest First`, `Oldest First`, `Amount ↓`, `Amount ↑`, `Category A→Z`, `Category Z→A`.
2. The default sort mode SHALL be `newest` (newest transactions displayed first).
3. WHEN the sort dropdown value changes, the App SHALL immediately re-render the Transaction List in the selected order without reloading data.
4. WHILE sort mode is `newest`, transactions SHALL be ordered by descending timestamp ID.
5. WHILE sort mode is `oldest`, transactions SHALL be ordered by ascending timestamp ID.
6. WHILE sort mode is `amount-desc`, transactions SHALL be ordered by descending amount.
7. WHILE sort mode is `amount-asc`, transactions SHALL be ordered by ascending amount.
8. WHILE sort mode is `category-az`, transactions SHALL be ordered alphabetically A→Z by category name.
9. WHILE sort mode is `category-za`, transactions SHALL be ordered alphabetically Z→A by category name.

---

### Requirement 8: Highlight Spending Over Limit

**User Story:** As a user, I want individual transactions that exceed my spending limit to be visually highlighted so that I can quickly identify large expenses.

#### Acceptance Criteria

1. WHEN a spending limit is set and a transaction's amount exceeds that limit, the App SHALL apply the `over-limit` CSS class to that transaction row, rendering it with an amber border and tinted background.
2. WHEN the `over-limit` class is applied to a transaction row, the App SHALL display an `⚠️ Over limit` badge below the category tag in the transaction's metadata column.
3. WHEN the `over-limit` class is applied, the transaction amount text SHALL be rendered in the warning color (`var(--warning)`).
4. WHEN no spending limit is set, NO transaction rows SHALL receive the `over-limit` class or badge.
5. WHEN the spending limit changes or a transaction is deleted, all transaction rows SHALL be re-evaluated and their highlight state updated accordingly.

---

### Requirement 9: Pie Chart

**User Story:** As a user, I want a visual pie chart showing my spending distribution by category so that I can understand where my money goes at a glance.

#### Acceptance Criteria

1. The App SHALL render a pie chart using Chart.js in a dedicated section alongside the input form.
2. The chart SHALL aggregate transaction amounts by category and display one slice per category.
3. WHEN transactions exist, the chart SHALL be visible; WHEN no transactions exist, the chart canvas SHALL be hidden and a placeholder message `No transactions yet` SHALL be displayed in its place.
4. WHEN a transaction is added or deleted, the chart SHALL update automatically without a page reload.
5. Chart tooltips SHALL display the category amount and percentage in the format ` Rp [amount] ([pct]%)`.
6. The App SHALL render a custom legend below the chart showing a colored dot, the category name, and the total amount for each category in the format `[Category] — Rp [amount]`.
7. Each category SHALL be assigned a consistent color from a predefined palette; built-in categories (`Food`, `Transport`, `Fun`) SHALL always receive the same three colors regardless of insertion order.
8. The chart's built-in Chart.js legend SHALL be disabled (`display: false`); only the custom legend described above SHALL be shown.

---

### Requirement 10: Data Persistence

**User Story:** As a user, I want my transactions and settings to survive page refreshes so that my spending data is always available when I return.

#### Acceptance Criteria

1. WHEN a transaction is added or deleted, the App SHALL serialize the full transactions array to JSON and write it to LocalStorage under the key `expense_transactions`.
2. WHEN the page loads, the App SHALL read `expense_transactions` from LocalStorage, parse it, and render all saved transactions.
3. IF the LocalStorage value for `expense_transactions` is absent or invalid JSON, the App SHALL initialize with an empty array without throwing an error.
4. WHEN a spending limit is set, the App SHALL write it to LocalStorage under the key `expense_limit`.
5. WHEN the page loads, the App SHALL read `expense_limit` from LocalStorage and restore the limit value.
6. IF the LocalStorage value for `expense_limit` is absent or unparseable, the App SHALL default to no limit (0) without throwing an error.

---

### Requirement 11: Responsive Layout

**User Story:** As a user, I want the app to be usable on both desktop and mobile so that I can track expenses from any device.

#### Acceptance Criteria

1. The App SHALL use a 12-column CSS grid layout with a maximum content width of 1100px, centered horizontally with `margin: 0 auto`.
2. WHILE the viewport width is greater than 720px, the input form and pie chart SHALL be displayed side-by-side (each spanning 6 of 12 columns), with the balance section spanning all 12 columns above and the transaction list spanning all 12 columns below.
3. WHEN the viewport width is 720px or less, all sections SHALL span all 12 columns and stack vertically.
4. WHEN the viewport width is 520px or less, the App SHALL reduce the balance amount font size, stack the limit row vertically, and adjust body padding to maintain readability.

---

### Requirement 12: Technical Constraints

**User Story:** As a developer, I want the app to use only standard web technologies so that it has zero dependencies, works without a build step, and can be published directly via GitHub Pages.

#### Acceptance Criteria

1. The App SHALL be implemented using only HTML, CSS, and Vanilla JavaScript; no frameworks (React, Vue, etc.) are permitted.
2. The App SHALL consist of exactly one HTML file (`index.html`), one CSS file (`css/style.css`), and one JavaScript file (`js/app.js`).
3. Chart.js SHALL be loaded from a CDN `<script>` tag in `index.html`; it is the only permitted external dependency.
4. All application data SHALL be stored client-side only via the browser LocalStorage API; no backend server is required.
5. The App SHALL function correctly in current stable releases of Chrome, Firefox, Edge, and Safari.
6. The JavaScript file SHALL be loaded at the end of `<body>` after the Chart.js CDN script.

---

### Requirement 13: Non-Functional — UI Quality and Accessibility

**User Story:** As a user, I want the app to be clean, fast, and accessible so that it is easy and pleasant to use.

#### Acceptance Criteria

1. The App SHALL define typography using a system UI font stack (`'Segoe UI', system-ui, -apple-system, sans-serif`) with a base font size of 16px and a line-height of 1.5.
2. The App SHALL apply CSS `transition` properties of 0.2–0.3s duration to theme switches and interactive element hover/active states.
3. All icon-only interactive controls SHALL have `aria-label` attributes (theme toggle, delete transaction button).
4. The App SHALL define a `@keyframes shake` animation (horizontal displacement over 0.35s) and apply it via the `input-error` CSS class to signal validation errors.
5. The App SHALL provide a visually clean, minimal interface with clear visual hierarchy and readable typography in both dark and light themes.
