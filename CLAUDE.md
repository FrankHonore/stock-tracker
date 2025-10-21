# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A real-time stock tracking application built with React and Vite that displays 1-minute candle data from Webull's API. The app provides live price updates, charts, and detailed OHLC (Open/High/Low/Close) data for stock tickers.

## Development Commands

**Start development server:**
```bash
npm run dev
```
- Runs on port 3000 by default (configured in vite.config.js:7)
- Automatically opens browser

**Build for production:**
```bash
npm run build
```

## Architecture

### Tech Stack
- **Frontend Framework:** React 19.2.0 with hooks (useState, useEffect, useRef)
- **Build Tool:** Vite 7.1.11
- **Styling:** Tailwind CSS 4.1.15
- **Charts:** Recharts 3.3.0 (LineChart component)
- **Icons:** Lucide React 0.546.0

### Application Structure

The app is a single-page application with all main logic in `src/App.jsx`:

**State Management:**
- All state managed with React hooks (no external state library)
- Key state: `candleData` (array of OHLC data), `ticker`, `currentTicker`, `lastPrice`, `priceChange`
- Uses `useRef` for interval management to prevent memory leaks

**Data Flow:**
1. User enters ticker symbol
2. `fetchStockData()` (App.jsx:15) fetches from Webull API
3. Data transformed into chart-friendly format with timestamps (App.jsx:29-40)
4. Auto-refresh every 60 seconds via setInterval (App.jsx:69-71)
5. Charts and table update reactively

**API Integration:**
- Endpoint: `https://quotes-gw.webullfintech.com/api/stock/capitalflow/ticker`
- Parameters: `tickerId`, `type=1m`, `count=60`
- Response contains OHLC candle data with timestamps
- No authentication required

### Key Components

**StockTracker (src/App.jsx):**
- Main component exported as default
- Handles data fetching, state, and auto-refresh logic
- Contains CustomTooltip sub-component (App.jsx:88) for chart hover details

**Data Display:**
- Summary card showing current price and % change (App.jsx:140-158)
- LineChart with three lines: High (blue), Close (green), Low (red) (App.jsx:163-205)
- Table showing last 10 candles in reverse chronological order (App.jsx:209-243)

### Important Implementation Details

**Auto-refresh Pattern:**
- Uses `intervalRef` to store setInterval ID
- Clears existing interval before creating new one (prevents multiple intervals)
- Cleanup in useEffect return function (App.jsx:80-86) prevents memory leaks

**Price Calculation:**
- Price change % calculated from first to last candle in dataset (App.jsx:48)
- Not from market open, just from first data point received

**Data Formatting:**
- Times formatted as locale string with 2-digit hour/minute (App.jsx:30-32)
- Volumes displayed in millions (e.g., "2.5M")
- Prices fixed to 2 decimal places

## File Organization

```
src/
  App.jsx       - Main StockTracker component (single component architecture)
  main.jsx      - React app entry point
  index.css     - Global styles and Tailwind imports
```

## Configuration Files

- `vite.config.js` - Dev server on port 3000, auto-open browser
- `tailwind.config.js` - Scans all JSX/TSX files in src/ and index.html
- `package.json` - CommonJS module type, no test script configured
