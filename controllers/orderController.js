const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const catchAsyncError = require("../middlewares/catchAsyncErrors");
const Order = require("../models/orderModel");
const User = require("../models/userModel");
const Product = require("../models/productModel");
const Brand = require("../models/brandModel");
const Coupon = require("../models/couponModel");

const sendEmail = require("../utils/sendEmail");
const { orderConfirmationEmailMessage } = require("../utils/emailMessage");

const createOrder = catchAsyncError(async (req, res, next) => {
  try {
    const user = req.user;
    const products = req.body.products;
    const values = req.body.values;
    const couponCode = req.body.couponCode
      ? req.body.couponCode.toLowerCase()
      : null;

    if (!products || products.length === 0) {
      return res
        .status(400)
        .send({ error: "Products are required to create an order." });
    }

    if (!values) {
      return res
        .status(400)
        .send({ error: "Form data is required to create an order." });
    }

    // let discountPercentage = 0;

    let coupon = null;

    if (couponCode) {
      coupon = await Coupon.findOne({
        code: couponCode,
        active: true,
        endDate: { $gte: new Date() },
      });

      if (coupon) {
        const userOrdersWithCoupon = await Order.find({
          userId: user._id,
          couponCode,
          paymentStatus: "paid",
        });

        // let discountValue = 0;
        // let discountType = null;
        // let appliesTo = null;

        if (userOrdersWithCoupon.length >= coupon.usageLimit) {
          return res.status(400).send({
            error: `Coupon code can only be used ${coupon.usageLimit} times per user.`,
          });
        }

        // discountType = coupon.discountType;
        // discountValue = coupon.discountValue;
        // appliesTo = coupon.appliesTo;

        //discountPercentage = coupon.discountPercentage;
      } else {
        return res
          .status(400)
          .send({ error: "Invalid or expired coupon code." });
      }
    }

    // Calculate total amount of the order and initialize line items array
    let totalAmount = 0;
    const lineItems = [];

    if (values.paymentMethod === "card") {
      await Promise.all(
        products.map(async (product) => {
          const item = await Product.findById(product.id)
            .populate(
              "brand",
              "-brandName -brandLogo -isFeatured -createdAt -updatedAt -__v"
            )
            .select(
              "-sku -brand -model -images -regularPrice -shippingCost -description -tireSize -tireWidth -aspectRatio -rimDiameter -rimRange -overallDiameter -season -performance -sidewall -vehicleType -treadDesign -rebateAvailable -threePMS -loadRange -loadIndex -speedRating -treadDepth -treadLife -utqg -runFlat -inflationPressure -tireWeight -shippingDimensions -plainSize -warranty -treadDepth -isFeatured -category -reviews -overallRating -createdAt -updatedAt -__v"
            )
            .exec();

          // Check if product exists
          if (!item) {
            return res.status(400).send({ error: "Product not found" });
          }

          // Check stock availability
          if (item.stock < product.quantity) {
            return res
              .status(400)
              .send({ error: "Insufficient stock for product" });
          }

          let productAmount = item.salePrice;

          if (couponCode && coupon) {
            if (
              coupon.appliesTo === "all" ||
              (coupon.appliesTo === "specific_products" &&
                coupon.productIds.includes(item._id)) ||
              (coupon.appliesTo === "specific_brands" &&
                coupon.brandIds.includes(item.brand._id))
            ) {
              if (
                coupon.appliesTo !== "overall" &&
                product.quantity < coupon.minQuantity
              ) {
                throw new Error(
                  `Coupon not applicable. Minimum quantity required: ${coupon.minQuantity}`
                );
              }

              if (coupon.discountType === "percentage") {
                productAmount = parseFloat(
                  (item.salePrice * (1 - coupon.discountValue / 100)).toFixed(2)
                );
              } else if (coupon.discountType === "fixed") {
                productAmount = parseFloat(
                  (item.salePrice - coupon.discountValue).toFixed(2)
                );
              }
            }
          }

          totalAmount += productAmount * product.quantity;

          productAmount *= 100; // Convert to cents

          // Prepare line item for current product
          const lineItem = {
            price_data: {
              currency: "usd",
              product_data: {
                name: item.productName,
              },
              unit_amount: productAmount,
            },
            quantity: product.quantity,
          };

          lineItems.push(lineItem);

          // Add tire recycling fee if shipping address state is California
          if (
            values.shippingAddress.state.toLowerCase() === "california" ||
            values.shippingAddress.state.toLowerCase() === "ca"
          ) {
            const tireRecyclingFee = Math.round(item.salePrice * 100 * 0.0175); // 1.75% tire recycling fee

            // Create a separate line item for tire recycling fee
            lineItems.push({
              price_data: {
                currency: "usd",
                product_data: {
                  name: "Tire Recycling Fee",
                },
                unit_amount: tireRecyclingFee,
              },
              quantity: product.quantity,
            });
          }
        })
      );

      // Calculate overall sales tax if shipping address state is California
      let salesTax = 0;
      if (
        values.shippingAddress.state.toLowerCase() === "california" ||
        values.shippingAddress.state.toLowerCase() === "ca"
      ) {
        const SALES_TAX_RATE = 0.0875; // 8.75% overall sales tax
        salesTax = Math.round(totalAmount * 100 * SALES_TAX_RATE);

        // Add sales tax as a separate line item
        lineItems.push({
          price_data: {
            currency: "usd",
            product_data: {
              name: "Sales Tax",
            },
            unit_amount: salesTax,
          },
          quantity: 1,
        });
      }

      const discounts = [];

      if (coupon && coupon.appliesTo === "overall") {
        discounts.push({
          coupon: couponCode,
        });
      }

      // Create Stripe session with line items
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        customer_email: user.email,
        mode: "payment",
        success_url: `${process.env.REMOTE_CLIENT_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.REMOTE_CLIENT_URL}/checkout/fail`,
        line_items: lineItems,
        discounts: discounts,
      });

      // Save order details
      const order = new Order({
        userId: user._id,
        products,
        paymentSessionId: session.id,
        paymentStatus: "pending",
        billingAddress: values.billingAddress,
        shippingAddress: values.shippingAddress,
        couponCode,
        discount: coupon
          ? (coupon.discountType === "percentage"
              ? coupon.discountValue + "%"
              : "$" + coupon.discountValue) +
            " " +
            coupon.appliesTo
          : null,
      });
      await order.save();

      // Respond with session ID and success message
      res.status(200).json({
        id: session.id,
        message: "Order Made Successfully!",
      });
    }

    if (values.paymentMethod === "affirm") {
      let totalWithTireRecyclingFee = 0;
      await Promise.all(
        products.map(async (product) => {
          const item = await Product.findById(product.id)
            .populate(
              "brand",
              "-brandName -brandLogo -isFeatured -createdAt -updatedAt -__v"
            )
            .select(
              "-brand -model -regularPrice -shippingCost -description -tireSize -tireWidth -aspectRatio -rimDiameter -rimRange -overallDiameter -season -performance -sidewall -vehicleType -treadDesign -rebateAvailable -threePMS -loadRange -loadIndex -speedRating -treadDepth -treadLife -utqg -runFlat -inflationPressure -tireWeight -shippingDimensions -plainSize -warranty -treadDepth -isFeatured -category -reviews -overallRating -createdAt -updatedAt -__v"
            )
            .exec();

          // Check if product exists
          if (!item) {
            return res.status(400).send({ error: "Product not found" });
          }

          // Check stock availability
          if (item.stock < product.quantity) {
            return res
              .status(400)
              .send({ error: "Insufficient stock for product" });
          }

          // Calculate product amount
          let productAmount = item.salePrice;

          if (couponCode && coupon) {
            if (
              coupon.appliesTo === "all" ||
              (coupon.appliesTo === "specific_products" &&
                coupon.productIds.includes(item._id)) ||
              (coupon.appliesTo === "specific_brands" &&
                coupon.brandIds.includes(item.brand._id))
            ) {
              if (
                coupon.appliesTo !== "overall" &&
                product.quantity < coupon.minQuantity
              ) {
                throw new Error(
                  `Coupon not applicable. Minimum quantity required: ${coupon.minQuantity}`
                );
              }

              if (coupon.discountType === "percentage") {
                productAmount = parseFloat(
                  (item.salePrice * (1 - coupon.discountValue / 100)).toFixed(2)
                );
              } else if (coupon.discountType === "fixed") {
                productAmount = parseFloat(
                  (item.salePrice - coupon.discountValue).toFixed(2)
                );
              }
            }
          }

          productAmount *= 100; // Convert to cents
          totalAmount += productAmount * product.quantity;

          totalWithTireRecyclingFee = totalAmount;

          // Prepare line item for current product
          const lineItem = {
            display_name: item.productName,
            sku: item.sku,
            unit_price: productAmount,
            qty: product.quantity,
            item_image_url: item.images[0],
            item_url: `${process.env.REMOTE_CLIENT_URL}/product-details/${product.id}`,
          };

          lineItems.push(lineItem);

          // Add tire recycling fee if shipping address state is California
          if (
            values.shippingAddress.state.toLowerCase() === "california" ||
            values.shippingAddress.state.toLowerCase() === "ca"
          ) {
            const tireRecyclingFee = Math.round(item.salePrice * 100 * 0.0175); // 1.75% tire recycling fee

            totalWithTireRecyclingFee += tireRecyclingFee * product.quantity;

            // Create a separate line item for tire recycling fee
            lineItems.push({
              display_name: "Tire Recycling Fee",
              sku: item.sku,
              unit_price: tireRecyclingFee,
              qty: product.quantity,
              item_image_url: item.images[0],
              item_url: `${process.env.REMOTE_CLIENT_URL}/product-details/${product.id}`,
            });
          }
        })
      );

      // Calculate overall sales tax if shipping address state is California
      let salesTax = 0;
      if (
        values.shippingAddress.state.toLowerCase() === "california" ||
        values.shippingAddress.state.toLowerCase() === "ca"
      ) {
        const SALES_TAX_RATE = 0.0875; // 8.75% overall sales tax
        salesTax = Math.round(totalAmount * SALES_TAX_RATE);
      }

      let total = totalWithTireRecyclingFee + salesTax;

      let discounts = {};

      if (coupon && coupon.appliesTo === "overall") {
        const name = coupon.code.toUpperCase(); // Create a unique key for the discount
        const discountAmount = 0; // Function to calculate the discount amount

        if (coupon.discountType === "percentage") {
          discountAmount = total * (coupon.discountValue / 100);
          total = parseFloat(total * (1 - coupon.discountValue / 100));
        } else if (coupon.discountType === "fixed") {
          discountAmount = coupon.discountValue;
          total = parseFloat((total - coupon.discountValue).toFixed(2));
        }

        const displayName = name; // Display name for the discount

        discounts[name] = {
          discount_amount: discountAmount,
          discount_display_name: displayName,
        };
      }

      const randomHexAffirmSessionKey = [...Array(20)]
        .map(() => Math.floor(Math.random() * 16).toString(16))
        .join("");

      const checkoutDetails = {
        merchant: {
          user_confirmation_url: `${process.env.REMOTE_CLIENT_URL}/checkout/success?session_id=affirm-${randomHexAffirmSessionKey}`,
          user_cancel_url: `${process.env.REMOTE_CLIENT_URL}/checkout/fail`,
          public_api_key: `${process.env.AFFIRM_PUBLIC_API_KEY}`,
        },
        shipping: {
          name: {
            first: values.shippingAddress.firstName,
            last: values.shippingAddress.lastName,
          },
          address: {
            line1: values.shippingAddress.street1,
            city: values.shippingAddress.city,
            state: values.shippingAddress.state,
            zipcode: values.shippingAddress.zipCode,
          },
          // phone_number: user.phone,
          email: user.email,
        },
        billing: {
          name: {
            first: values.billingAddress.firstName,
            last: values.billingAddress.lastName,
          },
          address: {
            line1: values.billingAddress.street1,
            city: values.billingAddress.city,
            state: values.billingAddress.state,
            zipcode: values.billingAddress.zipCode,
          },
          // phone_number: user.phone,
          email: user.email,
        },
        items: lineItems,
        discounts: discounts,
        currency: "USD",
        shipping_amount: 0,
        tax_amount: salesTax,
        total: total,
      };

      const order = new Order({
        userId: user._id,
        products,
        paymentSessionId: `affirm-${randomHexAffirmSessionKey}`,
        paymentStatus: "pending",
        billingAddress: values.billingAddress,
        shippingAddress: values.shippingAddress,
        couponCode,
        discount: coupon
          ? (coupon.discountType === "percentage"
              ? coupon.discountValue + "%"
              : "$" + coupon.discountValue) +
            " " +
            coupon.appliesTo
          : null,
      });

      await order.save();

      res.status(200).json({
        checkoutDetails: checkoutDetails,
        message: "Order Made Successfully!",
      });
    }
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
});

