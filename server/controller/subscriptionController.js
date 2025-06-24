const razorpay = require('../utils/razorpayInstance');
const Plan = require('../model/planModel');
const UserSubscription = require('../model/userSubscriptionModel');
const UserUsage = require('../model/userUsageModel');
const PLAN_DEFAULTS = require('../utils/planDefaults');
const User = require('../model/userModel');

exports.subscribeToPlan = async (req, res) => {
    try {
        const userId = req.user._id;
        const { planName, razorpayPaymentId, status, test = false } = req.body;

        const defaults = PLAN_DEFAULTS[planName.toLowerCase()];
        if (!defaults) {
            return res.status(400).json({ message: 'Invalid plan selected.' });
        }

        // ✅ (Optional but secure) Verify payment with Razorpay

        if (test) {
            // 🔧 TEST MODE: Simulate payment verification
            console.log('🔁 Test mode enabled — skipping Razorpay verification');
            isPaymentVerified = status === 'success';
        } else if (status === 'success' && razorpayPaymentId) {
            try {
                const payment = await razorpay.payments.fetch(razorpayPaymentId);
                isPaymentVerified = payment && payment.status === 'captured';
            } catch (err) {
                console.error('Razorpay verification failed:', err.message);
                return res.status(400).json({ message: 'Payment verification failed.' });
            }
        }

        // ✅ Find or create plan
        let plan = await Plan.findOne({ name: planName.toLowerCase() });
        if (!plan) {
            plan = await Plan.create({
                name: planName.toLowerCase(),
                price: defaults.price,
                isActive: true,
                billingInterval: defaults.billingInterval,
                limits: defaults.limits,
                features: defaults.features,
            });
        } else {
            // Optional: Keep plan in sync with PLAN_DEFAULTS
            plan.price = defaults.price;
            plan.limits = defaults.limits;
            plan.features = defaults.features;
            plan.billingInterval = defaults.billingInterval;
            await plan.save();
        }

        // ✅ Calculate expiration
        const now = new Date();
        const endDate = new Date(now);
        if (plan.billingInterval === 'monthly') endDate.setMonth(now.getMonth() + 1);
        else if (plan.billingInterval === 'yearly') endDate.setFullYear(now.getFullYear() + 1);
        else if (plan.billingInterval === 'lifetime') endDate.setFullYear(now.getFullYear() + 100);

        // ✅ Save or update subscription
        const subscription = await UserSubscription.findOneAndUpdate(
            { userId },
            {
                userId,
                planId: plan._id,
                startDate: now,
                endDate,
                isActive: isPaymentVerified,
                $push: {
                    paymentHistory: {
                        amount: plan.price,
                        status: isPaymentVerified ? 'success' : 'failed',
                        razorpayPaymentId,
                        date: now,
                    },
                },
            },
            { new: true, upsert: true }
        );

        // ✅ Update user's subscription details
        if (isPaymentVerified) {
            await User.findByIdAndUpdate(
                userId,
                {
                    $addToSet: { subscription: subscription._id }, // add if not already in array
                    subscriptionStatus: 'active',
                    currentPeriodEnd: endDate,
                    ...(test && !razorpayPaymentId && { razorpayCustomerId: 'test_dummy_customer' }) // optional dummy ID
                },
                { new: true }
            );
        }
        // ✅ Reset usage if success
        if (isPaymentVerified) {
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
                { new: true, upsert: true }
            );
        }

        return res.status(200).json({
            message: isPaymentVerified
                ? '✅ Plan activated successfully.'
                : '⚠️ Payment failed or unverified. Plan not activated.',
            subscription,
        });

    } catch (err) {
        console.error('❌ Subscribe Error:', err);
        res.status(500).json({ message: 'Internal Server Error' });
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