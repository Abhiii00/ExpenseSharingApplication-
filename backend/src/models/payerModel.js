const mongoose = require("mongoose");

const payerSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

module.exports = payerSchema;
