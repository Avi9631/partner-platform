/**
 * Property Draft Data Validator
 * 
 * Validates property draft data against Zod schemas based on property type and steps
 * 
 * @module utils/propertyDraftValidator
 */


/**
 * Map step IDs to their corresponding schemas
 */
import logger from '../config/winston.config.js';
import { schemas, stepConfig } from '@partner-platform/shared-validation';

const STEP_SCHEMA_MAP = {
  'property-type': null, // No schema validation needed (simple enum)
  'location-selection': schemas.locationSelectionSchema,
  'basic-details': schemas.basicDetailsSchema,
  'basic-configuration': schemas.basicConfigurationSchema,
  'unit-amenities': schemas.unitAmenitiesSchema,
  'location-attributes': schemas.locationAttributesSchema,
  'floor-details': schemas.floorDetailsSchema,
  'land-attributes': schemas.landAttributesSchema,
  'parking-utilities': schemas.parkingUtilitiesSchema,
  'pricing': schemas.pricingInformationSchema,
  'suitable-for': schemas.suitableForSchema,
  'listing-info': schemas.listingInformationSchema,
  'property-amenities': schemas.propertyAmenitiesSchema,
  'media-upload': schemas.mediaUploadSchema,
};

/**
 * Validate a single step's data
 * 
 * @param {string} stepId - Step identifier
 * @param {Object} stepData - Data for the specific step
 * @returns {Object} - { valid: boolean, errors: Array<Object>, data?: Object }
 */
function validateStep(stepId, stepData) {
  const schema = STEP_SCHEMA_MAP[stepId];
  
  // If no schema defined for this step, skip validation
  if (!schema) {
    logger.debug(`[Property Validator] No schema found for step: ${stepId}, skipping validation`);
    return { valid: true, errors: [], data: stepData };
  }

  try {
    // Validate using Zod schema
    const result = schema.safeParse(stepData);
    
    if (result.success) {
      return {
        valid: true,
        errors: [],
        data: result.data // Return validated/transformed data
      };
    } else {
      // Format Zod errors
      const formattedErrors = result.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code,
        path: err.path,
      }));
      
      logger.warn(`[Property Validator] Validation failed for step ${stepId}:`, formattedErrors);
      
      return {
        valid: false,
        errors: formattedErrors,
      };
    }
  } catch (error) {
    logger.error(`[Property Validator] Unexpected error validating step ${stepId}:`, error);
    return {
      valid: false,
      errors: [{
        field: 'unknown',
        message: `Validation error: ${error.message}`,
        code: 'VALIDATION_ERROR'
      }],
    };
  }
}

/**
 * Validate complete draft data for a property type
 * 
 * @param {Object} draftData - Complete draft data (step-by-step structure)
 * @param {string} propertyType - Property type (apartment, villa, etc.)
 * @returns {Object} - { valid: boolean, errors: Object, validatedData?: Object }
 */
function validateDraftData(draftData, propertyType) {
  if (!draftData || typeof draftData !== 'object') {
    return {
      valid: false,
      errors: {
        _general: [{
          field: 'draftData',
          message: 'Draft data must be a valid object',
          code: 'INVALID_DATA'
        }]
      }
    };
  }

  // Get expected steps for this property type
  const expectedSteps = stepConfig.getStepIds(propertyType);
  
  logger.info(`[Property Validator] Validating draft for property type: ${propertyType}, steps: ${expectedSteps.length}`);

  const allErrors = {};
  const validatedData = {};
  let hasErrors = false;

  // Validate each step
  for (const stepId of expectedSteps) {
    const stepData = draftData[stepId];
    
    // Skip validation if step data doesn't exist (optional steps)
    if (!stepData) {
      logger.debug(`[Property Validator] Step ${stepId} has no data, skipping`);
      continue;
    }

    const validationResult = validateStep(stepId, stepData);
    
    if (!validationResult.valid) {
      allErrors[stepId] = validationResult.errors;
      hasErrors = true;
    } else if (validationResult.data) {
      validatedData[stepId] = validationResult.data;
    }
  }

  if (hasErrors) {
    logger.warn(`[Property Validator] Validation failed with errors in ${Object.keys(allErrors).length} steps`);
    return {
      valid: false,
      errors: allErrors,
    };
  }

  logger.info(`[Property Validator] Validation successful for all steps`);
  return {
    valid: true,
    errors: {},
    validatedData,
  };
}

/**
 * Validate required steps are present
 * 
 * @param {Object} draftData - Draft data
 * @param {string} propertyType - Property type
 * @returns {Object} - { valid: boolean, missingSteps: Array<string> }
 */
function validateRequiredSteps(draftData, propertyType) {
  const requiredSteps = [
    'location-selection',
    'basic-details',
    'pricing',
    'media-upload',
  ];

  const missingSteps = requiredSteps.filter(stepId => {
    return !draftData[stepId] || Object.keys(draftData[stepId]).length === 0;
  });

  if (missingSteps.length > 0) {
    logger.warn(`[Property Validator] Missing required steps: ${missingSteps.join(', ')}`);
    return {
      valid: false,
      missingSteps,
    };
  }

  return {
    valid: true,
    missingSteps: [],
  };
}

/**
 * Get validation summary for draft data
 * 
 * @param {Object} draftData - Draft data
 * @param {string} propertyType - Property type
 * @returns {Object} - Validation summary with completeness metrics
 */
function getValidationSummary(draftData, propertyType) {
  const expectedSteps = stepConfig.getStepIds(propertyType);
  const completedSteps = expectedSteps.filter(stepId => 
    draftData[stepId] && Object.keys(draftData[stepId]).length > 0
  );

  const completenessPercentage = Math.round(
    (completedSteps.length / expectedSteps.length) * 100
  );

  const requiredCheck = validateRequiredSteps(draftData, propertyType);
  const validationResult = validateDraftData(draftData, propertyType);

  return {
    propertyType,
    totalSteps: expectedSteps.length,
    completedSteps: completedSteps.length,
    completenessPercentage,
    isValid: validationResult.valid && requiredCheck.valid,
    hasAllRequiredSteps: requiredCheck.valid,
    missingSteps: requiredCheck.missingSteps,
    validationErrors: validationResult.errors,
    completedStepIds: completedSteps,
  };
}

export { validateStep, validateDraftData, validateRequiredSteps, getValidationSummary, STEP_SCHEMA_MAP };
