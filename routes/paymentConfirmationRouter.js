const express = require("express");

const {
  verifySession,
} = require("../controllers/paymentConfirmationController");
const { isAuthenticated } = require("../middlewares/auth");

const router = express.Router();

router.route("/session/verify").get(isAuthenticated, verifySession);

module.exports = router;
