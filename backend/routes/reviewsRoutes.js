import { Router } from "express";
import cookieParser from "cookie-parser";
import Review from "../models/Reviews.js";
import Project from "../models/Projects.js"
import Selection from "../models/StudentSelection.js"
import Student from "../models/Students.js";
import mongoose from "mongoose";
import dotenv from 'dotenv';
import {  sendReviewNotification  } from "../routes/notificationRoutes.js"
import { protect } from "../middleware/authMiddleware.js";
dotenv.config();

const router = Router();
router.use(cookieParser());
router.use(protect);


router.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});



// router.post("/insertReview", async (req, res) => {
//     const session = await mongoose.startSession();

//     try {
//         await session.startTransaction();

//         const { projectId, selectionId, review } = req.body;

//         // 1. Find or create the review document
//         let reviewDoc = await Review.findOne({ projectId, selectionId }).session(session);

//         if (!reviewDoc) {
//             reviewDoc = new Review({
//                 _id: `rev_${Date.now()}`,
//                 projectId,
//                 selectionId,
//                 reviews: [review],
//             });
//         } else {
//             const existingReviewIndex = reviewDoc.reviews.findIndex(
//                 (r) => r.reviewerId === review.reviewerId
//             );

//             if (existingReviewIndex >= 0) {
//                 reviewDoc.reviews[existingReviewIndex] = review;
//             } else {
//                 reviewDoc.reviews.push(review);
//             }
//         }

//         await reviewDoc.save({ session });

//         // 2. Find the selection document
//         const selection = await Selection.findOne(
//             { "studentSelection.selectionId": selectionId },
//             { "studentSelection.$": 1 }
//         ).session(session);

//         if (!selection || !selection.studentSelection || selection.studentSelection.length === 0) {
//             await session.abortTransaction();
//             return res.status(404).json({ error: "Selection not found" });
//         }

//         const groupMembers = selection.studentSelection[0].groupMembers;

//         // 3. Update each student in the group
//         for (const studentEmail of groupMembers) {
//             // Get all reviews for this student across all projects/selections
//             const studentReviews = await Review.find({
//                 selectionId: {
//                     $in: await getStudentSelections(studentEmail)
//                 }
//             }).session(session);

//             // Calculate new average rating
//             const allRatings = studentReviews.flatMap(review =>
//                 review.reviews.map(r => r.rating)
//             );

//             const newAverage = allRatings.length > 0
//                 ? allRatings.reduce((a, b) => a + b, 0) / allRatings.length
//                 : 0;


//             // Recalculate

//             // await Student.findOneAndUpdate(
//             //     { _id: studentEmail },
//             //     {
//             //         $set: {
//             //             averageRating: newAverage,
//             //             totalReviews: allRatings.length
//             //         },
//             //         $addToSet: {
//             //             reviewedProjects: {
//             //                 projectId,
//             //                 selectionId,
//             //                 rating: review.rating,
//             //                 reviewedAt: new Date()
//             //             }
//             //         }
//             //     },
//             //     { session }
//             // );

//             //incremental
//             await Student.findOneAndUpdate(
//                 { _id: studentEmail },
//                 [
//                     {
//                         $set: {
//                             averageRating: {
//                                 $divide: [
//                                     { $add: [{ $multiply: ["$averageRating", "$totalReviews"] }, review.rating] },
//                                     { $add: ["$totalReviews", 1] }
//                                 ]
//                             },
//                             totalReviews: { $add: ["$totalReviews", 1] }
//                         }
//                     }
//                 ],
//                 { session }
//             );
//         }

//         await session.commitTransaction();
//         res.status(201).json(reviewDoc);
//     } catch (err) {
//         await session.abortTransaction();
//         res.status(500).json({ error: err.message });
//     } finally {
//         session.endSession();
//     }
// });


router.post("/insertReview", async (req, res) => {
    const session = await mongoose.startSession();

    try {
        await session.startTransaction();

        const { projectId, selectionId, review } = req.body;

        // 1. Find or create the review document
        let reviewDoc = await Review.findOne({ projectId, selectionId }).session(session);

        if (!reviewDoc) {
            reviewDoc = new Review({
                _id: `rev_${Date.now()}`,
                projectId,
                selectionId,
                reviews: [review],
            });
        } else {
            const existingReviewIndex = reviewDoc.reviews.findIndex(
                (r) => r.reviewerId === review.reviewerId
            );

            if (existingReviewIndex >= 0) {
                reviewDoc.reviews[existingReviewIndex] = review;
            } else {
                reviewDoc.reviews.push(review);
            }
        }

        await reviewDoc.save({ session });

        // 2. Find the selection document
        const selection = await Selection.findOne(
            { "studentSelection.selectionId": selectionId },
            { "studentSelection.$": 1 }
        ).session(session);

        if (!selection || !selection.studentSelection || selection.studentSelection.length === 0) {
            await session.abortTransaction();
            return res.status(404).json({ error: "Selection not found" });
        }

        const groupMembers = selection.studentSelection[0].groupMembers;

        // 3. Update each student in the group
        for (const studentEmail of groupMembers) {
            // Get all reviews for this student across all projects/selections
            const studentReviews = await Review.find({
                selectionId: {
                    $in: await getStudentSelections(studentEmail)
                }
            }).session(session);

            // Calculate new average rating
            const allRatings = studentReviews.flatMap(review =>
                review.reviews.map(r => r.rating)
            );

            const newAverage = allRatings.length > 0
                ? allRatings.reduce((a, b) => a + b, 0) / allRatings.length
                : 0;

            await Student.findOneAndUpdate(
                { _id: studentEmail },
                [
                    {
                        $set: {
                            averageRating: {
                                $divide: [
                                    { $add: [{ $multiply: ["$averageRating", "$totalReviews"] }, review.rating] },
                                    { $add: ["$totalReviews", 1] }
                                ]
                            },
                            totalReviews: { $add: ["$totalReviews", 1] }
                        }
                    }
                ],
                { session }
            );
        }

        // Send notification to all group members about the new review
        await sendReviewNotification(projectId, selectionId, review);

        await session.commitTransaction();
        res.status(201).json(reviewDoc);
    } catch (err) {
        await session.abortTransaction();
        res.status(500).json({ error: err.message });
    } finally {
        session.endSession();
    }
});




// Helper function to get all selection IDs a student is part of
async function getStudentSelections(studentEmail) {
    const selections = await Selection.find({
        "studentSelection.groupMembers": studentEmail
    });

    return selections.flatMap(selection =>
        selection.studentSelection
            .filter(sel => sel.groupMembers.includes(studentEmail))
            .map(sel => sel.selectionId)
    );
}


router.get("/getReviewForSelection/:projectId/:selectionId", async (req, res) => {
    try {
        const { projectId, selectionId } = req.params;
        const reviewDoc = await Review.findOne({ projectId, selectionId });

        if (!reviewDoc) {
            return res.status(404).json({ message: "No reviews found." });
        }


        res.status(200).json(reviewDoc);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


router.get("getAllReviewForProject/:projectId", async (req, res) => {
    try {
        const { projectId } = req.params;
        const reviews = await Review.find({ projectId });

        if (!reviews.length) {
            return res.status(404).json({ message: "No reviews found." });
        }

        res.status(200).json(reviews);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;