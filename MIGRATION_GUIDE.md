# Migration Guide: v2 to v3

This guide helps you migrate from insight-manager-v2 (Docker Compose) to insight-manager-v3 (Render deployment).

## What's New in v3

- ✅ **Render-optimized**: Ready for cloud deployment
- ✅ **DATABASE_URL support**: Single connection string for PostgreSQL
- ✅ **Automatic builds**: `postinstall` script for Render
- ✅ **Blueprint deployment**: One-click setup with `render.yaml`
- ✅ **Production-ready**: Environment variable best practices

## Key Changes

### 1. Database Connection

**v2 (Multiple environment variables)**:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=insight_manager
```

**v3 (Single DATABASE_URL)**:
```env
# Render automatically provides this
DATABASE_URL=postgresql://user:password@host:port/database

# Or for local development, still use individual vars
DB_HOST=localhost
DB_PORT=5432
# ... etc
```

### 2. Package.json Scripts

**Added**:
- `start`: Production start command
- `postinstall`: Automatic build after install

### 3. New Files

- `render.yaml`: Blueprint configuration
- `RENDER_DEPLOYMENT.md`: Comprehensive deployment guide
- `QUICKSTART_RENDER.md`: 5-minute quick start
- `.env.example`: Environment variable template
- `MIGRATION_GUIDE.md`: This file

## Migration Steps

### Option A: Fresh Deployment (Recommended)

1. **Deploy v3 to Render** (see QUICKSTART_RENDER.md)
2. **Export data from v2**:
   ```bash
   # In v2 directory
   docker-compose exec app bun run src/export-data.ts > data.json
   ```
3. **Import data to v3**:
   - Use CSV export/import feature
   - Or manually recreate critical data

### Option B: Database Migration

If you want to migrate your existing PostgreSQL data:

1. **Export v2 database**:
   ```bash
   docker-compose exec db pg_dump -U postgres insight_manager > v2_backup.sql
   ```

2. **Deploy v3 to Render** (see QUICKSTART_RENDER.md)

3. **Import to Render database**:
   ```bash
   # Get DATABASE_URL from Render dashboard
   psql $DATABASE_URL < v2_backup.sql
   ```

4. **Verify data**:
   - Login to v3 application
   - Check insights, users, master data

### Option C: Keep v2 Running Locally

You can run both versions simultaneously:
- v2: Local development (Docker Compose)
- v3: Production (Render)

Just ensure they use different databases or ports.

## Code Compatibility

v3 is **100% backward compatible** with v2. All features work identically:
- ✅ Authentication & JWT
- ✅ Insight CRUD operations
- ✅ CSV import/export
- ✅ Image uploads
- ✅ Master data management
- ✅ Search & filtering

## Environment Variables Mapping

| v2 Variable | v3 Variable | Notes |
|-------------|-------------|-------|
| DB_HOST | DB_HOST or DATABASE_URL | Use DATABASE_URL on Render |
| DB_PORT | DB_PORT or DATABASE_URL | Use DATABASE_URL on Render |
| DB_USER | DB_USER or DATABASE_URL | Use DATABASE_URL on Render |
| DB_PASSWORD | DB_PASSWORD or DATABASE_URL | Use DATABASE_URL on Render |
| DB_NAME | DB_NAME or DATABASE_URL | Use DATABASE_URL on Render |
| JWT_SECRET | JWT_SECRET | Same (generate new for production) |
| PORT | PORT | Same (default 3000) |

## File Uploads Consideration

### v2 (Docker Compose)
- Files stored in `./uploads` volume
- Persistent across container restarts

### v3 (Render Free Tier)
- Files stored in ephemeral storage
- **Lost on service restart**

### Solutions for v3

1. **Upgrade to Render Paid Plan**:
   - Add persistent disk
   - Mount to `/app/uploads`
   - ~$1/month for 10GB

2. **Use Cloud Storage** (Recommended):
   - AWS S3
   - Cloudinary
   - Google Cloud Storage
   - Modify upload logic in `src/routes/insights.ts`

## Testing Your Migration

### Checklist

- [ ] Deploy v3 to Render
- [ ] Run database migrations (`bun run db:push`)
- [ ] Seed initial data (`bun run db:seed`)
- [ ] Login with default credentials
- [ ] Create test insight
- [ ] Upload test image
- [ ] Export CSV
- [ ] Import CSV
- [ ] Test all user roles (Admin, Manager, Viewer)
- [ ] Verify master data management
- [ ] Check search functionality
- [ ] Test on mobile browser

## Rollback Plan

If you encounter issues with v3:

1. **Keep v2 running** until v3 is stable
2. **Database backup**: Always backup before migration
3. **Render rollback**: Use "Rollback" feature in Render dashboard
4. **Return to v2**: Simply restart your Docker Compose setup

## Performance Comparison

| Aspect | v2 (Docker) | v3 (Render Free) | v3 (Render Paid) |
|--------|-------------|------------------|------------------|
| Startup | Instant | 30-60s (cold start) | Instant |
| Availability | Manual | Auto-restart | Auto-restart |
| SSL | Manual | Automatic | Automatic |
| Scaling | Manual | Manual | Auto-scaling |
| Cost | Server cost | $0 | ~$15/month |

## Common Issues

### Issue: "Cannot connect to database"
**Solution**: Verify DATABASE_URL is set in Render environment variables

### Issue: "Module not found"
**Solution**: Ensure `postinstall` script ran during deployment

### Issue: "Images not loading"
**Solution**: 
- Check uploads directory exists
- Consider cloud storage for production

### Issue: "Slow first request"
**Solution**: 
- Free tier spins down after 15 min
- Upgrade to paid plan for instant response

## Support

- **v3 Documentation**: See RENDER_DEPLOYMENT.md
- **Render Support**: https://render.com/docs
- **GitHub Issues**: Create issue in repository

## Recommended Timeline

1. **Week 1**: Deploy v3 to Render, test thoroughly
2. **Week 2**: Run both v2 and v3 in parallel
3. **Week 3**: Migrate data, switch users to v3
4. **Week 4**: Decommission v2 if v3 is stable

## Questions?

- Check RENDER_DEPLOYMENT.md for detailed deployment info
- Check QUICKSTART_RENDER.md for quick setup
- Review Render documentation: https://render.com/docs

---

**Good luck with your migration!** 🚀
