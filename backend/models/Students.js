import { Schema, model } from "mongoose";

const StudentSchema = new Schema(
    {
        _id: { type: String, required: true },
        studentId: { type: String, required: true, unique: true },
        degreeOrProgram: { type: String, required: true },
        yearOfStudy: { type: String, required: true },
        university: { type: String, required: true },
        verified: { type: Boolean, default: false },
        verificationDocuments: [
            {
                fileName: { type: String, required: true },
                fileUrl: { type: String, required: true },
                uploadedAt: { type: Date, default: Date.now },
            },
        ],
        verifiedAt: { type: Date, default: null },
        verifiedBy: { type: String, default: null },
        // Add these new fields
        averageRating: { type: Number, default: 0 },
        totalReviews: { type: Number, default: 0 },
    },
    { timestamps: true }
);



StudentSchema.pre('save', function (next) {
    if (this.isModified('verified') && this.verified && !this.verifiedAt) {
        this.verifiedAt = new Date();
    }
    next();
});

StudentSchema.index({ university: 1 });
StudentSchema.index({ verified: 1 });

const Student = model("Student", StudentSchema);

export default Student;
