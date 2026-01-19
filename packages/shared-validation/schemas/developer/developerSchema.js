import { z } from 'zod';
import { basicInfoSchema } from './basicInfoSchema.js';

/**
 * Developer Schema
 * 
 * Comprehensive validation schema combining all developer-related schemas.
 * All nested schemas are optional/nullable - if present, they will be validated.
 */
const developerSchema = z.object({
  basicInfo: basicInfoSchema.optional().nullable(),
});

export default developerSchema;
