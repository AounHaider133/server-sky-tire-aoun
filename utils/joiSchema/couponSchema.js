const Joi = require("joi");

const commonCouponSchema = {
  code: Joi.string().required(),
  discountType: Joi.string().valid("percentage", "fixed").required(),
  discountValue: Joi.number().required(),
  appliesTo: Joi.string()
    .valid("all", "specific_products", "specific_brands", "overall")
    .required(),
  productIds: Joi.array().items(Joi.string().length(24)).optional(),
  brandIds: Joi.array().items(Joi.string().length(24)).optional(),
  minQuantity: Joi.number().min(1).default(1).required(),
  usageLimit: Joi.number().required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().greater(Joi.ref("startDate")).required(),
  active: Joi.boolean().default(true),
};

const joiAddCouponSchema = Joi.object(commonCouponSchema);
const joiEditCouponSchema = Joi.object(commonCouponSchema);

module.exports = {
  commonCouponSchema,
  joiAddCouponSchema,
  joiEditCouponSchema,
};
