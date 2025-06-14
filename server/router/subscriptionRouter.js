// routes/subscriptionRoutes.js

const express = require('express');
const router = express.Router();
const { subscribeToPlan } = require('../controller/subscriptionController');
// const authenticate = require('../middleware/authenticate');

router.post('/subscribe', subscribeToPlan);

module.exports = router;
