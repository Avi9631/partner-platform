
import db from '../entity/index.js';
import logger from '../config/winston.config.js';
import { s3, defaultBucket } from '../config/s3.config.js';
import WalletService from './WalletService.service.js';
import path from 'path';

const getInitials = (name) => {
  const trimmedName = name.trim();

  if (!trimmedName.includes(" ")) {
    return trimmedName.slice(0, 2).toUpperCase();
  }

  const words = trimmedName.split(" ").filter((word) => word.length > 0);
  const initials = words.map((word) => word.charAt(0).toUpperCase()).join("");

  return initials.slice(0, 2);
};

/**
 * Get user by userId or email
 * @param {number} userId - User ID
 * @param {string} email - User email
 * @returns {Promise<Object>} User data
 */
async function getUser(userId, email) {
  if (!userId && !email) {
    throw new Error("User ID or email is required");
  }

  try {
    const userData = await db.PlatformUser.findOne({
      where: {
        ...(email && { email: email }),
        ...(userId && { userId: userId }),
      },
      attributes: {
        exclude: ["user_deleted_at"], // Exclude sensitive/unnecessary fields
      },
      include: [
        {
          model: db.PartnerBusiness,
          as: "business",
          required: false, // LEFT JOIN - user may not have a business yet
        },
      ],
    });

    if (!userData) {
      logger.warn(`User not found with ${userId ? `ID: ${userId}` : `email: ${email}`}`);
      throw new Error("User not found");
    }

    return userData.toJSON();
  } catch (error) {
    logger.error("Error in getUser:", error);
    throw error;
  }
}

/**
 * Update user information
 * @param {number} userId - User ID
 * @param {Object} updateData - Data to update
 * @param {boolean} isProfileCompletion - Whether this is a profile completion update
 * @returns {Promise<Object>} Updated user data
 */
async function updateUser(userId, updateData, isProfileCompletion = false) {
  const transaction = await db.sequelize.transaction();
  
  try {
    const user = await db.PlatformUser.findByPk(userId, { transaction });

    if (!user) {
      await transaction.rollback();
      throw new Error("User not found");
    }

    // Update name initial if firstName or lastName changed
    if (updateData.firstName || updateData.lastName) {
      const firstName = updateData.firstName || user.firstName;
      const lastName = updateData.lastName || user.lastName;
      updateData.nameInitial = getInitials(`${firstName} ${lastName}`);
    }

    // If completing profile, mark as completed and activate user
    if (isProfileCompletion) {
      updateData.profileCompleted = true;
      updateData.userStatus = 'ACTIVE';
    }

    // Prevent updating sensitive fields
    delete updateData.userId;
    delete updateData.emailVerifiedAt;
    delete updateData.phoneVerifiedAt;
    delete updateData.completeProfile; // Remove the flag from actual update

    // Update user
    await user.update(updateData, { transaction });

    await transaction.commit();
    logger.info(`User ${userId} updated successfully${isProfileCompletion ? ' (profile completed)' : ''}`);
    return user.toJSON();
  } catch (error) {
    await transaction.rollback();
    logger.error(`Error updating user ${userId}:`, error);
    throw error;
  }
}

/**
 * Verify user phone number
 * @param {number} userId - User ID
 * @param {string} phone - Phone number
 * @param {string} verificationCode - Verification code (for future OTP implementation)
 * @returns {Promise<Object>} Updated user data
 */
async function verifyPhone(userId, phone, verificationCode = null) {
  try {
    const user = await db.PlatformUser.findByPk(userId);

    if (!user) {
      throw new Error("User not found");
    }

    // TODO: Implement actual OTP verification logic here
    // For now, we'll just update the phone and mark as verified

    if (verificationCode) {
      // In production, verify the code against stored OTP
      // const isValid = await verifyOTP(phone, verificationCode);
      // if (!isValid) throw new Error("Invalid verification code");
    }

    await user.update({
      phone: phone,
      phoneVerifiedAt: new Date(),
    });

    logger.info(`Phone verified for user ${userId}`);
    return user.toJSON();
  } catch (error) {
    logger.error(`Error verifying phone for user ${userId}:`, error);
    throw error;
  }
}

/**
 * Get all users with optional filters
 * @param {Object} filters - Filter options
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Promise<Object>} Paginated users data
 */
