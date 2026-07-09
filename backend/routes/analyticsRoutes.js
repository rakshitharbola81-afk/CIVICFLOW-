const express=require('express');
const analyticsController=require('../controllers/analyticsController');
const{protect,restrictTo}=require('../middleware/authMiddleware');

const router=express.Router();
router.use(protect,restrictTo('admin'));
router.get('/category-stats',analyticsController.getCategoryStats);
router.get('/monthly-velocity', analyticsController.getMonthlyVelocity);
router.get('/area-trends', analyticsController.getAreaTrends);
module.exports = router;