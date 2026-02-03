import React, { useState, useRef, useEffect } from 'react';
import './Chatbot.css';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function Chatbot() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const [status] = useState("Online");
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

    const history = [
      "Show Q4 revenue vs Q3",
      "List tables in sales_db",
      "Top 5 products by margin",
      "Generate SQL to join orders + customers"
    ];

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

  // Data-network canvas animation for background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let frameId;

    const nodes = Array.from({ length: 68 }, () => createNode());

    function createNode() {
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        r: 2 + Math.random() * 2.5,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        alpha: 0.15 + Math.random() * 0.2,
        hue: Math.random() > 0.4 ? 200 : 260,
      };
    }

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);

      // Draw connections first for a layered, data-graph look
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist2 = dx * dx + dy * dy;
          const maxDist = 240;
          if (dist2 < maxDist * maxDist) {
            const dist = Math.sqrt(dist2);
            const opacity = Math.max(0, 0.35 - dist / maxDist) * 0.8;
            const hue = (a.hue + b.hue) / 2;
            ctx.strokeStyle = `hsla(${hue}, 80%, 65%, ${opacity})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      nodes.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;

        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 24);
        const color = `hsla(${p.hue}, 90%, 68%, ${p.alpha})`;
        glow.addColorStop(0, color);
        glow.addColorStop(1, 'rgba(7, 13, 29, 0)');

        ctx.beginPath();
        ctx.fillStyle = glow;
        ctx.arc(p.x, p.y, 14, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = `hsla(${p.hue}, 90%, 78%, 0.9)`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();

        if (idx % 8 === 0) {
          p.alpha = 0.12 + Math.random() * 0.2;
        }
      });

      frameId = requestAnimationFrame(draw);
    }

    resize();
    draw();
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);
    };
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
      <canvas ref={canvasRef} className="bg-canvas" aria-hidden="true" />
      <div className="chat-layout">
        <aside className="side-panel">
          <div className="side-section">
            <div className="side-title">Recent</div>
            <div className="history-list">
              {history.map((item, idx) => (
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
              <img src="/logo.png" alt="Logo" className="brand-logo" />
              <div className="header-info">
                <p className="eyebrow">Chatpal</p>
                <h1 className="chatbot-title">AI Chatbot</h1>
              </div>
            </div>
            <div className="header-actions">
              <button className="icon-btn" aria-label="Search">🔍</button>
              <button className="icon-btn" aria-label="Settings">⚙️</button>
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