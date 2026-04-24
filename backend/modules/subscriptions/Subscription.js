import mongoose from 'mongoose';

const PLANS = ['free', 'starter', 'growth', 'enterprise', 'custom'];
const STATUSES = ['active', 'paused', 'past_due', 'canceled', 'trialing', 'unpaid'];

const subscriptionSchema = new mongoose.Schema({
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
  planId: { type: String, enum: PLANS, required: true, default: 'free' },
  status: { type: String, enum: STATUSES, default: 'active' },
  currentPeriodStart: { type: Date, default: Date.now },
  currentPeriodEnd: { type: Date, required: true },
  cancelAtPeriodEnd: { type: Boolean, default: false },

  // Seat & usage limits
  seatLimit: { type: Number, default: 5 },
  usageLimit: { type: Number, default: 100 }, // e.g. certificates per month

  // Trial
  trialEndsAt: { type: Date },

  // Custom pricing
  customPricingNotes: { type: String },
  customPriceOverride: { type: Number }, // cents

  // Invoice status placeholder
  lastInvoiceStatus: { type: String, enum: ['paid', 'pending', 'failed', 'none'], default: 'none' },

  // Admin tracking
  managedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  pausedAt: { type: Date },
  pausedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
}, { timestamps: true });

// Indexes for admin queries
subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ planId: 1 });
subscriptionSchema.index({ currentPeriodEnd: 1 });

export { PLANS, STATUSES };
export default mongoose.model('Subscription', subscriptionSchema);
