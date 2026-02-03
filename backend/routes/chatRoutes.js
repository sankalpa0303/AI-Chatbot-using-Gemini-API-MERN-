const express = require("express");
const { chatWithGemini, getHistory } = require("../controllers/chatController");

const router = express.Router();

router.post("/", chatWithGemini);
router.get("/history", getHistory);

module.exports = router;
