const {
  joiAddCouponSchema,
  joiEditCouponSchema,
} = require("../../utils/joiSchema/couponSchema");

const validationResponse = require("../../utils/validationResponse");

//add coupon form validation
const addCouponValidation = (req, res, next) => {
  const { error } = joiAddCouponSchema.validate(req.body);
  validationResponse(error, next);
};

//edit coupon form validation
const editCouponValidation = (req, res, next) => {
  const { error } = joiEditCouponSchema.validate(req.body);
  validationResponse(error, next);
};

module.exports = {
  addCouponValidation,
  editCouponValidation,
};
