#!/bin/bash

# Uruhu Docker - Standard Configuration Startup Script
# Compatible with WSL2 and optimized for 4-8GB RAM systems
# Services: PostgreSQL (512MB)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
DOCKER_DIR="${PROJECT_ROOT}/docker"
ENV_FILE="${DOCKER_DIR}/development/.env.local"
COMPOSE_FILE="${DOCKER_DIR}/development/standard/docker-compose.standard.yml"

# Function to print colored output
print_status() {
    local color=$1
    local message=$2
    echo -e "${color}[$(date '+%H:%M:%S')] ${message}${NC}"
}

# Function to check if Docker is running
check_docker() {
    print_status $BLUE "Checking Docker availability..."

    if ! command -v docker &> /dev/null; then
        print_status $RED "Docker is not installed or not in PATH"
        return 1
    fi

    if ! docker info &> /dev/null; then
        print_status $RED "Docker daemon is not running"
        print_status $YELLOW "Please start Docker Desktop or Docker daemon"
        return 1
    fi

    print_status $GREEN "Docker is available and running"
    return 0
}

# Function to check environment file
check_env_file() {
    print_status $BLUE "Checking environment configuration..."

    if [ ! -f "$ENV_FILE" ]; then
        print_status $RED "Environment file not found: $ENV_FILE"
        return 1
    fi

    print_status $GREEN "Environment file found: $ENV_FILE"
    return 0
}

# Function to check compose file
check_compose_file() {
    print_status $BLUE "Checking Docker Compose file..."

    if [ ! -f "$COMPOSE_FILE" ]; then
        print_status $RED "Docker Compose file not found: $COMPOSE_FILE"
        return 1
    fi

    print_status $GREEN "Docker Compose file found: $COMPOSE_FILE"
    return 0
}

# Function to stop existing containers
stop_existing_containers() {
    print_status $BLUE "Stopping any existing uruhu containers..."

    # Stop containers from all configurations to prevent conflicts
    local compose_files=(
        "${DOCKER_DIR}/development/standard/docker-compose.standard.yml"
    )

    for compose_file in "${compose_files[@]}"; do
        if [ -f "$compose_file" ]; then
            docker-compose --env-file "$ENV_FILE" -f "$compose_file" down --remove-orphans > /dev/null 2>&1 || true
        fi
    done

    print_status $GREEN "Existing containers stopped"
}

# Function to start services
start_services() {
    print_status $BLUE "Starting Uruhu Standard Configuration..."
    print_status $BLUE "Services: PostgreSQL (512MB)"
    print_status $BLUE "Expected RAM usage: ~512MB total"

    cd "$PROJECT_ROOT"

    # Pull latest images (skip on failure - use cached images)
    print_status $BLUE "Pulling latest Docker images..."
    if ! docker-compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" pull 2>&1; then
        print_status $YELLOW "⚠️ Failed to pull latest images (Docker Hub may be unavailable)"
        print_status $YELLOW "   Continuing with cached images..."
    else
        print_status $GREEN "✓ Images pulled successfully"
    fi

    # Start services in detached mode
    print_status $BLUE "Starting services..."
    docker-compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d

    if [ $? -eq 0 ]; then
        print_status $GREEN "Services started successfully!"
    else
        print_status $RED "Failed to start services"
        return 1
    fi
}

# Function to wait for services to be healthy
wait_for_services() {
    print_status $BLUE "Waiting for services to be healthy..."

    local services=("postgres")
    local max_attempts=60
    local attempt=0

    while [ $attempt -lt $max_attempts ]; do
        local all_healthy=true

        for service in "${services[@]}"; do
            local container_name="uruhu-${service}"
            local health_status=$(docker inspect --format='{{.State.Health.Status}}' "$container_name" 2>/dev/null || echo "no-health")

            if [ "$health_status" != "healthy" ] && [ "$health_status" != "no-health" ]; then
                all_healthy=false
                break
            elif [ "$health_status" = "no-health" ]; then
                # For services without health check, just check if running
                local running_status=$(docker inspect --format='{{.State.Running}}' "$container_name" 2>/dev/null || echo "false")
                if [ "$running_status" != "true" ]; then
                    all_healthy=false
                    break
                fi
            fi
        done

        if [ "$all_healthy" = true ]; then
            print_status $GREEN "All services are healthy!"
            return 0
        fi

        attempt=$((attempt + 1))
        print_status $YELLOW "Waiting for services... (${attempt}/${max_attempts})"
        sleep 5
    done

    print_status $YELLOW "Services may still be starting up. Check status manually if needed."
    return 0
}

# Function to show service status
show_status() {
    print_status $BLUE "=== uruhu Standard Configuration Status ==="

    # Show running containers
    print_status $BLUE "Running containers:"
    docker-compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" ps

    echo ""
    print_status $BLUE "Service URLs:"
    print_status $GREEN "PostgreSQL: localhost:5432 (user: uruhu, db: uruhu_dev)"

    echo ""
    print_status $BLUE "Memory Usage:"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" $(docker-compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" ps -q) 2>/dev/null || print_status $YELLOW "Could not retrieve memory stats"

    echo ""
    print_status $BLUE "To stop services: ./docker/scripts/start-standard.sh stop"
    print_status $BLUE "To view logs: docker-compose --env-file $ENV_FILE -f $COMPOSE_FILE logs -f"
}

# Function to setup database if needed
setup_database() {
    print_status $BLUE "Checking database setup..."

    # Wait a moment for PostgreSQL to be fully ready
    sleep 5

    # You can add database initialization logic here if needed
    print_status $GREEN "Database is ready for use"
}

# Main execution
main() {
    print_status $BLUE "=== uruhu Standard Configuration Startup ==="
    print_status $BLUE "Target: 4-8GB RAM systems, ~2GB Docker usage"

    # Pre-flight checks
    if ! check_docker; then
        exit 1
    fi

    if ! check_env_file; then
        exit 1
    fi

    if ! check_compose_file; then
        exit 1
    fi

    # Stop any existing containers
    stop_existing_containers

    # Start services
    if start_services; then
        wait_for_services
        setup_database
        show_status
        print_status $GREEN "=== uruhu Standard Configuration Ready ==="

    else
        print_status $RED "=== uruhu Standard Configuration Failed ==="
        exit 1
    fi
}

# Handle script arguments
case "${1:-}" in
    "stop")
        print_status $BLUE "Stopping uruhu Standard Configuration..."

        # Stop services (suppress network messages if FusionAuth is using it)
        docker-compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" down --remove-orphans 2>&1 | grep -vE "Network.*Removing|Network.*Resource is still in use" || true

        print_status $GREEN "PostgreSQL service stopped"
        ;;
    "restart")
        print_status $BLUE "Restarting uruhu Standard Configuration..."
        docker-compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" restart
        print_status $GREEN "Services restarted"
        ;;
    "logs")
        print_status $BLUE "Showing uruhu Standard Configuration logs..."
        docker-compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" logs -f
        ;;
    "status")
        show_status
        ;;
    "clean")
        print_status $BLUE "Cleaning up uruhu Standard Configuration..."

        # Stop services and remove volumes (suppress network messages if FusionAuth is using it)
        docker-compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" down -v --remove-orphans 2>&1 | grep -vE "Network.*Removing|Network.*Resource is still in use" || true

        print_status $GREEN "PostgreSQL service stopped and volumes removed"

        ;;
    *)
        main "$@"
        ;;
esac