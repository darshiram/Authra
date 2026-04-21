import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  userModel: { type: String, required: true, enum: ['User', 'Admin'] },
  refreshToken: { type: String, required: true, unique: true },
  
  // Advanced tracking
  browser: { type: String },
  os: { type: String },
  deviceType: { type: String },
  ipAddress: { type: String },
  country: { type: String },
  city: { type: String },
  
  deviceFingerprint: { type: String },
  lastActive: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  isRevoked: { type: Boolean, default: false }
}, { timestamps: true });

// TTL Index for automatic cleanup
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('Session', sessionSchema);
