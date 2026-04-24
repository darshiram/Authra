import Certificate from './Certificate.js';
import CertModeration from './CertModeration.js';

export const getAllCerts = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.organizationId) query.organizationId = req.query.organizationId;
    if (req.query.recipientId) query.recipientId = req.query.recipientId;
    if (req.query.search) {
      query.title = new RegExp(req.query.search, 'i');
    }
    if (req.query.dateFrom || req.query.dateTo) {
      query.issueDate = {};
      if (req.query.dateFrom) query.issueDate.$gte = new Date(req.query.dateFrom);
      if (req.query.dateTo) query.issueDate.$lte = new Date(req.query.dateTo);
    }

    const sortField = req.query.sort || 'createdAt';
    const sortOrder = req.query.order === 'asc' ? 1 : -1;

    const certs = await Certificate.find(query)
      .sort({ [sortField]: sortOrder })
      .skip(skip).limit(limit)
      .populate('organizationId', 'name slug')
      .populate('recipientId', 'email firstName lastName')
      .populate('revokedBy', 'name email');
    const total = await Certificate.countDocuments(query);

    res.status(200).json({ status: 'success', data: { certs, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching certificates', error: error.message });
  }
};

export const getCertDetails = async (req, res) => {
  try {
    const cert = await Certificate.findById(req.params.id)
      .populate('organizationId', 'name slug domain')
      .populate('recipientId', 'email firstName lastName')
      .populate('revokedBy', 'name email');
    if (!cert) return res.status(404).json({ message: 'Certificate not found' });

    // Fetch moderation timeline
    const timeline = await CertModeration.find({ certificateId: cert._id })
      .sort({ createdAt: -1 })
      .populate('adminActor', 'name email role');

    res.status(200).json({ status: 'success', data: { cert, timeline } });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching certificate details', error: error.message });
  }
};

export const toggleRevokeCert = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, action } = req.body; // action: 'revoke' or 'unrevoke'
    
    if (action === 'revoke' && !reason) {
      return res.status(400).json({ message: 'Revocation reason is required' });
    }

    const cert = await Certificate.findById(id);
    if (!cert) return res.status(404).json({ message: 'Certificate not found' });

    const beforeState = cert.status;

    if (action === 'revoke') {
      if (cert.status === 'revoked') {
        return res.status(400).json({ message: 'Certificate is already revoked' });
      }
      cert.status = 'revoked';
      cert.revocationReason = reason;
      cert.revokedBy = req.user._id;
      cert.revokedAt = Date.now();
    } else if (action === 'unrevoke') {
      if (cert.status !== 'revoked') {
        return res.status(400).json({ message: 'Certificate is not currently revoked' });
      }
      cert.status = 'issued';
      cert.revocationReason = undefined;
      cert.revokedBy = undefined;
      cert.revokedAt = undefined;
    } else {
      return res.status(400).json({ message: 'Invalid action. Use "revoke" or "unrevoke".' });
    }

    await cert.save({ validateBeforeSave: false });

    // Write to moderation timeline
    await CertModeration.create({
      certificateId: cert._id,
      adminActor: req.user._id,
      action: action.toUpperCase(),
      reason: reason || `Certificate ${action}d by admin`,
      beforeState,
      afterState: cert.status,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(200).json({ status: 'success', message: `Certificate ${action}d successfully`, data: { cert } });
  } catch (error) {
    res.status(500).json({ message: 'Error toggling certificate revocation', error: error.message });
  }
};

// Public verification endpoint — reflects revoked state
export const verifyCertPublic = async (req, res) => {
  try {
    const cert = await Certificate.findById(req.params.id)
      .populate('organizationId', 'name')
      .populate('recipientId', 'firstName lastName');
    if (!cert) return res.status(404).json({ status: 'error', message: 'Certificate not found' });

    res.status(200).json({
      status: 'success',
      data: {
        valid: cert.status === 'issued',
        certificateStatus: cert.status,
        title: cert.title,
        recipient: cert.recipientId ? `${cert.recipientId.firstName} ${cert.recipientId.lastName}` : 'Unknown',
        organization: cert.organizationId?.name || 'Unknown',
        issueDate: cert.issueDate,
        ...(cert.status === 'revoked' && {
          revokedAt: cert.revokedAt,
          revocationReason: cert.revocationReason,
        }),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error verifying certificate', error: error.message });
  }
};
