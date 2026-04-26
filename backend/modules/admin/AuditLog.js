import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  actorId: { type: mongoose.Schema.Types.ObjectId, required: true },
  actorModel: { type: String, required: true, enum: ['User', 'Admin', 'System'] },
  actorRole: { type: String }, // e.g. super_admin, admin
  action: { type: String, required: true },
  resource: { type: String },
  resourceId: { type: mongoose.Schema.Types.ObjectId },
  ipAddress: { type: String },
  userAgent: { type: String },
  device: { type: String },
  previousState: { type: mongoose.Schema.Types.Mixed }, // before values
  newState: { type: mongoose.Schema.Types.Mixed }, // after values
  notes: { type: String },
  details: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

// Indexes for performance
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ actorId: 1 });
auditLogSchema.index({ resourceId: 1 });
auditLogSchema.index({ actorModel: 1, actorId: 1 });

export default mongoose.model('AuditLog', auditLogSchema);
