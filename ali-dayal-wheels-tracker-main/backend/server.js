const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authMiddleware = require('./middleware/auth');
const activityLogRoutes = require('./routes/activityLog');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());



// Public routes (no auth required)
app.use('/api/auth', require('./routes/auth'));

// Protected routes (auth required)
app.use('/api/cars', authMiddleware, require('./routes/cars'));
app.use('/api/buyers', authMiddleware, require('./routes/buyers'));
app.use('/api/sale', authMiddleware, require('./routes/sale'));
app.use('/api/reports', authMiddleware, require('./routes/reports'));
app.use('/api/activity-log', activityLogRoutes);

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB connected');
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})
.catch((err) => console.error('MongoDB connection error:', err)); 