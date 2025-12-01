# Visual Deployment Steps

Step-by-step visual guide for deploying to Render.

---

## 📋 Prerequisites

```
✅ GitHub account
✅ Render account (free at render.com)
✅ Code pushed to GitHub repository
```

---

## 🚀 Deployment Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    DEPLOYMENT PROCESS                        │
└─────────────────────────────────────────────────────────────┘

Step 1: Push to GitHub
   │
   ├─► git init
   ├─► git add .
   ├─► git commit -m "Initial commit"
   ├─► git remote add origin <repo-url>
   └─► git push -u origin main
   │
   ▼

Step 2: Create Render Blueprint
   │
   ├─► Go to dashboard.render.com
   ├─► Click "New +" → "Blueprint"
   ├─► Connect GitHub repository
   ├─► Select insight-manager-v3 repo
   └─► Click "Apply"
   │
   ▼

Step 3: Render Auto-Creates
   │
   ├─► PostgreSQL Database (insight-manager-db)
   ├─► Web Service (insight-manager-v3)
   ├─► Environment Variables (DATABASE_URL, JWT_SECRET)
   └─► Builds and deploys application
   │
   ▼

Step 4: Initialize Database
   │
   ├─► Open web service dashboard
   ├─► Click "Shell" tab
   ├─► Run: bun run db:push
   └─► Run: bun run db:seed
   │
   ▼

Step 5: Access Application
   │
   ├─► URL: https://insight-manager-v3.onrender.com
   ├─► Login: admin / admin123
   └─► ✅ Success!
```

---

## 📸 Step-by-Step Screenshots Guide

### Step 1: Push Code to GitHub

```bash
cd insight-manager-v3
git init
git add .
git commit -m "Initial commit for Render deployment"
git remote add origin https://github.com/YOUR_USERNAME/insight-manager-v3.git
git push -u origin main
```

**Expected Output:**
```
Enumerating objects: 50, done.
Counting objects: 100% (50/50), done.
Writing objects: 100% (50/50), 1.2 MiB | 2.5 MiB/s, done.
Total 50 (delta 0), reused 0 (delta 0)
To https://github.com/YOUR_USERNAME/insight-manager-v3.git
 * [new branch]      main -> main
```

---

### Step 2: Render Dashboard - New Blueprint

**Navigate to:**
```
https://dashboard.render.com
```

**Click:**
```
┌─────────────────────────────────────┐
│  New +  ▼                           │
│    ├─ Web Service                   │
│    ├─ Static Site                   │
│    ├─ Private Service               │
│    ├─ Background Worker             │
│    ├─ Cron Job                      │
│    ├─ PostgreSQL                    │
│    ├─ Redis                         │
│    └─ Blueprint  ◄── SELECT THIS    │
└─────────────────────────────────────┘
```

---

### Step 3: Connect Repository

**Screen: "Connect a repository"**

```
┌─────────────────────────────────────────────────────┐
│  Connect a repository                                │
│                                                       │
│  ┌─────────────────────────────────────────────┐   │
│  │  🔗 Connect GitHub                          │   │
│  └─────────────────────────────────────────────┘   │
│                                                       │
│  Or                                                   │
│                                                       │
│  ┌─────────────────────────────────────────────┐   │
│  │  🔗 Connect GitLab                          │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

**Click:** "Connect GitHub"

**Authorize Render** to access your repositories

---

### Step 4: Select Repository

**Screen: "Select a repository"**

