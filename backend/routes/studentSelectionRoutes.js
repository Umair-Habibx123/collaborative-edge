import { Router } from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import StudentSelection from "../models/StudentSelection.js";
import crypto from "crypto";
import Project from "../models/Projects.js";
import TeacherSupervision from "../models/TeacherSupervision.js"
import User from "../models/User.js"
import Teacher from "../models/Teachers.js";
import Student from "../models/Students.js"
import { sendGroupSelectionNotification, sendGroupJoinNotification , sendRoleCompletionNotification  } from '../routes/notificationRoutes.js';

import { protect } from "../middleware/authMiddleware.js";

dotenv.config();

const router = Router();
router.use(cookieParser());
router.use(protect);

router.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

async function generateUniqueSelectionId(userEmail, projectId, existingSelections) {
    let selectionId;
    do {
        const emailPart = userEmail.split("@")[0];
        const projectPart = projectId.substring(0, 5);
        const randomPart = crypto.randomBytes(2).toString("hex");

        selectionId = `${emailPart}-${projectPart}-${randomPart}`;
    } while (existingSelections.includes(selectionId));

    return selectionId;
}



router.get('/fetchUserSelectedProjects', async (req, res) => {
    const { userId } = req.query;

    try {
        const selectedProjects = await StudentSelection.find({
            "studentSelection.groupMembers": userId
        });

        const projectIds = selectedProjects.map(project => project._id);

        res.status(200).json({ projectIds });
    } catch (error) {
        console.error("Error fetching user's selected projects:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


router.get('/check-previous-selection/:email', async (req, res) => {
    try {
        const { email } = req.params;

        // Find all documents where the student is either a group leader or member
        const studentSelections = await StudentSelection.find({
            $or: [
                { 'studentSelection.groupLeader': email },
                { 'studentSelection.groupMembers': email }
            ]
        });

        if (!studentSelections || studentSelections.length === 0) {
            return res.status(200).json({ 
                success: true, 
                hasPreviousSelection: false,
                isCompleted: null,
                message: 'No previous selections found for this student'
            });
        }

        // Get all selections where student is involved
        const allStudentSelections = [];
        studentSelections.forEach(doc => {
            doc.studentSelection.forEach(selection => {
                if (selection.groupLeader === email || 
                    selection.groupMembers.includes(email)) {
                    allStudentSelections.push(selection);
                }
            });
        });

        if (allStudentSelections.length === 0) {
            return res.status(200).json({ 
                success: true, 
                hasPreviousSelection: false,
                isCompleted: null,
                message: 'No relevant selections found for this student'
            });
        }

        // Check if ALL selections are completed
        const allCompleted = allStudentSelections.every(
            selection => selection.status.isCompleted
        );

        // Check if ANY selection is incomplete
        const anyIncomplete = allStudentSelections.some(
            selection => !selection.status.isCompleted
        );

        return res.status(200).json({ 
            success: true, 
            hasPreviousSelection: true,
            isCompleted: allCompleted,
            message: allCompleted 
                ? 'All previous selections are completed' 
                : 'Some previous selections are incomplete',
            totalSelections: allStudentSelections.length,
            completedCount: allStudentSelections.filter(s => s.status.isCompleted).length
        });

    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error checking previous selections',
            error: error.message
        });
    }
});

router.get("/fetchselectionDetails/:projectId/:studentId", async (req, res) => {
    try {
        const { projectId, studentId } = req.params;

        // Find the project by ID
        const project = await StudentSelection.findById(projectId);

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        // Find the selection where the student is either the group leader, a group member, or the mentor
        const selection = project.studentSelection.find(
            (selection) =>
                selection.groupLeader === studentId ||
                selection.groupMembers.includes(studentId)
        );

        if (!selection) {
            return res.status(404).json({ message: "Selection not found for the given student" });
        }

        // Fetch details for the group leader
        const groupLeaderDetails = await fetchStudentDetails(selection.groupLeader);

        // Fetch details for each group member
        const groupMembersDetails = await Promise.all(
            selection.groupMembers.map(async (memberId) => {
                return await fetchStudentDetails(memberId);
            })
        );

        // Return the selection details including the mentor and student details
        const response = {
            _id: project._id,
            studentSelection: [
                {
                    selectionId: selection.selectionId,
                    groupLeader: groupLeaderDetails,
                    groupMembers: groupMembersDetails,
                    joinedAt: selection.joinedAt,
                    status: selection.status,
                    completedAt: selection.completedAt ?? null,
                },
            ],
        };

        res.status(200).json(response);
    } catch (error) {
        console.error("Error fetching selection details:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


router.get("/CheckUserInProject", async (req, res) => {
    const { projectId, userEmail } = req.query;

    try {

        const project = await StudentSelection.findById(projectId);

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }


        const isUserInProject = project.studentSelection.some((selection) =>
            selection.groupMembers.includes(userEmail)
        );

        if (isUserInProject) {
            return res.status(200).json({ message: "User is in the project" });
        } else {
            return res.status(404).json({ message: "User is not in the project" });
        }
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

router.post("/JoinExistingGroupforProject", async (req, res) => {
    const { projectId, selectionId, userEmail } = req.body;

    try {
        // 1. Find the project in StudentSelection collection
        const studentSelection = await StudentSelection.findById(projectId);
        if (!studentSelection) {
            return res.status(404).json({ 
                message: "There Is No Existing Groups Available. Try \"SELECT PROJECT AS NEW GROUP\"" 
            });
        }

        // 2. Find the specific selection/group
        const selection = studentSelection.studentSelection.find(
            (sel) => sel.selectionId === selectionId
        );
        if (!selection) {
            return res.status(404).json({ message: "Invalid Selection Id" });
        }

        // 3. Find the corresponding project to get maxStudentsPerGroup
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        // 4. Check if user is already in the group
        if (selection.groupMembers.includes(userEmail)) {
            return res.status(400).json({ message: "User is already in the group" });
        }

        // 5. Check group size limit against project's maxStudentsPerGroup
        if (selection.groupMembers.length >= project.maxStudentsPerGroup) {
            return res.status(400).json({ 
                message: `Group is full (maximum ${project.maxStudentsPerGroup} students allowed)` 
            });
        }

        // 6. Add user to group
        selection.groupMembers.push(userEmail);
        selection.groupMembers = [...new Set(selection.groupMembers)]; // Ensure uniqueness

        await studentSelection.save();

        // 7. Send notifications to:
        //    - Project representative
        //    - Approved supervisors
        //    - Existing group members
        await sendGroupJoinNotification(
            projectId,
            selectionId,
            userEmail,
            selection.groupMembers
        );

        res.status(200).json({ 
            message: "Successfully joined the group", 
            project: studentSelection,
            maxStudentsPerGroup: project.maxStudentsPerGroup
        });
    } catch (error) {
        console.error("Error joining group:", error);
        res.status(500).json({ 
            message: "Internal server error", 
            error: error.message 
        });
    }
});


router.get('/check-university', async (req, res) => {
  const { docId, university } = req.query;

  if (!docId || !university) {
    return res.status(400).json({ error: 'docId and university are required' });
  }

  try {
    
    const document = await StudentSelection.findById(docId);

    if (!document || document.studentSelection.length === 0) {
      return res.json({ isClaimedByUniversity: false });
    }
    
    const isClaimed = document.studentSelection.some(
      selection => selection.university === university
    );

    return res.json({ isClaimedByUniversity: isClaimed });
  } catch (error) {
    console.error('Error checking university selection:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      details: error.message 
    });
  }
});


// api allowed each specific uni selection lenght must be equal to fixed project max groups... can total selection excedds as approval excedds

router.post("/SelectProjectAsNewGroup", async (req, res) => {
    const { projectId, userEmail, userUniversity } = req.body;

    try {
        const projectDetails = await Project.findById(projectId);

        if (!projectDetails) {
            return res.status(404).json({ message: "Project not found" });
        }

        let studentSelection = await StudentSelection.findById(projectId);
        const currentDate = new Date();
        const projectEndDate = new Date(projectDetails.duration.endDate);

        if (currentDate > projectEndDate) {
            return res.status(400).json({ message: "The project's end date has passed. No new groups can be created." });
        }

        if (!studentSelection) {
            studentSelection = new StudentSelection({
                _id: projectId,
                studentSelection: [],
            });
        }

        const universityGroupCount = studentSelection.studentSelection.filter(
            sel => sel.university === userUniversity
        ).length;

        if (universityGroupCount >= projectDetails.maxGroups) {
            return res.status(400).json({
                message: `Maximum number of groups reached for this project from ${userUniversity}. 
                Each university can have up to ${projectDetails.maxGroups} groups.`
            });
        }

        const existingSelections = studentSelection.studentSelection.map(sel => sel.selectionId);
        const selectionId = await generateUniqueSelectionId(userEmail, projectId, existingSelections);

        const newSelection = {
            selectionId,
            groupLeader: userEmail,
            university: userUniversity,
            groupMembers: [userEmail],
            joinedAt: new Date(),
            isCompleted: false,
            completedAt: null
        };

        studentSelection.studentSelection.push(newSelection);
        await studentSelection.save();

        // Send notifications to project representative and approved supervisors
        await sendGroupSelectionNotification(projectId, userEmail, userUniversity);

        res.status(201).json({
            message: "New group created successfully",
            selectionId,
            studentSelection,
            universityGroupCount: universityGroupCount + 1,
            maxGroupsPerUniversity: projectDetails.maxGroups
        });
    } catch (error) {
        console.error("Error in SelectProjectAsNewGroup:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});


router.get("/fetchProjectsWithTeachers", async (req, res) => {
    try {
        const { university } = req.query;

        if (!university) {
            return res.status(400).json({ message: "University is required" });
        }

        const approvedProjects = await TeacherSupervision.find({
            "supervisedBy": {
                $elemMatch: {
                    university: university,
                    "responseFromInd.status": "approved"
                }
            }
        }).populate('supervisedBy.teacherId');

        if (!approvedProjects || approvedProjects.length === 0) {
            return res.status(404).json({ message: "No approved projects found for the given university" });
        }


        const projectIds = approvedProjects.map(project => project._id);


        const projects = await Project.find({ _id: { $in: projectIds } });

        if (!projects || projects.length === 0) {
            return res.status(404).json({ message: "No projects found" });
        }


        const projectsWithTeachers = await Promise.all(projects.map(async (project) => {
            const supervision = approvedProjects.find(sup => sup._id.toString() === project._id.toString());
            if (supervision && supervision.supervisedBy.length > 0) {
                const teacher = supervision.supervisedBy[0];
                const teacherDetails = await fetchTeacherDetails(teacher.teacherId);
                return { ...project.toObject(), teacherDetails };
            }
            return project.toObject();
        }));

        res.status(200).json({ projects: projectsWithTeachers });
    } catch (error) {
        console.error("Error fetching projects with teachers:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

const fetchTeacherDetails = async (teacherId) => {
    try {
        const user = await User.findOne({ _id: teacherId });
        if (!user) {
            return null;
        }

        const userProfile = {
            _id: user._id,
            username: user.username,
            email: user.email,
            profilePic: user.profilePic ? `${process.env.VITE_REACT_APP_BACKEND_BASEURL}${user.profilePic}` : null,
            role: user.role,
            status: user.status,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };

        if (user.role === "teacher") {
            const teacherProfile = await Teacher.findOne({ _id: user._id });
            if (teacherProfile) {
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
            }
        }

        return userProfile;
    } catch (error) {
        console.error("Error fetching teacher details:", error);
        return null;
    }
};



router.get("/getAllSelectionGroupsForTeachers", async (req, res) => {
    const { university, projectId } = req.query;

    if (!university) {
        return res.status(400).json({ message: "University is required in query params." });
    }

    if (!projectId) {
        return res.status(400).json({ message: "Project ID is required in query params." });
    }

    try {
        // Query for the document with matching _id and university in subdocuments
        const doc = await StudentSelection.findOne({
            _id: projectId,
            "studentSelection.university": university
        });

        if (!doc) {
            return res.status(404).json({ message: "No matching selection groups found" });
        }

        // Filter only matching subdocuments
        const filteredSelection = doc.studentSelection.filter(
            sel => sel.university === university
        );

        // Enhance each selection with student details
        const enhancedSelections = await Promise.all(
            filteredSelection.map(async (selection) => {
                // Get all student emails from both groupLeader and groupMembers
                const studentEmails = [
                    selection.groupLeader,
                    ...(selection.groupMembers || [])
                ].filter(email => email); // Remove any null/undefined

                // Fetch details for each student
                const studentsWithDetails = await Promise.all(
                    studentEmails.map(async (email) => {
                        const studentDetails = await fetchStudentDetails(email);
                        return {
                            email,
                            username: studentDetails?.username || null,
                            profilePic: studentDetails?.profilePic || null,
                            // Include any other student details you want
                            ...(studentDetails?.studentDetails || {})
                        };
                    })
                );

                return {
                    ...selection.toObject(),
                    students: studentsWithDetails
                };
            })
        );

        res.status(200).json({
            _id: doc._id,
            studentSelection: enhancedSelections
        });
    } catch (error) {
        console.error("Error fetching selection groups:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});


router.get("/getAllSelectionGroups", async (req, res) => {
    const { projectId } = req.query;

    if (!projectId) {
        return res.status(400).json({ message: "Project ID is required in query params." });
    }

    try {
        // Find the project document by ID
        const doc = await StudentSelection.findById(projectId);

        if (!doc) {
            return res.status(404).json({ message: "No selection groups found for this project" });
        }

        const allSelections = doc.studentSelection || [];

        // Enhance each selection with student details
        const enhancedSelections = await Promise.all(
            allSelections.map(async (selection) => {
                const studentEmails = [
                    selection.groupLeader,
                    ...(selection.groupMembers || [])
                ].filter(email => email);

                const studentsWithDetails = await Promise.all(
                    studentEmails.map(async (email) => {
                        const studentDetails = await fetchStudentDetails(email);
                        return {
                            email,
                            username: studentDetails?.username || null,
                            profilePic: studentDetails?.profilePic || null,
                            ...(studentDetails?.studentDetails || {})
                        };
                    })
                );

                return {
                    ...selection.toObject(),
                    students: studentsWithDetails
                };
            })
        );

        res.status(200).json({
            _id: doc._id,
            studentSelection: enhancedSelections
        });
    } catch (error) {
        console.error("Error fetching all selection groups:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});



router.get("/fetchProjectsWithGroupMembersAndSelectionDetails", async (req, res) => {
    try {
        const { userEmail } = req.query;

        if (!userEmail) {
            return res.status(400).json({ message: "User email is required" });
        }

        // Find all student selections where the user is a member
        const studentSelections = await StudentSelection.find({
            "studentSelection.groupMembers": userEmail
        }).lean(); // Use lean() for better performance

        if (!studentSelections || studentSelections.length === 0) {
            return res.status(404).json({ message: "No projects found for the user" });
        }

        // Get project IDs as strings
        const projectIds = studentSelections.map(selection => selection._id.toString());

        // Find all projects
        const projects = await Project.find({ _id: { $in: projectIds } }).lean();

        if (!projects || projects.length === 0) {
            return res.status(404).json({ message: "No projects found" });
        }

        // Create a map for faster lookup
        const selectionMap = new Map();
        studentSelections.forEach(selection => {
            selectionMap.set(selection._id.toString(), selection);
        });

        // Process all data in one go
        const projectsWithAllDetails = await Promise.all(
            projects.map(async (project) => {
                const projectIdStr = project._id.toString();
                const selection = selectionMap.get(projectIdStr);

                if (!selection || !selection.studentSelection) {
                    return {
                        ...project,
                        groupMembers: [],
                        selectionDetails: null
                    };
                }

                // Find the specific selection where user is a member
                const userSelection = selection.studentSelection.find(
                    sel => sel.groupMembers.includes(userEmail)
                );

                if (!userSelection) {
                    return {
                        ...project,
                        groupMembers: [],
                        selectionDetails: null
                    };
                }

                // Get all group members (including leader)
                const allMemberEmails = [
                    userSelection.groupLeader,
                    ...userSelection.groupMembers
                ];

                // Remove duplicates
                const uniqueMemberEmails = [...new Set(allMemberEmails)];

                // Fetch all member details at once
                const memberDetails = await Promise.all(
                    uniqueMemberEmails.map(email => fetchStudentDetails(email))
                );

                // Create a map of email to user details for quick lookup
                const memberDetailsMap = new Map();
                memberDetails.forEach(detail => {
                    if (detail) memberDetailsMap.set(detail.email, detail);
                });

                // Prepare selection details
                const selectionDetails = {
                    selectionId: userSelection.selectionId,
                    groupLeader: memberDetailsMap.get(userSelection.groupLeader),
                    groupMembers: userSelection.groupMembers
                        .map(email => memberDetailsMap.get(email))
                        .filter(Boolean), // Remove any undefined values
                    joinedAt: userSelection.joinedAt,
                    isCompleted: userSelection.status?.isCompleted || false,
                    completedAt: userSelection.completedAt ?? null
                };

                // Get group members for the project (all members in the selection)
                const groupMembers = Array.from(memberDetailsMap.values());

                return {
                    ...project,
                    groupMembers,
                    selectionDetails
                };
            })
        );

        res.status(200).json({ projects: projectsWithAllDetails });
    } catch (error) {
        console.error("Error fetching projects with all details:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


router.get("/fetchProjectsWithStudentsByUniversity", async (req, res) => {
    try {
        const { university, teacherEmail } = req.query;

        if (!university || !teacherEmail) {
            return res.status(400).json({
                message: "Both university name and teacher email are required"
            });
        }

        // const studentSelections = await StudentSelection.find({
        //     "studentSelection.university": university
        // }).lean();

        // if (!studentSelections || studentSelections.length === 0) {
        //     return res.status(404).json({
        //         message: "No projects found for the specified university"
        //     });
        // }

        // // Get project IDs as strings
        // const projectIds = studentSelections.map(selection => selection._id.toString());


        // First find all projects supervised by this teacher
        const supervisions = await TeacherSupervision.find({
            "supervisedBy.email": teacherEmail,
            "supervisedBy.university": university
        }).lean();

        const projectIds = supervisions.map(s => s._id.toString());

        // Then find projects and student selections (student selections optional)
        const [projects, studentSelections] = await Promise.all([
            Project.find({ _id: { $in: projectIds } }).lean(),
            StudentSelection.find({ _id: { $in: projectIds } }).lean()
        ]);

        // // Find all projects and their supervision status in parallel
        // const [projects, supervisions] = await Promise.all([
        //     Project.find({ _id: { $in: projectIds } }).lean(),
        //     TeacherSupervision.find({
        //         _id: { $in: projectIds },
        //         "supervisedBy.email": teacherEmail,
        //         "supervisedBy.university": university
        //     }).lean()
        // ]);

        // if (!projects || projects.length === 0) {
        //     return res.status(404).json({ message: "No projects found" });
        // }

        // Create maps for faster lookup
        const selectionMap = new Map();
        studentSelections.forEach(selection => {
            selectionMap.set(selection._id.toString(), selection);
        });

        const supervisionMap = new Map();
        supervisions.forEach(supervision => {
            supervisionMap.set(supervision._id.toString(), supervision);
        });

        // Process all data in one go
        const projectsWithStudentDetails = await Promise.all(
            projects.map(async (project) => {
                const projectIdStr = project._id.toString();
                const selection = selectionMap.get(projectIdStr);
                const supervision = supervisionMap.get(projectIdStr);

                // Determine supervision status
                let supervisionStatus = "not_supervised";
                if (supervision) {
                    // Find the teacher's supervision record
                    const teacherSupervision = supervision.supervisedBy.find(
                        teacher => teacher.email === teacherEmail &&
                            teacher.university === university
                    );

                    if (teacherSupervision) {
                        supervisionStatus = teacherSupervision.responseFromInd.status === "approved"
                            ? "supervised_by_you"
                            : teacherSupervision.responseFromInd.status === "pending"
                                ? "pending"
                                : "rejected";
                    }
                }

                if (!selection || !selection.studentSelection) {
                    return {
                        ...project,
                        selectionsWithStudents: [],
                        supervisionStatus
                    };
                }

                // Filter selections by university
                const universitySelections = selection.studentSelection.filter(
                    sel => sel.university === university
                );

                if (universitySelections.length === 0) {
                    return {
                        ...project,
                        selectionsWithStudents: [],
                        supervisionStatus
                    };
                }

                // Process all matching selections for this project
                const selectionsWithStudents = await Promise.all(
                    universitySelections.map(async (sel) => {
                        // Combine leader and members (remove duplicates)
                        const allMemberEmails = [
                            sel.groupLeader,
                            ...sel.groupMembers
                        ];
                        const uniqueEmails = [...new Set(allMemberEmails)];

                        // Fetch all student details at once
                        const studentDetails = await Promise.all(
                            uniqueEmails.map(email => fetchStudentDetails(email))
                        );

                        // Create a map for quick lookup
                        const studentMap = new Map();
                        studentDetails.forEach(student => {
                            if (student) studentMap.set(student.email, student);
                        });

                        return {
                            selectionId: sel.selectionId,
                            university: sel.university,
                            groupLeader: studentMap.get(sel.groupLeader),
                            groupMembers: sel.groupMembers
                                .map(email => studentMap.get(email))
                                .filter(Boolean),
                            mentor: sel.mentor,
                            joinedAt: sel.joinedAt,
                            isCompleted: sel.isCompleted ?? false,
                            completedAt: sel.completedAt ?? null
                        };
                    })
                );

                return {
                    ...project,
                    selectionsWithStudents,
                    supervisionStatus
                };
            })
        );

        res.status(200).json({ projects: projectsWithStudentDetails });
    } catch (error) {
        console.error("Error fetching projects with student details by university:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});





const fetchStudentDetails = async (email) => {
    try {
        const user = await User.findOne({ _id: email });
        if (!user) {
            return null;
        }

        const userProfile = {
            _id: user._id,
            username: user.username,
            email: user.email,
            profilePic: user.profilePic ? `${process.env.VITE_REACT_APP_BACKEND_BASEURL}${user.profilePic}` : null,
            role: user.role,
            status: user.status,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };

        if (user.role === "student") {
            const studentProfile = await Student.findOne({ _id: user._id });
            if (studentProfile) {
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
            }
        }

        return userProfile;
    } catch (error) {
        console.error("Error fetching student details:", error);
        return null;
    }
};


router.put("/MarkAsCompleted/:Id/:selectionId/:role/:value", async (req, res) => {
    const { Id, selectionId, role, value } = req.params;
    const isCompleted = value === 'true';

    try {
        const studentDoc = await StudentSelection.findById(Id);

        if (!studentDoc) {
            return res.status(404).json({ message: "Student selection document not found" });
        }

        // Use the instance method to update status
        await studentDoc.updateRoleStatus(selectionId, role, isCompleted);
        
        const updatedSelection = studentDoc.studentSelection.find(
            (s) => s.selectionId === selectionId
        );

        // Send notification whenever any role marks as completed
        if (isCompleted) {
            await sendRoleCompletionNotification(Id, selectionId, role);
        }

        res.status(200).json({ 
            message: "Role status updated successfully",
            data: {
                IndustryCompleted: updatedSelection.status.IndustryCompleted,
                TeacherCompleted: updatedSelection.status.TeacherCompleted,
                isCompleted: updatedSelection.status.isCompleted,
                completedAt: updatedSelection.completedAt
            }
        });
    } catch (error) {
        console.error("Error updating role completion status:", error);
        res.status(500).json({ 
            message: error.message || "Server error" 
        });
    }
});

// Get completion status including role-specific statuses
router.get("/getCompletionStatus/:projectId/:selectionId", async (req, res) => {
    const { projectId, selectionId } = req.params;

    try {
        const studentDoc = await StudentSelection.findById(projectId);

        if (!studentDoc) {
            return res.status(404).json({ message: "Student selection document not found" });
        }

        const selection = studentDoc.studentSelection.find(
            (s) => s.selectionId === selectionId
        );

        if (!selection) {
            return res.status(404).json({ message: "Selection not found" });
        }

        res.status(200).json({
            status: {
                IndustryCompleted: selection.status.IndustryCompleted,
                TeacherCompleted: selection.status.TeacherCompleted,
                isCompleted: selection.status.isCompleted
            },
            completedAt: selection.completedAt
        });
    } catch (error) {
        console.error("Error getting completion status:", error);
        res.status(500).json({ message: "Server error" });
    }
});



export default router;