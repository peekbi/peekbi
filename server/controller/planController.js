const Plan = require('../model/planModel');

// Create a new plan (Admin only)
exports.createPlan = async (req, res) => {
    try {
        const { name, price, razorpayPlanId, billingInterval, features, limits } = req.body;

        const existing = await Plan.findOne({ name });
        if (existing) return res.status(400).json({ error: 'Plan name already exists.' });

        const plan = new Plan({
            name,
            price,
            razorpayPlanId,
            billingInterval,
            features,
            ...limits,
        });

        await plan.save();
        res.status(201).json({ message: 'Plan created', plan });
    } catch (error) {
        console.error('Error creating plan:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get all active plans (Public)
exports.getAllPlans = async (req, res) => {
    try {
        const plans = await Plan.find({ isActive: true }).select('-__v -createdAt -updatedAt');
        res.json(plans);
    } catch (error) {
        console.error('Error fetching plans:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get plan by ID (optional)
exports.getPlanById = async (req, res) => {
    try {
        const plan = await Plan.findById(req.params.id);
        if (!plan) return res.status(404).json({ error: 'Plan not found' });
        res.json(plan);
    } catch (error) {
        console.error('Error fetching plan:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Update plan (Admin only)
exports.updatePlan = async (req, res) => {
    try {
        const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!plan) return res.status(404).json({ error: 'Plan not found' });
        res.json({ message: 'Plan updated', plan });
    } catch (error) {
        console.error('Error updating plan:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Soft delete plan (disable)
exports.disablePlan = async (req, res) => {
    try {
        const plan = await Plan.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
        if (!plan) return res.status(404).json({ error: 'Plan not found' });
        res.json({ message: 'Plan disabled', plan });
    } catch (error) {
        console.error('Error disabling plan:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};