const getAllOrders = catchAsyncError(async (req, res) => {
  try {
    let page = parseInt(req.query.page) || 1;
    let limit = 15;
    let skip = (page - 1) * limit;

    const orders = await Order.find()
      .limit(limit)
      .skip(skip)
      .select("-createdAt -updatedAt -__v")
      .exec();

    const totalOrders = await Order.countDocuments();
    const totalPages = Math.ceil(totalOrders / limit);

    res.status(200).json({
      status: "success",
      data: orders,
      total: totalOrders,
      page,
      totalPages,
    });
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
});

const confirmOrder = async ({ orderId, userId, products }) => {
  try {
    if (!orderId) {
      throw new Error("Order ID is required to send confirmation email.");
    }

    if (!userId) {
      throw new Error("User ID is required to send confirmation email.");
    }

    if (!products || products.length === 0) {
      throw new Error("Products are required to send confirmation email.");
    }

    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    const order = await Order.findById(orderId);

    if (!order) {
      throw new Error("Order not found");
    }

    const lineItems = [];
    let tireRecyclingFees = 0;
    await Promise.all(
      products.map(async (product) => {
        const item = await Product.findById(product.id);

        // Check if product exists
        if (!item) {
          throw new Error("Product not found");
        }

        const brand = await Brand.findById(item.brand);

        if (!brand) {
          throw new Error("Brand not found");
        }

        // Deduct the quantity from the product stock
        item.stock -= product.quantity;
        await Product.updateOne(
          { _id: item._id },
          { $set: { stock: item.stock } }
        );

        lineItems.push({
          image: item.images[0],
          brand: brand.brandName,
          model: item.model,
          size: item.tireSize,
          quantity: product.quantity,
          price: item.salePrice,
        });

        if (
          order.shippingAddress.state.toLowerCase() === "california" ||
          order.shippingAddress.state.toLowerCase() === "ca"
        ) {
          tireRecyclingFees += parseFloat(
            item.salePrice * product.quantity * 0.0175
          );
        }
      })
    );

    const projectLogo = `${process.env.REMOTE_CLIENT_URL}/public/assets/img/logo.png`;

    const deliveryDays = 1;
    const replacementCoveragePrice = 0;
    const roadsideAssistancePrice = 0;
    const shippingAndHandlingPrice = "FREE";
    const deliveryAddress =
      order.shippingAddress.lastName +
      ", " +
      order.shippingAddress.street1 +
      " " +
      order.shippingAddress.city +
      ", " +
      order.shippingAddress.zipCode;
    const subTotalPrice = lineItems.reduce(
      (total, product) => total + product.quantity * product.price,
      0
    );
    const salesTaxPrice =
      order.shippingAddress.state.toLowerCase() === "california" ||
      order.shippingAddress.state.toLowerCase() === "ca"
        ? (8.75 / 100) * subTotalPrice
        : 0;
    const stateFeesPrice = 0;

    let coupon = null;
    let couponDetails = "";
    if (order.couponCode != null) {
      coupon = await Coupon.findOne({
        code: order.couponCode,
      });
      if (coupon) {
        const discountPercent = coupon.discountType == "percentage" ? "%" : "";
        const discountAmount = coupon.discountType == "fixed" ? "$" : "";
        const discountMessage =
          coupon.appliesTo == "all"
            ? " off on all products"
            : coupon.appliesTo == "specific_products"
            ? " off on specific products"
            : coupon.appliesTo == "specific_brands"
            ? " off on specific brand products"
            : coupon.appliesTo == "overall"
            ? " off on overall purchase"
            : "";

        couponDetails =
          order.couponCode.toUpperCase() +
          ": " +
          discountAmount +
          coupon.discountValue +
          discountPercent +
          discountMessage;
      }
    }

    let totalPrice =
      replacementCoveragePrice +
      roadsideAssistancePrice +
      subTotalPrice +
      tireRecyclingFees +
      salesTaxPrice +
      stateFeesPrice;

    if (order.couponCode != null && coupon.appliesTo == "overall") {
      if (coupon.discountType === "percentage") {
        totalPrice = parseFloat(totalPrice * (1 - coupon.discountValue / 100));
      } else if (coupon.discountType === "fixed") {
        totalPrice = parseFloat(totalPrice - coupon.discountValue);
      }
    }

    await sendEmail({
      email: user.email,
      subject: "Thank You for Your Order! Your Receipt is Inside",
      html: orderConfirmationEmailMessage(
        projectLogo,
        orderId.toString(),
        user.username,
        deliveryDays,
        lineItems,
        tireRecyclingFees,
        replacementCoveragePrice,
        roadsideAssistancePrice,
        shippingAndHandlingPrice,
        deliveryAddress,
        subTotalPrice,
        couponDetails,
        salesTaxPrice,
        stateFeesPrice,
        totalPrice
      ),
    });

    return { message: "Order confirmation email sent successfully!" };
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  confirmOrder,
};
