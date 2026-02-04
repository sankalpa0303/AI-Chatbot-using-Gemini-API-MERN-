const axios = require("axios");
const ChatMessage = require("../models/ChatMessage");

// Allow selecting API version and model via env. Default to v1beta and a confirmed available model (gemini-2.5-flash).
const GEMINI_API_VERSION = process.env.GEMINI_API_VERSION || "v1beta";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const buildUrl = () => {
  const base = GEMINI_API_VERSION === "v1beta"
    ? "https://generativelanguage.googleapis.com/v1beta"
    : "https://generativelanguage.googleapis.com/v1";
  return `${base}/models/${GEMINI_MODEL}:generateContent`;
};

exports.chatWithGemini = async (req, res) => {
  const { message } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "Missing GEMINI_API_KEY" });
  }

  if (!message || !message.trim()) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    const url = buildUrl();

    const response = await axios.post(
      url,
      {
        contents: [
          {
            parts: [{ text: message.trim() }]
          }
        ]
      },
      {
        params: { key: apiKey },
        headers: { "Content-Type": "application/json" }
      }
    );

    const reply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "(no reply)";

    // Persist user/bot exchange if DB is connected
    try {
      if (ChatMessage.db?.readyState === 1) {
        await ChatMessage.create({ userId: req.userId, userMessage: message.trim(), botReply: reply });
      }
    } catch (dbErr) {
      console.warn("Chat history save skipped", dbErr.message);
    }

    return res.json({ reply });
  } catch (error) {
    const status = error.response?.status || 500;
    const apiMessage = error.response?.data?.error?.message || error.message || "Gemini API failed";
    console.error("Gemini API error", status, apiMessage, error.response?.data);
    return res.status(status).json({ error: apiMessage });
  }
};

exports.getHistory = async (req, res) => {
  try {
    if (ChatMessage.db?.readyState !== 1 || !req.userId) {
      return res.json({ history: [] });
    }

    const items = await ChatMessage.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(25)
      .lean();

    const history = items.map((item) => ({
      id: item._id,
      question: item.userMessage,
      answer: item.botReply,
      createdAt: item.createdAt,
    }));
    return res.json({ history });
  } catch (error) {
    console.error("History fetch failed", error);
    return res.status(500).json({ error: "Failed to fetch history" });
  }
};

exports.deleteHistory = async (req, res) => {
  try {
    if (ChatMessage.db?.readyState !== 1 || !req.userId) {
      return res.status(200).json({ success: true });
    }

    const { id, message } = req.body || {};

    if (!id && !message) {
      return res.status(400).json({ error: "id or message is required" });
    }

    const query = { userId: req.userId };
    if (id) {
      query._id = id;
    } else if (message) {
      query.userMessage = message;
    }

    const deleted = await ChatMessage.findOneAndDelete(query);

    if (!deleted) {
      return res.status(404).json({ error: "Entry not found" });
    }

    return res.json({ success: true });
  } catch (error) {
    console.error("History delete failed", error);
    return res.status(500).json({ error: "Failed to delete history" });
  }
};
