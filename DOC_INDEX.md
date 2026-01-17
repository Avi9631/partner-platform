# Partner Platform Monorepo - Documentation Index

Welcome to the Partner Platform monorepo documentation! This index helps you find the right documentation for your needs.

## 📚 Documentation Files

### 🚀 Getting Started
- **[README.md](./README.md)** - Start here! Main documentation with overview and basic commands
- **[QUICKSTART.md](./QUICKSTART.md)** - Fast-track guide to get up and running in minutes
- **[MONOREPO_SETUP.md](./MONOREPO_SETUP.md)** - Complete setup guide with all options and troubleshooting

### 🏗️ Architecture & Design
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture, data flow, and technology stack
- **[Package Structure](#)** - Detailed breakdown of each package (in ARCHITECTURE.md)
- **[Database Schema](#)** - Database design and relationships (in ARCHITECTURE.md)

### 🔄 Migration
- **[MIGRATION.md](./MIGRATION.md)** - Step-by-step guide to migrate from separate repos
- **[migrate.ps1](./migrate.ps1)** - PowerShell migration script for Windows
- **[migrate.sh](./migrate.sh)** - Bash migration script for Linux/Mac

### ⚙️ Configuration
- **[.env.example](./.env.example)** - Environment variables template with all options
- **[package.json](./package.json)** - Root workspace configuration
- **[partner-platform.code-workspace](./partner-platform.code-workspace)** - VS Code workspace settings

### 🔧 Development Guides
- **[Development Workflow](#)** - Daily development practices (in ARCHITECTURE.md)
- **[Adding New Features](#)** - How to add features across packages (in ARCHITECTURE.md)
- **[Testing Strategy](#)** - Unit, integration, and E2E testing (in ARCHITECTURE.md)

## 🎯 Quick Navigation

### I want to...

#### ...get started quickly
→ [QUICKSTART.md](./QUICKSTART.md)

#### ...understand the system architecture
→ [ARCHITECTURE.md](./ARCHITECTURE.md)

#### ...migrate my existing code
→ [MIGRATION.md](./MIGRATION.md)

#### ...configure environment variables
→ [.env.example](./.env.example)

#### ...run the development server
→ [README.md](./README.md#-available-scripts)

#### ...understand the monorepo benefits
→ [ARCHITECTURE.md](./ARCHITECTURE.md#-monorepo-benefits)

#### ...troubleshoot issues
→ [MONOREPO_SETUP.md](./MONOREPO_SETUP.md#-troubleshooting)

#### ...set up VS Code
→ [MONOREPO_SETUP.md](./MONOREPO_SETUP.md#-vs-code-setup)

#### ...understand package structure
→ [ARCHITECTURE.md](./ARCHITECTURE.md#-package-structure)

#### ...deploy to production
→ [ARCHITECTURE.md](./ARCHITECTURE.md#-deployment-architecture)

## 📦 Package-Specific Documentation

### Backend (@partner-platform/backend)
- Location: `packages/backend/`
- Type: Express.js REST API
- Documentation: [README.md](./packages/backend/README.md) *(if exists)*
- Scripts: See [README.md](./README.md#-package-details)

### Dashboard (@partner-platform/dashboard)
- Location: `packages/dashboard/`
- Type: React + Vite SPA
- Documentation: [README.md](./packages/dashboard/README.md) *(if exists)*
- Scripts: See [README.md](./README.md#-package-details)

### Shared Validation (@partner-platform/shared-validation)
- Location: `packages/shared-validation/`
- Type: Zod validation schemas
- Documentation: [README.md](./packages/shared-validation/README.md) *(if exists)*
- Usage: See [ARCHITECTURE.md](./ARCHITECTURE.md#3-partner-platformshared-validation)

## 🔑 Essential Commands

```bash
# Installation
npm install                   # Install all dependencies

# Development
npm run dev                   # Run all services
npm run dev:backend          # Run backend only
npm run dev:dashboard        # Run dashboard only

# Building
npm run build                # Build all packages

# Testing & Quality
npm run lint                 # Lint all packages
npm run test                 # Run all tests
```

## 🎓 Learning Path

### For New Developers

1. **Start Here:** [README.md](./README.md)
2. **Setup:** [QUICKSTART.md](./QUICKSTART.md)
3. **Architecture:** [ARCHITECTURE.md](./ARCHITECTURE.md)
4. **Development:** Work through tutorials in ARCHITECTURE.md

### For Team Leads

1. **Overview:** [README.md](./README.md)
2. **Architecture:** [ARCHITECTURE.md](./ARCHITECTURE.md)
3. **Setup Guide:** [MONOREPO_SETUP.md](./MONOREPO_SETUP.md)
4. **Migration:** [MIGRATION.md](./MIGRATION.md)

### For DevOps

1. **Architecture:** [ARCHITECTURE.md](./ARCHITECTURE.md#-deployment-architecture)
2. **Environment:** [.env.example](./.env.example)
3. **CI/CD:** [.github/workflows/ci.yml](./.github/workflows/ci.yml)
4. **Scripts:** Root package.json

## 📋 File Structure Overview

```
partner-platform/
├── 📘 README.md                      # Main documentation (start here)
├── 📘 QUICKSTART.md                  # Quick setup guide
├── 📘 ARCHITECTURE.md                # System architecture
├── 📘 MIGRATION.md                   # Migration guide
├── 📘 MONOREPO_SETUP.md             # Complete setup reference
├── 📘 DOC_INDEX.md                   # This file
├── 🔧 package.json                   # Root configuration
├── ⚙️ .env.example                   # Environment template
├── 🎨 .prettierrc                    # Code formatting
├── 🔍 .eslintrc.json                 # Linting rules
├── 📝 .gitignore                     # Git ignore patterns
├── 🚀 migrate.ps1                    # Windows migration script
├── 🚀 migrate.sh                     # Linux/Mac migration script
├── 💼 partner-platform.code-workspace # VS Code workspace
├── .github/
│   └── workflows/
│       └── ci.yml                    # CI/CD pipeline
└── packages/
    ├── backend/                      # Express.js API
    ├── dashboard/                    # React + Vite frontend
    └── shared-validation/            # Zod schemas
```

## 🔍 Search Tips

### Finding Information

**Commands and Scripts:**
- Main scripts: [README.md](./README.md#-available-scripts)
- Package-specific scripts: [MONOREPO_SETUP.md](./MONOREPO_SETUP.md#-key-commands-reference)

**Configuration:**
- Environment variables: [.env.example](./.env.example)
- ESLint/Prettier: Configuration files in root
- Workspace: [partner-platform.code-workspace](./partner-platform.code-workspace)

**Architecture:**
- System design: [ARCHITECTURE.md](./ARCHITECTURE.md)
- Data flow: [ARCHITECTURE.md](./ARCHITECTURE.md#-data-flow)
- Tech stack: [ARCHITECTURE.md](./ARCHITECTURE.md#-technology-stack-summary)

**Migration:**
- Step-by-step: [MIGRATION.md](./MIGRATION.md)
- Automated scripts: migrate.ps1 / migrate.sh
- Troubleshooting: [MONOREPO_SETUP.md](./MONOREPO_SETUP.md#-troubleshooting)

## 🆘 Getting Help

### Common Issues
Most common issues are covered in:
- [MIGRATION.md](./MIGRATION.md#common-issues)
- [MONOREPO_SETUP.md](./MONOREPO_SETUP.md#-troubleshooting)

### Documentation Updates
If you find issues or want to improve documentation:
1. Create an issue in the repository
2. Submit a pull request with updates
3. Contact the team lead

## 📊 Documentation Statistics

- Total documentation files: 8
- Total lines of documentation: 2000+
- Code examples: 50+
- Diagrams: Multiple in ARCHITECTURE.md
- Scripts: 2 migration scripts + CI/CD

## ✅ Documentation Checklist

- [x] Getting started guide
- [x] Architecture documentation
- [x] Migration guide
- [x] Environment configuration
- [x] VS Code workspace setup
- [x] CI/CD pipeline
- [x] Troubleshooting guide
- [x] Command reference
- [x] Package structure docs
- [x] This index file

## 🎉 Ready to Start?

Choose your path:
- **New to the project?** → [README.md](./README.md)
- **Need quick setup?** → [QUICKSTART.md](./QUICKSTART.md)
- **Migrating code?** → [MIGRATION.md](./MIGRATION.md)
- **Understanding architecture?** → [ARCHITECTURE.md](./ARCHITECTURE.md)

---

*Last updated: January 2026*
