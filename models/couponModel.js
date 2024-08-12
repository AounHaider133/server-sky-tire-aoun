const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
    },
    appliesTo: {
      type: String,
      enum: ["all", "specific_products", "specific_brands", "overall"],
      required: true,
    },
    productIds: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Product",
    },
    brandIds: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Brand",
    },
    minQuantity: {
      type: Number,
      required: true,
      default: 1,
    },
    usageLimit: {
      type: Number,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Coupon", couponSchema);
