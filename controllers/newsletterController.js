const request = require("superagent");

const catchAsyncError = require("../middlewares/catchAsyncErrors");

const newsletterSignup = catchAsyncError(async (req, res, next) => {
  try {
    const emailHash = require("crypto")
      .createHash("md5")
      .update(req.body.email.toLowerCase())
      .digest("hex");

    request
      .put(
        "https://" +
          process.env.MAIL_CHIMP_INSTANCE +
          ".api.mailchimp.com/3.0/lists/" +
          process.env.MAIL_CHIMP_LIST_UNIQUE_ID +
          "/members/" +
          emailHash
      )
      .set("Content-Type", "application/json;charset=utf-8")
      .set(
        "Authorization",
        "Basic " +
          Buffer.from("any:" + process.env.MAIL_CHIMP_API_KEY).toString(
            "base64"
          )
      )
      .send({
        email_address: req.body.email,
        status_if_new: "subscribed",
        status: "subscribed",
      })
      .end((error, response) => {
        if (
          response.status < 300 ||
          (response.status === 400 && response.body.title === "Member Exists")
        ) {
          res.status(200).json({
            message: "Newsletter signed up successfully!",
          });
        } else {
          res.status(400).send({ error: error.message });
        }
      });
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
});

const newsletterUnsubscribe = catchAsyncError(async (req, res, next) => {
  try {
    const emailHash = require("crypto")
      .createHash("md5")
      .update(req.body.email.toLowerCase())
      .digest("hex");

    request
      .patch(
        "https://" +
          process.env.MAIL_CHIMP_INSTANCE +
          ".api.mailchimp.com/3.0/lists/" +
          process.env.MAIL_CHIMP_LIST_UNIQUE_ID +
          "/members/" +
          emailHash
      )
      .set("Content-Type", "application/json;charset=utf-8")
      .set(
        "Authorization",
        "Basic " +
          Buffer.from("any:" + process.env.MAIL_CHIMP_API_KEY).toString(
            "base64"
          )
      )
      .send({
        status: "unsubscribed",
      })
      .end((error, response) => {
        if (
          response &&
          (response.status < 300 ||
            (response.status === 400 &&
              response.body.title === "Member Exists"))
        ) {
          res.status(200).json({
            message: "Newsletter unsubscribed successfully!",
          });
        } else {
          res
            .status(400)
            .send({ error: error ? error.message : "Unknown error" });
        }
      });
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
});

module.exports = {
  newsletterSignup,
  newsletterUnsubscribe,
};
