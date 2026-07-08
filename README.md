# Expense & Budget Visualizer

A mobile-friendly expense tracker built with vanilla JavaScript, HTML, and CSS — no frameworks, no build tools required.

Track your daily spending, visualize where your money goes, and set a budget limit to stay on top of your finances.

## Features

### 💰 Total Balance
- Displays the running total of all recorded expenses
- Updates instantly when transactions are added or removed

### ➕ Add Transaction
- Fields: Item Name, Amount (Rp), and Category
- Built-in categories: Food, Transport, Fun
- Custom categories: create your own and reuse them across sessions
- Full validation with inline error messages and shake animation

### 📊 Spending Chart
- Pie chart powered by [Chart.js](https://www.chartjs.org/) showing spending by category
- Custom legend with category name and total amount
- Updates automatically on every change

### 🧾 Transaction List
- Scrollable list of all recorded transactions
- Shows item name, amount, and category tag
- Delete individual transactions with one click
- Sort by: Newest, Oldest, Amount ↓, Amount ↑, Category A→Z, Category Z→A

### 🚨 Spending Limit
- Set an optional budget limit
- Visual warnings at 80% (amber) and 100% (red) of the limit
- Individual transactions that exceed the limit are highlighted in the list
- Clear the limit at any time with the Clear button

### 🌙 Dark / Light Mode
- Toggle between dark and light themes
- Preference is saved and restored on next visit

## Project Structure

```
├── index.html        # Main HTML layout
├── css/
│   └── style.css     # All styles (dark/light themes, components, responsive)
└── js/
    └── app.js        # All JavaScript (vanilla, no dependencies)
```

## Getting Started

No build step needed. Open `index.html` directly in a browser, or use a local server:

```bash
# Clone the repo
git clone https://github.com/your-username/CodingCamp-15June26-SatriaHerlambang.git

# Open in browser
open index.html
```

Or use [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) in VS Code for auto-reload on save.

## Tech Stack

| Layer | Technology |
|---|---|
| Markup | HTML5 (semantic) |
| Styles | CSS3 (custom properties, grid, transitions) |
| Logic | Vanilla JavaScript (ES5-compatible) |
| Chart | Chart.js 4.4.3 (CDN) |
| Storage | Browser LocalStorage (client-side only) |

## Browser Support

Works in all modern browsers (Chrome, Firefox, Edge, Safari). Data is stored locally in the browser and is not synced across devices.
