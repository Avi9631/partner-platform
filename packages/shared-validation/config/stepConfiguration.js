/**
 * Step Configuration - Declarative & Loosely Coupled
 * Backend-compatible version (no React components)
 * Each property type defines its own step flow for maximum flexibility
 * 
 * Architecture:
 * - Each property type has its own step array
 * - Steps are reusable
 * - Easy to add/remove/reorder steps per property type
 * - Special handling for hybrid types (e.g., farmhouse = land + building)
 */

// ============================================
// STEP DEFINITIONS (Reusable)
// ============================================

const STEPS = {
  PROPERTY_TYPE: {
    id: 'property-type',
    name: 'Property Type',
  },
  LOCATION_SELECTION: {
    id: 'location-selection',
    name: 'Location Selection',
  },
  BASIC_DETAILS: {
    id: 'basic-details',
    name: 'Basic Details',
  },
  BASIC_CONFIGURATION: {
    id: 'basic-configuration',
    name: 'Basic Configuration',
  },
  UNIT_AMENITIES: {
    id: 'unit-amenities',
    name: 'Unit Amenities',
  },
  LOCATION_ATTRIBUTES: {
    id: 'location-attributes',
    name: 'Location Attributes',
  },
  FLOOR_DETAILS: {
    id: 'floor-details',
    name: 'Floor Details',
  },
  LAND_ATTRIBUTES: {
    id: 'land-attributes',
    name: 'Land Attributes',
  },
  PRICING: {
    id: 'pricing',
    name: 'Pricing',
  },
  LISTING_INFO: {
    id: 'listing-info',
    name: 'Listing Info',
  },
  PROPERTY_AMENITIES: {
    id: 'property-amenities',
    name: 'Property Amenities',
  },
  MEDIA_UPLOAD: {
    id: 'media-upload',
    name: 'Media & Documents',
  },
  PARKING_UTILITIES: {
    id: 'parking-utilities',
    name: 'Parking & Utilities',
  },
  SUITABLE_FOR: {
    id: 'suitable-for',
    name: 'Suitable For',
  },
};

// ============================================
// PROPERTY TYPE CONFIGURATIONS
// Each property type defines its complete step flow
// ============================================

