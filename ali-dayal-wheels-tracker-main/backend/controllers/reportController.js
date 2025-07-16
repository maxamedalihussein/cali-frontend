const Car = require('../models/Car');
const Buyer = require('../models/Buyer');

exports.getSummary = async (req, res) => {
  try {
    const totalCarsBought = await Car.countDocuments();
    const totalCarsSold = await Car.countDocuments({ status: 'sold' });
    const profitAgg = await Car.aggregate([
      { $match: { status: 'sold' } },
      { $group: { _id: null, totalProfit: { $sum: { $ifNull: ["$profit", 0] } } } }
    ]);
    const totalProfit = profitAgg[0]?.totalProfit || 0;
    res.json({ totalCarsBought, totalCarsSold, totalProfit });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Export all data for backup
exports.exportBackup = async (req, res) => {
  try {
    const cars = await Car.find().lean();
    const buyers = await Buyer.find().lean();
    res.setHeader('Content-Disposition', 'attachment; filename="cali-dayax-backup.json"');
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({ cars, buyers, date: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 