const {
  joiForgetPasswordSchema,
  joiLoginSchema,
  joiUpdatePasswordSchema,
  joiResetPasswordSchema,
  joiSignupSchema,
  joiUpdateProfileSchema,
} = require("../../utils/joiSchema/authSchema");

const validationResponse = require("../../utils/validationResponse");

//register form validation
const registerValidation = (req, res, next) => {
  const { error } = joiSignupSchema.validate(req.body);
  validationResponse(error, next);
};

// login form validation
const loginValidation = (req, res, next) => {
  const { error } = joiLoginSchema.validate(req.body);
  validationResponse(error, next);
};

// update password form validation
const updatePasswordValidation = (req, res, next) => {
  const { error } = joiUpdatePasswordSchema.validate(req.body);
  validationResponse(error, next);
};

// forget password form validation
const forgetPasswordEmailValidation = (req, res, next) => {
  const { error } = joiForgetPasswordSchema.validate(req.body);
  validationResponse(error, next);
};

// reset password form validation
const resetPasswordValidation = (req, res, next) => {
  const { error } = joiResetPasswordSchema.validate(req.body);
  validationResponse(error, next);
};

// update profile form validation
const updateProfileValidation = (req, res, next) => {
  const { error } = joiUpdateProfileSchema.validate(req.body);
  validationResponse(error, next);
};

module.exports = {
  registerValidation,
  loginValidation,
  updatePasswordValidation,
  forgetPasswordEmailValidation,
  resetPasswordValidation,
  updateProfileValidation,
};
