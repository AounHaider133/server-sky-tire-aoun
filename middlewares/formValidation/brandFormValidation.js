const { joiAddBrandSchema } = require("../../utils/joiSchema/brandSchema");

const validationResponse = require("../../utils/validationResponse");

//add brand form validation
const addBrandValidation = (req, res, next) => {
  const { error } = joiAddBrandSchema.validate(req.body);
  validationResponse(error, next);
};

module.exports = {
  addBrandValidation,
};
