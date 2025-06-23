const mongoose = require('mongoose');

const usageSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
    uploads: { type: Number, default: 0 },
    downloads: { type: Number, default: 0 },
    analyse: { type: Number, default: 0 },
    aiPromts: { type: Number, default: 0 },
    reports: { type: Number, default: 0 },
    charts: { type: Number, default: 0 },
}, {
    timestamps: true
});

module.exports = mongoose.model('UserUsage', usageSchema);
