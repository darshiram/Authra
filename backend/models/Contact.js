import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['Support', 'Sales', 'Partnership', 'Sponsorship', 'Other'], default: 'Other' },
  status: { type: String, enum: ['New', 'In Progress', 'Resolved'], default: 'New' }, // Admin manageable
}, { timestamps: true });

export default mongoose.model('Contact', contactSchema);
