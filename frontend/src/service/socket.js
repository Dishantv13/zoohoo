import { io } from "socket.io-client";

let socket = null;

export const connectSocket = () => {
  if (!socket) {
    const token = localStorage.getItem("token");

    if (!token) {
      console.warn("No token found. Socket connection will fail.");
      return null;
    }

    socket = io(import.meta.env.VITE_API_URL || "http://localhost:5001", {
      auth: {
        token,
      },
      withCredentials: true,
      transports: ["websocket"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
    });

    socket.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error.message);
    });

    socket.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason);
    });

    socket.on("error", (error) => {
      console.error("❌ Socket error:", error);
    });

    socket.on("userOnline", (data) => {
      console.log(`👤 ${data.userName} is online`);
    });

    socket.on("userOffline", (data) => {
      console.log(`👤 User ${data.userId} went offline`);
    });
  }

  return socket;
};

export const getSocket = () => {
  if (!socket || !socket.connected) {
    connectSocket();
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const joinConversation = (conversationId) => {
  const sock = getSocket();
  if (sock && sock.connected) {
    sock.emit("joinConversation", { conversationId });
  }
};

export const sendMessage = (conversationId, text) => {
  const sock = getSocket();
  if (sock && sock.connected) {
    sock.emit("sendMessage", { conversationId, text });
  }
};

export const emitTyping = (conversationId) => {
  const sock = getSocket();
  if (sock && sock.connected) {
    sock.emit("userTyping", { conversationId });
  }
};

export const stopTyping = (conversationId) => {
  const sock = getSocket();
  if (sock && sock.connected) {
    sock.emit("stopTyping", { conversationId });
  }
};

export const markMessagesAsRead = (messageIds) => {
  const sock = getSocket();
  if (sock && sock.connected) {
    sock.emit("markAsRead", { messageIds });
  }
};

export const broadcastMessage = (text) => {
  const sock = getSocket();
  if (sock && sock.connected) {
    sock.emit("broadcastToAll", { text });
  }
};

export const onReceiveMessage = (callback) => {
  const sock = getSocket();
  if (sock) {
    sock.on("receiveMessage", callback);
  }
};

export const onReceiveBroadcast = (callback) => {
  const sock = getSocket();
  if (sock) {
    sock.on("receiveBroadcast", callback);
  }
};

export const onUserTyping = (callback) => {
  const sock = getSocket();
  if (sock) {
    sock.on("userTyping", callback);
  }
};

export const onStopTyping = (callback) => {
  const sock = getSocket();
  if (sock) {
    sock.on("stopTyping", callback);
  }
};

export const onMessagesRead = (callback) => {
  const sock = getSocket();
  if (sock) {
    sock.on("messagesRead", callback);
  }
};

export const removeListener = (eventName) => {
  const sock = getSocket();
  if (sock) {
    sock.off(eventName);
  }
};
