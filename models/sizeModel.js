const mongoose = require("mongoose");

const sizeSchema = new mongoose.Schema(
  {
    width: {
      type: String,
      required: true,
    },
    aspectRatio: {
      type: String,
      required: true,
    },
    diameter: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Size", sizeSchema);
