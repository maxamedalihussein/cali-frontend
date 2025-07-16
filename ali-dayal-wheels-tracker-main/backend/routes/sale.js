const express = require('express');
const router = express.Router();
const saleController = require('../controllers/saleController');

router.post('/sell', saleController.sellCar);

module.exports = router; 