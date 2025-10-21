# Stock Tracker Backend API

Express.js backend with PostgreSQL, JWT authentication, and encrypted Webull credential storage.

## Quick Start

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Set up environment variables:
\`\`\`bash
cp .env.example .env
# Edit .env with your configuration
\`\`\`

3. Run database migrations:
\`\`\`bash
npm run migrate
\`\`\`

4. Start the server:
\`\`\`bash
npm run dev  # Development with auto-reload
npm start    # Production
\`\`\`

## Environment Variables

Required variables in \`.env\`:

- \`PORT\` - Server port (default: 5000)
- \`NODE_ENV\` - Environment (development/production)
- \`DB_HOST\` - PostgreSQL host
- \`DB_PORT\` - PostgreSQL port
- \`DB_NAME\` - Database name
- \`DB_USER\` - Database user
- \`DB_PASSWORD\` - Database password
- \`JWT_SECRET\` - Secret for JWT signing
- \`JWT_EXPIRES_IN\` - Token expiration time
- \`ENCRYPTION_KEY\` - 32-byte hex key for AES encryption
- \`CLIENT_URL\` - Frontend URL for CORS

## API Routes

### Auth Routes (\`/api/auth\`)
- \`POST /register\` - Register new user
- \`POST /login\` - Login user
- \`GET /profile\` - Get current user (protected)
- \`PUT /profile\` - Update user (protected)

### Webull Routes (\`/api/webull\`)
All routes require authentication.

- \`POST /credentials\` - Store Webull credentials
- \`GET /credentials\` - Get stored credentials
- \`DELETE /credentials\` - Delete credentials
- \`GET /stock-data?tickerId=AAPL\` - Fetch stock data
- \`POST /test-auth\` - Test Webull authentication

## Database Schema

### Users Table
- \`id\` - Serial primary key
- \`email\` - Unique email address
- \`username\` - Unique username
- \`password_hash\` - Bcrypt hashed password
- \`created_at\` - Timestamp
- \`updated_at\` - Timestamp

### Webull Credentials Table
- \`id\` - Serial primary key
- \`user_id\` - Foreign key to users
- \`webull_email_or_phone\` - Webull login identifier
- \`webull_password_encrypted\` - AES-256-GCM encrypted password
- \`mfa_enabled\` - Boolean
- \`last_authenticated\` - Timestamp
- \`created_at\` - Timestamp
- \`updated_at\` - Timestamp

## Security Features

- **Password Hashing**: bcryptjs with 10 rounds
- **JWT Tokens**: Signed tokens with configurable expiration
- **AES-256-GCM Encryption**: For Webull credentials
- **PBKDF2**: Key derivation for encryption
- **Helmet**: Security headers
- **CORS**: Configured for specific origin
- **Rate Limiting**: 100 requests per 15 minutes per IP

## Project Structure

\`\`\`
server/
├── src/
│   ├── config/
│   │   ├── database.js       # PostgreSQL connection pool
│   │   ├── schema.sql        # Database schema
│   │   └── migrate.js        # Migration runner
│   ├── controllers/
│   │   ├── authController.js # Auth logic
│   │   └── webullController.js # Webull integration
│   ├── middleware/
│   │   ├── auth.js           # JWT verification
│   │   └── validation.js     # Input validation
│   ├── models/
│   │   ├── User.js           # User model
│   │   └── WebullCredential.js # Credential model
│   ├── routes/
│   │   ├── auth.js           # Auth routes
│   │   └── webull.js         # Webull routes
│   ├── utils/
│   │   ├── encryption.js     # AES encryption/decryption
│   │   └── jwt.js            # JWT utilities
│   └── server.js             # Main application
├── package.json
├── .env.example
└── README.md
\`\`\`

## Development

The server uses ES modules (\`type: "module"\` in package.json).

To add new routes:
1. Create controller in \`controllers/\`
2. Create route file in \`routes/\`
3. Import and use in \`server.js\`

To modify database:
1. Update \`schema.sql\`
2. Run \`npm run migrate\`
