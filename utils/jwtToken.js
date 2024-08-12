const sendToken = (user, statusCode, res) => {
  const token = user.getJWTToken();

  const options = {
    httpOnly: true,
    sameSite: "none",
    secure: true,
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
  };

  res.status(statusCode).cookie("token", token, options).send({
    success: true,
    user,
    token,
  });
};

module.exports = sendToken;
