const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function removeAdminUser() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Find and remove the admin user
    const adminUser = await User.findOne({ email: 'admin@calidayax.com' });
    
    if (adminUser) {
      await User.findByIdAndDelete(adminUser._id);
      console.log('Admin user (admin@calidayax.com) removed successfully');
    } else {
      console.log('Admin user not found in database');
    }

    // Verify only authorized users remain
    const remainingUsers = await User.find({});
    console.log('Remaining users in database:');
    remainingUsers.forEach(user => {
      console.log(`- ${user.email}`);
    });

    console.log('Admin user removal completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error removing admin user:', error);
    process.exit(1);
  }
}

removeAdminUser(); 