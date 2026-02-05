import React, { useState } from "react";
import { Link } from "react-router-dom";

function SideMenu({ status = "Online", onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <aside className="side-panel">
      <div className="side-section">
        <div className="status-row">
          <span className="status-name">Octopus_AI</span>
          <div className={`status-chip ${status.toLowerCase()}`}>{status}</div>
        </div>
      </div>

      <div className="side-menu">
        <button
          className="pill full-width"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <i className="fa-solid fa-bars"></i>
          Menu
        </button>
        {menuOpen && (
          <div className="menu-card">
            <Link className="icon-btn" to="/chat" aria-label="about">
              <i className="fa-solid fa-user-astronaut"></i>
              <span>Chat</span>
            </Link>

            <Link className="icon-btn" to="/about" aria-label="about">
              <i className="fa-solid fa-user-astronaut"></i>
              <span>About</span>
            </Link>

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
              onClick={onLogout}
              aria-label="Logout"
            >
              <i className="fa-solid fa-right-from-bracket"></i>
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

export default SideMenu;
