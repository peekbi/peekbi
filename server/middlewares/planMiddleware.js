const userModel = require('../model/userModel');
const userSubscriptionModel = require('../model/userSubscriptionModel');
const usageModel = require('../model/userUsageModel');

const planMiddleware = (featureKey) => {
    return async (req, res, next) => {
        try {
            const user = req.user;
            if (!user) {
                return res.status(401).json({ message: "Unauthorized: No user found." });
            }

            // Step 1: Try to get active subscription
            let subscription = await userSubscriptionModel
                .findOne({ userId: user._id, isActive: true })
                .populate('planId');

            let plan;

            if (subscription?.planId) {
                plan = subscription.planId; // ✅ Paid plan
            } else {
                const fullUser = await userModel.findById(user._id).populate('plan');

                if (!fullUser) {
                    console.log("User not found in DB:", user._id);
                    return res.status(403).json({ message: "User not found." });
                }

                if (!fullUser.plan) {
                    console.log("Populated plan is missing. Raw user:", fullUser);
                    return res.status(403).json({ message: "No plan assigned to user." });
                }

                plan = fullUser.plan;

            }

            const limit = plan.limits?.[featureKey];
            if (limit === undefined) {
                return res.status(400).json({ message: `Plan does not define a limit for: ${featureKey}` });
            }

            // Step 3: Usage tracking
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
