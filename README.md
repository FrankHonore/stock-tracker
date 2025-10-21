# Stock Tracker with Webull Integration

A real-time stock tracking application with user authentication and secure Webull credential storage.

## Features

- **Real-time Stock Data**: 1-minute candle data from Webull's API
- **User Authentication**: Secure JWT-based authentication
- **Webull Credentials**: Encrypted storage of Webull login credentials
- **Interactive Charts**: Line charts showing high/low/close prices
- **Auto-refresh**: Data updates every 60 seconds
- **Responsive Design**: Built with Tailwind CSS

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
- PostgreSQL (v12 or higher)
- npm or yarn

## Setup Instructions

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

### 1. Create an Account

1. Open http://localhost:3000
2. Click "Login / Sign Up"
3. Switch to "Sign Up" tab
4. Enter email, username, and password
5. Click "Sign Up"

### 2. Add Webull Credentials

1. After logging in, click "Add Webull Credentials"
2. Enter your Webull email or phone (format: +1-5555555555)
3. Enter your Webull password
4. Check MFA if you have multi-factor auth enabled
5. Click "Save Credentials"

**Security Notes:**
- Credentials are encrypted using AES-256-GCM
- Passwords are never stored in plain text
- The encryption key must be kept secret

### 3. Track Stocks

1. Enter a stock ticker (e.g., AAPL, TSLA, MSFT)
2. Click "Track"
3. View real-time candle data, charts, and price changes
4. Data refreshes automatically every 60 seconds

## API Endpoints

### Authentication
- \`POST /api/auth/register\` - Register new user
- \`POST /api/auth/login\` - Login user
- \`GET /api/auth/profile\` - Get user profile (requires auth)
- \`PUT /api/auth/profile\` - Update profile (requires auth)

### Webull Integration
- \`POST /api/webull/credentials\` - Store Webull credentials (requires auth)
- \`GET /api/webull/credentials\` - Get stored credentials (requires auth)
- \`DELETE /api/webull/credentials\` - Delete credentials (requires auth)
- \`GET /api/webull/stock-data?tickerId=AAPL\` - Fetch stock data (requires auth)
- \`POST /api/webull/test-auth\` - Test Webull authentication (requires auth)

## Security Considerations

⚠️ **Important Security Notes:**

1. **Unofficial API**: This app uses unofficial Webull APIs that may change or break at any time
2. **Credential Storage**: Storing user credentials is a significant security liability
3. **Outdated Packages**: The \`webull-api-ts\` package is 5 years old and in BETA
4. **Production Use**: Not recommended for production without thorough security audit
5. **Encryption Keys**: Never commit \`.env\` file or encryption keys to version control
6. **HTTPS**: Use HTTPS in production to protect data in transit

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
