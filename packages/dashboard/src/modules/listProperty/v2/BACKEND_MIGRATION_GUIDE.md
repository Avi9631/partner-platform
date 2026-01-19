# Backend Migration Guide - PropertySchema Format

## Overview

The frontend now sends property data in **propertySchema format** instead of the old step-based format. This guide helps backend developers understand and adapt to the new format.

## What Changed?

### Old Format (Step-Based)
```json
{
  "draftData": {
    "basic-details": {
      "customPropertyName": "Luxury Villa",
      "listingType": "sale",
      "ownershipType": "freehold"
    },
    "location-selection": {
      "coordinates": { "lat": 28.6139, "lng": 77.2090 },
      "city": "New Delhi",
      "locality": "Connaught Place"
    },
    "pricing": {
      "expectedPrice": 50000000
    }
  }
}
```

### New Format (PropertySchema)
```json
{
  "draftData": {
    "basicDetails": {
      "customPropertyName": "Luxury Villa",
      "listingType": "sale",
      "ownershipType": "freehold"
    },
    "locationSelection": {
      "coordinates": { "lat": 28.6139, "lng": 77.2090 },
      "city": "New Delhi",
      "locality": "Connaught Place"
    },
    "pricingInformation": {
      "expectedPrice": 50000000
    }
  }
}
```

**Key Differences**:
- ❌ `basic-details` → ✅ `basicDetails` (camelCase)
- ❌ `location-selection` → ✅ `locationSelection` (camelCase)
- ❌ `pricing` → ✅ `pricingInformation` (full schema name)

## Complete Property Schema Structure

```typescript
interface PropertySchema {
  // Basic Information
  propertyType?: string;
  basicDetails?: {
    customPropertyName: string;
    listingType: 'sale' | 'rent';
    ownershipType: string;
    ageOfProperty?: string;
    possessionStatus?: string;
    // ... more fields
  };
  
  // Location
  locationSelection?: {
    coordinates: { lat: number; lng: number };
    city: string;
    locality: string;
    addressText?: string;
    landmark?: string;
  };
  locationAttributes?: {
    // Location-specific attributes
  };
  
  // Configuration
  basicConfiguration?: {
    bhkType?: string;
    bedrooms?: number;
    bathrooms?: number;
    // ... more fields
  };
  
  // Area Details
  areaDetails?: {
    carpetArea?: number;
    builtUpArea?: number;
    superBuiltUpArea?: number;
    // ... more fields
  };
  
  // Floor & Land
  floorDetails?: {
    floorNumber?: number;
    totalFloors?: number;
    // ... more fields
  };
  landAttributes?: {
    plotArea?: number;
    plotLength?: number;
    plotBreadth?: number;
    // ... more fields
  };
  
  // Pricing
  pricingInformation?: {
    expectedPrice: number;
    pricePerSqFt?: number;
    maintenanceCharges?: number;
    // ... more fields
  };
  
  // Amenities
  unitAmenities?: {
    amenities: string[];
  };
  propertyAmenities?: {
    amenities: string[];
  };
  
  // Utilities
  parkingUtilities?: {
    parking?: {
      covered?: number;
      open?: number;
    };
    // ... more fields
  };
  
  // Media
  mediaUpload?: {
    images?: string[];
    videos?: string[];
    // ... more fields
  };
  
  // Listing Details
  listingInformation?: {
    title?: string;
    description?: string;
    // ... more fields
  };
  suitableFor?: {
    tenantTypes?: string[];
  };
  
  // Additional
  documents?: any;
  geoTag?: any;
  transactionOwner?: any;
  summaryInsights?: any;
}
```

## Backend Updates Required

### 1. Update Request Handler

**Before**:
```javascript
app.patch('/updateListingDraft', async (req, res) => {
  const { draftId, draftData } = req.body;
  
  // Old format: draftData has step-based keys
  const basicDetails = draftData['basic-details'];
  const locationData = draftData['location-selection'];
  
  // ... process
});
```

