# AWS Lightsail Deployment Guide

Complete guide to deploy insight-manager-v4 on AWS Lightsail with Docker Compose.

## Overview

This guide covers deploying the application on AWS Lightsail using:
- **Lightsail Container Service** (Option 1 - Recommended)
- **Lightsail Instance with Docker** (Option 2 - More control)

---

## Option 1: Lightsail Container Service (Recommended)

### Prerequisites
- AWS Account
- AWS CLI installed and configured
- Docker installed locally

### Step 1: Build and Push Docker Image

```bash
cd insight-manager-v4

# Build the image
docker build -t insight-manager:latest .

# Tag for AWS ECR or Docker Hub
docker tag insight-manager:latest YOUR_REGISTRY/insight-manager:latest

# Push to registry
docker push YOUR_REGISTRY/insight-manager:latest
```

### Step 2: Create Lightsail Container Service

```bash
# Create container service
aws lightsail create-container-service \
  --service-name insight-manager \
  --power small \
  --scale 1

# Wait for service to be active (takes 5-10 minutes)
aws lightsail get-container-services --service-name insight-manager
```

### Step 3: Create PostgreSQL Database

**Option A: Lightsail Managed Database**

```bash
# Create managed PostgreSQL database
aws lightsail create-relational-database \
  --relational-database-name insight-manager-db \
  --relational-database-blueprint-id postgres_16 \
  --relational-database-bundle-id micro_2_0 \
  --master-database-name insight_manager \
  --master-username postgres \
  --master-user-password YOUR_SECURE_PASSWORD
```

**Option B: RDS PostgreSQL** (More features)

Use AWS RDS console to create a PostgreSQL 16 instance.

### Step 4: Deploy Container

Create `containers.json`:

```json
{
  "app": {
    "image": "YOUR_REGISTRY/insight-manager:latest",
    "ports": {
      "3000": "HTTP"
    },
    "environment": {
      "DATABASE_URL": "postgresql://postgres:PASSWORD@DB_ENDPOINT:5432/insight_manager",
      "JWT_SECRET": "your-secure-jwt-secret",
      "PORT": "3000",
      "NODE_ENV": "production"
    }
  }
}
```

Create `public-endpoint.json`:

```json
{
  "containerName": "app",
  "containerPort": 3000,
  "healthCheck": {
    "path": "/",
    "intervalSeconds": 30
  }
}
```

Deploy:

```bash
# Deploy containers
aws lightsail create-container-service-deployment \
  --service-name insight-manager \
  --containers file://containers.json \
  --public-endpoint file://public-endpoint.json
```

### Step 5: Initialize Database

```bash
# Get container service URL
aws lightsail get-container-services --service-name insight-manager

# SSH into a running container or use local connection
# Connect to database and run migrations
DATABASE_URL="postgresql://postgres:PASSWORD@DB_ENDPOINT:5432/insight_manager" \
  bun run db:push

DATABASE_URL="postgresql://postgres:PASSWORD@DB_ENDPOINT:5432/insight_manager" \
  bun run db:seed
```

### Step 6: Access Application

Your app will be available at:
```
https://insight-manager.REGION.cs.amazonlightsail.com
```

---

## Option 2: Lightsail Instance with Docker (More Control)

### Prerequisites
- AWS Account
- SSH key pair

### Step 1: Create Lightsail Instance

**Via AWS Console:**
1. Go to AWS Lightsail Console
2. Click "Create instance"
3. Select:
   - Platform: Linux/Unix
   - Blueprint: OS Only → Ubuntu 22.04 LTS
   - Instance plan: $10/month (2 GB RAM, 1 vCPU) or higher
   - Instance name: insight-manager
4. Click "Create instance"

**Via AWS CLI:**

```bash
aws lightsail create-instances \
  --instance-names insight-manager \
  --availability-zone us-east-1a \
  --blueprint-id ubuntu_22_04 \
  --bundle-id medium_2_0
```

### Step 2: Configure Firewall

Open required ports:

