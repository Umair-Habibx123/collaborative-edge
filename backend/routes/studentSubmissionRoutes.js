import { Router } from "express";
import cookieParser from "cookie-parser";
import StudentSubmission from "../models/StudentSubmission.js";
import {  sendSubmissionNotification  } from "../routes/notificationRoutes.js"
import dotenv from 'dotenv';
import { protect } from "../middleware/authMiddleware.js";
dotenv.config();

const router = Router();
router.use(cookieParser());
router.use(protect);


router.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

router.post("/addSubmission", async (req, res) => {
    try {
        const { projectId, selectionId, submittedById, submittedByName, comments, files } = req.body;

        if (!projectId || !selectionId || !submittedById || !submittedByName || !comments) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const _id = `${projectId}-${selectionId}`;
        const submissionId = `sub_${Date.now()}`;

        const newSubmission = {
            submissionId,
            submittedById,
            submittedByName,
            comments,
            files,
            submittedAt: new Date(),
        };

        let submissionDoc = await StudentSubmission.findOne({ _id });

        if (!submissionDoc) {
            submissionDoc = new StudentSubmission({
                _id,
                projectId,
                selectionId,
                submissions: [newSubmission],
                totalSubmissions: 1,
                lastSubmittedAt: new Date(),
            });
        } else {
            submissionDoc.submissions.push(newSubmission);
            submissionDoc.totalSubmissions += 1;
            submissionDoc.lastSubmittedAt = new Date();
        }

        await submissionDoc.save();

        // Send notification to:
        // - Project representative
        // - Approved supervisors
        // - Group leader (if different from submitter)
        await sendSubmissionNotification(
            projectId,
            selectionId,
            submittedByName,
            submissionId
        );

        res.status(201).json({ 
            message: "Submission added successfully", 
            submission: newSubmission 
        });
    } catch (error) {
        console.error("Error adding submission:", error);
        res.status(500).json({ error: "Failed to add submission" });
    }
});

router.get('/fetchSubmissionsBySelectionId/:selectionId', async (req, res) => {
    try {
        const { selectionId } = req.params;


        const submissionDoc = await StudentSubmission.findOne({ selectionId });

        if (!submissionDoc) {
            return res.status(404).json({ message: "No submissions found for this selection" });
        }

        res.json(submissionDoc);
    } catch (error) {
        console.error("Error fetching submissions:", error);
        res.status(500).json({ message: "Error fetching submissions", error: error.message });
    }
});



router.delete('/deleteSubmission', async (req, res) => {
    try {
        const { submissionId, selectionId, files } = req.body;

        if (!submissionId || !selectionId) {
            return res.status(400).json({ message: "Submission ID and Selection ID are required" });
        }


        if (files && files.length > 0) {
            try {
                await Promise.all(files.map(async (file) => {
                    const response = await fetch(`${process.env.VITE_REACT_APP_BACKEND_BASEURL}/deletefile`, {
                        method: "DELETE",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ fileUrl: file.fileUrl }),
                    });

                    if (!response.ok) {
                        console.error(`Failed to delete file ${file.fileName}`);
                    }
                }));
            } catch (fileError) {
                console.error("Error deleting files:", fileError);

            }
        }


        const result = await StudentSubmission.findOneAndUpdate(
            { selectionId },
            {
                $pull: { submissions: { submissionId } },
                $inc: { totalSubmissions: -1 },
                $set: {
                    lastSubmittedAt: await getLatestSubmissionDate(selectionId)
                }
            },
            { new: true }
        );

        if (!result) {
            return res.status(404).json({ message: "Submission not found" });
        }

        res.json({ message: "Submission deleted successfully" });
    } catch (error) {
        console.error("Error deleting submission:", error);
        res.status(500).json({ message: "Error deleting submission", error: error.message });
    }
});


router.get("/getSubmissions", async (req, res) => {
    try {
        const { projectId, selectionId } = req.query;

        if (!projectId || !selectionId) {
            return res.status(400).json({ message: "Project ID and Selection ID are required" });
        }

        const submissions = await StudentSubmission.findOne({
            projectId: projectId,
            selectionId: selectionId
        });

        if (!submissions) {
            return res.status(404).json({ message: "No submissions found" });
        }

        res.status(200).json(submissions);
    } catch (error) {
        console.error("Error fetching submissions:", error);
        res.status(500).json({ message: "Server error" });
    }
});

router.get("/getAllSubmissionsOnProjectId/:projectId", async (req, res) => {
    try {
        const submissions = await StudentSubmission.find({
            projectId: req.params.projectId
        });
        res.send(submissions);
    } catch (error) {
        res.status(500).send(error);
    }
});


async function getLatestSubmissionDate(selectionId) {
    const doc = await StudentSubmission.findOne({ selectionId });
    if (!doc || doc.submissions.length === 0) return null;

    const dates = doc.submissions.map(s => new Date(s.submittedAt));
    return new Date(Math.max(...dates));
}



export default router;