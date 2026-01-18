import db from '../entity/index.js';
import { Op } from 'sequelize';
import logger from '../config/winston.config.js';
import WalletService from './WalletService.service.js';

const Developer = db.Developer;
const PlatformUser = db.PlatformUser;
const ListingDraft = db.ListingDraft;

 

/**
 * Create a new developer record from draft data
 * @param {number} userId - User ID
 * @param {number} draftId - Draft ID (required, ensures one draft = one publish)
 * @param {object} developerData - Developer data
 * @returns {Promise<object>} - Result object
 */
const createDeveloper = async (userId, draftId, developerData) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    // Check if developer already exists for this draft
    const existingDeveloper = await db.Developer.findOne({ where: { draftId }, transaction });
    
    if (existingDeveloper) {
      await transaction.rollback();
      return {
        success: false,
        message: 'Developer already exists for this draft. Use update instead.',
        data: existingDeveloper
      };
    }

    // Create developer record
    const developer = await db.Developer.create({
      userId,
      draftId,
      developerName: developerData.developerName,
      subscribeForDeveloperPage: developerData.subscribeForDeveloperPage || false,
      verificationStatus: 'PENDING'
    }, { transaction });

    await transaction.commit();
    return {
      success: true,
      message: 'Developer profile created successfully',
      data: developer
    };
  } catch (error) {
    await transaction.rollback();
    logger.error('Error creating developer:', error);
    throw error;
  }
};

/**
 * Update developer record
 * @param {number} developerId - Developer ID
 * @param {number} userId - User ID for authorization
 * @param {object} updateData - Data to update
 * @returns {Promise<object>} - Result object
 */
const updateDeveloper = async (developerId, userId, updateData) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const developer = await db.Developer.findOne({
      where: {
        developerId,
        userId
      },
      transaction
    });

    if (!developer) {
      await transaction.rollback();
      return {
        success: false,
        message: 'Developer not found or unauthorized'
      };
    }

    // Prepare update payload
    const updatePayload = {
      developerName: updateData.developerName,
      subscribeForDeveloperPage: updateData.subscribeForDeveloperPage !== undefined 
        ? updateData.subscribeForDeveloperPage 
        : developer.subscribeForDeveloperPage
    };

    // Reset to PENDING_REVIEW when republishing
    if (developer.publishStatus === 'REJECTED') {
      updatePayload.verificationStatus = 'PENDING';
    }

    await developer.update(updatePayload, { transaction });

    await transaction.commit();
    return {
      success: true,
      message: 'Developer profile updated successfully',
      data: developer
    };
  } catch (error) {
    await transaction.rollback();
    logger.error('Error updating developer:', error);
    throw error;
  }
};

/**
 * Get developer by ID
 * @param {number} developerId - Developer ID
 * @returns {Promise<object>} - Result object
 */
const getDeveloperById = async (developerId) => {
  try {
    const developer = await db.Developer.findByPk(developerId, {
      include: [
        {
          model: db.PlatformUser,
          as: 'user',
          attributes: ['userId', 'firstName', 'lastName', 'userEmail', 'profileImage']
        }
      ]
    });

    if (!developer) {
      return {
        success: false,
        message: 'Developer not found'
      };
    }

    return {
      success: true,
      data: developer
    };
  } catch (error) {
    logger.error('Error getting developer:', error);
    throw error;
  }
};

 

/**
 * Get developers by user ID (all developers created by this user)
 * @param {number} userId - User ID
 * @returns {Promise<object>} - Result object with array of developers
 */
const getDevelopersByUserId = async (userId) => {
  try {
    const developers = await db.Developer.findAll({
      where: { userId },
      order: [['developer_created_at', 'DESC']]
    });

    return {
      success: true,
      data: developers,
      count: developers.length
    };
  } catch (error) {
    logger.error('Error getting developers by user ID:', error);
    throw error;
  }
};

/**
 * List developers with filters and pagination
 * @param {object} filters - Filter criteria
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Promise<object>} - Result object with developers and pagination
 */
const listDevelopers = async (filters = {}, page = 1, limit = 20) => {
  try {
    const whereClause = {};

    if (filters.developerType) {
      whereClause.developerType = filters.developerType;
    }

    if (filters.publishStatus) {
      whereClause.publishStatus = filters.publishStatus;
    } else {
      // Default to only showing published developers
      whereClause.publishStatus = 'PUBLISHED';
    }

    if (filters.verificationStatus) {
      whereClause.verificationStatus = filters.verificationStatus;
    }

 

    

    if (filters.search) {
      whereClause[Op.or] = [
        { developerName: { [Op.iLike]: `%${filters.search}%` } },
        { description: { [Op.iLike]: `%${filters.search}%` } }
      ];
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await db.Developer.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['developer_created_at', 'DESC']],
      include: [
        {
          model: db.PlatformUser,
          as: 'user',
          attributes: ['userId', 'firstName', 'lastName', 'profileImage']
        }
      ]
    });

    return {
      success: true,
      data: {
        developers: rows,
        pagination: {
          total: count,
          page,
          limit,
          totalPages: Math.ceil(count / limit)
        }
      }
    };
  } catch (error) {
    logger.error('Error listing developers:', error);
    throw error;
  }
};

