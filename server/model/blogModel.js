const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    tags: {
        type: [String],
        default: []
    },
    image: {
        type: String,
        default: null // URL or path to the image
    },
    author: {
        type: String,
        required: true,
        trim: true
    },
    isPublished: {
        type: Boolean,
        default: false
    },
    publishedAt: {
        type: Date,
        default: null // Set to null if not published
    },
    views: {
        type: Number,
        default: 0
    },
    categories: {
        type: [String],
        default: []
    },
    slug: {
        type: String,
        unique: true,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});
const blogModel = mongoose.model('Blog', blogSchema);
module.exports = blogModel;
