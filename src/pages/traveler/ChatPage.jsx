import React, { useEffect, useMemo, useRef, useState } from "react";
import chatService from "../../services/chatService";
import "./ChatPage.css";

const defaultContext = { location: "", people: 1, maxPrice: "" };

const ChatPage = () => {
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]); // [{role:'user'|'assistant', content:string, citations?:[]}]
  const [input, setInput] = useState("");
  const [context, setContext] = useState(defaultContext);
  const [showContext, setShowContext] = useState(false);
  const [loading, setLoading] = useState(false);
  const [booting, setBooting] = useState(true);
  const endRef = useRef(null);

  const hasContext = useMemo(
    () => !!(context.location || context.people || context.maxPrice),
    [context]
  );

  // Auto scroll
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Initialize session
  useEffect(() => {
    const init = async () => {
      try {
        const saved = localStorage.getItem("chatSessionId");
        if (saved) {
          setSessionId(saved);
          const { data } = await chatService.getHistory(saved);
          setMessages(data?.messages || []);
        } else {
          await handleNewChat();
        }
      } catch (e) {
        console.error("Init chat error:", e);
      } finally {
        setBooting(false);
      }
    };
    init();
  }, []);

  const handleNewChat = async () => {
    setBooting(true);
    try {
      const { data } = await chatService.createSession({ source: "web" });
      const newId = data?.sessionId;
      setSessionId(newId);
      localStorage.setItem("chatSessionId", newId);
      setMessages([]);
    } catch (e) {
      console.error("Create session error:", e);
    } finally {
      setBooting(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !sessionId) return;
    const userText = input.trim();
    setInput("");

    const userMsg = { role: "user", content: userText };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const cleanContext = {
        location: context.location || undefined,
        people: context.people ? Number(context.people) : undefined,
        maxPrice: context.maxPrice ? Number(context.maxPrice) : undefined,
      };
      const { data } = await chatService.sendMessage({
        sessionId,
        message: userText,
        context: cleanContext,
      });

      const assistantMsg = {
        role: "assistant",
        content: data?.reply || "",
        citations: data?.citations || [],
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (e) {
      console.error("Send message error:", e);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-page">
      <div className="chat-header">
        <div className="chat-title">
          <span role="img" aria-label="bot">🤖</span> Travel Assistant
        </div>
        <div className="chat-actions">
          <button className="btn-secondary" onClick={() => setShowContext((s) => !s)}>
            {showContext ? "Ẩn bối cảnh" : "Thêm bối cảnh"}
          </button>
          <button className="btn-primary" onClick={handleNewChat}>Chat mới</button>
        </div>
      </div>

      {showContext && (
        <div className="context-bar">
          <div className="context-field">
            <label>Địa điểm</label>
            <input
              placeholder="Đà Nẵng"
              value={context.location}
              onChange={(e) => setContext((c) => ({ ...c, location: e.target.value }))}
            />
          </div>
          <div className="context-field">
            <label>Số người</label>
            <input
              type="number"
              min={1}
              value={context.people}
              onChange={(e) => setContext((c) => ({ ...c, people: e.target.value }))}
            />
          </div>
          <div className="context-field">
            <label>Ngân sách tối đa (VND)</label>
            <input
              type="number"
              min={0}
              placeholder="6000000"
              value={context.maxPrice}
              onChange={(e) => setContext((c) => ({ ...c, maxPrice: e.target.value }))}
            />
          </div>
        </div>
      )}

      {hasContext && !showContext && (
        <div className="context-chipbar">
          {context.location && <span className="chip">📍 {context.location}</span>}
          {context.people && <span className="chip">👥 {context.people}</span>}
          {context.maxPrice && <span className="chip">💰 {Number(context.maxPrice).toLocaleString()} đ</span>}
        </div>
      )}

      <div className="chat-body">
        {booting ? (
          <div className="center-note">Đang khởi tạo phiên chat...</div>
        ) : (
          <>
            {!messages.length && (
              <div className="empty-state">
                <h3>Bạn muốn đi đâu?</h3>
                <p>Ví dụ: “Mình muốn đi Đà Nẵng 3 ngày 2 đêm, ngân sách 6 triệu cho 2 người.”</p>
              </div>
            )}
            <div className="messages">
              {messages.map((m, idx) => (
                <ChatMessage key={idx} message={m} />
              ))}
              {loading && <div className="assistant typing">Đang soạn trả lời…</div>}
              <div ref={endRef} />
            </div>
          </>
        )}
      </div>

      <div className="chat-input">
        <textarea
          rows={1}
          placeholder="Nhập tin nhắn và nhấn Enter để gửi"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className="btn-primary" onClick={handleSend} disabled={!input.trim() || loading || booting}>
          Gửi
        </button>
      </div>

      <div className="chat-footer">
        <span>Session: {sessionId || "—"}</span>
      </div>
    </div>
  );
};

const ChatMessage = ({ message }) => {
  const isUser = message.role === "user";
  return (
    <div className={`msg-row ${isUser ? "user" : "assistant"}`}>
      <div className="avatar">{isUser ? "🧑" : "🤖"}</div>
      <div className="bubble">
        <div className="content">{message.content}</div>
        {!!message.citations?.length && (
          <div className="citations">
            {message.citations.map((c, i) => (
              <a
                key={i}
                className="citation-chip"
                href={c.type === "tour" ? `/tours/${c.id}` : "#"}
                onClick={(e) => {
                  if (!c.id) e.preventDefault();
                }}
              >
                🔗 {c.type}:{c.id}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;