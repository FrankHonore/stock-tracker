# Migration Dockerfile - Runs database schema initialization
FROM node:20-alpine

WORKDIR /app

# Install PostgreSQL client for debugging
RUN apk add --no-cache postgresql-client

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy migration files
COPY src/config/migrate.js ./src/config/migrate.js
COPY src/config/schema.sql ./src/config/schema.sql
COPY src/config/database.js ./src/config/database.js

# Set environment to ensure migration runs
ENV NODE_ENV=production

# Run migration and keep container alive for verification
CMD ["node", "src/config/migrate.js"]
