const asyncHandler = require("express-async-handler");
const Chat = require("../models/chatModel");

exports.accessChat = asyncHandler(async (req, res, next) => {
  const { userId } = req.body;
  if (!userId) {
    console.log("UserId param not sent with request");
    return res.status(400);
  }

  let isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate({
      path: "latestMessage",
      populate: {
        path: "sender",
      },
    });

  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    let chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };

    try {
      const createdChat = await Chat.create(chatData);
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
      res.status(200).send(FullChat);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }
});

exports.fetchChats = asyncHandler(async (req, res, next) => {
  try {
    Chat.find({
      users: {
        $elemMatch: { $eq: req.user._id },
      },
    })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate({
        path: "latestMessage",
        populate: {
          path: "sender",
          select: "-password",
        },
      })
      .sort({ updatedAt: -1 })
      .then((results) => res.status(200).send(results));
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

exports.createGroupChat = asyncHandler(async (req, res, next) => {
  if (!req.body.users || !req.body.name) {
    return req.status(400).send({ message: "Please Fill all the fields" });
  }
  let users = JSON.parse(req.body.users);
  if (users.length < 2) {
    return res
      .status(400)
      .send("More than 2 users are required to form a group chat");
  }
  users.push(req.user);
  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user._id,
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(fullGroupChat);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

exports.renameGroup = asyncHandler(async (req, res, next) => {
  const { chatId, chatName } = req.body;
  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      chatName,
    },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");
  if (!updatedChat) {
    res.status(404);
    throw new Error("Chat not Found");
  } else {
    res.status(200).json(updatedChat);
  }
});

exports.removeFromGroup = asyncHandler(async (req, res, next) => {
  const { chatId, userId } = req.body;
  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      $pull: { users: userId },
    },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");
  if (!updatedChat) {
    res.status(404);
    throw new Error("Chat not Found");
  } else {
    res.status(200).json(updatedChat);
  }
});

exports.addToGroup = asyncHandler(async (req, res, next) => {
  const { chatId, userId } = req.body;
  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      $push: { users: userId },
    },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");
  if (!updatedChat) {
    res.status(404);
    throw new Error("Chat not Found");
  } else {
    res.status(200).json(updatedChat);
  }
});
