// routes/subscriptionRoutes.js
const authorization = require('../middlewares/authMiddleware');
const express = require('express');
const router = express.Router();
const { subscribeToPlan, createOrder, getSubscriptionDetails, getUsageHistory } = require('../controller/subscriptionController');
// const authenticate = require('../middleware/authenticate');
router.post('/create-order', authorization, createOrder);
router.post('/', authorization, subscribeToPlan);
router.get('/', authorization, getSubscriptionDetails);
router.get('/uses', authorization, getUsageHistory);

module.exports = router;
