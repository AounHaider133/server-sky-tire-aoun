const passport = require("passport");
const validator = require("email-validator");
const crypto = require("crypto");

const catchAsyncError = require("../middlewares/catchAsyncErrors");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const { forgetPasswordEmailMessage } = require("../utils/emailMessage");
const User = require("../models/userModel");

passport.use(User.createStrategy());

passport.serializeUser(
  User.serializeUser(function (user, done) {
    done(null, user.id);
  })
);

passport.deserializeUser(
  User.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
      done(err, user);
    });
  })
);

const register = catchAsyncError(async (req, res, next) => {
  if (!validator.validate(req.body.email)) {
    return res.status(400).send({ error: "Invalid email" });
  }

  User.register(
    {
      email: req.body.email,
      username: req.body.username,
      phone: req.body.phone,
    },
    req.body.password,
    function (err, user) {
      if (err) {
        res.status(400).send({ error: err });
      } else {
        passport.authenticate("local")(req, res, function () {
          sendToken(user, 200, res);
        });
      }
    }
  );
});

const login = catchAsyncError(async (req, res, next) => {
  const user = await User.findOne({
    username: req.body.username,
  });

  req.login(
    { user, password: req.body.password },
    { session: false },
    (err) => {
      if (err) {
        res.status(400).send({ error: err });
      } else {
        passport.authenticate("local")(req, res, function () {
          sendToken(user, 200, res);
        });
      }
    }
  );
});

const logout = catchAsyncError(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
      secure: true,
      sameSite: "none",
    })
    .send({ success: true, message: "Logged out successfully!" });
});

const updateUserDetails = catchAsyncError(async (req, res, next) => {
  const newUserData = {
    email: req.body.email,
    phone: req.body.phone,
  };

  try {
    await User.findByIdAndUpdate(req.user.id, newUserData, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });

    res.status(200).send({
      success: true,
      message: "User Details Updated Successfully!",
    });
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
});

const getUserDetails = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user.id)
    .select("-password -createdAt -updatedAt -__v -token -tokenExpire")
    .exec();

  if (!user) {
    return res.status(404).send({ error: "User doesn't exist!" });
  }

  res.status(200).send({
    success: true,
    user,
  });
});

const updatePassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).send({ error: "User doesn't exist!" });
  }

  const isMatched = await user.authenticate(req.body.oldPassword);

  if (!isMatched.user) {
    return res.status(400).send({ error: "Old password is incorrect!" });
  }

  if (req.body.newPassword !== req.body.confirmPassword) {
    return res
      .status(400)
      .send({ error: "Password and Confirm Password does not match!" });
  }

  if (req.body.oldPassword === req.body.newPassword) {
    return res
      .status(400)
      .send({ error: "Old Password and New Password can not be same!" });
  }

  await user.setPassword(req.body.newPassword);
  await user.save();
  sendToken(user, 200, res);
});

const forgotPassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return res.status(404).send({ error: "User doesn't exist!" });
  }

  const resetToken = await user.getToken();
  await user.save({ validateBeforeSave: false });
  /**
   * send the url of frontend page of forget password form with token
   * must add the code before build
   */
  const resetPasswordUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/password/reset/${resetToken}`;

  const projectName = "HospiPro";
  const projectLogo = "https://ezeetraders.com/hospipro/logo.png";

  try {
    await sendEmail({
      email: user.email,
      subject: "Reset Password",
      html: forgetPasswordEmailMessage(
        projectLogo,
        resetPasswordUrl,
        projectName
      ),
    });
    res.status(200).json({
      success: true,
      message: "Email Sent Successfully!",
    });
  } catch (error) {
    user.token = undefined;
    user.tokenExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return res.status(500).send({ error: error.message });
  }
});

const resetPassword = catchAsyncError(async (req, res, next) => {
  const verifiedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    token: verifiedToken,
    tokenExpire: { $gt: Date.now() },
  });
  if (!user) {
    return next(
      res
        .status(400)
        .send({ error: "Reset password token is invalid or has been expired!" })
    );
  }

  if (req.body.newPassword !== req.body.confirmPassword) {
    return res
      .status(400)
      .send({ error: "Password and Confirm Password does not match!" });
  }

  await user.setPassword(req.body.newPassword);
  user.restPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
  sendToken(user, 201, res);
});

module.exports = {
  register,
  login,
  logout,
  getUserDetails,
  updateUserDetails,
  updatePassword,
  forgotPassword,
  resetPassword,
};
