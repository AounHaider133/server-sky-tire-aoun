const forgetPasswordEmailMessage = (projectLogo, resetUrl, project) => {
  return `<div>
        <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 6px; padding: 20px;">
        <div style="width: 100%; text-align: center;">
        <img style="width: 70px; display: inline-block" src="${projectLogo}" alt="hospipro-logo"/>
        </div>
        <h2 style="text-align: center; color: #e8aa33">Reset Password</h2>
        <p style="text-align: center"> Please click the button below to reset your password for ${project} account </p>
        <div style="text-align: center; margin: 20px 0">
         <a href="${resetUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background-color: #e8aa33; color: #ffffff; text-decoration: none; padding: 12px 24px; font-size: 16px; border-radius: 4px;">Reset Password</a>
        </div>
        <p style="text-align: center"> If you have not performed this action, please ignore this email </p>
      </div>
    </div>
  </div>`;
};

const contactFormSubmissionEmailMessage = (
  projectLogo,
  project,
  name,
  phone,
  email,
  message
) => {
  return `<div>
        <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 6px; padding: 20px;">
        <div style="width: 100%; text-align: center;">
        <img style="width: 120px; display: inline-block" src="${projectLogo}" alt="Sky Tire"/>
        </div>
        <h2 style="text-align: center; color: #17aae0">Contact Form Query</h2>
        <p style="text-align: center">You received a query related to your ${project} business </p>
        <table>
            <tr style="vertical-align: top;">
              <td><h4 style="color: #17aae0"> Name: </h4></td>
              <td><p> ${name} </p></td>
            </tr>
            <tr style="vertical-align: top;">
              <td><h4 style="color: #17aae0"> Phone: </h4></td>
              <td><p> ${phone} </p></td>
            </tr>
            <tr style="vertical-align: top;">
              <td><h4 style="color: #17aae0"> Email: </h4></td>
              <td><p> ${email} </p></td>
            </tr>
            <tr style="vertical-align: top;">
              <td><h4 style="color: #17aae0"> Query: </h4></td>
              <td style="overflow-wrap: break-word; max-width: 530px;"><p> ${message} </p></td>
            </tr>
          </table>
      </div>
    </div>
  </div>`;
};

