import PropertyService from '../service/PropertyService.service.js';
import { sendErrorResponse, sendSuccessResponse } from '../utils/responseFormatter.js';
import logger from '../config/winston.config.js';
import db from '../entity/index.js';

const ListingDraft = db.ListingDraft;
const Property = db.Property;

/**
 * Publish property - Create property record and trigger workflow
 * POST /api/property/publishProperty
 * @body { draftId: number } - Draft ID (property data will be fetched from draft)
 */
const publishProperty = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { draftId } = req.body;

    // Validate Draft ID
    if (!draftId) {
      logger.error('[Property Publishing] Draft ID missing in request');
      return sendErrorResponse(res, 'Draft ID is required', 400);
    }

    logger.info(`[Property Publishing] Starting publish process for draft ${draftId}, user ${userId}`);

    // Fetch and Validate Draft
    const draft = await ListingDraft.findOne({
      where: {
        draftId: draftId,
        userId: userId,
        draftType: 'PROPERTY'
      }
    });

    if (!draft) {
      logger.error(`[Property Publishing] Draft not found - draftId: ${draftId}, userId: ${userId}`);
      return sendErrorResponse(
        res,
        'Draft not found or you do not have permission to access it',
        404
      );
    }

    // Check if draft has data
    if (!draft.draftData || typeof draft.draftData !== 'object') {
      logger.error(`[Property Publishing] Draft ${draftId} has no valid data`);
      return sendErrorResponse(
        res,
        'Draft has no property data',
        400
      );
    }

    logger.info(`[Property Publishing] Draft validated successfully - status: ${draft.draftStatus}`);

    // Check for Existing Property (Update vs Create)
    const existingProperty = await Property.findOne({
      where: { draftId }
    });

    const isUpdate = !!existingProperty;

    if (isUpdate) {
      logger.info(`[Property Publishing] Existing property found: ${existingProperty.propertyId} - will update`);
    } else {
      logger.info(`[Property Publishing] No existing property - will create new`);
    }

    // Execute publishing process
    logger.info(`[Property Publishing] Starting publishing process`);
    
    const result = await PropertyService.publishProperty(userId, draftId);

    if (!result.success) {
      logger.error(`[Property Publishing] Publishing failed: ${result.message}`);
      return sendErrorResponse(res, result.message || 'Property publishing failed', 400);
    }

    logger.info(`[Property Publishing] Publishing completed successfully`);

    // Return Response
    const propertyType = draft.draftData['property-type']?.propertyType;
    const locationData = draft.draftData['location-selection'];
    const listingInfo = draft.draftData['listing-info'];

    return sendSuccessResponse(
      res,
      { 
        draftId,
        isUpdate,
        propertyPreview: {
          name: listingInfo?.title || 'Untitled Property',
          type: propertyType,
          city: locationData?.city,
          locality: locationData?.locality
        },
        message: `Property ${isUpdate ? 'updated' : 'published'} successfully`
      },
      `Property has been ${isUpdate ? 'updated' : 'published'} successfully.`,
      200
    );
  } catch (error) {
    logger.error('[Property Publishing] Unexpected error:', error);
    return sendErrorResponse(
      res,
      'An error occurred while publishing property',
      500
    );
  }
};

/**
 * Get user's properties
 * GET /api/property/my-properties
 */
const getMyProperties = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await PropertyService.getUserProperties(userId);

    if (result.success) {
      return sendSuccessResponse(
        res,
        result.data,
        'Properties fetched successfully'
      );
    } else {
      return sendErrorResponse(
        res,
        result.message || 'Failed to fetch properties',
        result.statusCode || 500
      );
    }
  } catch (error) {
    logger.error('Error fetching user properties:', error);
    return sendErrorResponse(
      res,
      'An error occurred while fetching properties',
      500
    );
  }
};

/**
 * Get property by ID
 * GET /api/property/:propertyId
 */
const getPropertyById = async (req, res) => {
  try {
    const { propertyId } = req.params;

    if (!propertyId) {
      return sendErrorResponse(res, 'Property ID is required', 400);
    }

    const result = await PropertyService.getPropertyById(parseInt(propertyId));

    if (result.success) {
      return sendSuccessResponse(
        res,
        result.data,
        'Property fetched successfully'
      );
    } else {
      return sendErrorResponse(
        res,
        result.message || 'Property not found',
        result.statusCode || 404
      );
    }
  } catch (error) {
    logger.error('Error fetching property:', error);
    return sendErrorResponse(
      res,
      'An error occurred while fetching property',
      500
    );
  }
};

/**
 * List properties with filters and pagination
 * GET /api/property/list
 */
