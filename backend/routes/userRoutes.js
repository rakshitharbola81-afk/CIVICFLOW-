const express = require("express");
const userController = require("../controllers/userController");
const { protect, restrictTo } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);
router.use(restrictTo("admin"));

router.get("/workers", userController.getWorkers);

module.exports = router;