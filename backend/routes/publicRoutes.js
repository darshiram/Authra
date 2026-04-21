import express from 'express';
import { getTestimonials, getPartners, getSponsors, submitContact } from '../controllers/publicController.js';

const router = express.Router();

router.get('/testimonials', getTestimonials);
router.get('/partners', getPartners);
router.get('/sponsors', getSponsors);
router.post('/contact', submitContact);

export default router;
