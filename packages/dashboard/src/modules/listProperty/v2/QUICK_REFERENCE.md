# PropertySchema Quick Reference

## 🎯 Quick Facts

- **UI Format**: Step-based (`'basic-details'`, `'location-selection'`)
- **API Format**: PropertySchema (`basicDetails`, `locationSelection`)
- **Transformation**: Automatic (handled by `propertySchemaTransformer.js`)
- **Validation**: Per-step in UI, full schema at API

## 📋 Step to PropertySchema Mapping

| Step ID | PropertySchema Key | Example Data |
|---------|-------------------|--------------|
| `property-type` | `propertyType` | `"apartment"` |
| `basic-details` | `basicDetails` | `{ customPropertyName: "Villa" }` |
| `basic-configuration` | `basicConfiguration` | `{ bhkType: "3BHK" }` |
| `location-selection` | `locationSelection` | `{ coordinates: {...}, city: "Delhi" }` |
| `location-attributes` | `locationAttributes` | `{ nearbyPlaces: [...] }` |
| `area-details` | `areaDetails` | `{ carpetArea: 1200 }` |
| `floor-details` | `floorDetails` | `{ floorNumber: 3 }` |
| `land-attributes` | `landAttributes` | `{ plotArea: 2000 }` |
| `pricing` | `pricingInformation` | `{ expectedPrice: 5000000 }` |
| `unit-amenities` | `unitAmenities` | `{ amenities: ["AC", "WiFi"] }` |
| `property-amenities` | `propertyAmenities` | `{ amenities: ["Gym", "Pool"] }` |
| `parking` | `parkingUtilities` | `{ parking: { covered: 2 } }` |
| `suitable-for` | `suitableFor` | `{ tenantTypes: ["Family"] }` |
| `listing-info` | `listingInformation` | `{ title: "Luxury Villa" }` |
| `media-upload` | `mediaUpload` | `{ images: [...] }` |
| `documents` | `documents` | `{ docs: [...] }` |
| `geo-tag` | `geoTag` | `{ ... }` |

## 🔄 Common Transformations

### UI → API (Saving Draft)
```javascript
// In UI (step format)
const formData = {
  'basic-details': { customPropertyName: 'Villa' },
  'location-selection': { city: 'Delhi' }
};

// Automatically transformed to API format
const apiPayload = {
  basicDetails: { customPropertyName: 'Villa' },
  locationSelection: { city: 'Delhi' }
};
```

### API → UI (Loading Draft)
```javascript
// From API (propertySchema format)
const draftData = {
  basicDetails: { customPropertyName: 'Villa' },
  locationSelection: { city: 'Delhi' }
};

// Automatically transformed to UI format
const formData = {
  'basic-details': { customPropertyName: 'Villa' },
  'location-selection': { city: 'Delhi' }
};
```

## 🛠️ Key Functions

### `transformToPropertySchema(stepData)`
Converts UI step format → API propertySchema format

```javascript
import { transformToPropertySchema } from './utils/propertySchemaTransformer';

const apiData = transformToPropertySchema({
  'basic-details': { customPropertyName: 'Test' }
});
// Result: { basicDetails: { customPropertyName: 'Test' } }
```

### `transformFromPropertySchema(schemaData)`
Converts API propertySchema format → UI step format

```javascript
import { transformFromPropertySchema } from './utils/propertySchemaTransformer';

const uiData = transformFromPropertySchema({
  basicDetails: { customPropertyName: 'Test' }
});
// Result: { 'basic-details': { customPropertyName: 'Test' } }
```

## 📁 Key Files

| File | Purpose |
|------|---------|
| `propertySchemaTransformer.js` | Core transformation logic |
| `PropertyFormContextV2.jsx` | Uses transformer in `saveDraft()` and `loadDraft()` |
| `usePropertyPublish.js` | Transforms before publishing |
| `schemaMapping.js` | Step-level validation (no transformation) |

## 🐛 Debugging

### Console Logs to Look For
```
🔄 Transformed to propertySchema format: { ... }
🔄 Transformed from propertySchema format: { ... }
💾 Saving draft with propertySchema format: { ... }
```

### Check Transformation
```javascript
// Add to any component
console.log('Current form data:', formData);
console.log('Transformed:', transformToPropertySchema(formData));
```

### Validate Structure
```javascript
import { isValidPropertySchemaStructure } from './utils/propertySchemaTransformer';

const isValid = isValidPropertySchemaStructure(data);
console.log('Is valid propertySchema?', isValid);
```

## ✅ Checklist for Adding New Step

- [ ] Create step component (e.g., `NewStepV2.jsx`)
- [ ] Add schema to `shared-validation/schemas/property/`
- [ ] Add mapping to `STEP_TO_SCHEMA_KEY_MAP` in `propertySchemaTransformer.js`
- [ ] Add to `stepConfiguration.js`
- [ ] Test transformation works correctly

## 🚨 Common Mistakes

### ❌ Wrong: Using step ID in API
```javascript
// This will NOT work
const data = apiData['basic-details'];
```

### ✅ Correct: Using propertySchema key in API
```javascript
// This will work
const data = apiData.basicDetails;
```

### ❌ Wrong: Using propertySchema key in UI component
```javascript
// In BasicDetailsStepV2.jsx
const stepData = getStepData('basicDetails'); // Wrong!
```

### ✅ Correct: Using step ID in UI component
```javascript
// In BasicDetailsStepV2.jsx
const stepData = getStepData('basic-details'); // Correct!
```

## 📖 Full Documentation

- **Architecture**: See [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Changes**: See [CHANGES_SUMMARY.md](./CHANGES_SUMMARY.md)
- **Backend Guide**: See [BACKEND_MIGRATION_GUIDE.md](./BACKEND_MIGRATION_GUIDE.md)
- **Examples**: See [propertySchemaTransformer.examples.js](./utils/propertySchemaTransformer.examples.js)

## 🔗 Related Schemas

All schemas from `@partner-platform/shared-validation`:
- `propertySchema` - Complete property schema
- `basicDetailsSchema` - Basic details validation
- `locationSelectionSchema` - Location validation
- `pricingInformationSchema` - Pricing validation
- ... and more (see `shared-validation/schemas/property/`)

## 💡 Pro Tips

1. **Always use `getStepData(stepId)` in UI components** - it handles the nested structure
2. **Never manually transform data** - use the transformer functions
3. **Check console logs** - transformation logs help debug issues
4. **Use the mapping table** - when in doubt, check the reference
5. **Test round-trip** - data should survive transform → save → load → transform

---

**Need Help?** Check the full [ARCHITECTURE.md](./ARCHITECTURE.md) documentation.
