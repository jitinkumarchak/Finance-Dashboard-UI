# Finance Dashboard UI
### Developed by Jitin Kumar chak

A personal finance tracking dashboard built with React + Vite. This project lets users view their financial summary, manage transactions, and understand spending patterns through charts and insights.

## Live Demo / Repo

- **LIVE**: ([FINTRAK](https://fintrak-per81o6a5-jitin-kumar-chaks-projects.vercel.app/))

---

## Getting Started

### Prerequisites

- Node.js v18 or higher
- npm

### Installation & Running

```bash
# Clone the repository
git clone https://github.com/jitinkumarchak/Finance-Dashboard-UI.git
cd Finance-Dashboard-UI

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Project Overview

I wanted to build something that actually felt useful rather than just a static UI. The idea was to make a dashboard where you can quickly understand where your money is going each month — something I personally find useful.

### Tech Stack

- **React** (with hooks — useState, useMemo, useEffect, useCallback)
- **Vite** as the build tool
- **Chart.js** for the visualizations
- **Vanilla CSS** for styling (no CSS frameworks — wanted full control over the design)
- **localStorage** for data persistence

### Styling Approach

I went with a dark-mode only design since finance dashboards tend to be used for longer sessions and dark mode is easier on the eyes. The color palette uses a muted dark background with accent colors (green for income, red for expenses) which is fairly standard for finance UIs. Used Google Fonts (Syne, DM Sans, DM Mono) for a clean, modern look.

---

## Features

### 1. Dashboard Overview
- Four summary cards: Total Balance, Total Income, Total Expenses, Savings Rate
- **Balance Trend** — a line chart showing income vs expenses over the last 6 or 12 months
- **Spending Breakdown** — a donut chart showing expenses by category
- Recent transactions list with a "View all" link

### 2. Transactions
- Full list of all transactions with date, amount, category, and type
- **Filtering**: by type (All / Income / Expense) and by category
- **Sorting**: newest, oldest, highest amount, lowest amount
- **Search**: real-time search across description and category (via the topbar)
- **Add Transaction** (Admin only): modal form with validation
- **Delete Transaction** (Admin only): per-row delete button
- **Export to CSV**: downloads all current transactions as a CSV file

### 3. Role-Based UI (Frontend Simulation)
- Two roles: **Admin** and **Viewer**
- Role is switched via a dropdown in the sidebar footer
- **Admin**: can add and delete transactions
- **Viewer**: read-only access; buttons are visible but disabled with feedback toast
- Role is persisted in localStorage across page refreshes

### 4. Insights
- **Top Spending Category** — highlights the category you're spending the most on
- **Monthly Savings** — shows last month's savings and savings rate
- **Expense Ratio** — what percentage of income is being spent
- **Monthly Comparison Chart** — grouped bar chart comparing income vs expenses per month
- **Category Breakdown** — ranked list with progress bars
- **Key Observations** — auto-generated personalized text insights based on the data

### 5. State Management
I kept it simple and used React's built-in hooks without any external state library. The state lives in `App.jsx` and gets passed down via props. For this scale of app I didn't think it justified adding Redux or Zustand — the data flow is clear and manageable. 

Persisted state:
- `fintrak_tx` — transactions array (localStorage)
- `fintrak_role` — active role (localStorage)

---

## Project Structure

```
src/
├── components/
│   ├── Sidebar.jsx       # Navigation + role switcher
│   ├── Topbar.jsx        # Search + page title + export button
│   └── CatChip.jsx       # Category badge pill
├── pages/
│   ├── Dashboard.jsx     # Main overview with charts
│   ├── Transactions.jsx  # Full transactions list + CRUD
│   └── Insights.jsx      # Spending insights and observations
├── data/
│   └── mockData.js       # Seed transactions + category color config
├── utils/
│   └── helpers.js        # fmt (currency), fmtDate, buildMonthlyData
├── App.jsx               # Root — state management + routing
├── index.css             # All styles
└── main.jsx
```

---

## Assumptions Made

- All amounts are in **Indian Rupees (₹)**
- No backend — all data is mock/seed data stored in localStorage
- "Role-based" = frontend-only simulation for demo purposes
- Transactions added by the user persist across refreshes via localStorage; resetting localStorage will restore seed data

---

## What I'd improve with more time

- Edit transaction (not just add/delete)
- Date range filter on the transactions page
- Monthly budget targets and alerts
- Better mobile layout for charts
- Unit tests for the helpers and filter logic
