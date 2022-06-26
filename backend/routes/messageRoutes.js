const express = require("express");
const router = express.Router();
const protect = require("../middlewares/authMiddleware");
const messageController = require("../controllers/messageControllers");

router.post("/", protect, messageController.sendMessage);

router.get("/:chatId", protect, messageController.getMessage);

module.exports = router;
