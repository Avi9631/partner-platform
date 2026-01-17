# Partner Platform Monorepo - Complete Setup Guide

## 📋 What Has Been Created

A complete monorepo structure has been set up with the following:

### ✅ Directory Structure
```
partner-platform/
├── .github/
│   └── workflows/
│       └── ci.yml                    # GitHub Actions CI/CD
├── packages/
│   ├── backend/
│   │   └── package.json             # @partner-platform/backend
│   ├── dashboard/
│   │   └── package.json             # @partner-platform/dashboard
│   └── shared-validation/
│       └── package.json             # @partner-platform/shared-validation
├── .env.example                     # Environment variables template
├── .eslintrc.json                   # ESLint configuration
├── .gitignore                       # Git ignore patterns
├── .prettierrc                      # Prettier configuration
├── .prettierignore                  # Prettier ignore patterns
├── ARCHITECTURE.md                  # Architecture documentation
├── MIGRATION.md                     # Migration guide
├── QUICKSTART.md                    # Quick start guide
├── README.md                        # Main documentation
├── migrate.ps1                      # PowerShell migration script
├── migrate.sh                       # Bash migration script
├── package.json                     # Root workspace configuration
└── partner-platform.code-workspace  # VS Code workspace file
```

### ✅ Configured Features

1. **npm Workspaces** - All three packages linked together
2. **Unified Scripts** - Run all or individual packages from root
3. **Shared Tooling** - ESLint, Prettier configured at root
4. **CI/CD Pipeline** - GitHub Actions workflow
5. **VS Code Workspace** - Multi-root workspace configuration
6. **Migration Scripts** - Automated migration from separate repos
7. **Comprehensive Documentation** - README, Architecture, Migration guides

## 🚀 Next Steps - How to Use This Monorepo

### Option 1: Fresh Start (Empty Packages)

If you want to start fresh without migrating existing code:

```powershell
cd partner-platform
npm install
# Start building your application
```

### Option 2: Migrate Existing Code (Recommended)

If you have existing code in separate directories:

**Step 1: Run Migration Script**
```powershell
# From the directory containing partner-platform-backend, partner-platform-dashboard, and shared-validation
.\partner-platform\migrate.ps1
```

**Step 2: Verify Migration**
```powershell
cd partner-platform
npm run dev
```

**Step 3: Test Everything**
- Backend should start on port 3000
- Dashboard should start on port 5174
- Check console for errors

### Option 3: Manual Migration

If you prefer manual control:

```powershell
# 1. Copy files
Copy-Item -Path "partner-platform-backend\*" -Destination "partner-platform\packages\backend\" -Recurse -Force
Copy-Item -Path "partner-platform-dashboard\*" -Destination "partner-platform\packages\dashboard\" -Recurse -Force
Copy-Item -Path "shared-validation\*" -Destination "partner-platform\packages\shared-validation\" -Recurse -Force

# 2. Clean up
Remove-Item -Path "partner-platform\packages\backend\node_modules" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "partner-platform\packages\dashboard\node_modules" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "partner-platform\packages\shared-validation\node_modules" -Recurse -Force -ErrorAction SilentlyContinue

# 3. Install dependencies
cd partner-platform
npm install

# 4. Setup environment
Copy-Item -Path "..\partner-platform-backend\.env" -Destination "packages\backend\.env" -ErrorAction SilentlyContinue

# 5. Start development
npm run dev
```

## 📦 Package Configuration Summary

### Backend (@partner-platform/backend)
- **Type:** CommonJS
- **Main:** server.js
- **Dependencies:** Express, Sequelize, Passport, etc.
- **Dev Command:** `npm run dev` (uses nodemon)
- **Start Command:** `npm run start` (uses pm2)

### Dashboard (@partner-platform/dashboard)
- **Type:** ES Module
- **Main:** React + Vite
- **Dependencies:** React, Radix UI, Tailwind, etc.
- **Dev Command:** `npm run dev` (Vite dev server)
- **Build Command:** `npm run build` (Vite build)

### Shared Validation (@partner-platform/shared-validation)
- **Type:** CommonJS
- **Main:** index.js
- **Dependencies:** Zod
- **Usage:** Imported by both backend and dashboard

## 🎯 Key Commands Reference

### From Root Directory

```bash
# Install all dependencies
npm install

# Development
npm run dev                    # All services
npm run dev:backend           # Backend only
npm run dev:dashboard         # Dashboard only
npm run worker:dev            # Temporal worker

# Production
npm run build                 # Build all
npm run start:backend         # Start backend
npm run start:dashboard       # Start dashboard

# Maintenance
npm run lint                  # Lint all packages
npm run lint:fix              # Fix linting issues
npm run test                  # Run all tests
npm run clean:modules         # Clean node_modules
```

