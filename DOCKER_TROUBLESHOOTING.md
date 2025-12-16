# 🐳 Docker Deployment Troubleshooting Guide

## Quick Fix for Unhealthy Container

If your container shows as "unhealthy", follow these steps:

### 1. Stop and Remove Current Containers
```bash
docker-compose down
docker system prune -f
```

### 2. Rebuild and Start
```bash
docker-compose up --build -d
```

### 3. Check Status
```bash
docker ps
docker logs insight-manager-app
```

## 🔍 Diagnostic Commands

### Check Container Status
```bash
# View all containers
docker ps -a

# Check specific container logs
docker logs insight-manager-app
docker logs insight-manager-db

# Follow logs in real-time
docker logs -f insight-manager-app
```

### Test Database Connection
```bash
# Check if database is ready
docker exec insight-manager-db pg_isready -U postgres

# Connect to database
docker exec -it insight-manager-db psql -U postgres -d insight_manager
```

### Test Application Health
```bash
# Test health endpoint
curl http://localhost:8080/health

# Test main application
curl http://localhost:8080

# Check from inside container
docker exec insight-manager-app curl -f http://localhost:3000/health
```

## 🚨 Common Issues and Solutions

### Issue 1: "curl: command not found" in healthcheck
**Solution:** Updated Dockerfile now includes curl installation

### Issue 2: Database connection refused
**Symptoms:** App logs show database connection errors
**Solution:**
```bash
# Check if database container is running
docker ps | grep postgres

# Restart database
docker-compose restart db

# Check database logs
docker logs insight-manager-db
```

### Issue 3: Port already in use
**Symptoms:** "Port 8080 is already allocated"
**Solution:**
```bash
# Find what's using the port
sudo lsof -i :8080

# Kill the process or change port in docker-compose.yml
# Change "8080:3000" to "8081:3000" or another available port
```

### Issue 4: Build fails
**Symptoms:** Docker build errors
**Solution:**
```bash
# Clean build cache
docker builder prune -f

# Rebuild without cache
docker-compose build --no-cache

# Check for file permission issues
ls -la insight-manager-v6/
```

### Issue 5: Environment variables not loaded
**Symptoms:** App can't connect to database despite correct config
**Solution:**
```bash
# Create .env file in project root
cat > .env << EOF
DB_PASSWORD=your_secure_password
JWT_SECRET=your_jwt_secret_key
EOF

# Restart containers
docker-compose down && docker-compose up -d
```

## 📋 Complete Deployment Steps

### 1. Prepare Environment
```bash
# Navigate to project directory
cd insight-manager-v6

# Create environment file
cp .env.example .env
nano .env  # Edit with your values
```

### 2. Deploy with Docker Compose
```bash
# Build and start all services
docker-compose up --build -d

# Wait for services to be healthy (may take 1-2 minutes)
docker-compose ps
```

### 3. Initialize Database
```bash
# Run database migrations
docker exec insight-manager-app bun run db:push

# Seed initial data (optional)
docker exec insight-manager-app bun run db:seed
```

### 4. Verify Deployment
```bash
# Check all containers are healthy
docker ps

# Test application
curl http://localhost:8080/health
curl http://localhost:8080

# Check logs for any errors
docker logs insight-manager-app
```

## 🔧 Environment Configuration

### Required Environment Variables (.env)
```env
# Database
DB_PASSWORD=your_secure_database_password

# Security
JWT_SECRET=your_very_secure_jwt_secret_key

# Optional: Custom ports
# Change these if you have port conflicts
# EXTERNAL_PORT=8080  # External port for accessing the app
# DB_EXTERNAL_PORT=5432  # External port for database access
```

### Docker Compose Override (if needed)
Create `docker-compose.override.yml` for custom configurations:
```yaml
services:
  app:
    ports:
      - "8081:3000"  # Use different external port
    environment:
      - DEBUG=true   # Enable debug mode
  
  db:
    ports:
      - "5433:5432"  # Use different database port
```

## 🚀 Production Deployment Tips

### 1. Use Specific Image Tags
```yaml
services:
  db:
    image: postgres:16.1  # Use specific version
```

### 2. Set Resource Limits
```yaml
services:
  app:
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '0.5'
```

### 3. Enable Logging
```yaml
services:
  app:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### 4. Backup Strategy
```bash
# Backup database
docker exec insight-manager-db pg_dump -U postgres insight_manager > backup.sql

# Backup uploads
docker cp insight-manager-app:/app/uploads ./uploads-backup
```

## 🔍 Health Check Details

The application now includes a health endpoint at `/health` that returns:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "uptime": 123.456
}
```

This endpoint is used by Docker's health check to determine if the container is healthy.

## 📞 Getting Help

If you're still having issues:

1. **Check the logs first:**
   ```bash
   docker logs insight-manager-app --tail 50
   ```

2. **Verify your environment:**
   ```bash
   docker exec insight-manager-app env | grep -E "(DB_|JWT_|PORT)"
   ```

3. **Test database connectivity:**
   ```bash
   docker exec insight-manager-app bun -e "console.log('Testing DB connection...'); process.exit(0)"
   ```

4. **Check file permissions:**
   ```bash
   ls -la insight-manager-v6/
   docker exec insight-manager-app ls -la /app/
   ```

Remember: The most common issues are related to environment variables, port conflicts, and database connectivity. Always check the logs first!