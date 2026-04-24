import Subscription, { PLANS } from './Subscription.js';
import BillingOverride from './BillingOverride.js';

// Helper to snapshot subscription state
const snapshotState = (sub) => ({
  planId: sub.planId,
  status: sub.status,
  seatLimit: sub.seatLimit,
  usageLimit: sub.usageLimit,
  trialEndsAt: sub.trialEndsAt,
  currentPeriodEnd: sub.currentPeriodEnd,
  customPriceOverride: sub.customPriceOverride,
});

// Helper to create billing override record
const recordOverride = async (sub, orgId, adminId, action, reason, beforeState, req) => {
  await BillingOverride.create({
    subscriptionId: sub._id,
    organizationId: orgId,
    adminActor: adminId,
    action,
    reason,
    beforeState,
    afterState: snapshotState(sub),
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });
};

export const getAllSubs = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.planId) query.planId = req.query.planId;
    if (req.query.organizationId) query.organizationId = req.query.organizationId;

    const sortField = req.query.sort || 'createdAt';
    const sortOrder = req.query.order === 'asc' ? 1 : -1;

    const subs = await Subscription.find(query)
      .sort({ [sortField]: sortOrder })
      .skip(skip).limit(limit)
      .populate('organizationId', 'name domain slug')
      .populate('managedBy', 'name email')
      .populate('pausedBy', 'name email');
    const total = await Subscription.countDocuments(query);

    res.status(200).json({ status: 'success', data: { subs, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching subscriptions', error: error.message });
  }
};

export const getSubDetails = async (req, res) => {
  try {
    const sub = await Subscription.findById(req.params.id)
      .populate('organizationId', 'name domain slug')
      .populate('managedBy', 'name email')
      .populate('pausedBy', 'name email');
    if (!sub) return res.status(404).json({ message: 'Subscription not found' });

    const history = await BillingOverride.find({ subscriptionId: sub._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('adminActor', 'name email role');

    res.status(200).json({ status: 'success', data: { sub, history } });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching subscription details', error: error.message });
  }
};

export const changePlan = async (req, res) => {
  try {
    const { planId, reason } = req.body;
    if (!PLANS.includes(planId)) return res.status(400).json({ message: `Invalid plan. Must be one of: ${PLANS.join(', ')}` });
    if (!reason) return res.status(400).json({ message: 'Reason is required for plan changes' });

    const sub = await Subscription.findById(req.params.id);
    if (!sub) return res.status(404).json({ message: 'Subscription not found' });

    const before = snapshotState(sub);
    const oldPlanIndex = PLANS.indexOf(sub.planId);
    const newPlanIndex = PLANS.indexOf(planId);
    const action = newPlanIndex > oldPlanIndex ? 'UPGRADE' : 'DOWNGRADE';

    sub.planId = planId;
    sub.managedBy = req.user._id;
    await sub.save();

    await recordOverride(sub, sub.organizationId, req.user._id, action, reason, before, req);

    res.status(200).json({ status: 'success', message: `Plan ${action.toLowerCase()}d to ${planId}`, data: { sub } });
  } catch (error) {
    res.status(500).json({ message: 'Error changing plan', error: error.message });
  }
};

export const grantTrial = async (req, res) => {
  try {
    const { trialDays, reason } = req.body;
    if (!trialDays || trialDays < 1) return res.status(400).json({ message: 'trialDays must be at least 1' });
    if (!reason) return res.status(400).json({ message: 'Reason is required' });

    const sub = await Subscription.findById(req.params.id);
    if (!sub) return res.status(404).json({ message: 'Subscription not found' });

    const before = snapshotState(sub);
    sub.status = 'trialing';
    sub.trialEndsAt = new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000);
    sub.managedBy = req.user._id;
    await sub.save();

    await recordOverride(sub, sub.organizationId, req.user._id, 'GRANT_TRIAL', reason, before, req);

    res.status(200).json({ status: 'success', message: `${trialDays}-day trial granted`, data: { sub } });
  } catch (error) {
    res.status(500).json({ message: 'Error granting trial', error: error.message });
  }
};

export const pauseSubscription = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ message: 'Reason is required' });

    const sub = await Subscription.findById(req.params.id);
    if (!sub) return res.status(404).json({ message: 'Subscription not found' });
    if (sub.status === 'paused') return res.status(400).json({ message: 'Subscription is already paused' });

    const before = snapshotState(sub);
    sub.status = 'paused';
    sub.pausedAt = new Date();
    sub.pausedBy = req.user._id;
    sub.managedBy = req.user._id;
    await sub.save();

    await recordOverride(sub, sub.organizationId, req.user._id, 'PAUSE', reason, before, req);

    res.status(200).json({ status: 'success', message: 'Subscription paused', data: { sub } });
  } catch (error) {
    res.status(500).json({ message: 'Error pausing subscription', error: error.message });
  }
};

