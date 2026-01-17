# Shared Entities

This package contains all Sequelize entity definitions for the Partner Platform monorepo.

## Purpose

Centralizes database entity definitions to:
- Enable reuse across multiple services (backend, workers, etc.)
- Maintain consistency in database schema definitions
- Reduce code duplication
- Simplify updates to entity definitions

## Usage

```javascript
const initializeEntities = require('@partner-platform/shared-entities');

// Pass your database configuration
const dbConfig = {
  DB: 'database_name',
  USER: 'username',
  PASSWORD: 'password',
  HOST: 'localhost',
  port: 5432,
  dialect: 'postgres',
  dialectOptions: { /* ... */ },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};

// Initialize entities with your config
const db = initializeEntities(dbConfig);

// Access entities
const { PlatformUser, Property, Developer } = db;
```

## Entities

- **PlatformUser** - Platform users (partners, admins)
- **PartnerBusiness** - Business information for partners
- **ListingDraft** - Draft listings for properties, PG hostels, developers, and projects
- **Developer** - Developer profiles
- **PgColiveHostel** - PG/Co-living/Hostel listings
- **Property** - Property listings (sale/rent/lease)
- **Project** - Real estate projects
- **WalletTransaction** - User wallet transactions
- **ListingAnalytics** - Analytics for all listing types
- **ListingLead** - Lead tracking for listings

## Structure

```
src/
  ├── entities/           # Individual entity definitions
  ├── utils/              # Utility functions used by entities
  └── index.js            # Main entry point with initialization
```

## Development

This package is part of the Partner Platform monorepo. To work with it:

1. Make changes to entity definitions in `src/entities/`
2. No build step required - uses CommonJS directly
3. Other packages can depend on this via workspace protocol in package.json
