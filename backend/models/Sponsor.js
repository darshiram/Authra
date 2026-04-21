import mongoose from 'mongoose';

const sponsorSchema = new mongoose.Schema({
  tier: { type: String, enum: ['Platinum', 'Gold', 'Silver', 'Bronze'], required: true },
  price: { type: Number, required: true },
  benefits: [{ type: String }],
  isActive: { type: Boolean, default: true }, // Admin manageable
}, { timestamps: true });

export default mongoose.model('Sponsor', sponsorSchema);