**After**:
```javascript
app.patch('/updateListingDraft', async (req, res) => {
  const { draftId, draftData } = req.body;
  
  // New format: draftData has propertySchema keys
  const basicDetails = draftData.basicDetails;
  const locationData = draftData.locationSelection;
  
  // ... process
});
```

### 2. Add Validation Using PropertySchema

```javascript
import { propertySchema } from '@partner-platform/shared-validation';

app.patch('/updateListingDraft', async (req, res) => {
  const { draftId, draftData } = req.body;
  
  // Validate using propertySchema
  const validation = propertySchema.safeParse(draftData);
  
  if (!validation.success) {
    return res.status(400).json({
      success: false,
      message: 'Invalid property data',
      errors: validation.error.errors
    });
  }
  
  // Data is valid, proceed with saving
  await saveDraft(draftId, validation.data);
  
  res.json({ success: true });
});
```

### 3. Update Database Schema (if needed)

If you're storing the draft data as JSON, you might want to update your column name or structure:

```sql
-- If using PostgreSQL JSONB
ALTER TABLE listing_drafts 
  ADD COLUMN draft_data_v2 JSONB;

-- Migrate existing data
UPDATE listing_drafts 
  SET draft_data_v2 = transform_to_property_schema(draft_data);
```

### 4. Handle Backward Compatibility (Optional)

If you need to support both formats temporarily:

```javascript
const normalizePropertyData = (draftData) => {
  // Check if it's already in propertySchema format
  if (draftData.basicDetails || draftData.locationSelection) {
    return draftData; // Already in new format
  }
  
  // Transform old format to new format
  const transformed = {};
  
  if (draftData['basic-details']) {
    transformed.basicDetails = draftData['basic-details'];
  }
  if (draftData['location-selection']) {
    transformed.locationSelection = draftData['location-selection'];
  }
  // ... map other fields
  
  return transformed;
};

app.patch('/updateListingDraft', async (req, res) => {
  const { draftId, draftData } = req.body;
  
  // Normalize to propertySchema format
  const normalizedData = normalizePropertyData(draftData);
  
  // Validate and save
  const validation = propertySchema.safeParse(normalizedData);
  // ... rest of the logic
});
```

## Step ID to PropertySchema Key Mapping

Complete mapping reference for transformation:

| Old Step ID            | New PropertySchema Key  |
|------------------------|-------------------------|
| `property-type`        | `propertyType`          |
| `basic-details`        | `basicDetails`          |
| `basic-configuration`  | `basicConfiguration`    |
| `location-selection`   | `locationSelection`     |
| `location-attributes`  | `locationAttributes`    |
| `area-details`         | `areaDetails`           |
| `floor-details`        | `floorDetails`          |
| `land-attributes`      | `landAttributes`        |
| `pricing`              | `pricingInformation`    |
| `unit-amenities`       | `unitAmenities`         |
| `property-amenities`   | `propertyAmenities`     |
| `parking`              | `parkingUtilities`      |
| `suitable-for`         | `suitableFor`           |
| `listing-info`         | `listingInformation`    |
| `media-upload`         | `mediaUpload`           |
| `documents`            | `documents`             |
| `geo-tag`              | `geoTag`                |

## Testing

### Test Cases

1. **Create New Draft**
   ```bash
   curl -X PATCH http://localhost:3000/updateListingDraft \
     -H "Content-Type: application/json" \
     -d '{
       "draftId": "123",
       "draftData": {
         "basicDetails": {
           "customPropertyName": "Test Property",
           "listingType": "sale"
         }
       }
     }'
   ```

2. **Load Draft**
   ```bash
   curl http://localhost:3000/listingDraft/123
   ```
   
   Expected response:
   ```json
   {
     "success": true,
     "data": {
       "draftId": "123",
       "draftData": {
         "basicDetails": { ... },
         "locationSelection": { ... }
       }
     }
   }
   ```

