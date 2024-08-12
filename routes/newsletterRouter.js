const express = require("express");

const {
  newsletterSignup,
  newsletterUnsubscribe,
} = require("../controllers/newsletterController");

const router = express.Router();

router.route("/newsletter/subscribe").post(newsletterSignup);
router.route("/newsletter/unsubscribe").post(newsletterUnsubscribe);

module.exports = router;
