const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

async function seedUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Define the two authorized users
    const authorizedUsers = [
      {
        email: 'qmaxamed766@gmail.com',
        password: 'mohamed123' // Change this to your desired password
      },
      {
        email: 'dad@calidayax.com',
        password: 'dad123' // Change this to your desired password
      }
    ];

    for (const userData of authorizedUsers) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      
      if (existingUser) {
        console.log(`User ${userData.email} already exists, updating password...`);
        // Update password
        existingUser.password = await bcrypt.hash(userData.password, 10);
        await existingUser.save();
        console.log(`Password updated for ${userData.email}`);
      } else {
        // Create new user
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const user = new User({
          email: userData.email,
          password: hashedPassword
        });
        await user.save();
        console.log(`User ${userData.email} created successfully`);
      }
    }

    console.log('User seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
}

seedUsers(); 