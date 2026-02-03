const axios = require("axios");

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
    return res.json({ reply });
  } catch (error) {
    const status = error.response?.status || 500;
    const apiMessage = error.response?.data?.error?.message || error.message || "Gemini API failed";
    console.error("Gemini API error", status, apiMessage, error.response?.data);
    return res.status(status).json({ error: apiMessage });
  }
};
