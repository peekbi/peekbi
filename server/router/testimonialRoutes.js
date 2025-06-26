const express = require('express');
const router = express.Router();
const testimonialController = require('../controller/testimonialController');

// Public routes
router.post('/', testimonialController.createTestimonial); // users can post
router.get('/', testimonialController.getAllTestimonials); // landing page



module.exports = router;
