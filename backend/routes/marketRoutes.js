const express = require('express');
const router = express.Router();
const marketController = require('../controllers/marketController');

router.post('/upload', marketController.uploadTariffs);

module.exports = router;
