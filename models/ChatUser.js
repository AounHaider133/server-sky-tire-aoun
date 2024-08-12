const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  chatHistory: [
    {
      sender: String,
      text: String,
      response: { type: String, default: "" }, // Add response field
    },
  ],
});

const ChatUser = mongoose.model("ChatUser", UserSchema);
module.exports = ChatUser;
