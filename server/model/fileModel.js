const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    originalName: String,
    s3Key: String,
    analysisS3Key: String, // Optional: if you store analysis results separately
    mimeType: String,
    sizeInBytes: Number,
    fileCategory: {
        type: String,
        trim: true,
        enum: ['Retail', 'Finance', 'Healthcare', 'Education', 'Technology', 'Manufacturing', 'General'],
    },
    uploadedAt: { type: Date, default: Date.now },
    downloadCount: { type: Number, default: 0 },
    analysis: {
        type: mongoose.Schema.Types.Mixed,
        summary: {
            type: mongoose.Schema.Types.Mixed
        },
        insights: {
            type: mongoose.Schema.Types.Mixed
        }
    },
    buffer: { type: mongoose.Schema.Types.Mixed, },
    analysisStatus: {
        type: String,
        enum: ['none', 'basic_ready', 'advanced_queued', 'advanced_ready', 'failed'],
        default: 'none'
    },
    advancedAnalysisQueuedAt: { type: Date },
    advancedAnalysisCompletedAt: { type: Date },
    advancedAnalysisError: { type: String }
});

const userFileSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    s3Bucket: { type: String, required: true },
    files: [fileSchema],
});

module.exports = mongoose.model('UserFile', userFileSchema);
