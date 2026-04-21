import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  actorId: { type: mongoose.Schema.Types.ObjectId, required: true },
  actorModel: { type: String, required: true, enum: ['User', 'Admin', 'System'] },
  action: { type: String, required: true },
  resource: { type: String },
  resourceId: { type: mongoose.Schema.Types.ObjectId },
  ipAddress: { type: String },
  userAgent: { type: String },
  details: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

export default mongoose.model('AuditLog', auditLogSchema);
