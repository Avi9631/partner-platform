import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { uploadListingDraftMedia, handleUploadError } from '../middleware/uploadMiddleware.js';
import ListingDraftController from '../controller/ListingDraft.controller.js';

const router = express.Router();

 
router.get("/ping", function (req, res) {
    res.status(200).send({message: "Ping Successful"});
});

router.post("/createListingDraft", authenticateToken, ListingDraftController.createListingDraft);

router.patch("/updateListingDraft", authenticateToken, ListingDraftController.updateListingDraft);

router.delete("/deleteListingDraft", authenticateToken, ListingDraftController.deleteListingDraft);
 
router.get("/listingDraft", authenticateToken, ListingDraftController.getUserListingDrafts);

router.get("/listingDraft/:id", authenticateToken, ListingDraftController.getListingDraftById);

export default router;
