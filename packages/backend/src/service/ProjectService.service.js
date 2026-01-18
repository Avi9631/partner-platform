import db from '../entity/index.js';
import { Op } from 'sequelize';
import logger from '../config/winston.config.js';
import WalletService from './WalletService.service.js';

const Project = db.Project;
const PlatformUser = db.PlatformUser;
const ListingDraft = db.ListingDraft;

/**
 * Create a new project record from draft data
 * @param {number} userId - User ID
 * @param {number} draftId - Draft ID (required, ensures one draft = one publish)
 * @param {object} projectData - Project data
 * @returns {Promise<object>} - Result object
 */
const createProject = async (userId, draftId, projectData) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    logger.info(`Creating project for user ${userId}, draft ${draftId}`);

    // Validate user exists
    const user = await PlatformUser.findByPk(userId, { transaction });
    if (!user) {
      await transaction.rollback();
      return {
        success: false,
        message: 'User not found',
        statusCode: 404
      };
    }

    // Prepare project data
    const projectRecord = {
      projectName: projectData.projectName || projectData.name,
      createdBy: userId,
      status: projectData.status || 'ACTIVE',
      
      // Location
      lat: projectData.coordinates?.lat || projectData.lat || null,
      lng: projectData.coordinates?.lng || projectData.lng || null,
      location: (projectData.coordinates?.lat && projectData.coordinates?.lng) 
        ? { type: 'Point', coordinates: [projectData.coordinates.lng, projectData.coordinates.lat] }
        : (projectData.lat && projectData.lng)
        ? { type: 'Point', coordinates: [projectData.lng, projectData.lat] }
        : null,
      
      // Project details as JSONB
      projectDetails: {
        description: projectData.description || null,
        city: projectData.city || null,
        locality: projectData.locality || null,
        area: projectData.area || null,
        addressText: projectData.addressText || null,
        landmark: projectData.landmark || null,
        
        // Project specifications
        totalUnits: projectData.totalUnits || null,
        totalTowers: projectData.totalTowers || null,
        totalAcres: projectData.totalAcres || null,
        launchDate: projectData.launchDate || null,
        possessionDate: projectData.possessionDate || null,
        completionDate: projectData.completionDate || null,
        projectStatus: projectData.projectStatus || null, // Upcoming, Ongoing, Completed
        
        // Amenities and Features
        amenities: projectData.amenities || [],
        features: projectData.features || [],
        
        // Media
        images: projectData.images || [],
        videos: projectData.videos || [],
        brochure: projectData.brochure || null,
        floorPlans: projectData.floorPlans || [],
        
        // Developer info (if provided)
        developerName: projectData.developerName || null,
        developerId: projectData.developerId || null,
        
        // Pricing
        priceRange: projectData.priceRange || null,
        
        // Additional metadata
        reraNumber: projectData.reraNumber || null,
        projectType: projectData.projectType || null, // Residential, Commercial, Mixed
        
        // Any other custom fields
        ...projectData.customFields
      }
    };

    // Create project
    const project = await Project.create(projectRecord, { transaction });

    await transaction.commit();
    logger.info(`Project created successfully with ID: ${project.projectId}`);

    return {
      success: true,
      message: 'Project created successfully',
      statusCode: 201,
      data: {
        projectId: project.projectId,
        projectName: project.projectName,
        status: project.status,
        location: {
          lat: project.lat,
          lng: project.lng
        },
        createdAt: project.project_created_at
      }
    };

  } catch (error) {
    await transaction.rollback();
    logger.error(`Error creating project: ${error.message}`, {
      userId,
      draftId,
      error: error.stack
    });

    return {
      success: false,
      message: 'Failed to create project',
      statusCode: 500,
      error: error.message
    };
  }
};

/**
 * Update an existing project
 * @param {number} projectId - Project ID
 * @param {number} userId - User ID
 * @param {object} projectData - Updated project data
 * @returns {Promise<object>} - Result object
 */
