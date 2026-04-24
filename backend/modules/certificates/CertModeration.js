import mongoose from 'mongoose';

const certModerationSchema = new mongoose.Schema({
  certificateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Certificate', required: true, index: true },
  adminActor: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
  action: { type: String, enum: ['REVOKE', 'UNREVOKE'], required: true },
  reason: { type: String, required: true },
  beforeState: { type: String, enum: ['issued', 'revoked', 'expired'], required: true },
  afterState: { type: String, enum: ['issued', 'revoked', 'expired'], required: true },
  ipAddress: { type: String },
  userAgent: { type: String },
}, { timestamps: true });

certModerationSchema.index({ createdAt: -1 });
certModerationSchema.index({ certificateId: 1, createdAt: -1 });

export default mongoose.model('CertModeration', certModerationSchema);
