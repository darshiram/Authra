import mongoose from 'mongoose';

const testimonialSchema = new mongoose.Schema({
  author: { type: String, required: true },
  role: { type: String, required: true },
  company: { type: String },
  quote: { type: String, required: true },
  rating: { type: Number, default: 5 },
  industry: { type: String, default: 'General' },
  videoUrl: { type: String }, // Placeholder for future video feature
  isApproved: { type: Boolean, default: false }, // Admin manageable
}, { timestamps: true });

export default mongoose.model('Testimonial', testimonialSchema);
