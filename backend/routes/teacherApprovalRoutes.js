import { Router } from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import TeacherApproval from "../models/TeacherApproval.js";
import Project from "../models/Projects.js";
import Notifications from "../models/Notifications.js";

import { protect } from "../middleware/authMiddleware.js";
dotenv.config();

const router = Router();
router.use(cookieParser());
router.use(protect);

router.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// router.post("/insertTeacherApproval", async (req, res) => {
//     try {
//         console.log("Incoming request body:", req.body);

//         const { _id, teacherId, fullName, status, university, comments } = req.body;

//         if (!_id || !teacherId || !fullName || !university || !comments) {
//             return res.status(400).json({ error: "Invalid or missing required fields." });
//         }

//         let existingApproval = await TeacherApproval.findOne({ _id });

//         if (existingApproval) {

//             const existingTeacher = existingApproval.approvals.find(app => app.teacherId === teacherId);

//             if (existingTeacher) {
//                 return res.status(400).json({ error: "Teacher has already submitted approval for this project." });
//             }

//             existingApproval.approvals.push({
//                 teacherId,
//                 fullName,
//                 status: status || "pending",
//                 university,
//                 comments,
//                 actionAt: new Date(),
//                 actionBy: teacherId,
//             });

//             await existingApproval.save();
//             return res.status(200).json({
//                 message: "Teacher approval added successfully.",
//                 approval: { teacherId, fullName, status, university }
//             });
//         } else {

//             const newApproval = new TeacherApproval({
//                 _id,
//                 approvals: [
//                     {
//                         teacherId,
//                         fullName,
//                         status: status || "pending",
//                         university,
//                         comments,
//                         actionAt: new Date(),
//                         actionBy: teacherId,
//                     }
//                 ],
//             });

//             await newApproval.save();
//             return res.status(201).json({
//                 message: "Teacher approval request submitted successfully.",
//                 approval: { _id, teacherId, fullName, status, university }
//             });
//         }
//     } catch (error) {
//         console.error("Error inserting teacher approval request:", error);
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// });

