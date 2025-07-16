const express = require('express');
const router = express.Router();
const carController = require('../controllers/carController');

router.get('/', carController.getAllCars); // supports ?status=available or ?status=sold
router.post('/', carController.addCar);
router.put('/:id', carController.updateCar);
router.delete('/:id', carController.deleteCar);
// New sales endpoint
router.get('/sales', carController.getSales);
router.delete('/clear-by-time', carController.clearByTime);

module.exports = router; 