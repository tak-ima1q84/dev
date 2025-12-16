# AWS Lightsail Deployment Quickstart Guide

Welcome! This guide will help you deploy your Insight Manager application to AWS Lightsail quickly and easily.

## Prerequisites

Before we begin, please ensure you have:
- An AWS account with Lightsail access
- Your application code ready (this project)
- Basic familiarity with terminal/command line

## Step 1: Create Lightsail Instance

1. **Log into AWS Lightsail Console**
   - Visit: https://lightsail.aws.amazon.com/
   - Sign in with your AWS credentials

2. **Create a New Instance**
   - Click "Create instance"
   - Choose "Linux/Unix" platform
   - Select "Ubuntu 22.04 LTS" blueprint
   - Choose instance plan (recommend $10/month or higher for production)
   - Name your instance (e.g., "insight-manager")
   - Click "Create instance"

3. **Wait for Instance to Start**
   - This usually takes 1-2 minutes
   - Status will change from "Pending" to "Running"

## Step 2: Connect to Your Instance

1. **Use Lightsail Browser Terminal**
   - Click on your instance name
   - Click "Connect using SSH" (orange button)
   - A browser terminal will open

2. **Update System Packages**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

## Step 3: Install Required Software

1. **Install Node.js and npm**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. **Install Bun (JavaScript Runtime)**
   ```bash
   curl -fsSL https://bun.sh/install | bash
   source ~/.bashrc
   ```

3. **Install PostgreSQL**
   ```bash
   sudo apt install postgresql postgresql-contrib -y
   sudo systemctl start postgresql
   sudo systemctl enable postgresql
   ```

4. **Install Git**
   ```bash
   sudo apt install git -y
   ```

## Step 4: Setup Database

1. **Configure PostgreSQL**
   ```bash
   sudo -u postgres psql
   ```

2. **In PostgreSQL prompt, run:**
   ```sql
   CREATE DATABASE insight_manager;
   CREATE USER insight_user WITH PASSWORD 'your_secure_password_here';
   GRANT ALL PRIVILEGES ON DATABASE insight_manager TO insight_user;
   \q
   ```

3. **Configure PostgreSQL for connections**
   ```bash
   sudo nano /etc/postgresql/14/main/pg_hba.conf
   ```
   
   Add this line before other entries:
   ```
   local   insight_manager    insight_user                     md5
   ```

4. **Restart PostgreSQL**
   ```bash
   sudo systemctl restart postgresql
   ```

## Step 5: Deploy Your Application

1. **Clone or Upload Your Code**
   
   **Option A: Using Git (if your code is in a repository)**
   ```bash
   git clone https://github.com/yourusername/your-repo.git
   cd your-repo/insight-manager-v6
   ```
   
   **Option B: Upload files manually**
   - Use Lightsail file manager or SCP to upload your project files
   - Navigate to your project directory

2. **Install Dependencies**
   ```bash
   bun install
   ```

3. **Create Environment File**
   ```bash
   cp .env.example .env
   nano .env
   ```
   
   Update the .env file with your settings:
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=insight_user
   DB_PASSWORD=your_secure_password_here
   DB_NAME=insight_manager
   
   # JWT Secret (Generate a secure key)
   JWT_SECRET=your_very_secure_jwt_secret_key_here
   
   # Server Port
   PORT=3000
   ```

4. **Build the Application**
   ```bash
   bun run build
   ```

5. **Setup Database Schema**
   ```bash
   bun run db:push
   ```

6. **Seed Initial Data (Optional)**
   ```bash
   bun run db:seed
   ```

## Step 6: Configure Firewall and Networking

1. **Open Required Ports in Lightsail**
   - Go to your instance in Lightsail console
   - Click "Networking" tab
   - Add firewall rule:
     - Application: Custom
     - Protocol: TCP
     - Port: 3000
     - Source: Anywhere (0.0.0.0/0)

## Step 7: Start Your Application

1. **Test Run (Development Mode)**
   ```bash
   bun run start
   ```
   
   If everything works, you should see:
   ```
   🦊 Server running at http://localhost:3000
   ```

2. **Access Your Application**
   - Get your instance's public IP from Lightsail console
   - Visit: `http://YOUR_PUBLIC_IP:3000`

## Step 8: Setup Production Environment (Recommended)

1. **Install PM2 for Process Management**
   ```bash
   npm install -g pm2
   ```

2. **Create PM2 Configuration**
   ```bash
   nano ecosystem.config.js
   ```
   
   Add this content:
   ```javascript
   module.exports = {
     apps: [{
       name: 'insight-manager',
       script: 'bun',
       args: 'run src/server.ts',
       cwd: '/home/ubuntu/insight-manager-v6',
       instances: 1,
       autorestart: true,
       watch: false,
       max_memory_restart: '1G',
       env: {
         NODE_ENV: 'production',
         PORT: 3000
       }
     }]
   };
   ```

3. **Start with PM2**
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

4. **Setup Nginx (Optional - for custom domain)**
   ```bash
   sudo apt install nginx -y
   sudo nano /etc/nginx/sites-available/insight-manager
   ```
   
   Add this configuration:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;  # Replace with your domain
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   
   Enable the site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/insight-manager /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

## Step 9: Final Verification

1. **Check Application Status**
   ```bash
   pm2 status
   pm2 logs insight-manager
   ```

2. **Test All Features**
   - Visit your application URL
   - Test login functionality
   - Verify database operations work
   - Check file uploads (if applicable)

## Troubleshooting

### Common Issues and Solutions

**Issue: "Cannot connect to database"**
- Check PostgreSQL is running: `sudo systemctl status postgresql`
- Verify database credentials in .env file
- Check database exists: `sudo -u postgres psql -l`

**Issue: "Port 3000 not accessible"**
- Verify Lightsail firewall rules
- Check application is running: `pm2 status`
- Confirm port in .env matches firewall rule

**Issue: "Build fails"**
- Ensure all dependencies installed: `bun install`
- Check Node.js version: `node --version` (should be 18+)
- Review build logs for specific errors

**Issue: "Permission denied"**
- Check file permissions: `ls -la`
- Ensure ubuntu user owns files: `sudo chown -R ubuntu:ubuntu /path/to/project`

## Security Recommendations

1. **Change Default Passwords**
   - Update database password
   - Generate strong JWT secret
   - Use environment variables for sensitive data

2. **Enable HTTPS (Production)**
   - Use Let's Encrypt with Certbot
   - Configure SSL in Nginx

3. **Regular Updates**
   - Keep system packages updated
   - Update application dependencies regularly

4. **Backup Strategy**
   - Setup automated database backups
   - Consider Lightsail snapshots

## Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review application logs: `pm2 logs insight-manager`
3. Check system logs: `sudo journalctl -u postgresql`
4. Verify environment configuration

## Congratulations! 🎉

Your Insight Manager application should now be running successfully on AWS Lightsail. You can access it using your instance's public IP address on port 3000.

For production use, consider setting up a custom domain name and SSL certificate for enhanced security and professionalism.

---

**Need Help?** This guide covers the standard deployment process. If you encounter specific issues, please check the logs and troubleshooting section, or consult the AWS Lightsail documentation.