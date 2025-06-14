const mongoose = require('mongoose');
const userSubscriptionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    planId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Plan',
        required: true,
    },
    startDate: {
        type: Date,
        default: Date.now,
    },
    endDate: {
        type: Date,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    razorpaySubscriptionId: {
        type: String,
        unique: true,
        sparse: true,
    },
    paymentHistory: [
        {
            amount: Number,
            date: { type: Date, default: Date.now },
            status: { type: String, enum: ['success', 'failed', 'pending'] },
            razorpayPaymentId: { type: String, unique: true, sparse: true },
        },
    ],
});
const userSubscriptionModel = mongoose.model('UserSubscription', userSubscriptionSchema);
module.exports = userSubscriptionModel;

