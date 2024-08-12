// models/PredefinedResponse.js
const mongoose = require("mongoose");

const PredefinedResponseSchema = new mongoose.Schema({
  type: { type: String, required: true, unique: true },
  response: { type: String, required: true },
});

const PredefinedResponse = mongoose.model(
  "PredefinedResponse",
  PredefinedResponseSchema
);
module.exports = PredefinedResponse;
