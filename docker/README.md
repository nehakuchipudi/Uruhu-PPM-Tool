# Uruhu Docker Infrastructure

## Quick Start

```bash
# Auto-detect your system and start appropriate services
./docker/scripts/dev-setup.sh

# Manual modes
pnpm docker:standard     # 4-8GB RAM systems
pnpm docker:services     # External services only (hybrid mode)
```

## Directory Structure

```
docker/
├── development/
│   ├── standard/        # Balanced configs (4-8GB RAM)
│   └── services/       # External services only (hybrid)
```

## Service Ports

| Service | Minimal | Standard | Full | Railway |
|---------|---------|----------|------|---------|
| PostgreSQL | 5432 | 5432 | 5432 | Auto |

## Resource Allocation

| Mode | Total Docker RAM | PostgreSQL | Redis | Other Services |
|------|------------------|------------|-------|----------------|
| Standard | ~2GB | 512MB | 256MB | 1.2GB |

## Migration Guide: Root .env to Docker Standard Setup

This guide helps you migrate from using a simple root-level `.env` file with basic Docker services to the full Docker development stack managed by `./docker/scripts/start-standard.sh`.

### Prerequisites

- Docker Desktop installed and running
- WSL2 enabled (for Windows users)
- 4-8GB RAM available for Docker (for standard configuration)
- Existing root `.env` file (for reference)

### Migration Steps

#### 1. Create Docker Environment Configuration

Copy the Docker-specific environment template:

```bash
# From project root
cp ./docker/development/.env.example ./docker/development/.env.local
```

**Important Notes:**
- `./docker/development/.env.local` is for **Docker services only** (PostgreSQL)
- Root `./.env` is for **application configuration** (API keys, JWT secrets, app settings)
- Both files are needed - they serve different purposes

#### 2. Update Database Configuration

The standard Docker setup uses different database credentials. Update your root `.env` file:

**After (root `.env`):**
```env
DATABASE_URL=postgres://uruhu:dev_password@localhost:5432/uruhu_dev
```

#### 3. Stop Existing Docker Services

Stop any containers running from the root docker-compose:

```bash
# Stop old services
docker-compose down -v

# Or if using a specific compose file
docker-compose -f docker-compose.yml down -v
```

This removes containers and volumes to avoid conflicts.

#### 4. Create New Database (Manual Step)

**Important:** The standard Docker setup creates a fresh PostgreSQL database. You need to either:

**Option A: Fresh Database (Recommended for Development)**
```bash
# The start-standard.sh script creates a fresh database automatically
# You'll need to run migrations after starting
./docker/scripts/start-standard.sh

# Wait for services to start, then run migrations
cd packages/api
pnpm db:migrate
```

**Option B: Backup and Restore Existing Data**
```bash
# Before stopping old services, backup your data
docker exec <old-postgres-container> pg_dump -U fleetbay fleetbay_dev > backup.sql

# Start new services
./docker/scripts/start-standard.sh

# Restore data (update credentials as needed)
docker exec -i uruhu-postgres psql -U uruhu -d uruhu_dev < backup.sql
```

**Option C: Mount Existing Data Volume**
If you want to preserve your existing data volume, modify `./docker/development/standard/docker-compose.standard.yml` before starting:

```yaml
services:
  postgres:
    volumes:
      - your-existing-volume-name:/var/lib/postgresql/data  # Change this line
```

#### 5. Start Standard Docker Services

```bash
# Start all services with automatic setup
./docker/scripts/start-standard.sh
```

This script will:
1. Check Docker is running
2. Validate environment configuration
3. Start PostgreSQL
4. Wait for services to be healthy
5. Display service status and connection URLs

#### 6. Verify Services

Check that all services are running:

```bash
# View service status
./docker/scripts/start-standard.sh status

# Or manually check
docker ps

# View logs
./docker/scripts/start-standard.sh logs
```

### Configuration Files Reference

| File | Purpose | Required |
|------|---------|----------|
| `./docker/development/.env.local` | Docker services configuration (ports, credentials) | Yes |
| `./docker/development/.env.example` | Template for Docker configuration | No (reference) |
