import { Schema, model } from "mongoose";

const StudentSelectionSchema = new Schema(
  {
    _id: { type: String, required: true },
    studentSelection: [
      {
        selectionId: { type: String, required: true },
        university: { type: String, default: null },
        groupLeader: { type: String, required: true },
        groupMembers: { type: [String], default: [] },
        joinedAt: { type: Date, default: null },
        status: {
          IndustryCompleted: { type: Boolean, default: false },
          TeacherCompleted: { type: Boolean, default: false },
          isCompleted: { type: Boolean, default: false } 
        },
        completedAt: { type: Date, default: null },
      },
    ],
  },
  { timestamps: true }
);

StudentSelectionSchema.pre("save", function (next) {
  this.studentSelection.forEach((selection) => {
    // Set joinedAt if not set
    if (!selection.joinedAt) {
      selection.joinedAt = new Date();
    }

    // Calculate overall completion status
    selection.status.isCompleted = 
      selection.status.IndustryCompleted && selection.status.TeacherCompleted;

    // Handle completedAt timestamp
    if (selection.status.isCompleted && !selection.completedAt) {
      selection.completedAt = new Date();
    } else if (!selection.status.isCompleted && selection.completedAt) {
      selection.completedAt = null;
    }
  });
  next();
});

// Add instance method to update role status
StudentSelectionSchema.methods.updateRoleStatus = async function(
  selectionId, 
  role, 
  isCompleted
) {
  const selection = this.studentSelection.find(s => s.selectionId === selectionId);
  
  if (!selection) {
    throw new Error('Selection not found');
  }

  if (role === 'industry') {
    selection.status.IndustryCompleted = isCompleted;
  } else if (role === 'teacher') {
    selection.status.TeacherCompleted = isCompleted;
  } else {
    throw new Error('Invalid role specified');
  }

  // Recalculate overall status
  selection.status.isCompleted = 
    selection.status.IndustryCompleted && selection.status.TeacherCompleted;

  // Update completedAt if needed
  if (selection.status.isCompleted && !selection.completedAt) {
    selection.completedAt = new Date();
  } else if (!selection.status.isCompleted && selection.completedAt) {
    selection.completedAt = null;
  }

  return this.save();
};

// Speed up the common lookups by selection id, group leader and membership.
StudentSelectionSchema.index({ "studentSelection.selectionId": 1 });
StudentSelectionSchema.index({ "studentSelection.groupLeader": 1 });
StudentSelectionSchema.index({ "studentSelection.groupMembers": 1 });

const StudentSelection = model("StudentSelection", StudentSelectionSchema);

export default StudentSelection;