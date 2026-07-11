const express = require("express");
const userController = require("../controllers/userController");
const { protect, restrictTo } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);
router.use(restrictTo("admin"));
router.post(
    '/create-worker',
    protect,
    restrictTo('admin'),
    userController.createWorker
);
router.get(
    '/workers',
    protect,
    restrictTo('admin'),
    userController.getAllWorkers
);
router.patch(
    '/:id/disable',
    userController.disableWorker
);
router.patch(
    '/:id',
    protect,
    restrictTo('admin'),
    userController.updateWorker
);

module.exports = router;