# Deployment Checklist

Use this checklist to ensure a smooth deployment to Render.

## Pre-Deployment

### Code Preparation
- [ ] All code committed to Git
- [ ] `.env` file NOT committed (in .gitignore)
- [ ] `.env.example` file present
- [ ] `render.yaml` file present
- [ ] `Dockerfile` tested locally
- [ ] All dependencies in `package.json`

### Repository Setup
- [ ] Code pushed to GitHub
- [ ] Repository is public or Render has access
- [ ] Main branch is up to date
- [ ] No sensitive data in repository

### Local Testing
- [ ] Application runs locally with `bun run dev`
- [ ] Database migrations work (`bun run db:push`)
- [ ] Seed data loads (`bun run db:seed`)
- [ ] All features tested:
  - [ ] Login/logout
  - [ ] Create insight
  - [ ] Edit insight
  - [ ] Delete insight
  - [ ] Upload images
  - [ ] CSV export
  - [ ] CSV import
  - [ ] Master data management
  - [ ] Search/filter

## Render Setup

### Account & Billing
- [ ] Render account created
- [ ] Payment method added (if using paid tier)
- [ ] Billing alerts configured

### Database Creation
- [ ] PostgreSQL database created
- [ ] Database name: `insight_manager`
- [ ] Region selected (closest to users)
- [ ] Plan selected (Free or Starter)
- [ ] Internal Database URL copied

### Web Service Creation
- [ ] Web service created
- [ ] GitHub repository connected
- [ ] Runtime set to Docker
- [ ] Region matches database region
- [ ] Plan selected (Free or Starter)

### Environment Variables
- [ ] `DATABASE_URL` set (from database)
- [ ] `JWT_SECRET` generated and set
- [ ] `PORT` set to 3000
- [ ] All variables verified

### Build Configuration
- [ ] Build command: `bun install && bun run build`
- [ ] Start command: `bun run start`
- [ ] Auto-deploy enabled

## Initial Deployment

### Deploy Process
- [ ] Deployment triggered
- [ ] Build logs monitored
- [ ] Build completed successfully
- [ ] Service started successfully
- [ ] Health check passed

### Database Initialization
- [ ] Shell accessed in Render dashboard
- [ ] `bun run db:push` executed successfully
- [ ] `bun run db:seed` executed successfully
- [ ] No errors in output

### First Access
- [ ] Application URL accessed
- [ ] Login page loads
- [ ] Login with admin/admin123 works
- [ ] Dashboard displays correctly

## Post-Deployment Testing

### Functionality Tests
- [ ] **Authentication**
  - [ ] Login as admin
  - [ ] Login as manager
  - [ ] Login as viewer
  - [ ] Logout works
  - [ ] Invalid credentials rejected

- [ ] **Insight Management**
  - [ ] View insight list
  - [ ] Create new insight
  - [ ] Edit existing insight
  - [ ] Delete insight
  - [ ] View insight details

- [ ] **Image Upload**
  - [ ] Upload teaser image
  - [ ] Upload story images
  - [ ] View uploaded images
  - [ ] Image preview works

- [ ] **CSV Operations**
  - [ ] Export CSV
  - [ ] Download CSV file
  - [ ] Import CSV
  - [ ] Import validation works
  - [ ] Import errors displayed

- [ ] **Search & Filter**
  - [ ] Search by creation number
  - [ ] Search by subject
  - [ ] Filter by status
  - [ ] Filter by type
  - [ ] Filter by category
  - [ ] Clear filters

- [ ] **Master Data** (Admin only)
  - [ ] View master data
  - [ ] Create new option
  - [ ] Edit option
  - [ ] Delete option
  - [ ] Options appear in dropdowns

### Performance Tests
- [ ] Page load time acceptable (<3s)
- [ ] API response time acceptable (<1s)
- [ ] Image upload time acceptable (<5s)
- [ ] CSV export time acceptable (<10s)
- [ ] CSV import time acceptable (<30s)

### Browser Compatibility
- [ ] Chrome/Edge (desktop)
- [ ] Firefox (desktop)
- [ ] Safari (desktop)
- [ ] Chrome (mobile)
- [ ] Safari (mobile)

