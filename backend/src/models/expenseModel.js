const mongoose = require("mongoose");
const participantSchema = require("./participantModel");
const payerSchema = require("./payerModel");

const expenseSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      trim: true,
      default: "",
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    splitType: {
      type: String,
      enum: ["equal", "unequal", "ratio", "percentage"],
      default: "equal",
    },
    payer: {
      type: payerSchema,
      required: true,
    },
    participants: {
      type: [participantSchema],
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

expenseSchema.index({ isDeleted: 1, createdAt: -1 });

module.exports = mongoose.model("Expense", expenseSchema);
