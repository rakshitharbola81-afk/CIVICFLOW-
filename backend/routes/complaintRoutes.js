const express = require('express');
const complaintController=require('../controllers/complaintController');
const {protect,restrictTo}=require('../middleware/authMiddleware');
const {uploadImage}=require('../config/cloudinaryConfig');

const router=express.Router();
router.post(
    '/create',
    protect,
    restrictTo('citizen'),
    uploadImage.single('image'),
    complaintController.createComplaint
);
router.patch(
    '/assign',
    protect,
    restrictTo('admin'),
    complaintController.assignWorker
);
router.patch(
    '/:id/start-progress',
    protect,
    restrictTo('worker'),
    complaintController.markInProgress
);
router.patch(
    '/:id/resolve',
    protect,
    restrictTo('worker'),
    uploadImage.single('afterImage'),
    complaintController.resolveComplaint
);
module.exports=router;