export const resumeSubscription = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ message: 'Reason is required' });

    const sub = await Subscription.findById(req.params.id);
    if (!sub) return res.status(404).json({ message: 'Subscription not found' });
    if (sub.status !== 'paused') return res.status(400).json({ message: 'Subscription is not paused' });

    const before = snapshotState(sub);
    sub.status = 'active';
    sub.pausedAt = undefined;
    sub.pausedBy = undefined;
    sub.managedBy = req.user._id;
    await sub.save();

    await recordOverride(sub, sub.organizationId, req.user._id, 'RESUME', reason, before, req);

    res.status(200).json({ status: 'success', message: 'Subscription resumed', data: { sub } });
  } catch (error) {
    res.status(500).json({ message: 'Error resuming subscription', error: error.message });
  }
};

export const cancelSubscription = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ message: 'Reason is required' });

    const sub = await Subscription.findById(req.params.id);
    if (!sub) return res.status(404).json({ message: 'Subscription not found' });

    const before = snapshotState(sub);
    sub.cancelAtPeriodEnd = true;
    sub.managedBy = req.user._id;
    await sub.save();

    await recordOverride(sub, sub.organizationId, req.user._id, 'CANCEL', reason, before, req);

    res.status(200).json({ status: 'success', message: 'Subscription set to cancel at end of billing period', data: { sub } });
  } catch (error) {
    res.status(500).json({ message: 'Error canceling subscription', error: error.message });
  }
};

export const updateLimits = async (req, res) => {
  try {
    const { seatLimit, usageLimit, reason } = req.body;
    if (!reason) return res.status(400).json({ message: 'Reason is required' });

    const sub = await Subscription.findById(req.params.id);
    if (!sub) return res.status(404).json({ message: 'Subscription not found' });

    const before = snapshotState(sub);
    let action = 'CHANGE_SEATS';

    if (seatLimit !== undefined) { sub.seatLimit = seatLimit; action = 'CHANGE_SEATS'; }
    if (usageLimit !== undefined) { sub.usageLimit = usageLimit; action = 'CHANGE_USAGE_LIMIT'; }
    sub.managedBy = req.user._id;
    await sub.save();

    await recordOverride(sub, sub.organizationId, req.user._id, action, reason, before, req);

    res.status(200).json({ status: 'success', message: 'Limits updated', data: { sub } });
  } catch (error) {
    res.status(500).json({ message: 'Error updating limits', error: error.message });
  }
};

export const setCustomPricing = async (req, res) => {
  try {
    const { customPriceOverride, customPricingNotes, reason } = req.body;
    if (!reason) return res.status(400).json({ message: 'Reason is required' });

    const sub = await Subscription.findById(req.params.id);
    if (!sub) return res.status(404).json({ message: 'Subscription not found' });

    const before = snapshotState(sub);
    if (customPriceOverride !== undefined) sub.customPriceOverride = customPriceOverride;
    if (customPricingNotes !== undefined) sub.customPricingNotes = customPricingNotes;
    sub.managedBy = req.user._id;
    await sub.save();

    await recordOverride(sub, sub.organizationId, req.user._id, 'CUSTOM_PRICE', reason, before, req);

    res.status(200).json({ status: 'success', message: 'Custom pricing set', data: { sub } });
  } catch (error) {
    res.status(500).json({ message: 'Error setting custom pricing', error: error.message });
  }
};
