// Authentication / user business logic. Pure data operations — no req/res here,
// so it is unit-testable and reusable. HTTP concerns (cookies, status codes)
// live in the controller.
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Industry from "../models/Industry.js";
import Teacher from "../models/Teachers.js";
import Student from "../models/Students.js";
import ApiError from "../utils/ApiError.js";

const BACKEND_URL = process.env.VITE_REACT_APP_BACKEND_BASEURL || "";

export const createUser = async ({ _id, username, email, password, profilePic, role, status }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) throw new ApiError(409, "User with this email already exists.");

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await User.create({
    _id,
    username,
    email,
    password: hashedPassword,
    profilePic,
    role,
    status: status || "pending",
  });

  return { email, username, role, profilePic, status: newUser.status };
};

export const authenticate = async (email, password) => {
  // password is select:false on the schema, so opt in explicitly here.
  const user = await User.findOne({ email }).select("+password");
  if (!user) throw new ApiError(401, "Invalid email or password.");

  // Normal case: the stored value is a bcrypt hash, so only bcrypt.compare counts.
  // Older records may hold an un-hashed password. Those are still accepted by direct
  // match, then hashed straight away. A direct match against a bcrypt hash is never
  // accepted: otherwise anyone who saw the hash could log in by typing it.
  const stored = typeof user.password === "string" ? user.password : "";
  const isBcryptHash = /^\$2[aby]\$\d{2}\$/.test(stored);
  const isPasswordValid = isBcryptHash
    ? await bcrypt.compare(password, stored)
    : stored.length > 0 && password === stored;
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password.");
  }
  if (!isBcryptHash) {
    user.password = await bcrypt.hash(password, 10);
    await user.save();
  }

  if (user.status !== "verified") {
    throw new ApiError(403, "Account not verified. Please contact the administrator.");
  }
  return user;
};

export const issueToken = (user) =>
  jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

// Builds the rich profile object (base fields + role-specific details).
export const buildUserProfile = async (user) => {
  const profile = {
    _id: user._id,
    username: user.username,
    email: user.email,
    profilePic: user.profilePic ? `${BACKEND_URL}${user.profilePic}` : null,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  if (user.role === "industry") {
    const industry = await Industry.findOne({ _id: user._id });
    if (industry) {
      profile.industryDetails = {
        representingIndustries: industry.representingIndustries,
        verifiedAt: industry.verifiedAt,
        verifiedBy: industry.verifiedBy,
      };
    }
  } else if (user.role === "teacher") {
    const teacher = await Teacher.findOne({ _id: user._id });
    if (teacher) {
      profile.teacherDetails = {
        employeeId: teacher.employeeId,
        designation: teacher.designation,
        department: teacher.department,
        university: teacher.university,
        verified: teacher.verified,
        verificationDocuments: teacher.verificationDocuments,
        verifiedAt: teacher.verifiedAt,
        verifiedBy: teacher.verifiedBy,
      };
    }
  } else if (user.role === "student") {
    const student = await Student.findOne({ _id: user._id });
    if (student) {
      profile.studentDetails = {
        studentId: student.studentId,
        degreeOrProgram: student.degreeOrProgram,
        yearOfStudy: student.yearOfStudy,
        university: student.university,
        verified: student.verified,
        verificationDocuments: student.verificationDocuments,
        verifiedAt: student.verifiedAt,
        verifiedBy: student.verifiedBy,
      };
    }
  }

  return profile;
};

export const getUserById = async (id) => {
  const user = await User.findById(id);
  if (!user) throw new ApiError(404, "User not found.");
  return user;
};

export const getUserByEmail = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, "User not found.");
  return user;
};

export const updateUserProfile = async (userId, { username, password, profilePic }) => {
  const user = await getUserById(userId);
  if (username) user.username = username;
  if (password) user.password = await bcrypt.hash(password, 10);
  if (profilePic) user.profilePic = profilePic;
  await user.save();
  return user;
};

export const listAllUsers = () => User.find({}).select("-password");
