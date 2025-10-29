import apiClient from "../config/apiClient";

const chatService = {
  createSession: (metadata = { source: "web" }) =>
    apiClient.post("/chat/session", { metadata }),

  sendMessage: ({ sessionId, message, context }) =>
    apiClient.post("/chat/message", { sessionId, message, context }),

  getHistory: (sessionId) =>
    apiClient.get(`/chat/history/${sessionId}`),
};

export default chatService;