const updateProject = async (projectId, userId, projectData) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    logger.info(`Updating project ${projectId} for user ${userId}`);

    // Find existing project
    const project = await Project.findOne({
      where: {
        projectId,
        createdBy: userId
      },
      transaction
    });

    if (!project) {
      await transaction.rollback();
      return {
        success: false,
        message: 'Project not found or unauthorized',
        statusCode: 404
      };
    }

    // Prepare update data
    const updateData = {};

    if (projectData.projectName || projectData.name) {
      updateData.projectName = projectData.projectName || projectData.name;
    }

    if (projectData.status) {
      updateData.status = projectData.status;
    }

    // Update location if provided
    if (projectData.coordinates?.lat && projectData.coordinates?.lng) {
      updateData.lat = projectData.coordinates.lat;
      updateData.lng = projectData.coordinates.lng;
      updateData.location = {
        type: 'Point',
        coordinates: [projectData.coordinates.lng, projectData.coordinates.lat]
      };
    } else if (projectData.lat && projectData.lng) {
      updateData.lat = projectData.lat;
      updateData.lng = projectData.lng;
      updateData.location = {
        type: 'Point',
        coordinates: [projectData.lng, projectData.lat]
      };
    }

    // Merge project details
    if (Object.keys(projectData).length > 0) {
      const existingDetails = project.projectDetails || {};
      updateData.projectDetails = {
        ...existingDetails,
        description: projectData.description || existingDetails.description,
        city: projectData.city || existingDetails.city,
        locality: projectData.locality || existingDetails.locality,
        area: projectData.area || existingDetails.area,
        addressText: projectData.addressText || existingDetails.addressText,
        landmark: projectData.landmark || existingDetails.landmark,
        totalUnits: projectData.totalUnits || existingDetails.totalUnits,
        totalTowers: projectData.totalTowers || existingDetails.totalTowers,
        totalAcres: projectData.totalAcres || existingDetails.totalAcres,
        launchDate: projectData.launchDate || existingDetails.launchDate,
        possessionDate: projectData.possessionDate || existingDetails.possessionDate,
        completionDate: projectData.completionDate || existingDetails.completionDate,
        projectStatus: projectData.projectStatus || existingDetails.projectStatus,
        amenities: projectData.amenities || existingDetails.amenities,
        features: projectData.features || existingDetails.features,
        images: projectData.images || existingDetails.images,
        videos: projectData.videos || existingDetails.videos,
        brochure: projectData.brochure || existingDetails.brochure,
        floorPlans: projectData.floorPlans || existingDetails.floorPlans,
        developerName: projectData.developerName || existingDetails.developerName,
        developerId: projectData.developerId || existingDetails.developerId,
        priceRange: projectData.priceRange || existingDetails.priceRange,
        reraNumber: projectData.reraNumber || existingDetails.reraNumber,
        projectType: projectData.projectType || existingDetails.projectType,
        ...(projectData.customFields || {})
      };
    }

    // Update project
    await project.update(updateData, { transaction });

    await transaction.commit();
    logger.info(`Project ${projectId} updated successfully`);

    return {
      success: true,
      message: 'Project updated successfully',
      statusCode: 200,
      data: {
        projectId: project.projectId,
        projectName: project.projectName,
        status: project.status,
        updatedAt: project.project_updated_at
      }
    };

  } catch (error) {
    await transaction.rollback();
    logger.error(`Error updating project: ${error.message}`, {
      projectId,
      userId,
      error: error.stack
    });

    return {
      success: false,
      message: 'Failed to update project',
      statusCode: 500,
      error: error.message
    };
  }
};

/**
 * Get project by ID
 * @param {number} projectId - Project ID
 * @returns {Promise<object>} - Result object
 */
const getProjectById = async (projectId) => {
  try {
    const project = await Project.findByPk(projectId, {
      include: [
        {
          model: PlatformUser,
          as: 'creator',
          attributes: ['userId', 'firstName', 'lastName', 'email', 'mobile']
        }
      ]
    });

    if (!project) {
      return {
        success: false,
        message: 'Project not found',
        statusCode: 404
      };
    }

    return {
      success: true,
      data: project,
      statusCode: 200
    };

  } catch (error) {
    logger.error(`Error fetching project: ${error.message}`, { projectId });
    return {
      success: false,
      message: 'Failed to fetch project',
      statusCode: 500,
      error: error.message
    };
  }
};

/**
 * List projects with filters and pagination
 * @param {object} filters - Filter criteria
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Promise<object>} - Result object
 */
