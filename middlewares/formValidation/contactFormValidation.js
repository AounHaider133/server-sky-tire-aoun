const { joiContactSchema } = require("../../utils/joiSchema/contactSchema");

const validationResponse = require("../../utils/validationResponse");

//contact form validation
const contactValidation = (req, res, next) => {
  const { error } = joiContactSchema.validate(req.body);
  validationResponse(error, next);
};

module.exports = {
  contactValidation,
};
