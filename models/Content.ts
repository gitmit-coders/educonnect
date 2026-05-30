// models/Content.ts

import mongoose, { Schema, Document, models, Model } from "mongoose";

export type ContentType = "note" | "assignment" | "announcement" | "pyq";

export interface IContent extends Document {
  title: string;
  description: string;
  fileUrl: string | null;   // null when contentType is "announcement" (no file needed)
  schoolId: mongoose.Types.ObjectId;
  uploadedBy: mongoose.Types.ObjectId;
  contentType: ContentType;
  subject: string | null;   // relevant for notes, assignments, pyq
  classGrade: string | null; // e.g. "10", "11", "12" — which class it belongs to
  isVisible: boolean;        // teacher can draft before publishing
  createdAt: Date;
  updatedAt: Date;
}

const ContentSchema = new Schema<IContent>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [150, "Title cannot exceed 150 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    fileUrl: {
      type: String,
      default: null,
      // announcements don't need a file; notes/assignments/pyq should have one
    },
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: [true, "School reference is required"],
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Uploader reference is required"],
    },
    contentType: {
      type: String,
      enum: {
        values: ["note", "assignment", "announcement", "pyq"],
        message: "{VALUE} is not a valid content type",
      },
      required: [true, "Content type is required"],
    },
    subject: {
      type: String,
      trim: true,
      maxlength: [50, "Subject cannot exceed 50 characters"],
      default: null,
    },
    classGrade: {
      type: String,
      trim: true,
      default: null,
      // e.g. "10A", "11-Science", "12B" — flexible string, school decides format
    },
    isVisible: {
      type: Boolean,
      default: true,
      // set false to save as draft; students won't see it until true
    },
  },
  {
    timestamps: true,
  }
);

// indexes for common fetch patterns
ContentSchema.index({ schoolId: 1, contentType: 1 });       // school ke saare notes/assignments
ContentSchema.index({ schoolId: 1, classGrade: 1 });         // ek class ke saare content
ContentSchema.index({ uploadedBy: 1 });                      // teacher ka uploaded content
ContentSchema.index({ schoolId: 1, isVisible: 1 });          // students ke liye visible content only

const Content: Model<IContent> =
  models.Content || mongoose.model<IContent>("Content", ContentSchema);

export default Content;