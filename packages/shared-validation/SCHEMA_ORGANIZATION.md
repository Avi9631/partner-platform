# Shared Validation Package - Schema Organization

This document describes the reorganized schema structure in the `@partner-platform/shared-validation` package.

## Directory Structure

```
packages/shared-validation/
├── schemas/
│   ├── property/          # Property listing validation schemas (21 files)
│   ├── project/           # Project/Builder project schemas (9 files)
│   ├── pg-hostel/         # PG & Hostel listing schemas (8 files)
│   └── developer/         # Developer profile schemas (1 file)
├── config/
│   └── stepConfiguration.js
├── index.js               # Main entry point
└── README.md
```

## Usage

### Importing Schemas in Dashboard

All schemas are now imported from the shared-validation package:

#### Property Schemas
```javascript
import { propertySchemas } from '@partner-platform/shared-validation';

const { 
  basicDetailsSchema,
  locationSelectionSchema,
  basicConfigurationSchema,
  // ... other property schemas
} = propertySchemas;
```

#### Project Schemas
```javascript
import { projectSchemas } from '@partner-platform/shared-validation';

const { 
  basicDetailsProjectSchema,
  amenitiesProjectSchema,
  configurationsProjectSchema,
  // ... other project schemas
} = projectSchemas;
```

#### PG/Hostel Schemas
```javascript
import { pgHostelSchemas } from '@partner-platform/shared-validation';

const { 
  basicDetailsPgSchema,
  roomTypesPgSchema,
  amenitiesPgSchema,
  // ... other pg-hostel schemas
} = pgHostelSchemas;
```

#### Developer Schemas
```javascript
import { developerSchemas } from '@partner-platform/shared-validation';

const { basicInfoSchema } = developerSchemas;
```

## Schema Categories

### 1. Property Schemas (`schemas/property/`)
Validation schemas for property listings:
- `basicDetailsSchema` - Basic property information
- `locationSelectionSchema` - Property location details
- `basicConfigurationSchema` - BHK configuration
- `unitAmenitiesSchema` - Unit-level amenities
- `locationAttributesSchema` - Location attributes (facing, view, etc.)
- `floorDetailsSchema` - Floor information
- `landAttributesSchema` - Land details
- `pricingInformationSchema` - Pricing and ownership
- `listingInformationSchema` - Listing details
- `propertyAmenitiesSchema` - Property-level amenities
- `mediaUploadSchema` - Property media
- `parkingUtilitiesSchema` - Parking and utilities
- `suitableForSchema` - Suitable tenant types
- `areaDetailsSchema` - Area measurements
- `documentsSchema` - Property documents
- `geoTagSchema` - Geo-tagging information
- `enhancedBasicDetailsSchema` - Enhanced basic details
- `enhancedGeoTagSchema` - Enhanced geo-tagging
- `enhancedLocationSchema` - Enhanced location
- `summaryInsightsSchema` - Property summary
- `transactionOwnerSchema` - Transaction details

### 2. Project Schemas (`schemas/project/`)
Validation schemas for builder projects:
- `basicDetailsProjectSchema` - Project basic information
- `locationDetailsProjectSchema` - Project location
- `configurationsProjectSchema` - Unit configurations (1BHK, 2BHK, etc.)
- `configurationHelpers` - Helper functions for configurations
- `amenitiesProjectSchema` - Project amenities
- `pricingProjectSchema` - Pricing information
- `mediaUploadProjectSchema` - Project media
- `legalDocsProjectSchema` - Legal documents
- `additionalInfoProjectSchema` - Additional information

### 3. PG/Hostel Schemas (`schemas/pg-hostel/`)
Validation schemas for PG and hostel listings:
- `basicDetailsPgSchema` - Basic PG/Hostel details
- `locationDetailsPgSchema` - Location information
- `roomTypesPgSchema` - Room types and configurations
- `amenitiesPgSchema` - PG amenities
- `foodMessPgSchema` - Food and mess details
- `rulesRestrictionsPgSchema` - House rules
- `mediaUploadPgSchema` - PG media
- `availabilityPgSchema` - Availability information

### 4. Developer Schemas (`schemas/developer/`)
Validation schemas for developer profiles:
- `basicInfoSchema` - Developer basic information

## Migration Notes

All schemas have been moved from their original locations in the dashboard modules to this centralized package:

- **From:** `packages/dashboard/src/modules/listProperty/schemas/`
- **To:** `packages/shared-validation/schemas/property/`

- **From:** `packages/dashboard/src/modules/listProject/schemas/`
- **To:** `packages/shared-validation/schemas/project/`

- **From:** `packages/dashboard/src/modules/listPg/schemas/`
- **To:** `packages/shared-validation/schemas/pg-hostel/`

- **From:** `packages/dashboard/src/modules/listDeveloper/schemas/`
- **To:** `packages/shared-validation/schemas/developer/`

## Benefits

1. **Centralized Validation**: Single source of truth for all validation schemas
2. **Code Reusability**: Schemas can be used across frontend and backend
3. **Better Organization**: Clear separation by entity type
4. **Easy Maintenance**: Changes to schemas in one place affect all consumers
5. **Type Safety**: Consistent validation across the platform

## Future Additions

When adding new schemas:
1. Create the schema file in the appropriate subdirectory
2. Add the export to the subdirectory's `index.js`
3. Update this README with the new schema information
