const express = require('express');
const router = express.Router();
const optimizerController = require('../controllers/optimizerController');

router.post('/run', optimizerController.runOptimizer);
router.get('/history', optimizerController.getHistory);

module.exports = router;
