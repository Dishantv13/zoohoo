import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participant: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    conversationType: {
      type: String,
      enum: ["direct", "group", "broadcast"],
      default: "direct",
    },
    unreadCount: {
      admin: {
        type: Number,
        default: 0,
        min: 0,
      },
      user: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
    isPinned: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

conversationSchema.index({ participant: 1, updatedAt: -1 });
conversationSchema.index({ participant: 1, isArchived: 1 });

export const Conversation = mongoose.model("Conversation", conversationSchema);

