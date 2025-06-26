const razorpay = require('../utils/razorpayInstance');
const Plan = require('../model/planModel');
const UserSubscription = require('../model/userSubscriptionModel');
const UserUsage = require('../model/userUsageModel');
const PLAN_DEFAULTS = require('../utils/planDefaults');
const User = require('../model/userModel');

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

        // Step 1: Verify payment (only if status is 'success')
        if (status === 'success') {
            try {
                const payment = await razorpay.payments.fetch(razorpayPaymentId);
                isPaymentVerified = payment && payment.status === 'captured';
            } catch (verificationError) {
                await session.abortTransaction();
                return res.status(400).json({
                    message: 'Payment verification failed.',
                    error: verificationError.message,
                });
            }
        }

        const now = new Date();

        // Case: Payment is verified — proceed with full subscription setup
        if (isPaymentVerified) {
            // Step 2: Find or create plan
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

            // Optional: Keep plan in sync with defaults
            Object.assign(plan, {
                price: defaults.price,
                billingInterval: defaults.billingInterval,
                limits: defaults.limits,
                features: defaults.features,
            });
            await plan.save({ session });

            // Step 3: Calculate subscription end date
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

            // Step 4: Update or create subscription
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

            // Step 5: Update user record
            await User.findByIdAndUpdate(
                userId,
                {
                    $addToSet: { subscription: subscription._id },
                    subscriptionStatus: 'active',
                    currentPeriodEnd: endDate,
                },
                { session }
            );

            // Step 6: Reset usage
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

        // Case: Payment failed or unverified — just record failed payment
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