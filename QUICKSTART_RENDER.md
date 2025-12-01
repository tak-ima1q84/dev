# Quick Start Guide - Render Deployment

Deploy insight-manager-v3 to Render in 5 minutes.

## Step 1: Prepare Your Repository

```bash
cd insight-manager-v3
git init
git add .
git commit -m "Initial commit"
```

Push to GitHub:
```bash
git remote add origin https://github.com/YOUR_USERNAME/insight-manager-v3.git
git push -u origin main
```

## Step 2: Deploy to Render

### Using Blueprint (Automatic - Recommended)

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Blueprint"**
3. Connect your GitHub repository
4. Select the repository with `insight-manager-v3`
5. Render detects `render.yaml` automatically
6. Click **"Apply"**

Render will create:
- ✅ PostgreSQL database: `insight-manager-db`
- ✅ Web service: `insight-manager-v3`
- ✅ Environment variables (DATABASE_URL, JWT_SECRET)

### Manual Setup (Alternative)

#### Create Database
1. **New +** → **PostgreSQL**
2. Name: `insight-manager-db`
3. Database: `insight_manager`
4. Click **Create Database**
5. Copy **Internal Database URL**

#### Create Web Service
1. **New +** → **Web Service**
2. Connect GitHub repo
3. Settings:
   - Name: `insight-manager-v3`
   - Runtime: **Docker**
   - Build Command: `bun install && bun run build`
   - Start Command: `bun run start`
4. Environment Variables:
   - `DATABASE_URL`: (paste Internal Database URL)
   - `JWT_SECRET`: (generate random string)
   - `PORT`: `3000`
5. Click **Create Web Service**

## Step 3: Initialize Database

After deployment completes (5-10 minutes):

1. Go to your web service dashboard
2. Click **"Shell"** tab
3. Run these commands:

```bash
bun run db:push
bun run db:seed
```

## Step 4: Access Your App

Your app is live at: `https://insight-manager-v3.onrender.com`

### Login Credentials

| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | Admin |
| manager | manager123 | Manager |
| viewer | viewer123 | Viewer |

**⚠️ Change these passwords immediately!**

## Step 5: Test Features

- ✅ Login with admin account
- ✅ Create a new insight
- ✅ Upload images
- ✅ Export CSV
- ✅ Import CSV
- ✅ Manage master data

## Troubleshooting

### Service won't start
- Check logs in Render dashboard
- Verify DATABASE_URL is set
- Ensure db:push was run

### Database connection error
- Use **Internal Database URL** (not External)
- Check database is running
- Verify same region for web service and database

### Images not persisting
- Free tier has ephemeral storage
- Files are lost on restart
- Solution: Upgrade to paid plan with persistent disk or use cloud storage (S3, Cloudinary)

## Next Steps

1. **Security**: Change default passwords
2. **Custom Domain**: Add your domain in Render settings
3. **Monitoring**: Set up alerts in Render dashboard
4. **Backups**: Schedule database backups
5. **Storage**: Configure cloud storage for uploads (production)

## Cost

### Free Tier
- Web Service: Free (spins down after 15 min inactivity)
- PostgreSQL: Free (limited storage)
- **Total: $0/month**

### Production Tier
- Web Service Starter: $7/month (no spin-down)
- PostgreSQL Starter: $7/month
- Persistent Disk: $1/month
- **Total: ~$15/month**

## Support

- Full guide: [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md)
- Render docs: https://render.com/docs
- Issues: Create GitHub issue

---

**That's it! Your insight manager is now live on Render.** 🚀
