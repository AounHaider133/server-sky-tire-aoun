const Joi = require("joi");

const joiSignupSchema = Joi.object({
  username: Joi.string()
    .regex(/^.{4,15}$/)
    .min(4)
    .max(255)
    .required(),
  email: Joi.string().email().required(),
  phone: Joi.string()
    .regex(/^\d{7,11}$/)
    .required(),
  password: Joi.string().min(8).required(),
});

const joiLoginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

const joiUpdatePasswordSchema = Joi.object({
  oldPassword: Joi.string().required(),
  newPassword: Joi.string().required().min(8),
  confirmPassword: Joi.string().valid(Joi.ref("newPassword")).required(),
});

const joiForgetPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

const joiResetPasswordSchema = Joi.object({
  newPassword: Joi.string().min(8).required(),
  confirmPassword: Joi.ref("newPassword"),
});

const joiUpdateProfileSchema = Joi.object({
  email: Joi.string().email().required(),
  phone: Joi.string()
    .regex(/^\d{7,11}$/)
    .required(),
});

module.exports = {
  joiSignupSchema,
  joiLoginSchema,
  joiUpdatePasswordSchema,
  joiForgetPasswordSchema,
  joiResetPasswordSchema,
  joiUpdateProfileSchema,
};
