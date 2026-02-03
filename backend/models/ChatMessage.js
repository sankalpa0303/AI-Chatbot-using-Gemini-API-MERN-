const mongoose = require('mongoose');

const ChatMessageSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    userMessage: { type: String, required: true, trim: true },
    botReply: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ChatMessage', ChatMessageSchema);
