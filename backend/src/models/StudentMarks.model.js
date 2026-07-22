import mongoose from 'mongoose';

const studentMarksSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentData', required: true, unique: true },
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', default: null },
    proposalMarks: { type: Number, min: 0, max: 10, default: null },
    pptMarks: { type: Number, min: 0, max: 10, default: null },
    prototypeMarks: { type: Number, min: 0, max: 10, default: null },
    reportMarks: { type: Number, min: 0, max: 10, default: null },
    presentationMarks: { type: Number, min: 0, max: 10, default: null },
    totalMarks: { type: Number, min: 0, max: 50, default: 0 },
    evaluatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
    isLocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Pre-save hook to calculate total marks
studentMarksSchema.pre('save', function (next) {
  const proposal = this.proposalMarks || 0;
  const ppt = this.pptMarks || 0;
  const prototype = this.prototypeMarks || 0;
  const report = this.reportMarks || 0;
  const presentation = this.presentationMarks || 0;

  this.totalMarks = proposal + ppt + prototype + report + presentation;
  next();
});

export const StudentMarks = mongoose.model('StudentMarks', studentMarksSchema);
