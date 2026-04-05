import mongoose from "mongoose";
import participantSchema from "./participantModel.js";
import payerSchema from "./payerModel.js";

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
      enum: ["equal", "unequal"],
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

export default mongoose.model("Expense", expenseSchema);
