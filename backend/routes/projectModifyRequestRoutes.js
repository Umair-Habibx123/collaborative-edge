import { Router } from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
dotenv.config();
import ProjectModifyRequests from "../models/ProjectModifyRequests.js";
import { v4 as uuidv4 } from "uuid";
import Project from "../models/Projects.js"
import { protect } from "../middleware/authMiddleware.js";

const router = Router();
router.use(cookieParser());
router.use(protect);

router.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

router.post("/createProjectModificationRequest", async (req, res) => {
  try {
    const { projectId, requestType, requestedBy, reason } = req.body;

    const requestId = `req-${uuidv4()}`;

    const newRequest = new ProjectModifyRequests({
      _id: requestId,
      projectId,
      requestType,
      requestedBy,
      reason,
      requestStatus: "pending",
    });

    await newRequest.save();

    await Project.findByIdAndUpdate(projectId, {
      lastEditRequestId: requestId,
    });

    res.status(201).json({
      success: true,
      message: "Modification request submitted successfully",
      requestId,
    });
  } catch (error) {
    console.error("Error creating modification request:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit modification request",
      error: error.message,
    });
  }
});


router.get("/getModificationRequests/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;

    const requests = await ProjectModifyRequests.find({ projectId });

    if (!requests || requests.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No modification requests found for this project",
      });
    }

    res.status(200).json({
      success: true,
      message: "Modification requests retrieved successfully",
      requests,
    });
  } catch (error) {
    console.error("Error fetching modification requests:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch modification requests",
      error: error.message,
    });
  }
});

export default router;
