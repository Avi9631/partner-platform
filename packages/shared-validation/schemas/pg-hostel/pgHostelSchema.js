import { z } from 'zod';
import amenitiesPgSchema from './amenitiesPgSchema.js';
import availabilityPgSchema from './availabilityPgSchema.js';
import basicDetailsPgSchema from './basicDetailsPgSchema.js';
import foodMessPgSchema from './foodMessPgSchema.js';
import locationDetailsPgSchema from './locationDetailsPgSchema.js';
import mediaUploadPgSchema from './mediaUploadPgSchema.js';
import roomTypesPgSchema from './roomTypesPgSchema.js';
import rulesRestrictionsPgSchema from './rulesRestrictionsPgSchema.js';

/**
 * PG/Hostel Schema
 * 
 * Comprehensive validation schema combining all PG/Hostel-related schemas.
 * All nested schemas are optional/nullable - if present, they will be validated.
 */
const pgHostelSchema = z.object({
  amenities: amenitiesPgSchema.optional().nullable(),
  availability: availabilityPgSchema.optional().nullable(),
  basicDetails: basicDetailsPgSchema.optional().nullable(),
  foodMess: foodMessPgSchema.optional().nullable(),
  locationDetails: locationDetailsPgSchema.optional().nullable(),
  mediaUpload: mediaUploadPgSchema.optional().nullable(),
  roomTypes: roomTypesPgSchema.optional().nullable(),
  rulesRestrictions: rulesRestrictionsPgSchema.optional().nullable(),
});

export default pgHostelSchema;
