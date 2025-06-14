const mongoose = require('mongoose');
const testimonialSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    designation: {
        type: String,
        required: true,
        trim: true
    },
    company: {
        type: String,
        required: true,
        trim: true
    },
    testimonialText: {
        type: String,
        required: true,
        trim: true
    },
    imageUrl: {
        type: String,
        default: null // URL or path to the image
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    ratings: {
        type: Number,
        min: 1,
        max: 5,
        default: 5 // Default rating is 5 stars
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const testimonialModel = mongoose.model('Testimonial', testimonialSchema);
module.exports = testimonialModel;