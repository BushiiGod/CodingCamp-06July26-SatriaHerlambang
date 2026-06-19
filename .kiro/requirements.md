# Requirements Document

## Introduction

This document defines the requirements for the **Personal Developer Dashboard** — a single-page web application built with plain HTML, CSS, and Vanilla JavaScript (no frameworks). The dashboard provides a developer-oriented home page with a live clock and greeting, a configurable Pomodoro focus timer, a persisted to-do list, and a set of quick-access links. All state is stored client-side via LocalStorage; no backend or build tooling is required.

The dashboard is already implemented and this spec documents all existing features comprehensively so the spec accurately reflects the current working implementation.

---

## Glossary

- **Dashboard**: The single-page web application described in this document.
- **App**: Synonym for Dashboard.
- **LocalStorage**: The browser Web Storage API (`window.localStorage`) used for all client-side persistence.
- **Theme**: The visual color scheme of the Dashboard — either `dark` (default) or `light`.
- **Greeting**: The top-of-page section that displays the live clock, current date, and a time-based welcome message.
- **Focus_Timer**: The countdown timer widget implementing the Pomodoro technique.
- **Session**: A single countdown interval started by the Focus_Timer.
- **To_Do_List**: The task management widget.
- **Task**: A single to-do item stored in the To_Do_List.
- **Quick_Links**: The bookmarks widget that stores and displays user-defined labeled hyperlinks.
- **Link**: A single bookmark entry in Quick_Links, consisting of a label and a URL.
- **Chip**: The pill-shaped UI element used to display a Link.
- **Favicon**: A 16×16 pixel site icon fetched from Google's favicon service for a given domain.
- **Modal**: The overlay dialog used for editing a Task.
- **Sort_Mode**: One of four ordering states for the To_Do_List: `default`, `az`, `za`, `done-last`.
- **Shake_Animation**: A CSS keyframe animation applied to an input field to signal a duplicate or invalid entry.

---

## Requirements

### Requirement 1: Theme Toggle

**User Story:** As a developer, I want to switch between dark and light color themes, so that I can comfortably use the dashboard in any lighting condition.

#### Acceptance Criteria

1. IF no theme preference exists in LocalStorage under the key `dashboard_theme`, THEN THE Dashboard SHALL apply the `dark` theme on page load.
2. WHEN the theme toggle button is clicked, THE Dashboard SHALL switch the active theme from `dark` to `light` or from `light` to `dark`.
3. WHEN a theme is applied, THE Dashboard SHALL persist the selected theme value to LocalStorage under the key `dashboard_theme`.
4. WHEN the page is loaded and a theme value exists in LocalStorage under the key `dashboard_theme`, THE Dashboard SHALL apply that saved theme before any content is painted.
5. WHEN the `dark` theme is active, THE Dashboard SHALL display a moon emoji (🌙) on the theme toggle button.
6. WHEN the `light` theme is active, THE Dashboard SHALL display a sun emoji (☀️) on the theme toggle button.
7. THE Dashboard SHALL apply the theme by setting the `data-theme` attribute on the `<html>` element.
8. IF the LocalStorage read for `dashboard_theme` fails or returns an unrecognized value, THEN THE Dashboard SHALL fall back to the `dark` theme without throwing an error.

---

### Requirement 2: Greeting — Live Clock

**User Story:** As a developer, I want to see the current time updating in real time, so that I always know what time it is without leaving the dashboard.

#### Acceptance Criteria

1. THE Greeting SHALL display the current local time in 12-hour format as `H:MM:SS AM/PM` — hours with no leading zero, minutes and seconds zero-padded to 2 digits, followed by a space and the AM/PM indicator (e.g., `9:05:03 AM`).
2. THE Greeting SHALL update the displayed time once every second using `setInterval`.
3. THE Greeting SHALL render the initial time immediately on page load without waiting for the first interval tick.
4. THE Greeting SHALL display the current date in long format (e.g., `Monday, June 23, 2025`) using the `en-US` locale.

---

### Requirement 3: Greeting — Time-Based Welcome Message

**User Story:** As a developer, I want to see a personalized greeting that changes based on the time of day, so that the dashboard feels personal and context-aware.

#### Acceptance Criteria

1. WHEN the local hour is between 5 (inclusive) and 12 (exclusive), THE Greeting SHALL display `🌤 Good Morning!, Darmawan`.
2. WHEN the local hour is between 12 (inclusive) and 17 (exclusive), THE Greeting SHALL display `☀️ Good Afternoon!, Darmawan`.
3. WHEN the local hour is between 17 (inclusive) and 21 (exclusive), THE Greeting SHALL display `🌆 Good Evening!, Darmawan`.
4. WHEN the local hour is between 21 (inclusive) and 5 (exclusive, wrapping midnight), THE Greeting SHALL display `🌙 Good Night!, Darmawan`.
5. THE Greeting SHALL update the welcome message each second in sync with the live clock.

