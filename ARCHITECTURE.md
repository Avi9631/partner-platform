# Partner Platform Monorepo - Architecture Overview

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Partner Platform Monorepo                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐ │
│  │   Dashboard  │  │   Backend    │  │     Shared       │ │
│  │  (React +    │──│  (Express    │──│   Validation     │ │
│  │   Vite)      │  │     API)     │  │   (Zod)          │ │
│  └──────────────┘  └──────────────┘  └──────────────────┘ │
│         │                 │                    ▲            │
│         │                 │                    │            │
│         └─────────────────┴────────────────────┘            │
│                  Shares validation schemas                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 📦 Package Structure

### 1. **@partner-platform/backend** 
**Technology:** Node.js + Express.js  
**Purpose:** REST API server

**Key Features:**
- RESTful API endpoints
- PostgreSQL database with Sequelize ORM
- Authentication (JWT, Google OAuth, Microsoft OAuth)
- File upload handling (AWS S3, Supabase)
- Background job processing (BullMQ + Redis)
- Temporal workflow engine
- API documentation (Swagger)
- OpenTelemetry tracing

**Directory Structure:**
```
packages/backend/
├── src/
│   ├── controllers/      # Request handlers
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── middleware/       # Express middleware
│   ├── services/         # Business logic
│   ├── temporal/         # Temporal workflows
│   └── utils/            # Utility functions
├── migrations/           # Database migrations
├── server.js            # Entry point
└── package.json
```

### 2. **@partner-platform/dashboard**
**Technology:** React 18 + Vite  
**Purpose:** Admin/Partner dashboard

**Key Features:**
- Modern React with hooks
- Vite for fast development and optimized builds
- React Router for navigation
- Redux Toolkit for state management
- React Hook Form + Zod for form validation
- Radix UI components
- Tailwind CSS styling
- React Query for data fetching
- Google Maps integration

**Directory Structure:**
```
packages/dashboard/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── ui/          # Base UI components (shadcn)
│   │   ├── hooks/       # Custom React hooks
│   │   └── maps/        # Map-related components
│   ├── modules/         # Feature modules
│   │   └── listProperty/
│   │       └── v2/      # Property listing flow
│   ├── pages/           # Page components
│   ├── services/        # API client services
│   ├── context/         # React contexts
│   ├── lib/             # Utilities
│   └── config/          # Configuration
├── public/              # Static assets
├── index.html           # HTML template
└── package.json
```

### 3. **@partner-platform/shared-validation**
**Technology:** Zod (TypeScript-first schema validation)  
**Purpose:** Shared validation schemas

**Key Features:**
- Centralized validation logic
- Type-safe schemas
- Reusable across frontend and backend
- Step configuration for multi-step forms
- Property listing validation rules

**Directory Structure:**
```
packages/shared-validation/
├── schemas/                      # Zod schemas
│   ├── basicDetailsSchema.js
│   ├── locationSelectionSchema.js
│   ├── areaDetailsSchema.js
│   ├── pricingInformationSchema.js
│   └── ...
├── config/
│   └── stepConfiguration.js     # Form step config
├── index.js                      # Main export
└── package.json
```

## 🔄 Data Flow

### Property Listing Flow (Example)

```
1. User fills form in Dashboard
   └─→ Uses validation from @partner-platform/shared-validation
   
2. Dashboard sends request to Backend API
   └─→ POST /api/properties
   
3. Backend validates again with shared-validation
   └─→ Ensures data integrity
   
4. Backend processes and stores in PostgreSQL
   └─→ Returns response to Dashboard
   
5. Dashboard updates UI
   └─→ Shows success message
```

## 🔐 Authentication Flow

```
┌─────────┐         ┌─────────┐         ┌──────────┐
│Dashboard│         │ Backend │         │  OAuth   │
│         │         │   API   │         │ Provider │
└────┬────┘         └────┬────┘         └────┬─────┘
     │                   │                    │
     │ Login Request     │                    │
     ├──────────────────>│                    │
     │                   │ Redirect to OAuth  │
     │                   ├───────────────────>│
     │                   │                    │
     │                   │   Auth Callback    │
     │                   │<───────────────────┤
     │                   │                    │
     │   JWT Token       │                    │
     │<──────────────────┤                    │
     │                   │                    │
     │ Authenticated     │                    │
     │   Requests        │                    │
     ├──────────────────>│                    │
     │ (with JWT header) │                    │
```

