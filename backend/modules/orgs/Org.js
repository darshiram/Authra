import mongoose from 'mongoose';

const organizationSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  domain: { type: String, unique: true, sparse: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isActive: { type: Boolean, default: true },
  settings: {
    mfaRequired: { type: Boolean, default: false },
    ssoEnabled: { type: Boolean, default: false }
  },
  status: { type: String, enum: ['active', 'banned', 'pending_verification'], default: 'active' },
  subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription' },
  banReason: { type: String },
  bannedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }
}, { timestamps: true });

export default mongoose.model('Organization', organizationSchema);
