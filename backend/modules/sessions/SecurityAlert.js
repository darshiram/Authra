import mongoose from 'mongoose';

const securityAlertSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  userModel: { type: String, required: true, enum: ['User', 'Admin'] },
  type: { 
    type: String, 
    enum: ['impossible_travel', 'many_failed_logins', 'new_device', 'suspicious_ip'], 
    required: true 
  },
  details: { type: mongoose.Schema.Types.Mixed },
  resolved: { type: Boolean, default: false },
  resolvedAt: { type: Date },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId }
}, { timestamps: true });

export default mongoose.model('SecurityAlert', securityAlertSchema);
