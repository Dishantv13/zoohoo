import { Conversation } from "../model/conversion.model.js";
import { Message } from "../model/message.model.js";
import { User } from "../model/user.model.js";
import mongoose from "mongoose";

const onlineUsers = new Map();

export const chatSocket = (io) => {
  io.on("connection", async (socket) => {
    try {
      const userId = socket.user._id.toString();
      if (!onlineUsers.has(userId)) {
        onlineUsers.set(userId, []);
      }
      onlineUsers.get(userId).push(socket.id);

      console.log(
        `✅ User connected: ${socket.user.name} (${socket.id}) | Total online: ${onlineUsers.size}`,
      );

      socket.join(`user_${userId}`);

      io.emit("userOnline", {
        userId,
        userName: socket.user.name,
        userRole: socket.user.role,
      });

      socket.on("joinConversation", async (data) => {
        try {
          const { conversationId } = data;

          if (
            !conversationId ||
            !mongoose.Types.ObjectId.isValid(conversationId)
          ) {
            return socket.emit("error", {
              message: "Invalid conversation ID",
              code: "INVALID_CONVERSATION_ID",
            });
          }

          const conversation = await Conversation.findById(conversationId);

          if (!conversation) {
            return socket.emit("error", {
              message: "Conversation not found",
              code: "CONVERSATION_NOT_FOUND",
            });
          }

          const isParticipant = conversation.participant.some(
            (p) => p.toString() === userId,
          );

          if (!isParticipant) {
            return socket.emit("error", {
              message: "Not authorized to access this conversation",
              code: "UNAUTHORIZED_CONVERSATION",
            });
          }

          socket.join(`conversation_${conversationId}`);
          socket.conversationId = conversationId;

          await Conversation.findByIdAndUpdate(
            conversationId,
            {
              $set: {
                [`unreadCount.${socket.user.role}`]: 0,
              },
            },
            { new: true },
          );

          socket.broadcast
            .to(`conversation_${conversationId}`)
            .emit("userJoinedConversation", {
              userId,
              userName: socket.user.name,
            });

          console.log(
            `✅ User ${socket.user.name} joined conversation ${conversationId}`,
          );
        } catch (error) {
          console.error("Error joining conversation:", error);
          socket.emit("error", {
            message: "Failed to join conversation",
            code: "JOIN_CONVERSATION_ERROR",
          });
        }
      });

      socket.on("sendMessage", async (data) => {
        try {
          const { conversationId, text, conversationType } = data;

          if (
            !conversationId ||
            !mongoose.Types.ObjectId.isValid(conversationId)
          ) {
            return socket.emit("error", {
              message: "Invalid conversation ID",
              code: "INVALID_CONVERSATION_ID",
            });
          }

          if (!text || text.trim().length === 0) {
            return socket.emit("error", {
              message: "Message cannot be empty",
              code: "EMPTY_MESSAGE",
            });
          }

          if (text.length > 5000) {
            return socket.emit("error", {
              message: "Message is too long (max 5000 characters)",
              code: "MESSAGE_TOO_LONG",
            });
          }

          const conversation = await Conversation.findById(conversationId);

          if (!conversation) {
            return socket.emit("error", {
              message: "Conversation not found",
              code: "CONVERSATION_NOT_FOUND",
            });
          }

          const isParticipant = conversation.participant.some(
            (p) => p.toString() === userId,
          );

          if (!isParticipant) {
            return socket.emit("error", {
              message: "Not authorized to send messages in this conversation",
              code: "UNAUTHORIZED_CONVERSATION",
            });
          }

          const message = await Message.create({
            conversationId,
            sender: userId,
            text: text.trim(),
            conversationType,
          });

          await message.populate("sender", "name email role");

          await Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: message._id,
            updatedAt: Date.now(),
          });

          const otherParticipants = conversation.participant.filter(
            (p) => p.toString() !== userId,
          );
          const role = socket.user.role === "admin" ? "user" : "admin";

          if (otherParticipants.length > 0) {
            await Conversation.findByIdAndUpdate(conversationId, {
              $inc: { [`unreadCount.${role}`]: 1 },
            });
          }

          io.to(`conversation_${conversationId}`).emit("receiveMessage", {
            _id: message._id,
            conversationId: message.conversationId,
            sender: message.sender,
            text: message.text,
            createdAt: message.createdAt,
            conversationType: message.conversationType,
            isRead: message.isRead,
          });

          console.log(
            `✅ Message sent by ${socket.user.name} in conversation ${conversationId}`,
          );
        } catch (error) {
          console.error("Error sending message:", error);
          socket.emit("error", {
            message: "Failed to send message",
            code: "SEND_MESSAGE_ERROR",
          });
        }
      });

      socket.on("userTyping", (data) => {
        try {
          const { conversationId } = data;

          if (
            !conversationId ||
            !mongoose.Types.ObjectId.isValid(conversationId)
          ) {
            return;
          }

          socket.broadcast
            .to(`conversation_${conversationId}`)
            .emit("userTyping", {
              userId,
              userName: socket.user.name,
            });
        } catch (error) {
          console.error("Error in typing indicator:", error);
        }
      });

      socket.on("stopTyping", (data) => {
        try {
          const { conversationId } = data;

          if (
            !conversationId ||
            !mongoose.Types.ObjectId.isValid(conversationId)
          ) {
            return;
          }

          socket.broadcast
            .to(`conversation_${conversationId}`)
            .emit("stopTyping", {
              userId,
            });
        } catch (error) {
          console.error("Error stopping typing indicator:", error);
        }
      });

      socket.on("markAsRead", async (data) => {
        try {
          const { messageIds } = data;

          if (!Array.isArray(messageIds) || messageIds.length === 0) {
            return;
          }

          await Message.updateMany(
            {
              _id: { $in: messageIds },
              isRead: false,
            },
            { isRead: true },
          );

          if (socket.conversationId) {
            io.to(`conversation_${socket.conversationId}`).emit(
              "messagesRead",
              {
                messageIds,
                readBy: userId,
              },
            );
          }
        } catch (error) {
          console.error("Error marking messages as read:", error);
        }
      });

      socket.on("broadcastToAll", async (data) => {
        try {
          if (socket.user.role !== "admin") {
            return socket.emit("error", {
              message: "Only admins can broadcast messages",
              code: "UNAUTHORIZED_BROADCAST",
            });
          }

          const { text } = data;

          if (!text || text.trim().length === 0) {
            return socket.emit("error", {
              message: "Message cannot be empty",
              code: "EMPTY_MESSAGE",
            });
          }

          if (text.length > 5000) {
            return socket.emit("error", {
              message: "Message is too long",
              code: "MESSAGE_TOO_LONG",
            });
          }

          const customers = await User.find({
            role: "customer",
            companyId: socket.user.companyId,
            isActive: true,
          });

          const broadcastMessages = [];
          for (const customer of customers) {
            let conversation = await Conversation.findOne({
              participant: { $all: [userId, customer._id] },
            });

            if (!conversation) {
              conversation = await Conversation.create({
                participant: [userId, customer._id],
                conversationType: "broadcast",
              });
            }

            const message = await Message.create({
              conversationId: conversation._id,
              sender: userId,
              text: text.trim(),
              conversationType: "broadcast",
            });

            await message.populate("sender", "name email role");

            await Conversation.findByIdAndUpdate(conversation._id, {
              lastMessage: message._id,
              $inc: { "unreadCount.user": 1 },
              updatedAt: Date.now(),
            });

            broadcastMessages.push({
              conversationId: conversation._id,
              message,
              customerId: customer._id,
            });

            io.to(`user_${customer._id}`).emit("receiveBroadcast", {
              _id: message._id,
              conversationId: conversation._id,
              sender: message.sender,
              text: message.text,
              createdAt: message.createdAt,
            });
          }

          socket.emit("broadcastSuccess", {
            recipientCount: customers.length,
          });

          console.log(
            `✅ Admin ${socket.user.name} broadcasted message to ${customers.length} customers`,
          );
        } catch (error) {
          console.error("Error broadcasting message:", error);
          socket.emit("error", {
            message: "Failed to broadcast message",
            code: "BROADCAST_ERROR",
          });
        }
      });

      socket.on("disconnect", () => {
        const userSockets = onlineUsers.get(userId);
        if (userSockets) {
          const index = userSockets.indexOf(socket.id);
          if (index > -1) {
            userSockets.splice(index, 1);
          }
          if (userSockets.length === 0) {
            onlineUsers.delete(userId);
            io.emit("userOffline", { userId });
          }
        }

        console.log(
          `❌ User disconnected: ${socket.user.name} (${socket.id}) | Online users: ${onlineUsers.size}`,
        );
      });
    } catch (error) {
      console.error("Socket initialization error:", error);
      socket.disconnect();
    }
  });
};
