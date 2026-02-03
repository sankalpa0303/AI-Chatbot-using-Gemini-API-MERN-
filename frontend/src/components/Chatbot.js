import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BackgroundCanvas from './BackgroundCanvas';

import './Chatbot.css';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function Chatbot() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const [status] = useState("Online");
  const [history, setHistory] = useState([]);
  const [historySearch, setHistorySearch] = useState("");
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

    const quickActions = [
      "Summarize latest chat",
      "Generate SQL for daily sales",
      "Explain this error",
      "Create chart from CSV"
    ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load recent chat history from backend
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await fetch(`${API_URL}/api/chat/history`);
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
  }, []);


  const handleQuickAction = (text) => {
    setInput(text);
    setTimeout(() => sendMessage(), 0);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMessages((prev) => [
      ...prev,
      {
        sender: "bot",
        text: `Received file: ${file.name} (feature stub — connect to backend to process)`,
        timestamp: new Date()
      }
    ]);
    e.target.value = "";
  };

  const sendMessage = async () => {
    if (!input.trim() || sending) return;

    const userMessage = { sender: "user", text: input.trim(), timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    setSending(true);

    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input.trim() })
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || `Request failed with ${res.status}`);
      }

      const data = await res.json();
      const botMessage = { 
        sender: "bot", 
        text: data.reply || "(no reply)", 
        timestamp: new Date() 
      };
      setMessages((prev) => [...prev, botMessage]);
      setHistory((prev) => [userMessage.text, ...prev].slice(0, 15));
    } catch (err) {
      // Show network/API errors in the chat so the user sees what happened.
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: `Error: ${err.message}`, timestamp: new Date() }
      ]);
      console.error("Chat send failed", err);
    } finally {
      setInput("");
      setSending(false);
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chat-page">
      <BackgroundCanvas />
      <div className="chat-layout">
        <aside className="side-panel">
          <div className="side-section">
            <div className="side-title">Recent</div>
            <input
              className="message-input"
              style={{ padding: "10px 12px", border: "1px solid var(--border)", borderRadius: "10px", background: "rgba(255,255,255,0.03)", marginBottom: "8px" }}
              placeholder="Search history..."
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
            />
            <div className="history-list">
              {history
                .filter((item) =>
                  !historySearch.trim()
                    ? true
                    : item.toLowerCase().includes(historySearch.trim().toLowerCase())
                )
                .map((item, idx) => (
                <button key={idx} className="pill" onClick={() => setInput(item)}>
                  <span className="icon">🔍</span>
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div className="side-section">
            <div className="side-title">Shortcuts</div>
            <div className="pill-row">
              {quickActions.map((qa, idx) => (
                <button key={idx} className="pill pill-ghost" onClick={() => handleQuickAction(qa)}>
                  ⚡ {qa}
                </button>
              ))}
            </div>
          </div>
          <div className="side-section">
            <div className="side-title">Status</div>
            <div className="status-chip">{status}</div>
          </div>
        </aside>

        <div className="chat-shell">
          <header className="chat-header">
            <div className="header-left">
              <Link to="/" aria-label="Home">
                <img src="/logo.png" alt="Logo" className="brand-logo" />
              </Link>
              <div className="header-info">
                <p className="eyebrow">Chatpal</p>
                <h1 className="chatbot-title">AI Chatbot</h1>
              </div>
            </div>
            <div className="header-actions">
              <button className="icon-btn" aria-label="Search">🔍</button>
              <Link className="icon-btn" to="/profile" aria-label="Profile">👤</Link>
              <Link className="icon-btn" to="/settings" aria-label="Settings">⚙️</Link>
              <div className="badge">{status}</div>
            </div>
          </header>

          <div className="messages-container">
            {messages.length === 0 && (
              <div className="welcome-message">
                <p>Ask me anything. I will reply here.</p>
              </div>
            )}
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.sender === 'user' ? 'user-message' : 'bot-message'}`}>
                <div className="message-content">
                  <div className="message-bubble">
                    <p className="message-text">{msg.text}</p>
                  </div>
                  {msg.timestamp && (
                    <span className="message-time">{formatTime(msg.timestamp)}</span>
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

          <div className="input-container">
            <div className="input-toolbar">
              <button className="icon-btn" onClick={handleUploadClick} aria-label="Upload file">📂</button>
              <button className="icon-btn" onClick={() => handleQuickAction("Generate SQL for daily sales")}>🛠️</button>
              <button className="icon-btn" aria-label="Share">🔗</button>
            </div>
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
                className="send-button"
                onClick={sendMessage}
                disabled={sending || !input.trim()}
              >
                {sending ? (
                  <div className="spinner"></div>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" fill="currentColor" />
                  </svg>
                )}
              </button>
            </div>
            <div className="quick-row">
              {quickActions.map((qa, idx) => (
                <button key={idx} className="pill pill-ghost" onClick={() => handleQuickAction(qa)}>
                  ⚡ {qa}
                </button>
              ))}
            </div>
            <p className="hint">Powered by gemini-2.5-flash · Upload/search/settings are UI stubs; wire to backend as needed.</p>
            <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls,.json,.txt" style={{ display: 'none' }} onChange={handleFileChange} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chatbot;