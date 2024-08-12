const catchAsyncError = require("../middlewares/catchAsyncErrors");
const Brand = require("../models/brandModel");
const Product = require("../models/productModel");

const addBrand = catchAsyncError(async (req, res, next) => {
  try {
    const brand = new Brand({
      brandName: req.body.brandName,
      brandLogo: req.files[0].filename,
    });

    await brand.save();
    res.status(200).json({
      message: "Brand Added Successfully!",
    });
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
});

const getAllBrands = catchAsyncError(async (req, res) => {
  try {
    let page = parseInt(req.query.page) || 1;
    let limit = 16;
    let skip = (page - 1) * limit;

    // showing featured for now only
    const brands = await Brand.find({ isFeatured: true })
      .limit(limit)
      .skip(skip)
      .select("-isFeatured -createdAt -updatedAt -__v")
      .sort({ brandName: 1 })
      .exec();

    const totalBrands = await Brand.countDocuments({ isFeatured: true });
    const totalPages = Math.ceil(totalBrands / limit);

    res.status(200).json({
      status: "success",
      data: brands,
      total: totalBrands,
      page,
      totalPages,
    });
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
});

const getBrandByID = catchAsyncError(async (req, res) => {
  try {
    const brandId = req.params.brandId;

    const brand = await Brand.findById(brandId)
      .select("-createdAt -updatedAt -__v")
      .exec();

    if (!brand) {
      return res.status(404).json({
        status: "fail",
        message: "Brand not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: brand,
    });
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
});

const getAllBrandsWithoutPagination = catchAsyncError(async (req, res) => {
  try {
    const brands = await Brand.find()
      .select("-isFeatured -createdAt -updatedAt -__v")
      .exec();

    const totalBrands = await Brand.countDocuments();

    res.status(200).json({
      status: "success",
      data: brands,
      total: totalBrands,
    });
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
});

const getAllBrandsWithProductCount = catchAsyncError(async (req, res) => {
  try {
    let page = parseInt(req.query.page) || 1;
    let limit = 15;
    let skip = (page - 1) * limit;

    const brands = await Brand.find()
      .limit(limit)
      .skip(skip)
      .select("-isFeatured -createdAt -updatedAt -__v")
      .exec();

    const totalBrands = await Brand.countDocuments();
    const totalPages = Math.ceil(totalBrands / limit);

    const productCounts = await Product.aggregate([
      {
        $group: {
          _id: "$brand",
          count: { $sum: 1 },
        },
      },
    ]);

    const brandProductCounts = productCounts.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    const brandsWithCounts = brands.map((brand) => ({
      ...brand.toObject(),
      productCount: brandProductCounts[brand._id] || 0,
    }));

    res.status(200).json({
      status: "success",
      data: brandsWithCounts,
      total: totalBrands,
      page,
      totalPages,
    });
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
});

const getAllBrandsWithProductCountWithoutPagination = catchAsyncError(
  async (req, res) => {
    try {
      let page = parseInt(req.query.page) || 1;
      let limit = 15;
      let skip = (page - 1) * limit;

      const brands = await Brand.find()
        .limit(limit)
        .skip(skip)
        .select("-isFeatured -createdAt -updatedAt -__v")
        .exec();

      const totalBrands = await Brand.countDocuments();
      const totalPages = Math.ceil(totalBrands / limit);

      const productCounts = await Product.aggregate([
        {
          $group: {
            _id: "$brand",
            count: { $sum: 1 },
          },
        },
      ]);

      const brandProductCounts = productCounts.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {});

      const brandsWithCounts = brands.map((brand) => ({
        ...brand.toObject(),
        productCount: brandProductCounts[brand._id] || 0,
      }));

      res.status(200).json({
        status: "success",
        data: brandsWithCounts,
        total: totalBrands,
        page,
        totalPages,
      });
    } catch (error) {
      return res.status(400).send({ error: error.message });
    }
  }
);

const getFeaturedBrands = catchAsyncError(async (req, res) => {
  try {
    const featuredBrands = await Brand.find({ isFeatured: true })
      .select("-isFeatured -createdAt -updatedAt -__v")
      .exec();

    const totalFeaturedBrands = featuredBrands.length;

    res.status(200).json({
      status: "success",
      data: featuredBrands,
      total: totalFeaturedBrands,
    });
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
});

const getFeaturedBrandsWithProductCount = catchAsyncError(async (req, res) => {
  try {
    const featuredBrands = await Brand.find({ isFeatured: true })
      .select("-isFeatured -createdAt -updatedAt -__v")
      .sort({ brandName: 1 })
      .exec();

    const totalFeaturedBrands = featuredBrands.length;

    const productCounts = await Product.aggregate([
      {
        $group: {
          _id: "$brand",
          count: { $sum: 1 },
        },
      },
    ]);

    const brandProductCounts = productCounts.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    const featuredBrandsWithCounts = featuredBrands.map((brand) => ({
      ...brand.toObject(),
      productCount: brandProductCounts[brand._id] || 0,
    }));

    res.status(200).json({
      status: "success",
      data: featuredBrandsWithCounts,
      total: totalFeaturedBrands,
    });
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
});

const getNonFeaturedBrands = catchAsyncError(async (req, res) => {
  try {
    const featuredBrands = await Brand.find({ isFeatured: false })
      .select("-isFeatured -createdAt -updatedAt -__v")
      .exec();

    const totalFeaturedBrands = featuredBrands.length;

    res.status(200).json({
      status: "success",
      data: featuredBrands,
      total: totalFeaturedBrands,
    });
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
});

const getNonFeaturedBrandsWithProductCount = catchAsyncError(
  async (req, res) => {
    try {
      const nonFeaturedBrands = await Brand.find({ isFeatured: false })
        .select("-isFeatured -createdAt -updatedAt -__v")
        .exec();

      const totalNonFeaturedBrands = nonFeaturedBrands.length;

      const productCounts = await Product.aggregate([
        {
          $group: {
            _id: "$brand",
            count: { $sum: 1 },
          },
        },
      ]);

      const brandProductCounts = productCounts.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {});

      const nonFeaturedBrandsWithCounts = nonFeaturedBrands.map((brand) => ({
        ...brand.toObject(),
        productCount: brandProductCounts[brand._id] || 0,
      }));

      res.status(200).json({
        status: "success",
        data: nonFeaturedBrandsWithCounts,
        total: totalNonFeaturedBrands,
      });
    } catch (error) {
      return res.status(400).send({ error: error.message });
    }
  }
);

module.exports = {
  addBrand,
  getAllBrands,
  getBrandByID,
  getAllBrandsWithoutPagination,
  getFeaturedBrands,
  getNonFeaturedBrands,
  getAllBrandsWithProductCount,
  getAllBrandsWithProductCountWithoutPagination,
  getFeaturedBrandsWithProductCount,
  getNonFeaturedBrandsWithProductCount,
};
