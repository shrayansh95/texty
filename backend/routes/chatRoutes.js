const express = require("express");

const chatControllers = require("../controllers/chatControllers");
const protect = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/", protect, chatControllers.accessChat);

router.get("/", protect, chatControllers.fetchChats);

router.post("/group", protect, chatControllers.createGroupChat);

router.put("/rename", protect, chatControllers.renameGroup);

router.put("/groupremove", protect, chatControllers.removeFromGroup);

router.put("/groupadd", protect, chatControllers.addToGroup);

module.exports = router;
