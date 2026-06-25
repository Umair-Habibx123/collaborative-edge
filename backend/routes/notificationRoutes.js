import { Router } from "express";
const router = Router();
import Notifications from "../models/Notifications.js";
import Project from "../models/Projects.js";
import User from "../models/User.js";
import TeacherSupervision from "../models/TeacherSupervision.js";
import StudentSelection from "../models/StudentSelection.js";
import { protect } from "../middleware/authMiddleware.js";
router.use(protect);

router.get("/notifications/user/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const { limit = 10, skip = 0, read, type, sort } = req.query;

    // Convert read query param to boolean if provided
    const readFilter = read !== undefined ? read === "true" : null;

    const result = await Notifications.getUserNotifications(email, {
      limit,
      skip,
      read: readFilter,
      type,
      sort,
    });

    res.json({
      success: true,
      data: result.notifications,
      pagination: {
        total: result.total,
        limit: result.limit,
        skip: result.skip,
      },
    });
  } catch (error) {
    console.error("Error fetching user notifications:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
      error: error.message,
    });
  }
});

// GET /notifications/user/user@example.com
// GET /notifications/user/user@example.com?read=false
// GET /notifications/user/user@example.com?type=review
// GET /notifications/user/user@example.com?limit=20&skip=10
// GET /notifications/user/user@example.com?sort=-priority,-createdAt

// Mark specific notification as read
router.patch(
  "/notifications/mark-as-read/:notificationId",
  async (req, res) => {
    try {
      const { userId } = req.body;
      const { notificationId } = req.params;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "User ID/email is required",
        });
      }

      const updateResult = await Notifications.findOneAndUpdate(
        {
          _id: notificationId,
          "recipients.userId": userId,
        },
        {
          $set: {
            "recipients.$.read": true,
            "recipients.$.readAt": new Date(),
          },
        },
        { new: true }
      );

      if (!updateResult) {
        return res.status(404).json({
          success: false,
          message: "Notification not found or user is not a recipient",
        });
      }

      res.json({
        success: true,
        message: "Notification marked as read",
        data: updateResult,
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update notification status",
        error: error.message,
      });
    }
  }
);

// Mark all notifications as read for a user
router.patch("/notifications/mark-all-as-read", async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID/email is required",
      });
    }

    const updateResult = await Notifications.updateMany(
      {
        "recipients.userId": userId,
        "recipients.read": false,
      },
      {
        $set: {
          "recipients.$[elem].read": true,
          "recipients.$[elem].readAt": new Date(),
        },
      },
      {
        arrayFilters: [{ "elem.userId": userId }],
        multi: true,
      }
    );

    if (updateResult.modifiedCount === 0) {
      return res.status(200).json({
        success: true,
        message: "No unread notifications found for this user",
      });
    }

    res.json({
      success: true,
      message: "All notifications marked as read",
      data: null,
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update notifications status",
      error: error.message,
    });
  }
});

