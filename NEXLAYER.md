# Nexlayer — stock-tracker

<!-- nexlayer:meta version=1 analyzed=2026-06-17T20:45:35Z repo=https://github.com/FrankHonore/stock-tracker branch=main -->

> **For AI agents (Claude Code, Cursor, Gemini CLI, Copilot):**
> This file is the **project context** for this Nexlayer deployment — tech stack, env vars, secrets, live URL.
> For full platform detail (nexlayer.yaml schema, Dockerfile rules, CI/CD, task recipes) read **`nexlayer.skills`** in this repo.
>
> **Critical rules (full detail in `nexlayer.skills`):**
> - Inter-pod refs: `${podName:port}` only — never `localhost` or bare hostnames
> - Docker Hub images: prefix with `mirror.gcr.io/library/` — bare tags fail on the cluster
> - Secrets: set in the Nexlayer dashboard — never commit to `nexlayer.yaml` or Dockerfile
>
> **This file:** `agent-managed` sections update automatically. `user-editable` sections (Local Development Setup, Nexlayer Deployment Plan, Build Notes) are yours — preserved across re-analysis.

## Project Summary
<!-- nexlayer:section agent-managed=project_summary -->
A real-time stock tracking application that builds 1-minute OHLC candles from Public.com's API, featuring an interactive React dashboard and a Node.js/PostgreSQL backend for user authentication.
<!-- nexlayer:end -->

## Technology Stack
<!-- nexlayer:section agent-managed=tech_stack -->
| Name | Kind | Version | Detected From |
|------|------|---------|---------------|
| React | framework | 19.2.0 | package.json |
| Vite | build | 7.1.11 | package.json |
| Node.js | language | 20 | Dockerfile |
| PostgreSQL | database | 12+ | README.md |
| Tailwind CSS | framework | 4.1.15 | package.json |
| Nginx | infra | alpine | Dockerfile |
| Express | framework | latest | README.md |
<!-- nexlayer:end -->

## Repository Structure
<!-- nexlayer:section agent-managed=structure_map -->
- src/ — React frontend source code
- server/ — Node.js backend logic and Express API
- public/ — Static assets
- nginx.conf — Nginx configuration for serving the production build
<!-- nexlayer:end -->

## External Services Required
<!-- nexlayer:section agent-managed=external_deps -->
Services that must be configured separately (not deployed by Nexlayer):

- Public.com API (VITE_PUBLIC_API_SECRET)
<!-- nexlayer:end -->

## Local Development Setup
<!-- nexlayer:section user-editable=local_setup -->
### Prerequisites

- Node.js >= 20
- npm
- PostgreSQL >= 12

### Environment variables

Copy `.env.example` to `.env.local` and fill in:

```
VITE_PUBLIC_API_SECRET=your_public_api_secret_here
DATABASE_URL=postgresql://localhost:5432/stock_tracker
```

### Steps

1. `npm install` — Install frontend and backend dependencies
2. `npm run dev` — Start Vite development server
3. `cd server && npm install && npm start` — Start backend server (if applicable in server dir)

<!-- nexlayer:end -->

## Nexlayer Setup
<!-- nexlayer:section agent-managed=nexlayer_setup -->
### Pod Environment Variables

| Pod | Variable | Value | Kind |
|-----|----------|-------|------|
| `backend` | `PORT` | `"5000"` | plain |
| `backend` | `NODE_ENV` | `production` | plain |
| `backend` | `CLIENT_URL` | `<% URL %>` | plain |
| `backend` | `DB_HOST` | `database.pod` | plain |
| `backend` | `DB_PORT` | `"5432"` | plain |
| `backend` | `DB_NAME` | `stock_tracker` | plain |
| `backend` | `DB_USER` | `postgres` | plain |
| `backend` | `DB_PASSWORD` | _(set via Nexlayer dashboard)_ | secret |
| `backend` | `JWT_SECRET` | _(set via Nexlayer dashboard)_ | secret |
| `backend` | `JWT_EXPIRES_IN` | _(set via Nexlayer dashboard)_ | secret |
| `backend` | `ENCRYPTION_KEY` | `0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef` | plain |
| `database` | `POSTGRES_DB` | `stock_tracker` | plain |
| `database` | `POSTGRES_USER` | `postgres` | plain |
| `database` | `POSTGRES_PASSWORD` | _(set via Nexlayer dashboard)_ | secret |
| `database` | `PGDATA` | `/var/lib/postgresql/data/pgdata` | plain |
| `postgres-data` | `size` | `2Gi` | plain |
| `postgres-data` | `mountPath` | `/var/lib/postgresql` | plain |
| `migrate` | `DB_HOST` | `database.pod` | plain |
| `migrate` | `DB_PORT` | `"5432"` | plain |
| `migrate` | `DB_NAME` | `stock_tracker` | plain |
| `migrate` | `DB_USER` | `postgres` | plain |
| `migrate` | `DB_PASSWORD` | _(set via Nexlayer dashboard)_ | secret |

### Secrets Required

Set these in the Nexlayer dashboard before deploying:

- `DB_PASSWORD` (`backend` pod)
- `JWT_SECRET` (`backend` pod)
- `JWT_EXPIRES_IN` (`backend` pod)
- `POSTGRES_PASSWORD` (`database` pod)
- `DB_PASSWORD` (`migrate` pod)

### nexlayer.yaml

