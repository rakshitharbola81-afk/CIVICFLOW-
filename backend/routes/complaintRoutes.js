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
router.get(
    '/complaints',
    protect,
    restrictTo('citizen'),
    complaintController.getMyComplaints
);
router.get(
    '/all',
    protect,
    restrictTo('admin'),
    complaintController.getAllComplaints
);
router.get(
    '/assigned',
    protect,
    restrictTo('worker'),
    complaintController.getMyAssignedComplaints
);
router.patch(
    '/:id/approve',
    protect,
    restrictTo('admin'),
    complaintController.approveComplaint
);

router.patch(
    '/:id/reject',
    protect,
    restrictTo('admin'),
    complaintController.rejectComplaint
);
module.exports=router;