import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['super_admin', 'admin'], default: 'admin' },
  twoFactorSecret: { type: String },
  twoFactorEnabled: { type: Boolean, default: true },
  otp: { type: String },
  otpExpires: { type: Date },
  otpResendCooldown: { type: Date },
  failedOtpAttempts: { type: Number, default: 0 },
  accountLockedUntil: { type: Date },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
}, { timestamps: true });

adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

adminSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('Admin', adminSchema);
