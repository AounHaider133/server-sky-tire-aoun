const express = require("express");

const { contactFormSubmission } = require("../controllers/contactController");
const {
  contactValidation,
} = require("../middlewares/formValidation/contactFormValidation");

const router = express.Router();

router.route("/query/submit").post(contactValidation, contactFormSubmission);

module.exports = router;
