import { Router } from "express";
import {
  getAllConversations,
  getMessagesByConversationId,
  createConversation,
  createMessage,
  markAsRead,
  getUnreadCount,
  searchConversations,
} from "../controller/chat.controller.js";

const router = Router();
import { protect } from "../middleware/auth.js";

router.use(protect);

router.get("/conversations", getAllConversations);
router.post("/conversations", createConversation);
router.get("/conversations/search", searchConversations);
router.get("/conversations/:conversationId/unread", getUnreadCount);

router.get("/conversations/:id/messages", getMessagesByConversationId);
router.post("/messages", createMessage);
router.put("/messages/read", markAsRead);

export default router;
