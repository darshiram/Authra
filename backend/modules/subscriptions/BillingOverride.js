import mongoose from 'mongoose';

const billingOverrideSchema = new mongoose.Schema({
  subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription', required: true, index: true },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
  adminActor: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
  action: { 
    type: String, 
    required: true, 
    enum: [
      'UPGRADE', 'DOWNGRADE', 'GRANT_TRIAL', 'PAUSE', 'RESUME', 
      'CANCEL', 'CHANGE_SEATS', 'CHANGE_USAGE_LIMIT', 'CUSTOM_PRICE', 'REACTIVATE'
    ] 
  },
  reason: { type: String, required: true },
  beforeState: {
    planId: String,
    status: String,
    seatLimit: Number,
    usageLimit: Number,
    trialEndsAt: Date,
    currentPeriodEnd: Date,
    customPriceOverride: Number,
  },
  afterState: {
    planId: String,
    status: String,
    seatLimit: Number,
    usageLimit: Number,
    trialEndsAt: Date,
    currentPeriodEnd: Date,
    customPriceOverride: Number,
  },
  ipAddress: { type: String },
  userAgent: { type: String },
}, { timestamps: true });

billingOverrideSchema.index({ createdAt: -1 });

export default mongoose.model('BillingOverride', billingOverrideSchema);