---

### Requirement 4: Focus Timer — Default State and Display

**User Story:** As a developer, I want a ready-to-use Pomodoro timer, so that I can start a focused work session without any configuration.

#### Acceptance Criteria

1. WHEN the page loads, THE Focus_Timer SHALL initialize with a total session duration of 25 minutes (1500 seconds) and a remaining time equal to that duration.
2. THE Focus_Timer SHALL display the remaining time in `MM:SS` format with both minutes and seconds zero-padded to 2 digits (e.g., `25:00`).
3. WHEN the page loads, THE Focus_Timer SHALL display the status message `Ready to focus` and neither the `running` nor `finished` CSS class SHALL be applied to the display element.

---

### Requirement 5: Focus Timer — Start, Stop, Reset Controls

**User Story:** As a developer, I want to start, pause, and reset the focus timer, so that I can control my work sessions flexibly.

#### Acceptance Criteria

1. WHEN the Start button is clicked and the timer is not running and remaining time is greater than zero, THE Focus_Timer SHALL begin counting down one second per tick using `setInterval`.
2. WHEN the timer is counting down, THE Focus_Timer SHALL display the status message `⏱ Focusing…` and apply the `running` CSS class to the display element.
3. WHEN the Stop button is clicked and the timer is running, THE Focus_Timer SHALL pause the countdown and display the status message `Paused — resume when ready`. The display element SHALL retain the `running` CSS class until re-rendered.
4. WHEN the Reset button is clicked, THE Focus_Timer SHALL clear any active interval, set remaining time back to the current total session duration, remove both `running` and `finished` CSS classes from the display element, and display the status message `Ready to focus`.
5. WHEN the remaining time reaches zero, THE Focus_Timer SHALL clear the interval, set `running` to false, apply the `finished` CSS class to the display element, and display the status message `🎉 Session complete! Take a break.`.
6. WHEN the Start button is clicked and the timer is already running or remaining time is zero, THE Focus_Timer SHALL take no action.
7. WHEN the Stop button is clicked and the timer is not running, THE Focus_Timer SHALL take no action.

---

### Requirement 6: Focus Timer — Custom Duration

**User Story:** As a developer, I want to set a custom session duration, so that I can adapt the timer to my preferred work intervals.

#### Acceptance Criteria

1. THE Focus_Timer SHALL provide a numeric input field that accepts integer values between 1 and 120 (inclusive), with the default value of 25 pre-filled.
2. WHEN the Set button is clicked with a valid integer between 1 and 120, THE Focus_Timer SHALL clear any active interval, set `running` to false, update the total session duration to the entered value in minutes, reset the remaining time to match, and retain the entered value in the input field.
3. WHEN the Set button is clicked with a valid duration, THE Focus_Timer SHALL display the status message `Timer set to N min — ready to focus` (where N is the entered integer).
4. WHEN the Enter key is pressed while the duration input is focused, THE Focus_Timer SHALL perform the same validation and action as clicking the Set button — triggering error feedback on invalid input and setting the duration on valid input.
5. IF the Set button is clicked (or Enter pressed in the input) with a value that is not an integer or is outside the range 1–120, THEN THE Focus_Timer SHALL apply the `input-error` CSS class to the input field for 400 milliseconds (triggering the Shake_Animation) and display the status message `Enter a number between 1 and 120.`.

---

### Requirement 7: To-Do List — Adding Tasks

**User Story:** As a developer, I want to add tasks to my to-do list, so that I can track what I need to accomplish.

#### Acceptance Criteria

1. WHEN the Add button is clicked with a non-empty, non-whitespace-only task text that is not a case-insensitive duplicate of an existing task, THE To_Do_List SHALL append a new Task object with a unique timestamp ID, the trimmed text, and `done: false` to the task array, persist it to LocalStorage, clear the input field, and re-render the list.
2. WHEN the Enter key is pressed while the task input is focused, THE To_Do_List SHALL apply the same validation and action as clicking the Add button — including rejecting empty and duplicate inputs.
3. WHEN the Add button is clicked with an empty or whitespace-only input, THE To_Do_List SHALL take no action.
4. THE To_Do_List SHALL limit task text entry to a maximum of 120 characters.
5. WHEN the task list is empty, THE To_Do_List SHALL display the placeholder message `No tasks yet — add one above!`.
6. WHEN the page loads, THE To_Do_List SHALL restore all previously saved tasks from LocalStorage and render them.

