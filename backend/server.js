const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const chatRoutes = require("./routes/chatRoutes");
const profileRoutes = require("./routes/profileRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/chat", chatRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/auth", authRoutes);

// Lightweight health endpoint to inspect Mongo status
app.get("/health", (_req, res) => {
  const state = mongoose.connection.readyState; // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  const mongo = state === 1 ? "connected" : state === 2 ? "connecting" : "disconnected";
  res.json({ mongo, readyState: state, hasUri: Boolean(MONGODB_URI) });
});

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

async function start() {
  try {
    if (!MONGODB_URI) {
      console.warn("MONGODB_URI not set — chat history persistence disabled");
    } else {
      await mongoose.connect(MONGODB_URI);
      console.log("MongoDB connected👽 ");
    }
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} 🤖`);
    });
  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  }
}

start();
