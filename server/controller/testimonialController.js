const Testimonial = require('../model/testimionialModel');

// Create testimonial (for users and admins)
exports.createTestimonial = async (req, res) => {
    try {
        const testimonial = new Testimonial(req.body);
        const savedTestimonial = await testimonial.save();
        res.status(201).json(savedTestimonial);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all testimonials (public landing page)
exports.getAllTestimonials = async (req, res) => {
    try {
        const testimonials = await Testimonial.find().sort({ createdAt: -1 });
        res.status(200).json(testimonials);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get single testimonial by ID (admin use)
exports.getTestimonialById = async (req, res) => {
    try {
        const testimonial = await Testimonial.findById(req.params.id);
        if (!testimonial) return res.status(404).json({ message: 'Testimonial not found' });
        res.status(200).json(testimonial);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update testimonial (admin use)
exports.updateTestimonial = async (req, res) => {
    try {
        const updated = await Testimonial.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: Date.now() },
            { new: true }
        );
        if (!updated) return res.status(404).json({ message: 'Testimonial not found' });
        res.status(200).json(updated);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete testimonial (admin use)
exports.deleteTestimonial = async (req, res) => {
    try {
        const deleted = await Testimonial.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Testimonial not found' });
        res.status(200).json({ message: 'Testimonial deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
