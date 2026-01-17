import express from 'express';
import UserController from '../controller/User.controller.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { uploadProfileVideo, uploadOwnerVideo, handleUploadError } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Get current authenticated user
router.post("/partnerUser/get", authenticateToken, UserController.getUser);

// Update current authenticated user (also handles profile completion)
// Supports multipart/form-data for video upload
router.patch(
  "/partnerUser/update", 
  authenticateToken, 
  uploadProfileVideo,
  handleUploadError,
  UserController.updateUser
);

// Update business profile information
router.patch(
  "/partnerUser/updateBusiness", 
  authenticateToken, 
  UserController.updateBusinessProfile
);

// Partner onboarding - complete profile setup with verification
// Supports multipart/form-data for video upload
router.post(
  "/partnerUser/onboarding", 
  authenticateToken, 
  uploadProfileVideo,
  handleUploadError,
  UserController.onboardUser
);

// Business partner onboarding - complete business profile setup for verification
// Supports multipart/form-data for owner video upload
router.post(
  "/partnerUser/businessOnboarding", 
  authenticateToken, 
  uploadOwnerVideo,
  handleUploadError,
  UserController.onboardBusinessPartner
);

// Verify phone number for current user
router.post("/partnerUser/verifyPhone", authenticateToken, UserController.verifyPhone);

// Get all users (admin function - consider adding admin middleware)
router.get("/partnerUser/all", authenticateToken, UserController.getAllUsers);

// Update user status (admin function - consider adding admin middleware)
router.patch("/partnerUser/updateStatus", authenticateToken, UserController.updateUserStatus);

// Approve user verification (admin function - consider adding admin middleware)
router.patch("/partnerUser/approveVerification", authenticateToken, UserController.approveVerification);

// Reject user verification (admin function - consider adding admin middleware)
router.patch("/partnerUser/rejectVerification", authenticateToken, UserController.rejectVerification);

export default router;
