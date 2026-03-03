import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: [true, "Conversation ID is required"],
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Sender ID is required"],
      index: true,
    },
    text: {
      type: String,
      required: [true, "Message text is required"],
      minlength: [1, "Message cannot be empty"],
      maxlength: [5000, "Message exceeds maximum length"],
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
      default: null,
    },
    conversationType: {
      type: String,
      enum: ["direct", "broadcast"],
      default: "direct",
    },
    edited: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ sender: 1, createdAt: -1 });
messageSchema.index({ conversationId: 1, isRead: 1 });

export const Message = mongoose.model("Message", messageSchema);