import mongoose from 'mongoose';

const teamLeaderPrnSchema = new mongoose.Schema(
  {
    prn: { type: String, required: true, unique: true, trim: true },
  },
  { timestamps: true }
);

export const TeamLeaderPrn = mongoose.model('TeamLeaderPrn', teamLeaderPrnSchema);
