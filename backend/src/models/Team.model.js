import mongoose from 'mongoose';
import crypto from 'crypto';

const teamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    teamCode: {
      type: String,
      unique: true,
      trim: true,
      default: () => 'TM-' + crypto.randomBytes(3).toString('hex').toUpperCase(),
    },
    description: { type: String, required: true, trim: true },
    projectDomain: { type: String, trim: true },

    members: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentData', required: true },
        role: { type: String, enum: ['leader', 'member'], default: 'member' },
        joinedAt: { type: Date, default: Date.now },
      },
    ],

    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', default: null },

    department: { type: String, trim: true },
    academicYear: { type: String, trim: true },
    section: { type: String, trim: true },

    maxSize: { type: Number, default: 4 },
    minSize: { type: Number, default: 3 },

    isActive: { type: Boolean, default: true },

    isLocked: { type: Boolean, default: true },
    editRequestStatus: { type: String, enum: ['none', 'pending', 'approved'], default: 'none' },
  },
  { timestamps: true }
);

teamSchema.virtual('memberCount').get(function () {
  return this.members.length;
});

teamSchema.virtual('leader').get(function () {
  return this.members.find((m) => m.role === 'leader');
});

teamSchema.set('toJSON', { virtuals: true });

export const Team = mongoose.model('Team', teamSchema);
