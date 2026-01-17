#!/bin/bash

# Migration script for moving to monorepo structure
# Run this from the parent directory containing all three projects

echo "🚀 Starting Partner Platform Monorepo Migration..."

# Check if required directories exist
if [ ! -d "partner-platform-backend" ]; then
    echo "❌ Error: partner-platform-backend directory not found"
    exit 1
fi

if [ ! -d "partner-platform-dashboard" ]; then
    echo "❌ Error: partner-platform-dashboard directory not found"
    exit 1
fi

if [ ! -d "shared-validation" ]; then
    echo "❌ Error: shared-validation directory not found"
    exit 1
fi

if [ ! -d "partner-platform" ]; then
    echo "❌ Error: partner-platform monorepo directory not found"
    echo "Please create the monorepo structure first"
    exit 1
fi

# Backup existing monorepo packages (in case they have files)
echo "📦 Backing up existing package directories..."
if [ -d "partner-platform/packages/backend" ]; then
    mv partner-platform/packages/backend partner-platform/packages/backend.bak 2>/dev/null || true
fi
if [ -d "partner-platform/packages/dashboard" ]; then
    mv partner-platform/packages/dashboard partner-platform/packages/dashboard.bak 2>/dev/null || true
fi
if [ -d "partner-platform/packages/shared-validation" ]; then
    mv partner-platform/packages/shared-validation partner-platform/packages/shared-validation.bak 2>/dev/null || true
fi

# Copy backend
echo "📁 Copying backend..."
mkdir -p partner-platform/packages/backend
cp -r partner-platform-backend/* partner-platform/packages/backend/ 2>/dev/null || true
cp partner-platform-backend/.* partner-platform/packages/backend/ 2>/dev/null || true

# Copy dashboard
echo "📁 Copying dashboard..."
mkdir -p partner-platform/packages/dashboard
cp -r partner-platform-dashboard/* partner-platform/packages/dashboard/ 2>/dev/null || true
cp partner-platform-dashboard/.* partner-platform/packages/dashboard/ 2>/dev/null || true

# Copy shared-validation
echo "📁 Copying shared-validation..."
mkdir -p partner-platform/packages/shared-validation
cp -r shared-validation/* partner-platform/packages/shared-validation/ 2>/dev/null || true
cp shared-validation/.* partner-platform/packages/shared-validation/ 2>/dev/null || true

# Update package.json files with monorepo versions
echo "📝 Updating package.json files..."
cp partner-platform.bak/packages/backend/package.json partner-platform/packages/backend/package.json 2>/dev/null || true
cp partner-platform.bak/packages/dashboard/package.json partner-platform/packages/dashboard/package.json 2>/dev/null || true
cp partner-platform.bak/packages/shared-validation/package.json partner-platform/packages/shared-validation/package.json 2>/dev/null || true

# Clean up node_modules
echo "🧹 Cleaning up node_modules..."
rm -rf partner-platform/packages/backend/node_modules
rm -rf partner-platform/packages/dashboard/node_modules
rm -rf partner-platform/packages/shared-validation/node_modules

# Install dependencies
echo "📦 Installing dependencies (this may take a while)..."
cd partner-platform
npm install

echo ""
echo "✅ Migration completed successfully!"
echo ""
echo "📋 Next steps:"
echo "  1. cd partner-platform"
echo "  2. Verify .env files in packages/backend and packages/dashboard"
echo "  3. Run 'npm run dev' to start all services"
echo "  4. Test that everything works correctly"
echo ""
echo "💡 Tip: Open the partner-platform.code-workspace file in VS Code"
