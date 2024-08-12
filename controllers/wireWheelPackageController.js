const catchAsyncError = require("../middlewares/catchAsyncErrors");
const WireWheelPackage = require("../models/wireWheelPackageModel");

const getAllWireWheelPackages = catchAsyncError(async (req, res) => {
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
        sortCriteria = { price: 1 };
        break;
      case "price-desc":
        sortCriteria = { price: -1 };
        break;
      default:
        sortCriteria = {};
    }

    const query = {
      price: { $gte: minPrice, $lte: maxPrice },
    };

    const wireWheelPackages = await WireWheelPackage.find(query)
      .limit(limit)
      .skip(skip)
      .sort(sortCriteria)
      .select(
        "-itemID -backSpacing -boltPattern -knockOffOptions -countryOfOrigin -description -shortDescription -reviews -createdAt -updatedAt -__v"
      )
      .exec();

    const totalWireWheelPackages = await WireWheelPackage.countDocuments(query);
    const totalPages = Math.ceil(totalWireWheelPackages / limit);

    res.status(200).json({
      status: "success",
      data: wireWheelPackages,
      total: totalWireWheelPackages,
      page,
      totalPages,
    });
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
});

const getWireWheelPackageByID = catchAsyncError(async (req, res) => {
  try {
    const packageId = req.params.packageId;

    const wireWheelPackage = await WireWheelPackage.findById(packageId)
      .select("-createdAt -updatedAt -__v")
      .exec();

    if (!wireWheelPackage) {
      return res.status(404).json({
        status: "fail",
        message: "Package not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: wireWheelPackage,
    });
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
});

module.exports = {
  getAllWireWheelPackages,
  getWireWheelPackageByID,
};
