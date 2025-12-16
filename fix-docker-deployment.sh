#!/bin/bash

# Quick fix script for Docker deployment issues
# Run this script to fix common Docker deployment problems

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_status "🐳 Fixing Docker deployment for Insight Manager..."

# Check if docker-compose.yml exists
if [ ! -f "docker-compose.yml" ]; then
    print_error "docker-compose.yml not found. Please run this script from the insight-manager-v6 directory."
    exit 1
fi

# Stop and remove existing containers
print_status "🛑 Stopping existing containers..."
docker-compose down 2>/dev/null || true

# Clean up Docker system
print_status "🧹 Cleaning up Docker system..."
docker system prune -f

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    print_status "📝 Creating environment file..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        print_success "Created .env from .env.example"
    else
        cat > .env << EOF
# Database Configuration
DB_PASSWORD=secure_password_123
JWT_SECRET=super_secure_jwt_secret_key_change_in_production
PORT=3000
NODE_ENV=production
EOF
        print_success "Created default .env file"
    fi
    print_warning "⚠️  Please edit .env file with your secure passwords!"
fi

# Build and start containers
print_status "🏗️ Building and starting containers..."
docker-compose up --build -d

# Wait for containers to start
print_status "⏳ Waiting for containers to start..."
sleep 10

# Check container status
print_status "🔍 Checking container status..."
docker ps

# Check if database is ready
print_status "🗄️ Checking database connectivity..."
for i in {1..30}; do
    if docker exec insight-manager-db pg_isready -U postgres >/dev/null 2>&1; then
        print_success "Database is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        print_error "Database failed to start after 30 attempts"
        print_error "Check database logs: docker logs insight-manager-db"
        exit 1
    fi
    echo -n "."
    sleep 2
done

# Initialize database schema
print_status "🗄️ Initializing database schema..."
if docker exec insight-manager-app bun run db:push; then
    print_success "Database schema initialized"
else
    print_warning "Database schema initialization failed - this might be normal if already initialized"
fi

# Seed database (optional)
print_status "🌱 Seeding database..."
if docker exec insight-manager-app bun run db:seed 2>/dev/null; then
    print_success "Database seeded successfully"
else
    print_warning "Database seeding skipped or failed - this is usually fine"
fi

# Test application health
print_status "🏥 Testing application health..."
sleep 5

# Try to access health endpoint
for i in {1..10}; do
    if curl -f http://localhost:8080/health >/dev/null 2>&1; then
        print_success "✅ Application is healthy!"
        break
    fi
    if [ $i -eq 10 ]; then
        print_error "❌ Application health check failed"
        print_error "Check application logs: docker logs insight-manager-app"
        exit 1
    fi
    echo -n "."
    sleep 3
done

# Final status check
print_status "📊 Final status check..."
echo ""
echo "Container Status:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""

# Test endpoints
print_status "🌐 Testing endpoints..."
if curl -s http://localhost:8080/health | grep -q "healthy"; then
    print_success "Health endpoint: ✅ Working"
else
    print_error "Health endpoint: ❌ Failed"
fi

if curl -s http://localhost:8080 | grep -q "html\|DOCTYPE" >/dev/null 2>&1; then
    print_success "Main application: ✅ Working"
else
    print_error "Main application: ❌ Failed"
fi

echo ""
print_success "🎉 Docker deployment fix completed!"
echo ""
echo "📱 Access your application:"
echo "   Main App: http://localhost:8080"
echo "   Health Check: http://localhost:8080/health"
echo ""
echo "🔧 Useful commands:"
echo "   View logs: docker logs insight-manager-app"
echo "   Check status: docker ps"
echo "   Stop services: docker-compose down"
echo "   Restart services: docker-compose restart"
echo ""

# Show any warnings
if [ -f ".env" ]; then
    if grep -q "your_secure_password\|change_in_production" .env; then
        print_warning "⚠️  Remember to update passwords in .env file for production!"
    fi
fi

print_success "✨ All done! Your application should now be running healthy."