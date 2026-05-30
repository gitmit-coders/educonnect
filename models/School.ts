// models/School.ts

import mongoose, { Schema, Document, models, Model } from "mongoose";

export interface ISchool extends Document {
  schoolName: string;
  schoolCode: string;
  email: string;
  phone: string;
  address: string;
  isApproved: boolean;
  approvedBy: mongoose.Types.ObjectId | null; // master admin ref
  createdAt: Date;
  updatedAt: Date;
}

const SchoolSchema = new Schema<ISchool>(
  {
    schoolName: {
      type: String,
      required: [true, "School name is required"],
      trim: true,
      minlength: [3, "School name must be at least 3 characters"],
      maxlength: [100, "School name cannot exceed 100 characters"],
    },
    schoolCode: {
      type: String,
      required: [true, "School code is required"],
      unique: true,
      trim: true,
      uppercase: true, // always stored as uppercase e.g. "DPS001"
      match: [/^[A-Z0-9]{3,10}$/, "School code must be 3-10 alphanumeric characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      match: [/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian phone number"],
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
      minlength: [10, "Address must be at least 10 characters"],
      maxlength: [200, "Address cannot exceed 200 characters"],
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// indexes for faster queries
SchoolSchema.index({ schoolCode: 1 });
SchoolSchema.index({ email: 1 });
SchoolSchema.index({ isApproved: 1 }); // master admin pending approvals fetch fast

const School: Model<ISchool> =
  models.School || mongoose.model<ISchool>("School", SchoolSchema);

export default School;