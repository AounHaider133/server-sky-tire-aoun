const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const wireWheelPackageSchema = new mongoose.Schema(
  {
    itemID: {
      type: String,
      required: true,
    },
    size: {
      type: String,
      required: true,
    },
    offset: {
      type: String,
      required: true,
    },
    spoke: {
      type: Number,
      required: true,
      min: 1,
    },
    spokeStyle: {
      type: String,
      required: true,
    },
    finish: {
      type: String,
      required: true,
    },
    backSpacing: {
      type: String,
      required: true,
    },
    boltPattern: {
      type: String,
      required: true,
    },
    accessories: {
      type: String,
      required: true,
    },
    knockOffOptions: {
      type: String,
      required: true,
    },
    countryOfOrigin: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 1,
    },
    image: {
      type: String,
      required: true,
    },
    stock: { type: Number, required: true, min: 0 },
    isFeatured: {
      type: Boolean,
      default: false,
      required: true,
    },
    shortDescription: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }],
    overallRating: {
      type: Number,
      default: 0, // Default value for overall rating
    },
  },
  { timestamps: true }
);

// Pre-save hook to calculate overall rating based on reviews
wireWheelPackageSchema.pre("save", async function (next) {
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

module.exports = mongoose.model("WireWheelPackage", wireWheelPackageSchema);
