import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function History() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [openIds, setOpenIds] = useState(new Set());
  const [confirmIdx, setConfirmIdx] = useState(null);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
  }, [token, navigate]);

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      try {
        setLoading(true);
        setError("");
        const res = await fetch(`${API_URL}/api/chat/history`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Failed to load history");
        const data = await res.json();
        const history = Array.isArray(data.history) ? data.history : [];
        setItems(history);
      } catch (err) {
        setError(err.message || "Unable to load history");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  const toggleOpen = (id) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDelete = async (idx) => {
    const entry = items[idx];
    const payload =
      typeof entry === "object"
        ? {
            id: entry._id || entry.id,
            message: entry.question || entry.message || entry.text || entry.reply,
          }
        : { message: entry };
    try {
      setBusyId(idx);
      const res = await fetch(`${API_URL}/api/chat/history`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Delete failed");
      setItems((prev) => prev.filter((_, i) => i !== idx));
    } catch (err) {
      setError(err.message || "Delete failed");
    } finally {
      setBusyId(null);
    }
  };

  const openConfirm = (idx) => setConfirmIdx(idx);
  const closeConfirm = () => setConfirmIdx(null);
  const confirmDelete = () => {
    if (confirmIdx === null) return;
    handleDelete(confirmIdx);
    setConfirmIdx(null);
  };

  return (
    <div className="history-page">
      <div className="history-shell">
        <div className="history-head">
          <div>
            <p className="eyebrow">Chat Archive</p>
            <h1 className="history-title">Previous messages and answers</h1>
          </div>
          <div className="history-actions">
            <Link className="pill" to="/chat">Back to chat</Link>
          </div>
        </div>

        {loading && <div className="history-status">Loading...</div>}
        {error && <div className="history-status error">{error}</div>}

        {!loading && !error && items.length === 0 && (
          <div className="history-status">No history found.</div>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="history-list-full">
            {items.map((entry, idx) => {
              const question = typeof entry === "string" ? entry : entry.question || entry.message || "(no question)";
              const answer = typeof entry === "object" ? (entry.answer || entry.response || entry.reply) : null;
              const id = entry._id || entry.id || idx;
              return (
                <div key={id} className="history-card">
                  <div className="history-q">
                    <span className="badge">Q</span>
                    <p>{question}</p>
                  </div>
                  {answer && (
                    <>
                      <div className="history-actions">
                        <button
                          className="icon-btn icon-sm"
                          onClick={() => toggleOpen(id)}
                        >
                          {openIds.has(id) ? "Hide answer" : "Show answer"}
                        </button>
                        <button
                          className="icon-btn icon-sm"
                          onClick={() => openConfirm(idx)}
                          disabled={busyId === idx}
                        >
                          {busyId === idx ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                      {openIds.has(id) && (
                        <div className="history-a">
                          <span className="badge">A</span>
                          <p>{answer}</p>
                        </div>
                      )}
                    </>
                  )}
                  {!answer && (
                    <div className="history-actions">
                      <button
                        className="icon-btn icon-sm"
                        onClick={() => openConfirm(idx)}
                        disabled={busyId === idx}
                      >
                        {busyId === idx ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {confirmIdx !== null && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h3>Delete this entry?</h3>
            <p className="muted">This will remove the saved chat from your history.</p>
            <div className="modal-actions">
              <button className="pill pill-ghost" onClick={closeConfirm}>Cancel</button>
              <button className="pill" onClick={confirmDelete} disabled={busyId === confirmIdx}>
                {busyId === confirmIdx ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default History;
