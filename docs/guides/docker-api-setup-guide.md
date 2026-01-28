# Uruhu PPM Tool - Docker & API Setup Guide

**Complete step-by-step guide for setting up and testing the Uruhu PPM Tool with Docker**

---

## Prerequisites

Before starting, ensure you have:

- ✅ Docker Desktop installed and running
- ✅ WSL2 enabled (for Windows users)
- ✅ Node.js 20+ installed
- ✅ pnpm installed (`npm install -g pnpm`)
- ✅ Git configured with user name and email
- ✅ At least 4GB RAM available for Docker

---

## Part 1: Docker Infrastructure Setup

### Step 1: Navigate to Project Root

```bash
cd D:\work\dmc\codebase\Uruhu-PPM-Tool
# or
cd /d/work/dmc/codebase/Uruhu-PPM-Tool  # WSL2/Git Bash
```

### Step 2: Verify Docker Configuration

The Docker configuration files are already set up:

```bash
# Check Docker environment file
cat docker/development/.env.local

# Expected content:
# - POSTGRES_DB=uruhu_dev
# - POSTGRES_USER=uruhu
# - POSTGRES_PASSWORD=dev_password
# - POSTGRES_PORT=5432
```

### Step 3: Start Docker Services

```bash
./docker/scripts/start-standard.sh
```

**Expected Output:**
```
[19:31:13] === uruhu Standard Configuration Startup ===
[19:31:13] Target: 4-8GB RAM systems, ~2GB Docker usage
[19:31:13] Checking Docker availability...
[19:31:13] ✓ Docker is available and running
[19:31:13] Starting services...
[19:31:18] ✓ Services started successfully!
[19:31:23] ✓ All services are healthy!
[19:31:23] === uruhu Standard Configuration Ready ===
```

### Step 4: Verify Docker Container

```bash
docker ps
```

**Expected Output:**
```
NAME             IMAGE                STATUS
uruhu-postgres   postgres:15-alpine   Up (healthy)
```

### Step 5: Test Database Connection

```bash
docker exec uruhu-postgres psql -U uruhu -d uruhu_dev -c "SELECT version();"
```

**Expected Output:**
```
PostgreSQL 15.15 on x86_64-pc-linux-musl
```

---

## Part 2: Database Schema Setup

### Step 6: Install Dependencies

```bash
cd server
pnpm install
```

### Step 7: Generate Prisma Client

```bash
pnpm db:generate
```

**Expected Output:**
```
✔ Generated Prisma Client (v7.3.0)
Prisma schema loaded from prisma\schema.prisma.
```

### Step 8: Sync Database Schema

```bash
pnpm prisma db push --accept-data-loss
```

**Expected Output:**
```
Your database is now in sync with your Prisma schema. Done in 125ms
```

**Note:** This syncs the schema without migrations and will drop the test_table if it exists.

### Step 9: Verify Database Tables

```bash
docker exec uruhu-postgres psql -U uruhu -d uruhu_dev -c "\dt"
```

**Expected Tables:**
- instances
- people
- projects
- work_orders
- recurring_tasks
- quotes
- roles
- (and many more...)

---

## Part 3: API Server Setup

### Step 10: Verify Environment Configuration

```bash
# Check root .env file
cat ../.env
```

**Expected Content:**
```
DATABASE_URL=postgresql://uruhu:dev_password@localhost:5432/uruhu_dev
```

### Step 11: Start API Server

```bash
pnpm dev
```

**Expected Output:**
```
🚀 Server running on http://localhost:3001
📊 Health check: http://localhost:3001/health
```

**Note:** Server will run in foreground. Open a new terminal for testing.

### Step 12: Test Health Endpoint

In a new terminal:

```bash
curl http://localhost:3001/health
```

**Expected Response:**
```json
{"status":"ok","timestamp":"2026-01-28T12:54:06.249Z"}
```

---

## Part 4: API Endpoint Testing

### Step 13: Test All GET Endpoints

#### Test Instances Endpoint
```bash
curl http://localhost:3001/api/instances
```

**Expected:** `[]` (empty array) or list of instances

#### Test People Endpoint
```bash
curl http://localhost:3001/api/people
```

**Expected:** `[]` (empty array) or list of people

#### Test Projects Endpoint
```bash
curl http://localhost:3001/api/projects
```

