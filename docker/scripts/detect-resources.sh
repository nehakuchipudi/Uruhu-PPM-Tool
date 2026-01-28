#!/bin/bash
# Uruhu Docker - System Resource Detection
# Detects available RAM and recommends appropriate tier

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Detect operating system
detect_os() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if grep -qi microsoft /proc/version 2>/dev/null; then
            echo "wsl2"
        else
            echo "linux"
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        echo "macos"
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
        echo "windows"
    else
        echo "unknown"
    fi
}

# Get total system RAM in MB
get_total_ram() {
    local os=$(detect_os)
    local ram_mb=0

    case $os in
        "linux"|"wsl2")
            # Linux/WSL2: read from /proc/meminfo
            if [[ -f /proc/meminfo ]]; then
                ram_kb=$(grep MemTotal /proc/meminfo | awk '{print $2}')
                ram_mb=$((ram_kb / 1024))
            fi
            ;;
        "macos")
            # macOS: use sysctl
            if command -v sysctl &> /dev/null; then
                ram_bytes=$(sysctl -n hw.memsize 2>/dev/null || echo 0)
                ram_mb=$((ram_bytes / 1024 / 1024))
            fi
            ;;
        "windows")
            # Windows (Git Bash/MSYS): use wmic or PowerShell
            if command -v wmic &> /dev/null; then
                ram_bytes=$(wmic ComputerSystem get TotalPhysicalMemory 2>/dev/null | sed -n 2p | tr -d ' \r\n')
                ram_mb=$((ram_bytes / 1024 / 1024))
            elif command -v powershell.exe &> /dev/null; then
                ram_bytes=$(powershell.exe -Command "(Get-CimInstance Win32_PhysicalMemory | Measure-Object -Property capacity -Sum).sum" 2>/dev/null | tr -d ' \r\n')
                ram_mb=$((ram_bytes / 1024 / 1024))
            fi
            ;;
    esac

    echo $ram_mb
}

# Get CPU core count
get_cpu_cores() {
    local os=$(detect_os)
    local cores=0

    case $os in
        "linux"|"wsl2")
            cores=$(nproc 2>/dev/null || echo 0)
            ;;
        "macos")
            cores=$(sysctl -n hw.ncpu 2>/dev/null || echo 0)
            ;;
        "windows")
            if command -v wmic &> /dev/null; then
                cores=$(wmic cpu get NumberOfCores 2>/dev/null | sed -n 2p | tr -d ' \r\n')
            elif [[ -n "$NUMBER_OF_PROCESSORS" ]]; then
                cores=$NUMBER_OF_PROCESSORS
            fi
            ;;
    esac

    echo $cores
}

# Get available Docker memory (if Docker is configured with limits)
get_docker_memory_limit() {
    local os=$(detect_os)
    local docker_ram_mb=0

    if command -v docker &> /dev/null && docker info &> /dev/null; then
        # Try to get Docker memory limit
        docker_ram_bytes=$(docker info 2>/dev/null | grep "Total Memory" | awk '{print $3}' | sed 's/GiB/*1024/;s/MiB//;s/GiB/*1024/' | bc 2>/dev/null || echo 0)

        if [[ "$docker_ram_bytes" =~ ^[0-9]+$ ]]; then
            docker_ram_mb=$docker_ram_bytes
        else
            # Fallback: assume Docker can use system RAM
            docker_ram_mb=$(get_total_ram)
        fi
    else
        # Docker not available, use system RAM
        docker_ram_mb=$(get_total_ram)
    fi

    echo $docker_ram_mb
}

