const express = require("express");

const {
  addProduct,
  getAllProducts,
  getWhiteWallProducts,
  getProductByID,
  getProductsByBrand,
  getProductsBySearch,
  getRelatedProducts,
  getFeaturedProducts,
} = require("../controllers/productController");
const { isAuthenticated, authorizeRoles } = require("../middlewares/auth");
const upload = require("../utils/multerConfig");

const {
  addProductValidation,
} = require("../middlewares/formValidation/productFormValidation");

const router = express.Router();

router
  .route("/product/add")
  .post(
    isAuthenticated,
    authorizeRoles("admin"),
    upload.array("image", 1),
    addProductValidation,
    addProduct
  );
router.route("/products/all").get(getAllProducts);
router.route("/products/white-wall").get(getWhiteWallProducts);
router.route("/product/:productId").get(getProductByID);
router.route("/products/brand").get(getProductsByBrand);
router.route("/products/search").get(getProductsBySearch);
router.route("/products/related").get(getRelatedProducts);
router.route("/products/featured").get(getFeaturedProducts);

module.exports = router;
