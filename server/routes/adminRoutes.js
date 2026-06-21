const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Protect all admin routes
router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/users', adminController.getUsersList);
router.put('/users/:id/subscription', adminController.toggleUserSubscription);
router.delete('/users/:id', adminController.deleteUser);
router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSettings);
router.get('/payments', adminController.getPaymentsList);
router.get('/analytics', adminController.getAnalyticsStats);

module.exports = router;
