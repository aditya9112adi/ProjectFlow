import mongoose from 'mongoose';

const prototypeSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    githubRepo: { type: String, required: true },
    liveUrl: { type: String, required: true },

    status: {
      type: String,
      enum: ['submitted', 'under_review', 'approved', 'rejected'],
      default: 'submitted',
    },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
    adminComments: { type: String },
    remarks: { type: String },

    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const PrototypeSubmission = mongoose.model('PrototypeSubmission', prototypeSchema);
