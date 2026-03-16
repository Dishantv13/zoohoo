import { Message } from "../model/message.model.js";
import { Conversation } from "../model/conversion.model.js";
import { User } from "../model/user.model.js";
import { CHAT_ERRORS } from "../util/errorMessage.js";
import mongoose from "mongoose";

const getAllConversationsService = async (
  userId,
  page = 1,
  limit = 20,
  filters = {},
) => {
  const skip = (page - 1) * limit;

  const query = {
    participant: { $in: [new mongoose.Types.ObjectId(userId)] },
  };

  if (filters.conversationType) {
    query.conversationType = filters.conversationType;
  }

  const conversations = await Conversation.find(query)
    .populate({
      path: "participant",
      select: "name email role",
    })
    .populate({
      path: "lastMessage",
      populate: {
        path: "sender",
        select: "name email role",
      },
    })
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await Conversation.countDocuments(query);

  if (conversations.length === 0) {
    return {
      conversations: [],
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  return {
    conversations,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

const getMessagesByConversationIdService = async (
  conversationId,
  page = 1,
  limit = 50,
) => {
  if (!conversationId || !mongoose.Types.ObjectId.isValid(conversationId)) {
    throw CHAT_ERRORS.INVALID_CONVERSATION_ID();
  }

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    throw CHAT_ERRORS.CONVERSATION_NOT_FOUND();

  }

  const skip = (page - 1) * limit;

  const messages = await Message.find({ conversationId })
    .populate("sender", "name email role")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await Message.countDocuments({ conversationId });

  if (!messages || messages.length === 0) {
    return {
      messages: [],
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  messages.reverse();

  return {
    messages,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

const createConversationService = async (userId1, userId2) => {
  if (
    !mongoose.Types.ObjectId.isValid(userId1) ||
    !mongoose.Types.ObjectId.isValid(userId2)
  ) {
    throw CHAT_ERRORS.INVALID_USER_IDS();
  }

  if (userId1.toString() === userId2.toString()) {
    throw CHAT_ERRORS.SELF_CONVERSATION_NOT_ALLOWED();
  }

  const users = await User.find({
    _id: { $in: [userId1, userId2] },
  });

  if (users.length !== 2) {
    throw CHAT_ERRORS.USERS_NOT_FOUND();
  }

  let conversation = await Conversation.findOne({
    participant: { $all: [userId1, userId2] },
  }).populate({
    path: "participant",
    select: "name email role",
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participant: [userId1, userId2],
      conversationType: "direct",
    });

    await conversation.populate({
      path: "participant",
      select: "name email role",
    });
  }

  return conversation;
};

const createMessageService = async (
  conversationId,
  senderId,
  text,
  conversationType = "direct",
) => {
  if (!conversationId || !mongoose.Types.ObjectId.isValid(conversationId)) {
    throw CHAT_ERRORS.INVALID_CONVERSATION_ID();
  }

  if (!text || text.trim().length === 0) {
    throw CHAT_ERRORS.MESSAGE_EMPTY();
  }

  if (text.length > 5000) {
    throw CHAT_ERRORS.MESSAGE_TOO_LONG();
  }

  const conversation = await Conversation.findById(conversationId);

  if (!conversation) {
    throw CHAT_ERRORS.CONVERSATION_NOT_FOUND();
  }

  const isParticipant = conversation.participant.some(
    (p) => p.toString() === senderId.toString(),
  );

  if (!isParticipant) {
    throw CHAT_ERRORS.UNAUTHORIZED_MESSAGE();
  }

  const message = await Message.create({
    conversationId,
    sender: senderId,
    text: text.trim(),
    conversationType,
  });

  await message.populate("sender", "name email role");

  await Conversation.findByIdAndUpdate(
    conversationId,
    {
      lastMessage: message._id,
      updatedAt: Date.now(),
    },
    { new: true },
  );

  return message;
};

const markMessagesAsReadService = async (messageIds, userId) => {
  if (!Array.isArray(messageIds) || messageIds.length === 0) {
    throw CHAT_ERRORS.INVALID_MESSAGE_IDS();
  }

  const result = await Message.updateMany(
    {
      _id: { $in: messageIds.map((id) => new mongoose.Types.ObjectId(id)) },
      isRead: false,
    },
    { isRead: true, readAt: new Date() },
  );

  return result;
};

const getUnreadCountService = async (conversationId, userRole) => {
  if (!conversationId || !mongoose.Types.ObjectId.isValid(conversationId)) {
    throw CHAT_ERRORS.INVALID_CONVERSATION_ID();
  }

  const conversation = await Conversation.findById(conversationId);

  if (!conversation) {
    throw CHAT_ERRORS.CONVERSATION_NOT_FOUND();
  }

  return {
    conversationId,
    unreadCount: conversation.unreadCount[userRole] || 0,
  };
};

const searchConversationsService = async (userId, query) => {
  if (!query || query.trim().length === 0) {
    return [];
  }

  const conversations = await Conversation.find({
    participant: { $in: [new mongoose.Types.ObjectId(userId)] },
    $or: [
      {
        "participant.name": { $regex: query, $options: "i" },
      },
    ],
  })
    .populate({
      path: "participant",
      select: "name email role",
    })
    .populate({
      path: "lastMessage",
      populate: {
        path: "sender",
        select: "name email role",
      },
    })
    .sort({ updatedAt: -1 })
    .limit(10);

  return conversations;
};

export {
  getAllConversationsService,
  getMessagesByConversationIdService,
  createConversationService,
  createMessageService,
  markMessagesAsReadService,
  getUnreadCountService,
  searchConversationsService,
};
