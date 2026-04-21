import mongoose from 'mongoose';

const partnerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, enum: ['Technology', 'Education', 'Enterprise', 'Integration'], default: 'Technology' },
  logoUrl: { type: String, required: true },
  website: { type: String },
  description: { type: String },
  isFeatured: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true }, // Admin manageable
}, { timestamps: true });

export default mongoose.model('Partner', partnerSchema);
