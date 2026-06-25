import { Schema, model } from "mongoose";

const projectSchema = new Schema(
  {
    _id: { type: String, required: true },
    title: { type: String, required: true, unique: true },
    projectType: { type: String, required: true },
    difficultyLevel: { type: String, required: true },
    industryName: { type: String, required: true },
    type: { type: String, enum: ["Individual", "Group"], required: true },
    maxStudentsPerGroup: { type: Number },
    maxGroups: { type: Number },
    duration: {
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
    },
    description: { type: String, required: true },
    attachments: [
      {
        fileName: { type: String, required: true },
        fileUrl: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    editStatus: { type: String, enum: ["locked", "unlocked"], required: true },
    unlockedUntil: { type: Date, default: null },
    lastEditRequestId: { type: String, default: "" },
    requiredSkills: [{ type: String, required: true }],
    additionalInfo: { type: String, default: "" },
    representativeId: { type: String, required: true },
  },
  { timestamps: true }
);


projectSchema.methods.checkAndLockIfExpired = async function () {
  if (this.editStatus === 'unlocked' && this.unlockedUntil && new Date() > this.unlockedUntil) {
    this.editStatus = 'locked';
    this.unlockedUntil = null;
    await this.save();
  }
};

// Indexes for the hottest query paths (owner lookups, type/status filtering).
projectSchema.index({ representativeId: 1 });
projectSchema.index({ projectType: 1 });
projectSchema.index({ "duration.endDate": 1 });

const Project = model("Project", projectSchema);

export default Project;
