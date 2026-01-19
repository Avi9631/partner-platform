import { z } from 'zod';
import areaDetailsSchema from './areaDetailsSchema.js';
import basicConfigurationSchema from './basicConfigurationSchema.js';
import { basicDetailsSchema } from './basicDetailsSchema.js';
import documentsSchema from './documentsSchema.js';
import floorDetailsSchema from './floorDetailsSchema.js';
import geoTagSchema from './geoTagSchema.js';
import landAttributesSchema from './landAttributesSchema.js';
import listingInformationSchema from './listingInformationSchema.js';
import locationAttributesSchema from './locationAttributesSchema.js';
import locationSelectionSchema from './locationSelectionSchema.js';
import mediaUploadSchema from './mediaUploadSchema.js';
import parkingUtilitiesSchema from './parkingUtilitiesSchema.js';
import pricingInformationSchema from './pricingInformationSchema.js';
import propertyAmenitiesSchema from './propertyAmenitiesSchema.js';
import suitableForSchema from './suitableForSchema.js';
import summaryInsightsSchema from './summaryInsightsSchema.js';
import transactionOwnerSchema from './transactionOwnerSchema.js';
import unitAmenitiesSchema from './unitAmenitiesSchema.js';

/**
 * Property Schema
 * 
 * Comprehensive validation schema combining all property-related schemas.
 * All nested schemas are optional/nullable - if present, they will be validated.
 */
const propertySchema = z.object({
  areaDetails: areaDetailsSchema.optional().nullable(),
  basicConfiguration: basicConfigurationSchema.optional().nullable(),
  basicDetails: basicDetailsSchema.optional().nullable(),
  documents: documentsSchema.optional().nullable(),
  floorDetails: floorDetailsSchema.optional().nullable(),
  geoTag: geoTagSchema.optional().nullable(),
  landAttributes: landAttributesSchema.optional().nullable(),
  listingInformation: listingInformationSchema.optional().nullable(),
  locationAttributes: locationAttributesSchema.optional().nullable(),
  locationSelection: locationSelectionSchema.optional().nullable(),
  mediaUpload: mediaUploadSchema.optional().nullable(),
  parkingUtilities: parkingUtilitiesSchema.optional().nullable(),
  pricingInformation: pricingInformationSchema.optional().nullable(),
  propertyAmenities: propertyAmenitiesSchema.optional().nullable(),
  suitableFor: suitableForSchema.optional().nullable(),
  summaryInsights: summaryInsightsSchema.optional().nullable(),
  transactionOwner: transactionOwnerSchema.optional().nullable(),
  unitAmenities: unitAmenitiesSchema.optional().nullable(),
});

export default propertySchema;
