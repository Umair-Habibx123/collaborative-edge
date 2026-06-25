import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import User from "../models/User.js";
import Teacher from "../models/Teachers.js";
import Student from "../models/Students.js";
import IndustryRepresentative from "../models/Industry.js";
import dotenv from "dotenv";
import axios from "axios";
dotenv.config();
import { getAllProjects } from "../controllers/adminProjectDataController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";


const router = Router();
router.use(cookieParser());

router.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Every endpoint in this router is administrative — require an authenticated admin.
router.use(protect, authorize("admin"));

router.get("/fetchAllUsers", async (req, res) => {
  try {
    const users = await User.find({}).lean();

    const filteredUsers = users.map((user) => {
      return user;
    });

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// router.get("/fetchRoleBasedUsers", async (req, res) => {
//     try {
//         const { role } = req.query;

//         if (!role) {
//             return res.status(400).json({ error: "Role parameter is required" });
//         }

//         let users;

//         if (role.toLowerCase() === "all") {
//             users = await User.find({}).lean();
//         } else {
//             users = await User.find({ role }).lean();
//         }

//         res.status(200).json(users);
//     } catch (error) {
//         console.error("Error fetching users:", error);
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// });

// show a user as "verified" in the UserManagement component only when all their role-specific
// verification statuses are approved/verified.

router.get("/fetchRoleBasedUsers", async (req, res) => {
  try {
    const { role } = req.query;
    const query = role && role !== "all" ? { role } : {};

    const users = await User.find(query);

    const usersWithStatus = await Promise.all(
      users.map(async (user) => {
        let roleVerified = false;

        switch (user.role) {
          case "student":
            const student = await Student.findOne({ _id: user._id });
            roleVerified = student?.verified || false;
            break;
          case "teacher":
            const teacher = await Teacher.findOne({ _id: user._id });
            roleVerified = teacher?.verified || false;
            break;
          case "industry":
            const industryRep = await IndustryRepresentative.findOne({
              _id: user._id,
            });
            roleVerified =
              industryRep?.representingIndustries?.every(
                (ind) => ind.verified
              ) || false;
            break;
          case "admin":
            roleVerified = true;
            break;
        }

        const status =
          user.status === "verified" && roleVerified
            ? "verified"
            : user.status === "banned"
            ? "banned"
            : "pending";

        return {
          ...user.toObject(),
          status,
        };
      })
    );

    res.json(usersWithStatus);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/fetchEachUserFullDetails", async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: "Email is required." });
  }

  try {
    console.log("Fetching user profile for:", email);

    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const userProfile = {
      _id: user._id,
      username: user.username,
      email: user.email,
      profilePic: user.profilePic
        ? `${process.env.VITE_REACT_APP_BACKEND_BASEURL}${user.profilePic}`
        : null,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    if (user.role === "industry") {
      console.log("Fetching industry profile for:", user._id);
      const industryProfile = await IndustryRepresentative.findOne({
        _id: user._id,
      });

      if (industryProfile) {
        console.log("Industry profile found:", industryProfile);

        userProfile.industryDetails = {
          representingIndustries: industryProfile.representingIndustries,
          verifiedAt: industryProfile.verifiedAt,
          verifiedBy: industryProfile.verifiedBy,
        };
      } else {
        console.log("No industry profile found for:", user._id);
      }
    }

    if (user.role === "teacher") {
      console.log("Fetching teacher profile for:", user._id);
      const teacherProfile = await Teacher.findOne({ _id: user._id });

      if (teacherProfile) {
        console.log("Teacher profile found:", teacherProfile);

        userProfile.teacherDetails = {
          employeeId: teacherProfile.employeeId,
          designation: teacherProfile.designation,
          department: teacherProfile.department,
          university: teacherProfile.university,
          verified: teacherProfile.verified,
          verificationDocuments: teacherProfile.verificationDocuments,
          verifiedAt: teacherProfile.verifiedAt,
          verifiedBy: teacherProfile.verifiedBy,
        };
      } else {
        console.log("No teacher profile found for:", user._id);
      }
    }

    if (user.role === "student") {
      console.log("Fetching student profile for:", user._id);
      const studentProfile = await Student.findOne({ _id: user._id });

      if (studentProfile) {
        console.log("Student profile found:", studentProfile);

        userProfile.studentDetails = {
          studentId: studentProfile.studentId,
          degreeOrProgram: studentProfile.degreeOrProgram,
          yearOfStudy: studentProfile.yearOfStudy,
          university: studentProfile.university,
          verified: studentProfile.verified,
          verificationDocuments: studentProfile.verificationDocuments,
          verifiedAt: studentProfile.verifiedAt,
          verifiedBy: studentProfile.verifiedBy,
        };
      } else {
        console.log("No student profile found for:", user._id);
      }
    }

    console.log("User profile fetched:", userProfile);
    res.status(200).json(userProfile);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/update-user-status", async (req, res) => {
  const { email, status, password } = req.body;

  try {
    const updatedUser = await User.findOneAndUpdate(
      { email },
      { status },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // If status is being updated to "verified", send confirmation email
    if (status === "verified") {
      const emailResponse = await axios.post(
        `${process.env.VITE_REACT_APP_BACKEND_BASEURL}/send-verification-confirmation`,
        {
          email: email,
          password: password,
        }
      );

      if (!emailResponse.data.success) {
        console.error("Failed to send verification email");
        // You might want to handle this differently
      }
    }

    res
      .status(200)
      .json({ message: "User status updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Error updating user status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/update-industry-rep-status", async (req, res) => {
  const { email, industryId, verified, verifiedBy } = req.body;

  try {
    const updateData = {
      $set: {
        "representingIndustries.$.verified": verified,
        ...(verified && {
          "representingIndustries.$.verifiedBy": verifiedBy,
          verifiedBy: verifiedBy,
          verifiedAt: new Date(),
        }),
      },
    };

    const updatedIndustryRep = await IndustryRepresentative.findOneAndUpdate(
      { _id: email, "representingIndustries.industryId": industryId },
      updateData,
      { new: true }
    );

    if (!updatedIndustryRep) {
      return res
        .status(404)
        .json({ message: "Industry representative not found" });
    }

    res.status(200).json({
      message: "Industry representative status updated successfully",
      industryRep: updatedIndustryRep,
    });
  } catch (error) {
    console.error("Error updating industry representative status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/update-teacher-status", async (req, res) => {
  const { email, verified, verifiedBy } = req.body; // Add verifiedBy

  try {
    const updateData = {
      verified,
      ...(verified && {
        // Only set these when verifying (true)
        verifiedBy,
        verifiedAt: new Date(),
      }),
    };

    const updatedTeacher = await Teacher.findOneAndUpdate(
      { _id: email },
      updateData,
      { new: true }
    );

    if (!updatedTeacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    res.status(200).json({
      message: "Teacher status updated successfully",
      teacher: updatedTeacher,
    });
  } catch (error) {
    console.error("Error updating teacher status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/update-student-status", async (req, res) => {
  const { email, verified, verifiedBy } = req.body; // Add verifiedBy

  try {
    const updateData = {
      verified,
      ...(verified && {
        // Only set these when verifying (true)
        verifiedBy,
        verifiedAt: new Date(),
      }),
    };

    const updatedStudent = await Student.findOneAndUpdate(
      { _id: email },
      updateData,
      { new: true }
    );

    if (!updatedStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json({
      message: "Student status updated successfully",
      student: updatedStudent,
    });
  } catch (error) {
    console.error("Error updating student status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});



router.get('/admin_project_data', getAllProjects);



export default router;
