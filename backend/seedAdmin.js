const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });
const mongoose = require("mongoose");
const User = require("./models/User");

mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log("MongoDB Connected");
});
async function seedAdmin() {
    try {
        const admin = await User.findOne({
            email: "admin@civicflow.com"
        });
        if (admin) {
            console.log("Admin already exists");
            process.exit();
        }
        await User.create({
            name: "System Admin",
            email: "admin@civicflow.com",
            password: "Admin@123",
            role: "admin"
        });
        console.log("Admin Created Successfully");
        process.exit();
    } catch (err) {
        console.log(err);
        process.exit();
    }
}
seedAdmin();