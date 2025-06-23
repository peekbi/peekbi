// routes/subscriptionRoutes.js
const authorization = require('../middlewares/authMiddleware');
const express = require('express');
const router = express.Router();
const { subscribeToPlan, getSubscriptionDetails } = require('../controller/subscriptionController');
// const authenticate = require('../middleware/authenticate');

router.post('/', authorization, subscribeToPlan);
router.get('/', authorization, getSubscriptionDetails);

module.exports = router;
