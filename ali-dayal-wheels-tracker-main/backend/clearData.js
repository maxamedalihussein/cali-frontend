const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Car = require('./models/Car');
const Buyer = require('./models/Buyer');

async function clearCollections() {
  await mongoose.connect(process.env.MONGO_URI);

  await Car.deleteMany({});
  await Buyer.deleteMany({});

  console.log('All cars and buyers deleted!');
  process.exit();
}

clearCollections(); 