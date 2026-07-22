import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    driveLink: { type: String, required: true },

    status: {
      type: String,
      enum: ['submitted', 'under_review', 'approved', 'rejected'],
      default: 'submitted',
    },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
    adminComments: { type: String },
    remarks: { type: String },

    previousVersions: [
      {
        driveLink: String,
        submittedAt: Date,
        adminComment: String,
        version: Number,
      },
    ],

    submittedAt: { type: Date, default: Date.now },
    version: { type: Number, default: 1 },
  },
  { timestamps: true }
);

export const ReportSubmission = mongoose.model('ReportSubmission', reportSchema);
