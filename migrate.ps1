# Migration script for moving to monorepo structure
# Run this from the parent directory containing all three projects

Write-Host "🚀 Starting Partner Platform Monorepo Migration..." -ForegroundColor Cyan

# Check if required directories exist
if (-not (Test-Path "partner-platform-backend")) {
    Write-Host "❌ Error: partner-platform-backend directory not found" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "partner-platform-dashboard")) {
    Write-Host "❌ Error: partner-platform-dashboard directory not found" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "shared-validation")) {
    Write-Host "❌ Error: shared-validation directory not found" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "partner-platform")) {
    Write-Host "❌ Error: partner-platform monorepo directory not found" -ForegroundColor Red
    Write-Host "Please create the monorepo structure first" -ForegroundColor Yellow
    exit 1
}

# Function to safely copy directory
function Copy-DirectorySafe {
    param($Source, $Destination)
    
    if (Test-Path $Destination) {
        Remove-Item -Path $Destination -Recurse -Force -ErrorAction SilentlyContinue
    }
    
    New-Item -ItemType Directory -Path $Destination -Force | Out-Null
    Copy-Item -Path "$Source\*" -Destination $Destination -Recurse -Force -ErrorAction SilentlyContinue
}

# Copy backend
Write-Host "📁 Copying backend..." -ForegroundColor Yellow
Copy-DirectorySafe -Source "partner-platform-backend" -Destination "partner-platform\packages\backend"

# Copy dashboard
Write-Host "📁 Copying dashboard..." -ForegroundColor Yellow
Copy-DirectorySafe -Source "partner-platform-dashboard" -Destination "partner-platform\packages\dashboard"

# Copy shared-validation
Write-Host "📁 Copying shared-validation..." -ForegroundColor Yellow
Copy-DirectorySafe -Source "shared-validation" -Destination "partner-platform\packages\shared-validation"

# Clean up node_modules
Write-Host "🧹 Cleaning up node_modules..." -ForegroundColor Yellow
Remove-Item -Path "partner-platform\packages\backend\node_modules" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "partner-platform\packages\dashboard\node_modules" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "partner-platform\packages\shared-validation\node_modules" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "partner-platform\node_modules" -Recurse -Force -ErrorAction SilentlyContinue

# Install dependencies
Write-Host "📦 Installing dependencies (this may take a while)..." -ForegroundColor Yellow
Set-Location partner-platform
npm install

Write-Host ""
Write-Host "✅ Migration completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "  1. cd partner-platform"
Write-Host "  2. Verify .env files in packages\backend and packages\dashboard"
Write-Host "  3. Run 'npm run dev' to start all services"
Write-Host "  4. Test that everything works correctly"
Write-Host ""
Write-Host "💡 Tip: Open the partner-platform.code-workspace file in VS Code" -ForegroundColor Yellow
