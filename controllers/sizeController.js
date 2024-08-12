const catchAsyncError = require("../middlewares/catchAsyncErrors");
const Size = require("../models/sizeModel");

const getWidth = catchAsyncError(async (req, res) => {
  try {
    const widths = (
      await Size.aggregate([
        {
          $addFields: {
            widthNumber: { $toDouble: "$width" }, // Convert width to a number
          },
        },
        {
          $facet: {
            largeNumbers: [
              { $match: { widthNumber: { $gte: 100 } } }, // Filter for large numbers
              { $group: { _id: "$widthNumber" } }, // Group by widthNumber
              { $sort: { _id: 1 } }, // Sort in descending order
              { $project: { _id: 0, width: { $toString: "$_id" } } }, // Convert back to string
            ],
            smallNumbers: [
              { $match: { widthNumber: { $lt: 100 } } }, // Filter for small numbers
              { $group: { _id: "$widthNumber" } }, // Group by widthNumber
              { $sort: { _id: 1 } }, // Sort in ascending order
              { $project: { _id: 0, width: { $toString: "$_id" } } }, // Convert back to string
            ],
          },
        },
        {
          $project: {
            widths: { $concatArrays: ["$largeNumbers", "$smallNumbers"] }, // Combine results
          },
        },
        { $unwind: "$widths" }, // Unwind the combined array
        {
          $replaceRoot: { newRoot: "$widths" }, // Replace root with the combined results
        },
      ])
    ).map((item) => item.width);

    res.status(200).json({
      status: "success",
      data: widths,
    });
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
});

const getAspectRatioForWidth = catchAsyncError(async (req, res) => {
  try {
    const width = req.query.width;
    const aspectRatios = (
      await Size.aggregate([
        { $match: { width: width } },
        { $group: { _id: "$aspectRatio" } },
        { $sort: { _id: 1 } },
      ])
    ).map((item) => item._id);

    res.status(200).json({
      status: "success",
      data: aspectRatios,
    });
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
});

const getDiameterForAspectRatioAndWidth = catchAsyncError(async (req, res) => {
  try {
    const width = req.query.width;
    const aspectRatio = req.query.aspectRatio;
    const diameters = (
      await Size.aggregate([
        { $match: { width: width, aspectRatio: aspectRatio } },
        { $group: { _id: "$diameter" } },
        { $sort: { _id: 1 } },
      ])
    ).map((item) => item._id);

    res.status(200).json({
      status: "success",
      data: diameters,
    });
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
});

module.exports = {
  getWidth,
  getAspectRatioForWidth,
  getDiameterForAspectRatioAndWidth,
};
