# Property Publishing API - Quick Reference

## Endpoint
```
POST /api/property/publishProperty
```

## Request
```json
{
  "draftId": 123
}
```

## Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

## Response Codes

| Code | Status | Description |
|------|--------|-------------|
| 202 | Accepted | Property publishing workflow started |
| 400 | Bad Request | Validation failed or missing data |
| 404 | Not Found | Draft not found or unauthorized |
| 500 | Server Error | Unexpected error |

## Success Response (202)
```json
{
  "success": true,
  "message": "Property is being processed...",
  "data": {
    "workflowId": "property-publish-...",
    "draftId": 123,
    "isUpdate": false,
    "executionMode": "direct",
    "propertyPreview": {
      "name": "Property Name",
      "type": "residential_plot",
      "city": "New Delhi",
      "locality": "Sansad Marg Area"
    }
  }
}
```

## Error Response - Validation Failed (400)
```json
{
  "success": false,
  "message": "Property data validation failed...",
  "error": {
    "validationErrors": {
      "<step-id>": {
        "stepName": "Human Readable Name",
        "errors": [
          {
            "field": "field.path",
            "message": "Error message",
            "code": "error_code",
            "path": ["field", "path"]
          }
        ]
      }
    },
    "summary": {
      "completedSteps": 6,
      "totalSteps": 8,
      "completenessPercentage": 75,
      "missingSteps": ["media-upload"],
      "completedStepIds": ["property-type", "location-selection", ...],
      "isValid": false,
      "hasAllRequiredSteps": false
    },
    "invalidSteps": ["pricing", "location-selection"],
    "totalErrors": 3
  }
}
```

## Required Steps (All Property Types)
- ✅ `property-type` - Property type selection
- ✅ `location-selection` - Location and address
- ✅ `basic-details` - Basic property details
- ✅ `pricing` - Pricing information
- ✅ `media-upload` - Photos/videos (min 1 image)

## Conditional Steps (Based on Property Type)
- `basic-configuration` - For apartments, villas
- `unit-amenities` - For apartments, villas
- `location-attributes` - For specific property types
- `floor-details` - For multi-floor properties
- `land-attributes` - For plots, farmhouses
- `parking-utilities` - For apartments, villas
- `suitable-for` - Optional for all types
- `listing-info` - Optional title/description
- `property-amenities` - Optional features

## Validation Steps

### Step 1: Draft ID
- Must be provided in request
- Must exist in database
- Must belong to authenticated user
- Must be of type 'PROPERTY'

### Step 2: Property Type
- Must be present in draft data
- Determines which steps are required

### Step 3: Schema Validation
- Each step validated against Zod schema
- Field-level validation
- Type checking
- Required fields check
- Format validation

### Step 4: Required Steps Check
- Ensures all required steps present
- Returns missing step IDs

## Common Validation Errors

### Missing Coordinates
```json
{
  "field": "coordinates",
  "message": "Coordinates are required",
  "code": "invalid_type"
}
```
**Fix**: Ensure location-selection has valid coordinates object with lat/lng

### Invalid Price
```json
{
  "field": "pricing.0.value",
  "message": "Value must be a positive number",
  "code": "custom"
}
```
**Fix**: Ensure price value is a positive number (as string)

### Missing Media
```json
{
  "field": "mediaData",
  "message": "At least 1 file is required",
  "code": "too_small"
}
```
**Fix**: Upload at least one image with valid URL

### Invalid Enum
```json
{
  "field": "listingType",
  "message": "Please select a valid listing type",
  "code": "invalid_enum_value"
}
```
**Fix**: Use one of: 'sale', 'rent', 'lease', 'pg'

## Testing

### Using cURL
```bash
curl -X POST http://localhost:3000/api/property/publishProperty \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"draftId": 123}'
```

### Using Test Script
```bash
cd packages/backend
node src/utils/test-draft-validation.js
```

## Sample Valid Draft Data (Residential Plot)
```json
{
  "property-type": {
    "propertyType": "residential_plot"
  },
  "location-selection": {
    "city": "New Delhi",
    "locality": "Sansad Marg Area",
    "addressText": "6, Windsor Pl, Sansad Marg Area, New Delhi, Delhi 110001, India",
    "coordinates": {
      "lat": 28.61974683520525,
      "lng": 77.21788347625734
    },
    "showMapExact": false,
    "nearbyLandmarks": []
  },
  "basic-details": {
    "reraIds": [{"id": "RERA125VFUJH"}],
    "listingType": "sale",
    "projectName": "",
    "ageOfProperty": "5",
    "availableFrom": "",
    "isNewProperty": true,
    "ownershipType": "freehold",
    "possessionDate": "",
    "possessionStatus": "ready",
    "customPropertyName": "",
    "hasOccupancyCertificate": false,
    "hasCompletionCertificate": false
  },
  "land-attributes": {
    "fencing": false,
    "areaUnit": "sqft",
    "plotArea": "8000",
    "soilType": "clay",
    "roadWidth": "30",
    "terrainLevel": "elevated",
    "plotDimension": "80*100",
    "irrigationSource": ""
  },
  "pricing": {
    "pricing": [
      {
        "type": "asking_price",
        "unit": "total",
        "value": "8000000"
      }
    ],
    "isPriceVerified": false,
    "isPriceNegotiable": false,
    "maintenanceIncludes": []
  },
  "listing-info": {
    "title": "PLOT AT PREMIUM LOCA",
    "description": "Premium residential plot with excellent connectivity"
  },
  "media-upload": {
    "mediaData": [
      {
        "url": "https://example.com/image.jpg",
        "docType": "media",
        "fileSize": 196091
      }
    ]
  },
  "property-amenities": {
    "features": ["fire_safety", "garden"]
  }
}
```

## Tips

1. **Use Frontend Validation**: Validate before submitting to catch errors early
2. **Save Drafts Frequently**: Prevent data loss during form completion
3. **Show Progress**: Display completeness percentage to users
4. **Highlight Errors**: Show which steps have validation errors
5. **Field-level Validation**: Validate individual fields on blur/change
6. **Clear Error Messages**: Display user-friendly error messages from API

## Property Types Supported

- `apartment` / `flat`
- `independent_house` / `villa`
- `residential_plot`
- `commercial_office`
- `commercial_shop`
- `commercial_plot`
- `agricultural_land`
- `farmhouse`
- `warehouse`
- `industrial_land`
- `industrial_building`

Each type has specific required and optional steps.

## Support

For schema details, see:
- `packages/shared-validation/schemas/property/` - Schema definitions
- `packages/backend/src/utils/propertyDraftValidator.js` - Validation logic
- `packages/backend/src/controller/PROPERTY_VALIDATION_API.md` - Full API docs
