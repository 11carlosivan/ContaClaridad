const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billingController');
const authMiddleware = require('../middleware/authMiddleware');

// Public route
router.get('/public-config', billingController.getPublicConfig);

// Authenticated routes
router.use(authMiddleware);

router.post('/subscribe', billingController.subscribe);
router.post('/unsubscribe', billingController.unsubscribe);
router.get('/paypal-config', billingController.getPayPalConfig);

module.exports = router;
