import mongoose from 'mongoose';

const teamMarksSchema = new mongoose.Schema(
  {
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true, unique: true },
    proposalMarks: { type: Number, min: 0, max: 10, default: null },
    pptMarks: { type: Number, min: 0, max: 20, default: null },
    prototypeMarks: { type: Number, min: 0, max: 30, default: null },
    reportMarks: { type: Number, min: 0, max: 40, default: null },
    totalMarks: { type: Number, min: 0, max: 100, default: 0 },
    evaluatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
  },
  { timestamps: true }
);

// Pre-save hook to calculate total marks
teamMarksSchema.pre('save', function (next) {
  const proposal = this.proposalMarks || 0;
  const ppt = this.pptMarks || 0;
  const prototype = this.prototypeMarks || 0;
  const report = this.reportMarks || 0;

  this.totalMarks = proposal + ppt + prototype + report;
  next();
});

export const TeamMarks = mongoose.model('TeamMarks', teamMarksSchema);
