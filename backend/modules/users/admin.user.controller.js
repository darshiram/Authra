import User from './User.js';
import Certificate from '../certificates/Certificate.js';
import AuditLog from '../admin/AuditLog.js';
import LoginEvent from '../sessions/LoginEvent.js';
import crypto from 'crypto';

export const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    
    const query = {};
    if (req.query.search) {
      query.$or = [
        { email: new RegExp(req.query.search, 'i') },
        { firstName: new RegExp(req.query.search, 'i') },
        { lastName: new RegExp(req.query.search, 'i') }
      ];
    }
    
    if (req.query.status) query.status = req.query.status;
    if (req.query.role) query.role = req.query.role;
    if (req.query.isActive !== undefined) query.isActive = req.query.isActive === 'true';

    // Sorting
    const sortParams = {};
    const sortField = req.query.sort || 'createdAt';
    const sortOrder = req.query.order === 'asc' ? 1 : -1;
    sortParams[sortField] = sortOrder;

    const users = await User.find(query).sort(sortParams).skip(skip).limit(limit).select('-password');
    const total = await User.countDocuments(query);

    res.status(200).json({ status: 'success', data: { users, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

export const getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password').populate('organizationId', 'name domain');
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Fetch issued certificates count
    const certificatesCount = await Certificate.countDocuments({ recipientId: user._id });

    // Fetch activity history (last 10 events)
    const auditLogs = await AuditLog.find({ actorId: user._id, actorModel: 'User' }).sort({ createdAt: -1 }).limit(5);
    const loginEvents = await LoginEvent.find({ userId: user._id }).sort({ timestamp: -1 }).limit(5);

    res.status(200).json({ 
      status: 'success', 
      data: { 
        user, 
        stats: { certificatesCount }, 
        history: { auditLogs, loginEvents } 
      } 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user details', error: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // In a real app, this would send an email with a reset link.
    // Here we generate a temporary password.
    const tempPassword = crypto.randomBytes(8).toString('hex') + 'A1!'; // Meets strong password policy
    
    user.password = tempPassword;
    await user.save({ validateBeforeSave: false });

    // TODO: Send email with tempPassword

    res.status(200).json({ status: 'success', message: 'Password reset successfully', data: { tempPassword } });
  } catch (error) {
    res.status(500).json({ message: 'Error resetting password', error: error.message });
  }
};

export const verifyUserEmail = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    
    await user.save({ validateBeforeSave: false });

    res.status(200).json({ status: 'success', message: 'User email manually verified', data: { user } });
  } catch (error) {
    res.status(500).json({ message: 'Error verifying email', error: error.message });
  }
};

export const editUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ status: 'success', data: { user } });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
};

export const toggleBanUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, action } = req.body; // action: 'ban' or 'unban'
    
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (action === 'ban') {
      user.status = 'banned';
      user.banReason = reason;
      user.bannedBy = req.user._id;
      user.bannedAt = Date.now();
      user.isActive = false;
    } else {
      user.status = 'active';
      user.banReason = undefined;
      user.bannedBy = undefined;
      user.bannedAt = undefined;
      user.isActive = true;
    }

    await user.save({ validateBeforeSave: false });
    res.status(200).json({ status: 'success', message: `User ${action}ned successfully`, data: { user } });
  } catch (error) {
    res.status(500).json({ message: 'Error toggling user ban', error: error.message });
  }
};