const PROPERTY_TYPE_STEPS = {
  // Residential Building Types
  apartment: [
    STEPS.PROPERTY_TYPE,
    STEPS.LOCATION_SELECTION,
    STEPS.BASIC_DETAILS,
    STEPS.BASIC_CONFIGURATION,
    STEPS.UNIT_AMENITIES,
    STEPS.LOCATION_ATTRIBUTES,
    STEPS.FLOOR_DETAILS, // Apartment-specific
    STEPS.PARKING_UTILITIES,
    STEPS.PRICING,
    STEPS.SUITABLE_FOR,
    STEPS.LISTING_INFO,
    STEPS.PROPERTY_AMENITIES,
    STEPS.MEDIA_UPLOAD,
  ],
  
  villa: [
    STEPS.PROPERTY_TYPE,
    STEPS.LOCATION_SELECTION,
    STEPS.BASIC_DETAILS,
    STEPS.BASIC_CONFIGURATION,
    STEPS.UNIT_AMENITIES,
    STEPS.LOCATION_ATTRIBUTES,
    STEPS.PARKING_UTILITIES,
    STEPS.PRICING,
    STEPS.SUITABLE_FOR,
    STEPS.LISTING_INFO,
    STEPS.PROPERTY_AMENITIES,
    STEPS.MEDIA_UPLOAD,
  ],
  
  duplex: [
    STEPS.PROPERTY_TYPE,
    STEPS.LOCATION_SELECTION,
    STEPS.BASIC_DETAILS,
    STEPS.BASIC_CONFIGURATION,
    STEPS.UNIT_AMENITIES,
    STEPS.LOCATION_ATTRIBUTES,
    STEPS.PARKING_UTILITIES,
    STEPS.PRICING,
    STEPS.SUITABLE_FOR,
    STEPS.LISTING_INFO,
    STEPS.PROPERTY_AMENITIES,
    STEPS.MEDIA_UPLOAD,
  ],
  
  independent_house: [
    STEPS.PROPERTY_TYPE,
    STEPS.LOCATION_SELECTION,
    STEPS.BASIC_DETAILS,
    STEPS.BASIC_CONFIGURATION,
    STEPS.UNIT_AMENITIES,
    STEPS.LOCATION_ATTRIBUTES,
    STEPS.PARKING_UTILITIES,
    STEPS.PRICING,
    STEPS.SUITABLE_FOR,
    STEPS.LISTING_INFO,
    STEPS.PROPERTY_AMENITIES,
    STEPS.MEDIA_UPLOAD,
  ],
  
  penthouse: [
    STEPS.PROPERTY_TYPE,
    STEPS.LOCATION_SELECTION,
    STEPS.BASIC_DETAILS,
    STEPS.BASIC_CONFIGURATION,
    STEPS.UNIT_AMENITIES,
    STEPS.LOCATION_ATTRIBUTES,
    STEPS.FLOOR_DETAILS, // Penthouse-specific
    STEPS.PARKING_UTILITIES,
    STEPS.PRICING,
    STEPS.SUITABLE_FOR,
    STEPS.LISTING_INFO,
    STEPS.PROPERTY_AMENITIES,
    STEPS.MEDIA_UPLOAD,
  ],
  
  independent_floor: [
    STEPS.PROPERTY_TYPE,
    STEPS.LOCATION_SELECTION,
    STEPS.BASIC_DETAILS,
    STEPS.BASIC_CONFIGURATION,
    STEPS.UNIT_AMENITIES,
    STEPS.LOCATION_ATTRIBUTES,
    STEPS.PARKING_UTILITIES,
    STEPS.PRICING,
    STEPS.SUITABLE_FOR,
    STEPS.LISTING_INFO,
    STEPS.PROPERTY_AMENITIES,
    STEPS.MEDIA_UPLOAD,
  ],
  
  // Hybrid Type - Farmhouse (Land + Building)
  farmhouse: [
    STEPS.PROPERTY_TYPE,
    STEPS.LOCATION_SELECTION,
    STEPS.BASIC_DETAILS,
    STEPS.LAND_ATTRIBUTES,    // Land/plot details first
    STEPS.BASIC_CONFIGURATION, // Then building details
    STEPS.UNIT_AMENITIES,
    STEPS.LOCATION_ATTRIBUTES,
    STEPS.PARKING_UTILITIES,
    STEPS.PRICING,
    STEPS.SUITABLE_FOR,
    STEPS.LISTING_INFO,
    STEPS.PROPERTY_AMENITIES,
    STEPS.MEDIA_UPLOAD,
  ],
  
  // Land/Plot Types
  residential_plot: [
    STEPS.PROPERTY_TYPE,
    STEPS.LOCATION_SELECTION,
    STEPS.BASIC_DETAILS,
    STEPS.LAND_ATTRIBUTES,
    STEPS.PRICING,
    STEPS.LISTING_INFO,
    STEPS.PROPERTY_AMENITIES,
    STEPS.MEDIA_UPLOAD,
  ],
  
  commercial_plot: [
    STEPS.PROPERTY_TYPE,
    STEPS.LOCATION_SELECTION,
    STEPS.BASIC_DETAILS,
    STEPS.LAND_ATTRIBUTES,
    STEPS.PRICING,
    STEPS.LISTING_INFO,
    STEPS.PROPERTY_AMENITIES,
    STEPS.MEDIA_UPLOAD,
  ],
  
  industrial_plot: [
    STEPS.PROPERTY_TYPE,
    STEPS.LOCATION_SELECTION,
    STEPS.BASIC_DETAILS,
    STEPS.LAND_ATTRIBUTES,
    STEPS.PRICING,
    STEPS.LISTING_INFO,
    STEPS.PROPERTY_AMENITIES,
    STEPS.MEDIA_UPLOAD,
  ],
  
  agricultural_land: [
    STEPS.PROPERTY_TYPE,
    STEPS.LOCATION_SELECTION,
    STEPS.BASIC_DETAILS,
    STEPS.LAND_ATTRIBUTES,
    STEPS.PRICING,
    STEPS.LISTING_INFO,
    STEPS.PROPERTY_AMENITIES,
    STEPS.MEDIA_UPLOAD,
  ],
};

