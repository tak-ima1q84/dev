# Quick Reference Card

## 🚀 Deploy to Render (5 minutes)

```bash
# 1. Push to GitHub
git init && git add . && git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main

# 2. On Render Dashboard
# New + → Blueprint → Connect repo → Apply

# 3. After deployment, in Render Shell
bun run db:push
bun run db:seed
```

**Done!** Access at: `https://insight-manager-v3.onrender.com`

---

## 🔑 Default Login

| User | Password | Role |
|------|----------|------|
| admin | admin123 | Admin |
| manager | manager123 | Manager |
| viewer | viewer123 | Viewer |

---

## 🛠️ Local Development

```bash
# Install
bun install

# Start database
docker-compose up -d db

# Setup database
bun run db:push
bun run db:seed

# Run dev server
bun run dev
```

Access at: `http://localhost:3000`

---

## 📝 Environment Variables

### Render (Production)
```env
DATABASE_URL=<auto-provided-by-render>
JWT_SECRET=<generate-random-string>
PORT=3000
```

### Local Development
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=insight_manager
JWT_SECRET=your-secret-key
PORT=3000
```

---

## 🗄️ Database Commands

```bash
# Generate migration
bun run db:generate

# Apply schema
bun run db:push

# Seed data
bun run db:seed
```

---

## 📦 NPM Scripts

```bash
bun run dev          # Start dev server
bun run build        # Build frontend
bun run start        # Start production server
bun run db:generate  # Generate migrations
bun run db:push      # Apply schema
bun run db:seed      # Seed initial data
```

---

## 🌐 API Endpoints

### Auth
- `POST /api/auth/login` - Login

### Insights
- `GET /api/insights` - List (with filters)
- `GET /api/insights/:id` - Get one
- `POST /api/insights` - Create
- `PUT /api/insights/:id` - Update
- `DELETE /api/insights/:id` - Delete
- `POST /api/insights/upload` - Upload image
- `POST /api/insights/import/csv` - Import CSV
- `GET /api/insights/export/csv` - Export CSV

### Masters
- `GET /api/masters` - List
- `POST /api/masters` - Create (Admin)
- `PUT /api/masters/:id` - Update (Admin)
- `DELETE /api/masters/:id` - Delete (Admin)

---

## 🔍 Troubleshooting

### Service won't start
```bash
# Check logs
# Render Dashboard → Logs tab

# Verify DATABASE_URL
# Render Dashboard → Environment tab
```

### Database connection error
```bash
# Use Internal Database URL (not External)
# Ensure same region for web service and database
```

### Images not persisting
```bash
# Free tier = ephemeral storage
# Solution: Upgrade to paid plan + persistent disk
# Or: Use cloud storage (S3, Cloudinary)
```

### Slow first request
```bash
# Free tier spins down after 15 min
# Solution: Upgrade to Starter plan ($7/month)
```

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| README.md | Main documentation |
| QUICKSTART_RENDER.md | 5-minute deploy guide |
| RENDER_DEPLOYMENT.md | Complete deployment guide |
| MIGRATION_GUIDE.md | v2 to v3 migration |
| DEPLOYMENT_CHECKLIST.md | Pre-launch checklist |
| PROJECT_SUMMARY_V3.md | Technical overview |

---

## 💰 Pricing

### Free Tier
- Web Service: Free (spins down after 15 min)
- PostgreSQL: Free (limited)
- **Total: $0/month**

### Production Tier
- Web Service Starter: $7/month
- PostgreSQL Starter: $7/month
- Persistent Disk (10GB): $1/month
- **Total: ~$15/month**

---

## 🔗 Useful Links

- **Render Dashboard**: https://dashboard.render.com
- **Render Docs**: https://render.com/docs
- **Bun Docs**: https://bun.sh/docs
- **Drizzle ORM**: https://orm.drizzle.team
- **ElysiaJS**: https://elysiajs.com

---

## 🆘 Quick Help

**Need help?**
1. Check logs in Render dashboard
2. Review RENDER_DEPLOYMENT.md
3. Check troubleshooting section
4. Create GitHub issue

**Emergency rollback:**
1. Render Dashboard → Events
2. Find previous deploy
3. Click "Rollback"

---

## ✅ Post-Deployment Checklist

- [ ] Change default passwords
- [ ] Test all features
- [ ] Configure monitoring
- [ ] Set up backups
- [ ] Add custom domain (optional)
- [ ] Configure cloud storage (optional)

---

**Version**: 3.0.0  
**Last Updated**: December 2025

---

**Happy deploying!** 🎉