router.post("/insertTeacherApproval", async (req, res) => {
  try {
    console.log("Incoming request body:", req.body);

    const { _id, teacherId, fullName, status, university, comments } = req.body;

    if (!_id || !teacherId || !fullName || !university || !comments) {
      return res
        .status(400)
        .json({ error: "Invalid or missing required fields." });
    }

    // First, handle the approval logic
    let existingApproval = await TeacherApproval.findOne({ _id });

    if (existingApproval) {
      const existingTeacher = existingApproval.approvals.find(
        (app) => app.teacherId === teacherId
      );
      if (existingTeacher) {
        return res.status(400).json({
          error: "Teacher has already submitted approval for this project.",
        });
      }

      existingApproval.approvals.push({
        teacherId,
        fullName,
        status: status || "pending",
        university,
        comments,
        actionAt: new Date(),
        actionBy: teacherId,
      });

      await existingApproval.save();
    } else {
      const newApproval = new TeacherApproval({
        _id,
        approvals: [
          {
            teacherId,
            fullName,
            status: status || "pending",
            university,
            comments,
            actionAt: new Date(),
            actionBy: teacherId,
          },
        ],
      });
      await newApproval.save();
    }

    const project = await Project.findById(_id);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    if (status === "approved" && project.editStatus === "unlocked") {
      project.editStatus = "locked";
      project.unlockedUntil = null;
      await project.save();
    }

    // Determine recipients - typically the project creator
    const recipients = [{ userId: project.representativeId }];

    // Send notification
    const notification = new Notifications({
      type: "projectApproval",
      title:
        status === "approved"
          ? "Project Approved"
          : status === "rejected"
          ? "Project Rejected"
          : "Project Requires Changes",
      message:
        status === "approved"
          ? `Your project has been approved by ${fullName}. ${
              comments ? "Comments: " + comments : ""
            }`
          : status === "rejected"
          ? `Your project has been rejected by ${fullName}. ${
              comments ? "Reason: " + comments : ""
            }`
          : `Your project requires additional information for approval by: ${fullName}. ${
              comments ? "Details: " + comments : ""
            }`,
      relatedEntity: {
        type: "project",
        id: _id,
      },
      recipients: recipients.map((recipient) => ({
        userId: recipient.userId,
        read: false,
        responded: false,
      })),
      sender: {
        userId: teacherId,
        name: fullName,
        role: "teacher",
      },
      actionRequired: null,
      actionType: null,
      actionLink: `/project/${_id}`,
      priority: "high",
      metadata: {
        approvalStatus: status,
        comments,
      },
    });

    await notification.save();

    return res.status(status === "needMoreInfo" ? 201 : 200).json({
      message:
        status === "approved"
          ? "Project approved successfully"
          : status === "rejected"
          ? "Project rejected successfully"
          : "Project changes requested successfully",
      approval: { teacherId, fullName, status, university },
      notification: notification,
    });
  } catch (error) {
    console.error("Error inserting teacher approval request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get(
  "/getApprovalDetailForTeacherWhoApprove/:projectId",
  async (req, res) => {
    const { projectId } = req.params;
    const { teacherId } = req.query;

    console.log(
      `Fetching approval details for projectId: ${projectId}, teacherId: ${teacherId}`
    );

    try {
      const project = await TeacherApproval.findById(projectId);
      console.log("Project found:", project);

      if (!project) {
        console.log("Project not found");
        return res.status(404).json({ error: "Project not found" });
      }

      const approval = project.approvals.find(
        (approval) => approval.teacherId === teacherId
      );
      console.log("Approval found:", approval);

      if (!approval) {
        console.log("Approval not found");
        return res.status(404).json({ error: "Approval not found" });
      }

      res.json(approval);
    } catch (error) {
      console.error("Error fetching approval details:", error);
      res.status(500).json({ error: "Failed to fetch approval details" });
    }
  }
);

router.put("/updateApproval", async (req, res) => {
  const { _id, teacherId, status, comments } = req.body;

  try {
    const project = await TeacherApproval.findById(_id);
    const approval = project.approvals.find(
      (approval) => approval.teacherId === teacherId
    );
    approval.status = status;
    approval.comments = comments;
    approval.actionAt = new Date().toISOString();

    await project.save();
    res.json({ message: "Approval updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update approval" });
  }
});

router.get("/getAllProjectsWithStatusForTeachers", async (req, res) => {
  try {
    const { university } = req.query;

    const projects = await Project.find().lean();

    const projectIds = projects.map((project) => project._id);

    const approvals = await TeacherApproval.find({ _id: { $in: projectIds } })
      .select("_id approvals")
      .lean();

    const approvalMap = new Map();

    approvals.forEach((approval) => {
      const universityApproval = approval.approvals.find(
        (app) => app.university === university
      );
      approvalMap.set(approval._id.toString(), {
        status: universityApproval ? universityApproval.status : "pending",
        teacherId: universityApproval?.teacherId || "",
        fullName: universityApproval?.fullName || "",
        comments: universityApproval?.comments || "",
        actionAt: universityApproval?.actionAt || "",
      });
    });

    const statuses = {};

    projects.forEach((project) => {
      const approval = approvalMap.get(project._id.toString());
      statuses[project._id.toString()] = approval ? approval.status : "pending";
    });

    res.status(200).json({ projects, statuses });
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get(
  "/checkAnyTeacherApproveForYourUni/:projectId/:university",
  async (req, res) => {
    try {
      const { projectId, university } = req.params;

      console.log("Fetching Approval for:", projectId, university);

      const approval = await TeacherApproval.findOne({ _id: projectId });

      if (!approval) {
        return res.status(200).json({
          message: "Approval not found",
          status: "pending",
          projectId: projectId,
          university: university,
        });
      }

      const universityApproval = approval.approvals.find(
        (app) => app.university === university
      );

      if (!universityApproval) {
        return res.status(200).json({
          message: "University approval not found",
          status: "pending",
          projectId: projectId,
          university: university,
        });
      }

      let userProfile = null;
      try {
        const userResponse = await fetch(
          `${process.env.VITE_REACT_APP_BACKEND_BASEURL}/api/other-user-profile?email=${universityApproval.teacherId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        if (userResponse.ok) {
          userProfile = await userResponse.json();
          console.log("User Profile Fetched:", userProfile);
        } else {
          console.error(
            "Failed to fetch user profile",
            await userResponse.json()
          );
        }
      } catch (err) {
        console.error("User Profile API Error:", err);
      }

      res.status(200).json({
        projectId: projectId,
        teacherId: universityApproval.teacherId,
        fullName: universityApproval.fullName,
        status: universityApproval.status || "pending",
        university: universityApproval.university,
        comments: universityApproval.comments,
        actionAt: universityApproval.actionAt,
        userProfile: userProfile ?? "User Profile Not Available",
      });
    } catch (error) {
      console.error(
        "Error fetching teacher approval with user details:",
        error
      );
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

router.get(
  "/getProjectsApprovedByYourUniWithDetails/:university",
  async (req, res) => {
    try {
      const { university } = req.params;

      console.log("Fetching approvals for university:", university);

      const teacherApprovals = await TeacherApproval.find({
        approvals: {
          $elemMatch: {
            university: university,
            status: "approved",
          },
        },
      });

      if (!teacherApprovals || teacherApprovals.length === 0) {
        return res.status(200).json({
          projects: [],
          message: "No approved projects found for this university",
        });
      }

      const projectIds = teacherApprovals.map((approval) => approval._id);

      const projects = await Project.find({ _id: { $in: projectIds } });

      const projectsWithApprovalDetails = projects.map((project) => {
        const approvalDoc = teacherApprovals.find(
          (a) => a._id === project._id.toString()
        );

        const universityApproval = approvalDoc.approvals.find(
          (a) => a.university === university && a.status === "approved"
        );

        return {
          ...project.toObject(),
          approvalDetails: universityApproval,
        };
      });

      res.status(200).json({ projects: projectsWithApprovalDetails });
    } catch (error) {
      console.error("Error fetching teacher approvals:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

router.get("/getUniversitiesStatusAcrossProject", async (req, res) => {
  try {
    const { projectIds } = req.query;

    console.log("Fetching universities status for project:", projectIds);

    const project = await TeacherApproval.findById(projectIds);

    if (!project) {
      return res
        .status(404)
        .json({ message: "Project not found", status: "not found" });
    }

    const approvedUniversities = project.approvals
      .filter((approval) => approval.status === "approved")
      .map((approval) => approval.university);

    const rejectedUniversities = project.approvals
      .filter((approval) => approval.status === "rejected")
      .map((approval) => approval.university);

    const needMoreInfoUniversities = project.approvals
      .filter((approval) => approval.status === "needMoreInfo")
      .map((approval) => approval.university);

    res.status(200).json({
      approvedUniversities: approvedUniversities || [],
      rejectedUniversities: rejectedUniversities || [],
      needMoreInfoUniversities: needMoreInfoUniversities || [],
    });
  } catch (error) {
    console.error("Error fetching universities status:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/approval-status/:id/:university", async (req, res) => {
  try {
    const { id, university } = req.params;

    const teacherApproval = await TeacherApproval.findById(id);

    if (!teacherApproval) {
      return res
        .status(404)
        .json({ message: "Teacher approval record not found" });
    }

    const universityApprovals = teacherApproval.approvals.filter(
      (approval) => approval.university === university
    );

    if (universityApprovals.length === 0) {
      return res
        .status(404)
        .json({ message: "No approvals found for the specified university" });
    }

    res.status(200).json({
      message: "Approval status retrieved successfully",
      data: universityApprovals.map((approval) => ({
        teacherId: approval.teacherId,
        fullName: approval.fullName,
        status: approval.status,
        university: approval.university,
        comments: approval.comments,
        actionAt: approval.actionAt,
        actionBy: approval.actionBy,
      })),
    });
  } catch (error) {
    console.error("Error fetching approval status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/getUniversityApprovals", async (req, res) => {
  try {
    const { projectId, university } = req.query;

    if (!projectId || !university) {
      return res
        .status(400)
        .json({ error: "Project ID and university name are required" });
    }

    // Find the document for this project
    const projectApprovals = await TeacherApproval.findOne({ _id: projectId });

    if (!projectApprovals) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Filter approvals for the selected university
    const filteredApprovals = projectApprovals.approvals.filter(
      (approval) => approval.university === university
    );

    res.json({
      success: true,
      approvals: filteredApprovals,
    });
  } catch (error) {
    console.error("Error fetching university approvals:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
