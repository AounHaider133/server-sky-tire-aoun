const express = require("express");

const {
  createCoupon,
  getAllCoupons,
  getCouponByID,
  applyCouponToCart,
  updateCouponDetails,
  deleteCoupon,
} = require("../controllers/couponController");
const { isAuthenticated, authorizeRoles } = require("../middlewares/auth");
const {
  addCouponValidation,
  editCouponValidation,
} = require("../middlewares/formValidation/couponFormValidation");

const router = express.Router();

router
  .route("/coupon/add")
  .post(
    isAuthenticated,
    authorizeRoles("admin"),
    addCouponValidation,
    createCoupon
  );

router
  .route("/coupons/all")
  .get(isAuthenticated, authorizeRoles("admin"), getAllCoupons);

router
  .route("/coupon-details/:couponId")
  .get(isAuthenticated, authorizeRoles("admin"), getCouponByID);

router.route("/coupon/apply").post(isAuthenticated, applyCouponToCart);

router
  .route("/coupon/update/:couponId")
  .put(
    isAuthenticated,
    authorizeRoles("admin"),
    editCouponValidation,
    updateCouponDetails
  );

router
  .route("/coupon/delete/:couponId")
  .delete(isAuthenticated, authorizeRoles("admin"), deleteCoupon);

module.exports = router;
