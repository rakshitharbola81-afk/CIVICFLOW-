const User = require("../models/User");
const catchAsync = require("../utils/catchAsync");
const AppError = require('../utils/appError');

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
exports.createWorker = catchAsync(async (req, res, next) => {
    const { name, email, password, phoneNumber } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return next(new AppError("Email already exists", 400));
    }
    const worker = await User.create({
        name,
        email,
        password,
        phoneNumber,
        role: "worker"
    });
    worker.password = undefined;
    res.status(201).json({
        status: "success",
        message: "Worker created successfully.",
        data: {
            worker
        }
    });
});
exports.getAllWorkers = catchAsync(async (req, res, next) => {

    const workers = await User.find({
        role: "worker"
    }).select("-password");

    res.status(200).json({
        status: "success",
        results: workers.length,
        data: {
            workers
        }
    });

});
exports.updateWorker = catchAsync(async (req, res, next) => {

    const { name, email, phoneNumber } = req.body;

    const worker = await User.findById(req.params.id);

    if (!worker) {
        return next(new AppError("Worker not found.", 404));
    }

    if (worker.role !== "worker") {
        return next(new AppError("User is not a worker.", 400));
    }

    worker.name = name || worker.name;
    worker.email = email || worker.email;
    worker.phoneNumber = phoneNumber || worker.phoneNumber;

    await worker.save();

    worker.password = undefined;

    res.status(200).json({
        status: "success",
        message: "Worker updated successfully.",
        data: {
            worker
        }
    });
});
exports.disableWorker = catchAsync(async (req, res, next) => {

    const worker = await User.findById(req.params.id);

    if (!worker) {
        return next(new AppError("Worker not found.", 404));
    }

    if (worker.role !== "worker") {
        return next(new AppError("User is not a worker.", 400));
    }

    worker.isActive = false;

    await worker.save({ validateBeforeSave: false });

    res.status(200).json({
        status: "success",
        message: "Worker disabled successfully."
    });

});