async function getAllUsers(filters = {}, page = 1, limit = 10) {
  try {
    const offset = (page - 1) * limit;

    const whereClause = {};
    
    if (filters.userStatus) {
      whereClause.userStatus = filters.userStatus;
    }
    
    if (filters.accountType) {
      whereClause.accountType = filters.accountType;
    }

    if (filters.search) {
      whereClause[db.Sequelize.Op.or] = [
        { firstName: { [db.Sequelize.Op.like]: `%${filters.search}%` } },
        { lastName: { [db.Sequelize.Op.like]: `%${filters.search}%` } },
        { email: { [db.Sequelize.Op.like]: `%${filters.search}%` } },
      ];
    }

    const { count, rows } = await db.PlatformUser.findAndCountAll({
      where: whereClause,
      limit: limit,
      offset: offset,
      order: [["user_created_at", "DESC"]],
      attributes: {
        exclude: ["user_deleted_at"],
      },
    });

    return {
      users: rows.map(user => user.toJSON()),
      pagination: {
        total: count,
        page: page,
        limit: limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  } catch (error) {
    logger.error("Error fetching all users:", error);
    throw error;
  }
}

/**
 * Update user status
 * @param {number} userId - User ID
 * @param {string} newStatus - New status (PENDING, APPROVED, REJECTED, ACTIVE, INACTIVE, SUSPENDED)
 * @returns {Promise<Object>} Updated user data
 */
async function updateUserStatus(userId, newStatus) {
  const validStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'ACTIVE', 'INACTIVE', 'SUSPENDED'];
  
  if (!validStatuses.includes(newStatus)) {
    throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
  }

  try {
    const user = await db.PlatformUser.findByPk(userId);

    if (!user) {
      throw new Error("User not found");
    }

    await user.update({ userStatus: newStatus });

    logger.info(`User ${userId} status updated to ${newStatus}`);
    return user.toJSON();
  } catch (error) {
    logger.error(`Error updating status for user ${userId}:`, error);
    throw error;
  }
}

/**
 * Approve user verification
 * Sets verificationStatus to APPROVED and profileCompleted to true
 * @param {number} userId - User ID
 * @param {string} verificationNotes - Optional verification notes
 * @param {number} verifiedBy - Admin user ID who approved
 * @returns {Promise<Object>} Updated user data
 */
async function approveVerification(userId, verificationNotes = null, verifiedBy = null) {
  try {
    const user = await db.PlatformUser.findByPk(userId);

    if (!user) {
      throw new Error("User not found");
    }

    await user.update({ 
      verificationStatus: 'APPROVED',
      profileCompleted: true, // Only set to true upon approval
      verificationNotes: verificationNotes,
      verifiedAt: new Date(),
      verifiedBy: verifiedBy
    });

    logger.info(`User ${userId} verification approved by ${verifiedBy || 'system'}`);
    return user.toJSON();
  } catch (error) {
    logger.error(`Error approving verification for user ${userId}:`, error);
    throw error;
  }
}

/**
 * Reject user verification
 * Sets verificationStatus to REJECTED
 * @param {number} userId - User ID
 * @param {string} verificationNotes - Rejection reason (required)
 * @returns {Promise<Object>} Updated user data
 */
async function rejectVerification(userId, verificationNotes) {
  try {
    const user = await db.PlatformUser.findByPk(userId);

    if (!user) {
      throw new Error("User not found");
    }

    await user.update({ 
      verificationStatus: 'REJECTED',
      verificationNotes: verificationNotes,
      profileCompleted: false // Ensure it stays false on rejection
    });

    logger.info(`User ${userId} verification rejected`);
    return user.toJSON();
  } catch (error) {
    logger.error(`Error rejecting verification for user ${userId}:`, error);
    throw error;
  }
}

/**
 * Update last login timestamp
 * @param {number} userId - User ID
 * @returns {Promise<void>}
 */
async function updateLastLogin(userId) {
  try {
    await db.PlatformUser.update(
      { lastLoginAt: new Date() },
      { where: { userId: userId } }
    );
    logger.info(`Last login updated for user ${userId}`);
  } catch (error) {
    logger.error(`Error updating last login for user ${userId}:`, error);
    // Don't throw error as this is not critical
  }
}

/**
 * Determine account type based on business verification
 * Account is BUSINESS if a verified partner business exists, otherwise INDIVIDUAL
 * @param {Object} user - User object with business relationship loaded
 * @returns {string} Account type ('BUSINESS' or 'INDIVIDUAL')
 */
function getAccountType(user) {
  return (user.business && user.business.verificationStatus === 'APPROVED') 
    ? 'BUSINESS' 
    : 'INDIVIDUAL';
}

/**
 * Validate profile data before onboarding
 * @param {Object} profileData - Profile data to validate
 * @returns {Object} Validation result
 */
function validateProfileData(profileData) {
  try {
    const errors = [];
    
    if (!profileData.firstName || profileData.firstName.trim().length === 0) {
      errors.push('First name is required');
    }
    
    if (!profileData.lastName || profileData.lastName.trim().length === 0) {
      errors.push('Last name is required');
    }
    
    if (!profileData.phone || profileData.phone.trim().length === 0) {
      errors.push('Phone number is required');
    } else {
      const phoneRegex = /^[+]?[\d\s\-()]+$/;
      if (!phoneRegex.test(profileData.phone)) {
        errors.push('Invalid phone number format');
      }
    }
    
    if (!profileData.latitude || !profileData.longitude) {
      errors.push('Location (latitude and longitude) is required');
    } else {
      const lat = parseFloat(profileData.latitude);
      const lon = parseFloat(profileData.longitude);
      
      if (isNaN(lat) || lat < -90 || lat > 90) {
        errors.push('Invalid latitude value (must be between -90 and 90)');
      }
      
      if (isNaN(lon) || lon < -180 || lon > 180) {
        errors.push('Invalid longitude value (must be between -180 and 180)');
      }
    }
    
    if (!profileData.videoBuffer) {
      errors.push('Profile verification video is required');
    }
    
    if (errors.length > 0) {
      return { success: false, errors };
    }
    
    return { success: true };
  } catch (error) {
    logger.error('Error validating profile data:', error);
    throw error;
  }
}

/**
 * Upload video to S3/Supabase storage
 * @param {Object} uploadData - Upload data
 * @returns {Promise<Object>} Upload result with video URL
 */
async function uploadVideoToStorage(uploadData) {
  const { userId, videoBuffer, originalFilename, videoMimetype } = uploadData;
  
  try {
    logger.info(`[Upload Video] Starting upload for user ${userId}`);
    
    if (!videoBuffer) {
      throw new Error('No video buffer provided');
    }
    
    const ext = path.extname(originalFilename || '.mp4');
    const timestamp = Date.now();
    const s3Key = `partner-profiles/${userId}/verification-video-${timestamp}${ext}`;
    
    const fileBuffer = Buffer.isBuffer(videoBuffer) 
      ? videoBuffer 
      : Buffer.from(videoBuffer);
    
    logger.info(`[Upload Video] Buffer size: ${fileBuffer.length} bytes`);
    
    const uploadParams = {
      Bucket: process.env.S3_PARTNER_PROFILE_BUCKET || defaultBucket,
      Key: s3Key,
      Body: fileBuffer,
      ContentType: videoMimetype || 'video/mp4',
      ACL: 'private',
    };
    
    logger.info(`[Upload Video] Uploading to S3: ${s3Key}`);
    const uploadResult = await s3.upload(uploadParams).promise();
    
    const videoUrl = uploadResult.Location || `${process.env.S3_ENDPOINT}/${uploadParams.Bucket}/${s3Key}`;
    
    logger.info(`[Upload Video] Upload successful for user ${userId}: ${videoUrl}`);
    
    return {
      success: true,
      videoUrl,
      s3Key,
    };
  } catch (error) {
    logger.error(`[Upload Video] Failed to upload video for user ${userId}:`, error);
    throw error;
  }
}

/**
 * Update partner user profile with video URL
 * @param {Object} updateData - Update data
 * @returns {Promise<Object>} Updated user
 */
async function updatePartnerProfile(updateData) {
  const { userId, profileData, videoUrl, verificationStatus } = updateData;
  
  try {
    logger.info(`[Update Partner User] Updating user ${userId}`);
    
    const user = await db.PlatformUser.findByPk(userId);
    
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }
    
    const updateFields = {
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      phone: profileData.phone,
      latitude: parseFloat(profileData.latitude),
      longitude: parseFloat(profileData.longitude),
      address: profileData.address,
      profileVideo: videoUrl,
      userStatus: 'ACTIVE',
      verificationStatus: verificationStatus || 'PENDING',
    };
    
    if (profileData.firstName || profileData.lastName) {
      const firstName = profileData.firstName || user.firstName;
      const lastName = profileData.lastName || user.lastName;
      updateFields.nameInitial = getInitials(`${firstName} ${lastName}`);
    }
    
    await user.update(updateFields);
    
    logger.info(`[Update Partner User] User ${userId} updated successfully`);
    
    return {
      success: true,
      user: user.toJSON(),
    };
  } catch (error) {
    logger.error(`[Update Partner User] Failed to update user ${userId}:`, error);
    throw error;
  }
}

