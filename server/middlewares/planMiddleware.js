const userModel = require('../model/userModel');
const userSubscriptionModel = require('../model/userSubscriptionModel');
const usageModel = require('../model/userUsageModel');
const planModel = require('../model/planModel');

const planMiddleware = (featureKey) => {
    return async (req, res, next) => {
        try {
            const user = req.user;
            if (!user) return res.status(401).json({ message: "Unauthorized: No user found." });

            const now = new Date();

            // Step 1: Fetch full user, subscription, and plan
            let fullUser = await userModel.findById(user._id).lean();
            if (!fullUser) return res.status(403).json({ message: "User not found." });

            let subscription = await userSubscriptionModel.findOne({
                userId: user._id,
            }).populate('planId');

            let plan = subscription?.planId;

            // Step 2: Expiry & status check — auto deactivate if needed
            const isExpired = fullUser.currentPeriodEnd && new Date(fullUser.currentPeriodEnd) < now;

            if (
                fullUser.subscriptionStatus === 'active' &&
                subscription?.isActive &&
                plan?.isActive &&
                isExpired
            ) {
                // Mark all as inactive
                await Promise.all([
                    userModel.findByIdAndUpdate(user._id, {
                        subscriptionStatus: 'stoped',
                    }),
                    userSubscriptionModel.findByIdAndUpdate(subscription._id, {
                        isActive: false,
                    }),
                    planModel.findByIdAndUpdate(plan._id, {
                        isActive: false,
                    }),
                ]);

                return res.status(403).json({ message: "Your plan has expired. Please renew to continue." });
            }

            // Step 3: Check all active flags now
            if (
                fullUser.subscriptionStatus !== 'active' ||
                !subscription?.isActive ||
                !plan?.isActive
            ) {
                return res.status(403).json({ message: "Inactive or expired plan. Access denied." });
            }

            // Step 4: Check feature limit
            const limit = plan.limits?.[featureKey];
            if (limit === undefined) {
                return res.status(400).json({ message: `Plan does not define a limit for: ${featureKey}` });
            }


            // Step 5: Usage tracking
            const usage = await usageModel.findOne({ userId: user._id }) || new usageModel({ userId: user._id });
            const current = usage[featureKey] || 0;
            if (current >= limit) {
                return res.status(403).json({
                    message: `Limit exceeded for ${featureKey}. Used: ${current}/${limit}. Upgrade your plan.`,
                });
            }

            req.planUsage = { usage, featureKey };
            next();

        } catch (err) {
            console.error("🔧 Plan Middleware Error:", err);
            res.status(500).json({ message: "Server error during plan validation." });
        }
    };
};

module.exports = planMiddleware;
