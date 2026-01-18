
/**
 * Create or update partner business information
 * @param {number} userId - User ID
 * @param {Object} businessData - Business data
 * @returns {Promise<Object>} Business record
 */
import db from '../entity/index.js';
import logger from '../config/winston.config.js';
import WalletService from './WalletService.service.js';

async function createOrUpdateBusiness(userId, businessData) {
  const transaction = await db.sequelize.transaction();
  
  try {
    // Check if business already exists for this user
    let business = await db.PartnerBusiness.findOne({
      where: { userId: userId },
      transaction
    });

    const businessFields = {
      userId: userId,
      businessName: businessData.agencyName,
      registrationNumber: businessData.agencyRegistrationNumber,
      businessAddress: businessData.agencyAddress,
      businessEmail: businessData.agencyEmail,
      businessPhone: businessData.agencyPhone,
      businessType: 'BUSINESS',
      businessStatus: 'PENDING_VERIFICATION',
      verificationStatus: 'PENDING'
    };

    if (business) {
      // Update existing business
      await business.update(businessFields, { transaction });
      logger.info(`Updated business profile for user ${userId}`);
    } else {
      // Create new business
      business = await db.PartnerBusiness.create(businessFields, { transaction });
      logger.info(`Created business profile for user ${userId}`);
    }

    await transaction.commit();
    return business.toJSON();
  } catch (error) {
    await transaction.rollback();
    logger.error(`Error creating/updating business for user ${userId}:`, error);
    throw error;
  }
}

/**
 * Get business by userId
 * @param {number} userId - User ID
 * @returns {Promise<Object|null>} Business data or null
 */
async function getBusinessByUserId(userId) {
  try {
    const business = await db.PartnerBusiness.findOne({
      where: { userId: userId }
    });

    if (!business) {
      return null;
    }

    return business.toJSON();
  } catch (error) {
    logger.error(`Error fetching business for user ${userId}:`, error);
    throw error;
  }
}

/**
 * Get business by businessId
 * @param {number} businessId - Business ID
 * @returns {Promise<Object>} Business data
 */
async function getBusinessById(businessId) {
  try {
    const business = await db.PartnerBusiness.findByPk(businessId, {
      include: [{
        model: db.PlatformUser,
        as: 'user',
        attributes: ['userId', 'firstName', 'lastName', 'email', 'phone']
      }]
    });

    if (!business) {
      throw new Error("Business not found");
    }

    return business.toJSON();
  } catch (error) {
    logger.error(`Error fetching business ${businessId}:`, error);
    throw error;
  }
}

/**
 * Update business verification status
 * @param {number} businessId - Business ID
 * @param {string} status - Verification status (PENDING, APPROVED, REJECTED)
 * @param {string} notes - Verification notes
 * @param {number} verifiedBy - User ID of verifier
 * @returns {Promise<Object>} Updated business data
 */