const listProjects = async (filters = {}, page = 1, limit = 20) => {
  try {
    const where = {};



    // Status filter
    if (filters.status) {
      where.status = filters.status;
    }

    // City filter (from projectDetails JSONB)
    if (filters.city) {
      where['projectDetails.city'] = filters.city;
    }

    // Search by project name
    if (filters.search) {
      where.projectName = {
        [Op.iLike]: `%${filters.search}%`
      };
    }

    // Created by specific user
    if (filters.createdBy) {
      where.createdBy = filters.createdBy;
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await Project.findAndCountAll({
      where,
      limit,
      offset,
      order: [['project_created_at', 'DESC']],
      include: [
        {
          model: PlatformUser,
          as: 'creator',
          attributes: ['userId', 'firstName', 'lastName', 'email']
        }
      ]
    });

    return {
      success: true,
      data: {
        projects: rows,
        pagination: {
          total: count,
          page,
          limit,
          totalPages: Math.ceil(count / limit)
        }
      },
      statusCode: 200
    };

  } catch (error) {
    logger.error(`Error listing projects: ${error.message}`, { filters });
    return {
      success: false,
      message: 'Failed to list projects',
      statusCode: 500,
      error: error.message
    };
  }
};

/**
 * Get user's projects
 * @param {number} userId - User ID
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Promise<object>} - Result object
 */
const getMyProjects = async (userId, page = 1, limit = 20) => {
  try {
    const offset = (page - 1) * limit;

    const { count, rows } = await Project.findAndCountAll({
      where: { createdBy: userId },
      limit,
      offset,
      order: [['project_created_at', 'DESC']]
    });

    return {
      success: true,
      data: {
        projects: rows,
        pagination: {
          total: count,
          page,
          limit,
          totalPages: Math.ceil(count / limit)
        }
      },
      statusCode: 200
    };

  } catch (error) {
    logger.error(`Error fetching user projects: ${error.message}`, { userId });
    return {
      success: false,
      message: 'Failed to fetch user projects',
      statusCode: 500,
      error: error.message
    };
  }
};

/**
 * Delete/archive a project
 * @param {number} projectId - Project ID
 * @param {number} userId - User ID
 * @returns {Promise<object>} - Result object
 */
const deleteProject = async (projectId, userId) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const project = await Project.findOne({
      where: {
        projectId,
        createdBy: userId
      },
      transaction
    });

    if (!project) {
      await transaction.rollback();
      return {
        success: false,
        message: 'Project not found or unauthorized',
        statusCode: 404
      };
    }

    // Soft delete (paranoid mode)
    await project.destroy({ transaction });

    await transaction.commit();
    logger.info(`Project ${projectId} deleted successfully`);

    return {
      success: true,
      message: 'Project deleted successfully',
      statusCode: 200
    };

  } catch (error) {
    await transaction.rollback();
    logger.error(`Error deleting project: ${error.message}`, { projectId, userId });
    return {
      success: false,
      message: 'Failed to delete project',
      statusCode: 500,
      error: error.message
    };
  }
};

/**
 * Search projects near a location using PostGIS
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @param {number} radiusKm - Search radius in kilometers
 * @param {object} filters - Additional filter criteria
 * @returns {Promise<object>} - Result object
 */