// Default steps when no property type is selected
const DEFAULT_STEPS = [
  STEPS.PROPERTY_TYPE,
  STEPS.LOCATION_SELECTION,
  STEPS.BASIC_DETAILS,
];

// ============================================
// PUBLIC API
// ============================================

/**
 * Get steps based on property type
 * Returns the complete step flow for the given property type
 * 
 * @param {Object} formData - Form data containing propertyType
 * @returns {Array} Array of step configurations
 */
const getVisibleSteps = (formData = {}) => {
  const { propertyType } = formData;
  
  if (!propertyType) {
    return DEFAULT_STEPS;
  }
  
  // Get steps for this property type, or fallback to default
  const steps = PROPERTY_TYPE_STEPS[propertyType] || DEFAULT_STEPS;
  
  // Apply conditional filtering if needed
  return steps.filter(step => {
    // Add conditional logic here if any step has conditions
    if (step.condition) {
      return step.condition(formData);
    }
    return true;
  });
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get total number of visible steps
 */
const getTotalVisibleSteps = (formData = {}) => 
  getVisibleSteps(formData).length;

/**
 * Get step name by index
 */
const getStepName = (stepIndex, formData = {}) => 
  getVisibleSteps(formData)[stepIndex]?.name || '';

/**
 * Check if a step is visible in the current flow
 */
const isStepVisible = (stepId, formData = {}) => 
  getVisibleSteps(formData).some(step => step.id === stepId);

/**
 * Get step index by ID
 */
const getStepIndexById = (stepId, formData = {}) => 
  getVisibleSteps(formData).findIndex(step => step.id === stepId);

/**
 * Get all available property types
 */
const getAvailablePropertyTypes = () => 
  Object.keys(PROPERTY_TYPE_STEPS);

/**
 * Check if property type is a building type (has building-specific steps)
 */
const isBuildingType = (propertyType) => {
  const steps = PROPERTY_TYPE_STEPS[propertyType] || [];
  return steps.some(step => step.id === 'basic-configuration');
};

/**
 * Check if property type is a land type (has land-specific steps)
 */
const isLandType = (propertyType) => {
  const steps = PROPERTY_TYPE_STEPS[propertyType] || [];
  return steps.some(step => step.id === 'land-attributes');
};

/**
 * Check if property type is a hybrid type (has both building and land steps)
 */
const isHybridType = (propertyType) => {
  return isBuildingType(propertyType) && isLandType(propertyType);
};

/**
 * Get step IDs for a property type
 */
const getStepIds = (propertyType) => {
  const steps = PROPERTY_TYPE_STEPS[propertyType] || DEFAULT_STEPS;
  return steps.map(step => step.id);
};

// ============================================
// EXPORTS
// ============================================

export {
  STEPS,
  PROPERTY_TYPE_STEPS,
  getVisibleSteps,
  getTotalVisibleSteps,
  getStepName,
  isStepVisible,
  getStepIndexById,
  getAvailablePropertyTypes,
  isBuildingType,
  isLandType,
  isHybridType,
  getStepIds,
};

export default {
  STEPS,
  PROPERTY_TYPE_STEPS,
  getVisibleSteps,
  getTotalVisibleSteps,
  getStepName,
  isStepVisible,
  getStepIndexById,
  getAvailablePropertyTypes,
  isBuildingType,
  isLandType,
  isHybridType,
  getStepIds,
};
