# Shared Validation Package

Centralized validation schemas for all entity types across the partner platform (frontend and backend).

## Structure

```
shared-validation/
├── schemas/
│   ├── property/           # Property listing schemas (21 schemas)
│   ├── project/            # Builder project schemas (9 schemas)
│   ├── pg-hostel/          # PG & Hostel schemas (8 schemas)
│   └── developer/          # Developer profile schemas (1 schema)
├── config/
│   └── stepConfiguration.js
├── index.js                # Main exports
├── package.json
├── SCHEMA_ORGANIZATION.md  # Detailed documentation
└── MIGRATION_COMPLETE.md   # Migration history
```

## Usage

### Frontend (React/Vite)
```javascript
// Property schemas
import { propertySchemas } from '@partner-platform/shared-validation';
const { basicDetailsSchema, locationSelectionSchema } = propertySchemas;

// Project schemas  
import { projectSchemas } from '@partner-platform/shared-validation';
const { basicDetailsProjectSchema, configurationsProjectSchema } = projectSchemas;

// PG/Hostel schemas
import { pgHostelSchemas } from '@partner-platform/shared-validation';
const { basicDetailsPgSchema, roomTypesPgSchema } = pgHostelSchemas;

// Developer schemas
import { developerSchemas } from '@partner-platform/shared-validation';
const { basicInfoSchema } = developerSchemas;
```

### Backend (Node.js)
```javascript
const { propertySchemas, projectSchemas, pgHostelSchemas, developerSchemas } = require('@partner-platform/shared-validation');

// Validate property data
const result = propertySchemas.basicDetailsSchema.safeParse(data);
if (!result.success) {
  console.error(result.error);
}

// Get steps for property type
const { stepConfig } = require('@partner-platform/shared-validation');
const steps = stepConfig.getVisibleSteps({ propertyType: 'apartment' });
```

## Schema Categories

- **propertySchemas** - 21 property listing validation schemas
- **projectSchemas** - 9 builder project validation schemas  
- **pgHostelSchemas** - 8 PG & Hostel listing validation schemas
- **developerSchemas** - 1 developer profile validation schema

## Documentation

See [SCHEMA_ORGANIZATION.md](./SCHEMA_ORGANIZATION.md) for comprehensive schema documentation and usage examples.

See [MIGRATION_COMPLETE.md](./MIGRATION_COMPLETE.md) for migration details and benefits.