/**
 * Complete partner user onboarding workflow
 * @param {Object} workflowInput - Workflow input data
 * @returns {Promise<Object>} Onboarding result
 */
async function completePartnerOnboarding(workflowInput) {
  const { 
    userId, 
    email, 
    profileData, 
    videoBuffer, 
    originalFilename,
    videoMimetype,
  } = workflowInput;
  
  const transaction = await db.sequelize.transaction();
  logger.info(`[Partner Onboarding] Starting for user ${userId}`);
  
  try {
    // Validate profile data
    logger.info(`[Partner Onboarding] Validating profile data`);
    
    const validationResult = validateProfileData({
      userId,
      ...profileData,
      videoBuffer,
    });
    
    if (!validationResult.success) {
      await transaction.rollback();
      logger.error(`[Partner Onboarding] Validation failed:`, validationResult.errors);
      return {
        success: false,
        message: `Profile validation failed: ${validationResult.errors.join(', ')}`,
        errors: validationResult.errors
      };
    }
    
    logger.info(`[Partner Onboarding] Profile validation successful`);
    
    // Upload verification video
    logger.info(`[Partner Onboarding] Uploading verification video`);
    
    const uploadResult = await uploadVideoToStorage({
      videoBuffer,
      originalFilename,
      videoMimetype,
      userId,
    });
    
    if (!uploadResult.success) {
      await transaction.rollback();
      logger.error(`[Partner Onboarding] Video upload failed`);
      return {
        success: false,
        message: 'Video upload failed'
      };
    }
    
    logger.info(`[Partner Onboarding] Video uploaded successfully: ${uploadResult.videoUrl}`);
    
    // Update partner user with profile data and video URL
    logger.info(`[Partner Onboarding] Updating user profile with video URL`);
    
    const updateResult = await updatePartnerProfile({
      userId,
      profileData,
      videoUrl: uploadResult.videoUrl,
      verificationStatus: 'PENDING',
    });
    
    if (!updateResult.success) {
      await transaction.rollback();
      logger.error(`[Partner Onboarding] User update failed`);
      return {
        success: false,
        message: 'User update failed'
      };
    }
    
    logger.info(`[Partner Onboarding] User profile updated successfully`);
    
    // Add welcome bonus credits
    logger.info(`[Partner Onboarding] Adding welcome bonus credits`);
    
    try {
      const creditResult = await WalletService.addFunds({
        userId,
        amount: 200,
        reason: 'Welcome bonus for completing profile onboarding',
        metadata: { type: 'ONBOARDING_BONUS', workflowType: 'partnerUserOnboarding' },
      });
      
      if (creditResult.success) {
        logger.info(`[Partner Onboarding] Added 200 credits to user wallet`);
      } else {
        logger.warn(`[Partner Onboarding] Failed to add credits: ${creditResult.message}`);
      }
    } catch (creditError) {
      logger.error(`[Partner Onboarding] Error adding credits:`, creditError);
      // Don't fail the onboarding if credits fail
    }
    
    await transaction.commit();
    logger.info(`[Partner Onboarding] Process completed successfully for user ${userId}`);
    
    return {
      success: true,
      userId,
      message: 'Partner user profile submitted for verification successfully',
      data: {
        profileSetupSubmitted: true,
        verificationStatus: 'PENDING',
        videoUrl: uploadResult.videoUrl,
        user: updateResult.user,
      },
    };
  } catch (error) {
    await transaction.rollback();
    logger.error(`[Partner Onboarding] Process error for user ${userId}:`, error);
    
    return {
      success: false,
      userId,
      message: `Partner user onboarding failed: ${error.message}`,
      error: error.message,
    };
  }
}

export default {
  getUser,
  updateUser,
  verifyPhone,
  getAllUsers,
  updateUserStatus,
  approveVerification,
  rejectVerification,
  updateLastLogin,
  getAccountType,
  validateProfileData,
  uploadVideoToStorage,
  updatePartnerProfile,
  completePartnerOnboarding,
};
