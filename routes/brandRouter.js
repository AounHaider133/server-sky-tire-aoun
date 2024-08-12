const express = require("express");

const {
  addBrand,
  getAllBrands,
  getBrandByID,
  getAllBrandsWithoutPagination,
  getFeaturedBrands,
  getNonFeaturedBrands,
  getAllBrandsWithProductCount,
  getAllBrandsWithProductCountWithoutPagination,
  getFeaturedBrandsWithProductCount,
  getNonFeaturedBrandsWithProductCount,
} = require("../controllers/brandController");
const { isAuthenticated, authorizeRoles } = require("../middlewares/auth");
const upload = require("../utils/multerConfig");
const {
  addBrandValidation,
} = require("../middlewares/formValidation/brandFormValidation");

const router = express.Router();

router
  .route("/brand/add")
  .post(
    isAuthenticated,
    authorizeRoles("admin"),
    upload.array("brandLogo", 1),
    addBrandValidation,
    addBrand
  );

router.route("/brands/all").get(getAllBrands);
router.route("/brand/:brandId").get(getBrandByID);
router.route("/brands/all/list").get(getAllBrandsWithoutPagination);
router.route("/brands/all/count").get(getAllBrandsWithProductCount);
router
  .route("/brands/all/count/list")
  .get(getAllBrandsWithProductCountWithoutPagination);
router.route("/brands/featured").get(getFeaturedBrands);
router.route("/brands/featured/count").get(getFeaturedBrandsWithProductCount);
router.route("/brands/non-featured").get(getNonFeaturedBrands);
router
  .route("/brands/non-featured/count")
  .get(getNonFeaturedBrandsWithProductCount);

module.exports = router;
