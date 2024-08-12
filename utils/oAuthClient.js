const { google } = require("googleapis");
const { OAuth2 } = google.auth;

const oAuth2Client = new OAuth2(
  process.env.O_AUTH_2_CLIENT_CLIENT_ID,
  process.env.O_AUTH_2_CLIENT_CLIENT_SECRET,
  `${process.env.REMOTE_CLIENT_URL}/oauth2callback`
);

// Set the refresh token
oAuth2Client.setCredentials({
  refresh_token: process.env.O_AUTH_2_CLIENT_REFRESH_TOKEN,
});

// Create an instance of the Content API
const content = google.content({
  version: "v2.1",
  auth: oAuth2Client,
  timeout: 30000, // Increased to 30 seconds
});

const MAX_RETRIES = 5;
const RETRY_DELAY_BASE = 1000; // 1 second

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const retryWithExponentialBackoff = async (fn, retries = MAX_RETRIES) => {
  let attempt = 0;
  while (attempt < retries) {
    try {
      return await fn();
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed:`, error.message);
      if (
        attempt === retries - 1 ||
        ![500, 502, 503, 504].includes(error.code)
      ) {
        throw error;
      }
      const delay = RETRY_DELAY_BASE * Math.pow(2, attempt);
      console.log(`Retrying in ${delay}ms...`);
      await sleep(delay);
      attempt++;
    }
  }
};

module.exports = { content, retryWithExponentialBackoff, sleep };
