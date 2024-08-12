const express = require("express");

const {
  getYears,
  getMakesForYear,
  getModelsForMakeAndYear,
  getTrimsForModelsAndMakeAndYear,
  getTireSizesForTrimAndModelsAndMakeAndYear,
} = require("../controllers/vehicleController");

const router = express.Router();

router.route("/vehicles/years").get(getYears);
router.route("/vehicles/makes").get(getMakesForYear);
router.route("/vehicles/models").get(getModelsForMakeAndYear);
router.route("/vehicles/trims").get(getTrimsForModelsAndMakeAndYear);
router
  .route("/vehicles/tireSizes")
  .get(getTireSizesForTrimAndModelsAndMakeAndYear);

module.exports = router;
