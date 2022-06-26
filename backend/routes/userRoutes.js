const express = require("express");

const router = express.Router();
const userControllers = require("../controllers/userControllers");
const protect = require("../middlewares/authMiddleware");

router.get("/", protect, userControllers.allUsers);

router.post("/", userControllers.registerUser);

router.post("/login", userControllers.authUser);

module.exports = router;
