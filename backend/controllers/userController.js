const User = require("../models/User");
const catchAsync = require("../utils/catchAsync");

exports.getWorkers = catchAsync(async (req, res, next) => {
    const workers = await User.find({ role: "worker" }).select("name email");
    res.status(200).json({
        status: "success",
        results: workers.length,
        data: {
            workers,
        },
    });
});