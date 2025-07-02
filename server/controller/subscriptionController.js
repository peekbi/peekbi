const razorpay = require('../utils/razorpayInstance');
const Plan = require('../model/planModel');
const UserSubscription = require('../model/userSubscriptionModel');
const UserUsage = require('../model/userUsageModel');
const PLAN_DEFAULTS = require('../utils/planDefaults');
const User = require('../model/userModel');
const mongoose = require('mongoose');
const crypto = require('crypto');

exports.createOrder = async (req, res) => {
    try {
        const { planName } = req.body;
        const userId = req.user._id;

        const plan = PLAN_DEFAULTS[planName?.toLowerCase()];
        if (!plan) return res.status(400).json({ message: 'Invalid plan selected' });

        // ✅ Dynamic import inside function (ESM inside CommonJS)
        const { nanoid } = await import('nanoid');
        const receiptId = `r_${nanoid(20)}`; // Razorpay limit is 40 chars max

        const order = await razorpay.orders.create({
            amount: plan.price,
            currency: 'INR',
            receipt: receiptId,
            payment_capture: 1,
            notes: { planName, userId },
        });

        return res.status(200).json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
        });
    } catch (error) {
        console.error('❌ Razorpay order creation failed:', error);
        return res.status(500).json({ message: 'Order creation failed', error: error.message });
    }
};

// STEP 2: Handle Subscription Logic
exports.subscribeToPlan = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const userId = req.user._id;
        const {
            planName,
            razorpayPaymentId,
            razorpayOrderId,
            razorpaySignature,
            status, // add this field to your request body
            failReason,
        } = req.body;

        const now = new Date();

        if (!planName || !razorpayPaymentId || !razorpayOrderId || !status) {
            return res.status(400).json({ message: 'Missing required fields.' });
        }

        const defaults = PLAN_DEFAULTS[planName.toLowerCase()];
        if (!defaults) return res.status(400).json({ message: 'Invalid plan.' });

        // ⛔ Handle failed or non-success status early
        if (status !== 'success') {
            await UserSubscription.findOneAndUpdate(
                { userId },
                {
                    $push: {
                        paymentHistory: {
                            amount: defaults.price,
                            status,
                            failReason: failReason || 'Unknown error',
                            razorpayPaymentId,
                            razorpayOrderId,
                            razorpaySignature,
                            date: now,
                        },
                    },
                },
                { new: true, upsert: true, session }
            );

            await session.commitTransaction();
            session.endSession();
            return res.status(200).json({ message: 'Transaction recorded as failed.', status });
        }

        // ✅ Proceed only for successful payments

        // Signature verification
        const body = `${razorpayOrderId}|${razorpayPaymentId}`;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest('hex');

        if (expectedSignature !== razorpaySignature) {
            await session.abortTransaction();
            return res.status(400).json({ message: 'Signature verification failed' });
        }

        // Fetch & validate payment
        const payment = await razorpay.payments.fetch(razorpayPaymentId);
        if (!payment || payment.status !== 'captured') {
            await session.abortTransaction();
            return res.status(402).json({ message: 'Payment not captured or invalid' });
        }

        // Get or Create Plan
        let plan = await Plan.findOne({ name: planName.toLowerCase() }).session(session);
        if (!plan) {
            plan = await Plan.create([{
                name: planName.toLowerCase(),
                price: defaults.price,
                isActive: true,
                billingInterval: defaults.billingInterval,
                limits: defaults.limits,
                features: defaults.features,
            }], { session });
            plan = plan[0];
        }

        Object.assign(plan, defaults);
        plan.isActive = true;
        await plan.save({ session });

        // Calculate subscription end date
        const endDate = new Date(now);
        switch (plan.billingInterval) {
            case 'monthly': endDate.setMonth(endDate.getMonth() + 1); break;
            case 'yearly': endDate.setFullYear(endDate.getFullYear() + 1); break;
            case 'lifetime': endDate.setFullYear(endDate.getFullYear() + 100); break;
        }

        // Update UserSubscription
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
                        date: now,
                    },
                },
            },
            { new: true, upsert: true, session }
        );

        // Update User & Usage
        await User.findByIdAndUpdate(
            userId,
            {
                $addToSet: { subscription: subscription._id },
                $set: { plan: plan._id },
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
                download: 0,
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

    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        console.error('❌ Subscription error:', err);
        return res.status(500).json({ message: 'Internal server error', error: err.message });
    }
};

exports.assignPlanAsAdmin = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { planName, userId } = req.body;

        if (!planName || !userId) {
            return res.status(400).json({ message: 'Missing planName or userId' });
        }

        const now = new Date();
        const defaults = PLAN_DEFAULTS[planName.toLowerCase()];
        if (!defaults) return res.status(400).json({ message: 'Invalid plan name' });

        // Get or Create Plan
        let plan = await Plan.findOne({ name: planName.toLowerCase() }).session(session);
        if (!plan) {
            plan = await Plan.create([{
                name: planName.toLowerCase(),
                price: defaults.price,
                isActive: true,
                billingInterval: defaults.billingInterval,
                limits: defaults.limits,
                features: defaults.features,
            }], { session });
            plan = plan[0];
        }

        Object.assign(plan, defaults);
        plan.isActive = true;
        await plan.save({ session });

        // Calculate end date
        const endDate = new Date(now);
        switch (plan.billingInterval) {
            case 'monthly': endDate.setMonth(endDate.getMonth() + 1); break;
            case 'yearly': endDate.setFullYear(endDate.getFullYear() + 1); break;
            case 'lifetime': endDate.setFullYear(endDate.getFullYear() + 100); break;
        }

        // Update Subscription
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
                        amount: 0,
                        status: 'assigned_by_admin',
                        razorpayPaymentId: null,
                        razorpayOrderId: null,
                        razorpaySignature: null,
                        date: now,
                    },
                },
            },
            { new: true, upsert: true, session }
        );

        // Update User & Usage
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
                download: 0,
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
            message: '✅ Plan assigned to user successfully by admin.',
            subscription,
        });

    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        console.error('❌ Admin Plan Assignment Error:', err);
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
            download: usage.download || 0,
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