const orderConfirmationEmailMessage = (
  projectLogo,
  orderNo,
  name,
  deliveryDays,
  products,
  tireRecyclingFees,
  replacementCoveragePrice,
  roadsideAssistancePrice,
  shippingAndHandlingPrice,
  deliveryAddress,
  subTotalPrice,
  couponDetails,
  salesTaxPrice,
  stateFeesPrice,
  totalPrice
) => {
  const productDetails = products
    .map(
      (product) => `
    <tr style="margin-bottom: 20px">
      <td style="width: 45%">
        <div style="width: 100%; text-align: center">
          <img style="width: 160px; display: inline-block" src="${product.image}" alt="${product.model}"/>
        </div>
      </td>
      <td style="width: 55%; vertical-align: center; text-align: start;">
        <p style="font-size: 18px; font-weight: bold; margin: 2px 0">${product.brand}</p>
        <p style="font-size: 14px; margin: 2px 0; color: #666">${product.model}</p>
        <p style="font-size: 14px; margin: 2px 0; color: #666">${product.size}</p>
        <p style="font-size: 14px; margin: 2px 0; color: #666">Qty: ${product.quantity}</p>
      </td>
    </tr>
  `
    )
    .join("");

  const breakdownDetails = products
    .map(
      (product) => `
    <tr>
      <td style="padding: 10px 0; font-size: 14px; color: #666">
        ${product.brand} ${product.model} x ${product.quantity}
      </td>
      <td style="padding: 10px 0; font-size: 14px; text-align: right; font-weight: bold;">$${product.price.toFixed(
        2
      )} x ${product.quantity}</td>
    </tr>
  `
    )
    .join("");

  const deliveryTimeDetails = products
    .map(
      (product) => `
    <tr>
      <td style="padding: 0 10px">
        <p style="font-size: 14px; color: #666">${product.brand} ${product.model} x ${product.quantity}</p>
      </td>
      <td style="padding: 0 10px; text-align: right">
        <p style="font-size: 14px; font-weight: bold">${deliveryDays} Day(s)</p>
      </td>
    </tr>
  `
    )
    .join("");

  return `<div>
      <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 6px; padding: 10px;">
          <div style="width: 96%; background-color: #17aae0; height: 250px; padding: 10px 2%; border-radius: 8px;">
            <div style="width: 100%; text-align: center">
              <img style="width: 120px; display: inline-block" src="${projectLogo}" alt="Sky Tire"/>
            </div>
            <h4 style="line-height: 0px">Order # ${orderNo}</h4>
            <h1 style="color: #fff; line-height: 10px">Hi ${name},</h1>
            <h1 style="line-height: 5px">here's your order confirmation.</h1>
          </div>
          <div>
            <div style="width: 100%; max-width: 600px; padding: 20px; box-sizing: border-box;">
              <h2 style="margin-bottom: 20px">Order Status</h2>
              <table style="width: 100%; border-collapse: collapse">
                <tr style="margin-bottom: 20px">
                  <td style="width: 50px; padding: 0 10px">
                    <div style="width: 20px; height: 20px; border-radius: 50%; background-color: #17aae0; border: 2px solid #17aae0; display: flex; justify-content: center; align-items: center; margin: 0 auto;">
                      <span style="color: #fff; font-size: 14px; margin: 0 auto;">✓</span>
                    </div>
                    <div style="width: 0.5px; height: 25px; background-color: #17aae0; border: 2px solid #17aae0; margin: 0 auto;"></div>
                  </td>
                  <td style="padding: 0 10px; vertical-align: top">
                    <p style="font-size: 16px; font-weight: bold; margin: 0; color: #17aae0;">Order confirmed.</p>
                  </td>
                </tr>
                <tr style="position: relative; margin-bottom: 20px">
                  <td style="width: 50px; padding: 0 10px">
                    <div style="width: 20px; height: 20px; border-radius: 50%; background-color: #fff; border: 2px dashed #17aae0; display: flex; justify-content: center; align-items: center; margin: 0 auto;">
                      <span style="color: #fff; font-size: 14px"></span>
                    </div>
                    <div
                      style="width: 0.5px; height: 25px; background-color: #ddd; border: 2px solid #ddd; margin: 0 auto;"></div>
                  </td>
                  <td style="padding: 0 10px; vertical-align: top">
                    <p style="font-size: 16px; font-weight: bold; margin: 0">Ready for shipment</p>
                    <p style="font-size: 14px; color: #666; margin: 0; margin-top: 4px;">Typically ships today</p>
                  </td>
                </tr>
                <tr style="position: relative; margin-bottom: 20px">
                  <td style="width: 50px; padding: 0 10px; position: relative">
                    <div
                      style="width: 20px; height: 20px; border-radius: 50%; background-color: #fff; border: 2px solid #ddd; display: flex; justify-content: center; align-items: center; margin: 0 auto;">
                      <span style="color: #fff; font-size: 14px"></span>
                    </div>
                  </td>
                  <td style="padding: 0 10px; vertical-align: top">
                    <p style="font-size: 16px; font-weight: bold; margin: 0; color: #000;">Pending delivery</p>
                    <p style="font-size: 14px; color: #666; margin: 0; margin-top: 4px;">Estimated business days to delivery: ${deliveryDays} day(s)</p>
                  </td>
                </tr>
              </table>
            </div>
            <div style="width: 80%; height: 2px; background-color: #ddd; margin: 10% 10% 0;"></div>
          </div>
          <div>
            <div style="width: 100%; max-width: 600px; padding: 20px; box-sizing: border-box;">
              <h2 style="margin-bottom: 20px">Your Order</h2>
              <table style="width: 100%; border-collapse: collapse">
               ${productDetails}
              </table>
            </div>
            <div style="width: 80%; height: 2px; background-color: #ddd; margin: 10% 10% 0;"></div>
          </div>
          <div>
            <div style="width: 100%; max-width: 600px; padding: 20px; box-sizing: border-box; margin-top: 5%;">
              <div style="width: 100%; max-width: 600px; margin: 0 auto">
                <h4 style="margin-bottom: 20px">BREAKDOWN</h4>
                <table style="width: 100%">
                  ${breakdownDetails}
                  ${
                    tireRecyclingFees != 0
                      ? `<tr>
                    <td style="padding: 10px 0; font-size: 14px; color: #666">Tire Recycling Fees</td>
                    <td style="padding: 10px 0; font-size: 14px; text-align: right; font-weight: bold;">$${tireRecyclingFees.toFixed(
                      2
                    )}</td>
                  </tr>`
                      : ``
                  }
                  <tr>
                    <td style="padding: 10px 0; font-size: 14px; color: #666">Tire Replacement Coverage</td>
                    <td style="padding: 10px 0; font-size: 14px; text-align: right; font-weight: bold;">$${replacementCoveragePrice.toFixed(
                      2
                    )}</td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0; font-size: 14px; color: #666">24/7 roadside assistance</td>
                    <td style="padding: 5px 0; font-size: 14px; text-align: right; font-weight: bold;">$${roadsideAssistancePrice.toFixed(
                      2
                    )}</td>
                  </tr>
                </table>
              </div>
            </div>
            <div style="width: 80%; height: 2px; background-color: #ddd; margin: 10% 10% 0;"></div>
          </div>
          <div>
            <div style="width: 100%; max-width: 600px; padding: 20px; box-sizing: border-box; margin-top: 5%;">
              <table style="width: 100%; border-collapse: collapse">
                <tr>
                  <td style="padding: 0 10px">
                    <p style="font-size: 14px; color: #666">Shipping & Handling</p>
                  </td>
                  <td style="padding: 0 10px; text-align: right">
                    <p style="font-size: 14px; font-weight: bold">$ ${shippingAndHandlingPrice}</p>
                  </td>
                </tr>
                <tr><td colspan="2" style="padding: 0 10px"></td></tr>
                <tr>
                  <td style="padding: 0 10px">
                    <p style="font-size: 14px; font-weight: bold">Estimated delivery time</p>
                  </td>
                  <td style="padding: 0 10px; text-align: right"></td>
                </tr>
                ${deliveryTimeDetails}
                <tr><td colspan="2" style="padding: 0 10px"></td></tr>
                <tr>
                  <td colspan="2" style="padding: 0 10px">
                    <p style="font-size: 14px; font-weight: bold">SHIPPING TO</p>
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="padding: 0 10px">
                    <p style="font-size: 14px; color: #666">${deliveryAddress}</p>
                  </td>
                </tr>
              </table>
            </div>
            <div style="width: 80%; height: 2px; background-color: #ddd; margin: 10% 10% 0;"></div>
          </div>
          <div>
            <div style="width: 100%; max-width: 600px; padding: 20px; box-sizing: border-box;">
              <table style="width: 100%; border-collapse: collapse">
                <tr>
                  <td style="padding: 0 10px"><h3>Sub total</h3></td>
                  <td style="padding: 0 10px; text-align: right">
                    <p style="font-size: 14px; font-weight: bold">$${subTotalPrice.toFixed(
                      2
                    )}</p>
                  </td>
                </tr>
                 ${
                   couponDetails != ""
                     ? `<tr>
                  <td style="padding: 0 10px">
                    <p style="font-size: 14px; color: #666">Coupon</p>
                  </td>
                  <td style="padding: 0 10px; text-align: right">
                    <p style="font-size: 14px; font-weight: bold">${couponDetails}</p>
                  </td>
                </tr>`
                     : ``
                 }
              </table>
            </div>
            <div style="width: 80%; height: 2px; background-color: #ddd; margin: 0 10%;"></div>
          </div>
          <div>
            <div style="width: 100%; max-width: 600px; padding: 20px; box-sizing: border-box;">
              <table style="width: 100%; border-collapse: collapse">
                <tr>
                  <td style="padding: 0 10px">
                    <p style="font-size: 14px; color: #666">Sales tax</p>
                  </td>
                  <td style="padding: 0 10px; text-align: right">
                    <p style="font-size: 14px; font-weight: bold">$${salesTaxPrice.toFixed(
                      2
                    )}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 0 10px">
                    <p style="font-size: 14px; color: #666">State fees</p>
                  </td>
                  <td style="padding: 0 10px; text-align: right">
                    <p style="font-size: 14px; font-weight: bold">$${stateFeesPrice}</p>
                  </td>
                </tr>
              </table>
            </div>
            <div style="width: 80%; height: 2px; background-color: #ddd; margin: 0 10%;"></div>
          </div>
          <div>
            <div style="width: 100%; max-width: 600px; padding: 20px; box-sizing: border-box;">
              <table style="width: 100%; border-collapse: collapse">
                <tr>
                  <td style="padding: 0 10px"><h3>Total</h3></td>
                  <td style="padding: 0 10px; text-align: right">
                    <p style="font-size: 14px; font-weight: bold">$${totalPrice.toFixed(
                      2
                    )}</p>
                  </td>
                </tr>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>`;
};

module.exports = {
  forgetPasswordEmailMessage,
  contactFormSubmissionEmailMessage,
  orderConfirmationEmailMessage,
};