### Security Tests
- [ ] HTTPS enabled (automatic)
- [ ] Unauthorized access blocked
- [ ] Role permissions enforced
- [ ] JWT tokens working
- [ ] Password not visible in logs

## Production Readiness

### Security Hardening
- [ ] Default passwords changed
  - [ ] admin password changed
  - [ ] manager password changed
  - [ ] viewer password changed
- [ ] Strong JWT_SECRET generated
- [ ] Environment variables secured
- [ ] No secrets in code/logs

### Monitoring Setup
- [ ] Render dashboard bookmarked
- [ ] Log monitoring configured
- [ ] Error alerts enabled
- [ ] Uptime monitoring enabled
- [ ] Database monitoring enabled

### Backup Strategy
- [ ] Database backup schedule created
- [ ] Backup restoration tested
- [ ] Backup storage location confirmed
- [ ] Recovery procedure documented

### Documentation
- [ ] README.md updated with production URL
- [ ] Team members have access credentials
- [ ] Deployment process documented
- [ ] Troubleshooting guide available
- [ ] Support contacts listed

### Performance Optimization
- [ ] Database indexes verified
- [ ] Query performance acceptable
- [ ] Image sizes optimized
- [ ] Caching configured (if needed)
- [ ] CDN considered (if needed)

## Optional Enhancements

### Custom Domain
- [ ] Domain purchased
- [ ] DNS configured
- [ ] Custom domain added in Render
- [ ] SSL certificate verified

### Persistent Storage
- [ ] Persistent disk added (paid plan)
- [ ] Disk mounted to `/app/uploads`
- [ ] Upload functionality tested
- [ ] Files persist after restart

### Cloud Storage
- [ ] Cloud storage service selected (S3/Cloudinary)
- [ ] API keys configured
- [ ] Upload logic updated
- [ ] Migration from local storage completed

### Monitoring & Analytics
- [ ] Application monitoring tool integrated
- [ ] Error tracking configured (Sentry, etc.)
- [ ] Analytics added (if needed)
- [ ] Performance monitoring enabled

### CI/CD
- [ ] GitHub Actions configured (optional)
- [ ] Automated tests running
- [ ] Deployment pipeline verified
- [ ] Rollback procedure tested

## Launch

### Pre-Launch
- [ ] All checklist items completed
- [ ] Stakeholders notified
- [ ] Launch date/time scheduled
- [ ] Rollback plan prepared
- [ ] Support team ready

### Launch Day
- [ ] Final deployment verified
- [ ] All systems operational
- [ ] Users notified
- [ ] Monitoring active
- [ ] Support available

### Post-Launch
- [ ] Monitor logs for errors
- [ ] Check performance metrics
- [ ] Gather user feedback
- [ ] Address any issues
- [ ] Document lessons learned

## Maintenance Schedule

### Daily
- [ ] Check error logs
- [ ] Monitor uptime
- [ ] Review performance metrics

### Weekly
- [ ] Review user activity
- [ ] Check database size
- [ ] Verify backups
- [ ] Update dependencies (if needed)

### Monthly
- [ ] Security audit
- [ ] Performance review
- [ ] Cost analysis
- [ ] Feature planning

## Troubleshooting Reference

### Common Issues

**Service won't start**
- Check logs in Render dashboard
- Verify DATABASE_URL is set
- Ensure db:push was run

**Database connection error**
- Use Internal Database URL
- Check database is running
- Verify same region

**Images not persisting**
- Free tier has ephemeral storage
- Upgrade to paid plan with disk
- Or use cloud storage

**Slow performance**
- Free tier spins down after 15 min
- Upgrade to paid plan
- Optimize database queries

**Build failures**
- Check build logs
- Verify all dependencies installed
- Ensure Dockerfile is correct

## Support Contacts

- **Render Support**: https://render.com/docs
- **GitHub Issues**: [Your repository URL]
- **Team Lead**: [Contact info]
- **Database Admin**: [Contact info]

---

## Sign-Off

- [ ] Deployment completed by: ________________
- [ ] Date: ________________
- [ ] Verified by: ________________
- [ ] Date: ________________

**Status**: ⬜ Not Started | ⬜ In Progress | ⬜ Completed | ⬜ Production

---

**Congratulations on your deployment!** 🎉