```
┌─────────────────────────────────────────────────────┐
│  Select a repository                                 │
│                                                       │
│  Search: [insight-manager-v3____________]  🔍       │
│                                                       │
│  ┌─────────────────────────────────────────────┐   │
│  │  📁 YOUR_USERNAME/insight-manager-v3        │   │
│  │     Updated 2 minutes ago                   │   │
│  │     [Connect] ◄── CLICK THIS                │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

---

### Step 5: Blueprint Detected

**Screen: "Blueprint detected"**

```
┌─────────────────────────────────────────────────────┐
│  Blueprint detected: render.yaml                     │
│                                                       │
│  This repository contains a render.yaml file.        │
│  We'll create the following resources:               │
│                                                       │
│  ✅ Web Service: insight-manager-v3                 │
│     • Runtime: Docker                                │
│     • Region: Oregon                                 │
│     • Plan: Starter                                  │
│                                                       │
│  ✅ PostgreSQL: insight-manager-db                  │
│     • Database: insight_manager                      │
│     • Region: Oregon                                 │
│     • Plan: Starter                                  │
│                                                       │
│  Environment Variables:                              │
│  • DATABASE_URL (from database)                      │
│  • JWT_SECRET (auto-generated)                       │
│  • PORT (3000)                                       │
│                                                       │
│  ┌─────────────────────────────────────────────┐   │
│  │  Apply  ◄── CLICK THIS                      │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

**Click:** "Apply"

---

### Step 6: Deployment in Progress

**Screen: "Creating resources"**

```
┌─────────────────────────────────────────────────────┐
│  Creating resources...                               │
│                                                       │
│  ✅ PostgreSQL: insight-manager-db                  │
│     Status: Live                                     │
│     Connection: postgresql://user:pass@host/db       │
│                                                       │
│  🔄 Web Service: insight-manager-v3                 │
│     Status: Building...                              │
│     Progress: [████████░░░░░░░░░░░░] 40%           │
│                                                       │
│  Build Logs:                                         │
│  ├─ Cloning repository...                           │
│  ├─ Building Docker image...                        │
│  ├─ Installing dependencies...                      │
│  ├─ Running postinstall script...                   │
│  └─ Building frontend...                            │
└─────────────────────────────────────────────────────┘
```

**Wait:** 5-10 minutes for build to complete

---

### Step 7: Deployment Complete

**Screen: "Resources created"**

```
┌─────────────────────────────────────────────────────┐
│  ✅ All resources created successfully!             │
│                                                       │
│  Web Service: insight-manager-v3                     │
│  URL: https://insight-manager-v3.onrender.com       │
│  Status: Live ✅                                     │
│                                                       │
│  PostgreSQL: insight-manager-db                      │
│  Status: Available ✅                                │
│                                                       │
│  ⚠️  Next Step: Initialize database                 │
│     Run migrations in the Shell tab                  │
└─────────────────────────────────────────────────────┘
```

---

### Step 8: Initialize Database

**Navigate to:** Web Service Dashboard → Shell tab

```
┌─────────────────────────────────────────────────────┐
│  insight-manager-v3 > Shell                          │
│                                                       │
│  $ ▊                                                 │
│                                                       │
│  Type commands below:                                │
└─────────────────────────────────────────────────────┘
```

**Run Command 1:**
```bash
$ bun run db:push
```

**Expected Output:**
```
Applying schema changes...
✅ Schema applied successfully
```

**Run Command 2:**
```bash
$ bun run db:seed
```

**Expected Output:**
```
Seeding database...
✅ Created 3 users (admin, manager, viewer)
✅ Created 50 master options
✅ Database seeded successfully
```

---

### Step 9: Access Application

**Open Browser:**
```
https://insight-manager-v3.onrender.com
```

**Login Screen:**
```
┌─────────────────────────────────────────────────────┐
│                                                       │
│           インサイト管理ツール v3                    │
│                                                       │
│  ┌─────────────────────────────────────────────┐   │
│  │  Username: [admin___________________]       │   │
│  │  Password: [••••••••________________]       │   │
│  │                                              │   │
│  │  ┌──────────────┐                           │   │
│  │  │   ログイン    │                           │   │
│  │  └──────────────┘                           │   │
│  └─────────────────────────────────────────────┘   │
│                                                       │
└─────────────────────────────────────────────────────┘
```

**Enter:**
- Username: `admin`
- Password: `admin123`

**Click:** "ログイン" (Login)

---

### Step 10: Success! 🎉

