const mongoose = require('mongoose');
const PLAN_DEFAULTS = require('../utils/planDefaults');
const planSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            enum: ['free', 'premium', 'enterprise'],
            required: true,
        },
        razorpayPlanId: {
            type: String,
            unique: true,
            sparse: true,
        },
        price: {
            type: Number, // in paise
            required: true,
        },
        billingInterval: {
            type: String,
            enum: ['monthly', 'yearly', 'lifetime'],
            required: true,
        },

        limits: {
            uploads: Number,
            downloads: Number,
            analyse: Number,
            aiPromts: Number,
            reports: Number,
            charts: Number,
            maxUsersPerAccount: Number,
            dataRetentionDays: Number,
        },
        features: {
            scheduleReports: { type: Boolean, default: false },
            exportAsPDF: { type: Boolean, default: false },
            shareableDashboards: { type: Boolean, default: false },
            emailSupport: { type: Boolean, default: true },
            prioritySupport: { type: Boolean, default: false },
        },


        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);
// Auto-populate limits/features before save
planSchema.pre('validate', function (next) {
    const defaults = PLAN_DEFAULTS[this.name];
    if (defaults) {
        this.limits = defaults.limits;
        this.features = defaults.features;
    }
    next();
});

module.exports = mongoose.model('Plan', planSchema);