```yaml
application:
  name: stock-tracker
  pods:
    # Frontend - React + Vite app served by nginx (with Alpha Vantage API key)
    - name: frontend
      image: registry.nexlayer.io/nexlayer-mcp/27f238fc-e737-436b-a116-fd53ad2006a5/stock-tracker-1fc3e8ab-frontend:10802772-1761094043
      path: /
      servicePorts:
        - 80

    # Backend - Express API server
    - name: backend
      image: registry.nexlayer.io/nexlayer-mcp/bd8e4fe1-89c6-4a88-9474-98bb99b9fe2b/stock-tracker-dd3a397d-backend:b1c04bf7-1761092699
      servicePorts:
        - 5000
      vars:
        PORT: "5000"
        NODE_ENV: production
        CLIENT_URL: <% URL %>
        DB_HOST: database.pod
        DB_PORT: "5432"
        DB_NAME: stock_tracker
        DB_USER: postgres
        DB_PASSWORD: nexlayer_postgres_2024
        JWT_SECRET: nexlayer_jwt_secret_change_in_production_2024
        JWT_EXPIRES_IN: 7d
        ENCRYPTION_KEY: 0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef

    # Database - PostgreSQL
    - name: database
      image: postgres:16-alpine
      servicePorts:
        - 5432
      vars:
        POSTGRES_DB: stock_tracker
        POSTGRES_USER: postgres
        POSTGRES_PASSWORD: nexlayer_postgres_2024
        PGDATA: /var/lib/postgresql/data/pgdata
      volumes:
        - name: postgres-data
          size: 2Gi
          mountPath: /var/lib/postgresql

    # Database Migration - Runs schema initialization
    - name: migrate
      image: registry.nexlayer.io/nexlayer-mcp/1aca0497-32cf-4760-b771-d5099f049888/stock-tracker-dd3a397d-migrate:ffe59e9e-1761093457
      servicePorts:
        - 5000
      vars:
        DB_HOST: database.pod
        DB_PORT: "5432"
        DB_NAME: stock_tracker
        DB_USER: postgres
        DB_PASSWORD: nexlayer_postgres_2024
```

<!-- nexlayer:end -->

## Nexlayer Deployment Plan
<!-- nexlayer:section user-editable=deployment_plan -->
### Pod Topology

| Pod | Image | Port | Role |
|-----|-------|------|------|
| frontend | mirror.gcr.io/library/nginx:alpine | 80 | web |
| backend | mirror.gcr.io/library/node:20-alpine | 3000 | web |
| db | mirror.gcr.io/library/postgres:16-alpine | 5432 | database |

### Inter-pod environment variables

- `backend` pod: `DATABASE_URL=${db:5432}`

### Deployment notes

- Frontend pod serves static files via Nginx; communicates with backend via ${backend:3000}
- Backend pod connects to database using ${db:5432} syntax
- Database is decoupled into a standalone pod per Nexlayer rules
- All images sourced from mirror.gcr.io to comply with cluster restrictions

<!-- nexlayer:end -->

## Build Notes
<!-- nexlayer:section user-editable=build_notes -->
<!-- Add notes for future builds here — preserved across re-analysis -->
<!-- nexlayer:end -->

## Nexlayer Configuration
<!-- nexlayer:section agent-managed=nexlayer_config -->
**Last deployed:** 2026-06-17T20:46:43Z  
**Live URL:** https://original-lavender-stock-tracker.cloud.nexlayer.ai  
**Runtime:**  · **Port:** auto-detected  
**Deploy branch:** main  

```yaml
application:
  name: stock-tracker
  pods:
    # Frontend - React + Vite app served by nginx (with Alpha Vantage API key)
    - name: frontend
      image: registry.nexlayer.io/nexlayer-mcp/27f238fc-e737-436b-a116-fd53ad2006a5/stock-tracker-1fc3e8ab-frontend:10802772-1761094043
      path: /
      servicePorts:
        - 80

    # Backend - Express API server
    - name: backend
      image: registry.nexlayer.io/nexlayer-mcp/bd8e4fe1-89c6-4a88-9474-98bb99b9fe2b/stock-tracker-dd3a397d-backend:b1c04bf7-1761092699
      servicePorts:
        - 5000
      vars:
        PORT: "5000"
        NODE_ENV: production
        CLIENT_URL: <% URL %>
        DB_HOST: database.pod
        DB_PORT: "5432"
        DB_NAME: stock_tracker
        DB_USER: postgres
        DB_PASSWORD: nexlayer_postgres_2024
        JWT_SECRET: nexlayer_jwt_secret_change_in_production_2024
        JWT_EXPIRES_IN: 7d
        ENCRYPTION_KEY: 0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef

    # Database - PostgreSQL
    - name: database
      image: postgres:16-alpine
      servicePorts:
        - 5432
      vars:
        POSTGRES_DB: stock_tracker
        POSTGRES_USER: postgres
        POSTGRES_PASSWORD: nexlayer_postgres_2024
        PGDATA: /var/lib/postgresql/data/pgdata
      volumes:
        - name: postgres-data
          size: 2Gi
          mountPath: /var/lib/postgresql

    # Database Migration - Runs schema initialization
    - name: migrate
      image: registry.nexlayer.io/nexlayer-mcp/1aca0497-32cf-4760-b771-d5099f049888/stock-tracker-dd3a397d-migrate:ffe59e9e-1761093457
      servicePorts:
        - 5000
      vars:
        DB_HOST: database.pod
        DB_PORT: "5432"
        DB_NAME: stock_tracker
        DB_USER: postgres
        DB_PASSWORD: nexlayer_postgres_2024
```
<!-- nexlayer:end -->

## Build History
<!-- nexlayer:section agent-managed=build_history -->
| Date | Status | Notes |
|------|--------|-------|
| 2026-06-17T20:45:35Z | analyzed | initial repo analysis |
| 2026-06-17T20:46:43Z | success | deployed https://original-lavender-stock-tracker.cloud.nexlayer.ai |
<!-- nexlayer:end -->
