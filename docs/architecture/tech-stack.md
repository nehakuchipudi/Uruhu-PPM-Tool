# URUHU PPM TOOL - TECH STACK ANALYSIS

**Last Updated**: 2026-01-28
**Branch**: feature/docker
**Status**: Migrated to Fastify + pnpm Workspace

---

## 1) FRONTEND

### Core Framework
- **React** 18.3.1 + **TypeScript** 5.9.3
- **Vite** 6.3.5 (build tool & dev server)

### Styling & Theming
- **Tailwind CSS** 4.1.12 (utility-first CSS)
- **Material-UI (MUI)** 7.3.5 + Emotion CSS-in-JS
- **next-themes** 0.4.6 (dark mode support)

### UI Component Libraries
- **Radix UI** (20+ accessible components: dialogs, dropdowns, menus, tooltips, etc.)
- **MUI Icons** 7.3.5 + **Lucide React** 0.487.0

### Data Visualization
- **Recharts** 2.15.2 (charts & graphs)

### Forms & Input
- **React Hook Form** 7.55.0
- **react-day-picker** 8.10.1
- **input-otp** 1.4.2

### Interactions & UX
- **Motion** 12.23.24 (animations, formerly Framer Motion)
- **react-dnd** 16.0.1 (drag & drop)
- **embla-carousel-react** 8.6.0
- **react-resizable-panels** 2.1.7
- **sonner** 2.0.3 (toast notifications)

### Utilities
- **date-fns** 3.6.0
- **clsx** / **tailwind-merge** / **class-variance-authority** (styling utilities)

---

## 2) BACKEND

### Runtime & Framework
- **Node.js** (ES2020 target)
- **Fastify** 5.2.0 (high-performance web framework)
- **TypeScript** 5.9.3 + **ts-node** 10.9.2

### Fastify Plugins
- **@fastify/cors** 10.0.1 (CORS handling)
- **@fastify/multipart** 9.0.1 (file upload support)

### Database
- **PostgreSQL** (primary database)
- **Prisma ORM** 7.3.0 (with pg adapter 7.3.0)
- **pg** 8.17.2 (PostgreSQL client driver)

### Configuration
- **dotenv** 17.2.3 (environment variables)

### API Structure
- **REST API** on port 3001
- 7 main endpoints: instances, people, roles, projects, work-orders, recurring-tasks, quotes
- Health check endpoint: `/health`
- Plugin-based architecture with type-safe routing

### Database Schema (21 Prisma models)
Key entities: Instance (multi-tenant), Person, Role, Project, Task, WorkOrder, RecurringTask, TimeEntry, Quote, Customer, SubscriptionPlan, WorkApproval, etc.

### Development Tools
- **nodemon** 3.1.11 (auto-restart for development)
- **pino** (built-in Fastify logger)

---

## 3) INFRASTRUCTURE

### 3.1 LOCAL SETUP

#### Package Management
- **pnpm** workspace (monorepo structure)
- Three package.json files:
  - `/package.json` - Root workspace manager
  - `/src/package.json` - Frontend dependencies (@uruhu/frontend)
  - `/server/package.json` - Backend dependencies (@uruhu/backend)

#### Development Environment
- **Vite Dev Server** (frontend hot reload on port 3000)
- **Nodemon + ts-node** (backend auto-restart on port 3001)
- **Docker PostgreSQL** (containerized database on port 5432)

#### Build Tools
- **TypeScript Compiler** (ES2020, NodeNext modules)
- **PostCSS** (minimal, auto-configured by Vite)
- **Vite Build** (SPA optimization with tree-shaking)

#### Docker Setup (PostgreSQL-only)
```bash
./docker/scripts/start-standard.sh    # Start PostgreSQL container
./docker/scripts/start-standard.sh stop    # Stop container
./docker/scripts/start-standard.sh clean   # Stop & remove volumes
```

**Docker Services:**
- PostgreSQL 15-Alpine (512MB RAM limit)
- Container: `uruhu-postgres`
- Port: 5432
- Database: `uruhu_dev`
- User: `uruhu`
- Password: `dev_password`

#### Development Scripts
```bash
# Development
pnpm dev              # Start frontend dev server
pnpm dev:frontend     # Start frontend only
pnpm dev:backend      # Start backend only
pnpm dev:all          # Start both frontend & backend concurrently

# Build
pnpm build            # Build both frontend & backend
pnpm build:frontend   # Build frontend only
pnpm build:backend    # Build backend only

# Database
pnpm db:generate      # Generate Prisma client
pnpm db:migrate       # Apply database migrations
pnpm db:push          # Push schema to database
pnpm db:seed          # Populate with sample data
pnpm db:studio        # Open Prisma Studio GUI

# Docker
pnpm docker:standard  # Start PostgreSQL (standard mode)
pnpm docker:services  # Start services-only mode (hybrid)
pnpm docker:stop      # Stop Docker services
pnpm docker:clean     # Clean up Docker volumes
```

