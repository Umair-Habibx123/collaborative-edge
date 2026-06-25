import { Router } from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import TeacherSupervision from "../models/TeacherSupervision.js";
import Project from "../models/Projects.js";
import User from "../models/User.js";
import Teacher from "../models/Teachers.js";
import { sendSupervisionRequestNotification, sendSupervisionResponseNotification } from "../routes/notificationRoutes.js";

import { protect } from "../middleware/authMiddleware.js";
dotenv.config();

const router = Router();
router.use(cookieParser());
router.use(protect);

router.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});



router.post("/insertTeacherSupervisionRequest", async (req, res) => {
    try {
        console.log("Incoming request body:", req.body);

        const { _id, teacherId, fullName, university, email } = req.body;

        if (!_id || !teacherId || !fullName || !university) {
            return res.status(400).json({ error: "Invalid or missing required fields." });
        }

        let existingSupervision = await TeacherSupervision.findOne({ _id });

        if (existingSupervision) {
            const existingTeacher = existingSupervision.supervisedBy.find(
                (teacher) => teacher.teacherId === teacherId
            );

            if (existingTeacher) {
                return res.status(400).json({ error: "Teacher has already submitted a response for this project." });
            }

            existingSupervision.supervisedBy.push({
                teacherId,
                fullName,
                university,
                email,
                responseFromInd: {
                    status: "pending",
                    comments: null,
                    actionBy: null,
                    actionedAt: null,
                },
            });

            await existingSupervision.save();
            
            // Send notification to project representative
            await sendSupervisionRequestNotification(_id, {
                teacherId,
                fullName,
                university,
                email
            });

            return res.status(200).json({
                message: "Teacher supervision added successfully.",
                supervision: { teacherId, fullName, university, email }
            });
        } else {
            const newSupervision = new TeacherSupervision({
                _id,
                supervisedBy: [
                    {
                        teacherId,
                        fullName,
                        university,
                        email,
                        responseFromInd: {
                            status: "pending",
                            comments: null,
                            actionBy: null,
                            actionedAt: null,
                        },
                    }
                ],
            });

            await newSupervision.save();
            
            // Send notification to project representative
            await sendSupervisionRequestNotification(_id, {
                teacherId,
                fullName,
                university,
                email
            });

            return res.status(201).json({
                message: "Teacher supervision request submitted successfully.",
                supervision: { _id, teacherId, fullName, university, email }
            });
        }
    } catch (error) {
        console.error("Error inserting teacher supervision request:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


router.get('/getSupervisions', async (req, res) => {
    try {
        const { projectId } = req.query;
        const supervision = await TeacherSupervision.findOne({ _id: projectId });
        if (!supervision) {
            return res.status(404).json({ message: 'Supervision not found' });
        }
        res.json(supervision);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching supervisions', error });
    }
});


router.post('/updateSupervisionStatus', async (req, res) => {
    try {
        const { projectId, teacherId, status, actionBy, comments } = req.body;
        
        // Validate input
        if (!projectId || !teacherId || !status || !actionBy) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const supervision = await TeacherSupervision.findOne({ _id: projectId });
        if (!supervision) {
            return res.status(404).json({ message: 'Supervision not found' });
        }

        const teacherSupervision = supervision.supervisedBy.find(s => s.teacherId === teacherId);
        if (!teacherSupervision) {
            return res.status(404).json({ message: 'Teacher supervision not found' });
        }

        // Update supervision status
        teacherSupervision.responseFromInd.status = status;
        teacherSupervision.responseFromInd.comments = comments;
        teacherSupervision.responseFromInd.actionBy = actionBy;
        teacherSupervision.responseFromInd.actionedAt = new Date();

        await supervision.save();

        // Send notification to the teacher about the response
        if (status === 'approved' || status === 'rejected') {
            await sendSupervisionResponseNotification(
                projectId,
                teacherId,
                status,
                actionBy,
                comments
            );
        }

        res.json({ 
            message: 'Supervision status updated successfully',
            status: status
        });
    } catch (error) {
        console.error('Error updating supervision status:', error);
        res.status(500).json({ message: 'Error updating supervision status', error });
    }
});


router.delete('/deleteSupervision', async (req, res) => {
    try {
        const { projectId, teacherId } = req.body;
        const supervision = await TeacherSupervision.findOne({ _id: projectId });
        if (!supervision) {
            return res.status(404).json({ message: 'Supervision not found' });
        }

        supervision.supervisedBy = supervision.supervisedBy.filter(s => s.teacherId !== teacherId);
        await supervision.save();
        res.json({ message: 'Supervision deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting supervision', error });
    }
});


router.post("/checkOtherTeacherApproval", async (req, res) => {
    try {
        const { projectId, email, university } = req.body;


        if (!projectId || !email || !university) {
            return res.status(400).json({ message: "Project ID, Email, and University are required" });
        }

        console.log("Checking for other teacher approvals for project:", projectId);


        const supervision = await TeacherSupervision.findOne({ _id: projectId.toString() });


        if (!supervision) {
            return res.status(404).json({ message: "Project not found", exists: false });
        }


        const approvedSupervision = supervision.supervisedBy.find(
            (teacher) => teacher.email !== email && teacher.university === university && teacher.responseFromInd.status === "approved"
        );


        if (approvedSupervision) {
            return res.status(200).json({
                message: "Another teacher has already been approved for supervision",
                exists: true,
                status: "approved",
                approvedTeacher: {
                    email: approvedSupervision.email,
                    university: approvedSupervision.university
                }
            });
        }


        return res.status(200).json({
            message: "No other teacher has been approved for supervision",
            exists: false,
            status: "not_approved"
        });

    } catch (error) {
        console.error("Error checking for other teacher approvals:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});



router.post("/currentTeacherSupervisionStatusForProject", async (req, res) => {
    try {
        const { projectId, email, university } = req.body;

        if (!projectId || !email || !university) {
            return res.status(400).json({ message: "Project ID, Email, and University are required" });
        }

        console.log("Fetching supervision for:", projectId, email, university);


        const supervision = await TeacherSupervision.findOne({ _id: projectId.toString() });


        if (!supervision) {
            return res.status(404).json({ message: "Project not found", exists: false });
        }


        const teacherSupervision = supervision.supervisedBy.find(
            (teacher) => teacher.email === email && teacher.university === university
        );


        if (!teacherSupervision) {
            return res.status(404).json({ message: "Current Teacher supervision not found", exists: false });
        }


        if (teacherSupervision.responseFromInd.status === "pending") {
            return res.status(200).json({
                message: "Current Teacher supervision pending",
                exists: true,
                status: "pending",
                responseFromInd: teacherSupervision.responseFromInd,
            });
        }


        if (teacherSupervision.responseFromInd.status === "approved") {
            return res.status(200).json({
                message: "Current Teacher supervision approved",
                exists: true,
                status: "approved",
                responseFromInd: teacherSupervision.responseFromInd,
            });
        }


        if (teacherSupervision.responseFromInd.status === "rejected") {
            return res.status(200).json({
                message: "Current Teacher supervision rejected",
                exists: true,
                status: "rejected",
                responseFromInd: teacherSupervision.responseFromInd,
            });
        }

    } catch (error) {
        console.error("Error fetching teacher supervision:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


router.post("/bulkProjectSupervisionStatus", async (req, res) => {
    try {
        const { projectIds, email, university } = req.body;


        if (!projectIds || !email || !university) {
            return res.status(400).json({ message: "Project IDs, Email, and University are required" });
        }

        const supervisions = await TeacherSupervision.find({ _id: { $in: projectIds } });

        const checkCurrentUserApproval = (supervision) => {
            const currentUserSupervision = supervision.supervisedBy.find(
                teacher => teacher.email === email && teacher.university === university
            );
            return currentUserSupervision && currentUserSupervision.responseFromInd.status === "approved";
        };

        const checkOtherUniversityApproval = (supervision) => {
            return supervision.supervisedBy.some(
                teacher => teacher.university === university && teacher.responseFromInd.status === "approved"
            );
        };

        const statusMap = projectIds.map(projectId => {
            const supervision = supervisions.find(s => s._id === projectId.toString());

            if (!supervision) {
                return { projectId, status: "pending" };
            }

            if (checkCurrentUserApproval(supervision)) {
                return { projectId, status: "supervised_by_you" };
            } else if (checkOtherUniversityApproval(supervision)) {
                return { projectId, status: "approved_by_other" };
            } else {
                return { projectId, status: "pending" };
            }
        });

        res.status(200).json({ statusMap });
    } catch (error) {
        console.error("Error fetching bulk project approval status:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


router.get("/getProjectsSupervisedByYouWithDetails/:email", async (req, res) => {
    try {
        const { email } = req.params;


        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        console.log("Fetching projects supervised by:", email);


        const projects = await TeacherSupervision.find({
            supervisedBy: {
                $elemMatch: {
                    email: email,
                    "responseFromInd.status": "approved"
                }
            }
        });

        if (!projects || projects.length === 0) {
            return res.status(404).json({ message: "No projects supervised by you found", projects: [] });
        }


        const projectIds = projects.map(project => project._id);


        const projectDetails = await Project.find({ _id: { $in: projectIds } });

        res.status(200).json({
            message: "Projects supervised by you fetched successfully",
            projects: projectDetails
        });
    } catch (error) {
        console.error("Error fetching projects supervised by you:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});



router.get("/fetchProjectIdsHavingSupervisiorByUniversity", async (req, res) => {
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
        });

        if (!approvedProjects || approvedProjects.length === 0) {
            return res.status(404).json({ message: "No approved projects found for the given university" });
        }


        const projectIds = approvedProjects.map(project => project._id);

        res.status(200).json({ projectIds });
    } catch (error) {
        console.error("Error fetching approved project IDs:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});



router.get('/fetchTeacherSupervision', async (req, res) => {
    try {
        const { projectId } = req.query;

        if (!projectId) {
            return res.status(400).json({ error: 'Project ID is required' });
        }


        const supervision = await TeacherSupervision.findOne({ _id: projectId }).populate('supervisedBy.teacherId');

        if (!supervision) {
            return res.status(404).json({ error: 'Supervision details not found' });
        }


        const filteredSupervision = {
            ...supervision.toObject(),
            supervisedBy: supervision.supervisedBy.filter(
                (supervisionItem) => supervisionItem.responseFromInd.status === 'approved'
            )
        };


        if (filteredSupervision.supervisedBy.length === 0) {
            return res.status(404).json({ error: 'No verified supervision details found' });
        }


        res.status(200).json(filteredSupervision);
    } catch (error) {
        console.error('Error fetching teacher supervision:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


router.get('/fetchSupervisorDetails/:id/:university', async (req, res) => {
    try {
        const { id, university } = req.params; // Both extracted from params

        const supervision = await TeacherSupervision.findOne(
            { _id: id },
            {
                supervisedBy: {
                    $elemMatch: { university }
                }
            }
        );

        if (!supervision || !supervision.supervisedBy?.length) {
            return res.status(404).json({
                success: false,
                message: "No supervision records found for the given criteria"
            });
        }

        res.status(200).json({
            success: true,
            data: supervision
        });

    } catch (error) {
        console.error("Error fetching supervision details:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});


export default router;