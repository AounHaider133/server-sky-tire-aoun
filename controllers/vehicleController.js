const catchAsyncError = require("../middlewares/catchAsyncErrors");
const Vehicle = require("../models/vehicleModel");

const getYears = catchAsyncError(async (req, res) => {
  try {
    const years = (
      await Vehicle.aggregate([
        { $group: { _id: "$year" } },
        { $sort: { _id: -1 } },
      ])
    ).map((item) => item._id);

    res.status(200).json({
      status: "success",
      data: years,
    });
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
});

const getMakesForYear = catchAsyncError(async (req, res) => {
  try {
    const year = req.query.year;
    const makes = (
      await Vehicle.aggregate([
        { $match: { year: year } },
        { $group: { _id: "$make" } },
        { $sort: { _id: 1 } },
      ])
    ).map((item) => item._id);

    res.status(200).json({
      status: "success",
      data: makes,
    });
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
});

const getModelsForMakeAndYear = catchAsyncError(async (req, res) => {
  try {
    const year = req.query.year;
    const make = req.query.make;
    const models = (
      await Vehicle.aggregate([
        { $match: { year: year, make: make } },
        { $group: { _id: "$model" } },
        { $sort: { _id: 1 } },
      ])
    ).map((item) => item._id);

    res.status(200).json({
      status: "success",
      data: models,
    });
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
});

const getTrimsForModelsAndMakeAndYear = catchAsyncError(async (req, res) => {
  try {
    const year = req.query.year;
    const make = req.query.make;
    const model = req.query.model;
    const trims = (
      await Vehicle.aggregate([
        { $match: { year: year, make: make, model: model } },
        { $group: { _id: "$trim" } },
        { $sort: { _id: 1 } },
      ])
    ).map((item) => item._id);

    res.status(200).json({
      status: "success",
      data: trims,
    });
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
});

const getTireSizesForTrimAndModelsAndMakeAndYear = catchAsyncError(
  async (req, res) => {
    try {
      const year = req.query.year;
      const make = req.query.make;
      const model = req.query.model;
      const trim = req.query.trim;
      const tireSizes = (
        await Vehicle.aggregate([
          { $match: { year: year, make: make, model: model, trim: trim } },
          { $group: { _id: "$tireSize" } },
          { $sort: { _id: 1 } },
        ])
      ).map((item) => item._id);

      res.status(200).json({
        status: "success",
        data: tireSizes,
      });
    } catch (error) {
      return res.status(400).send({ error: error.message });
    }
  }
);

module.exports = {
  getYears,
  getMakesForYear,
  getModelsForMakeAndYear,
  getTrimsForModelsAndMakeAndYear,
  getTireSizesForTrimAndModelsAndMakeAndYear,
};
