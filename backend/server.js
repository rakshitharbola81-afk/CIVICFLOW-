const dotenv = require('dotenv');
dotenv.config({ path: './.env' });
const express = require('express');
const cors = require('cors');

const http = require('http');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db.js');
const AppError = require('./utils/appError.js');
const globalErrorHandler = require('./middleware/errorMiddleware.js');
const authRouter = require('./routes/authRoutes.js');
const complaintRouter = require('./routes/complaintRoutes.js');
const analyticsRouter = require('./routes/analyticsRoutes.js');
const userRouter = require("./routes/userRoutes.js");
const mongoose=require('mongoose');
connectDB();
const app = express();
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser()); 
app.use(cors({
    origin: [
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        "https://civicflow-beta.vercel.app"
    ],
    credentials: true
}));
app.get("/", (req, res) => {
    res.status(200).json({
        status: "success",
        message: "CivicFlow API is running successfully!"
    });
});
app.get('/api/v1/health', (req, res) => {
    res.status(200).json({ status: 'Success', message: 'CivicFlow API operational' });
});
app.use('/api/v1/auth', authRouter);
app.use("/api/v1/users", userRouter);
app.use('/api/v1/complaints', complaintRouter);
app.use('/api/v1/analytics', analyticsRouter); 

app.all('*', (req, res, next) => {
    next(new AppError(`Cant find ${req.originalUrl} on this server`, 404));
});
app.use(globalErrorHandler);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Application running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});