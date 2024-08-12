const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const catchAsyncError = require("../middlewares/catchAsyncErrors");
const Coupon = require("../models/couponModel");
const Order = require("../models/orderModel");
const Product = require("../models/productModel");

const createCoupon = catchAsyncError(async (req, res) => {
  try {
    const coupon = new Coupon({
      code: req.body.code.toLowerCase(),
      discountType: req.body.discountType,
      discountValue: req.body.discountValue,
      appliesTo: req.body.appliesTo,
      productIds: req.body.productIds,
      brandIds: req.body.brandIds,
      minQuantity: req.body.minQuantity,
      usageLimit: req.body.usageLimit,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      active: req.body.active,
    });

    if (req.body.appliesTo === "overall") {
      if (req.body.discountType === "percentage") {
        await stripe.coupons.create({
          name: req.body.code.toLowerCase(),
          id: req.body.code.toLowerCase(),
          percent_off: req.body.discountValue,
          currency: "usd",
          duration: "forever",
          redeem_by: Math.floor(new Date(req.body.endDate).getTime() / 1000),
        });
      } else if (req.body.discountType === "fixed") {
        await stripe.coupons.create({
          name: req.body.code.toLowerCase(),
          id: req.body.code.toLowerCase(),
          amount_off: req.body.discountValue * 100,
          currency: "usd",
          duration: "forever",
          redeem_by: Math.floor(new Date(req.body.endDate).getTime() / 1000),
        });
      }
    }

    await coupon.save();
    res.status(200).json({
      message: "Coupon Created Successfully!",
    });
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
});

const getAllCoupons = catchAsyncError(async (req, res) => {
  try {
    let page = parseInt(req.query.page) || 1;
    let limit = 10;
    let skip = (page - 1) * limit;

    const coupons = await Coupon.find()
      .limit(limit)
      .skip(skip)
      .select("-createdAt -updatedAt -__v")
      .exec();

    const totalCoupons = await Coupon.countDocuments();
    const totalPages = Math.ceil(totalCoupons / limit);

    res.status(200).json({
      status: "success",
      data: coupons,
      total: totalCoupons,
      page,
      totalPages,
    });
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
});

const getCouponByID = catchAsyncError(async (req, res) => {
  try {
    const couponId = req.params.couponId;

    const coupon = await Coupon.findById(couponId)
      .select("-createdAt -updatedAt -__v")
      .exec();

    if (!coupon) {
      return res.status(404).json({
        status: "fail",
        message: "Coupon not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: coupon,
    });
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
});

const applyCouponToCart = catchAsyncError(async (req, res) => {
  try {
    const couponCode = req.body.couponCode.toLowerCase();
    const userCartItems = req.body.userCartItems;
    const userId = req.user._id;

    // Find the coupon by code
    const coupon = await Coupon.findOne({ code: couponCode });

    if (!coupon) {
      return res.status(404).json({
        status: "fail",
        message: "Coupon not found",
      });
    }

    // Check how many times the user has used the coupon
    const userOrdersWithCoupon = await Order.find({
      userId,
      couponCode,
      paymentStatus: "paid",
    });
    if (userOrdersWithCoupon.length >= coupon.usageLimit) {
      throw new Error(`Coupon usage limit reached`);
    }

    let userCartDetailedItems = [];

    const cartItemPromises = userCartItems.map(async (item) => {
      const product = await Product.findById(item.id)
        .populate(
          "brand",
          "-brandName -brandLogo -isFeatured -createdAt -updatedAt -__v"
        )
        .select(
          "-sku -brand -model -regularPrice -shippingCost -description -tireSize -tireWidth -aspectRatio -rimDiameter -rimRange -overallDiameter -season -performance -sidewall -vehicleType -treadDesign -rebateAvailable -threePMS -loadRange -loadIndex -speedRating -treadDepth -treadLife -utqg -runFlat -inflationPressure -tireWeight -shippingDimensions -plainSize -warranty -treadDepth -isFeatured -category -reviews -overallRating -createdAt -updatedAt -__v"
        )
        .exec();

      if (!product) {
        throw new Error(`Product with id ${item.id} not found`);
      }

      return product;
    });

    try {
      // Wait for all promises to resolve
      const resolvedItems = await Promise.all(cartItemPromises);

      userCartDetailedItems = resolvedItems.map((item) => {
        return {
          ...item.toObject(),
          image: item.images[0],
          images: undefined,
        };
      });
    } catch (error) {
      throw new Error(`${error.message}`);
    }

    userCartDetailedItems.forEach((item) => {
      item.discountedPrice = item.salePrice;
      Object.assign(item, {
        quantity:
          (userCartItems.find((i) => i.id == item._id) || {}).quantity || 0,
      });
    });

    const applicableItems = userCartDetailedItems.filter(
      (item) =>
        coupon.appliesTo === "all" ||
        (coupon.appliesTo === "specific_products" &&
          coupon.productIds.includes(item._id)) ||
        (coupon.appliesTo === "specific_brands" &&
          coupon.brandIds.includes(item.brand._id))
    );

    const totalApplicableQuantity = applicableItems.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    if (
      coupon.appliesTo !== "overall" &&
      applicableItems.length !== 0 &&
      totalApplicableQuantity < coupon.minQuantity
    ) {
      throw new Error(
        `Coupon not applicable. Minimum quantity required: ${coupon.minQuantity}`
      );
    }

    // Apply coupon to applicable items
    if (coupon.appliesTo === "overall") {
      const subTotal = parseFloat(
        userCartDetailedItems
          .reduce((sum, item) => sum + item.salePrice * item.quantity, 0)
          .toFixed(2)
      );

      let total;
      if (coupon.discountType === "percentage") {
        total = parseFloat(
          (subTotal * (1 - coupon.discountValue / 100)).toFixed(2)
        );
      } else if (coupon.discountType === "fixed") {
        total = parseFloat((subTotal - coupon.discountValue).toFixed(2));
      }

      res.status(200).json({
        status: "success",
        data: {
          cartItems: userCartDetailedItems,
          subTotal,
          total,
        },
      });
    } else {
      applicableItems.forEach((item) => {
        if (coupon.discountType === "percentage") {
          item.discountedPrice = parseFloat(
            (item.salePrice * (1 - coupon.discountValue / 100)).toFixed(2)
          );
        } else if (coupon.discountType === "fixed") {
          item.discountedPrice = parseFloat(
            (item.salePrice - coupon.discountValue).toFixed(2)
          );
        }
      });

      res.status(200).json({
        status: "success",
        data: {
          cartItems: userCartDetailedItems,
        },
      });
    }
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
});

const updateCouponDetails = catchAsyncError(async (req, res) => {
  try {
    const couponId = req.params.couponId;

    const coupon = await Coupon.findById(couponId);

    if (!coupon) {
      return res.status(404).json({ message: "Coupon Not Found!" });
    }

    coupon.code = req.body.code.toLowerCase();
    coupon.discountType = req.body.discountType;
    coupon.discountValue = req.body.discountValue;
    coupon.appliesTo = req.body.appliesTo;
    coupon.productIds = req.body.productIds;
    coupon.brandIds = req.body.brandIds;
    coupon.minQuantity = req.body.minQuantity;
    coupon.usageLimit = req.body.usageLimit;
    coupon.startDate = req.body.startDate;
    coupon.endDate = req.body.endDate;
    coupon.active = req.body.active;

    await coupon.save();

    res.status(200).json({ message: "Coupon details updated successfully" });
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
});

const deleteCoupon = catchAsyncError(async (req, res) => {
  try {
    const couponId = req.params.couponId;
    const coupon = await Coupon.findById(couponId);

    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    await coupon.deleteOne();

    res.status(200).json({ message: "Coupon deleted successfully" });
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
});

module.exports = {
  createCoupon,
  getAllCoupons,
  getCouponByID,
  applyCouponToCart,
  updateCouponDetails,
  deleteCoupon,
};
