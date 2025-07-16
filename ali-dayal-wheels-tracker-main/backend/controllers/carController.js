const Car = require('../models/Car');
const ActivityLog = require('../models/ActivityLog');

// Helper to calculate totalCost and profit
function calculateTotals(car) {
  const totalCost = (car.purchasePrice || 0) + (car.repairCost || 0) + (car.governmentFees || 0) + (car.shippingCost || 0);
  const profit = car.sellingPrice ? car.sellingPrice - totalCost : undefined;
  return { totalCost, profit };
}

exports.getAllCars = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const cars = await Car.find(filter).populate('buyer');
    res.json(cars);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addCar = async (req, res) => {
  try {
    // Generate next receipt number
    const lastCar = await Car.findOne({}, {}, { sort: { receiptNumber: -1 } });
    let nextReceiptNum = 1000;
    if (lastCar && lastCar.receiptNumber) {
      // Extract numeric part and increment
      const match = lastCar.receiptNumber.match(/CR0*(\d+)/);
      if (match) {
        nextReceiptNum = parseInt(match[1], 10) + 1;
      }
    }
    const receiptNumber = `CR${String(nextReceiptNum).padStart(6, '0')}`;
    req.body.receiptNumber = receiptNumber;
    req.body.receiptDate = new Date();
    const car = new Car(req.body);
    // Calculate totals before save
    const { totalCost, profit } = calculateTotals(car);
    car.totalCost = totalCost;
    car.profit = profit;
    await car.save();
    // Log activity
    await ActivityLog.create({
      user: req.user?.email || 'unknown',
      action: 'create',
      entity: 'Car',
      entityId: car._id,
      details: { carName: car.carName }
    });
    res.status(201).json(car);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateCar = async (req, res) => {
  try {
    // Convert date fields to JS Date objects if present
    if (req.body.datePurchased) req.body.datePurchased = new Date(req.body.datePurchased);
    if (req.body.dateSold) req.body.dateSold = new Date(req.body.dateSold);
    const car = await Car.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    // Recalculate totals after update
    if (car) {
      const { totalCost, profit } = calculateTotals(car);
      car.totalCost = totalCost;
      car.profit = profit;
      await car.save();
      // Log activity
      await ActivityLog.create({
        user: req.user?.email || 'unknown',
        action: 'update',
        entity: 'Car',
        entityId: car._id,
        details: { carName: car.carName }
      });
    }
    res.json(car);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteCar = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ error: 'Car not found' });
    // If car has a buyer, delete the buyer
    if (car.buyer) {
      const Buyer = require('../models/Buyer');
      await Buyer.findByIdAndDelete(car.buyer);
    }
    await Car.findByIdAndDelete(req.params.id);
    // Log activity
    await ActivityLog.create({
      user: req.user?.email || 'unknown',
      action: 'delete',
      entity: 'Car',
      entityId: car._id,
      details: { carName: car.carName }
    });
    res.json({ message: 'Car and related buyer deleted (if any)' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE /api/cars/clear-by-time?type=day|month|year&value=YYYY-MM-DD|YYYY-MM|YYYY
exports.clearByTime = async (req, res) => {
  try {
    const { type, value } = req.query;
    let cars = [];
    if (type === 'all') {
      cars = await Car.find({});
    } else {
      if (!type || !value) return res.status(400).json({ error: 'type and value are required' });
      let start, end;
      if (type === 'day') {
        start = new Date(value);
        end = new Date(value);
        end.setDate(end.getDate() + 1);
      } else if (type === 'month') {
        start = new Date(value + '-01');
        end = new Date(start);
        end.setMonth(end.getMonth() + 1);
      } else if (type === 'year') {
        start = new Date(value + '-01-01');
        end = new Date(start);
        end.setFullYear(end.getFullYear() + 1);
      } else {
        return res.status(400).json({ error: 'Invalid type' });
      }
      cars = await Car.find({ datePurchased: { $gte: start, $lt: end } });
    }
    const log = [];
    for (const car of cars) {
      log.push({ carId: car._id, carName: car.carName, buyer: car.buyer });
      // Cascade delete buyer if exists
      if (car.buyer) {
        const Buyer = require('../models/Buyer');
        await Buyer.findByIdAndDelete(car.buyer);
      }
      await Car.findByIdAndDelete(car._id);
      // Log activity
      await ActivityLog.create({
        user: req.user?.email || 'unknown',
        action: 'delete',
        entity: 'Car',
        entityId: car._id,
        details: { carName: car.carName }
      });
    }
    res.json({ message: 'Data cleared', deleted: log });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// GET /api/sales - all sold cars with buyer info
exports.getSales = async (req, res) => {
  try {
    const sales = await Car.find({ status: 'sold' }).populate('buyer');
    res.json(sales);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 