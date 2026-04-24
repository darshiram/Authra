import Organization from '../orgs/Org.js';
import User from '../users/User.js';
import Subscription from '../subscriptions/Subscription.js';
import Certificate from '../certificates/Certificate.js';
import { generateAccessToken } from '../../core/utils/jwt.js';

export const getAllOrgs = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    
    const query = {};
    if (req.query.search) {
      query.$or = [
        { name: new RegExp(req.query.search, 'i') },
        { domain: new RegExp(req.query.search, 'i') }
      ];
    }
    if (req.query.status) query.status = req.query.status;
    if (req.query.isActive !== undefined) query.isActive = req.query.isActive === 'true';

    // Sorting
    const sortParams = {};
    const sortField = req.query.sort || 'createdAt';
    const sortOrder = req.query.order === 'asc' ? 1 : -1;
    sortParams[sortField] = sortOrder;

    const orgs = await Organization.find(query).sort(sortParams).skip(skip).limit(limit)
      .populate('ownerId', 'email firstName lastName')
      .populate('subscriptionId', 'planId status currentPeriodEnd');
    const total = await Organization.countDocuments(query);

    res.status(200).json({ status: 'success', data: { orgs, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orgs', error: error.message });
  }
};

export const getOrgDetails = async (req, res) => {
  try {
    const org = await Organization.findById(req.params.id)
      .populate('ownerId', 'email firstName lastName')
      .populate('subscriptionId');
    if (!org) return res.status(404).json({ message: 'Organization not found' });

    const membersCount = await User.countDocuments({ organizationId: org._id });
    const certificatesCount = await Certificate.countDocuments({ organizationId: org._id });
    const revokedCount = await Certificate.countDocuments({ organizationId: org._id, status: 'revoked' });

    res.status(200).json({
      status: 'success',
      data: {
        org,
        stats: { membersCount, certificatesCount, revokedCount }
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching org details', error: error.message });
  }
};

export const getOrgMembers = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const members = await User.find({ organizationId: req.params.id })
      .skip(skip).limit(limit).select('-password');
    const total = await User.countDocuments({ organizationId: req.params.id });

    res.status(200).json({ status: 'success', data: { members, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching org members', error: error.message });
  }
};

export const impersonateOrg = async (req, res) => {
  try {
    const org = await Organization.findById(req.params.id);
    if (!org) return res.status(404).json({ message: 'Organization not found' });

    const owner = await User.findById(org.ownerId);
    if (!owner) return res.status(404).json({ message: 'Organization owner not found' });

    // Generate impersonation token (expires in 1 hour)
    const impersonationToken = generateAccessToken(owner._id, owner.role, 'User');

    res.status(200).json({
      status: 'success',
      message: 'Impersonation session started',
      data: { impersonationToken, org: { name: org.name, slug: org.slug } }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error starting impersonation', error: error.message });
  }
};

export const editOrg = async (req, res) => {
  try {
    const org = await Organization.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!org) return res.status(404).json({ message: 'Organization not found' });
    res.status(200).json({ status: 'success', data: { org } });
  } catch (error) {
    res.status(500).json({ message: 'Error updating organization', error: error.message });
  }
};

export const toggleBanOrg = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, action } = req.body;
    
    const org = await Organization.findById(id);
    if (!org) return res.status(404).json({ message: 'Organization not found' });

    if (action === 'ban') {
      org.status = 'banned';
      org.banReason = reason;
      org.bannedBy = req.user._id;
      org.isActive = false;
    } else {
      org.status = 'active';
      org.banReason = undefined;
      org.bannedBy = undefined;
      org.isActive = true;
    }

    await org.save({ validateBeforeSave: false });
    res.status(200).json({ status: 'success', message: `Organization ${action}ned successfully`, data: { org } });
  } catch (error) {
    res.status(500).json({ message: 'Error toggling org ban', error: error.message });
  }
};
