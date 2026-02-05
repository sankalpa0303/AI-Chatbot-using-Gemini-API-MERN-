import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import BackgroundCanvas from "./BackgroundCanvas";
import { useAuth } from "../context/AuthContext";
import SideMenu from "./SideMenu";

import "./setting.css";

const defaultSettings = {
  apiKey: "",
  theme: "system",
  compact: false,
  notifications: true,
  accent: "coral",
};

function Settings() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [form, setForm] = useState(defaultSettings);
  const [status, setStatus] = useState("");

  const accentDisplay = useMemo(() => {
    switch (form.accent) {
      case "amber":
        return "Sunrise";
      case "violet":
        return "Iris";
      default:
        return "Coral";
    }
  }, [form.accent]);

  const handleToggle = (key) => {
    setForm((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleTheme = (theme) => setForm((prev) => ({ ...prev, theme }));
  const handleAccent = (accent) => setForm((prev) => ({ ...prev, accent }));

  const handleSave = () => {
    setStatus("Settings saved locally");
    setTimeout(() => setStatus(""), 1800);
  };

  const handleReset = () => {
    setForm(defaultSettings);
    setStatus("Reset to defaults");
    setTimeout(() => setStatus(""), 1800);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="chat-page">
      <BackgroundCanvas />
      <div className="chat-layout">
        <SideMenu status="Online" onLogout={handleLogout} />

        <div className="settings-shell">
          <header className="settings-header">
            <div className="settings-title">
              <div className="badge">Octopus AI</div>
              <h1>Settings</h1>
              <p>Personalize your chat workspace.</p>
            </div>
            <div className="settings-actions">
              <button className="ghost" onClick={() => navigate(-1)} aria-label="Back">
                Back
              </button>
              <button className="primary" onClick={handleSave} aria-label="Save settings">
                Save Changes
              </button>
            </div>
          </header>

          <div className="settings-grid">
            <section className="card">
              <div className="card-head">
                <div>
                  <h3>API Key</h3>
                  <p>Store locally; not sent to the server.</p>
                </div>
                <button className="ghost" onClick={handleReset}>Reset</button>
              </div>
              <div className="field">
                <label htmlFor="apiKey">Key</label>
                <input
                  id="apiKey"
                  type="password"
                  placeholder="sk-..."
                  value={form.apiKey}
                  onChange={(e) => setForm((prev) => ({ ...prev, apiKey: e.target.value }))}
                />
              </div>
              <p className="note">We never send this key to our servers.</p>
            </section>

            <section className="card">
              <div className="card-head">
                <h3>Appearance</h3>
                <span className="chip">{form.theme}</span>
              </div>
              <div className="segmented">
                {[
                  { key: "light", label: "Light" },
                  { key: "dark", label: "Dark" },
                  { key: "system", label: "System" },
                ].map((item) => (
                  <button
                    key={item.key}
                    className={form.theme === item.key ? "segment active" : "segment"}
                    onClick={() => handleTheme(item.key)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="accent-row">
                <div className="accent-label">
                  <p>Accent</p>
                  <small>{accentDisplay}</small>
                </div>
                <div className="accent-dots">
                  {["coral", "amber", "violet"].map((color) => (
                    <button
                      key={color}
                      className={`accent-dot ${color} ${form.accent === color ? "active" : ""}`}
                      onClick={() => handleAccent(color)}
                      aria-label={`Set accent ${color}`}
                    ></button>
                  ))}
                </div>
              </div>
            </section>

            <section className="card">
              <div className="card-head">
                <h3>Preferences</h3>
              </div>
              <div className="toggle-row">
                <div>
                  <p>Notifications</p>
                  <small>Get alerts when responses arrive.</small>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={form.notifications}
                    onChange={() => handleToggle("notifications")}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="toggle-row">
                <div>
                  <p>Compact mode</p>
                  <small>Tighter spacing for dense chats.</small>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={form.compact}
                    onChange={() => handleToggle("compact")}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            </section>
          </div>

          {status && <div className="status-toast">{status}</div>}
        </div>
      </div>
    </div>
  );
}

export default Settings;