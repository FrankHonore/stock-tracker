# Stock Tracker with Public.com API

A real-time stock tracking application that builds 1-minute OHLC candles from Public.com's real-time quote API.

## Features

- **Real-time Stock Data**: 1-minute candle data built from Public.com API quotes
- **Quote Polling**: Fetches quotes every 5 seconds to build accurate OHLC candles
- **Live Candle Building**: Constructs open/high/low/close data in real-time
- **Interactive Charts**: Line charts showing high/low/close prices
- **Rolling History**: Maintains last 60 minutes of candle data
- **Responsive Design**: Built with Tailwind CSS
- **User Authentication**: Secure JWT-based authentication (optional)
- **Webull Integration**: Legacy support for Webull credentials (optional)

## Tech Stack

### Frontend
- React 19.2.0
- Vite 7.1.11
- Tailwind CSS 4.1.15
- Recharts 3.3.0
- Lucide React (icons)

### Backend
- Node.js with Express
- PostgreSQL database
- JWT authentication
- AES-256-GCM encryption
- bcryptjs for password hashing

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- **Public.com Account** with API access
- PostgreSQL (v12 or higher) - Optional, only needed for user authentication features

## Quick Start (Frontend Only)

If you just want to use the stock tracker without backend features:

### 1. Get Public.com API Credentials

