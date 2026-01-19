# PropertyFormV2 - Simplified Architecture

## Overview

The PropertyFormV2 module has been simplified to use the `propertySchema` format directly when communicating with the API, eliminating the need for complex schema mapping and data transformations.

## Architecture Changes

### Before (Complex)
- ❌ Data stored in nested step format throughout the application
- ❌ Complex schema mapping trying to flatten/unflatten data
- ❌ API received step-based format
- ❌ Confusing data structure inconsistencies

### After (Simplified)
- ✅ UI uses step-based format for better UX: `{ 'basic-details': {...}, 'location-selection': {...} }`
- ✅ API receives propertySchema format: `{ basicDetails: {...}, locationSelection: {...} }`
- ✅ Clean transformation layer between UI and API
- ✅ Single source of truth: `propertySchema` from `@partner-platform/shared-validation`

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. UI Components (Steps)                                        │
│    - BasicDetailsStepV2.jsx                                     │
│    - LocationSelectionStepV2.jsx                                │
│    - etc.                                                       │
│                                                                 │
│    Collects data in step format:                               │
│    { 'basic-details': { customPropertyName: 'Villa' },         │
│      'location-selection': { coordinates: {...} }              │
│    }                                                           │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. PropertyFormContextV2                                        │
│    - Manages form state in step format                         │
│    - Validates using schemaMapping.js (step-level validation)  │
│    - Before saving: transforms to propertySchema format        │
│                                                                 │
│    Uses: propertySchemaTransformer.js                          │
│    transformToPropertySchema(stepData) →                       │
│    { basicDetails: {...}, locationSelection: {...} }           │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. API Layer (draftService.js)                                 │
│    updateListingDraft(draftId, propertySchemaData)             │
│                                                                 │
│    Sends: { basicDetails: {...}, locationSelection: {...} }    │
│    (propertySchema format)                                     │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. Backend API                                                  │
│    Receives propertySchema format                              │
│    Validates using propertySchema                              │
│    Stores in database                                          │
└─────────────────────────────────────────────────────────────────┘
```

## Key Files

### 1. `propertySchemaTransformer.js` (NEW)
The heart of the transformation layer. Provides:

- `transformToPropertySchema(stepData)` - Converts UI step format → API propertySchema format
- `transformFromPropertySchema(schemaData)` - Converts API format → UI step format
- `STEP_TO_SCHEMA_KEY_MAP` - Mapping between step IDs and propertySchema keys

**Example:**
```javascript
// Input (UI step format)
const stepData = {
  'basic-details': { customPropertyName: 'Luxury Villa' },
  'location-selection': { coordinates: { lat: 28.6139, lng: 77.2090 } }
};

