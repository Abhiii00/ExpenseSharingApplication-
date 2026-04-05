import mongoose from "mongoose";

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

export default payerSchema;