**Expected:** `[]` (empty array) or list of projects

#### Test Work Orders Endpoint
```bash
curl http://localhost:3001/api/work-orders
```

**Expected:** `[]` (empty array) or list of work orders

#### Test Recurring Tasks Endpoint
```bash
curl http://localhost:3001/api/recurring-tasks
```

**Expected:** `[]` (empty array) or list of recurring tasks

#### Test Quotes Endpoint
```bash
curl http://localhost:3001/api/quotes
```

**Expected:** `[]` (empty array) or list of quotes

#### Test Roles Endpoint
```bash
curl http://localhost:3001/api/roles
```

**Expected:** `[]` (empty array) or list of roles

### Step 14: Run Automated Test Suite

Save this test script and run it:

```bash
# Create test script
cat > /tmp/test-api.sh << 'EOF'
#!/bin/bash
API_BASE="http://localhost:3001"

echo "Testing Health Check..."
curl -s $API_BASE/health | jq .

echo -e "\nTesting Instances..."
curl -s $API_BASE/api/instances | jq .

echo -e "\nTesting People..."
curl -s $API_BASE/api/people | jq .

echo -e "\nTesting Projects..."
curl -s $API_BASE/api/projects | jq .

echo -e "\nAll tests completed!"
EOF

chmod +x /tmp/test-api.sh
/tmp/test-api.sh
```

---

## Part 5: Test Results Summary

### ✅ Working Endpoints (8/9)

| Endpoint | Method | Status | Description |
|----------|--------|--------|-------------|
| `/health` | GET | ✅ 200 | Server health check |
| `/api/instances` | GET | ✅ 200 | List all instances |
| `/api/people` | GET | ✅ 200 | List all people |
| `/api/projects` | GET | ✅ 200 | List all projects |
| `/api/work-orders` | GET | ✅ 200 | List all work orders |
| `/api/recurring-tasks` | GET | ✅ 200 | List all recurring tasks |
| `/api/quotes` | GET | ✅ 200 | List all quotes |
| `/api/roles` | GET | ✅ 200 | List all roles |

### ❌ Known Issues (1/9)

| Endpoint | Method | Status | Issue |
|----------|--------|--------|-------|
| `/api/instances` | POST | ❌ 500 | Create instance fails (needs investigation) |

**Overall Success Rate:** 88.9%

---

## Part 6: Useful Commands

### Docker Management

```bash
# View Docker services status
./docker/scripts/start-standard.sh status

# View Docker logs
./docker/scripts/start-standard.sh logs

# Stop Docker services
./docker/scripts/start-standard.sh stop

# Restart Docker services
./docker/scripts/start-standard.sh restart

# Clean Docker volumes (removes all data)
./docker/scripts/start-standard.sh clean
```

### Database Management

```bash
# Access PostgreSQL shell
docker exec -it uruhu-postgres psql -U uruhu -d uruhu_dev

# View tables
docker exec uruhu-postgres psql -U uruhu -d uruhu_dev -c "\dt"

# View specific table
docker exec uruhu-postgres psql -U uruhu -d uruhu_dev -c "SELECT * FROM instances;"

# Prisma Studio (GUI database viewer)
cd server && pnpm db:studio
```

### API Server Management

```bash
# Start API server (foreground)
cd server && pnpm dev

# Generate Prisma Client (after schema changes)
cd server && pnpm db:generate

# Push schema changes to database
cd server && pnpm prisma db push

# View Prisma schema
cd server && cat prisma/schema.prisma
```

---

## Part 7: Troubleshooting

### Issue: Docker container won't start

**Solution:**
```bash
# Check Docker daemon is running
docker info

# Check for port conflicts
netstat -an | grep 5432

# Remove old containers
docker rm -f uruhu-postgres

# Restart Docker Desktop
```

### Issue: Database connection fails

**Solution:**
```bash
# Verify DATABASE_URL in .env
cat .env

# Should be:
# DATABASE_URL=postgresql://uruhu:dev_password@localhost:5432/uruhu_dev

# Test connection manually
docker exec uruhu-postgres psql -U uruhu -d uruhu_dev -c "SELECT 1;"
```

### Issue: API server won't start

