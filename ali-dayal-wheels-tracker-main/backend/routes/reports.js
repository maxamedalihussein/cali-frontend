const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const Car = require('../models/Car');

router.get('/summary', reportController.getSummary);

// New: GET /backup for data export
router.get('/backup', reportController.exportBackup);

// New: GET /receipt/:carId
router.get('/receipt/:carId', async (req, res) => {
  try {
    const car = await Car.findById(req.params.carId).populate('buyer');
    if (!car) return res.status(404).json({ error: 'Car not found' });
    res.json(car);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 