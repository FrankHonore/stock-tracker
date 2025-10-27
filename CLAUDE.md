# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A real-time stock tracking application built with React and Vite that displays 1-minute candle data built from Public.com's real-time quote API. The app polls for quotes every 5 seconds, constructs 1-minute OHLC (Open/High/Low/Close) candles, and provides live price updates and charts for stock tickers.

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
1. On app load, exchange Public.com API secret for access token (App.jsx:35-84)
2. Get accountId from Public.com API (App.jsx:65-77)
3. User enters ticker symbol
4. `fetchQuote()` fetches real-time quote from Public.com API (App.jsx:139-189)
5. `updateCandleFromQuote()` builds 1-minute OHLC candles from quotes (App.jsx:192-234)
6. Quotes polled every 5 seconds to update current candle (App.jsx:289-309)
7. New candle created every minute, maintaining rolling 60-candle history
8. Charts and table update reactively

**API Integration:**
- **Authentication:**
  - Exchange API secret for access token: `POST https://api.public.com/userapiauthservice/personal/access-tokens`
  - Get account info: `GET https://api.public.com/userapigateway/trading/account`
- **Quote Endpoint:** `POST https://api.public.com/userapigateway/marketdata/{accountId}/quotes`
- **Authentication:** Bearer token in Authorization header
- **Request Body:** JSON with instruments array (symbol, type: 'EQUITY')
- **Response:** Quote data including last price, timestamp, bid, ask, volume
- **Polling Frequency:** Every 5 seconds to build real-time candles

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

**Real-time Quote Polling:**
- Uses `quoteIntervalRef` to store quote polling interval ID
- Polls Public.com API every 5 seconds for real-time quotes
- Clears existing interval before creating new one (prevents multiple intervals)
- Cleanup in useEffect return function (App.jsx:322-330) prevents memory leaks

**Candle Building Logic:**
- Each quote updates the current minute's candle (open, high, low, close)
- When a new minute starts, previous candle is saved to history
- Maintains rolling 60-candle history (last 60 minutes)
- Current candle tracked in `currentMinuteCandle` state

**Price Calculation:**
- Price change % calculated from first candle's open to current price
- Updates on every quote (every 5 seconds)

**Data Formatting:**
- Times formatted as locale string with 2-digit hour/minute in America/New_York timezone
- Volumes displayed in millions (e.g., "2.5M")
- Prices fixed to 2 decimal places

**API Configuration:**
- Requires `VITE_PUBLIC_API_SECRET` in .env file
- Secret obtained from Public.com account settings > Security > API Keys
- Access token refreshed with 60-minute validity

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
