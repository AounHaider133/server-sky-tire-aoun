const ErrorHandler = require("./errorHandler");

const validationResponse = (error, next) => {
  if (error) {
    next(new ErrorHandler(400, error.details[0].message));
  }
  next();
};

module.exports = validationResponse;