/**
 * Update developer publish status
 * @param {number} developerId - Developer ID
 * @param {string} status - New status
 * @param {string} notes - Optional notes
 * @returns {Promise<object>} - Result object
 */
const updatePublishStatus = async (developerId, status, notes = null) => {
  try {
    const developer = await db.Developer.findByPk(developerId);

    if (!developer) {
      return {
        success: false,
        message: 'Developer not found'
      };
    }

    const updateData = { publishStatus: status };

    if (status === 'PUBLISHED') {
      updateData.publishedAt = new Date();
    }

    if (notes) {
      updateData.verificationNotes = notes;
    }

    await developer.update(updateData);

    return {
      success: true,
      message: `Developer status updated to ${status}`,
      data: developer
    };
  } catch (error) {
    logger.error('Error updating publish status:', error);
    throw error;
  }
};

/**
 * Update developer verification status
 * @param {number} developerId - Developer ID
 * @param {string} status - Verification status
 * @param {number} verifiedBy - User ID of verifier
 * @param {string} notes - Verification notes
 * @returns {Promise<object>} - Result object
 */
const updateVerificationStatus = async (developerId, status, verifiedBy, notes = null) => {
  try {
    const developer = await db.Developer.findByPk(developerId);

    if (!developer) {
      return {
        success: false,
        message: 'Developer not found'
      };
    }

    const updateData = {
      verificationStatus: status,
      verifiedBy,
      verifiedAt: new Date()
    };

    if (notes) {
      updateData.verificationNotes = notes;
    }

    await developer.update(updateData);

    return {
      success: true,
      message: `Developer verification status updated to ${status}`,
      data: developer
    };
  } catch (error) {
    logger.error('Error updating verification status:', error);
    throw error;
  }
};

/**
 * Delete developer (soft delete)
 * @param {number} developerId - Developer ID
 * @param {number} userId - User ID for authorization
 * @returns {Promise<object>} - Result object
 */
const deleteDeveloper = async (developerId, userId) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const developer = await db.Developer.findOne({
      where: {
        developerId,
        userId
      },
      transaction
    });

    if (!developer) {
      await transaction.rollback();
      return {
        success: false,
        message: 'Developer not found or unauthorized'
      };
    }

    await developer.destroy({ transaction });

    await transaction.commit();
    return {
      success: true,
      message: 'Developer profile deleted successfully'
    };
  } catch (error) {
    await transaction.rollback();
    logger.error('Error deleting developer:', error);
    throw error;
  }
};

/**
 * Get developer draft data from ListingDraft
 * @param {number} draftId - Draft ID
 * @returns {Promise<object>} - Result object with draft data
 */
const getDeveloperDraftData = async (draftId) => {
  try {
    const draft = await ListingDraft.findByPk(draftId);
    
    if (!draft) {
      return {
        success: false,
        message: 'Draft not found'
      };
    }

    if (draft.draftType !== 'DEVELOPER') {
      return {
        success: false,
        message: 'Draft is not a developer draft'
      };
    }

    return {
      success: true,
      data: draft.draftData
    };
  } catch (error) {
    logger.error('Error fetching developer draft data:', error);
    throw error;
  }
};

/**
 * Validate developer data before publishing
 * @param {number} userId - User ID
 * @param {number} draftId - Draft ID
 * @param {object} developerData - Developer data to validate
 * @returns {Promise<object>} - Validation result
 */
const validateDeveloperData = async (userId, draftId, developerData) => {
  try {
    const errors = [];

    if (!draftId) {
      errors.push('Draft ID is required');
    }

    if (!developerData.developerName) {
      errors.push('Developer name is required');
    }

    const user = await PlatformUser.findByPk(userId);
    if (!user) {
      errors.push('User not found');
    }

    if (errors.length > 0) {
      return {
        success: false,
        errors
      };
    }

    return {
      success: true,
      message: 'Validation successful'
    };
  } catch (error) {
    logger.error('Error validating developer data:', error);
    throw error;
  }
};

/**
 * Check if developer exists for a draft
 * @param {number} draftId - Draft ID
 * @returns {Promise<object>} - Result with developer if exists
 */
const checkDeveloperExistsByDraft = async (draftId) => {
  try {
    const existingDeveloper = await Developer.findOne({ 
      where: { draftId },
    });
    
    return {
      success: true,
      exists: !!existingDeveloper,
      data: existingDeveloper
    };
  } catch (error) {
    logger.error('Error checking developer existence:', error);
    throw error;
  }
};

/**
 * Update ListingDraft status
 * @param {number} draftId - Draft ID
 * @param {string} status - New status
 * @returns {Promise<object>} - Result object
 */
const updateDraftStatus = async (draftId, status) => {
  try {
    const draft = await ListingDraft.findByPk(draftId);
    
    if (!draft) {
      return {
        success: false,
        message: 'Draft not found'
      };
    }

    await draft.update({ draftStatus: status });

    return {
      success: true,
      message: `Draft status updated to ${status}`
    };
  } catch (error) {
    logger.error('Error updating draft status:', error);
    throw error;
  }
};

