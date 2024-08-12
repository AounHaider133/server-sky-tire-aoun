const Joi = require("joi");

const commonBrandSchema = {
  brandName: Joi.string().required(),
  brandLogo: Joi.array().items(
    Joi.string().custom((value, helpers) => {
      const allowedExtensions = ["jpeg", "jpg", "png", "webp"];
      const fileExtension = value.split(".").pop().toLowerCase();
      if (!allowedExtensions.includes(fileExtension)) {
        return helpers.error("any.invalid");
      }
      return value;
    }, "Image File Type Validation")
  ),
  isFeatured: Joi.boolean().default(false).required(),
};

const joiAddBrandSchema = Joi.object(commonBrandSchema);

module.exports = {
  commonBrandSchema,
  joiAddBrandSchema,
};
