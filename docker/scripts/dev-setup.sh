#!/bin/bash
# Uruhu Development Setup Script
# One-command setup with automatic tier detection

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/../.." &> /dev/null && pwd )"

echo -e "${BOLD}🚀 uruhu Development Environment Setup${NC}"
echo -e "${BLUE}=======================================${NC}"

# Check prerequisites
echo -e "\n${BLUE}📋 Checking prerequisites...${NC}"

# Check Node.js
if ! command -v node >/dev/null 2>&1; then
    echo -e "${RED}❌ Node.js is required but not installed${NC}"
    echo -e "   Please install Node.js 20+ from https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v | sed 's/v//')
echo -e "✅ Node.js: ${GREEN}$NODE_VERSION${NC}"

# Check pnpm
if ! command -v pnpm >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️ pnpm not found. Installing...${NC}"
    npm install -g pnpm
fi

PNPM_VERSION=$(pnpm -v)
echo -e "✅ pnpm: ${GREEN}$PNPM_VERSION${NC}"

# Check Docker
if ! command -v docker >/dev/null 2>&1; then
    echo -e "${RED}❌ Docker is required but not installed${NC}"
    echo -e "   Please install Docker from https://docs.docker.com/get-docker/"
    exit 1
fi

if ! docker info >/dev/null 2>&1; then
    echo -e "${RED}❌ Docker daemon is not running${NC}"
    echo -e "   Please start Docker daemon first"
    exit 1
fi

echo -e "✅ Docker: ${GREEN}$(docker -v | cut -d' ' -f3 | sed 's/,//')${NC}"

# Detect system resources
echo -e "\n${BLUE}🔍 Detecting system capabilities...${NC}"
DETECTED_TIER=$(bash "$SCRIPT_DIR/detect-resources.sh" | tail -n 1)
echo -e "Detected tier: ${GREEN}$DETECTED_TIER${NC}"

# Allow manual override
if [[ -n "$1" ]]; then
    if [[ "$1" =~ ^(minimal|standard|full|services)$ ]]; then
        TIER="$1"
        echo -e "Manual override: Using ${YELLOW}$TIER${NC} tier"
    else
        echo -e "${RED}❌ Invalid tier '$1'. Valid options: minimal, standard, full, services${NC}"
        exit 1
    fi
else
    TIER="$DETECTED_TIER"
fi

# Setup environment file
echo -e "\n${BLUE}⚙️ Setting up environment...${NC}"
if [[ ! -f "$PROJECT_ROOT/.env" ]]; then
    if [[ -f "$PROJECT_ROOT/.env.example" ]]; then
        cp "$PROJECT_ROOT/.env.example" "$PROJECT_ROOT/.env"
        echo -e "✅ Created .env from .env.example"
    else
        echo -e "${YELLOW}⚠️ No .env.example found, creating basic .env${NC}"
        cat > "$PROJECT_ROOT/.env" << EOF
# uruhu Development Environment
NODE_ENV=development
DATABASE_URL=postgresql://uruhu:dev_password@localhost:5432/uruhu_dev

# API Configuration
JWT_SECRET=dev_jwt_secret_change_in_production
JWT_REFRESH_SECRET=dev_jwt_refresh_secret_change_in_production
API_PORT=3001

EOF
    fi
else
    echo -e "✅ .env file already exists"
fi

# Install dependencies
echo -e "\n${BLUE}📦 Installing dependencies...${NC}"
cd "$PROJECT_ROOT"
pnpm install --frozen-lockfile

# Start Docker services based on tier
echo -e "\n${BLUE}🐳 Starting Docker services (tier: $TIER)...${NC}"

case $TIER in
    "standard")
        COMPOSE_FILE="docker/development/standard/docker-compose.standard.yml"
        echo -e "Starting standard services: PostgreSQL (512MB)"
        ;;
    "services")
        COMPOSE_FILE="docker/development/services/docker-compose.services.yml"
        echo -e "Starting external services only (hybrid mode)"
        ;;
esac

