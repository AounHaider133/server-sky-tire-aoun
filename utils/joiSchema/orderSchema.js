const Joi = require("joi");

const productSchema = Joi.object({
  id: Joi.string().required(),
  quantity: Joi.number().integer().min(1).required(),
});

const addressSchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  country: Joi.string().required(),
  street1: Joi.string().required(),
  street2: Joi.string().allow(""),
  city: Joi.string().required(),
  state: Joi.string().required(),
  zipCode: Joi.string().required(),
  isSameAddress: Joi.boolean(),
});

const joiOrderSchema = Joi.object({
  products: Joi.array().items(productSchema).min(1).required(),
  values: Joi.object({
    billingAddress: addressSchema,
    shippingAddress: addressSchema,
    email: Joi.string().email().allow(""),
    paymentMethod: Joi.string().required(),
    phoneNumber: Joi.string().allow(""),
  }),
  couponCode: Joi.string().allow(""),
});

module.exports = { joiOrderSchema };
