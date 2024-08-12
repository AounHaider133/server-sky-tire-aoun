const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const Order = require("../models/orderModel");
const { confirmOrder } = require("./orderController");
const catchAsyncError = require("../middlewares/catchAsyncErrors");

const verifySession = catchAsyncError(async (req, res) => {
  try {
    const { session_id } = req.query;

    if (!session_id) {
      return res
        .status(400)
        .send({ valid: false, error: "Session ID is required." });
    }

    let session;

    if (session_id.startsWith("affirm-")) {
      const regex = /^affirm-[0-9a-f]{20}$/;
      sessionValidationCheck = regex.test(session_id);
      if (sessionValidationCheck) {
        const order = await Order.findOneAndUpdate(
          { paymentSessionId: session_id },
          {
            paymentStatus: "paid",
          }
        );
        if (order) {
          session = true;
          const orderId = order._id;
          const userId = order.userId;
          const products = order.products;
          try {
            await confirmOrder({
              orderId,
              userId,
              products,
            });
          } catch (error) {
            res.status(500).send({ error: error.message });
          }
        } else {
          res.status(400).send({ error: "Order not found" });
        }
      }
    } else {
      const order = await Order.findOneAndUpdate(
        { paymentSessionId: session_id },
        { paymentStatus: "paid" }
      );

      if (order) {
        session = await stripe.checkout.sessions.retrieve(session_id);
        const orderId = order._id;
        const userId = order.userId;
        const products = order.products;

        try {
          await confirmOrder({
            orderId,
            userId,
            products,
          });
        } catch (error) {
          res.status(500).send({ error: error.message });
        }
      } else {
        res.status(400).send({ error: "Order not found" });
      }
    }

    if (session) {
      res.status(200).json({ valid: true });
    } else {
      res.status(400).json({ valid: false });
    }
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
});

module.exports = {
  verifySession,
};
