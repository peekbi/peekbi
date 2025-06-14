const express = require('express');
const router = express.Router();
const planController = require('../controller/planController');
// const authenticate = require('../middleware/authenticate');
const checkRole = require('../middlewares/roleMiddleware');

router.get('/', planController.getAllPlans);
router.get('/:id', planController.getPlanById);

// Admin only
router.post('/', checkRole(['admin']), planController.createPlan);
router.put('/:id', checkRole(['admin']), planController.updatePlan);
router.delete('/:id', checkRole(['admin']), planController.disablePlan);

module.exports = router;
