import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const setupDatabase = async () => {
  try {
    console.log('⏳ Starting Database Setup...');
    const schemaPath = path.join(__dirname, '../db/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    await pool.query(schema);
    console.log('✅ Database Schema created successfully!');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error setting up database:', err);
    process.exit(1);
  }
};

setupDatabase();
