const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const Chat = require("../models/chatModel");

exports.sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId } = req.body;
  if (!content || !chatId) {
    return res.sendStatus(400);
  }
  const newMessage = {
    sender: req.user._id,
    content,
    chat: chatId,
  };
  try {
    let message = await Message.create(newMessage);
    message = await message.populate([
      { path: "sender", select: "name image" },
      { path: "chat", populate: { path: "users", select: "name image email" } },
    ]);
    await Chat.findByIdAndUpdate(chatId, {
      latestMessage: message,
    });
    res.status(200).json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

exports.getMessage = asyncHandler(async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId }).populate([
      { path: "sender", select: "name image email" },
      { path: "chat" },
    ]);
    res.status(200).json(messages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});