# Recommend tier based on available resources
recommend_tier() {
    local total_ram=$1
    local cpu_cores=$2
    local os=$3

    # Tier thresholds (in MB)
    local MINIMAL_THRESHOLD=2048   # 2GB
    local STANDARD_THRESHOLD=4096  # 4GB
    local FULL_THRESHOLD=8192      # 8GB

    local tier="services"  # Default to services-only (hybrid)

    if [[ $total_ram -ge $FULL_THRESHOLD ]]; then
        # 8GB+ RAM: Can run full stack
        tier="full"
    elif [[ $total_ram -ge $STANDARD_THRESHOLD ]]; then
        # 4-8GB RAM: Standard configuration
        tier="standard"
    elif [[ $total_ram -ge $MINIMAL_THRESHOLD ]]; then
        # 2-4GB RAM: Minimal configuration
        tier="minimal"
    else
        # <2GB RAM: Services only (run app on host)
        tier="services"
    fi

    # Special handling for WSL2
    if [[ "$os" == "wsl2" ]] && [[ $total_ram -lt $STANDARD_THRESHOLD ]]; then
        # WSL2 with limited RAM: recommend services
        tier="services"
    fi

    echo $tier
}

# Main execution
main() {
    local os=$(detect_os)
    local total_ram=$(get_total_ram)
    local cpu_cores=$(get_cpu_cores)
    local docker_ram=$(get_docker_memory_limit)

    # Use the lower of system RAM and Docker RAM limit
    local effective_ram=$total_ram
    if [[ $docker_ram -gt 0 ]] && [[ $docker_ram -lt $total_ram ]]; then
        effective_ram=$docker_ram
    fi

    # Output detection results
    echo -e "${BLUE}System Detection Results:${NC}"
    echo -e "  OS Type: ${GREEN}$os${NC}"
    echo -e "  Total RAM: ${GREEN}${total_ram}MB${NC} (~$((total_ram / 1024))GB)"
    echo -e "  CPU Cores: ${GREEN}${cpu_cores}${NC}"

    if [[ $docker_ram -gt 0 ]] && [[ $docker_ram -lt $total_ram ]]; then
        echo -e "  Docker RAM Limit: ${YELLOW}${docker_ram}MB${NC} (~$((docker_ram / 1024))GB)"
        echo -e "  Effective RAM: ${YELLOW}${effective_ram}MB${NC}"
    fi

    # Recommend tier
    local tier=$(recommend_tier $effective_ram $cpu_cores $os)

    echo -e ""
    echo -e "${BLUE}Recommended Configuration:${NC}"

    case $tier in
        "full")
            echo -e "  Tier: ${GREEN}FULL${NC}"
            echo -e "  Services: PostgreSQL (1GB), Redis (512MB), Monitoring"
            echo -e "  Docker Usage: ~4GB"
            ;;
        "standard")
            echo -e "  Tier: ${GREEN}STANDARD${NC}"
            echo -e "  Services: PostgreSQL (512MB)"
            echo -e "  Docker Usage: ~1-2GB"
            ;;
        "minimal")
            echo -e "  Tier: ${YELLOW}MINIMAL${NC}"
            echo -e "  Services: PostgreSQL (256MB) - Basic config"
            echo -e "  Docker Usage: ~512MB-1GB"
            ;;
        "services")
            echo -e "  Tier: ${YELLOW}SERVICES${NC} (Hybrid Mode)"
            echo -e "  Services: External dependencies only"
            echo -e "  App runs on host (not in Docker)"
            echo -e "  Docker Usage: <512MB"
            ;;
    esac

    # Warnings
    if [[ $effective_ram -lt 2048 ]]; then
        echo -e ""
        echo -e "${RED}⚠️  WARNING: Low RAM detected (<2GB)${NC}"
        echo -e "   Consider increasing Docker memory allocation"
        echo -e "   or running in services-only mode"
    fi

    if [[ "$os" == "wsl2" ]] && [[ $effective_ram -lt 4096 ]]; then
        echo -e ""
        echo -e "${YELLOW}💡 TIP: WSL2 Memory Limit${NC}"
        echo -e "   You can increase WSL2 memory in .wslconfig:"
        echo -e "   [wsl2]"
        echo -e "   memory=8GB"
    fi

    # Output tier as last line for parsing by other scripts
    echo $tier
}

# Run main function
main
