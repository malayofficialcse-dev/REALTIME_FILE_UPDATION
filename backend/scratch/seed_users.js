import { pool } from '../src/config/db.js';
import bcrypt from 'bcryptjs';

async function seedUsers() {
  const password = 'password123';
  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(password, salt);
  
  const users = [
    'sarah.chen@prosync.com',
    'alex.thompson@prosync.com',
    'david.kim@prosync.com',
    'elena.rodriguez@prosync.com',
    'marcus.vance@prosync.com'
  ];

  try {
    console.log('Seeding strategic personnel...');
    for (const email of users) {
       await pool.query(
         "INSERT INTO users (email, password) VALUES ($1, $2) ON CONFLICT (email) DO NOTHING",
         [email, hashed]
       );
       console.log(`Deployed: ${email}`);
    }
    console.log(`\nAll users seeded with password: ${password}`);
    process.exit(0);
  } catch (err) {
    console.error('User seeding failed:', err);
    process.exit(1);
  }
}

seedUsers();
