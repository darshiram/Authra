import mongoose from 'mongoose';

const loginEventSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  userModel: { type: String, required: true, enum: ['User', 'Admin'] },
  timestamp: { type: Date, default: Date.now },
  role: { type: String },
  location: {
    country: { type: String },
    city: { type: String },
    ipAddress: { type: String }
  },
  device: {
    browser: { type: String },
    os: { type: String },
    deviceType: { type: String }
  },
  deviceFingerprint: { type: String },
  suspiciousFlag: { type: Boolean, default: false },
  status: { type: String, enum: ['success', 'failed'], default: 'success' }
}, { timestamps: true });

export default mongoose.model('LoginEvent', loginEventSchema);
