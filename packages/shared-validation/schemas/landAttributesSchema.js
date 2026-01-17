const { z } = require('zod');

/**
 * Enhanced Land Attributes Schema
 * Phase 1 Enhancement - Step 10: Land Attributes (Plot/Farmhouse/Agricultural)
 */
const landAttributesSchema = z.object({
  plotArea: z.string()
    .min(1, 'Plot area is required')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: 'Plot area must be a positive number',
    }),
  areaUnit: z.enum(['sqft', 'sqm', 'acre', 'bigha', 'kanal', 'gaj'], {
    errorMap: () => ({ message: 'Please select an area unit' }),
  }),
  plotDimension: z.string().optional(),
  roadWidth: z.string()
    .optional()
    .refine((val) => !val || (!isNaN(Number(val)) && Number(val) > 0), {
      message: 'Road width must be a positive number',
    }),
  fencing: z.boolean().optional().default(false),
  irrigationSource: z.string().optional(),
  terrainLevel: z.enum(['flat', 'elevated', 'sloped']).optional(),
  soilType: z.enum(['black', 'red', 'sandy', 'clay', 'loamy']).optional(),
  legalStatus: z.enum([
    'clear_title',
    'disputed',
    'poa',
    'under_litigation',
    'encumbered',
    'leasehold',
    'freehold',
    'other'
  ]).optional(),
  boundaryWallType: z.enum([
    'brick',
    'concrete',
    'wire_fence',
    'iron_fence',
    'compound_wall',
    'none',
    'partial',
    'other'
  ]).optional(),
  hasDrainage: z.enum(['yes', 'no', 'planned']).optional(),
  surveyNumber: z.string().max(100, 'Survey number is too long').optional(),
  plotId: z.string().max(100, 'Plot ID is too long').optional(),
  landConversionCertificateUrl: z.string().url().optional(),
  ownershipProofUrl: z.string().url().optional(),
  topographyMapUrl: z.string().url().optional(),
  surveyDocumentUrl: z.string().url().optional(),
});

module.exports = landAttributesSchema;
