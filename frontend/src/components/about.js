import React from "react";
import { Link } from "react-router-dom";
import octoLogo from "./octo1.png";
import BackgroundCanvas from "./BackgroundCanvas";
import "./about.css";

function Abount() {
  return (
    <div className="about-page">
      <BackgroundCanvas />
      <div className="about-container">
        <Link to="/chat" className="back-button">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M10 12L6 8L10 4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back to Chat
        </Link>

        <div className="chat-hero">
          <Link to="/chat" aria-label="Home" className="brand-mark">
            <img src={octoLogo} alt="Octopus AI" className="brand-logo" />
          </Link>

          <div className="hero-content">
            <h1 className="chatbot-title">Octopus AI Assistant</h1>
            
            <span className="version-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
              Powered by Gemini 1.5 Flash
            </span>

            <p className="about-description">
              Your intelligent companion for data analysis, coding assistance, and productivity. 
              Built with cutting-edge AI to understand context and provide accurate, helpful responses.
            </p>

            <div className="features-container">
              <p className="mutedhead">Core Capabilities</p>
              
              <div className="feature-grid">
                <div className="feature-col">
                  <p className="muted">• Instant AI-powered responses</p>
                  <p className="muted">• SQL query generation & optimization</p>
                  <p className="muted">• Code debugging & error explanation</p>
                  <p className="muted">• Multi-language programming support</p>
                </div>
                <div className="feature-col">
                  <p className="muted">• Document & conversation summarization</p>
                  <p className="muted">• Data analysis & insights generation</p>
                  <p className="muted">• Technical documentation assistance</p>
                  <p className="muted">• Natural language to code translation</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Abount;