const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
  {
    year: {
      type: String,
      required: true,
    },
    make: {
      type: String,
      required: true,
    },
    model: {
      type: String,
      required: true,
    },
    trim: {
      type: String,
      required: true,
    },
    tireSize: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vehicle", vehicleSchema);