## 📊 Database Schema

The backend uses PostgreSQL with Sequelize ORM:

**Key Tables:**
- `users` - User accounts
- `properties` - Property listings
- `developers` - Developer information
- `pg_hostels` - PG/Hostel listings
- `listing_leads` - Lead captures
- `credit_transactions` - Credit/payment tracking

## 🚀 Deployment Architecture

### Development
```
localhost:3000  → Backend API
localhost:5174  → Dashboard (Vite dev server)
localhost:6379  → Redis
localhost:5432  → PostgreSQL
```

### Production (Recommended)
```
- Backend: Node.js server (PM2 or Docker)
- Dashboard: Static build served by Nginx
- Database: Managed PostgreSQL (AWS RDS, Supabase, etc.)
- Cache: Managed Redis (AWS ElastiCache, Redis Cloud)
- Storage: AWS S3 or Supabase Storage
```

## 🔧 Technology Stack Summary

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 18, Vite, Tailwind CSS, Radix UI |
| **State Management** | Redux Toolkit, Zustand, React Context |
| **Forms** | React Hook Form, Zod |
| **Backend** | Node.js, Express.js |
| **Database** | PostgreSQL, Sequelize ORM |
| **Caching** | Redis |
| **Authentication** | JWT, Passport.js (Google, Microsoft OAuth) |
| **Job Queue** | BullMQ |
| **Workflows** | Temporal |
| **Storage** | AWS S3, Supabase Storage |
| **Monitoring** | OpenTelemetry |
| **Validation** | Zod |

## 🎯 Monorepo Benefits

### 1. **Code Reusability**
- Shared validation schemas between frontend and backend
- No code duplication
- Single source of truth for business rules

### 2. **Atomic Changes**
- Update validation schema once, affects both packages
- Single commit for full-stack features
- Easier to maintain consistency

### 3. **Simplified Dependency Management**
- Shared dependencies hoisted to root
- Consistent versions across packages
- Smaller overall install size

### 4. **Better Developer Experience**
- Single repository to clone
- Unified tooling (ESLint, Prettier)
- Easier to onboard new developers

### 5. **Improved CI/CD**
- Single pipeline for all packages
- Parallel builds and tests
- Easier to coordinate releases

## 📝 Development Workflow

### Daily Development
```bash
# Start all services
npm run dev

# Work on specific package
cd packages/backend  # or dashboard, shared-validation
# Make changes
# Changes automatically reload (nodemon/Vite HMR)
```

### Adding New Feature
```bash
# 1. If validation needed, add to shared-validation
cd packages/shared-validation/schemas
# Create new schema file

# 2. Update backend API
cd packages/backend/src
# Add controller, route, service

# 3. Update dashboard UI
cd packages/dashboard/src
# Add component, integrate API

# 4. Test end-to-end
npm run dev
```

### Making Changes to Shared Validation
```bash
# 1. Update schema
cd packages/shared-validation
# Edit schema file

# 2. Both backend and dashboard automatically pick up changes
# (No rebuild needed, workspace linking handles it)

# 3. Restart dev servers if needed
npm run dev
```

## 🔒 Security Considerations

- JWT tokens for authentication
- Environment variables for secrets
- CORS configuration
- SQL injection prevention (Sequelize parameterized queries)
- XSS prevention (React auto-escaping)
- Rate limiting on API endpoints
- File upload validation

## 📈 Scalability Considerations

- Horizontal scaling: Multiple backend instances behind load balancer
- Database read replicas for read-heavy operations
- Redis for caching and session management
- CDN for static dashboard assets
- Background job processing with BullMQ
- Temporal for long-running workflows

## 🧪 Testing Strategy

```bash
# Unit tests for shared-validation
cd packages/shared-validation
npm run test

# Integration tests for backend
cd packages/backend
npm run test

# E2E tests for dashboard
cd packages/dashboard
npm run test
```

## 📚 Additional Resources

- [Main README](./README.md) - Getting started guide
- [Migration Guide](./MIGRATION.md) - Migrate from separate repos
- [Quick Start](./QUICKSTART.md) - Quick setup instructions
- [Environment Variables](./.env.example) - Configuration template
