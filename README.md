# Partner Platform Monorepo

A monorepo containing the Partner Platform backend API, dashboard frontend, and shared validation library.

## 📦 Packages

- **@partner-platform/backend** - Express.js REST API server
- **@partner-platform/dashboard** - React + Vite frontend application
- **@partner-platform/shared-validation** - Shared Zod validation schemas

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation

Clone the repository and install all dependencies:

```bash
cd partner-platform
npm install
```

This will install dependencies for all workspace packages.

## 📜 Available Scripts

### Development

```bash
# Run all services in development mode (backend + dashboard)
npm run dev

# Run backend only
npm run dev:backend

# Run dashboard only
npm run dev:dashboard

# Run backend worker (Temporal)
npm run worker:dev
```

### Production Build

```bash
# Build all packages
npm run build

# Build backend
npm run build:backend

# Build dashboard
npm run build:dashboard
```

### Start Production

```bash
# Start backend server
npm run start:backend

# Start dashboard
npm run start:dashboard
```

### Testing & Linting

```bash
# Run tests in all packages
npm run test

# Lint all packages
npm run lint

# Fix linting issues
npm run lint:fix
```

### Cleaning

```bash
# Clean all node_modules
npm run clean:modules

# Clean build artifacts and node_modules
npm run clean
```

## 🏗️ Monorepo Structure

```
partner-platform/
├── packages/
│   ├── backend/                    # Express.js API
│   │   ├── src/
│   │   ├── migrations/
│   │   ├── server.js
│   │   └── package.json
│   ├── dashboard/                  # React + Vite frontend
│   │   ├── src/
│   │   ├── public/
│   │   ├── index.html
│   │   └── package.json
│   └── shared-validation/          # Shared validation schemas
│       ├── schemas/
│       ├── config/
│       ├── index.js
│       └── package.json
├── .gitignore
├── .prettierrc
├── .eslintrc.json
├── package.json                    # Root workspace configuration
└── README.md
```

## 🔧 Package Details

### Backend (`@partner-platform/backend`)

Express.js REST API with:
- Authentication (Google OAuth, Microsoft OAuth)
- Database (PostgreSQL with Sequelize)
- Background jobs (BullMQ + Redis)
- Temporal workflows
- API documentation (Swagger)

**Development:**
```bash
cd packages/backend
npm run dev
```

**Environment Variables:**
Copy `prod.env` to `.env` and configure required variables.

### Dashboard (`@partner-platform/dashboard`)

React + Vite single-page application with:
- React Router for routing
- Redux Toolkit for state management
- Radix UI components
- Tailwind CSS for styling
- React Hook Form with Zod validation

**Development:**
```bash
cd packages/dashboard
npm run dev
```

**Build:**
```bash
cd packages/dashboard
npm run build
```

### Shared Validation (`@partner-platform/shared-validation`)

Centralized Zod validation schemas shared between backend and dashboard:
- Property listing schemas
- Step configuration
- Reusable validation utilities

**Usage in packages:**
```javascript
// Backend (CommonJS)
const { schemas, stepConfig } = require('@partner-platform/shared-validation');

// Dashboard (ESM) - Note: May need to update to ESM exports
import { schemas, stepConfig } from '@partner-platform/shared-validation';
```

## 🔗 Workspace Dependencies

The monorepo uses npm workspaces to manage inter-package dependencies. The `shared-validation` package is referenced using the workspace protocol (`*`), which automatically links to the local version.

## 📝 Development Workflow

1. **Make changes** in any package
2. **Test locally** using `npm run dev`
3. **Lint code** with `npm run lint`
4. **Build** with `npm run build`
5. **Commit changes** and push

## 🎯 Migration from Separate Repos

This monorepo structure provides:
- ✅ Unified version control
- ✅ Simplified dependency management
- ✅ Easier refactoring across packages
- ✅ Consistent tooling and scripts
- ✅ Atomic commits across packages

### Migrating Existing Code

To migrate your existing code into this structure:

1. **Backend**: Copy all files from `partner-platform-backend` to `packages/backend/`
2. **Dashboard**: Copy all files from `partner-platform-dashboard` to `packages/dashboard/`
3. **Shared Validation**: Copy all files from `shared-validation` to `packages/shared-validation/`
4. **Install dependencies**: Run `npm install` from root
5. **Update imports**: Ensure all imports reference `@partner-platform/shared-validation`

## 🔒 Environment Variables

Each package has its own environment configuration:
- `packages/backend/.env` - Backend environment variables
- `packages/dashboard/.env` - Dashboard environment variables

## 🤝 Contributing

1. Create a feature branch
2. Make changes in relevant package(s)
3. Test thoroughly
4. Submit a pull request

## 📄 License

ISC
