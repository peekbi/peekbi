const razorpay = require('../utils/razorpayInstance');
const Plan = require('../model/planModel');
const UserSubscription = require('../model/userSubscriptionModel');
const UserUsage = require('../model/userUsageModel');
const PLAN_DEFAULTS = require('../utils/planDefaults');
const User = require('../model/userModel');
const mongoose = require('mongoose');


exports.subscribeToPlan = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const userId = req.user._id;
        const {
            planName,
            razorpayPaymentId,
            status,
            razorpayOrderId,
            razorpaySignature,
            failReason,
        } = req.body;

        if (!planName || !razorpayPaymentId || !status) {
            return res.status(400).json({ message: 'Missing required fields.' });
        }

        const defaults = PLAN_DEFAULTS[planName.toLowerCase()];
        if (!defaults) {
            return res.status(400).json({ message: 'Invalid plan selected.' });
        }

        let isPaymentVerified = false;

        // ✅ Step 1: Verify and capture payment if needed
        if (status === 'success') {
            try {
                const payment = await razorpay.payments.fetch(razorpayPaymentId);

                if (!payment) {
                    throw new Error('Unable to fetch payment.');
                }

                if (payment.status === 'authorized') {
                    // ✅ Auto-capture authorized payment
                    const captured = await razorpay.payments.capture(
                        razorpayPaymentId,
                        payment.amount,
                        payment.currency
                    );
                    isPaymentVerified = captured?.status === 'captured';
                } else if (payment.status === 'captured') {
                    isPaymentVerified = true;
                } else {
                    throw new Error(`Payment is not captured or authorized (status: ${payment.status})`);
                }
            } catch (verificationError) {
                await session.abortTransaction();
                return res.status(400).json({
                    message: 'Payment verification or capture failed.',
                    error: verificationError.message,
                });
            }
        }

        const now = new Date();

        // ✅ Step 2: Process subscription if payment verified
        if (isPaymentVerified) {
            let plan = await Plan.findOne({ name: planName.toLowerCase() }).session(session);
            if (!plan) {
                plan = await Plan.create(
                    [{
                        name: planName.toLowerCase(),
                        price: defaults.price,
                        isActive: true,
                        billingInterval: defaults.billingInterval,
                        limits: defaults.limits,
                        features: defaults.features,
                    }],
                    { session }
                );
                plan = plan[0];
            }

            // Optional: Keep plan data synced
            Object.assign(plan, {
                price: defaults.price,
                billingInterval: defaults.billingInterval,
                limits: defaults.limits,
                features: defaults.features,
            });
            await plan.save({ session });

            const endDate = new Date(now);
            switch (plan.billingInterval) {
                case 'monthly':
                    endDate.setMonth(now.getMonth() + 1);
                    break;
                case 'yearly':
                    endDate.setFullYear(now.getFullYear() + 1);
                    break;
                case 'lifetime':
                    endDate.setFullYear(now.getFullYear() + 100);
                    break;
            }

            const subscription = await UserSubscription.findOneAndUpdate(
                { userId },
                {
                    userId,
                    planId: plan._id,
                    startDate: now,
                    endDate,
                    isActive: true,
                    $push: {
                        paymentHistory: {
                            amount: plan.price,
                            status: 'success',
                            razorpayPaymentId,
                            razorpayOrderId,
                            razorpaySignature,
                            failReason,
                            date: now,
                        },
                    },
                },
                { new: true, upsert: true, session }
            );

            await User.findByIdAndUpdate(
                userId,
                {
                    $addToSet: { subscription: subscription._id },
                    subscriptionStatus: 'active',
                    currentPeriodEnd: endDate,
                },
                { session }
            );

            await UserUsage.findOneAndUpdate(
                { userId },
                {
                    userId,
                    uploads: 0,
                    downloads: 0,
                    analyse: 0,
                    aiPromts: 0,
                    reports: 0,
                    charts: 0,
                },
                { upsert: true, new: true, session }
            );

            await session.commitTransaction();
            session.endSession();

            return res.status(200).json({
                message: '✅ Subscription activated successfully.',
                subscription,
            });
        }

        // ❌ Case: Payment failed or unverified
        await UserSubscription.findOneAndUpdate(
            { userId },
            {
                $push: {
                    paymentHistory: {
                        amount: defaults.price,
                        status: 'failed',
                        razorpayPaymentId,
                        razorpayOrderId,
                        razorpaySignature,
                        failReason,
                        date: now,
                    },
                },
            },
            { upsert: true, new: true, session }
        );

        await session.commitTransaction();
        session.endSession();

        return res.status(402).json({
            message: '❌ Payment failed or unverified. Subscription not activated.',
        });

    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        console.error('❌ Subscription error:', err);
        return res.status(500).json({ message: 'Internal server error', error: err.message });
    }
};

exports.getSubscriptionDetails = async (req, res) => {
    try {
        const userId = req.user._id;

        // 1. Fetch subscription with plan populated
        const subscription = await UserSubscription.findOne({ userId })
            .populate('planId');

        if (!subscription || !subscription.planId) {
            return res.status(404).json({ message: 'No active subscription found.' });
        }

        // 2. Fetch usage
        const usage = await UserUsage.findOne({ userId }) || {};

        // 3. Fetch user subscription metadata
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const plan = subscription.planId;

        // 4. Build structured response
        const result = {
            currentPlan: {
                name: plan.name,
                price: plan.price,
                billingInterval: plan.billingInterval,
                limits: plan.limits,
                features: plan.features,
                isActive: subscription.isActive,
                startDate: subscription.startDate,
                endDate: subscription.endDate,
            },
            usage: {
                uploads: usage.uploads || 0,
                downloads: usage.downloads || 0,
                analyse: usage.analyse || 0,
                aiPromts: usage.aiPromts || 0,
                reports: usage.reports || 0,
                charts: usage.charts || 0,
            },
            userMeta: {
                subscriptionStatus: user.subscriptionStatus || 'none',
                currentPeriodEnd: user.currentPeriodEnd || null,
                razorpayCustomerId: user.razorpayCustomerId || null,
            },
            paymentHistory: subscription.paymentHistory.sort((a, b) => b.date - a.date),
        };

        return res.status(200).json(result);

    } catch (err) {
        console.error('❌ Error getting subscription details:', err);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.getUsageHistory = async (req, res) => {
    try {
        const userId = req.user._id;

        const usage = await UserUsage.findOne({ userId });

        if (!usage) {
            return res.status(404).json({ message: "No usage record found." });
        }

        return res.status(200).json({
            uploads: usage.uploads || 0,
            downloads: usage.downloads || 0,
            analyse: usage.analyse || 0,
            aiPromts: usage.aiPromts || 0,
            reports: usage.reports || 0,
            charts: usage.charts || 0,
            updatedAt: usage.updatedAt || null,
        });
    } catch (err) {
        console.error("❌ Error fetching usage history:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};