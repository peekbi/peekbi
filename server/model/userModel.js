const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        userType: {
            type: String,
            enum: ['individual', 'business'],
            default: 'individual',
        },
        category: {
            type: String,
            enum: ['manufacturing', 'education', 'healthcare', 'technology', 'retail'],
        },
        businessType: {
            type: String,
            enum: ['B2B', 'B2C', 'C2C', 'C2B'],
            default: 'B2B'
        },
        phone: {
            type: Number,
            required: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
        },

        companyName: {
            type: String,
            trim: true,
        },

        role: {
            type: String,
            enum: ['user', 'admin', 'superadmin'],
            default: 'user',
        },

        // Subscription and plan details
        plan: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Plan',
        },
        subscription: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'UserSubscription',
        }],
        razorpayCustomerId: {
            type: String,
            unique: true,
            sparse: true,
        },
        subscriptionStatus: {
            type: String,
            enum: ['active', 'trialing', 'canceled', 'stoped'],
            default: 'trialing',
        },
        currentPeriodEnd: {
            type: Date,
            default: null,
        },

        createdAt: {
            type: Date,
            default: Date.now,
        },
        lastLogin: [{
            type: Date,
        }]
    },
    {
        timestamps: true,
    }
);
const userModel = mongoose.model('User', userSchema);
module.exports = userModel;