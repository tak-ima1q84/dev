# Design Specifications

## 1. Architecture

- **Runtime**: Bun v1.x
- **Backend**: ElysiaJS
- **Frontend**: React + Vite
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Container**: Docker
- **Authentication**: JWT

## 2. Database Schema

### 2.1. Users Table (users)
- `id`: PK, Auto Increment
- `username`: Varchar(100), Unique, Not Null
- `password_hash`: Varchar(255), Not Null
- `role`: Varchar(20), Not Null (Admin/Manager/Viewer)
- `created_at`: Timestamp, Default Now

### 2.2. Master Options Table (master_options)
- `id`: PK, Auto Increment
- `category_key`: Varchar(50), Not Null
- `option_value`: Varchar(100), Not Null
- `option_label`: Varchar(200), Not Null
- `sort_order`: Integer, Default 0

### 2.3. Insights Table (insights)
All 34 fields (a1-f2):

| Field | Type | Description |
|-------|------|-------------|
| id | Serial PK | System ID |
| creation_number | Integer | a1. 1-19999 |
| subject | Varchar(500) | b1. Subject |
| insight_id | Varchar(100) Unique | c1. Insight ID |
| status | Varchar(100) | d1. Status |
| start_date | Date | e1. Start Date |
| update_date | Date | f1. Update Date |
| end_date | Date | g1. End Date |
| type | Varchar(100) | h1. Type |
| main_category | Varchar(100) | i1. Main Category |
| sub_category | Varchar(100) | j1. Sub Category |
| data_category | Varchar(100) | k1. Data Category |
| target_banks | JSON (Array) | l1. Target Banks |
| logic_formula | Text | m1-1. Display Logic |
| target_tables | JSON (Array) | m1-2. Target Tables |
| target_users | Text | n1. Target Users |
| related_insight | Varchar(200) | o1. Related Insight |
| revenue_category | Varchar(100) | p1. Revenue Category |
| icon_type | Varchar(100) | q1. Icon Type |
| score | Decimal(5,2) | r1. Score |
| relevance_policy | Varchar(100) | s1. Relevance Policy |
| relevance_score | Varchar(100) | t1. Relevance Score |
| display_count | Integer | u1. Display Count |
| select_count | Integer | v1. Selection Count |
| next_policy | Varchar(100) | w1. Next Policy |
| next_value | Varchar(200) | x1. Next Value |
| app_link | Varchar(500) | y1. App Link |
| external_link | Varchar(500) | z1. External Link |
| teaser_image | Varchar(500) | a2. Teaser Image |
| story_images | JSON (Array) | b2. Story Images (Max 3) |
| maintenance_date | Date | c2. Maintenance Date |
| maintenance_reason | Varchar(50) | d2. Maintenance Reason |
| remarks | Varchar(200) | e2. Remarks |
| updated_by | Varchar(100) | f2. Updated By |
| created_at | Timestamp | System field |
| updated_at | Timestamp | System field |

## 3. Initial Master Data

### Categories and Options:

1. **status** (d1): 8 options from "01_Waiting for Test" to "08_Deleted"
2. **insight_type** (h1): base, custom, obb, Other
3. **main_category** (i1): base, obb, tips, notification, marketing, event, quiz, game, Other
4. **data_category** (k1): Financial Only, Non-Financial Only, Financial/Non-Financial Data, No Data
5. **target_banks** (l1): 13 options including None, Fukuoka, Juhachi-Shinwa, etc.
6. **target_tables** (m1-2): 10 options including Customers, Accounts, Transactions, etc.
7. **revenue_category** (p1): 9 options including saving_accounts, cardloan_application, etc.
8. **icon_type** (q1): 10 options including alert, info, quiz, benefit, etc.
9. **relevance_policy** (s1): 6 options including Always_relevant, Calender_period, etc.
10. **next_policy** (w1): 6 options including Calender_period, Never, No_limitation, etc.

## 4. API Design

### Authentication
- `POST /api/auth/login` - Login with username/password, returns JWT token

