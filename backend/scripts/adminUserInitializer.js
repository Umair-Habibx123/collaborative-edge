import bcrypt from "bcryptjs";
import User from "../models/User.js";

// Creates the first admin account from environment variables, if it doesn't exist yet.
// Set ADMIN_EMAIL and ADMIN_PASSWORD in backend/.env. When they're missing, nothing is
// created, so no default login ever ships with the code.
async function initializeAdminUser() {
    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
        console.log("ADMIN_EMAIL or ADMIN_PASSWORD not set: skipping default admin creation");
        return;
    }

    try {
        const existingAdmin = await User.findOne({ email });
        if (existingAdmin) {
            console.log("Default admin user already exists");
            return;
        }

        const now = new Date();
        await new User({
            _id: email,
            username: email.split("@")[0],
            email,
            password: await bcrypt.hash(password, 10),
            profilePic: "",
            role: "admin",
            status: "verified",
            createdAt: now,
            updatedAt: now,
        }).save();
        console.log("Default admin user created successfully");
    } catch (error) {
        console.error("Error during database initialization:", error);
        throw error;
    }
}

export default initializeAdminUser;
