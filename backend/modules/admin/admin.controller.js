import AuditLog from './AuditLog.js';
import Admin from './Admin.js';
import { isStrongPassword } from '../../core/utils/validation.js';

export const getAuditLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.action) query.action = req.query.action;
    if (req.query.actorId) query.actorId = req.query.actorId;

    const logs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('actorId', 'name email role');
      
    const total = await AuditLog.countDocuments(query);

    res.status(200).json({ status: 'success', data: { logs, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching audit logs', error: error.message });
  }
};

export const createAdminUser = async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    
    if (!isStrongPassword(password)) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long, contain an uppercase letter, a lowercase letter, a number, and a special character.' });
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) return res.status(400).json({ message: 'Admin with this email already exists' });

    const newAdmin = await Admin.create({
      email,
      password,
      name,
      role: role || 'admin'
    });

    res.status(201).json({ status: 'success', message: 'Admin created successfully', admin: { id: newAdmin._id, email: newAdmin.email, role: newAdmin.role } });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create admin', error: error.message });
  }
};