### From Individual Packages

```bash
# Backend
cd packages/backend
npm run dev                   # Start with nodemon
npm run start                 # Start with pm2
npm run worker:dev            # Start Temporal worker

# Dashboard
cd packages/dashboard
npm run dev                   # Start Vite dev server
npm run build                 # Build for production
npm run preview               # Preview production build

# Shared Validation
cd packages/shared-validation
npm run test                  # Run tests
npm run lint                  # Lint code
```

## 🔧 Configuration Files Explained

### Root package.json
- Defines workspaces: `packages/*`
- Contains scripts for all packages
- Manages shared devDependencies (ESLint, Prettier)

### Individual package.json Files
- Each package has its own dependencies
- References shared-validation using workspace protocol: `"@partner-platform/shared-validation": "*"`
- Scripts specific to that package

### .eslintrc.json
- Root-level ESLint configuration
- Applied to all packages
- Can be overridden per package if needed

### .prettierrc
- Code formatting rules
- Consistent across all packages
- Integrated with VS Code

### partner-platform.code-workspace
- VS Code multi-root workspace
- Separate folders for each package
- Shared settings and recommended extensions

## 🔐 Environment Setup

### Backend (.env)
Create `packages/backend/.env`:
```env
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=partner_platform
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_secret_key
# ... (see .env.example for full list)
```

### Dashboard (.env)
Create `packages/dashboard/.env` (optional):
```env
VITE_API_URL=http://localhost:3000
VITE_GOOGLE_MAPS_API_KEY=your_key
```

## 🎨 VS Code Setup

1. **Open Workspace:**
   ```
   File > Open Workspace from File > partner-platform.code-workspace
   ```

2. **Install Recommended Extensions:**
   - ESLint
   - Prettier
   - Tailwind CSS IntelliSense
   - Path Intellisense

3. **Benefits:**
   - Unified search across all packages
   - Separate Git views per package
   - Shared settings and formatting

## 🚨 Troubleshooting

### Problem: Module '@partner-platform/shared-validation' not found

**Solution:**
```bash
cd partner-platform
npm install
```

### Problem: Port already in use

**Solution:**
```bash
# Kill processes on ports 3000 and 5174
npx kill-port 3000 5174
```

### Problem: Backend can't connect to database

**Solution:**
1. Check PostgreSQL is running
2. Verify .env file in `packages/backend/`
3. Ensure database exists: `createdb partner_platform`

### Problem: Dashboard can't reach API

**Solution:**
1. Ensure backend is running on port 3000
2. Check CORS settings in backend
3. Verify `VITE_API_URL` in dashboard .env

### Problem: Changes in shared-validation not reflected

**Solution:**
```bash
# Restart dev servers
npm run dev
```

## 📊 Project Statistics

- **Total Packages:** 3
- **Total Dependencies:** ~100+ npm packages
- **Backend API Endpoints:** 50+ routes
- **Dashboard Components:** 100+ React components
- **Validation Schemas:** 15+ Zod schemas

## 🎓 Learning Resources

- **npm Workspaces:** https://docs.npmjs.com/cli/v7/using-npm/workspaces
- **Monorepo Best Practices:** https://monorepo.tools/
- **Zod Documentation:** https://zod.dev/
- **Express.js Guide:** https://expressjs.com/
- **React + Vite:** https://vitejs.dev/guide/

## ✅ Migration Checklist

Use this checklist when migrating:

- [ ] Monorepo structure created
- [ ] All three package directories exist
- [ ] Root package.json configured
- [ ] Individual package.json files updated
- [ ] Configuration files created (.eslintrc, .prettierrc, etc.)
- [ ] Migration scripts created (migrate.ps1, migrate.sh)
- [ ] Documentation created (README, ARCHITECTURE, etc.)
- [ ] Code copied from existing projects
- [ ] node_modules cleaned
- [ ] `npm install` completed successfully
- [ ] Environment variables configured
- [ ] Backend starts without errors
- [ ] Dashboard starts without errors
- [ ] Shared-validation properly linked
- [ ] VS Code workspace configured
- [ ] Git repository initialized (if needed)

## 📞 Support

For issues or questions:
1. Check documentation in README.md
2. Review ARCHITECTURE.md for system design
3. See TROUBLESHOOTING section above
4. Check package-specific README files

## 🎉 You're Ready!

Your monorepo is now set up and ready to use. Choose your migration path above and get started!

**Recommended Next Steps:**
1. Run migration script or copy code manually
2. Install all dependencies: `npm install`
3. Setup environment variables
4. Start development: `npm run dev`
5. Open in VS Code: `partner-platform.code-workspace`

Happy coding! 🚀
