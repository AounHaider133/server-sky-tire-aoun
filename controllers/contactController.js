const catchAsyncError = require("../middlewares/catchAsyncErrors");

const sendEmail = require("../utils/sendEmail");
const { contactFormSubmissionEmailMessage } = require("../utils/emailMessage");

const contactFormSubmission = catchAsyncError(async (req, res, next) => {
  try {
    const name = req.body.name;
    const phone = req.body.phone;
    const email = req.body.email;
    const message = req.body.message;

    const project = "Sky Tire";
    const projectLogo = `${process.env.REMOTE_CLIENT_URL}/public/assets/img/logo.png`;

    await sendEmail({
      email: process.env.ADMIN_EMAIL,
      subject: "Contact Form Query",
      html: contactFormSubmissionEmailMessage(
        projectLogo,
        project,
        name,
        phone,
        email,
        message
      ),
    });
    res.status(200).json({
      message: "Query submitted Successfully!",
    });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
});

module.exports = {
  contactFormSubmission,
};
