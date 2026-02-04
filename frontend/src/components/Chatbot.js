import React, { useState, useRef, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import BackgroundCanvas from "./BackgroundCanvas";
import { useAuth } from "../context/AuthContext";
import octoLogo from "./octo1.png";

import "./Chatbot.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function Chatbot() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const [status] = useState("Online");
  const [history, setHistory] = useState([]);
  const [historySearch, setHistorySearch] = useState("");
  const [confirmIdx, setConfirmIdx] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { token, user, logout } = useAuth();

  const storageKey = useMemo(() => {
    const suffix = token || (user && user.id) || "guest";
    return `chat_messages_${suffix}`;
  }, [token, user]);

  const showMessages = messages.length > 0;
  const showHero = !showMessages;

  const quickActions = [
    "Summarize latest chat",
    "Generate SQL for daily sales",
    "Explain this error",
    "Create chart from CSV",
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Restore messages from local storage when user/session changes
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setMessages(parsed);
        }
      } else {
        setMessages([]);
      }
    } catch (err) {
      console.warn("Chat restore failed", err);
      setMessages([]);
    }
  }, [storageKey]);

  // Persist messages for current session/user
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    } catch (err) {
      console.warn("Chat persist failed", err);
    }
  }, [messages, storageKey]);

  useEffect(() => {
    const loadHistory = async () => {
      if (!token) {
        setHistory([]);
        return;
      }
      try {
        const res = await fetch(`${API_URL}/api/chat/history`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error("Failed to load history");
        const data = await res.json();
        if (Array.isArray(data.history)) {
          setHistory(data.history);
        }
      } catch (err) {
        console.warn("History fetch error", err.message);
      }
    };
    loadHistory();
  }, [token]);

  const handleQuickAction = (text) => {
    setInput(text);
    setTimeout(() => sendMessage(), 0);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleDeleteHistory = (index) => {
    const entry = history[index];
    const payload =
      typeof entry === "object"
        ? {
            id: entry._id || entry.id,
            message: entry.question || entry.message || entry.text || entry.reply,
          }
        : { message: entry };

    const removeLocal = () => setHistory((prev) => prev.filter((_, i) => i !== index));

    fetch(`${API_URL}/api/chat/history`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Delete failed");
        removeLocal();
      })
      .catch((err) => {
        console.warn("Delete history failed", err.message);
        removeLocal();
      });
  };

  const openDeleteConfirm = (idx) => setConfirmIdx(idx);
  const closeDeleteConfirm = () => setConfirmIdx(null);
  const confirmDelete = () => {
    if (confirmIdx === null) return;
    handleDeleteHistory(confirmIdx);
    setConfirmIdx(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMessages((prev) => [
      ...prev,
      {
        sender: "bot",
        text: `Received file: ${file.name} (feature stub — connect to backend to process)`,
        timestamp: new Date(),
      },
    ]);
    e.target.value = "";
  };

  const handleLogout = () => {
    const ok = window.confirm("Are you sure you want to logout?");
    if (!ok) return;
    try {
      localStorage.removeItem(storageKey);
    } catch (err) {
      console.warn("Chat storage clear failed", err);
    }
    setHistory([]);
    logout();
    navigate("/login");
  };

  const sendMessage = async () => {
    if (!input.trim() || sending) return;

    const userMessage = {
      sender: "user",
      text: input.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setSending(true);

    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message: input.trim() }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || `Request failed with ${res.status}`);
      }

      const data = await res.json();
      const botMessage = {
        sender: "bot",
        text: data.reply || "(no reply)",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
      setHistory((prev) => [userMessage.text, ...prev].slice(0, 15));
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: `Error: ${err.message}`, timestamp: new Date() },
      ]);
      console.error("Chat send failed", err);
    } finally {
      setInput("");
      setSending(false);
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="chat-page">
      <BackgroundCanvas />
      <div className="chat-layout">
        <aside className="side-panel">
          <div className="side-section">
             <div className="side-section">
            <div className="side-title">Status</div>
            <div className={`status-chip ${status.toLowerCase()}`}>{status}</div>
          </div>

            <div className="side-title">Recent</div>
            <input
              className="message-input"
              style={{
                padding: "10px 12px",
                border: "1px solid var(--border)",
                borderRadius: "10px",
                background: "rgba(255,255,255,0.03)",
                marginBottom: "8px",
              }}
              placeholder="Search history..."
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
            />
            <div className="history-list">
              {history
                .filter((item) => {
                  const text =
                    typeof item === "object"
                      ? item.question || item.userMessage || item.message || ""
                      : item;
                  return !historySearch.trim()
                    ? true
                    : text.toLowerCase().includes(historySearch.trim().toLowerCase());
                })
                .slice(0, 3)
                .map((item, idx) => {
                  const text =
                    typeof item === "object"
                      ? item.question || item.userMessage || item.message || ""
                      : item;
                  return (
                    <div key={item.id || idx} className="history-item">
                      <button className="pill" onClick={() => setInput(text)}>
                        <i className="fa-solid fa-clock-rotate-left"></i>
                        {text}
                      </button>
                      <button
                        className="icon-btn icon-sm"
                        aria-label="Delete history"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteConfirm(idx);
                        }}
                      >
                        <i className="fa-solid fa-xmark"></i>
                      </button>
                    </div>
                  );
                })}
            </div>
            <Link className="pill pill-ghost full-width" to="/history">
              <i className="fa-solid fa-table-list"></i>
              View all chats
            </Link>
          </div>
          <div className="side-section">
            <div className="side-title">Shortcuts</div>
            <div className="pill-row">
              {quickActions.map((qa, idx) => (
                <button
                  key={idx}
                  className="pill pill-ghost"
                  onClick={() => handleQuickAction(qa)}
                >
                  <i className="fa-solid fa-bolt-lightning"></i>
                  {qa}
                </button>
              ))}
            </div>
          </div>
         
          <div className="side-footer">
            <Link className="icon-btn" to="/profile" aria-label="Profile">
              <i className="fa-solid fa-user"></i>
              <span>Profile</span>
            </Link>

            <Link className="icon-btn" to="/settings" aria-label="Settings">
              <i className="fa-solid fa-gear"></i>
              <span>Settings</span>
            </Link>

            <button
              className="icon-btn logout-btn"
              onClick={handleLogout}
              aria-label="Logout"
            >
              <i className="fa-solid fa-right-from-bracket"></i>
              <span>Logout</span>
            </button>
          </div>
        </aside>

        <div className={`chat-shell ${!showMessages ? "empty-state" : ""}`}>
          {showHero && (
            <div className="chat-hero">
  <div className="chat-brand">
    <Link to="/" aria-label="Home" className="brand-mark">
      <img src={octoLogo} alt="Octopus AI" className="brand-logo" />
    </Link>

    <div>
      <h1 className="chatbot-title">Your Intelligent Data & Productivity Assistant</h1>

      <p className="mutedhead">What I can help you with:</p>

      <p className="muted">• Answer questions instantly with AI-powered responses</p>
      <p className="muted">• Generate and optimize SQL queries</p>
      <p className="muted">• Explain programming errors and suggest fixes</p>
      <p className="muted">• Analyze uploaded files (CSV, Excel, JSON, TXT)</p>
      <p className="muted">• Summarize long conversations and documents</p>
      <p className="muted">• Assist with coding, debugging, and development tasks</p>
      <p className="muted">• Provide data insights and quick analytics suggestions</p>
    </div>
  </div>
</div>

          )}

          {showMessages && (
            <div className="messages-container">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`message ${msg.sender === "user" ? "user-message" : "bot-message"}`}
                >
                  <div className="message-content">
                    <div className="message-bubble">
                      <p className="message-text">{msg.text}</p>
                    </div>
                    {msg.timestamp && (
                      <span className="message-time">
                        {formatTime(msg.timestamp)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {sending && (
                <div className="message bot-message">
                  <div className="message-content">
                    <div className="message-bubble">
                      <div className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}

          <div className="input-container">
            <div className="input-wrapper">
              <input
                type="text"
                className="message-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") sendMessage();
                }}
                disabled={sending}
              />

              <button
                className="icon-btn icon-sm"
                onClick={handleUploadClick}
                aria-label="Upload file"
              >
                <i className="fa-solid fa-upload"></i>
              </button>

              <button
                className="icon-btn icon-sm"
                onClick={() => handleQuickAction("Generate SQL for daily sales")}
                aria-label="Magic"
              >
                <i className="fa-solid fa-wand-magic-sparkles"></i>
              </button>

              <button className="icon-btn icon-sm" aria-label="Share">
                <i className="fa-solid fa-share-nodes"></i>
              </button>

              <button
                className="send-button"
                onClick={sendMessage}
                disabled={sending || !input.trim()}
                aria-label="Send message"
              >
                {sending ? (
                  <div className="spinner"></div>
                ) : (
                  <i className="fa-solid fa-paper-plane"></i>
                )}
              </button>
            </div>

            {!showMessages && (
              <div className="quick-row">
                {quickActions.map((qa, idx) => (
                  <button
                    key={idx}
                    className="pill pill-ghost"
                    onClick={() => handleQuickAction(qa)}
                  >
                    <i className="fa-solid fa-bolt-lightning"></i>
                    {qa}
                  </button>
                ))}
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls,.json,.txt"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
          </div>
        </div>
      </div>

      {confirmIdx !== null && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h3>Delete this entry?</h3>
            <p className="muted">This will remove the chat snippet from your recent list.</p>
            <div className="modal-actions">
              <button className="pill pill-ghost" onClick={closeDeleteConfirm}>Cancel</button>
              <button className="pill" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chatbot;