import { Router } from "express";
import PrivacyPolicy from "../models/PrivacyPolicy.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/get-privacy-policy", async (req, res) => {
    try {
        const { role } = req.query; 
        const policy = await PrivacyPolicy.findOne({ role }).sort({ createdAt: -1 }); 
        if (!policy) return res.status(404).json({ message: "Privacy policy not found for the specified role." });

        res.json(policy);
    } catch (error) {
        console.error("Error fetching privacy policy:", error);
        res.status(500).json({ message: "Server error" });
    }
});

router.post("/post-privacy-policy", protect, authorize("admin"), async (req, res) => {
    try {
        const { lastUpdated, sections, role } = req.body;

        
        await PrivacyPolicy.deleteMany({ role });

        const newPolicy = new PrivacyPolicy({ lastUpdated, sections, role });
        await newPolicy.save();

        res.status(201).json({ message: "Privacy policy saved successfully", policy: newPolicy });
    } catch (error) {
        console.error("Error saving privacy policy:", error);
        res.status(500).json({ message: "Server error" });
    }
});

router.put("/update-privacy-policy", protect, authorize("admin"), async (req, res) => {
    try {
        const { role, sections } = req.body;
        const updatedPolicy = await PrivacyPolicy.findOneAndUpdate(
            { role },
            { sections, lastUpdated: new Date() },
            { new: true }
        );

        if (!updatedPolicy) return res.status(404).json({ message: "Privacy policy not found." });

        res.json({ message: "Privacy policy updated successfully", policy: updatedPolicy });
    } catch (error) {
        console.error("Error updating privacy policy:", error);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;
