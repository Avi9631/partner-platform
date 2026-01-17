# Shared Entities - Usage Examples

This document provides practical examples of using the `@partner-platform/shared-entities` package in different scenarios.

## Table of Contents

- [Basic Usage](#basic-usage)
- [Backend Integration](#backend-integration)
- [Temporal Worker Integration](#temporal-worker-integration)
- [Common Queries](#common-queries)
- [Relationship Examples](#relationship-examples)
- [Advanced Usage](#advanced-usage)

---

## Basic Usage

### Initialize in Any Service

```javascript
const initializeEntities = require('@partner-platform/shared-entities');

// Your database configuration
const dbConfig = {
  DB: process.env.DB_NAME,
  USER: process.env.DB_USER,
  PASSWORD: process.env.DB_PASSWORD,
  HOST: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};

// Initialize entities
const db = initializeEntities(dbConfig);

// Access entities
const { PlatformUser, Property, Developer } = db;
```

---

## Backend Integration

### Current Backend Setup (Already Implemented)

```javascript
// packages/backend/src/entity/index.js
const dbConfig = require("../config/db.config.js");
const initializeEntities = require("@partner-platform/shared-entities");

const db = initializeEntities(dbConfig);
module.exports = db;
```

### Using in Services

```javascript
// packages/backend/src/service/PropertyService.service.js
const db = require("../entity");

class PropertyService {
  async getProperties() {
    return await db.Property.findAll({
      include: ['creator', 'project'],
      where: { status: 'ACTIVE' }
    });
  }

  async createProperty(data) {
    return await db.Property.create(data);
  }
}
```

### Using in Controllers

```javascript
// packages/backend/src/controller/Property.controller.js
const db = require("../entity");

exports.listProperties = async (req, res) => {
  const properties = await db.Property.findAll({
    include: [{
      model: db.PlatformUser,
      as: 'creator',
      attributes: ['userId', 'firstName', 'lastName']
    }]
  });
  
  res.json({ properties });
};
```

---

## Temporal Worker Integration

### Example: Property Publishing Worker

```javascript
// packages/backend/src/temporal/activities/propertyPublishing.activities.js
const initializeEntities = require('@partner-platform/shared-entities');

// Initialize once at module level
const dbConfig = require('../../config/db.config');
const db = initializeEntities(dbConfig);

// Activity function
async function publishProperty({ draftId, userId }) {
  // Get draft
  const draft = await db.ListingDraft.findByPk(draftId);
  
  if (!draft) {
    throw new Error(`Draft ${draftId} not found`);
  }

  // Create property from draft
  const property = await db.Property.create({
    ...draft.draftData,
    createdBy: userId,
    draftId: draftId
  });

  // Update draft status
  await draft.update({ draftStatus: 'PUBLISHED' });

  return property.propertyId;
}

module.exports = { publishProperty };
```

### Example: Analytics Worker

```javascript
// packages/backend/src/workers/analyticsWorker.js
const initializeEntities = require('@partner-platform/shared-entities');

const dbConfig = {
  DB: process.env.DB_NAME,
  USER: process.env.DB_USER,
  PASSWORD: process.env.DB_PASSWORD,
  HOST: process.env.DB_HOST,
  port: 5432,
  dialect: 'postgres',
  dialectOptions: {},
  pool: { max: 5, min: 0, acquire: 30000, idle: 10000 }
};

const db = initializeEntities(dbConfig);

async function processView(viewData) {
  await db.ListingAnalytics.create({
    listingType: viewData.type,
    listingId: viewData.id,
    viewerId: viewData.userId,
    sessionId: viewData.sessionId,
    viewedAt: new Date()
  });
}

module.exports = { processView };
```

---

## Common Queries

### User Operations

```javascript
// Find user with relationships
const user = await db.PlatformUser.findOne({
  where: { email: 'user@example.com' },
  include: [
    'business',           // PartnerBusiness
    'properties',         // User's properties
    'developers',         // Developer profiles
    'listingDrafts',      // All drafts
    'walletTransactions'  // Transaction history
  ]
});

// Create new user
const newUser = await db.PlatformUser.create({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  phone: '+1234567890'
});

// Update user
await user.update({
  verificationStatus: 'APPROVED',
  verifiedAt: new Date()
});
```

### Property Operations

```javascript
// Find properties in a city
const properties = await db.Property.findAll({
  where: { 
    city: 'Mumbai',
    status: 'ACTIVE'
  },
  include: [
    {
      model: db.PlatformUser,
      as: 'creator',
      attributes: ['userId', 'firstName', 'lastName', 'email']
    },
    {
      model: db.Project,
      as: 'project',
      required: false
    }
  ],
  limit: 20,
  order: [['property_created_at', 'DESC']]
});

// Search by location (PostGIS)
const nearbyProperties = await db.Property.findAll({
  where: db.sequelize.where(
    db.sequelize.fn(
      'ST_DWithin',
      db.sequelize.col('location'),
      db.sequelize.fn('ST_MakePoint', longitude, latitude),
      5000 // 5km radius in meters
    ),
    true
  )
});

// Create property
const property = await db.Property.create({
  propertyName: 'Luxury Apartment',
  createdBy: userId,
  city: 'Mumbai',
  locality: 'Bandra',
  lat: 19.0596,
  lng: 72.8295,
  bedrooms: '3',
  pricing: [
    { type: 'sale', value: 15000000, unit: 'INR' }
  ],
  features: ['parking', 'gym', 'pool'],
  mediaData: [
    { type: 'image', url: 'https://...' }
  ]
});
```

### Draft Operations

```javascript
// Create draft
const draft = await db.ListingDraft.create({
  userId: userId,
  draftType: 'PROPERTY',
  draftStatus: 'DRAFT',
  draftData: {
    propertyName: 'My Property',
    city: 'Mumbai',
    // ... more fields
  }
});

// Update draft
await draft.update({
  draftData: {
    ...draft.draftData,
    bedrooms: '3'
  }
});

// Publish draft
await db.sequelize.transaction(async (t) => {
  // Create property
  const property = await db.Property.create({
    ...draft.draftData,
    createdBy: draft.userId,
    draftId: draft.draftId
  }, { transaction: t });

  // Update draft status
  await draft.update({
    draftStatus: 'PUBLISHED'
  }, { transaction: t });

  return property;
});
```

### Analytics & Leads

```javascript
// Track view
await db.ListingAnalytics.create({
  listingType: 'property',
  listingId: propertyId,
  viewerId: userId || null,
  sessionId: sessionId,
  deviceType: 'desktop',
  viewedAt: new Date()
});

// Create lead
await db.ListingLead.create({
  listingType: 'PROPERTY',
  listingId: propertyId,
  reason: 'CONNECT_AGENT',
  customerName: 'Jane Smith',
  customerEmail: 'jane@example.com',
  customerPhone: '+1234567890',
  partnerId: propertyOwnerId,
  status: 'NEW'
});

// Get property analytics
const stats = await db.ListingAnalytics.count({
  where: {
    listingType: 'property',
    listingId: propertyId,
    viewedAt: {
      [db.Sequelize.Op.gte]: new Date(Date.now() - 30*24*60*60*1000)
    }
  }
});
```

---

## Relationship Examples

### One-to-One: User ↔ PartnerBusiness

```javascript
// Get user with business
const user = await db.PlatformUser.findByPk(userId, {
  include: ['business']
});

console.log(user.business.businessName);

// Create business for user
const business = await db.PartnerBusiness.create({
  userId: user.userId,
  businessName: 'ABC Real Estate',
  businessEmail: 'info@abc.com',
  businessAddress: '123 Main St'
});
```

### One-to-Many: User → Properties

```javascript
// Get user's properties
const user = await db.PlatformUser.findByPk(userId, {
  include: [{
    model: db.Property,
    as: 'properties',
    where: { status: 'ACTIVE' }
  }]
});

console.log(`User has ${user.properties.length} properties`);

// Create property for user
const property = await user.createProperty({
  propertyName: 'New Property',
  city: 'Mumbai'
});
```

### Many-to-One: Property → Project

```javascript
// Get property with project
const property = await db.Property.findByPk(propertyId, {
  include: ['project']
});

if (property.project) {
  console.log(`Part of ${property.project.projectName}`);
}

// Associate property with project
await property.update({ projectId: projectId });
```

### Polymorphic: ListingAnalytics

```javascript
// Track views for different listing types

// Property view
await db.ListingAnalytics.create({
  listingType: 'property',
  listingId: propertyId,
  viewerId: userId
});

// Developer view
await db.ListingAnalytics.create({
  listingType: 'developer',
  listingId: developerId,
  viewerId: userId
});

// Get all views for a property
const propertyViews = await db.ListingAnalytics.findAll({
  where: {
    listingType: 'property',
    listingId: propertyId
  },
  include: ['viewer']
});
```

---

## Advanced Usage

### Transactions

```javascript
// Use Sequelize transactions
await db.sequelize.transaction(async (t) => {
  // Create user
  const user = await db.PlatformUser.create({
    firstName: 'John',
    email: 'john@example.com'
  }, { transaction: t });

  // Create business
  await db.PartnerBusiness.create({
    userId: user.userId,
    businessName: 'John Real Estate'
  }, { transaction: t });

  // Create wallet entry
  await db.WalletTransaction.create({
    userId: user.userId,
    transactionType: 'CREDIT',
    amount: 100,
    balanceAfter: 100,
    reason: 'Welcome bonus'
  }, { transaction: t });
});
```

### Raw Queries

```javascript
// Execute raw SQL when needed
const [results, metadata] = await db.sequelize.query(
  `SELECT 
    city,
    COUNT(*) as property_count,
    AVG(CAST(pricing->0->>'value' AS NUMERIC)) as avg_price
   FROM property
   WHERE status = 'ACTIVE'
   GROUP BY city
   ORDER BY property_count DESC`,
  { type: db.Sequelize.QueryTypes.SELECT }
);
```

### Bulk Operations

```javascript
// Bulk create
await db.Property.bulkCreate([
  { propertyName: 'Prop 1', createdBy: userId },
  { propertyName: 'Prop 2', createdBy: userId },
  { propertyName: 'Prop 3', createdBy: userId }
]);

// Bulk update
await db.Property.update(
  { status: 'INACTIVE' },
  { 
    where: { 
      createdBy: userId,
      property_created_at: {
        [db.Sequelize.Op.lt]: new Date('2020-01-01')
      }
    }
  }
);

// Bulk delete (soft delete)
await db.Property.destroy({
  where: { status: 'ARCHIVED' }
});
```

### Custom Scopes

```javascript
// Define scopes in your service layer
class PropertyService {
  static async getActiveProperties() {
    return db.Property.findAll({
      where: { status: 'ACTIVE' }
    });
  }

  static async getVerifiedProperties() {
    return db.Property.findAll({
      where: { isPriceVerified: true },
      include: [{
        model: db.PlatformUser,
        as: 'creator',
        where: { verificationStatus: 'APPROVED' }
      }]
    });
  }
}
```

### Virtual Field Usage

```javascript
// Virtual fields are automatically computed
const user = await db.PlatformUser.findByPk(userId);

console.log(user.derivedUserName);  // "John Doe"
console.log(user.created_date);     // "17-Jan-2026"
console.log(user.v_created_time);   // "14:30:45"

const property = await db.Property.findByPk(propertyId);
console.log(property.v_created_date); // "17-Jan-2026"
```

---

## Testing Examples

### Unit Test Example

```javascript
const initializeEntities = require('@partner-platform/shared-entities');

describe('Property Entity', () => {
  let db;

  beforeAll(async () => {
    // Use test database
    db = initializeEntities({
      DB: 'test_db',
      USER: 'test_user',
      PASSWORD: 'test_pass',
      HOST: 'localhost',
      port: 5432,
      dialect: 'postgres',
      dialectOptions: {},
      pool: { max: 5, min: 0, acquire: 30000, idle: 10000 }
    });

    await db.sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await db.sequelize.close();
  });

  test('should create property', async () => {
    const property = await db.Property.create({
      propertyName: 'Test Property',
      createdBy: 1,
      city: 'Mumbai'
    });

    expect(property.propertyId).toBeDefined();
    expect(property.propertyName).toBe('Test Property');
  });
});
```

---

## Best Practices

### 1. Initialize Once Per Service

```javascript
// ✅ Good - Initialize once at module level
const db = initializeEntities(dbConfig);

// ❌ Bad - Don't initialize in every function
function getUser() {
  const db = initializeEntities(dbConfig); // Creates new connection pool!
}
```

### 2. Use Transactions for Multi-Step Operations

```javascript
// ✅ Good
await db.sequelize.transaction(async (t) => {
  await db.Property.create(data, { transaction: t });
  await db.WalletTransaction.create(txn, { transaction: t });
});

// ❌ Bad - No transaction
await db.Property.create(data);
await db.WalletTransaction.create(txn); // If this fails, property is still created
```

### 3. Include Only Needed Fields

```javascript
// ✅ Good
const user = await db.PlatformUser.findByPk(userId, {
  attributes: ['userId', 'firstName', 'email']
});

// ❌ Bad - Fetches all fields including large text fields
const user = await db.PlatformUser.findByPk(userId);
```

### 4. Use Pagination

```javascript
// ✅ Good
const properties = await db.Property.findAndCountAll({
  limit: 20,
  offset: page * 20,
  order: [['property_created_at', 'DESC']]
});

// ❌ Bad - Loads everything into memory
const properties = await db.Property.findAll();
```

---

## Troubleshooting

### Connection Issues

```javascript
try {
  await db.sequelize.authenticate();
  console.log('Connection established successfully.');
} catch (error) {
  console.error('Unable to connect to database:', error);
}
```

### Query Debugging

```javascript
// Enable logging for debugging
const db = initializeEntities({
  ...dbConfig,
  logging: console.log // or use custom logger
});
```

### Check Entity Associations

```javascript
// Log all associations for an entity
console.log(Object.keys(db.Property.associations));
// Output: ['creator', 'project', 'draft']
```

---

## Additional Resources

- [Sequelize Documentation](https://sequelize.org/docs/v6/)
- [PostgreSQL JSONB Guide](https://www.postgresql.org/docs/current/datatype-json.html)
- [PostGIS Documentation](https://postgis.net/documentation/)

---

**Last Updated:** January 17, 2026  
**Package Version:** 1.0.0
