const express = require("express");
const { chatWithGemini, getHistory, deleteHistory } = require("../controllers/chatController");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/", auth, chatWithGemini);
router.get("/history", auth, getHistory);
router.delete("/history", auth, deleteHistory);

module.exports = router;
