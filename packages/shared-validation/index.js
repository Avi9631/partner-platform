/**
 * Shared Validation Schemas Index
 * 
 * Exports all property validation schemas for use in frontend and backend
 */

const schemas = {
  basicDetailsSchema: require('./schemas/basicDetailsSchema'),
  locationSelectionSchema: require('./schemas/locationSelectionSchema'),
  basicConfigurationSchema: require('./schemas/basicConfigurationSchema'),
  unitAmenitiesSchema: require('./schemas/unitAmenitiesSchema'),
  locationAttributesSchema: require('./schemas/locationAttributesSchema'),
  floorDetailsSchema: require('./schemas/floorDetailsSchema'),
  landAttributesSchema: require('./schemas/landAttributesSchema'),
  pricingInformationSchema: require('./schemas/pricingInformationSchema'),
  listingInformationSchema: require('./schemas/listingInformationSchema'),
  propertyAmenitiesSchema: require('./schemas/propertyAmenitiesSchema'),
  mediaUploadSchema: require('./schemas/mediaUploadSchema'),
  parkingUtilitiesSchema: require('./schemas/parkingUtilitiesSchema'),
  suitableForSchema: require('./schemas/suitableForSchema'),
};

// Export stepConfiguration (will be added next)
const stepConfig = require('./config/stepConfiguration');

module.exports = {
  schemas,
  stepConfig,
};
