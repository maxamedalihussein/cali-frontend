const Buyer = require('../models/Buyer');
const Car = require('../models/Car');
const ActivityLog = require('../models/ActivityLog');

// Helper to calculate totalCost and profit
function calculateTotals(car) {
  const totalCost = (car.purchasePrice || 0) + (car.repairCost || 0) + (car.governmentFees || 0) + (car.shippingCost || 0);
  const profit = car.sellingPrice ? car.sellingPrice - totalCost : undefined;
  return { totalCost, profit };
}

exports.addBuyer = async (req, res) => {
  try {
    // 1. Create buyer
    const buyer = new Buyer(req.body);
    await buyer.save();
    // 2. Update car with buyerId and status 'sold'
    if (buyer.carBought) {
      const car = await Car.findById(buyer.carBought);
      if (car) {
        car.status = 'sold';
        car.buyer = buyer._id;
        car.dateSold = new Date();
        // Optionally update sellingPrice if provided
        if (req.body.sellingPrice) car.sellingPrice = req.body.sellingPrice;
        // Recalculate totals
        const { totalCost, profit } = calculateTotals(car);
        car.totalCost = totalCost;
        car.profit = profit;
        await car.save();
      }
    }
    // Log activity
    await ActivityLog.create({
      user: req.user?.email || 'unknown',
      action: 'create',
      entity: 'Sale',
      entityId: buyer._id,
      details: { buyerName: buyer.buyerName, carBought: buyer.carBought }
    });
    res.status(201).json(buyer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAllBuyers = async (req, res) => {
  try {
    const buyers = await Buyer.find().populate('carBought');
    res.json(buyers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteBuyer = async (req, res) => {
  try {
    const buyer = await Buyer.findById(req.params.id);
    if (!buyer) return res.status(404).json({ error: 'Buyer not found' });
    // If buyer has a carBought, mark car as available and clear buyer/dateSold
    if (buyer.carBought) {
      const car = await Car.findById(buyer.carBought);
      if (car) {
        car.status = 'available';
        car.buyer = null;
        car.dateSold = null;
        await car.save();
      }
    }
    await Buyer.findByIdAndDelete(req.params.id);
    res.json({ message: 'Buyer deleted and related car marked as available (if any)' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}; 