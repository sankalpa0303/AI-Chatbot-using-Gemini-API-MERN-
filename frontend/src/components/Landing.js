import React from 'react';
import { Link } from 'react-router-dom';
import BackgroundCanvas from './BackgroundCanvas';
import './Auth.css';

function Landing() {
  return (
    <div className="auth-page">
      <BackgroundCanvas />
      <div className="auth-hero">
        <div>
          <p className="eyebrow">Chatpal</p>
          <h1 className="hero-title">Your data-aware AI assistant</h1>
          <p className="muted">Chat, analyze, and manage your profile with a single, modern interface.</p>
          <div className="cta-row">
            <Link className="primary" to="/login">Sign In</Link>
            <Link className="ghost" to="/register">Sign Up</Link>
            <Link className="icon-btn" to="/chat" aria-label="Open chat">💬</Link>
          </div>
        </div>
        <div className="glass-card">
          <p className="muted">Quick start</p>
          <ul className="bullets">
            <li>Chat with Gemini-backed responses</li>
            <li>Save your profile and avatar</li>
            <li>Jump back into recent history</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Landing;
