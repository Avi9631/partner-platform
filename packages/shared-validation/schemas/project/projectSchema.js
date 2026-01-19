import { z } from 'zod';
import additionalInfoProjectSchema from './additionalInfoProjectSchema.js';
import amenitiesProjectSchema from './amenitiesProjectSchema.js';
import basicDetailsProjectSchema from './basicDetailsProjectSchema.js';
import configurationsProjectSchema from './configurationsProjectSchema.js';
import legalDocsProjectSchema from './legalDocsProjectSchema.js';
import locationDetailsProjectSchema from './locationDetailsProjectSchema.js';
import mediaUploadProjectSchema from './mediaUploadProjectSchema.js';
import pricingProjectSchema from './pricingProjectSchema.js';

/**
 * Project Schema
 * 
 * Comprehensive validation schema combining all project-related schemas.
 * All nested schemas are optional/nullable - if present, they will be validated.
 */
const projectSchema = z.object({
  additionalInfo: additionalInfoProjectSchema.optional().nullable(),
  amenities: amenitiesProjectSchema.optional().nullable(),
  basicDetails: basicDetailsProjectSchema.optional().nullable(),
  configurations: configurationsProjectSchema.optional().nullable(),
  legalDocs: legalDocsProjectSchema.optional().nullable(),
  locationDetails: locationDetailsProjectSchema.optional().nullable(),
  mediaUpload: mediaUploadProjectSchema.optional().nullable(),
  pricing: pricingProjectSchema.optional().nullable(),
});

export default projectSchema;
