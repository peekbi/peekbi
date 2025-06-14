const mongoose = require('mongoose');

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
            maxReports: Number,
            maxCharts: Number,
            maxUsersPerAccount: Number,
            dataRetentionDays: Number,
        },
        features: {
            scheduleReports: Boolean,
            exportAsPDF: Boolean,
            shareableDashboards: Boolean,
            emailSupport: Boolean,
            prioritySupport: Boolean,
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

module.exports = mongoose.model('Plan', planSchema);