if [[ -f "$PROJECT_ROOT/$COMPOSE_FILE" ]]; then
    docker-compose -f "$PROJECT_ROOT/$COMPOSE_FILE" up -d

    # Wait for services to be healthy
    echo -e "\n${BLUE}⏳ Waiting for services to be ready...${NC}"
    sleep 10

    # Check service health
    if docker-compose -f "$PROJECT_ROOT/$COMPOSE_FILE" ps | grep -q "Up"; then
        echo -e "✅ Docker services started successfully"
    else
        echo -e "${YELLOW}⚠️ Some services may still be starting...${NC}"
    fi
else
    echo -e "${RED}❌ Compose file not found: $COMPOSE_FILE${NC}"
    exit 1
fi

# Run database migrations
echo -e "\n${BLUE}🗄️ Setting up database...${NC}"
# Wait for PostgreSQL to be ready
timeout=30
while ! docker-compose -f "$PROJECT_ROOT/$COMPOSE_FILE" exec postgres pg_isready -U uruhu -d uruhu_dev >/dev/null 2>&1; do
    if [[ $timeout -eq 0 ]]; then
        echo -e "${YELLOW}⚠️ PostgreSQL not ready after 30s, continuing anyway...${NC}"
        break
    fi
    echo -e "Waiting for PostgreSQL... (${timeout}s remaining)"
    sleep 1
    ((timeout--))
done

# Run migrations if they exist
if [[ -d "$PROJECT_ROOT/packages/api/src/migrations" ]] || [[ -d "$PROJECT_ROOT/packages/api/migrations" ]]; then
    echo -e "Running database migrations..."
    if pnpm db:migrate 2>/dev/null; then
        echo -e "✅ Database migrations completed"
    else
        echo -e "${YELLOW}⚠️ Migration command not found or failed${NC}"
    fi
fi

# Setup monitoring dashboards (for full tier)
if [[ "$TIER" == "full" ]]; then
    echo -e "\n${BLUE}📊 Setting up monitoring dashboards...${NC}"
    # Wait for Grafana to be ready
    timeout=30
    while ! curl -s http://localhost:3030/api/health >/dev/null 2>&1; do
        if [[ $timeout -eq 0 ]]; then
            echo -e "${YELLOW}⚠️ Grafana not ready after 30s${NC}"
            break
        fi
        sleep 1
        ((timeout--))
    done

    if curl -s http://localhost:3030/api/health >/dev/null 2>&1; then
        echo -e "✅ Grafana dashboard ready at ${GREEN}http://localhost:3030${NC} (admin/admin)"
    fi
fi

# Final status and next steps
echo -e "\n${BOLD}${GREEN}🎉 uruhu development environment is ready!${NC}"
echo -e "\n${BLUE}📋 Service Status:${NC}"

case $TIER in
    "standard")
        echo -e "   • PostgreSQL: ${GREEN}http://localhost:5432${NC}"
        ;;
esac

echo -e "\n${BLUE}🚀 Next Steps:${NC}"
if [[ "$TIER" == "services" ]]; then
    echo -e "   1. Start API: ${YELLOW}pnpm dev:api${NC}"
    echo -e "   2. Start Web: ${YELLOW}pnpm dev:web${NC} (in another terminal)"
else
    echo -e "   1. Start all services: ${YELLOW}pnpm dev${NC}"
    echo -e "   2. Or start individually:"
    echo -e "      • API only: ${YELLOW}pnpm dev:api${NC}"
    echo -e "      • Web only: ${YELLOW}pnpm dev:web${NC}"
fi

echo -e "\n${BLUE}🛠️ Useful Commands:${NC}"
echo -e "   • Monitor resources: ${YELLOW}pnpm docker:monitor${NC}"
echo -e "   • Switch tier: ${YELLOW}pnpm docker:switch${NC}"
echo -e "   • View logs: ${YELLOW}docker-compose -f $COMPOSE_FILE logs -f${NC}"
echo -e "   • Stop services: ${YELLOW}docker-compose -f $COMPOSE_FILE down${NC}"

echo -e "\n${GREEN}Happy coding! 🚀${NC}"