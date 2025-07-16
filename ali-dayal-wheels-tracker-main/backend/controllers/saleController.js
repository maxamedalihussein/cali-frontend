const Buyer = require('../models/Buyer');
const Car = require('../models/Car');

// Helper to calculate totalCost and profit
function calculateTotals(car) {
  const totalCost = (car.purchasePrice || 0) + (car.repairCost || 0) + (car.governmentFees || 0) + (car.shippingCost || 0);
  const profit = car.sellingPrice ? car.sellingPrice - totalCost : undefined;
  return { totalCost, profit };
}

exports.sellCar = async (req, res) => {
  try {
    const { carId, buyerName, phoneNumber, email, address, sellingPrice } = req.body;
    if (!carId || !buyerName || !sellingPrice) {
      return res.status(400).json({ error: 'carId, buyerName, and sellingPrice are required.' });
    }
    // 1. Create buyer
    const buyer = new Buyer({ buyerName, phoneNumber, email, address, carBought: carId });
    await buyer.save();
    // 2. Update car
    const car = await Car.findById(carId);
    if (!car) return res.status(404).json({ error: 'Car not found' });
    car.status = 'sold';
    car.buyer = buyer._id;
    car.sellingPrice = sellingPrice;
    car.dateSold = new Date();
    // Calculate totals
    const { totalCost, profit } = calculateTotals(car);
    car.totalCost = totalCost;
    car.profit = profit;
    await car.save();
    res.status(201).json({ car, buyer });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}; 