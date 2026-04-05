const dotenv = require("dotenv");

dotenv.config();

const env = {
  port: process.env.PORT || 8000,
  mongoUri: process.env.MONGO_URI || "",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
};

module.exports = { env };
