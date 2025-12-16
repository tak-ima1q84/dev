# Quick Deploy to AWS Lightsail

## 🚀 One-Command Setup Script

Save this as `deploy.sh` and run it on your Lightsail instance:

```bash
#!/bin/bash
set -e

echo "🔧 Installing system dependencies..."
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs postgresql postgresql-contrib git nginx
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc

echo "🗄️ Setting up database..."
sudo -u postgres createdb insight_manager
sudo -u postgres psql -c "CREATE USER insight_user WITH PASSWORD 'secure_password_123';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE insight_manager TO insight_user;"

echo "📦 Installing application..."
bun install
cp .env.example .env

# Update .env with database credentials
sed -i 's/DB_PASSWORD=.*/DB_PASSWORD=secure_password_123/' .env
sed -i 's/JWT_SECRET=.*/JWT_SECRET=super_secure_jwt_key_change_in_production/' .env

echo "🏗️ Building application..."
bun run build
bun run db:push

echo "🔥 Starting application..."
npm install -g pm2
pm2 start "bun run src/server.ts" --name insight-manager
pm2 save
pm2 startup

echo "✅ Deployment complete!"
echo "🌐 Access your app at: http://$(curl -s ifconfig.me):3000"
```

## 📋 Manual Steps (5 minutes)

1. **Create Lightsail Instance**
   - Ubuntu 22.04 LTS
   - $10/month plan minimum
   - Open port 3000 in firewall

2. **Run Commands**
   ```bash
   # Install Bun
   curl -fsSL https://bun.sh/install | bash && source ~/.bashrc
   
   # Install PostgreSQL
   sudo apt update && sudo apt install postgresql postgresql-contrib -y
   
   # Setup database
   sudo -u postgres createdb insight_manager
   sudo -u postgres psql -c "CREATE USER insight_user WITH PASSWORD 'your_password';"
   sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE insight_manager TO insight_user;"
   
   # Deploy app
   bun install && cp .env.example .env
   # Edit .env with your database password
   bun run build && bun run db:push
   
   # Start with PM2
   npm install -g pm2
   pm2 start "bun run src/server.ts" --name insight-manager
   ```

3. **Access Application**
   - Visit: `http://YOUR_LIGHTSAIL_IP:3000`

## 🔧 Environment Variables (.env)

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=insight_user
DB_PASSWORD=your_secure_password
DB_NAME=insight_manager
JWT_SECRET=your_jwt_secret_key
PORT=3000
```

## 🚨 Troubleshooting

- **Can't connect**: Check firewall port 3000 is open
- **Database error**: Verify PostgreSQL is running: `sudo systemctl status postgresql`
- **Build fails**: Ensure Bun is installed: `bun --version`
- **App crashes**: Check logs: `pm2 logs insight-manager`

## 🔒 Production Checklist

- [ ] Change default database password
- [ ] Generate secure JWT secret
- [ ] Setup SSL certificate
- [ ] Configure domain name
- [ ] Enable automatic backups
- [ ] Setup monitoring

---
**Total deployment time: ~10 minutes** ⏱️