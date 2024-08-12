const { joiAddProductSchema } = require("../../utils/joiSchema/productSchema");

const validationResponse = require("../../utils/validationResponse");

//add product form validation
const addProductValidation = (req, res, next) => {
  const { error } = joiAddProductSchema.validate(req.body);
  validationResponse(error, next);
};

module.exports = {
  addProductValidation,
};
