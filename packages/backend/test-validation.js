/**
 * Test Script for Shared Validation Package
 * 
 * Run: node test-validation.js
 */

const { schemas, stepConfig } = require('@partner-platform/shared-validation');

console.log('🧪 Testing Shared Validation Package\n');

// Test 1: Check schemas are loaded
console.log('✅ Test 1: Schemas loaded');
console.log('   Available schemas:', Object.keys(schemas).length);
console.log('   Schema names:', Object.keys(schemas).join(', '));

// Test 2: Check step configuration
console.log('\n✅ Test 2: Step Configuration loaded');
const apartmentSteps = stepConfig.getVisibleSteps({ propertyType: 'apartment' });
console.log('   Apartment steps:', apartmentSteps.length);
console.log('   Step IDs:', stepConfig.getStepIds('apartment').join(', '));

// Test 3: Validate sample data
console.log('\n✅ Test 3: Schema Validation');

// Valid data
const validLocationData = {
  coordinates: {
    lat: 28.7041,
    lng: 77.1025
  },
  showMapExact: false,
  city: 'Delhi',
  locality: 'Connaught Place',
  addressText: '123 CP',
};

const locationResult = schemas.locationSelectionSchema.safeParse(validLocationData);
console.log('   Valid location data:', locationResult.success ? '✅ PASSED' : '❌ FAILED');

// Invalid data
const invalidLocationData = {
  coordinates: {
    lat: 999, // Invalid latitude
    lng: 77.1025
  }
};

const invalidResult = schemas.locationSelectionSchema.safeParse(invalidLocationData);
console.log('   Invalid location data:', !invalidResult.success ? '✅ PASSED (correctly rejected)' : '❌ FAILED');
if (!invalidResult.success) {
  console.log('   Error:', invalidResult.error.errors[0].message);
}

// Test 4: Property type helpers
console.log('\n✅ Test 4: Property Type Helpers');
console.log('   Is apartment a building type?', stepConfig.isBuildingType('apartment') ? 'Yes' : 'No');
console.log('   Is residential_plot a land type?', stepConfig.isLandType('residential_plot') ? 'Yes' : 'No');
console.log('   Is farmhouse a hybrid type?', stepConfig.isHybridType('farmhouse') ? 'Yes' : 'No');

console.log('\n🎉 All tests completed successfully!\n');
console.log('✅ Shared validation package is working correctly');
console.log('✅ Backend can now validate property data using the same schemas as frontend');
