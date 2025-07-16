const mongoose = require('mongoose');

const buyerSchema = new mongoose.Schema({
  buyerName: { type: String, required: true },
  phoneNumber: { type: String },
  email: { type: String },
  address: { type: String },
  carBought: { type: mongoose.Schema.Types.ObjectId, ref: 'Car' },
  datePurchased: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Buyer', buyerSchema); 