---

### Requirement 8: To-Do List — Duplicate Detection

**User Story:** As a developer, I want the dashboard to prevent duplicate tasks, so that my list stays clean and unambiguous.

#### Acceptance Criteria

1. WHEN the Add button is clicked (or Enter is pressed in the task input) and the trimmed entered text matches an existing Task's text case-insensitively, THE To_Do_List SHALL reject the new task without adding it.
2. WHEN a duplicate is detected on add, THE To_Do_List SHALL apply the `input-error` CSS class to the task input for 400 milliseconds, triggering the Shake_Animation.
3. WHEN a duplicate is detected on add, THE To_Do_List SHALL display a warning message in the format `⚠️ "TEXT" is already in your list.` below the input row, where TEXT is the entered text.
4. WHEN a duplicate warning is displayed, THE To_Do_List SHALL clear the warning message text after 2500 milliseconds. If a subsequent duplicate is entered before the 2500ms timeout expires, the warning message SHALL be updated immediately with the new duplicate text and the 2500ms timer SHALL reset.
5. WHEN the edit Modal attempts to save a new text that case-insensitively matches another existing Task's text (excluding the task currently being edited), THE To_Do_List SHALL reject the save, apply the `input-error` CSS class to the edit input for 400 milliseconds, and keep the Modal open. A visible error indication SHALL be shown to the user.

---

### Requirement 9: To-Do List — Editing Tasks

**User Story:** As a developer, I want to edit an existing task's text, so that I can correct or refine it after adding it.

#### Acceptance Criteria

1. WHEN the edit button (✏️) for a Task is clicked, THE To_Do_List SHALL open the Modal pre-populated with the Task's current text and focus the edit input.
2. WHEN the Save button in the Modal is clicked with text that is non-empty, at most 120 characters, and not a case-insensitive duplicate of any other existing task, THE To_Do_List SHALL update the Task's text, persist the change to LocalStorage, close the Modal, and re-render the list.
3. WHEN the Enter key is pressed while the edit input is focused, THE To_Do_List SHALL behave identically to clicking the Save button.
4. WHEN the Cancel button in the Modal is clicked, THE To_Do_List SHALL close the Modal without saving any changes.
5. WHEN the Escape key is pressed while the Modal is open, THE To_Do_List SHALL close the Modal without saving any changes.
6. WHEN the Modal overlay background is clicked, THE To_Do_List SHALL close the Modal without saving any changes.
7. WHEN the Save button is clicked with an empty or whitespace-only text, THE To_Do_List SHALL apply the `input-error` CSS class to the edit input for 400 milliseconds and keep the Modal open without saving.
8. WHEN the Save button is clicked with a text that is a case-insensitive duplicate of another existing task (not the one being edited), THE To_Do_List SHALL apply the `input-error` CSS class to the edit input for 400 milliseconds and keep the Modal open without saving.

---

### Requirement 10: To-Do List — Completing and Deleting Tasks

**User Story:** As a developer, I want to mark tasks complete and remove them, so that I can track progress and keep my list current.

#### Acceptance Criteria

1. WHEN the check button for a Task is clicked, THE To_Do_List SHALL toggle the Task's `done` property between `true` and `false` and persist the updated task array to LocalStorage.
2. IF a Task's `done` property is `true`, THEN THE To_Do_List SHALL apply the `done` CSS class to the list item (rendering its text with a strikethrough and muted color) and apply the `checked` CSS class to the check button with an `aria-label` of `Mark incomplete`.
3. IF a Task's `done` property is `false`, THEN THE To_Do_List SHALL not apply the `done` CSS class to the list item and shall render the check button without the `checked` CSS class with an `aria-label` of `Mark complete`.
4. WHEN the delete button (🗑) for a Task is clicked, THE To_Do_List SHALL remove the Task from the array, persist the updated array to LocalStorage, and re-render the list.

---

### Requirement 11: To-Do List — Sorting

**User Story:** As a developer, I want to sort my task list in different orders, so that I can find and prioritize tasks easily.

#### Acceptance Criteria

