# Property Publishing API - Enhanced Validation

## Overview
The `publishProperty` API endpoint has been enhanced with comprehensive schema-based validation. Each step of the draft data is validated against its corresponding Zod schema from the `@partner-platform/shared-validation` package.

## Endpoint
```
POST /api/property/publishProperty
```

## Request Body
```json
{
  "draftId": 123
}
```

## Validation Flow

### 1. Draft Existence Check
Verifies that the draft exists and belongs to the authenticated user.

### 2. Property Type Validation
Ensures the draft has a valid `property-type` field.

### 3. Schema-Based Step Validation
Each step in the draft data is validated against its schema:

| Step ID | Schema | Required |
|---------|--------|----------|
| `property-type` | N/A (enum selection) | ✅ Yes |
| `location-selection` | locationSelectionSchema | ✅ Yes |
| `basic-details` | basicDetailsSchema | ✅ Yes |
| `basic-configuration` | basicConfigurationSchema | Conditional |
| `unit-amenities` | unitAmenitiesSchema | Conditional |
| `location-attributes` | locationAttributesSchema | Conditional |
| `floor-details` | floorDetailsSchema | Conditional |
| `land-attributes` | landAttributesSchema | Conditional |
| `parking-utilities` | parkingUtilitiesSchema | Conditional |
| `pricing` | pricingInformationSchema | ✅ Yes |
| `suitable-for` | suitableForSchema | Conditional |
| `listing-info` | listingInformationSchema | Conditional |
| `property-amenities` | propertyAmenitiesSchema | Conditional |
| `media-upload` | mediaUploadSchema | ✅ Yes |

**Note:** Required steps vary by property type (apartment, villa, plot, etc.)

## Success Response (202 Accepted)

```json
{
  "success": true,
  "message": "Property is being processed. You will be notified once complete.",
  "data": {
    "workflowId": "property-publish-456-123-1737200000000",
    "draftId": 123,
    "isUpdate": false,
    "executionMode": "direct",
    "propertyPreview": {
      "name": "PLOT AT PREMIUM LOCA",
      "type": "residential_plot",
      "city": "New Delhi",
      "locality": "Sansad Marg Area"
    },
    "message": "Property publishing workflow started successfully"
  }
}
```

## Validation Error Response (400 Bad Request)

```json
{
  "success": false,
  "message": "Property data validation failed. Please complete all required fields and fix the validation errors.",
  "error": {
    "validationErrors": {
      "pricing": {
        "stepName": "Pricing Information",
        "errors": [
          {
            "field": "pricing.0.value",
            "message": "Value must be a positive number",
            "code": "custom",
            "path": ["pricing", 0, "value"]
          }
        ]
      },
      "location-selection": {
        "stepName": "Location Selection",
        "errors": [
          {
            "field": "coordinates.lat",
            "message": "Latitude is required",
            "code": "invalid_type",
            "path": ["coordinates", "lat"]
          }
        ]
      }
    },
    "summary": {
      "completedSteps": 6,
      "totalSteps": 8,
      "completenessPercentage": 75,
      "missingSteps": ["media-upload", "listing-info"],
      "completedStepIds": [
        "property-type",
        "location-selection",
        "basic-details",
        "land-attributes",
        "pricing",
        "property-amenities"
      ],
      "isValid": false,
      "hasAllRequiredSteps": false
    },
    "invalidSteps": ["pricing", "location-selection"],
    "totalErrors": 2
  }
}
```

## Error Response Fields

### `validationErrors`
Object containing validation errors grouped by step ID. Each step includes:
- `stepName`: Human-readable step name
- `errors`: Array of error objects with:
  - `field`: The field path that failed validation
  - `message`: Human-readable error message
  - `code`: Zod error code (e.g., "invalid_type", "custom", "too_small")
  - `path`: Array representing the field path

### `summary`
Validation completeness summary:
- `completedSteps`: Number of steps with data
- `totalSteps`: Total expected steps for this property type
- `completenessPercentage`: Completion percentage (0-100)
- `missingSteps`: Array of required step IDs that are missing
- `completedStepIds`: Array of step IDs that have data
- `isValid`: Whether all validations passed
- `hasAllRequiredSteps`: Whether all required steps are present

### `invalidSteps`
Array of step IDs that have validation errors.

### `totalErrors`
Total count of validation errors across all steps.

## Example Sample Draft Data

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
    "listingType": "sale",
    "ownershipType": "freehold",
    "possessionStatus": "ready",
    "ageOfProperty": "5",
    "isNewProperty": true,
    "hasOccupancyCertificate": false,
    "hasCompletionCertificate": false,
    "reraIds": [{ "id": "RERA125VFUJH" }]
  },
  "land-attributes": {
    "plotArea": "8000",
    "areaUnit": "sqft",
    "plotDimension": "80*100",
    "roadWidth": "30",
    "fencing": false,
    "terrainLevel": "elevated",
    "soilType": "clay"
  },
  "pricing": {
    "pricing": [
      {
        "type": "asking_price",
        "unit": "total",
        "value": "8000000"
      }
    ],
    "isPriceNegotiable": false,
    "isPriceVerified": false,
    "maintenanceIncludes": []
  },
  "listing-info": {
    "title": "PLOT AT PREMIUM LOCA",
    "description": "Premium residential plot with excellent connectivity"
  },
  "property-amenities": {
    "features": ["fire_safety", "garden"]
  },
  "media-upload": {
    "mediaData": [
      {
        "url": "https://example.com/image.jpg",
        "docType": "media",
        "fileSize": 196091
      }
    ]
  }
}
```

## Testing the Validation

Use the test script to validate draft data:

```bash
node src/utils/test-draft-validation.js
```

This will validate the sample draft data and display:
- Validation result (pass/fail)
- Detailed errors by step
- Validation summary with completeness metrics
- Missing required steps

## Common Validation Errors

### 1. Missing Required Fields
```json
{
  "field": "coordinates",
  "message": "Coordinates are required",
  "code": "invalid_type"
}
```

### 2. Invalid Format
```json
{
  "field": "pricing.0.value",
  "message": "Value must be a positive number",
  "code": "custom"
}
```

### 3. Minimum Array Length
```json
{
  "field": "mediaData",
  "message": "At least 1 file is required",
  "code": "too_small"
}
```

### 4. Invalid Enum Value
```json
{
  "field": "listingType",
  "message": "Please select a valid listing type",
  "code": "invalid_enum_value"
}
```

## Best Practices

1. **Frontend Validation**: Use the same schemas on the frontend to catch errors early
2. **Progressive Validation**: Validate each step as the user completes it
3. **Error Display**: Show field-level errors inline with the form fields
4. **Step Navigation**: Highlight invalid steps in the progress indicator
5. **Batch Updates**: Save draft data frequently to prevent data loss

## Schema Updates

All schemas are centralized in `@partner-platform/shared-validation/schemas/property/`.

To update validation rules:
1. Modify the schema in the shared-validation package
2. The changes automatically apply to both frontend and backend
3. No need to update the controller code

## Property Type Support

The validation automatically adapts to the property type:
- `apartment` / `flat`
- `independent_house` / `villa`
- `residential_plot`
- `commercial_office`
- `commercial_shop`
- `commercial_plot`
- `agricultural_land`
- `farmhouse`
- And more...

Each property type has a specific set of required and optional steps defined in `stepConfig`.