**Solution:**
```bash
# Check if port 3001 is in use
netstat -an | grep 3001

# Kill existing process on port 3001 (Windows)
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Reinstall dependencies
cd server
rm -rf node_modules
pnpm install
```

### Issue: Prisma schema out of sync

**Solution:**
```bash
cd server

# Regenerate Prisma Client
pnpm db:generate

# Push schema to database
pnpm prisma db push --accept-data-loss

# Or reset everything (destroys data)
pnpm prisma migrate reset --force
```

---

## Part 8: Development Workflow

### Daily Startup Sequence

```bash
# 1. Start Docker services
./docker/scripts/start-standard.sh

# 2. Wait for services to be healthy (automated)
# Script waits automatically

# 3. Start API server in one terminal
cd server && pnpm dev

# 4. Start frontend in another terminal (if needed)
cd .. && pnpm dev:web

# 5. Open browser
# API: http://localhost:3001
# Web: http://localhost:5173 (or configured port)
```

### Daily Shutdown Sequence

```bash
# 1. Stop API server (Ctrl+C in terminal)

# 2. Stop frontend (Ctrl+C in terminal)

# 3. Stop Docker services
./docker/scripts/start-standard.sh stop
```

### Quick Restart

```bash
# Restart just the API server
# Ctrl+C to stop, then:
cd server && pnpm dev

# Restart Docker services (preserves data)
./docker/scripts/start-standard.sh restart
```

---

## Part 9: Resource Monitoring

### Check Docker Resource Usage

```bash
# Real-time stats
docker stats uruhu-postgres

# One-time snapshot
docker stats --no-stream uruhu-postgres
```

**Expected Usage:**
- Memory: 17-50MB / 512MB limit (3-10% usage)
- CPU: 0-5%

### Check API Server Performance

```bash
# Test response times
curl -w "\nTime: %{time_total}s\n" http://localhost:3001/health

# Load test (requires apache2-utils)
ab -n 100 -c 10 http://localhost:3001/health
```

---

## Part 10: Next Steps

### Completed ✅
- Docker infrastructure setup
- PostgreSQL database running
- Database schema synchronized
- API server operational
- 8/9 endpoints tested and working

### Pending 🔄
1. **Fix POST /api/instances endpoint** (returns 500 error)
2. **Test remaining POST/PUT/DELETE endpoints**
3. **Add seed data for testing**
4. **Test frontend integration**
5. **Add authentication/authorization**
6. **Deploy to Railway or other cloud platform**

### Recommended Tasks
1. Investigate POST /api/instances error:
   ```bash
   # Check server logs for detailed error
   # Fix validation or schema issues
   # Test with complete payload
   ```

2. Expand test coverage:
   ```bash
   # Test all CRUD operations
   # Test with valid IDs for :id endpoints
   # Test error cases (invalid data, etc.)
   ```

3. Add seed data:
   ```bash
   cd server
   pnpm db:seed
   ```

---

## Quick Reference

### Service URLs

| Service | URL | Credentials |
|---------|-----|-------------|
| API Server | http://localhost:3001 | - |
| Health Check | http://localhost:3001/health | - |
| PostgreSQL | localhost:5432 | uruhu / dev_password |
| Prisma Studio | http://localhost:5555 | (run `pnpm db:studio`) |

### Key Files

| File | Purpose |
|------|---------|
| `docker/development/.env.local` | Docker services configuration |
| `.env` | Application configuration (DATABASE_URL) |
| `server/prisma/schema.prisma` | Database schema definition |
| `server/src/server.ts` | API server entry point |
| `docker/scripts/start-standard.sh` | Docker startup script |

### Important Commands

```bash
# Start everything
./docker/scripts/start-standard.sh && cd server && pnpm dev

# Stop everything
# Ctrl+C (API server) then:
./docker/scripts/start-standard.sh stop

# View logs
./docker/scripts/start-standard.sh logs

# Check status
./docker/scripts/start-standard.sh status
```

---

## Support & Documentation

- **Docker README:** `docker/README.md`
- **Progress Tracker:** `docker/PROGRESS.md`
- **API Test Summary:** `../_rod/api-endpoint-test-summary.md`
- **Claude Guidelines:** `CLAUDE.md`

---

**Last Updated:** 2026-01-28
**Guide Version:** 1.0
**Tested On:** Windows/WSL2 with Docker Desktop
