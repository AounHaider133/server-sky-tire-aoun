const express = require("express");

const {
  getAllWireWheelPackages,
  getWireWheelPackageByID,
} = require("../controllers/wireWheelPackageController");

const router = express.Router();

router.route("/wire-wheel-packages/all").get(getAllWireWheelPackages);
router.route("/wire-wheel-package/:packageId").get(getWireWheelPackageByID);

module.exports = router;