1. Create or login to your account at [public.com](https://public.com)
2. Navigate to Account Settings → Security → API Keys
3. Generate a new API secret key
4. Copy the secret key (you'll need it in the next step)

### 2. Configure Environment Variables

**For Local Development:**

```bash
# Copy the .env example file
cp .env.example .env
```

Edit `.env` and add your Public.com API secret:

```env
VITE_PUBLIC_API_SECRET=your_public_api_secret_here
```

**For Production (GitHub Actions):**

See the [GitHub Secrets Setup](#github-secrets-setup) section below.

### 3. Install and Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will open at http://localhost:3000. Enter a stock ticker (e.g., AAPL) and click "Track" to see real-time data!

## GitHub Secrets Setup

For production builds using GitHub Actions, store your API secret securely using GitHub Secrets instead of committing it to your repository.

### Step 1: Add Secret to GitHub Repository

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add the following secret:
   - **Name**: `VITE_PUBLIC_API_SECRET`
   - **Value**: Your Public.com API secret key
5. Click **Add secret**

### Step 2: GitHub Actions Workflow

A GitHub Actions workflow is already configured in `.github/workflows/build.yml` that:

- ✅ Automatically builds your app on every push to main
- ✅ Uses the GitHub secret for the API key (never exposed in code)
- ✅ Creates build artifacts you can download
- ✅ Optionally deploys to GitHub Pages (commented out by default)

### Step 3: Verify the Build

1. Push your code to GitHub
2. Go to the **Actions** tab in your repository
3. You should see the "Build and Deploy" workflow running
4. Once complete, download the build artifacts from the workflow run

### Step 4: Enable GitHub Pages Deployment (Optional)

To automatically deploy to GitHub Pages:

1. Uncomment the `deploy` job in `.github/workflows/build.yml`
2. Go to **Settings** → **Pages**
3. Under **Source**, select "GitHub Actions"
4. Push to main branch - your app will automatically deploy!

### Security Benefits

✅ **API keys never committed to repository**
✅ **Secrets encrypted by GitHub**
✅ **Different secrets per environment (dev/prod)**
✅ **Only accessible to authorized workflow runs**
✅ **Can be rotated without code changes**

## Full Setup Instructions (with Backend)

### 1. Database Setup

Install and start PostgreSQL, then create the database:

\`\`\`bash
# On macOS with Homebrew
brew install postgresql
brew services start postgresql

# Create database
createdb stock_tracker

# Or use psql
psql postgres
CREATE DATABASE stock_tracker;
\q
\`\`\`

### 2. Backend Setup

\`\`\`bash
# Navigate to server directory
cd server

# Install dependencies (already done if you ran npm install earlier)
npm install

# Copy environment template
cp .env.example .env
\`\`\`

### 3. Configure Environment Variables

Edit \`server/.env\` with your settings:

\`\`\`env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=stock_tracker
DB_USER=postgres
DB_PASSWORD=your_postgres_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRES_IN=7d

# Encryption Key (generate using: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
ENCRYPTION_KEY=your_64_character_hex_key_here

# CORS Configuration
CLIENT_URL=http://localhost:3000
\`\`\`

### 4. Generate Encryption Key

Generate a secure encryption key:

\`\`\`bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
\`\`\`

Copy the output and use it as your \`ENCRYPTION_KEY\` in \`.env\`.

### 5. Run Database Migrations

\`\`\`bash
# From the server directory
npm run migrate
\`\`\`

You should see: "✓ Database migrations completed successfully"

### 6. Start the Backend Server

\`\`\`bash
# Development mode with auto-reload
npm run dev

# Or production mode
npm start
\`\`\`

Server will start on http://localhost:5000

### 7. Frontend Setup

\`\`\`bash
# From the project root
npm install

# Start development server
npm run dev
\`\`\`

Frontend will start on http://localhost:3000

## Usage

### Track Stocks

1. Open http://localhost:3000
2. Enter a stock ticker symbol (e.g., AAPL, TSLA, MSFT)
3. Click "Track"
4. Watch real-time candle data build:
   - Quotes fetched every 5 seconds
   - 1-minute candles constructed in real-time
   - Charts and price changes update live
   - Rolling 60-minute history maintained

### How It Works

The app uses Public.com's real-time quote API to build traditional candlestick data:

1. **Quote Polling**: Every 5 seconds, the app fetches the current stock quote
2. **Candle Building**: Each quote updates the current minute's OHLC data:
   - **Open**: First quote price of the minute
   - **High**: Highest quote price seen in the minute
   - **Low**: Lowest quote price seen in the minute
   - **Close**: Most recent quote price
   - **Volume**: Total trading volume
3. **History**: When a new minute starts, the previous candle is saved to history
4. **Display**: Charts and tables update automatically to show the latest data

### Optional: User Authentication (Backend Required)

If you've set up the backend server:

1. Click "Login / Sign Up"
2. Create an account or sign in
3. Optionally add Webull credentials (legacy feature)

**Security Notes:**
- Credentials are encrypted using AES-256-GCM
- Passwords are never stored in plain text
- The encryption key must be kept secret

## API Endpoints

### Public.com API (External)

The app uses these Public.com API endpoints:

**Authentication:**
- \`POST https://api.public.com/userapiauthservice/personal/access-tokens\`
  - Exchange API secret for access token
  - Request: \`{ "secret": "...", "validityInMinutes": 60 }\`
  - Response: \`{ "accessToken": "..." }\`

**Market Data:**
- \`GET https://api.public.com/userapigateway/trading/account\`
  - Get account information (including accountId)
  - Requires: Bearer token in Authorization header

- \`POST https://api.public.com/userapigateway/marketdata/{accountId}/quotes\`
  - Get real-time stock quotes
  - Request: \`{ "instruments": [{ "symbol": "AAPL", "type": "EQUITY" }] }\`
  - Response: Quote data including last price, bid, ask, volume
  - Polled every 5 seconds by the app

### Backend API (Optional)

If using the backend server:

**Authentication:**
- \`POST /api/auth/register\` - Register new user
- \`POST /api/auth/login\` - Login user
- \`GET /api/auth/profile\` - Get user profile (requires auth)
- \`PUT /api/auth/profile\` - Update profile (requires auth)

**Webull Integration (Legacy):**
- \`POST /api/webull/credentials\` - Store Webull credentials (requires auth)
- \`GET /api/webull/credentials\` - Get stored credentials (requires auth)
- \`DELETE /api/webull/credentials\` - Delete credentials (requires auth)
- \`GET /api/webull/stock-data?tickerId=AAPL\` - Fetch stock data (requires auth)
- \`POST /api/webull/test-auth\` - Test Webull authentication (requires auth)

## Security Considerations

⚠️ **Important Security Notes:**

### Public.com API
1. **✅ Use GitHub Secrets**: For production, always use GitHub Secrets (see [GitHub Secrets Setup](#github-secrets-setup))
2. **API Secret Protection**: Never commit your \`.env\` file or Public.com API secret to version control
3. **Client-Side Exposure**: The API secret is embedded in the built JavaScript - consider using a backend proxy for sensitive production apps
4. **Access Token**: Tokens expire after the configured validity period (60 minutes by default)
5. **API Usage**: Respect Public.com's API rate limits and terms of service
6. **Local Development**: Use \`.env\` files for local development only (already in .gitignore)

### Legacy Webull Integration (Optional)
1. **Unofficial API**: Uses unofficial Webull APIs that may change or break at any time
2. **Credential Storage**: Storing user credentials is a significant security liability
3. **Outdated Packages**: The \`webull-api-ts\` package is 5 years old and in BETA
4. **Encryption Keys**: Never commit encryption keys to version control
5. **HTTPS**: Use HTTPS in production to protect data in transit

### Recommended for Production:
- Use official Webull API if available
- Implement OAuth2 instead of storing credentials
- Use a secrets management service (AWS Secrets Manager, HashiCorp Vault)
- Enable SSL/TLS
- Implement rate limiting and brute force protection
- Add comprehensive logging and monitoring
- Regular security audits

## Project Structure

\`\`\`
stock-tracker/
├── server/                 # Backend API
│   ├── src/
│   │   ├── config/        # Database config and migrations
│   │   ├── controllers/   # Route handlers
│   │   ├── middleware/    # Auth and validation middleware
│   │   ├── models/        # Database models
│   │   ├── routes/        # API routes
│   │   ├── utils/         # Encryption and JWT utilities
│   │   └── server.js      # Main server file
│   ├── package.json
│   └── .env.example
│
├── src/                   # Frontend React app
│   ├── components/        # React components
│   │   ├── AuthModal.jsx
│   │   └── WebullCredentialsModal.jsx
│   ├── App.jsx           # Main app component
│   ├── main.jsx          # Entry point
│   └── index.css         # Global styles
│
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
\`\`\`

## Troubleshooting

### Database Connection Issues
\`\`\`bash
# Check PostgreSQL is running
brew services list

# Restart PostgreSQL
brew services restart postgresql

# Check database exists
psql -l
\`\`\`

### Migration Errors
\`\`\`bash
# Drop and recreate database
dropdb stock_tracker
createdb stock_tracker

# Run migrations again
cd server && npm run migrate
\`\`\`

### CORS Errors
- Ensure backend is running on port 5000
- Check \`CLIENT_URL\` in server/.env matches frontend URL

### Authentication Errors
- Verify JWT_SECRET is set in .env
- Check token is being sent in Authorization header
- Clear localStorage and login again

## Development

\`\`\`bash
# Run frontend dev server
npm run dev

# Run backend dev server
cd server && npm run dev

# Build for production
npm run build
\`\`\`

## License

ISC

## Disclaimer

This application is for educational purposes only. Use of unofficial APIs and storage of third-party credentials carries inherent risks. Always follow best security practices and comply with all relevant terms of service.
