const cron = require("node-cron");
const Order = require("../models/orderModel");

// Schedule a task to run every minute to clean up pending orders older than 30 mins
cron.schedule("* * * * *", async () => {
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

  const expiredOrders = await Order.find({
    paymentStatus: "pending",
    createdAt: { $lt: thirtyMinutesAgo },
  });

  for (const order of expiredOrders) {
    // Mark the order as cancelled
    order.paymentStatus = "cancelled";
    await order.save();
  }
});