**Dashboard:**
```
┌─────────────────────────────────────────────────────┐
│  インサイト管理ツール v3          admin ▼  ログアウト │
│─────────────────────────────────────────────────────│
│                                                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│  │新規登録  │  │CSV DL    │  │CSV UP    │         │
│  └──────────┘  └──────────┘  └──────────┘         │
│                                                       │
│  検索パネル                                          │
│  ┌─────────────────────────────────────────────┐   │
│  │ 作成番号: [_____]  件名: [_________]        │   │
│  │ ステータス: [全て▼]  タイプ: [全て▼]       │   │
│  │ [検索] [クリア]                              │   │
│  └─────────────────────────────────────────────┘   │
│                                                       │
│  インサイト一覧                                      │
│  ┌─────────────────────────────────────────────┐   │
│  │ No. │ 件名 │ ステータス │ タイプ │ 操作    │   │
│  ├─────┼──────┼────────────┼────────┼─────────┤   │
│  │ 001 │ ... │ 配信中     │ 通知   │ 編集 削除│   │
│  └─────────────────────────────────────────────┘   │
│                                                       │
└─────────────────────────────────────────────────────┘
```

**✅ Deployment Complete!**

---

## 🔍 Verification Checklist

After deployment, verify these features:

```
┌─────────────────────────────────────────────────────┐
│  Feature Verification                                │
├─────────────────────────────────────────────────────┤
│  ✅ Login works (admin/admin123)                    │
│  ✅ Dashboard loads                                  │
│  ✅ Can create new insight                           │
│  ✅ Can edit insight                                 │
│  ✅ Can delete insight                               │
│  ✅ Can upload images                                │
│  ✅ Can export CSV                                   │
│  ✅ Can import CSV                                   │
│  ✅ Search works                                     │
│  ✅ Filter works                                     │
│  ✅ Master data management (Admin)                   │
│  ✅ Role permissions work                            │
│  ✅ HTTPS enabled                                    │
└─────────────────────────────────────────────────────┘
```

---

## 🎯 Quick Commands Reference

### Git Commands
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <repo-url>
git push -u origin main
```

### Database Commands (in Render Shell)
```bash
bun run db:push      # Apply schema
bun run db:seed      # Seed data
```

### Local Development
```bash
bun install          # Install dependencies
bun run dev          # Start dev server
```

---

## 🆘 Troubleshooting

### Issue: Build Failed

**Check:**
```
Render Dashboard → insight-manager-v3 → Logs
```

**Common Causes:**
- Missing dependencies in package.json
- Dockerfile syntax error
- Build command incorrect

**Solution:**
```bash
# Fix the issue locally first
bun install
bun run build

# Then push to GitHub
git add .
git commit -m "Fix build"
git push
```

---

### Issue: Database Connection Error

**Check:**
```
Render Dashboard → insight-manager-v3 → Environment
```

**Verify:**
- DATABASE_URL is set
- Points to insight-manager-db
- Using Internal Database URL

**Solution:**
```
1. Go to PostgreSQL dashboard
2. Copy "Internal Database URL"
3. Update DATABASE_URL in web service
4. Restart web service
```

---

### Issue: Application Not Loading

**Check:**
```
Render Dashboard → insight-manager-v3 → Logs
```

**Look for:**
- "Server running at..." message
- Any error messages
- Port binding issues

**Solution:**
```bash
# In Render Shell
bun run db:push
bun run db:seed

# Then restart service
```

---

## 📞 Need Help?

### Documentation
- 📖 `QUICKSTART_RENDER.md` - Quick start guide
- 📖 `RENDER_DEPLOYMENT.md` - Detailed deployment
- 📖 `QUICK_REFERENCE.md` - Commands reference

### Support
- 🌐 Render Docs: https://render.com/docs
- 💬 Render Community: https://community.render.com
- 🐛 GitHub Issues: Create an issue

---

## 🎉 Congratulations!

You've successfully deployed Insight Manager v3 to Render!

**Next Steps:**
1. ✅ Change default passwords
2. ✅ Test all features
3. ✅ Configure monitoring
4. ✅ Set up backups
5. ✅ Add custom domain (optional)

**Happy managing!** 🚀

---

**Version**: 3.0.0  
**Platform**: Render Web App + PostgreSQL  
**Status**: Production Ready ✅
