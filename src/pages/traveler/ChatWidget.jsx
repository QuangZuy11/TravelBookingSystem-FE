import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import chatService from "../../services/chatService";
import "./ChatWidget.css";

const useIsTraveler = () => {
  try {
    const token =
      localStorage.getItem("accessToken") || localStorage.getItem("token");
    const rawUser =
      localStorage.getItem("user") || localStorage.getItem("currentUser");
    const user = rawUser ? JSON.parse(rawUser) : null;
    const roleName =
      user?.role?.role_name || user?.role_name || user?.role || user?.userRole || null;
    return Boolean(token && (roleName || "").toLowerCase() === "traveler");
  } catch {
    return false;
  }
};

const ChatWidget = () => {
  const location = useLocation();
  const onHome = location.pathname === "/" || location.pathname === "/home";
  const canShow = useIsTraveler();
  const [open, setOpen] = useState(false);

  if (!onHome || !canShow) return null;

  return (
    <>
      {!open && (
        <button
          className="chat-fab"
          aria-label="Open chat"
          onClick={() => setOpen(true)}
          title="Travel Assistant"
        >
          💬
        </button>
      )}
      {open && <ChatPanel onClose={() => setOpen(false)} />}
    </>
  );
};

const ChatPanel = ({ onClose }) => {
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [contextOpen, setContextOpen] = useState(false);
  const [context, setContext] = useState({ location: "", people: 1, maxPrice: "" });
  const [loading, setLoading] = useState(false);
  const [booting, setBooting] = useState(true);
  const endRef = useRef(null);

  const hasContext = useMemo(
    () => !!(context.location || context.people || context.maxPrice),
    [context]
  );

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    const init = async () => {
      try {
        const saved = localStorage.getItem("chatSessionId");
        if (saved) {
          setSessionId(saved);
          const { data } = await chatService.getHistory(saved);
          setMessages(data?.messages || []);
        } else {
          await handleNewSession();
        }
      } catch (e) {
        console.error("Chat init error:", e);
      } finally {
        setBooting(false);
      }
    };
    init();
  }, []);

  const handleNewSession = async () => {
    setBooting(true);
    try {
      const { data } = await chatService.createSession({ source: "web" });
      const id = data?.sessionId;
      setSessionId(id);
      localStorage.setItem("chatSessionId", id);
      setMessages([]);
    } catch (e) {
      console.error("Create session failed:", e);
    } finally {
      setBooting(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !sessionId) return;
    const text = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setLoading(true);
    try {
      const cleanContext = {
        location: context.location || undefined,
        people: context.people ? Number(context.people) : undefined,
        maxPrice: context.maxPrice ? Number(context.maxPrice) : undefined,
      };
      const { data } = await chatService.sendMessage({
        sessionId,
        message: text,
        context: cleanContext,
      });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data?.reply || "", citations: data?.citations || [] },
      ]);
    } catch (e) {
      console.error("Send message failed:", e);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Xin lỗi, có lỗi xảy ra. Vui lòng thử lại." },
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
    <div className="chat-panel">
      <div className="chat-panel-header">
        <div className="left">
          <span className="bot">🤖</span>
          <div>
            <div className="title">Travel Assistant</div>
            <div className="subtitle">Tư vấn lịch trình du lịch</div>
          </div>
        </div>
        <div className="right">
          <button className="btn-icon close" aria-label="Close" onClick={onClose}>✕</button>
        </div>
      </div>

      {contextOpen && (
        <div className="chat-panel-context compact">
          <div className="field">
            <label>Địa điểm</label>
            <input
              placeholder="Đà Nẵng"
              value={context.location}
              onChange={(e) => setContext((c) => ({ ...c, location: e.target.value }))}
            />
          </div>
          <div className="field short">
            <label>Người</label>
            <input
              type="number"
              min={1}
              value={context.people}
              onChange={(e) => setContext((c) => ({ ...c, people: e.target.value }))}
            />
          </div>
          <div className="field">
            <label>Ngân sách (VND)</label>
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

      {hasContext && !contextOpen && (
        <div className="chipbar">
          {context.location && <span className="chip">📍 {context.location}</span>}
          {context.people && <span className="chip">👥 {context.people}</span>}
          {context.maxPrice && <span className="chip">💰 {Number(context.maxPrice).toLocaleString()} đ</span>}
        </div>
      )}

      <div className="chat-panel-body">
        {booting ? (
          <div className="center-note">Đang khởi tạo phiên chat...</div>
        ) : (
          <>
            {!messages.length && (
              <div className="empty">
                <h4>Bạn muốn đi đâu?</h4>
                <p>Ví dụ: “Mình muốn đi Đà Nẵng 3 ngày 2 đêm, ngân sách 6 triệu cho 2 người.”</p>
              </div>
            )}
            <div className="messages">
              {messages.map((m, i) => (
                <Message key={i} m={m} />
              ))}
              {loading && <div className="assistant typing">Đang soạn trả lời…</div>}
              <div ref={endRef} />
            </div>
          </>
        )}
      </div>

      {/* Toolbar đưa xuống dưới, gọn gàng */}
      <div className="chat-panel-toolbar">
        <button
          className={`btn-chip ${contextOpen ? "active" : ""}`}
          onClick={() => setContextOpen((s) => !s)}
          title="Bật/tắt bối cảnh"
        >
          <span className="icon">🧭</span>
          <span>Bối cảnh</span>
        </button>

        <button
          className="btn-chip"
          onClick={handleNewSession}
          title="Tạo phiên chat mới"
        >
          <span className="icon">🔄</span>
          <span>Chat mới</span>
        </button>

        <button
          className="btn-chip"
          onClick={() => {
            navigate("/chat");
            onClose();
          }}
          title="Mở toàn màn hình"
        >
          <span className="icon">⛶</span>
          <span>Toàn màn hình</span>
        </button>
      </div>

      <div className="chat-panel-input">
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

      <div className="chat-panel-footer">
        <span>Session: {sessionId || "—"}</span>
      </div>
    </div>
  );
};

const Message = ({ m }) => {
  const isUser = m.role === "user";
  return (
    <div className={`msg ${isUser ? "user" : "assistant"}`}>
      <div className="avatar">{isUser ? "🧑" : "🤖"}</div>
      <div className="bubble">
        <div className="content">{m.content}</div>
        {!!m.citations?.length && (
          <div className="citations">
            {m.citations.map((c, i) => (
              <a
                key={i}
                className="citation"
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

export default ChatWidget;