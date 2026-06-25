import { Schema, model } from "mongoose";

const TeacherSchema = new Schema(
    {
        _id: { type: String, required: true },
        employeeId: { type: String, required: true, unique: true },
        designation: { type: String, required: true },
        department: { type: String, required: true },
        university: { type: String, default: "" },
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
    },
    { timestamps: true }
);


TeacherSchema.pre('save', function (next) {
    if (this.isModified('verified') && this.verified && !this.verifiedAt) {
        this.verifiedAt = new Date();
    }
    next();
});

TeacherSchema.index({ university: 1 });
TeacherSchema.index({ verified: 1 });

const Teacher = model("Teacher", TeacherSchema);

export default Teacher;
