const express = require("express");
const router = express.Router();
const ChatUser = require("../models/ChatUser");
const PredefinedResponse = require("../models/PredefinedResponse");

// Store user credentials
router.post("/store-user", async (req, res) => {
  const { email, phone } = req.body;

  try {
    let user = await ChatUser.findOne({ email });
    if (!user) {
      user = new ChatUser({ email, phone });
      await user.save();
    }
    res.status(200).json({ message: "User stored successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to store user" });
  }
});

// Insert hardcoded response
router.post("/add-response", async (req, res) => {
  const { type, response } = req.body;

  if (!type || !response) {
    return res.status(400).json({ message: "Type and response are required" });
  }

  try {
    const newResponse = new PredefinedResponse({ type, response });
    await newResponse.save();
    res.status(201).json({ message: "Predefined response added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get user chat history
router.get("/get-history/:email", async (req, res) => {
  const { email } = req.params;

  try {
    const user = await ChatUser.findOne({ email });
    if (user && user.chatHistory.length > 0) {
      res.status(200).json(user.chatHistory);
    } else {
      res.status(200).json([]);
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch chat history" });
  }
});

// Get predefined response
router.get("/get-response/:type", async (req, res) => {
  const { type } = req.params;

  try {
    const response = await PredefinedResponse.findOne({ type });
    if (response) {
      res.status(200).json(response.response);
    } else {
      res.status(404).json({ error: "Response not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch response" });
  }
});

// Function to determine response type
const determineResponseType = (msg) => {
  const greetings = ["hello", "hi", "hey"];
  const lowerMsg = msg.toLowerCase();

  if (greetings.some((greeting) => lowerMsg.includes(greeting))) {
    return "greeting";
  } else if (msg.includes("offline")) {
    return "default";
  } else {
    return "error";
  }
};

// Route to get response based on message
router.post("/put-response/:msg", async (req, res) => {
  const { msg } = req.params;

  try {
    // Determine the response type
    const responseType = determineResponseType(msg);

    // Try to find predefined response
    const response = await PredefinedResponse.findOne({ type: responseType });
    if (response) {
      res.status(200).json({ response: response.response });
    } else {
      // Optionally, handle cases where response is not found
      res.status(404).json({ error: "Response not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch response" });
  }
});

// Store user query and bot response in chat history
router.post("/store-query", async (req, res) => {
  const { email, message, response } = req.body;

  try {
    const user = await ChatUser.findOneAndUpdate(
      { email },
      {
        $push: {
          chatHistory: { sender: "user", text: message, response: response },
        },
      },
      { new: true }
    );
    if (user) {
      res
        .status(200)
        .json({ message: "Query and response stored successfully" });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to store query and response" });
  }
});

module.exports = router;
