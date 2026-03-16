import {
  getAllConversationsService,
  getMessagesByConversationIdService,
  createConversationService,
  createMessageService,
  markMessagesAsReadService,
  getUnreadCountService,
  searchConversationsService,
} from "../service/chat.service.js";

import { asyncHandler } from "../util/asyncHandler.js";
import { successResponse } from "../util/response.js";
import ApiError from "../util/apiError.js";
import { CHAT_MESSAGES } from "../util/successMessge.js";
import { HTTP_STATUS } from "../util/httpStatus.js";

const getAllConversations = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, type } = req.query;

  const filters = {};
  if (type && ["direct", "group", "broadcast"].includes(type)) {
    filters.conversationType = type;
  }

  const result = await getAllConversationsService(
    req.user._id,
    parseInt(page),
    parseInt(limit),
    filters,
  );

  successResponse(
    res,
    result.conversations,
    HTTP_STATUS.OK,
    CHAT_MESSAGES.CONVERSATION,
    result.pagination,
  );
});

const getMessagesByConversationId = asyncHandler(async (req, res) => {
  const { id: conversationId } = req.params;
  const { page = 1, limit = 50 } = req.query;

  const result = await getMessagesByConversationIdService(
    conversationId,
    parseInt(page),
    parseInt(limit),
  );

  successResponse(
    res,
    result.messages,
    HTTP_STATUS.OK,
    CHAT_MESSAGES.MESSAGES_RETRIEVED,
    result.pagination,
  );
});

const createConversation = asyncHandler(async (req, res) => {
  const { customerId } = req.body;

  if (!customerId) {
    throw new ApiError(400, "Customer ID is required");
  }

  const conversation = await createConversationService(
    req.user._id,
    customerId,
  );

  successResponse(res, conversation, HTTP_STATUS.CREATED, CHAT_MESSAGES.CONVERSATION_CREATED);
});

const createMessage = asyncHandler(async (req, res) => {
  const { conversationId, text } = req.body;

  if (!conversationId) {
    throw new ApiError(400, "Conversation ID is required");
  }

  if (!text || text.trim().length === 0) {
    throw new ApiError(400, "Message text is required");
  }

  const message = await createMessageService(
    conversationId,
    req.user._id,
    text,
  );

  successResponse(res, message, HTTP_STATUS.CREATED, CHAT_MESSAGES.MESSAGE_SENT);
});

const markAsRead = asyncHandler(async (req, res) => {
  const { messageIds } = req.body;

  if (!Array.isArray(messageIds) || messageIds.length === 0) {
    throw new ApiError(400, "Message IDs array is required");
  }

  const result = await markMessagesAsReadService(messageIds, req.user._id);

  successResponse(
    res,
    result,
    HTTP_STATUS.OK,
    CHAT_MESSAGES.MESSAGE_READ,
  );
});

const getUnreadCount = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const userRole = req.user.role;

  const unreadInfo = await getUnreadCountService(conversationId, userRole);

  successResponse(res, unreadInfo, HTTP_STATUS.OK, CHAT_MESSAGES.UNREAD_COUNT);
});

const searchConversations = asyncHandler(async (req, res) => {
  const { query } = req.query;

  if (!query || typeof query !== "string") {
    throw new ApiError(400, "Search query is required");
  }

  const conversations = await searchConversationsService(req.user._id, query);

  successResponse(res, conversations, HTTP_STATUS.OK, CHAT_MESSAGES.SEARCH_RESULTS);
});

export {
  getAllConversations,
  getMessagesByConversationId,
  createConversation,
  createMessage,
  markAsRead,
  getUnreadCount,
  searchConversations,
};
