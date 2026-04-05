import mongoose from "mongoose";

const participantSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      trim: true,
    },
    share: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

export default participantSchema;