async function updateVerificationStatus(businessId, status, notes = null, verifiedBy = null) {
  const validStatuses = ['PENDING', 'APPROVED', 'REJECTED'];
  
  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid verification status. Must be one of: ${validStatuses.join(', ')}`);
  }

  const transaction = await db.sequelize.transaction();
  
  try {
    const business = await db.PartnerBusiness.findByPk(businessId, { transaction });

    if (!business) {
      await transaction.rollback();
      throw new Error("Business not found");
    }

    const updateFields = {
      verificationStatus: status,
      verificationNotes: notes
    };

    if (status === 'APPROVED') {
      updateFields.verifiedAt = new Date();
      updateFields.verifiedBy = verifiedBy;
      updateFields.businessStatus = 'ACTIVE';
    }

    await business.update(updateFields, { transaction });

    await transaction.commit();
    logger.info(`Business ${businessId} verification status updated to ${status}`);
    return business.toJSON();
  } catch (error) {
    await transaction.rollback();
    logger.error(`Error updating verification status for business ${businessId}:`, error);
    throw error;
  }
}

/**
 * Get all businesses with filters
 * @param {Object} filters - Filter options
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Promise<Object>} Paginated businesses data
 */
async function getAllBusinesses(filters = {}, page = 1, limit = 10) {
  try {
    const offset = (page - 1) * limit;
    const whereClause = {};
    
    if (filters.businessStatus) {
      whereClause.businessStatus = filters.businessStatus;
    }
    
    if (filters.verificationStatus) {
      whereClause.verificationStatus = filters.verificationStatus;
    }

    if (filters.businessType) {
      whereClause.businessType = filters.businessType;
    }

    if (filters.search) {
      whereClause[db.Sequelize.Op.or] = [
        { businessName: { [db.Sequelize.Op.like]: `%${filters.search}%` } },
        { businessEmail: { [db.Sequelize.Op.like]: `%${filters.search}%` } },
        { registrationNumber: { [db.Sequelize.Op.like]: `%${filters.search}%` } },
      ];
    }

    const { count, rows } = await db.PartnerBusiness.findAndCountAll({
      where: whereClause,
      limit: limit,
      offset: offset,
      order: [["business_created_at", "DESC"]],
      include: [{
        model: db.PlatformUser,
        as: 'user',
        attributes: ['userId', 'firstName', 'lastName', 'email', 'phone', 'accountType']
      }]
    });

    return {
      businesses: rows.map(business => business.toJSON()),
      pagination: {
        total: count,
        page: page,
        limit: limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  } catch (error) {
    logger.error("Error fetching all businesses:", error);
    throw error;
  }
}

/**
 * Delete business
 * @param {number} businessId - Business ID
 * @returns {Promise<void>}
 */
async function deleteBusiness(businessId) {
  const transaction = await db.sequelize.transaction();
  
  try {
    const business = await db.PartnerBusiness.findByPk(businessId, { transaction });

    if (!business) {
      await transaction.rollback();
      throw new Error("Business not found");
    }

    await business.destroy({ transaction });
    await transaction.commit();
    logger.info(`Business ${businessId} deleted`);
  } catch (error) {
    await transaction.rollback();
    logger.error(`Error deleting business ${businessId}:`, error);
    throw error;
  }
}

/**
 * Validate business data
 * @param {Object} businessData - Business data to validate
 * @returns {Object} Validation result
 */
function validateBusinessData(businessData) {
  try {
    const errors = [];
    
    if (!businessData) {
      errors.push('Business data is required for BUSINESS account type');
      return { success: false, errors };
    }
    
    if (!businessData.agencyName || businessData.agencyName.trim().length === 0) {
      errors.push('Business/Agency name is required');
    }
    
    if (!businessData.agencyRegistrationNumber || businessData.agencyRegistrationNumber.trim().length === 0) {
      errors.push('Registration number is required');
    }
    
    if (!businessData.agencyAddress || businessData.agencyAddress.trim().length === 0) {
      errors.push('Business address is required');
    }
    
    if (!businessData.agencyEmail || businessData.agencyEmail.trim().length === 0) {
      errors.push('Business email is required');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(businessData.agencyEmail)) {
        errors.push('Invalid business email format');
      }
    }
    
    if (!businessData.agencyPhone || businessData.agencyPhone.trim().length === 0) {
      errors.push('Business phone is required');
    } else {
      const phoneRegex = /^[+]?[\d\s\-()]+$/;
      if (!phoneRegex.test(businessData.agencyPhone)) {
        errors.push('Invalid business phone format');
      }
    }
    
    if (errors.length > 0) {
      return { success: false, errors };
    }
    
    return { success: true };
  } catch (error) {
    logger.error('Error validating business data:', error);
    throw error;
  }
}

/**
 * Complete business onboarding workflow
 * @param {Object} workflowInput - Workflow input
 * @returns {Promise<Object>} Onboarding result
 */
async function completeBusinessOnboarding(workflowInput) {
  const { userId, email, businessData } = workflowInput;
  
  const transaction = await db.sequelize.transaction();
  logger.info(`[Business Onboarding] Starting for user ${userId}`);
  
  try {
    // Validate business data
    logger.info(`[Business Onboarding] Validating business data`);
    
    const validationResult = validateBusinessData(businessData);
    
    if (!validationResult.success) {
      await transaction.rollback();
      logger.error(`[Business Onboarding] Validation failed:`, validationResult.errors);
      return {
        success: false,
        message: `Business validation failed: ${validationResult.errors.join(', ')}`,
        errors: validationResult.errors
      };
    }
    
    logger.info(`[Business Onboarding] Business validation successful`);
    
    // Create business record
    logger.info(`[Business Onboarding] Creating business record`);
    
    const business = await createOrUpdateBusiness(userId, businessData);
    
    logger.info(`[Business Onboarding] Business record created successfully, ID: ${business.businessId}`);
    
    // Add welcome bonus credits
    logger.info(`[Business Onboarding] Adding welcome bonus credits`);
    
    try {
      const creditResult = await WalletService.addFunds({
        userId,
        amount: 200,
        reason: 'Welcome bonus for completing business onboarding',
        metadata: { 
          type: 'ONBOARDING_BONUS', 
          workflowType: 'partnerBusinessOnboarding', 
          businessName: businessData.agencyName 
        },
      });
      
      if (creditResult.success) {
        logger.info(`[Business Onboarding] Added 200 credits to user wallet`);
      } else {
        logger.warn(`[Business Onboarding] Failed to add credits: ${creditResult.message}`);
      }
    } catch (creditError) {
      logger.error(`[Business Onboarding] Error adding credits:`, creditError);
      // Don't fail the onboarding if credits fail
    }
    
    await transaction.commit();
    return {
      success: true,
      userId,
      message: 'Business partner profile submitted for verification successfully',
      data: {
        businessId: business.businessId,
        businessName: businessData.agencyName,
        verificationStatus: 'PENDING',
        business,
      },
    };
    
  } catch (error) {
    await transaction.rollback();
    logger.error(`[Business Onboarding] Process error for user ${userId}:`, error);
    
    return {
      success: false,
      userId,
      message: `Business partner onboarding failed: ${error.message}`,
      error: error.message,
    };
  }
}

export default { 
  createOrUpdateBusiness, 
  getBusinessByUserId, 
  getBusinessById, 
  updateVerificationStatus, 
  getAllBusinesses, 
  deleteBusiness,
  validateBusinessData,
  completeBusinessOnboarding
};
