import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from './modules/admin/Admin.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    // 1. Connect to Database
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/authra');
    console.log(`MongoDB Connected for seeding: ${conn.connection.host}`);

    // 2. Check if admin exists
    const adminExists = await Admin.findOne({ role: 'super_admin' });

    if (adminExists) {
      console.log('⚠️  Super Admin already exists. Skipping seed.');
      process.exit(0);
    }

    // 3. Create Super Admin
    const adminData = {
      name: 'System Super Admin',
      email: 'admin@authra.com',
      password: 'AdminPassword123!', // Change this in production
      role: 'super_admin',
      twoFactorEnabled: true
    };

    const newAdmin = await Admin.create(adminData);

    console.log('✅ Super Admin created successfully!');
    console.log('-----------------------------------');
    console.log(`Email: ${newAdmin.email}`);
    console.log(`Password: AdminPassword123!`);
    console.log('-----------------------------------');
    console.log('Please change your password after first login.');

    process.exit(0);
  } catch (error) {
    console.error(`❌ Error during seeding: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();