router.get("/notifications/unread-count/:email", async (req, res) => {
  try {
    const { email } = req.params;

    const count = await Notifications.countDocuments({
      recipients: {
        $elemMatch: {
          userId: email,
          read: false,
        },
      },
    });

    res.json({
      success: true,
      count,
    });
  } catch (error) {
    console.error("Error getting unread count:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Route to send project approval notification
router.post("/project-approval-notification", async (req, res) => {
  try {
    const {
      projectId,
      senderId,
      senderName,
      senderRole,
      recipients,
      approvalStatus,
      comments,
      actionRequired,
      responseDeadline,
    } = req.body;

    if (
      !projectId ||
      !senderId ||
      !senderName ||
      !recipients ||
      recipients.length === 0
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Determine notification type based on approval status
    let notificationType;
    let title;
    let message;
    let actionType = null;

    switch (approvalStatus) {
      case "approved":
        notificationType = "projectApproval";
        title = "Project Approved";
        message = `Your project has been approved. ${
          comments ? "Comments: " + comments : ""
        }`;
        actionType = null;
        break;
      case "rejected":
        notificationType = "projectApproval";
        title = "Project Rejected";
        message = `Your project has been rejected. ${
          comments ? "Reason: " + comments : ""
        }`;
        actionType = null;
        break;
      case "needMoreInfo":
        notificationType = "projectEditRequest";
        title = "Project Requires Changes";
        message = `Your project requires additional information. ${
          comments ? "Details: " + comments : ""
        }`;
        actionType = "approval";
        break;
      default:
        return res.status(400).json({ error: "Invalid approval status" });
    }

    // Create notification
    const notification = new Notifications({
      type: notificationType,
      title,
      message,
      relatedEntity: {
        type: "project",
        id: projectId,
      },
      recipients: recipients.map((recipient) => ({
        userId: recipient.userId,
        read: false,
      })),
      sender: {
        userId: senderId,
        name: senderName,
        role: senderRole || "teacher",
      },
      actionRequired: actionRequired || false,
      actionType,
      actionLink: `/project/${projectId}`,
      responseDeadline: responseDeadline ? new Date(responseDeadline) : null,
      priority: "high",
      metadata: {
        approvalStatus,
        comments,
      },
    });

    await notification.save();

    res.status(201).json({
      message: "Notification sent successfully",
      notification,
    });
  } catch (error) {
    console.error("Error sending project approval notification:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export const sendSupervisionRequestNotification = async (
  projectId,
  teacherDetails
) => {
  try {
    // Get the project to find the representative
    const project = await Project.findById(projectId).select(
      "representativeId title"
    );

    if (!project) {
      console.error("Project not found for notification");
      return;
    }

    // Create the notification
    const notification = new Notifications({
      type: "supervisionResponse",
      title: "New Supervision Request",
      message: `${teacherDetails.fullName} from ${teacherDetails.university} has requested to supervise your project "${project.title}"`,
      relatedEntity: {
        type: "supervision",
        id: project.title,
      },
      recipients: [
        {
          userId: project.representativeId,
          read: false,
        },
      ],
      sender: {
        userId: teacherDetails.teacherId,
        name: teacherDetails.fullName,
        role: "teacher",
      },
      actionRequired: false,
      actionType: null,
      actionLink: `/teacherSupervision/${projectId}`,
      priority: "high",
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error("Error creating supervision request notification:", error);
    throw error;
  }
};

export const sendSupervisionResponseNotification = async (
  projectId,
  teacherId,
  status,
  actionBy,
  comments
) => {
  try {
    // Get project details
    const project = await Project.findById(projectId).select("title");
    if (!project) {
      console.error("Project not found for notification");
      return;
    }

    // Get action user details
    const actionUser = await User.findById(actionBy).select("username role");
    if (!actionUser) {
      console.error("Action user not found for notification");
      return;
    }

    // Determine notification content based on status
    let title, message;
    if (status === "approved") {
      title = "Supervision Request Approved";
      message = `Your request to supervise "${project.title}" has been approved`;
    } else if (status === "rejected") {
      title = "Supervision Request Rejected";
      message = `Your request to supervise "${project.title}" has been rejected`;
    } else {
      return; // Only send notifications for approved/rejected statuses
    }

    if (comments) {
      message += `. Comments: ${comments}`;
    }

    // Create notification for the teacher
    const notification = new Notifications({
      type: "supervisionResponse",
      title,
      message,
      relatedEntity: {
        type: "supervision",
        id: project.title,
      },
      recipients: [
        {
          userId: teacherId,
          read: false,
        },
      ],
      sender: {
        userId: actionBy,
        name: actionUser.username,
        role: actionUser.role,
      },
      actionRequired: false,
      actionType: null,
      actionLink: `/applySupervision/${projectId}`,
      priority: "medium",
      metadata: {
        status,
        comments,
      },
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error("Error creating supervision response notification:", error);
    throw error;
  }
};

export const sendGroupSelectionNotification = async (
  projectId,
  studentEmail,
  university
) => {
  try {
    // Get project details
    const project = await Project.findById(projectId).select(
      "title representativeId"
    );
    if (!project) {
      console.error("Project not found for notification");
      return;
    }

    // Get student details
    const student = await User.findOne({ email: studentEmail }).select(
      "username"
    );
    if (!student) {
      console.error("Student not found for notification");
      return;
    }

    // Get approved supervisors for this project
    const supervision = await TeacherSupervision.findOne({ _id: projectId });
    const approvedSupervisors =
      supervision?.supervisedBy.filter(
        (s) => s.responseFromInd.status === "approved"
      ) || [];

    // Create notifications for:
    // 1. Project representative
    // 2. All approved supervisors

    const recipients = [
      {
        userId: project.representativeId,
        read: false,
      },
      ...approvedSupervisors.map((supervisor) => ({
        userId: supervisor.teacherId,
        read: false,
      })),
    ];

    const notification = new Notifications({
      type: "groupChange",
      title: "New Group Created",
      message: `${student.username} from ${university} has created a new group for your project "${project.title}"`,
      relatedEntity: {
        type: "group",
        id: project.title,
        secondaryId: project.representativeId, // Optional: can store representative ID here
      },
      recipients,
      sender: {
        userId: studentEmail,
        name: student.username,
        role: "student",
      },
      actionRequired: false,
      actionType: null,
      actionLink: `/applySupervision/${projectId}`,
      priority: "medium",
      metadata: {
        selectionType: "newGroup",
        university,
      },
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error("Error creating group selection notification:", error);
    throw error;
  }
};

export const sendGroupJoinNotification = async (
  projectId,
  selectionId,
  joiningStudentEmail,
  existingGroupMembers
) => {
  try {
    // Get project details
    const project = await Project.findById(projectId).select(
      "title representativeId"
    );
    if (!project) {
      console.error("Project not found for notification");
      return;
    }

    // Get joining student details
    const joiningStudent = await User.findOne({
      email: joiningStudentEmail,
    }).select("username");
    if (!joiningStudent) {
      console.error("Joining student not found for notification");
      return;
    }

    // Get approved supervisors for this project
    const supervision = await TeacherSupervision.findOne({ _id: projectId });
    const approvedSupervisors =
      supervision?.supervisedBy.filter(
        (s) => s.responseFromInd.status === "approved"
      ) || [];

    // Create recipients list:
    // 1. Project representative
    // 2. All approved supervisors
    // 3. Existing group members (excluding the joining student)
    const recipients = [
      {
        userId: project.representativeId,
        read: false,
      },
      ...approvedSupervisors.map((supervisor) => ({
        userId: supervisor.teacherId,
        read: false,
      })),
      ...existingGroupMembers
        .filter((memberEmail) => memberEmail !== joiningStudentEmail)
        .map((memberEmail) => ({
          userId: memberEmail,
          read: false,
        })),
    ];

    const notification = new Notifications({
      type: "groupChange",
      title: "New Member Joined Group",
      message: `${joiningStudent.username} has joined group ${selectionId} for project "${project.title}"`,
      relatedEntity: {
        type: "group",
        id: project.title,
        secondaryId: selectionId, // Store the selectionId as secondaryId
      },
      recipients,
      sender: {
        userId: joiningStudentEmail,
        name: joiningStudent.username,
        role: "student",
      },
      actionRequired: false,
      priority: "medium",
      metadata: {
        actionType: "memberJoined",
        selectionId,
        joiningMember: joiningStudentEmail,
      },
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error("Error creating group join notification:", error);
    throw error;
  }
};

export const sendSubmissionNotification = async (
  projectId,
  selectionId,
  submittedByName,
  submissionId
) => {
  try {
    // Get project details
    const project = await Project.findById(projectId).select(
      "title representativeId"
    );
    if (!project) {
      console.error("Project not found for notification");
      return;
    }

    // Get group details
    const selection = await StudentSelection.findOne(
      { _id: projectId, "studentSelection.selectionId": selectionId },
      { "studentSelection.$": 1 }
    );

    if (!selection || !selection.studentSelection.length) {
      console.error("Group not found for notification");
      return;
    }

    const group = selection.studentSelection[0];

    // Get approved supervisors for this project
    const supervision = await TeacherSupervision.findOne({ _id: projectId });
    const approvedSupervisors =
      supervision?.supervisedBy.filter(
        (s) => s.responseFromInd.status === "approved"
      ) || [];

    // Create recipients list:
    // 1. Project representative
    // 2. All approved supervisors
    // 3. Group leader (if different from submitter)
    const recipients = [
      {
        userId: project.representativeId,
        read: false,
      },
      ...approvedSupervisors.map((supervisor) => ({
        userId: supervisor.teacherId,
        read: false,
      })),
      ...(group.groupLeader !== submittedByName
        ? [
            {
              userId: group.groupLeader,
              read: false,
            },
          ]
        : []),
    ];

    const notification = new Notifications({
      type: "submission",
      title: "New Submission Added",
      message: `${submittedByName} has submitted work for project "${project.title}" (Group: ${selectionId})`,
      relatedEntity: {
        type: "submission",
        id: project.title,
        secondaryId: submissionId,
      },
      recipients,
      sender: {
        userId: submittedByName,
        name: submittedByName,
        role: "student",
      },
      actionRequired: false,
      priority: "high",
      metadata: {
        submissionId,
        selectionId,
        projectTitle: project.title,
      },
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error("Error creating submission notification:", error);
    throw error;
  }
};

export const sendReviewNotification = async (
  projectId,
  selectionId,
  review
) => {
  try {
    // Get project details
    const project = await Project.findById(projectId).select("title");
    if (!project) {
      console.error("Project not found for notification");
      return;
    }

    // Get reviewer details
    const reviewer = await User.findOne({ email: review.reviewerId }).select(
      "username role"
    );
    if (!reviewer) {
      console.error("Reviewer not found for notification");
      return;
    }

    // Get group members
    const selection = await StudentSelection.findOne(
      { "studentSelection.selectionId": selectionId },
      { "studentSelection.$": 1 }
    );

    if (!selection || !selection.studentSelection.length) {
      console.error("Group not found for notification");
      return;
    }

    const groupMembers = selection.studentSelection[0].groupMembers;

    // Create notification for each group member
    const notification = new Notifications({
      type: "review",
      title: "New Review Received",
      message: `Your project "${project.title}" has been reviewed by ${reviewer.username} with rating ${review.rating}`,
      relatedEntity: {
        type: "review",
        id: project.title,
        secondaryId: selectionId,
      },
      recipients: groupMembers.map((member) => ({
        userId: member,
        read: false,
      })),
      sender: {
        userId: review.reviewerId,
        name: reviewer.username,
        role: reviewer.role,
      },
      actionRequired: false,
      actionType: null,
      actionLink: `/RatingsOrRemarks/${projectId}/${selectionId}`,
      priority: "medium",
      metadata: {
        rating: review.rating,
        comments: review.comments,
        projectTitle: project.title,
      },
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error("Error creating review notification:", error);
    throw error;
  }
};

export const sendRoleCompletionNotification = async (
  projectId,
  selectionId,
  role,
  completedByEmail = null
) => {
  try {
    // Get project details
    const project = await Project.findById(projectId).select("title");
    if (!project) {
      console.error("Project not found for notification");
      return;
    }

    // Get selection/group details
    const selection = await StudentSelection.findOne(
      { _id: projectId, "studentSelection.selectionId": selectionId },
      { "studentSelection.$": 1 }
    );

    if (!selection || !selection.studentSelection.length) {
      console.error("Group not found for notification");
      return;
    }

    const group = selection.studentSelection[0];
    const groupMembers = group.groupMembers;

    // Get the role name and sender details
    let roleName, sender;
    if (role === "industry") {
      roleName = "Industry Representative";
      const industryUser = (await User.findOne({
        email: completedByEmail,
      }).select("username role")) || {
        username: "Industry Supervisor",
        role: "industry",
      };
      sender = {
        userId: completedByEmail || "system",
        name: industryUser.username,
        role: industryUser.role,
      };
    } else {
      roleName = "Teacher/ Supervisor";
      const teacherUser = (await User.findOne({
        email: completedByEmail,
      }).select("username role")) || {
        username: "Teacher",
        role: "teacher",
      };
      sender = {
        userId: "system",
        name: "system",
        role: "system",
      };
    }

    // Create notification for each group member
    const notification = new Notifications({
      type: "projectCompletion",
      title: `${roleName} Marked Project as Completed`,
      message: `Your ${roleName.toLowerCase()} has marked project "${
        project.title
      }" (Group: ${selectionId}) as completed`,
      relatedEntity: {
        type: "project",
        id: project.title,
        secondaryId: selectionId,
      },
      recipients: groupMembers.map((member) => ({
        userId: member,
        read: false,
      })),
      sender,
      actionRequired: false,
      actionType: null,
      actionLink: `/project-submissions/${projectId}`,
      priority: "high",
      metadata: {
        selectionId,
        projectTitle: project.title,
        completedBy: role,
        completedAt: new Date(),
        completedByUser: completedByEmail,
      },
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error("Error creating role completion notification:", error);
    throw error;
  }
};

export const sendDateExtensionRequest = async (
  projectId,
  studentId,
  newEndDate,
  reason
) => {
  try {
    // Ensure newEndDate is a proper Date object
    const parsedNewEndDate = new Date(newEndDate);
    if (isNaN(parsedNewEndDate.getTime())) {
      throw new Error("Invalid new end date provided");
    }

    // Get minimal project details
    const project = await Project.findById(projectId).select(
      "title duration.endDate"
    );

    if (!project) {
      throw new Error("Project not found");
    }

    // Ensure project end date is a Date object
    const projectEndDate = new Date(project.duration.endDate);
    if (isNaN(projectEndDate.getTime())) {
      throw new Error("Invalid project end date in database");
    }

    // Get supervisor from TeacherSupervision
    const supervision = await TeacherSupervision.findById(projectId).select(
      "supervisedBy"
    );

    if (!supervision || !supervision.supervisedBy.length) {
      throw new Error("Project supervisor not found");
    }

    // Get primary supervisor (assuming first in array)
    const primarySupervisor = supervision.supervisedBy[0];

    // Get supervisor details from Users
    const supervisor = await User.findById(primarySupervisor.teacherId).select(
      "email username role"
    );

    if (!supervisor) {
      throw new Error("Supervisor user details not found");
    }

    // Get student details
    const student = await User.findById(studentId).select(
      "username email role"
    );
    if (!student) {
      throw new Error("Student not found");
    }

    // Check if there's already a pending request
    const existingRequest = await Notifications.findOne({
      type: "dateExtensionRequest",
      "relatedEntity.id": projectId,
      "metadata.studentId": studentId,
      "recipients.responded": false,
      "metadata.status": { $ne: "rejected" },
    });

    if (existingRequest) {
      throw new Error(
        "You already have a pending extension request for this project"
      );
    }

    // Format dates for display
    const formatDate = (date) => {
      if (!(date instanceof Date) || isNaN(date.getTime())) {
        throw new Error(`Invalid date: ${date}`);
      }
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };

    // Create the notification
    const notification = new Notifications({
      type: "dateExtensionRequest",
      title: "Project Deadline Extension Request",
      message: `Student ${
        student.username
      } has requested to extend the project "${
        project.title
      }" deadline from ${formatDate(projectEndDate)} to ${formatDate(
        parsedNewEndDate
      )}. Reason: ${reason}`,
      relatedEntity: {
        type: "project",
        id: projectId,
        secondaryId: studentId,
      },
      recipients: [
        {
          userId: supervisor.email, // Changed from project.supervisor.email to supervisor.email
          read: false,
          responded: false,
          response: "pending",
        },
      ],
      sender: {
        userId: student.email,
        name: student.username,
        role: student.role,
      },
      actionRequired: null,
      actionType: null,
      actionLink: `/studentProgressStd/${projectId}_evaluation`,
      responseDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days to respond
      priority: "high",
      metadata: {
        currentEndDate: projectEndDate,
        requestedEndDate: parsedNewEndDate,
        reason: reason,
        studentId: studentId,
        studentName: student.username,
        status: "pending",
      },
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error("Error creating date extension notification:", error);
    throw error;
  }
};

// New function to check for pending requests
export const checkPendingExtensionRequest = async (projectId, userId) => {
  const request = await Notifications.findOne({
    type: "dateExtensionRequest",
    "relatedEntity.id": projectId,
    "metadata.studentId": userId,
    // "recipients.responded": false,
    // "metadata.status": { $ne: "rejected" },
  });

  return {
    hasPending: !!request,
    requestDetails: request
      ? {
          date: request.metadata.requestedEndDate,
          reason: request.metadata.reason,
          submittedAt: request.createdAt,
        }
      : null,
  };
};

// Check for pending extension request
router.get("/check-pending-extension/:projectId/:userId", async (req, res) => {
  try {
    const result = await checkPendingExtensionRequest(
      req.params.projectId,
      req.params.userId
    );
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Submit extension request
router.post("/extension-request", async (req, res) => {
  try {
    const notification = await sendDateExtensionRequest(
      req.body.projectId,
      req.body.studentId,
      req.body.newEndDate,
      req.body.reason
    );
    res.status(201).json(notification);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Backend route
router.get("/check-pending-extension_project/:projectId", async (req, res) => {
  try {
    const result = await checkPendingProjectExtensionRequest(
      req.params.projectId
    );
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Updated check function
export const checkPendingProjectExtensionRequest = async (projectId) => {
  const request = await Notifications.findOne({
    type: "dateExtensionRequest",
    "relatedEntity.id": projectId,
    // "recipients.responded": false,
    // "metadata.status": { $ne: "rejected" },
  });

  return {
    hasPending: !!request,
    requestDetails: request
      ? {
          notificationId: request._id,
          date: request.metadata.requestedEndDate,
          reason: request.metadata.reason,
          submittedAt: request.createdAt,
          requestedBy: request.sender.name, // Add who requested it
        }
      : null,
  };
};

// Route to forward extension request to project representative
router.post("/forward-extension-request", async (req, res) => {
  try {
    const { notificationId, teacherId, decision, newEndDate, comment } =
      req.body;

    // Validate inputs
    if (!notificationId || !teacherId || !decision) {
      throw new Error("Missing required fields");
    }

    // Find the original notification
    const originalNotification = await Notifications.findById(notificationId);
    if (!originalNotification) {
      throw new Error("Original notification not found");
    }

    // Verify the teacher is the intended recipient and hasn't responded yet
    const teacherRecipient = originalNotification.recipients.find(
      (recipient) => recipient.userId === teacherId && !recipient.responded
    );

    if (!teacherRecipient) {
      throw new Error(
        "You are not authorized to respond to this request or have already responded"
      );
    }

    // Get teacher details from User collection
    const teacherUser = await User.findById(teacherId).select("username");
    if (!teacherUser) {
      throw new Error("Teacher user details not found");
    }

    // Update the teacher's response in the original notification
    teacherRecipient.responded = true;
    teacherRecipient.response = decision;
    teacherRecipient.comment = comment;

    // Update the metadata status
    originalNotification.metadata.status =
      decision === "approved" ? "teacherApproved" : "rejected";
    originalNotification.actionRequired = false;

    // If approved by teacher, forward to project representative
    if (decision === "approved") {
      // Get project details to find representative
      const project = await Project.findById(
        originalNotification.relatedEntity.id
      ).select("representativeId");

      if (!project || !project.representativeId) {
        throw new Error("Project representative not found");
      }

      // Get representative details
      const representative = await User.findById(
        project.representativeId
      ).select("email username role");

      if (!representative) {
        throw new Error("Project representative user details not found");
      }

      // Parse the new end date (either from teacher's input or original request)
      const parsedNewEndDate = newEndDate
        ? new Date(newEndDate)
        : originalNotification.metadata.requestedEndDate;
      if (isNaN(parsedNewEndDate.getTime())) {
        throw new Error("Invalid new end date provided");
      }

      // Create a forwarded notification
      const forwardedNotification = new Notifications({
        type: "dateExtensionApproval",
        title: "Project Deadline Extension Approval Needed",
        message: `Teacher ${
          teacherUser.username
        } has approved a deadline extension request for project "${
          originalNotification.relatedEntity.id
        }" from student ${
          originalNotification.metadata.studentName
        }. New proposed end date: ${parsedNewEndDate.toLocaleDateString(
          "en-US",
          {
            year: "numeric",
            month: "long",
            day: "numeric",
          }
        )}. ${comment ? `Teacher comment: ${comment}` : ""}`,
        relatedEntity: {
          type: "project",
          id: originalNotification.relatedEntity.id,
          secondaryId: originalNotification.relatedEntity.secondaryId,
        },
        recipients: [
          {
            userId: representative.email,
            read: false,
            responded: false,
            response: "pending",
          },
        ],
        sender: {
          userId: teacherId,
          name: teacherUser.username,
          role: "teacher",
        },
        actionRequired: null,
        actionType: null,
        actionLink: `/studentProgress/${originalNotification.relatedEntity.id}`,
        priority: "high",
        metadata: {
          ...originalNotification.metadata,
          requestedEndDate: parsedNewEndDate,
          teacherApprovalDate: new Date(),
          teacherComment: comment,
          status: "pendingRepresentativeApproval",
        },
      });

      // Save both notifications
      await Promise.all([
        originalNotification.save(),
        forwardedNotification.save(),
      ]);

      res.status(201).json({
        originalNotification,
        forwardedNotification,
      });
    } else {
      // If rejected, just update the original notification
      await originalNotification.save();
      res.status(200).json({ originalNotification });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/check-extension-request/:projectId/:userId", async (req, res) => {
  try {
    const { projectId, userId } = req.params;

    // Check for any existing extension request notifications
    const existingRequest = await Notifications.findOne({
      "relatedEntity.id": projectId,
      type: { $in: ["dateExtensionRequest", "dateExtensionApproval"] },
      $or: [
        { "sender.userId": userId }, // User is the sender
        { "recipients.userId": userId }, // User is a recipient
      ],
    }).sort({ createdAt: -1 }); // Get the most recent one

    if (existingRequest) {
      return res.status(200).json({
        exists: true,
        request: {
          notificationId: existingRequest._id,
          requestedBy:
            existingRequest.sender.userName ||
            existingRequest.metadata.studentName,
          date: existingRequest.metadata.requestedEndDate,
          reason: existingRequest.metadata.reason,
          submittedAt: existingRequest.createdAt,
          status: existingRequest.metadata.status,
          // Include recipient information if user is a recipient
          isRecipient: existingRequest.recipients.some(
            (r) => r.userId === userId
          ),
          // Include sender information
          isSender: existingRequest.sender.userId === userId,
        },
      });
    }

    res.status(200).json({ exists: false });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get(
  "/check-forwarded-request/:projectId/:teacherId",
  async (req, res) => {
    try {
      const { projectId, teacherId } = req.params;

      const forwardedRequest = await Notifications.findOne({
        "relatedEntity.id": projectId,
        type: "dateExtensionApproval",
        "sender.userId": teacherId,
        "metadata.status": "pendingRepresentativeApproval",
      }).sort({ createdAt: -1 });

      if (forwardedRequest) {
        return res.status(200).json({
          forwarded: true,
          notification: {
            id: forwardedRequest._id,
            status: forwardedRequest.metadata.status,
            dateRequested: forwardedRequest.metadata.requestedEndDate,
            forwardedAt: forwardedRequest.createdAt,
            representativeId: forwardedRequest.recipients[0]?.userId,
          },
        });
      }

      res.status(200).json({ forwarded: false });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

router.post("/respond-to-extension", async (req, res) => {
  try {
    const {
      notificationId,
      representativeId,
      decision,
      comment,
      requestedEndDate,
    } = req.body;

    // Validate inputs
    if (!notificationId || !representativeId || !decision) {
      throw new Error("Missing required fields");
    }

    // Find the extension request notification
    const extensionNotification = await Notifications.findById(notificationId);
    if (
      !extensionNotification ||
      extensionNotification.type !== "dateExtensionApproval"
    ) {
      throw new Error("Extension request notification not found");
    }

    // Verify the representative is the intended recipient and hasn't responded yet
    const repRecipient = extensionNotification.recipients.find(
      (recipient) =>
        recipient.userId === representativeId && !recipient.responded
    );

    if (!repRecipient) {
      throw new Error(
        "You are not authorized to respond to this request or have already responded"
      );
    }

    // Get representative details
    const representative = await User.findById(representativeId).select(
      "username"
    );
    if (!representative) {
      throw new Error("Representative user details not found");
    }

    // Update the representative's response
    repRecipient.responded = true;
    repRecipient.response = decision;
    repRecipient.comment = comment;

    // Use the requestedEndDate from the request body if provided, otherwise use the one from notification metadata
    const finalEndDate = requestedEndDate
      ? new Date(requestedEndDate)
      : extensionNotification.metadata.requestedEndDate;

    // Update the metadata status and end date
    extensionNotification.metadata.status =
      decision === "approved" ? "approved" : "rejected";
    extensionNotification.metadata.requestedEndDate = finalEndDate; // Update the end date
    extensionNotification.actionRequired = false;

    // Get project details
    const project = await Project.findById(
      extensionNotification.relatedEntity.id
    ).select("title duration.endDate supervisorId representativeId");

    if (!project) {
      throw new Error("Project not found");
    }

    // Get student details (secondaryId in relatedEntity is studentId)
    const student = await User.findById(
      extensionNotification.relatedEntity.secondaryId
    ).select("username email role");

    if (!student) {
      throw new Error("Student not found");
    }

    // Get supervisor from TeacherSupervision
    const supervision = await TeacherSupervision.findById(project._id).select(
      "supervisedBy"
    );

    if (!supervision || !supervision.supervisedBy.length) {
      throw new Error("Project supervisor not found");
    }

    const primarySupervisor = supervision.supervisedBy[0];

    const teacher = await User.findById(primarySupervisor.teacherId).select(
      "email username role"
    );

    if (!teacher) {
      throw new Error("Teacher not found");
    }

    const formatDate = (date) => {
      const dateObj = date instanceof Date ? date : new Date(date);
      if (isNaN(dateObj.getTime())) {
        return "Invalid date";
      }
      return dateObj.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };

    // Create notification message based on decision
    const decisionMessage =
      decision === "approved"
        ? `has approved your request to extend the project deadline to ${formatDate(
            finalEndDate
          )}.`
        : "has rejected your request to extend the project deadline.";

    const fullMessage = `Industry representative ${
      representative.username
    } ${decisionMessage} ${comment ? `Comment: ${comment}` : ""}`;

    // Create notifications for student and teacher
    const notification = new Notifications({
      type: "dateExtensionApproval",
      title: `Project Deadline Extension ${
        decision === "approved" ? "Approved" : "Rejected"
      }`,
      message: fullMessage,
      relatedEntity: {
        type: "project",
        id: extensionNotification.relatedEntity.id,
      },
      recipients: [
        {
          userId: student.email,
          read: false,
        },
        {
          userId: teacher.email,
          read: false,
        },
      ],
      sender: {
        userId: representativeId,
        name: representative.username,
        role: "industry",
      },
      actionRequired: false,
      priority: "high",
      metadata: {
        ...extensionNotification.metadata,
        representativeDecision: decision,
        representativeComment: comment,
        decisionDate: new Date(),
      },
    });

    // If approved, update the project end date
    if (decision === "approved") {
      project.duration.endDate = finalEndDate;
      await project.save();
    }

    // Save both notifications
    await Promise.all([extensionNotification.save(), notification.save()]);

    res.status(200).json({
      message: `Extension request ${decision} successfully`,
      decisionNotification: notification,
      updatedProject: decision === "approved" ? project : undefined,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
