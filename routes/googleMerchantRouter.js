const express = require("express");

const {
  getGoogleMerchantProducts,
  syncAllProducts,
  deleteAllGoogleMerchantProducts,
} = require("../controllers/googleMerchantController");

const router = express.Router();

router.route("/google-merchant/products/all").get(getGoogleMerchantProducts);
router.route("/google-merchant/sync/all").get(syncAllProducts);
router
  .route("/google-merchant/delete/all")
  .get(deleteAllGoogleMerchantProducts);

module.exports = router;
