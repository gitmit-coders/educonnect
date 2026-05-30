// models/ChatHistory.ts

import mongoose, { Schema, Document, models, Model } from "mongoose";

export interface IMessage {
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

export interface IChatHistory extends Document {
  userId: mongoose.Types.ObjectId;
  schoolId: mongoose.Types.ObjectId;
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: [5000, "Message too long"],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const ChatHistorySchema = new Schema<IChatHistory>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
    },
    messages: {
      type: [MessageSchema],
      default: [],
    },
  },
  { timestamps: true }
);

ChatHistorySchema.index({ userId: 1 });
ChatHistorySchema.index({ schoolId: 1 });

const ChatHistory: Model<IChatHistory> =
  models.ChatHistory ||
  mongoose.model<IChatHistory>("ChatHistory", ChatHistorySchema);

export default ChatHistory;