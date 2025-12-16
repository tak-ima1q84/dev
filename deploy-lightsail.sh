#!/bin/bash

# AWS Lightsail Deployment Script for Insight Manager
# Run this script on your fresh Ubuntu 22.04 Lightsail instance

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    print_error "Please don't run this script as root. Run as ubuntu user."
    exit 1
fi

print_status "🚀 Starting AWS Lightsail deployment for Insight Manager..."

# Update system
print_status "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js
print_status "📦 Installing Node.js..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
    print_success "Node.js installed successfully"
else
    print_success "Node.js already installed"
fi

# Install Bun
print_status "📦 Installing Bun runtime..."
if ! command -v bun &> /dev/null; then
    curl -fsSL https://bun.sh/install | bash
    export PATH="$HOME/.bun/bin:$PATH"
    echo 'export PATH="$HOME/.bun/bin:$PATH"' >> ~/.bashrc
    print_success "Bun installed successfully"
else
    print_success "Bun already installed"
fi

# Install PostgreSQL
print_status "🗄️ Installing PostgreSQL..."
if ! command -v psql &> /dev/null; then
    sudo apt install postgresql postgresql-contrib -y
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
    print_success "PostgreSQL installed and started"
else
    print_success "PostgreSQL already installed"
fi

# Install Git
print_status "📦 Installing Git..."
if ! command -v git &> /dev/null; then
    sudo apt install git -y
    print_success "Git installed successfully"
else
    print_success "Git already installed"
fi

# Generate secure passwords
DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
JWT_SECRET=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-50)

# Setup database
print_status "🗄️ Setting up PostgreSQL database..."
sudo -u postgres psql -c "DROP DATABASE IF EXISTS insight_manager;" 2>/dev/null || true
sudo -u postgres psql -c "DROP USER IF EXISTS insight_user;" 2>/dev/null || true
sudo -u postgres psql -c "CREATE DATABASE insight_manager;"
sudo -u postgres psql -c "CREATE USER insight_user WITH PASSWORD '$DB_PASSWORD';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE insight_manager TO insight_user;"
sudo -u postgres psql -c "ALTER USER insight_user CREATEDB;"
print_success "Database setup completed"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the insight-manager-v6 directory."
    exit 1
fi

# Install dependencies
print_status "📦 Installing application dependencies..."
bun install
print_success "Dependencies installed"

# Create environment file
print_status "⚙️ Creating environment configuration..."
if [ -f ".env" ]; then
    cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
    print_warning "Existing .env backed up"
fi

cat > .env << EOF
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=insight_user
DB_PASSWORD=$DB_PASSWORD
DB_NAME=insight_manager

# JWT Secret
JWT_SECRET=$JWT_SECRET

# Server Configuration
PORT=3000
NODE_ENV=production
EOF

print_success "Environment file created"

# Build application
print_status "🏗️ Building application..."
bun run build
print_success "Application built successfully"

# Setup database schema
print_status "🗄️ Setting up database schema..."
bun run db:push
print_success "Database schema created"

# Seed database (optional)
print_status "🌱 Seeding database with initial data..."
if [ -f "src/db/seed.ts" ]; then
    bun run db:seed || print_warning "Database seeding failed or no seed file found"
else
    print_warning "No seed file found, skipping database seeding"
fi

# Install PM2 for process management
print_status "📦 Installing PM2 process manager..."
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
    print_success "PM2 installed successfully"
else
    print_success "PM2 already installed"
fi

# Create PM2 ecosystem file
print_status "⚙️ Creating PM2 configuration..."
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'insight-manager',
    script: 'bun',
    args: 'run src/server.ts',
    cwd: '$(pwd)',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
EOF

# Create logs directory
mkdir -p logs

# Stop any existing PM2 processes
pm2 delete insight-manager 2>/dev/null || true

# Start application with PM2
print_status "🚀 Starting application with PM2..."
pm2 start ecosystem.config.js
pm2 save
pm2 startup | grep -E '^sudo' | bash || print_warning "PM2 startup configuration may need manual setup"
print_success "Application started successfully"

# Get public IP
PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || curl -s icanhazip.com 2>/dev/null || echo "YOUR_PUBLIC_IP")

# Final status check
print_status "🔍 Checking application status..."
sleep 5
if pm2 list | grep -q "insight-manager.*online"; then
    print_success "✅ Application is running successfully!"
    echo ""
    echo "🌐 Access your application at:"
    echo "   http://$PUBLIC_IP:3000"
    echo ""
    echo "📊 Monitor your application:"
    echo "   pm2 status"
    echo "   pm2 logs insight-manager"
    echo "   pm2 monit"
    echo ""
    echo "🔐 Database credentials (save these!):"
    echo "   Database: insight_manager"
    echo "   Username: insight_user"
    echo "   Password: $DB_PASSWORD"
    echo ""
    echo "🔑 JWT Secret (save this!):"
    echo "   $JWT_SECRET"
    echo ""
    print_warning "⚠️  IMPORTANT: Save the database password and JWT secret above!"
    print_warning "⚠️  Make sure port 3000 is open in your Lightsail firewall!"
else
    print_error "❌ Application failed to start. Check logs with: pm2 logs insight-manager"
    exit 1
fi

print_success "🎉 Deployment completed successfully!"