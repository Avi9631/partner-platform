/**
 * Shared Validation Schemas Index
 * 
 * Exports all validation schemas organized by category for use in frontend and backend
 */

// Import schemas from organized subdirectories
import * as propertySchemas from './schemas/property/index.js';
import * as projectSchemas from './schemas/project/index.js';
import * as pgHostelSchemas from './schemas/pg-hostel/index.js';
import * as developerSchemas from './schemas/developer/index.js';
import stepConfig from './config/stepConfiguration.js';

// Legacy export for backward compatibility
const schemas = propertySchemas;

// Named exports for ES6 modules
export {
  propertySchemas,
  projectSchemas,
  pgHostelSchemas,
  developerSchemas,
  schemas,
  stepConfig,
};

// Default export for compatibility
export default {
  propertySchemas,
  projectSchemas,
  pgHostelSchemas,
  developerSchemas,
  schemas,
  stepConfig,
};
