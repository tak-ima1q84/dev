# Render Deployment Guide

This guide explains how to deploy insight-manager-v3 to Render with PostgreSQL.

## Prerequisites

- GitHub account (to connect your repository)
- Render account (free tier available at https://render.com)
- Git repository with this code

## Deployment Options

### Option 1: Automatic Deployment with render.yaml (Recommended)

1. **Push code to GitHub**
   ```bash
   cd insight-manager-v3
   git init
   git add .
   git commit -m "Initial commit for Render deployment"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Create New Blueprint on Render**
   - Go to https://dashboard.render.com
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect `render.yaml` and create:
     - PostgreSQL database (insight-manager-db)
     - Web service (insight-manager-v3)
   - Click "Apply" to start deployment

3. **Run Database Migrations**
   After deployment completes:
   - Go to your web service dashboard
   - Click "Shell" tab
   - Run:
     ```bash
     bun run db:push
     bun run db:seed
     ```

### Option 2: Manual Deployment

#### Step 1: Create PostgreSQL Database

1. Go to Render Dashboard → "New +" → "PostgreSQL"
2. Configure:
   - Name: `insight-manager-db`
   - Database: `insight_manager`
   - User: (auto-generated)
   - Region: Choose closest to your users
   - Plan: Free or Starter
3. Click "Create Database"
4. Copy the "Internal Database URL" (starts with `postgresql://`)

#### Step 2: Create Web Service

1. Go to Render Dashboard → "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - Name: `insight-manager-v3`
   - Region: Same as database
   - Branch: `main`
   - Runtime: `Docker`
   - Plan: Free or Starter

4. **Environment Variables**:
   Add these in the "Environment" section:
   
   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | Paste the Internal Database URL from Step 1 |
   | `JWT_SECRET` | Generate a secure random string (e.g., use `openssl rand -base64 32`) |
   | `PORT` | `3000` |

5. **Build & Deploy Settings**:
   - Build Command: `bun install && bun run build`
   - Start Command: `bun run start`

6. Click "Create Web Service"

#### Step 3: Run Database Migrations

Once deployment completes:
1. Go to your web service dashboard
2. Click "Shell" tab
3. Run:
   ```bash
   bun run db:push
   bun run db:seed
   ```

## Post-Deployment

### Access Your Application

Your app will be available at: `https://insight-manager-v3.onrender.com`

### Default Users

After running `db:seed`, these users are available:

| Username | Password | Role | Permissions |
|----------|----------|------|-------------|
| admin | admin123 | Admin | Full access including master data management |
| manager | manager123 | Manager | Create, edit, delete insights and CSV operations |
| viewer | viewer123 | Viewer | Read-only access |

**⚠️ IMPORTANT**: Change these passwords immediately in production!

### File Uploads

Render's free tier has ephemeral storage, meaning uploaded files will be lost on restart. For production:

1. **Option A**: Use Render Disks (Paid plans)
   - Add a persistent disk in Render dashboard
   - Mount to `/app/uploads`

2. **Option B**: Use Cloud Storage (Recommended)
   - AWS S3
   - Cloudinary
   - Google Cloud Storage
   - Update the upload logic in `src/routes/insights.ts`

## Environment Variables Reference

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Yes | - |
| `JWT_SECRET` | Secret key for JWT tokens | Yes | - |
| `PORT` | Server port | No | 3000 |
| `DB_HOST` | Database host (local dev only) | No | localhost |
| `DB_PORT` | Database port (local dev only) | No | 5432 |
| `DB_USER` | Database user (local dev only) | No | postgres |
| `DB_PASSWORD` | Database password (local dev only) | No | postgres |
| `DB_NAME` | Database name (local dev only) | No | insight_manager |

## Monitoring & Logs

### View Logs
1. Go to your web service dashboard
2. Click "Logs" tab
3. Monitor real-time application logs

### Health Checks
Render automatically monitors your service. If it becomes unresponsive, it will restart automatically.

## Troubleshooting

### Database Connection Issues

**Error**: "Connection refused" or "Cannot connect to database"

**Solution**:
1. Verify `DATABASE_URL` is set correctly
2. Check database is running in Render dashboard
3. Ensure web service and database are in the same region
4. Use "Internal Database URL" not "External Database URL"

### Build Failures

**Error**: "bun: command not found"

**Solution**:
- Ensure Dockerfile is present and uses `oven/bun:1` base image
- Render should automatically detect and use Docker

**Error**: "Module not found"

**Solution**:
```bash
# In Render Shell
bun install
bun run build
```

### Migration Issues

**Error**: "relation does not exist"

**Solution**:
```bash
# In Render Shell
bun run db:push
```

### Upload Directory Issues

**Error**: "ENOENT: no such file or directory, open 'uploads/...'"

**Solution**:
1. Create uploads directory in Dockerfile:
   ```dockerfile
   RUN mkdir -p uploads
   ```
2. Or use cloud storage (recommended for production)

## Updating Your Application

### Automatic Deploys
Render automatically deploys when you push to your connected branch:
```bash
git add .
git commit -m "Update feature"
git push origin main
```

### Manual Deploy
1. Go to web service dashboard
2. Click "Manual Deploy" → "Deploy latest commit"

### Rolling Back
1. Go to web service dashboard
2. Click "Events" tab
3. Find previous successful deploy
4. Click "Rollback to this version"

## Database Management

### Backup Database
```bash
# From Render Shell
pg_dump $DATABASE_URL > backup.sql
```

### Restore Database
```bash
# From Render Shell
psql $DATABASE_URL < backup.sql
```

### Connect to Database
```bash
# From Render Shell
psql $DATABASE_URL
```

## Performance Optimization

### Free Tier Limitations
- Service spins down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds
- 750 hours/month free compute time

### Upgrade Recommendations
For production use, consider:
- **Starter Plan** ($7/month): No spin-down, better performance
- **PostgreSQL Starter** ($7/month): Better database performance
- **Persistent Disk**: For file uploads

## Security Best Practices

1. **Change Default Passwords**
   - Update all default user passwords immediately
   - Use strong, unique passwords

2. **Secure JWT Secret**
   - Generate a strong random secret
   - Never commit secrets to Git
   - Use Render's environment variables

3. **HTTPS**
   - Render provides free SSL certificates
   - All traffic is automatically encrypted

4. **Database Security**
   - Use Internal Database URL (not exposed to internet)
   - Render manages database security and updates

## Cost Estimation

### Free Tier
- Web Service: Free (with limitations)
- PostgreSQL: Free (with limitations)
- Total: $0/month

### Production Tier
- Web Service Starter: $7/month
- PostgreSQL Starter: $7/month
- Persistent Disk (10GB): $1/month
- Total: ~$15/month

## Support

- Render Documentation: https://render.com/docs
- Render Community: https://community.render.com
- Bun Documentation: https://bun.sh/docs

## Next Steps

After successful deployment:
1. ✅ Test all features (login, CRUD, CSV import/export)
2. ✅ Change default passwords
3. ✅ Set up cloud storage for uploads (if needed)
4. ✅ Configure custom domain (optional)
5. ✅ Set up monitoring and alerts
6. ✅ Create database backup schedule
