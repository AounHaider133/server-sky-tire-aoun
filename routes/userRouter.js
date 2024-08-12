const express = require("express");

const {
  register,
  login,
  logout,
  getUserDetails,
  updatePassword,
  forgotPassword,
  resetPassword,
  updateUserDetails,
} = require("../controllers/userController");
const { isAuthenticated, authorizeRoles } = require("../middlewares/auth");
const {
  registerValidation,
  loginValidation,
  updatePasswordValidation,
  resetPasswordValidation,
  forgetPasswordEmailValidation,
  updateProfileValidation,
} = require("../middlewares/formValidation/authFormValidation");

const router = express.Router();

router.route("/register").post(registerValidation, register);
router.route("/login").post(loginValidation, login);
router.route("/logout").get(isAuthenticated, logout);
router.route("/me").get(isAuthenticated, getUserDetails);

router
  .route("/me/update")
  .put(isAuthenticated, updateProfileValidation, updateUserDetails);

router
  .route("/password/update")
  .put(isAuthenticated, updatePasswordValidation, updatePassword);

router
  .route("/password/reset")
  .post(forgetPasswordEmailValidation, forgotPassword);

router
  .route("/password/reset/:token")
  .post(resetPasswordValidation, resetPassword);

module.exports = router;
