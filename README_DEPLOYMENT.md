# 🚀 AWS Lightsail Deployment

## Quick Start (2 minutes)

1. **Create Lightsail Instance**
   - Go to [AWS Lightsail Console](https://lightsail.aws.amazon.com/)
   - Create Ubuntu 22.04 LTS instance ($10/month recommended)
   - Open port 3000 in firewall settings

2. **Upload and Run Deployment Script**
   ```bash
   # Upload your project files to the instance
   # Then run the automated deployment script:
   ./deploy-lightsail.sh
   ```

3. **Access Your Application**
   - Visit: `http://YOUR_LIGHTSAIL_IP:3000`

## What the Script Does

✅ Installs all required dependencies (Node.js, Bun, PostgreSQL)  
✅ Sets up secure database with random passwords  
✅ Builds your application  
✅ Configures production environment  
✅ Starts application with PM2 process manager  
✅ Sets up automatic restart on system reboot  

## Manual Deployment

If you prefer manual steps, see:
- `LIGHTSAIL_QUICKSTART.md` - Detailed step-by-step guide
- `QUICK_DEPLOY.md` - Condensed manual commands

## After Deployment

### Essential Commands
```bash
# Check application status
pm2 status

# View logs
pm2 logs insight-manager

# Restart application
pm2 restart insight-manager

# Stop application
pm2 stop insight-manager
```

### Security Setup (Recommended)
1. Change default admin password in the application
2. Setup SSL certificate for HTTPS
3. Configure domain name
4. Enable automatic backups

## Troubleshooting

**Application won't start?**
```bash
pm2 logs insight-manager  # Check error logs
pm2 restart insight-manager  # Try restarting
```

**Can't access from browser?**
- Verify Lightsail firewall allows port 3000
- Check if application is running: `pm2 status`

**Database connection issues?**
```bash
sudo systemctl status postgresql  # Check PostgreSQL status
sudo systemctl restart postgresql  # Restart if needed
```

## Support Files

- `deploy-lightsail.sh` - Automated deployment script
- `LIGHTSAIL_QUICKSTART.md` - Detailed manual guide  
- `QUICK_DEPLOY.md` - Quick reference commands
- `ecosystem.config.js` - PM2 configuration (auto-generated)

---

**Total deployment time: ~5 minutes** ⏱️

Need help? Check the troubleshooting section or review the detailed guides above.