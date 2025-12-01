# Quick Start - AWS Lightsail Deployment

Deploy insight-manager-v4 to AWS Lightsail in 15 minutes.

## Prerequisites

- AWS Account
- SSH key pair (or use Lightsail default)
- Domain name (optional, for HTTPS)

---

## Step 1: Create Lightsail Instance (5 minutes)

### Via AWS Console

1. Go to https://lightsail.aws.amazon.com
2. Click **"Create instance"**
3. Select:
   - **Platform**: Linux/Unix
   - **Blueprint**: OS Only → **Ubuntu 22.04 LTS**
   - **Instance plan**: **$10/month** (2 GB RAM, 1 vCPU)
   - **Instance name**: `insight-manager`
4. Click **"Create instance"**
5. Wait 2-3 minutes for instance to start

### Configure Firewall

1. Click on your instance
2. Go to **"Networking"** tab
3. Under **"IPv4 Firewall"**, add rule:
   - **Application**: HTTP
   - **Protocol**: TCP
   - **Port**: 80
4. Click **"Create"**

---

## Step 2: Connect and Install Docker (3 minutes)

### Connect via Browser

1. Click **"Connect using SSH"** in Lightsail console
2. A terminal window opens

### Install Docker

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

# Logout and login again
exit
```

**Click "Connect using SSH" again** to reconnect.

---

## Step 3: Deploy Application (5 minutes)

### Clone and Configure

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/insight-manager-v4.git
cd insight-manager-v4

# Generate secure passwords
DB_PASSWORD=$(openssl rand -base64 16)
JWT_SECRET=$(openssl rand -base64 32)

# Create .env file
cat > .env << EOF
DB_PASSWORD=$DB_PASSWORD
JWT_SECRET=$JWT_SECRET
EOF

# Show generated passwords (save these!)
echo "Database Password: $DB_PASSWORD"
echo "JWT Secret: $JWT_SECRET"
```

**⚠️ IMPORTANT**: Copy and save these passwords somewhere safe!

### Start Services

```bash
# Start Docker containers
docker-compose up -d

# Wait 30 seconds for services to start
sleep 30

# Check status
docker-compose ps
```

You should see both `app` and `db` containers running.

---

## Step 4: Initialize Database (2 minutes)

```bash
# Apply database schema
docker-compose exec app bun run db:push

# Seed initial data
docker-compose exec app bun run db:seed
```

**Expected output:**
```
✅ Schema applied successfully
✅ Created 3 users (admin, manager, viewer)
✅ Created master options
✅ Database seeded successfully
```

---

## Step 5: Access Application

### Get Your Instance IP

```bash
# In Lightsail console, find your instance's Public IP
# Or run this command:
curl -s http://169.254.169.254/latest/meta-data/public-ipv4
```

### Open in Browser

```
http://YOUR_INSTANCE_IP
```

### Login

| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | Admin |
| manager | manager123 | Manager |
| viewer | viewer123 | Viewer |

**⚠️ Change these passwords immediately!**

---

## Step 6: Verify Everything Works

Test these features:
- ✅ Login with admin account
- ✅ Create a new insight
- ✅ Upload an image
- ✅ Export CSV
- ✅ Import CSV

---

## Optional: Setup HTTPS (10 minutes)

### Prerequisites
- Domain name pointing to your instance IP

### Install Nginx and SSL

```bash
# Install Nginx and Certbot
sudo apt install nginx certbot python3-certbot-nginx -y

# Create Nginx config
sudo nano /etc/nginx/sites-available/insight-manager
```

Paste this configuration:

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

Save and exit (Ctrl+X, Y, Enter).

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/insight-manager /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Follow prompts, select option 2 (redirect HTTP to HTTPS)
```

### Update Docker Compose

```bash
# Edit docker-compose.yml
nano docker-compose.yml
```

Change app ports from `"80:3000"` to `"3000:3000"`:

```yaml
app:
  ports:
    - "3000:3000"  # Change this line
```

Save and restart:

```bash
docker-compose down
docker-compose up -d
```

**Access your app at**: `https://your-domain.com`

---

## Maintenance Commands

### View Logs
```bash
docker-compose logs -f
```

### Restart Services
```bash
docker-compose restart
```

### Stop Services
```bash
docker-compose down
```

### Start Services
```bash
docker-compose up -d
```

### Backup Database
```bash
docker-compose exec db pg_dump -U postgres insight_manager > backup_$(date +%Y%m%d).sql
```

### Update Application
```bash
git pull origin main
docker-compose up -d --build
```

---

## Auto-Start on Reboot

```bash
# Create systemd service
sudo nano /etc/systemd/system/insight-manager.service
```

Paste:

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

Save and enable:

```bash
sudo systemctl enable insight-manager
sudo systemctl start insight-manager
```

---

## Cost

**Monthly Cost**: ~$10-12/month
- Instance (2 GB RAM): $10/month
- Static IP: Free (when attached)
- Snapshot backup: ~$1/month
- Data transfer: 2 TB included

---

## Troubleshooting

### Containers won't start
```bash
docker-compose logs
docker-compose restart
```

### Can't access application
```bash
# Check firewall
sudo ufw status

# Check if port 80 is open in Lightsail console
# Networking → IPv4 Firewall → HTTP should be enabled
```

### Out of memory
```bash
# Add swap space
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### Database connection error
```bash
# Check database is running
docker-compose ps db

# Restart database
docker-compose restart db
```

---

## Next Steps

1. ✅ Change default passwords
2. ✅ Set up HTTPS (if you have a domain)
3. ✅ Configure automatic backups
4. ✅ Set up monitoring
5. ✅ Create database backup schedule

---

## Support

- Full guide: [LIGHTSAIL_DEPLOYMENT.md](./LIGHTSAIL_DEPLOYMENT.md)
- AWS Lightsail docs: https://lightsail.aws.amazon.com/ls/docs
- GitHub issues: Create an issue

---

**That's it! Your insight manager is now live on AWS Lightsail.** 🚀

**Access**: `http://YOUR_INSTANCE_IP`  
**Login**: admin / admin123  
**Cost**: ~$10/month
