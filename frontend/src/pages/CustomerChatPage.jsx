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
  Space,
  Tooltip,
  message,
} from "antd";
import { SendOutlined, UserOutlined, CheckOutlined } from "@ant-design/icons";
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
  emitTyping,
  stopTyping,
} from "../service/socket";

const { Content, Header } = Layout;
const { Text } = Typography;

export default function CustomerChatPage() {
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const [onlineUsers, setOnlineUsers] = useState({});
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
      message.info(`Important: ${msg.text}`);
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

        if (selectedConv) {
          const updated = dataArray.find((c) => c._id === selectedConv._id);
          if (updated) {
            setSelectedConv(updated);
          }
        }
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

  const getAdmin = (conversation) => {
    if (!conversation.participant || conversation.participant.length === 0) {
      return null;
    }
    return conversation.participant.find((p) => p.role === "admin");
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
      year: "numeric",
    });
  };

  const isUserOnline = (userId) => {
    return onlineUsers.hasOwnProperty(userId);
  };

  return (
    <Layout style={{ height: "100vh", overflow: "hidden" }}>
      {/* Sidebar */}
      <div
        style={{
          width: "350px",
          background: "#fff",
          borderRight: "1px solid #f0f0f0",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            padding: "16px",
            borderBottom: "1px solid #f0f0f0",
            background: "#fafafa",
            fontWeight: "600",
            fontSize: "14px",
          }}
        >
          Support Conversations
        </div>

        <List
          itemLayout="horizontal"
          dataSource={conversations}
          loading={loading}
          style={{ flex: 1 }}
          renderItem={(conversation) => {
            const admin = getAdmin(conversation);
            const isOnline = admin ? isUserOnline(admin._id) : false;

            return (
              <List.Item
                onClick={() => handleSelectConversation(conversation)}
                style={{
                  cursor: "pointer",
                  background:
                    selectedConv?._id === conversation._id ? "#e6f7ff" : "#fff",
                  padding: "12px 16px",
                  borderBottom: "1px solid #f0f0f0",
                  transition: "all 0.3s",
                  margin: 0,
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
                  title={<Text strong>{admin?.name || "Support"}</Text>}
                  description={
                    <Text
                      ellipsis
                      type="secondary"
                      style={{ fontSize: "12px" }}
                    >
                      {conversation.lastMessage?.text || "Start a conversation"}
                    </Text>
                  }
                />
              </List.Item>
            );
          }}
          locale={{
            emptyText: (
              <Empty
                description="No conversations yet"
                style={{ marginTop: "40px" }}
              />
            ),
          }}
        />
      </div>

      {/* Main Chat Area */}
      <Layout
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          overflow: "hidden",
        }}
      >
        {selectedConv ? (
          <>
            {/* Header */}
            <Header
              style={{
                background: "#fff",
                borderBottom: "1px solid #f0f0f0",
                padding: "0 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                height: "70px",
              }}
            >
              <Space size="large">
                <Avatar icon={<UserOutlined />} size={40} />
                <div>
                  <Text strong style={{ fontSize: "16px" }}>
                    {getAdmin(selectedConv)?.name || "Support"}
                  </Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    {isUserOnline(getAdmin(selectedConv)?._id)
                      ? "● Online"
                      : "● Offline"}
                  </Text>
                </div>
              </Space>
            </Header>

            {/* Messages Area */}
            <Content
              style={{
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                background: "#fafafa",
                flex: 1,
              }}
            >
              <Spin spinning={loading}>
                <div
                  style={{
                    flex: 1,
                    overflowY: "auto",
                    marginBottom: "16px",
                    paddingRight: "8px",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {messages.length === 0 ? (
                    <Empty
                      description="No messages yet. Start the conversation!"
                      style={{ marginTop: "100px", flex: 1 }}
                    />
                  ) : (
                    messages.map((msg) => {
                      const isOwnMessage = msg.sender._id === currentUser?._id;

                      return (
                        <div
                          key={msg._id}
                          style={{
                            textAlign: isOwnMessage ? "right" : "left",
                            marginBottom: "12px",
                            display: "flex",
                            justifyContent: isOwnMessage
                              ? "flex-end"
                              : "flex-start",
                          }}
                        >
                          <div
                            style={{
                              display: "inline-block",
                              maxWidth: "65%",
                            }}
                          >
                            {!isOwnMessage && (
                              <Text
                                type="secondary"
                                style={{
                                  fontSize: "12px",
                                  display: "block",
                                  marginBottom: "4px",
                                  marginLeft: "8px",
                                }}
                              >
                                {msg.sender.name}
                              </Text>
                            )}
                            <Tooltip title={formatDate(msg.createdAt)}>
                              <div
                                style={{
                                  padding: "10px 14px",
                                  borderRadius: "12px",
                                  background: isOwnMessage ? "#1677ff" : "#fff",
                                  color: isOwnMessage ? "#fff" : "#000",
                                  wordBreak: "break-word",
                                  boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
                                }}
                              >
                                <Text
                                  style={{
                                    color: isOwnMessage ? "#fff" : "#000",
                                    fontSize: "14px",
                                  }}
                                >
                                  {msg.text}
                                </Text>
                              </div>
                            </Tooltip>
                            <Text
                              type="secondary"
                              style={{
                                fontSize: "11px",
                                display: "block",
                                marginTop: "4px",
                                marginRight: isOwnMessage ? "8px" : "0",
                                marginLeft: isOwnMessage ? "0" : "8px",
                              }}
                            >
                              {formatTime(msg.createdAt)}
                              {isOwnMessage && msg.isRead && (
                                <CheckOutlined
                                  style={{
                                    marginLeft: "6px",
                                    color: "#1677ff",
                                    fontSize: "11px",
                                  }}
                                />
                              )}
                            </Text>
                          </div>
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

              {/* Input Area */}
              <div style={{ marginTop: "auto", paddingTop: "16px" }}>
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
                    placeholder="Type your message... (Max 5000 characters)"
                    onPressEnter={handleSendMessage}
                    maxLength={5000}
                    allowClear
                    style={{
                      flex: 1,
                      padding: "10px 14px",
                      borderRadius: "20px",
                      fontSize: "14px",
                    }}
                  />
                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleSendMessage}
                    loading={loading}
                    style={{
                      borderRadius: "50%",
                      width: "44px",
                      height: "44px",
                      padding: "0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  />
                </Space.Compact>
              </div>
            </Content>
          </>
        ) : (
          <Content
            style={{
              padding: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#fafafa",
              flex: 1,
            }}
          >
            <Empty
              description="Select a conversation to start chatting"
              style={{ marginTop: "0" }}
            />
          </Content>
        )}
      </Layout>
    </Layout>
  );
}
