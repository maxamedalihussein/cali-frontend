const express = require('express');
const router = express.Router();
const buyerController = require('../controllers/buyerController');

router.get('/', buyerController.getAllBuyers);
router.post('/', buyerController.addBuyer);
router.delete('/:id', buyerController.deleteBuyer);

module.exports = router; 