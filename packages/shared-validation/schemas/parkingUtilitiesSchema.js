const { z } = require('zod');

/**
 * Enhanced Parking & Utilities Schema
 * Phase 1 Enhancement - Step 7: Parking
 * Updated with mandatory field validations
 */
const parkingUtilitiesSchema = z.object({
  // MANDATORY: Basic parking information
  coveredParking: z.string()
    .min(1, 'Covered parking count is required')
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: 'Must be a non-negative number',
    }),
  
  openParking: z.string()
    .min(1, 'Open parking count is required')
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: 'Must be a non-negative number',
    }),
  
  // MANDATORY: Power backup information
  powerBackup: z.enum(['none', 'partial', 'full'], {
    required_error: 'Power backup information is required',
  }),
  
  // EV Charging Type - defaults to 'none'
  evChargingType: z.enum([
    'none',
    'ac_slow',
    'dc_fast',
    'both'
  ]).default('none'),
  
  evChargingPoints: z.string().optional(),
  hasVisitorParking: z.boolean().default(false),
  visitorParkingSpaces: z.string().optional(),
  
  // MANDATORY: Parking allocation type
  parkingType: z.enum([
    'reserved',
    'shared',
    'first_come'
  ], {
    required_error: 'Parking type is required',
  }),
  
  parkingSecurityType: z.enum([
    'guarded',
    'cctv',
    'gated',
    'none',
    'multiple'
  ]).optional(),
})
.refine(
  (data) => {
    if (data.evChargingType !== 'none' && !data.evChargingPoints) {
      return false;
    }
    return true;
  },
  {
    message: 'EV charging points are required when EV charging is enabled',
    path: ['evChargingPoints'],
  }
)
.refine(
  (data) => {
    if (data.evChargingType !== 'none' && data.evChargingPoints) {
      const num = Number(data.evChargingPoints);
      return !isNaN(num) && num > 0;
    }
    return true;
  },
  {
    message: 'EV charging points must be a positive number',
    path: ['evChargingPoints'],
  }
)
.refine(
  (data) => {
    if (data.hasVisitorParking && !data.visitorParkingSpaces) {
      return false;
    }
    return true;
  },
  {
    message: 'Visitor parking spaces are required when visitor parking is enabled',
    path: ['visitorParkingSpaces'],
  }
)
.refine(
  (data) => {
    if (data.hasVisitorParking && data.visitorParkingSpaces) {
      const num = Number(data.visitorParkingSpaces);
      return !isNaN(num) && num > 0;
    }
    return true;
  },
  {
    message: 'Visitor parking spaces must be a positive number',
    path: ['visitorParkingSpaces'],
  }
);

module.exports = parkingUtilitiesSchema;