#### Environment Variables
- Root `.env` - Application configuration (API keys, JWT secrets)
- `docker/development/.env.local` - Docker service configuration

**Required Variables:**
```env
DATABASE_URL=postgres://uruhu:dev_password@localhost:5432/uruhu_dev
PORT=3001
NODE_ENV=development
CORS_ORIGIN=*
LOG_LEVEL=info
```

#### Path Aliases
- `@` → `./src` (frontend imports)

---

### 3.2 REMOTE SETUP

#### Status
✅ **Docker configuration complete**
- PostgreSQL-only Docker Compose setup
- Simplified for development efficiency
- Production-ready containerization

#### Docker Infrastructure
**Location**: `/docker/`
- **Standard Mode**: PostgreSQL (512MB) for 4-8GB RAM systems
- **Services Mode**: Hybrid mode (PostgreSQL + pgAdmin)
- **Monitoring**: Optional Grafana + Loki stack

**Docker Compose Files:**
- `/docker/development/standard/docker-compose.standard.yml` - Main PostgreSQL setup
- `/docker/development/services/docker-compose.services.yml` - Hybrid mode
- `/docker/development/standard/docker-compose.monitoring.yml` - Monitoring stack

#### Production Build
```bash
pnpm build            # Build both frontend & backend
pnpm build:frontend   # Outputs to /dist
pnpm build:backend    # Outputs to /server/dist
```

#### Deployment Targets
- **Containerization**: Docker + Docker Compose ✅
- **Database**: PostgreSQL (local or hosted)
- **Frontend**: Static SPA deployment (Vercel, Netlify, S3, etc.)
- **Backend**: Node.js hosting (Railway, Fly.io, AWS ECS, etc.)
- **CI/CD**: Ready for GitHub Actions integration

---

## ARCHITECTURE SUMMARY

**Type**: pnpm workspace monorepo (independently scalable packages)
**Language**: TypeScript throughout
**Database**: PostgreSQL with Prisma ORM
**Frontend**: React SPA with Vite (package: @uruhu/frontend)
**Backend**: Fastify REST API (package: @uruhu/backend)
**Multi-tenancy**: Supported via Instance model
**Key Features**: PPM (Project Portfolio Management), time tracking, work orders, recurring tasks, quotes, approvals, photo documentation, billing

---

## FILE LOCATIONS

| Component | Location |
|-----------|----------|
| **Workspace Root** | `/package.json` (workspace manager) |
| **Frontend Package** | `/src/package.json` (@uruhu/frontend) |
| **Backend Package** | `/server/package.json` (@uruhu/backend) |
| **Workspace Config** | `/pnpm-workspace.yaml` |
| Frontend Src | `/src` |
| UI Components | `/src/app/components` |
| UI Library | `/src/app/components/ui/` |
| Types | `/src/types/index.ts` |
| Mock Data | `/src/data/mockData.ts` |
| Backend Src | `/server/src` |
| Backend Routes | `/server/src/routes/` (Fastify plugins) |
| Database Layer | `/server/src/db.ts` (Prisma client) |
| Prisma Schema | `/prisma/schema.prisma` |
| Vite Config | `/vite.config.ts` |
| PostCSS Config | `/postcss.config.mjs` |
| Docker Config | `/docker/development/` |
| PostgreSQL Config | `/docker/configs/postgres/standard.conf` |

---

## RECENT MIGRATIONS

### 1. Express → Fastify (2026-01-28)
- Migrated from Express 5.2.1 to Fastify 5.2.0
- Converted all routes to Fastify plugin pattern
- Added type-safe routing with TypeScript generics
- Improved performance with built-in JSON schema validation support
- Integrated pino logger for structured logging

### 2. Monolithic → pnpm Workspace (2026-01-28)
- Split dependencies into frontend and backend packages
- Enabled independent scaling and deployment
- Reduced Docker image sizes by isolating dependencies
- Improved development workflow with filtered commands

### 3. Multi-Service → PostgreSQL-Only Docker (2026-01-28)
- Simplified Docker setup to focus on PostgreSQL
- Removed Redis, NATS, Typesense, MinIO from standard setup
- Reduced RAM requirements from ~2GB to ~512MB
- Faster startup times and easier local development

---

**Migration Notes**: All changes maintain backward compatibility at the API level. Database schema and REST endpoints remain unchanged.