const searchNearbyProjects = async (latitude, longitude, radiusKm, filters = {}) => {
  try {
    const {
      status,
      city,
      search,
      page = 1,
      limit = 20
    } = filters;

    const whereClause = {};

    // Apply additional filters
    if (status) {
      whereClause.status = status;
    }

    // Search filter (project name)
    if (search) {
      whereClause.projectName = {
        [Op.iLike]: `%${search}%`
      };
    }

    // City filter from projectDetails JSONB
    let havingClause = null;
    if (city) {
      havingClause = db.sequelize.literal(
        `project_details->>'city' ILIKE '%${city}%'`
      );
    }

    // Convert radius from km to meters for PostGIS
    const radiusMeters = radiusKm * 1000;

    // Pagination
    const offset = (page - 1) * limit;

    // Build base where conditions as array
    const whereConditions = [];
    
    // Add spatial query using raw SQL for PostGIS
    whereConditions.push(
      db.sequelize.literal(
        `ST_DWithin(
          location::geography,
          ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography,
          ${radiusMeters}
        )`
      )
    );

    // Add city filter if provided
    if (havingClause) {
      whereConditions.push(havingClause);
    }

    // Use PostGIS ST_DWithin for efficient spatial query
    const { rows, count } = await Project.findAndCountAll({
      where: {
        ...whereClause,
        [Op.and]: whereConditions
      },
      attributes: {
        include: [
          // Calculate distance in kilometers and include it in results
          [
            db.sequelize.literal(
              `ROUND(CAST(ST_Distance(location::geography, ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography) / 1000 AS numeric), 2)`
            ),
            'distance_km'
          ]
        ]
      },
      include: [
        {
          model: PlatformUser,
          as: 'creator',
          attributes: ['userId', 'firstName', 'lastName', 'email', 'phone']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      // Order by distance (nearest first)
      order: db.sequelize.literal(
        `ST_Distance(location::geography, ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography) ASC`
      ),
      subQuery: false
    });

    return {
      success: true,
      data: {
        projects: rows,
        searchCenter: {
          lat: latitude,
          lng: longitude,
          radiusKm
        },
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    };
  } catch (error) {
    logger.error('Error searching nearby projects:', error);
    throw error;
  }
};

/**
 * Validate project data
 * @param {object} projectData - Project data
 * @returns {object} - Validation result
 */
const validateProjectData = async (userId, draftId, projectData) => {
  try {
    const errors = [];

    if (!projectData.projectName && !projectData.name) {
      errors.push('Project name is required');
    }

    if (errors.length > 0) {
      return {
        success: false,
        errors
      };
    }

    return {
      success: true
    };
  } catch (error) {
    logger.error('Error validating project data:', error);
    throw error;
  }
};

/**
 * Update project draft status
 * @param {number} draftId - Draft ID
 * @param {string} status - New status
 * @param {number} publishedId - Published project ID
 * @param {string} publishedType - Published type
 * @returns {Promise<object>} - Result
 */
const updateProjectDraftStatus = async (draftId, status, publishedId = null, publishedType = null) => {
  try {
    const draft = await ListingDraft.findByPk(draftId);
    
    if (!draft) {
      return {
        success: false,
        message: 'Draft not found'
      };
    }

    const updateData = { draftStatus: status };
    if (publishedId) updateData.publishedId = publishedId;
    if (publishedType) updateData.publishedType = publishedType;

    await draft.update(updateData);

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
 * Publish project - Complete workflow
 * @param {number} userId - User ID
 * @param {number} draftId - Draft ID
 * @param {object} projectData - Project data
 * @returns {Promise<object>} - Publishing result
 */
const publishProject = async (userId, draftId, projectData) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    logger.info(`[Project Publishing] Starting for user ${userId}`);
    
    // Validate project data
    const validationResult = await validateProjectData(userId, draftId, projectData);
    
    if (!validationResult.success) {
      await transaction.rollback();
      logger.error(`[Project Publishing] Validation failed:`, validationResult.errors);
      return {
        success: false,
        message: 'Project data validation failed',
        errors: validationResult.errors,
      };
    }
    
    logger.info(`[Project Publishing] Validation successful`);
    
    // Create or update project record
    let projectResult;
    if (projectData.projectId) {
      projectResult = await updateProject(projectData.projectId, userId, projectData);
    } else {
      projectResult = await createProject(userId, draftId, projectData);
    }
    
    if (!projectResult.success) {
      await transaction.rollback();
      logger.error(`[Project Publishing] Project creation/update failed`);
      return {
        success: false,
        message: projectResult.error || 'Failed to create/update project',
      };
    }
    
    const projectId = projectResult.data.projectId;
    logger.info(`[Project Publishing] Project record saved: ID ${projectId}`);
    
    // Deduct publishing credits
    const creditResult = await WalletService.debitFromWallet(
      userId,
      10,
      'Project listing published',
      { projectId, type: 'PROJECT_PUBLISH' }
    );
    
    if (!creditResult.success) {
      await transaction.rollback();
      logger.error(`[Project Publishing] Failed to deduct credits:`, creditResult.message);
      return {
        success: false,
        message: creditResult.message || 'Failed to deduct publishing credits',
      };
    }
    
    logger.info(`[Project Publishing] Credits deducted successfully`);
    
    // Update draft status if draft was provided
    if (draftId) {
      await updateProjectDraftStatus(draftId, 'PUBLISHED', projectId, 'PROJECT');
      logger.info(`[Project Publishing] Draft status updated`);
    }
    
    await transaction.commit();
    return {
      success: true,
      message: 'Project published successfully',
      data: {
        projectId,
        projectName: projectResult.data.projectName
      }
    };
    
  } catch (error) {
    await transaction.rollback();
    logger.error(`[Project Publishing] Process error:`, error);
    return {
      success: false,
      message: error.message || 'Project publishing failed',
      error: error.toString(),
    };
  }
};

export default { 
  createProject, 
  updateProject, 
  getProjectById, 
  listProjects, 
  getMyProjects, 
  deleteProject, 
  searchNearbyProjects,
  validateProjectData,
  updateProjectDraftStatus,
  publishProject
};
