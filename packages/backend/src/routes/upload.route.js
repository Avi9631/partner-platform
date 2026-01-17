import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import UploadController from '../controller/Upload.controller.js';

const router = express.Router();

// Health check
router.get("/ping", function (req, res) {
    res.status(200).send({ message: "Upload service is running" });
});

/**
 * Generate presigned URLs for direct S3 upload
 * POST /api/upload/presigned-urls
 * Auth: Required
 * Body: {
 *   folder: string (required) - S3 folder path
 *   count: number (required) - Number of URLs to generate (1-50)
 *   contentType: string (optional) - MIME type (e.g., 'image/jpeg')
 *   bucketName: string (optional) - Custom bucket name
 *   expiresIn: number (optional) - Expiration in seconds (default: 300)
 * }
 */
router.post("/presigned-urls", authenticateToken, UploadController.getPresignedUrls);

export default router;