// Output (propertySchema format)
const schemaData = {
  basicDetails: { customPropertyName: 'Luxury Villa' },
  locationSelection: { coordinates: { lat: 28.6139, lng: 77.2090 } }
};
```

### 2. `PropertyFormContextV2.jsx` (UPDATED)
- **`saveDraft()`** - Now transforms step data to propertySchema format before API call
- **`loadDraft()`** - Transforms propertySchema format back to step format for UI
- Still manages form state in step-based format for better UX

### 3. `schemaMapping.js` (DOCUMENTED)
- Still used for **step-level validation** in the UI
- Updated documentation explaining it's for validation only
- No longer handles data transformation (that's in propertySchemaTransformer.js)

### 4. `usePropertyPublish.js` (UPDATED)
- Transforms formData to propertySchema format before publishing
- Ensures published data matches the propertySchema structure

## Step ID to PropertySchema Key Mapping

| Step ID                | PropertySchema Key     |
|------------------------|------------------------|
| `property-type`        | `propertyType`         |
| `location-selection`   | `locationSelection`    |
| `basic-details`        | `basicDetails`         |
| `basic-configuration`  | `basicConfiguration`   |
| `unit-amenities`       | `unitAmenities`        |
| `location-attributes`  | `locationAttributes`   |
| `floor-details`        | `floorDetails`         |
| `land-attributes`      | `landAttributes`       |
| `area-details`         | `areaDetails`          |
| `pricing`              | `pricingInformation`   |
| `suitable-for`         | `suitableFor`          |
| `listing-info`         | `listingInformation`   |
| `property-amenities`   | `propertyAmenities`    |
| `media-upload`         | `mediaUpload`          |
| `parking`              | `parkingUtilities`     |
| `documents`            | `documents`            |
| `geo-tag`              | `geoTag`               |

## Benefits of This Approach

### 1. **Single Source of Truth**
- PropertySchema from `shared-validation` package is the authoritative structure
- No duplication or inconsistency between frontend and backend

### 2. **Clean Separation of Concerns**
- **UI Layer**: Uses step-based format for better UX
- **API Layer**: Uses propertySchema format for consistency
- **Transform Layer**: Clean transformation between the two

### 3. **Easier Maintenance**
- Adding new steps: Just add mapping in `STEP_TO_SCHEMA_KEY_MAP`
- Changing schema: Update in one place (`shared-validation`)
- Clear data flow path

### 4. **Better Validation**
- Step-level validation for immediate user feedback
- Full propertySchema validation when saving/publishing
- Type-safe with Zod schemas

## Usage Examples

### Adding a New Step

1. **Create the step component** (e.g., `NewStepV2.jsx`)
2. **Add schema** to `shared-validation/schemas/property/`
3. **Add mapping** in `propertySchemaTransformer.js`:
   ```javascript
   export const STEP_TO_SCHEMA_KEY_MAP = {
     // ... existing mappings
     'new-step': 'newStep',
   };
   ```
4. **Add to step configuration** in `stepConfiguration.js`

That's it! The transformation layer handles the rest automatically.

### Debugging Data Flow

Use the console logs to trace data transformation:
```javascript
// In PropertyFormContextV2.jsx
console.log('💾 Saving draft with propertySchema format:', propertySchemaData);

// In propertySchemaTransformer.js
console.log('🔄 Transformed to propertySchema format:', propertySchemaData);
console.log('🔄 Transformed from propertySchema format:', stepBasedData);
```

## Migration Notes

### For Existing Code
- ✅ All step components continue to work as-is (no changes needed)
- ✅ Form validation continues to work the same way
- ✅ Only the API layer sees the new propertySchema format

### For Backend
- ✅ Now receives data in propertySchema format: `{ basicDetails: {...}, locationSelection: {...} }`
- ✅ Can directly validate using propertySchema from shared-validation
- ✅ No need to handle step-based format anymore

## Testing

### Testing the Transformation

```javascript
import { transformToPropertySchema, transformFromPropertySchema } from './utils/propertySchemaTransformer';

// Test forward transformation
const stepData = {
  'basic-details': { customPropertyName: 'Test Property' },
  'location-selection': { coordinates: { lat: 28.6139, lng: 77.2090 } }
};
const schemaData = transformToPropertySchema(stepData);
// schemaData = { basicDetails: {...}, locationSelection: {...} }

// Test reverse transformation
const backToStepData = transformFromPropertySchema(schemaData);
// Should match original stepData
```

### Integration Testing

1. Create a new property draft
2. Fill in step data
3. Save draft → Check API request payload (should be propertySchema format)
4. Load draft → Check UI state (should be step format)
5. Publish property → Check API request payload (should be propertySchema format)

## Future Improvements

1. **Type Safety**: Add TypeScript types for better type checking
2. **Validation**: Add propertySchema validation before API calls
3. **Caching**: Cache transformed data to avoid redundant transformations
4. **Error Handling**: Better error messages when transformation fails

## Questions?

- **Q: Why keep step-based format in UI?**
  - A: Better UX - each step only sees its own data, cleaner component props

- **Q: Why not use propertySchema everywhere?**
  - A: Step-based format makes it easier to track which step owns which data

- **Q: What if I need to add a new field?**
  - A: Add to the appropriate schema in `shared-validation`, mapping is automatic

- **Q: How do I debug transformation issues?**
  - A: Check console logs with 🔄 prefix, they show before/after transformation
