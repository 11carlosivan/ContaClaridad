const express = require('express');
const router = express.Router();
const recordsController = require('../controllers/recordsController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/', recordsController.addRecord);
router.get('/', recordsController.getRecords);
router.put('/:id', recordsController.updateRecord);
router.delete('/:id', recordsController.deleteRecord);
router.get('/report', recordsController.getReport);

module.exports = router;