### Insights
- `GET /api/insights` - Search/List with query parameters
- `GET /api/insights/:id` - Get single insight details
- `POST /api/insights` - Create new insight (Admin/Manager)
- `PUT /api/insights/:id` - Update insight (Admin/Manager)
- `DELETE /api/insights/:id` - Delete insight (Admin/Manager)
- `POST /api/insights/upload` - Upload image file (PNG/JPEG)
- `GET /api/insights/export/csv` - Export CSV (Admin/Manager)

### Master Data
- `GET /api/masters` - Get all master options
- `POST /api/masters` - Create new master option (Admin)
- `PUT /api/masters/:id` - Update master option (Admin)
- `DELETE /api/masters/:id` - Delete master option (Admin)

### Static Files
- `GET /uploads/*` - Serve uploaded images
- `GET /assets/*` - Serve frontend assets

## 5. Security

- **Authentication**: JWT-based with Bearer token
- **Password Storage**: Hashed using Bun.password (Argon2)
- **Authorization**: Role-based access control (RBAC)
  - Admin: Full access
  - Manager: CRUD on insights, CSV export
  - Viewer: Read-only access
- **File Upload**: Restricted to PNG/JPEG, URL-safe filenames

## 6. UI Components

### 6.1. Login Screen
- Username and password inputs
- Login button
- Error handling

### 6.2. Insight List Screen
- **Search Panel**: 
  - Text inputs: Creation Number, Subject, Insight ID, Display Logic
  - Dropdowns: Status, Type, Main Category, Data Category
  - Checkboxes: Target Banks (l1), Target Tables (m1-2)
  - Search button (検索) and Clear button (クリア)
- **Toolbar**: Refresh, CSV Download, New Registration buttons
- **Data Grid**: Displays insights with Image and Edit buttons per row
- **Pagination**: (Future enhancement)

### 6.3. Insight Detail/Edit Screen
- Read-only view with all 34 fields
- Edit button (Admin/Manager)
- Delete button (Admin/Manager)
- Image preview button

### 6.4. Insight Form (New/Edit)
- All 34 input fields
- Dropdowns linked to master data
- Checkbox groups for multi-select fields
- Image upload with preview for:
  - Teaser image (a2): URL input + file upload
  - Story images (b2): 3 slots with URL input + file upload
- Save/Cancel buttons

### 6.5. Image Preview Modal
- Displays teaser image
- Displays up to 3 story images
- Close button

### 6.6. Master Management Screen (Admin Only)
- List of all master options
- Create new master option form
- Edit inline functionality
- Delete functionality
- Duplicate prevention

## 7. File Structure

```
insight-manager-v2/
├── src/
│   ├── db/
│   │   ├── schema.ts       # Database schema definitions
│   │   ├── index.ts        # Database connection
│   │   └── seed.ts         # Initial data seeding
│   ├── routes/
│   │   ├── auth.ts         # Authentication endpoints
│   │   ├── insights.ts     # Insight CRUD + upload
│   │   └── masters.ts      # Master data CRUD
│   └── server.ts           # Main server setup
├── public/
│   ├── App.tsx             # React main component
│   ├── main.tsx            # React entry point
│   ├── styles.css          # Global styles
│   └── index.html          # HTML template
├── uploads/                # Uploaded images directory
├── dist/                   # Built frontend files
├── Dockerfile              # Container definition
├── docker-compose.yml      # Multi-container setup
├── drizzle.config.ts       # ORM configuration
├── vite.config.ts          # Frontend build config
└── package.json            # Dependencies and scripts
```

## 8. Deployment

### Development
```bash
bun run dev          # Start backend server
bun run vite         # Start frontend dev server (separate terminal)
```

### Production (Docker)
```bash
docker-compose up -d
docker-compose exec app bun run db:push
docker-compose exec app bun run db:seed
```

### Environment Variables
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- `JWT_SECRET`
- `PORT`

## 9. Future Enhancements

- CSV Import functionality
- Pagination for large datasets
- Advanced filtering options
- Bulk operations
- Audit logging
- User management UI
- Image optimization
- Multi-language support
