const express = require("express");

const { getAllOrders, createOrder } = require("../controllers/orderController");
const { isAuthenticated, authorizeRoles } = require("../middlewares/auth");

const {
  createOrderValidation,
} = require("../middlewares/formValidation/orderFormValidation");

const router = express.Router();

router
  .route("/orders/all")
  .get(isAuthenticated, authorizeRoles("admin"), getAllOrders);

router
  .route("/order/new")
  .post(isAuthenticated, createOrderValidation, createOrder);

module.exports = router;