const listProperties = async (req, res) => {
  try {
    const {
      status,
      projectId,
      city,
      locality,
      propertyType,
      listingType,
      bedrooms,
      minPrice,
      maxPrice,
      search,
      page = 1,
      limit = 10
    } = req.query;

    const result = await PropertyService.listProperties({
      status,
      projectId: projectId ? parseInt(projectId) : null,
      city,
      locality,
      propertyType,
      listingType,
      bedrooms,
      minPrice: minPrice ? parseFloat(minPrice) : null,
      maxPrice: maxPrice ? parseFloat(maxPrice) : null,
      search,
      page: parseInt(page),
      limit: parseInt(limit)
    });

    if (result.success) {
      return sendSuccessResponse(
        res,
        result.data,
        'Properties fetched successfully'
      );
    } else {
      return sendErrorResponse(
        res,
        result.message || 'Failed to fetch properties',
        result.statusCode || 500
      );
    }
  } catch (error) {
    logger.error('Error listing properties:', error);
    return sendErrorResponse(
      res,
      'An error occurred while listing properties',
      500
    );
  }
};

/**
 * Update property
 * PUT /api/property/:propertyId
 */
const updateProperty = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { propertyId } = req.params;
    const updateData = req.body;

    if (!propertyId) {
      return sendErrorResponse(res, 'Property ID is required', 400);
    }

    const result = await PropertyService.updateProperty(
      parseInt(propertyId),
      userId,
      updateData
    );

    if (result.success) {
      return sendSuccessResponse(
        res,
        result.data,
        'Property updated successfully'
      );
    } else {
      return sendErrorResponse(
        res,
        result.message || 'Failed to update property',
        result.statusCode || 400
      );
    }
  } catch (error) {
    logger.error('Error updating property:', error);
    return sendErrorResponse(
      res,
      'An error occurred while updating property',
      500
    );
  }
};

/**
 * Delete property (soft delete)
 * DELETE /api/property/:propertyId
 */
const deleteProperty = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { propertyId } = req.params;

    if (!propertyId) {
      return sendErrorResponse(res, 'Property ID is required', 400);
    }

    const result = await PropertyService.deleteProperty(
      parseInt(propertyId),
      userId
    );

    if (result.success) {
      return sendSuccessResponse(
        res,
        result.data,
        'Property deleted successfully'
      );
    } else {
      return sendErrorResponse(
        res,
        result.message || 'Failed to delete property',
        result.statusCode || 400
      );
    }
  } catch (error) {
    logger.error('Error deleting property:', error);
    return sendErrorResponse(
      res,
      'An error occurred while deleting property',
      500
    );
  }
};

/**
 * Search properties near a location
 * GET /api/property/search-nearby
 */
const searchNearbyProperties = async (req, res) => {
  try {
    const { lat, lng, radius } = req.query;

    // Validate required parameters
    if (!lat || !lng || !radius) {
      return sendErrorResponse(
        res,
        'Latitude, longitude, and radius are required',
        400
      );
    }

    // Validate numeric values
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const radiusKm = parseFloat(radius);

    if (isNaN(latitude) || isNaN(longitude) || isNaN(radiusKm)) {
      return sendErrorResponse(
        res,
        'Invalid latitude, longitude, or radius value',
        400
      );
    }

    // Validate coordinate ranges
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return sendErrorResponse(
        res,
        'Invalid coordinate values. Latitude must be between -90 and 90, longitude between -180 and 180',
        400
      );
    }

    if (radiusKm <= 0 || radiusKm > 100) {
      return sendErrorResponse(
        res,
        'Radius must be between 0 and 100 km',
        400
      );
    }

    const filters = {
      status: req.query.status,
      projectId: req.query.projectId,
      city: req.query.city,
      locality: req.query.locality,
      propertyType: req.query.propertyType,
      listingType: req.query.listingType,
      bedrooms: req.query.bedrooms,
      minPrice: req.query.minPrice,
      maxPrice: req.query.maxPrice,
      page: req.query.page || 1,
      limit: req.query.limit || 20
    };

    const result = await PropertyService.searchNearbyProperties(
      latitude,
      longitude,
      radiusKm,
      filters
    );

    if (result.success) {
      return sendSuccessResponse(
        res,
        result.data,
        'Nearby properties fetched successfully'
      );
    } else {
      return sendErrorResponse(
        res,
        result.message,
        result.statusCode || 500
      );
    }
  } catch (error) {
    logger.error('Error searching nearby properties:', error);
    return sendErrorResponse(
      res,
      'An error occurred while searching nearby properties',
      500
    );
  }
};

export default { publishProperty, getMyProperties, getPropertyById, listProperties, updateProperty, deleteProperty, searchNearbyProperties };
