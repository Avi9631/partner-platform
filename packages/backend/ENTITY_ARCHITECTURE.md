# Entity Architecture

## Overview

The backend now uses entities from the `@partner-platform/shared-entities` package, enabling entity reuse across multiple services in the monorepo while maintaining a single database connection pool.

## Architecture

```
@partner-platform/shared-entities (package)
    └── exports: initializeEntities(sequelize) function
         ├── accepts: Sequelize instance (configured by app)
         └── returns: db object with all entities + sequelize instance

@partner-platform/backend
    └── src/entity/index.js
         ├── imports: Sequelize library
         ├── imports: dbConfig (app-specific)
         ├── creates: Sequelize instance with app-specific pool, logging, dialect options
         ├── calls: initializeEntities(sequelize)
         └── exports: db object (singleton instance)

    └── src/service/*.service.js
    └── src/controller/*.controller.js
    └── src/temporal/activities/*.activities.js
         └── all import: db from '../entity/index.js' or '../../entity/index.js'
```

## Key Files

### 1. Shared Entities Package
**Location**: `packages/shared-entities/src/index.js`

Exports an initialization function that:
- Accepts a pre-configured Sequelize instance
- Initializes all entity models using that instance
- Defines relationships between entities
- Returns a db object with all entities

**Note**: Does NOT configure Sequelize - that's the application's responsibility

### 2. Backend Entity Index
**Location**: `packages/backend/src/entity/index.js`

- Imports Sequelize library
- Imports database configuration (app-specific)
- Creates Sequelize instance with:
  - Application-specific pool settings
  - Application-specific logging preferences
  - Application-specific dialect options
  - Application-specific define options
- Calls `initializeEntities()` with the configured instance
- Exports the initialized db object

### 3. Service/Controller/Activity Files

All backend code imports from the backend's entity index:
```javascript
// Services & Controllers
import db from '../entity/index.js';

// Temporal Activities
import db from '../../entity/index.js';
```

## Benefits

1. **Single Database Connection**: One connection pool shared across all backend code
2. **Entity Reuse**: Entities defined once, usable by multiple services
3. **Centralized Schema**: Database schema changes made in one place
4. **Application-Specific Configuration**: Each app controls its own pool size, logging, and dialect options
5. **Flexibility**: Different services can use different Sequelize configurations while sharing entity definitions
6. **Type Safety**: Consistent entity definitions across the codebase
7. **Easier Testing**: Can mock the entity layer at a single point

## Available Entities

The db object provides access to:
- `db.PlatformUser` - User accounts (partners/businesses)
- `db.PartnerBusiness` - Business partner details
- `db.ListingDraft` - Draft listings (all types)
- `db.Developer` - Developer/Builder listings
- `db.PgColiveHostel` - PG/Colive/Hostel listings
- `db.Property` - Rental property listings
- `db.Project` - Real estate project listings
- `db.WalletTransaction` - Credit/debit transactions
- `db.ListingAnalytics` - View tracking
- `db.ListingLead` - Lead management
- `db.sequelize` - Sequelize instance
- `db.Sequelize` - Sequelize library

## Important Notes

⚠️ **Do NOT import directly from `@partner-platform/shared-entities` in service/controller code**

❌ Wrong:
```javascript
import db from '@partner-platform/shared-entities';
```
This imports the initialization function, not the db object!

✅ Correct:
```javascript
import db from '../entity/index.js';
```
This imports the initialized db singleton.

⚠️ **Configuration is application-specific**

The shared-entities package does NOT configure Sequelize. Each application must:
1. Import Sequelize
2. Create a Sequelize instance with app-specific settings (pool, logging, dialect options)
3. Pass that instance to `initializeEntities()`

Example in backend:
```javascript
import Sequelize from 'sequelize';
import initializeEntities from '@partner-platform/shared-entities';

// Application controls pool size, logging, SSL, etc.
const sequelize = new Sequelize(db, user, password, {
  dialect: 'postgres',
  pool: { max: 10, min: 2 }, // App-specific pool
  logging: console.log,       // App-specific logging
  // ... other app-specific options
});

const db = initializeEntities(sequelize);
```

## Migration Status

All entity imports have been updated to use this architecture:
- ✅ All services (12 files)
- ✅ All controllers (4 files)
- ✅ All temporal activities (8 files)

The backend now properly references entities from the shared-entities package while maintaining proper database connection management.
