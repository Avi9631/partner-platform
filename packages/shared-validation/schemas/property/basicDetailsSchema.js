import { z } from 'zod';

/**
 * Basic Details Schema (Enhanced)
 * Phase 1 Enhancement - Step 3: Basic Details
 * 
 * Includes infrastructure and utility details
 */
export const basicDetailsSchema = z.object({
  listingType: z.enum(['sale', 'rent', 'lease'], {
    errorMap: () => ({ message: 'Please select listing type' }),
  }),
  ownershipType: z.enum(['freehold', 'leasehold', 'poa', 'co_operative'], {
    errorMap: () => ({ message: 'Please select ownership type' }),
  }),
  projectName: z.string().optional().refine(
    (val) => !val || val.length >= 4,
    { message: 'Project name must be at least 4 characters' }
  ),
  customPropertyName: z.string().optional(),
  reraIds: z.array(z.object({
    id: z.string().min(1, 'RERA ID is required'),
  })).optional().default([]),
  ageOfProperty: z.string()
    .min(1, 'Age of property is required')
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: 'Age must be a positive number',
    }),
  possessionStatus: z.enum(['ready', 'under_construction', 'resale'], {
    errorMap: () => ({ message: 'Please select a possession status' }),
  }),
  possessionDate: z.string().optional(),
  availableFrom: z.string().optional(),
  
  // Enhanced fields - Phase 1
  propertyFacingRoadWidth: z.string()
    .refine((val) => !val || (!isNaN(Number(val)) && Number(val) > 0), {
      message: 'Road width must be a positive number',
    })
    .optional(),
  
  totalUnitsInProject: z.string()
    .refine((val) => !val || (!isNaN(Number(val)) && Number(val) > 0), {
      message: 'Total units must be a positive number',
    })
    .optional(),
  
  builderDeveloperName: z.string()
    .max(200, 'Builder name is too long')
    .optional(),
  
  hasOccupancyCertificate: z.boolean().default(false),
  occupancyCertificateUrl: z.string().url().optional(),
  
  hasCompletionCertificate: z.boolean().default(false),
  completionCertificateUrl: z.string().url().optional(),
  
  waterSupplySource: z.enum([
    'municipal',
    'borewell',
    'both',
    'tanker',
    'well',
    'other'
  ]).optional(),
  
  electricityProvider: z.string()
    .max(100, 'Provider name is too long')
    .optional(),
  
  wasteManagement: z.enum([
    'municipal',
    'on_site',
    'septic_tank',
    'none',
    'other'
  ]).optional(),
  
  sewerageType: z.enum([
    'public_sewer',
    'septic_tank',
    'treatment_plant',
    'none',
    'other'
  ]).optional(),
}).refine((data) => {
  // If under construction, possession date should be provided
  if (data.possessionStatus === 'under_construction' && !data.possessionDate) {
    return false;
  }
  return true;
}, {
  message: 'Expected possession date is required for properties under construction',
  path: ['possessionDate'],
});

export default basicDetailsSchema;
