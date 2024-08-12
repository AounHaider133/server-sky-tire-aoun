const Joi = require("joi");

const joiContactSchema = Joi.object({
  name: Joi.string().required(),
  phone: Joi.string()
    .regex(/^\d{7,11}$/)
    .required(),
  email: Joi.string().email().required(),
  message: Joi.string().required(),
});

module.exports = {
  joiContactSchema,
};
