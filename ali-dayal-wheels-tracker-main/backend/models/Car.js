const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  carName: { type: String, required: true },
  carBrand: String,
  sellerName: { type: String, required: true },
  modelYear: Number,
  purchasePrice: { type: Number, required: true },
  repairCost: { type: Number, default: 0 },
  governmentFees: { type: Number, default: 0 },
  shippingCost: { type: Number, default: 0 },
  totalCost: { type: Number }, // auto-calculated
  sellingPrice: { type: Number },
  profit: { type: Number }, // auto-calculated
  status: { type: String, enum: ['available', 'sold'], default: 'available' },
  datePurchased: { type: Date, default: Date.now },
  dateSold: { type: Date },
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'Buyer', default: null },
  color: { type: String },
  receiptNumber: { type: String, required: true, unique: true },
  receiptDate: { type: Date, default: Date.now },
});

// Auto-calculate totalCost and profit before save/update
carSchema.pre('save', function(next) {
  this.totalCost = (this.purchasePrice || 0) + (this.repairCost || 0) + (this.governmentFees || 0) + (this.shippingCost || 0);
  if (this.sellingPrice) {
    this.profit = this.sellingPrice - this.totalCost;
  }
  next();
});
carSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate();
  const purchasePrice = update.purchasePrice ?? this._update.purchasePrice;
  const repairCost = update.repairCost ?? this._update.repairCost;
  const governmentFees = update.governmentFees ?? this._update.governmentFees;
  const shippingCost = update.shippingCost ?? this._update.shippingCost;
  const sellingPrice = update.sellingPrice ?? this._update.sellingPrice;
  const totalCost = (purchasePrice || 0) + (repairCost || 0) + (governmentFees || 0) + (shippingCost || 0);
  this.setUpdate({
    ...update,
    totalCost,
    profit: sellingPrice ? sellingPrice - totalCost : undefined
  });
  next();
});

module.exports = mongoose.model('Car', carSchema); 