1. WHEN the Sort button is clicked, THE To_Do_List SHALL advance Sort_Mode to the next value in the cycle: `default` → `az` → `za` → `done-last` → `default`.
2. WHILE Sort_Mode is `default`, THE To_Do_List SHALL display tasks in their original insertion order.
3. WHILE Sort_Mode is `az`, THE To_Do_List SHALL display tasks sorted alphabetically A→Z by task text using locale-aware comparison; tasks with identical text are ordered by insertion order.
4. WHILE Sort_Mode is `za`, THE To_Do_List SHALL display tasks sorted alphabetically Z→A by task text using locale-aware comparison; tasks with identical text are ordered by insertion order.
5. WHILE Sort_Mode is `done-last`, THE To_Do_List SHALL display all incomplete tasks before all completed tasks; within each group, tasks SHALL preserve their original insertion order.
6. IF Sort_Mode is not `default`, THEN THE To_Do_List SHALL apply the `btn-sort-active` CSS class to the Sort button.
7. IF Sort_Mode is `default`, THEN THE To_Do_List SHALL remove the `btn-sort-active` CSS class from the Sort button.
8. WHILE Sort_Mode is `default`, THE Sort button SHALL display `⇅` and the label `Sort`. WHILE Sort_Mode is `az`, it SHALL display `A→Z`. WHILE Sort_Mode is `za`, it SHALL display `Z→A`. WHILE Sort_Mode is `done-last`, it SHALL display `✓↓` and the label `Done Last`.

---

### Requirement 12: To-Do List — Persistence

**User Story:** As a developer, I want my tasks to survive page refreshes, so that I don't lose my list when I reload or revisit the dashboard.

#### Acceptance Criteria

