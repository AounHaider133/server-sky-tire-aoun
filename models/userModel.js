const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Please enter an email"],
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please enter a valid email address",
      ],
      unique: true,
    },
    username: {
      type: String,
      required: [true, "Please enter a username"],
      unique: true,
    },
    phone: {
      type: String,
      required: [true, "Please enter a phone number"],
    },
    role: {
      type: String,
      default: "user",
      enum: ["user", "admin"],
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpire: {
      type: Date,
    },
    token: String,
    tokenExpire: Date,
  },
  {
    timestamps: true,
  }
);

// JWT TOKEN
userSchema.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

userSchema.methods.getToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");
  this.token = crypto.createHash("sha256").update(resetToken).digest("hex");
  this.tokenExpire = Date.now() + 15 * 60 * 1000;
  return resetToken;
};

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
