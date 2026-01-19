/**
 * Schema Mapping Utility
 * Maps step IDs to their corresponding validation schemas
 * 
 * SIMPLIFIED ARCHITECTURE:
 * - Step IDs now match propertySchema keys directly (e.g., 'basicDetails', 'locationSelection')
 * - FormData structure matches propertySchema - NO TRANSFORMATION NEEDED
 * - Data sent to API is the same as formData structure
 * 
 * Data Flow (SIMPLIFIED):
 * 1. UI collects data: { basicDetails: {...}, locationSelection: {...} }
 * 2. This file validates each step using individual schemas
 * 3. Same data sent directly to API - matches propertySchema format
 */

import { propertySchemas } from '@partner-platform/shared-validation';

const {
  basicDetailsSchema,
  basicConfigurationSchema,
  unitAmenitiesSchema,
  locationSelectionSchema,
  locationAttributesSchema,
  floorDetailsSchema,
  landAttributesSchema,
  pricingInformationSchema,
  suitableForSchema,
  listingInformationSchema,
  propertyAmenitiesSchema,
  mediaUploadSchema,
} = propertySchemas;

/**
 * Map of step IDs to their validation schemas
 * Step IDs match propertySchema keys - NO TRANSFORMATION NEEDED
 */
export const STEP_SCHEMA_MAP = {
  'locationSelection': locationSelectionSchema,
  'basicDetails': basicDetailsSchema,
  'basicConfiguration': basicConfigurationSchema,
  'unitAmenities': unitAmenitiesSchema,
  'locationAttributes': locationAttributesSchema,
  'floorDetails': floorDetailsSchema,
  'landAttributes': landAttributesSchema,
  'pricingInformation': pricingInformationSchema,
  'suitableFor': suitableForSchema,
  'listingInformation': listingInformationSchema,
  'propertyAmenities': propertyAmenitiesSchema,
  'mediaUpload': mediaUploadSchema,
  // 'propertyType' doesn't need validation as it's just a selection
};

/**
 * Validate form data against a specific step's schema
 * @param {string} stepId - The step ID (matches propertySchema key, e.g., 'basicDetails')
 * @param {Object} formData - The form data to validate
 * @returns {{ success: boolean, errors?: Object }} Validation result
 */
export const validateStep = (stepId, formData) => {
  const schema = STEP_SCHEMA_MAP[stepId];
  
  // If no schema exists for this step, consider it valid
  if (!schema) {
    return { success: true };
  }
  
  // Get step data directly (formData structure matches propertySchema)
  const stepData = formData[stepId] || {};
  
  // Debug logging for locationSelection step
  if (stepId === 'locationSelection') {
    console.log('🔍 Validating locationSelection step');
    console.log('  Step data:', stepData);
    console.log('  Coordinates:', stepData.coordinates);
  }
  
  try {
    schema.parse(stepData);
    return { success: true };
  } catch (error) {
    // Additional debug for locationSelection validation failures
    if (stepId === 'locationSelection') {
      console.error('❌ Location validation failed:', error.errors || error.issues);
    }
    return { 
      success: false, 
      errors: error.errors || error.issues || []
    };
  }
};

/**
 * Validate all visible steps
 * @param {Array} visibleSteps - Array of visible step configurations
 * @param {Object} formData - The complete form data
 * @returns {{ allValid: boolean, invalidSteps: Array, validationResults: Object }} Validation summary
 */
export const validateAllSteps = (visibleSteps, formData) => {
  const validationResults = {};
  const invalidSteps = [];
  
  visibleSteps.forEach((step, index) => {
    const result = validateStep(step.id, formData);
    validationResults[step.id] = result;
    
    if (!result.success) {
      invalidSteps.push({
        id: step.id,
        name: step.name,
        index,
        errors: result.errors
      });
    }
  });
  
  return {
    allValid: invalidSteps.length === 0,
    invalidSteps,
    validationResults
  };
};

/**
 * Check if a specific step is valid
 * @param {string} stepId - The step ID
 * @param {Object} formData - The form data to validate
 * @returns {boolean} Whether the step is valid
 */
export const isStepValid = (stepId, formData) => {
  const result = validateStep(stepId, formData);
  return result.success;
};

export default {
  STEP_SCHEMA_MAP,
  validateStep,
  validateAllSteps,
  isStepValid
};
