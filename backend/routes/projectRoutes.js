import express from "express";
import cookieParser from "cookie-parser";
import Project from "../models/Projects.js";
import { deleteFileFromGridFS } from "../routes/gridFsRoutes.js";
import mongoose from "mongoose";
import IndustryRepresentative from "../models/Industry.js";
import StudentSelection from "../models/StudentSelection.js";
import TeacherApproval from "../models/TeacherApproval.js";
import TeacherSupervision from "../models/TeacherSupervision.js";
import Review from "../models/Reviews.js";
import StudentSubmissions from "../models/StudentSubmission.js";
import ProjectModifyRequest from "../models/ProjectModifyRequests.js";
import { isValidObjectId } from "mongoose";
import dotenv from "dotenv";
import { protect } from "../middleware/authMiddleware.js";
dotenv.config();

const router = express.Router();
router.use(cookieParser());
router.use(protect);

router.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

router.post("/AddProject", express.json(), async (req, res) => {
  console.log("📥 Received Data:", req.body);
  try {
    const {
      title,
      description,
      projectType,
      representativeId,
      industryName,
      difficultyLevel,
      selection,
      requiredSkills,
      additionalInfo,
      duration,
      maxStudentsPerGroup,
      maxGroups,
      attachments,
    } = req.body;

    if (
      !title ||
      !description ||
      !projectType ||
      !representativeId ||
      !difficultyLevel ||
      !duration
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    let parsedDuration;
    try {
      parsedDuration =
        typeof duration === "string" ? JSON.parse(duration) : duration;
    } catch (err) {
      return res.status(400).json({ error: "Invalid duration format" });
    }

    let parsedAttachments = [];
    try {
      parsedAttachments = JSON.parse(attachments || "[]");
    } catch (err) {
      return res.status(400).json({ error: "Invalid attachments format" });
    }

    let parsedRequiredSkills = [];
    try {
      parsedRequiredSkills =
        typeof requiredSkills === "string"
          ? JSON.parse(requiredSkills)
          : requiredSkills;
    } catch (err) {
      return res.status(400).json({ error: "Invalid requiredSkills format" });
    }

    console.log("📎 Processed Attachments:", parsedAttachments);

    const newProject = new Project({
      _id: `proj${Date.now()}`,
      title,
      description,
      type: selection,
      projectType,
      difficultyLevel,
      requiredSkills: parsedRequiredSkills,
      additionalInfo,
      duration: parsedDuration,
      representativeId,
      industryName,
      attachments: parsedAttachments,
      ...(selection === "Group" && { maxStudentsPerGroup, maxGroups }),
      editStatus: "unlocked",
      unlockedUntil: null,
      lastEditRequestId: null,
    });

    const savedProject = await newProject.save();
    await IndustryRepresentative.updateOne(
      { _id: representativeId },
      { $push: { postedProjects: savedProject._id } }
    );

    res
      .status(201)
      .json({ message: "Project added successfully", project: savedProject });
  } catch (error) {
    console.error("❌ Error saving project:", error);

    // Handle duplicate key error (E11000)
    if (error.code === 11000 && error.keyPattern && error.keyPattern.title) {
      return res.status(400).json({
        error:
          "Project with this Title already exists. Project title must be unique",
      });
    }

    res.status(500).json({ error: "Failed to add project. Please try again." });
  }
});

router.put("/updateProject/:id", async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;

  try {
    const updatedProject = await Project.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    });

    if (!updatedProject) {
      return res.status(404).json({ message: "Project not found" });
    }

    res
      .status(200)
      .json({ message: "Project updated successfully", updatedProject });
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
});

router.delete("/deleteProject/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.attachments && project.attachments.length > 0) {
      for (const attachment of project.attachments) {
        // Assuming fileUrl looks like: "/file/BUCKET_NAME/FILENAME"
        await deleteFileFromGridFS(attachment.fileUrl);
      }
    }

    await Project.findByIdAndDelete(id);
    // Delete related documents from other collections
    await Promise.all([
      TeacherApproval.deleteOne({ _id: id }).catch((err) =>
        console.error("⚠️ Error deleting teacher approvals:", err)
      ),
      TeacherSupervision.deleteOne({ _id: id }).catch((err) =>
        console.error("⚠️ Error deleting teacher supervision:", err)
      ),
      StudentSelection.deleteOne({ _id: id }).catch((err) =>
        console.error("⚠️ Error deleting student selections:", err)
      ),
      StudentSubmissions.deleteOne({ _id: id }).catch((err) =>
        console.error("⚠️ Error deleting student submissions:", err)
      ),
      Review.deleteMany({ projectId: id }).catch((err) =>
        console.error("⚠️ Error deleting reviews:", err)
      ),
      ProjectModifyRequest.deleteMany({ projectId: id }).catch((err) =>
        console.error("⚠️ Error deleting modify requests:", err)
      ),
    ]);

    res.status(200).json({ 
      message: "Project and all associated data cleanup attempted successfully" 
    });
  } catch (error) {
    console.error("❌ Error deleting project:", error);
    res.status(500).json({ 
      message: "Internal server error", 
      error: error.message 
    });
  }
});


router.get("/fetchProjectDetailById/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

router.get("/getMyProjects", async (req, res) => {
  try {
    const { representativeId } = req.query;
    if (!representativeId) {
      return res.status(400).json({ message: "Representative ID is required" });
    }

    const projects = await Project.find({ representativeId });

    res.status(200).json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

router.get("/getAllProjects", async (req, res) => {
  try {
    const projects = await Project.find();

    res.status(200).json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

router.get("/getCompletedProjects", async (req, res) => {
  try {
    const completedProjects = await Project.aggregate([
      {
        $lookup: {
          from: "studentselections",
          localField: "_id",
          foreignField: "_id",
          as: "studentSelectionData",
        },
      },
      { $unwind: "$studentSelectionData" },
      {
        $match: {
          "studentSelectionData.studentSelection.status.isCompleted": true,
        },
      },
    ]);

    res.status(200).json(completedProjects);
  } catch (error) {
    console.error("Error fetching completed projects:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

export default router;