3. **Validate Schema**
   ```javascript
   import { propertySchema } from '@partner-platform/shared-validation';
   
   const testData = {
     basicDetails: {
       customPropertyName: "Test",
       listingType: "sale",
       ownershipType: "freehold"
     }
   };
   
   const result = propertySchema.safeParse(testData);
   console.log('Valid:', result.success);
   ```

## Common Issues & Solutions

### Issue 1: Cannot find property
**Problem**: `draftData['basic-details']` returns undefined

**Solution**: Update to use camelCase
```javascript
// ❌ Wrong
const data = draftData['basic-details'];

// ✅ Correct
const data = draftData.basicDetails;
```

### Issue 2: Validation failing
**Problem**: Validation errors even though data looks correct

**Solution**: Check that you're using the correct schema keys
```javascript
// ❌ Wrong key
{
  "basic-details": { ... } // This will fail validation
}

// ✅ Correct key
{
  "basicDetails": { ... } // This will pass validation
}
```

### Issue 3: Missing data after save
**Problem**: Some fields are not saved

**Solution**: Ensure all fields are under the correct propertySchema key
```javascript
// ❌ Wrong - loose fields
{
  "customPropertyName": "Test",
  "listingType": "sale"
}

// ✅ Correct - nested under basicDetails
{
  "basicDetails": {
    "customPropertyName": "Test",
    "listingType": "sale"
  }
}
```

## Database Queries

### Query by Property Type
```javascript
// MongoDB
db.listing_drafts.find({
  'draftData.propertyType': 'apartment'
});

// PostgreSQL with JSONB
SELECT * FROM listing_drafts 
WHERE draft_data->>'propertyType' = 'apartment';
```

### Query by City
```javascript
// MongoDB
db.listing_drafts.find({
  'draftData.locationSelection.city': 'New Delhi'
});

// PostgreSQL with JSONB
SELECT * FROM listing_drafts 
WHERE draft_data->'locationSelection'->>'city' = 'New Delhi';
```

### Update Specific Field
```javascript
// MongoDB
db.listing_drafts.updateOne(
  { draftId: '123' },
  { $set: { 'draftData.basicDetails.customPropertyName': 'New Name' } }
);

// PostgreSQL with JSONB
UPDATE listing_drafts 
SET draft_data = jsonb_set(
  draft_data, 
  '{basicDetails,customPropertyName}', 
  '"New Name"'
)
WHERE draft_id = '123';
```

## Monitoring & Logging

Add logging to track the new format:

```javascript
app.patch('/updateListingDraft', async (req, res) => {
  const { draftId, draftData } = req.body;
  
  // Log incoming data structure
  console.log('Received draft update:', {
    draftId,
    keys: Object.keys(draftData),
    hasBasicDetails: !!draftData.basicDetails,
    hasLocationSelection: !!draftData.locationSelection,
    format: draftData['basic-details'] ? 'old' : 'new'
  });
  
  // ... rest of logic
});
```

## Rollout Strategy

### Phase 1: Preparation (Day 1)
- Update backend code to accept propertySchema format
- Deploy with backward compatibility
- Monitor logs for incoming format

### Phase 2: Migration (Day 2-3)
- Frontend deploys new version
- Monitor error rates
- Verify data is saving correctly

### Phase 3: Cleanup (Week 2)
- Remove backward compatibility code
- Migrate old drafts to new format
- Update documentation

## Support

If you encounter issues:

1. **Check format**: Log `Object.keys(draftData)` to see structure
2. **Validate schema**: Use `propertySchema.safeParse()` to test
3. **Review mapping**: Check the mapping table above
4. **Contact frontend team**: They can help debug transformation issues

---

**Last Updated**: January 19, 2026
**Version**: 2.0 (PropertySchema Format)
