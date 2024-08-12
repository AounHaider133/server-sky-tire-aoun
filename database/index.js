const mongoose = require("mongoose");

mongoose.set("strictQuery", false);

const DB_OPTIONS = {
  dbName: process.env.DB_NAME,
  user: process.env.DB_USERNAME,
  pass: process.env.DB_PASSWORD,
  authSource: process.env.DB_AUTHSOURCE,
};

mongoose.connect(process.env.DB_CONNECTION, DB_OPTIONS).catch((err) => {
  console.log("Connection Error: ", err.message);
});

const db = mongoose.connection;

module.exports = db;
