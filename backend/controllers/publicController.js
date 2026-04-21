import Testimonial from '../models/Testimonial.js';
import Partner from '../models/Partner.js';
import Sponsor from '../models/Sponsor.js';
import Contact from '../models/Contact.js';

// Get approved testimonials
export const getTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ isApproved: true }).sort({ createdAt: -1 });
    res.status(200).json(testimonials);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching testimonials', error: error.message });
  }
};

// Get active partners
export const getPartners = async (req, res) => {
  try {
    const partners = await Partner.find({ isActive: true }).sort({ isFeatured: -1, createdAt: -1 });
    res.status(200).json(partners);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching partners', error: error.message });
  }
};

// Get active sponsor tiers
export const getSponsors = async (req, res) => {
  try {
    const sponsors = await Sponsor.find({ isActive: true }).sort({ price: -1 });
    res.status(200).json(sponsors);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sponsors', error: error.message });
  }
};

// Submit contact/inquiry form
export const submitContact = async (req, res) => {
  try {
    const { name, email, subject, message, type } = req.body;
    
    const newContact = new Contact({
      name,
      email,
      subject,
      message,
      type
    });

    await newContact.save();
    res.status(201).json({ message: 'Your message has been sent successfully. We will get back to you soon.' });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting contact form', error: error.message });
  }
};
