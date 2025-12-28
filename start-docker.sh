#!/bin/bash
# SecureAuth Gateway - Quick Start Script for Linux/macOS

echo ""
echo "===================================="
echo "  SecureAuth Gateway - Docker"
echo "===================================="
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "[ERROR] Docker is not running. Please start Docker."
    exit 1
fi

echo "[INFO] Docker is running..."
echo ""

# Stop any existing containers
echo "[INFO] Stopping existing containers..."
docker-compose down
echo ""

# Build and start all services
echo "[INFO] Building and starting all services..."
echo "[INFO] This may take a few minutes on first run..."
echo ""
docker-compose up --build
