import mongoose from 'mongoose'; 
import { Schema } from "mongoose";


const userSchema = new Schema(
  {
    _id: { type: String, required: true }, // unique index is implicit on _id
    username: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    // Excluded from query results by default — opt in with .select("+password").
    password: { type: String, required: true, select: false },
    profilePic: { type: String, default: "" },
    role: { type: String, enum: ["student", "teacher", "industry", "admin"], default: "student", index: true },
    status: { type: String, enum: ["verified", "pending", "banned"], default: "pending", index: true },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

export default User;