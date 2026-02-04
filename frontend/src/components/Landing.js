import React from 'react';
import { Link } from 'react-router-dom';
import BackgroundCanvas from './BackgroundCanvas';
import octoLogo from './octo1.png';
import './Auth.css';

function Landing() {
  return (
    <div className="auth-page">
      <BackgroundCanvas />

      <div className="auth-hero">
        <div>
          <div className="hero-brand">
            <div>
              <h1 className="hero-title">
                <span className="hero-accent">OCTOPUS AI</span>, your data-aware assistant
              </h1>
            </div>
          </div>

          <p className="muted">
            Chat, analyze, and manage your profile with a single, modern interface.
          </p>

          <div className="cta-row">
            <Link className="primary" to="/login">Sign In</Link>
            <Link className="ghost" to="/register">Sign Up</Link>
          </div>
        </div>

        {/* Large landing logo without video */}
        <img
          className="landing-logo"
          src={octoLogo}
          alt="Octopus AI logo"
        />
      </div>
    </div>
  );
}

export default Landing;
