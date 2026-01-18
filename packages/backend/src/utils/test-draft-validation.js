/**
 * Test script to validate sample draft data against schemas
 * Run with: node src/utils/test-draft-validation.js
 */

import { validateDraftData, getValidationSummary } from './propertyDraftValidator.js';

// Sample draft data from the user
const sampleDraftData = {
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
    "description": "PLOT AT PREMIUM LOCAPLOT AT PREMIUM LOCAPLOT AT PREMIUM LOCAPLOT AT PREMIUM LOCAPLOT AT PREMIUM LOCAPLOT AT PREMIUM LOCAPLOT AT PREMIUM LOCAPLOT AT PREMIUM LOCAPLOT AT PREMIUM LOCAPLOT AT PREMIUM LOCAPLOT AT PREMIUM LOCAPLOT AT PREMIUM LOCAPLOT AT PREMIUM LOCA"
  },
  "media-upload": {
    "mediaData": [
      {
        "url": "https://fxleyozwnwxfzpvvjwwn.storage.supabase.co/storage/v1/s3/listing-buckets/listing-drafts/images/1768630737897_23d00fdf-b36f-4667-ad44-1adba8880777.jpg",
        "docType": "media",
        "fileSize": 196091
      }
    ]
  },
  "basic-details": {
    "reraIds": [
      {
        "id": "RERA125VFUJH"
      }
    ],
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
  "property-type": {
    "propertyType": "residential_plot"
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
  "location-selection": {
    "city": "New Delhi",
    "landmark": "",
    "locality": "Sansad Marg Area",
    "addressText": "6, Windsor Pl, Sansad Marg Area, New Delhi, Delhi 110001, India",
    "coordinates": {
      "lat": 28.61974683520525,
      "lng": 77.21788347625734
    },
    "showMapExact": false,
    "nearbyLandmarks": []
  },
  "property-amenities": {
    "features": [
      "fire_safety",
      "garden"
    ]
  }
};

const propertyType = 'residential_plot';

console.log('='.repeat(80));
console.log('Testing Draft Data Validation');
console.log('='.repeat(80));
console.log('\nProperty Type:', propertyType);
console.log('\nSteps present in draft data:');
console.log(Object.keys(sampleDraftData).join(', '));
console.log('\n' + '='.repeat(80));

// Run validation
const validationResult = validateDraftData(sampleDraftData, propertyType);

console.log('\n📋 Validation Result:');
console.log('Valid:', validationResult.valid);

if (!validationResult.valid) {
  console.log('\n❌ Validation Errors:');
  for (const [stepId, errors] of Object.entries(validationResult.errors)) {
    console.log(`\n  Step: ${stepId}`);
    errors.forEach((error, index) => {
      console.log(`    ${index + 1}. Field: ${error.field}`);
      console.log(`       Message: ${error.message}`);
      console.log(`       Code: ${error.code}`);
    });
  }
} else {
  console.log('✅ All validation checks passed!');
}

// Get validation summary
console.log('\n' + '='.repeat(80));
console.log('📊 Validation Summary:');
console.log('='.repeat(80));

const summary = getValidationSummary(sampleDraftData, propertyType);
console.log('\nTotal Steps:', summary.totalSteps);
console.log('Completed Steps:', summary.completedSteps);
console.log('Completeness:', `${summary.completenessPercentage}%`);
console.log('Is Valid:', summary.isValid);
console.log('Has All Required Steps:', summary.hasAllRequiredSteps);

if (summary.missingSteps.length > 0) {
  console.log('\n⚠️  Missing Required Steps:');
  summary.missingSteps.forEach(step => console.log(`  - ${step}`));
}

console.log('\n✓ Completed Steps:');
summary.completedStepIds.forEach(step => console.log(`  - ${step}`));

if (Object.keys(summary.validationErrors).length > 0) {
  console.log('\n❌ Steps with Validation Errors:');
  console.log(Object.keys(summary.validationErrors).join(', '));
}

console.log('\n' + '='.repeat(80));
console.log('Test Complete');
console.log('='.repeat(80));
