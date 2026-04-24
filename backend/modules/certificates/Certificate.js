import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema({
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  issueDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['issued', 'revoked', 'expired'], default: 'issued' },
  revocationReason: { type: String },
  revokedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  revokedAt: { type: Date }
}, { timestamps: true });

export default mongoose.model('Certificate', certificateSchema);
