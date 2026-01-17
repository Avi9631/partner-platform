# Quick Start Guide

## For First-Time Setup

### Option 1: Fresh Monorepo (Recommended for new projects)

```bash
cd partner-platform
npm install
npm run dev
```

### Option 2: Migrate Existing Code

If you have existing code in separate directories:

**Using PowerShell (Windows):**
```powershell
# Run from parent directory containing all three project folders
.\partner-platform\migrate.ps1
```

**Using Bash (Linux/Mac):**
```bash
# Run from parent directory containing all three project folders
chmod +x partner-platform/migrate.sh
./partner-platform/migrate.sh
```

**Manual Migration:**
```powershell
# Copy files
Copy-Item -Path "partner-platform-backend\*" -Destination "partner-platform\packages\backend\" -Recurse -Force
Copy-Item -Path "partner-platform-dashboard\*" -Destination "partner-platform\packages\dashboard\" -Recurse -Force
Copy-Item -Path "shared-validation\*" -Destination "partner-platform\packages\shared-validation\" -Recurse -Force

# Clean and install
cd partner-platform
Remove-Item -Path "packages\*\node_modules" -Recurse -Force -ErrorAction SilentlyContinue
npm install
```

## Common Commands

```bash
# Development
npm run dev                    # Run all services
npm run dev:backend           # Run backend only
npm run dev:dashboard         # Run dashboard only

# Production
npm run build                 # Build all packages
npm run start:backend         # Start backend
npm run start:dashboard       # Start dashboard (serve dist folder)

# Maintenance
npm run lint                  # Lint all packages
npm run test                  # Run tests
npm run clean:modules         # Remove all node_modules
```

## Environment Setup

1. **Backend**: Copy `.env` to `packages/backend/.env`
2. **Dashboard**: Copy `.env` to `packages/dashboard/.env` (if needed)

## Verification

After setup, verify everything works:

1. Backend should start on port 3000 (or configured port)
2. Dashboard should start on port 5174
3. Check console for any errors
4. Test a few API endpoints
5. Verify shared-validation is working (no import errors)

## Troubleshooting

**Issue: Module not found**
```bash
npm install
```

**Issue: Port already in use**
- Check .env files and change ports
- Kill existing processes: `npx kill-port 3000 5174`

**Issue: Permission denied (migrate.sh)**
```bash
chmod +x migrate.sh
```

**Issue: Backend can't find shared-validation**
- Ensure you ran `npm install` from root
- Check that package.json has correct workspace reference

## VS Code Setup

Open the workspace file for best experience:
```
File > Open Workspace from File > partner-platform.code-workspace
```

This gives you:
- Separate folders for each package
- Unified search across all packages
- Shared settings and extensions
