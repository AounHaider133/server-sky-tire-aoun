const { joiOrderSchema } = require("../../utils/joiSchema/orderSchema");

const validationResponse = require("../../utils/validationResponse");

//create order validation
const createOrderValidation = (req, res, next) => {
  const { error } = joiOrderSchema.validate(req.body);
  validationResponse(error, next);
};

module.exports = {
  createOrderValidation,
};
