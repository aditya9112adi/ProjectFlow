import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

const studentDataSchema = new mongoose.Schema(
  {
    studentName: { type: String, required: true, trim: true },
    prn: { type: String, required: true, unique: true, trim: true },
    
    role: { type: String, default: 'student' }, // For jwt compatibility

    department: { type: String, trim: true, default: 'General' },
    academicYear: { type: String, trim: true, default: '2025' },
    section: { type: String, trim: true },
    phoneNumber: { type: String, trim: true },

    avatar: { type: String },
    refreshToken: { type: String },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },

    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', default: null },
  },
  { timestamps: true }
);

studentDataSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    { _id: this._id, prn: this.prn, role: this.role },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

studentDataSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    { _id: this._id, role: this.role },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
};

// Map virtual fields for existing frontend compatibility if needed
studentDataSchema.virtual('firstName').get(function () {
  return this.studentName.split(' ')[0] || '';
});

studentDataSchema.virtual('lastName').get(function () {
  return this.studentName.split(' ').slice(1).join(' ') || '';
});

studentDataSchema.virtual('rollNumber').get(function () {
  return this.prn.replace('@sguk.ac.in', '');
});

studentDataSchema.set('toJSON', { virtuals: true });

export const StudentData = mongoose.model('StudentData', studentDataSchema);