/**
 * Publish developer profile - Complete workflow
 * Handles validation, creation/update, credit deduction, and status updates
 * 
 * @param {number} userId - User ID
 * @param {number} draftId - Draft ID
 * @returns {Promise<object>} - Publishing result
 */
const publishDeveloper = async (userId, draftId) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    logger.info(`[Developer Publishing] Starting for user ${userId}, draft ${draftId}`);
    
    // Fetch developer data from draft
    const draftDataResult = await getDeveloperDraftData(draftId);
    
    if (!draftDataResult.success) {
      await transaction.rollback();
      logger.error(`[Developer Publishing] Failed to fetch draft data:`, draftDataResult.message);
      return {
        success: false,
        message: draftDataResult.message || 'Failed to fetch developer draft data'
      };
    }
    
    const developerData = draftDataResult.data;
    logger.info(`[Developer Publishing] Developer data fetched successfully`);
    
    // Validate developer data
    const validationResult = await validateDeveloperData(userId, draftId, developerData);
    
    if (!validationResult.success) {
      await transaction.rollback();
      logger.error(`[Developer Publishing] Validation failed:`, validationResult.errors);
      return {
        success: false,
        message: 'Validation failed',
        errors: validationResult.errors
      };
    }
    
    logger.info(`[Developer Publishing] Validation successful`);
    
    // Check if developer already exists
    const checkResult = await checkDeveloperExistsByDraft(draftId);
    
    if (!checkResult.success) {
      await transaction.rollback();
      logger.error(`[Developer Publishing] Failed to check developer existence`);
      return {
        success: false,
        message: 'Failed to check developer existence'
      };
    }
    
    let developer;
    let developerId;
    let action;
    
    // Create or update based on existence
    if (checkResult.exists) {
      logger.info(`[Developer Publishing] Updating existing developer ${checkResult.data.developerId}`);
      
      const updateResult = await updateDeveloper(
        checkResult.data.developerId,
        userId,
        developerData
      );
      
      if (!updateResult.success) {
        await transaction.rollback();
        logger.error(`[Developer Publishing] Failed to update developer record`);
        return {
          success: false,
          message: updateResult.message || 'Failed to update developer record'
        };
      }
      
      developer = updateResult.data;
      developerId = developer.developerId;
      action = 'updated';
      
    } else {
      logger.info(`[Developer Publishing] Creating new developer record`);
      
      const createResult = await createDeveloper(userId, draftId, developerData);
      
      if (!createResult.success) {
        await transaction.rollback();
        logger.error(`[Developer Publishing] Failed to create developer record`);
        return {
          success: false,
          message: createResult.message || 'Failed to create developer record'
        };
      }
      
      developer = createResult.data;
      developerId = developer.developerId;
      action = 'created';
    }
    
    logger.info(`[Developer Publishing] Developer record ${action} with ID: ${developerId}`);
    
    // Deduct publishing credits
    logger.info(`[Developer Publishing] Deducting publishing credits`);
    
    const creditResult = await WalletService.debitFromWallet(
      userId,
      10,
      'Developer listing published',
      { developerId, type: 'DEVELOPER_PUBLISH' }
    );
    
    if (!creditResult.success) {
      await transaction.rollback();
      logger.error(`[Developer Publishing] Failed to deduct credits:`, creditResult.message);
      return {
        success: false,
        message: creditResult.message || 'Failed to deduct publishing credits',
      };
    }
    
    logger.info(`[Developer Publishing] Credits deducted successfully. New balance: ${creditResult.newBalance}`);
    
    // Update draft status to PUBLISHED
    logger.info(`[Developer Publishing] Updating draft status`);
    
    try {
      await updateDraftStatus(draftId, 'PUBLISHED');
      logger.info(`[Developer Publishing] Draft status updated to PUBLISHED`);
    } catch (updateError) {
      logger.error(`[Developer Publishing] Failed to update draft status:`, updateError);
    }
    
    await transaction.commit();
    logger.info(`[Developer Publishing] Process completed successfully`);
    
    return {
      success: true,
      message: `Developer profile ${action} successfully`,
      data: {
        developerId,
        isUpdate: action === 'updated',
        developer: {
          developerId: developer.developerId,
          developerName: developer.developerName,
          publishStatus: developer.publishStatus,
          verificationStatus: developer.verificationStatus
        }
      }
    };
    
  } catch (error) {
    await transaction.rollback();
    logger.error(`[Developer Publishing] Process error:`, error);
    
    return {
      success: false,
      message: error.message || 'Failed to publish developer profile',
      error: error.toString()
    };
  }
};

export default { 
  createDeveloper, 
  updateDeveloper, 
  getDeveloperById, 
  getDevelopersByUserId, 
  listDevelopers, 
  updatePublishStatus, 
  updateVerificationStatus, 
  deleteDeveloper,
  getDeveloperDraftData,
  validateDeveloperData,
  checkDeveloperExistsByDraft,
  updateDraftStatus,
  publishDeveloper
};
