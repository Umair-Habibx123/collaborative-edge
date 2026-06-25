import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/userRoutes.js";
import projectsRoutes from "./routes/projectRoutes.js";
import industryRoutes from "./routes/industryRoutes.js";
import teacherRoutes from "./routes/teacherRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import TeacherApproval from "./routes/teacherApprovalRoutes.js";
import StudentSelection from "./routes/studentSelectionRoutes.js";
import Reviews from "./routes/reviewsRoutes.js";
import privacyPolicyRoutes from "./routes/privacyPolicyRoutes.js";
import AdminRoutes from "./routes/adminRoutes.js";
import EmailRoutes from "./routes/emailRoutes.js";
import GrisFsRoutes from "./routes/gridFsRoutes.js";
import notificationsRoutes from "./routes/notificationRoutes.js"
import { getUsersByYear, getUsersByMonth, getUsersByWeek, getUsersByRole, getProjectsByType, getProjectsByIndustry, getProjectsByRepresentative, } from "./controllers/adminGraphController.js";
import {
    getProjectsBySkills,
    getProjectsTimeline,
    getUniversityEngagement,
    getProjectStatusCounts,
} from "./controllers/industryGraphController.js";

import { getTeacherStats, getUniversityTeacherStats } from "./controllers/teacherGraphController.js";
import { getStudentCompletionStats, getStudentRatings } from "./controllers/studentGraphController.js";
import { getSuccessStories } from "./controllers/successStoriesController.js";
import initializePrivacyPolicies from './scripts/privacyPolicyInitializer.js';
import initializeAdminUser from './scripts/adminUserInitializer.js';
import projectModificationRequestRoutes from "./routes/projectModifyRequestRoutes.js"


import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import TeacherSupervision from "./routes/teacherSupervisionRoutes.js";
import path from "path";
import { fileURLToPath } from "url";
import StudentSubmission from "./routes/studentSubmissionRoutes.js";
import authMiddleware from './middleware/authMiddleware.js';
import { applySecurity, apiLimiter, authLimiter } from './middleware/security.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
const { json: _json } = bodyParser;
dotenv.config();


const app = express();
const PORT = process.env.PORT || 5000;


mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("✅ MongoDB Connected");
        initializePrivacyPolicies();
        initializeAdminUser();
    })
    .catch((err) => console.error("❌ MongoDB Connection Error:", err));

const db = mongoose.connection;
db.once("open", () => console.log("🔗 Database connection open"));


app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ["POST", "GET", "PUT", "DELETE", "PATCH"],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}));



app.use(express.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

// Baseline security: helmet headers, HPP protection, NoSQL-injection sanitization.
applySecurity(app);

// Throttle authentication endpoints harder than the rest of the API.
app.use("/api/login", authLimiter);



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



app.use(express.static(path.join(__dirname, "public")));


app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "index2.html"));
});


// General rate limiting for all API traffic.
app.use("/api", apiLimiter);

app.use("/api", userRoutes);
app.use("/api", industryRoutes);
app.use("/api", teacherRoutes);
app.use("/api", studentRoutes);
app.use("/api",  projectsRoutes);
app.use("/api",  projectModificationRequestRoutes);
// app.use("/api",  authMiddleware, projectsRoutes);
app.use("/api", TeacherApproval);
app.use("/api", TeacherSupervision);
app.use("/api", StudentSelection);
app.use("/api", StudentSubmission);
app.use("/api", Reviews);
app.use("/api", privacyPolicyRoutes);
app.use("/admin", AdminRoutes);
app.use("/", EmailRoutes);
app.use("/", GrisFsRoutes);
app.use("/api" , notificationsRoutes);


// admin graphs
app.get("/users/monthly/:year", getUsersByMonth);
app.get("/users/yearly", getUsersByYear);
app.get("/users/weekly/:year/:month", getUsersByWeek);
app.get("/users/roles", getUsersByRole);
app.get("/projects/types", getProjectsByType);
app.get("/projects/industries", getProjectsByIndustry);
app.get("/projects/representatives", getProjectsByRepresentative);

// ind rep graph
app.get("/repProjects/skills/:representativeId", getProjectsBySkills);
app.get("/repProjects/timeline/:representativeId", getProjectsTimeline);
app.get("/repProjects/status/:representativeId", getProjectStatusCounts);
app.get("/repProjects/engagement/:representativeId", getUniversityEngagement);

// std graph
app.get("/student/SelectionCompletion/:studentId", getStudentCompletionStats);
app.get("/student/StudentRatings/:studentId", getStudentRatings);

// teacher graph

app.get("/teacher/TeacherStats/:teacherId", getTeacherStats);
app.get("/teacher/UniversityStats/:university", getUniversityTeacherStats);


app.get("/success-stories", getSuccessStories);


// 404 + centralized error handling — must be registered AFTER all routes.
app.use(notFound);
app.use(errorHandler);


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;