```bash
# HTTP (80)
aws lightsail open-instance-public-ports \
  --instance-name insight-manager \
  --port-info fromPort=80,toPort=80,protocol=TCP

# HTTPS (443) - if using SSL
aws lightsail open-instance-public-ports \
  --instance-name insight-manager \
  --port-info fromPort=443,toPort=443,protocol=TCP

# SSH (22) - already open by default
```

### Step 3: Connect to Instance

**Via Browser:**
- Click "Connect using SSH" in Lightsail console

**Via SSH:**

```bash
# Download SSH key from Lightsail console
chmod 400 LightsailDefaultKey-us-east-1.pem

# Connect
ssh -i LightsailDefaultKey-us-east-1.pem ubuntu@YOUR_INSTANCE_IP
```

### Step 4: Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Git
sudo apt install git -y

# Logout and login again for docker group to take effect
exit
```

### Step 5: Deploy Application

```bash
# Reconnect to instance
ssh -i LightsailDefaultKey-us-east-1.pem ubuntu@YOUR_INSTANCE_IP

# Clone repository
git clone https://github.com/YOUR_USERNAME/insight-manager-v4.git
cd insight-manager-v4

# Create .env file
cat > .env << EOF
DB_PASSWORD=your-secure-db-password
JWT_SECRET=$(openssl rand -base64 32)
EOF

# Start services
docker-compose up -d

# Check status
docker-compose ps
docker-compose logs -f
```

### Step 6: Initialize Database

```bash
# Wait for services to be healthy
docker-compose ps

# Run migrations
docker-compose exec app bun run db:push

# Seed initial data
docker-compose exec app bun run db:seed
```

### Step 7: Access Application

Your app will be available at:
```
http://YOUR_INSTANCE_IP
```

---

## SSL/HTTPS Setup (Option 2 Only)

### Using Nginx + Let's Encrypt

```bash
# Install Nginx
sudo apt install nginx certbot python3-certbot-nginx -y

# Create Nginx config
sudo nano /etc/nginx/sites-available/insight-manager
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/insight-manager /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal is configured automatically
```

### Update docker-compose.yml

Change app port mapping:

```yaml
ports:
  - "3000:3000"  # Instead of "80:3000"
```

```bash
# Restart containers
docker-compose down
docker-compose up -d
```

---

## Domain Configuration

### Step 1: Create Static IP

```bash
# Allocate static IP
aws lightsail allocate-static-ip --static-ip-name insight-manager-ip

# Attach to instance
aws lightsail attach-static-ip \
  --static-ip-name insight-manager-ip \
  --instance-name insight-manager
```

### Step 2: Configure DNS

Add DNS records at your domain registrar:

```
Type: A
Name: @ (or subdomain)
Value: YOUR_STATIC_IP
TTL: 300
```

---

## Monitoring & Maintenance

### View Logs

```bash
# All logs
docker-compose logs -f

# App logs only
docker-compose logs -f app

# Database logs only
docker-compose logs -f db

# Last 100 lines
docker-compose logs --tail=100
```

### Check Status

```bash
# Container status
docker-compose ps

# Resource usage
docker stats

# Disk usage
df -h
docker system df
```

### Backup Database

```bash
# Create backup
docker-compose exec db pg_dump -U postgres insight_manager > backup_$(date +%Y%m%d).sql

# Download backup to local machine
scp -i LightsailDefaultKey-us-east-1.pem \
  ubuntu@YOUR_INSTANCE_IP:~/insight-manager-v4/backup_*.sql \
  ./backups/
```

### Restore Database

```bash
# Upload backup to instance
scp -i LightsailDefaultKey-us-east-1.pem \
  ./backups/backup_20251201.sql \
  ubuntu@YOUR_INSTANCE_IP:~/insight-manager-v4/

# Restore
docker-compose exec -T db psql -U postgres insight_manager < backup_20251201.sql
```

### Update Application

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Run migrations if needed
docker-compose exec app bun run db:push
```

---

## Auto-Start on Reboot

