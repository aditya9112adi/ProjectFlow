import mongoose from 'mongoose';

const teamInvitationSchema = new mongoose.Schema(
  {
    leader: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentData', required: true },
    invitee: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentData', required: true },
    teamName: { type: String, required: true },
    projectDomain: { type: String },
    description: { type: String },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

export const TeamInvitation = mongoose.model('TeamInvitation', teamInvitationSchema);
