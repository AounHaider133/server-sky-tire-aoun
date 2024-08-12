const catchAsyncError = require("../middlewares/catchAsyncErrors");
const Product = require("../models/productModel");
const Brand = require("../models/brandModel");
const Review = require("../models/reviewModel");

const content = require("../utils/oAuthClient");

const addProduct = catchAsyncError(async (req, res, next) => {
  try {
    const product = new Product({
      sku: req.body.sku,
      productName: req.body.productName,
      brand: req.body.brand,
      model: req.body.model,
      salePrice: req.body.salePrice,
      regularPrice: req.body.regularPrice,
      shippingCost: req.body.shippingCost,
      image: req.files[0].filename,
      stock: req.body.stock,
      tireSize: req.body.tireSize,
      tireWidth: req.body.tireWidth,
      aspectRatio: req.body.aspectRatio,
      rimDiameter: req.body.rimDiameter,
      performance: req.body.performance,
      treadDesign: req.body.treadDesign,
      loadIndex: req.body.loadIndex,
      speedRating: req.body.speedRating,
      runFlat: req.body.runFlat,
      plainSize: req.body.plainSize,
      isFeatured: req.body.isFeatured,
      category: req.body.category,
      description: req.body.description,
      rimRange: req.body.rimRange,
      overallDiameter: req.body.overallDiameter,
      season: req.body.season,
      sidewall: req.body.sidewall,
      vehicleType: req.body.vehicleType,
      rebateAvailable: req.body.rebateAvailable,
      threePMS: req.body.threePMS,
      loadRange: req.body.loadRange,
      utqg: req.body.utqg,
      inflationPressure: req.body.inflationPressure,
      tireWeight: req.body.tireWeight,
      shippingDimensions: req.body.shippingDimensions,
      treadLife: req.body.treadLife,
      warranty: req.body.warranty,
      treadDepth: req.body.treadDepth,
    });

    await product.save();
    res.status(200).json({
      message: "Product Added Successfully!",
    });
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
});

const getAllProducts = catchAsyncError(async (req, res) => {
  try {
    let page = parseInt(req.query.page) || 1;
    let limit = 15;
    let skip = (page - 1) * limit;
    let orderby = req.query.orderby || "";
    let minPrice = parseFloat(req.query.minPrice) || 0;
    let maxPrice = parseFloat(req.query.maxPrice) || Number.MAX_SAFE_INTEGER;

    let sortCriteria = {};

    switch (orderby) {
      case "rating":
        sortCriteria = { overallRating: -1 };
        break;
      case "date":
        sortCriteria = { createdAt: -1 };
        break;
      case "price":
        sortCriteria = { salePrice: 1 };
        break;
      case "price-desc":
        sortCriteria = { salePrice: -1 };
        break;
      default:
        sortCriteria = {};
    }

    const query = {
      category: "none",
      salePrice: { $gte: minPrice, $lte: maxPrice },
    };

    const products = await Product.find(query)
      .limit(limit)
      .skip(skip)
      .sort(sortCriteria)
      .populate("brand")
      .select(
        "-sku -brand -model -shippingCost -description -tireSize -tireWidth -aspectRatio -rimDiameter -rimRange -overallDiameter -season -performance -sidewall -vehicleType -treadDesign -rebateAvailable -threePMS -loadRange -loadIndex -speedRating -utqg -runFlat -inflationPressure -tireWeight -shippingDimensions -plainSize -treadLife -treadDepth -isFeatured -category -reviews -createdAt -updatedAt -__v"
      )
      .exec();

    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / limit);

    res.status(200).json({
      status: "success",
      data: products,
      total: totalProducts,
      page,
      totalPages,
    });
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
});

const getWhiteWallProducts = catchAsyncError(async (req, res) => {
  try {
    let page = parseInt(req.query.page) || 1;
    let limit = 15;
    let skip = (page - 1) * limit;
    let orderby = req.query.orderby;
    let minPrice = parseFloat(req.query.minPrice) || 0;
    let maxPrice = parseFloat(req.query.maxPrice) || Number.MAX_SAFE_INTEGER;

    let sortCriteria = {};

    switch (orderby) {
      case "rating":
        sortCriteria = { overallRating: -1 };
        break;
      case "date":
        sortCriteria = { createdAt: -1 };
        break;
      case "price":
        sortCriteria = { salePrice: 1 };
        break;
      case "price-desc":
        sortCriteria = { salePrice: -1 };
        break;
      default:
        sortCriteria = {};
    }

    const query = {
      category: "white-wall",
      salePrice: { $gte: minPrice, $lte: maxPrice },
    };

    const products = await Product.find(query)
      .limit(limit)
      .skip(skip)
      .sort(sortCriteria)
      .populate("brand")
      .select(
        "-sku -brand -model -shippingCost -description -tireSize -tireWidth -aspectRatio -rimDiameter -rimRange -overallDiameter -season -performance -sidewall -vehicleType -treadDesign -rebateAvailable -threePMS -loadRange -loadIndex -speedRating -utqg -runFlat -inflationPressure -tireWeight -shippingDimensions -plainSize -treadLife -warranty -treadDepth -isFeatured -category -reviews -createdAt -updatedAt -__v"
      )
      .exec();

    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / limit);

    res.status(200).json({
      status: "success",
      data: products,
      total: totalProducts,
      page,
      totalPages,
    });
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
});

const getProductByID = catchAsyncError(async (req, res) => {
  try {
    const productId = req.params.productId;

    const product = await Product.findById(productId)
      .populate("brand reviews", "-isFeatured -createdAt -updatedAt -__v")
      .select("-createdAt -updatedAt -__v")
      .exec();

    if (!product) {
      return res.status(404).json({
        status: "fail",
        message: "Product not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: product,
    });
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
});

const getProductsByBrand = catchAsyncError(async (req, res) => {
  try {
    let page = parseInt(req.query.page) || 1;
    let limit = 15;
    let skip = (page - 1) * limit;
    let brand = req.query.brand;
    let orderby = req.query.orderby;
    let minPrice = parseFloat(req.query.minPrice) || 0;
    let maxPrice = parseFloat(req.query.maxPrice) || Number.MAX_SAFE_INTEGER;

    if (!brand) {
      return res.status(400).send({ error: "Brand is required" });
    }

    let sortCriteria = {};

    switch (orderby) {
      case "rating":
        sortCriteria = { overallRating: -1 };
        break;
      case "date":
        sortCriteria = { createdAt: -1 };
        break;
      case "price":
        sortCriteria = { salePrice: 1 };
        break;
      case "price-desc":
        sortCriteria = { salePrice: -1 };
        break;
      default:
        sortCriteria = {};
    }

    const query = {
      brand: brand,
      salePrice: { $gte: minPrice, $lte: maxPrice },
    };

    const products = await Product.find(query)
      .limit(limit)
      .skip(skip)
      .sort(sortCriteria)
      .populate("brand")
      .select(
        "-sku -brand -model -shippingCost -description -tireSize -tireWidth -aspectRatio -rimDiameter -rimRange -overallDiameter -season -performance -sidewall -vehicleType -treadDesign -rebateAvailable -threePMS -loadRange -loadIndex -speedRating -utqg -runFlat -inflationPressure -tireWeight -shippingDimensions -plainSize -treadLife -treadDepth -isFeatured -category -reviews -createdAt -updatedAt -__v"
      )
      .exec();

    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / limit);

    res.status(200).json({
      status: "success",
      data: products,
      total: totalProducts,
      page,
      totalPages,
    });
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
});

const getProductsBySearch = catchAsyncError(async (req, res) => {
  try {
    let page = parseInt(req.query.page) || 1;
    let limit = 15;
    let skip = (page - 1) * limit;
    let searchText = req.query.text || "";
    let brand = req.query.brand;
    let orderby = req.query.orderby;
    let minPrice = parseFloat(req.query.minPrice) || 0;
    let maxPrice = parseFloat(req.query.maxPrice) || Number.MAX_SAFE_INTEGER;

    let sortCriteria = {};

    switch (orderby) {
      case "rating":
        sortCriteria = { overallRating: -1 };
        break;
      case "date":
        sortCriteria = { createdAt: -1 };
        break;
      case "price":
        sortCriteria = { salePrice: 1 };
        break;
      case "price-desc":
        sortCriteria = { salePrice: -1 };
        break;
      default:
        sortCriteria = {};
    }

    if (searchText && !brand) {
      const foundBrand = await Brand.findOne({
        brandName: { $regex: searchText, $options: "i" },
      });
      if (foundBrand) {
        brand = foundBrand._id.toString();
        searchText = "";
      }
    }

    let query = {
      salePrice: { $gte: minPrice, $lte: maxPrice },
    };

    if (searchText) {
      query.$or = [
        { sku: { $regex: searchText, $options: "i" } },
        { productName: { $regex: searchText, $options: "i" } },
        { model: { $regex: searchText, $options: "i" } },
        { tireSize: { $regex: searchText, $options: "i" } },
        { season: { $regex: searchText, $options: "i" } },
        { performance: { $regex: searchText, $options: "i" } },
        { sidewall: { $regex: searchText, $options: "i" } },
        { vehicleType: { $regex: searchText, $options: "i" } },
        { treadDesign: { $regex: searchText, $options: "i" } },
        { plainSize: { $regex: searchText, $options: "i" } },
        { treadLife: { $regex: searchText, $options: "i" } },
        { warranty: { $regex: searchText, $options: "i" } },
        { category: { $regex: searchText, $options: "i" } },
      ];
    }

    if (brand && brand != "null") {
      query.brand = brand;
    }

    const products = await Product.find(query)
      .limit(limit)
      .skip(skip)
      .sort(sortCriteria)
      .populate("brand")
      .select(
        "-sku -brand -model -shippingCost -description -tireSize -tireWidth -aspectRatio -rimDiameter -rimRange -overallDiameter -season -performance -sidewall -vehicleType -treadDesign -rebateAvailable -threePMS -loadRange -loadIndex -speedRating -utqg -runFlat -inflationPressure -tireWeight -shippingDimensions -plainSize -treadLife -treadDepth -isFeatured -category -reviews -createdAt -updatedAt -__v"
      )
      .exec();

    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / limit);

    res.status(200).json({
      status: "success",
      data: products,
      total: totalProducts,
      page,
      totalPages,
    });
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
});

const getRelatedProducts = catchAsyncError(async (req, res) => {
  try {
    let page = parseInt(req.query.page) || 1;
    let limit = 4;
    let skip = (page - 1) * limit;
    let tireSize = req.query.tireSize;

    const query = {
      tireSize: tireSize,
    };

    const products = await Product.find(query)
      .limit(limit)
      .skip(skip)
      .populate("brand")
      .select(
        "-sku -brand -model -shippingCost -description -tireSize -tireWidth -aspectRatio -rimDiameter -rimRange -overallDiameter -season -performance -sidewall -vehicleType -treadDesign -rebateAvailable -threePMS -loadRange -loadIndex -speedRating -utqg -runFlat -inflationPressure -tireWeight -shippingDimensions -plainSize -treadLife -treadDepth -isFeatured -category -reviews -createdAt -updatedAt -__v"
      )
      .exec();

    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / limit);

    res.status(200).json({
      status: "success",
      data: products,
      total: totalProducts,
      page,
      totalPages,
    });
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
});

const getFeaturedProducts = catchAsyncError(async (req, res) => {
  try {
    let page = parseInt(req.query.page) || 1;
    let limit = 8;
    let skip = (page - 1) * limit;

    const query = {
      isFeatured: true,
    };

    const products = await Product.find(query)
      .limit(limit)
      .skip(skip)
      .populate("brand")
      .select(
        "-sku -brand -model -shippingCost -description -tireSize -tireWidth -aspectRatio -rimDiameter -rimRange -overallDiameter -season -performance -sidewall -vehicleType -treadDesign -rebateAvailable -threePMS -loadRange -loadIndex -speedRating -utqg -runFlat -inflationPressure -tireWeight -shippingDimensions -plainSize -treadLife -treadDepth -isFeatured -category -reviews -createdAt -updatedAt -__v"
      )
      .exec();

    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / limit);

    res.status(200).json({
      status: "success",
      data: products,
      total: totalProducts,
      page,
      totalPages,
    });
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
});

module.exports = {
  addProduct,
  getAllProducts,
  getWhiteWallProducts,
  getProductByID,
  getProductsByBrand,
  getProductsBySearch,
  getRelatedProducts,
  getFeaturedProducts,
};