```bash
# Create systemd service
sudo nano /etc/systemd/system/insight-manager.service
```

Add:

```ini
[Unit]
Description=Insight Manager Docker Compose
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/ubuntu/insight-manager-v4
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
User=ubuntu

[Install]
WantedBy=multi-user.target
```

```bash
# Enable service
sudo systemctl enable insight-manager
sudo systemctl start insight-manager

# Check status
sudo systemctl status insight-manager
```

---

## Cost Estimation

### Option 1: Container Service

| Resource | Plan | Cost/Month |
|----------|------|------------|
| Container Service | Small (1 GB RAM, 0.5 vCPU) | $10 |
| Managed Database | Micro (1 GB RAM) | $15 |
| Data Transfer | 1 TB included | $0 |
| **Total** | | **~$25/month** |

### Option 2: Instance + Docker

| Resource | Plan | Cost/Month |
|----------|------|------------|
| Instance | 2 GB RAM, 1 vCPU, 60 GB SSD | $10 |
| Static IP | 1 IP | $0 (free when attached) |
| Snapshot (backup) | 20 GB | $1 |
| Data Transfer | 2 TB included | $0 |
| **Total** | | **~$11/month** |

**Recommendation:** Option 2 is more cost-effective for small deployments.

---

## Performance Optimization

### Enable Swap (for low memory instances)

```bash
# Create 2GB swap file
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make permanent
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### Docker Optimization

```bash
# Prune unused resources
docker system prune -a

# Limit container resources
# Edit docker-compose.yml
```

Add to services:

```yaml
app:
  deploy:
    resources:
      limits:
        cpus: '0.5'
        memory: 512M
```

---

## Security Best Practices

### Firewall Configuration

```bash
# Install UFW
sudo apt install ufw -y

# Configure rules
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https

# Enable firewall
sudo ufw enable
```

### Automatic Security Updates

```bash
# Install unattended-upgrades
sudo apt install unattended-upgrades -y

# Configure
sudo dpkg-reconfigure -plow unattended-upgrades
```

### Change Default Passwords

```bash
# Update .env file
nano .env

# Change DB_PASSWORD and JWT_SECRET
# Restart services
docker-compose down
docker-compose up -d
```

---

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose logs app

# Check if port is in use
sudo netstat -tulpn | grep :80

# Restart services
docker-compose restart
```

### Database Connection Error

```bash
# Check database is running
docker-compose ps db

# Check database logs
docker-compose logs db

# Test connection
docker-compose exec db psql -U postgres -d insight_manager
```

### Out of Memory

```bash
# Check memory usage
free -h
docker stats

# Add swap space (see Performance Optimization)
# Or upgrade instance plan
```

### Disk Space Full

```bash
# Check disk usage
df -h

# Clean Docker
docker system prune -a --volumes

# Clean logs
sudo journalctl --vacuum-time=7d
```

---

## Scaling

### Vertical Scaling (Upgrade Instance)

```bash
# Create snapshot first
aws lightsail create-instance-snapshot \
  --instance-name insight-manager \
  --instance-snapshot-name insight-manager-snapshot

# Stop instance
aws lightsail stop-instance --instance-name insight-manager

# Create new instance from snapshot with larger plan
# Then delete old instance
```

### Horizontal Scaling (Load Balancer)

For high traffic, consider:
1. Multiple Lightsail instances
2. Lightsail Load Balancer
3. Shared RDS database
4. S3 for file uploads

---

## Support

- **AWS Lightsail Docs**: https://lightsail.aws.amazon.com/ls/docs
- **Docker Docs**: https://docs.docker.com
- **Application Issues**: GitHub Issues

---

## Quick Commands Reference

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Restart services
docker-compose restart

# Update application
git pull && docker-compose up -d --build

# Backup database
docker-compose exec db pg_dump -U postgres insight_manager > backup.sql

# Access database
docker-compose exec db psql -U postgres insight_manager

# Check status
docker-compose ps
docker stats
```

---

**Ready to deploy on AWS Lightsail!** 🚀
