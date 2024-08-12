const express = require("express");

const {
  getWidth,
  getAspectRatioForWidth,
  getDiameterForAspectRatioAndWidth,
} = require("../controllers/sizeController");

const router = express.Router();

router.route("/sizes/width").get(getWidth);
router.route("/sizes/aspect-ratio").get(getAspectRatioForWidth);
router.route("/sizes/diameter").get(getDiameterForAspectRatioAndWidth);

module.exports = router;
