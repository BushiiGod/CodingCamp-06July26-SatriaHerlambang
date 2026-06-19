# My Dashboard

A lightweight personal productivity dashboard built with vanilla JavaScript, HTML, and CSS — no frameworks, no dependencies.

## Features

### 🌙 Theme Toggle
- Switch between dark and light mode
- Preference is saved to localStorage and restored on next visit

### 🕐 Greeting
- Displays the current time (live, updates every second)
- Shows a time-aware greeting (Good Morning / Afternoon / Evening / Night)
- Displays the current date in a readable format

### ⏱ Focus Timer
- Configurable Pomodoro-style countdown timer
- Set any duration between 1 and 120 minutes
- Start, pause, and reset controls
- Visual feedback: green while running, red when finished

### ✅ To-Do List
- Add, edit, complete, and delete tasks
- Duplicate detection (case-insensitive)
- Sort tasks by name (A→Z, Z→A) or push completed tasks to the bottom
- All tasks are persisted in localStorage

### 🔗 Quick Links
- Save frequently visited URLs with a custom label
- Auto-prepends `https://` if missing
- Displays favicons for each link
- Links open in a new tab

## Project Structure

```
├── index.html        # Main HTML layout
├── css/
│   └── style.css     # All styles (dark/light themes, components)
└── js/
    └── app.js        # All JavaScript (vanilla, no dependencies)
```

## Getting Started

No build step required. Just open `index.html` in a browser.

```bash
# Clone the repo
git clone https://github.com/your-username/CodingCamp-15June26-SatriaHerlambang.git

# Open in browser
open index.html
```

Or use a local dev server like [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) in VS Code.

## Browser Support

Works in all modern browsers. Uses `localStorage` for persistence — data is stored locally in the browser and is not synced across devices.

## Tech Stack

- **HTML5** — semantic markup
- **CSS3** — custom properties, grid layout, transitions
- **Vanilla JavaScript** — ES5-compatible, no dependencies
