import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  action: { type: String, enum: ['approved', 'rejected', 'returned'] },
  comments: { type: String },
  reviewedAt: { type: Date, default: Date.now },
});

const phaseSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['not_started', 'submitted', 'under_review', 'approved', 'rejected'],
    default: 'not_started',
  },
  submittedAt: { type: Date },
  approvedAt: { type: Date },
  version: { type: Number, default: 0 },
  reviews: [reviewSchema],
});

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true },
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },

    department: { type: String, trim: true },
    academicYear: { type: String, trim: true },
    section: { type: String, trim: true },

    // Overall project status
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed', 'on_hold'],
      default: 'not_started',
    },

    // Current active phase
    currentPhase: {
      type: String,
      enum: ['proposal', 'ppt', 'report', 'prototype', 'completed'],
      default: 'proposal',
    },

    // Progress percentage
    progress: { type: Number, default: 0, min: 0, max: 100 },

    // Phase tracking
    phases: {
      proposal: { type: phaseSchema, default: () => ({}) },
      ppt: { type: phaseSchema, default: () => ({}) },
      report: { type: phaseSchema, default: () => ({}) },
      prototypePhase: { type: phaseSchema, default: () => ({}) },
    },

    // References to phase submissions
    proposalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Proposal' },
    pptId: { type: mongoose.Schema.Types.ObjectId, ref: 'PPTSubmission' },
    reportId: { type: mongoose.Schema.Types.ObjectId, ref: 'ReportSubmission' },
    prototypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'PrototypeSubmission' },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Utility to recalculate progress
projectSchema.methods.recalculateProgress = function () {
  const phases = ['proposal', 'ppt', 'prototypePhase', 'report'];
  let done = 0;
  phases.forEach((p) => {
    if (this.phases[p]?.status === 'approved') done++;
  });
  this.progress = Math.round((done / phases.length) * 100);

  // Update current phase
  if (done === 4) {
    this.currentPhase = 'completed';
    this.status = 'completed';
  } else {
    this.currentPhase = phases[done] === 'prototypePhase' ? 'prototype' : phases[done];
    this.status = 'in_progress';
  }
};

projectSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    if (ret.phases && ret.phases.prototypePhase) {
      ret.phases.prototype = ret.phases.prototypePhase;
      delete ret.phases.prototypePhase;
    }
    return ret;
  }
});

export const Project = mongoose.model('Project', projectSchema);
