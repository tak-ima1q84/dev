
### Phase 1: Environment Setup
- [ ] Setup Docker environment (Web Server, App Server, DB)
- [ ] Create and configure AWS Lightsail instance
- [ ] Create project repository (Git)

### Phase 2: Database Design & Implementation
- [ ] Create `data_tables` table (Migration)
- [ ] Create `data_columns` table (Migration)
- [ ] Create user management and permission tables

### Phase 3: Backend Development
- [ ] Implement API: Get Data Table list & Search (Partial match logic)
- [ ] Implement API: Get Data Table details (including Column list)
- [ ] Implement API: Create/Update/Delete Data Tables & Columns (Editor role check)
- [ ] Implement API: CSV Download function
- [ ] Implement Validation (Limit 500 columns per table)

### Phase 4: Frontend Development
- [ ] Implement Login screen & Permission management
- [ ] Implement List screen (Search form, List view)
- [ ] Implement Detail/Edit screen (Table info, Column info grid input)
- [ ] Implement CSV Download button

### Phase 5: Testing & Deployment
- [ ] Unit Testing (Search logic, Permissions)
- [ ] Integration Testing (CRUD operations from UI)
- [ ] Build Docker containers
- [ ] Deploy to AWS Lightsail and verify operation