1. WHEN a Task is added, edited, completed, or deleted, THE To_Do_List SHALL serialize the full task array (including each task's `id`, `text`, and `done` properties) to a JSON string and write it to LocalStorage under the key `dashboard_todos`.
2. WHEN the page loads, THE To_Do_List SHALL read the value from LocalStorage under `dashboard_todos`, parse it, and render all tasks restoring each task's text, `done` state, and original insertion order.
3. IF the LocalStorage value for `dashboard_todos` is absent or cannot be parsed as valid JSON, THEN THE To_Do_List SHALL initialize with an empty task array without throwing an error.
4. IF a LocalStorage write operation throws an exception (e.g., storage quota exceeded), THEN THE To_Do_List SHALL catch the error silently and continue operating without crashing.

---

### Requirement 13: Quick Links — Adding Links

**User Story:** As a developer, I want to save labeled bookmarks, so that I can quickly navigate to the sites I use most.

#### Acceptance Criteria

1. WHEN the Add button is clicked with a non-empty, non-whitespace-only label (max 40 characters) and a non-empty, non-whitespace-only URL, THE Quick_Links SHALL normalize the URL, validate it, save a new Link with a unique timestamp ID to LocalStorage, clear both input fields, and re-render the grid.
2. WHEN the Add button is clicked with a whitespace-only or empty label, or a whitespace-only or empty URL, THE Quick_Links SHALL display a browser alert with the message `Please enter both a label and a URL.` and take no further action.
3. WHEN a URL is submitted without an `http://` or `https://` scheme, THE Quick_Links SHALL automatically prepend `https://` before validating and saving.
4. IF the entered URL (after scheme normalization) is not a syntactically valid URL per the WHATWG URL Standard, THEN THE Quick_Links SHALL display a browser alert with the message `Please enter a valid URL (e.g. https://google.com).` and take no further action.
5. WHEN the Enter key is pressed while the URL input is focused, THE Quick_Links SHALL behave identically to clicking the Add button.
6. WHEN the Enter key is pressed while the label input is focused, THE Quick_Links SHALL move focus to the URL input without submitting.
7. IF the links array is empty, THEN THE Quick_Links SHALL display the placeholder message `No links yet — add your favorites above!`.
8. WHEN the page loads, THE Quick_Links SHALL restore all previously saved links from LocalStorage and render them.

---

### Requirement 14: Quick Links — Displaying and Opening Links

**User Story:** As a developer, I want to see my bookmarks as clickable chips with favicons, so that I can visually identify and open them quickly.

#### Acceptance Criteria

1. THE Quick_Links SHALL render each Link as a Chip containing a Favicon image, the Link's label text, and a delete button (✕).
2. WHEN a Chip is clicked anywhere except the delete button, THE Quick_Links SHALL open the Link's URL in a new browser tab with `target="_blank"` and `rel="noopener noreferrer"`.
3. THE Quick_Links SHALL set each Favicon's `src` to `https://www.google.com/s2/favicons?sz=16&domain={hostname}`, where `{hostname}` is the hostname extracted from the Link's URL.
4. IF the Favicon image fires an `error` event, THEN THE Quick_Links SHALL set the image element's `display` to `none` so no broken-image placeholder is shown.
5. THE Quick_Links SHALL truncate label text that overflows the chip's maximum label width using `white-space: nowrap`, `overflow: hidden`, and `text-overflow: ellipsis`.

---

### Requirement 15: Quick Links — Deleting Links

**User Story:** As a developer, I want to remove bookmarks I no longer need, so that my quick links stay relevant.

#### Acceptance Criteria

1. WHEN the delete button (✕) on a Chip is clicked, THE Quick_Links SHALL remove the corresponding Link from the links array, persist the updated array to LocalStorage under the key `dashboard_links`, and re-render the grid.
2. WHEN the delete button on a Chip is clicked, THE Quick_Links SHALL call `event.preventDefault()` and `event.stopPropagation()` so the Chip's anchor element does not navigate.

---

### Requirement 16: Quick Links — Persistence

**User Story:** As a developer, I want my bookmarks to survive page refreshes, so that I don't have to re-enter them each visit.

#### Acceptance Criteria

1. WHEN a Link is added or deleted, THE Quick_Links SHALL serialize the full links array to a JSON string and write it to LocalStorage under the key `dashboard_links`.
2. WHEN the page loads, THE Quick_Links SHALL read the value from LocalStorage under `dashboard_links`, parse it, and render all previously saved links in their stored order.
3. IF the LocalStorage value for `dashboard_links` is absent or cannot be parsed as valid JSON, THEN THE Quick_Links SHALL initialize with an empty links array without throwing an error.

---

### Requirement 17: Responsive Layout

**User Story:** As a developer, I want the dashboard to be usable on different screen sizes, so that I can access it from any device.

#### Acceptance Criteria

1. THE Dashboard SHALL use a 12-column CSS grid layout with a maximum content width of 1100px, centered horizontally with `margin: 0 auto`.
2. WHILE the viewport width is greater than 720px, THE Dashboard SHALL display the Focus_Timer and the To_Do_List side-by-side (each spanning 6 of 12 columns), with the Greeting spanning all 12 columns above them and the Quick_Links spanning 6 columns below.
3. WHEN the viewport width is 720px or less, THE Dashboard SHALL apply a CSS media query that causes all widgets (Greeting, Focus_Timer, To_Do_List, Quick_Links) to span all 12 columns, stacking vertically.
4. WHEN the viewport width is 520px or less, THE Dashboard SHALL apply a CSS media query that reduces the timer display font size, the greeting time font size, stacks the To_Do_List input row vertically, and adjusts body padding to maintain readability.

---

### Requirement 18: Technical Constraints

**User Story:** As a developer, I want the dashboard to use only standard web technologies, so that it has zero dependencies, works offline (after initial load), and requires no build tooling.

#### Acceptance Criteria

1. THE Dashboard SHALL be implemented using only HTML, CSS, and Vanilla JavaScript with no third-party frameworks, libraries, or package managers.
2. THE Dashboard SHALL consist of exactly one HTML file (`index.html`), one CSS file (`css/style.css`), and one JavaScript file (`js/app.js`); no additional source files are permitted.
3. THE Dashboard SHALL function correctly in current stable releases of Chrome, Firefox, Edge, and Safari without requiring polyfills or transpilation.
4. THE Dashboard SHALL operate entirely client-side; the only external network request permitted is fetching favicons from `https://www.google.com/s2/favicons`.
5. THE Dashboard SHALL contain no render-blocking resources other than the single linked CSS file; the JavaScript file SHALL be loaded at the end of `<body>` without `async` or `defer` attributes omitted.

---

### Requirement 19: Non-Functional — UI Quality and Accessibility

**User Story:** As a developer, I want the dashboard to look clean and be easy to use, so that it enhances rather than distracts from my workflow.

#### Acceptance Criteria

1. THE Dashboard SHALL define typography using a system UI font stack (`'Segoe UI', system-ui, -apple-system, sans-serif`) with a base font size of 16px and a line-height of 1.5.
2. THE Dashboard SHALL apply CSS `transition` properties of 0.2–0.3s duration to theme switches (`background`, `color` on `body`) and to interactive element hover and active states to avoid jarring visual changes.
3. THE Dashboard SHALL provide `aria-label` attributes on all icon-only interactive controls (theme toggle, task check button, task edit button, task delete button, link delete button, sort button).
4. THE Dashboard SHALL set `max-height: 360px` and `overflow-y: auto` on the To_Do_List container, with a styled scrollbar (4px wide, transparent track, `var(--border)` thumb color) visible when task count overflows.
5. THE Dashboard SHALL define a `@keyframes shake` animation (horizontal displacement over 0.35s) and apply it via the `input-error` CSS class to signal validation errors on all input fields.
