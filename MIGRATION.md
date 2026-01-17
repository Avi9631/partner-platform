# Migration Guide: Moving to Monorepo

## Overview
This guide helps you migrate from separate repositories to the monorepo structure.

## Steps to Migrate

### 1. Copy Existing Code

```bash
# From the parent directory containing all three projects

# Copy backend
cp -r partner-platform-backend/* partner-platform/packages/backend/

# Copy dashboard
cp -r partner-platform-dashboard/* partner-platform/packages/dashboard/

# Copy shared-validation
cp -r shared-validation/* partner-platform/packages/shared-validation/
```

**Windows PowerShell:**
```powershell
# Copy backend
Copy-Item -Path "partner-platform-backend\*" -Destination "partner-platform\packages\backend\" -Recurse -Force

# Copy dashboard
Copy-Item -Path "partner-platform-dashboard\*" -Destination "partner-platform\packages\dashboard\" -Recurse -Force

# Copy shared-validation
Copy-Item -Path "shared-validation\*" -Destination "partner-platform\packages\shared-validation\" -Recurse -Force
```

### 2. Clean Up

After copying, you may need to:

1. **Remove duplicate package.json files** - The monorepo already has updated package.json files
2. **Remove duplicate node_modules** - These will be reinstalled
3. **Remove duplicate README files** if desired (or merge content)

```bash
# Clean up node_modules from copied directories
rm -rf partner-platform/packages/backend/node_modules
rm -rf partner-platform/packages/dashboard/node_modules
rm -rf partner-platform/packages/shared-validation/node_modules
```

**Windows PowerShell:**
```powershell
Remove-Item -Path "partner-platform\packages\backend\node_modules" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "partner-platform\packages\dashboard\node_modules" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "partner-platform\packages\shared-validation\node_modules" -Recurse -Force -ErrorAction SilentlyContinue
```

### 3. Update Import Statements

#### Backend (packages/backend/)

Find all occurrences of:
```javascript
require('@feedaq/shared-validation')
```

These should work as-is, but if you see:
```javascript
require('@partner-platform/shared-validation')
```

Update to:
```javascript
require('@partner-platform/shared-validation')
```

#### Dashboard (packages/dashboard/)

No changes needed - imports will continue to work through the workspace.

### 4. Install Dependencies

```bash
cd partner-platform
npm install
```

This will:
- Install all root dependencies
- Install dependencies for each package
- Link workspace packages together

### 5. Verify Installation

```bash
# Check that all packages are linked correctly
npm ls @partner-platform/shared-validation

# Test backend
npm run dev:backend

# Test dashboard (in a new terminal)
npm run dev:dashboard
```

### 6. Update Environment Variables

Copy your existing `.env` files:

```bash
# Backend
cp ../partner-platform-backend/.env packages/backend/.env

# Dashboard (if exists)
cp ../partner-platform-dashboard/.env packages/dashboard/.env
```

**Windows PowerShell:**
```powershell
Copy-Item -Path "..\partner-platform-backend\.env" -Destination "packages\backend\.env" -ErrorAction SilentlyContinue
Copy-Item -Path "..\partner-platform-dashboard\.env" -Destination "packages\dashboard\.env" -ErrorAction SilentlyContinue
```

### 7. Update Git Repository

If you want to keep git history:

```bash
cd partner-platform
git init
git add .
git commit -m "Initial monorepo setup"
```

Or if migrating from existing repos, you can use git subtree or git filter-branch to preserve history.

## Common Issues

### Issue: Module not found '@partner-platform/shared-validation'

**Solution:** Run `npm install` from the root directory

### Issue: Backend can't find shared-validation

**Solution:** Ensure the import uses the workspace name:
```javascript
const { schemas } = require('@partner-platform/shared-validation');
```

### Issue: Changes in shared-validation not reflected

**Solution:** npm workspaces automatically link packages. Just restart your dev server:
```bash
npm run dev:backend  # or dev:dashboard
```

### Issue: Port conflicts

**Solution:** Check your .env files and ensure different ports:
- Backend: typically 3000 or 5000
- Dashboard: typically 5173 or 5174

## Verification Checklist

- [ ] All three packages copied successfully
- [ ] `npm install` completed without errors
- [ ] Backend starts with `npm run dev:backend`
- [ ] Dashboard starts with `npm run dev:dashboard`
- [ ] Shared validation is recognized in both packages
- [ ] Environment variables configured
- [ ] Git repository initialized (if needed)

## Rollback

If you need to rollback:
1. Keep your original directories (`partner-platform-backend`, `partner-platform-dashboard`, `shared-validation`)
2. Delete the `partner-platform` directory
3. Continue using separate projects

## Next Steps

After successful migration:
1. Update your CI/CD pipelines to work with the monorepo
2. Update documentation references
3. Train team members on monorepo workflows
4. Consider setting up changesets for version management
