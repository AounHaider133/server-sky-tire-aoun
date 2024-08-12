const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new mongoose.Schema(
  {
    sku: {
      type: String,
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    brand: { type: Schema.Types.ObjectId, ref: "Brand" },
    model: {
      type: String,
      required: true,
    },
    salePrice: {
      type: Number,
      required: true,
      min: 1,
    },
    regularPrice: {
      type: Number,
      required: true,
      min: 1,
    },
    shippingCost: {
      type: Number,
      required: true,
      min: 0,
    },
    images: {
      type: [String],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
    },
    tireSize: {
      type: String,
      required: true,
    },
    tireWidth: {
      type: String,
      required: true,
    },
    aspectRatio: {
      type: String,
      required: true,
    },
    rimDiameter: {
      type: String,
      required: true,
    },
    rimRange: {
      type: String,
      required: true,
    },
    overallDiameter: {
      type: String,
      required: true,
    },
    season: {
      type: String,
      enum: ["All Season", "All Weather", "Summer", "Winter"],
      required: true,
    },
    performance: {
      type: String,
      enum: [
        "All Terrain",
        "Extreme Terrain",
        "High Performance",
        "Highway",
        "Mud Terrain",
        "Performance",
        "Rugged Terrain",
        "Touring",
      ],
      required: true,
    },
    sidewall: {
      type: String,
      required: true,
    },
    vehicleType: {
      type: String,
      enum: [
        "Commercial",
        "Light Truck",
        "Passenger",
        "Racing",
        "Trailer",
        "Truck/SUV",
      ],
      required: true,
    },
    treadDesign: {
      type: String,
      required: true,
    },
    rebateAvailable: {
      type: Boolean,
      default: false,
      required: true,
    },
    threePMS: {
      type: Boolean,
      default: false,
      required: true,
    },
    loadRange: {
      type: String,
      required: true,
    },
    loadIndex: {
      type: String,
      required: true,
    },
    speedRating: {
      type: String,
      required: true,
    },
    treadDepth: {
      type: String,
      required: true,
    },
    treadLife: {
      type: String,
      required: true,
    },
    utqg: {
      type: String,
      required: true,
    },
    runFlat: {
      type: Boolean,
      default: false,
      required: true,
    },
    inflationPressure: {
      type: String,
      required: true,
    },
    tireWeight: {
      type: String,
      required: true,
    },
    shippingDimensions: {
      type: String,
      required: true,
    },
    plainSize: {
      type: String,
      required: true,
    },
    warranty: {
      type: String,
      required: true,
    },
    treadDepth: {
      type: String,
      required: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }],
    overallRating: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Pre-save hook to calculate overall rating based on reviews
productSchema.pre("save", async function (next) {
  const reviews = await this.model("Review").find({
    _id: { $in: this.reviews },
  });
  let totalRating = 0;
  reviews.forEach((review) => {
    totalRating += review.rating;
  });
  if (reviews.length > 0) {
    this.overallRating = totalRating / reviews.length;
  } else {
    this.overallRating = 0; // No reviews yet
  }
  next();
});

module.exports = mongoose.model("Product", productSchema);
