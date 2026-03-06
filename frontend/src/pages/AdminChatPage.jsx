import {
  Layout,
  List,
  Avatar,
  Badge,
  Typography,
  Input,
  Button,
  Empty,
  Spin,
  Segmented,
  Space,
  Tooltip,
  message,
} from "antd";
import {
  SendOutlined,
  UserOutlined,
  NotificationOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import { useEffect, useState, useRef } from "react";
import apiService from "../service/apiService";
import {
  connectSocket,
  getSocket,
  disconnectSocket,
  joinConversation,
  sendMessage,
  onReceiveMessage,
  onReceiveBroadcast,
  onUserTyping,
  onStopTyping,
  markMessagesAsRead,
  emitTyping,
  stopTyping,
  broadcastMessage,
} from "../service/socket";

const { Sider, Content, Header } = Layout;
const { Text } = Typography;

export default function AdminChatPage() {
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const [onlineUsers, setOnlineUsers] = useState({});
  const [broadcastMode, setBroadcastMode] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    const initializeChat = async () => {
      try {
        setLoading(true);

        try {
          const userResponse = await apiService.getCurrentUser();
          if (userResponse?.data) {
            setCurrentUser(userResponse.data);
          }
        } catch (err) {
          console.warn("Could not fetch current user");
        }

        connectSocket();

        await fetchConversations();
      } catch (error) {
        console.error("Initialization error:", error);
        message.error("Failed to initialize chat");
      } finally {
        setLoading(false);
      }
    };

    initializeChat();

    return () => {
      disconnectSocket();
    };
  }, []);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleReceiveMessage = (msg) => {
      if (selectedConv && msg.conversationId === selectedConv._id) {
        setMessages((prev) => [...prev, msg]);
      }

      fetchConversations();
    };

    const handleReceiveBroadcast = (msg) => {
      message.info(`Broadcast from admin: ${msg.text}`);
      fetchConversations();
    };

    const handleUserTyping = (data) => {
      setTypingUsers((prev) => ({
        ...prev,
        [data.userId]: data.userName,
      }));
    };

    const handleStopTyping = (data) => {
      setTypingUsers((prev) => {
        const updated = { ...prev };
        delete updated[data.userId];
        return updated;
      });
    };

    const handleUserOnline = (data) => {
      setOnlineUsers((prev) => ({
        ...prev,
        [data.userId]: { name: data.userName, role: data.userRole },
      }));
    };

    const handleUserOffline = (data) => {
      setOnlineUsers((prev) => {
        const updated = { ...prev };
        delete updated[data.userId];
        return updated;
      });
    };

    onReceiveMessage(handleReceiveMessage);
    onReceiveBroadcast(handleReceiveBroadcast);
    onUserTyping(handleUserTyping);
    onStopTyping(handleStopTyping);
    socket.on("userOnline", handleUserOnline);
    socket.on("userOffline", handleUserOffline);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("receiveBroadcast", handleReceiveBroadcast);
      socket.off("userTyping", handleUserTyping);
      socket.off("stopTyping", handleStopTyping);
      socket.off("userOnline", handleUserOnline);
      socket.off("userOffline", handleUserOffline);
    };
  }, [selectedConv]);

  const fetchConversations = async () => {
    try {
      const response = await apiService.getConversations();
      if (response?.data) {
        const conversationData = response.data.data || response.data || [];
        const dataArray = Array.isArray(conversationData)
          ? conversationData
          : [];
        setConversations(dataArray);
      } else {
        setConversations([]);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
      setConversations([]);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      setLoading(true);
      const response = await apiService.getMessages(conversationId);
      if (response?.data) {
        const messageData = response.data.data || response.data || [];
        const dataArray = Array.isArray(messageData) ? messageData : [];
        setMessages(dataArray);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      setMessages([]);
      message.error("Failed to fetch messages");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectConversation = (conversation) => {
    setSelectedConv(conversation);
    setTypingUsers({});
    joinConversation(conversation._id);
    fetchMessages(conversation._id);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleTextChange = (e) => {
    setText(e.target.value);

    if (selectedConv) {
      emitTyping(selectedConv._id);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        stopTyping(selectedConv._id);
      }, 3000);
    }
  };

  const handleSendMessage = async () => {
    if (!text.trim() || !selectedConv) return;

    try {
      stopTyping(selectedConv._id);

      await apiService.sendMessage({
        conversationId: selectedConv._id,
        text: text.trim(),
      });

      sendMessage(selectedConv._id, text.trim());

      setText("");
    } catch (error) {
      console.error("Error sending message:", error);
      message.error("Failed to send message");
    }
  };

  const handleBroadcast = async () => {
    if (!text.trim()) {
      message.warning("Please enter a message");
      return;
    }

    try {
      broadcastMessage(text.trim());
      setText("");
      message.success("Broadcast sent to all customers");
    } catch (error) {
      console.error("Error broadcasting:", error);
      message.error("Failed to send broadcast");
    }
  };

  const getOtherParticipant = (conversation) => {
    if (!conversation.participant || conversation.participant.length === 0) {
      return null;
    }
    return conversation.participant.find((p) => p._id !== currentUser?._id);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const isUserOnline = (userId) => {
    return onlineUsers.hasOwnProperty(userId);
  };

  return (
    <Layout style={{ height: "100vh", overflow: "hidden" }}>
      <Sider
        width={320}
        style={{
          background: "#fff",
          borderRight: "1px solid #f0f0f0",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            padding: "16px",
            borderBottom: "1px solid #f0f0f0",
            background: "#fafafa",
          }}
        >
          <Segmented
            value={broadcastMode ? "broadcast" : "direct"}
            onChange={(value) => setBroadcastMode(value === "broadcast")}
            options={[
              { label: "Chats", value: "direct", icon: <UserOutlined /> },
              {
                label: "Broadcast",
                value: "broadcast",
                icon: <NotificationOutlined />,
              },
            ]}
            block
          />
        </div>

        {!broadcastMode ? (
          <List
            itemLayout="horizontal"
            dataSource={conversations}
            loading={loading}
            renderItem={(conversation) => {
              const otherParticipant = getOtherParticipant(conversation);
              const unreadCount = conversation.unreadCount?.admin || 0;
              const isOnline = otherParticipant
                ? isUserOnline(otherParticipant._id)
                : false;

              return (
                <List.Item
                  onClick={() => handleSelectConversation(conversation)}
                  style={{
                    cursor: "pointer",
                    background:
                      selectedConv?._id === conversation._id
                        ? "#e6f7ff"
                        : "#fff",
                    padding: "12px 16px",
                    borderBottom: "1px solid #f0f0f0",
                    transition: "all 0.3s",
                  }}
                >
                  <List.Item.Meta
                    avatar={
                      <Badge
                        dot={isOnline}
                        color="green"
                        offset={[-5, 5]}
                        title={isOnline ? "Online" : "Offline"}
                      >
                        <Avatar icon={<UserOutlined />} />
                      </Badge>
                    }
                    title={
                      <Space>
                        <Text strong>
                          {otherParticipant?.name || "Unknown"}
                        </Text>
                        {unreadCount > 0 && (
                          <Badge
                            count={unreadCount}
                            style={{
                              backgroundColor: "#ff4d4f",
                              color: "#fff",
                            }}
                          />
                        )}
                      </Space>
                    }
                    description={
                      <Text
                        ellipsis
                        type="secondary"
                        style={{ fontSize: "12px" }}
                      >
                        {conversation.lastMessage?.text || "No messages yet"}
                      </Text>
                    }
                  />
                </List.Item>
              );
            }}
            locale={{
              emptyText: (
                <Empty
                  description="No conversations"
                  style={{ marginTop: "40px" }}
                />
              ),
            }}
          />
        ) : (
          <div style={{ padding: "20px", color: "#999", textAlign: "center" }}>
            <NotificationOutlined
              style={{ fontSize: "32px", marginBottom: "10px" }}
            />
            <p>Send a broadcast message to all customers</p>
          </div>
        )}
      </Sider>

      <Layout
        style={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {selectedConv && !broadcastMode ? (
          <>
            <Header
              style={{
                background: "#fff",
                borderBottom: "1px solid #f0f0f0",
                padding: "0 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Space>
                <Avatar icon={<UserOutlined />} />
                <div>
                  <Text strong>
                    {getOtherParticipant(selectedConv)?.name || "Unknown"}
                  </Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    {isUserOnline(getOtherParticipant(selectedConv)?._id)
                      ? "Online"
                      : "Offline"}
                  </Text>
                </div>
              </Space>
            </Header>

            <Content
              style={{
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                background: "#fafafa",
              }}
            >
              <Spin spinning={loading}>
                <div
                  style={{
                    flex: 1,
                    overflowY: "auto",
                    height: "100vh",
                    marginBottom: "16px",
                    paddingRight: "8px",
                  }}
                >
                  {messages.length === 0 ? (
                    <Empty
                      description="No messages yet"
                      style={{ marginTop: "100px" }}
                    />
                  ) : (
                    messages.map((msg) => {
                      const isOwnMessage = msg.sender._id === currentUser?._id;

                      return (
                        <div
                          key={msg._id}
                          style={{
                            textAlign: isOwnMessage ? "right" : "left",
                            marginBottom: "16px",
                            display: "flex",
                            justifyContent: isOwnMessage
                              ? "flex-end"
                              : "flex-start",
                          }}
                        >
                          <Tooltip title={formatDate(msg.createdAt)}>
                            <div
                              style={{
                                display: "inline-block",
                                maxWidth: "60%",
                              }}
                            >
                              {!isOwnMessage && (
                                <Text
                                  type="secondary"
                                  style={{
                                    fontSize: "12px",
                                    display: "block",
                                    marginBottom: "4px",
                                  }}
                                >
                                  {msg.sender.name}
                                </Text>
                              )}
                              <div
                                style={{
                                  padding: "8px 14px",
                                  borderRadius: "16px",
                                  background: isOwnMessage ? "#1677ff" : "#fff",
                                  color: isOwnMessage ? "#fff" : "#000",
                                  wordBreak: "break-word",
                                  boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                                }}
                              >
                                <Text
                                  style={{
                                    color: isOwnMessage ? "#fff" : "#000",
                                  }}
                                >
                                  {msg.text}
                                </Text>
                              </div>
                              <Text
                                type="secondary"
                                style={{
                                  fontSize: "11px",
                                  display: "block",
                                  marginTop: "4px",
                                }}
                              >
                                {formatTime(msg.createdAt)}
                                {isOwnMessage && msg.isRead && (
                                  <CheckOutlined
                                    style={{
                                      marginLeft: "4px",
                                      color: "#1677ff",
                                    }}
                                  />
                                )}
                              </Text>
                            </div>
                          </Tooltip>
                        </div>
                      );
                    })
                  )}

                  {Object.keys(typingUsers).length > 0 && (
                    <div style={{ marginTop: "10px", color: "#999" }}>
                      <Text type="secondary" style={{ fontSize: "12px" }}>
                        {Object.values(typingUsers).join(", ")} is typing...
                      </Text>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </Spin>

              <Space.Compact
                style={{
                  width: "100%",
                  display: "flex",
                  gap: "10px",
                }}
              >
                <Input
                  value={text}
                  onChange={handleTextChange}
                  placeholder="Type a message..."
                  onPressEnter={handleSendMessage}
                  maxLength={5000}
                  allowClear
                  style={{ flex: 1 }}
                />
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={handleSendMessage}
                  loading={loading}
                >
                  Send
                </Button>
              </Space.Compact>
            </Content>
          </>
        ) : broadcastMode ? (
          <Content
            style={{
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              background: "#fafafa",
            }}
          >
            <div style={{ flex: 1, marginBottom: "20px" }}>
              <Text strong style={{ fontSize: "16px" }}>
                <NotificationOutlined /> Send Broadcast Message
              </Text>
              <p style={{ color: "#666", marginTop: "10px" }}>
                This message will be sent to all active customers
              </p>
            </div>

            <Space.Compact
              style={{ width: "100%", display: "flex", gap: "10px" }}
            >
              <Input.TextArea
                value={text}
                onChange={handleTextChange}
                placeholder="Enter your broadcast message..."
                maxLength={5000}
                rows={6}
                style={{ flex: 1 }}
              />
            </Space.Compact>

            <div style={{ marginTop: "16px", textAlign: "right" }}>
              <Button
                type="primary"
                size="large"
                icon={<NotificationOutlined />}
                onClick={handleBroadcast}
                loading={loading}
              >
                Send Broadcast
              </Button>
            </div>
          </Content>
        ) : (
          <Content
            style={{
              padding: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              background: "#fafafa",
            }}
          >
            <Empty
              description="Select a customer to start chatting"
              style={{ marginTop: "0" }}
            />
          </Content>
        )}
      </Layout>
    </Layout>
  );
}
