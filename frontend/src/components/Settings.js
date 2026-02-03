import React from 'react';
import { useNavigate } from 'react-router-dom';
import BackgroundCanvas from './BackgroundCanvas';
import './Chatbot.css'; // reuse glass variables + fonts

function Settings() {
  const navigate = useNavigate();
  return (
    <div className="chat-page">
      <BackgroundCanvas />
      <div className="chat-layout">
        <div className="chat-shell">
          <header className="chat-header">
            <div className="header-left">
              <img src="/logo.png" alt="Logo" className="brand-logo" />
              <div className="header-info">
                <p className="eyebrow">Chatpal</p>
                <h1 className="chatbot-title">Settings</h1>
              </div>
            </div>
            <div className="header-actions">
              <button className="icon-btn" onClick={() => navigate(-1)} aria-label="Back">
                ←
              </button>
            </div>
          </header>

          <div className="messages-container" style={{ minHeight: 200 }}>
            <p className="message-text">Put your toggles, API key form, and theme controls here.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;