const Joi = require("joi");

const commonBrandSchema = require("./brandSchema");

const commonProductSchema = {
  sku: Joi.string().required(),
  brand: commonBrandSchema,
  model: Joi.string().required(),
  price: Joi.number().precision(2).min(1).required(),
  shippingCost: Joi.number().precision(2).min(0).required(),
  image: Joi.array().items(
    Joi.string().custom((value, helpers) => {
      const allowedExtensions = ["jpeg", "jpg", "png", "webp"];
      const fileExtension = value.split(".").pop().toLowerCase();
      if (!allowedExtensions.includes(fileExtension)) {
        return helpers.error("any.invalid");
      }
      return value;
    }, "Image File Type Validation")
  ),
  description: Joi.string().required(),
  stock: Joi.number().integer().min(0).required(),
  tireWidth: Joi.number().precision(2).min(1).required(),
  aspectRatio: Joi.number().precision(2).min(1).required(),
  rimDiameter: Joi.number().precision(2).min(1).required(),
  overallDiameter: Joi.number().precision(2).min(1).required(),
  season: Joi.string().valid("All Season", "Summer", "Winter").required(),
  performance: Joi.string()
    .valid(
      "All Terrain",
      "Highway",
      "Mud Terrain",
      "Touring",
      "High Performance",
      "Rugged Terrain",
      "Extreme Terrain",
      "Performance"
    )
    .required(),
  sidewall: Joi.string().required(),
  vehicleType: Joi.string()
    .valid("Passenger", "SUV", "Light Truck", "Trailer")
    .required(),
  treadDesign: Joi.string().required(),
  rebateAvailable: Joi.boolean().default(false).required(),
  threePMS: Joi.boolean().default(false).required(),
  mudAndSnow: Joi.boolean().default(false).required(),
  loadRange: Joi.string().required(),
  loadIndex: Joi.number().integer().min(1).required(),
  speedRating: Joi.string().required(),
  treadDepth: Joi.string().required(),
  treadLife: Joi.number().integer().min(1).required(),
  utqg: Joi.string().required(),
  runFlat: Joi.boolean().default(false).required(),
  inflationPressure: Joi.number().precision(2).min(1).required(),
  tireWeight: Joi.number().precision(2).min(1).required(),
  shippingDimensions: Joi.string().required(),
  partNumber: Joi.string().required(),
  plainSize: Joi.string().required(),
};

const joiAddProductSchema = Joi.object(commonProductSchema);

module.exports = {
  joiAddProductSchema,
};
