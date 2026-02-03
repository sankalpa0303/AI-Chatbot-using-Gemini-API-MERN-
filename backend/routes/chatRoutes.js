const express = require("express");
const { chatWithGemini, getHistory } = require("../controllers/chatController");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/", auth, chatWithGemini);
router.get("/history", auth, getHistory);

module.exports = router;
