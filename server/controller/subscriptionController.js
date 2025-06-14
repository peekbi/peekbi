// controllers/subscriptionController.js

const Plan = require('../model/planModel');
const UserSubscription = require('../model/userSubscriptionModel');
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.subscribeToPlan = async (req, res) => {
    try {
        const { userId } = req.user; // via JWT middleware
        const { planId } = req.body;

        const plan = await Plan.findById(planId);
        if (!plan || !plan.isActive) {
            return res.status(404).json({ error: 'Plan not found' });
        }

        // Create Razorpay subscription
        const razorpaySub = await razorpay.subscriptions.create({
            plan_id: plan.razorpayPlanId,
            customer_notify: 1,
            total_count: plan.billingInterval === 'yearly' ? 12 : 1, // fallback
        });

        // Save Subscription
        const subscription = new UserSubscription({
            userId,
            planId,
            razorpaySubscriptionId: razorpaySub.id,
            startDate: new Date(),
            isActive: true,
        });

        await subscription.save();

        return res.json({
            message: 'Subscription created successfully',
            razorpaySubscriptionId: razorpaySub.id,
            subscription,
        });
    } catch (error) {
        console.error('Subscribe error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};
